namespace Ofiador.Application.DTOs
{
    public class ParcelaDTO
    {
        public int IdCompraParcela {  get; set; }
        public int NumeroParcela { get; set; }

        public decimal ValorParcela { get; set; }
        
        public bool Pago { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime? Datapagamento { get; set; } 

        public DateTime DataCompra { get; set;  }

        public string Cliente { get; set; } = string.Empty;
    }
}