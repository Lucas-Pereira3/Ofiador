using System.ComponentModel.DataAnnotations;

namespace Ofiador.Application.DTOs
{
    public class FaturaDTOs
    {
        [Required]
        public int IdCliente { get; set; }

        [Required]
        public DateTime MesReferencia { get; set; }
    }
}