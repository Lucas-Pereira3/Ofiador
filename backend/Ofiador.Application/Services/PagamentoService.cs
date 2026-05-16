using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Models;
using Ofiador.Infrastructure.Migrations;
namespace Ofiador.Application.Services
{
    public class PagamentoService
    {
        private readonly ApplicationDbContext _context;

        public PagamentoService(ApplicationDbContext context)
        {
            _context = context;
        }

        public Pagamento PagarParcela(int idParcela, decimal valorPago)
        {
            var parcela = _context.CompraParcelas
                .Include(cp => cp.Fatura)
                .FirstOrDefault(cp => cp.idCompraParcela == idParcela);

            if (parcela == null)
            {
                throw new Exception("Parcela não encontrada");
            }

            if (parcela.Pago) 
            {
                throw new Exception("Parcela já foi Paga");
            }

            //Atualizar Parcela
            parcela.Pago = true;

            parcela.Status = Statusparcela.Pago;

            parcela.DataPagamento = DateTime.UtcNow;

            _context.SaveChanges();

            //Cria Pagamento
            var pagamento = new Pagamento
            {
                Data_Pagamento = DateTime.UtcNow,

                ValorPago = valorPago,

                IdFatura = parcela.IdFatura
            };

            _context.Pagamentos.Add(pagamento);

            //verificar se todas as parcelas da fatura foram pagas
            var parcelasPendentes = _context.CompraParcelas.Any(cp => cp.IdFatura == parcela.IdFatura && !cp.Pago);

            if (!parcelasPendentes)
            {
                parcela.Fatura.Status = "PAGO";
            }

            _context.SaveChanges();

            return pagamento;
        }
    }
}
