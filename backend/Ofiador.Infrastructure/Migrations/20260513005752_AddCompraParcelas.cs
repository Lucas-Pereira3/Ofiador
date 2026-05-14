using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Ofiador.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompraParcelas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Compras_fatura_IdFatura",
                table: "Compras");

            migrationBuilder.DropIndex(
                name: "IX_Compras_IdFatura",
                table: "Compras");

            migrationBuilder.DropColumn(
                name: "IdFatura",
                table: "Compras");

            migrationBuilder.CreateTable(
                name: "compra_parcela",
                columns: table => new
                {
                    id_compra_parcela = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_cliente = table.Column<int>(type: "integer", nullable: false),
                    id_fatura = table.Column<int>(type: "integer", nullable: false),
                    numero_parcelas = table.Column<int>(type: "integer", nullable: false),
                    valor_parcela = table.Column<decimal>(type: "numeric", nullable: false),
                    pago = table.Column<bool>(type: "boolean", nullable: false),
                    data_pagamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compra_parcela", x => x.id_compra_parcela);
                    table.ForeignKey(
                        name: "FK_compra_parcela_Compras_id_cliente",
                        column: x => x.id_cliente,
                        principalTable: "Compras",
                        principalColumn: "IdCompra",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_compra_parcela_fatura_id_fatura",
                        column: x => x.id_fatura,
                        principalTable: "fatura",
                        principalColumn: "id_fatura",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_compra_parcela_id_cliente",
                table: "compra_parcela",
                column: "id_cliente");

            migrationBuilder.CreateIndex(
                name: "IX_compra_parcela_id_fatura",
                table: "compra_parcela",
                column: "id_fatura");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "compra_parcela");

            migrationBuilder.AddColumn<int>(
                name: "IdFatura",
                table: "Compras",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Compras_IdFatura",
                table: "Compras",
                column: "IdFatura");

            migrationBuilder.AddForeignKey(
                name: "FK_Compras_fatura_IdFatura",
                table: "Compras",
                column: "IdFatura",
                principalTable: "fatura",
                principalColumn: "id_fatura");
        }
    }
}
