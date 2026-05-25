import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  DocumentTextIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";

// Componente de Badge de Status
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    const statusLower = status?.toLowerCase();

    switch (statusLower) {
      case "paga":
      case "paid":
      case "pago":
        return { text: "Paga", variant: "success" };
      case "pendente":
      case "pending":
        return { text: "Pendente", variant: "warning" };
      case "atrasada":
      case "overdue":
        return { text: "Atrasada", variant: "danger" };
      case "parcial":
        return { text: "Parcial", variant: "info" };
      default:
        return { text: status || "Desconhecido", variant: "default" };
    }
  };

  const config = getStatusConfig();
  return <Badge variant={config.variant}>{config.text}</Badge>;
};

// Componente de Progresso de Parcelas
const ParcelasProgresso = ({ pagas, total, status }) => {
  const percentual = total > 0 ? (pagas / total) * 100 : 0;

  let barColor = "#D92B14";
  if (status === "pago") barColor = "#108243";
  else if (status === "parcial") barColor = "#3b82f6";

  return (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Parcelas</span>
        <span className="font-medium text-primary-800">
          {pagas}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: `${percentual}%`,
            backgroundColor: barColor,
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
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + 4);
      if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            currentPage === page
              ? "bg-primary-800 text-white"
              : "border border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
      onStatusUpdate(novaFatura);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fatura Nº ${faturaAtualizada?.idFatura}`}
      size="lg"
      footer={
        !isPaga && (
          <Button
            onClick={handlePagarFatura}
            isLoading={pagando}
            icon={CreditCardIcon}
            variant="success"
          >
            Pagar Fatura
          </Button>
        )
      }
    >
      <div className="space-y-6">
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
              <p className="mt-1 text-2xl font-bold text-primary-800">
                {formatCurrency(faturaAtualizada?.total)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary-800">
            Resumo das Parcelas
          </h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Parcela
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data Compra
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Valor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
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
                    <td className="px-4 py-3 text-sm">
                      {parcela.numeroParcela}/{parcela.compra?.parcelas}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatDate(parcela.compra?.data_Compra)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(parcela.valorParcela)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={parcela.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-primary-800">
            Situação do Cliente
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-primary-800/5 rounded-lg p-3 border border-primary-800/10">
              <p className="text-xs text-gray-500">Limite Total</p>
              <p className="text-lg font-bold text-primary-800 mt-1">
                {formatCurrency(faturaAtualizada?.cliente?.limiteTotal)}
              </p>
            </div>
            <div className="bg-danger/5 rounded-lg p-3 border border-danger/10">
              <p className="text-xs text-gray-500">Utilizado</p>
              <p className="text-lg font-bold text-danger mt-1">
                {formatCurrency(faturaAtualizada?.cliente?.limiteUtilizado)}
              </p>
            </div>
            <div className="bg-success/5 rounded-lg p-3 border border-success/10">
              <p className="text-xs text-gray-500">Disponível</p>
              <p className="text-lg font-bold text-success mt-1">
                {formatCurrency(faturaAtualizada?.cliente?.limiteDisponivel)}
              </p>
            </div>
            <div className="bg-info/5 rounded-lg p-3 border border-info/10">
              <p className="text-xs text-gray-500">Em Aberto</p>
              <p className="text-lg font-bold text-info mt-1">
                {faturaAtualizada?.cliente?.comprasEmAberto || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
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
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [inputValue, setInputValue] = useState("");

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

  const getFaturaStatus = (fatura) => {
    const parcelas = fatura.compraParcelas || [];
    if (parcelas.length === 0) return fatura.status || "pendente";

    const hoje = new Date();
    const vencimento = fatura.vencimento ? new Date(fatura.vencimento) : null;

    const pagas = parcelas.filter(
      (p) => p.status === 1 || p.status?.toString().toUpperCase() === "PAGO"
    ).length;

    if (pagas === parcelas.length) return "pago";
    if (pagas > 0 && pagas < parcelas.length) return "parcial";
    if (vencimento && vencimento < hoje && pagas === 0) return "atrasada";
    return "pendente";
  };

  const faturasFiltradas = faturas.filter((fatura) => {
    const matchCliente =
      !filtroCliente || fatura.idCliente === parseInt(filtroCliente);
    const faturaStatus = getFaturaStatus(fatura);
    const matchStatus =
      !filtroStatus || faturaStatus === filtroStatus.toLowerCase();
    return matchCliente && matchStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFaturas = faturasFiltradas.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(faturasFiltradas.length / itemsPerPage);
  const totalFaturas = faturasFiltradas.length;

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Faturas do Cliente</h1>
        <p className="text-sm text-gray-500 mt-1">
          Acompanhe o vencimento das faturas
        </p>
      </div>

      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="input-label">Cliente</label>
              <Select
                options={clientes
                  .filter(
                    (cli) =>
                      !inputValue ||
                      `${cli.nome} - ${cli.cpf_Cnpj || ""}`
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                  )
                  .slice(0, inputValue ? clientes.length : 6)
                  .map((cli) => ({
                    value: cli.idCliente,
                    label: `${cli.nome} ${
                      cli.cpf_Cnpj ? `- ${cli.cpf_Cnpj}` : ""
                    }`,
                  }))}
                value={
                  filtroCliente
                    ? (() => {
                        const cliente = clientes.find(
                          (c) => c.idCliente === parseInt(filtroCliente)
                        );

                        return cliente
                          ? {
                              value: cliente.idCliente,
                              label: `${cliente.nome} ${
                                cliente.cpf_Cnpj ? `- ${cliente.cpf_Cnpj}` : ""
                              }`,
                            }
                          : null;
                      })()
                    : null
                }
                onChange={(opt) =>
                  setFiltroCliente(opt ? opt.value.toString() : "")
                }
                onInputChange={(val) => setInputValue(val)}
                placeholder="Pesquisar cliente..."
                isClearable
                menuPlacement="auto"
                noOptionsMessage={() => "Nenhum cliente encontrado"}
                menuPortalTarget={document.body}
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    minHeight: "27px",
                    height: "27px",
                    borderRadius: "0.5rem",
                    borderColor: state.isFocused ? "#1A2B4C" : "#d1d5db",
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(26,43,76,0.15)"
                      : "none",
                    fontSize: "14px",
                  }),

                  valueContainer: (provided) => ({
                    ...provided,
                    height: "27px",
                    padding: "0 12px",
                  }),

                  indicatorsContainer: (provided) => ({
                    ...provided,
                    height: "27px",
                  }),

                  placeholder: (provided) => ({
                    ...provided,
                    fontSize: "9px",
                    color: "#9ca3af",
                  }),

                  singleValue: (provided) => ({
                    ...provided,
                    fontSize: "9px",
                  }),

                  indicatorSeparator: () => ({
                    display: "none",
                  }),

                  menuPortal: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),

                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>
            <div>
              <label className="input-label">Status</label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="input"
              >
                <option value="">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="atrasada">Atrasada</option>
                <option value="parcial">Parcial</option>
              </select>
            </div>
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button variant="ghost" onClick={limparFiltros}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Fatura
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Emissão
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Vencimento
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Valor
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Parcelas
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                    Ação
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
                        <span className="ml-3 text-gray-500">
                          Carregando faturas...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : currentFaturas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        {hasActiveFilters
                          ? "Nenhuma fatura encontrada"
                          : "Nenhuma fatura cadastrada"}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          className="mt-3"
                          onClick={limparFiltros}
                        >
                          Limpar filtros
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  currentFaturas.map((fatura) => {
                    const parcelas = fatura.compraParcelas || [];
                    const pagas = parcelas.filter(
                      (p) =>
                        p.status === 1 ||
                        p.status?.toString().toUpperCase() === "PAGO"
                    ).length;
                    const totalParcelas = parcelas.length;
                    const faturaStatus = getFaturaStatus(fatura);

                    return (
                      <tr
                        key={fatura.idFatura}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              #{fatura.idFatura}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(fatura.dataGeracao)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatDate(fatura.vencimento)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(fatura.total)}
                        </td>
                        <td className="px-6 py-4">
                          <ParcelasProgresso
                            pagas={pagas}
                            total={totalParcelas}
                            status={faturaStatus}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={faturaStatus} />
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleVerDetalhes(fatura)}
                            icon={EyeIcon}
                          >
                            Detalhes
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {!loading && totalFaturas > 0 && (
            <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
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
        </CardBody>
      </Card>

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
