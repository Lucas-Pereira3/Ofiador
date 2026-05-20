using Ofiador.Infrastructure.Data;
using Ofiador.Domain.Entities;

namespace Ofiador.Infrastructure.Repository
{
    public class EmpresaRepository
    {
        private readonly ApplicationDbContext _context;

        public EmpresaRepository(ApplicationDbContext context) 
        {
            _context = context;
        }

        //verificar se cnjpj existe
        public bool CnpjExiste(string cnpj)
        {
            return _context.Empresas.Any(e => e.Cnpj == cnpj);
        }

        //verificar se email existe
        public bool EmailExiste(string email)
        {
            return _context.Empresas.Any(e => e.Email == email);
        }

        //Adicionar Empresa
        public void Adicionar(Empresa empresa) 
        { 
            _context.Empresas.Add(empresa);

            _context.SaveChanges();
        }

        //Buscar empresa por id
        public Empresa? BuscarPorId(int id)
        { 
            return _context.Empresas.FirstOrDefault(e =>e.IdEmpresa == id);
        }

        //Atualizar
        public void Atualizar()
        {
            _context.SaveChanges();
        }

        //Remover Empresa
        public void Remover(Empresa empresa)
        {
            _context.Empresas.Remove(empresa);

            _context.SaveChanges();
        }
    }
}
