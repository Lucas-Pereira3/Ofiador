using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
using Ofiador.Application.DTOs;
using Ofiador.Application.Interfaces;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace Ofiador.API.Controllers
{
    [ApiController]
    [Route("api/relatorios")]
    public class RelatoriosAReceberController : ControllerBase
    {
        private readonly IRelatorioService _service;

        public RelatoriosAReceberController(IRelatorioService service)
        {
            _service = service;
        }

        [HttpGet("contas-a-receber")]
        public async Task<IActionResult> GetContasReceber(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            try
            {
                var relatorio = await _service.GetContasReceber(
                    dataInicial, dataFinal, empresaId, clienteId);
                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpGet("historico-pagamentos")]
        public async Task<IActionResult> GetHistoricoPagamentos(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            try
            {
                var relatorio = await _service.GetHistoricoPagamentos(
                    dataInicial,
                    dataFinal,
                    empresaId,
                    clienteId);

                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpGet("geral")]
        public async Task<IActionResult> GetRelatorioGeral(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            try
            {
                var relatorio = await _service.GetRelatorioGeral(
                    dataInicial, dataFinal, empresaId, clienteId);
                return Ok(relatorio);
            }
            catch (Exception ex)
            {
                return BadRequest(new { erro = ex.Message });
            }
        }

        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportarExcel(
            string tipoRelatorio,
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            using var workbook = new XLWorkbook();

            switch (tipoRelatorio.ToLower())
            {
                case "receber":

                    var receber = await _service.GetContasReceber(
                        dataInicial,
                        dataFinal,
                        empresaId,
                        clienteId);

                    GerarExcelReceber(workbook, receber);

                    break;

                case "pagas":

                    var pagas = await _service.GetHistoricoPagamentos(
                        dataInicial,
                        dataFinal,
                        empresaId,
                        clienteId);

                    GerarExcelPagas(workbook, pagas);

                    break;

                default:

                    var geral = await _service.GetRelatorioGeral(
                        dataInicial,
                        dataFinal,
                        empresaId,
                        clienteId);

                    GerarExcelGeral(workbook, geral);

                    break;
            }

            using var stream = new MemoryStream();

            workbook.SaveAs(stream);

            return File(
                stream.ToArray(),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"{tipoRelatorio}.xlsx");
        }     
        private void GerarExcelReceber(
        XLWorkbook workbook,
        List<ContaReceberRelatorioDto> dados)
        {
            var ws = workbook.Worksheets.Add("Contas Receber");

            ws.Cell(1, 1).Value = "Cliente";
            ws.Cell(1, 2).Value = "Empresa";
            ws.Cell(1, 3).Value = "Total Dívida";
            ws.Cell(1, 4).Value = "Valor Pago";
            ws.Cell(1, 5).Value = "Saldo Devedor";
            ws.Cell(1, 6).Value = "Status";

            int linha = 2;

            foreach (var item in dados)
            {
                ws.Cell(linha, 1).Value = item.Nome;
                ws.Cell(linha, 2).Value = item.Empresa;
                ws.Cell(linha, 3).Value = item.Total;
                ws.Cell(linha, 4).Value = item.Pago;
                ws.Cell(linha, 5).Value = item.Restante;
                ws.Cell(linha, 6).Value = item.Status;

                linha++;
            }

            ws.Columns().AdjustToContents();
        }
        private void GerarExcelPagas(
    XLWorkbook workbook,
    List<HistoricoPagamentoDto> dados)
        {
            var ws = workbook.Worksheets.Add("Histórico");

            ws.Cell(1, 1).Value = "Cliente";
            ws.Cell(1, 2).Value = "Empresa";
            ws.Cell(1, 3).Value = "Data Pagamento";
            ws.Cell(1, 4).Value = "Valor Pago";
            ws.Cell(1, 5).Value = "Método";
            ws.Cell(1, 6).Value = "Status";

            int linha = 2;

            foreach (var item in dados)
            {
                ws.Cell(linha, 1).Value = item.Cliente;
                ws.Cell(linha, 2).Value = item.Empresa;
                ws.Cell(linha, 3).Value = item.DataPagamento;
                ws.Cell(linha, 4).Value = item.ValorPago;
                ws.Cell(linha, 5).Value = item.MetodoPagamento;
                ws.Cell(linha, 6).Value = item.Status;

                linha++;
            }

            ws.Columns().AdjustToContents();
        }
        private void GerarExcelGeral(
    XLWorkbook workbook,
    List<ContaReceberRelatorioDto> dados)
        {
            var ws = workbook.Worksheets.Add("Relatório Geral");

            ws.Cell(1, 1).Value = "Cliente";
            ws.Cell(1, 2).Value = "Empresa";
            ws.Cell(1, 3).Value = "Total Dívida";
            ws.Cell(1, 4).Value = "Valor Pago";
            ws.Cell(1, 5).Value = "Saldo Devedor";
            ws.Cell(1, 6).Value = "Próximo Vencimento";
            ws.Cell(1, 7).Value = "Status";

            int linha = 2;

            foreach (var item in dados)
            {
                ws.Cell(linha, 1).Value = item.Nome;
                ws.Cell(linha, 2).Value = item.Empresa;
                ws.Cell(linha, 3).Value = item.Total;
                ws.Cell(linha, 4).Value = item.Pago;
                ws.Cell(linha, 5).Value = item.Restante;
                ws.Cell(linha, 6).Value = item.ProximoVencimento;
                ws.Cell(linha, 7).Value = item.Status;

                linha++;
            }

            ws.Columns().AdjustToContents();
        }


        [HttpGet("export/pdf")]
        public async Task<IActionResult> ExportarPdf(
            string tipoRelatorio,
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId,
            int? clienteId)
        {
            string titulo;

            byte[] pdf;

            switch (tipoRelatorio.ToLower())
            {
                case "receber":

                    var receber = await _service
                        .GetContasReceber(
                        dataInicial,
                        dataFinal,
                        empresaId,
                        clienteId);

                    titulo = "Contas a Receber";

                    pdf = GerarPdfReceber(
                        titulo,
                        receber);

                    break;

                case "pagas":

                    var pagas = await _service
                        .GetHistoricoPagamentos(
                        dataInicial,
                        dataFinal,
                        empresaId,
                        clienteId);

                    titulo = "Histórico de Pagamentos";

                    pdf = GerarPdfPagas(
                        titulo,
                        pagas);

                    break;

                default:

                    var geral = await _service
                        .GetRelatorioGeral(
                        dataInicial,
                        dataFinal,
                        empresaId,
                        clienteId);

                    titulo = "Relatório Geral";

                    pdf = GerarPdfGeral(
                        titulo,
                        geral);

                    break;
            }

            return File(
                pdf,
                "application/pdf",
                $"{tipoRelatorio}.pdf");
        }

        private byte[] GerarPdfReceber(
            string titulo,
            List<ContaReceberRelatorioDto> dados)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(28);
                    page.DefaultTextStyle(x => x.FontSize(9).FontColor("#111827"));

                    page.Header()
                        .Element(c => CriarCabecalhoPdf(
                            c,
                            titulo,
                            "Relatorio financeiro gerado pelo Ofiador"));

                    page.Content()
                        .PaddingTop(14)
                        .Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Cliente");

                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Empresa");

                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Total");

                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Pago");

                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Restante");
                            });

                            foreach (var item in dados)
                            {
                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text(item.Nome);

                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text(item.Empresa);

                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text($"R$ {item.Total:N2}");

                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text($"R$ {item.Pago:N2}");

                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text($"R$ {item.Restante:N2}");
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Página ");
                            x.CurrentPageNumber();
                            x.Span(" de ");
                            x.TotalPages();
                        });
                });
            }).GeneratePdf();
        }

        private byte[] GerarPdfGeral(
            string titulo,
            List<ContaReceberRelatorioDto> dados)
        {
            return GerarPdfReceber(
                titulo,
                dados);
        }

        private byte[] GerarPdfPagas(
            string titulo,
            List<HistoricoPagamentoDto> dados)
        {
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(28);
                    page.DefaultTextStyle(x => x.FontSize(9).FontColor("#111827"));

                    page.Header()
                        .Element(c => CriarCabecalhoPdf(
                            c,
                            titulo,
                            "Historico de pagamentos exportado pelo Ofiador"));

                    page.Content()
                        .PaddingTop(14)
                        .Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn(3);
                                columns.RelativeColumn(2);
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            table.Header(header =>
                            {
                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Cliente");

                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Empresa");

                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Data");

                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Valor Pago");

                                header.Cell().Element(CriarCelulaCabecalhoPdf)
                                    .Text("Método");
                            });

                            foreach (var item in dados)
                            {
                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text(item.Cliente);

                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text(item.Empresa);

                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text(
                                    item.DataPagamento
                                    .ToString("dd/MM/yyyy"));

                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text(
                                    $"R$ {item.ValorPago:N2}");

                                table.Cell().Element(CriarCelulaTabelaPdf)
                                    .Text(
                                    item.MetodoPagamento);
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x =>
                        {
                            x.Span("Página ");
                            x.CurrentPageNumber();
                            x.Span(" de ");
                            x.TotalPages();
                        });
                });
            }).GeneratePdf();
        }

        private static void CriarCabecalhoPdf(
            IContainer container,
            string titulo,
            string subtitulo)
        {
            container
                .Background("#1A2B4C")
                .Padding(16)
                .Row(row =>
                {
                    row.RelativeItem()
                        .Column(column =>
                        {
                            column.Item()
                                .Text("OFIADOR")
                                .FontSize(18)
                                .Bold()
                                .FontColor("#FFFFFF");

                            column.Item()
                                .PaddingTop(2)
                                .Text("Sistema de Gestao")
                                .FontSize(9)
                                .FontColor("#CBD5E1");
                        });

                    row.RelativeItem()
                        .AlignRight()
                        .Column(column =>
                        {
                            column.Item()
                                .AlignRight()
                                .Text(titulo)
                                .FontSize(16)
                                .Bold()
                                .FontColor("#FFFFFF");

                            column.Item()
                                .PaddingTop(3)
                                .AlignRight()
                                .Text(subtitulo)
                                .FontSize(8)
                                .FontColor("#CBD5E1");

                            column.Item()
                                .PaddingTop(6)
                                .AlignRight()
                                .Text($"Gerado em {DateTime.Now:dd/MM/yyyy HH:mm}")
                                .FontSize(8)
                                .FontColor("#E2E8F0");
                        });
                });
        }

        private static IContainer CriarCelulaCabecalhoPdf(IContainer container)
        {
            return container
                .Background("#E8EEF7")
                .BorderBottom(1)
                .BorderColor("#CBD5E1")
                .PaddingVertical(7)
                .PaddingHorizontal(6);
        }

        private static IContainer CriarCelulaTabelaPdf(IContainer container)
        {
            return container
                .BorderBottom(1)
                .BorderColor("#E5E7EB")
                .PaddingVertical(6)
                .PaddingHorizontal(6);
        }
    }
}

