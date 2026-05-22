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
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useAuth } from "../contexts/AuthContext";
import {
  CurrencyDollarIcon,
  CreditCardIcon,
  ClockIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalReceber: 0,
    recebidoMes: 0,
    atrasadas: 0,
    clientesLimite: 0,
  });
  const [ultimasCompras, setUltimasCompras] = useState([]);
  const [maioresDividas, setMaioresDividas] = useState([]);
  const [dadosGraficoBarras, setDadosGraficoBarras] = useState({
    labels: [],
    vendasFiado: [],
    pagamentosRecebidos: [],
  });
  const [loading, setLoading] = useState(true);
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
        recebidoMes: data.recebidoMes,
        atrasadas: data.atrasadas,
        clientesLimite: data.clientesLimite,
      });

      setUltimasCompras(data.ultimasCompras);

      setMaioresDividas(data.maioresDividas);

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

  const barData = {
    labels: dadosGraficoBarras.labels,
    datasets: [
      {
        label: "Vendas no Fiado",
        data: dadosGraficoBarras.vendasFiado,
        backgroundColor: "#1A2B4C",
        borderRadius: 8,
      },
      {
        label: "Pagamentos Recebidos",
        data: dadosGraficoBarras.pagamentosRecebidos,
        backgroundColor: "#2E8B57",
        borderRadius: 8,
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
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `R$ ${context.raw.toLocaleString("pt-BR")}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function (value) {
            return "R$ " + value.toLocaleString("pt-BR");
          },
        },
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
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
          <p className="mt-4 text-gray-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "#1A2B4C" }}>
          Visão Geral
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Acompanhe as vendas fiadas e faturas do mês.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4"
          style={{ borderLeftColor: "#1A2B4C" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total a Receber (aberto)</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: "#1A2B4C" }}
              >
                R$ {stats.totalReceber.toLocaleString("pt-BR")}
              </p>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: "rgba(26, 43, 76, 0.1)" }}
            >
              <CurrencyDollarIcon
                className="h-6 w-6"
                style={{ color: "#1A2B4C" }}
              />
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4"
          style={{ borderLeftColor: "#108243" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Recebido este Mês</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: "#108243" }}
              >
                R$ {stats.recebidoMes.toLocaleString("pt-BR")}
              </p>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: "rgba(16, 130, 67, 0.1)" }}
            >
              <CreditCardIcon
                className="h-6 w-6"
                style={{ color: "#108243" }}
              />
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4"
          style={{ borderLeftColor: "#D92B14" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Faturas Atrasadas</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: "#D92B14" }}
              >
                R$ {stats.atrasadas.toLocaleString("pt-BR")}
              </p>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: "rgba(217, 43, 20, 0.1)" }}
            >
              <ClockIcon className="h-6 w-6" style={{ color: "#D92B14" }} />
            </div>
          </div>
        </div>

        <div
          className="bg-white rounded-xl shadow-sm p-6 border-l-4"
          style={{ borderLeftColor: "#CFC01A" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Clientes no Limite</p>
              <p
                className="text-2xl font-bold mt-1"
                style={{ color: "#CFC01A" }}
              >
                {stats.clientesLimite} clientes
              </p>
            </div>
            <div
              className="p-3 rounded-full"
              style={{ backgroundColor: "rgba(207, 192, 26, 0.1)" }}
            >
              <UserGroupIcon className="h-6 w-6" style={{ color: "#CFC01A" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "#1A2B4C" }}
          >
            Vendas/Fiado vs Recebimento
          </h2>
          <div className="h-80">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "#1A2B4C" }}
          >
            Status das Faturas (Mês)
          </h2>
          <div className="w-72 mx-auto">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimas Compras */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold" style={{ color: "#1A2B4C" }}>
              Últimas Compras
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ultimasCompras.length > 0 ? (
                  ultimasCompras.map((compra) => (
                    <tr
                      key={compra.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {compra.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {compra.data}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                        style={{ color: "#1A2B4C" }}
                      >
                        R$ {compra.valor.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Nenhuma compra encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maiores Dívidas em Aberto */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold" style={{ color: "#1A2B4C" }}>
              Maiores Dívidas em Aberto
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Limite
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dívida Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maioresDividas.length > 0 ? (
                  maioresDividas.map((divida) => (
                    <tr
                      key={divida.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {divida.cliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        R$ {divida.limite.toLocaleString("pt-BR")}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                        style={{ color: "#D92B14" }}
                      >
                        R$ {divida.divida.toLocaleString("pt-BR")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Nenhuma dívida encontrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
