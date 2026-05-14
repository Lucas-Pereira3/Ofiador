using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Ofiador.Domain.Models
{
    [Table("fatura")]
    public class Fatura
    {
        [Key]
        [Column("id_fatura")]
        public int IdFatura { get; set; }

        [Column("valor_total")]
        public decimal Total { get; set; }

        [Column("vencimento")]
        public DateTime Vencimento { get; set; }

        [Column("parcelas")]
        public int Parcelas { get; set; }

        [Column("status")]
        public string Status { get; set; } = "Pendente";


        [Column("mes_referencia")]
        public DateTime MesReferencia { get; set; }

        [Column("data_geracao")]
        public DateTime? DataGeracao { get; set; }

        [Column("id_cliente")]
        public int IdCliente { get; set; }
        public Cliente? Cliente { get; set; }

        [JsonIgnore]
        public List<CompraParcela> CompraParcelas { get; set; } = new();
    }
}