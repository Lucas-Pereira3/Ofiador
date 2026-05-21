using Ofiador.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Migrations;
namespace Ofiador.Application.Services
{
    public class PagamentoService
    {
        private readonly PagamentoRepository _repository;

        private readonly ApplicationDbContext _context;
        public PagamentoService(PagamentoRepository repository, ApplicationDbContext context)
        {
            _repository = repository;  

            _context = context;
        }

        public Pagamento PagarParcela(int idParcela, decimal valorPago)
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

            parcela.DataPagamento = DateTime.UtcNow;

            _repository.Salvar();

            //Cria Pagamento
            var pagamento = new Pagamento
            {
                Data_Pagamento = DateTime.UtcNow,

                ValorPago = valorPago,

                IdFatura = parcela.IdFatura
            };

           _repository.AdicionarPagamento(pagamento);

            //verificar se todas as parcelas da fatura foram pagas
            var parcelasPendentes = _repository.ExisteParcelasPendentes(parcela.IdFatura);

            var totalParcelas = _context.CompraParcelas.Count(cp => cp.IdFatura == parcela.IdFatura);

            var parcelasPagas = _context.CompraParcelas.Count(cp => cp.IdFatura == parcela.IdFatura && cp.Pago);

            if(parcelasPagas == 0)
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
    }
}
