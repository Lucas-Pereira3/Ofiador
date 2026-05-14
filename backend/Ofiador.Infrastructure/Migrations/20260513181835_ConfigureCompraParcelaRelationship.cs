using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ofiador.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ConfigureCompraParcelaRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_compra_parcela_fatura_id_fatura",
                table: "compra_parcela");

            migrationBuilder.AddForeignKey(
                name: "FK_compra_parcela_fatura_id_fatura",
                table: "compra_parcela",
                column: "id_fatura",
                principalTable: "fatura",
                principalColumn: "id_fatura",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_compra_parcela_fatura_id_fatura",
                table: "compra_parcela");

            migrationBuilder.AddForeignKey(
                name: "FK_compra_parcela_fatura_id_fatura",
                table: "compra_parcela",
                column: "id_fatura",
                principalTable: "fatura",
                principalColumn: "id_fatura",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
