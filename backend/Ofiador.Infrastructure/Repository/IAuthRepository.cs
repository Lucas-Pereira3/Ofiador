using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Repository
{
    public interface IAuthRepository
    {
        bool EmailExiste(string login);

        void Adicionar(Usuario usuario);

        Usuario? BuscarLogin(string login);

    }
}
