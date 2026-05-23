using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Entities;
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

        public async Task<List<Fatura>> GetContasReceber(DateTime? dataInicial, DateTime? dataFinal)
        {
            if(dataInicial.HasValue && dataFinal.HasValue && dataInicial > dataFinal)
            {
                throw new Exception("Data inicial não pode ser maiorr que a data final");
            }

            var faturas = _context.Faturas
                .Include(f => f.Cliente)
                .Include(f => f.Pagamentos)
                .Include(f => f.CompraParcelas)
                .AsQueryable();

            //Filtro de data Final
            if (dataFinal.HasValue)
            {
                faturas = faturas.Where(f => f.DataGeracao <= dataFinal.Value);
            }

            //Filtro de data Inicial
            if (dataInicial.HasValue)
            {
                faturas = faturas.Where(f => f.DataGeracao >= dataInicial.Value);
            }

            return await faturas.ToListAsync();
        }
    }
}