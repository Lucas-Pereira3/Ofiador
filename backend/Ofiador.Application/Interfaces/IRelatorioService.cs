using Ofiador.Application.DTOs;

namespace Ofiador.Application.Interfaces
{
    public interface IRelatorioService
    {
        Task<List<ContaReceberRelatorioDto>> GetContasReceber(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId = null,
            int? clienteId = null);

        Task<List<ContaReceberRelatorioDto>> GetContasPagas(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId = null,
            int? clienteId = null);

        Task<List<ContaReceberRelatorioDto>> GetRelatorioGeral(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId = null,
            int? clienteId = null);

        Task<List<HistoricoPagamentoDto>> GetHistoricoPagamentos(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId = null,
            int? clienteId = null);
    }
}