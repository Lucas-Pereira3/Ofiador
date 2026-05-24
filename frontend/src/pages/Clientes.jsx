import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Filtros
  const [searchNome, setSearchNome] = useState("");
  const [searchCpf, setSearchCpf] = useState("");
  const [searchEmpresa, setSearchEmpresa] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    nome: "",
    cpf_Cnpj: "",
    telefone: "",
    email: "",
    endereco: "",
    limite: "",
    idEmpresa: "",
  });

  const { user } = useAuth();

  useEffect(() => {
    loadClientes();
    loadEmpresas();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchNome, searchCpf, searchEmpresa, filterStatus]);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/cliente");
      console.log("Clientes carregados:", response.data);
      setClientes(response.data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      const response = await api.get("/empresa");
      console.log("Empresas carregadas:", response.data);
      setEmpresas(response.data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast.error("Erro ao carregar empresas");
    }
  };

  // Função para determinar o status do cliente
  const getStatusInfo = (cliente) => {
    const divida = cliente.divida || 0;
    const limite = cliente.limite;

    if (!limite || limite === 0) {
      return {
        text: "Sem limite",
        color: "#9CA3AF",
        bg: "rgba(156, 163, 175, 0.1)",
      };
    }

    const percentual = (divida / limite) * 100;

    if (divida >= limite) {
      return {
        text: "Inadimplente",
        color: "#D92B14",
        bg: "rgba(217, 43, 20, 0.1)",
      };
    } else if (percentual >= 80) {
      return {
        text: "Limite Próximo",
        color: "#CFC01A",
        bg: "rgba(207, 192, 26, 0.1)",
      };
    } else {
      return { text: "Ativo", color: "#108243", bg: "rgba(16, 130, 67, 0.1)" };
    }
  };

  // Filtrar clientes
  const filteredClientes = clientes.filter((cliente) => {
    // Filtro por nome
    const matchesNome = cliente.nome
      ?.toLowerCase()
      .includes(searchNome.toLowerCase());

    // Filtro por CPF
    const matchesCpf = cliente.cpf_Cnpj?.includes(searchCpf);

    // Filtro por empresa
    const empresaNome = cliente.empresa?.toLowerCase() || "";
    const matchesEmpresa =
      !searchEmpresa || empresaNome.includes(searchEmpresa.toLowerCase());

    // Filtro por status
    let matchesStatus = true;
    if (filterStatus !== "todos") {
      const status = getStatusInfo(cliente).text;
      matchesStatus = status === filterStatus;
    }

    return matchesNome && matchesCpf && matchesEmpresa && matchesStatus;
  });

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClientes = filteredClientes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const totalClientes = filteredClientes.length;

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Limpar todos os filtros
  const clearFilters = () => {
    setSearchNome("");
    setSearchCpf("");
    setSearchEmpresa("");
    setFilterStatus("todos");
  };

  // Verificar se há filtros ativos
  const hasActiveFilters =
    searchNome || searchCpf || searchEmpresa || filterStatus !== "todos";

  // Validação de CPF
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

  const validateForm = () => {
    const errors = {};

    if (!formData.nome.trim()) {
      errors.nome = "Nome é obrigatório";
    } else if (formData.nome.length < 3) {
      errors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!formData.cpf_Cnpj.trim()) {
      errors.cpf_Cnpj = "CPF é obrigatório";
    } else {
      const cpfClean = formData.cpf_Cnpj.replace(/[^\d]/g, "");
      if (cpfClean.length !== 11) {
        errors.cpf_Cnpj = "CPF deve ter 11 dígitos";
      } else if (!validateCPF(formData.cpf_Cnpj)) {
        errors.cpf_Cnpj = "CPF inválido";
      }
    }

    if (!formData.limite) {
      errors.limite = "Limite de crédito é obrigatório";
    } else if (parseFloat(formData.limite) <= 0) {
      errors.limite = "Limite de crédito deve ser maior que zero";
    }

    if (!formData.idEmpresa) {
      errors.idEmpresa = "Empresa é obrigatória";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cpf_Cnpj") {
      const formatted = formatCPF(value);
      setFormData({ ...formData, [name]: formatted });
      if (formErrors.cpf_Cnpj) {
        setFormErrors({ ...formErrors, cpf_Cnpj: null });
      }
    } else if (name === "telefone") {
      const formatted = formatTelefone(value);
      setFormData({ ...formData, [name]: formatted });
    } else if (name === "limite") {
      const numValue = value.replace(/[^\d,]/g, "").replace(",", ".");
      setFormData({ ...formData, [name]: numValue });
      if (formErrors.limite) {
        setFormErrors({ ...formErrors, limite: null });
      }
    } else {
      setFormData({ ...formData, [name]: value });
      if (formErrors[name]) {
        setFormErrors({ ...formErrors, [name]: null });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsSubmitting(true);

    try {
      const clienteData = {
        nome: formData.nome.trim(),
        cpf_Cnpj: formData.cpf_Cnpj.replace(/[^\d]/g, ""),
        telefone: formData.telefone || null,
        email: formData.email || null,
        endereco: formData.endereco || null,
        limite: parseFloat(formData.limite),
        idEmpresa: parseInt(formData.idEmpresa),
      };

      console.log("Enviando dados:", clienteData);

      if (editingCliente) {
        await api.put(`/cliente/${editingCliente.idCliente}`, clienteData);
        toast.success("Cliente atualizado com sucesso!");
      } else {
        await api.post("/cliente", clienteData);
        toast.success("Cliente cadastrado com sucesso!");
      }

      setShowModal(false);
      resetForm();
      await loadClientes();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.erro ||
        "Erro ao salvar cliente";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cliente) => {
    console.log("Editando cliente:", cliente);
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome || "",
      cpf_Cnpj: cliente.cpf_Cnpj ? formatCPF(cliente.cpf_Cnpj) : "",
      telefone: cliente.telefone || "",
      email: cliente.email || "",
      endereco: cliente.endereco || "",
      limite: cliente.limite || "",
      idEmpresa: cliente.idEmpresa || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente "${nome}"?`)) {
      try {
        await api.delete(`/cliente/${id}`);
        toast.success("Cliente excluído com sucesso!");
        await loadClientes();
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
        const message =
          error.response?.data?.message ||
          error.response?.data?.erro ||
          "Erro ao excluir cliente";
        toast.error(message);
      }
    }
  };

  const resetForm = () => {
    setEditingCliente(null);
    setFormData({
      nome: "",
      cpf_Cnpj: "",
      telefone: "",
      email: "",
      endereco: "",
      limite: "",
      idEmpresa: "",
    });
    setFormErrors({});
  };

  const openNewModal = () => {
    resetForm();
    setShowModal(true);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + 4);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header com botão Novo Cliente */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#1A2B4C" }}>
            Lista de Clientes
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus clientes e limites de crédito.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1A2B4C] hover:bg-[#152340] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B4C] transition-colors duration-200"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Cliente
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Busca por Nome */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Buscar Cliente
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Digite o nome..."
                value={searchNome}
                onChange={(e) => setSearchNome(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1A2B4C] focus:border-[#1A2B4C] sm:text-sm"
              />
            </div>
          </div>

          {/* Busca por CPF */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Buscar por CPF
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={searchCpf}
                onChange={(e) => setSearchCpf(e.target.value)}
                maxLength={14}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1A2B4C] focus:border-[#1A2B4C] sm:text-sm"
              />
            </div>
          </div>

          {/* Busca por Empresa */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Buscar Empresa
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Digite o nome da empresa..."
                value={searchEmpresa}
                onChange={(e) => setSearchEmpresa(e.target.value)}
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1A2B4C] focus:border-[#1A2B4C] sm:text-sm"
              />
            </div>
          </div>

          {/* Filtro por Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#1A2B4C] focus:border-[#1A2B4C] sm:text-sm"
            >
              <option value="todos">Todos os status</option>
              <option value="Ativo">Ativo</option>
              <option value="Limite Próximo">Limite Próximo</option>
              <option value="Inadimplente">Inadimplente</option>
            </select>
          </div>
        </div>

        {/* Botão de limpar filtros */}
        {hasActiveFilters && (
          <div className="flex justify-end pt-2">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <XMarkIcon className="h-4 w-4" />
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Tabela de Clientes */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empresa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dívida
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A2B4C]"></div>
                      <span className="ml-3 text-gray-500">
                        Carregando clientes...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : currentClientes.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {hasActiveFilters ? (
                        <>
                          <p className="text-lg">Nenhum cliente encontrado</p>
                          <p className="text-sm mt-1">
                            Tente ajustar os filtros de busca
                          </p>
                          <button
                            onClick={clearFilters}
                            className="mt-3 text-sm text-[#1A2B4C] hover:underline"
                          >
                            Limpar todos os filtros
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-lg">Nenhum cliente cadastrado</p>
                          <p className="text-sm mt-1">
                            Clique em "Novo Cliente" para começar
                          </p>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentClientes.map((cliente) => {
                  const status = getStatusInfo(cliente);
                  const disponivel = cliente.limite - (cliente.divida || 0);
                  return (
                    <tr
                      key={cliente.idCliente}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.idCliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.nome}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.cpf_Cnpj ? formatCPF(cliente.cpf_Cnpj) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.empresa || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.telefone || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {cliente.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(cliente.limite)}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-semibold"
                        style={{ color: status.color }}
                      >
                        {formatCurrency(cliente.divida || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="text-blue-600 hover:text-blue-900 mr-3 transition-colors duration-200"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(cliente.idCliente, cliente.nome)
                          }
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          title="Excluir"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação e Legenda */}
        {!loading && totalClientes > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Legenda */}
              <div className="flex gap-4 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#108243" }}
                  ></span>
                  <span className="text-gray-600">Ativo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#CFC01A" }}
                  ></span>
                  <span className="text-gray-600">Limite Próximo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: "#D92B14" }}
                  ></span>
                  <span className="text-gray-600">
                    Inadimplente / Limite Esgotado
                  </span>
                </div>
              </div>

              {/* Paginação */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 mr-2">
                  Total: {totalClientes}
                </span>
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {getPageNumbers().map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentPage === pageNum
                        ? "bg-[#1A2B4C] text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-md border ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold" style={{ color: "#1A2B4C" }}>
                {editingCliente ? "Editar Cliente" : "Novo Cliente"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent ${
                    formErrors.nome ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Digite o nome completo"
                />
                {formErrors.nome && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.nome}</p>
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent ${
                    formErrors.cpf_Cnpj ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="000.000.000-00"
                />
                {formErrors.cpf_Cnpj && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.cpf_Cnpj}
                  </p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent"
                  placeholder="cliente@email.com"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent"
                  placeholder="Digite o endereço completo"
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent ${
                    formErrors.limite ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0,00"
                />
                {formErrors.limite && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.limite}
                  </p>
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
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent ${
                    formErrors.idEmpresa ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.idEmpresa} value={empresa.idEmpresa}>
                      {empresa.nome}
                    </option>
                  ))}
                </select>
                {formErrors.idEmpresa && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.idEmpresa}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B4C] transition-colors duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1A2B4C] border border-transparent rounded-md hover:bg-[#152340] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1A2B4C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting
                    ? editingCliente
                      ? "Atualizando..."
                      : "Salvando..."
                    : editingCliente
                    ? "Atualizar"
                    : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
