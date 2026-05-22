using System;
using System.Collections.Generic;
using System.Text;

namespace Ofiador.Application.DTOs
{
    public class PagamentoParcelaDTOs
    {
        public int IdParcela { get; set; }

        public string MetodoPagamento { get; set; } = string.Empty;
    }
}
