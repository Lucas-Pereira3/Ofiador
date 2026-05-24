namespace Ofiador.Application.DTOs
{
    public class ContaReceberRelatorioDto
    {
        public string Nome { get; set; } = string.Empty;

        public decimal Total { get; set; }

        public decimal Pago { get; set; }

        public decimal Restante { get; set; }
    }
}