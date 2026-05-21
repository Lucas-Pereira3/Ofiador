using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;
using Ofiador.Application.DTOs;
using Ofiador.Application.Services;
using Microsoft.AspNetCore.Authorization;

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
        [Authorize]
        [HttpPost]
        public IActionResult CriarFatura([FromBody] FaturaCreateDTOs dto)
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

        [HttpGet("{id}")]
        public IActionResult BuscarFatura(int id)
        {
            var fatura = _context.Faturas
                .Include(f=> f.Cliente)
                .Include(f => f.CompraParcelas)
                .ThenInclude(cp => cp.Compra)
                .FirstOrDefault(f=> f.IdFatura == id);

            if(fatura == null)
            {
                return NotFound(new
                {
                   erro = "Fatura não encontrada"
                });
            }

            var cliente = fatura.Cliente;

// Total utilizado
var limiteUtilizado = _context.Compras
    .Where(c => c.IdCliente == cliente.IdCliente)
    .Sum(c => (decimal?)c.Valor_Total) ?? 0;

// Total pago
var totalPago = _context.Pagamentos
    .Where(p => p.Fatura.IdCliente == cliente.IdCliente)
    .Sum(p => (decimal?)p.ValorPago) ?? 0;

// Em aberto
var limiteEmAberto = limiteUtilizado - totalPago;

// Compras em aberto
var comprasEmAberto = fatura.CompraParcelas
    .Select(cp => cp.Compra.IdCompra)
    .Distinct()
    .Count();

            var resultado = new
            {
                idFatura = fatura.IdFatura,

    total = fatura.Total,

    status = fatura.Status,

    mesReferencia = fatura.MesReferencia,

    vencimento = fatura.Vencimento,

    dataGeracao = fatura.DataGeracao,

    cliente = new
    {
        idCliente = cliente.IdCliente,

        nome = cliente.Nome,

        cpf_Cnpj = cliente.Cpf_Cnpj,

        limiteTotal = cliente.Limite,

        limiteUtilizado = limiteEmAberto,

        limiteDisponivel = cliente.Limite - limiteEmAberto,

        comprasEmAberto = comprasEmAberto
    },

    compraParcelas = fatura.CompraParcelas
    .Select(cp => new
    {
        cp.idCompraParcela,

        cp.NumeroParcela,

        cp.ValorParcela,

        status = cp.Status.ToString(),

        compra = new
        {
            cp.Compra.IdCompra,

            cp.Compra.Parcelas,

            cp.Compra.Data_Compra,
        }
    })
            };

            return Ok(resultado);
        }

        [HttpGet("cliente/{clienteId}")]
        public IActionResult BuscarFaturasClientes (int clienteId)
        {
            //validar Cliente
            var cliente = _context.Clientes.FirstOrDefault(c => c.IdCliente == clienteId);

            if(cliente == null)
            {
                return NotFound(new
                {
                    erro = "cliente não encontrado"
                });
            }

            //Buscar Fatura
            var faturas = _context.Faturas
                .Include (f=> f.Cliente)
                .Where(f=>f.IdCliente == clienteId)
                .Select(f=> new FaturaDTOs
                {
                    IdFatura=f.IdFatura,

                    Total=f.Total,
                    
                    Venciemnto=f.Vencimento,

                    parcelas=f.Parcelas,

                    Status=f.Status,

                    MesReferencia=f.MesReferencia,

                    DataGeracao=f.DataGeracao,

                    IdCliente=f.IdCliente,

                    ClienteNome=f.Cliente.Nome
                }).ToList();

            return Ok(faturas);
        }

        [Authorize]
        [HttpPatch("{id}/pagar")]
        public IActionResult PagarFatura(int id, [FromBody] PagamentoFaturaDTOs dto) 
        {
            try
            {
                var pagamento = _faturaService.PagarFatura(id, dto.ValorPago);

                return Ok(new
                {
                    mensagem = "Fatura paga com sucesso",
                    pagamento
                });
            }
            catch (Exception ex) 
            { 
                if(ex.Message.Contains("não encontrado"))
                {
                    return NotFound(new
                    {
                        erro = ex.Message
                   
                    });
                }

                return BadRequest(new
                {
                    erro =ex.Message
                });
            }
        }
    }
}