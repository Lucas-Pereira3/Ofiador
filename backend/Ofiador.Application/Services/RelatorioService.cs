using Ofiador.Application.DTOs;
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

        public async Task<List<ContaReceberRelatorioDto>> GetContasReceber(DateTime? dataInicial, DateTime? dataFinal)
        {
           var faturas = await _repository
                .GetContasReceber(dataInicial, dataFinal);

            var relatorio = faturas.GroupBy(f=> new
            {
                f.IdCliente,
                f.Cliente.Nome
            })
                .Select(g => 
                {
                    var parcelas = g.SelectMany(f => f.CompraParcelas);
                     var total =
                    parcelas.Sum(p => p.ValorParcela);

                     var pago =
                    parcelas.Where(p => p.Pago).Sum(p=> p.ValorParcela);

                    return new ContaReceberRelatorioDto
                    {
                        Nome = g.Key.Nome,

                        Total = total,

                        Pago = pago,

                        Restante = total - pago
                    };
                }).ToList();

            return relatorio;
        }
    }
}