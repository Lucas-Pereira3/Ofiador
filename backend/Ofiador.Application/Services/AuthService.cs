using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace Ofiador.Application.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;

        public AuthService(ApplicationDbContext context)
        {
            _context = context;
        }

        public bool EmailValido(string login)
        {
            login = login.Trim();
            var regex = new Regex( @"^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook|yahoo)\.(com|com\.br|net)$",RegexOptions.IgnoreCase);
            return regex.IsMatch(login);
        }
        public bool SenhaForte(string senha)
        {
            var regex = new Regex(@"^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$");
            return regex.IsMatch(senha);
        }

        // VERIFICAR SE EMAIL JÁ EXISTE
        public bool EmailExiste(string login)
        {
            return _context.Usuarios.Any(u => u.Login == login);
        }

        public (bool sucesso, string mensagem, Usuario? usuario) CriarUsuario(string nome, string login, string senha)
        {

            login = login.Trim().ToLower();
            // VALIDAÇÃO: Verificar se o email já existe
            if (string.IsNullOrWhiteSpace(nome) || string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(senha))
            {
                return(false,"todos os campos sâo obrigatórios",null);
            }
            if (!EmailValido(login))
                 return (false,"Email invalido", null);
            
            if (EmailExiste(login))
                return (false,"Email já cadastrado",null);

            if (!SenhaForte(senha))
                return (false,"Senha fraca. Use pelo menos 8 caracteres, 1 maiúscula, 1 número e 1 símbolo.",null);

            var usuario = new Usuario
            {
                Nome = nome,
                Login = login
            };
            
            usuario.DefinirSenha(senha);

            _context.Usuarios.Add(usuario);
            _context.SaveChanges();

            return (true,"Usuario Cadastrdado com sucesso", usuario);
        }

        public Usuario? BuscarPorLogin(string login)
        {
            return _context.Usuarios
                .FirstOrDefault(u => u.Login == login);
        }

        public bool VerificarSenha(string senha, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(senha, hash);
        }
    }
}