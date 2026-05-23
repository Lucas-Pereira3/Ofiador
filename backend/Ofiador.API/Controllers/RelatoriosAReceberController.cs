using Microsoft.AspNetCore.Mvc;
using Ofiador.Application.Services;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("relatorios")]
    public class RelatoriosAReceberController : ControllerBase
    {
        private readonly RelatorioService _service;

        public RelatoriosAReceberController(RelatorioService service)
        {
            _service = service;
        }

        [HttpGet("contas-a-receber")]
        public async Task<IActionResult> GetContasReceber(DateTime? dataInicial, DateTime? dataFinal)
        {
            try
            {
                var relatorio = await _service.GetContasReceber(dataInicial, dataFinal);

                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                 return BadRequest(new
        {
                  erro = ex.Message
        });
            }
        }
    }
}