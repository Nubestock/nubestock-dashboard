import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LocationsManagement from '@/app/components/LocationsManagement';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
  },
}));

// Mock useLocations hook
const mockFetchCountries = jest.fn().mockResolvedValue([]);
const mockCreateCountry = jest.fn().mockResolvedValue({});
const mockUpdateCountry = jest.fn().mockResolvedValue({});
const mockDeleteCountry = jest.fn().mockResolvedValue({});
const mockFetchProvinces = jest.fn().mockResolvedValue([]);
const mockCreateProvince = jest.fn().mockResolvedValue({});
const mockUpdateProvince = jest.fn().mockResolvedValue({});
const mockDeleteProvince = jest.fn().mockResolvedValue({});
const mockFetchCities = jest.fn().mockResolvedValue([]);
const mockCreateCity = jest.fn().mockResolvedValue({});
const mockUpdateCity = jest.fn().mockResolvedValue({});
const mockDeleteCity = jest.fn().mockResolvedValue({});

const mockCountries = [
  { id: 1, name: 'Ecuador', is_code: 'EC', is_active: true },
  { id: 2, name: 'Colombia', is_code: 'CO', is_active: true },
];

const mockProvinces = [
  { id: 1, name: 'Pichincha', is_code: 'PIC', id_country: 1, country_name: 'Ecuador', is_active: true },
  { id: 2, name: 'Guayas', is_code: 'GUA', id_country: 1, country_name: 'Ecuador', is_active: false },
];

const mockCities = [
  { id: 1, name: 'Quito', is_code: 'UIO', id_province: 1, province_name: 'Pichincha', country_name: 'Ecuador', is_active: true },
  { id: 2, name: 'Guayaquil', is_code: 'GYE', id_province: 2, province_name: 'Guayas', country_name: 'Ecuador', is_active: true },
];

jest.mock('@/app/hooks/useLocations', () => ({
  useLocations: () => ({
    countries: mockCountries,
    provinces: mockProvinces,
    cities: mockCities,
    loading: false,
    error: null,
    fetchCountries: mockFetchCountries,
    createCountry: mockCreateCountry,
    updateCountry: mockUpdateCountry,
    deleteCountry: mockDeleteCountry,
    fetchProvinces: mockFetchProvinces,
    createProvince: mockCreateProvince,
    updateProvince: mockUpdateProvince,
    deleteProvince: mockDeleteProvince,
    fetchCities: mockFetchCities,
    createCity: mockCreateCity,
    updateCity: mockUpdateCity,
    deleteCity: mockDeleteCity,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Plus: () => <span data-testid="icon-plus" />,
  Edit: () => <span data-testid="icon-edit" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Search: () => <span data-testid="icon-search" />,
  Globe: () => <span data-testid="icon-globe" />,
  MapPin: () => <span data-testid="icon-mappin" />,
  Building2: () => <span data-testid="icon-building" />,
  ChevronRight: () => <span data-testid="icon-chevron" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
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

jest.mock('@/app/components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: { children: React.ReactNode; onValueChange?: (val: string) => void; value?: string }) => (
    <div data-testid="select">
      <select 
        data-testid="select-trigger" 
        value={value} 
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        <option value="">Select...</option>
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

jest.mock('@/app/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

describe('LocationsManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering', () => {
    it('should render the component with title', () => {
      render(<LocationsManagement />);
      
      expect(screen.getByText('Gestión de Ubicaciones')).toBeInTheDocument();
      expect(screen.getByText('Administra países, provincias y ciudades del sistema')).toBeInTheDocument();
    });

    it('should render tab buttons', () => {
      render(<LocationsManagement />);
      
      expect(screen.getByText('Países')).toBeInTheDocument();
      expect(screen.getByText('Provincias')).toBeInTheDocument();
      expect(screen.getByText('Ciudades')).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<LocationsManagement />);
      
      expect(screen.getByPlaceholderText('Buscar...')).toBeInTheDocument();
    });

    it('should render add button with correct text for countries tab', () => {
      render(<LocationsManagement />);
      
      expect(screen.getByText('Nuevo País')).toBeInTheDocument();
    });

    it('should fetch data on mount', () => {
      render(<LocationsManagement />);
      
      expect(mockFetchCountries).toHaveBeenCalled();
      expect(mockFetchProvinces).toHaveBeenCalled();
      expect(mockFetchCities).toHaveBeenCalled();
    });
  });

  describe('Countries tab', () => {
    it('should display countries in table', () => {
      render(<LocationsManagement />);
      
      expect(screen.getByText('Ecuador')).toBeInTheDocument();
      expect(screen.getByText('Colombia')).toBeInTheDocument();
    });

    it('should display country codes', () => {
      render(<LocationsManagement />);
      
      expect(screen.getByText('EC')).toBeInTheDocument();
      expect(screen.getByText('CO')).toBeInTheDocument();
    });

    it('should display country count in header', () => {
      render(<LocationsManagement />);
      
      expect(screen.getByText(/Países \(2\)/)).toBeInTheDocument();
    });

    it('should filter countries by search term', () => {
      render(<LocationsManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'Ecuador' } });
      
      expect(screen.getByText('Ecuador')).toBeInTheDocument();
      expect(screen.queryByText('Colombia')).not.toBeInTheDocument();
    });

    it('should filter countries by code', () => {
      render(<LocationsManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'CO' } });
      
      expect(screen.getByText('Colombia')).toBeInTheDocument();
      expect(screen.queryByText('Ecuador')).not.toBeInTheDocument();
    });
  });

  describe('Provinces tab', () => {
    it('should switch to provinces tab', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Provincias'));
      
      expect(screen.getByText('Nueva Provincia')).toBeInTheDocument();
      expect(screen.getByText(/Provincias \(2\)/)).toBeInTheDocument();
    });

    it('should display provinces in table', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Provincias'));
      
      expect(screen.getByText('Pichincha')).toBeInTheDocument();
      expect(screen.getByText('Guayas')).toBeInTheDocument();
    });

    it('should filter provinces by search term', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Provincias'));
      
      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'Pichincha' } });
      
      expect(screen.getByText('Pichincha')).toBeInTheDocument();
      expect(screen.queryByText('Guayas')).not.toBeInTheDocument();
    });
  });

  describe('Cities tab', () => {
    it('should switch to cities tab', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Ciudades'));
      
      expect(screen.getByText('Nueva Ciudad')).toBeInTheDocument();
      expect(screen.getByText(/Ciudades \(2\)/)).toBeInTheDocument();
    });

    it('should display cities in table', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Ciudades'));
      
      expect(screen.getByText('Quito')).toBeInTheDocument();
      expect(screen.getByText('Guayaquil')).toBeInTheDocument();
    });

    it('should filter cities by search term', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Ciudades'));
      
      const searchInput = screen.getByPlaceholderText('Buscar...');
      fireEvent.change(searchInput, { target: { value: 'Quito' } });
      
      expect(screen.getByText('Quito')).toBeInTheDocument();
      expect(screen.queryByText('Guayaquil')).not.toBeInTheDocument();
    });
  });

  describe('Create dialog', () => {
    it('should open create dialog for country', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Nuevo País'));
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Crear País')).toBeInTheDocument();
      expect(screen.getByText('Nombre del País *')).toBeInTheDocument();
      expect(screen.getByText('Código del País *')).toBeInTheDocument();
    });

    it('should open create dialog for province', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Provincias'));
      fireEvent.click(screen.getByText('Nueva Provincia'));
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Crear Provincia')).toBeInTheDocument();
      expect(screen.getByText('Nombre de la Provincia *')).toBeInTheDocument();
      expect(screen.getByText('País *')).toBeInTheDocument();
    });

    it('should open create dialog for city', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Ciudades'));
      fireEvent.click(screen.getByText('Nueva Ciudad'));
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Crear Ciudad')).toBeInTheDocument();
      expect(screen.getByText('Nombre de la Ciudad *')).toBeInTheDocument();
      expect(screen.getByText('Provincia *')).toBeInTheDocument();
    });

    it('should show validation error when creating country without name', async () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Nuevo País'));
      fireEvent.click(screen.getByText('Crear'));
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Por favor completa todos los campos requeridos');
      });
    });

    it('should create country successfully', async () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Nuevo País'));
      
      const inputs = screen.getAllByTestId('input');
      // First input is the search, next ones are form inputs
      const nameInput = inputs.find(input => input.getAttribute('id') === 'name');
      const codeInput = inputs.find(input => input.getAttribute('id') === 'is_code');
      
      if (nameInput && codeInput) {
        fireEvent.change(nameInput, { target: { value: 'Peru' } });
        fireEvent.change(codeInput, { target: { value: 'PE' } });
      }
      
      fireEvent.click(screen.getByText('Crear'));
      
      await waitFor(() => {
        expect(mockCreateCountry).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith('País creado correctamente');
      });
    });

    it('should create province successfully', async () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Provincias'));
      fireEvent.click(screen.getByText('Nueva Provincia'));
      
      const inputs = screen.getAllByTestId('input');
      const nameInput = inputs.find(input => input.getAttribute('id') === 'name');
      
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Azuay' } });
      }
      
      // Select country
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: '1' } });
      
      fireEvent.click(screen.getByText('Crear'));
      
      await waitFor(() => {
        expect(mockCreateProvince).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith('Provincia creada correctamente');
      });
    });

    it('should create city successfully', async () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Ciudades'));
      fireEvent.click(screen.getByText('Nueva Ciudad'));
      
      const inputs = screen.getAllByTestId('input');
      const nameInput = inputs.find(input => input.getAttribute('id') === 'name');
      
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Cuenca' } });
      }
      
      // Select province
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: '1' } });
      
      fireEvent.click(screen.getByText('Crear'));
      
      await waitFor(() => {
        expect(mockCreateCity).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith('Ciudad creada correctamente');
      });
    });

    it('should close dialog when Cancelar is clicked', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Nuevo País'));
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Cancelar'));
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Edit functionality', () => {
    it('should open edit dialog for country', () => {
      render(<LocationsManagement />);
      
      // Click the first edit button
      const editButtons = screen.getAllByTestId('icon-edit');
      fireEvent.click(editButtons[0].parentElement!);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Editar País')).toBeInTheDocument();
    });

    it('should update country successfully', async () => {
      render(<LocationsManagement />);
      
      const editButtons = screen.getAllByTestId('icon-edit');
      fireEvent.click(editButtons[0].parentElement!);
      
      fireEvent.click(screen.getByText('Guardar Cambios'));
      
      await waitFor(() => {
        expect(mockUpdateCountry).toHaveBeenCalled();
        expect(mockToastSuccess).toHaveBeenCalledWith('País actualizado correctamente');
      });
    });

    it('should open edit dialog for province', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Provincias'));
      
      const editButtons = screen.getAllByTestId('icon-edit');
      fireEvent.click(editButtons[0].parentElement!);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Editar Provincia')).toBeInTheDocument();
    });

    it('should open edit dialog for city', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Ciudades'));
      
      const editButtons = screen.getAllByTestId('icon-edit');
      fireEvent.click(editButtons[0].parentElement!);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Editar Ciudad')).toBeInTheDocument();
    });
  });

  describe('Delete functionality', () => {
    it('should open delete confirmation dialog', () => {
      render(<LocationsManagement />);
      
      const deleteButtons = screen.getAllByTestId('icon-trash');
      fireEvent.click(deleteButtons[0].parentElement!);
      
      expect(screen.getByText('Confirmar Eliminación')).toBeInTheDocument();
      expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeInTheDocument();
    });

    it('should delete country when confirmed', async () => {
      render(<LocationsManagement />);
      
      const deleteButtons = screen.getAllByTestId('icon-trash');
      fireEvent.click(deleteButtons[0].parentElement!);
      
      fireEvent.click(screen.getByText('Eliminar'));
      
      await waitFor(() => {
        expect(mockDeleteCountry).toHaveBeenCalledWith(1);
        expect(mockToastSuccess).toHaveBeenCalledWith('País eliminado correctamente');
      });
    });

    it('should close delete dialog when cancel is clicked', () => {
      render(<LocationsManagement />);
      
      const deleteButtons = screen.getAllByTestId('icon-trash');
      fireEvent.click(deleteButtons[0].parentElement!);
      
      expect(screen.getByText('Confirmar Eliminación')).toBeInTheDocument();
      
      // Click cancel in the delete dialog (there are two Cancelar buttons now)
      const cancelButtons = screen.getAllByText('Cancelar');
      fireEvent.click(cancelButtons[cancelButtons.length - 1]);
      
      expect(screen.queryByText('Confirmar Eliminación')).not.toBeInTheDocument();
    });

    it('should delete province when confirmed', async () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Provincias'));
      
      const deleteButtons = screen.getAllByTestId('icon-trash');
      fireEvent.click(deleteButtons[0].parentElement!);
      
      fireEvent.click(screen.getByText('Eliminar'));
      
      await waitFor(() => {
        expect(mockDeleteProvince).toHaveBeenCalledWith(1);
        expect(mockToastSuccess).toHaveBeenCalledWith('Provincia eliminada correctamente');
      });
    });

    it('should delete city when confirmed', async () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Ciudades'));
      
      const deleteButtons = screen.getAllByTestId('icon-trash');
      fireEvent.click(deleteButtons[0].parentElement!);
      
      fireEvent.click(screen.getByText('Eliminar'));
      
      await waitFor(() => {
        expect(mockDeleteCity).toHaveBeenCalledWith(1);
        expect(mockToastSuccess).toHaveBeenCalledWith('Ciudad eliminada correctamente');
      });
    });
  });

  describe('Error handling', () => {
    it('should show error toast when create fails', async () => {
      mockCreateCountry.mockRejectedValueOnce(new Error('Create failed'));
      
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Nuevo País'));
      
      const inputs = screen.getAllByTestId('input');
      const nameInput = inputs.find(input => input.getAttribute('id') === 'name');
      const codeInput = inputs.find(input => input.getAttribute('id') === 'is_code');
      
      if (nameInput && codeInput) {
        fireEvent.change(nameInput, { target: { value: 'Peru' } });
        fireEvent.change(codeInput, { target: { value: 'PE' } });
      }
      
      fireEvent.click(screen.getByText('Crear'));
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Create failed');
      });
    });

    it('should show error toast when delete fails', async () => {
      mockDeleteCountry.mockRejectedValueOnce(new Error('Delete failed'));
      
      render(<LocationsManagement />);
      
      const deleteButtons = screen.getAllByTestId('icon-trash');
      fireEvent.click(deleteButtons[0].parentElement!);
      
      fireEvent.click(screen.getByText('Eliminar'));
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Delete failed');
      });
    });
  });

  describe('Form inputs', () => {
    it('should convert country code to uppercase', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Nuevo País'));
      
      const inputs = screen.getAllByTestId('input');
      const codeInput = inputs.find(input => input.getAttribute('id') === 'is_code');
      
      if (codeInput) {
        fireEvent.change(codeInput, { target: { value: 'ec' } });
        // The component converts to uppercase via the onChange handler
        expect((codeInput as HTMLInputElement).value).toBe('EC');
      }
    });

    it('should toggle active checkbox for country', () => {
      render(<LocationsManagement />);
      
      fireEvent.click(screen.getByText('Nuevo País'));
      
      const checkbox = document.getElementById('is_active') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
      
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
    });
  });
});
