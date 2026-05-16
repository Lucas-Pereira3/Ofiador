using System.ComponentModel.DataAnnotations;
using Ofiador.Domain.Models;
namespace Ofiador.API.DTOs
{
    public class ClienteDTOs
    {
        public int IdCliente{get; set;}

        [Required]
        public string Nome {get; set;} = string.Empty;

        [Required]
        public string Cpf_Cnpj {get; set;} = string.Empty;

        [Required]
        public string Email {get; set;} = string.Empty;

        [Required]
        public string Endereco {get; set;}= string.Empty;
        [Required]
        public decimal Limite {get; set;}

        [Required]
        public string Telefone {get; set;} = string.Empty;

        public int IdEmpresa {get; set;}

       
        public string? Empresa { get; set; } 

        public decimal Divida { get; set; }
    }
}