using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Interfaces
{
    public interface IAuthRepository
    {
        bool EmailExiste(string login);

        void Adicionar(Usuario usuario);

        Usuario? BuscarLogin(string login);

    }
}
