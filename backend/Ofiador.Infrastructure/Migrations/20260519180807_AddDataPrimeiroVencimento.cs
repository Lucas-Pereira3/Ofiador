using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable
namespace Ofiador.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDataPrimeiroVencimento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataPrimeiroVencimento",
                table: "Compras",
                type: "timestamp with time zone",
                nullable: true,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataPrimeiroVencimento",
                table: "Compras");
        }
    }
}
