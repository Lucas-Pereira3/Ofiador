import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Empresas from "./pages/Empresas";
import Compras from "./pages/Compras";
import Faturas from "./pages/Faturas";
import Relatorios from "./pages/Relatorios";

const theme = createTheme({
  palette: {
    primary: { main: "#1A2B4C" },
    secondary: { main: "#dc004e" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Carregando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Rota pública - sem layout */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas - COM LAYOUT */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/faturas" element={<Faturas />} />
        <Route
          path="/pagamentos"
          element={
            <div className="p-6 text-center text-gray-500">
              Página de Pagamentos em desenvolvimento
            </div>
          }
        />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Rota para qualquer caminho não encontrado */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Toaster position="top-right" />
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
