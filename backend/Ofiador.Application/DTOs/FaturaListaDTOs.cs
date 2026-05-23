using Ofiador.Application.DTOs;

public class FaturaListaDTOs
{
    public int IdFatura { get; set; }

    public decimal Total { get; set; }

    public DateTime? DataGeracao { get; set; }

    public DateTime? Vencimento { get; set; }

    public int Parcelas { get; set; }

    public int IdCliente { get; set; }

    public string ClienteNome { get; set; }
        = string.Empty;

    public string Status { get; set; }
        = string.Empty;

    public List<ParcelaDTO>
        CompraParcelas
    { get; set; }
        = new();
}