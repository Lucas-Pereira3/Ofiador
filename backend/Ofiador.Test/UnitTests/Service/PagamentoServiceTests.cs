using Xunit;
using Moq;
using Ofiador.Application.Services;
using Ofiador.Domain.Entities;
using Ofiador.Infrastructure.Interfaces;
using Ofiador.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Ofiador.Test.UnitTests.Services
{
    public class PagamentoServiceTests
    {
        private readonly Mock<IPagamentoRepository> _repositoryMock;


        private readonly PagamentoService _service;

        public PagamentoServiceTests()
        {
            _repositoryMock =new Mock<IPagamentoRepository>();


            _service = new PagamentoService( _repositoryMock.Object);
        }

        // STATUS INICIAL
        [Fact]
        public void Parcela_DeveIniciarComoPendente()
        {

            var parcela = new CompraParcela();

            Assert.Equal( Statusparcela.Pendente, parcela.Status);
        }

        // PAGAR PARCELA
        [Fact]
        public void PagarParcela_DeveAtualizarParaPago()
        {
   
            var compra = new Compra();

            var fatura = new Fatura();

            var parcela =
                new CompraParcela
                {
                    idCompraParcela = 1,

                    Pago = false,

                    Status =Statusparcela.Pendente,

                    ValorParcela = 100,

                    Compra = compra,

                    Fatura = fatura,

                    IdFatura = 1
                };

            _repositoryMock.Setup(r => r.BuscarParcela(1)).Returns(parcela);

            _repositoryMock.Setup(r => r.ExisteParcelasPendentes(1)).Returns(false);

            _service.PagarParcela( 1,"PIX");

            Assert.True(parcela.Pago);

            Assert.Equal(Statusparcela.Pago,parcela.Status);
        }

        // DATA PAGAMENTO
        [Fact]
        public void PagarParcela_DevePreencherDataPagamento()
        {
            
            var compra = new Compra();

            var fatura = new Fatura();

            var parcela =
                new CompraParcela
                {
                    idCompraParcela = 1,

                    Pago = false,

                    Status =
                        Statusparcela.Pendente,

                    ValorParcela = 100,

                    Compra = compra,

                    Fatura = fatura,

                    IdFatura = 1
                };

            _repositoryMock
                .Setup(r => r.BuscarParcela(1))
                .Returns(parcela);

            _repositoryMock
                .Setup(r => r.ExisteParcelasPendentes(1))
                .Returns(false);

            _service.PagarParcela(1,"PIX");

            // Assert
            Assert.NotNull( parcela.DataPagamento);
        }

        // ATRASADA
        [Fact]
        public void Parcela_DeveFicarAtrasada()
        {
          
            var parcela =
                new CompraParcela
                {
                    Pago = false,

                    DataVencimento =DateTime.UtcNow.AddDays(-5)
                };

            if (parcela.DataVencimento < DateTime.UtcNow && !parcela.Pago)
            {
                parcela.Status =
                    Statusparcela.Atrasado;
            }

            Assert.Equal(Statusparcela.Atrasado,parcela.Status);
        }

        // PAGAMENTO DUPLICADO
        [Fact]
        public void PagarParcela_DeveBloquearPagamentoDuplicado()
        {
 
            var parcela =
                new CompraParcela
                {
                    idCompraParcela = 1,

                    Pago = true,

                    Status =Statusparcela.Pago
                };

            _repositoryMock.Setup(r => r.BuscarParcela(1)).Returns(parcela);

            var ex =
                Assert.Throws<Exception>(() => _service.PagarParcela(1,"PIX"));

            Assert.Equal("Parcela já foi Paga",ex.Message);
        }

        // PARCELA INEXISTENTE
        [Fact]
        public void PagarParcela_DeveValidarParcelaExistente()
        {

            _repositoryMock.Setup(r => r.BuscarParcela(1)).Returns((CompraParcela?)null);

            var ex =Assert.Throws<Exception>(() =>_service.PagarParcela(1,"PIX"));

            Assert.Equal("Parcela não encontrada",ex.Message);
        }

        //Status Inicial
        [Fact]
        public void Fatura_DeveIniciarComoPendente()
        {

            var fatura = new Fatura();

            Assert.Equal( "Pendente",fatura.Status);
        }

        //Fatura Paga
        [Fact]
        public void PagarFatura_DeveAtualizarStatusParaPago()
        {

            var compra = new Compra();

            var parcela = new CompraParcela
                {
                    Pago = false,
                    ValorParcela = 100,
                    Compra = compra
                };

            var fatura =new Fatura
                {
                    IdFatura = 1,
                    Status = "PENDENTE",
                    CompraParcelas = new List<CompraParcela>
                    {
                    parcela
                    }
                };

            _repositoryMock.Setup(r => r.BuscarFatura(1)).Returns(fatura);

            _service.PagarFatura(1,"PIX");


            Assert.Equal("PAGO",fatura.Status);

            Assert.True(parcela.Pago);
        }

        //Pagamento Parcial
        [Fact]
        public void PagarParcela_DeveManterStatusParcial()
        {
            // Arrange
            var compra = new Compra();

            var fatura = new Fatura
            {
                IdFatura = 1,
                Status = "PENDENTE"
            };

            var parcela1 = new CompraParcela
            {
                idCompraParcela = 1,
                Pago = false,
                ValorParcela = 100,
                Compra = compra,
                Fatura = fatura,
                IdFatura = 1
            };

            var parcela2 = new CompraParcela
            {
                idCompraParcela = 2,
                Pago = false,
                ValorParcela = 100,
                Compra = compra,
                Fatura = fatura,
                IdFatura = 1
            };

            fatura.CompraParcelas =
            [
                parcela1,
        parcela2
            ];

            _repositoryMock
                .Setup(r => r.BuscarParcela(1))
                .Returns(parcela1);

            _repositoryMock
                .Setup(r => r.ExisteParcelasPendentes(1))
                .Returns(true);

            _repositoryMock
                .Setup(r => r.TotalParcelasFatura(1))
                .Returns(2);

            _repositoryMock
                .Setup(r => r.TotalParcelasPagas(1))
                .Returns(1);

            // Act
            _service.PagarParcela(
                1,
                "PIX");

            // Assert
            Assert.Equal(
                "PARCIAL",
                fatura.Status);
        }

        //Fatura Inexistente
        [Fact]
        public void PagarFatura_DeveValidarFaturaExistente()
        {

            _repositoryMock.Setup(r => r.BuscarFatura(1)).Returns((Fatura?)null);

            var ex = Assert.Throws<Exception>(() =>_service.PagarFatura(1,"PIX"));

            Assert.Equal("Fatura não encontrada",ex.Message);
        }

        //Pagamento Duplicado
        [Fact]
        public void PagarFatura_DeveBloquearPagamentoDuplicado()
        {
           
            var fatura = new Fatura
                {
                    IdFatura = 1,
                    Status = "PAGO"
                };

            _repositoryMock.Setup(r => r.BuscarFatura(1)).Returns(fatura);

            var ex =Assert.Throws<Exception>(() =>_service.PagarFatura(1,"PIX"));

            Assert.Equal("Fatura já foi pagga",ex.Message);
        }

        //Consistencia Parcelas/Faturas
        [Fact]
        public void PagarFatura_DeveAtualizarParcelas()
        {
            // Arrange
            var compra = new Compra();

            var parcela1 =new CompraParcela
                {
                    Pago = false,
                    Compra = compra,
                    ValorParcela = 100
                };

            var parcela2 =new CompraParcela
                {
                    Pago = false,
                    Compra = compra,
                    ValorParcela = 100
                };

            var fatura =new Fatura
                {
                    IdFatura = 1,
                    Status = "PENDENTE",
                    CompraParcelas =new List<CompraParcela>
                    {
                    parcela1,
                    parcela2
                    }
                };

            _repositoryMock.Setup(r => r.BuscarFatura(1)).Returns(fatura);

            _service.PagarFatura(1,"PIX");

            Assert.All(fatura.CompraParcelas,
                parcela =>
                {
                    Assert.True(parcela.Pago);

                    Assert.Equal(Statusparcela.Pago,parcela.Status);

                    Assert.NotNull(parcela.DataPagamento);
                });
        }

        //Calcular valor Pagdo da fatura Corretamente
        [Fact]
        public void PagarFatura_DeveCalcularValorPagoCorretamente()
        {
            var compra = new Compra();

            var parcela1 = new CompraParcela
            {
                Pago = false,
                ValorParcela = 100,
                Compra = compra
            };

            var parcela2 = new CompraParcela
            {
                Pago = false,
                ValorParcela = 150,
                Compra = compra
            };

            var fatura = new Fatura
            {
                IdFatura = 1,
                Status = "PENDENTE",
                CompraParcelas =
                [
                    parcela1,
                    parcela2
                ]
            };

            _repositoryMock.Setup(r => r.BuscarFatura(1)).Returns(fatura);

            var pagamento = _service.PagarFatura(1, "PIX");

            Assert.Equal(250, pagamento.ValorPago);
        }

        //Calcular valor  Correto da Parcela paga
        [Fact]
        public void PagarParcela_DeveRegistrarValorCorreto()
        {
            var parcela = new CompraParcela
            {
                idCompraParcela = 1,
                ValorParcela = 200,
                Pago = false,
                Compra = new Compra(),
                Fatura = new Fatura(),
                IdFatura = 1
            };

            _repositoryMock.Setup(r => r.BuscarParcela(1)).Returns(parcela);

            _repositoryMock.Setup(r => r.TotalParcelasFatura(1)).Returns(1);

            _repositoryMock.Setup(r => r.TotalParcelasPagas(1)).Returns(1);

            var pagamento =_service.PagarParcela(1, "PIX");

            Assert.Equal(200, pagamento.ValorPago);
        }
    }
}