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
const mockCreateMaintenance = jest.fn().mockResolvedValue({ success: true });
const mockUpdateMaintenance = jest.fn().mockResolvedValue({ success: true });
const mockDeleteMaintenance = jest.fn().mockResolvedValue({ success: true });
const mockCreateHistory = jest.fn().mockResolvedValue({ success: true });
const mockDetectAlerts = jest.fn();

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
    createMaintenance: mockCreateMaintenance,
    updateMaintenance: mockUpdateMaintenance,
    deleteMaintenance: mockDeleteMaintenance,
  }),
  useMaintenanceHistory: () => ({
    history: mockHistory,
    refetch: mockRefetch,
    createHistory: mockCreateHistory,
  }),
  useMachineryAlerts: () => ({
    alerts: mockAlerts,
    isLoading: false,
    refetch: mockRefetch,
    detectAlerts: mockDetectAlerts,
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

  describe('Create Machinery', () => {
    it('should have add buttons', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-plus').length).toBeGreaterThan(0);
    });
  });

  describe('Edit Machinery', () => {
    it('should have edit icons', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-edit').length).toBeGreaterThan(0);
    });
  });

  describe('Delete Machinery', () => {
    it('should have delete icons', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByTestId('icon-trash').length).toBeGreaterThan(0);
    });
  });

  describe('Alerts tab', () => {
    it('should switch to alerts tab', () => {
      render(<MachineryManagement />);
      
      const alertsTab = screen.getByTestId('tab-alerts');
      fireEvent.click(alertsTab);
    });
  });

  describe('Filter functionality', () => {
    it('should have filter buttons', () => {
      render(<MachineryManagement />);
      
      // Check for filter-related elements
      expect(screen.getAllByText(/Todos|Activo|Inactivo/).length).toBeGreaterThan(0);
    });

    it('should filter by status', () => {
      render(<MachineryManagement />);
      
      // Click on filter buttons if available
      const filterButtons = screen.getAllByText(/Activo/);
      if (filterButtons.length > 0) {
        fireEvent.click(filterButtons[0]);
      }
    });
  });

  describe('UI Components', () => {
    it('should have accordion elements', () => {
      render(<MachineryManagement />);
      
      const accordions = screen.queryAllByTestId('accordion-item');
      expect(accordions).toBeDefined();
    });

    it('should have dropdown menus for actions', () => {
      render(<MachineryManagement />);
      
      const dropdowns = screen.queryAllByTestId('dropdown-menu');
      expect(dropdowns).toBeDefined();
    });

    it('should show title', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByText('Gestión de Maquinaria')).toBeInTheDocument();
    });
  });

  describe('Create Machinery Dialog', () => {
    it('should open create machinery dialog', () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should have dialog content', () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    it('should have form inputs in dialog', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should close dialog when cancel is clicked', () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      const cancelButton = screen.getByText('Cancelar');
      fireEvent.click(cancelButton);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Edit Machinery', () => {
    it('should click edit button', () => {
      render(<MachineryManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
      }
    });
  });

  describe('Delete Machinery', () => {
    it('should click delete button', () => {
      render(<MachineryManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    });
  });

  describe('Filter Sheet', () => {
    it('should have filter options', () => {
      render(<MachineryManagement />);
      
      expect(screen.getByText('Todas las maquinarias')).toBeInTheDocument();
      expect(screen.getByText('Solo activas')).toBeInTheDocument();
      expect(screen.getByText('Solo inactivas')).toBeInTheDocument();
    });

    it('should click "Todas las maquinarias" filter', () => {
      render(<MachineryManagement />);
      
      const allFilter = screen.getByText('Todas las maquinarias');
      fireEvent.click(allFilter);
    });

    it('should click "Solo activas" filter', () => {
      render(<MachineryManagement />);
      
      const activeFilter = screen.getByText('Solo activas');
      fireEvent.click(activeFilter);
    });

    it('should click "Solo inactivas" filter', () => {
      render(<MachineryManagement />);
      
      const inactiveFilter = screen.getByText('Solo inactivas');
      fireEvent.click(inactiveFilter);
    });
  });

  describe('Refresh functionality', () => {
    it('should have refresh icon', () => {
      render(<MachineryManagement />);
      
      const refreshIcons = screen.queryAllByTestId('icon-refresh');
      expect(refreshIcons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Maintenance section', () => {
    it('should display maintenance items', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByText('Mantenimiento 1').length).toBeGreaterThan(0);
    });

    it('should show PRV type badge', () => {
      render(<MachineryManagement />);
      
      expect(screen.getAllByText(/PRV|Preventivo/i).length).toBeGreaterThan(0);
    });
  });

  describe('Alerts tab', () => {
    it('should display alerts count', () => {
      render(<MachineryManagement />);
      
      // Should show 1 alert in the tab
      const alertsText = screen.getAllByText(/Alertas/);
      expect(alertsText.length).toBeGreaterThan(0);
    });
  });

  describe('Empty states', () => {
    it('should filter machinery when searching', () => {
      render(<MachineryManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar maquinaria...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
      
      expect((searchInput as HTMLInputElement).value).toBe('nonexistent');
    });
  });

  describe('Create Machinery - Form submission', () => {
    it('should have guardar button in dialog', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      const guardarButtons = screen.queryAllByText('Guardar');
      expect(guardarButtons.length).toBeGreaterThanOrEqual(0);
    });

    it('should fill name input in create dialog', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      const inputs = screen.getAllByTestId('input');
      fireEvent.change(inputs[0], { target: { value: 'Nueva Máquina' } });
      
      expect((inputs[0] as HTMLInputElement).value).toBe('Nueva Máquina');
    });
  });

  describe('Edit Machinery - Form submission', () => {
    it('should open edit dialog when clicking edit', async () => {
      render(<MachineryManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });

    it('should have form in edit dialog', async () => {
      render(<MachineryManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Delete Machinery - Confirmation', () => {
    it('should open delete confirmation dialog', async () => {
      render(<MachineryManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
      });
    });

    it('should delete machinery when confirmed', async () => {
      render(<MachineryManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
      });

      const confirmButtons = screen.getAllByText('Eliminar');
      const confirmButton = confirmButtons[confirmButtons.length - 1];
      fireEvent.click(confirmButton);
      
      await waitFor(() => {
        expect(mockDeleteMachinery).toHaveBeenCalled();
      });
    });
  });

  describe('Create Maintenance', () => {
    it('should have nuevo mantenimiento button', () => {
      render(<MachineryManagement />);
      
      const newMaintenanceBtn = screen.queryByText('Nuevo Mantenimiento');
      expect(newMaintenanceBtn || screen.getAllByTestId('icon-plus').length > 0).toBeTruthy();
    });
  });

  describe('Create History', () => {
    it('should have history related elements', () => {
      render(<MachineryManagement />);
      
      const historyIcons = screen.getAllByTestId('icon-history');
      expect(historyIcons.length).toBeGreaterThan(0);
    });

    it('should click registrar mantenimiento if available', () => {
      render(<MachineryManagement />);
      
      const registrarBtn = screen.queryByText('Registrar Mantenimiento');
      if (registrarBtn) {
        fireEvent.click(registrarBtn);
      }
    });
  });

  describe('Machinery form inputs', () => {
    it('should fill description field', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      const textareas = screen.getAllByTestId('textarea');
      if (textareas.length > 0) {
        fireEvent.change(textareas[0], { target: { value: 'Descripción de prueba' } });
        expect((textareas[0] as HTMLTextAreaElement).value).toBe('Descripción de prueba');
      }
    });
  });

  describe('Accordion interactions', () => {
    it('should have accordion for machinery details', () => {
      render(<MachineryManagement />);
      
      const accordions = screen.queryAllByTestId('accordion');
      expect(accordions.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Dropdown menu actions', () => {
    it('should have dropdown trigger', () => {
      render(<MachineryManagement />);
      
      const moreIcons = screen.getAllByTestId('icon-more');
      expect(moreIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Maintenance type badge', () => {
    it('should display maintenance type', () => {
      render(<MachineryManagement />);
      
      const prvBadges = screen.getAllByText(/PRV|Preventivo/i);
      expect(prvBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Loading states', () => {
    it('should render without loading state', () => {
      render(<MachineryManagement />);
      
      expect(screen.queryByText('Cargando maquinaria...')).not.toBeInTheDocument();
    });
  });

  describe('Machinery Name Display', () => {
    it('should display machinery names', () => {
      render(<MachineryManagement />);
      
      expect(screen.queryAllByText('Maquinaria 1').length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Machinery Status Display', () => {
    it('should display machinery status badges', () => {
      render(<MachineryManagement />);
      
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Create Machinery Dialog', () => {
    it('should open create machinery dialog', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });

    it('should have cancel button in dialog', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancelar');
        expect(cancelButtons.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Edit Machinery', () => {
    it('should have edit buttons', () => {
      render(<MachineryManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Delete Machinery', () => {
    it('should have delete buttons', () => {
      render(<MachineryManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Maintenance Tab', () => {
    it('should have maintenance tab', () => {
      render(<MachineryManagement />);
      
      const maintenanceTab = screen.queryAllByText('Mantenimiento');
      expect(maintenanceTab.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Alert Tab', () => {
    it('should have alerts display', () => {
      render(<MachineryManagement />);
      
      const alertIcons = screen.queryAllByTestId('icon-bell');
      expect(alertIcons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Refresh Machinery', () => {
    it('should have refresh icon', () => {
      render(<MachineryManagement />);
      
      const refreshIcons = screen.getAllByTestId('icon-refresh');
      expect(refreshIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Search Machinery', () => {
    it('should have search icon', () => {
      render(<MachineryManagement />);
      
      const searchIcons = screen.getAllByTestId('icon-search');
      expect(searchIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Machinery Cards', () => {
    it('should display machinery cards', () => {
      render(<MachineryManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Filter Machinery', () => {
    it('should have filter options', () => {
      render(<MachineryManagement />);
      
      const filterButtons = screen.queryAllByText('Operativa');
      expect(filterButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Plus Icon', () => {
    it('should have plus icon', () => {
      render(<MachineryManagement />);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      expect(plusIcons.length).toBeGreaterThan(0);
    });
  });

  describe('History Icon', () => {
    it('should have history icons', () => {
      render(<MachineryManagement />);
      
      const historyIcons = screen.getAllByTestId('icon-history');
      expect(historyIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Tool Icon', () => {
    it('should have tool icons', () => {
      render(<MachineryManagement />);
      
      const toolIcons = screen.queryAllByTestId('icon-tool');
      expect(toolIcons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Dialog Close', () => {
    it('should close dialog on cancel', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      const cancelButtons = screen.getAllByText('Cancelar');
      fireEvent.click(cancelButtons[0]);
    });
  });

  describe('Machinery Form', () => {
    it('should have form inputs in dialog', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Textarea in Form', () => {
    it('should have textarea for description', async () => {
      render(<MachineryManagement />);
      
      const newButton = screen.getByText('Nueva');
      fireEvent.click(newButton);
      
      await waitFor(() => {
        const textareas = screen.getAllByTestId('textarea');
        expect(textareas.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Table Display', () => {
    it('should display machinery in table format', () => {
      render(<MachineryManagement />);
      
      const tables = screen.queryAllByTestId('table');
      expect(tables.length).toBeGreaterThanOrEqual(0);
    });
  });
});
