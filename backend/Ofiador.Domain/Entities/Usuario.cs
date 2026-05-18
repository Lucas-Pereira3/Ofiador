using System.ComponentModel.DataAnnotations;

namespace Ofiador.Domain.Entities
{
    public class Usuario
    {
        public int IdUsuario { get; set; }

        public string Nome { get; set; } = string.Empty;

        [EmailAddress]
        public string Login { get; set; } = string.Empty;

        public string SenhaHash { get; private set; } = string.Empty;

        public void DefinirSenha(string senha)
        {
            SenhaHash = BCrypt.Net.BCrypt.HashPassword(senha);
        }
    }
}