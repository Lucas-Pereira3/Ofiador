import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import Button from "../components/ui/Button";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";

// Componente de Badge de Status
const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status?.toLowerCase()) {
      case "pago":
      case "paid":
        return { text: "Pago", variant: "success" };
      case "pendente":
      case "pending":
        return { text: "Pendente", variant: "warning" };
      case "parcial":
        return { text: "Parcial", variant: "info" };
      default:
        return { text: status || "Desconhecido", variant: "default" };
    }
  };

  const config = getStatusConfig();
  return <Badge variant={config.variant}>{config.text}</Badge>;
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Pagamento"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={loading}
            icon={CreditCardIcon}
            variant="success"
          >
            Confirmar Pagamento
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-center">
        <div className="bg-warning/10 rounded-lg p-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-warning mx-auto mb-2" />
          <p className="text-lg font-semibold text-warning">Atenção!</p>
          <p className="text-sm text-gray-600">
            Esta ação não poderá ser desfeita.
          </p>
        </div>

        <div className="space-y-2 text-left bg-gray-50 rounded-lg p-4">
          <p className="text-sm">
            <strong>Cliente:</strong> {pagamentoData?.cliente}
          </p>
          <p className="text-sm">
            <strong>Fatura:</strong> #{pagamentoData?.faturaId}
          </p>
          <p className="text-sm">
            <strong>Valor:</strong> {pagamentoData?.valor}
          </p>
          <p className="text-sm">
            <strong>Data:</strong> {pagamentoData?.data}
          </p>
          {pagamentoData?.descricao && (
            <p className="text-sm">
              <strong>Descrição:</strong> {pagamentoData.descricao}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

// Modal de detalhes da fatura
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

  const handlePagarFatura = async () => {
    setPagando(true);
    try {
      await api.post("/pagamentos/fatura", {
        idFatura: faturaAtualizada.idFatura,
        metodoPagamento: "pix",
      });

      toast.success("Fatura paga com sucesso!");
      const faturaAtualizadaObj = { ...faturaAtualizada, status: "PAGO" };
      setFaturaAtualizada(faturaAtualizadaObj);
      onStatusUpdate(faturaAtualizada.idFatura, "PAGO");
      setShowConfirmModal(false);
    } catch (error) {
      toast.error(error.response?.data?.erro || "Erro ao pagar fatura");
    } finally {
      setPagando(false);
    }
  };

  if (!isOpen) return null;

  const isPaga = faturaAtualizada?.status?.toLowerCase() === "pago";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Fatura Nº ${faturaAtualizada?.idFatura}`}
        size="lg"
        footer={
          !isPaga && (
            <Button
              onClick={() => setShowConfirmModal(true)}
              isLoading={pagando}
              icon={CreditCardIcon}
              variant="success"
            >
              Marcar como Paga
            </Button>
          )
        }
      >
        <div className="space-y-6">
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
                <p className="mt-1 text-2xl font-bold text-primary-800">
                  {formatCurrency(faturaAtualizada?.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Parcelas */}
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

          {/* Situação do Cliente */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-primary-800">
              Situação do Cliente
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500">Limite Total</p>
                <p className="text-lg font-bold text-primary-800 mt-1">
                  {formatCurrency(faturaAtualizada?.cliente?.limiteTotal)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500">Utilizado</p>
                <p className="text-lg font-bold text-danger mt-1">
                  {formatCurrency(faturaAtualizada?.cliente?.limiteUtilizado)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500">Disponível</p>
                <p className="text-lg font-bold text-success mt-1">
                  {formatCurrency(faturaAtualizada?.cliente?.limiteDisponivel)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500">Em Aberto</p>
                <p className="text-lg font-bold text-primary-800 mt-1">
                  {faturaAtualizada?.cliente?.comprasEmAberto || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>

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
        className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
        className="p-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [faturaSelecionadaForm, setFaturaSelecionadaForm] = useState(null);
  const [parcelaSelecionada, setParcelaSelecionada] = useState("todas");
  const [valorPago, setValorPago] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("dinheiro");
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().split("T")[0]
  );
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
      const pendentes = response.data.filter(
        (f) => f.status?.toLowerCase() !== "pago"
      );
      setFaturasPendentes(pendentes);
    } catch (error) {
      toast.error("Erro ao carregar faturas");
    }
  };

  const loadClientes = async () => {
    try {
      const response = await api.get("/cliente");
      setClientes(response.data);
    } catch (error) {
      toast.error("Erro ao carregar clientes");
    }
  };

  const loadPagamentos = async () => {
    setLoadingHistorico(true);
    try {
      const response = await api.get("/pagamentos");
      setPagamentos(response.data);
    } catch (error) {
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
        toast.error("Erro ao buscar fatura");
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
      const parcelaData = faturaSelecionadaForm.compraParcelas.find(
        (p) => p.idCompraParcela.toString() === parcela
      );
      if (parcelaData) setValorPago(parcelaData.valorParcela.toString());
    }
  };

  const getParcelasOptions = () => {
    const options = [{ value: "todas", label: "Todas as parcelas" }];
    if (!faturaSelecionadaForm?.compraParcelas) return options;

    faturaSelecionadaForm.compraParcelas.forEach((parcela) => {
      const status = parcela.status?.toString().toLowerCase();
      if (status === "pendente" || status === "1") {
        options.push({
          value: parcela.idCompraParcela.toString(),
          label: `${parcela.numeroParcela}/${
            parcela.compra?.parcelas || "-"
          }ª parcela`,
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
          : `Pagamento da parcela selecionada da fatura #${faturaSelecionadaForm.idFatura}`,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    setSubmitting(true);
    try {
      if (
        parcelaSelecionada !== "todas" &&
        faturaSelecionadaForm?.compraParcelas
      ) {
        await api.post("/pagamentos/parcela", {
          idParcela: parseInt(parcelaSelecionada),
          metodoPagamento,
        });
        toast.success("Pagamento registrado com sucesso!");
      } else {
        await api.post("/pagamentos/fatura", {
          idFatura: faturaSelecionadaForm.idFatura,
          metodoPagamento,
        });
        toast.success("Fatura paga com sucesso!");
      }

      await loadFaturas();
      await loadPagamentos();
      await loadClientes();

      setClienteSelecionado(null);
      setFaturaSelecionadaForm(null);
      setParcelaSelecionada("todas");
      setValorPago("");
      setMetodoPagamento("dinheiro");
      setDataPagamento(new Date().toISOString().split("T")[0]);
      setShowConfirmModal(false);
    } catch (error) {
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
      cartao: "Cartão",
      pix: "PIX",
      boleto: "Boleto",
      transferencia: "Transferência",
      sistema: "Sistema",
    };

    const metodoLower = metodo?.toLowerCase() || "";
    return metodos[metodoLower] || metodo || "-";
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
    } catch {
      return "-";
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPagamentos = pagamentos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pagamentos.length / itemsPerPage);
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Registro de Pagamento
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Confirme os pagamentos recebidos dos clientes
        </p>
      </div>

      {/* Formulário de Pagamento */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-primary-800">
              Novo Pagamento
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="input-label">Cliente *</label>
              <Select
                options={clientes
                  .filter(
                    (cli) =>
                      !inputValue ||
                      `${cli.nome} - ${cli.cpf_Cnpj}`
                        .toLowerCase()
                        .includes(inputValue.toLowerCase())
                  )
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
                onInputChange={(val) => setInputValue(val)}
                placeholder="Pesquisar cliente..."
                isClearable
                menuPlacement="auto"
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
              <label className="input-label">Fatura *</label>
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
                placeholder="Selecione uma fatura..."
                noOptionsMessage={() => "Nenhuma fatura pendente encontrada"}
                isClearable
                isDisabled={!clienteSelecionado}
                menuPlacement="auto"
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
              <label className="input-label">Parcela(s) *</label>
              <Select
                options={getParcelasOptions()}
                value={getParcelasOptions().find(
                  (opt) =>
                    opt.value.toString() === parcelaSelecionada.toString()
                )}
                onChange={(opt) => handleParcelaChange(opt?.value || "todas")}
                placeholder="Selecione a parcela..."
                isDisabled={!faturaSelecionadaForm}
                menuPlacement="auto"
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
              <label className="input-label">Valor Pago *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>
                <input
                  type="text"
                  value={formatCurrency(parseFloat(valorPago || 0))}
                  readOnly
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="input-label">Método *</label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                className="input"
              >
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="cartao_debito">Cartão de Débito</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
              </select>
            </div>

            <div>
              <label className="input-label">Data de Pagamento *</label>
              <input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setClienteSelecionado(null);
                setFaturaSelecionadaForm(null);
                setParcelaSelecionada("todas");
                setValorPago("");
                setMetodoPagamento("dinheiro");
                setDataPagamento(new Date().toISOString().split("T")[0]);
              }}
            >
              Limpar
            </Button>
            <Button
              onClick={handleAbrirConfirmacao}
              disabled={
                submitting || !clienteSelecionado || !faturaSelecionadaForm
              }
              icon={CreditCardIcon}
            >
              Registrar Pagamento
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Histórico de Pagamentos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-primary-800">
                Histórico de Pagamentos
              </h2>
            </div>
            <Badge variant="info">Total: {pagamentos.length} pagamentos</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {loadingHistorico ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
              <span className="ml-3 text-gray-500">
                Carregando histórico...
              </span>
            </div>
          ) : currentPagamentos.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Nenhum pagamento encontrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Registre o primeiro pagamento
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                        ID
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                        Data
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                        Cliente
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                        Método
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                        Valor Pago
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                        Fatura
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentPagamentos.map((pagamento) => (
                      <tr
                        key={pagamento.idPagamento}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {pagamento.idPagamento}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(pagamento.data_Pagamento)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {pagamento.fatura?.cliente?.nome || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {getMetodoLabel(pagamento.metodoPagamento)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-success">
                          {formatCurrency(pagamento.valorPago)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          #{pagamento.idFatura}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="success">Pago</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100">
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
        </CardBody>
      </Card>

      {/* Modais */}
      <DetalhesFaturaModal
        fatura={faturaSelecionada}
        isOpen={showDetalhesModal}
        onClose={() => setShowDetalhesModal(false)}
        onStatusUpdate={handleStatusUpdate}
      />

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
