using Microsoft.EntityFrameworkCore;
using Ofiador.Domain.Models;

namespace Ofiador.Infrastructure.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //Modelo de Usuario
            modelBuilder.Entity<Usuario>()
                .HasKey(u => u.IdUsuario);

            //Modelo de Empresa
            modelBuilder.Entity<Empresa>().HasKey(e => e.IdEmpresa);

            modelBuilder.Entity<Empresa>()
                .HasIndex(e => e.Cnpj)
                .IsUnique();

            //Modelo do Cliente
            modelBuilder.Entity<Cliente>()
            .HasKey(c => c.IdCliente);

            modelBuilder.Entity<Cliente>()
                .HasOne(c => c.Empresa)
                .WithMany()
                .HasForeignKey(c => c.IdEmpresa)
                .IsRequired();

            modelBuilder.Entity<Cliente>()
                .HasIndex(c => c.Cpf_Cnpj)
                .IsUnique();

            //Modelo Compra
            modelBuilder.Entity<Compra>()
            .HasKey(c => c.IdCompra);

            modelBuilder.Entity<Compra>()
                .HasOne(c => c.Cliente)
                .WithMany()
                .HasForeignKey(c => c.IdCliente);

            modelBuilder.Entity<Compra>()
                .HasOne(c => c.Empresa)
                .WithMany()
                .HasForeignKey(c => c.IdEmpresa);

            //compra Parcela
            modelBuilder.Entity<CompraParcela>()
                .HasOne(cp => cp.Compra)
                .WithMany(c => c.CompraParcelas)
                .HasForeignKey(cp => cp.IdCompra)
                .OnDelete(DeleteBehavior.Cascade); 

            modelBuilder.Entity<CompraParcela>()
                .HasOne(cp => cp.Fatura)
                .WithMany(f => f.CompraParcelas)
                .HasForeignKey(cp => cp.IdFatura)
                .OnDelete(DeleteBehavior.Restrict); 
            // modelo Fatura

            modelBuilder.Entity<Fatura>()
                .HasKey(f => f.IdFatura);

            modelBuilder.Entity<Fatura>()
                .HasOne(f => f.Cliente)
                .WithMany()
                .HasForeignKey(f => f.IdCliente);

            // Model de Pagamento

            modelBuilder.Entity<Pagamento>()
                .HasKey(p => p.IdPagamento);
            
            modelBuilder.Entity<Pagamento>()
            .HasOne(p => p.Fatura)
            .WithMany()
            .HasForeignKey(p => p.IdFatura);
        }

        // Por enquanto, sem DbSets - vamos adicionar depois
        // Quando criar os modelos, descomente as linhas abaixo:
        public DbSet<Empresa> Empresas { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Compra> Compras { get; set; }
        public DbSet<CompraParcela> CompraParcelas { get; set; }
        public DbSet<Fatura> Faturas { get; set; }
        public DbSet<Pagamento> Pagamentos { get; set; }
    }
}