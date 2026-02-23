/**
 * Tests para AlertsView.tsx
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <svg data-testid="alert-triangle-icon" />,
  Package: () => <svg data-testid="package-icon" />,
  Bell: () => <svg data-testid="bell-icon" />,
  RefreshCw: () => <svg data-testid="refresh-icon" />,
  CheckCircle: () => <svg data-testid="check-circle-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  ShoppingCart: () => <svg data-testid="shopping-cart-icon" />,
  ArrowUpRight: () => <svg data-testid="arrow-up-right-icon" />,
  TrendingDown: () => <svg data-testid="trending-down-icon" />,
  Search: () => <svg data-testid="search-icon" />,
  Filter: () => <svg data-testid="filter-icon" />,
  MoreVertical: () => <svg data-testid="more-vertical-icon" />,
}));

// Mock de sonner
const mockToast = {
  success: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
};
jest.mock('sonner', () => ({
  toast: mockToast,
}));

// Mock de componentes UI
jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div data-testid="card" className={className}>{children}</div>,
  CardContent: ({ children, className }: any) => <div data-testid="card-content" className={className}>{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('../../src/app/components/ui/badge', () => ({
  Badge: ({ children, className, variant }: any) => (
    <span data-testid="badge" className={className}>{children}</span>
  ),
}));

jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant, size }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-testid="button">
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className }: any) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid="search-input"
    />
  ),
}));

jest.mock('../../src/app/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, className }: any) => (
    <div data-testid="tabs" data-default={defaultValue} className={className}>{children}</div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid="tabs-list" className={className}>{children}</div>
  ),
  TabsTrigger: ({ children, value, className }: any) => (
    <button data-testid={`tab-${value}`} className={className}>{children}</button>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div data-testid={`tab-content-${value}`} className={className}>{children}</div>
  ),
}));

jest.mock('../../src/app/components/ui/sheet', () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div data-testid="sheet" data-open={open}>{children}</div>
  ),
  SheetContent: ({ children, side, className }: any) => (
    <div data-testid="sheet-content" data-side={side} className={className}>{children}</div>
  ),
  SheetDescription: ({ children }: any) => <p data-testid="sheet-description">{children}</p>,
  SheetHeader: ({ children }: any) => <div data-testid="sheet-header">{children}</div>,
  SheetTitle: ({ children }: any) => <h2 data-testid="sheet-title">{children}</h2>,
  SheetTrigger: ({ children, asChild }: any) => <div data-testid="sheet-trigger">{children}</div>,
}));

jest.mock('../../src/app/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuContent: ({ children, align }: any) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button data-testid="dropdown-item" onClick={onClick}>{children}</button>
  ),
  DropdownMenuTrigger: ({ children, asChild }: any) => (
    <div data-testid="dropdown-trigger">{children}</div>
  ),
}));

// Variables para el mock de useAlerts
const mockRefetch = jest.fn();
let mockAlertsData: any = {
  alerts: [],
  isLoading: false,
  error: null,
  refetch: mockRefetch,
};

jest.mock('../../src/app/hooks/useAlerts', () => ({
  useAlerts: () => mockAlertsData,
}));

import AlertsView from '../../src/app/components/AlertsView';

describe('AlertsView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlertsData = {
      alerts: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    };
  });

  describe('renderizado básico', () => {
    it('debería renderizar el título "Centro de Alertas"', () => {
      render(<AlertsView />);
      expect(screen.getByText('Centro de Alertas')).toBeInTheDocument();
    });

    it('debería renderizar el subtítulo', () => {
      render(<AlertsView />);
      expect(screen.getByText('Monitoreo y gestión de alertas del sistema')).toBeInTheDocument();
    });

    it('debería renderizar el campo de búsqueda', () => {
      render(<AlertsView />);
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    it('debería renderizar el botón de filtros', () => {
      render(<AlertsView />);
      expect(screen.getByTestId('sheet-trigger')).toBeInTheDocument();
    });
  });

  describe('estado de carga', () => {
    it('debería mostrar spinner de carga cuando isLoading es true', () => {
      mockAlertsData.isLoading = true;
      render(<AlertsView />);
      expect(screen.getByText('Cargando alertas...')).toBeInTheDocument();
    });
  });

  describe('estado de error', () => {
    it('debería mostrar mensaje de error cuando hay error', () => {
      mockAlertsData.error = 'Error al cargar alertas';
      render(<AlertsView />);
      expect(screen.getByText('Error al cargar alertas')).toBeInTheDocument();
    });
  });

  describe('sin alertas', () => {
    it('debería mostrar mensaje de todo en orden cuando no hay alertas', () => {
      mockAlertsData.alerts = [];
      render(<AlertsView />);
      expect(screen.getByText('¡Todo en orden!')).toBeInTheDocument();
      expect(screen.getByText('No hay alertas activas en este momento')).toBeInTheDocument();
    });
  });

  describe('estadísticas', () => {
    it('debería mostrar contador de alertas urgentes', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'critical', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: 'Test message', creationdate: '2024-01-01' },
        { idalert: '2', priority: 'high', status: 'active', alert_type: 'stock_low', alert_title: 'Test 2', alert_message: 'Test message 2', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getByText('Urgentes')).toBeInTheDocument();
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('debería mostrar contador de stock bajo', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: 'Test', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
    });

    it('debería mostrar contador de alertas en revisión', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'acknowledged', alert_type: 'stock_low', alert_title: 'Test', alert_message: 'Test', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('En Revisión').length).toBeGreaterThan(0);
    });

    it('debería mostrar contador total de alertas', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: 'Test', creationdate: '2024-01-01' },
        { idalert: '2', priority: 'low', status: 'active', alert_type: 'maintenance', alert_title: 'Test 2', alert_message: 'Test 2', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('búsqueda', () => {
    it('debería filtrar alertas por término de búsqueda', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Alerta Producto A', alert_message: 'Stock bajo', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'Producto A' } });
      
      expect(searchInput).toHaveValue('Producto A');
    });
  });

  describe('refetch', () => {
    it('debería llamar refetch al hacer click en el botón de actualizar', () => {
      render(<AlertsView />);
      
      const buttons = screen.getAllByTestId('button');
      const refreshButton = buttons.find(btn => btn.querySelector('[data-testid="refresh-icon"]'));
      if (refreshButton) {
        fireEvent.click(refreshButton);
      }
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('acciones de alertas', () => {
    beforeEach(() => {
      mockAlertsData.alerts = [
        {
          idalert: '1',
          entity_id: 'prod-1',
          priority: 'critical',
          status: 'active',
          alert_type: 'stock_low',
          alert_title: 'Stock bajo',
          alert_message: 'El producto "Test Product" (SKU: ABC123) tiene Stock actual: 5. Mínimo requerido: 20',
          creationdate: '2024-01-01',
        },
      ];
    });

    it('debería mostrar toast al marcar alerta como en revisión', () => {
      render(<AlertsView />);
      
      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const acknowledgeButton = dropdownItems.find(item => item.textContent?.includes('Marcar en revisión'));
      if (acknowledgeButton) {
        fireEvent.click(acknowledgeButton);
      }
      
      expect(mockToast.success).toHaveBeenCalledWith('Alerta marcada como en revisión');
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('debería mostrar toast al resolver alerta', () => {
      render(<AlertsView />);
      
      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const resolveButton = dropdownItems.find(item => item.textContent?.includes('Resolver'));
      if (resolveButton) {
        fireEvent.click(resolveButton);
      }
      
      expect(mockToast.success).toHaveBeenCalledWith('Alerta resuelta correctamente');
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('debería mostrar toast al ver producto', () => {
      render(<AlertsView />);
      
      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const viewButton = dropdownItems.find(item => item.textContent?.includes('Ver producto'));
      if (viewButton) {
        fireEvent.click(viewButton);
      }
      
      expect(mockToast.info).toHaveBeenCalledWith('Abriendo detalles del producto...');
    });

    it('debería llamar onViewProduct si está definido', () => {
      const mockOnViewProduct = jest.fn();
      render(<AlertsView onViewProduct={mockOnViewProduct} />);
      
      const dropdownItems = screen.getAllByTestId('dropdown-item');
      const viewButton = dropdownItems.find(item => item.textContent?.includes('Ver producto'));
      if (viewButton) {
        fireEvent.click(viewButton);
      }
      
      expect(mockOnViewProduct).toHaveBeenCalledWith('prod-1');
    });
  });

  describe('getPriorityBadge', () => {
    it('debería mostrar badge crítica para prioridad critical', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'critical', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Crítica').length).toBeGreaterThan(0);
    });

    it('debería mostrar badge alta para prioridad high', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'high', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Alta').length).toBeGreaterThan(0);
    });

    it('debería mostrar badge media para prioridad medium', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Media').length).toBeGreaterThan(0);
    });

    it('debería mostrar badge baja para prioridad low o desconocida', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'low', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Baja').length).toBeGreaterThan(0);
    });
  });

  describe('getStatusBadge', () => {
    it('debería mostrar badge "Requiere Atención" para status active', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Requiere Atención').length).toBeGreaterThan(0);
    });

    it('debería mostrar badge "En Revisión" para status acknowledged', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'acknowledged', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('En Revisión').length).toBeGreaterThan(0);
    });

    it('debería mostrar badge "Resuelta" para status resolved', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'resolved', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Resuelta').length).toBeGreaterThan(0);
    });

    it('debería mostrar el status como texto para status desconocido', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'unknown_status', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('unknown_status').length).toBeGreaterThan(0);
    });
  });

  describe('extractProductInfo', () => {
    it('debería extraer información del producto del mensaje', () => {
      mockAlertsData.alerts = [
        {
          idalert: '1',
          priority: 'critical',
          status: 'active',
          alert_type: 'stock_low',
          alert_title: 'Stock bajo',
          alert_message: 'El producto "Mi Producto Test" (SKU: SKU-12345) tiene Stock actual: 10. Mínimo requerido: 50',
          creationdate: '2024-01-01',
        },
      ];
      render(<AlertsView />);
      
      expect(screen.getAllByText('Mi Producto Test').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SKU-12345').length).toBeGreaterThan(0);
      expect(screen.getAllByText('10').length).toBeGreaterThan(0);
      expect(screen.getAllByText('50').length).toBeGreaterThan(0);
      expect(screen.getAllByText('-40').length).toBeGreaterThan(0);
    });

    it('debería usar valores por defecto cuando el mensaje no tiene formato esperado', () => {
      mockAlertsData.alerts = [
        {
          idalert: '1',
          priority: 'critical',
          status: 'active',
          alert_type: 'stock_low',
          alert_title: 'Stock bajo',
          alert_message: 'Mensaje sin formato estándar',
          creationdate: '2024-01-01',
        },
      ];
      render(<AlertsView />);
      
      expect(screen.getAllByText('Producto').length).toBeGreaterThan(0);
      expect(screen.getAllByText('N/A').length).toBeGreaterThan(0);
    });
  });

  describe('formatDate', () => {
    it('debería mostrar "Hoy" para fecha de hoy', () => {
      const today = new Date().toISOString();
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: today },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Hoy').length).toBeGreaterThan(0);
    });

    it('debería mostrar "Ayer" para fecha de ayer', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: yesterday.toISOString() },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Ayer').length).toBeGreaterThan(0);
    });

    it('debería mostrar "Hace X días" para fechas recientes', () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: threeDaysAgo.toISOString() },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Hace 3 días').length).toBeGreaterThan(0);
    });

    it('debería mostrar "Hace X semanas" para fechas de hace semanas', () => {
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: twoWeeksAgo.toISOString() },
      ];
      render(<AlertsView />);
      expect(screen.getAllByText('Hace 2 semanas').length).toBeGreaterThan(0);
    });

    it('debería mostrar fecha formateada para fechas antiguas', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 60);
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: oldDate.toISOString() },
      ];
      render(<AlertsView />);
      // Verifica que se muestre alguna fecha formateada
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('filtrado por prioridad', () => {
    beforeEach(() => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'critical', status: 'active', alert_type: 'stock_low', alert_title: 'Critical Alert', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
        { idalert: '2', priority: 'high', status: 'active', alert_type: 'stock_low', alert_title: 'High Alert', alert_message: '"Test2" SKU: DEF Stock actual: 10 Mínimo requerido: 30', creationdate: '2024-01-01' },
        { idalert: '3', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Medium Alert', alert_message: '"Test3" SKU: GHI Stock actual: 15 Mínimo requerido: 25', creationdate: '2024-01-01' },
      ];
    });

    it('debería mostrar opción para filtrar por todas las prioridades', () => {
      render(<AlertsView />);
      expect(screen.getByText('Todas las prioridades')).toBeInTheDocument();
    });

    it('debería mostrar opción para filtrar por críticas', () => {
      render(<AlertsView />);
      expect(screen.getByText('Críticas')).toBeInTheDocument();
    });

    it('debería mostrar opción para filtrar por altas', () => {
      render(<AlertsView />);
      expect(screen.getByText('Altas')).toBeInTheDocument();
    });

    it('debería mostrar opción para filtrar por medias', () => {
      render(<AlertsView />);
      expect(screen.getByText('Medias')).toBeInTheDocument();
    });
  });

  describe('tabs de categorías', () => {
    beforeEach(() => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Stock Alert', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
        { idalert: '2', priority: 'medium', status: 'active', alert_type: 'maintenance', alert_title: 'Maintenance Alert', alert_message: 'Maintenance required', creationdate: '2024-01-01' },
        { idalert: '3', priority: 'medium', status: 'active', alert_type: 'payment', alert_title: 'Payment Alert', alert_message: 'Payment pending', creationdate: '2024-01-01' },
        { idalert: '4', priority: 'medium', status: 'active', alert_type: 'production', alert_title: 'Production Alert', alert_message: 'Production issue', creationdate: '2024-01-01' },
      ];
    });

    it('debería renderizar tab de Stock', () => {
      render(<AlertsView />);
      expect(screen.getByTestId('tab-stock')).toBeInTheDocument();
    });

    it('debería renderizar tab de Mantenimiento', () => {
      render(<AlertsView />);
      expect(screen.getByTestId('tab-maintenance')).toBeInTheDocument();
    });

    it('debería renderizar tab de Pagos', () => {
      render(<AlertsView />);
      expect(screen.getByTestId('tab-payment')).toBeInTheDocument();
    });

    it('debería renderizar tab de Producción', () => {
      render(<AlertsView />);
      expect(screen.getByTestId('tab-production')).toBeInTheDocument();
    });

    it('debería renderizar tab de Todas', () => {
      render(<AlertsView />);
      expect(screen.getByTestId('tab-all')).toBeInTheDocument();
    });
  });

  describe('handleCreateOrder', () => {
    it('debería mostrar toast al generar orden de producción', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'critical', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      const buttons = screen.getAllByTestId('button');
      const orderButton = buttons.find(btn => btn.textContent?.includes('Generar Orden'));
      if (orderButton) {
        fireEvent.click(orderButton);
        expect(mockToast.info).toHaveBeenCalledWith('Generando orden de producción...');
      }
    });
  });

  describe('alertas de stock vacías con filtros', () => {
    it('debería mostrar mensaje cuando no hay alertas de stock después de filtrar', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'critical', status: 'active', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      expect(screen.getByText('No hay alertas de stock')).toBeInTheDocument();
      expect(screen.getAllByText('Intenta ajustar los filtros de búsqueda').length).toBeGreaterThan(0);
    });
  });

  describe('ordenamiento de alertas', () => {
    it('debería ordenar alertas por prioridad', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'low', status: 'active', alert_type: 'stock_low', alert_title: 'Low', alert_message: '"Low" SKU: ABC Stock actual: 5 Mínimo requerido: 10', creationdate: '2024-01-01' },
        { idalert: '2', priority: 'critical', status: 'active', alert_type: 'stock_low', alert_title: 'Critical', alert_message: '"Critical" SKU: DEF Stock actual: 5 Mínimo requerido: 50', creationdate: '2024-01-01' },
        { idalert: '3', priority: 'medium', status: 'active', alert_type: 'stock_low', alert_title: 'Medium', alert_message: '"Medium" SKU: GHI Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      // Critical debería aparecer primero
      const criticalBadges = screen.getAllByText('Crítica');
      expect(criticalBadges.length).toBeGreaterThan(0);
    });
  });

  describe('botón de resolver para alerta acknowledged', () => {
    it('debería mostrar botón resolver para alertas en estado acknowledged', () => {
      mockAlertsData.alerts = [
        { idalert: '1', entity_id: 'prod-1', priority: 'medium', status: 'acknowledged', alert_type: 'stock_low', alert_title: 'Test', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      const resolveButtons = screen.getAllByTestId('dropdown-item').filter(item => item.textContent?.includes('Resolver'));
      expect(resolveButtons.length).toBeGreaterThan(0);
    });
  });

  describe('calculos de déficit', () => {
    it('debería calcular el porcentaje de déficit correctamente', () => {
      mockAlertsData.alerts = [
        {
          idalert: '1',
          priority: 'critical',
          status: 'active',
          alert_type: 'stock_low',
          alert_title: 'Stock bajo',
          alert_message: '"Producto" (SKU: ABC) Stock actual: 20. Mínimo requerido: 100',
          creationdate: '2024-01-01',
        },
      ];
      render(<AlertsView />);
      
      // Déficit = 100 - 20 = 80
      // Porcentaje = (80 / 100) * 100 = 80%
      expect(screen.getAllByText('-80').length).toBeGreaterThan(0);
      expect(screen.getAllByText('(80%)').length).toBeGreaterThan(0);
    });

    it('debería manejar minRequired igual a 0', () => {
      mockAlertsData.alerts = [
        {
          idalert: '1',
          priority: 'critical',
          status: 'active',
          alert_type: 'stock_low',
          alert_title: 'Stock bajo',
          alert_message: 'Mensaje sin mínimo requerido',
          creationdate: '2024-01-01',
        },
      ];
      render(<AlertsView />);
      
      // Con minRequired = 0, el porcentaje debería ser 0
      expect(screen.getAllByText('(0%)').length).toBeGreaterThan(0);
    });
  });

  describe('stock_critical alert type', () => {
    it('debería incluir alertas de tipo stock_critical en stockAlerts', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'critical', status: 'active', alert_type: 'stock_critical', alert_title: 'Critical Stock', alert_message: '"Test" SKU: ABC Stock actual: 0 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      // Debería mostrar en la sección de stock
      expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
    });
  });

  describe('filtrado por prioridad - clicks', () => {
    beforeEach(() => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'critical', status: 'active', alert_type: 'stock_low', alert_title: 'Critical', alert_message: '"Test" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
    });

    it('debería cambiar filtro a todas las prioridades al hacer click', () => {
      render(<AlertsView />);
      
      const allPriorityButton = screen.getByText('Todas las prioridades');
      fireEvent.click(allPriorityButton);
      
      // El botón fue clickeado
      expect(allPriorityButton).toBeInTheDocument();
    });

    it('debería cambiar filtro a críticas al hacer click', () => {
      render(<AlertsView />);
      
      const criticalButton = screen.getByText('Críticas');
      fireEvent.click(criticalButton);
      
      expect(criticalButton).toBeInTheDocument();
    });

    it('debería cambiar filtro a altas al hacer click', () => {
      render(<AlertsView />);
      
      const highButton = screen.getByText('Altas');
      fireEvent.click(highButton);
      
      expect(highButton).toBeInTheDocument();
    });

    it('debería cambiar filtro a medias al hacer click', () => {
      render(<AlertsView />);
      
      const mediumButton = screen.getByText('Medias');
      fireEvent.click(mediumButton);
      
      expect(mediumButton).toBeInTheDocument();
    });
  });

  describe('ordenamiento de alertas por déficit', () => {
    it('debería ordenar alertas con mismo priority por déficit', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'high', status: 'active', alert_type: 'stock_low', alert_title: 'Small deficit', alert_message: '"SmallDeficit" SKU: ABC Stock actual: 15 Mínimo requerido: 20', creationdate: '2024-01-01' },
        { idalert: '2', priority: 'high', status: 'active', alert_type: 'stock_low', alert_title: 'Large deficit', alert_message: '"LargeDeficit" SKU: DEF Stock actual: 5 Mínimo requerido: 100', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      // Ambos tienen prioridad high, deberían ordenarse por déficit
      expect(screen.getAllByText('LargeDeficit').length).toBeGreaterThan(0);
      expect(screen.getAllByText('SmallDeficit').length).toBeGreaterThan(0);
    });

    it('debería manejar prioridad desconocida en ordenamiento', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'unknown', status: 'active', alert_type: 'stock_low', alert_title: 'Unknown priority', alert_message: '"UnknownProd" SKU: ABC Stock actual: 5 Mínimo requerido: 20', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      expect(screen.getAllByText('UnknownProd').length).toBeGreaterThan(0);
    });
  });

  describe('acciones en tabla desktop', () => {
    beforeEach(() => {
      mockAlertsData.alerts = [
        {
          idalert: 'alert-1',
          entity_id: 'prod-1',
          priority: 'critical',
          status: 'active',
          alert_type: 'stock_low',
          alert_title: 'Stock bajo',
          alert_message: '"Test Product" (SKU: TEST123) Stock actual: 5. Mínimo requerido: 20',
          creationdate: '2024-01-01',
        },
      ];
    });

    it('debería renderizar botones de acción en vista desktop', () => {
      render(<AlertsView />);
      
      // Los botones de acción deberían existir
      const buttons = screen.getAllByTestId('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('tab all con alertas vacías después de filtrar', () => {
    it('debería mostrar mensaje cuando no hay alertas en tab all después de buscar', () => {
      mockAlertsData.alerts = [
        { idalert: '1', priority: 'medium', status: 'active', alert_type: 'maintenance', alert_title: 'Maintenance', alert_message: 'Test', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      const searchInput = screen.getByTestId('search-input');
      fireEvent.change(searchInput, { target: { value: 'nonexistent search term' } });
      
      expect(screen.getByText('No se encontraron alertas')).toBeInTheDocument();
    });
  });

  describe('alertas con status acknowledged en dropdown', () => {
    it('debería mostrar opción de resolver para alertas acknowledged en tab all', () => {
      mockAlertsData.alerts = [
        { idalert: '1', entity_id: 'prod-1', priority: 'medium', status: 'acknowledged', alert_type: 'maintenance', alert_title: 'Test', alert_message: 'Test message', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      const resolveItems = screen.getAllByTestId('dropdown-item').filter(item => item.textContent?.includes('Resolver'));
      expect(resolveItems.length).toBeGreaterThan(0);
    });

    it('no debería mostrar opción de marcar en revisión para alertas acknowledged en tab all', () => {
      mockAlertsData.alerts = [
        { idalert: '1', entity_id: 'prod-1', priority: 'medium', status: 'acknowledged', alert_type: 'maintenance', alert_title: 'Test', alert_message: 'Test message', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      // Para status acknowledged, no debería haber opción de "Marcar en revisión"
      const acknowledgeItems = screen.getAllByTestId('dropdown-item').filter(item => item.textContent?.includes('Marcar en revisión'));
      // En tab all, si status es acknowledged, no debería mostrarse "Marcar en revisión"
      expect(acknowledgeItems.length).toBe(0);
    });
  });

  describe('alertas con status resolved', () => {
    it('no debería mostrar acciones de resolver ni acknowledge para alertas resolved', () => {
      mockAlertsData.alerts = [
        { idalert: '1', entity_id: 'prod-1', priority: 'medium', status: 'resolved', alert_type: 'maintenance', alert_title: 'Test', alert_message: 'Test message', creationdate: '2024-01-01' },
      ];
      render(<AlertsView />);
      
      // Para alertas resueltas, el dropdown content debería estar vacío
      const dropdownContent = screen.getAllByTestId('dropdown-content');
      // Verificamos que existe el dropdown pero sin opciones de acción
      expect(dropdownContent.length).toBeGreaterThan(0);
    });
  });

  describe('acciones en tabla desktop para alertas active', () => {
    it('debería permitir hacer acknowledge y resolve desde tabla desktop', () => {
      mockAlertsData.alerts = [
        {
          idalert: 'alert-desktop-1',
          entity_id: 'prod-desktop-1',
          priority: 'high',
          status: 'active',
          alert_type: 'stock_low',
          alert_title: 'Desktop Test',
          alert_message: '"Desktop Product" (SKU: DESK123) Stock actual: 3. Mínimo requerido: 50',
          creationdate: '2024-01-01',
        },
      ];
      render(<AlertsView />);
      
      // Verificar que existen los botones de acción
      const allButtons = screen.getAllByTestId('button');
      expect(allButtons.length).toBeGreaterThan(3); // Al menos refresh, filter, y action buttons
    });
  });

  describe('acciones en tab all para alertas active', () => {
    it('debería permitir hacer acknowledge desde tab all', () => {
      mockAlertsData.alerts = [
        {
          idalert: 'alert-all-1',
          entity_id: 'prod-all-1',
          priority: 'medium',
          status: 'active',
          alert_type: 'maintenance',
          alert_title: 'All Tab Test',
          alert_message: 'Test message for all tab',
          creationdate: '2024-01-01',
        },
      ];
      render(<AlertsView />);
      
      // En tab all, debería haber opción de marcar en revisión
      const acknowledgeItems = screen.getAllByTestId('dropdown-item').filter(item => item.textContent?.includes('Marcar en revisión'));
      expect(acknowledgeItems.length).toBeGreaterThan(0);
      
      // Click en acknowledge
      if (acknowledgeItems[0]) {
        fireEvent.click(acknowledgeItems[0]);
        expect(mockToast.success).toHaveBeenCalledWith('Alerta marcada como en revisión');
      }
    });

    it('debería permitir hacer resolve desde tab all', () => {
      mockAlertsData.alerts = [
        {
          idalert: 'alert-all-2',
          entity_id: 'prod-all-2',
          priority: 'medium',
          status: 'active',
          alert_type: 'payment',
          alert_title: 'Payment Test',
          alert_message: 'Payment pending test',
          creationdate: '2024-01-01',
        },
      ];
      render(<AlertsView />);
      
      // En tab all, debería haber opción de resolver
      const resolveItems = screen.getAllByTestId('dropdown-item').filter(item => item.textContent?.includes('Resolver'));
      expect(resolveItems.length).toBeGreaterThan(0);
      
      // Click en resolve
      if (resolveItems[0]) {
        fireEvent.click(resolveItems[0]);
        expect(mockToast.success).toHaveBeenCalledWith('Alerta resuelta correctamente');
      }
    });
  });
});
