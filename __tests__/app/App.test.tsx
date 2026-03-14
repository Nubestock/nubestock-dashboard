/**
 * Tests para App.tsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock de todos los componentes hijos
jest.mock('../../src/app/components/ui/sonner', () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

jest.mock('../../src/app/components/Navbar', () => ({
  __esModule: true,
  default: ({ onMenuClick, isSidebarOpen, setActiveSection }: any) => (
    <div data-testid="navbar">
      <button data-testid="menu-button" onClick={onMenuClick}>Menu</button>
      <span data-testid="sidebar-state">{isSidebarOpen ? 'open' : 'closed'}</span>
    </div>
  ),
}));

jest.mock('../../src/app/components/Sidebar', () => ({
  __esModule: true,
  default: ({ activeSection, setActiveSection, isOpen, setIsOpen }: any) => (
    <div data-testid="sidebar">
      <span data-testid="active-section">{activeSection}</span>
      <button data-testid="set-products" onClick={() => setActiveSection('products')}>Products</button>
      <button data-testid="set-recipes" onClick={() => setActiveSection('recipes')}>Recipes</button>
      <button data-testid="set-categories" onClick={() => setActiveSection('categories')}>Categories</button>
      <button data-testid="set-clients" onClick={() => setActiveSection('clients')}>Clients</button>
      <button data-testid="set-sales" onClick={() => setActiveSection('sales')}>Sales</button>
      <button data-testid="set-production" onClick={() => setActiveSection('production')}>Production</button>
      <button data-testid="set-production-management" onClick={() => setActiveSection('production_management')}>Production Management</button>
      <button data-testid="set-alerts" onClick={() => setActiveSection('alerts')}>Alerts</button>
      <button data-testid="set-configuration" onClick={() => setActiveSection('configuration')}>Configuration</button>
      <button data-testid="set-waste" onClick={() => setActiveSection('waste')}>Waste</button>
      <button data-testid="set-machinery" onClick={() => setActiveSection('machinery')}>Machinery</button>
      <button data-testid="set-users" onClick={() => setActiveSection('users')}>Users</button>
      <button data-testid="set-unknown" onClick={() => setActiveSection('unknown')}>Unknown</button>
    </div>
  ),
}));

jest.mock('../../src/app/components/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard">Dashboard</div>,
}));

jest.mock('../../src/app/components/ProductManagement', () => ({
  __esModule: true,
  default: ({ initialProductId, onProductViewed }: any) => (
    <div data-testid="product-management">
      ProductManagement
      {initialProductId && <span data-testid="product-id">{initialProductId}</span>}
      <button data-testid="product-viewed-btn" onClick={onProductViewed}>Mark Viewed</button>
    </div>
  ),
}));

jest.mock('../../src/app/components/ClientManagement', () => ({
  __esModule: true,
  default: () => <div data-testid="client-management">ClientManagement</div>,
}));

jest.mock('../../src/app/components/SalesManagement', () => ({
  __esModule: true,
  default: () => <div data-testid="sales-management">SalesManagement</div>,
}));

jest.mock('../../src/app/components/ProductionReport', () => ({
  __esModule: true,
  default: () => <div data-testid="production-report">ProductionReport</div>,
}));

jest.mock('../../src/app/components/ProductionManagement', () => ({
  __esModule: true,
  default: () => <div data-testid="production-management">ProductionManagement</div>,
}));

jest.mock('../../src/app/components/RecipeManagement', () => ({
  __esModule: true,
  default: () => <div data-testid="recipe-management">RecipeManagement</div>,
}));

jest.mock('../../src/app/components/CategoryManagement', () => ({
  __esModule: true,
  default: () => <div data-testid="category-management">CategoryManagement</div>,
}));

jest.mock('../../src/app/components/UserManagement', () => ({
  __esModule: true,
  default: () => <div data-testid="user-management">UserManagement</div>,
}));

jest.mock('../../src/app/components/ConfigurationView', () => ({
  __esModule: true,
  default: () => <div data-testid="configuration-view">ConfigurationView</div>,
}));

jest.mock('../../src/app/components/AlertsView', () => ({
  __esModule: true,
  default: () => <div data-testid="alerts-view">AlertsView</div>,
}));

jest.mock('../../src/app/components/WasteManagement', () => ({
  __esModule: true,
  default: () => <div data-testid="waste-management">WasteManagement</div>,
}));

jest.mock('../../src/app/components/MachineryManagement', () => ({
  __esModule: true,
  default: () => <div data-testid="machinery-management">MachineryManagement</div>,
}));

jest.mock('../../src/app/components/Login', () => ({
  __esModule: true,
  default: () => <div data-testid="login">Login</div>,
}));

jest.mock('../../src/app/components/ResetPassword', () => ({
  __esModule: true,
  default: () => <div data-testid="reset-password">ResetPassword</div>,
}));

jest.mock('../../src/app/components/BackendNotConfigured', () => ({
  __esModule: true,
  default: () => <div data-testid="backend-not-configured">BackendNotConfigured</div>,
}));

jest.mock('../../src/app/components/AccessDenied', () => ({
  __esModule: true,
  default: () => <div data-testid="access-denied">AccessDenied</div>,
}));

// Mock de ConfigContext
jest.mock('../../src/app/contexts/ConfigContext', () => ({
  ConfigProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Variables para controlar el mock de useAuth
let mockAuthValue = {
  user: null as any,
  token: null as string | null,
  refreshToken: null as string | null,
  login: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
  isBackendConfigured: true,
  permissions: [] as string[],
  roles: [] as string[],
};

jest.mock('../../src/app/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuth: () => mockAuthValue,
}));

// Importar App después de los mocks
import App from '../../src/app/App';

describe('App', () => {
  beforeEach(() => {
    // Reset mock values
    mockAuthValue = {
      user: null,
      token: null,
      refreshToken: null,
      login: jest.fn(),
      logout: jest.fn(),
      isLoading: false,
      isBackendConfigured: true,
      permissions: [],
      roles: [],
    };
    
    // Reset window.location (usa mock global de setup.ts)
    (window.location as { pathname: string; search: string }).pathname = '/';
    (window.location as { pathname: string; search: string }).search = '';
  });

  describe('isAdmin helper function', () => {
    it('debería mostrar acceso denegado si el usuario no tiene rol de admin', () => {
      mockAuthValue.user = { id: 1, name: 'Test', email: 'test@test.com', roles: ['user'] };
      
      render(<App />);
      
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    it('debería mostrar acceso denegado si roles está vacío', () => {
      mockAuthValue.user = { id: 1, name: 'Test', email: 'test@test.com', roles: [] };
      
      render(<App />);
      
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    it('debería mostrar acceso denegado si roles es undefined', () => {
      mockAuthValue.user = { id: 1, name: 'Test', email: 'test@test.com' };
      
      render(<App />);
      
      expect(screen.getByTestId('access-denied')).toBeInTheDocument();
    });

    it('debería permitir acceso con rol "admin" (case-insensitive)', () => {
      mockAuthValue.user = { id: 1, name: 'Test', email: 'test@test.com', roles: ['Admin'] };
      
      render(<App />);
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('debería permitir acceso con rol "administrador" (case-insensitive)', () => {
      mockAuthValue.user = { id: 1, name: 'Test', email: 'test@test.com', roles: ['ADMINISTRADOR'] };
      
      render(<App />);
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('estado de carga', () => {
    it('debería mostrar loading mientras isLoading es true', () => {
      mockAuthValue.isLoading = true;
      
      render(<App />);
      
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });

  // Skipped: jsdom no permite asignar a location.pathname/search sin disparar "Not implemented: navigation"
  describe.skip('reset password', () => {
    it('debería mostrar ResetPassword cuando pathname es /reset-password', () => {
      (window.location as { pathname: string; search: string }).pathname = '/reset-password';
      (window.location as { pathname: string; search: string }).search = '';
      render(<App />);
      
      expect(screen.getByTestId('reset-password')).toBeInTheDocument();
    });

    it('debería mostrar ResetPassword cuando search contiene token=', () => {
      (window.location as { pathname: string; search: string }).pathname = '/';
      (window.location as { pathname: string; search: string }).search = '?token=abc123';
      render(<App />);
      
      expect(screen.getByTestId('reset-password')).toBeInTheDocument();
    });
  });

  describe('backend no configurado', () => {
    it('debería mostrar BackendNotConfigured cuando isBackendConfigured es false', () => {
      mockAuthValue.isBackendConfigured = false;
      
      render(<App />);
      
      expect(screen.getByTestId('backend-not-configured')).toBeInTheDocument();
    });
  });

  describe('sin usuario', () => {
    it('debería mostrar Login cuando no hay usuario', () => {
      mockAuthValue.user = null;
      
      render(<App />);
      
      expect(screen.getByTestId('login')).toBeInTheDocument();
    });
  });

  describe('navegación entre secciones', () => {
    beforeEach(() => {
      mockAuthValue.user = { id: 1, name: 'Admin', email: 'admin@test.com', roles: ['admin'] };
    });

    it('debería mostrar Dashboard por defecto', () => {
      render(<App />);
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });

    it('debería navegar a Products', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-products'));
      
      expect(screen.getByTestId('product-management')).toBeInTheDocument();
    });

    it('debería llamar onProductViewed y limpiar selectedProductId', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-products'));
      fireEvent.click(screen.getByTestId('product-viewed-btn'));
      
      expect(screen.getByTestId('product-management')).toBeInTheDocument();
    });

    it('debería navegar a Recipes', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-recipes'));
      
      expect(screen.getByTestId('recipe-management')).toBeInTheDocument();
    });

    it('debería navegar a Categories', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-categories'));
      
      expect(screen.getByTestId('category-management')).toBeInTheDocument();
    });

    it('debería navegar a Clients', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-clients'));
      
      expect(screen.getByTestId('client-management')).toBeInTheDocument();
    });

    it('debería navegar a Sales', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-sales'));
      
      expect(screen.getByTestId('sales-management')).toBeInTheDocument();
    });

    it('debería navegar a Production Report', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-production'));
      
      expect(screen.getByTestId('production-report')).toBeInTheDocument();
    });

    it('debería navegar a Production Management', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-production-management'));
      
      expect(screen.getByTestId('production-management')).toBeInTheDocument();
    });

    it('debería navegar a Alerts', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-alerts'));
      
      expect(screen.getByTestId('alerts-view')).toBeInTheDocument();
    });

    it('debería navegar a Configuration', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-configuration'));
      
      expect(screen.getByTestId('configuration-view')).toBeInTheDocument();
    });

    it('debería navegar a Waste', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-waste'));
      
      expect(screen.getByTestId('waste-management')).toBeInTheDocument();
    });

    it('debería navegar a Machinery', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-machinery'));
      
      expect(screen.getByTestId('machinery-management')).toBeInTheDocument();
    });

    it('debería navegar a Users', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-users'));
      
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    it('debería mostrar Dashboard para sección desconocida', () => {
      render(<App />);
      
      fireEvent.click(screen.getByTestId('set-unknown'));
      
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  describe('toggle sidebar', () => {
    beforeEach(() => {
      mockAuthValue.user = { id: 1, name: 'Admin', email: 'admin@test.com', roles: ['admin'] };
    });

    it('debería togglear el sidebar al hacer click en el menú', () => {
      render(<App />);
      
      // Inicialmente cerrado
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('closed');
      
      // Click para abrir
      fireEvent.click(screen.getByTestId('menu-button'));
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('open');
      
      // Click para cerrar
      fireEvent.click(screen.getByTestId('menu-button'));
      expect(screen.getByTestId('sidebar-state')).toHaveTextContent('closed');
    });
  });

  describe('componente App principal', () => {
    it('debería renderizar Toaster', () => {
      render(<App />);
      
      expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });
  });
});
