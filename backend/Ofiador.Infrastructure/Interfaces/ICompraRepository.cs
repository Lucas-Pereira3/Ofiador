using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Interfaces
{
    public interface ICompraRepository
    {
        Cliente? BuscarCliente(int idCliente);

        Empresa? BuscarEmpresa(int idEmpresa);

        decimal BuscarDividaAtual(int idCliente);

        void AdicionarCompra(Compra compra);

        Fatura? BuscarFatura(int idCliente, DateTime mesReferencia);

        Fatura? BuscarFaturaAberta(int clienteId, DateTime mesReferencia);

        void AdicionarFatura(Fatura fatura);

        void AdicionarParcela(CompraParcela parcela);

        void Salvar();

        void CarregarRelacionamento(Compra compra);

        List <Compra> BuscarCompraCliente(int idCliente);

        Fatura? BuscarFaturaPorId(int idFatura);
    }
}
