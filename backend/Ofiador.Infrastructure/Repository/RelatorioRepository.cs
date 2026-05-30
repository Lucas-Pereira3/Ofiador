using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;
using Ofiador.Infrastructure.Interfaces;

namespace Ofiador.API.Repositories
{
    public class RelatorioRepository : IRelatorioRepository
    {
        private readonly ApplicationDbContext _context;

        public RelatorioRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Fatura>> GetContasReceber(
            DateTime? dataInicial,
            DateTime? dataFinal)
        {
            var faturas = _context.Faturas
                .Include(f => f.Cliente)
                .Include(f => f.Pagamentos)
                .Include(f => f.CompraParcelas)
                .AsQueryable();

            // Filtro data inicial
            if (dataInicial.HasValue)
            {
                faturas = faturas.Where(f =>
                    f.DataGeracao >= dataInicial.Value);
            }

            // Filtro data final
            if (dataFinal.HasValue)
            {
                faturas = faturas.Where(f =>
                    f.DataGeracao <= dataFinal.Value);
            }

            return await faturas.ToListAsync();
        }
    }
}