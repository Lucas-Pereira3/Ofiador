using Microsoft.AspNetCore.Mvc;
using Ofiador.Application.Interfaces;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("relatorios")]
    public class RelatoriosAReceberController : ControllerBase
    {
        private readonly IRelatorioService _service;

        public RelatoriosAReceberController(IRelatorioService service)
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