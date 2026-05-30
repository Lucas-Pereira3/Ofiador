using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;
using Ofiador.Application.Services;
using Ofiador.Application.Interfaces;
using Ofiador.Application.DTOs;
namespace Ofiador.API.Controllers
{
    
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]

    public class PagamentosController: ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IPagamentoService _pagamentoService;

        public PagamentosController(ApplicationDbContext context, IPagamentoService pagamentoService)
        {
            _context = context;
            _pagamentoService = pagamentoService;
        }

        [HttpPost("parcela")]
        public IActionResult CriarPagamento([FromBody] PagamentoParcelaDTOs dto)
        {
            try
            {
                var pagamento = _pagamentoService
                    .PagarParcela
                    (
                       dto.IdParcela,
                       dto.MetodoPagamento
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

        [HttpPost("fatura")]
        public IActionResult PagarFatura([FromBody] PagamentoFaturaDTOs dto)
        {
            try
            {
                var pagamento = _pagamentoService.PagarFatura(
                    dto.IdFatura,
                    dto.MetodoPagamento);

                return Ok(new
                {
                    mensagem = "Fatura paga com sucesso", pagamento
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    erro = ex.Message
                });
            }
        }

        [HttpGet]
        public IActionResult ListarPagamento()
        {
            var pagamentos = _context.Pagamentos
                .Include(p => p.Fatura)
                    .ThenInclude(f => f.Cliente)
                .Select(p => new
                {
                    p.IdPagamento,
                    p.Data_Pagamento,
                    p.ValorPago,
                    p.IdFatura,
                    p.MetodoPagamento,
                    Fatura = p.Fatura == null ? null : new
                    {
                        p.Fatura.IdFatura,
                        Cliente = p.Fatura.Cliente == null ? null : new
                        {
                            p.Fatura.Cliente.IdCliente,
                            p.Fatura.Cliente.Nome,
                            p.Fatura.Cliente.Cpf_Cnpj
                        }
                    }
                })
                .ToList();

            return Ok(pagamentos);
        }

       

        [HttpGet("parcelas-pendentes")]
        public IActionResult BuscarParcelasPendentes(int? clienteId, int? mes, int? ano) 
        {
            var parcelas = _pagamentoService.BuscarParcelasPendentes(
                clienteId,
                mes,
                ano);

            return Ok(parcelas);
        }
    }
}