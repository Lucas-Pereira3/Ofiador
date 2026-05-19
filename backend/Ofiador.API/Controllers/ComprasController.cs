using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ofiador.Application.DTOs;
using Ofiador.Application.Services;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;
using System.Linq.Expressions;
namespace Ofiador.API.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class ComprasController : ControllerBase
    {
        private readonly CompraService _compraService;

        private readonly ApplicationDbContext _context;

        public ComprasController(CompraService compraservice, ApplicationDbContext context)
        {
            _compraService = compraservice;
            _context = context;
        }

        [Authorize]
        [HttpPost]
        public IActionResult CriarCompra([FromBody] Compra compra)
        {
            try
            {
                var compraCriada = _compraService.CriarCompra(compra);

                var response = new CompraDTOs
                {
                    IdCompra = compra.IdCompra,

                    Valor_Total = compra.Valor_Total,

                    Parcelas = compra.Parcelas,

                    Cliente = compra.Cliente?.Nome ?? "",

                    Empresa = compra.Empresa?.Nome ?? "",

                    ParcelasCompra = compra.CompraParcelas.Select(cp => new ParcelaDTO
                    {
                        NumeroParcela = cp.NumeroParcela,
                        ValorParcela = cp.ValorParcela,
                    }).ToList()
                };
                return CreatedAtAction(nameof(BuscarCompra), new { id = compraCriada.IdCompra }, response);
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
        public IActionResult ListarCompras()
        {
            var compras = _context.Compras
                .Include(c => c.Cliente)
                .Include(c => c.Empresa)
                .Include(c => c.CompraParcelas)
                .Select(c => new CompraDTOs
                {
                    IdCompra = c.IdCompra,

                    Valor_Total = c.Valor_Total,

                    Parcelas = c.Parcelas,

                    Cliente = c.Cliente != null
                        ? c.Cliente.Nome
                        : string.Empty,
                    Empresa = c.Cliente != null && c.Cliente.Empresa != null
                        ? c.Cliente.Empresa.Nome
                        : string.Empty,

                    ParcelasCompra = c.CompraParcelas.Select(cp => new ParcelaDTO
                    {
                        NumeroParcela = cp.NumeroParcela,

                        ValorParcela = cp.ValorParcela,

                        Pago = cp.Pago,

                        Status = cp.Status.ToString(),

                        Datapagamento = cp.DataPagamento
                    }).ToList()
                }).ToList();

            return Ok(compras);
        }

        [HttpGet("{id}")]
        public IActionResult BuscarCompra(int id)
        {
            var compra = _context.Compras
                .Include(c => c.Cliente)
                .Include(c => c.Empresa)
                .Include(c => c.CompraParcelas)
                .FirstOrDefault(c => c.IdCompra == id);

            if (compra == null)
            {
                return NotFound();
            }

            var response = new CompraDTOs
            {
                IdCompra = compra.IdCompra,

                Valor_Total = compra.Valor_Total,

                Parcelas = compra.Parcelas,

                Cliente = compra.Cliente?.Nome ?? "",

                Empresa = compra.Empresa?.Nome ?? "",

                ParcelasCompra = compra.CompraParcelas.Select(cp => new ParcelaDTO
                {
                    NumeroParcela = cp.NumeroParcela,
                    ValorParcela = cp.ValorParcela,

                    Pago = cp.Pago,

                    Status = cp.Status.ToString(),

                    Datapagamento = cp.DataPagamento
                }).ToList()
            };

            return Ok(response);
        }

        [HttpGet("cliente/{clienteId}")]
        public IActionResult BuscarComprasPorCliente(int clienteId)
        {
            //verificar cliente
            var clienteExiste = _context.Clientes.Any(c => c.IdCliente == clienteId);

            if (!clienteExiste)
            {
                return NotFound(new
                {
                    erro = "Cliente não encontrado"
                });
            }

            var compra = _context.Compras
                .Where(c => c.IdCliente == clienteId)

                .Include(c => c.Cliente)

                .Include(c => c.Empresa)

                .Include(c => c.CompraParcelas)

                .Select(c => new CompraDTOs
                {
                    IdCompra = c.IdCompra,

                    Valor_Total = c.Valor_Total,

                    Parcelas = c.Parcelas,

                    Cliente = c.Cliente != null
                        ? c.Cliente.Nome
                        : string.Empty,

                    Empresa = c.Empresa != null
                        ? c.Empresa.Nome
                        : string.Empty,

                    ParcelasCompra = c.CompraParcelas
                        .Select(cp => new ParcelaDTO
                        {
                            NumeroParcela = cp.NumeroParcela,

                            ValorParcela = cp.ValorParcela,

                            Pago = cp.Pago,

                            Status = cp.Status.ToString(),

                            Datapagamento = cp.DataPagamento
                        }).ToList()
                }).ToList();

            return Ok(compra);
        }
    }
}
