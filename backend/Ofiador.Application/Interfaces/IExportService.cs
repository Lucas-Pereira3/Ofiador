using Ofiador.Application.DTOs;

namespace Ofiador.Application.Interfaces
{
    public interface IExportService
    {
        byte[] GerarRelatorioReceberPdf(List<ContaReceberRelatorioDto> dados, string tipo);
        byte[] GerarRelatorioReceberExcel(List<ContaReceberRelatorioDto> dados, string tipo);
        byte[] GerarHistoricoPagamentosPdf(List<PagamentoHistoricoDto> dados, string tipo);
        byte[] GerarHistoricoPagamentosExcel(List<PagamentoHistoricoDto> dados, string tipo);
    }
}
