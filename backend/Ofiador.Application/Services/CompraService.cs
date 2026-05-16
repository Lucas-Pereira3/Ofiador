using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Models;
using Ofiador.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Text;

namespace Ofiador.Application.Services
{
    
    public class CompraService
    {
        private readonly ApplicationDbContext _context;

        public CompraService(ApplicationDbContext context)
        {
            _context = context;
        }
        public Compra CriarCompra(Compra compra)
        {
            var cliente = _context.Clientes.FirstOrDefault(c => c.IdCliente == compra.IdCliente);

            if (cliente == null) 
            {
                throw new Exception("Cliente não encontrado");
            }

            //Verifica se Empresa Existe
            var empresa = _context.Empresas.FirstOrDefault(e => e.IdEmpresa == compra.IdEmpresa);

            if (empresa == null)
            {
                throw new Exception("Empresa não encontrada");
            }

            var dividaAtual = _context.Faturas
                .Where(f =>
                    f.IdCliente == compra.IdCliente &&
                    f.Status != "PAGO").Sum(f => (decimal?)f.Total) ?? 0;

            if(dividaAtual + compra.Valor_Total > cliente.Limite)
            {
                throw new Exception("Limite do cliente excedido");
            } 

            _context.Compras.Add(compra);

            _context.SaveChanges();

            decimal valorParcela = Math.Round(
                compra.Valor_Total / compra.Parcelas, 2);

            for (int i = 0; i < compra.Parcelas; i++)
            {
                var mesReferencia = DateTime.SpecifyKind(
                    new DateTime(
                        compra.Data_Compra.Year,
                        compra.Data_Compra.Month,
                        1
                        ).AddMonths(i),
                            DateTimeKind.Utc
                    );
                   

                var fatura = _context.Faturas
                    .FirstOrDefault(f =>
                        f.IdCliente == compra.IdCliente &&
                        f.MesReferencia.Month == mesReferencia.Month &&
                        f.MesReferencia.Year == mesReferencia.Year
                    );

                if (fatura == null)
                {
                    fatura = new Fatura
                    {
                        IdCliente = compra.IdCliente,
                        MesReferencia = mesReferencia,
                        Vencimento = DateTime.SpecifyKind(mesReferencia.AddMonths(1), DateTimeKind.Utc),
                        Total = 0,
                        Status = "PENDENTE"
                    };

                    _context.Faturas.Add(fatura);

                    _context.SaveChanges();
                }
                decimal valorAtual = valorParcela;

                if(i == compra.Parcelas - 1)
                {
                    valorAtual = compra.Valor_Total - ((compra.Parcelas - 1) * valorParcela);
                }

                
                fatura.Total += valorAtual;

                fatura.Parcelas ++;

                var compraParcela = new CompraParcela
                {
                    IdCompra = compra.IdCompra,
                    IdFatura = fatura.IdFatura,
                    NumeroParcela = i + 1,
                    ValorParcela = valorAtual,

                    DataVencimento = DateTime.SpecifyKind(mesReferencia.AddMonths(1), DateTimeKind.Utc),

                    Status = Statusparcela.Pendente,

                    CreatedAt = DateTime.UtcNow
                };

                _context.CompraParcelas.Add(compraParcela);

                compra.CompraParcelas.Add(compraParcela);
            }

            _context.SaveChanges();

            _context.Entry(compra)
                .Reference(c => c.Cliente)
                .Load();

            _context.Entry(compra)
                .Reference(c => c.Empresa)
                .Load();

            _context.Entry(compra)
                .Collection(c => c.CompraParcelas)
                .Load();

            return compra;
        }
    }
}
