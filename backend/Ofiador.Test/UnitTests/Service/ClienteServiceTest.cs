using Xunit;
using Moq;
using Ofiador.Application.Services;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Interfaces;

namespace Ofiador.Test.UnitTests.Service
{
    public class ClienteServiceTest
    {
        private readonly Mock<IClienteRepository> _repositoryMock;

        private readonly ClienteService _service;

        public ClienteServiceTest()
        {
            _repositoryMock = new Mock<IClienteRepository>();

            _service = new ClienteService(_repositoryMock.Object );
        }

        //Cadastro valido
        [Fact]
        public void CriarCliente_DeveCadastrarCliente()
        {
            var cliente = new Cliente
            {
                Nome = "Pedro",

                Cpf_Cnpj= "02480763374",

                Email = "teste@gmail.com",

                Telefone = "9633312958",

                Endereco ="Rua das Paçocas",

                Limite = 1000,

                IdEmpresa = 1,
            };

            _repositoryMock.Setup(r => r.DocumentoExiste(cliente.Cpf_Cnpj)).Returns(false);

            _repositoryMock.Setup(r => r.EmailExiste(cliente.Email)).Returns(false);

            _repositoryMock.Setup(r => r.EmpresaExiste(cliente.IdEmpresa)).Returns(true);

            var resultado = _service.CriarCliente(cliente);

            Assert.True(resultado.sucesso);
        }

        //Campos obrigatórios
        [Fact]
        public void CriarCLiente_DeveValidarCamposObrigatorios()
        {
            var cliente = new Cliente();

            var resultado = _service.CriarCliente(cliente);

            Assert.False(resultado.sucesso);
        }

        //Limite Invalido
        [Fact]
        public void CriarCliente_DeveValidarLimite()
        {
            var cliente = new Cliente
            {
                Nome = "Pedro",

                Cpf_Cnpj = "02480763374",

                Email = "teste@gmail.com",

                Telefone = "9633312958",

                Endereco ="Rua das Paçocas",

                Limite = 0,

                IdEmpresa = 1,
            };

            _repositoryMock.Setup( r=> r.EmpresaExiste(1)).Returns(true);

            var resultado= _service.CriarCliente(cliente);

            Assert.False(resultado.sucesso);
        }

        //Empresa Obrigatoria
        [Fact]
        public void CriarCliente_DeveValidarEmpresa()
        {
            var cliente = new Cliente
            {
                Nome = "Pedro",

                Cpf_Cnpj = "02480763374",

                Email = "teste@gmail.com",

                Telefone = "9633312958",

                Endereco = "Rua das Paçocas",

                Limite = 1000,

                IdEmpresa = 1,
            };

            _repositoryMock.Setup(r => r.EmpresaExiste(1)).Returns(false);

            var resultado = _service.CriarCliente(cliente);

            Assert.Equal("Empresa não encontrada", resultado.mensagem);
        }

        //Não deve excluir cliente com fatura
        [Fact]
        public void ExcluirCliente_DeveBloquearClienteComFatura()
        {
            var cliente = new Cliente
            {
                IdCliente = 1,
                Nome = "Pedro"
            };

            _repositoryMock.Setup(r => r.BuscarPorId(1)).Returns(cliente);

            _repositoryMock.Setup(r => r.PossuiFaturaAberta(1)).Returns(true);

            var resultado = _service.ExcluirCLiente(1);

            Assert.False(resultado.sucesso);

            Assert.Equal("Cliente possui faturas aberta(s)", resultado.mensagem);
        }

        //Retornar dívida corretamente
        [Fact]
        public async Task GetDivida_DeveRetornarDividaCorreta()
        {
            
            var cliente = new Cliente
            {
                IdCliente = 1,
                Nome = "Pedro"
            };

            _repositoryMock.Setup(r => r.BuscarPorId(1)).Returns(cliente);

            _repositoryMock.Setup(r => r.GetDivida(1)).ReturnsAsync(500);

            
            var resultado =await _service.GetDivida(1);

           
            Assert.Equal(500,resultado.TotalDivida);
        }

        //Cliente sem dívida
        [Fact]
        public async Task GetDivida_DeveRetornarZeroQuandoNaoExistirDivida()
        {
            
            var cliente = new Cliente
            {
                IdCliente = 1
            };

            _repositoryMock.Setup(r => r.BuscarPorId(1)).Returns(cliente);

            _repositoryMock.Setup(r => r.GetDivida(1)).ReturnsAsync(0);

            var resultado =await _service.GetDivida(1);

            Assert.Equal(0,resultado.TotalDivida);
        }

        //Cliente inexistente
        [Fact]
        public async Task GetDivida_DeveValidarClienteExistente()
        {
            
            _repositoryMock.Setup(r => r.BuscarPorId(1)).Returns((Cliente?)null);

            var ex =await Assert.ThrowsAsync<Exception>(() => _service.GetDivida(1));

            Assert.Equal("Cliente não encontrado",ex.Message);
        }

        //Considerar pagos e pendentes
        [Fact]
        public async Task GetDivida_DeveConsiderarSomenteParcelasPendentes()
        {
           
            var cliente = new Cliente
            {
                IdCliente = 1
            };

            _repositoryMock.Setup(r => r.BuscarPorId(1)).Returns(cliente);

            _repositoryMock.Setup(r => r.GetDivida(1)).ReturnsAsync(500);

            var resultado =await _service.GetDivida(1);

            Assert.Equal(500, resultado.TotalDivida);
        }

        //Consistência financeira
        [Fact]
        public async Task GetDivida_NaoDeveRetornarValorNegativo()
        {
  
            var cliente = new Cliente
            {
                IdCliente = 1
            };

            _repositoryMock.Setup(r => r.BuscarPorId(1)).Returns(cliente);

            _repositoryMock.Setup(r => r.GetDivida(1)).ReturnsAsync(0);

            var resultado =await _service.GetDivida(1);

            Assert.True(resultado.TotalDivida >= 0);
        }
    }
}
