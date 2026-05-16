using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Models;
using Ofiador.API.DTOs;
using Ofiador.Application.Services;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaturasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly FaturaService _faturaService;

        public FaturasController(ApplicationDbContext context, FaturaService faturaService)
        {
            _context = context;
            _faturaService = faturaService;
        }

        [HttpPost]
        public IActionResult CriarFatura([FromBody] FaturaDTOs dto)
        {

            try
            {
                var fatura = _faturaService
                    .GerarFatura(
                        dto.IdCliente,
                        dto.MesReferencia
                    );

                return Created("", fatura);
            }
            catch (Exception ex)
            {
                return BadRequest(new 
                { 
                    erro=ex.Message 
                });
            }
        }

        [HttpGet]
        public IActionResult ListarFaturas()
        {
            var faturas= _context.Faturas
                .Include(f=> f.Cliente)
                .Include(f=> f.CompraParcelas).ThenInclude(cp => cp.Compra)
                .ToList();

            return Ok(faturas);
        }
    }
}