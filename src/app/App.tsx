import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductManagement from './components/ProductManagement';
import ClientManagement from './components/ClientManagement';
import SalesManagement from './components/SalesManagement';
import ProductionReport from './components/ProductionReport';
import ProductionManagement from './components/ProductionManagement';
import RecipeManagement from './components/RecipeManagement';
import CategoryManagement from './components/CategoryManagement';
import UserManagement from './components/UserManagement';
import ConfigurationView from './components/ConfigurationView';
import AlertsView from './components/AlertsView';
import WasteManagement from './components/WasteManagement';
import MachineryManagement from './components/MachineryManagement';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import BackendNotConfigured from './components/BackendNotConfigured';
import AccessDenied from './components/AccessDenied';

// Función helper para verificar si el usuario es administrador
const isAdmin = (roles?: string[]): boolean => {
  if (!roles || roles.length === 0) return false;
  // Verificar si tiene rol de administrador (en minúsculas para ser case-insensitive)
  return roles.some(role => role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrador');
};

// Componente interno que usa el contexto de autenticación
function AppContent() {
  const [activeSection, setActiveSection] = useState('dashboard');
  // Sidebar cerrado por defecto en móvil, abierto en desktop
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { user, isLoading, isBackendConfigured } = useAuth();

  // Detectar si estamos en la ruta de reset-password
  const isResetPasswordPage = window.location.pathname === '/reset-password' || 
                               window.location.search.includes('token=');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductManagement 
          initialProductId={selectedProductId}
          onProductViewed={() => setSelectedProductId(null)}
        />;
      case 'recipes':
        return <RecipeManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'clients':
        return <ClientManagement />;
      case 'sales':
        return <SalesManagement />;
      case 'production':
        return <ProductionReport />;
      case 'production_management':
        return <ProductionManagement />;
      case 'alerts':
        return <AlertsView />;
      case 'configuration':
        return <ConfigurationView />;
      case 'waste':
        return <WasteManagement />;
      case 'machinery':
        return <MachineryManagement />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  // Si estamos en la página de reset password, mostrarla sin autenticación
  if (isResetPasswordPage) {
    return <ResetPassword />;
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006A4E]/5 rounded-full blur-3xl"></div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006A4E] mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si el backend no está configurado, mostrar mensaje
  if (!isBackendConfigured) {
    return <BackendNotConfigured />;
  }

  // Si no hay usuario, mostrar login
  if (!user) {
    return <Login />;
  }

  // VALIDACIÓN DE ROL: Si el usuario NO es administrador, mostrar acceso denegado
  if (!isAdmin(user.roles)) {
    return <AccessDenied />;
  }

  // Si hay usuario Y es administrador, mostrar dashboard
  return (
    <div className="min-h-screen bg-white relative">
      {/* Patrón de fondo sutil para toda la aplicación */}
      <div className="fixed inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none"></div>
      
      {/* Navbar fijo en la parte superior */}
      <Navbar 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
        setActiveSection={setActiveSection}
      />
      
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      {/* Main content con padding-top para el navbar y margen dinámico para el sidebar */}
      <main className={`transition-all duration-300 pt-20 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 relative z-10 min-h-screen ${
        isSidebarOpen ? 'ml-0 lg:ml-64' : 'ml-0'
      }`}>
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Componente principal que provee el contexto
export default function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </ConfigProvider>
  );
}