using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Application.Services;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly FaturaService _faturaService;

        public DashboardController(ApplicationDbContext context, FaturaService faturaService)
        {
            _context = context;
            _faturaService = faturaService;
        }

                [HttpGet]
        public IActionResult BuscarDashboard()
        {
            _faturaService.AtualizarFaturasVencidas();
            var agora = DateTime.UtcNow;

            // TOTAL A RECEBER
            var totalReceber = _context.Faturas
                .Where(f => f.Status.ToUpper() != "PAGO")
                .Sum(f => (decimal?)f.Total) ?? 0;

            // RECEBIDO NO MÊS
            var inicioMes = new DateTime(
                agora.Year,
                agora.Month,
                1,
                0,
                0,
                0,
                DateTimeKind.Utc
            );

            var fimMes = inicioMes.AddMonths(1);

            var recebidoMes = _context.Pagamentos
                .Where(p =>
                    p.Data_Pagamento >= inicioMes &&
                    p.Data_Pagamento < fimMes)
                .Sum(p => (decimal?)p.ValorPago) ?? 0;

            // FATURAS ATRASADAS
            var atrasadas = _context.Faturas
                .Where(f =>
                    f.Status.ToUpper() != "PAGO" &&
                    f.Vencimento < agora)
                .Sum(f => (decimal?)f.Total) ?? 0;

            // CLIENTES NO LIMITE
            var clientesNoLimite = _context.Clientes
                .Count(c =>
                    _context.Faturas
                    .Where(f =>
                        f.IdCliente == c.IdCliente &&
                        f.Status.ToUpper() != "PAGO")
                    .Sum(f => (decimal?)f.Total) >= c.Limite);

            // ÚLTIMAS COMPRAS
            var ultimasCompras = _context.Compras
                .Include(c => c.Cliente)
                .OrderByDescending(c => c.Data_Compra)
                .Take(5)
                .Select(c => new
                {
                    id = c.IdCompra,
                    cliente = c.Cliente.Nome,
                    data = c.Data_Compra,
                    valor = c.Valor_Total
                })
                .ToList();

            // MAIORES DÍVIDAS
            var maioresDividas = _context.Clientes
                .Select(c => new
                {
                    id = c.IdCliente,
                    cliente = c.Nome,
                    limite = c.Limite,

                    divida = _context.Faturas
                        .Where(f =>
                            f.IdCliente == c.IdCliente &&
                            f.Status.ToUpper() != "PAGO")
                        .Sum(f => (decimal?)f.Total) ?? 0
                })
                .OrderByDescending(c => c.divida)
                .Take(5)
                .ToList();

            // GRÁFICO DOS ÚLTIMOS 6 MESES
            var labels = new List<string>();
            var vendasFiado = new List<decimal>();
            var pagamentosRecebidos = new List<decimal>();

            for (int i = 5; i >= 0; i--)
            {
                var data = agora.AddMonths(-i);

                var inicio = new DateTime(
                    data.Year,
                    data.Month,
                    1,
                    0,
                    0,
                    0,
                    DateTimeKind.Utc
                );

                var fim = inicio.AddMonths(1);

                labels.Add(data.ToString("MMM"));

                var vendas = _context.Compras
                    .Where(c =>
                        c.Data_Compra >= inicio &&
                        c.Data_Compra < fim)
                    .Sum(c => (decimal?)c.Valor_Total) ?? 0;

                var pagamentos = _context.Pagamentos
                    .Where(p =>
                        p.Data_Pagamento >= inicio &&
                        p.Data_Pagamento < fim)
                    .Sum(p => (decimal?)p.ValorPago) ?? 0;

                vendasFiado.Add(vendas);
                pagamentosRecebidos.Add(pagamentos);
            }

            return Ok(new
            {
                totalReceber,
                recebidoMes,
                atrasadas,
                clientesLimite = clientesNoLimite,
                ultimasCompras,
                maioresDividas,

                grafico = new
                {
                    labels,
                    vendasFiado,
                    pagamentosRecebidos
                }
            });
        }
    }
}