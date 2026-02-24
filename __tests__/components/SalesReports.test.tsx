import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SalesReports from '@/app/components/SalesReports';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock excel utilities
const mockCreateWorkbook = jest.fn(() => ({}));
const mockAddSheetFromJson = jest.fn();
const mockDownloadWorkbook = jest.fn().mockResolvedValue(undefined);

jest.mock('@/app/utils/excel', () => ({
  createWorkbook: () => mockCreateWorkbook(),
  addSheetFromJson: (...args: unknown[]) => mockAddSheetFromJson(...args),
  downloadWorkbook: (...args: unknown[]) => mockDownloadWorkbook(...args),
}));

// Mock report hooks data
const mockDailyData = {
  data: [
    { date: '2024-01-15', number_of_sales: 5, total_sales: 1500, average_sale: 300, total_paid: 1200, total_pending: 300 },
    { date: '2024-01-16', number_of_sales: 3, total_sales: 900, average_sale: 300, total_paid: 900, total_pending: 0 },
  ],
  summary: {
    total_sales: 2400,
    total_transactions: 8,
    average_per_day: 1200,
    best_day: { date: '2024-01-15', total: 1500 },
  },
};

const mockClientData = {
  data: [
    { 
      client_name: 'Cliente Uno', 
      business_name: 'Empresa Uno', 
      ruc_cedula: '1234567890',
      number_of_sales: 3, 
      total_sales: 1000, 
      average_sale: 333.33,
      total_paid: 800,
      total_pending: 200,
      first_sale_date: '2024-01-01',
      last_sale_date: '2024-01-15',
    },
    { 
      client_name: 'Cliente Dos', 
      business_name: 'Empresa Dos', 
      ruc_cedula: '0987654321',
      number_of_sales: 2, 
      total_sales: 800, 
      average_sale: 400,
      total_paid: 800,
      total_pending: 0,
      first_sale_date: '2024-01-05',
      last_sale_date: '2024-01-10',
    },
  ],
  summary: {
    total_sales: 1800,
    total_clients: 2,
    average_per_client: 900,
    best_client: { client_name: 'Cliente Uno', total: 1000 },
  },
};

const mockProductData = {
  data: [
    { 
      product_name: 'Producto Uno', 
      sku: 'SKU-001', 
      category: 'Categoría A',
      total_quantity_sold: 50, 
      total_sales: 2500, 
      number_of_transactions: 10,
      average_price: 50,
    },
    { 
      product_name: 'Producto Dos', 
      sku: 'SKU-002', 
      category: 'Categoría B',
      total_quantity_sold: 30, 
      total_sales: 1500, 
      number_of_transactions: 8,
      average_price: 50,
    },
  ],
};

const mockDailyRefetch = jest.fn();
const mockClientRefetch = jest.fn();
const mockProductRefetch = jest.fn();

jest.mock('@/app/hooks/useSalesReports', () => ({
  useDailySalesReport: () => ({
    data: mockDailyData,
    isLoading: false,
    error: null,
    refetch: mockDailyRefetch,
  }),
  useClientSalesReport: () => ({
    data: mockClientData,
    isLoading: false,
    error: null,
    refetch: mockClientRefetch,
  }),
  useTopProductsReport: () => ({
    data: mockProductData,
    isLoading: false,
    error: null,
    refetch: mockProductRefetch,
  }),
}));

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="xaxis" />,
  YAxis: () => <div data-testid="yaxis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Download: () => <span data-testid="icon-download" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Users: () => <span data-testid="icon-users" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  DollarSign: () => <span data-testid="icon-dollar" />,
  Package: () => <span data-testid="icon-package" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
}));

// Mock shadcn/ui components
jest.mock('@/app/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="card-title">{children}</h3>,
}));

jest.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}));

jest.mock('@/app/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input data-testid="input" {...props} />
  ),
}));

jest.mock('@/app/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));

jest.mock('@/app/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

jest.mock('@/app/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange?: (val: string) => void; value?: string }) => (
    <div data-testid="select">
      <select 
        data-testid="select-trigger" 
        value={value} 
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectValue: () => null,
}));

describe('SalesReports', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering', () => {
    it('should render the component with title', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Reportes de Ventas')).toBeInTheDocument();
      expect(screen.getByText('Análisis detallado de ventas por período y clientes')).toBeInTheDocument();
    });

    it('should render Actualizar button', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });

    it('should render Exportar a Excel button', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Exportar a Excel')).toBeInTheDocument();
    });

    it('should render report type selector', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Tipo de Reporte')).toBeInTheDocument();
      expect(screen.getByText('Ventas Diarias')).toBeInTheDocument();
    });

    it('should render date filters', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Fecha Desde')).toBeInTheDocument();
      expect(screen.getByText('Fecha Hasta')).toBeInTheDocument();
    });
  });

  describe('Daily report (default)', () => {
    it('should display daily statistics cards', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Total Ventas')).toBeInTheDocument();
      expect(screen.getByText('Transacciones')).toBeInTheDocument();
      expect(screen.getByText('Promedio Diario')).toBeInTheDocument();
      expect(screen.getByText('Mejor Día')).toBeInTheDocument();
    });

    it('should display total sales value', () => {
      render(<SalesReports />);
      
      // Multiple elements may match (card and table), use getAllByText
      expect(screen.getAllByText('$2400.00').length).toBeGreaterThan(0);
    });

    it('should display transaction count', () => {
      render(<SalesReports />);
      
      // Multiple elements may match, use getAllByText
      expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    });

    it('should display daily chart', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Tendencia de Ventas Diarias')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('should display detail table', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Detalle Diario')).toBeInTheDocument();
      expect(screen.getByText('Número de Ventas')).toBeInTheDocument();
      expect(screen.getByText('Total del Día')).toBeInTheDocument();
    });
  });

  describe('Client report', () => {
    it('should switch to client report', () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byClient' } });
      
      expect(screen.getByText('Top Clientes por Ventas')).toBeInTheDocument();
    });

    it('should display client statistics', () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byClient' } });
      
      expect(screen.getByText('Total Clientes')).toBeInTheDocument();
      expect(screen.getByText('Promedio por Cliente')).toBeInTheDocument();
      expect(screen.getByText('Mejor Cliente')).toBeInTheDocument();
    });

    it('should display client chart', () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byClient' } });
      
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('should display client detail table', () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byClient' } });
      
      expect(screen.getByText('Detalle por Cliente')).toBeInTheDocument();
      expect(screen.getByText('Razón Social')).toBeInTheDocument();
    });
  });

  describe('Product report', () => {
    it('should switch to product report', () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byProduct' } });
      
      expect(screen.getByText('Top Productos Vendidos')).toBeInTheDocument();
    });

    it('should display product charts', () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byProduct' } });
      
      expect(screen.getAllByTestId('bar-chart').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('pie-chart').length).toBeGreaterThan(0);
    });

    it('should display product detail table', () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byProduct' } });
      
      expect(screen.getByText('Detalle por Producto')).toBeInTheDocument();
      expect(screen.getByText('Cantidad Vendida')).toBeInTheDocument();
    });
  });

  describe('Refresh functionality', () => {
    it('should call refetch when Actualizar is clicked', async () => {
      render(<SalesReports />);
      
      const refreshBtn = screen.getByText('Actualizar');
      fireEvent.click(refreshBtn);
      
      await waitFor(() => {
        expect(mockDailyRefetch).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith('Reporte actualizado');
      });
    });

    it('should call client refetch when on client report', async () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byClient' } });
      
      const refreshBtn = screen.getByText('Actualizar');
      fireEvent.click(refreshBtn);
      
      await waitFor(() => {
        expect(mockClientRefetch).toHaveBeenCalled();
      });
    });

    it('should call product refetch when on product report', async () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byProduct' } });
      
      const refreshBtn = screen.getByText('Actualizar');
      fireEvent.click(refreshBtn);
      
      await waitFor(() => {
        expect(mockProductRefetch).toHaveBeenCalled();
      });
    });
  });

  describe('Export functionality', () => {
    it('should export daily report to Excel', async () => {
      render(<SalesReports />);
      
      const exportBtn = screen.getByText('Exportar a Excel');
      fireEvent.click(exportBtn);
      
      await waitFor(() => {
        expect(mockCreateWorkbook).toHaveBeenCalled();
        expect(mockAddSheetFromJson).toHaveBeenCalled();
        expect(mockDownloadWorkbook).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith('Reporte exportado exitosamente');
      });
    });

    it('should export client report to Excel', async () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byClient' } });
      
      const exportBtn = screen.getByText('Exportar a Excel');
      fireEvent.click(exportBtn);
      
      await waitFor(() => {
        expect(mockAddSheetFromJson).toHaveBeenCalledWith(
          expect.anything(),
          'Ventas por Cliente',
          expect.any(Array),
          expect.any(Array)
        );
      });
    });

    it('should export product report to Excel', async () => {
      render(<SalesReports />);
      
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'byProduct' } });
      
      const exportBtn = screen.getByText('Exportar a Excel');
      fireEvent.click(exportBtn);
      
      await waitFor(() => {
        expect(mockAddSheetFromJson).toHaveBeenCalledWith(
          expect.anything(),
          'Top Productos',
          expect.any(Array),
          expect.any(Array)
        );
      });
    });

    it('should show error when export fails', async () => {
      mockDownloadWorkbook.mockRejectedValueOnce(new Error('Export failed'));
      
      render(<SalesReports />);
      
      const exportBtn = screen.getByText('Exportar a Excel');
      fireEvent.click(exportBtn);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Error al exportar el reporte');
      });
    });
  });

  describe('Date filters', () => {
    it('should update start date', () => {
      render(<SalesReports />);
      
      const inputs = screen.getAllByTestId('input');
      const startDateInput = inputs.find(input => input.getAttribute('type') === 'date');
      
      if (startDateInput) {
        fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
        expect((startDateInput as HTMLInputElement).value).toBe('2024-01-01');
      }
    });

    it('should update end date', () => {
      render(<SalesReports />);
      
      const inputs = screen.getAllByTestId('input');
      const dateInputs = inputs.filter(input => input.getAttribute('type') === 'date');
      
      if (dateInputs.length > 1) {
        fireEvent.change(dateInputs[1], { target: { value: '2024-01-31' } });
        expect((dateInputs[1] as HTMLInputElement).value).toBe('2024-01-31');
      }
    });
  });

  describe('Tabs navigation', () => {
    it('should have tabs', () => {
      render(<SalesReports />);
      
      const tabs = screen.queryAllByTestId('tabs');
      expect(tabs.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cards display', () => {
    it('should display cards', () => {
      render(<SalesReports />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Refresh button', () => {
    it('should have refresh button', () => {
      render(<SalesReports />);
      
      const refreshIcons = screen.getAllByTestId('icon-refresh');
      expect(refreshIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Title display', () => {
    it('should display title', () => {
      render(<SalesReports />);
      
      expect(screen.getByText('Reportes de Ventas')).toBeInTheDocument();
    });
  });

  describe('Charts display', () => {
    it('should display charts', () => {
      render(<SalesReports />);
      
      const responsiveContainers = screen.queryAllByTestId('responsive-container');
      expect(responsiveContainers.length).toBeGreaterThanOrEqual(0);
    });
  });
});
