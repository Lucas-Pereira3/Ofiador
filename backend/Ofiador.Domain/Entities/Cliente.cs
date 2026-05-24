
using System.ComponentModel.DataAnnotations;

namespace Ofiador.Domain.Entities
{
    public class Cliente
    {
        public int IdCliente { get; set; }

        public string Nome { get; set; }= string.Empty;

        public string Cpf_Cnpj { get; set; } = string.Empty;

        public string? Telefone { get; set; }

        [EmailAddress]
        public string? Email { get; set; }=string.Empty;

        public string? Endereco {  get; set; }

        public decimal Limite { get; set; }

        public int IdEmpresa { get; set; }

        public Empresa? Empresa { get; set; }

        public ICollection<Fatura> Faturas { get; set; } = new List<Fatura>();
    }
}