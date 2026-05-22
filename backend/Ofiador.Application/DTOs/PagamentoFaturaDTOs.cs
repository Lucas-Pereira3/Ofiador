using System;
using System.Collections.Generic;
using System.Text;

namespace Ofiador.Application.DTOs
{
    public class PagamentoFaturaDTOs
    {
        public int IdFatura {  get; set; }

        public string MetodoPagamento {  get; set; } = string.Empty;
    }
}
