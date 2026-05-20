import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import logo from "../assets/logo.png";
import sideImage from "../assets/image.png";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
    nome: "",
  });
  // Estado para controlar se os campos já foram tocados (para mostrar erro)
  const [touched, setTouched] = useState({
    email: false,
    senha: false,
    nome: false,
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Função para validar email e retornar mensagem específica
  const getEmailError = (email) => {
    if (!email) return null;

    if (!email.includes("@")) {
      return `Inclua um "@" no endereço de e-mail. "${email}" está com um "@" faltando.`;
    }

    if (email.includes("@")) {
      const [localPart, domain] = email.split("@");
      if (!localPart) return "Digite algo antes do '@'";
      if (!domain) return "Digite algo depois do '@'";
      if (!domain.includes(".")) {
        return `Inclua um ponto "." após o "@". "${domain}" está com um ponto faltando.`;
      }
      if (domain.split(".").pop().length < 2) {
        return "O domínio deve ter pelo menos 2 caracteres após o ponto";
      }
    }

    return null;
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateStrongPassword = (senha) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(senha);
  };

  const getPasswordErrors = (senha) => {
    const errors = [];
    if (senha.length < 8) errors.push("• Mínimo 8 caracteres");
    if (!/[A-Z]/.test(senha)) errors.push("• Pelo menos 1 letra maiúscula");
    if (!/\d/.test(senha)) errors.push("• Pelo menos 1 número");
    if (!/[\W_]/.test(senha))
      errors.push("• Pelo menos 1 símbolo (@, #, $, etc)");
    return errors;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true,
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos os campos como tocados
    setTouched({
      email: true,
      senha: true,
      nome: !isLogin, // Só marca nome se estiver em modo cadastro
    });

    // Validações
    if (!validateEmail(formData.email)) {
      return;
    }

    let success;
    if (isLogin) {
      success = await login(formData.email, formData.senha);
    } else {
      if (!formData.nome.trim()) {
        return;
      }

      if (!validateStrongPassword(formData.senha)) {
        return;
      }

      success = await register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
      });
    }

    if (success) {
      if (isLogin) {
        navigate("/dashboard");
      } else {
        setIsLogin(true);
        setFormData({
          email: "",
          senha: "",
          nome: "",
        });
        setShowPassword(false);
        setTouched({
          email: false,
          senha: false,
          nome: false,
        });
      }
    }
  };

  // Verificações em tempo real
  const passwordErrors =
    !isLogin && formData.senha ? getPasswordErrors(formData.senha) : [];
  const isPasswordValid =
    !isLogin && formData.senha && passwordErrors.length === 0;

  const isEmailValid = formData.email === "" || validateEmail(formData.email);
  const emailErrorMessage = getEmailError(formData.email);
  // Só mostra erro se o campo foi tocado E está inválido E não está vazio
  const showEmailError =
    touched.email && formData.email !== "" && !isEmailValid;
  // Erro de campo vazio
  const showEmailEmptyError = touched.email && formData.email === "";

  const isNomeValid = formData.nome.trim() !== "";
  const showNomeError = touched.nome && formData.nome !== "" && !isNomeValid;
  const showNomeEmptyError = touched.nome && formData.nome === "";

  // Validação da senha para campos vazios
  const showSenhaEmptyError = touched.senha && formData.senha === "";
  const showSenhaError =
    !isLogin && touched.senha && formData.senha !== "" && !isPasswordValid;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Coluna da imagem - lado esquerdo */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gray-200">
          {sideImage ? (
            <img
              src={sideImage}
              alt="Ofiador"
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Erro ao carregar imagem:", sideImage);
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <p className="text-gray-500">Imagem não encontrada</p>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white p-8">
            <h2 className="text-2xl font-bold text-center">
              Bem-vindo ao Ofiador
            </h2>
            <p className="text-center mt-2">Sua plataforma de gestão</p>
          </div>
        </div>

        {/* Coluna do formulário - lado direito */}
        <div className="w-full lg:w-1/2 p-8 lg:p-10 pt-6 overflow-y-auto">
          <div className="flex justify-center -mt-8 mb-2">
            {logo ? (
              <img src={logo} alt="Logo" className="w-38 h-38 object-contain" />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            )}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? "Bem-vindo de volta!" : "Criar conta"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {isLogin
                ? "Acesso exclusivo para usuários"
                : "Cadastre-se para começar"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* CAMPO NOME COM VALIDAÇÃO VISUAL */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome completo
                </label>
                <input
                  name="nome"
                  type="text"
                  placeholder="Digite seu nome completo"
                  value={formData.nome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input mt-1 w-full ${
                    showNomeError || showNomeEmptyError
                      ? "border-red-500 focus:ring-red-500"
                      : formData.nome !== "" && isNomeValid
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                  }`}
                />
                {showNomeEmptyError && (
                  <p className="mt-1 text-xs text-red-500">
                    Digite seu nome completo
                  </p>
                )}
                {showNomeError && (
                  <p className="mt-1 text-xs text-red-500">Nome inválido</p>
                )}
              </div>
            )}

            {/* CAMPO EMAIL COM VALIDAÇÃO VISUAL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="text"
                placeholder="Digite seu endereço de e-mail"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`input mt-1 w-full ${
                  showEmailError || showEmailEmptyError
                    ? "border-red-500 focus:ring-red-500"
                    : formData.email !== "" && isEmailValid
                    ? "border-green-500 focus:ring-green-500"
                    : ""
                }`}
              />
              {showEmailEmptyError && (
                <p className="mt-1 text-xs text-red-500">
                  Digite seu endereço de e-mail
                </p>
              )}
              {showEmailError && emailErrorMessage && (
                <p className="mt-1 text-xs text-red-500">{emailErrorMessage}</p>
              )}
            </div>

            {/* CAMPO SENHA COM VALIDAÇÃO VISUAL */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  name="senha"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isLogin
                      ? "Digite sua senha"
                      : "Crie sua senha (mínimo 8 caracteres)"
                  }
                  value={formData.senha}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`input w-full pr-10 ${
                    showSenhaEmptyError || showSenhaError
                      ? "border-red-500 focus:ring-red-500"
                      : formData.senha !== "" && !showSenhaError
                      ? "border-green-500 focus:ring-green-500"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={handleClickShowPassword}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Visibility /> : <VisibilityOff />}
                </button>
              </div>

              {/* Erro de campo vazio */}
              {showSenhaEmptyError && (
                <p className="mt-1 text-xs text-red-500">Digite sua senha</p>
              )}

              {/* Feedback de validação em tempo real para cadastro */}
              {!isLogin && formData.senha && (
                <div className="mt-2 text-xs space-y-1">
                  <p
                    className={
                      formData.senha.length >= 8
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {formData.senha.length >= 8 ? "✓" : "○"} Mínimo 8 caracteres
                  </p>
                  <p
                    className={
                      /[A-Z]/.test(formData.senha)
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {/[A-Z]/.test(formData.senha) ? "✓" : "○"} Pelo menos 1
                    letra maiúscula
                  </p>
                  <p
                    className={
                      /\d/.test(formData.senha)
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {/\d/.test(formData.senha) ? "✓" : "○"} Pelo menos 1 número
                  </p>
                  <p
                    className={
                      /[\W_]/.test(formData.senha)
                        ? "text-green-600"
                        : "text-red-500"
                    }
                  >
                    {/[\W_]/.test(formData.senha) ? "✓" : "○"} Pelo menos 1
                    símbolo (@, #, $, etc)
                  </p>
                </div>
              )}

              {!isLogin && !formData.senha && (
                <p className="text-xs text-gray-500 mt-1">
                  A senha deve ter: 8+ caracteres, 1 maiúscula, 1 número e 1
                  símbolo
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={
                (!isLogin && !isNomeValid && formData.nome !== "") ||
                (!isLogin && !isPasswordValid && formData.senha !== "")
              }
            >
              {isLogin ? "Entrar" : "Criar conta"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({
                    email: "",
                    senha: "",
                    nome: "",
                  });
                  setShowPassword(false);
                  setTouched({
                    email: false,
                    senha: false,
                    nome: false,
                  });
                }}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isLogin
                  ? "Não tem conta? Cadastre-se"
                  : "Já tem conta? Faça login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
