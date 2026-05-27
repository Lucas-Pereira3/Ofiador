import React, { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import Select from "react-select";
import Button from "../components/ui/Button";
import Card, { CardBody, CardHeader } from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";

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
  const [empresaInputValue, setEmpresaInputValue] = useState("");

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
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  // Handler para o Select de empresa
  const handleEmpresaChange = (selectedOption) => {
    if (selectedOption) {
      setFormData({ ...formData, idEmpresa: selectedOption.value });
      if (errors.idEmpresa) {
        setErrors({ ...errors, idEmpresa: null });
      }
    } else {
      setFormData({ ...formData, idEmpresa: "" });
    }
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

    if (!formData.telefone.trim()) {
      errors.telefone = "Telefone é obrigatório";
    }

    if (!formData.email.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email inválido";
    }

    if (!formData.endereco.trim()) {
      errors.endereco = "Endereço é obrigatório";
    }

    if (!formData.limite) {
      errors.limite = "Limite de crédito é obrigatório";
    } else if (parseFloat(formData.limite) <= 0) {
      errors.limite = "Limite de crédito deve ser maior que zero";
    }

    if (!formData.idEmpresa) {
      errors.idEmpresa = "Empresa é obrigatória";
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    setLoading(true);
    try {
      const clienteData = {
        nome: formData.nome.trim(),
        cpf_Cnpj: formData.cpf_Cnpj.replace(/[^\d]/g, ""),
        telefone: formData.telefone.replace(/[^\d]/g, ""),
        email: formData.email.trim(),
        endereco: formData.endereco.trim(),
        limite: parseFloat(formData.limite),
        idEmpresa: parseInt(formData.idEmpresa),
      };

      const response = await api.post("/cliente", clienteData);
      toast.success("Cliente cadastrado com sucesso!");
      onClienteCriado(response.data);
      onClose();
      // Resetar formulário
      setFormData({
        nome: "",
        cpf_Cnpj: "",
        telefone: "",
        email: "",
        endereco: "",
        limite: "",
        idEmpresa: "",
      });
      setEmpresaInputValue("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao cadastrar cliente");
    } finally {
      setLoading(false);
    }
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Cliente"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} isLoading={loading}>
            Salvar
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
          error={errors.nome}
          required
        />
        <Input
          label="CPF"
          name="cpf_Cnpj"
          value={formData.cpf_Cnpj}
          onChange={handleChange}
          error={errors.cpf_Cnpj}
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
          error={errors.telefone}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />
        <Input
          label="Endereço"
          name="endereco"
          value={formData.endereco}
          onChange={handleChange}
          error={errors.endereco}
          required
        />
        <Input
          label="Limite de Crédito"
          name="limite"
          type="number"
          step="0.01"
          min="0.01"
          value={formData.limite}
          onChange={handleChange}
          error={errors.limite}
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
            menuPlacement="top"
            className={errors.idEmpresa ? "border-danger rounded-md" : ""}
            styles={{
              control: (provided, state) => ({
                ...provided,
                minHeight: "37px",
                height: "37px",
                borderRadius: "0.5rem",
                borderColor: state.isFocused ? "#1A2B4C" : "#d1d5db",
                boxShadow: state.isFocused
                  ? "0 0 0 2px rgba(26,43,76,0.15)"
                  : "none",
                fontSize: "12px", // diminui geral
              }),

              valueContainer: (provided) => ({
                ...provided,
                height: "37px",
                padding: "0 12px",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }),

              singleValue: (provided) => ({
                ...provided,
                fontSize: "11px", // valor selecionado
                maxWidth: "90%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }),

              placeholder: (provided) => ({
                ...provided,
                fontSize: "12px", // placeholder
                color: "#9ca3af",
              }),

              input: (provided) => ({
                ...provided,
                fontSize: "11px", // texto digitado
                margin: "0px",
                padding: "0px",
              }),

              option: (provided) => ({
                ...provided,
                fontSize: "11px", // opções da lista
              }),

              menu: (provided) => ({
                ...provided,
                fontSize: "11px",
              }),

              indicatorsContainer: (provided) => ({
                ...provided,
                height: "37px",
              }),

              indicatorSeparator: () => ({
                display: "none",
              }),

              menuPortal: (base) => ({
                ...base,
                zIndex: 9999,
              }),
            }}
          />
          {errors.idEmpresa && (
            <p className="input-error">{errors.idEmpresa}</p>
          )}
        </div>
      </form>
    </Modal>
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
        const [ano, mes] = dataCompra.split("-").map(Number);
        dataBase = new Date(ano, mes, 1);
      } else {
        return;
      }

      for (let i = 0; i < numeroParcelas; i++) {
        const dataVencimento = new Date(dataBase);
        if (i > 0) dataVencimento.setMonth(dataVencimento.getMonth() + i);

        let valorAtual = valorParcela;
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
      <h3 className="text-lg font-semibold mb-3 text-primary-800">
        Simulação das Parcelas
      </h3>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Parcela
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

const Compras = () => {
  const [empresas, setEmpresas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompras, setLoadingCompras] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [inputValue, setInputValue] = useState("");
  const [empresaInputValue, setEmpresaInputValue] = useState("");

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
    if (clienteSelecionado) checkLimiteCredito(clienteSelecionado);
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
      toast.error("Erro ao carregar histórico");
    } finally {
      setLoadingCompras(false);
    }
  };

  const checkLimiteCredito = (cliente) => {
    if (!cliente) return;
    const limiteDisponivel = cliente.limite - (cliente.divida || 0);

    if (formData.valor_Total) {
      const valorCompra = parseFloat(formData.valor_Total);
      if (valorCompra > limiteDisponivel) {
        setLimiteAlert({
          show: true,
          message: `Atenção! Este cliente possui apenas ${limiteDisponivel.toLocaleString(
            "pt-BR",
            {
              style: "currency",
              currency: "BRL",
            }
          )} de limite disponível. O valor da compra excede o limite.`,
          disponivel: limiteDisponivel,
        });
        return;
      }
    }
    setLimiteAlert({ show: false, message: "", disponivel: limiteDisponivel });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) setFormErrors({ ...formErrors, [name]: null });
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
    if (!formData.parcelas || formData.parcelas < 1)
      errors.parcelas = "Número de parcelas deve ser pelo menos 1";
    if (formData.parcelas > 24)
      errors.parcelas = "Número máximo de parcelas é 24";

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
      const compraData = {
        idEmpresa: parseInt(formData.idEmpresa),
        idCliente: parseInt(formData.idCliente),
        valor_Total: parseFloat(formData.valor_Total),
        data_Compra: dataCorreta.toISOString(),
        parcelas: parseInt(formData.parcelas),
      };

      if (
        formData.dataPrimeiroVencimento &&
        formData.dataPrimeiroVencimento.trim() !== ""
      ) {
        const [anoVenc, mesVenc, diaVenc] = formData.dataPrimeiroVencimento
          .split("-")
          .map(Number);
        compraData.dataPrimeiroVencimento = new Date(
          Date.UTC(anoVenc, mesVenc - 1, diaVenc, 12, 0, 0)
        ).toISOString();
      }

      await api.post("/compras", compraData);
      toast.success("Compra registrada com sucesso!");

      if (formData.idCliente) await filterComprasByCliente(formData.idCliente);
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
      toast.error(
        error.response?.data?.erro ||
          error.response?.data?.message ||
          "Erro ao registrar compra"
      );
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    if (typeof date === "string" && date.startsWith("0001")) return "-";
    try {
      const dataObj = new Date(date);
      if (isNaN(dataObj.getTime())) return "-";
      return dataObj.toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  };

  const valorTotalNum = parseFloat(formData.valor_Total) || 0;
  const numeroParcelasNum = parseInt(formData.parcelas) || 0;
  const clienteNome = clienteSelecionado?.nome || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Registrar Compra</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cadastre uma nova compra com parcelamento
        </p>
      </div>

      {limiteAlert.show && (
        <div className="bg-warning/10 border-l-4 border-warning p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
            <p className="text-sm text-warning">{limiteAlert.message}</p>
          </div>
        </div>
      )}

      <Card>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="input-label">Empresa *</label>
                <Select
                  options={empresas
                    .filter(
                      (emp) =>
                        !empresaInputValue ||
                        emp.nome
                          .toLowerCase()
                          .includes(empresaInputValue.toLowerCase())
                    )
                    .slice(0, empresaInputValue ? empresas.length : 6)
                    .map((emp) => ({ value: emp.idEmpresa, label: emp.nome }))}
                  value={
                    empresas.find(
                      (emp) => emp.idEmpresa === parseInt(formData.idEmpresa)
                    )
                      ? {
                          value: parseInt(formData.idEmpresa),
                          label: empresas.find(
                            (emp) =>
                              emp.idEmpresa === parseInt(formData.idEmpresa)
                          )?.nome,
                        }
                      : null
                  }
                  onChange={(opt) =>
                    setFormData({
                      ...formData,
                      idEmpresa: opt ? opt.value.toString() : "",
                    })
                  }
                  onInputChange={(val) => setEmpresaInputValue(val)}
                  placeholder="Pesquisar empresa..."
                  isClearable
                  menuPlacement="auto"
                  menuPortalTarget={document.body}
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      minHeight: "37px",
                      height: "37px",
                      borderRadius: "0.5rem",
                      borderColor: state.isFocused ? "#1A2B4C" : "#d1d5db",
                      boxShadow: state.isFocused
                        ? "0 0 0 2px rgba(26,43,76,0.15)"
                        : "none",
                      fontSize: "12px", // diminui geral
                    }),

                    valueContainer: (provided) => ({
                      ...provided,
                      height: "37px",
                      padding: "0 12px",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }),

                    singleValue: (provided) => ({
                      ...provided,
                      fontSize: "11px", // valor selecionado
                      maxWidth: "90%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }),

                    placeholder: (provided) => ({
                      ...provided,
                      fontSize: "12px", // placeholder
                      color: "#9ca3af",
                    }),

                    input: (provided) => ({
                      ...provided,
                      fontSize: "11px", // texto digitado
                      margin: "0px",
                      padding: "0px",
                    }),

                    option: (provided) => ({
                      ...provided,
                      fontSize: "11px", // opções da lista
                    }),

                    menu: (provided) => ({
                      ...provided,
                      fontSize: "11px",
                    }),

                    indicatorsContainer: (provided) => ({
                      ...provided,
                      height: "37px",
                    }),

                    indicatorSeparator: () => ({
                      display: "none",
                    }),

                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
                {formErrors.idEmpresa && (
                  <p className="input-error">{formErrors.idEmpresa}</p>
                )}
              </div>

              <div>
                <label className="input-label">Data da Compra *</label>
                <input
                  type="date"
                  name="data_Compra"
                  value={formData.data_Compra}
                  onChange={handleChange}
                  className={`input ${
                    formErrors.data_Compra ? "border-danger" : ""
                  }`}
                />
                {formErrors.data_Compra && (
                  <p className="input-error">{formErrors.data_Compra}</p>
                )}
              </div>

              <div>
                <label className="input-label">Valor Total * (R$)</label>
                <input
                  type="number"
                  name="valor_Total"
                  value={formData.valor_Total}
                  onChange={handleChange}
                  step="0.01"
                  min="0.01"
                  className={`input ${
                    formErrors.valor_Total ? "border-danger" : ""
                  }`}
                  placeholder="0,00"
                />
                {formErrors.valor_Total && (
                  <p className="input-error">{formErrors.valor_Total}</p>
                )}
              </div>

              <div>
                <label className="input-label">Cliente *</label>
                <div className="flex gap-2">
                  <div className="flex-1">
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
                        clientes.find(
                          (cli) =>
                            cli.idCliente === parseInt(formData.idCliente)
                        )
                          ? {
                              value: parseInt(formData.idCliente),
                              label: `${
                                clientes.find(
                                  (cli) =>
                                    cli.idCliente ===
                                    parseInt(formData.idCliente)
                                )?.nome
                              } - ${
                                clientes.find(
                                  (cli) =>
                                    cli.idCliente ===
                                    parseInt(formData.idCliente)
                                )?.cpf_Cnpj
                              }`,
                            }
                          : null
                      }
                      onChange={(opt) =>
                        setFormData({
                          ...formData,
                          idCliente: opt ? opt.value.toString() : "",
                        })
                      }
                      onInputChange={(val) => setInputValue(val)}
                      placeholder="Pesquisar cliente..."
                      isClearable
                      menuPlacement="auto"
                      menuPortalTarget={document.body}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          minHeight: "37px",
                          height: "37px",
                          borderRadius: "0.5rem",
                          borderColor: state.isFocused ? "#1A2B4C" : "#d1d5db",
                          boxShadow: state.isFocused
                            ? "0 0 0 2px rgba(26,43,76,0.15)"
                            : "none",
                          fontSize: "12px", // diminui geral
                        }),

                        valueContainer: (provided) => ({
                          ...provided,
                          height: "37px",
                          padding: "0 12px",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }),

                        singleValue: (provided) => ({
                          ...provided,
                          fontSize: "11px", // valor selecionado
                          maxWidth: "90%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }),

                        placeholder: (provided) => ({
                          ...provided,
                          fontSize: "12px", // placeholder
                          color: "#9ca3af",
                        }),

                        input: (provided) => ({
                          ...provided,
                          fontSize: "11px", // texto digitado
                          margin: "0px",
                          padding: "0px",
                        }),

                        option: (provided) => ({
                          ...provided,
                          fontSize: "11px", // opções da lista
                        }),

                        menu: (provided) => ({
                          ...provided,
                          fontSize: "11px",
                        }),

                        indicatorsContainer: (provided) => ({
                          ...provided,
                          height: "37px",
                        }),

                        indicatorSeparator: () => ({
                          display: "none",
                        }),

                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                      }}
                    />
                  </div>
                  <Button
                    onClick={() => setShowClienteModal(true)}
                    icon={UserPlusIcon}
                    className="!px-3"
                  >
                    Novo
                  </Button>
                </div>
                {formErrors.idCliente && (
                  <p className="input-error">{formErrors.idCliente}</p>
                )}
                {clienteSelecionado && (
                  <p
                    className={`mt-1 text-sm font-semibold ${
                      limiteAlert.disponivel <= 0
                        ? "text-danger"
                        : limiteAlert.disponivel <
                          clienteSelecionado.limite * 0.3
                        ? "text-warning"
                        : "text-success"
                    }`}
                  >
                    Limite disponível: {formatCurrency(limiteAlert.disponivel)}
                  </p>
                )}
              </div>

              <div>
                <label className="input-label">Data do 1º Vencimento</label>
                <input
                  type="date"
                  name="dataPrimeiroVencimento"
                  value={formData.dataPrimeiroVencimento}
                  onChange={handleChange}
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Se não preenchido, será usado o primeiro dia do próximo mês
                </p>
              </div>

              <div>
                <label className="input-label">Nº de Parcelas *</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  name="parcelas"
                  value={formData.parcelas}
                  onChange={(e) => {
                    let valor = e.target.value;

                    valor = valor.replace(/^0+/, "");

                    if (valor === "") {
                      setFormData({
                        ...formData,
                        parcelas: "",
                      });
                      return;
                    }

                    const numero = parseInt(valor);

                    if (numero > 24) {
                      toast.error("O número máximo de parcelas é 24");
                      return;
                    }

                    setFormData({
                      ...formData,
                      parcelas: valor,
                    });
                  }}
                  className={`input ${
                    formErrors.parcelas ? "border-danger focus:ring-danger" : ""
                  }`}
                />
                {formData.parcelas > 24 && (
                  <p className="mt-1 text-sm text-danger">
                    O número máximo permitido é 24 parcelas.
                  </p>
                )}
                {formErrors.parcelas && (
                  <p className="input-error">{formErrors.parcelas}</p>
                )}
              </div>
            </div>

            <SimulacaoParcelas
              valorTotal={valorTotalNum}
              numeroParcelas={numeroParcelasNum}
              dataPrimeiroVencimento={formData.dataPrimeiroVencimento}
              dataCompra={formData.data_Compra}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
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
              >
                Limpar
              </Button>
              <Button type="submit" isLoading={loading} icon={ShoppingCartIcon}>
                Registrar Compra
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {formData.idCliente && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ReceiptPercentIcon className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-primary-800">
                  Histórico de Compras - {clienteNome}
                </h2>
              </div>
              <Badge variant="info">Total: {compras.length} compras</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            {loadingCompras ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-800" />
                <span className="ml-3 text-gray-500">
                  Carregando histórico...
                </span>
              </div>
            ) : currentCompras.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCartIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p>Nenhuma compra encontrada</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Data Compra
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Valor Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Parcelas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Empresa
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentCompras.map((compra) => (
                        <tr key={compra.idCompra} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {compra.idCompra}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {formatDate(compra.data_Compra)}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {formatCurrency(compra.valor_Total)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {compra.parcelas}x
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {compra.empresa || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center px-6 py-3 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      Mostrando {indexOfFirstItem + 1} até{" "}
                      {Math.min(indexOfLastItem, compras.length)} de{" "}
                      {compras.length}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                        className="p-2 rounded-md border bg-white disabled:opacity-50"
                      >
                        <ChevronLeftIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-md border bg-white disabled:opacity-50"
                      >
                        <ChevronRightIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardBody>
        </Card>
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
