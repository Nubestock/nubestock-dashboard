/**
 * Tests para BackendNotConfigured.tsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
  ExternalLink: () => <svg data-testid="external-link-icon" />,
}));

// Mock de componentes UI
jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardDescription: ({ children, className }: any) => <p data-testid="card-description" className={className}>{children}</p>,
  CardHeader: ({ children, className }: any) => <div data-testid="card-header" className={className}>{children}</div>,
  CardTitle: ({ children, className }: any) => <h2 data-testid="card-title" className={className}>{children}</h2>,
}));

jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant }: any) => (
    <button onClick={onClick} className={className} data-testid="button" data-variant={variant}>
      {children}
    </button>
  ),
}));

import BackendNotConfigured from '../../src/app/components/BackendNotConfigured';

describe('BackendNotConfigured', () => {
  const originalOpen = window.open;
  let reloadSpy: jest.SpyInstance;

  beforeEach(() => {
    // jsdom 21+ no permite redefinir location; espiar la implementación interna
    const implSymbol = Reflect.ownKeys(window.location).find((k) => typeof k === 'symbol');
    if (implSymbol) {
      reloadSpy = jest.spyOn((window.location as Record<symbol, { reload: () => void }>)[implSymbol], 'reload').mockImplementation(() => {});
    } else {
      reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(() => {});
    }
    window.open = jest.fn();
  });

  afterEach(() => {
    reloadSpy?.mockRestore();
    window.open = originalOpen;
  });

  it('debería renderizar el título "Backend No Configurado"', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByText('Backend No Configurado')).toBeInTheDocument();
  });

  it('debería renderizar la descripción', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByText('Necesitas configurar la URL de tu backend de Azure Functions')).toBeInTheDocument();
  });

  it('debería renderizar el icono AlertCircle', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
  });

  it('debería mostrar la sección "¿Qué hacer?"', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByText('¿Qué hacer?')).toBeInTheDocument();
  });

  it('debería mostrar la lista de pasos', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByText(/Abre el archivo/)).toBeInTheDocument();
    expect(screen.getByText(/Reemplaza/)).toBeInTheDocument();
    expect(screen.getByText(/Guarda el archivo/)).toBeInTheDocument();
  });

  it('debería mostrar la ruta del archivo de configuración', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByText('/src/app/config/api.ts')).toBeInTheDocument();
  });

  it('debería mostrar la sección de ejemplo de configuración', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByText('Ejemplo de configuración:')).toBeInTheDocument();
  });

  it('debería mostrar el código de ejemplo', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByText(/export const API_CONFIG/)).toBeInTheDocument();
    expect(screen.getByText(/BASE_URL/)).toBeInTheDocument();
  });

  it('debería recargar la página al hacer click en "Recargar Aplicación"', () => {
    render(<BackendNotConfigured />);
    
    const buttons = screen.getAllByTestId('button');
    const reloadButton = buttons.find(btn => btn.textContent?.includes('Recargar Aplicación'));
    
    expect(reloadButton).toBeDefined();
    if (reloadButton) {
      fireEvent.click(reloadButton);
      expect(reloadSpy).toHaveBeenCalled();
    }
  });

  it('debería abrir documentación al hacer click en "Ver Documentación"', () => {
    render(<BackendNotConfigured />);
    
    const buttons = screen.getAllByTestId('button');
    const docButton = buttons.find(btn => btn.textContent?.includes('Ver Documentación'));
    
    expect(docButton).toBeDefined();
    if (docButton) {
      fireEvent.click(docButton);
      expect(window.open).toHaveBeenCalledWith('/QUICK_START_AUTH.md', '_blank');
    }
  });

  it('debería renderizar el icono ExternalLink', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByTestId('external-link-icon')).toBeInTheDocument();
  });

  it('debería mostrar el texto de ayuda', () => {
    render(<BackendNotConfigured />);
    expect(screen.getByText('¿Necesitas ayuda?')).toBeInTheDocument();
    expect(screen.getByText('Revisa los archivos QUICK_START_AUTH.md y AUTH_SETUP.md')).toBeInTheDocument();
  });
});
