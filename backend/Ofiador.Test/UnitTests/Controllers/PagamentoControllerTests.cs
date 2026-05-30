using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Ofiador.API.Controllers;
using Ofiador.Application.DTOs;
using Ofiador.Application.Interfaces;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;

namespace Ofiador.Test.UnitTests.Controllers
{
    public class PagamentoControllerTests
    {
        private readonly Mock<IPagamentoService> _serviceMock;

        private readonly ApplicationDbContext _context;

        private readonly PagamentosController _controller;

        public PagamentoControllerTests()
        {
            _serviceMock =
                new Mock<IPagamentoService>();

            var options =
                new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context =
                new ApplicationDbContext(options);

            _controller =
                new PagamentosController(
                    _context,
                    _serviceMock.Object);
        }

        //Parcela inexistente
        [Fact]
        public void CriarPagamento_DeveRetornarBadRequest_QuandoParcelaNaoExiste()
        {
            var dto = new PagamentoParcelaDTOs
            {
                IdParcela = 999,
                MetodoPagamento = "PIX"
            };

            _serviceMock
                .Setup(s =>
                    s.PagarParcela(
                        dto.IdParcela,
                        dto.MetodoPagamento))
                .Throws(
                    new Exception(
                        "Parcela não encontrada"));

            var result =
                _controller.CriarPagamento(dto);

            Assert.IsType<BadRequestObjectResult>(
                result);
        }

        //Pagamento duplicado
        [Fact]
        public void CriarPagamento_DeveRetornarBadRequest_QuandoParcelaJaFoiPaga()
        {
            var dto = new PagamentoParcelaDTOs
            {
                IdParcela = 1,
                MetodoPagamento = "PIX"
            };

            _serviceMock
                .Setup(s =>
                    s.PagarParcela(
                        dto.IdParcela,
                        dto.MetodoPagamento))
                .Throws(
                    new Exception(
                        "Parcela já foi Paga"));

            var result =
                _controller.CriarPagamento(dto);

            Assert.IsType<BadRequestObjectResult>(
                result);
        }

        //Pagamento válido
        [Fact]
        public void CriarPagamento_DeveRetornarOk()
        {
            var dto = new PagamentoParcelaDTOs
            {
                IdParcela = 1,
                MetodoPagamento = "PIX"
            };

            var pagamento = new Pagamento
            {
                IdPagamento = 1,
                ValorPago = 100
            };

            _serviceMock
                .Setup(s =>
                    s.PagarParcela(
                        dto.IdParcela,
                        dto.MetodoPagamento))
                .Returns(pagamento);

            var result =
                _controller.CriarPagamento(dto);

            Assert.IsType<OkObjectResult>(
                result);
        }

        //Fatura inexistente
        [Fact]
        public void PagarFatura_DeveRetornarBadRequest_QuandoFaturaNaoExiste()
        {
            var dto = new PagamentoFaturaDTOs
            {
                IdFatura = 999,
                MetodoPagamento = "PIX"
            };

            _serviceMock
                .Setup(s =>
                    s.PagarFatura(
                        dto.IdFatura,
                        dto.MetodoPagamento))
                .Throws(
                    new Exception(
                        "Fatura não encontrada"));

            var result =
                _controller.PagarFatura(dto);

            Assert.IsType<BadRequestObjectResult>(
                result);
        }

        //Fatura já paga
        [Fact]
        public void PagarFatura_DeveRetornarBadRequest_QuandoFaturaJaFoiPaga()
        {
            var dto = new PagamentoFaturaDTOs
            {
                IdFatura = 1,
                MetodoPagamento = "PIX"
            };

            _serviceMock
                .Setup(s =>
                    s.PagarFatura(
                        dto.IdFatura,
                        dto.MetodoPagamento))
                .Throws(
                    new Exception(
                        "Fatura já foi pagga"));

            var result =
                _controller.PagarFatura(dto);

            Assert.IsType<BadRequestObjectResult>(
                result);
        }

        //Fatura paga com sucesso
        [Fact]
        public void PagarFatura_DeveRetornarOk()
        {
            var dto = new PagamentoFaturaDTOs
            {
                IdFatura = 1,
                MetodoPagamento = "PIX"
            };

            var pagamento = new Pagamento
            {
                IdPagamento = 1,
                ValorPago = 500
            };

            _serviceMock
                .Setup(s =>
                    s.PagarFatura(
                        dto.IdFatura,
                        dto.MetodoPagamento))
                .Returns(pagamento);

            var result =
                _controller.PagarFatura(dto);

            Assert.IsType<OkObjectResult>(
                result);
        }
    }
}