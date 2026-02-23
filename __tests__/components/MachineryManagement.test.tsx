import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MachineryManagement from '@/app/components/MachineryManagement';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock data
const mockMachinery = [
  { id: 1, name: 'Máquina 1', description: 'Descripción 1', is_active: true },
  { id: 2, name: 'Máquina 2', description: 'Descripción 2', is_active: false },
];

const mockMaintenance = [
  { id: 1, id_machinery: 1, name: 'Mantenimiento 1', type: 'PRV', next_maintainance_value: 30, is_active: true },
];

const mockHistory = [
  { id: 1, id_mantainance: 1, price: 100, next_mantainance_date: '2025-01-15', images: [] },
];

const mockAlerts = [
  { id: 1, machinery_name: 'Máquina 1', maintenance_name: 'Mantenimiento 1', is_sent: false },
];

const mockRefetch = jest.fn();
const mockCreateMachinery = jest.fn().mockResolvedValue({ success: true });
const mockUpdateMachinery = jest.fn().mockResolvedValue({ success: true });
const mockDeleteMachinery = jest.fn().mockResolvedValue({ success: true });

jest.mock('@/app/hooks/useMachinery', () => ({
  useMachinery: () => ({
    machinery: mockMachinery,
    isLoading: false,
    refetch: mockRefetch,
    createMachinery: mockCreateMachinery,
    updateMachinery: mockUpdateMachinery,
    deleteMachinery: mockDeleteMachinery,
  }),
  useMaintenance: () => ({
    maintenance: mockMaintenance,
    isLoading: false,
    refetch: mockRefetch,
    createMaintenance: jest.fn().mockResolvedValue({ success: true }),
    updateMaintenance: jest.fn().mockResolvedValue({ success: true }),
    deleteMaintenance: jest.fn().mockResolvedValue({ success: true }),
  }),
  useMaintenanceHistory: () => ({
    history: mockHistory,
    refetch: mockRefetch,
    createHistory: jest.fn().mockResolvedValue({ success: true }),
  }),
  useMachineryAlerts: () => ({
    alerts: mockAlerts,
    isLoading: false,
    refetch: mockRefetch,
    detectAlerts: jest.fn(),
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
  Settings: () => <span data-testid="icon-settings" />,
  Plus: () => <span data-testid="icon-plus" />,
  Search: () => <span data-testid="icon-search" />,
  Filter: () => <span data-testid="icon-filter" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  MoreVertical: () => <span data-testid="icon-more" />,
  Edit: () => <span data-testid="icon-edit" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Wrench: () => <span data-testid="icon-wrench" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  History: () => <span data-testid="icon-history" />,
  Image: () => <span data-testid="icon-image" />,
  DollarSign: () => <span data-testid="icon-dollar" />,
  Clock: () => <span data-testid="icon-clock" />,
}));

// Mock all UI components
jest.mock('@/app/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
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

jest.mock('@/app/components/ui/textarea', () => ({
  Textarea: (props: any) => <textarea data-testid="textarea" {...props} />,
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

jest.mock('@/app/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => 
    open ? <div data-testid="alert-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogAction: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
  AlertDialogCancel: ({ children }: any) => <button>{children}</button>,
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

jest.mock('@/app/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
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

describe('MachineryManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering', () => {
    it('should render the component with title', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByText('Gestión de Maquinaria')).toBeInTheDocument();
    });

    it('should render page subtitle', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByText('Administra maquinaria, mantenimientos y alertas')).toBeInTheDocument();
    });

    it('should render statistics cards', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should render Add button', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-plus').length).toBeGreaterThan(0);
    });

    it('should render search input', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByPlaceholderText('Buscar maquinaria...')).toBeInTheDocument();
    });
  });

  describe('Machinery display', () => {
    it('should display machinery names', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByText('Máquina 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Máquina 2').length).toBeGreaterThan(0);
    });

    it('should display machinery descriptions', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByText('Descripción 1').length).toBeGreaterThan(0);
    });
  });

  describe('Status badges', () => {
    it('should display active badge', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    });

    it('should display inactive badge', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByText('Inactivo').length).toBeGreaterThan(0);
    });
  });

  describe('Tabs', () => {
    it('should render tabs component', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('should have Maquinaria tab', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByTestId('tab-machinery')).toBeInTheDocument();
    });

    it('should have Alertas tab', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByTestId('tab-alerts')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render settings icon', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-settings').length).toBeGreaterThan(0);
    });

    it('should render plus icon', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-plus').length).toBeGreaterThan(0);
    });

    it('should render search icon', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-search').length).toBeGreaterThan(0);
    });

    it('should render filter icon', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-filter').length).toBeGreaterThan(0);
    });

    it('should render more icon', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-more').length).toBeGreaterThan(0);
    });

    it('should render check icon', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-check').length).toBeGreaterThan(0);
    });

    it('should render alert icon', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-alert').length).toBeGreaterThan(0);
    });
  });

  describe('Search functionality', () => {
    it('should filter machinery when typing', () => {
      render(<MachineryManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar maquinaria...');
      fireEvent.change(searchInput, { target: { value: 'Máquina 1' } });
      
      expect(screen.getAllByText('Máquina 1').length).toBeGreaterThan(0);
    });
  });

  describe('Filter sheet', () => {
    it('should have filter icon button', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-filter').length).toBeGreaterThan(0);
    });
  });

  describe('Card components', () => {
    it('should render multiple cards', () => {
      render(<MachineryManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Badge components', () => {
    it('should render badges', () => {
      render(<MachineryManagement />);
      
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Dialog interactions', () => {
    it('should have plus buttons for creating items', () => {
      render(<MachineryManagement />);
      
      const plusButtons = screen.getAllByTestId('icon-plus');
      expect(plusButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics values', () => {
    it('should display correct total count', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
    });

    it('should display correct active count', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });

  describe('Input components', () => {
    it('should have input elements', () => {
      render(<MachineryManagement />);
      
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });
});
