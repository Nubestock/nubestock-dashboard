import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProductionManagement from '@/app/components/ProductionManagement';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    return '15/01/2024 10:30';
  },
  startOfDay: (date: Date) => date,
  endOfDay: (date: Date) => date,
}));

jest.mock('date-fns/locale', () => ({
  es: {},
}));

// Mock data
const mockProductions = [
  {
    id: 1,
    product_name: 'Producto Final A',
    sku: 'PFA-001',
    user_name: 'Juan Operador',
    creation_date: '2024-01-15T10:30:00Z',
    status: 'pending',
    quantity: 0,
    production_details: {
      materials_consumed: [
        { 
          id_product: 1,
          name: 'Material A', 
          sku: 'MA-001', 
          quantity_used: 5.5, 
          waste: 0.5, 
          effective_quantity: 5.0,
          current_stock: 100,
          has_waste: true,
          details: 'data:image/png;base64,test',
        },
        { 
          id_product: 2,
          name: 'Material B', 
          sku: 'MB-001', 
          quantity_used: 3.0, 
          waste: 0, 
          effective_quantity: 3.0,
          current_stock: 50,
          has_waste: false,
          details: null,
        },
      ],
    },
  },
  {
    id: 2,
    product_name: 'Producto Final B',
    sku: 'PFB-002',
    user_name: 'Maria Operador',
    creation_date: '2024-01-15T11:00:00Z',
    status: 'pending',
    quantity: 0,
    production_details: {
      materials_consumed: [],
    },
  },
];

const mockCompletedProductions = [
  {
    id: 3,
    product_name: 'Producto Completado',
    sku: 'PC-001',
    user_name: 'Carlos Operador',
    creation_date: '2024-01-14T09:00:00Z',
    status: 'completed',
    quantity: 10,
    production_details: {
      materials_consumed: [
        { 
          id_product: 1,
          name: 'Material A', 
          sku: 'MA-001', 
          quantity_used: 12.0, 
          waste: 2.0, 
          effective_quantity: 10.0,
          current_stock: 88,
          has_waste: true,
          details: null,
        },
      ],
    },
  },
];

const mockFetchProductions = jest.fn();
const mockCompleteProduction = jest.fn();
const mockFetchGlobalSummary = jest.fn();

let currentProductions = mockProductions;

jest.mock('@/app/hooks/useProduction', () => ({
  useProduction: () => ({
    productions: currentProductions,
    isLoading: false,
    fetchProductions: mockFetchProductions,
    completeProduction: mockCompleteProduction,
    pagination: { page: 1, limit: 10, total: 2 },
    summary: { total_pending: 2, total_completed: 1 },
    globalSummary: { total_pending: 2, total_completed: 1 },
    fetchGlobalSummary: mockFetchGlobalSummary,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Factory: () => <span data-testid="icon-factory" />,
  Package: () => <span data-testid="icon-package" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  Clock: () => <span data-testid="icon-clock" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Filter: () => <span data-testid="icon-filter" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  User: () => <span data-testid="icon-user" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  ChevronDown: () => <span data-testid="icon-chevron-down" />,
  ChevronUp: () => <span data-testid="icon-chevron-up" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  BarChart3: () => <span data-testid="icon-chart" />,
  Image: () => <span data-testid="icon-image" />,
}));

// Mock shadcn/ui components
jest.mock('@/app/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3 data-testid="card-title">{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-desc">{children}</p>,
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
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

jest.mock('@/app/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
}));

jest.mock('@/app/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

jest.mock('@/app/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => 
    <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => 
    <p data-testid="dialog-description">{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('@/app/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (v: string) => void }) => (
    <div data-testid="tabs" data-value={value}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { onValueChange, currentValue: value });
        }
        return child;
      })}
    </div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange?: (v: string) => void }) => (
    <button data-testid={`tab-${value}`} onClick={() => onValueChange?.(value)}>{children}</button>
  ),
  TabsContent: ({ children, value, currentValue }: { children: React.ReactNode; value: string; currentValue?: string }) => 
    value === currentValue ? <div data-testid={`tab-content-${value}`}>{children}</div> : null,
}));

jest.mock('@/app/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <option value={value}>{children}</option>,
  SelectValue: () => null,
}));

describe('ProductionManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    currentProductions = mockProductions;
  });

  describe('Initial rendering', () => {
    it('should render the component with title', () => {
      render(<ProductionManagement />);
      
      expect(screen.getByText('Gestión de Producción')).toBeInTheDocument();
      expect(screen.getByText(/Administra y completa las producciones/)).toBeInTheDocument();
    });

    it('should render Actualizar button', () => {
      render(<ProductionManagement />);
      
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });

    it('should render statistics cards', () => {
      render(<ProductionManagement />);
      
      expect(screen.getByText('Pendientes')).toBeInTheDocument();
      expect(screen.getByText('Completadas')).toBeInTheDocument();
      expect(screen.getByText('Desperdicios')).toBeInTheDocument();
      expect(screen.getByText('Materiales Usados')).toBeInTheDocument();
    });

    it('should render filter section', () => {
      render(<ProductionManagement />);
      
      expect(screen.getByText('Filtros')).toBeInTheDocument();
      expect(screen.getByText('Fecha Inicio (Opcional)')).toBeInTheDocument();
      expect(screen.getByText('Fecha Fin (Opcional)')).toBeInTheDocument();
    });

    it('should render tabs for pending and completed', () => {
      render(<ProductionManagement />);
      
      expect(screen.getByTestId('tab-pending')).toBeInTheDocument();
      expect(screen.getByTestId('tab-completed')).toBeInTheDocument();
    });

    it('should fetch productions on mount', () => {
      render(<ProductionManagement />);
      
      expect(mockFetchProductions).toHaveBeenCalled();
    });
  });

  describe('Pending productions tab', () => {
    it('should display pending productions', () => {
      render(<ProductionManagement />);
      
      expect(screen.getByText('Producto Final A')).toBeInTheDocument();
      expect(screen.getByText('PFA-001')).toBeInTheDocument();
      expect(screen.getByText('Juan Operador · 15/01/2024 10:30')).toBeInTheDocument();
    });

    it('should display Completar button for each pending production', () => {
      render(<ProductionManagement />);
      
      expect(screen.getAllByText('Completar').length).toBe(2);
    });

    it('should display production summary info', () => {
      render(<ProductionManagement />);
      
      // Multiple productions show the same labels
      expect(screen.getAllByText('Total Consumido').length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Desperdicio/).length).toBeGreaterThan(0);
    });

    it('should display Ver Detalles button', () => {
      render(<ProductionManagement />);
      
      expect(screen.getAllByText('Ver Detalles').length).toBeGreaterThan(0);
    });
  });

  describe('Toggle row expansion', () => {
    it('should expand and show details when Ver Detalles is clicked', async () => {
      render(<ProductionManagement />);
      
      const viewDetailsButtons = screen.getAllByText('Ver Detalles');
      fireEvent.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Ocultar Detalles')).toBeInTheDocument();
      });
    });

    it('should collapse when Ocultar Detalles is clicked', async () => {
      render(<ProductionManagement />);
      
      const viewDetailsButtons = screen.getAllByText('Ver Detalles');
      fireEvent.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Ocultar Detalles')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Ocultar Detalles'));
      
      await waitFor(() => {
        expect(screen.queryByText('Ocultar Detalles')).not.toBeInTheDocument();
      });
    });
  });

  describe('Complete production dialog', () => {
    it('should open complete dialog when Completar is clicked', () => {
      render(<ProductionManagement />);
      
      const completarButtons = screen.getAllByText('Completar');
      fireEvent.click(completarButtons[0]);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByTestId('dialog-title')).toHaveTextContent('Completar Producción');
    });

    it('should display production info in dialog', () => {
      render(<ProductionManagement />);
      
      const completarButtons = screen.getAllByText('Completar');
      fireEvent.click(completarButtons[0]);
      
      // Use getAllByText since product name appears multiple times
      expect(screen.getAllByText('Producto Final A').length).toBeGreaterThan(0);
      expect(screen.getByText('Materiales Consumidos')).toBeInTheDocument();
    });

    it('should close dialog when Cancelar is clicked', () => {
      render(<ProductionManagement />);
      
      const completarButtons = screen.getAllByText('Completar');
      fireEvent.click(completarButtons[0]);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Cancelar'));
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should show error when completing without quantity', async () => {
      render(<ProductionManagement />);
      
      const completarButtons = screen.getAllByText('Completar');
      fireEvent.click(completarButtons[0]);
      
      // Click the submit button in the dialog (there are multiple "Completar" texts)
      const dialogButtons = screen.getAllByText(/Completar Producción/);
      fireEvent.click(dialogButtons[dialogButtons.length - 1]);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Ingresa una cantidad válida mayor a 0');
      });
    });

    it('should complete production with valid quantity', async () => {
      mockCompleteProduction.mockResolvedValueOnce({});
      
      render(<ProductionManagement />);
      
      const completarButtons = screen.getAllByText('Completar');
      fireEvent.click(completarButtons[0]);
      
      const quantityInput = screen.getByPlaceholderText('Ej: 10');
      fireEvent.change(quantityInput, { target: { value: '15' } });
      
      // Click the submit button in the dialog
      const dialogButtons = screen.getAllByText(/Completar Producción/);
      fireEvent.click(dialogButtons[dialogButtons.length - 1]);
      
      await waitFor(() => {
        expect(mockCompleteProduction).toHaveBeenCalledWith(1, 15);
        expect(mockToastSuccess).toHaveBeenCalledWith('Producción completada: 15 unidades generadas');
      });
    });

    it('should show error when complete fails', async () => {
      mockCompleteProduction.mockRejectedValueOnce(new Error('Error del servidor'));
      
      render(<ProductionManagement />);
      
      const completarButtons = screen.getAllByText('Completar');
      fireEvent.click(completarButtons[0]);
      
      const quantityInput = screen.getByPlaceholderText('Ej: 10');
      fireEvent.change(quantityInput, { target: { value: '15' } });
      
      // Click the submit button in the dialog
      const dialogButtons = screen.getAllByText(/Completar Producción/);
      fireEvent.click(dialogButtons[dialogButtons.length - 1]);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Error del servidor');
      });
    });
  });

  describe('Date filters', () => {
    it('should update start date filter', () => {
      render(<ProductionManagement />);
      
      const dateInputs = screen.getAllByTestId('input');
      const startDateInput = dateInputs.find(input => input.getAttribute('id') === 'startDate');
      
      if (startDateInput) {
        fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
        expect((startDateInput as HTMLInputElement).value).toBe('2024-01-01');
      }
    });

    it('should update end date filter', () => {
      render(<ProductionManagement />);
      
      const dateInputs = screen.getAllByTestId('input');
      const endDateInput = dateInputs.find(input => input.getAttribute('id') === 'endDate');
      
      if (endDateInput) {
        fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });
        expect((endDateInput as HTMLInputElement).value).toBe('2024-01-31');
      }
    });

    it('should show message when no date filters', () => {
      render(<ProductionManagement />);
      
      expect(screen.getByText(/Mostrando todas las producciones sin filtro de fecha/)).toBeInTheDocument();
    });
  });

  describe('Refresh functionality', () => {
    it('should call fetchProductions when Actualizar is clicked', async () => {
      render(<ProductionManagement />);
      
      const refreshButton = screen.getByText('Actualizar');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockFetchProductions).toHaveBeenCalled();
      });
    });
  });

  describe('Statistics calculation', () => {
    it('should display pending count', () => {
      render(<ProductionManagement />);
      
      // globalSummary has total_pending: 2, appears multiple times
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('should calculate waste from materials', () => {
      render(<ProductionManagement />);
      
      // First production has 0.5 waste, may appear multiple times
      expect(screen.getAllByText('0.50').length).toBeGreaterThan(0);
    });
  });

  describe('Ver Foto functionality', () => {
    it('should show Ver Foto button when material has details', async () => {
      render(<ProductionManagement />);
      
      // Expand the first production
      const viewDetailsButtons = screen.getAllByText('Ver Detalles');
      fireEvent.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Ver Foto')).toBeInTheDocument();
      });
    });

    it('should open image modal when Ver Foto is clicked', async () => {
      render(<ProductionManagement />);
      
      const viewDetailsButtons = screen.getAllByText('Ver Detalles');
      fireEvent.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Ver Foto')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Ver Foto'));
      
      await waitFor(() => {
        expect(screen.getByText('Evidencia Fotográfica')).toBeInTheDocument();
      });
    });
  });

  describe('Empty states', () => {
    it('should show empty state message when no pending productions', () => {
      currentProductions = [];
      
      render(<ProductionManagement />);
      
      expect(screen.getByText('No hay producciones pendientes')).toBeInTheDocument();
    });
  });
});
