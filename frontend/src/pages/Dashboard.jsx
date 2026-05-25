import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useAuth } from "../contexts/AuthContext";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import Card, { CardBody } from "../components/ui/Card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorType,
  trend,
  isLoading,
}) => {
  const getColorStyles = (type) => {
    const styles = {
      primary: {
        bg: "bg-primary-800/10",
        text: "text-primary-800",
        border: "bg-primary-800",
        trendUp: "text-success",
        trendDown: "text-danger",
      },
      success: {
        bg: "bg-success/10",
        text: "text-success",
        border: "bg-success",
        trendUp: "text-success",
        trendDown: "text-danger",
      },
      danger: {
        bg: "bg-danger/10",
        text: "text-danger",
        border: "bg-danger",
        trendUp: "text-success",
        trendDown: "text-danger",
      },
      warning: {
        bg: "bg-warning/10",
        text: "text-warning",
        border: "bg-warning",
        trendUp: "text-success",
        trendDown: "text-danger",
      },
    };
    return styles[type] || styles.primary;
  };

  const colors = getColorStyles(colorType);

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden relative">
      {/* Barra lateral colorida - sem listra amarela */}
      <div
        className={`absolute top-0 left-0 w-1.5 h-full ${colors.border} rounded-l-xl`}
      />
      <CardBody className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            {isLoading ? (
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className={`text-2xl font-bold ${colors.text}`}>{value}</p>
            )}
            {trend !== undefined && trend !== null && trend !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                {trend > 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-danger" />
                )}
                <span
                  className={`text-xs font-medium ${
                    trend > 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {Math.abs(trend).toFixed(0)}% desde mês passado
                </span>
              </div>
            )}
          </div>
          <div
            className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className={`h-6 w-6 ${colors.text}`} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReceber: 0,
    totalReceberTrend: 0,

    recebidoMes: 0,
    recebidoMesTrend: 0,

    atrasadas: 0,
    atrasadasTrend: 0,

    clientesLimite: 0,
    clientesLimiteTrend: 0,
  });
  const [ultimasCompras, setUltimasCompras] = useState([]);
  const [maioresDividas, setMaioresDividas] = useState([]);
  const [dadosGraficoBarras, setDadosGraficoBarras] = useState({
    labels: [],
    vendasFiado: [],
    pagamentosRecebidos: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/dashboard");
      const data = response.data;

      setStats({
        totalReceber: data.totalReceber,
        totalReceberTrend: data.totalReceberTrend,

        recebidoMes: data.recebidoMes,
        recebidoMesTrend: data.recebidoMesTrend,

        atrasadas: data.atrasadas,
        atrasadasTrend: data.atrasadasTrend,

        clientesLimite: data.clientesLimite,
        clientesLimiteTrend: data.clientesLimiteTrend,
      });

      setUltimasCompras(data.ultimasCompras);
      setMaioresDividas(
        data.maioresDividas.filter((cliente) => cliente.divida > 0)
      );
      setDadosGraficoBarras({
        labels: data.grafico.labels,
        vendasFiado: data.grafico.vendasFiado,
        pagamentosRecebidos: data.grafico.pagamentosRecebidos,
      });
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const barData = {
    labels: dadosGraficoBarras.labels,
    datasets: [
      {
        label: "Vendas no Fiado",
        data: dadosGraficoBarras.vendasFiado,
        backgroundColor: "rgba(26, 43, 76, 0.8)",
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        label: "Pagamentos Recebidos",
        data: dadosGraficoBarras.pagamentosRecebidos,
        backgroundColor: "rgba(16, 130, 67, 0.8)",
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  const doughnutData = {
    labels: ["Pago", "Pendentes", "Atrasados"],
    datasets: [
      {
        data: [
          stats.recebidoMes,
          stats.totalReceber - stats.recebidoMes - stats.atrasadas,
          stats.atrasadas,
        ],
        backgroundColor: ["#108243", "#CFC01A", "#D92B14"],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 20,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `R$ ${context.raw.toLocaleString("pt-BR")}`;
          },
        },
        backgroundColor: "#1F2937",
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        grid: { color: "#E5E7EB", drawBorder: false },
        ticks: {
          callback: function (value) {
            return "R$ " + value.toLocaleString("pt-BR");
          },
          font: { size: 11 },
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12 },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  index: i,
                  strokeStyle: "#fff",
                  lineWidth: 2,
                  pointStyle: "circle",
                  hidden: false,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage =
              total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${context.label}: R$ ${value.toLocaleString(
              "pt-BR"
            )} (${percentage}%)`;
          },
        },
      },
    },
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-800" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-primary-800/20 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-500 font-medium">Carregando dados...</p>
        <p className="text-sm text-gray-400">Aguarde um momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
          <p className="text-sm text-gray-500 mt-1">
            Acompanhe as vendas fiadas e faturas do mês.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <ArrowPathIcon
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Atualizar
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total a Receber"
          value={formatCurrency(stats.totalReceber)}
          icon={CurrencyDollarIcon}
          colorType="primary"
          trend={stats.totalReceberTrend}
          isLoading={loading}
        />
        <StatCard
          title="Recebido este Mês"
          value={formatCurrency(stats.recebidoMes)}
          icon={CreditCardIcon}
          colorType="success"
          trend={stats.recebidoMesTrend}
          isLoading={loading}
        />
        <StatCard
          title="Faturas Atrasadas"
          value={formatCurrency(stats.atrasadas)}
          icon={ClockIcon}
          colorType="danger"
          trend={stats.atrasadasTrend}
          isLoading={loading}
        />
        <StatCard
          title="Limite Excedido"
          value={`${stats.clientesLimite} clientes`}
          icon={UserGroupIcon}
          colorType="warning"
          trend={stats.clientesLimiteTrend}
          isLoading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Vendas vs Recebimentos
              </h2>
              <span className="text-xs text-gray-400">Últimos 6 meses</span>
            </div>
            <div className="h-80">
              <Bar data={barData} options={barOptions} />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Status das Faturas
              </h2>
              <span className="text-xs text-gray-400">Mês atual</span>
            </div>
            <div className="w-72 mx-auto">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Compras */}
        <Card>
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Últimas Compras
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ultimasCompras.length > 0 ? (
                    ultimasCompras.map((compra, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          {compra.cliente}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {new Date(compra.data).toLocaleDateString("pt-BR")}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-primary-800">
                          {formatCurrency(compra.valor)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Nenhuma compra encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Maiores Dívidas */}
        <Card>
          <CardBody className="p-0">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Maiores Dívidas em Aberto
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Limite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Dívida
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {maioresDividas.length > 0 ? (
                    maioresDividas.map((divida, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">
                          {divida.cliente}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {formatCurrency(divida.limite)}
                        </td>
                        <td className="px-6 py-3 text-sm font-semibold text-danger">
                          {formatCurrency(divida.divida)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Nenhuma dívida encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
