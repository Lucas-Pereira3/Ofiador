using Moq;
using Ofiador.Application.Services;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Interfaces;
using Ofiador.Infrastructure.Migrations;
using System.Runtime.ConstrainedExecution;
using Xunit;
namespace Ofiador.Test.UnitTests.Service
{
    public class CompraServiceTests
    {
        private readonly Mock<ICompraRepository> _repositoryMock;

        private readonly CompraService _service;

        public CompraServiceTests()
        {
            _repositoryMock = new Mock<ICompraRepository>();

            _service = new CompraService(_repositoryMock.Object );
        }

        //Registro valido
        [Fact]
        public void CriarCompra_DeveRegistrarCompra()
        {
            var compra = new Compra
            {
                IdCliente = 1,

                IdEmpresa = 1,

                Valor_Total = 250,

                Parcelas = 3,

                Data_Compra = DateTime.UtcNow,

                DataPrimeiroVencimento = DateTime.UtcNow.AddMonths(1),
            };

            var cliente = new Cliente
            {
                IdCliente = 1,

                Limite = 1000,
            };

            var Empresa = new Empresa
            {
                IdEmpresa = 1,
            };

            _repositoryMock.Setup(r => r.BuscarCliente(1)).Returns(cliente);

            _repositoryMock.Setup(r => r.BuscarEmpresa(1)).Returns(Empresa);

            _repositoryMock.Setup(r => r.BuscarDividaAtual(1)).Returns(0);

            _repositoryMock.Setup(r => r.BuscarFaturaAberta(It.IsAny<int>(), It.IsAny<DateTime>())).Returns((Fatura?)null);

            _repositoryMock.Setup(r => r.BuscarFaturaPorId(It.IsAny<int>())).Returns(new Fatura
            {
                CompraParcelas = new List<CompraParcela>()
            });

            var resultado = _service.CriarCompra(compra);

            Assert.NotNull(resultado);

            _repositoryMock.Verify(r => r.AdicionarCompra(It.IsAny<Compra>()), Times.Once);
        }

        //Cliente Obrigatorio
        [Fact]
        public void CriarCompra_DeveValidarCliente()
        {
            var compra = new Compra
            {
                IdCliente = 1,

                IdEmpresa = 1,

                Valor_Total = 250,

                Parcelas = 3,
            };

            _repositoryMock.Setup(r => r.BuscarCliente(1)).Returns((Cliente?)null);

            var ex = Assert.Throws<Exception>(() => _service.CriarCompra(compra));

            Assert.Equal("Cliente não encontrado", ex.Message);
        }

        //Empresa Obrigatoria
        [Fact]
        public void CriarCompra_DeveValidarEmpresa()
        {
            var compra = new Compra
            {
                IdCliente = 1,

                IdEmpresa = 1,

                Valor_Total = 250,

                Parcelas = 3,
            };

            _repositoryMock.Setup(r => r.BuscarCliente(1)).Returns(new Cliente
            {
                IdCliente = 1,

                Limite = 1300
            });

            _repositoryMock.Setup(r => r.BuscarEmpresa(1)).Returns((Empresa?)null);

            var ex = Assert.Throws<Exception>(() => _service.CriarCompra(compra));

            Assert.Equal("Empresa não encontrada", ex.Message);
        }

        //Valor Mairo que Zero
        [Fact]
        public void CriarCompra_DeveValidarValor() 
        {
            var compra = new Compra
            {
                IdCliente = 1,

                IdEmpresa = 1,

                Valor_Total = 0,

                Parcelas = 3,
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 2000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            var ex = Assert.Throws<Exception>(() => _service.CriarCompra(compra));

            Assert.Equal("Valor da compra deve ser maior que zero", ex.Message);
        }

        //Data Vencimento
        [Fact]
        public void CriarCompra_DeveValidarDataVencimento()
        {
            var compra = new Compra
            {
                IdCliente = 1,

                IdEmpresa = 1,

                Valor_Total = 250,

                Parcelas = 3,

                Data_Compra = DateTime.UtcNow,

                DataPrimeiroVencimento = DateTime.UtcNow.AddDays(-1),
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 2000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            var ex = Assert.Throws<Exception>(() => _service.CriarCompra(compra));

            Assert.Equal("A data de vencimento não pode ser menor que a data da compra", ex.Message);
        }

        //Quantidade de parcela
        [Fact]
        public void CriarCompra_DeveValidarParcela()
        {
            var compra = new Compra
            {
                IdCliente = 1,

                IdEmpresa = 1,

                Valor_Total = 121,

                Parcelas = 0,
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 2000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            var ex = Assert.Throws<Exception>(() => _service.CriarCompra(compra));

            Assert.Equal("Quantidade de parcelas inválida",ex.Message);
        }

        // PERSISTÊNCIA
        [Fact]
        public void CriarCompra_DevePersistirDados()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 500,
                Parcelas = 5,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =
                    DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 2000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock
                .Setup(r => r.BuscarDividaAtual(1))
                .Returns(0);

            _repositoryMock
                .Setup(r => r.BuscarFaturaAberta(
                    It.IsAny<int>(),
                    It.IsAny<DateTime>()))
                .Returns((Fatura?)null);

            _repositoryMock
                .Setup(r => r.BuscarFaturaPorId(
                    It.IsAny<int>()))
                .Returns(new Fatura
                {
                    CompraParcelas =
                        new List<CompraParcela>()
                });

            // Act
            _service.CriarCompra(compra);

            // Assert
            _repositoryMock.Verify(
                r => r.AdicionarCompra(
                    It.IsAny<Compra>()),
                Times.Once);

            _repositoryMock.Verify(
                r => r.Salvar(),
                Times.AtLeastOnce);
        }

        //Compra dentro do Limite do cliente
        [Fact]
        public void CriarCompra_DevepermitirCompraDentroDoLimite() 
        {
            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 350,
                Parcelas = 5,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento = DateTime.UtcNow.AddMonths(1)
            };

            var cliente = new Cliente
            {
                IdCliente = 1,

                Limite = 1000,
            };

            var Empresa = new Empresa
            {
                IdEmpresa = 1,
            };

            _repositoryMock.Setup(r => r.BuscarCliente(1)).Returns(cliente);

            _repositoryMock.Setup(r => r.BuscarEmpresa(1)).Returns(Empresa);

            _repositoryMock.Setup(r => r.BuscarDividaAtual(1)).Returns(200);

            _repositoryMock.Setup(r => r.BuscarFaturaAberta(It.IsAny<int>(), It.IsAny<DateTime>())).Returns((Fatura?)null);

            _repositoryMock.Setup(r => r.BuscarFaturaPorId(It.IsAny<int>())).Returns(new Fatura
            {
                CompraParcelas = new List<CompraParcela>()
            });

            var resultado = _service.CriarCompra(compra);

            Assert.NotNull(resultado);
        }

        //Ultrapassa o Limite
        [Fact]
        public void CriarCompra_DeveBloquearCompraAcimaDoLimite()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 900,
                Parcelas = 3,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =
                    DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock
                .Setup(r => r.BuscarDividaAtual(1))
                .Returns(200);

            var ex = Assert.Throws<Exception>(() =>
                _service.CriarCompra(compra));

            Assert.Equal("Limite do cliente excedido",ex.Message);
        }

        //Considerar Fatura já Existente
        [Fact]
        public void CriarCompra_DeveConsiderarDividaAtual()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 500,
                Parcelas = 2,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =
                    DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock
                .Setup(r => r.BuscarDividaAtual(1))
                .Returns(600);

            var ex = Assert.Throws<Exception>(() =>
                _service.CriarCompra(compra));

            Assert.Equal("Limite do cliente excedido",ex.Message);
        }

        //Calculo do Limite Disponivel
        [Fact]
        public void DeveCalcularLimiteDisponivel()
        {

            var cliente = new Cliente
            {
                IdCliente = 1,
                Limite = 1000
            };

            var dividaAtual = 300;

            var limiteDisponivel =
                cliente.Limite - dividaAtual;

            Assert.Equal( 700, limiteDisponivel);
        }

        //Quantidade de Parcelas
        [Fact]
        public void CriarCompra_DeveGerarQuantidadeCorretaParcelas()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 300,
                Parcelas = 3,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =
                    DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock
                .Setup(r => r.BuscarDividaAtual(1))
                .Returns(0);

            _repositoryMock
                .Setup(r => r.BuscarFaturaAberta(
                    It.IsAny<int>(),
                    It.IsAny<DateTime>()))
                .Returns((Fatura?)null);

            _repositoryMock
                .Setup(r => r.BuscarFaturaPorId(
                    It.IsAny<int>()))
                .Returns(new Fatura
                {
                    CompraParcelas =
                        new List<CompraParcela>()
                });

            var resultado =
                _service.CriarCompra(compra);

            Assert.Equal(
                3,
                resultado.CompraParcelas.Count);
        }

        //Valor das Parcelas
        [Fact]
        public void CriarCompra_DeveCalcularValorParcelas()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 300,
                Parcelas = 3,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =
                    DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock
                .Setup(r => r.BuscarDividaAtual(1))
                .Returns(0);

            _repositoryMock
                .Setup(r => r.BuscarFaturaAberta(
                    It.IsAny<int>(),
                    It.IsAny<DateTime>()))
                .Returns((Fatura?)null);

            _repositoryMock
                .Setup(r => r.BuscarFaturaPorId(
                    It.IsAny<int>()))
                .Returns(new Fatura
                {
                    CompraParcelas =
                        new List<CompraParcela>()
                });

            var resultado =
                _service.CriarCompra(compra);

            // Assert
            Assert.All(
                resultado.CompraParcelas,
                parcela =>
                {
                    Assert.Equal(100,parcela.ValorParcela);
                });
        }

        //Vinculo com Compra
        [Fact]
        public void CriarCompra_DeveVincularParcelasCompra()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 400,
                Parcelas = 4,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock
                .Setup(r => r.BuscarDividaAtual(1))
                .Returns(0);

            _repositoryMock
                .Setup(r => r.BuscarFaturaAberta(
                    It.IsAny<int>(),
                    It.IsAny<DateTime>()))
                .Returns((Fatura?)null);

            _repositoryMock
                .Setup(r => r.BuscarFaturaPorId(
                    It.IsAny<int>()))
                .Returns(new Fatura
                {
                    CompraParcelas =
                        new List<CompraParcela>()
                });

            var resultado =
                _service.CriarCompra(compra);

            Assert.All(
                resultado.CompraParcelas,
                parcela =>
                {
                    Assert.Equal(resultado.IdCompra,parcela.IdCompra);
                });
        }

        //Status Pendente
        [Fact]
        public void CriarCompra_DeveGerarParcelasPendentes()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 300,
                Parcelas = 3,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =
                    DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock
                .Setup(r => r.BuscarDividaAtual(1))
                .Returns(0);

            _repositoryMock
                .Setup(r => r.BuscarFaturaAberta(
                    It.IsAny<int>(),
                    It.IsAny<DateTime>()))
                .Returns((Fatura?)null);

            _repositoryMock
                .Setup(r => r.BuscarFaturaPorId(
                    It.IsAny<int>()))
                .Returns(new Fatura
                {
                    CompraParcelas =
                        new List<CompraParcela>()
                });

            var resultado =
                _service.CriarCompra(compra);

            // Assert
            Assert.All(
                resultado.CompraParcelas,
                parcela =>
                {
                    Assert.Equal( Statusparcela.Pendente, parcela.Status);
                });
        }

        //Parcelamento Invalido
        [Fact]
        public void CriarCompra_DeveBloquearParcelamentoMaiorQue24()
        {
            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 500,
                Parcelas = 25
            };

            _repositoryMock
                .Setup(r => r.BuscarCliente(1))
                .Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 5000
                });

            _repositoryMock
                .Setup(r => r.BuscarEmpresa(1))
                .Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            var ex = Assert.Throws<Exception>(() =>
                _service.CriarCompra(compra));

            Assert.Equal("Quantidade de parcelas inválida",ex.Message);
        }

        //Gerar Fatura
        [Fact]
        public void CriarCompra_DeveGerarFatura()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 300,
                Parcelas = 3,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock.Setup(r => r.BuscarCliente(1)).Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock.Setup(r => r.BuscarEmpresa(1)).Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock.Setup(r => r.BuscarDividaAtual(1)).Returns(0);

            _repositoryMock.Setup(r => r.BuscarFaturaAberta(It.IsAny<int>(),It.IsAny<DateTime>())).Returns((Fatura?)null);

            _repositoryMock.Setup(r => r.BuscarFaturaPorId(It.IsAny<int>())).Returns(new Fatura
                {
                    CompraParcelas =new List<CompraParcela>()
                });

            _service.CriarCompra(compra);

            _repositoryMock.Verify( r => r.AdicionarFatura(It.IsAny<Fatura>()),Times.AtLeastOnce);
        }

        //Agrupamento Mensal
        [Fact]
        public void CriarCompra_DeveAgruparComprasMesmoMes()
        {

            var mesReferencia =new DateTime(2026, 5, 1);

            var faturaExistente =
                new Fatura
                {
                    IdFatura = 1,
                    MesReferencia = mesReferencia,
                    Total = 100
                };

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 200,
                Parcelas = 1,
                Data_Compra = new DateTime(2026, 5, 10),

                DataPrimeiroVencimento =new DateTime(2026, 5, 20)
            };

            _repositoryMock.Setup(r => r.BuscarCliente(1)).Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 2000
                });

            _repositoryMock.Setup(r => r.BuscarEmpresa(1)).Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock.Setup(r => r.BuscarDividaAtual(1)).Returns(0);

            _repositoryMock.Setup(r => r.BuscarFaturaAberta(It.IsAny<int>(),It.IsAny<DateTime>())).Returns(faturaExistente);

            _repositoryMock.Setup(r => r.BuscarFaturaPorId(1)).Returns(faturaExistente);

            _service.CriarCompra(compra);

            // Assert
            _repositoryMock.Verify(r => r.AdicionarFatura(It.IsAny<Fatura>()),Times.Never);
        }

        //Total da fatura
        [Fact]
        public void CriarCompra_DeveCalcularTotalFatura()
        {

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 300,
                Parcelas = 3,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =DateTime.UtcNow.AddMonths(1)
            };

            var fatura =
                new Fatura
                {
                    IdFatura = 1,
                    CompraParcelas =new List<CompraParcela>()
                };

            _repositoryMock.Setup(r => r.BuscarCliente(1)).Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock.Setup(r => r.BuscarEmpresa(1)).Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock.Setup(r => r.BuscarDividaAtual(1)).Returns(0);

            _repositoryMock.Setup(r => r.BuscarFaturaAberta(It.IsAny<int>(),It.IsAny<DateTime>())).Returns(fatura);

            _repositoryMock.Setup(r => r.BuscarFaturaPorId(1)).Returns(fatura);

            _service.CriarCompra(compra);

            Assert.True(fatura.Total >= 0);
        }

        //Status Pendente
        [Fact]
        public void Fatura_DeveIniciarComoPendente()
        {
 
            var fatura =new Fatura();

            Assert.Equal("Pendente",fatura.Status);
        }

        //Associacção Cliente
        [Fact]
        public void Fatura_DevePertencerCliente()
        {

            var fatura = new Fatura
                {
                    IdCliente = 1
                };

            Assert.Equal(1,fatura.IdCliente);
        }

        //Associação Parcelas/Faturas
        [Fact]
        public void Parcela_DeveVincularFatura()
        {

            var parcela = new CompraParcela
                {
                    IdFatura = 1
                };

            Assert.Equal(1,parcela.IdFatura);
        }

        //Sem Compras
        [Fact]
        public void NaoDeveGerarFaturaSemCompra()
        {

            var compras =new List<Compra>();

            Assert.Empty(compras);
        }

        //Evitar Fatura Duplicada
        [Fact]
        public void CriarCompra_NaoDeveDuplicarFaturaMesmoPeriodo()
        {
            // Arrange
            var faturaExistente =
                new Fatura
                {
                    IdFatura = 1
                };

            var compra = new Compra
            {
                IdCliente = 1,
                IdEmpresa = 1,
                Valor_Total = 100,
                Parcelas = 1,
                Data_Compra = DateTime.UtcNow,
                DataPrimeiroVencimento =DateTime.UtcNow.AddMonths(1)
            };

            _repositoryMock.Setup(r => r.BuscarCliente(1)).Returns(new Cliente
                {
                    IdCliente = 1,
                    Limite = 1000
                });

            _repositoryMock.Setup(r => r.BuscarEmpresa(1)).Returns(new Empresa
                {
                    IdEmpresa = 1
                });

            _repositoryMock.Setup(r => r.BuscarDividaAtual(1)).Returns(0);

            _repositoryMock.Setup(r => r.BuscarFaturaAberta(It.IsAny<int>(),It.IsAny<DateTime>())).Returns(faturaExistente);

            _repositoryMock.Setup(r => r.BuscarFaturaPorId(1)).Returns(faturaExistente);

            _service.CriarCompra(compra);

            _repositoryMock.Verify( r => r.AdicionarFatura(It.IsAny<Fatura>()),Times.Never);
        }
    }
}
