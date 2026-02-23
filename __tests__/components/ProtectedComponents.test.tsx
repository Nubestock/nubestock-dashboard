import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProtectedSection, ProtectedButton, ProtectedRoute, Can } from '../../src/app/components/ProtectedComponents';

// Mock usePermissions hook
const mockUsePermissions = {
  hasPermission: jest.fn(),
  hasAnyPermission: jest.fn(),
  hasAllPermissions: jest.fn(),
  canPerformAction: jest.fn(),
  canView: jest.fn(),
  canCreate: jest.fn(),
  canEdit: jest.fn(),
  canDelete: jest.fn(),
  canManage: jest.fn(),
};

jest.mock('../../src/app/hooks/usePermissions', () => ({
  usePermissions: () => mockUsePermissions,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  AlertCircle: () => <span data-testid="alert-circle-icon">AlertCircle</span>,
}));

// Mock UI components
jest.mock('../../src/app/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

describe('ProtectedComponents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default: grant all permissions
    mockUsePermissions.hasPermission.mockReturnValue(true);
    mockUsePermissions.hasAnyPermission.mockReturnValue(true);
    mockUsePermissions.hasAllPermissions.mockReturnValue(true);
    mockUsePermissions.canPerformAction.mockReturnValue(true);
    mockUsePermissions.canView.mockReturnValue(true);
  });

  describe('ProtectedSection', () => {
    it('debería renderizar children cuando tiene permiso específico', () => {
      mockUsePermissions.hasPermission.mockReturnValue(true);
      
      render(
        <ProtectedSection permission="VIEW_PRODUCTS">
          <span>Contenido protegido</span>
        </ProtectedSection>
      );
      
      expect(screen.getByText('Contenido protegido')).toBeInTheDocument();
      expect(mockUsePermissions.hasPermission).toHaveBeenCalledWith('VIEW_PRODUCTS');
    });

    it('debería ocultar children cuando no tiene permiso específico', () => {
      mockUsePermissions.hasPermission.mockReturnValue(false);
      
      render(
        <ProtectedSection permission="VIEW_PRODUCTS">
          <span>Contenido protegido</span>
        </ProtectedSection>
      );
      
      expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
    });

    it('debería mostrar fallback cuando no tiene permiso', () => {
      mockUsePermissions.hasPermission.mockReturnValue(false);
      
      render(
        <ProtectedSection permission="VIEW_PRODUCTS" fallback={<span>Sin acceso</span>}>
          <span>Contenido protegido</span>
        </ProtectedSection>
      );
      
      expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
      expect(screen.getByText('Sin acceso')).toBeInTheDocument();
    });

    it('debería mostrar error cuando showError es true y no tiene permiso', () => {
      mockUsePermissions.hasPermission.mockReturnValue(false);
      
      render(
        <ProtectedSection permission="VIEW_PRODUCTS" showError>
          <span>Contenido protegido</span>
        </ProtectedSection>
      );
      
      expect(screen.getByTestId('alert')).toBeInTheDocument();
      expect(screen.getByText('No tienes permisos para acceder a esta sección')).toBeInTheDocument();
    });

    it('debería verificar anyPermissions correctamente', () => {
      mockUsePermissions.hasAnyPermission.mockReturnValue(true);
      
      render(
        <ProtectedSection anyPermissions={['VIEW_PRODUCTS', 'EDIT_PRODUCTS']}>
          <span>Contenido</span>
        </ProtectedSection>
      );
      
      expect(screen.getByText('Contenido')).toBeInTheDocument();
      expect(mockUsePermissions.hasAnyPermission).toHaveBeenCalledWith(['VIEW_PRODUCTS', 'EDIT_PRODUCTS']);
    });

    it('debería ocultar cuando anyPermissions falla', () => {
      mockUsePermissions.hasAnyPermission.mockReturnValue(false);
      
      render(
        <ProtectedSection anyPermissions={['VIEW_PRODUCTS', 'EDIT_PRODUCTS']}>
          <span>Contenido</span>
        </ProtectedSection>
      );
      
      expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    });

    it('debería verificar allPermissions correctamente', () => {
      mockUsePermissions.hasAllPermissions.mockReturnValue(true);
      
      render(
        <ProtectedSection allPermissions={['VIEW_PRODUCTS', 'EDIT_PRODUCTS']}>
          <span>Contenido</span>
        </ProtectedSection>
      );
      
      expect(screen.getByText('Contenido')).toBeInTheDocument();
      expect(mockUsePermissions.hasAllPermissions).toHaveBeenCalledWith(['VIEW_PRODUCTS', 'EDIT_PRODUCTS']);
    });

    it('debería ocultar cuando allPermissions falla', () => {
      mockUsePermissions.hasAllPermissions.mockReturnValue(false);
      
      render(
        <ProtectedSection allPermissions={['VIEW_PRODUCTS', 'EDIT_PRODUCTS']}>
          <span>Contenido</span>
        </ProtectedSection>
      );
      
      expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
    });

    it('debería verificar resource y action correctamente', () => {
      mockUsePermissions.canPerformAction.mockReturnValue(true);
      
      render(
        <ProtectedSection resource="products" action="create">
          <span>Crear Producto</span>
        </ProtectedSection>
      );
      
      expect(screen.getByText('Crear Producto')).toBeInTheDocument();
      expect(mockUsePermissions.canPerformAction).toHaveBeenCalledWith('products', 'create');
    });

    it('debería ocultar cuando resource/action no tiene permiso', () => {
      mockUsePermissions.canPerformAction.mockReturnValue(false);
      
      render(
        <ProtectedSection resource="products" action="delete">
          <span>Eliminar</span>
        </ProtectedSection>
      );
      
      expect(screen.queryByText('Eliminar')).not.toBeInTheDocument();
    });
  });

  describe('ProtectedButton', () => {
    it('debería renderizar botón cuando tiene permiso específico', () => {
      mockUsePermissions.hasPermission.mockReturnValue(true);
      
      render(
        <ProtectedButton permission="CREATE_PRODUCTS">
          Crear
        </ProtectedButton>
      );
      
      expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
    });

    it('debería ocultar botón cuando no tiene permiso', () => {
      mockUsePermissions.hasPermission.mockReturnValue(false);
      
      render(
        <ProtectedButton permission="CREATE_PRODUCTS">
          Crear
        </ProtectedButton>
      );
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('debería mostrar botón deshabilitado cuando showDisabled es true', () => {
      mockUsePermissions.hasPermission.mockReturnValue(false);
      
      render(
        <ProtectedButton permission="CREATE_PRODUCTS" showDisabled>
          Crear
        </ProtectedButton>
      );
      
      const button = screen.getByRole('button', { name: 'Crear' });
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('debería verificar anyPermissions correctamente', () => {
      mockUsePermissions.hasAnyPermission.mockReturnValue(true);
      
      render(
        <ProtectedButton anyPermissions={['CREATE_PRODUCTS', 'EDIT_PRODUCTS']}>
          Modificar
        </ProtectedButton>
      );
      
      expect(screen.getByRole('button', { name: 'Modificar' })).toBeInTheDocument();
    });

    it('debería verificar resource y action correctamente', () => {
      mockUsePermissions.canPerformAction.mockReturnValue(true);
      
      render(
        <ProtectedButton resource="products" action="edit">
          Editar
        </ProtectedButton>
      );
      
      expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
      expect(mockUsePermissions.canPerformAction).toHaveBeenCalledWith('products', 'edit');
    });

    it('debería ejecutar onClick cuando se hace click', () => {
      const handleClick = jest.fn();
      mockUsePermissions.hasPermission.mockReturnValue(true);
      
      render(
        <ProtectedButton permission="CREATE_PRODUCTS" onClick={handleClick}>
          Crear
        </ProtectedButton>
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('debería aplicar className correctamente', () => {
      mockUsePermissions.hasPermission.mockReturnValue(true);
      
      render(
        <ProtectedButton permission="CREATE_PRODUCTS" className="mi-clase">
          Crear
        </ProtectedButton>
      );
      
      expect(screen.getByRole('button')).toHaveClass('mi-clase');
    });
  });

  describe('ProtectedRoute', () => {
    it('debería renderizar children cuando tiene permiso específico', () => {
      mockUsePermissions.hasPermission.mockReturnValue(true);
      
      render(
        <ProtectedRoute permission="VIEW_DASHBOARD">
          <div>Dashboard</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('debería mostrar mensaje de acceso denegado por defecto', () => {
      mockUsePermissions.hasPermission.mockReturnValue(false);
      
      render(
        <ProtectedRoute permission="VIEW_DASHBOARD">
          <div>Dashboard</div>
        </ProtectedRoute>
      );
      
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
      expect(screen.getByText('No tienes permisos para acceder a esta sección del sistema.')).toBeInTheDocument();
    });

    it('debería mostrar fallback personalizado cuando no tiene permiso', () => {
      mockUsePermissions.hasPermission.mockReturnValue(false);
      
      render(
        <ProtectedRoute permission="VIEW_DASHBOARD" fallback={<div>Acceso restringido</div>}>
          <div>Dashboard</div>
        </ProtectedRoute>
      );
      
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
    });

    it('debería verificar anyPermissions correctamente', () => {
      mockUsePermissions.hasAnyPermission.mockReturnValue(true);
      
      render(
        <ProtectedRoute anyPermissions={['VIEW_DASHBOARD', 'VIEW_REPORTS']}>
          <div>Contenido</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByText('Contenido')).toBeInTheDocument();
    });

    it('debería verificar allPermissions correctamente', () => {
      mockUsePermissions.hasAllPermissions.mockReturnValue(true);
      
      render(
        <ProtectedRoute allPermissions={['VIEW_DASHBOARD', 'VIEW_REPORTS']}>
          <div>Contenido</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByText('Contenido')).toBeInTheDocument();
    });

    it('debería verificar resource con canView correctamente', () => {
      mockUsePermissions.canView.mockReturnValue(true);
      
      render(
        <ProtectedRoute resource="products">
          <div>Productos</div>
        </ProtectedRoute>
      );
      
      expect(screen.getByText('Productos')).toBeInTheDocument();
      expect(mockUsePermissions.canView).toHaveBeenCalledWith('products');
    });

    it('debería denegar acceso cuando canView retorna false', () => {
      mockUsePermissions.canView.mockReturnValue(false);
      
      render(
        <ProtectedRoute resource="products">
          <div>Productos</div>
        </ProtectedRoute>
      );
      
      expect(screen.queryByText('Productos')).not.toBeInTheDocument();
      expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
    });
  });

  describe('Can', () => {
    it('debería renderizar children cuando la función retorna true', () => {
      render(
        <Can do={() => true}>
          <span>Contenido visible</span>
        </Can>
      );
      
      expect(screen.getByText('Contenido visible')).toBeInTheDocument();
    });

    it('debería ocultar children cuando la función retorna false', () => {
      render(
        <Can do={() => false}>
          <span>Contenido oculto</span>
        </Can>
      );
      
      expect(screen.queryByText('Contenido oculto')).not.toBeInTheDocument();
    });

    it('debería mostrar fallback cuando la función retorna false', () => {
      render(
        <Can do={() => false} fallback={<span>Alternativa</span>}>
          <span>Contenido principal</span>
        </Can>
      );
      
      expect(screen.queryByText('Contenido principal')).not.toBeInTheDocument();
      expect(screen.getByText('Alternativa')).toBeInTheDocument();
    });

    it('debería pasar permisos a la función de verificación', () => {
      const checkFn = jest.fn().mockReturnValue(true);
      
      render(
        <Can do={checkFn}>
          <span>Contenido</span>
        </Can>
      );
      
      expect(checkFn).toHaveBeenCalledWith(mockUsePermissions);
    });

    it('debería permitir lógica personalizada con permisos', () => {
      mockUsePermissions.canCreate = jest.fn().mockReturnValue(true);
      mockUsePermissions.canEdit = jest.fn().mockReturnValue(false);
      
      render(
        <Can do={(perms) => perms.canCreate('products') || perms.canEdit('products')}>
          <span>Modificar Producto</span>
        </Can>
      );
      
      expect(screen.getByText('Modificar Producto')).toBeInTheDocument();
    });
  });
});
