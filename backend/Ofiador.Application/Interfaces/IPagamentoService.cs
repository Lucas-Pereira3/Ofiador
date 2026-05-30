using Ofiador.Application.DTOs;
using Ofiador.Domain.Entities;

namespace Ofiador.Application.Interfaces
{
    public interface IPagamentoService
    {
        Pagamento PagarParcela(int idParcela, string metodoPagamento);

        Pagamento PagarFatura(int idFatura, string metodoPagamento);

        List<ParcelaDTO> BuscarParcelasPendentes(
            int? clienteId,
            int? mes,
            int? ano);
    }
}