using Moq;
using Ofiador.Application.Services;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Interfaces;

namespace Ofiador.Test.UnitTests.Service
{
    public class RelatorioServiceTests
    {
        private readonly Mock<IRelatorioRepository> _repositoryMock;
        private readonly RelatorioService _service;

        public RelatorioServiceTests()
        {
            _repositoryMock =
                new Mock<IRelatorioRepository>();

            _service =
                new RelatorioService(
                    _repositoryMock.Object);
        }

        //Retornar Total, Pago e Restante corretamente
        [Fact]
        public async Task GetContasReceber_DeveCalcularTotalPagoERestante()
        {
            var cliente = new Cliente
            {
                IdCliente = 1,
                Nome = "Pedro"
            };

            var fatura = new Fatura
            {
                IdCliente = 1,
                Cliente = cliente,
                CompraParcelas =
                [
                        new CompraParcela
                    {
                        ValorParcela = 100,
                        Pago = true
                    },

                    new CompraParcela
                    {
                        ValorParcela = 200,
                        Pago = false
                    }
                ]
            };

            _repositoryMock.Setup(r => r.GetContasReceber(null, null)).ReturnsAsync([fatura]);

            var resultado =await _service.GetContasReceber(null, null);

            Assert.Equal(300, resultado[0].Total);

            Assert.Equal(100, resultado[0].Pago);

            Assert.Equal(200, resultado[0].Restante);
        }

        //Agrupamento por cliente
        [Fact]
        public async Task GetContasReceber_DeveAgruparPorCliente()
        {
            var cliente = new Cliente
            {
                IdCliente = 1,
                Nome = "Pedro"
            };

            var faturas = new List<Fatura>
            {
                new()
                {
                    IdCliente = 1,
                    Cliente = cliente,
                    CompraParcelas =
                    [
                        new CompraParcela
                        {
                            ValorParcela = 100
                        }
                    ]
                },

                new()
                {
                    IdCliente = 1,
                    Cliente = cliente,
                    CompraParcelas =
                    [
                        new CompraParcela
                        {
                            ValorParcela = 200
                        }
                    ]
                }
            };

            _repositoryMock.Setup(r => r.GetContasReceber(null, null)).ReturnsAsync(faturas);

            var resultado =await _service.GetContasReceber(null, null);

            Assert.Single(resultado);

            Assert.Equal("Pedro",resultado[0].Nome);

            Assert.Equal(300,resultado[0].Total);
        }

        //Considerar pagamentos realizados
        [Fact]
        public async Task GetContasReceber_DeveConsiderarParcelasPagas()
        {
            var cliente = new Cliente
            {
                IdCliente = 1,
                Nome = "Pedro"
            };

            var fatura = new Fatura
            {
                IdCliente = 1,
                Cliente = cliente,

                CompraParcelas =
                [
                    new CompraParcela
                    {
                        ValorParcela = 100,
                        Pago = true
                    },

                    new CompraParcela
                    {
                        ValorParcela = 50,
                        Pago = true
                    },

                    new CompraParcela
                    {
                        ValorParcela = 200,
                        Pago = false
                    }
                ]
            };

            _repositoryMock.Setup(r => r.GetContasReceber(null, null)).ReturnsAsync([fatura]);

            var resultado =await _service.GetContasReceber(null, null);

            Assert.Equal(150,resultado[0].Pago);
        }

        //Cenário sem registros
        [Fact]
        public async Task GetContasReceber_DeveRetornarListaVazia()
        {
            _repositoryMock.Setup(r => r.GetContasReceber(null, null)).ReturnsAsync([]);

            var resultado =await _service.GetContasReceber(null, null);

            Assert.Empty(resultado);
        }

        //Consistência dos dados
        [Fact]
        public async Task GetContasReceber_DeveManterConsistenciaDosValores()
        {
            var cliente = new Cliente
            {
                IdCliente = 1,
                Nome = "Pedro"
            };

            var fatura = new Fatura
            {
                IdCliente = 1,
                Cliente = cliente,

                CompraParcelas =
                [
                    new CompraParcela
                    {
                        ValorParcela = 100,
                        Pago = true
                    },

                    new CompraParcela
                    {
                        ValorParcela = 300,
                        Pago = false
                    }
                ]
            };

            _repositoryMock.Setup(r => r.GetContasReceber(null, null)).ReturnsAsync([fatura]);

            var resultado =await _service.GetContasReceber(null, null);

            var item = resultado.First();

            Assert.Equal(item.Total,item.Pago + item.Restante);
        }

        //Validar período
        [Fact]
        public async Task GetContasReceber_DeveValidarPeriodo()
        {
            var ex =await Assert.ThrowsAsync<Exception>(
                    () => _service.GetContasReceber(
                        new DateTime(2025, 12, 31),
                        new DateTime(2025, 1, 1)));

            Assert.Equal("Data inicial não pode ser maior que a data final",ex.Message);
        }

        //Retornar registros dentro do período
        [Fact]
        public async Task GetContasReceber_DeveRetornarRegistrosDentroDoPeriodo()
        {
            var dataInicial = new DateTime(2025, 1, 1);
            var dataFinal = new DateTime(2025, 1, 31);

            var faturas = new List<Fatura>
            {
                new()
                {
                    DataGeracao = new DateTime(2025, 1, 15),
                    Cliente = new Cliente
                    {
                        IdCliente = 1,
                        Nome = "Pedro"
                    },
                    CompraParcelas = []
                }
            };

            _repositoryMock.Setup(r => r.GetContasReceber(dataInicial,dataFinal)).ReturnsAsync(faturas);

            var resultado =await _service.GetContasReceber(dataInicial,dataFinal);

            Assert.Single(resultado);
        }

        //Excluir registros fora do período
        [Fact]
        public async Task GetContasReceber_NaoDeveRetornarRegistrosForaDoPeriodo()
        {
            _repositoryMock.Setup(r => r.GetContasReceber(It.IsAny<DateTime?>(),It.IsAny<DateTime?>())).ReturnsAsync([]);

            var resultado =await _service.GetContasReceber(new DateTime(2025, 1, 1),new DateTime(2025, 1, 31));

            Assert.Empty(resultado);
        }

        //Intervalo sem resultados
        [Fact]
        public async Task GetContasReceber_DeveRetornarListaVaziaQuandoNaoExistiremRegistros()
        {
            _repositoryMock.Setup(r => r.GetContasReceber(It.IsAny<DateTime?>(),It.IsAny<DateTime?>())).ReturnsAsync([]);

            var resultado =await _service.GetContasReceber(new DateTime(2030, 1, 1),new DateTime(2030, 1, 31));

            Assert.Empty(resultado);
        }

        //Intervalo inválido
        [Fact]
        public async Task GetContasReceber_DeveValidarPeriodoInvalido()
        {
            var ex =await Assert.ThrowsAsync<Exception>(() => 
                        _service.GetContasReceber(
                        new DateTime(2025, 12, 31),
                        new DateTime(2025, 1, 1)));

            Assert.Equal("Data inicial não pode ser maior que a data final",ex.Message);
        }

        //Inclusão da data inicial e final
        [Fact]
        public async Task GetContasReceber_DeveConsiderarDatasLimite()
        {
            var dataInicial =new DateTime(2025, 1, 1);

            var dataFinal =new DateTime(2025, 1, 31);

            var faturas = new List<Fatura>
            {
                new()
                {
                    DataGeracao = dataInicial,
                    Cliente = new Cliente
                    {
                        IdCliente = 1,
                        Nome = "Pedro"
                    },
                    CompraParcelas = []
                },

                new()
                {
                    DataGeracao = dataFinal,
                    Cliente = new Cliente
                    {
                        IdCliente = 2,
                        Nome = "Maria"
                    },
                    CompraParcelas = []
                }
            };

            _repositoryMock.Setup(r => r.GetContasReceber(dataInicial,dataFinal)).ReturnsAsync(faturas);

            var resultado =await _service.GetContasReceber(dataInicial,dataFinal);

            Assert.Equal(2,resultado.Count);
        }
    }
}
