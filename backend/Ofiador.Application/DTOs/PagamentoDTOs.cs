using System.ComponentModel.DataAnnotations;

namespace Ofiador.Application.DTOs
{
    public class PagamentoDTOs
    {
        [Required]
        public int IdParcela { get; set; }

        public string MetodoPagamento { get; set; }
           = string.Empty;
    }

    public class PagamentoHistoricoDto
    {
        public int PagamentoId { get; set; }
        public int ClienteId { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Cpf { get; set; } = string.Empty;
        public int EmpresaId { get; set; }
        public string Empresa { get; set; } = string.Empty;
        public string FaturaReferencia { get; set; } = string.Empty;
        public DateTime DataPagamento { get; set; }
        public decimal ValorPago { get; set; }
        public string MetodoPagamento { get; set; } = string.Empty;
        public string Status { get; set; } = "Pago";
    }
}