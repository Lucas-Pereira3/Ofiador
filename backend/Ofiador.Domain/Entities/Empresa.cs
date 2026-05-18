namespace Ofiador.Domain.Entities
{
    public class Empresa
    {
        public int IdEmpresa { get; set; }

        public string Nome { get; set; } = string.Empty;

        public string Cnpj { get; set; } = string.Empty;

        public string? Endereco { get; set; }

        public string? Email { get; set; }

        public string? Telefone { get; set; }
    }
}