import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

// Mock apiRequest
const mockApiRequest = jest.fn();
jest.mock('../../src/app/config/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

// Mock sonner toast - uses getter to avoid hoisting issues
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    get success() { return mockToastSuccess; },
    get error() { return mockToastError; },
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  CheckCircle2: () => <span data-testid="check-icon">CheckCircle</span>,
  AlertCircle: () => <span data-testid="alert-icon">AlertCircle</span>,
  Eye: () => <span data-testid="eye-icon">Eye</span>,
  EyeOff: () => <span data-testid="eye-off-icon">EyeOff</span>,
  KeyRound: () => <span data-testid="key-icon">KeyRound</span>,
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
}));

// Mock UI components
jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, variant, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    type?: string;
    variant?: string;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} type={type as 'button' | 'submit'} data-variant={variant} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('../../src/app/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="card-title" className={className}>{children}</h2>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <p data-testid="card-description" className={className}>{children}</p>
  ),
}));

jest.mock('../../src/app/components/ui/alert', () => ({
  Alert: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <div data-testid="alert" data-variant={variant}>{children}</div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-description">{children}</div>
  ),
}));

import ResetPassword from '../../src/app/components/ResetPassword';

describe('ResetPassword', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        search: '?token=valid-test-token-12345',
        href: '',
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  it('debería renderizar el formulario correctamente cuando hay token', () => {
    render(<ResetPassword />);
    
    expect(screen.getByTestId('card-title')).toHaveTextContent('Restablecer contraseña');
    expect(screen.getByText('Ingresa tu nueva contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirmar contraseña/i)).toBeInTheDocument();
  });

  it('debería mostrar error cuando no hay token en URL', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '' },
      writable: true,
    });
    
    render(<ResetPassword />);
    
    expect(screen.getByText(/No se encontró un token válido/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Volver al inicio de sesión/i })).toBeInTheDocument();
  });

  it('debería alternar visibilidad de contraseña', () => {
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    const toggleButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('[data-testid="eye-icon"]') || btn.querySelector('[data-testid="eye-off-icon"]')
    );
    fireEvent.click(toggleButtons[0]);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('debería alternar visibilidad de confirmar contraseña', () => {
    render(<ResetPassword />);
    
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    expect(confirmInput).toHaveAttribute('type', 'password');
    
    const toggleButtons = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('[data-testid="eye-icon"]') || btn.querySelector('[data-testid="eye-off-icon"]')
    );
    fireEvent.click(toggleButtons[1]);
    
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  it('debería mostrar error si la contraseña está vacía', async () => {
    render(<ResetPassword />);
    
    const form = screen.getByLabelText(/Nueva contraseña/i).closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Por favor ingrese una contraseña');
    });
  });

  it('debería mostrar error si la contraseña es menor a 8 caracteres', async () => {
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    fireEvent.change(passwordInput, { target: { value: '1234567' } });
    
    const form = passwordInput.closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('La contraseña debe tener al menos 8 caracteres');
    });
  });

  it('debería mostrar error si las contraseñas no coinciden', async () => {
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '87654321' } });
    
    const form = passwordInput.closest('form')!;
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Las contraseñas no coinciden');
    });
  });

  it('debería mostrar indicador de contraseñas coinciden', () => {
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '12345678' } });
    
    expect(screen.getByText('Las contraseñas coinciden')).toBeInTheDocument();
  });

  it('debería mostrar indicador de contraseñas no coinciden', () => {
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '87654321' } });
    
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('debería enviar formulario exitosamente', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });
    
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '12345678' } });
    
    const form = passwordInput.closest('form')!;
    
    await act(async () => {
      fireEvent.submit(form);
    });
    
    await waitFor(() => {
      expect(mockApiRequest).toHaveBeenCalledWith('/auth/reset-password', {
        method: 'PUT',
        body: JSON.stringify({
          token: 'valid-test-token-12345',
          newPassword: '12345678',
        }),
      });
    });
    
    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('¡Contraseña restablecida exitosamente!');
    });
  });

  it('debería mostrar vista de éxito después de restablecer', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });
    
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '12345678' } });
    
    await act(async () => {
      fireEvent.submit(passwordInput.closest('form')!);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Contraseña restablecida')).toBeInTheDocument();
      expect(screen.getByText(/Serás redirigido/i)).toBeInTheDocument();
    });
  });

  it('debería redirigir después de 3 segundos en éxito', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });
    
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '12345678' } });
    
    await act(async () => {
      fireEvent.submit(passwordInput.closest('form')!);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Contraseña restablecida')).toBeInTheDocument();
    });
    
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    
    expect(window.location.href).toBe('/');
  });

  it('debería manejar error de API', async () => {
    mockApiRequest.mockRejectedValueOnce(new Error('Token expirado'));
    
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '12345678' } });
    
    await act(async () => {
      fireEvent.submit(passwordInput.closest('form')!);
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Token expirado');
    });
  });

  it('debería manejar respuesta sin success', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: false, message: 'Token inválido' });
    
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '12345678' } });
    
    await act(async () => {
      fireEvent.submit(passwordInput.closest('form')!);
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Token inválido');
    });
  });

  it('debería navegar al login al hacer click en botón volver', () => {
    render(<ResetPassword />);
    
    const backButton = screen.getByRole('button', { name: /Volver al inicio de sesión/i });
    fireEvent.click(backButton);
    
    expect(window.location.href).toBe('/');
  });

  it('debería navegar al login desde vista de éxito', async () => {
    mockApiRequest.mockResolvedValueOnce({ success: true });
    
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '12345678' } });
    
    await act(async () => {
      fireEvent.submit(passwordInput.closest('form')!);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Contraseña restablecida')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByRole('button', { name: /Ir al inicio de sesión/i }));
    
    expect(window.location.href).toBe('/');
  });

  it('debería manejar error genérico (no Error instance)', async () => {
    mockApiRequest.mockRejectedValueOnce('Error string');
    
    render(<ResetPassword />);
    
    const passwordInput = screen.getByLabelText(/Nueva contraseña/i);
    const confirmInput = screen.getByLabelText(/Confirmar contraseña/i);
    
    fireEvent.change(passwordInput, { target: { value: '12345678' } });
    fireEvent.change(confirmInput, { target: { value: '12345678' } });
    
    await act(async () => {
      fireEvent.submit(passwordInput.closest('form')!);
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error al restablecer contraseña');
    });
  });

  it('debería navegar al login desde pantalla sin token', () => {
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, search: '', href: '' },
      writable: true,
    });
    
    render(<ResetPassword />);
    
    const backButton = screen.getByRole('button', { name: /Volver al inicio de sesión/i });
    fireEvent.click(backButton);
    
    expect(window.location.href).toBe('/');
  });
});
