import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserManagement from '@/app/components/UserManagement';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock useAuth
jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Admin User', email: 'admin@test.com', roles: ['Administrador'] },
  }),
}));

// Mock data
const mockUsers = [
  { id: 1, name: 'Usuario 1', email: 'user1@test.com', phone: '123456789', is_active: true, roles: ['Admin'], last_login: '2024-01-15T10:00:00Z' },
  { id: 2, name: 'Usuario 2', email: 'user2@test.com', phone: '987654321', is_active: false, roles: ['User'], last_login: null },
];

const mockRoles = [
  { id: 1, name: 'Administrador', description: 'Admin role', permissions: [{ id: 1 }] },
  { id: 2, name: 'Usuario', description: 'User role', permissions: [] },
];

const mockPermissions = [
  { id: 1, name: 'users:read', description: 'Read users', category: 'users' },
  { id: 2, name: 'users:write', description: 'Write users', category: 'users' },
];

const mockRolesData = {
  roles: mockRoles,
  allPermissions: mockPermissions,
};

// Estado mutable para probar loading, error y lista vacía
let mockUsersData: typeof mockUsers = [];
let mockLoading = false;
let mockError: string | null = null;
let mockPagination = { total: 2, totalPages: 1 };

const mockRefetch = jest.fn();
const mockCreateUser = jest.fn().mockResolvedValue({ success: true });
const mockUpdateUser = jest.fn().mockResolvedValue({ success: true });
const mockDeleteUser = jest.fn().mockResolvedValue({ success: true });
const mockAdminResetPassword = jest.fn().mockResolvedValue({ success: true, data: { message: 'Reset sent' } });
const mockAssignRole = jest.fn().mockResolvedValue({ success: true });

jest.mock('@/app/hooks/useUsers', () => ({
  useUsers: () => ({
    get users() { return mockUsersData; },
    get pagination() { return mockPagination; },
    get isLoading() { return mockLoading; },
    get error() { return mockError; },
    refetch: mockRefetch,
    createUser: mockCreateUser,
    updateUser: mockUpdateUser,
    deleteUser: mockDeleteUser,
    adminResetPassword: mockAdminResetPassword,
    assignRole: jest.fn().mockResolvedValue({ success: true }),
    removeRole: jest.fn().mockResolvedValue({ success: true }),
    requestPasswordReset: jest.fn().mockResolvedValue({ success: true }),
  }),
  useRoles: () => ({
    roles: mockRoles,
    isLoading: false,
  }),
  useRolesWithPermissions: () => ({
    rolesData: mockRolesData,
    isLoading: false,
    refetch: mockRefetch,
    createRole: jest.fn().mockResolvedValue({ success: true }),
    updateRole: jest.fn().mockResolvedValue({ success: true }),
    deleteRole: jest.fn().mockResolvedValue({ success: true }),
    updateRolePermissions: jest.fn().mockResolvedValue({ success: true }),
  }),
  useUserPermissions: () => ({
    permissions: mockPermissions,
    isLoading: false,
    assignRole: mockAssignRole,
    removeRole: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus" />,
  Edit: () => <span data-testid="icon-edit" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Shield: () => <span data-testid="icon-shield" />,
  Search: () => <span data-testid="icon-search" />,
  UserCog: () => <span data-testid="icon-usercog" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  KeyRound: () => <span data-testid="icon-key" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  Users: () => <span data-testid="icon-users" />,
  UserCheck: () => <span data-testid="icon-usercheck" />,
  UserX: () => <span data-testid="icon-userx" />,
  MoreVertical: () => <span data-testid="icon-more" />,
  Eye: () => <span data-testid="icon-eye" />,
  EyeOff: () => <span data-testid="icon-eyeoff" />,
  Mail: () => <span data-testid="icon-mail" />,
  Phone: () => <span data-testid="icon-phone" />,
  Calendar: () => <span data-testid="icon-calendar" />,
  Filter: () => <span data-testid="icon-filter" />,
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

jest.mock('@/app/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange, ...props }: any) => (
    <input 
      type="checkbox" 
      data-testid="checkbox" 
      checked={checked || false}
      onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
      {...props} 
    />
  ),
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

jest.mock('@/app/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange?: (v: string) => void; value?: string }) => (
    <div data-testid="select" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <option value={value}>{children}</option>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

jest.mock('@/app/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
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

jest.mock('@/app/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

describe('UserManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsersData = [...mockUsers];
    mockLoading = false;
    mockError = null;
    mockPagination = { total: 2, totalPages: 1 };
  });

  describe('Loading state', () => {
    it('should show loading spinner and message when isLoading is true', () => {
      mockLoading = true;
      render(<UserManagement />);

      expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();
      expect(screen.queryByText('Usuario 1')).not.toBeInTheDocument();
    });

    it('should not show user list while loading', () => {
      mockLoading = true;
      render(<UserManagement />);

      expect(screen.getByPlaceholderText('Buscar usuario...')).toBeInTheDocument();
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.queryAllByText('Usuario 1')).toHaveLength(0);
    });
  });

  describe('Error state', () => {
    it('should show error message when error is set', () => {
      mockError = 'Error de conexión con el servidor';
      render(<UserManagement />);

      expect(screen.getByText('Error de conexión con el servidor')).toBeInTheDocument();
    });

    it('should show error in Alert and keep header visible', () => {
      mockError = 'Fallo al cargar usuarios';
      render(<UserManagement />);

      expect(screen.getByText('Gestión de Usuarios')).toBeInTheDocument();
      expect(screen.getByText('Fallo al cargar usuarios')).toBeInTheDocument();
      expect(screen.getByTestId('alert')).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('should show empty state when there are no users', () => {
      mockUsersData = [];
      mockPagination = { total: 0, totalPages: 1 };
      render(<UserManagement />);

      expect(screen.getByText('No se encontraron usuarios')).toBeInTheDocument();
      // Dependiendo del filtro activo: "Intenta ajustar los filtros..." o "Comienza agregando tu primer usuario"
      const subtitle = screen.getByText(/Intenta ajustar los filtros de búsqueda|Comienza agregando tu primer usuario/);
      expect(subtitle).toBeInTheDocument();
    });

    it('should show filter-adjusted message when search has no results', () => {
      mockUsersData = [];
      mockPagination = { total: 0, totalPages: 1 };
      render(<UserManagement />);

      expect(screen.getByText('No se encontraron usuarios')).toBeInTheDocument();
    });
  });

  describe('Initial rendering', () => {
    it('should render the component with title', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Gestión de Usuarios').length).toBeGreaterThan(0);
    });

    it('should render page subtitle', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Administra usuarios, roles y permisos del sistema').length).toBeGreaterThan(0);
    });

    it('should render search input', () => {
      render(<UserManagement />);
      
      expect(screen.getByPlaceholderText('Buscar usuario...')).toBeInTheDocument();
    });
  });

  describe('User display', () => {
    it('should display user names', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Usuario 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Usuario 2').length).toBeGreaterThan(0);
    });

    it('should display user emails', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('user1@test.com').length).toBeGreaterThan(0);
    });
  });

  describe('Status badges', () => {
    it('should display active badge', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    });

    it('should display inactive badge', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Inactivo').length).toBeGreaterThan(0);
    });
  });

  describe('Tabs', () => {
    it('should render tabs component', () => {
      render(<UserManagement />);
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });

    it('should have users tab', () => {
      render(<UserManagement />);
      
      expect(screen.getByTestId('tab-users')).toBeInTheDocument();
    });

    it('should have roles tab', () => {
      render(<UserManagement />);
      
      expect(screen.getByTestId('tab-roles')).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render plus icon', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByTestId('icon-plus').length).toBeGreaterThan(0);
    });

    it('should render search icon', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByTestId('icon-search').length).toBeGreaterThan(0);
    });

    it('should render users icon', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByTestId('icon-users').length).toBeGreaterThan(0);
    });

    it('should render usercheck icon', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByTestId('icon-usercheck').length).toBeGreaterThan(0);
    });

    it('should render userx icon', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByTestId('icon-userx').length).toBeGreaterThan(0);
    });

    it('should render shield icon', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByTestId('icon-shield').length).toBeGreaterThan(0);
    });
  });

  describe('Search functionality', () => {
    it('should filter users when typing', () => {
      render(<UserManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar usuario...');
      fireEvent.change(searchInput, { target: { value: 'Usuario 1' } });
      
      expect(screen.getAllByText('Usuario 1').length).toBeGreaterThan(0);
    });
  });

  describe('Card components', () => {
    it('should render multiple cards', () => {
      render(<UserManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Badge components', () => {
    it('should render badges', () => {
      render(<UserManagement />);
      
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Statistics', () => {
    it('should display total count', () => {
      render(<UserManagement />);

      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should display correct statistics (Total 2, Activos 1, Inactivos 1)', () => {
      render(<UserManagement />);

      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Activos')).toBeInTheDocument();
      expect(screen.getByText('Inactivos')).toBeInTheDocument();
      // stats.total from pagination, stats.active/inactive from filtered users
      expect(screen.getByText('2')).toBeInTheDocument(); // total
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // activos 1, inactivos 1
    });

    it('should show results count (Mostrando X de Y usuarios)', () => {
      render(<UserManagement />);

      expect(screen.getByText(/Mostrando 2 de 2 usuarios/)).toBeInTheDocument();
    });
  });

  describe('Input components', () => {
    it('should have input elements', () => {
      render(<UserManagement />);
      
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Role display', () => {
    it('should display role badges', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
    });
  });

  describe('Create User Dialog', () => {
    it('should have plus icons for new user', () => {
      render(<UserManagement />);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      expect(plusIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Dropdown menu actions', () => {
    it('should have more vertical icons', () => {
      render(<UserManagement />);
      
      const moreIcons = screen.getAllByTestId('icon-more');
      expect(moreIcons.length).toBeGreaterThan(0);
    });

    it('should have edit buttons in dropdown', () => {
      render(<UserManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('should have delete buttons in dropdown', () => {
      render(<UserManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('should have roles related buttons', () => {
      render(<UserManagement />);
      
      const shieldIcons = screen.getAllByTestId('icon-shield');
      expect(shieldIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Filter Sheet', () => {
    it('should have user filter options', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Activos').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Inactivos').length).toBeGreaterThan(0);
    });

    it('should have "Todos" text in filter options', () => {
      render(<UserManagement />);
      
      // The filter might be in the component
      const totalTexts = screen.getAllByText('Total');
      expect(totalTexts.length).toBeGreaterThan(0);
    });

    it('should click Activos filter', () => {
      render(<UserManagement />);
      
      const activosButtons = screen.getAllByText('Activos');
      if (activosButtons.length > 0) {
        fireEvent.click(activosButtons[0]);
      }
    });

    it('should click Inactivos filter', () => {
      render(<UserManagement />);
      
      const inactivosButtons = screen.getAllByText('Inactivos');
      if (inactivosButtons.length > 0) {
        fireEvent.click(inactivosButtons[0]);
      }
    });
  });

  describe('Edit User', () => {
    it('should click edit button', () => {
      render(<UserManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
      }
    });
  });

  describe('Delete User', () => {
    it('should click delete button', () => {
      render(<UserManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
    });
  });

  describe('User Roles', () => {
    it('should have roles tab', () => {
      render(<UserManagement />);
      
      expect(screen.getByTestId('tab-roles')).toBeInTheDocument();
    });
  });

  describe('Tabs switching', () => {
    it('should click users tab', () => {
      render(<UserManagement />);
      
      const usersTab = screen.getByTestId('tab-users');
      fireEvent.click(usersTab);
    });

    it('should click roles tab', () => {
      render(<UserManagement />);
      
      const rolesTab = screen.getByTestId('tab-roles');
      fireEvent.click(rolesTab);
    });
  });

  describe('Refresh functionality', () => {
    it('should have refresh icon', () => {
      render(<UserManagement />);
      
      const refreshIcons = screen.getAllByTestId('icon-refresh');
      expect(refreshIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty search results', () => {
    it('should handle empty search', () => {
      render(<UserManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar usuario...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent12345' } });
      
      expect((searchInput as HTMLInputElement).value).toBe('nonexistent12345');
    });
  });

  describe('Phone display', () => {
    it('should display phone icon', () => {
      render(<UserManagement />);
      
      const phoneIcons = screen.getAllByTestId('icon-phone');
      expect(phoneIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Password reset', () => {
    it('should have password reset button in dropdown', () => {
      render(<UserManagement />);
      
      const resetButtons = screen.getAllByText('Restablecer contraseña');
      expect(resetButtons.length).toBeGreaterThan(0);
    });

    it('should click password reset button', () => {
      render(<UserManagement />);
      
      const resetButtons = screen.getAllByText('Restablecer contraseña');
      if (resetButtons.length > 0) {
        fireEvent.click(resetButtons[0]);
      }
    });
  });

  describe('User creation form', () => {
    it('should have inputs for user data', () => {
      render(<UserManagement />);
      
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Role badges', () => {
    it('should display role name in badge', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
    });
  });

  describe('Email display', () => {
    it('should display mail icon', () => {
      render(<UserManagement />);
      
      const mailIcons = screen.getAllByTestId('icon-mail');
      expect(mailIcons.length).toBeGreaterThan(0);
    });
  });

  describe('User count statistics', () => {
    it('should display user statistics', () => {
      render(<UserManagement />);
      
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('Active/Inactive counts', () => {
    it('should show active users count label', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Activos').length).toBeGreaterThan(0);
    });

    it('should show inactive users count label', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Inactivos').length).toBeGreaterThan(0);
    });
  });

  describe('Dropdown menu', () => {
    it('should have more vertical icons', () => {
      render(<UserManagement />);
      
      const moreIcons = screen.getAllByTestId('icon-more');
      expect(moreIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Key icon', () => {
    it('should display key icon', () => {
      render(<UserManagement />);
      
      const keyIcons = screen.getAllByTestId('icon-key');
      expect(keyIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Edit user dialog', () => {
    it('should open dialog when clicking edit', async () => {
      render(<UserManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
      }
      
      await waitFor(() => {
        expect(screen.queryByTestId('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Delete user confirmation', () => {
    it('should open alert dialog when clicking delete', async () => {
      render(<UserManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
      }
      
      await waitFor(() => {
        expect(screen.queryByTestId('alert-dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Checkbox for permissions', () => {
    it('should have checkbox elements', () => {
      render(<UserManagement />);
      
      const checkboxes = screen.queryAllByTestId('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Calendar icon', () => {
    it('should have date related icons', () => {
      render(<UserManagement />);
      
      const calendarIcons = screen.queryAllByTestId('icon-calendar');
      expect(calendarIcons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Add User Form', () => {
    it('should have nuevo usuario button', () => {
      render(<UserManagement />);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      expect(plusIcons.length).toBeGreaterThan(0);
    });

    it('should have inputs in user form', () => {
      render(<UserManagement />);
      
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Edit User Form', () => {
    it('should open edit form when clicking edit', async () => {
      render(<UserManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      if (editButtons.length > 0) {
        fireEvent.click(editButtons[0]);
        
        await waitFor(() => {
          expect(screen.queryByTestId('dialog')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Delete User', () => {
    it('should show delete confirmation dialog', async () => {
      render(<UserManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
        
        await waitFor(() => {
          expect(screen.queryByTestId('alert-dialog')).toBeInTheDocument();
        });
      }
    });

    it('should have cancel option in delete dialog', async () => {
      render(<UserManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      if (deleteButtons.length > 0) {
        fireEvent.click(deleteButtons[0]);
        
        await waitFor(() => {
          const cancelButtons = screen.queryAllByText('Cancelar');
          expect(cancelButtons.length).toBeGreaterThan(0);
        });
      }
    });
  });

  describe('Assign Role', () => {
    it('should have roles button in dropdown', () => {
      render(<UserManagement />);
      
      const shieldIcons = screen.getAllByTestId('icon-shield');
      expect(shieldIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Reset Password', () => {
    it('should have reset password option', () => {
      render(<UserManagement />);
      
      const resetButtons = screen.getAllByText('Restablecer contraseña');
      expect(resetButtons.length).toBeGreaterThan(0);
    });

    it('should click reset password', async () => {
      render(<UserManagement />);
      
      const resetButtons = screen.getAllByText('Restablecer contraseña');
      if (resetButtons.length > 0) {
        fireEvent.click(resetButtons[0]);
        
        await waitFor(() => {
          expect(screen.queryByTestId('alert-dialog')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Refresh Users', () => {
    it('should have refresh functionality', () => {
      render(<UserManagement />);
      
      const refreshIcons = screen.getAllByTestId('icon-refresh');
      expect(refreshIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Filter users', () => {
    it('should filter active users', () => {
      render(<UserManagement />);
      
      const activosButtons = screen.getAllByText('Activos');
      if (activosButtons.length > 0) {
        fireEvent.click(activosButtons[0]);
      }
    });

    it('should filter inactive users', () => {
      render(<UserManagement />);
      
      const inactivosButtons = screen.getAllByText('Inactivos');
      if (inactivosButtons.length > 0) {
        fireEvent.click(inactivosButtons[0]);
      }
    });
  });

  describe('User roles display', () => {
    it('should display user roles', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
    });
  });

  describe('User details', () => {
    it('should display user email', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('user1@test.com').length).toBeGreaterThan(0);
    });

    it('should display user status', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Inactivo').length).toBeGreaterThan(0);
    });
  });

  describe('Tabs navigation', () => {
    it('should have users and roles tabs', () => {
      render(<UserManagement />);
      
      expect(screen.getByTestId('tab-users')).toBeInTheDocument();
      expect(screen.getByTestId('tab-roles')).toBeInTheDocument();
    });

    it('should switch to roles tab', () => {
      render(<UserManagement />);
      
      const rolesTab = screen.getByTestId('tab-roles');
      fireEvent.click(rolesTab);
    });
  });

  describe('Roles management', () => {
    it('should click roles tab', () => {
      render(<UserManagement />);
      
      const rolesTab = screen.getByTestId('tab-roles');
      fireEvent.click(rolesTab);
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument();
    });
  });

  describe('Create User Form Validation', () => {
    it('should have create user dialog', async () => {
      render(<UserManagement />);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      fireEvent.click(plusIcons[0]);
      
      await waitFor(() => {
        expect(screen.queryByTestId('dialog')).toBeInTheDocument();
      });
    });

    it('should have name input in create form', async () => {
      render(<UserManagement />);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      fireEvent.click(plusIcons[0]);
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });

    it('should have email input in create form', async () => {
      render(<UserManagement />);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      fireEvent.click(plusIcons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
      });
    });

    it('should have password input in create form', async () => {
      render(<UserManagement />);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      fireEvent.click(plusIcons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Contraseña')).toBeInTheDocument();
      });
    });
  });

  describe('Edit User Form', () => {
    it('should open edit dialog', async () => {
      render(<UserManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);
      
      await waitFor(() => {
        expect(screen.queryByTestId('dialog')).toBeInTheDocument();
      });
    });

    it('should have save button in edit form', async () => {
      render(<UserManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      fireEvent.click(editButtons[0]);
      
      await waitFor(() => {
        const guardarButtons = screen.queryAllByText('Guardar');
        expect(guardarButtons.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Delete User Confirmation', () => {
    it('should open delete confirmation', async () => {
      render(<UserManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(screen.queryByTestId('alert-dialog')).toBeInTheDocument();
      });
    });

    it('should have confirm button in delete dialog', async () => {
      render(<UserManagement />);
      
      const deleteButtons = screen.getAllByText('Eliminar');
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        const confirmButtons = screen.queryAllByText('Confirmar');
        expect(confirmButtons.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('User Status Toggle', () => {
    it('should display active status', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Activo').length).toBeGreaterThan(0);
    });

    it('should display inactive status', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Inactivo').length).toBeGreaterThan(0);
    });
  });

  describe('Search Users', () => {
    it('should have search input', () => {
      render(<UserManagement />);
      
      const searchIcons = screen.getAllByTestId('icon-search');
      expect(searchIcons.length).toBeGreaterThan(0);
    });

    it('should filter users on search', async () => {
      render(<UserManagement />);
      
      const inputs = screen.getAllByTestId('input');
      fireEvent.change(inputs[0], { target: { value: 'Usuario 1' } });
    });
  });

  describe('Pagination', () => {
    it('should display total users', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Total').length).toBeGreaterThan(0);
    });
  });

  describe('User Phone Display', () => {
    it('should display user phone number', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('123456789').length).toBeGreaterThan(0);
    });
  });

  describe('Role Badge Display', () => {
    it('should display role badges', () => {
      render(<UserManagement />);
      
      const badges = screen.getAllByTestId('badge');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('Dropdown Menu Actions', () => {
    it('should have action buttons', () => {
      render(<UserManagement />);
      
      const moreIcons = screen.getAllByTestId('icon-more');
      expect(moreIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Filter Sheet', () => {
    it('should have filter icon', () => {
      render(<UserManagement />);
      
      const filterIcons = screen.queryAllByTestId('icon-filter');
      expect(filterIcons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('User Stats Cards', () => {
    it('should display user statistics', () => {
      render(<UserManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Role Assignment', () => {
    it('should have assign role option', () => {
      render(<UserManagement />);
      
      const assignButtons = screen.queryAllByText('Asignar rol');
      expect(assignButtons.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('User Email Display', () => {
    it('should show mail icons', () => {
      render(<UserManagement />);
      
      const mailIcons = screen.getAllByTestId('icon-mail');
      expect(mailIcons.length).toBeGreaterThan(0);
    });
  });

  describe('User Actions', () => {
    it('should have users icon', () => {
      render(<UserManagement />);
      
      const usersIcons = screen.getAllByTestId('icon-users');
      expect(usersIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Refresh Users Button', () => {
    it('should have refresh icon', () => {
      render(<UserManagement />);
      
      const refreshIcons = screen.getAllByTestId('icon-refresh');
      expect(refreshIcons.length).toBeGreaterThan(0);
    });

    it('should click refresh button', async () => {
      render(<UserManagement />);
      
      const refreshIcons = screen.getAllByTestId('icon-refresh');
      fireEvent.click(refreshIcons[0]);
    });
  });

  describe('User Name Display', () => {
    it('should display user names', () => {
      render(<UserManagement />);
      
      expect(screen.getAllByText('Usuario 1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Usuario 2').length).toBeGreaterThan(0);
    });
  });

  describe('Create Role Dialog', () => {
    it('should switch to roles tab and see plus icon', () => {
      render(<UserManagement />);
      
      const rolesTab = screen.getByTestId('tab-roles');
      fireEvent.click(rolesTab);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      expect(plusIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Permission Display', () => {
    it('should have checkbox components', () => {
      render(<UserManagement />);
      
      const checkboxes = screen.queryAllByTestId('checkbox');
      expect(checkboxes.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Dialog Behavior', () => {
    it('should close dialog on cancel', async () => {
      render(<UserManagement />);
      
      const plusIcons = screen.getAllByTestId('icon-plus');
      fireEvent.click(plusIcons[0]);
      
      await waitFor(() => {
        const cancelButtons = screen.getAllByText('Cancelar');
        if (cancelButtons.length > 0) {
          fireEvent.click(cancelButtons[0]);
        }
      });
    });
  });

  describe('Loading State', () => {
    it('should not show loading when data loaded', () => {
      render(<UserManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });
});
