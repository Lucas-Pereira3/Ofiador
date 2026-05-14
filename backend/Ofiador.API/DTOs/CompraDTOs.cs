namespace Ofiador.API.DTOs{
public class CompraDTOs
{
    public int IdCompra { get; set; }

    public decimal Valor_Total { get; set; }

    public string Cliente { get; set; } = string.Empty;

    public int Parcelas { get; set; }

    public string Empresa { get; set; }= string.Empty;

    public List<ParcelaDTO> ParcelasCompra { get; set; }= new();
    }
}