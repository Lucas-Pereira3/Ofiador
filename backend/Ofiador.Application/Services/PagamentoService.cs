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

        public PagamentoService(PagamentoRepository repository)
        {
            _repository = repository;  
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

            if (!parcelasPendentes)
            {
                parcela.Fatura.Status = "PAGO";
            }

            _repository.Salvar();

            return pagamento;
        }
    }
}
