import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";

// Componente de Badge de Status
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case "pago":
      case "paid":
        return { text: "Pago", color: "#108243", bg: "rgba(16, 130, 67, 0.1)" };
      case "pendente":
      case "pending":
        return {
          text: "Pendente",
          color: "#CFC01A",
          bg: "rgba(207, 192, 26, 0.1)",
        };
      case "parcial":
        return {
          text: "Parcial",
          color: "#E97C07",
          bg: "rgba(233, 124, 7, 0.1)",
        };
      default:
        return {
          text: status || "Desconhecido",
          color: "#6B7280",
          bg: "rgba(107, 114, 128, 0.1)",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      {config.text}
    </span>
  );
};

// Modal de confirmação de pagamento
const ConfirmarPagamentoModal = ({
  isOpen,
  onClose,
  onConfirm,
  pagamentoData,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold" style={{ color: "#1A2B4C" }}>
            Confirmar Pagamento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-yellow-700">Atenção!</p>
            <p className="text-sm text-gray-600 mt-1">
              Esta ação não poderá ser desfeita.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <strong>Cliente:</strong> {pagamentoData?.cliente}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Fatura:</strong> #{pagamentoData?.faturaId}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Valor:</strong> {pagamentoData?.valor}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Data:</strong> {pagamentoData?.data}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">
              Deseja confirmar o pagamento desta fatura?
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Confirmar Pagamento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal de detalhes da fatura (versão melhorada com botão de pagamento)
const DetalhesFaturaModal = ({ fatura, isOpen, onClose, onStatusUpdate }) => {
  const [pagando, setPagando] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [faturaAtualizada, setFaturaAtualizada] = useState(fatura);

  useEffect(() => {
    setFaturaAtualizada(fatura);
  }, [fatura]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    if (typeof date === "string" && date.includes("T")) {
      const [ano, mes, dia] = date.split("T")[0].split("-");
      return `${dia}/${mes}/${ano}`;
    }
    if (typeof date === "string" && date.includes("-")) {
      const [ano, mes, dia] = date.split("-");
      return `${dia}/${mes}/${ano}`;
    }
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const handleAbrirConfirmacao = () => {
    setShowConfirmModal(true);
  };

  const handlePagarFatura = async () => {
    setPagando(true);
    try {
      // Chamar API para pagar fatura
      await api.post("/pagamentos/fatura", {
        idFatura: faturaAtualizada.idFatura,
        metodoPagamento: "pix",
      });

      toast.success("Fatura paga com sucesso!");

      // Atualizar estado local
      const faturaAtualizadaObj = { ...faturaAtualizada, status: "PAGO" };
      setFaturaAtualizada(faturaAtualizadaObj);
      onStatusUpdate(faturaAtualizada.idFatura, "PAGO");

      setShowConfirmModal(false);
    } catch (error) {
      console.error("Erro ao pagar fatura:", error);
      toast.error(error.response?.data?.erro || "Erro ao pagar fatura");
    } finally {
      setPagando(false);
    }
  };

  if (!isOpen) return null;

  const isPaga = faturaAtualizada?.status?.toLowerCase() === "pago";

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-bold" style={{ color: "#1A2B4C" }}>
              Detalhes da Fatura Nº {faturaAtualizada?.idFatura}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações da Fatura */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </label>
                  <p className="mt-1 font-medium text-gray-900">
                    {faturaAtualizada?.cliente?.nome || "-"}
                  </p>
                  <p className="text-sm text-gray-500">
                    CPF: {faturaAtualizada?.cliente?.cpf_Cnpj || "-"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">
                    Status
                  </label>
                  <div className="mt-1">
                    <StatusBadge status={faturaAtualizada?.status} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">
                    Data de Emissão
                  </label>
                  <p className="mt-1 text-gray-900">
                    {formatDate(faturaAtualizada?.dataGeracao)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">
                    Vencimento
                  </label>
                  <p className="mt-1 text-gray-900">
                    {formatDate(faturaAtualizada?.vencimento)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">
                    Mês Referência
                  </label>
                  <p className="mt-1 text-gray-900">
                    {formatDate(faturaAtualizada?.mesReferencia)}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">
                    Valor Total
                  </label>
                  <p
                    className="mt-1 text-2xl font-bold"
                    style={{ color: "#1A2B4C" }}
                  >
                    {formatCurrency(faturaAtualizada?.total)}
                  </p>
                </div>
              </div>
            </div>

            {/* Parcelas */}
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "#1A2B4C" }}
              >
                Resumo das Parcelas
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Parcela
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Data Compra
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Valor
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {faturaAtualizada?.compraParcelas?.map((parcela) => (
                      <tr
                        key={parcela.idCompraParcela}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-2 text-sm">
                          {parcela.numeroParcela}/{parcela.compra?.parcelas}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {formatDate(parcela.compra?.data_Compra)}
                        </td>
                        <td className="px-4 py-2 text-sm font-medium">
                          {formatCurrency(parcela.valorParcela)}
                        </td>
                        <td className="px-4 py-2">
                          <StatusBadge status={parcela.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Situação do Cliente */}
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "#1A2B4C" }}
              >
                Situação do Cliente
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Limite Total</p>
                  <p
                    className="text-lg font-bold mt-1"
                    style={{ color: "#1A2B4C" }}
                  >
                    {formatCurrency(faturaAtualizada?.cliente?.limiteTotal)}
                  </p>
                </div>

                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Utilizado</p>
                  <p className="text-lg font-bold mt-1 text-red-600">
                    {formatCurrency(faturaAtualizada?.cliente?.limiteUtilizado)}
                  </p>
                </div>

                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Disponível</p>
                  <p className="text-lg font-bold mt-1 text-green-600">
                    {formatCurrency(
                      faturaAtualizada?.cliente?.limiteDisponivel
                    )}
                  </p>
                </div>

                <div className="bg-gray-50 border rounded-lg p-3">
                  <p className="text-xs text-gray-500">Em Aberto</p>
                  <p
                    className="text-lg font-bold mt-1"
                    style={{ color: "#1A2B4C" }}
                  >
                    {faturaAtualizada?.cliente?.comprasEmAberto || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Fechar
              </button>
              {!isPaga && (
                <button
                  onClick={handleAbrirConfirmacao}
                  disabled={pagando}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Marcar como Paga
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação */}
      <ConfirmarPagamentoModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handlePagarFatura}
        loading={pagando}
        pagamentoData={{
          cliente: faturaAtualizada?.cliente?.nome,
          faturaId: faturaAtualizada?.idFatura,
          valor: formatCurrency(faturaAtualizada?.total),
          data: new Date().toLocaleDateString("pt-BR"),
        }}
      />
    </>
  );
};

// Componente de Paginação
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + 4);

      if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            currentPage === page
              ? "bg-[#1A2B4C] text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

// Componente Principal de Pagamentos
const Pagamentos = () => {
  const [faturas, setFaturas] = useState([]);
  const [faturasPendentes, setFaturasPendentes] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [faturaSelecionada, setFaturaSelecionada] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Form state
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [faturaSelecionadaForm, setFaturaSelecionadaForm] = useState(null);
  const [parcelaSelecionada, setParcelaSelecionada] = useState("todas");
  const [valorPago, setValorPago] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("dinheiro");
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFaturas();
    loadClientes();
    loadPagamentos();
  }, []);

  const loadFaturas = async () => {
    try {
      const response = await api.get("/faturas");
      setFaturas(response.data);

      // Filtrar faturas pendentes (não pagas)
      const pendentes = response.data.filter(
        (f) => f.status?.toLowerCase() !== "pago"
      );
      setFaturasPendentes(pendentes);
    } catch (error) {
      console.error("Erro ao carregar faturas:", error);
      toast.error("Erro ao carregar faturas");
    }
  };

  const loadClientes = async () => {
    try {
      const response = await api.get("/cliente");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes");
    }
  };

  const loadPagamentos = async () => {
    setLoadingHistorico(true);
    try {
      const response = await api.get("/pagamentos");
      setPagamentos(response.data);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
      toast.error("Erro ao carregar histórico de pagamentos");
    } finally {
      setLoadingHistorico(false);
    }
  };

  const handleVerDetalhes = async (fatura) => {
    try {
      const response = await api.get(`/faturas/${fatura.idFatura}`);
      setFaturaSelecionada(response.data);
      setShowDetalhesModal(true);
    } catch (error) {
      console.error("Erro ao buscar detalhes da fatura", error);
      toast.error("Erro ao carregar detalhes da fatura");
    }
  };

  const handleStatusUpdate = (id, novoStatus) => {
    setFaturas(
      faturas.map((f) => (f.idFatura === id ? { ...f, status: novoStatus } : f))
    );
    setFaturasPendentes(faturasPendentes.filter((f) => f.idFatura !== id));
    if (faturaSelecionada?.idFatura === id) {
      setFaturaSelecionada({ ...faturaSelecionada, status: novoStatus });
    }
  };

  const handleClienteChange = (selectedOption) => {
    if (selectedOption) {
      const cliente = clientes.find(
        (c) => c.idCliente === selectedOption.value
      );
      setClienteSelecionado(cliente);
      setFaturaSelecionadaForm(null);
      setParcelaSelecionada("todas");
      setValorPago("");
    } else {
      setClienteSelecionado(null);
      setFaturaSelecionadaForm(null);
    }
  };

  const handleFaturaChange = async (selectedOption) => {
    if (selectedOption) {
      try {
        const response = await api.get(`/faturas/${selectedOption.value}`);

        const fatura = response.data;

        setFaturaSelecionadaForm(fatura);

        setParcelaSelecionada("todas");

        setValorPago(fatura.total.toString());
      } catch (error) {
        console.error("Erro ao buscar fatura:", error);

        toast.error("Erro ao carregar parcelas");
      }
    } else {
      setFaturaSelecionadaForm(null);

      setValorPago("");
    }
  };

  const handleParcelaChange = (parcela) => {
    setParcelaSelecionada(parcela);

    if (parcela === "todas" && faturaSelecionadaForm) {
      setValorPago(faturaSelecionadaForm.total.toString());
    } else if (parcela !== "todas" && faturaSelecionadaForm?.compraParcelas) {
      const parcelaData = faturaSelecionadaForm?.compraParcelas?.find(
        (p) => p.idCompraParcela.toString() === parcela
      );
      if (parcelaData) {
        setValorPago(parcelaData.valorParcela.toString());
      }
    }
  };

  const getParcelasOptions = () => {
    console.log(faturaSelecionadaForm?.compraParcelas);

    const options = [
      {
        value: "todas",
        label: "Todas",
      },
    ];

    if (!faturaSelecionadaForm?.compraParcelas) return options;

    faturaSelecionadaForm?.compraParcelas?.forEach((parcela) => {
      console.log("PARCELA:", parcela);

      const status = parcela.status?.toString().toLowerCase();
      if (status === "pendente" || status === 1) {
        options.push({
          value: parcela.idCompraParcela.toString(),

          label:
            `${parcela.numeroParcela}/` + `${parcela.compra?.parcelas || "-"}`,
        });
      }
    });
    return options;
  };

  const handleAbrirConfirmacao = () => {
    if (!clienteSelecionado) {
      toast.error("Selecione um cliente");
      return;
    }

    if (!faturaSelecionadaForm) {
      toast.error("Selecione uma fatura");
      return;
    }

    setConfirmData({
      cliente: clienteSelecionado.nome,
      faturaId: faturaSelecionadaForm.idFatura,
      valor: formatCurrency(parseFloat(valorPago)),
      data: new Date(dataPagamento).toLocaleDateString("pt-BR"),
      descricao:
        parcelaSelecionada === "todas"
          ? `Pagamento total da fatura #${faturaSelecionadaForm.idFatura}`
          : `Pagamento da ${parcelaSelecionada}/${faturaSelecionadaForm.parcelas}ª parcela da fatura #${faturaSelecionadaForm.idFatura}`,
    });

    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    console.log(parcelaSelecionada);
    setSubmitting(true);

    try {
      // Se for pagamento de parcela específica
      if (
        parcelaSelecionada !== "todas" &&
        faturaSelecionadaForm?.compraParcelas
      ) {
        const parcela = faturaSelecionadaForm?.compraParcelas.find(
          (p) => p.idCompraParcela.toString() === parcelaSelecionada
        );

        if (!parcela) {
          throw new Error("Parcela não encontrada");
        }

        // Chamar API para pagar parcela específica
        await api.post("/pagamentos/parcela", {
          idParcela: parseInt(parcelaSelecionada),
          metodoPagamento,
        });

        toast.success("Pagamento registrado com sucesso!");
      } else {
        // Pagamento total da fatura
        await api.post("/pagamentos/fatura", {
          idFatura: faturaSelecionadaForm.idFatura,
          metodoPagamento,
        });
        toast.success("Fatura paga com sucesso!");
      }

      // Recarregar dados
      await loadFaturas();
      await loadPagamentos();
      await loadClientes();

      // Limpar formulário
      setClienteSelecionado(null);
      setFaturaSelecionadaForm(null);
      setParcelaSelecionada("todas");
      setValorPago("");
      setMetodoPagamento("dinheiro");
      setDataPagamento(new Date().toISOString().split("T")[0]);

      setShowConfirmModal(false);
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast.error(error.response?.data?.erro || "Erro ao registrar pagamento");
    } finally {
      setSubmitting(false);
    }
  };

  const getMetodoLabel = (metodo) => {
    const metodos = {
      dinheiro: "Dinheiro",
      cartao_credito: "Cartão de Crédito",
      cartao_debito: "Cartão de Débito",
      pix: "PIX",
      boleto: "Boleto",
      transferencia: "Transferência",
    };
    return metodos[metodo] || metodo;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      const dataObj = new Date(date);
      if (isNaN(dataObj.getTime())) return "-";
      return dataObj.toLocaleDateString("pt-BR");
    } catch (error) {
      return "-";
    }
  };

  // Paginação do histórico
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPagamentos = pagamentos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pagamentos.length / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1A2B4C" }}>
          Registro de Pagamento
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Confirme os pagamentos recebidos dos clientes
        </p>
      </div>

      {/* Formulário de Pagamento */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold" style={{ color: "#1A2B4C" }}>
            Novo Pagamento
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <Select
                options={clientes
                  .filter((cli) => {
                    // sem pesquisa → mostra só 6
                    if (!inputValue) return true;

                    return `${cli.nome} - ${cli.cpf_Cnpj}`
                      .toLowerCase()
                      .includes(inputValue.toLowerCase());
                  })
                  .slice(0, inputValue ? clientes.length : 6)
                  .map((cli) => ({
                    value: cli.idCliente,
                    label: `${cli.nome} - ${cli.cpf_Cnpj}`,
                  }))}
                value={
                  clienteSelecionado
                    ? {
                        value: clienteSelecionado.idCliente,
                        label: `${clienteSelecionado.nome} - ${clienteSelecionado.cpf_Cnpj}`,
                      }
                    : null
                }
                onChange={handleClienteChange}
                onInputChange={(value) => setInputValue(value)}
                placeholder="Pesquisar cliente..."
                noOptionsMessage={() => "Nenhum cliente encontrado"}
                isClearable
                menuPlacement="auto"
              />
            </div>

            {/* Fatura */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fatura *
              </label>
              <Select
                options={faturasPendentes
                  .filter(
                    (f) =>
                      !clienteSelecionado ||
                      f.idCliente === clienteSelecionado.idCliente
                  )
                  .map((fat) => ({
                    value: fat.idFatura,
                    label: `Fatura #${fat.idFatura} - ${formatCurrency(
                      fat.total
                    )} - Vence: ${formatDate(fat.vencimento)}`,
                  }))}
                value={
                  faturaSelecionadaForm
                    ? {
                        value: faturaSelecionadaForm.idFatura,
                        label: `Fatura #${
                          faturaSelecionadaForm.idFatura
                        } - ${formatCurrency(
                          faturaSelecionadaForm.total
                        )} - Vence: ${formatDate(
                          faturaSelecionadaForm.vencimento
                        )}`,
                      }
                    : null
                }
                onChange={handleFaturaChange}
                placeholder="Selecione uma fatura (apenas pendentes)..."
                noOptionsMessage={() => "Nenhuma fatura pendente encontrada"}
                isClearable
                isDisabled={!clienteSelecionado}
              />
            </div>

            {/* Parcela(s) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parcela(s) *
              </label>
              <Select
                options={getParcelasOptions()}
                value={getParcelasOptions().find(
                  (opt) =>
                    opt.value.toString() === parcelaSelecionada.toString()
                )}
                onChange={(opt) => handleParcelaChange(opt?.value || "todas")}
                placeholder="Selecione a parcela..."
                isDisabled={!faturaSelecionadaForm}
              />
            </div>

            {/* Valor Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Pago *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="text"
                  value={formatCurrency(parseFloat(valorPago || 0))}
                  readOnly
                  step="0.01"
                  min="0.01"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C]"
                  placeholder="0,00"
                />
              </div>
              {faturaSelecionadaForm && (
                <p className="mt-1 text-xs text-gray-500">
                  Total da fatura: {formatCurrency(faturaSelecionadaForm.total)}
                </p>
              )}
            </div>

            {/* Método de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método *
              </label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C]"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>

            {/* Data de Pagamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de Pagamento *
              </label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C]"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-4">
            <button
              type="button"
              onClick={() => {
                setClienteSelecionado(null);
                setFaturaSelecionadaForm(null);
                setParcelaSelecionada("todas");
                setValorPago("");
                setMetodoPagamento("dinheiro");
                setDataPagamento(new Date().toISOString().split("T")[0]);
              }}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Limpar
            </button>
            <button
              onClick={handleAbrirConfirmacao}
              disabled={
                submitting || !clienteSelecionado || !faturaSelecionadaForm
              }
              className="inline-flex items-center px-4 py-2 text-white bg-[#1A2B4C] rounded-md hover:bg-[#152340] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              Registrar Pagamento
            </button>
          </div>
        </div>
      </div>

      {/* Histórico de Pagamentos */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold" style={{ color: "#1A2B4C" }}>
              Histórico de Pagamentos
            </h2>
          </div>
          <span className="text-sm text-gray-500">
            Total: {pagamentos.length} pagamentos
          </span>
        </div>

        {loadingHistorico ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2B4C]"></div>
            <span className="ml-3 text-gray-500">Carregando histórico...</span>
          </div>
        ) : currentPagamentos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Nenhum pagamento encontrado</p>
            <p className="text-sm mt-1">Registre o primeiro pagamento</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fatura
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPagamentos.map((pagamento) => (
                    <tr
                      key={pagamento.idPagamento}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {pagamento.idPagamento}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(pagamento.data_Pagamento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {pagamento.fatura?.cliente?.nome || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getMetodoLabel(pagamento.metodoPagamento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(pagamento.valorPago)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        #{pagamento.idFatura}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status="pago" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Mostrando {indexOfFirstItem + 1} até{" "}
                  {Math.min(indexOfLastItem, pagamentos.length)} de{" "}
                  {pagamentos.length}
                </span>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modais */}
      <DetalhesFaturaModal
        fatura={faturaSelecionada}
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Modal de Confirmação */}
      <ConfirmarPagamentoModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmPayment}
        loading={submitting}
        pagamentoData={confirmData}
      />
    </div>
  );
};

export default Pagamentos;
