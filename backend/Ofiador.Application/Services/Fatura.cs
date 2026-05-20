using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;
using Ofiador.Infrastructure.Repository;

namespace Ofiador.Application.Services
{
    public class FaturaService
    {
        private readonly FaturaRepository _repository;

        public FaturaService(FaturaRepository repository)
        {
            _repository = repository;
        }

        public Fatura GerarFatura(int idCliente, DateTime mesReferencia)
        {
            //validar cliente
            var cliente = _repository.BuscarCliente(idCliente);

            if(cliente == null)
            {
                throw new Exception("Cliente não encontrado");
            }

            //verifica se fatura já existe
            var faturaExistente = _repository.BuscarFaturaExistente(idCliente, mesReferencia);

            if(faturaExistente != null)
            {
                throw new Exception("Fatura já existente para este periodo");
            }

            //Busca parcela do mês
            var parcelas = _repository.BuscarParcela(idCliente, mesReferencia);

            //soma total
            var total = parcelas.Sum(p => p.ValorParcela);

            //cria fatura
            var fatura = new Fatura
            {
                IdCliente = idCliente,

                MesReferencia = mesReferencia,

                Vencimento = mesReferencia.AddMonths(1),

                Total = total,

                Parcelas = parcelas.Count,

                Status = "PENDENTE",

                DataGeracao = DateTime.UtcNow,
            };

            _repository.Adicionar(fatura);

            return fatura;
        }

        //Pagar Fatura
        public Pagamento PagarFatura(int idFatura, decimal valorPago)
        {
            //buscar fatura
            var fatura = _repository.BuscarFatura(idFatura);

            if(fatura == null)
            {
                throw new Exception("Fatura não encontrada");
            }

            //Impedir pagamento duplicado
            if(fatura.Status == "PAGO")
            {
                throw new Exception("Fatura já esta Paga");
            }

            //criar pagamento
            var pagamento = new Pagamento
            {
                IdFatura = fatura.IdFatura,

                ValorPago = valorPago,

                Data_Pagamento = DateTime.UtcNow,
            };

            //Atualizar status
            fatura.Status = "PAGO";

            //Buscar Parcelas da Fatura
            var parcelas = _repository.BuscarParcelasFatura(idFatura);

            foreach (var parcela in parcelas)
            {
                parcela.Pago = true;

                parcela.Status = Statusparcela.Pago;

                parcela.DataPagamento = DateTime.UtcNow;

                //atualizar progresso
                if(parcela.Compra != null && parcela.Compra.ParcelasPagas < parcela.Compra.Parcelas)
                {
                    parcela.Compra.ParcelasPagas++;
                }
            }

            //Salvar pagamento
            _repository.AdicionarPagamento(pagamento);

            _repository.Salvar();

            return pagamento;
        }
    }
}
