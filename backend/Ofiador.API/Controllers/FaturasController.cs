using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Models;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaturasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FaturasController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult CriarFatura([FromBody] Fatura fatura)
        {
            Console.WriteLine("heeeeee");
            try
            {
                _context.Faturas.Add(fatura);
                _context.SaveChanges();

                return Ok(fatura);
            }
            catch (Exception ex) 
            { 
                Console.WriteLine
                    (ex.ToString());
                return BadRequest(ex.Message);
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