/**
 * Tests para Navbar.tsx
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  Bell: () => <svg data-testid="bell-icon" />,
  Menu: () => <svg data-testid="menu-icon" />,
  X: () => <svg data-testid="x-icon" />,
  AlertCircle: () => <svg data-testid="alert-circle-icon" />,
  AlertTriangle: () => <svg data-testid="alert-triangle-icon" />,
  Info: () => <svg data-testid="info-icon" />,
}));

// Mock de useAlerts
const mockAlerts = jest.fn(() => ({ alerts: [] }));
jest.mock('../../src/app/hooks/useAlerts', () => ({
  useAlerts: () => mockAlerts(),
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
  Badge: ({ children, variant, className }: any) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

jest.mock('../../src/app/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: any) => (
    <div data-testid="popover" data-open={open}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { onOpenChange })
      )}
    </div>
  ),
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children }: any) => <div data-testid="popover-trigger">{children}</div>,
}));

jest.mock('../../src/app/components/ui/sheet', () => ({
  Sheet: ({ children }: any) => <div data-testid="sheet">{children}</div>,
  SheetContent: ({ children }: any) => <div data-testid="sheet-content">{children}</div>,
  SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: any) => <h2 data-testid="sheet-title">{children}</h2>,
  SheetTrigger: ({ children }: any) => <div data-testid="sheet-trigger">{children}</div>,
}));

jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
}));

jest.mock('../../src/app/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

import Navbar from '../../src/app/components/Navbar';

describe('Navbar', () => {
  const defaultProps = {
    onMenuClick: jest.fn(),
    isSidebarOpen: false,
    setActiveSection: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockAlerts.mockReturnValue({ alerts: [] });
  });

  describe('renderizado inicial', () => {
    it('debería renderizar el navbar', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('Nutregam')).toBeInTheDocument();
    });

    it('debería renderizar el subtítulo', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('Sistema de Gestión')).toBeInTheDocument();
    });

    it('debería renderizar el icono de campana', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getAllByTestId('bell-icon').length).toBeGreaterThan(0);
    });

    it('debería renderizar el icono de menú cuando sidebar está cerrado', () => {
      render(<Navbar {...defaultProps} isSidebarOpen={false} />);
      expect(screen.getByTestId('menu-icon')).toBeInTheDocument();
    });

    it('debería renderizar el icono X cuando sidebar está abierto', () => {
      render(<Navbar {...defaultProps} isSidebarOpen={true} />);
      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });
  });

  describe('botón de menú', () => {
    it('debería llamar onMenuClick al hacer click', () => {
      render(<Navbar {...defaultProps} />);
      
      const buttons = screen.getAllByTestId('button');
      fireEvent.click(buttons[0]);
      
      expect(defaultProps.onMenuClick).toHaveBeenCalled();
    });
  });

  describe('sin alertas', () => {
    it('debería mostrar mensaje de sin alertas', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('No hay alertas activas')).toBeInTheDocument();
    });

    it('no debería mostrar badge con número cuando no hay alertas', () => {
      render(<Navbar {...defaultProps} />);
      // Sin alertas activas, no debería haber un badge con número
      expect(screen.queryByText(/^[1-9]$/)).not.toBeInTheDocument();
    });
  });

  describe('con alertas', () => {
    const mockAlertsWithData = [
      {
        idalert: 1,
        alert_title: 'Stock bajo',
        alert_message: 'Producto X tiene stock bajo',
        priority: 'critical',
        status: 'active',
        alert_type: 'low_stock',
        creationdate: new Date().toISOString(),
      },
      {
        idalert: 2,
        alert_title: 'Mantenimiento',
        alert_message: 'Máquina necesita revisión',
        priority: 'high',
        status: 'active',
        alert_type: 'maintenance',
        creationdate: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      },
      {
        idalert: 3,
        alert_title: 'Info',
        alert_message: 'Información general',
        priority: 'medium',
        status: 'active',
        alert_type: 'quality',
        creationdate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 días atrás
      },
    ];

    beforeEach(() => {
      mockAlerts.mockReturnValue({ alerts: mockAlertsWithData });
    });

    it('debería mostrar badge con contador', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('debería mostrar alertas en el popover', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getAllByText('Stock bajo').length).toBeGreaterThan(0);
    });

    it('debería mostrar mensaje de alertas', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText(/Producto X tiene stock bajo/)).toBeInTheDocument();
    });

    it('debería mostrar botón ver todas las alertas', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('Ver todas las alertas')).toBeInTheDocument();
    });

    it('debería llamar setActiveSection al hacer click en ver todas', () => {
      render(<Navbar {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Ver todas las alertas'));
      
      expect(defaultProps.setActiveSection).toHaveBeenCalledWith('alerts');
    });

    it('debería mostrar tipo de alerta correcto', () => {
      render(<Navbar {...defaultProps} />);
      expect(screen.getAllByText('Stock Bajo').length).toBeGreaterThan(0);
    });
  });

  describe('prioridad de alertas', () => {
    it('debería mostrar diferentes iconos según prioridad', () => {
      mockAlerts.mockReturnValue({
        alerts: [
          {
            idalert: 1,
            alert_title: 'Critical',
            alert_message: 'Mensaje',
            priority: 'critical',
            status: 'active',
            alert_type: 'system',
            creationdate: new Date().toISOString(),
          },
          {
            idalert: 2,
            alert_title: 'High',
            alert_message: 'Mensaje',
            priority: 'high',
            status: 'active',
            alert_type: 'system',
            creationdate: new Date().toISOString(),
          },
          {
            idalert: 3,
            alert_title: 'Medium',
            alert_message: 'Mensaje',
            priority: 'medium',
            status: 'active',
            alert_type: 'system',
            creationdate: new Date().toISOString(),
          },
        ],
      });
      
      render(<Navbar {...defaultProps} />);
      
      // Verificar que se renderizan iconos
      expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('alert-triangle-icon')).toBeInTheDocument();
    });
  });

  describe('formateo de fechas', () => {
    it('debería mostrar "Hace menos de 1 hora" para fechas recientes', () => {
      mockAlerts.mockReturnValue({
        alerts: [{
          idalert: 1,
          alert_title: 'Test',
          alert_message: 'Mensaje',
          priority: 'low',
          status: 'active',
          alert_type: 'system',
          creationdate: new Date().toISOString(),
        }],
      });
      
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('Hace menos de 1 hora')).toBeInTheDocument();
    });

    it('debería mostrar horas para fechas de hoy', () => {
      mockAlerts.mockReturnValue({
        alerts: [{
          idalert: 1,
          alert_title: 'Test',
          alert_message: 'Mensaje',
          priority: 'low',
          status: 'active',
          alert_type: 'system',
          creationdate: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 horas atrás
        }],
      });
      
      render(<Navbar {...defaultProps} />);
      // Buscar texto que contiene "hora"
      expect(screen.getByText(/hora/)).toBeInTheDocument();
    });

    it('debería mostrar días para fechas pasadas', () => {
      mockAlerts.mockReturnValue({
        alerts: [{
          idalert: 1,
          alert_title: 'Test',
          alert_message: 'Mensaje',
          priority: 'low',
          status: 'active',
          alert_type: 'system',
          creationdate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 días atrás
        }],
      });
      
      render(<Navbar {...defaultProps} />);
      // Buscar texto que contiene "días"
      expect(screen.getByText(/día/)).toBeInTheDocument();
    });
  });

  describe('más de 9 alertas', () => {
    it('debería mostrar "9+" cuando hay más de 9 alertas', () => {
      const manyAlerts = Array.from({ length: 15 }, (_, i) => ({
        idalert: i + 1,
        alert_title: `Alert ${i + 1}`,
        alert_message: 'Mensaje',
        priority: 'medium',
        status: 'active',
        alert_type: 'system',
        creationdate: new Date().toISOString(),
      }));
      
      mockAlerts.mockReturnValue({ alerts: manyAlerts });
      
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('9+')).toBeInTheDocument();
    });
  });

  describe('tipos de alerta', () => {
    it('debería mostrar "Próximo a Vencer" para expiración', () => {
      mockAlerts.mockReturnValue({
        alerts: [{
          idalert: 1,
          alert_title: 'Test',
          alert_message: 'Mensaje',
          priority: 'medium',
          status: 'active',
          alert_type: 'expiration',
          creationdate: new Date().toISOString(),
        }],
      });
      
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('Próximo a Vencer')).toBeInTheDocument();
    });

    it('debería mostrar "Producción" para tipo producción', () => {
      mockAlerts.mockReturnValue({
        alerts: [{
          idalert: 1,
          alert_title: 'Test',
          alert_message: 'Mensaje',
          priority: 'medium',
          status: 'active',
          alert_type: 'production',
          creationdate: new Date().toISOString(),
        }],
      });
      
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('Producción')).toBeInTheDocument();
    });

    it('debería mostrar "Sistema" para tipo sistema', () => {
      mockAlerts.mockReturnValue({
        alerts: [{
          idalert: 1,
          alert_title: 'Test',
          alert_message: 'Mensaje',
          priority: 'medium',
          status: 'active',
          alert_type: 'system',
          creationdate: new Date().toISOString(),
        }],
      });
      
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('Sistema')).toBeInTheDocument();
    });
  });

  describe('alertas inactivas', () => {
    it('no debería contar alertas con status diferente a active', () => {
      mockAlerts.mockReturnValue({
        alerts: [
          {
            idalert: 1,
            alert_title: 'Activa',
            alert_message: 'Mensaje',
            priority: 'medium',
            status: 'active',
            alert_type: 'system',
            creationdate: new Date().toISOString(),
          },
          {
            idalert: 2,
            alert_title: 'Resuelta',
            alert_message: 'Mensaje',
            priority: 'medium',
            status: 'resolved',
            alert_type: 'system',
            creationdate: new Date().toISOString(),
          },
        ],
      });
      
      render(<Navbar {...defaultProps} />);
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
});
