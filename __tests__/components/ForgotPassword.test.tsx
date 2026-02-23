/**
 * Tests para ForgotPassword.tsx
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  CheckCircle2: () => <svg data-testid="check-icon" />,
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
  Mail: () => <svg data-testid="mail-icon" />,
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
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

// Mock de apiRequest
const mockApiRequest = jest.fn();
jest.mock('../../src/app/config/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

// Mock de componentes UI
jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, variant }: any) => (
    <button onClick={onClick} disabled={disabled} type={type} data-testid="button" data-variant={variant}>
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, id, type, required, disabled, autoFocus }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      id={id}
      type={type}
      required={required}
      disabled={disabled}
      autoFocus={autoFocus}
      data-testid={id || 'input'}
    />
  ),
}));

jest.mock('../../src/app/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor} data-testid="label">{children}</label>,
}));

jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h2 data-testid="card-title">{children}</h2>,
  CardDescription: ({ children }: any) => <p data-testid="card-description">{children}</p>,
}));

jest.mock('../../src/app/components/ui/alert', () => ({
  Alert: ({ children, className }: any) => <div data-testid="alert" className={className}>{children}</div>,
  AlertDescription: ({ children }: any) => <p data-testid="alert-description">{children}</p>,
}));

import ForgotPassword from '../../src/app/components/ForgotPassword';

describe('ForgotPassword', () => {
  const defaultProps = {
    onBackToLogin: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderizado inicial', () => {
    it('debería renderizar el formulario', () => {
      render(<ForgotPassword {...defaultProps} />);
      expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
    });

    it('debería renderizar descripción', () => {
      render(<ForgotPassword {...defaultProps} />);
      expect(screen.getByText('Ingresa tu correo para recibir un enlace de restablecimiento')).toBeInTheDocument();
    });

    it('debería renderizar input de email', () => {
      render(<ForgotPassword {...defaultProps} />);
      expect(screen.getByTestId('email')).toBeInTheDocument();
    });

    it('debería renderizar label de email', () => {
      render(<ForgotPassword {...defaultProps} />);
      expect(screen.getByText('Correo electrónico')).toBeInTheDocument();
    });

    it('debería renderizar botón enviar enlace', () => {
      render(<ForgotPassword {...defaultProps} />);
      expect(screen.getByText('Enviar enlace')).toBeInTheDocument();
    });

    it('debería renderizar botón volver', () => {
      render(<ForgotPassword {...defaultProps} />);
      expect(screen.getByText('Volver al inicio de sesión')).toBeInTheDocument();
    });

    it('debería mostrar alerta informativa', () => {
      render(<ForgotPassword {...defaultProps} />);
      expect(screen.getByText(/Enviaremos instrucciones a tu correo/)).toBeInTheDocument();
    });
  });

  describe('validación', () => {
    it('debería mostrar error si el email está vacío', async () => {
      render(<ForgotPassword {...defaultProps} />);
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(mockToast.error).toHaveBeenCalledWith('Por favor ingrese su correo electrónico');
    });

    it('debería mostrar error si el email es inválido', async () => {
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      expect(mockToast.error).toHaveBeenCalledWith('Por favor ingrese un correo electrónico válido');
    });
  });

  describe('submit exitoso', () => {
    it('debería enviar solicitud con email válido', async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ email: 'test@test.com' }),
        });
      });
    });

    it('debería mostrar vista de éxito después de enviar', async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Solicitud enviada')).toBeInTheDocument();
      });
    });

    it('debería mostrar el email en la vista de éxito', async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
      });
    });

    it('debería mostrar instrucciones en vista de éxito', async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('• Revisa tu bandeja de entrada')).toBeInTheDocument();
        expect(screen.getByText('• Revisa tu carpeta de spam')).toBeInTheDocument();
        expect(screen.getByText('• El enlace expirará en 1 hora')).toBeInTheDocument();
      });
    });
  });

  describe('manejo de errores', () => {
    it('debería mostrar éxito incluso si hay error en API (por seguridad)', async () => {
      mockApiRequest.mockRejectedValue(new Error('Server error'));
      
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Solicitud enviada')).toBeInTheDocument();
      });
    });

    it('debería llamar toast.success incluso con error', async () => {
      mockApiRequest.mockRejectedValue(new Error('Server error'));
      
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalled();
      });
    });
  });

  describe('navegación', () => {
    it('debería llamar onBackToLogin al hacer click en volver', () => {
      render(<ForgotPassword {...defaultProps} />);
      
      const backButton = screen.getByText('Volver al inicio de sesión');
      fireEvent.click(backButton);
      
      expect(defaultProps.onBackToLogin).toHaveBeenCalled();
    });

    it('debería llamar onBackToLogin desde vista de éxito', async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Solicitud enviada')).toBeInTheDocument();
      });
      
      const backButton = screen.getByText('Volver al inicio de sesión');
      fireEvent.click(backButton);
      
      expect(defaultProps.onBackToLogin).toHaveBeenCalled();
    });
  });

  describe('estado de carga', () => {
    it('debería mostrar estado de carga mientras envía', async () => {
      mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));
      
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email');
      fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
      
      const form = screen.getByTestId('card-content').querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }
      
      await waitFor(() => {
        expect(screen.getByText('Enviando...')).toBeInTheDocument();
      });
    });
  });

  describe('cambios de input', () => {
    it('debería actualizar el email al escribir', () => {
      render(<ForgotPassword {...defaultProps} />);
      
      const emailInput = screen.getByTestId('email') as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'nuevo@email.com' } });
      
      expect(emailInput.value).toBe('nuevo@email.com');
    });
  });
});
