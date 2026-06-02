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
            IGrouping<(int IdCliente, string Nome, string Cpf, int EmpresaId, string Empresa), Fatura> g,
            bool isPaga)
        {
            var parcelas = g.SelectMany(f => f.CompraParcelas).ToList();
            var total = parcelas.Sum(p => p.ValorParcela);
            var pago = parcelas.Where(p => p.Pago).Sum(p => p.ValorParcela);
            var restante = total - pago;

            // Próximo vencimento: menor data de vencimento das parcelas não pagas
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
                status = "paga";
            else if (diasAtraso > 0)
                status = "atrasada";
            else
                status = "pendente";

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
                .Select(g => MapFaturas(g, false))
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
                .Select(g => MapFaturas(g, true))
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
            return receber.Concat(pagas).ToList();
        }
    }
}