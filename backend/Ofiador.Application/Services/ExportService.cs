using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using ClosedXML.Excel;
using Ofiador.Application.DTOs;
using Ofiador.Application.Interfaces;

namespace Ofiador.Application.Services
{
    public class ExportService : IExportService
    {
        private const string CorPrimaria = "#1A2B4C";

        private static readonly Dictionary<string, string> TituloMap = new()
        {
            ["receber"] = "Contas a Receber",
            ["pagas"] = "Histórico de Pagamentos",
            ["geral"] = "Relatório Geral",
        };

        public byte[] GerarRelatorioReceberPdf(List<ContaReceberRelatorioDto> dados, string tipo)
        {
            var titulo = TituloMap.GetValueOrDefault(tipo, "Relatório");
            var dataGeracao = DateTime.Now.ToString("dd/MM/yyyy HH:mm");

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1.5f, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(9));

                    page.Header().Column(col =>
                    {
                        col.Item()
                            .Text($"OFIADOR — {titulo}")
                            .SemiBold().FontSize(14).FontColor(CorPrimaria);
                        col.Item()
                            .Text($"Gerado em: {dataGeracao}")
                            .FontSize(8).FontColor(Colors.Grey.Medium);
                        col.Item().PaddingTop(4).LineHorizontal(1).LineColor(CorPrimaria);
                    });

                    page.Content().PaddingVertical(10).Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(3); // Cliente
                            cols.RelativeColumn(2); // CPF
                            cols.RelativeColumn(2); // Empresa
                            cols.RelativeColumn(2); // Total Dívida
                            cols.RelativeColumn(2); // Valor Pago
                            cols.RelativeColumn(2); // Saldo Devedor
                            cols.RelativeColumn(2); // Próx. Vencimento
                            cols.RelativeColumn(2); // Status
                        });

                        table.Header(header =>
                        {
                            foreach (var h in new[] { "Cliente", "CPF", "Empresa", "Total Dívida", "Valor Pago", "Saldo Devedor", "Próx. Vencimento", "Status" })
                            {
                                header.Cell()
                                    .Background(CorPrimaria)
                                    .Padding(5)
                                    .Text(h)
                                    .FontSize(8).SemiBold().FontColor(Colors.White);
                            }
                        });

                        var idx = 0;
                        foreach (var row in dados)
                        {
                            var bg = idx % 2 == 0 ? Colors.White : Colors.Grey.Lighten5;

                            void AddCell(string value) =>
                                table.Cell()
                                    .Background(bg)
                                    .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                    .Padding(5).Text(value);

                            AddCell(row.Nome);
                            AddCell(FormatCpf(row.Cpf));
                            AddCell(row.Empresa);
                            AddCell(FormatCurrency(row.Total));
                            AddCell(FormatCurrency(row.Pago));
                            AddCell(FormatCurrency(row.Restante));
                            AddCell(row.ProximoVencimento?.ToString("dd/MM/yyyy") ?? "-");
                            AddCell(row.Status);
                            idx++;
                        }

                        // Footer totals row
                        table.Cell().ColumnSpan(3).Background(Colors.Grey.Lighten3).Padding(5)
                            .Text("TOTAIS").SemiBold().FontSize(8);
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5)
                            .Text(FormatCurrency(dados.Sum(d => d.Total))).SemiBold().FontSize(8);
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5)
                            .Text(FormatCurrency(dados.Sum(d => d.Pago))).SemiBold().FontSize(8);
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5)
                            .Text(FormatCurrency(dados.Sum(d => d.Restante))).SemiBold().FontSize(8);
                        table.Cell().ColumnSpan(2).Background(Colors.Grey.Lighten3).Padding(5).Text("");
                    });

                    page.Footer().AlignRight().Text(x =>
                    {
                        x.Span("Página ").FontSize(7).FontColor(Colors.Grey.Medium);
                        x.CurrentPageNumber().FontSize(7).FontColor(Colors.Grey.Medium);
                        x.Span(" de ").FontSize(7).FontColor(Colors.Grey.Medium);
                        x.TotalPages().FontSize(7).FontColor(Colors.Grey.Medium);
                    });
                });
            }).GeneratePdf();
        }

        public byte[] GerarHistoricoPagamentosPdf(List<PagamentoHistoricoDto> dados, string tipo)
        {
            var dataGeracao = DateTime.Now.ToString("dd/MM/yyyy HH:mm");

            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(1.5f, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(9));

                    page.Header().Column(col =>
                    {
                        col.Item()
                            .Text("OFIADOR — Histórico de Pagamentos")
                            .SemiBold().FontSize(14).FontColor(CorPrimaria);
                        col.Item()
                            .Text($"Gerado em: {dataGeracao}")
                            .FontSize(8).FontColor(Colors.Grey.Medium);
                        col.Item().PaddingTop(4).LineHorizontal(1).LineColor(CorPrimaria);
                    });

                    page.Content().PaddingVertical(10).Table(table =>
                    {
                        table.ColumnsDefinition(cols =>
                        {
                            cols.RelativeColumn(3); // Cliente
                            cols.RelativeColumn(2); // CPF
                            cols.RelativeColumn(2); // Empresa
                            cols.RelativeColumn(2); // Referência
                            cols.RelativeColumn(2); // Data Pagamento
                            cols.RelativeColumn(2); // Valor Pago
                            cols.RelativeColumn(2); // Método
                        });

                        table.Header(header =>
                        {
                            foreach (var h in new[] { "Cliente", "CPF", "Empresa", "Referência", "Data Pagamento", "Valor Pago", "Método" })
                            {
                                header.Cell()
                                    .Background(CorPrimaria)
                                    .Padding(5)
                                    .Text(h)
                                    .FontSize(8).SemiBold().FontColor(Colors.White);
                            }
                        });

                        var idx = 0;
                        foreach (var row in dados)
                        {
                            var bg = idx % 2 == 0 ? Colors.White : Colors.Grey.Lighten5;

                            void AddCell(string value) =>
                                table.Cell()
                                    .Background(bg)
                                    .BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2)
                                    .Padding(5).Text(value);

                            AddCell(row.Nome);
                            AddCell(FormatCpf(row.Cpf));
                            AddCell(row.Empresa);
                            AddCell(row.FaturaReferencia);
                            AddCell(row.DataPagamento.ToString("dd/MM/yyyy"));
                            AddCell(FormatCurrency(row.ValorPago));
                            AddCell(row.MetodoPagamento);
                            idx++;
                        }

                        // Footer totals row
                        table.Cell().ColumnSpan(5).Background(Colors.Grey.Lighten3).Padding(5)
                            .Text("TOTAIS").SemiBold().FontSize(8);
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5)
                            .Text(FormatCurrency(dados.Sum(d => d.ValorPago))).SemiBold().FontSize(8);
                        table.Cell().Background(Colors.Grey.Lighten3).Padding(5).Text("");
                    });

                    page.Footer().AlignRight().Text(x =>
                    {
                        x.Span("Página ").FontSize(7).FontColor(Colors.Grey.Medium);
                        x.CurrentPageNumber().FontSize(7).FontColor(Colors.Grey.Medium);
                        x.Span(" de ").FontSize(7).FontColor(Colors.Grey.Medium);
                        x.TotalPages().FontSize(7).FontColor(Colors.Grey.Medium);
                    });
                });
            }).GeneratePdf();
        }

        public byte[] GerarRelatorioReceberExcel(List<ContaReceberRelatorioDto> dados, string tipo)
        {
            var titulo = TituloMap.GetValueOrDefault(tipo, "Relatório");
            using var workbook = new XLWorkbook();
            var sheetName = titulo.Length > 31 ? titulo[..31] : titulo;
            var sheet = workbook.Worksheets.Add(sheetName);

            // Title
            sheet.Cell(1, 1).Value = $"OFIADOR — {titulo}";
            sheet.Cell(1, 1).Style.Font.Bold = true;
            sheet.Cell(1, 1).Style.Font.FontSize = 14;
            sheet.Cell(1, 1).Style.Font.FontColor = XLColor.FromHtml(CorPrimaria);
            sheet.Row(1).Height = 22;

            sheet.Cell(2, 1).Value = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}";
            sheet.Cell(2, 1).Style.Font.FontSize = 9;
            sheet.Cell(2, 1).Style.Font.FontColor = XLColor.Gray;

            // Header
            var headers = new[] { "Cliente", "CPF", "Empresa", "Total Dívida", "Valor Pago", "Saldo Devedor", "Próx. Vencimento", "Status" };
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cell(4, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml(CorPrimaria);
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            }

            // Data rows
            int row = 5;
            foreach (var item in dados)
            {
                sheet.Cell(row, 1).Value = item.Nome;
                sheet.Cell(row, 2).Value = FormatCpf(item.Cpf);
                sheet.Cell(row, 3).Value = item.Empresa;
                sheet.Cell(row, 4).Value = item.Total;
                sheet.Cell(row, 4).Style.NumberFormat.Format = "R$ #,##0.00";
                sheet.Cell(row, 5).Value = item.Pago;
                sheet.Cell(row, 5).Style.NumberFormat.Format = "R$ #,##0.00";
                sheet.Cell(row, 6).Value = item.Restante;
                sheet.Cell(row, 6).Style.NumberFormat.Format = "R$ #,##0.00";
                sheet.Cell(row, 7).Value = item.ProximoVencimento?.ToString("dd/MM/yyyy") ?? "-";
                sheet.Cell(row, 8).Value = item.Status;

                if (row % 2 == 0)
                    sheet.Row(row).Style.Fill.BackgroundColor = XLColor.FromHtml("#F9FAFB");

                row++;
            }

            // Totals row
            sheet.Cell(row, 1).Value = "TOTAIS";
            sheet.Cell(row, 1).Style.Font.Bold = true;
            sheet.Cell(row, 4).Value = dados.Sum(d => d.Total);
            sheet.Cell(row, 4).Style.NumberFormat.Format = "R$ #,##0.00";
            sheet.Cell(row, 4).Style.Font.Bold = true;
            sheet.Cell(row, 5).Value = dados.Sum(d => d.Pago);
            sheet.Cell(row, 5).Style.NumberFormat.Format = "R$ #,##0.00";
            sheet.Cell(row, 5).Style.Font.Bold = true;
            sheet.Cell(row, 6).Value = dados.Sum(d => d.Restante);
            sheet.Cell(row, 6).Style.NumberFormat.Format = "R$ #,##0.00";
            sheet.Cell(row, 6).Style.Font.Bold = true;
            sheet.Row(row).Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F4F6");

            sheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public byte[] GerarHistoricoPagamentosExcel(List<PagamentoHistoricoDto> dados, string tipo)
        {
            using var workbook = new XLWorkbook();
            var sheet = workbook.Worksheets.Add("Histórico de Pagamentos");

            sheet.Cell(1, 1).Value = "OFIADOR — Histórico de Pagamentos";
            sheet.Cell(1, 1).Style.Font.Bold = true;
            sheet.Cell(1, 1).Style.Font.FontSize = 14;
            sheet.Cell(1, 1).Style.Font.FontColor = XLColor.FromHtml(CorPrimaria);
            sheet.Row(1).Height = 22;

            sheet.Cell(2, 1).Value = $"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}";
            sheet.Cell(2, 1).Style.Font.FontSize = 9;
            sheet.Cell(2, 1).Style.Font.FontColor = XLColor.Gray;

            var headers = new[] { "Cliente", "CPF", "Empresa", "Referência", "Data Pagamento", "Valor Pago", "Método", "Status" };
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = sheet.Cell(4, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml(CorPrimaria);
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            }

            int row = 5;
            foreach (var item in dados)
            {
                sheet.Cell(row, 1).Value = item.Nome;
                sheet.Cell(row, 2).Value = FormatCpf(item.Cpf);
                sheet.Cell(row, 3).Value = item.Empresa;
                sheet.Cell(row, 4).Value = item.FaturaReferencia;
                sheet.Cell(row, 5).Value = item.DataPagamento.ToString("dd/MM/yyyy");
                sheet.Cell(row, 6).Value = item.ValorPago;
                sheet.Cell(row, 6).Style.NumberFormat.Format = "R$ #,##0.00";
                sheet.Cell(row, 7).Value = item.MetodoPagamento;
                sheet.Cell(row, 8).Value = item.Status;

                if (row % 2 == 0)
                    sheet.Row(row).Style.Fill.BackgroundColor = XLColor.FromHtml("#F9FAFB");

                row++;
            }

            sheet.Cell(row, 1).Value = "TOTAIS";
            sheet.Cell(row, 1).Style.Font.Bold = true;
            sheet.Cell(row, 6).Value = dados.Sum(d => d.ValorPago);
            sheet.Cell(row, 6).Style.NumberFormat.Format = "R$ #,##0.00";
            sheet.Cell(row, 6).Style.Font.Bold = true;
            sheet.Row(row).Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F4F6");

            sheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static string FormatCurrency(decimal value) =>
            value.ToString("C2", new System.Globalization.CultureInfo("pt-BR"));

        private static string FormatCpf(string? cpf)
        {
            if (string.IsNullOrEmpty(cpf)) return "-";
            var digits = new string(cpf.Where(char.IsDigit).ToArray());
            if (digits.Length != 11) return cpf;
            return $"{digits[..3]}.{digits[3..6]}.{digits[6..9]}-{digits[9..]}";
        }
    }
}
