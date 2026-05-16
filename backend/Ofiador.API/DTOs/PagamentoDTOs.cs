using System.ComponentModel.DataAnnotations;

namespace Ofiador.API.DTOs
{
    public class PagamentoDTOs
    {
        [Required]
        public int IdParcela { get; set; }

        [Required]
        public decimal ValorPago { get; set; }
    }
}