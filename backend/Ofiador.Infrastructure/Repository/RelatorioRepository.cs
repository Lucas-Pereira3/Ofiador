using Microsoft.EntityFrameworkCore;
using Ofiador.API.DTOs;
using Ofiador.Infrastructure.Data;

namespace Ofiador.API.Repositories
{
    public class RelatorioRepository
    {
        private readonly ApplicationDbContext _context;

        public RelatorioRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ContaReceberRelatorioDto>> GetContasReceber()
        {
            var relatorio = await _context.Clientes
                .Select(cliente => new ContaReceberRelatorioDto
                {
                    Nome = cliente.Nome,

                    Total = _context.Faturas
                        .Where(f => f.IdCliente == cliente.IdCliente)
                        .Sum(f => (decimal?)f.Total) ?? 0,

                    Pago = _context.Pagamentos
                        .Where(p => _context.Faturas
                            .Any(f => f.IdFatura == p.IdFatura
                                   && f.IdCliente == cliente.IdCliente))
                        .Sum(p => (decimal?)p.ValorPago) ?? 0
                })
                .ToListAsync();

            foreach (var item in relatorio)
            {
                item.Restante = item.Total - item.Pago;
            }

            return relatorio;
        }
    }
}