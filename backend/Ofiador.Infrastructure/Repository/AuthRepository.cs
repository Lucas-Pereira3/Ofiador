using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;
using Ofiador.Infrastructure.Interfaces;

namespace Ofiador.Infrastructure.Repository
{
    public class AuthRepository : IAuthRepository
    {
        private readonly ApplicationDbContext _context;

        public AuthRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        //verificar se Email existe
        public bool EmailExiste(string login) 
        {
            return _context.Usuarios.Any(u => u.Login == login);
        }

        //Buscar usuario pelo login
        public Usuario? BuscarLogin(string login) 
        {
            return _context.Usuarios.FirstOrDefault(u => u.Login == login);
        }

        //Adicionar Usuario
        public void Adicionar (Usuario usuario)
        {
           _context.Usuarios.Add(usuario);

            _context.SaveChanges();
        }
    }
}
