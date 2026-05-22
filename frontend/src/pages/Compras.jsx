import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";

// Modal de cadastro rápido de cliente
const ClienteRapidoModal = ({ isOpen, onClose, onClienteCriado, empresas }) => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf_Cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    limite: "",
    idEmpresa: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const formatCPF = (value) => {
    const clean = value.replace(/[^\d]/g, "");
    if (clean.length <= 3) return clean;
    if (clean.length <= 6) return clean.replace(/^(\d{3})(\d{0,3})/, "$1.$2");
    if (clean.length <= 9)
      return clean.replace(/^(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    return clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
  };

  const formatTelefone = (value) => {
    const clean = value.replace(/[^\d]/g, "");
    if (clean.length <= 2) return clean;
    if (clean.length <= 6) return clean.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
    if (clean.length <= 10)
      return clean.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return clean.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const validateCPF = (cpf) => {
    const cpfClean = cpf.replace(/[^\d]/g, "");
    if (cpfClean.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfClean)) return false;

    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpfClean.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpfClean.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpfClean.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpfClean.substring(10, 11))) return false;

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "cpf_Cnpj") {
      setFormData({ ...formData, [name]: formatCPF(value) });
    } else if (name === "telefone") {
      setFormData({ ...formData, [name]: formatTelefone(value) });
    } else if (name === "limite") {
      setFormData({
        ...formData,
        [name]: value.replace(/[^\d,]/g, "").replace(",", "."),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!formData.cpf_Cnpj.trim()) {
      newErrors.cpf_Cnpj = "CPF é obrigatório";
    } else if (!validateCPF(formData.cpf_Cnpj)) {
      newErrors.cpf_Cnpj = "CPF inválido";
    }
    if (!formData.limite || parseFloat(formData.limite) <= 0) {
      newErrors.limite = "Limite de crédito deve ser maior que zero";
    }
    if (!formData.idEmpresa) newErrors.idEmpresa = "Empresa é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const clienteData = {
        nome: formData.nome,
        cpf_Cnpj: formData.cpf_Cnpj.replace(/[^\d]/g, ""),
        telefone: formData.telefone.replace(/[^\d]/g, ""),
        email: formData.email,
        endereco: formData.endereco,
        limite: parseFloat(formData.limite),
        idEmpresa: parseInt(formData.idEmpresa),
      };

      const response = await api.post("/cliente", clienteData);

      toast.success("Cliente cadastrado com sucesso!");
      onClienteCriado(response.data);
      onClose();
    } catch (error) {
      console.error("Erro ao registrar cliente:", error);
      toast.error(error.response?.data?.message || "Erro ao cadastrar cliente");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold" style={{ color: "#1A2B4C" }}>
            Novo Cliente
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
              Nome *
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.nome ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.nome && (
              <p className="mt-1 text-xs text-red-500">{errors.nome}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF *
            </label>
            <input
              type="text"
              name="cpf_Cnpj"
              value={formData.cpf_Cnpj}
              onChange={handleChange}
              maxLength={14}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.cpf_Cnpj ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="000.000.000-00"
            />
            {errors.cpf_Cnpj && (
              <p className="mt-1 text-xs text-red-500">{errors.cpf_Cnpj}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              maxLength={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <textarea
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Limite de Crédito * (R$)
            </label>
            <input
              type="number"
              name="limite"
              value={formData.limite}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              className={`w-full px-3 py-2 border rounded-md ${
                errors.limite ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0,00"
            />
            {errors.limite && (
              <p className="mt-1 text-xs text-red-500">{errors.limite}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa *
            </label>
            <select
              name="idEmpresa"
              value={formData.idEmpresa}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.idEmpresa ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Selecione uma empresa</option>
              {empresas.map((emp) => (
                <option key={emp.idEmpresa} value={emp.idEmpresa}>
                  {emp.nome}
                </option>
              ))}
            </select>
            {errors.idEmpresa && (
              <p className="mt-1 text-xs text-red-500">{errors.idEmpresa}</p>
            )}
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
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de simulação de parcelas
const SimulacaoParcelas = ({
  valorTotal,
  numeroParcelas,
  dataPrimeiroVencimento,
  dataCompra,
}) => {
  const [parcelas, setParcelas] = useState([]);

  useEffect(() => {
    if (valorTotal > 0 && numeroParcelas > 0) {
      const valorParcela = Number((valorTotal / numeroParcelas).toFixed(2));
      const parcelasArray = [];

      let dataBase;

      if (dataPrimeiroVencimento) {
        const [ano, mes, dia] = dataPrimeiroVencimento.split("-").map(Number);
        dataBase = new Date(ano, mes - 1, dia);
      } else if (dataCompra) {
        const [ano, mes, dia] = dataCompra.split("-").map(Number);
        dataBase = new Date(ano, mes, 1);
      } else {
        return;
      }

      for (let i = 0; i < numeroParcelas; i++) {
        const dataVencimento = new Date(dataBase);

        if (i > 0) {
          dataVencimento.setMonth(dataVencimento.getMonth() + i);
        }

        let valorAtual = valorParcela;

        // última parcela recebe a diferença
        if (i === numeroParcelas - 1) {
          valorAtual = Number(
            (valorTotal - valorParcela * (numeroParcelas - 1)).toFixed(2)
          );
        }

        parcelasArray.push({
          numero: i + 1,
          vencimento: dataVencimento.toLocaleDateString("pt-BR"),
          valor: valorAtual,
        });
      }
      setParcelas(parcelasArray);
    } else {
      setParcelas([]);
    }
  }, [valorTotal, numeroParcelas, dataPrimeiroVencimento, dataCompra]);

  if (parcelas.length === 0) return null;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3" style={{ color: "#1A2B4C" }}>
        SIMULAÇÃO DAS PARCELAS
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Parcelas
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Vencimento
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Valor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {parcelas.map((parcela) => (
              <tr key={parcela.numero} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {parcela.numero}/{numeroParcelas}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {parcela.vencimento}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  R${" "}
                  {parcela.valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Componente de paginação
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

const Compras = () => {
  const [empresas, setEmpresas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const [formData, setFormData] = useState({
    idEmpresa: "",
    idCliente: "",
    valor_Total: "",
    data_Compra: new Date().toISOString().split("T")[0],
    parcelas: 1,
    dataPrimeiroVencimento: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [limiteAlert, setLimiteAlert] = useState({
    show: false,
    message: "",
    disponivel: 0,
  });
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  useEffect(() => {
    loadEmpresas();
    loadClientes();
  }, []);

  useEffect(() => {
    if (formData.idCliente) {
      const cliente = clientes.find(
        (c) => c.idCliente === parseInt(formData.idCliente)
      );
      setClienteSelecionado(cliente);
      checkLimiteCredito(cliente);
      filterComprasByCliente(formData.idCliente);
    } else {
      setClienteSelecionado(null);
      setLimiteAlert({ show: false, message: "", disponivel: 0 });
      setCompras([]);
    }
    setCurrentPage(1);
  }, [formData.idCliente, clientes]);

  useEffect(() => {
    if (clienteSelecionado) {
      checkLimiteCredito(clienteSelecionado);
    }
  }, [formData.valor_Total, compras, clienteSelecionado]);

  const loadEmpresas = async () => {
    try {
      const response = await api.get("/empresa");
      setEmpresas(response.data);
    } catch (error) {
      toast.error("Erro ao carregar empresas");
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

  const filterComprasByCliente = async (clienteId) => {
    try {
      setLoadingCompras(true);
      const response = await api.get(`/compras/cliente/${clienteId}`);
      setCompras(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoadingCompras(false);
    }
  };

    const checkLimiteCredito = (cliente) => {
        if (!cliente) return;

        // Limite disponível
        const limiteDisponivel = cliente.limite - (cliente.divida || 0);

        if (formData.valor_Total) {
            const valorCompra = parseFloat(formData.valor_Total);

            if (valorCompra > limiteDisponivel) {
                setLimiteAlert({
                    show: true,
                    message: `⚠️ Atenção! Este cliente possui apenas ${limiteDisponivel.toLocaleString(
                        "pt-BR",
                        { style: "currency", currency: "BRL" }
                    )} de limite disponível. O valor da compra excede o limite em ${(
                        valorCompra - limiteDisponivel
                    ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}.`,
                    disponivel: limiteDisponivel,
                });

                return;
            }
        }

        setLimiteAlert({
            show: false,
            message: "",
            disponivel: limiteDisponivel,
        });
    };
        
}


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.idEmpresa) errors.idEmpresa = "Empresa é obrigatória";
    if (!formData.idCliente) errors.idCliente = "Cliente é obrigatório";
    if (!formData.valor_Total || parseFloat(formData.valor_Total) <= 0) {
      errors.valor_Total = "Valor total deve ser maior que zero";
    }
    if (!formData.data_Compra)
      errors.data_Compra = "Data da compra é obrigatória";
    if (!formData.parcelas || formData.parcelas < 1) {
      errors.parcelas = "Número de parcelas deve ser pelo menos 1";
    }
    if (formData.parcelas > 24) {
      errors.parcelas = "Número máximo de parcelas é 24";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const [ano, mes, dia] = formData.data_Compra.split("-").map(Number);
      const dataCorreta = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0));
      const dataISO = dataCorreta.toISOString();

      const compraData = {
        idEmpresa: parseInt(formData.idEmpresa),
        idCliente: parseInt(formData.idCliente),
        valor_Total: parseFloat(formData.valor_Total),
        data_Compra: dataISO,
        parcelas: parseInt(formData.parcelas),
      };

      if (
        formData.dataPrimeiroVencimento &&
        formData.dataPrimeiroVencimento.trim() !== ""
      ) {
        const [anoVenc, mesVenc, diaVenc] = formData.dataPrimeiroVencimento
          .split("-")
          .map(Number);
        const dataPrimeiroVencimentoISO = new Date(
          Date.UTC(anoVenc, mesVenc - 1, diaVenc, 12, 0, 0)
        ).toISOString();
        compraData.dataPrimeiroVencimento = dataPrimeiroVencimentoISO;
      }

      console.log("Enviando dados:", compraData);
      const response = await api.post("/compras", compraData);

      toast.success("Compra registrada com sucesso!");

      if (formData.idCliente) {
        await filterComprasByCliente(formData.idCliente);
      }

      await loadClientes();

      setFormData({
        idEmpresa: "",
        idCliente: "",
        valor_Total: "",
        data_Compra: new Date().toISOString().split("T")[0],
        parcelas: 1,
        dataPrimeiroVencimento: "",
      });
    } catch (error) {
      console.error("Erro ao registrar compra:", error);
      console.error("Detalhes do erro:", error.response?.data);

      if (error.response?.data?.erro) {
        toast.error(error.response.data.erro);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.response?.data) {
        toast.error(JSON.stringify(error.response.data));
      } else {
        toast.error("Erro ao registrar compra");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClienteCriado = (novoCliente) => {
    setClientes([...clientes, novoCliente]);
    setFormData({ ...formData, idCliente: novoCliente.idCliente.toString() });
    toast.success("Cliente adicionado e selecionado automaticamente");
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompras = compras.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(compras.length / itemsPerPage);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
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
      // Se a string for "0001-01-01T00:00:00", retornar "-"
      if (typeof date === "string" && date.startsWith("0001")) {
        return "-";
      }

      const dataObj = new Date(date);

      if (isNaN(dataObj.getTime())) return "-";

      // Formatar para o padrão brasileiro
      return dataObj.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "-";
    }
  };

  const valorTotalNum = parseFloat(formData.valor_Total) || 0;
  const numeroParcelasNum = parseInt(formData.parcelas) || 0;
  const clienteNome = clienteSelecionado?.nome || "";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A2B4C" }}>
            Registrar Compra
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Cadastre uma nova compra com parcelamento
          </p>
        </div>
      </div>

      {limiteAlert.show && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">{limiteAlert.message}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa *
            </label>
            <Select
              options={empresas.map((emp) => ({
                value: emp.idEmpresa,
                label: emp.nome,
              }))}
              value={
                empresas
                  .filter(
                    (emp) => emp.idEmpresa === parseInt(formData.idEmpresa)
                  )
                  .map((emp) => ({
                    value: emp.idEmpresa,
                    label: emp.nome,
                  }))[0] || null
              }
              onChange={(selectedOption) =>
                setFormData({
                  ...formData,
                  idEmpresa: selectedOption
                    ? selectedOption.value.toString()
                    : "",
                })
              }
              placeholder="Pesquisar empresa..."
              noOptionsMessage={() => "Nenhuma empresa encontrada"}
              isClearable
              className={
                formErrors.idEmpresa ? "border border-red-500 rounded-md" : ""
              }
            />
            {formErrors.idEmpresa && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.idEmpresa}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Compra *
            </label>
            <input
              type="date"
              name="data_Compra"
              value={formData.data_Compra}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] ${
                formErrors.data_Compra ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.data_Compra && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.data_Compra}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total * (R$)
            </label>
            <input
              type="number"
              name="valor_Total"
              value={formData.valor_Total}
              onChange={handleChange}
              step="0.01"
              min="0.01"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] ${
                formErrors.valor_Total ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0,00"
            />
            {formErrors.valor_Total && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.valor_Total}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>

            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  options={clientes.map((cli) => ({
                    value: cli.idCliente,
                    label: `${cli.nome} - ${cli.cpf_Cnpj}`,
                  }))}
                  value={
                    clientes
                      .filter(
                        (cli) => cli.idCliente === parseInt(formData.idCliente)
                      )
                      .map((cli) => ({
                        value: cli.idCliente,
                        label: `${cli.nome} - ${cli.cpf_Cnpj}`,
                      }))[0] || null
                  }
                  onChange={(selectedOption) =>
                    setFormData({
                      ...formData,
                      idCliente: selectedOption
                        ? selectedOption.value.toString()
                        : "",
                    })
                  }
                  placeholder="Pesquisar cliente..."
                  noOptionsMessage={() => "Nenhum cliente encontrado"}
                  isClearable
                  className={
                    formErrors.idCliente
                      ? "border border-red-500 rounded-md"
                      : ""
                  }
                />
              </div>

              <button
                type="button"
                onClick={() => setShowClienteModal(true)}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                title="Novo Cliente"
              >
                <UserPlusIcon className="h-5 w-5" />
              </button>
            </div>

            {formErrors.idCliente && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.idCliente}
              </p>
            )}

            {clienteSelecionado && (
              <p
                className={`mt-1 text-sm font-semibold ${
                  limiteAlert.disponivel <= 0
                    ? "text-red-600"
                    : limiteAlert.disponivel < clienteSelecionado.limite * 0.3
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                Limite disponível: {formatCurrency(limiteAlert.disponivel)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data do 1º Vencimento
            </label>
            <input
              type="date"
              name="dataPrimeiroVencimento"
              value={formData.dataPrimeiroVencimento}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C]"
            />
            <p className="mt-1 text-xs text-gray-400">
              Se não preenchido, será usado o primeiro dia do próximo mês
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nº de Parcelas *
            </label>
            <input
              type="number"
              name="parcelas"
              value={formData.parcelas}
              onChange={handleChange}
              min="1"
              max="24"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] ${
                formErrors.parcelas ? "border-red-500" : "border-gray-300"
              }`}
            />
            {formErrors.parcelas && (
              <p className="mt-1 text-xs text-red-500">{formErrors.parcelas}</p>
            )}
          </div>
        </div>

        <SimulacaoParcelas
          valorTotal={valorTotalNum}
          numeroParcelas={numeroParcelasNum}
          dataPrimeiroVencimento={formData.dataPrimeiroVencimento}
          dataCompra={formData.data_Compra}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => {
              setFormData({
                idEmpresa: "",
                idCliente: "",
                valor_Total: "",
                data_Compra: new Date().toISOString().split("T")[0],
                parcelas: 1,
                dataPrimeiroVencimento: "",
              });
            }}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Limpar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-[#1A2B4C] rounded-md hover:bg-[#152340] disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrar Compra"}
          </button>
        </div>
      </form>

      {formData.idCliente && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-gray-500" />
              <h2
                className="text-lg font-semibold"
                style={{ color: "#1A2B4C" }}
              >
                Histórico de Compras - {clienteNome}
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              Total: {compras.length} compras
            </span>
          </div>

          {loadingCompras ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2B4C]"></div>
              <span className="ml-3 text-gray-500">
                Carregando histórico...
              </span>
            </div>
          ) : currentCompras.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Nenhuma compra encontrada</p>
              <p className="text-sm mt-1">
                Este cliente ainda não realizou compras
              </p>
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
                        Data Compra
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Valor Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parcelas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCompras.map((compra) => (
                      <tr
                        key={compra.idCompra}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {compra.idCompra}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(compra.data_Compra)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(compra.valor_Total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {compra.parcelas}x
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {compra.empresa || "-"}
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
                    {Math.min(indexOfLastItem, compras.length)} de{" "}
                    {compras.length}
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
      )}

      <ClienteRapidoModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onClienteCriado={handleClienteCriado}
        empresas={empresas}
      />
    </div>
  );
};

export default Compras;
