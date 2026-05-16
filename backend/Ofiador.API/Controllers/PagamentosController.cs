using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Models;
using Ofiador.Application.Services;
using Ofiador.API.DTOs;
namespace Ofiador.API.Controllers
{
    
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]

    public class PagamentosController: ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly PagamentoService _pagamentoService;

        public PagamentosController(ApplicationDbContext context, PagamentoService pagamentoService)
        {
            _context = context;
            _pagamentoService = pagamentoService;
        }

        [HttpPost]
        public IActionResult CriarPagamento([FromBody] PagamentoDTOs dto)
        {
            try
            {
                var pagamento = _pagamentoService
                    .PagarParcela
                    (
                       dto.IdParcela,
                       dto.ValorPago
                    );
                return Ok(pagamento);
            }
            catch (Exception ex) 
            {
                return BadRequest(new
                {
                    erro = ex.Message,
                });
            }
        }

        [HttpGet]
        public IActionResult ListarPagamento()
        {
            var pagamentos = _context.Pagamentos
            .Include(p => p.Fatura)
            .ToList();

            return Ok(pagamentos);
        }

        [HttpPut("pagar-parcela/{id}")]
        public IActionResult PagarParcela(int id, [FromBody] decimal ValorPago)
        {
            try
            {
                var pagamento = _pagamentoService.PagarParcela(id, ValorPago);

                return Ok(pagamento);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    erro = ex.Message,
                });
            }
        }
    }
}