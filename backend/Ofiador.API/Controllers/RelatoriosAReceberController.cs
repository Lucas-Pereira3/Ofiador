using Microsoft.AspNetCore.Mvc;
using Ofiador.Application.Interfaces;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("api/relatorios")]
    public class RelatoriosAReceberController : ControllerBase
    {
        private readonly IRelatorioService _service;
        private readonly IExportService _exportService;

        public RelatoriosAReceberController(IRelatorioService service, IExportService exportService)
        {
            _service = service;
            _exportService = exportService;
        }

        [HttpGet("contas-a-receber")]
        public async Task<IActionResult> GetContasReceber(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            try
            {
                var relatorio = await _service.GetContasReceber(
                    dataInicial, dataFinal, empresaId, clienteId);
                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpGet("contas-pagas")]
        public async Task<IActionResult> GetContasPagas(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            try
            {
                var historico = await _service.GetHistoricoPagamentos(
                    dataInicial, dataFinal, empresaId, clienteId);
                return Ok(historico);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpGet("geral")]
        public async Task<IActionResult> GetRelatorioGeral(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            try
            {
                var relatorio = await _service.GetRelatorioGeral(
                    dataInicial, dataFinal, empresaId, clienteId);
                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpGet("exportar/pdf")]
        public async Task<IActionResult> ExportarPdf(
            string tipo,
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            try
            {
                byte[] bytes;
                var nomeArquivo = $"relatorio-{tipo}-{DateTime.Now:yyyyMMdd}.pdf";

                if (tipo == "pagas")
                {
                    var dados = await _service.GetHistoricoPagamentos(dataInicial, dataFinal, empresaId, clienteId);
                    bytes = _exportService.GerarHistoricoPagamentosPdf(dados, tipo);
                }
                else
                {
                    var dados = tipo == "receber"
                        ? await _service.GetContasReceber(dataInicial, dataFinal, empresaId, clienteId)
                        : await _service.GetRelatorioGeral(dataInicial, dataFinal, empresaId, clienteId);
                    bytes = _exportService.GerarRelatorioReceberPdf(dados, tipo);
                }

                return File(bytes, "application/pdf", nomeArquivo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpGet("exportar/excel")]
        public async Task<IActionResult> ExportarExcel(
            string tipo,
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            try
            {
                byte[] bytes;
                var nomeArquivo = $"relatorio-{tipo}-{DateTime.Now:yyyyMMdd}.xlsx";

                if (tipo == "pagas")
                {
                    var dados = await _service.GetHistoricoPagamentos(dataInicial, dataFinal, empresaId, clienteId);
                    bytes = _exportService.GerarHistoricoPagamentosExcel(dados, tipo);
                }
                else
                {
                    var dados = tipo == "receber"
                        ? await _service.GetContasReceber(dataInicial, dataFinal, empresaId, clienteId)
                        : await _service.GetRelatorioGeral(dataInicial, dataFinal, empresaId, clienteId);
                    bytes = _exportService.GerarRelatorioReceberExcel(dados, tipo);
                }

                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", nomeArquivo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }
    }
}