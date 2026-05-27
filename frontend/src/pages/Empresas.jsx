import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import Button from "../components/ui/Button";
import Card, { CardBody } from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empresaToDelete, setEmpresaToDelete] = useState(null);

  const [formData, setFormData] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
  });

  useEffect(() => {
    loadEmpresas();
  }, []);

  useEffect(() => {
    filterEmpresas();
    setCurrentPage(1);
  }, [searchTerm, empresas]);

  const loadEmpresas = async () => {
    setLoading(true);
    try {
      const response = await api.get("/empresa");
      setEmpresas(response.data);
      setFilteredEmpresas(response.data);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  const filterEmpresas = () => {
    if (!searchTerm.trim()) {
      setFilteredEmpresas(empresas);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = empresas.filter((empresa) => {
      const nomeMatch = empresa.nome?.toLowerCase().includes(term);
      const cnpjClean = empresa.cnpj?.replace(/[^\d]/g, "");
      const termClean = term.replace(/[^\d]/g, "");
      const cnpjMatch = termClean.length > 0 && cnpjClean?.includes(termClean);
      const enderecoMatch = empresa.endereco?.toLowerCase().includes(term);
      const telefoneMatch = empresa.telefone?.toLowerCase().includes(term);
      const emailMatch = empresa.email?.toLowerCase().includes(term);

      return (
        nomeMatch || cnpjMatch || enderecoMatch || telefoneMatch || emailMatch
      );
    });

    setFilteredEmpresas(filtered);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentEmpresas = filteredEmpresas.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredEmpresas.length / itemsPerPage);

  const validateCNPJ = (cnpj) => {
    const cnpjClean = cnpj.replace(/[^\d]/g, "");
    if (cnpjClean.length !== 14) return false;

    let size = cnpjClean.length - 2;
    let numbers = cnpjClean.substring(0, size);
    const digits = cnpjClean.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    size = size + 1;
    numbers = cnpjClean.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  };

  const formatCNPJ = (value) => {
    const cnpjClean = value.replace(/[^\d]/g, "");
    if (cnpjClean.length <= 2) return cnpjClean;
    if (cnpjClean.length <= 5)
      return cnpjClean.replace(/^(\d{2})(\d{0,3})/, "$1.$2");
    if (cnpjClean.length <= 8)
      return cnpjClean.replace(/^(\d{2})(\d{3})(\d{0,3})/, "$1.$2.$3");
    if (cnpjClean.length <= 12)
      return cnpjClean.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{0,4})/,
        "$1.$2.$3/$4"
      );
    return cnpjClean.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  const formatTelefone = (value) => {
    const clean = value.replace(/[^\d]/g, "");
    if (clean.length <= 2) return clean;
    if (clean.length <= 6) return clean.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
    if (clean.length <= 10)
      return clean.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    return clean.replace(/^(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nome.trim()) {
      errors.nome = "Nome é obrigatório";
    } else if (formData.nome.length < 3) {
      errors.nome = "Nome deve ter pelo menos 3 caracteres";
    }

    if (!formData.cnpj.trim()) {
      errors.cnpj = "CNPJ é obrigatório";
    } else {
      const cnpjClean = formData.cnpj.replace(/[^\d]/g, "");
      if (cnpjClean.length !== 14) {
        errors.cnpj = "CNPJ deve ter 14 dígitos";
      } else if (!validateCNPJ(formData.cnpj)) {
        errors.cnpj = "CNPJ inválido";
      }
    }

    if (!formData.endereco.trim()) {
      errors.endereco = "Endereço é obrigatório";
    }
    if (!formData.telefone.trim()) {
      errors.telefone = "Telefone é obrigatório";
    }

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cnpj") {
      const formatted = formatCNPJ(value);
      setFormData({ ...formData, [name]: formatted });

      if (formErrors.cnpj) {
        setFormErrors({ ...formErrors, cnpj: null });
      }
    } else if (name === "telefone") {
      const formatted = formatTelefone(value);
      setFormData({ ...formData, [name]: formatted });

      if (formErrors.telefone) {
        setFormErrors({ ...formErrors, telefone: null });
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
      const empresaData = {
        nome: formData.nome.trim(),
        cnpj: formData.cnpj.replace(/[^\d]/g, ""),
        endereco: formData.endereco.trim(),
        telefone: formData.telefone.replace(/[^\d]/g, ""),
        email: formData.email.trim(),
      };

      if (editingEmpresa) {
        await api.put(`/empresa/${editingEmpresa.idEmpresa}`, empresaData);
        toast.success("Empresa atualizada com sucesso!");
      } else {
        await api.post("/empresa", empresaData);
        toast.success("Empresa cadastrada com sucesso!");
      }

      setShowModal(false);
      resetForm();
      await loadEmpresas();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      if (error.response?.data?.erro) {
        toast.error(error.response.data.erro);
        if (error.response.data.erro.includes("CNPJ")) {
          setFormErrors({ ...formErrors, cnpj: error.response.data.erro });
        }
      } else {
        toast.error(error.response?.data?.message || "Erro ao salvar empresa");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (empresa) => {
    setEditingEmpresa(empresa);
    setFormData({
      nome: empresa.nome || "",
      cnpj: empresa.cnpj ? formatCNPJ(empresa.cnpj) : "",
      endereco: empresa.endereco || "",
      telefone: empresa.telefone || "",
      email: empresa.email || "",
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = (empresa) => {
    setEmpresaToDelete(empresa);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/empresa/${empresaToDelete.idEmpresa}`);

      toast.success("Empresa excluída com sucesso!");

      await loadEmpresas();

      setShowDeleteModal(false);
      setEmpresaToDelete(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Empresa possui clientes com dívidas pendentes"
      );
    }
  };

  const resetForm = () => {
    setEditingEmpresa(null);
    setFormData({
      nome: "",
      cnpj: "",
      endereco: "",
      telefone: "",
      email: "",
    });
    setFormErrors({});
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
          {Math.min(indexOfLastItem, filteredEmpresas.length)} de{" "}
          {filteredEmpresas.length} empresas
        </p>
        <div className="flex gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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
            className="px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie todas as empresas cadastradas no sistema
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          icon={PlusIcon}
          className="self-start sm:self-auto w-auto"
        >
          Nova Empresa
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardBody className="p-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, endereço, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800"
            />
          </div>
        </CardBody>
      </Card>

      {/* Empresas Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800" />
          </div>
          <p className="mt-4 text-gray-500">Carregando empresas...</p>
        </div>
      ) : currentEmpresas.length === 0 ? (
        <Card>
          <CardBody className="py-12 text-center">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm
                ? "Nenhuma empresa encontrada"
                : "Nenhuma empresa cadastrada"}
            </p>
            {!searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Cadastrar primeira empresa
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentEmpresas.map((empresa) => (
              <Card
                key={empresa.idEmpresa}
                className="group hover:shadow-lg transition-all duration-300"
              >
                <CardBody className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-800/10 flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6 text-primary-800" />
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(empresa)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(empresa)}
                        className="p-1.5 text-gray-400 hover:text-danger transition-colors"
                        title="Excluir"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                    {empresa.nome}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    CNPJ: {empresa.cnpj ? formatCNPJ(empresa.cnpj) : "-"}
                  </p>

                  <div className="space-y-2 text-sm">
                    {empresa.endereco && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPinIcon className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                        <span className="text-xs line-clamp-2">
                          {empresa.endereco}
                        </span>
                      </div>
                    )}
                    {empresa.telefone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <PhoneIcon className="h-3.5 w-3.5" />
                        <span className="text-xs">{empresa.telefone}</span>
                      </div>
                    )}
                    {empresa.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <EnvelopeIcon className="h-3.5 w-3.5" />
                        <span className="text-xs truncate">
                          {empresa.email}
                        </span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
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
        title={editingEmpresa ? "Editar Empresa" : "Nova Empresa"}
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
              {editingEmpresa ? "Atualizar" : "Salvar"}
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
            placeholder="Digite o nome da empresa"
          />
          <Input
            label="CNPJ"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            error={formErrors.cnpj}
            required
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
          <Input
            label="Endereço"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            error={formErrors.endereco}
            required
            placeholder="Digite o endereço completo"
          />
          <Input
            label="Telefone"
            name="telefone"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="(00) 00000-0000"
            maxLength={15}
            error={formErrors.telefone}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="contato@empresa.com"
            error={formErrors.email}
            required
          />
        </form>
      </Modal>
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar exclusão"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>

            <Button variant="danger" onClick={confirmDelete}>
              Excluir
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Tem certeza que deseja excluir a empresa{" "}
          <strong>{empresaToDelete?.nome}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default Empresas;
