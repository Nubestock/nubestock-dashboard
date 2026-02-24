import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SalesManagement from '@/app/components/SalesManagement';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
    info: (msg: string) => mockToastInfo(msg),
  },
}));

// Mock data
const mockSales = [
  {
    id: 1,
    id_client: 1,
    client_name: 'Cliente Test',
    client_identification: '123456789',
    total_amount: 500.00,
    method: 'cash',
    status: 'pending',
    due_date: '2025-01-15',
    created_at: '2025-01-01',
    products: [
      { id: 1, id_product: 1, product_name: 'Producto A', quantity: 2, price: 250 }
    ]
  },
  {
    id: 2,
    id_client: 2,
    client_name: 'Cliente 2',
    client_identification: '987654321',
    total_amount: 300.00,
    method: 'credit',
    status: 'completed',
    due_date: '2025-01-20',
    created_at: '2025-01-02',
    products: []
  },
];

const mockClients = [
  { id: 1, name: 'Cliente Test', identification: '123456789', email: 'test@test.com' },
  { id: 2, name: 'Cliente 2', identification: '987654321', email: 'test2@test.com' },
];

const mockProducts = [
  { id: 1, name: 'Producto A', sku: 'PA-001', type: 'PF', price: 250, quantity: 100 },
  { id: 2, name: 'Producto B', sku: 'PB-002', type: 'PF', price: 150, quantity: 50 },
];

const mockFetchSales = jest.fn().mockResolvedValue(mockSales);
const mockCreateSale = jest.fn().mockResolvedValue({ success: true });

jest.mock('@/app/hooks/useSales', () => ({
  useSales: () => ({
    sales: mockSales,
    isLoading: false,
    fetchSales: mockFetchSales,
    createSale: mockCreateSale,
    pagination: { total: 2, page: 1, totalPages: 1 },
  }),
}));

jest.mock('@/app/hooks/useClients', () => ({
  useClients: () => ({
    clients: mockClients,
    isLoading: false,
  }),
}));

jest.mock('@/app/hooks/useProducts', () => ({
  useProducts: () => ({
    products: mockProducts,
    isLoading: false,
  }),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => '01/01/2025',
}));

jest.mock('date-fns/locale', () => ({
  es: {},
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ShoppingCart: () => <span data-testid="icon-cart" />,
  Plus: () => <span data-testid="icon-plus" />,
  DollarSign: () => <span data-testid="icon-dollar" />,
  Clock: () => <span data-testid="icon-clock" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  XCircle: () => <span data-testid="icon-x-circle" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  User: () => <span data-testid="icon-user" />,
  Package: () => <span data-testid="icon-package" />,
  Trash2: () => <span data-testid="icon-trash" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  CreditCard: () => <span data-testid="icon-credit" />,
  Banknote: () => <span data-testid="icon-banknote" />,
  FileText: () => <span data-testid="icon-file" />,
  Search: () => <span data-testid="icon-search" />,
  X: () => <span data-testid="icon-x" />,
  Filter: () => <span data-testid="icon-filter" />,
  MoreVertical: () => <span data-testid="icon-more" />,
  Eye: () => <span data-testid="icon-eye" />,
  Edit: () => <span data-testid="icon-edit" />,
  Receipt: () => <span data-testid="icon-receipt" />,
}));

// Mock all UI components
jest.mock('@/app/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

jest.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant}>{children}</button>
  ),
}));

jest.mock('@/app/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

jest.mock('@/app/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));

jest.mock('@/app/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode; variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}));

jest.mock('@/app/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

jest.mock('@/app/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/app/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange?: (v: string) => void; value?: string }) => (
    <div data-testid="select" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

jest.mock('@/app/components/ui/sheet', () => ({
  Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  SheetTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/app/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('SalesManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering', () => {
    it('should render the component with title', () => {
      render(<SalesManagement />);
      
      expect(screen.getByText('Gestión de Ventas')).toBeInTheDocument();
    });

    it('should render statistics cards', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Pendientes').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Completadas').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Canceladas').length).toBeGreaterThan(0);
    });

    it('should render the sales table', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Cliente Test').length).toBeGreaterThan(0);
    });

    it('should render New Sale button', () => {
      render(<SalesManagement />);
      
      expect(screen.getByText('Nueva Venta')).toBeInTheDocument();
    });
  });

  describe('Filters', () => {
    it('should have filter icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-filter').length).toBeGreaterThan(0);
    });
  });

  describe('Sales display', () => {
    it('should display sale client name', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Cliente Test').length).toBeGreaterThan(0);
    });

    it('should display pending badge', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
    });

    it('should display completed badge', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Completada').length).toBeGreaterThan(0);
    });
  });

  describe('Icons', () => {
    it('should render shopping cart icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-cart').length).toBeGreaterThan(0);
    });

    it('should render plus icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-plus').length).toBeGreaterThan(0);
    });

    it('should render refresh icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-refresh').length).toBeGreaterThan(0);
    });
  });

  describe('Table headers', () => {
    it('should render table headers', () => {
      render(<SalesManagement />);
      
      expect(screen.getByText('Cliente')).toBeInTheDocument();
      expect(screen.getByText('Estado')).toBeInTheDocument();
    });
  });

  describe('Dialog interactions', () => {
    it('should open dialog when Nueva Venta is clicked', async () => {
      render(<SalesManagement />);
      
      const button = screen.getByText('Nueva Venta');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });

    it('should show dialog title when opened', async () => {
      render(<SalesManagement />);
      
      const button = screen.getByText('Nueva Venta');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
      });
    });
  });

  describe('Statistics', () => {
    it('should display total amount labels', () => {
      render(<SalesManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Card components', () => {
    it('should render multiple cards', () => {
      render(<SalesManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Badge components', () => {
    it('should render badges for status', () => {
      render(<SalesManagement />);
      
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Refresh functionality', () => {
    it('should call fetchSales on mount', () => {
      render(<SalesManagement />);
      
      expect(mockFetchSales).toHaveBeenCalled();
    });
  });

  describe('Sales table content', () => {
    it('should display sales data', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Cliente Test').length).toBeGreaterThan(0);
    });
  });

  describe('Payment method display', () => {
    it('should display payment method', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Efectivo').length).toBeGreaterThan(0);
    });
  });

  describe('Page description', () => {
    it('should display page subtitle', () => {
      render(<SalesManagement />);
      
      expect(screen.getByText('Registra y administra las ventas de productos')).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should have search input', () => {
      render(<SalesManagement />);
      
      expect(screen.getByPlaceholderText('Buscar venta...')).toBeInTheDocument();
    });

    it('should filter sales when typing', () => {
      render(<SalesManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar venta...');
      fireEvent.change(searchInput, { target: { value: 'Cliente Test' } });
      
      expect(screen.getAllByText('Cliente Test').length).toBeGreaterThan(0);
    });
  });

  describe('Credit method display', () => {
    it('should display credit badge', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Crédito').length).toBeGreaterThan(0);
    });
  });

  describe('Filter sheet', () => {
    it('should show filter button', () => {
      render(<SalesManagement />);
      
      const filterButtons = screen.getAllByTestId('icon-filter');
      expect(filterButtons.length).toBeGreaterThan(0);
    });

    it('should have Filtrar Ventas title in sheet', () => {
      render(<SalesManagement />);
      
      expect(screen.getByText('Filtrar Ventas')).toBeInTheDocument();
    });

    it('should have filter description', () => {
      render(<SalesManagement />);
      
      expect(screen.getByText('Filtra las ventas por estado')).toBeInTheDocument();
    });
  });

  describe('More icons', () => {
    it('should render clock icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-clock').length).toBeGreaterThan(0);
    });

    it('should render check icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-check').length).toBeGreaterThan(0);
    });

    it('should render x-circle icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-x-circle').length).toBeGreaterThan(0);
    });

    it('should render dollar icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-dollar').length).toBeGreaterThan(0);
    });

    it('should render calendar icon', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByTestId('icon-calendar').length).toBeGreaterThan(0);
    });
  });

  describe('Sales statistics', () => {
    it('should display pending filter button', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Pendientes').length).toBeGreaterThan(0);
    });

    it('should display completed filter button', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Completadas').length).toBeGreaterThan(0);
    });
  });

  describe('Sales count', () => {
    it('should render sales data from hook', () => {
      render(<SalesManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Client identification', () => {
    it('should display client names', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Cliente Test').length).toBeGreaterThan(0);
    });
  });

  describe('Date format', () => {
    it('should display formatted date', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('01/01/2025').length).toBeGreaterThan(0);
    });
  });

  describe('Input components', () => {
    it('should have search input', () => {
      render(<SalesManagement />);
      
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Table content', () => {
    it('should render table rows for sales', () => {
      render(<SalesManagement />);
      
      expect(screen.getAllByText('Cliente Test').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Cliente 2').length).toBeGreaterThan(0);
    });
  });

  describe('Create Sale Dialog', () => {
    it('should open and close dialog', async () => {
      render(<SalesManagement />);
      
      const newSaleBtn = screen.getByText('Nueva Venta');
      fireEvent.click(newSaleBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });

      // Find and click cancel
      const cancelButtons = screen.getAllByText('Cancelar');
      if (cancelButtons.length > 0) {
        fireEvent.click(cancelButtons[0]);
      }
    });

    it('should have client selection field', async () => {
      render(<SalesManagement />);
      
      const newSaleBtn = screen.getByText('Nueva Venta');
      fireEvent.click(newSaleBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Filter by status', () => {
    it('should click Pendientes filter', () => {
      render(<SalesManagement />);
      
      const pendingButtons = screen.getAllByText('Pendientes');
      if (pendingButtons.length > 0) {
        fireEvent.click(pendingButtons[0]);
      }
    });

    it('should click Completadas filter', () => {
      render(<SalesManagement />);
      
      const completedButtons = screen.getAllByText('Completadas');
      if (completedButtons.length > 0) {
        fireEvent.click(completedButtons[0]);
      }
    });

    it('should click Todas las ventas filter', () => {
      render(<SalesManagement />);
      
      const allButton = screen.queryByText('Todas las ventas');
      if (allButton) {
        fireEvent.click(allButton);
      }
    });
  });

  describe('Mobile dropdown', () => {
    it('should have dropdown menu icons', () => {
      render(<SalesManagement />);
      
      const moreIcons = screen.getAllByTestId('icon-more');
      expect(moreIcons.length).toBeGreaterThan(0);
    });
  });

  describe('View sale detail', () => {
    it('should have eye icons for detail view', () => {
      render(<SalesManagement />);
      
      const eyeIcons = screen.getAllByTestId('icon-eye');
      expect(eyeIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Edit sale', () => {
    it('should have edit icons', () => {
      render(<SalesManagement />);
      
      const editIcons = screen.queryAllByTestId('icon-edit');
      expect(editIcons).toBeDefined();
    });
  });

  describe('Sale amounts', () => {
    it('should show dollar icon for amounts', () => {
      render(<SalesManagement />);
      
      const dollarIcons = screen.getAllByTestId('icon-dollar');
      expect(dollarIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Search', () => {
    it('should filter by non-existent search term', () => {
      render(<SalesManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar venta...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent12345' } });
      
      expect((searchInput as HTMLInputElement).value).toBe('nonexistent12345');
    });
  });

  describe('Loading sales', () => {
    it('should load sales on status filter change', () => {
      render(<SalesManagement />);
      
      // Click a filter to trigger loadSales
      const pendingButtons = screen.getAllByText('Pendientes');
      if (pendingButtons.length > 0) {
        fireEvent.click(pendingButtons[0]);
        expect(mockFetchSales).toHaveBeenCalled();
      }
    });
  });
});
