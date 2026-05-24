using System;
using System.Collections.Generic;
using System.Text;

namespace Ofiador.Application.DTOs
{
    public class ClienteCreateDTOs
    {
        public string Nome { get; set; } = string.Empty;

        public string Cpf_Cnpj { get; set; } = string.Empty;

        public string Telefone { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string Endereco { get; set; } = string.Empty;

        public decimal Limite { get; set; }

        public int IdEmpresa { get; set; }
    }
}
