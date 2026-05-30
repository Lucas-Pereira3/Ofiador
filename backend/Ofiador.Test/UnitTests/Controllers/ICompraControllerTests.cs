using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Ofiador.API.Controllers;
using Ofiador.Application.DTOs;
using Ofiador.Application.Interfaces;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Data;
using Xunit;

namespace Ofiador.Test.UnitTests.Controllers
{
    public class CompraControllerTests
    {
        private readonly Mock<ICompraService> _serviceMock;

        private readonly ApplicationDbContext _context;

        private readonly ComprasController _controller;

        public CompraControllerTests()
        {
            _serviceMock =
                new Mock<ICompraService>();

            var options =
                new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            _context =
                new ApplicationDbContext(options);

            _controller =
                new ComprasController(
                    _serviceMock.Object,
                    _context);
        }

        //Compra válida
        [Fact]
        public void CriarCompra_DeveRetornarCreated()
        {
            var dto = new CompraCreateDTOs
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 500,
                Parcelas = 2
            };

            var compra = new Compra
            {
                IdCompra = 1,
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 500,
                Parcelas = 2
            };

            _serviceMock
                .Setup(s => s.CriarCompra(It.IsAny<Compra>()))
                .Returns(compra);

            var result = _controller.CriarCompra(dto);

            Assert.IsType<CreatedAtActionResult>(result);
        }

        //Cliente não encontrado
        [Fact]
        public void CriarCompra_DeveRetornarBadRequest_QuandoClienteNaoExiste()
        {
            var dto = new CompraCreateDTOs
            {
                IdCliente = 999,
                IdEmpresa = 1,
                Valor_Total = 500,
                Parcelas = 2
            };

            _serviceMock
                .Setup(s => s.CriarCompra(It.IsAny<Compra>()))
                .Throws(new Exception("Cliente não encontrado"));

            var result = _controller.CriarCompra(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        //Empresa não encontrada
        [Fact]
        public void CriarCompra_DeveRetornarBadRequest_QuandoEmpresaNaoExiste()
        {
            var dto = new CompraCreateDTOs
            {
                IdCliente = 1,
                IdEmpresa = 999,
                Valor_Total = 500,
                Parcelas = 2
            };

            _serviceMock
                .Setup(s => s.CriarCompra(It.IsAny<Compra>()))
                .Throws(new Exception("Empresa não encontrada"));

            var result = _controller.CriarCompra(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        //Limite excedido
        [Fact]
        public void CriarCompra_DeveRetornarBadRequest_QuandoLimiteExcedido()
        {
            var dto = new CompraCreateDTOs
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 10000,
                Parcelas = 2
            };

            _serviceMock
                .Setup(s => s.CriarCompra(It.IsAny<Compra>()))
                .Throws(new Exception("Limite do cliente excedido"));

            var result = _controller.CriarCompra(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        //Data inválida
        [Fact]
        public void CriarCompra_DeveRetornarBadRequest_QuandoDataInvalida()
        {
            var dto = new CompraCreateDTOs
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 500,
                Parcelas = 2,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento = DateTime.UtcNow.AddDays(-1)
            };

            _serviceMock
                .Setup(s => s.CriarCompra(It.IsAny<Compra>()))
                .Throws(
                    new Exception(
                        "A data de vencimento não pode ser menor que a data da compra"));

            var result = _controller.CriarCompra(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        //Valor inválido
        [Fact]
        public void CriarCompra_DeveRetornarBadRequest_QuandoValorInvalido()
        {
            var dto = new CompraCreateDTOs
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 0,
                Parcelas = 2
            };

            _serviceMock
                .Setup(s => s.CriarCompra(It.IsAny<Compra>()))
                .Throws(
                    new Exception(
                        "Valor da compra deve ser maior que zero"));

            var result = _controller.CriarCompra(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }

        //Parcelas inválidas
        [Fact]
        public void CriarCompra_DeveRetornarBadRequest_QuandoParcelasInvalidas()
        {
            var dto = new CompraCreateDTOs
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 500,
                Parcelas = 0
            };

            _serviceMock
                .Setup(s => s.CriarCompra(It.IsAny<Compra>()))
                .Throws(
                    new Exception(
                        "Quantidade de parcelas inválida"));

            var result = _controller.CriarCompra(dto);

            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}