using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ofiador.Infrastructure.Repository
{
    public class ClienteRepository
    {
        private readonly ApplicationDbContext _context;

        public ClienteRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        //Buscar cliente por id
        public Cliente? BuscarPorId(int id)
        {
            return _context.Clientes.FirstOrDefault(c => c.IdCliente == id);
        }

        //verificar documento existente
        public bool EmailExiste(string email)
        {
            return _context.Clientes.Any(c => c.Email == email);
        }

        //verificar se empresa existe
        public bool EmpresaExiste(int idEmpresa)
        {
            return _context.Empresas.Any(e => e.IdEmpresa == idEmpresa);
        }

        //verificar se documento existe
        public bool DocumentoExiste(string documento)
        {
            return _context.Clientes.Any(c => c.Cpf_Cnpj == documento);
        }

        //adicionar cliente
        public void Adicionar(Cliente cliente)
        {
            _context.Clientes.Add(cliente);

            _context.SaveChanges();
        }

        //Atualizar Cliente
        public void Atualizar()
        {
            _context.SaveChanges();
        }

        //Documento Atualizado Existente
        public bool DocumentoAtualizadoExiste(string documento, int id)
        {
            return _context.Clientes.Any(c => c.Cpf_Cnpj == documento && c.IdCliente == id);
        }
        
        //Email Atualizado Existente
        public bool EmailAtualizadoExiste(string email, int id)
        {
            return _context.Clientes.Any(c => c.Email == email && c.IdCliente == id);
        }
        //Remover cliente
        public void Remover(Cliente cliente)
        {
            _context.Clientes.Remove(cliente);

            _context.SaveChanges();
        }
        public async Task<Cliente?> GetClienteComFaturas(int id)
        {
        return await _context.Clientes
            .Include(c => c.Faturas)
            .ThenInclude(f => f.CompraParcelas)
            .FirstOrDefaultAsync(c => c.IdCliente == id);
        }

        public async Task<decimal> GetDivida(int idCliente)
        {
            return await _context.CompraParcelas
                .Where(p => p.Fatura.IdCliente == idCliente && !p.Pago)
                .SumAsync(p => (decimal?)p.ValorParcela) ?? 0;
        }
    }
}