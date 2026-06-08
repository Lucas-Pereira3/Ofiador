using Microsoft.AspNetCore.Mvc;
using Moq;
using Ofiador.API.Controllers;
using Ofiador.Application.DTOs;
using Ofiador.Application.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;

namespace Ofiador.Test.UnitTests.Controllers
{
    public class RelatorioControllerTests
    {
        private readonly Mock<IRelatorioService> _serviceMock;
        private readonly Mock<IExportService> _exportServiceMock;

        private readonly RelatoriosAReceberController _controller;

        public RelatorioControllerTests()
        {
            _serviceMock =
                new Mock<IRelatorioService>();

            _exportServiceMock =
                new Mock<IExportService>();

            _controller =
                new RelatoriosAReceberController(
                    _serviceMock.Object,
                    _exportServiceMock.Object);
        }

        //Intervalo inválido
        [Fact]
        public async Task GetContasReceber_DeveRetornarBadRequest()
        {
            _serviceMock
                .Setup(s =>
                    s.GetContasReceber(
                        It.IsAny<DateTime?>(),
                        It.IsAny<DateTime?>(),
                        It.IsAny<int?>(),
                        It.IsAny<int?>()))
                .ThrowsAsync(
                    new Exception(
                        "Data inicial não pode ser maior que a data final"));

            var result =
                await _controller.GetContasReceber(
                    new DateTime(2025, 12, 31),
                    new DateTime(2025, 1, 1),
                    null,
                    null);

            Assert.IsType<BadRequestObjectResult>(
                result);
        }

        //Relatório retornado com sucesso
        [Fact]
        public async Task GetContasReceber_DeveRetornarOk()
        {
            var relatorio =
                new List<ContaReceberRelatorioDto>
                {
                    new()
                    {
                        Nome = "Pedro",
                        Total = 1000,
                        Pago = 400,
                        Restante = 600
                    }
                };

            _serviceMock
                .Setup(s =>
                    s.GetContasReceber(
                        null,
                        null,
                        null,
                        null))
                .ReturnsAsync(relatorio);

            var result =
                await _controller.GetContasReceber(
                    null,
                    null,
                    null,
                    null);

            Assert.IsType<OkObjectResult>(
                result);
        }

        //Lista vazia
        [Fact]
        public async Task GetContasReceber_DeveRetornarOkComListaVazia()
        {
            _serviceMock
                .Setup(s =>
                    s.GetContasReceber(
                        null,
                        null,
                        null,
                        null))
                .ReturnsAsync(
                    new List<ContaReceberRelatorioDto>());

            var result =
                await _controller.GetContasReceber(
                    null,
                    null,
                    null,
                    null);

            var okResult =
                Assert.IsType<OkObjectResult>(
                    result);

            var dados =
                Assert.IsAssignableFrom<
                    List<ContaReceberRelatorioDto>>(
                        okResult.Value);

            Assert.Empty(dados);
        }
    }
}
