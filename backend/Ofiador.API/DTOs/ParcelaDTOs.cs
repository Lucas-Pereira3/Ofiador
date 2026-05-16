namespace Ofiador.API.DTOs
{
    public class ParcelaDTO
    {
        public int NumeroParcela { get; set; }

        public decimal ValorParcela { get; set; }
        
        public bool Pago { get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime? Datapagamento { get; set; } 
    }
}