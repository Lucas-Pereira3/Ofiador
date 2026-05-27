using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Ofiador.API.Controllers;
using Ofiador.Application.Services;
using Ofiador.Application.DTOs;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Interfaces;
using Ofiador.Application.Interfaces;

namespace Ofiador.Test.UnitTests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IAuthRepository> _repositoryMock;

        private readonly AuthService _authService;

        private readonly Mock<IJwt> _jwtMock;

        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _repositoryMock =
               new Mock<IAuthRepository>();
            
            _authService = new AuthService(_repositoryMock.Object);

            _jwtMock = new Mock<IJwt>();

            _controller = new AuthController(_authService, _jwtMock.Object);
        }

        //Gerar Token quando valido
        [Fact]
        public void login_DevegerarToken()
        {
            var dto = new AuthDTO 
            { 
                Login= "teste@gmail.com",
                Senha = "Roberte102@"
            };

            var usuario = new Usuario
            {
                Nome = "Pedro",
                Login = dto.Login
            };

            usuario.DefinirSenha(dto.Senha);

            _repositoryMock.Setup(u => u.BuscarLogin(dto.Login)).Returns(usuario);

            _jwtMock.Setup(j => j.GerarToken(usuario)).Returns("jwt-token");

            var result = _controller.Login(dto);

            var okResult = Assert.IsType<OkObjectResult>(result);

            Assert.NotNull(okResult);
        }

        //Usuario não Existe
        [Fact]
        public void Login_DeveRetornarUnauthorized()
        {
            var dto = new AuthDTO
            {
                Login = "naoexiste@gmail.com",

                Senha = "Roberte102@"
            };

            _repositoryMock.Setup(r => r.BuscarLogin(dto.Login)).Returns((Usuario?)null);

            var result = _controller.Login(dto);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }

        //Senha invalida
        [Fact]
        public void Login_DeveRetornarUnauThorized_QuandoSenhaInvalida()
        {
            var dto = new AuthDTO
            {
                Login = "teste@gmail.com",

                Senha = "SenhaInvalida"
            };

            var usuario = new Usuario
            {
                Nome = "Pedro",

                Login = dto.Login
            };

            usuario.DefinirSenha("Roberte102@");

            _repositoryMock.Setup(r => r.BuscarLogin(dto.Login)).Returns(usuario);

            var result = _controller.Login(dto);

            Assert.IsType<UnauthorizedObjectResult>(result);
        }
    }
}
