using Ofiador.Domain.Entities;

namespace Ofiador.Application.Interfaces
{
    public interface ICompraService
    {
        Compra CriarCompra(Compra compra);

        List<Compra> BuscarCompraCliente(int idCliente);
    }
}