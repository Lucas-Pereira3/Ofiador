using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Interfaces
{
    public interface IRelatorioRepository
    {
        Task<List<Fatura>> GetContasReceber(
            DateTime? dataInicial,
            DateTime? dataFinal);
    }
}