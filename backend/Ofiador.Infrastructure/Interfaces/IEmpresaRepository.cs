using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Interfaces
{
    public  interface IEmpresaRepository
    {
        bool CnpjExiste(string cnpj);

        bool EmailExiste(string email);

        void Adicionar(Empresa empresa);

        Empresa? BuscarPorId(int id);

        void Atualizar();

        void Remover(Empresa empresa);
    }
}
