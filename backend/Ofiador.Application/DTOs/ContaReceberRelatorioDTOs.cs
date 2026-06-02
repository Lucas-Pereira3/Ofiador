namespace Ofiador.Application.DTOs
{
    public class ContaReceberRelatorioDto
    {
        public int ClienteId { get; set; }

        public string Nome { get; set; } = string.Empty;

        public string Cpf { get; set; } = string.Empty;

        public int EmpresaId { get; set; }

        public string Empresa { get; set; } = string.Empty;

        public decimal Total { get; set; }

        public decimal Pago { get; set; }

        public decimal Restante { get; set; }

        public DateTime? ProximoVencimento { get; set; }

        public int DiasAtraso { get; set; }

        public string Status { get; set; } = string.Empty;
    }
}