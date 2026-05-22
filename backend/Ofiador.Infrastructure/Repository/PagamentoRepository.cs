using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;

namespace Ofiador.Infrastructure.Repository
{
    public class PagamentoRepository
    {
        private readonly ApplicationDbContext _context;

        public PagamentoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        //Buscar Parcela
        public CompraParcela? BuscarParcela(int idParcela)
        {
            return _context.CompraParcelas.Include(cp => cp.Fatura).FirstOrDefault(cp => cp.idCompraParcela == idParcela);
        }

        //verificar parcelas Pendentes
        public bool ExisteParcelasPendentes(int idFatura)
        {
            return _context.CompraParcelas.Any(cp => cp.IdFatura == idFatura && !cp.Pago);
        }

        //adicionar pagamento
        public void AdicionarPagamento(Pagamento pagamento)
        {
            _context.Pagamentos.Add(pagamento);

            _context.SaveChanges();
        }

        //salvar Alterações
        public void Salvar()
        {
            _context.SaveChanges();
        }

        //Buscar Faturas
        public Fatura? BuscarFatura(int idFatura)
        {
            return _context.Faturas.Include(f=> f.Cliente)
                .Include(f=>f.CompraParcelas)
                .ThenInclude(cp => cp.Compra)
                .FirstOrDefault(f=>f.IdFatura==idFatura);
        }

        
        //Buscar Parcelas Pendentes
        public List<CompraParcela>BuscarParecelaPendente(
            int? clienteId,
            int? mes,
            int? ano
            )
        {
            var query = _context.CompraParcelas
                .Include(cp => cp.Compra)
                .ThenInclude(c => c.Cliente)
                .AsQueryable();

            //Apenas Pendentes
            query = query.Where(cp => !cp.Pago);

            //Filtrar cliente
            if (clienteId.HasValue)
            {
                query = query.Where(cp=>
                cp.Compra.IdCliente == clienteId.Value );
            }

            //Filtrar mes
            if (mes.HasValue)
            {
                query =query.Where(cp =>
                cp.DataVencimento.Month == mes.Value );
            }

            //Filtrar ano
            if (ano.HasValue)
            {
                query = query.Where(cp =>
                cp.DataVencimento.Year == ano.Value );
            }

            return query.ToList();
        }
    }
}
