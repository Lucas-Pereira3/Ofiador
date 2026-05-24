using Xunit;
using Moq;
using Ofiador.Application.Services;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Repository;

namespace Ofiador.Test.Service
{
    public class AuthServiceTests
    {
        private readonly Mock<IAuthRepository> _repositoryMock;

        private readonly AuthService _service;

        public AuthServiceTests()
        {
            _repositoryMock = new Mock<IAuthRepository>();

            _service = new AuthService( _repositoryMock.Object );
        }

        //Usuario valido
        [Fact]
        public void CriarUsuario_DeveCriarusuario()
        {
            var nome = "Pedro";

            var login = "teste@gmail.com";

            var senha = "Senha@123";

            _repositoryMock.Setup(r => r.EmailExiste(login)).Returns(false);

            var resultado = _service.CriarUsuario(nome, login, senha);

            Assert.True(resultado.sucesso);

            Assert.NotNull(resultado.usuario);

            Assert.Equal(login, resultado.usuario.Login);
        }

        //Email Duplicado
        [Fact]
        public void Criarusuario_DeveBloquearEmailDuplicado()
        {
            var login = "teste@gmail.com";

            _repositoryMock.Setup(r => r.EmailExiste(login)).Returns(true);

            var resultado = _service.CriarUsuario("Pedro", login, "Senha@123");

            Assert.False(resultado.sucesso);

            Assert.Equal("Email já cadastrado", resultado.mensagem);
        }

        //Campos Obrigatórios
        [Fact]
        public void CriarUsuario_DeveValidarCamposObrigatorios()
        {
            var resultado = _service.CriarUsuario("", "", "");

            Assert.False(resultado.sucesso);

            Assert.Equal("Todos os campos são obrigatórios", resultado.mensagem);
        }

        //Hash da senha
        [Fact]
        public void Criarusuario_DeveGerarSenhaHash()
        {
            var senha = "Roberte102@";

            _repositoryMock.Setup(r => r.EmailExiste(It.IsAny<string>())).Returns(false);

            var resultado = _service.CriarUsuario("Pedro", "teste@gmail.com", senha);

            Assert.NotNull(resultado.usuario);

            Assert.NotEqual(senha , resultado.usuario.SenhaHash);

            Assert.True(BCrypt.Net.BCrypt.Verify(senha, resultado.usuario.SenhaHash));
        }
    }
}
