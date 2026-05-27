using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;
using Ofiador.Infrastructure.Interfaces;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;

namespace Ofiador.Application.Services
{
    
    public class CompraService
    {
        private readonly ICompraRepository _repository;

        public CompraService(ICompraRepository repository)
        {
            _repository = repository;
        }
        public Compra CriarCompra(Compra compra)
{           

        if (compra.Data_Compra == DateTime.MinValue)
        {
            compra.Data_Compra = DateTime.UtcNow;
        }
        else
        {
            compra.Data_Compra = DateTime.SpecifyKind(compra.Data_Compra, DateTimeKind.Utc);
        }

            if(!compra.DataPrimeiroVencimento.HasValue)
            {
                compra.DataPrimeiroVencimento = new DateTime(
                    compra.Data_Compra.Year,
                    compra.Data_Compra.Month,
                    1,
                    0,
                    0,
                    0,
                    DateTimeKind.Utc
                    ).AddMonths(1);
            }

            if(compra.DataPrimeiroVencimento < compra.Data_Compra)
            {
                throw new Exception("A data de vencimento não pode ser menor que a data da compra");
            }
            var cliente = _repository.BuscarCliente(compra.IdCliente);

    if (cliente == null)
    {
        throw new Exception("Cliente não encontrado");
    }

    var empresa = _repository.BuscarEmpresa(compra.IdEmpresa);

    if (empresa == null)
    {
        throw new Exception("Empresa não encontrada");
    }

            if (compra.Valor_Total == 0) 
            {
                throw new Exception("Valor da compra deve ser maior que zero");
            }

            if(compra.Parcelas == 0 || compra.Parcelas >= 24)
            {
                throw new Exception("Quantidade de parcelas inválida");
            }

            var dividaAtual = _repository.BuscarDividaAtual(compra.IdCliente);

    if (dividaAtual + compra.Valor_Total > cliente.Limite)
    {
        throw new Exception("Limite do cliente excedido");
    }

    _repository.AdicionarCompra(compra);

    decimal valorParcela = Math.Round(
        compra.Valor_Total / compra.Parcelas,
        2
    );

    for (int i = 0; i < compra.Parcelas; i++)
    {
        // DATA REAL DO VENCIMENTO
        var dataVencimento = DateTime.SpecifyKind(
            compra.DataPrimeiroVencimento.Value.AddMonths(i),
            DateTimeKind.Utc
        );

        // MÊS REFERÊNCIA
        var mesReferencia = DateTime.SpecifyKind(
            new DateTime(
                dataVencimento.Year,
                dataVencimento.Month,
                1
            ),
            DateTimeKind.Utc
        );

         

                var fatura = _repository.BuscarFaturaAberta(compra.IdCliente, mesReferencia);

        if (fatura == null)
        {
            fatura = new Fatura
            {
                IdCliente = compra.IdCliente,

                MesReferencia = mesReferencia,

                // AGORA USA A DATA ESCOLHIDA
                Vencimento = dataVencimento,

                Total = 0,

                Status = "PENDENTE",

                DataGeracao = compra.Data_Compra
            };

           _repository.AdicionarFatura(fatura);

           _repository.Salvar();
        }

        decimal valorAtual = valorParcela;

        if (i == compra.Parcelas - 1)
        {
            valorAtual = compra.Valor_Total -
                ((compra.Parcelas - 1) * valorParcela);
        }

        
        fatura.Parcelas++;

        var compraParcela = new CompraParcela
        {
            IdCompra = compra.IdCompra,

            IdFatura = fatura.IdFatura,

            NumeroParcela = i + 1,

            ValorParcela = valorAtual,

            // DATA CORRETA
            DataVencimento = dataVencimento,

            Status = Statusparcela.Pendente,

            CreatedAt = DateTime.UtcNow
        };

         _repository.AdicionarParcela(compraParcela);

        compra.CompraParcelas.Add(compraParcela);
    }


            var faturasAtualizadas =
            compra.CompraParcelas
                .Select(cp => cp.IdFatura)
                .Distinct();

            foreach (var idFatura in faturasAtualizadas)
            {
                var faturaAtual =
                    _repository.BuscarFaturaPorId(idFatura);

                if (faturaAtual != null)
                {
                    faturaAtual.Total =
                        faturaAtual.CompraParcelas
                            .Sum(cp => cp.ValorParcela);
                }
            }

            _repository.Salvar();

            _repository.CarregarRelacionamento(compra);

    return compra;
}
        public List<Compra> BuscarCompraCliente(int idCliente)
        {
            return _repository.BuscarCompraCliente(idCliente);
        }
    }

    
}
