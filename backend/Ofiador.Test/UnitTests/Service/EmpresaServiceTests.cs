using Xunit;
using Moq;
using Ofiador.Application.Services;
using Ofiador.Infrastructure.Interfaces;
using Ofiador.Domain.Entities;

namespace Ofiador.Test.UnitTests.Service
{
    public class EmpresaServiceTests
    {
        private readonly Mock<IEmpresaRepository> _repositoryMock;

        private readonly EmpresaService _service;

        public EmpresaServiceTests()
        {
            _repositoryMock = new Mock<IEmpresaRepository>();

            _service = new EmpresaService( _repositoryMock.Object );
        }

        //Cadastro válido
        [Fact]
        public void CriarEmpresa_DeveCadastrarEmpresa()
        {
            var empresa = new Empresa
            {
                Nome = "Empresa teste",

                Cnpj = "12345678000195",

                Telefone = "11999999999",

                Email = "Empresa@gmail.com",

                Endereco = "rua das paçocas"
            };

            _repositoryMock.Setup(r => r.CnpjExiste(empresa.Cnpj)).Returns(false);

            _repositoryMock.Setup(r => r.EmailExiste(empresa.Email!)).Returns(false);

            var resultado = _service.CriarEmpresa(empresa);

            Assert.True(resultado.sucesso);
        }

        //Campos Obrigatórios
        [Fact]
        public void CriarEmpresa_DeveValidarCamposObrigatorios()
        {
            var empresa = new Empresa
            {
                Nome = "",

                Cnpj = "",

                Telefone = "",

                Email = "",

                Endereco = ""
            };

            var resultado = _service.CriarEmpresa(empresa);

            Assert.False(resultado.sucesso);
        }

        //Cnpj Invalido
        [Fact]
        public void CriarEmpresa_DeveValidarCnpj()
        {
            var empresa = new Empresa
            {
                Nome = "Empresa teste",

                Cnpj = "123",

                Telefone = "11999999999",

                Email = "Empresa@gmail.com",

                Endereco = "rua das paçocas"
            };

            var resultado = _service.CriarEmpresa(empresa);

            Assert.False(resultado.sucesso);

            Assert.Equal("CNPJ inválido", resultado.mensagem);
        }

        //Cnpj Duplicado
        [Fact]
        public void CriarEmpresa_DeveBloquearCnpjDuplicado()
        {
            var empresa = new Empresa
            {
                Nome = "Empresa teste",

                Cnpj = "12345678000195",

                Telefone = "11999999999",

                Email = "Empresa@gmail.com",

                Endereco = "rua das paçocas"
            };

            _repositoryMock.Setup(r => r.CnpjExiste(empresa.Cnpj)).Returns(true);

            var resultado = _service.CriarEmpresa(empresa);

            Assert.Equal("já existe uma empresa com esse Cnpj", resultado.mensagem);
        }

        //Telefone Obrigatório
        [Fact]
        public void CriarEmpresa_DeveValidarTelefoneObrigatório()
        {
            var empresa = new Empresa
            {
                Nome = "Empresa teste",

                Cnpj = "12345678000195",

                Telefone = "",

                Email = "Empresa@gmail.com",

                Endereco = "rua das paçocas"
            };

            var resultado = _service.CriarEmpresa(empresa);

            Assert.Equal("Telefone é obrigatório", resultado.mensagem);
        }
    }
}
