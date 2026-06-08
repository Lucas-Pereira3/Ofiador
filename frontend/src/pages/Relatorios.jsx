import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  DocumentTextIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import api from "../services/api";


const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("pt-BR");
};

const formatCPF = (cpf) => {
  if (!cpf) return "-";
  const digits = String(cpf).replace(/\D/g, "");
  if (digits.length !== 11) return cpf || "-";
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const StatusBall = ({ diasAtraso, status }) => {
  if (status === "Pago") {
    return (
      <div className="flex items-start gap-1.5 min-w-[160px]">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-success mt-1 flex-shrink-0" />
        <span className="text-xs text-success break-words leading-tight">Pago</span>
      </div>
    );
  }
  if (status === "Atrasado") {
    return (
      <div className="flex items-start gap-1.5 min-w-[160px]">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-danger mt-1 flex-shrink-0" />
        <span className="text-xs text-danger break-words leading-tight">
          Atrasado{diasAtraso > 0 ? ` (${diasAtraso} dias)` : ""}
        </span>
      </div>
    );
  }
  if (status === "Vence em breve") {
    return (
      <div className="flex items-start gap-1.5 min-w-[160px]">
        <span className="inline-block w-2.5 h-2.5 rounded-full bg-warning mt-1 flex-shrink-0" />
        <span className="text-xs text-warning break-words leading-tight">
          Vence em breve
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-1.5 min-w-[160px]">
      <span className="inline-block w-2.5 h-2.5 rounded-full bg-success mt-1 flex-shrink-0" />
      <span className="text-xs text-success break-words leading-tight">Em dia</span>
    </div>
  );
};

const Relatorios = () => {
  const [abaSelecionada, setAbaSelecionada] = useState("receber");
  const [empresaId, setEmpresaId] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [periodoRapido, setPeriodoRapido] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [dadosFiltrados, setDadosFiltrados] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    api.get("/api/empresa").then((r) => setEmpresas(r.data)).catch(() => {});
    api.get("/api/cliente").then((r) => setClientes(r.data)).catch(() => {});
  }, []);

  const fetchDados = useCallback(
    async (aba = abaSelecionada) => {
      setLoading(true);
      setErro(null);
      try {
        const params = {};
        if (dataInicio) params.dataInicial = dataInicio;
        if (dataFim) params.dataFinal = dataFim;
        if (empresaId) params.empresaId = empresaId;
        if (clienteId) params.clienteId = clienteId;

        const endpointMap = {
          receber: "/api/relatorios/contas-a-receber",
          pagas: "/api/relatorios/contas-pagas",
          geral: "/api/relatorios/geral",
        };

        const { data } = await api.get(endpointMap[aba], { params });

        let normalized;
        if (aba === "pagas") {
          normalized = data.map((item) => ({
            pagamentoId: item.pagamentoId,
            clienteId: item.clienteId,
            cliente: item.nome,
            cpf: item.cpf,
            empresaId: item.empresaId,
            empresa: item.empresa,
            faturaReferencia: item.faturaReferencia,
            dataPagamento: item.dataPagamento,
            valorPago: item.valorPago,
            metodoPagamento: item.metodoPagamento,
            status: item.status,
          }));
        } else {
          normalized = data.map((item) => ({
            clienteId: item.clienteId,
            cliente: item.nome,
            cpf: item.cpf,
            empresaId: item.empresaId,
            empresa: item.empresa,
            totalDivida: item.total,
            valorPago: item.pago,
            valorRestante: item.restante,
            proximoVencimento: item.proximoVencimento,
            diasAtraso: item.diasAtraso,
            status: item.status,
          }));
        }

        setDadosFiltrados(normalized);
      } catch {
        setErro("Erro ao carregar dados. Verifique a conexão com a API.");
        setDadosFiltrados([]);
      } finally {
        setLoading(false);
      }
    },
    [abaSelecionada, dataInicio, dataFim, empresaId, clienteId]
  );

  useEffect(() => {
    fetchDados(abaSelecionada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaSelecionada]);

  const abas = [
    {
      id: "receber",
      label: "Contas a Receber",
      icon: DocumentTextIcon,
      color: "primary",
    },
    {
      id: "pagas",
      label: "Contas Pagas",
      icon: BanknotesIcon,
      color: "success",
    },
    {
      id: "geral",
      label: "Relatório Geral",
      icon: PresentationChartLineIcon,
      color: "info",
    },
  ];

  const handlePeriodoRapido = (periodo) => {
    setPeriodoRapido(periodo);
    const hoje = new Date();
    if (periodo === "mes") {
      const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      setDataInicio(inicio.toISOString().split("T")[0]);
      setDataFim(fim.toISOString().split("T")[0]);
    } else if (periodo === "30dias") {
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - 30);
      setDataInicio(inicio.toISOString().split("T")[0]);
      setDataFim(hoje.toISOString().split("T")[0]);
    } else if (periodo === "trimestre") {
      const inicio = new Date(hoje);
      inicio.setMonth(hoje.getMonth() - 3);
      setDataInicio(inicio.toISOString().split("T")[0]);
      setDataFim(hoje.toISOString().split("T")[0]);
    }
  };

  const handleLimpar = () => {
    setEmpresaId("");
    setClienteId("");
    setDataInicio("");
    setDataFim("");
    setPeriodoRapido("");
  };

  const handleAplicarFiltros = () => {
    fetchDados(abaSelecionada);
    setShowMobileFilters(false);
  };

  const handleExportar = async (formato) => {
    try {
      const params = { tipo: abaSelecionada };
      if (dataInicio) params.dataInicial = dataInicio;
      if (dataFim) params.dataFinal = dataFim;
      if (empresaId) params.empresaId = empresaId;
      if (clienteId) params.clienteId = clienteId;

      const response = await api.get(`/api/relatorios/exportar/${formato}`, {
        params,
        responseType: "blob",
      });

      const ext = formato === "pdf" ? "pdf" : "xlsx";
      const contentType =
        formato === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const blob = new Blob([response.data], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-${abaSelecionada}-${new Date().toISOString().split("T")[0]}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setErro("Erro ao exportar relatório. Tente novamente.");
    }
  };

  const temFiltrosAtivos = empresaId || clienteId || dataInicio || dataFim;

  const clientesFiltrados = useMemo(() => {
    if (!empresaId) return clientes;
    return clientes.filter((c) => c.idEmpresa === parseInt(empresaId));
  }, [empresaId, clientes]);

  const totalEmAberto = dadosFiltrados.reduce((acc, d) => acc + d.valorRestante, 0);
  const totalPago = dadosFiltrados.reduce((acc, d) => acc + d.valorPago, 0);
  const totalPendente = dadosFiltrados.reduce(
    (acc, d) =>
      acc + (d.diasAtraso > 0 && d.status !== "paga" ? d.valorRestante : 0),
    0
  );
  const totalGeral = dadosFiltrados.reduce((acc, d) => acc + d.totalDivida, 0);

  const getCardInfo = () => {
    if (abaSelecionada === "receber") {
      return {
        primary: { label: "Total a Receber", value: totalEmAberto, color: "primary" },
        secondary: { label: "Total Pendente (Atrasado)", value: totalPendente, color: "danger" },
        tertiary: { label: "Quantidade de Faturas", value: dadosFiltrados.length, color: "info" },
      };
    }
    if (abaSelecionada === "pagas") {
      return {
        primary: { label: "Total Recebido", value: totalPago, color: "success" },
        secondary: { label: "Quantidade de Pagamentos", value: dadosFiltrados.length, color: "info" },
        tertiary: {
          label: "Ticket Médio",
          value: dadosFiltrados.length > 0 ? totalPago / dadosFiltrados.length : 0,
          color: "primary",
        },
      };
    }
    return {
      primary: { label: "Volume Total Negociado", value: totalGeral, color: "primary" },
      secondary: { label: "Total Recebido", value: totalPago, color: "success" },
      tertiary: { label: "Saldo Devedor", value: totalEmAberto, color: "warning" },
    };
  };

  const cardInfo = getCardInfo();

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Central de Relatórios
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie relatórios financeiros e análises
          </p>
        </div>
      </div>

      {/* Abas */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {abas.map((aba) => {
          const Icon = aba.icon;
          const ativa = abaSelecionada === aba.id;

          return (
            <button
              key={aba.id}
              onClick={() => {
                setAbaSelecionada(aba.id);
                handleLimpar();
              }}
              className={`
          flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl
          text-xs sm:text-sm font-medium
          transition-all duration-200 whitespace-nowrap flex-shrink-0
          ${
            ativa
              ? "bg-primary-800 text-white shadow-md"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
          }
        `}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{aba.label}</span>
            </button>
          );
        })}
      </div>

      {/* Layout: Filtros + Conteúdo */}
      <div className="grid grid-cols-1 xl:grid-cols-[250px_minmax(0,1fr)] gap-6">
        {/* Painel de Filtros - Desktop */}
        <div className="hidden xl:block w-full xl:w-72 flex-shrink-0">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <h2 className="text-base font-semibold text-gray-800">
                  Filtros
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                  Empresa
                </label>
                <select
                  value={empresaId}
                  onChange={(e) => {
                    setEmpresaId(e.target.value);
                    setClienteId("");
                  }}
                  className="input w-full"
                >
                  <option value="">Todas as empresas</option>
                  {empresas.map((emp) => (
                    <option key={emp.idEmpresa} value={emp.idEmpresa}>
                      {emp.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <UserIcon className="h-4 w-4 inline mr-1" />
                  Cliente
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Todos os clientes</option>
                  {clientesFiltrados.map((cli) => (
                    <option key={cli.idCliente} value={cli.idCliente}>
                      {cli.nome} - {cli.cpf_Cnpj}
                    </option>
                  ))}
                </select>
              </div>

              {/* Período Rápido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Período Rápido
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "mes", label: "Este Mês" },
                    { id: "30dias", label: "Últimos 30 dias" },
                    { id: "trimestre", label: "Último Trimestre" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePeriodoRapido(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        periodoRapido === p.id
                          ? "bg-primary-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Período Personalizado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Período Personalizado
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Data Inicial</label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => {
                        setDataInicio(e.target.value);
                        setPeriodoRapido("");
                      }}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Data Final</label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => {
                        setDataFim(e.target.value);
                        setPeriodoRapido("");
                      }}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-2">
                {temFiltrosAtivos && (
                  <Button
                    variant="outline"
                    onClick={handleLimpar}
                    className="flex-1"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Limpar
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={handleAplicarFiltros}
                  className="flex-1"
                >
                  Aplicar Filtros
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Botão mobile para abrir filtros */}
        <div className="xl:hidden">
          <Button
            variant="outline"
            onClick={() => setShowMobileFilters(true)}
            className="w-full"
            icon={FunnelIcon}
          >
            Filtros{" "}
            {temFiltrosAtivos &&
              `(${
                Object.values({
                  empresaId,
                  clienteId,
                  dataInicio,
                  dataFim,
                }).filter(Boolean).length
              })`}
          </Button>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 min-w-0">
          {/* Cards de totais */}
          <div className={`grid grid-cols-1 ${abaSelecionada === "geral" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"} gap-4 mb-6`}>
            <Card className="border-l-4 border-l-primary-800">
              <CardBody className="p-4">
                <p className="text-xs text-gray-500 mb-1">
                  {cardInfo.primary.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {typeof cardInfo.primary.value === "number"
                    ? formatCurrency(cardInfo.primary.value)
                    : cardInfo.primary.value}
                </p>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardBody className="p-4">
                <p className="text-xs text-gray-500 mb-1">
                  {cardInfo.secondary.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {typeof cardInfo.secondary.value === "number"
                    ? formatCurrency(cardInfo.secondary.value)
                    : cardInfo.secondary.value}
                </p>
              </CardBody>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardBody className="p-4">
                <p className="text-xs text-gray-500 mb-1">
                  {cardInfo.tertiary.label}
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {typeof cardInfo.tertiary.value === "number"
                    ? cardInfo.tertiary.label.includes("Ticket Médio")
                      ? formatCurrency(cardInfo.tertiary.value)
                      : cardInfo.tertiary.value
                    : cardInfo.tertiary.value}
                </p>
              </CardBody>
            </Card>
            {abaSelecionada === "geral" && (
              <Card className="border-l-4 border-l-blue-500">
                <CardBody className="p-4">
                  <p className="text-xs text-gray-500 mb-1">Taxa de Recebimento</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {totalGeral > 0
                      ? `${((totalPago / totalGeral) * 100)
                          .toFixed(2)
                          .replace(".", ",")}%`
                      : "0,00%"}
                  </p>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Tabela de resultados */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Resultados -{" "}
                    {abas.find((a) => a.id === abaSelecionada)?.label}
                  </h2>
                  <Badge variant="info">
                    {dadosFiltrados.length} registro
                    {dadosFiltrados.length !== 1 && "s"}
                  </Badge>
                </div>
                {dadosFiltrados.length > 0 && !loading && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportar("pdf")}
                      icon={ArrowDownTrayIcon}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExportar("excel")}
                      icon={ArrowDownTrayIcon}
                    >
                      Excel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Carregando...</p>
                </div>
              ) : erro ? (
                <div className="text-center py-12">
                  <p className="text-red-500">{erro}</p>
                </div>
              ) : dadosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum resultado encontrado</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Tente ajustar os filtros de busca
                  </p>
                </div>
              ) : (
                <div className="w-full overflow-x-auto">
                  {abaSelecionada === "pagas" ? (
                    <table className="w-full table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3.5 w-[20%] text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                          <th className="px-4 py-3.5 w-[12%] text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Empresa</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Referência</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data Pagamento</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valor Pago</th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Método</th>
                          <th className="px-4 py-3.5 min-w-[120px] text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {dadosFiltrados.map((row, idx) => (
                          <tr
                            key={`${row.pagamentoId}-${idx}`}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{row.cliente}</p>
                                <p className="text-xs text-gray-400 whitespace-nowrap">{formatCPF(row.cpf)}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge variant="default" className="bg-gray-100">{row.empresa}</Badge>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{row.faturaReferencia}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{formatDate(row.dataPagamento)}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-success">{formatCurrency(row.valorPago)}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{row.metodoPagamento}</td>
                            <td className="px-6 py-4">
                              <StatusBall diasAtraso={0} status={row.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td colSpan="4" className="px-6 py-3 text-sm font-semibold text-gray-700">Totais</td>
                          <td className="px-6 py-3 text-sm font-bold text-success">
                            {formatCurrency(dadosFiltrados.reduce((acc, d) => acc + d.valorPago, 0))}
                          </td>
                          <td colSpan="2" />
                        </tr>
                      </tfoot>
                    </table>
                  ) : (
                    <table className="w-full table-auto">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3.5 w-[20%] text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-4 py-3.5 w-[12%] text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Empresa
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Total Dívida
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Valor Pago
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Saldo Devedor
                          </th>
                          <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Próximo Vencimento
                          </th>
                          <th className="px-4 py-3.5 min-w-[180px] text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {dadosFiltrados.map((row, idx) => (
                          <tr
                            key={`${row.clienteId}-${row.status}-${idx}`}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                                  {row.cliente}
                                </p>
                                <p className="text-xs text-gray-400 whitespace-nowrap">
                                  {formatCPF(row.cpf)}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge variant="default" className="bg-gray-100">
                                {row.empresa}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {formatCurrency(row.totalDivida)}
                            </td>
                            <td className="px-6 py-4 text-sm text-success font-medium">
                              {formatCurrency(row.valorPago)}
                            </td>
                            <td
                              className="px-6 py-4 text-sm font-semibold"
                              style={{
                                color:
                                  row.valorRestante === 0
                                    ? "#108243"
                                    : row.diasAtraso > 0
                                    ? "#D92B14"
                                    : "#1A2B4C",
                              }}
                            >
                              {formatCurrency(row.valorRestante)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {formatDate(row.proximoVencimento)}
                            </td>
                            <td className="px-6 py-4 min-w-[180px]">
                              <StatusBall
                                diasAtraso={row.diasAtraso}
                                status={row.status}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Footer com totais */}
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td
                            colSpan="2"
                            className="px-6 py-3 text-sm font-semibold text-gray-700"
                          >
                            Totais
                          </td>
                          <td className="px-6 py-3 text-sm font-bold text-gray-900">
                            {formatCurrency(
                              dadosFiltrados.reduce(
                                (acc, d) => acc + d.totalDivida,
                                0
                              )
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm font-bold text-success">
                            {formatCurrency(
                              dadosFiltrados.reduce(
                                (acc, d) => acc + d.valorPago,
                                0
                              )
                            )}
                          </td>
                          <td className="px-6 py-3 text-sm font-bold text-primary-800">
                            {formatCurrency(
                              dadosFiltrados.reduce(
                                (acc, d) => acc + d.valorRestante,
                                0
                              )
                            )}
                          </td>
                          <td colSpan="2" />
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Legenda */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            <span className="font-medium text-gray-600">Legenda:</span>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-danger" />
              <span className="text-xs text-gray-600">Atrasado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-warning" />
              <span className="text-xs text-gray-600">
                Vence em breve (até 7 dias)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-success" />
              <span className="text-xs text-gray-600">Em dia / Pago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[85vh] overflow-y-auto animate-in slide-in-bottom duration-300">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-5 w-5 text-primary-800" />
                <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Empresa
                </label>
                <select
                  value={empresaId}
                  onChange={(e) => {
                    setEmpresaId(e.target.value);
                    setClienteId("");
                  }}
                  className="input text-sm"
                >
                  <option value="">Todas as empresas</option>
                  {empresas.map((emp) => (
                    <option key={emp.idEmpresa} value={emp.idEmpresa}>
                      {emp.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Cliente
                </label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Todos os clientes</option>
                  {clientesFiltrados.map((cli) => (
                    <option key={cli.idCliente} value={cli.idCliente}>
                      {cli.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Período Rápido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Período Rápido
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "mes", label: "Este Mês" },
                    { id: "30dias", label: "30 dias" },
                    { id: "trimestre", label: "Trimestre" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePeriodoRapido(p.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        periodoRapido === p.id
                          ? "bg-primary-800 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Personalizada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Período Personalizado
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Data Inicial</label>
                    <input
                      type="date"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Data Final</label>
                    <input
                      type="date"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="input w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4">
                {temFiltrosAtivos && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleLimpar();
                      setShowMobileFilters(false);
                    }}
                    className="flex-1"
                  >
                    Limpar
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={handleAplicarFiltros}
                  className="flex-1"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-bottom {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-in.slide-in-bottom {
          animation: slide-in-bottom 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Relatorios;
