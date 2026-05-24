using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ofiador.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AjustesAuthTest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClienteIdCliente",
                table: "fatura",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_fatura_ClienteIdCliente",
                table: "fatura",
                column: "ClienteIdCliente");

            migrationBuilder.AddForeignKey(
                name: "FK_fatura_Clientes_ClienteIdCliente",
                table: "fatura",
                column: "ClienteIdCliente",
                principalTable: "Clientes",
                principalColumn: "IdCliente");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_fatura_Clientes_ClienteIdCliente",
                table: "fatura");

            migrationBuilder.DropIndex(
                name: "IX_fatura_ClienteIdCliente",
                table: "fatura");

            migrationBuilder.DropColumn(
                name: "ClienteIdCliente",
                table: "fatura");
        }
    }
}
