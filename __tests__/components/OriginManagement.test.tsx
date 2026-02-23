import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import OriginManagement from '../../src/app/components/OriginManagement';

// Mock useOrigins hook
const mockUseOrigins = {
  origins: [] as Array<{
    id: number;
    name: string;
    id_city: number;
    id_facility: string | null;
    city_name: string | null;
    province_name: string | null;
    created_at: string;
  }>,
  loading: false,
  error: null as string | null,
  createOrigin: jest.fn(),
  updateOrigin: jest.fn(),
  deleteOrigin: jest.fn(),
};

jest.mock('../../src/app/hooks/useOrigins', () => ({
  useOrigins: () => mockUseOrigins,
}));

// Mock useClients hooks
const mockProvinces = [
  { id: 1, name: 'Pichincha' },
  { id: 2, name: 'Guayas' },
];

const mockCities = [
  { id: 1, name: 'Quito', id_province: 1 },
  { id: 2, name: 'Guayaquil', id_province: 2 },
];

jest.mock('../../src/app/hooks/useClients', () => ({
  useProvinces: () => ({ provinces: mockProvinces }),
  useCities: (provinceId?: number) => ({
    cities: provinceId ? mockCities.filter(c => c.id_province === provinceId) : mockCities,
  }),
}));

// Mock sonner toast - uses getter to avoid hoisting issues
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    get success() { return mockToastSuccess; },
    get error() { return mockToastError; },
  },
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  MapPin: () => <span data-testid="map-pin-icon">MapPin</span>,
  Plus: () => <span data-testid="plus-icon">Plus</span>,
  Pencil: () => <span data-testid="pencil-icon">Pencil</span>,
  Trash2: () => <span data-testid="trash-icon">Trash2</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,
  Building2: () => <span data-testid="building-icon">Building2</span>,
}));

// Mock UI components
jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="card-title" className={className}>{children}</h2>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => <p data-testid="card-description">{children}</p>,
}));

jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

jest.mock('../../src/app/components/ui/label', () => ({
  Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

jest.mock('../../src/app/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: { 
    children: React.ReactNode; 
    value?: string; 
    onValueChange?: (val: string) => void;
    disabled?: boolean;
  }) => (
    <div data-testid="select" data-value={value} data-disabled={disabled}>
      <select 
        onChange={(e) => onValueChange?.(e.target.value)} 
        value={value || ''} 
        disabled={disabled}
        data-testid="select-native"
      >
        <option value="">Seleccionar...</option>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) => (
    <span id={id}>{children}</span>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
}));

jest.mock('../../src/app/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <td className={className}>{children}</td>
  ),
  TableHead: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <th className={className}>{children}</th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <tr className={className}>{children}</tr>
  ),
}));

jest.mock('../../src/app/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="dialog">{children}</div> : null
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-footer">{children}</div>,
}));

jest.mock('../../src/app/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open: boolean }) => (
    open ? <div data-testid="alert-dialog">{children}</div> : null
  ),
  AlertDialogAction: ({ children, onClick, disabled, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid="alert-dialog-action" className={className}>
      {children}
    </button>
  ),
  AlertDialogCancel: ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
    <button disabled={disabled} data-testid="alert-dialog-cancel">{children}</button>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h3>{children}</h3>,
}));

jest.mock('../../src/app/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}));

describe('OriginManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseOrigins.origins = [];
    mockUseOrigins.loading = false;
    mockUseOrigins.error = null;
    mockUseOrigins.createOrigin.mockResolvedValue({});
    mockUseOrigins.updateOrigin.mockResolvedValue({});
    mockUseOrigins.deleteOrigin.mockResolvedValue({});
  });

  it('debería mostrar loading cuando está cargando', () => {
    mockUseOrigins.loading = true;
    
    render(<OriginManagement />);
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('debería mostrar error cuando hay error', () => {
    mockUseOrigins.error = 'Error de conexión';
    
    render(<OriginManagement />);
    
    expect(screen.getByText('Endpoint no disponible')).toBeInTheDocument();
    expect(screen.getByText('Error de conexión')).toBeInTheDocument();
  });

  it('debería mostrar mensaje de vacío cuando no hay orígenes', () => {
    render(<OriginManagement />);
    
    expect(screen.getByText('No hay orígenes registrados')).toBeInTheDocument();
    expect(screen.getByText('Crear Primer Origen')).toBeInTheDocument();
  });

  it('debería mostrar tabla cuando hay orígenes', () => {
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta Principal', 
        id_city: 1, 
        id_facility: 'FAC-001',
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    expect(screen.getByText('Planta Principal')).toBeInTheDocument();
    expect(screen.getByText('Quito')).toBeInTheDocument();
    expect(screen.getByText('Pichincha')).toBeInTheDocument();
    expect(screen.getByText('FAC-001')).toBeInTheDocument();
  });

  it('debería mostrar "Sin ubicación" cuando no hay ciudad ni provincia', () => {
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Origen sin ubicación', 
        id_city: 1, 
        id_facility: null,
        city_name: null,
        province_name: null,
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    expect(screen.getByText('Sin ubicación')).toBeInTheDocument();
  });

  it('debería mostrar "-" cuando no hay id_facility', () => {
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta', 
        id_city: 1, 
        id_facility: null,
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('debería abrir diálogo de crear al hacer click en Nuevo Origen', () => {
    render(<OriginManagement />);
    
    fireEvent.click(screen.getByText('Nuevo Origen'));
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Crear Nuevo Origen')).toBeInTheDocument();
  });

  it('debería abrir diálogo de crear desde botón de estado vacío', () => {
    render(<OriginManagement />);
    
    fireEvent.click(screen.getByText('Crear Primer Origen'));
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('debería abrir diálogo de editar al hacer click en el botón de editar', () => {
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta Principal', 
        id_city: 1, 
        id_facility: 'FAC-001',
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    const editButtons = screen.getAllByTestId('pencil-icon');
    fireEvent.click(editButtons[0].closest('button')!);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Editar Origen')).toBeInTheDocument();
  });

  it('debería deshabilitar botón cuando el nombre está vacío', async () => {
    render(<OriginManagement />);
    
    fireEvent.click(screen.getByText('Nuevo Origen'));
    
    const saveButton = screen.getByText('Crear');
    // El botón está deshabilitado porque falta nombre y ciudad
    expect(saveButton).toBeDisabled();
  });

  it('debería deshabilitar botón cuando la ciudad no está seleccionada', async () => {
    render(<OriginManagement />);
    
    fireEvent.click(screen.getByText('Nuevo Origen'));
    
    const nameInput = screen.getByPlaceholderText('Ej: Planta Principal, Bodega Norte');
    fireEvent.change(nameInput, { target: { value: 'Nueva Planta' } });
    
    // El botón sigue deshabilitado porque falta la ciudad
    const saveButton = screen.getByText('Crear');
    expect(saveButton).toBeDisabled();
  });

  it('debería crear origen exitosamente', async () => {
    render(<OriginManagement />);
    
    fireEvent.click(screen.getByText('Nuevo Origen'));
    
    const nameInput = screen.getByPlaceholderText('Ej: Planta Principal, Bodega Norte');
    fireEvent.change(nameInput, { target: { value: 'Nueva Planta' } });
    
    // Seleccionar provincia
    const selects = screen.getAllByTestId('select-native');
    fireEvent.change(selects[0], { target: { value: '1' } });
    
    // Seleccionar ciudad
    fireEvent.change(selects[1], { target: { value: '1' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'));
    });
    
    await waitFor(() => {
      expect(mockUseOrigins.createOrigin).toHaveBeenCalledWith({
        name: 'Nueva Planta',
        id_city: 1,
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('Origen creado correctamente');
    });
  });

  it('debería crear origen con id_facility', async () => {
    render(<OriginManagement />);
    
    fireEvent.click(screen.getByText('Nuevo Origen'));
    
    const nameInput = screen.getByPlaceholderText('Ej: Planta Principal, Bodega Norte');
    const facilityInput = screen.getByPlaceholderText('Ej: FAC-001, BODEGA-A');
    
    fireEvent.change(nameInput, { target: { value: 'Nueva Planta' } });
    fireEvent.change(facilityInput, { target: { value: 'FAC-002' } });
    
    const selects = screen.getAllByTestId('select-native');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '1' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'));
    });
    
    await waitFor(() => {
      expect(mockUseOrigins.createOrigin).toHaveBeenCalledWith({
        name: 'Nueva Planta',
        id_city: 1,
        id_facility: 'FAC-002',
      });
    });
  });

  it('debería actualizar origen exitosamente', async () => {
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta Principal', 
        id_city: 1, 
        id_facility: 'FAC-001',
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    const editButtons = screen.getAllByTestId('pencil-icon');
    fireEvent.click(editButtons[0].closest('button')!);
    
    const nameInput = screen.getByDisplayValue('Planta Principal');
    fireEvent.change(nameInput, { target: { value: 'Planta Actualizada' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Actualizar'));
    });
    
    await waitFor(() => {
      expect(mockUseOrigins.updateOrigin).toHaveBeenCalledWith(1, expect.objectContaining({
        name: 'Planta Actualizada',
      }));
      expect(mockToastSuccess).toHaveBeenCalledWith('Origen actualizado correctamente');
    });
  });

  it('debería manejar error al crear origen', async () => {
    mockUseOrigins.createOrigin.mockRejectedValueOnce(new Error('Error de duplicado'));
    
    render(<OriginManagement />);
    
    fireEvent.click(screen.getByText('Nuevo Origen'));
    
    const nameInput = screen.getByPlaceholderText('Ej: Planta Principal, Bodega Norte');
    fireEvent.change(nameInput, { target: { value: 'Nueva Planta' } });
    
    const selects = screen.getAllByTestId('select-native');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '1' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'));
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error de duplicado');
    });
  });

  it('debería abrir diálogo de eliminar', () => {
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta Principal', 
        id_city: 1, 
        id_facility: 'FAC-001',
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Eliminar origen?')).toBeInTheDocument();
  });

  it('debería eliminar origen exitosamente', async () => {
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta Principal', 
        id_city: 1, 
        id_facility: 'FAC-001',
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('alert-dialog-action'));
    });
    
    await waitFor(() => {
      expect(mockUseOrigins.deleteOrigin).toHaveBeenCalledWith(1);
      expect(mockToastSuccess).toHaveBeenCalledWith('Origen eliminado correctamente');
    });
  });

  it('debería manejar error al eliminar origen', async () => {
    mockUseOrigins.deleteOrigin.mockRejectedValueOnce(new Error('Tiene productos asociados'));
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta Principal', 
        id_city: 1, 
        id_facility: 'FAC-001',
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('alert-dialog-action'));
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Tiene productos asociados');
    });
  });

  it('debería manejar error genérico al guardar', async () => {
    mockUseOrigins.createOrigin.mockRejectedValueOnce('Error string');
    
    render(<OriginManagement />);
    
    fireEvent.click(screen.getByText('Nuevo Origen'));
    
    const nameInput = screen.getByPlaceholderText('Ej: Planta Principal, Bodega Norte');
    fireEvent.change(nameInput, { target: { value: 'Nueva Planta' } });
    
    const selects = screen.getAllByTestId('select-native');
    fireEvent.change(selects[0], { target: { value: '1' } });
    fireEvent.change(selects[1], { target: { value: '1' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'));
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error al guardar origen');
    });
  });

  it('debería manejar error genérico al eliminar', async () => {
    mockUseOrigins.deleteOrigin.mockRejectedValueOnce('Error string');
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta', 
        id_city: 1, 
        id_facility: null,
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('alert-dialog-action'));
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error al eliminar origen');
    });
  });

  it('debería actualizar origen con id_facility', async () => {
    mockUseOrigins.origins = [
      { 
        id: 1, 
        name: 'Planta', 
        id_city: 1, 
        id_facility: null,
        city_name: 'Quito',
        province_name: 'Pichincha',
        created_at: '2025-01-15T10:00:00Z' 
      },
    ];
    
    render(<OriginManagement />);
    
    const editButtons = screen.getAllByTestId('pencil-icon');
    fireEvent.click(editButtons[0].closest('button')!);
    
    const facilityInput = screen.getByPlaceholderText('Ej: FAC-001, BODEGA-A');
    fireEvent.change(facilityInput, { target: { value: 'NEW-FAC' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Actualizar'));
    });
    
    await waitFor(() => {
      expect(mockUseOrigins.updateOrigin).toHaveBeenCalledWith(1, expect.objectContaining({
        id_facility: 'NEW-FAC',
      }));
    });
  });
});
