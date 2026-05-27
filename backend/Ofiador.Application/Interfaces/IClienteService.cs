using Ofiador.Application.DTOs;
using Ofiador.Domain.Entities;

namespace Ofiador.Application.Interfaces
{
    public interface IClienteService
    {
        List<ClienteDTOs> ListarCLientes();

        ClienteDTOs? BuscarClientePorId(int id);

        Task<DividaClienteDto> GetDivida(int id);

        (bool sucesso, string mensagem) CriarCliente(Cliente cliente);

        (bool sucesso, string menssagem) AtualizarCliente(int id, Cliente clienteAtualizado);

        (bool sucesso, string mensagem) ExcluirCLiente(int id);
    }
}
