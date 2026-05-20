import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  DocumentTextIcon,
  XMarkIcon,
  CreditCardIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// Componente de Badge de Status
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case "paga":
      case "paid":
      case "pago":
        return { text: "Paga", color: "#108243", bg: "rgba(16, 130, 67, 0.1)" };
      case "pendente":
      case "pending":
        return {
          text: "Pendente",
          color: "#CFC01A",
          bg: "rgba(207, 192, 26, 0.1)",
        };
      case "atrasada":
      case "overdue":
        return {
          text: "Atrasada",
          color: "#D92B14",
          bg: "rgba(217, 43, 20, 0.1)",
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

// Componente de Progresso de Parcelas
const ParcelasProgresso = ({ pagas, total }) => {
  const percentual = total > 0 ? (pagas / total) * 100 : 0;

  return (
    <div className="flex flex-col gap-1 min-w-[100px]">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Parcelas</span>
        <span className="font-medium" style={{ color: "#1A2B4C" }}>
          {pagas}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${percentual}%`,
            backgroundColor:
              percentual === 100
                ? "#108243"
                : percentual > 0
                ? "#CFC01A"
                : "#D92B14",
          }}
        />
      </div>
    </div>
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

// Modal de Gerar Fatura (ajustado para usar o endpoint existente POST /faturas)
const GerarFaturaModal = ({ isOpen, onClose, onFaturaGerada, clientes }) => {
  const [clienteId, setClienteId] = useState("");
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const anos = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  const calcularValorTotal = (compras) => {
    if (!compras || compras.length === 0) return 0;
    return compras.reduce((total, compra) => total + compra.valor_Total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!clienteId) newErrors.clienteId = "Selecione um cliente";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      // Primeiro, buscar as compras do cliente no período
      const comprasResponse = await api.get("/compras", {
        params: {
          clienteId: parseInt(clienteId),
        },
      });

      const comprasDoPeriodo = comprasResponse.data.filter((compra) => {
        const dataCompra = new Date(compra.data_Compra);
        return (
          dataCompra.getMonth() + 1 === mes && dataCompra.getFullYear() === ano
        );
      });

      if (comprasDoPeriodo.length === 0) {
        toast.error("Não há compras para este cliente no período selecionado");
        setLoading(false);
        return;
      }

      const mesReferencia = new Date(ano, mes - 1, 1);
      const valorTotal = calcularValorTotal(comprasDoPeriodo);
      const maiorParcelas = Math.max(
        ...comprasDoPeriodo.map((c) => c.parcelas),
        1
      );

      // Criar a fatura
      const faturaData = {
        total: valorTotal,
        vencimento: new Date(ano, mes, 0).toISOString(), // Último dia do mês
        status: "Pendente",
        parcelas: maiorParcelas,
        mesReferencia: mesReferencia.toISOString(),
        dataGeracao: new Date().toISOString(),
        idCliente: parseInt(clienteId),
      };

      const response = await api.post("/faturas", faturaData);

      toast.success("Fatura gerada com sucesso!");
      onFaturaGerada(response.data);
      onClose();
      setClienteId("");
    } catch (error) {
      console.error("Erro ao gerar fatura:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "Erro ao gerar fatura";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold" style={{ color: "#1A2B4C" }}>
            Gerar Fatura Mensal
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.clienteId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.idCliente} value={cliente.idCliente}>
                  {cliente.nome} - {cliente.cpf_Cnpj}
                </option>
              ))}
            </select>
            {errors.clienteId && (
              <p className="mt-1 text-xs text-red-500">{errors.clienteId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês *
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {meses.map((nome, index) => (
                  <option key={index + 1} value={index + 1}>
                    {nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano *
              </label>
              <select
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {anos.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-[#1A2B4C] rounded-md hover:bg-[#152340] disabled:opacity-50"
            >
              {loading ? "Gerando..." : "Gerar Fatura"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de Detalhes da Fatura
const DetalhesFaturaModal = ({ fatura, isOpen, onClose, onStatusUpdate }) => {
  const [pagando, setPagando] = useState(false);
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

  const handlePagarFatura = async () => {
    setPagando(true);
    try {
      await api.put(`/faturas/${faturaAtualizada.idFatura}/status`, "Paga");
      toast.success("Fatura paga com sucesso!");
      setFaturaAtualizada({ ...faturaAtualizada, status: "Paga" });
      onStatusUpdate(faturaAtualizada.idFatura, "Paga");
    } catch (error) {
      console.error("Erro ao pagar fatura:", error);
      toast.error("Erro ao pagar fatura");
    } finally {
      setPagando(false);
    }
  };

  if (!isOpen) return null;

  return (
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
                  {Array.from({ length: faturaAtualizada?.parcelas || 1 }).map(
                    (_, index) => {
                      const valorParcela =
                        (faturaAtualizada?.total || 0) /
                        (faturaAtualizada?.parcelas || 1);
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">
                            {index + 1}/{faturaAtualizada?.parcelas}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            {formatDate(faturaAtualizada?.vencimento)}
                          </td>
                          <td className="px-4 py-2 text-sm font-medium">
                            {formatCurrency(valorParcela)}
                          </td>
                          <td className="px-4 py-2">
                            <StatusBadge status="Pendente" />
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compras Vinculadas */}
          <div>
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "#1A2B4C" }}
            >
              Detalhes das Compras Vinculadas
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Data
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Valor
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">
                      Parcelas
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {faturaAtualizada?.compras?.map((compra) => (
                    <tr key={compra.idCompra} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm">
                        {formatDate(compra.data_Compra)}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium">
                        {formatCurrency(compra.valor_Total)}
                      </td>
                      <td className="px-4 py-2 text-sm">{compra.parcelas}x</td>
                    </tr>
                  ))}
                  {(!faturaAtualizada?.compras ||
                    faturaAtualizada?.compras.length === 0) && (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Nenhuma compra vinculada a esta fatura
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td
                      colSpan="2"
                      className="px-4 py-2 text-right text-sm font-medium"
                    >
                      Total:
                    </td>
                    <td
                      className="px-4 py-2 text-sm font-bold"
                      style={{ color: "#1A2B4C" }}
                    >
                      {formatCurrency(faturaAtualizada?.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Fechar
          </button>
          {faturaAtualizada?.status !== "Paga" && (
            <button
              onClick={handlePagarFatura}
              disabled={pagando}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <CreditCardIcon className="h-5 w-5 mr-2" />
              {pagando ? "Processando..." : "Pagar Fatura"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente Principal
const Faturas = () => {
  const [faturas, setFaturas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [faturaSelecionada, setFaturaSelecionada] = useState(null);
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showGerarModal, setShowGerarModal] = useState(false);

  // Filtros
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  useEffect(() => {
    loadFaturas();
    loadClientes();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroCliente, filtroStatus]);

  const loadFaturas = async () => {
    setLoading(true);
    try {
      const response = await api.get("/faturas");
      setFaturas(response.data);
    } catch (error) {
      console.error("Erro ao carregar faturas:", error);
      toast.error("Erro ao carregar faturas");
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const response = await api.get("/cliente");
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const handleVerDetalhes = (fatura) => {
    setFaturaSelecionada(fatura);
    setShowDetalhesModal(true);
  };

  const handleStatusUpdate = (id, novoStatus) => {
    setFaturas(
      faturas.map((f) => (f.idFatura === id ? { ...f, status: novoStatus } : f))
    );
    if (faturaSelecionada?.idFatura === id) {
      setFaturaSelecionada({ ...faturaSelecionada, status: novoStatus });
    }
  };

  const handleFaturaGerada = (novaFatura) => {
    loadFaturas();
  };

  // Filtrar faturas
  const faturasFiltradas = faturas.filter((fatura) => {
    const matchCliente =
      !filtroCliente || fatura.idCliente === parseInt(filtroCliente);
    const matchStatus =
      !filtroStatus ||
      fatura.status?.toLowerCase() === filtroStatus.toLowerCase();
    return matchCliente && matchStatus;
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFaturas = faturasFiltradas.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(faturasFiltradas.length / itemsPerPage);
  const totalFaturas = faturasFiltradas.length;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const limparFiltros = () => {
    setFiltroCliente("");
    setFiltroStatus("");
  };

  const hasActiveFilters = filtroCliente || filtroStatus;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A2B4C" }}>
            Faturas do Cliente
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe o vencimento das faturas
          </p>
        </div>
        <button
          onClick={() => setShowGerarModal(true)}
          className="inline-flex items-center px-4 py-2 bg-[#1A2B4C] text-white rounded-md hover:bg-[#152340] transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Gerar Fatura Mensal
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A2B4C]"
            >
              <option value="">Todos os clientes</option>
              {clientes.map((cliente) => (
                <option key={cliente.idCliente} value={cliente.idCliente}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A2B4C]"
            >
              <option value="">Todos os status</option>
              <option value="Pendente">Pendente</option>
              <option value="Paga">Paga</option>
            </select>
          </div>

          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={limparFiltros}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabela de Faturas */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fatura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Emissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Parcelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ação
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2B4C]"></div>
                      <span className="ml-3 text-gray-500">
                        Carregando faturas...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : currentFaturas.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {hasActiveFilters ? (
                        <>
                          <p className="text-lg">Nenhuma fatura encontrada</p>
                          <p className="text-sm mt-1">
                            Tente ajustar os filtros de busca
                          </p>
                          <button
                            onClick={limparFiltros}
                            className="mt-3 text-sm text-[#1A2B4C] hover:underline"
                          >
                            Limpar todos os filtros
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-lg">Nenhuma fatura cadastrada</p>
                          <p className="text-sm mt-1">
                            Clique em "Gerar Fatura Mensal" para começar
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentFaturas.map((fatura) => (
                  <tr key={fatura.idFatura} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          #{fatura.idFatura}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(fatura.dataGeracao)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(fatura.vencimento)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(fatura.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ParcelasProgresso
                        pagas={0}
                        total={fatura.parcelas || 1}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={fatura.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleVerDetalhes(fatura)}
                        className="inline-flex items-center px-3 py-1.5 bg-[#1A2B4C] text-white text-sm rounded-md hover:bg-[#152340]"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalFaturas > 0 && (
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm text-gray-500">
              Total de {totalFaturas} fatura{totalFaturas !== 1 && "s"}
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        )}
      </div>

      {/* Modais */}
      <GerarFaturaModal
        isOpen={showGerarModal}
        onClose={() => setShowGerarModal(false)}
        onFaturaGerada={handleFaturaGerada}
        clientes={clientes}
      />

      <DetalhesFaturaModal
        fatura={faturaSelecionada}
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default Faturas;
