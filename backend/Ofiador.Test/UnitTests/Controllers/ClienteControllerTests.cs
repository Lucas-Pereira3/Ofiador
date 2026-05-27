using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using Ofiador.API.Controllers;
using Ofiador.Application.DTOs;
using Ofiador.Application.Interfaces;
using Ofiador.Application.Services;
using Ofiador.Infrastructure.Data;
using Xunit;

namespace Ofiador.Test.UnitTests.Controllers
{
    public class ClienteControllerTests
    {
        private readonly Mock<IClienteService> _service;

        private readonly ClienteController _controller;

        public ClienteControllerTests()
        {
            _service = new Mock<IClienteService>();

            _controller = new ClienteController(_service.Object);
        }

        //Listar CLiente
        [Fact]
        public void ListarCLiente_DeveRetornarOk()
        {
            var cliente = new List<ClienteDTOs>
            {
                new ClienteDTOs
                {
                    IdCliente =1,

                    Nome = "Astolfo",

                    Divida = 100
                }
            };

            _service.Setup(s => s.ListarCLientes()).Returns(cliente);

            var resultado = _controller.ListarClientes();

            var okResultado = Assert.IsType<OkObjectResult>(resultado);

            Assert.NotNull(okResultado);
        }

        [Fact]
        //Buscar cliente por Id
        public void BuscarCliente_DeveRetornarCliente()
        {
            var cliente = new ClienteDTOs
            {
                IdCliente = 1,
                Nome = "Pedro",
                Divida = 80
            };

            _service.Setup(s =>s.BuscarClientePorId(1)).Returns(cliente);

            // Act
            var result = _controller.BuscarClientes(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);

            Assert.NotNull(okResult);
        }

        // CLIENTE NÃO ENCONTRADO
        [Fact]
        public void BuscarCliente_DeveRetornarNotFound()
        {
            // Arrange
            _service.Setup(s => s.BuscarClientePorId(1)).Returns((ClienteDTOs?)null);

            // Act
            var result = _controller.BuscarClientes(1);

            // Assert
            var notFound = Assert.IsType<NotFoundObjectResult>(result);

            Assert.NotNull(notFound);
        }

        // EXCLUIR CLIENTE
        [Fact]
        public void ExcluirCliente_DeveRetornarOk()
        {
            // Arrange
            _service.Setup(s =>s.ExcluirCLiente(1))
                .Returns((true,"Cliente removido com sucesso"));

            // Act
            var result = _controller.ExcluirCliente(1);

            // Assert
            var okResult =Assert.IsType<OkObjectResult>(result);

            Assert.NotNull(okResult);
        }

        [Fact]
        public void ExcluirCliente_DeveRetornarConflict()
        {
            // Arrange
            _service.Setup(s =>s.ExcluirCLiente(1))
                .Returns((false,"Cliente possui faturas em aberto"));

            // Act
            var result = _controller.ExcluirCliente(1);

            // Assert
            var conflict = Assert.IsType<ConflictObjectResult>(result);

            Assert.NotNull(conflict);
        }
    }
}
