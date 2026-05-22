namespace Ofiador.Domain.Entities
{
    public class Pagamento{
    
    public int IdPagamento{get; set;}
    public DateTime Data_Pagamento{get; set;}

    public decimal ValorPago{get; set;}

    public int IdFatura {get; set;}

     public string MetodoPagamento { get; set; }  = string.Empty;
     public Fatura? Fatura{get; set;}
    }
}