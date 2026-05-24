using System;
using System.Collections.Generic;
using System.Text;

namespace Ofiador.Application.DTOs
{
    public class CompraCreateDTOs
    {
        public decimal Valor_Total { get; set; }

        public DateTime? Data_Compra { get; set; }

        public int Parcelas { get; set; }

        public int IdCliente { get; set; }

        public int IdEmpresa { get; set; }

        public DateTime? DataPrimeiroVencimento { get; set; }
    }
}
