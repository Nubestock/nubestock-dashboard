/**
 * Tests para Login.tsx
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  Lock: () => <svg data-testid="lock-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eye-off-icon" />,
  Package: () => <svg data-testid="package-icon" />,
}));

// Mock de sonner
const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};
jest.mock('sonner', () => ({
  toast: mockToast,
}));

// Mock de AuthContext
const mockLogin = jest.fn();
jest.mock('../../src/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock de ForgotPassword
jest.mock('../../src/app/components/ForgotPassword', () => ({
  __esModule: true,
  default: ({ onBackToLogin }: any) => (
    <div data-testid="forgot-password">
      ForgotPassword Component
      <button onClick={onBackToLogin} data-testid="back-to-login">Volver</button>
    </div>
  ),
}));

// Mock de componentes UI
jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, id, type, required, disabled }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      type={type}
      required={required}
      disabled={disabled}
      data-testid={id || 'input'}
    />
  ),
}));

jest.mock('../../src/app/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor} data-testid="label">{children}</label>,
}));

jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
  CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
}));

jest.mock('../../src/app/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <p data-testid="alert-description">{children}</p>,
}));

import Login from '../../src/app/components/Login';

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderizado inicial', () => {
    it('debería renderizar el formulario de login', () => {
      render(<Login />);
      expect(screen.getByText('Nutregam')).toBeInTheDocument();
    });

    it('debería mostrar descripción del sistema', () => {
      render(<Login />);
      expect(screen.getByText('Sistema de Gestión de Producción')).toBeInTheDocument();
    });

    it('debería renderizar input de email', () => {
      render(<Login />);
      expect(screen.getByTestId('email')).toBeInTheDocument();
    });

    it('debería renderizar input de password', () => {
      render(<Login />);
      expect(screen.getByTestId('password')).toBeInTheDocument();
    });

    it('debería renderizar botón de iniciar sesión', () => {
      render(<Login />);
      expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    });

    it('debería renderizar enlace de olvidé mi contraseña', () => {
      render(<Login />);
      expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
    });

    it('debería renderizar labels de campos', () => {
      render(<Login />);
      expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByText('Contraseña')).toBeInTheDocument();
    });
  });

  describe('validación', () => {
    it('debería mostrar error si campos están vacíos', async () => {
      render(<Login />);
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      expect(screen.getByText('Por favor completa todos los campos')).toBeInTheDocument();
    });

    it('debería mostrar error si email es inválido', async () => {
      render(<Login />);
      
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'invalid' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      expect(screen.getByText('Por favor ingresa un correo electrónico válido')).toBeInTheDocument();
    });
  });

  describe('login exitoso', () => {
    it('debería llamar a login con credenciales correctas', async () => {
      mockLogin.mockResolvedValue({});
      
      render(<Login />);
      
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      });
    });

    it('debería mostrar toast de éxito', async () => {
      mockLogin.mockResolvedValue({});
      
      render(<Login />);
      
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith('Bienvenido a Nutregam');
      });
    });
  });

  describe('errores de login', () => {
    it('debería mostrar mensaje de error de login', async () => {
      mockLogin.mockRejectedValue(new Error('Credenciales inválidas'));
      
      render(<Login />);
      
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'wrongpassword' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
      });
    });

    it('debería mostrar mensaje de error de conexión', async () => {
      mockLogin.mockRejectedValue(new Error('Failed to fetch'));
      
      render(<Login />);
      
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('No se pudo conectar con el servidor. Verifica tu conexión a internet.')).toBeInTheDocument();
      });
    });

  });

  describe('navegación a ForgotPassword', () => {
    it('debería mostrar ForgotPassword al hacer click en enlace', () => {
      render(<Login />);
      
      fireEvent.click(screen.getByText('¿Olvidaste tu contraseña?'));
      
      expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
    });

    it('debería volver a Login desde ForgotPassword', () => {
      render(<Login />);
      
      fireEvent.click(screen.getByText('¿Olvidaste tu contraseña?'));
      expect(screen.getByTestId('forgot-password')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('back-to-login'));
      
      expect(screen.getByText('Nutregam')).toBeInTheDocument();
    });
  });

  describe('mostrar/ocultar contraseña', () => {
    it('debería alternar visibilidad de contraseña', () => {
      render(<Login />);
      
      const passwordInput = screen.getByTestId('password');
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      const toggleButton = screen.getByTestId('eye-icon').closest('button');
      if (toggleButton) fireEvent.click(toggleButton);
      
      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('debería ocultar contraseña al hacer click nuevamente', () => {
      render(<Login />);
      
      const toggleButton = screen.getByTestId('eye-icon').closest('button');
      if (toggleButton) {
        fireEvent.click(toggleButton);
        fireEvent.click(toggleButton);
      }
      
      expect(screen.getByTestId('password')).toHaveAttribute('type', 'password');
    });
  });

  describe('limpiar errores', () => {
    it('debería limpiar error al cambiar email', async () => {
      render(<Login />);
      
      // Crear un error primero
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      expect(screen.getByText('Por favor completa todos los campos')).toBeInTheDocument();
      
      // Cambiar email debería limpiar el error
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@test.com' } });
      
      expect(screen.queryByText('Por favor completa todos los campos')).not.toBeInTheDocument();
    });

    it('debería limpiar error al cambiar password', async () => {
      render(<Login />);
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      expect(screen.getByText('Por favor completa todos los campos')).toBeInTheDocument();
      
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password' } });
      
      expect(screen.queryByText('Por favor completa todos los campos')).not.toBeInTheDocument();
    });
  });

  describe('estado de carga', () => {
    it('debería mostrar estado de carga mientras procesa', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      render(<Login />);
      
      fireEvent.change(screen.getByTestId('email'), { target: { value: 'test@test.com' } });
      fireEvent.change(screen.getByTestId('password'), { target: { value: 'password123' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
      });
    });
  });
});
