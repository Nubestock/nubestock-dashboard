/**
 * Tests para AccessDenied.tsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  ShieldX: () => <svg data-testid="shield-x-icon" />,
  LogOut: () => <svg data-testid="logout-icon" />,
}));

// Mock del componente Button
jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className} data-testid="logout-button">
      {children}
    </button>
  ),
}));

// Variables para controlar el mock de useAuth
const mockLogout = jest.fn();
let mockUser: any = null;

jest.mock('../../src/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

import AccessDenied from '../../src/app/components/AccessDenied';

describe('AccessDenied', () => {
  beforeEach(() => {
    mockLogout.mockClear();
    mockUser = null;
  });

  it('debería renderizar el título "Acceso Denegado"', () => {
    render(<AccessDenied />);
    
    expect(screen.getByText('Acceso Denegado')).toBeInTheDocument();
  });

  it('debería renderizar el mensaje de sin permisos', () => {
    render(<AccessDenied />);
    
    expect(screen.getByText('No tienes permisos de administrador para acceder a este sistema.')).toBeInTheDocument();
  });

  it('debería renderizar el icono ShieldX', () => {
    render(<AccessDenied />);
    
    expect(screen.getByTestId('shield-x-icon')).toBeInTheDocument();
  });

  it('debería mostrar el email del usuario', () => {
    mockUser = { email: 'user@example.com' };
    
    render(<AccessDenied />);
    
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('debería mostrar los roles del usuario cuando existen', () => {
    mockUser = { email: 'user@example.com', roles: ['vendedor', 'operador'] };
    
    render(<AccessDenied />);
    
    expect(screen.getByText('vendedor, operador')).toBeInTheDocument();
  });

  it('no debería mostrar sección de rol cuando roles está vacío', () => {
    mockUser = { email: 'user@example.com', roles: [] };
    
    render(<AccessDenied />);
    
    expect(screen.queryByText('Rol:')).not.toBeInTheDocument();
  });

  it('no debería mostrar sección de rol cuando roles es undefined', () => {
    mockUser = { email: 'user@example.com' };
    
    render(<AccessDenied />);
    
    expect(screen.queryByText('Rol:')).not.toBeInTheDocument();
  });

  it('debería llamar logout al hacer click en el botón "Cerrar Sesión"', () => {
    mockUser = { email: 'user@example.com' };
    
    render(<AccessDenied />);
    
    fireEvent.click(screen.getByTestId('logout-button'));
    
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('debería mostrar el texto del botón "Cerrar Sesión"', () => {
    render(<AccessDenied />);
    
    expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
  });

  it('debería mostrar el mensaje de contactar a IT', () => {
    render(<AccessDenied />);
    
    expect(screen.getByText('Contacta con IT para solicitar acceso')).toBeInTheDocument();
  });

  it('debería renderizar el icono LogOut en el botón', () => {
    render(<AccessDenied />);
    
    expect(screen.getByTestId('logout-icon')).toBeInTheDocument();
  });
});
