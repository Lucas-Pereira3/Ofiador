using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Ofiador.Domain.Models
{

    public enum Statusparcela
    {
        Pendente = 1,
        Pago = 2,
        Atrasado = 3,
        Renegociado = 4,
    }

    [Table("compra_parcela")]
    public class CompraParcela
    {
        [Key]
        [Column("id_compra_parcela")]
        public int idCompraParcela { get; set; }

        [Column("id_compra")]
        public int IdCompra {  get; set; }

        public Compra? Compra { get; set; }

        [Column("id_fatura")]
        public int IdFatura {  get; set; }

        public Fatura? Fatura { get; set; }

        [Column("numero_parcelas")]
        public int NumeroParcela { get; set; }

        [Column("valor_parcela")]
        public decimal ValorParcela { get; set; }

        [Column("data_vencimento")]
        public DateTime DataVencimento { get; set; }

        [Column("status")]
        public Statusparcela Status { get; set; } = Statusparcela.Pendente;

        [Column("data_pagamento")]
        public DateTime? DataPagamento { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}