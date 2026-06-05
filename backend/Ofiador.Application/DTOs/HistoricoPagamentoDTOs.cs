using Ofiador.Application.DTOs;

namespace Ofiador.Application.DTOs
{
    public class HistoricoPagamentoDto
    {
        public string Cliente { get; set; } = string.Empty;

        public string Empresa { get; set; } = string.Empty;

        public DateTime DataPagamento { get; set; }

        public decimal ValorPago { get; set; }

        public string MetodoPagamento { get; set; } = string.Empty;

        public string Status { get; set; } = "Pago";
    }
}