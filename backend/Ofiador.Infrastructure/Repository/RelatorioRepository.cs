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
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            var query = _context.Faturas
                .Include(f => f.Cliente)
                    .ThenInclude(c => c.Empresa)
                .Include(f => f.Pagamentos)
                .Include(f => f.CompraParcelas)
                .Where(f => f.Status == null ||
                            f.Status.ToUpper() != "PAGO")
                .AsQueryable();

            if (dataInicial.HasValue)
                query = query.Where(f => f.DataGeracao >= dataInicial.Value);

            if (dataFinal.HasValue)
                query = query.Where(f => f.DataGeracao <= dataFinal.Value);

            if (empresaId.HasValue)
                query = query.Where(f => f.Cliente != null &&
                                         f.Cliente.IdEmpresa == empresaId.Value);

            if (clienteId.HasValue)
                query = query.Where(f => f.IdCliente == clienteId.Value);

            return await query.ToListAsync();
        }

        public async Task<List<Fatura>> GetContasPagas(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            var query = _context.Faturas
                .Include(f => f.Cliente)
                    .ThenInclude(c => c.Empresa)
                .Include(f => f.Pagamentos)
                .Include(f => f.CompraParcelas)
                .Where(f => f.Status != null &&
                            f.Status.ToUpper() == "PAGO")
                .AsQueryable();

            if (dataInicial.HasValue)
                query = query.Where(f => f.DataGeracao >= dataInicial.Value);

            if (dataFinal.HasValue)
                query = query.Where(f => f.DataGeracao <= dataFinal.Value);

            if (empresaId.HasValue)
                query = query.Where(f => f.Cliente != null &&
                                         f.Cliente.IdEmpresa == empresaId.Value);

            if (clienteId.HasValue)
                query = query.Where(f => f.IdCliente == clienteId.Value);

            return await query.ToListAsync();
        }
    }
}