using Ofiador.Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Migrations;
using Ofiador.Application.DTOs;
using Ofiador.Application.Interfaces;
namespace Ofiador.Application.Services
{
    public class PagamentoService : IPagamentoService
    {
        private readonly IPagamentoRepository _repository;

        public PagamentoService(IPagamentoRepository repository)
        {
            _repository = repository;  

        }

        public Pagamento PagarParcela(int idParcela, string metodoPagamento)
        {
            var parcela = _repository.BuscarParcela(idParcela);

            if (parcela == null)
            {
                throw new Exception("Parcela não encontrada");
            }

            if (parcela.Pago) 
            {
                throw new Exception("Parcela já foi Paga");
            }

            //Atualizar Parcela
            parcela.Pago = true;

            parcela.Status = Statusparcela.Pago;

            parcela.Compra.ParcelasPagas += 1;

            parcela.DataPagamento = DateTime.UtcNow;

            _repository.Salvar();

            //Cria Pagamento
            var pagamento = new Pagamento
            {
                Data_Pagamento = DateTime.UtcNow,

                ValorPago = parcela.ValorParcela,


                MetodoPagamento = metodoPagamento,

                IdFatura = parcela.IdFatura
            };

           _repository.AdicionarPagamento(pagamento);

            //verificar se todas as parcelas da fatura foram pagas
            var parcelasPendentes = _repository.ExisteParcelasPendentes(parcela.IdFatura);

            var totalParcelas = _repository.TotalParcelasFatura( parcela.IdFatura);

            var parcelasPagas = _repository.TotalParcelasPagas(parcela.IdFatura);

            if (parcelasPagas == 0)
            {
                parcela.Fatura.Status = "PENDENTE";
            }
            else if(parcelasPagas < totalParcelas)
            {
                parcela.Fatura.Status = "PARCIAL";
            }
            else
            {
                parcela.Fatura.Status = "PAGO";
            }
            _repository.Salvar();

            return pagamento;
        }

        //Buscar Parcelas Pendentes
        public List<ParcelaDTO>BuscarParcelasPendentes(
            int? clienteId,
            int? mes,
            int? ano
            )
        {
            var parcelas = _repository.BuscarParecelaPendente(
                clienteId,
                mes,
                ano
                );

            return parcelas.Select(cp=>
            new ParcelaDTO
            {
                IdCompraParcela = cp.idCompraParcela,

                NumeroParcela = cp.NumeroParcela,

                ValorParcela = cp.ValorParcela,

                Status = cp.Status.ToString(),

                Pago = cp.Pago,

                Datapagamento = cp.DataPagamento,

                DataCompra = cp.Compra.Data_Compra,

                Cliente = cp.Compra.Cliente.Nome
            }).ToList();
        }

        //Pagar Fatura
        public Pagamento PagarFatura(int idFatura, string metodoPagamento)
        {
            var fatura = _repository.BuscarFatura(idFatura);

            
            if(fatura == null)
            {
                throw new Exception("Fatura não encontrada");
            }

            if(fatura.Status.ToUpper() == "PAGO")
            {
                throw new Exception("Fatura já foi pagga");
            }

    
            // pegar somente parcelas pendentes
            var parcelasPendentes = fatura.CompraParcelas
                .Where(p => !p.Pago)
                .ToList();

            // calcular somente o valor restante
            var valorRestante = parcelasPendentes
                .Sum(p => p.ValorParcela);

            // marcar parcelas como pagas
            foreach(var parcela in parcelasPendentes)
            {
                parcela.Pago = true;

                parcela.Compra.ParcelasPagas += 1;

                parcela.Status = Statusparcela.Pago;

                parcela.DataPagamento = DateTime.UtcNow;
            }

            fatura.Status = "PAGO";

            // criar pagamento apenas do valor restante
            var pagamento = new Pagamento
            {
                Data_Pagamento = DateTime.UtcNow,

                ValorPago = valorRestante,

                MetodoPagamento = metodoPagamento,

                IdFatura = fatura.IdFatura,
            };

            _repository.AdicionarPagamento(pagamento);

            _repository.Salvar();

            return pagamento;
        }
    }
}
