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
    }
}
