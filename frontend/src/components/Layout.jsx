import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import logo1 from "../assets/logo1.png";
import {
  HomeIcon,
  UsersIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronRightIcon,
  UserCircleIcon,
  BellIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  BuildingStorefrontIcon as BuildingStorefrontIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid,
  CreditCardIcon as CreditCardIconSolid,
  DocumentTextIcon as DocumentTextIconSolid,
  ChartBarIcon as ChartBarIconSolid,
} from "@heroicons/react/24/solid";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: UsersIcon,
    iconSolid: UsersIconSolid,
  },
  {
    name: "Empresas",
    href: "/empresas",
    icon: BuildingStorefrontIcon,
    iconSolid: BuildingStorefrontIconSolid,
  },
  {
    name: "Compras",
    href: "/compras",
    icon: ShoppingBagIcon,
    iconSolid: ShoppingBagIconSolid,
  },
  {
    name: "Faturas",
    href: "/faturas",
    icon: DocumentTextIcon,
    iconSolid: DocumentTextIconSolid,
  },
  {
    name: "Pagamentos",
    href: "/pagamentos",
    icon: CreditCardIcon,
    iconSolid: CreditCardIconSolid,
  },
  {
    name: "Relatórios",
    href: "/relatorios",
    icon: ChartBarIcon,
    iconSolid: ChartBarIconSolid,
  },
];

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  if (pathnames.length === 0) return null;

  const getName = (path) => {
    const item = navigation.find((n) => n.href === `/${path}`);
    return item ? item.name : path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      <Link
        to="/dashboard"
        className="text-gray-500 hover:text-primary-800 transition-colors"
      >
        Home
      </Link>
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;

        return (
          <React.Fragment key={to}>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-primary-800">
                {getName(value)}
              </span>
            ) : (
              <Link
                to={to}
                className="text-gray-500 hover:text-primary-800 transition-colors"
              >
                {getName(value)}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavItem = ({ item, isMobile = false, onClick }) => {
    const isActive = location.pathname === item.href;
    const Icon = isActive ? item.iconSolid : item.icon;

    return (
      <Link
        to={item.href}
        onClick={onClick}
        className={`group flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive
            ? "bg-white/20 text-white shadow-md"
            : "text-gray-300 hover:bg-white/10 hover:text-white"
        } ${isMobile ? "mx-2" : ""}`}
      >
        <Icon
          className={`h-5 w-5 flex-shrink-0 ${
            isActive ? "text-white" : "text-gray-400 group-hover:text-white"
          }`}
        />
        <span>{item.name}</span>
        {isActive && (
          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/50" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">
        <div className="flex flex-col flex-1 bg-gradient-to-b from-primary-800 to-primary-900 shadow-xl">
          {/* Logo Area - SEM LISTRA AMARELA E SEM SOMBRA */}
          <div className="flex flex-col items-center justify-center pt-8 pb-6 px-4">
            {/* Logo sem sombra */}
            <div className="mb-3">
              <img
                src={logo1}
                className="w-20 h-20 object-contain"
                alt="Logo"
                style={{ filter: "none", boxShadow: "none" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/80x80?text=O";
                }}
              />
            </div>
            {/* Fonte personalizada para OFIADOR */}
            <h1
              className="text-white text-center text-3xl font-bold tracking-wider"
              style={{
                fontFamily: "'Afacad', 'Inter', sans-serif",
                letterSpacing: "2px",
                textShadow: "none",
              }}
            >
              OFIADOR
            </h1>
            <p className="text-white/50 text-xs mt-2 font-light">
              Sistema de Gestão
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* User Profile */}
          <div className="px-4 py-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <UserCircleIcon className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full ring-2 ring-primary-800" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.nome || "Usuário"}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {user?.login || "usuario@email.com"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                title="Sair"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="lg:hidden">
        <div
          className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${
            scrolled
              ? "bg-primary-800 shadow-lg"
              : "bg-gradient-to-r from-primary-800 to-primary-900"
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Logo Mobile - SEM SOMBRA */}
            <div className="flex flex-col items-center">
              <img
                src={logo1}
                alt="Logo"
                className="h-8 w-8 object-contain"
                style={{ filter: "none", boxShadow: "none" }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/32x32?text=O";
                }}
              />
              <h1
                className="text-white text-sm font-bold tracking-wide leading-tight"
                style={{ fontFamily: "'Afacad', 'Inter', sans-serif" }}
              >
                OFIADOR
              </h1>
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-white hover:bg-white/10 transition-all duration-200"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 bg-gradient-to-b from-primary-800 to-primary-900 shadow-xl animate-in slide-in-left duration-300">
              <div className="flex flex-col h-full">
                {/* Logo Mobile Sidebar - SEM SOMBRA */}
                <div className="flex flex-col items-center justify-center pt-8 pb-6 px-4 relative">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <div className="mb-3">
                    <img
                      src={logo1}
                      alt="Logo"
                      className="w-20 h-20 object-contain"
                      style={{ filter: "none", boxShadow: "none" }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/80x80?text=O";
                      }}
                    />
                  </div>
                  <h1
                    className="text-white text-3xl font-bold tracking-wider"
                    style={{ fontFamily: "'Afacad', 'Inter', sans-serif" }}
                  >
                    OFIADOR
                  </h1>
                  <p className="text-white/50 text-xs mt-2">
                    Sistema de Gestão
                  </p>
                </div>

                <nav className="flex-1 py-6 space-y-1">
                  {navigation.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      isMobile
                      onClick={() => setSidebarOpen(false)}
                    />
                  ))}
                </nav>

                <div className="px-4 py-6 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <UserCircleIcon className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {user?.nome}
                      </p>
                      <p className="text-xs text-white/60">{user?.login}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="min-h-screen">
          {/* Page Content */}
          <div className="p-4 pt-20 lg:p-6 lg:pt-6">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Mobile Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="fixed top-0 left-0 right-0 bg-white rounded-b-2xl shadow-xl animate-in slide-in-top duration-300">
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar clientes, empresas, faturas..."
                    className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-800/20 focus:border-primary-800"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
