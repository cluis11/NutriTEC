using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using NutriTEC.API.DTOs;
using NutriTEC.API.Models;
using NutriTEC.API.Services.Interfaces;

namespace NutriTEC.API.Services
{
    public class PdfService : IPdfService
    {
        public PdfService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        // ============================================================
        // REPORTE DE COBRO (ADMIN)
        // ============================================================
        public byte[] GenerarReporteCobro(List<ReporteCobroDTO> datos)
        {
            var totalGeneral = datos.Sum(d => d.Monto_final);
            var fechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm");

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(0);
                    page.DefaultTextStyle(x => x.FontFamily("Arial"));

                    page.Content().Column(col =>
                    {
                        // Header verde
                        col.Item().Background("#1abc9c").Padding(20).Row(header =>
                        {
                            header.RelativeItem().Column(left =>
                            {
                                left.Item().Text("NutriTEC").FontSize(28).Bold().FontColor("#FFFFFF");
                                left.Item().Text("REPORTE DE COBRO  /  BILLING REPORT").FontSize(9).FontColor("#d1fae5").LetterSpacing(1);
                            });
                            header.ConstantItem(200).AlignRight().Column(right =>
                            {
                                right.Item().Text("Reporte Administrativo").FontSize(11).Bold().FontColor("#FFFFFF");
                                right.Item().Text($"Generado: {fechaGeneracion}").FontSize(9).FontColor("#d1fae5");
                            });
                        });

                        // Cuerpo principal
                        col.Item().Padding(20).Column(body =>
                        {
                            // Resumen
                            body.Item().PaddingBottom(15).Row(resumen =>
                            {
                                resumen.RelativeItem().Background("#e8f8f5").Padding(15).Column(c =>
                                {
                                    c.Item().Text("NUTRICIONISTAS ACTIVOS").FontSize(8).FontColor("#16a085").Bold().LetterSpacing(1);
                                    c.Item().PaddingTop(5).Text($"{datos.Count}").FontSize(24).Bold().FontColor("#1abc9c");
                                });
                                resumen.ConstantItem(15);
                                resumen.RelativeItem().Background("#e8f8f5").Padding(15).Column(c =>
                                {
                                    c.Item().Text("TOTAL A COBRAR").FontSize(8).FontColor("#16a085").Bold().LetterSpacing(1);
                                    c.Item().PaddingTop(5).Text($"${totalGeneral:F2}").FontSize(24).Bold().FontColor("#1abc9c");
                                });
                                resumen.ConstantItem(15);
                                resumen.RelativeItem().Background("#e8f8f5").Padding(15).Column(c =>
                                {
                                    c.Item().Text("PACIENTES ATENDIDOS").FontSize(8).FontColor("#16a085").Bold().LetterSpacing(1);
                                    c.Item().PaddingTop(5).Text($"{datos.Sum(d => d.Cantidad_pacientes)}").FontSize(24).Bold().FontColor("#1abc9c");
                                });
                            });

                            // Tabla
                            body.Item().Table(table =>
                            {
                                table.ColumnsDefinition(cols =>
                                {
                                    cols.RelativeColumn(1);  // tipo
                                    cols.RelativeColumn(2);  // nombre
                                    cols.RelativeColumn(2);  // correo
                                    cols.RelativeColumn(1.5f); // tarjeta
                                    cols.RelativeColumn(0.8f); // pacientes
                                    cols.RelativeColumn(1);  // monto base
                                    cols.RelativeColumn(1);  // descuento
                                    cols.RelativeColumn(1);  // monto final
                                });

                                // Header
                                table.Header(h =>
                                {
                                    void HeaderCell(string text) =>
                                        h.Cell().Background("#1e293b").Padding(8).Text(text).FontSize(8).Bold().FontColor("#FFFFFF").LetterSpacing(1);
                                    HeaderCell("TIPO PAGO");
                                    HeaderCell("NUTRICIONISTA");
                                    HeaderCell("CORREO");
                                    HeaderCell("TARJETA");
                                    HeaderCell("PACIENTES");
                                    HeaderCell("MONTO BASE");
                                    HeaderCell("DESCUENTO");
                                    HeaderCell("MONTO FINAL");
                                });

                                int rowIdx = 0;
                                foreach (var d in datos)
                                {
                                    var bg = rowIdx % 2 == 0 ? "#FFFFFF" : "#f8fafc";

                                    table.Cell().Background(bg).Padding(6).Text(d.Tipo_cobro?.ToUpper() ?? "").FontSize(8).FontColor("#1abc9c").Bold();
                                    table.Cell().Background(bg).Padding(6).Text(d.Nombre ?? "").FontSize(8).FontColor("#1e293b");
                                    table.Cell().Background(bg).Padding(6).Text(d.Correo ?? "").FontSize(8).FontColor("#64748b");
                                    var tarjeta = d.Tarjeta != null && d.Tarjeta.Length >= 4 ? $"**** {d.Tarjeta.Substring(d.Tarjeta.Length - 4)}" : "";
                                    table.Cell().Background(bg).Padding(6).Text(tarjeta).FontSize(8).FontColor("#64748b");
                                    table.Cell().Background(bg).Padding(6).AlignCenter().Text($"{d.Cantidad_pacientes}").FontSize(8).FontColor("#1e293b");
                                    table.Cell().Background(bg).Padding(6).Text($"${d.Monto_base:F2}").FontSize(8).FontColor("#1e293b");
                                    table.Cell().Background(bg).Padding(6).Text($"-${d.Descuento:F2}").FontSize(8).FontColor("#dc2626");
                                    table.Cell().Background(bg).Padding(6).Text($"${d.Monto_final:F2}").FontSize(8).Bold().FontColor("#16a085");
                                    rowIdx++;
                                }

                                // Footer total
                                table.Cell().ColumnSpan(7).Background("#1e293b").Padding(8).AlignRight().Text("TOTAL GENERAL:").FontSize(9).Bold().FontColor("#FFFFFF");
                                table.Cell().Background("#1e293b").Padding(8).Text($"${totalGeneral:F2}").FontSize(10).Bold().FontColor("#1abc9c");
                            });
                        });

                        // Footer
                        col.Item().Background("#f8fafc").Padding(10).AlignCenter().Text("NutriTEC © 2026 — Reporte generado automáticamente").FontSize(8).FontColor("#94a3b8");
                    });
                });
            });

            return document.GeneratePdf();
        }

        // ============================================================
        // REPORTE DE AVANCE (CLIENTE)
        // ============================================================
        public byte[] GenerarReporteAvance(string nombreCliente, List<Medida> medidas, DateTime? fechaInicio, DateTime? fechaFin)
        {
            var fechaGeneracion = DateTime.Now.ToString("dd/MM/yyyy HH:mm");

            // Calcular variaciones si hay al menos 2 medidas
            string variacionPeso = "—", variacionMusculo = "—", variacionGrasa = "—";
            if (medidas.Count >= 2)
            {
                var primera = medidas.OrderBy(m => m.Fecha).First();
                var ultima = medidas.OrderBy(m => m.Fecha).Last();

                var difGrasa = ultima.P_grasa - primera.P_grasa;
                var difMusc = ultima.P_musculo - primera.P_musculo;

                variacionGrasa = $"{(difGrasa >= 0 ? "+" : "")}{difGrasa:F1}%";
                variacionMusculo = $"{(difMusc >= 0 ? "+" : "")}{difMusc:F1}%";
            }

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(0);
                    page.DefaultTextStyle(x => x.FontFamily("Arial"));

                    page.Content().Column(col =>
                    {
                        // Header verde
                        col.Item().Background("#1abc9c").Padding(25).Row(header =>
                        {
                            header.RelativeItem().Column(left =>
                            {
                                left.Item().Text("NutriTEC").FontSize(28).Bold().FontColor("#FFFFFF");
                                left.Item().Text("REPORTE DE AVANCE  /  PROGRESS REPORT").FontSize(9).FontColor("#d1fae5").LetterSpacing(1);
                            });
                            header.ConstantItem(200).AlignRight().Column(right =>
                            {
                                right.Item().Text(nombreCliente).FontSize(13).Bold().FontColor("#FFFFFF");
                                right.Item().Text($"Generado: {fechaGeneracion}").FontSize(8).FontColor("#d1fae5");
                            });
                        });

                        col.Item().Padding(25).Column(body =>
                        {
                            // Periodo
                            body.Item().PaddingBottom(15).Background("#f8fafc").Padding(12).Column(c =>
                            {
                                c.Item().Text("PERIODO DEL REPORTE").FontSize(7).FontColor("#94a3b8").Bold().LetterSpacing(1);
                                string periodoTexto = (fechaInicio.HasValue || fechaFin.HasValue)
                                    ? $"{(fechaInicio?.ToString("dd/MM/yyyy") ?? "Inicio")} al {(fechaFin?.ToString("dd/MM/yyyy") ?? "Actualidad")}"
                                    : "Historial Completo";
                                c.Item().PaddingTop(3).Text(periodoTexto).FontSize(12).Bold().FontColor("#1e293b");
                            });

                            // Resumen
                            if (medidas.Count >= 2)
                            {
                                body.Item().PaddingBottom(15).Row(resumen =>
                                {
                                    resumen.RelativeItem().Background("#e8f8f5").Padding(15).Column(c =>
                                    {
                                        c.Item().Text("MEDICIONES").FontSize(7).FontColor("#16a085").Bold().LetterSpacing(1);
                                        c.Item().PaddingTop(3).Text($"{medidas.Count}").FontSize(20).Bold().FontColor("#1abc9c");
                                    });
                                    resumen.ConstantItem(10);
                                    resumen.RelativeItem().Background("#e8f8f5").Padding(15).Column(c =>
                                    {
                                        c.Item().Text("VAR. MÚSCULO").FontSize(7).FontColor("#16a085").Bold().LetterSpacing(1);
                                        c.Item().PaddingTop(3).Text(variacionMusculo).FontSize(20).Bold().FontColor("#1abc9c");
                                    });
                                    resumen.ConstantItem(10);
                                    resumen.RelativeItem().Background("#fef2f2").Padding(15).Column(c =>
                                    {
                                        c.Item().Text("VAR. GRASA").FontSize(7).FontColor("#dc2626").Bold().LetterSpacing(1);
                                        c.Item().PaddingTop(3).Text(variacionGrasa).FontSize(20).Bold().FontColor("#dc2626");
                                    });
                                });
                            }

                            // Tabla
                            body.Item().Table(table =>
                            {
                                table.ColumnsDefinition(cols =>
                                {
                                    cols.RelativeColumn(1.5f);
                                    cols.RelativeColumn(1);
                                    cols.RelativeColumn(1);
                                    cols.RelativeColumn(1);
                                    cols.RelativeColumn(1);
                                    cols.RelativeColumn(1);
                                });

                                table.Header(h =>
                                {
                                    void HeaderCell(string text) =>
                                        h.Cell().Background("#1e293b").Padding(8).Text(text).FontSize(8).Bold().FontColor("#FFFFFF").LetterSpacing(1);
                                    HeaderCell("FECHA");
                                    HeaderCell("CINTURA");
                                    HeaderCell("CUELLO");
                                    HeaderCell("CADERAS");
                                    HeaderCell("% MÚSCULO");
                                    HeaderCell("% GRASA");
                                });

                                if (medidas.Count == 0)
                                {
                                    table.Cell().ColumnSpan(6).Background("#f8fafc").Padding(20).AlignCenter().Text("No se registran medidas en el periodo seleccionado.").FontSize(10).FontColor("#94a3b8");
                                }
                                else
                                {
                                    int rowIdx = 0;
                                    foreach (var m in medidas.OrderByDescending(x => x.Fecha))
                                    {
                                        var bg = rowIdx % 2 == 0 ? "#FFFFFF" : "#f8fafc";
                                        table.Cell().Background(bg).Padding(8).Text(m.Fecha.ToString("dd/MM/yyyy")).FontSize(9).Bold().FontColor("#1e293b");
                                        table.Cell().Background(bg).Padding(8).AlignCenter().Text($"{m.Cintura} cm").FontSize(9).FontColor("#64748b");
                                        table.Cell().Background(bg).Padding(8).AlignCenter().Text($"{m.Cuello} cm").FontSize(9).FontColor("#64748b");
                                        table.Cell().Background(bg).Padding(8).AlignCenter().Text($"{m.Caderas} cm").FontSize(9).FontColor("#64748b");
                                        table.Cell().Background(bg).Padding(8).AlignCenter().Text($"{m.P_musculo}%").FontSize(9).Bold().FontColor("#16a085");
                                        table.Cell().Background(bg).Padding(8).AlignCenter().Text($"{m.P_grasa}%").FontSize(9).Bold().FontColor("#dc2626");
                                        rowIdx++;
                                    }
                                }
                            });
                        });

                        col.Item().Background("#f8fafc").Padding(10).AlignCenter().Text("NutriTEC © 2026 — Tu compañero de nutrición").FontSize(8).FontColor("#94a3b8");
                    });
                });
            });

            return document.GeneratePdf();
        }
    }
}