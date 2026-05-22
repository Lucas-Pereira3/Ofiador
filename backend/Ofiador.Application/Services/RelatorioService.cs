using Ofiador.API.DTOs;
using Ofiador.API.Repositories;

namespace Ofiador.Application.Services
{
    public class RelatorioService
    {
        private readonly RelatorioRepository _repository;

        public RelatorioService(RelatorioRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<ContaReceberRelatorioDto>> GetContasReceber()
        {
            return await _repository.GetContasReceber();
        }
    }
}