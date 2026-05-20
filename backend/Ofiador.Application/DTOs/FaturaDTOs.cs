using System.ComponentModel.DataAnnotations;

namespace Ofiador.Application.DTOs
{
    public class FaturaDTOs
    {
        public int IdFatura { get; set; }

        public decimal Total { get; set; }

        public DateTime Venciemnto { get; set; }

        public int parcelas {  get; set; }

        public string Status { get; set; } = string.Empty;

        public DateTime MesReferencia {  get; set; }

        public DateTime? DataGeracao {  get; set; }

        [Required]
        public int IdCliente { get; set; }

        public string ClienteNome { get; set; } = string.Empty;

    }
}