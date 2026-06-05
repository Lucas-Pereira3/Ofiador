using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Interfaces
{
    public interface IRelatorioRepository
    {
        Task<List<Fatura>> GetContasReceber(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId);

        Task<List<Fatura>> GetContasPagas(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId);

        Task<List<Fatura>> GetRelatorioGeral(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId);

        Task<List<Pagamento>> GetHistoricoPagamentos(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId);
    }
}