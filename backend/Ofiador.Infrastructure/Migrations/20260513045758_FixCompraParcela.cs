using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ofiador.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixCompraParcela : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_compra_parcela_Compras_id_cliente",
                table: "compra_parcela");

            migrationBuilder.RenameColumn(
                name: "id_cliente",
                table: "compra_parcela",
                newName: "id_compra");

            migrationBuilder.RenameIndex(
                name: "IX_compra_parcela_id_cliente",
                table: "compra_parcela",
                newName: "IX_compra_parcela_id_compra");

            migrationBuilder.AlterColumn<DateTime>(
                name: "data_pagamento",
                table: "compra_parcela",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddForeignKey(
                name: "FK_compra_parcela_Compras_id_compra",
                table: "compra_parcela",
                column: "id_compra",
                principalTable: "Compras",
                principalColumn: "IdCompra",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_compra_parcela_Compras_id_compra",
                table: "compra_parcela");

            migrationBuilder.RenameColumn(
                name: "id_compra",
                table: "compra_parcela",
                newName: "id_cliente");

            migrationBuilder.RenameIndex(
                name: "IX_compra_parcela_id_compra",
                table: "compra_parcela",
                newName: "IX_compra_parcela_id_cliente");

            migrationBuilder.AlterColumn<DateTime>(
                name: "data_pagamento",
                table: "compra_parcela",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_compra_parcela_Compras_id_cliente",
                table: "compra_parcela",
                column: "id_cliente",
                principalTable: "Compras",
                principalColumn: "IdCompra",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
