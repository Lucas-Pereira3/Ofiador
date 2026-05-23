using Microsoft.AspNetCore.Mvc;
using Ofiador.Application.Services;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("relatorios")]
    public class Relatorios_A_ReceberController : ControllerBase
    {
        private readonly RelatorioService _service;

        public Relatorios_A_ReceberController(RelatorioService service)
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
                return StatusCode(500,new
                {
                    erro = ex.Message
                });
            }
        }
    }
}