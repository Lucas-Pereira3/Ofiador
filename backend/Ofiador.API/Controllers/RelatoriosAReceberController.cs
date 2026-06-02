using Microsoft.AspNetCore.Mvc;
using Ofiador.Application.Interfaces;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("api/relatorios")]
    public class RelatoriosAReceberController : ControllerBase
    {
        private readonly IRelatorioService _service;

        public RelatoriosAReceberController(IRelatorioService service)
        {
            _service = service;
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
                var relatorio = await _service.GetContasPagas(
                    dataInicial, dataFinal, empresaId, clienteId);
                return Ok(relatorio);
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
    }
}