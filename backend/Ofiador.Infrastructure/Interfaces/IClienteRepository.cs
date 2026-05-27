using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Interfaces
{
    public interface IClienteRepository
    { 
        Cliente? BuscarPorId(int id);

        bool EmailExiste(string email);

        bool EmpresaExiste(int idEmpresa);

        bool DocumentoExiste(string documento);

        void Adicionar(Cliente cliente);

        bool DocumentoAtualizadoExiste(string documento, int id);

        bool EmailAtualizadoExiste(string email, int id);

        void Remover (Cliente cliente);

        Task<Cliente> GetClienteComFaturas(int id);

        Task<decimal> GetDivida(int idCliente);

        bool PossuiFaturaAberta(int idCliente);

        void Atualizar ();

        List<Cliente> ListarClientes();

        Cliente? BuscarClientePorId(int id);

        decimal GetDividaSync(int idCliente);
    }
}