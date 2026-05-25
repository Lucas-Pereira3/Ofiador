import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import Select from "react-select";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [searchNome, setSearchNome] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [empresaInputValue, setEmpresaInputValue] = useState("");

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
  }, [searchNome, filterStatus]);

  const loadClientes = async () => {
    setLoading(true);
    try {
      const response = await api.get("/cliente");
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
      setEmpresas(response.data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast.error("Erro ao carregar empresas");
    }
  };

  const getStatusInfo = (cliente) => {
    const divida = cliente.divida || 0;
    const limite = cliente.limite;

    if (!limite || limite === 0) {
      return { text: "Sem limite", variant: "default" };
    }

    const percentual = (divida / limite) * 100;

    if (divida >= limite) {
      return { text: "Inadimplente", variant: "danger" };
    } else if (percentual >= 80) {
      return { text: "Limite Próximo", variant: "warning" };
    } else {
      return { text: "Ativo", variant: "success" };
    }
  };

  const filteredClientes = clientes.filter((cliente) => {
    const matchesNome = cliente.nome
      ?.toLowerCase()
      .includes(searchNome.toLowerCase());
    let matchesStatus = true;
    if (filterStatus !== "todos") {
      const status = getStatusInfo(cliente).text;
      matchesStatus = status === filterStatus;
    }
    return matchesNome && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClientes = filteredClientes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cpf_Cnpj") {
      const formatted = formatCPF(value);
      setFormData({ ...formData, [name]: formatted });
      if (formErrors.cpf_Cnpj) setFormErrors({ ...formErrors, cpf_Cnpj: null });
    } else if (name === "telefone") {
      const formatted = formatTelefone(value);
      setFormData({ ...formData, [name]: formatted });
    } else if (name === "limite") {
      const numValue = value.replace(/[^\d,]/g, "").replace(",", ".");
      setFormData({ ...formData, [name]: numValue });
      if (formErrors.limite) setFormErrors({ ...formErrors, limite: null });
    } else {
      setFormData({ ...formData, [name]: value });
      if (formErrors[name]) setFormErrors({ ...formErrors, [name]: null });
    }
  };

  // Handler para o Select de empresa
  const handleEmpresaChange = (selectedOption) => {
    if (selectedOption) {
      setFormData({ ...formData, idEmpresa: selectedOption.value });
      if (formErrors.idEmpresa) {
        setFormErrors({ ...formErrors, idEmpresa: null });
      }
    } else {
      setFormData({ ...formData, idEmpresa: "" });
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
        telefone: formData.telefone?.replace(/[^\d]/g, "") || null,
        email: formData.email || null,
        endereco: formData.endereco || null,
        limite: parseFloat(formData.limite),
        idEmpresa: parseInt(formData.idEmpresa),
      };

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
      toast.error(error.response?.data?.message || "Erro ao salvar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (cliente) => {
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
        toast.error(error.response?.data?.message || "Erro ao excluir cliente");
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
    setEmpresaInputValue("");
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

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

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          Mostrando {indexOfFirstItem + 1} até{" "}
          {Math.min(indexOfLastItem, filteredClientes.length)} de{" "}
          {filteredClientes.length} clientes
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          {getPageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                currentPage === page
                  ? "bg-primary-800 text-white"
                  : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Próxima
          </button>
        </div>
      </div>
    );
  };

  // Opções do Select de empresas
  const empresaOptions = empresas
    .filter((empresa) => {
      if (!empresaInputValue) return true;
      return empresa.nome
        .toLowerCase()
        .includes(empresaInputValue.toLowerCase());
    })
    .slice(0, 6) // Limita a 6 empresas
    .map((empresa) => ({
      value: empresa.idEmpresa,
      label: empresa.nome,
    }));

  // Valor selecionado
  const selectedEmpresa = empresaOptions.find(
    (opt) => opt.value === parseInt(formData.idEmpresa)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie seus clientes e limites de crédito
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          icon={PlusIcon}
        >
          Novo Cliente
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={searchNome}
                onChange={(e) => setSearchNome(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800 bg-white"
            >
              <option value="todos">Todos os status</option>
              <option value="Ativo">Ativo</option>
              <option value="Limite Próximo">Limite Próximo</option>
              <option value="Inadimplente">Inadimplente</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {/* Clientes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800" />
          </div>
          <p className="mt-4 text-gray-500">Carregando clientes...</p>
        </div>
      ) : currentClientes.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchNome
                ? "Nenhum cliente encontrado"
                : "Nenhum cliente cadastrado"}
            </p>
            {!searchNome && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Cadastrar primeiro cliente
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentClientes.map((cliente) => {
              const status = getStatusInfo(cliente);
              const disponivel = cliente.limite - (cliente.divida || 0);
              const percentualUtilizado =
                cliente.limite > 0
                  ? ((cliente.divida || 0) / cliente.limite) * 100
                  : 0;

              return (
                <Card
                  key={cliente.idCliente}
                  className="group hover:shadow-lg transition-all duration-300"
                >
                  <CardBody className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-800/10 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-primary-800" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {cliente.nome}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatCPF(cliente.cpf_Cnpj)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(cliente)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(cliente.idCliente, cliente.nome)
                          }
                          className="p-1.5 text-gray-400 hover:text-danger transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {cliente.empresa && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BuildingOfficeIcon className="h-3.5 w-3.5" />
                          <span className="text-xs">{cliente.empresa}</span>
                        </div>
                      )}
                      {cliente.telefone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <PhoneIcon className="h-3.5 w-3.5" />
                          <span className="text-xs">{cliente.telefone}</span>
                        </div>
                      )}
                      {cliente.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <EnvelopeIcon className="h-3.5 w-3.5" />
                          <span className="text-xs truncate">
                            {cliente.email}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <CreditCardIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">Limite</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(cliente.limite)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Dívida</span>
                        <span
                          className={`text-sm font-semibold ${
                            status.variant === "danger"
                              ? "text-danger"
                              : "text-gray-900"
                          }`}
                        >
                          {formatCurrency(cliente.divida || 0)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                        <div
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(percentualUtilizado, 100)}%`,
                            backgroundColor:
                              percentualUtilizado >= 100
                                ? "#D92B14"
                                : percentualUtilizado >= 80
                                ? "#CFC01A"
                                : "#108243",
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          Disponível
                        </span>
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
          <Pagination />
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingCliente ? "Editar Cliente" : "Novo Cliente"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              {editingCliente ? "Atualizar" : "Salvar"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            error={formErrors.nome}
            required
            placeholder="Digite o nome completo"
          />
          <Input
            label="CPF"
            name="cpf_Cnpj"
            value={formData.cpf_Cnpj}
            onChange={handleChange}
            error={formErrors.cpf_Cnpj}
            required
            placeholder="000.000.000-00"
            maxLength={14}
          />
          <Input
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="cliente@email.com"
          />
          <Input
            label="Endereço"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            placeholder="Digite o endereço completo"
          />
          <Input
            label="Limite de Crédito"
            name="limite"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.limite}
            onChange={handleChange}
            error={formErrors.limite}
            required
            placeholder="0,00"
          />
          <div>
            <label className="input-label">
              Empresa <span className="text-danger">*</span>
            </label>
            <Select
              options={empresaOptions}
              value={selectedEmpresa}
              onChange={handleEmpresaChange}
              onInputChange={(value) => setEmpresaInputValue(value)}
              placeholder="Pesquisar empresa..."
              noOptionsMessage={() => "Nenhuma empresa encontrada"}
              isClearable
              menuPlacement="auto"
              className={formErrors.idEmpresa ? "border-danger" : ""}
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
              }}
            />
            {formErrors.idEmpresa && (
              <p className="input-error">{formErrors.idEmpresa}</p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;
