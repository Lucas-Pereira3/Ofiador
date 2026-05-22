using System.ComponentModel.DataAnnotations;

namespace Ofiador.Application.DTOs
{
    public class PagamentoDTOs
    {
        [Required]
        public int IdParcela { get; set; }

        public string MetodoPagamento { get; set; }
           = string.Empty;
    }
}