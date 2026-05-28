using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Interfaces
{
    public interface IPagamentoRepository
    {
        CompraParcela? BuscarParcela( int idParcela);

        bool ExisteParcelasPendentes(int idFatura);

        void AdicionarPagamento( Pagamento pagamento);

        void Salvar();

        Fatura? BuscarFatura( int idFatura);

        List<CompraParcela>BuscarParecelaPendente(int? clienteId,int? mes,int? ano);

        int TotalParcelasFatura(int idFatura);

        int TotalParcelasPagas(int idFatura);
    }
}