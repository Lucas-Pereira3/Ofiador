using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Models;
using Ofiador.Infrastructure.Data;

namespace Ofiador.Application.Services
{
    public class FaturaService
    {
        private readonly ApplicationDbContext _context;

        public FaturaService(ApplicationDbContext context)
        {
            _context = context;
        }

        public Fatura GerarFatura(int idCliente, DateTime mesReferencia)
        {
            //validar cliente
            var cliente  = _context.Clientes.FirstOrDefault(c => c.IdCliente == idCliente);

            if(cliente == null)
            {
                throw new Exception("Cliente não encontrado");
            }

            //verifica se fatura já existe
            var faturaExistente = _context.Faturas
                .FirstOrDefault(f =>
                    f.IdCliente == idCliente &&
                    f.MesReferencia.Month == mesReferencia.Month &&
                    f.MesReferencia.Year == mesReferencia.Year);

            if(faturaExistente != null)
            {
                throw new Exception("Fatura já existente para este periodo");
            }

            //Busca parcela do mês
            var parcelas = _context.CompraParcelas
                .Include(cp => cp.Compra)
                .Where(cp =>
                    cp.Compra.IdCliente == idCliente &&
                    cp.DataVencimento.Month == mesReferencia.Month &&
                    cp.DataVencimento.Year == mesReferencia.Year)
                .ToList();

            //soma total
            var total = parcelas.Sum(p => p.ValorParcela);

            //cria fatura
            var fatura = new Fatura
            {
                IdCliente = idCliente,

                MesReferencia = mesReferencia,

                Vencimento = mesReferencia.AddMonths(1),

                Total = total,

                Parcelas = parcelas.Count,

                Status = "PENDENTE",

                DataGeracao = DateTime.UtcNow,
            };

            _context.Faturas.Add(fatura);

            _context.SaveChanges();

            return fatura;
        }
    }
}
