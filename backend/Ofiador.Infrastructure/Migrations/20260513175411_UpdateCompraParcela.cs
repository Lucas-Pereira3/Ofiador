using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ofiador.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCompraParcela : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "pago",
                table: "compra_parcela");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "compra_parcela",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "data_vencimento",
                table: "compra_parcela",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "status",
                table: "compra_parcela",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "compra_parcela",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_at",
                table: "compra_parcela");

            migrationBuilder.DropColumn(
                name: "data_vencimento",
                table: "compra_parcela");

            migrationBuilder.DropColumn(
                name: "status",
                table: "compra_parcela");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "compra_parcela");

            migrationBuilder.AddColumn<bool>(
                name: "pago",
                table: "compra_parcela",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
