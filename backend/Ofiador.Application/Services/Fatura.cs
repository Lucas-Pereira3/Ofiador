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

        public void AtualizarFaturasVencidas()
        {
            var faturasVencidas = _repository.BuscarFaturasPendentes()
                .Where(f =>
                    f.Vencimento < DateTime.UtcNow &&
                    f.Status.ToUpper() == "PENDENTE")
                .ToList();

            foreach (var fatura in faturasVencidas)
            {
                fatura.Status = "ATRASADA";
            }

            _repository.Salvar();
        }

        //Pagar Fatura
        public List<Pagamento> PagarFatura(int idFatura, string metodoPagamento)
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

            var pagamentos = new List<Pagamento>();

            var parcelasPendentes = fatura.CompraParcelas.Where(cp=> !cp.Pago).ToList();

            foreach (var parcelas in parcelasPendentes) 
            {
                parcelas.Pago= true;

                parcelas.Status = Statusparcela.Pago;

                parcelas.DataPagamento= DateTime.UtcNow;

                var pagamento = new Pagamento 
                { 
                    IdFatura = fatura.IdFatura,

                    ValorPago= parcelas.ValorParcela,

                    Data_Pagamento= DateTime.UtcNow,

                    MetodoPagamento = metodoPagamento,
                };

                pagamentos.Add(pagamento);

                _repository.AdicionarPagamento(pagamento);

            }

            fatura.Status = "PAGO";

            _repository.Salvar();

            return pagamentos;
        }
    }
}
