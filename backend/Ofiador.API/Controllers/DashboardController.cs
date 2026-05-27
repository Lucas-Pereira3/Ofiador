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

                // DATAS
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

                var inicioMesAnterior = inicioMes.AddMonths(-1);
                var fimMesAnterior = inicioMes;

                // TOTAL A RECEBER
                var totalReceber = _context.Faturas
                    .Where(f => f.Status != null && f.Status.ToUpper() != "PAGO")
                    .Sum(f => (decimal?)f.Total) ?? 0;

                var totalReceberAnterior = _context.Faturas
                    .Where(f =>
                        f.Status != null && f.Status.ToUpper() != "PAGO" &&
                        f.Vencimento < inicioMes)
                    .Sum(f => (decimal?)f.Total) ?? 0;

                decimal totalReceberTrend = 0;

                if (totalReceberAnterior > 0)
                {
                    totalReceberTrend =
                        ((totalReceber - totalReceberAnterior)
                        / totalReceberAnterior) * 100;
                }

                // RECEBIDO NO MÊS
                var recebidoMes = _context.Pagamentos
                    .Where(p =>
                        p.Data_Pagamento >= inicioMes &&
                        p.Data_Pagamento < fimMes)
                    .Sum(p => (decimal?)p.ValorPago) ?? 0;

                var recebidoMesAnterior = _context.Pagamentos
                    .Where(p =>
                        p.Data_Pagamento >= inicioMesAnterior &&
                        p.Data_Pagamento < fimMesAnterior)
                    .Sum(p => (decimal?)p.ValorPago) ?? 0;

                decimal recebidoMesTrend = 0;

                if (recebidoMesAnterior > 0)
                {
                    recebidoMesTrend =
                        ((recebidoMes - recebidoMesAnterior)
                        / recebidoMesAnterior) * 100;
                }

                // FATURAS ATRASADAS
                var atrasadas = _context.Faturas
                    .Where(f =>
                        f.Status != null && f.Status.ToUpper() != "PAGO" &&
                        f.Vencimento < agora)
                    .Sum(f => (decimal?)f.Total) ?? 0;

                var atrasadasAnterior = _context.Faturas
                    .Where(f =>
                        f.Status != null && f.Status.ToUpper() != "PAGO" &&
                        f.Vencimento >= inicioMesAnterior &&
                        f.Vencimento < inicioMes)
                    .Sum(f => (decimal?)f.Total) ?? 0;

                decimal atrasadasTrend = 0;

                if (atrasadasAnterior > 0)
                {
                    atrasadasTrend =
                        ((atrasadas - atrasadasAnterior)
                        / atrasadasAnterior) * 100;
                }

                // CLIENTES NO LIMITE
                var clientesNoLimite = _context.Clientes
                    .Count(c =>
                        _context.Faturas
                        .Where(f =>
                            f.IdCliente == c.IdCliente &&
                            f.Status != null && f.Status.ToUpper() != "PAGO")
                        .Sum(f => (decimal?)f.Total) >= c.Limite);

                var clientesNoLimiteAnterior = _context.Clientes
                    .Count(c =>
                        _context.Faturas
                        .Where(f =>
                            f.IdCliente == c.IdCliente &&
                            f.Status != null &&
                            f.Status.ToUpper() != "PAGO" &&
                            f.DataGeracao < inicioMes)
                        .Sum(f => (decimal?)f.Total) >= c.Limite);

                decimal clientesLimiteTrend = 0;

                if (clientesNoLimiteAnterior > 0)
                {
                    clientesLimiteTrend =
                        ((clientesNoLimite - clientesNoLimiteAnterior)
                        / (decimal)clientesNoLimiteAnterior) * 100;
                }

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
                                f.Status != null && f.Status.ToUpper() != "PAGO")
                            .Sum(f => (decimal?)f.Total) ?? 0
                    })
                    .OrderByDescending(c => c.divida)
                    .Take(5)
                    .ToList();

                // GRÁFICO
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
                    totalReceberTrend,

                    recebidoMes,
                    recebidoMesTrend,

                    atrasadas,
                    atrasadasTrend,

                    clientesLimite = clientesNoLimite,
                    clientesLimiteTrend,

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