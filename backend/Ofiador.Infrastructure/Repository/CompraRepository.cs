using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;
namespace Ofiador.Infrastructure.Repository
{
    public class CompraRepository
    {
        private readonly ApplicationDbContext _context;

        public CompraRepository(ApplicationDbContext context)
        {
            _context = context;
        }


        //Buscar cliente
        public Cliente? BuscarCliente(int idCLiente)
        {
            return _context.Clientes.FirstOrDefault(c => c.IdCliente == idCLiente);
        }

        //Buscar Empresa
        public Empresa? BuscarEmpresa(int idEmpresa)
        {
            return _context.Empresas.FirstOrDefault(e => e.IdEmpresa == idEmpresa);
        }

        //Buscar Divida Atual
        public decimal BuscarDividaAtual(int idCliente)
        {
            return _context.Faturas.Where(f => f.IdCliente == idCliente && f.Status != "PAGO").Sum(f => (decimal?)f.Total) ?? 0;
        }

        //Adicionar Compra
        public void AdicionarCompra(Compra compra)
        {
            _context.Compras.Add(compra);

            _context.SaveChanges();
        }

        //Buscar Fatura do mes
        public Fatura? BuscarFatura(int idCLiente, DateTime mesReferencia)
        {
            return _context.Faturas
                .FirstOrDefault(f => f.IdCliente == idCLiente &&
                f.MesReferencia.Month == mesReferencia.Month &&
                f.MesReferencia.Year == mesReferencia.Year);
        }

        //Buscar Fatura Aberta
        public Fatura? BuscarFaturaAberta(int clienteId, DateTime mesReferencia)
        {
            return _context.Faturas
                .FirstOrDefault(f =>
                f.IdCliente == clienteId &&
                f.MesReferencia.Month == mesReferencia.Month &&
                f.MesReferencia.Year == mesReferencia.Year &&
                f.Status != "PAGO");
        }

        //adicionar Fatura
        public void AdicionarFatura(Fatura fatura)
        {
            _context.Faturas.Add(fatura);

            _context.SaveChanges();
        }

        //adicionar Parcela
        public void AdicionarParcela(CompraParcela parcela)
        {
            _context.CompraParcelas.Add(parcela);
        }

        //Salvar alteração
        public void Salvar()
        {
            _context.SaveChanges();
        }

        //carregar navegação
        public void CarregarRelacionamento(Compra compra)
        {
            _context.Entry(compra).Reference(c => c.Cliente).Load();

            _context.Entry(compra).Reference(e => e.Empresa).Load();

            _context.Entry(compra).Collection(cp => cp.CompraParcelas).Load();
        }

        public List<Compra> BuscarCompraCliente(int idCliente)
        {
            return _context.Compras
                .Where(c=> c.IdCliente==idCliente)
                .Include(c=>c.CompraParcelas)
                .Include(c=> c.Cliente)
                .Include (c=> c.Empresa)
                .ToList();
        }

        //Buscar fatura por id
        public Fatura? BuscarFaturaPorId(int idFatura)
        {
            return _context.Faturas

                .Include(f => f.CompraParcelas)

                .FirstOrDefault(f =>
                    f.IdFatura == idFatura);
        }
    }
}
