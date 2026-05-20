namespace Ofiador.Application.DTOs{
public class CompraDTOs
{
    public int IdCompra { get; set; }

    public decimal Valor_Total { get; set; }

    public DateTime Data_Compra { get; set; }

    public string Cliente { get; set; } = string.Empty;

    public int Parcelas { get; set; }

    public string Empresa { get; set; }= string.Empty;

    public List<ParcelaDTO> ParcelasCompra { get; set; }= new();
    }
}
// DTO para as parcelas da compra