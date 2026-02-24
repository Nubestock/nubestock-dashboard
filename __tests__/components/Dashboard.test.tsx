import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Dashboard from '../../src/app/components/Dashboard';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => 'hace 5 minutos'),
}));

jest.mock('date-fns/locale', () => ({
  es: {},
}));

// Mock useDashboardStats
const mockRefetch = jest.fn();
let mockIsLoading = false;
let mockError: string | null = null;
let mockStats: any = null;

jest.mock('../../src/app/hooks/useDashboardStats', () => ({
  useDashboardStats: () => ({
    get stats() { return mockStats; },
    get isLoading() { return mockIsLoading; },
    get error() { return mockError; },
    refetch: mockRefetch,
  }),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Package: () => <span data-testid="icon-package">Package</span>,
  Users: () => <span data-testid="icon-users">Users</span>,
  TrendingUp: () => <span data-testid="icon-trending-up">TrendingUp</span>,
  AlertTriangle: () => <span data-testid="icon-alert">AlertTriangle</span>,
  ShoppingCart: () => <span data-testid="icon-shopping-cart">ShoppingCart</span>,
  ClipboardList: () => <span data-testid="icon-clipboard">ClipboardList</span>,
  DollarSign: () => <span data-testid="icon-dollar">DollarSign</span>,
  Archive: () => <span data-testid="icon-archive">Archive</span>,
  RefreshCw: () => <span data-testid="icon-refresh">RefreshCw</span>,
  LayoutDashboard: () => <span data-testid="icon-dashboard">LayoutDashboard</span>,
  ArrowUpCircle: () => <span data-testid="icon-arrow-up">ArrowUpCircle</span>,
  ArrowDownCircle: () => <span data-testid="icon-arrow-down">ArrowDownCircle</span>,
  PackagePlus: () => <span data-testid="icon-package-plus">PackagePlus</span>,
  PackageMinus: () => <span data-testid="icon-package-minus">PackageMinus</span>,
}));

// Mock UI components
jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
}));

jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }: any) => (
    <button onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
}));

// Sample stats data
const sampleStats = {
  data: {
    sales: {
      thisMonth: { value: 15000.50, count: 45 },
      paidValue: 12000.25,
      pendingValue: 2500.25,
      byStatus: {
        paid: 35,
        pending: 8,
        overdue: 2,
        cancelled: 0,
      },
      byWeek: [
        { week_label: 'Semana 1', value: 3500, count: 12 },
        { week_label: 'Semana 2', value: 4200, count: 15 },
        { week_label: 'Semana 3', value: 3800, count: 10 },
        { week_label: 'Semana 4', value: 3500, count: 8 },
      ],
    },
    clients: {
      active: 150,
      total: 200,
    },
    products: {
      active: 85,
      total: 100,
      lowStock: 5,
      totalInventoryValue: 50000.00,
    },
    categories: {
      active: 12,
    },
    production: {
      thisMonth: 250,
      thisYear: 2800,
    },
    transactions: {
      recent: [
        {
          id: 1,
          type: 'SAL',
          direction: '-',
          product_name: 'Producto A',
          user_name: 'Usuario 1',
          quantity: 10.5,
          has_waste: false,
          creation_date: '2024-01-15T10:30:00Z',
        },
        {
          id: 2,
          type: 'IN',
          direction: '+',
          product_name: 'Producto B',
          user_name: 'Usuario 2',
          quantity: 25.0,
          has_waste: true,
          creation_date: '2024-01-15T09:00:00Z',
        },
        {
          id: 3,
          type: 'OUT',
          direction: '-',
          product_name: 'Producto C',
          user_name: 'Usuario 3',
          quantity: 5.0,
          has_waste: false,
          creation_date: '2024-01-15T08:00:00Z',
        },
        {
          id: 4,
          type: 'PROD',
          direction: '+',
          product_name: 'Producto D',
          user_name: 'Usuario 4',
          quantity: 100.0,
          has_waste: false,
          creation_date: '2024-01-14T16:00:00Z',
        },
        {
          id: 5,
          type: 'AJU',
          direction: '+',
          product_name: 'Producto E',
          user_name: 'Usuario 5',
          quantity: 2.0,
          has_waste: false,
          creation_date: '2024-01-14T14:00:00Z',
        },
      ],
    },
  },
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsLoading = false;
    mockError = null;
    mockStats = null;
  });

  describe('Loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      mockIsLoading = true;
      
      render(<Dashboard />);
      
      expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
    });
  });

  describe('No stats state', () => {
    it('should show error message when stats is null', () => {
      mockStats = null;
      
      render(<Dashboard />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Estadísticas no disponibles')).toBeInTheDocument();
    });

    it('should show custom error message when error is provided', () => {
      mockError = 'Custom error message';
      
      render(<Dashboard />);
      
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should show is_active error details when error contains is_active', () => {
      mockError = 'La tabla no tiene la columna is_active';
      
      render(<Dashboard />);
      
      expect(screen.getByText(/Solución para el equipo backend/)).toBeInTheDocument();
      expect(screen.getByText(/tb_ope_transaction/)).toBeInTheDocument();
    });

    it('should show endpoint not available message when error contains no está disponible', () => {
      mockError = 'El endpoint no está disponible';
      
      render(<Dashboard />);
      
      expect(screen.getByText(/GET \/stats/)).toBeInTheDocument();
    });

    it('should call refetch when Reintentar button is clicked', () => {
      mockStats = null;
      
      render(<Dashboard />);
      
      fireEvent.click(screen.getByText('Reintentar'));
      
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should call refetch when Actualizar button is clicked', () => {
      mockStats = null;
      
      render(<Dashboard />);
      
      fireEvent.click(screen.getByText('Actualizar'));
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('With stats data', () => {
    beforeEach(() => {
      mockStats = sampleStats;
    });

    it('should render dashboard header', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Resumen general del sistema Nutregam')).toBeInTheDocument();
    });

    it('should render sales KPI cards', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Ventas del Mes')).toBeInTheDocument();
      expect(screen.getByText('$15000.50')).toBeInTheDocument();
      expect(screen.getByText('45 transacciones')).toBeInTheDocument();
      
      expect(screen.getByText('Ventas Cobradas')).toBeInTheDocument();
      expect(screen.getByText('$12000.25')).toBeInTheDocument();
      
      expect(screen.getByText('Por Cobrar')).toBeInTheDocument();
      expect(screen.getByText('$2500.25')).toBeInTheDocument();
    });

    it('should render clients KPI card', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Clientes Activos')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('200 total')).toBeInTheDocument();
    });

    it('should render products KPI cards', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Productos Activos')).toBeInTheDocument();
      expect(screen.getByText('85')).toBeInTheDocument();
      expect(screen.getByText('12 categorías')).toBeInTheDocument();
      
      expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      
      expect(screen.getByText('Valor Inventario')).toBeInTheDocument();
      expect(screen.getByText('$50000.00')).toBeInTheDocument();
    });

    it('should render production KPI card', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Producción del Mes')).toBeInTheDocument();
      expect(screen.getByText('250')).toBeInTheDocument();
      expect(screen.getByText('2800 este año')).toBeInTheDocument();
    });

    it('should render alerts section when there are low stock or overdue items', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Alertas Activas')).toBeInTheDocument();
      expect(screen.getByText('5 productos con stock bajo')).toBeInTheDocument();
      expect(screen.getByText('2 facturas vencidas')).toBeInTheDocument();
    });

    it('should render charts', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Producción Semanal')).toBeInTheDocument();
      expect(screen.getByText('Ventas del Mes por Semana')).toBeInTheDocument();
      expect(screen.getByText('Ventas por Estado')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should render recent activity', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('Actividad Reciente')).toBeInTheDocument();
      expect(screen.getByText(/Venta - Producto A/)).toBeInTheDocument();
      expect(screen.getByText(/Ingreso - Producto B/)).toBeInTheDocument();
      expect(screen.getByText(/Salida - Producto C/)).toBeInTheDocument();
      expect(screen.getByText(/Producción - Producto D/)).toBeInTheDocument();
    });

    it('should show waste indicator for transactions with waste', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/Con desperdicio/)).toBeInTheDocument();
    });

    it('should call refetch when Actualizar button is clicked', () => {
      render(<Dashboard />);
      
      const buttons = screen.getAllByText(/Actualizar/);
      fireEvent.click(buttons[0]);
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Without weekly sales data', () => {
    beforeEach(() => {
      mockStats = {
        ...sampleStats,
        data: {
          ...sampleStats.data,
          sales: {
            ...sampleStats.data.sales,
            byWeek: [],
          },
        },
      };
    });

    it('should show no data message for weekly sales chart', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('No hay datos de ventas este mes')).toBeInTheDocument();
    });
  });

  describe('Without recent transactions', () => {
    beforeEach(() => {
      mockStats = {
        ...sampleStats,
        data: {
          ...sampleStats.data,
          transactions: {
            recent: [],
          },
        },
      };
    });

    it('should show no activity message', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('No hay actividad reciente')).toBeInTheDocument();
    });
  });

  describe('Without alerts', () => {
    beforeEach(() => {
      mockStats = {
        ...sampleStats,
        data: {
          ...sampleStats.data,
          products: {
            ...sampleStats.data.products,
            lowStock: 0,
          },
          sales: {
            ...sampleStats.data.sales,
            byStatus: {
              ...sampleStats.data.sales.byStatus,
              overdue: 0,
            },
          },
        },
      };
    });

    it('should not render alerts section when there are no alerts', () => {
      render(<Dashboard />);
      
      expect(screen.queryByText('Alertas Activas')).not.toBeInTheDocument();
    });
  });

  describe('Transaction icons and labels', () => {
    beforeEach(() => {
      mockStats = {
        ...sampleStats,
        data: {
          ...sampleStats.data,
          transactions: {
            recent: [
              { id: 1, type: 'SAL', direction: '-', product_name: 'P1', user_name: 'U1', quantity: 1, has_waste: false, creation_date: '2024-01-15T10:00:00Z' },
              { id: 2, type: 'OUT', direction: '-', product_name: 'P2', user_name: 'U2', quantity: 2, has_waste: false, creation_date: '2024-01-15T09:00:00Z' },
              { id: 3, type: 'IN', direction: '+', product_name: 'P3', user_name: 'U3', quantity: 3, has_waste: false, creation_date: '2024-01-15T08:00:00Z' },
              { id: 4, type: 'PROD', direction: '+', product_name: 'P4', user_name: 'U4', quantity: 4, has_waste: false, creation_date: '2024-01-15T07:00:00Z' },
              { id: 5, type: 'DEV', direction: '+', product_name: 'P5', user_name: 'U5', quantity: 5, has_waste: false, creation_date: '2024-01-15T06:00:00Z' },
              { id: 6, type: 'UNKNOWN', direction: '', product_name: 'P6', user_name: 'U6', quantity: 6, has_waste: false, creation_date: '2024-01-15T05:00:00Z' },
            ],
          },
        },
      };
    });

    it('should render correct labels for different transaction types', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/Venta - P1/)).toBeInTheDocument();
      expect(screen.getByText(/Salida - P2/)).toBeInTheDocument();
      expect(screen.getByText(/Ingreso - P3/)).toBeInTheDocument();
      expect(screen.getByText(/Producción - P4/)).toBeInTheDocument();
      expect(screen.getByText(/Devolución - P5/)).toBeInTheDocument();
      expect(screen.getByText(/UNKNOWN - P6/)).toBeInTheDocument();
    });
  });

  describe('Empty sales by week', () => {
    beforeEach(() => {
      mockStats = {
        ...sampleStats,
        data: {
          ...sampleStats.data,
          sales: {
            ...sampleStats.data.sales,
            byWeek: [],
          },
        },
      };
    });

    it('should show empty state when no weekly sales', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('No hay datos de ventas este mes')).toBeInTheDocument();
    });
  });

  describe('Empty sales by week null', () => {
    beforeEach(() => {
      mockStats = {
        ...sampleStats,
        data: {
          ...sampleStats.data,
          sales: {
            ...sampleStats.data.sales,
            byWeek: null,
          },
        },
      };
    });

    it('should show empty state when byWeek is null', () => {
      render(<Dashboard />);
      
      expect(screen.getByText('No hay datos de ventas este mes')).toBeInTheDocument();
    });
  });

  describe('Transaction icon for AJU type', () => {
    beforeEach(() => {
      mockStats = {
        ...sampleStats,
        data: {
          ...sampleStats.data,
          transactions: {
            recent: [
              { id: 7, type: 'AJU', direction: '', product_name: 'P7', user_name: 'U7', quantity: 7, has_waste: false, creation_date: '2024-01-15T04:00:00Z' },
            ],
          },
        },
      };
    });

    it('should render Ajuste label', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/Ajuste - P7/)).toBeInTheDocument();
    });
  });

  describe('Transaction icon for PROD type without + direction', () => {
    beforeEach(() => {
      mockStats = {
        ...sampleStats,
        data: {
          ...sampleStats.data,
          transactions: {
            recent: [
              { id: 8, type: 'PROD', direction: '', product_name: 'P8', user_name: 'U8', quantity: 8, has_waste: false, creation_date: '2024-01-15T03:00:00Z' },
            ],
          },
        },
      };
    });

    it('should render PROD type correctly', () => {
      render(<Dashboard />);
      
      expect(screen.getByText(/Producción - P8/)).toBeInTheDocument();
    });
  });
});
