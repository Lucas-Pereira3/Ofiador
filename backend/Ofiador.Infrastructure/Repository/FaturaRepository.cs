using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;

namespace Ofiador.Infrastructure.Repository
{
    public class FaturaRepository
    {
        private readonly ApplicationDbContext _context;

        public FaturaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        //Bucar Cliente
        public Cliente? BuscarCliente(int idCLiente)
        {
            return _context.Clientes.FirstOrDefault(c => c.IdCliente == idCLiente);
        }

        //Buscar fatura existente
        public Fatura? BuscarFaturaExistente(int idCLiente, DateTime mesReferencia)
        {
            return _context.Faturas.FirstOrDefault(f =>
            f.IdCliente == idCLiente &&
            f.MesReferencia.Month == mesReferencia.Month &&
            f.MesReferencia.Year == mesReferencia.Year);
        }

        //Buscar Faturas Pendentes
        public List<Fatura> BuscarFaturasPendentes()
        {
            return _context.Faturas
                .Where(f => f.Status.ToUpper() == "PENDENTE")
                .ToList();
        }

        //Buscar Parcela do Mes
        public List<CompraParcela> BuscarParcela(int idCliente, DateTime mesReferencia)
        {
            return _context.CompraParcelas.Include(cp => cp.Compra).
                Where(cp =>
                cp.Compra.IdCliente == idCliente &&
                cp.DataVencimento.Month == mesReferencia.Month &&
                cp.DataVencimento.Year == mesReferencia.Year).ToList();
        }

        //Adicionar Fatura
        public void Adicionar(Fatura fatura)
        {
            _context.Faturas.Add(fatura);

            _context.SaveChanges();
        }

        //Buscar Fatura por Id
        public Fatura? BuscarFatura(int idFatura)
        {
            return _context.Faturas.FirstOrDefault(f => f.IdFatura == idFatura);
        }

        //Buscar Parcelas da Fatura
        public List<CompraParcela> BuscarParcelasFatura(int idFatura)
        {
            return _context.CompraParcelas
                .Include(cp => cp.Compra)
                .Where(cp => cp.IdFatura == idFatura)
                .ToList();
        }

        //Adicionar Pagamento
        public void AdicionarPagamento(Pagamento pagamento)
        {
            _context.Pagamentos.Add(pagamento);
        }

        public void Salvar()
        {
            _context.SaveChanges();
        }
    }
}
