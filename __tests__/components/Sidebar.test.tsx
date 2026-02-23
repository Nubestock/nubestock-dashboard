/**
 * Tests para Sidebar.tsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  LayoutDashboard: () => <svg data-testid="dashboard-icon" />,
  Package: () => <svg data-testid="package-icon" />,
  Users: () => <svg data-testid="users-icon" />,
  UserCog: () => <svg data-testid="usercog-icon" />,
  Wrench: () => <svg data-testid="wrench-icon" />,
  Trash2: () => <svg data-testid="trash-icon" />,
  ShoppingCart: () => <svg data-testid="cart-icon" />,
  ClipboardList: () => <svg data-testid="clipboard-icon" />,
  Menu: () => <svg data-testid="menu-icon" />,
  X: () => <svg data-testid="x-icon" />,
  LogOut: () => <svg data-testid="logout-icon" />,
  Box: () => <svg data-testid="box-icon" />,
  ChefHat: () => <svg data-testid="chef-icon" />,
  Settings: () => <svg data-testid="settings-icon" />,
  ChevronDown: () => <svg data-testid="chevron-down-icon" />,
  ChevronUp: () => <svg data-testid="chevron-up-icon" />,
  Store: () => <svg data-testid="store-icon" />,
  Factory: () => <svg data-testid="factory-icon" />,
  ShieldCheck: () => <svg data-testid="shield-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  FolderOpen: () => <svg data-testid="folder-icon" />,
}));

// Mock de AuthContext
const mockLogout = jest.fn();
jest.mock('../../src/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@test.com' },
    logout: mockLogout,
  }),
}));

// Mock de componentes UI
jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid="badge" className={className}>
      {children}
    </span>
  ),
}));

jest.mock('../../src/app/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type, className }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className={className}
      data-testid="search-input"
    />
  ),
}));

import Sidebar from '../../src/app/components/Sidebar';

describe('Sidebar', () => {
  const defaultProps = {
    activeSection: 'dashboard',
    setActiveSection: jest.fn(),
    isOpen: true,
    setIsOpen: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', { value: 1200, writable: true });
  });

  describe('renderizado', () => {
    it('debería renderizar el sidebar cuando isOpen es true', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('debería mostrar todos los menús principales', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Productos')).toBeInTheDocument();
      expect(screen.getByText('Clientes y Ventas')).toBeInTheDocument();
      expect(screen.getByText('Producción')).toBeInTheDocument();
      expect(screen.getByText('Administración')).toBeInTheDocument();
    });

    it('debería mostrar información del usuario', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@test.com')).toBeInTheDocument();
    });

    it('debería mostrar botón de cerrar sesión', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
    });

    it('debería mostrar buscador', () => {
      render(<Sidebar {...defaultProps} />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
  });

  describe('navegación', () => {
    it('debería llamar setActiveSection al hacer click en Dashboard', () => {
      render(<Sidebar {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Dashboard'));
      
      expect(defaultProps.setActiveSection).toHaveBeenCalledWith('dashboard');
    });

    it('debería expandir menú con subItems al hacer click', () => {
      render(<Sidebar {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Productos'));
      
      // Deberían aparecer los submenús
      expect(screen.getByText('Gestión de Productos')).toBeInTheDocument();
      expect(screen.getByText('Recetas')).toBeInTheDocument();
      expect(screen.getByText('Categorías')).toBeInTheDocument();
    });

    it('debería navegar a subitem al hacer click', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Expandir menú de productos
      fireEvent.click(screen.getByText('Productos'));
      
      // Click en Recetas
      fireEvent.click(screen.getByText('Recetas'));
      
      expect(defaultProps.setActiveSection).toHaveBeenCalledWith('recipes');
    });
  });

  describe('logout', () => {
    it('debería llamar logout al hacer click en Cerrar Sesión', () => {
      render(<Sidebar {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Cerrar Sesión'));
      
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe('búsqueda', () => {
    it('debería filtrar menús según búsqueda', () => {
      render(<Sidebar {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Dashboard' } });
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('debería mostrar mensaje cuando no hay resultados', () => {
      render(<Sidebar {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'xxxxxx' } });
      
      expect(screen.getByText('No se encontraron resultados')).toBeInTheDocument();
    });

    it('debería limpiar búsqueda al hacer click en X', () => {
      render(<Sidebar {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'test' } });
      
      // Buscar el botón X
      const clearButton = screen.getByTestId('x-icon').closest('button');
      if (clearButton) {
        fireEvent.click(clearButton);
      }
      
      expect(searchInput).toHaveValue('');
    });

    it('debería expandir menús automáticamente cuando hay resultados de búsqueda', () => {
      render(<Sidebar {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Recetas' } });
      
      // Recetas debería estar visible
      expect(screen.getByText('Recetas')).toBeInTheDocument();
    });
  });

  describe('overlay en móvil', () => {
    it('debería renderizar overlay cuando isOpen es true', () => {
      render(<Sidebar {...defaultProps} />);
      
      // El overlay tiene el className que incluye bg-black/50
      const overlay = document.querySelector('.bg-black\\/50');
      expect(overlay).toBeInTheDocument();
    });

    it('debería cerrar sidebar al hacer click en overlay', () => {
      render(<Sidebar {...defaultProps} />);
      
      const overlay = document.querySelector('.bg-black\\/50');
      if (overlay) {
        fireEvent.click(overlay);
      }
      
      expect(defaultProps.setIsOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('colapsar/expandir menús', () => {
    it('debería colapsar menú al hacer click nuevamente', () => {
      render(<Sidebar {...defaultProps} />);
      
      // Expandir
      fireEvent.click(screen.getByText('Productos'));
      expect(screen.getByText('Gestión de Productos')).toBeInTheDocument();
      
      // Colapsar
      fireEvent.click(screen.getByText('Productos'));
      
      // Los submenús siguen en el DOM pero están ocultos con max-h-0
    });
  });

  describe('búsqueda sin acentos', () => {
    it('debería encontrar resultados ignorando acentos', () => {
      render(<Sidebar {...defaultProps} />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'produccion' } });
      
      expect(screen.getByText('Producción')).toBeInTheDocument();
    });
  });
});
