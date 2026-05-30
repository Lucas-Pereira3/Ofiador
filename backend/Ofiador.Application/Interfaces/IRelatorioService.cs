using Ofiador.Application.DTOs;

namespace Ofiador.Application.Interfaces
{
    public interface IRelatorioService
    {
        Task<List<ContaReceberRelatorioDto>>
            GetContasReceber(
                DateTime? dataInicial,
                DateTime? dataFinal);
    }
}