using Ofiador.Application.DTOs;
using Ofiador.API.Repositories;
using Ofiador.Infrastructure.Interfaces;
using Ofiador.Application.Interfaces;
using Ofiador.Domain.Entities;

namespace Ofiador.Application.Services
{
    public class RelatorioService : IRelatorioService
    {
        private readonly IRelatorioRepository _repository;

        public RelatorioService(IRelatorioRepository repository)
        {
            _repository = repository;
        }

        private static ContaReceberRelatorioDto MapFaturas(
            IGrouping<(int IdCliente, string Nome, string Cpf, int EmpresaId, string Empresa), Fatura> g)
        {
            var parcelas = g.SelectMany(f => f.CompraParcelas).ToList();
            var total = parcelas.Sum(p => p.ValorParcela);
            var pago = parcelas.Where(p => p.Pago).Sum(p => p.ValorParcela);
            var restante = total - pago;

            var hoje = DateTime.UtcNow.Date;
            var proximaParcelaVencimento = parcelas
                .Where(p => !p.Pago)
                .Select(p => (DateTime?)p.DataVencimento.Date)
                .OrderBy(d => d)
                .FirstOrDefault();

            int diasAtraso = 0;
            if (proximaParcelaVencimento.HasValue &&
                proximaParcelaVencimento.Value < hoje)
            {
                diasAtraso = (int)(hoje - proximaParcelaVencimento.Value).TotalDays;
            }

            string status;
            if (restante == 0)
                status = "Pago";
            else if (diasAtraso > 0)
                status = "Atrasado";
            else
            {
                int diasParaVencer = proximaParcelaVencimento.HasValue
                    ? (int)(proximaParcelaVencimento.Value - hoje).TotalDays
                    : int.MaxValue;
                status = diasParaVencer <= 7 ? "Vence em breve" : "Em dia";
            }

            return new ContaReceberRelatorioDto
            {
                ClienteId = g.Key.IdCliente,
                Nome = g.Key.Nome,
                Cpf = g.Key.Cpf,
                EmpresaId = g.Key.EmpresaId,
                Empresa = g.Key.Empresa,
                Total = total,
                Pago = pago,
                Restante = restante,
                ProximoVencimento = proximaParcelaVencimento,
                DiasAtraso = diasAtraso,
                Status = status
            };
        }

        public async Task<List<ContaReceberRelatorioDto>> GetContasReceber(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId = null,
            int? clienteId = null)
        {
            if (dataInicial.HasValue && dataFinal.HasValue && dataInicial > dataFinal)
                throw new Exception("Data inicial não pode ser maior que a data final");

            var faturas = await _repository.GetContasReceber(
                dataInicial, dataFinal, empresaId, clienteId);

            return faturas
                .GroupBy(f => (
                    f.IdCliente,
                    f.Cliente!.Nome,
                    f.Cliente!.Cpf_Cnpj,
                    f.Cliente!.IdEmpresa,
                    f.Cliente!.Empresa?.Nome ?? ""))
                .Select(g => MapFaturas(g))
                .ToList();
        }

        public async Task<List<ContaReceberRelatorioDto>> GetContasPagas(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId = null,
            int? clienteId = null)
        {
            if (dataInicial.HasValue && dataFinal.HasValue && dataInicial > dataFinal)
                throw new Exception("Data inicial não pode ser maior que a data final");

            var faturas = await _repository.GetContasPagas(
                dataInicial, dataFinal, empresaId, clienteId);

            return faturas
                .GroupBy(f => (
                    f.IdCliente,
                    f.Cliente!.Nome,
                    f.Cliente!.Cpf_Cnpj,
                    f.Cliente!.IdEmpresa,
                    f.Cliente!.Empresa?.Nome ?? ""))
                .Select(g => MapFaturas(g))
                .ToList();
        }

        public async Task<List<ContaReceberRelatorioDto>> GetRelatorioGeral(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId = null,
            int? clienteId = null)
        {
            var receber = await GetContasReceber(dataInicial, dataFinal, empresaId, clienteId);
            var pagas = await GetContasPagas(dataInicial, dataFinal, empresaId, clienteId);

            var hoje = DateTime.UtcNow.Date;

            return receber.Concat(pagas)
                .GroupBy(d => (d.ClienteId, d.EmpresaId))
                .Select(g =>
                {
                    var totalDivida = g.Sum(d => d.Total);
                    var totalPago = g.Sum(d => d.Pago);
                    var totalRestante = g.Sum(d => d.Restante);

                    var proximoVenc = g
                        .Where(d => d.ProximoVencimento.HasValue)
                        .Select(d => d.ProximoVencimento)
                        .OrderBy(d => d)
                        .FirstOrDefault();

                    var maxDiasAtraso = g.Max(d => d.DiasAtraso);

                    string status;
                    if (totalRestante == 0)
                        status = "Pago";
                    else if (maxDiasAtraso > 0)
                        status = "Atrasado";
                    else if (proximoVenc.HasValue && (proximoVenc.Value - hoje).TotalDays <= 7)
                        status = "Vence em breve";
                    else
                        status = "Em dia";

                    var first = g.First();
                    return new ContaReceberRelatorioDto
                    {
                        ClienteId = first.ClienteId,
                        Nome = first.Nome,
                        Cpf = first.Cpf,
                        EmpresaId = first.EmpresaId,
                        Empresa = first.Empresa,
                        Total = totalDivida,
                        Pago = totalPago,
                        Restante = totalRestante,
                        ProximoVencimento = proximoVenc,
                        DiasAtraso = maxDiasAtraso,
                        Status = status
                    };
                })
                .ToList();
        }

        public async Task<List<PagamentoHistoricoDto>> GetHistoricoPagamentos(
            DateTime? dataInicial,
            DateTime? dataFinal,
            int? empresaId = null,
            int? clienteId = null)
        {
            var pagamentos = await _repository.GetHistoricoPagamentos(
                dataInicial, dataFinal, empresaId, clienteId);

            return pagamentos.Select(p => new PagamentoHistoricoDto
            {
                PagamentoId = p.IdPagamento,
                ClienteId = p.Fatura?.Cliente?.IdCliente ?? 0,
                Nome = p.Fatura?.Cliente?.Nome ?? "",
                Cpf = p.Fatura?.Cliente?.Cpf_Cnpj ?? "",
                EmpresaId = p.Fatura?.Cliente?.IdEmpresa ?? 0,
                Empresa = p.Fatura?.Cliente?.Empresa?.Nome ?? "",
                FaturaReferencia = p.Fatura?.MesReferencia.ToString("MM/yyyy") ?? "",
                DataPagamento = p.Data_Pagamento,
                ValorPago = p.ValorPago,
                MetodoPagamento = p.MetodoPagamento,
                Status = "Pago"
            }).ToList();
        }
    }
}