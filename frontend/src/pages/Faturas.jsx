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
} from "@heroicons/react/24/outline";
import Select from "react-select";

// Componente de Badge de Status
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case "paga":
      case "paid":
      case "pago":
      case "PAGO":
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
      await api.post("/pagamentos/fatura", {
        idFatura: faturaAtualizada.idFatura,
        metodoPagamento: "SISTEMA",
      });

      toast.success("Fatura paga com sucesso!");

      // Atualiza status local
      const parcelasAtualizadas =
        faturaAtualizada?.compraParcelas?.map((parcela) => ({
          ...parcela,
          status: "PAGO",
        })) || [];

      const novaFatura = {
        ...faturaAtualizada,
        status: "PAGO",
        compraParcelas: parcelasAtualizadas,
      };

      setFaturaAtualizada(novaFatura);

      // Atualiza lista principal COMPLETA
      onStatusUpdate(novaFatura);
    } catch (error) {
      console.error("Erro ao pagar fatura:", error);

      toast.error(error.response?.data?.erro || "Erro ao pagar fatura");
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
                  {formatCurrency(faturaAtualizada?.cliente?.limiteDisponivel)}
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

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Fechar
          </button>
          {faturaAtualizada?.status?.toUpperCase() !== "PAGO" && (
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

  const handleStatusUpdate = (faturaAtualizada) => {
    setFaturas((prev) =>
      prev.map((f) =>
        f.idFatura === faturaAtualizada.idFatura ? faturaAtualizada : f
      )
    );

    setFaturaSelecionada(faturaAtualizada);
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
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#1A2B4C" }}>
          Faturas do Cliente
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Acompanhe o vencimento das faturas
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Cliente
            </label>
            <Select
              options={clientes.map((cliente) => ({
                value: cliente.idCliente,
                label: cliente.nome,
              }))}
              value={
                clientes
                  .filter(
                    (cliente) => cliente.idCliente === parseInt(filtroCliente)
                  )
                  .map((cliente) => ({
                    value: cliente.idCliente,
                    label: cliente.nome,
                  }))[0] || null
              }
              onChange={(selectedOption) =>
                setFiltroCliente(
                  selectedOption ? selectedOption.value.toString() : ""
                )
              }
              placeholder="Pesquisar cliente..."
              noOptionsMessage={() => "Nenhum cliente encontrado"}
              loadingMessage={() => "Carregando..."}
              isClearable
              className="text-sm"
              // deixa scroll
              menuPlacement="auto"
              // filtra apenas os primeiros 6 resultados encontrados
              filterOption={(option, inputValue) => {
                const termo = inputValue.toLowerCase();

                const filtrados = clientes
                  .filter((cliente) =>
                    cliente.nome.toLowerCase().includes(termo)
                  )
                  .slice(0, 6);

                return filtrados.some(
                  (cliente) => cliente.idCliente === option.value
                );
              }}
            />
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
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="atrasada">Atrasado</option>
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
                            As faturas são geradas automaticamente
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
                        pagas={
                          fatura.compraParcelas?.filter(
                            (p) => p.status?.toLowerCase() === "pago"
                          ).length || 0
                        }
                        total={fatura.compraParcelas?.length || 1}
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

      {/* Modal de Detalhes */}
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
