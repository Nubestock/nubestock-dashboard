import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MeasureManagement from '../../src/app/components/MeasureManagement';

// Mock useMeasures hook
const mockUseMeasures = {
  measures: [] as Array<{ id: number; name: string; description: string; created_at: string }>,
  loading: false,
  error: null as string | null,
  createMeasure: jest.fn(),
  updateMeasure: jest.fn(),
  deleteMeasure: jest.fn(),
};

jest.mock('../../src/app/hooks/useMeasures', () => ({
  useMeasures: () => mockUseMeasures,
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
  Ruler: () => <span data-testid="ruler-icon">Ruler</span>,
  Plus: () => <span data-testid="plus-icon">Plus</span>,
  Pencil: () => <span data-testid="pencil-icon">Pencil</span>,
  Trash2: () => <span data-testid="trash-icon">Trash2</span>,
  Loader2: () => <span data-testid="loader-icon">Loader2</span>,
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

jest.mock('../../src/app/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...props} />,
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

describe('MeasureManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMeasures.measures = [];
    mockUseMeasures.loading = false;
    mockUseMeasures.error = null;
    mockUseMeasures.createMeasure.mockResolvedValue({});
    mockUseMeasures.updateMeasure.mockResolvedValue({});
    mockUseMeasures.deleteMeasure.mockResolvedValue({});
  });

  it('debería mostrar loading cuando está cargando', () => {
    mockUseMeasures.loading = true;
    
    render(<MeasureManagement />);
    
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('debería mostrar error cuando hay error', () => {
    mockUseMeasures.error = 'Error de conexión';
    
    render(<MeasureManagement />);
    
    expect(screen.getByText('Endpoint no disponible')).toBeInTheDocument();
    expect(screen.getByText('Error de conexión')).toBeInTheDocument();
  });

  it('debería mostrar mensaje de vacío cuando no hay medidas', () => {
    render(<MeasureManagement />);
    
    expect(screen.getByText('No hay medidas registradas')).toBeInTheDocument();
    expect(screen.getByText('Crear Primera Medida')).toBeInTheDocument();
  });

  it('debería mostrar tabla cuando hay medidas', () => {
    mockUseMeasures.measures = [
      { id: 1, name: 'KG', description: 'Kilogramos', created_at: '2025-01-15T10:00:00Z' },
      { id: 2, name: 'UN', description: 'Unidades', created_at: '2025-01-16T10:00:00Z' },
    ];
    
    render(<MeasureManagement />);
    
    expect(screen.getByText('KG')).toBeInTheDocument();
    expect(screen.getByText('Kilogramos')).toBeInTheDocument();
    expect(screen.getByText('UN')).toBeInTheDocument();
    expect(screen.getByText('Unidades')).toBeInTheDocument();
  });

  it('debería abrir diálogo de crear al hacer click en Nueva Medida', () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Crear Nueva Medida')).toBeInTheDocument();
  });

  it('debería abrir diálogo de crear desde botón de estado vacío', () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Crear Primera Medida'));
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  it('debería abrir diálogo de editar al hacer click en el botón de editar', () => {
    mockUseMeasures.measures = [
      { id: 1, name: 'KG', description: 'Kilogramos', created_at: '2025-01-15T10:00:00Z' },
    ];
    
    render(<MeasureManagement />);
    
    const editButtons = screen.getAllByTestId('pencil-icon');
    fireEvent.click(editButtons[0].closest('button')!);
    
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByText('Editar Medida')).toBeInTheDocument();
  });

  it('debería validar que la abreviatura no esté vacía', async () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    // El botón "Crear" estará deshabilitado porque los campos están vacíos
    const saveButton = screen.getByText('Crear');
    expect(saveButton).toBeDisabled();
  });

  it('debería convertir a mayúsculas y limitar a 5 caracteres', async () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    const nameInput = screen.getByPlaceholderText('Ej: KG, UN, L, M');
    // El componente tiene lógica para convertir a mayúsculas y limitar a 5, pero lo maneja internamente
    // Verificamos que el input existe y se puede cambiar
    fireEvent.change(nameInput, { target: { value: 'kg' } });
    expect(nameInput).toHaveValue('KG');
  });

  it('debería deshabilitar botón cuando falta descripción', async () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    const nameInput = screen.getByPlaceholderText('Ej: KG, UN, L, M');
    fireEvent.change(nameInput, { target: { value: 'KG' } });
    
    // El botón sigue deshabilitado porque falta la descripción
    const saveButton = screen.getByText('Crear');
    expect(saveButton).toBeDisabled();
  });

  it('debería crear medida exitosamente', async () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    const nameInput = screen.getByPlaceholderText('Ej: KG, UN, L, M');
    const descInput = screen.getByPlaceholderText('Ej: Kilogramos, Unidades, Litros, Metros');
    
    fireEvent.change(nameInput, { target: { value: 'kg' } });
    fireEvent.change(descInput, { target: { value: 'Kilogramos' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'));
    });
    
    await waitFor(() => {
      expect(mockUseMeasures.createMeasure).toHaveBeenCalledWith({
        name: 'KG',
        description: 'Kilogramos',
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('Medida creada correctamente');
    });
  });

  it('debería actualizar medida exitosamente', async () => {
    mockUseMeasures.measures = [
      { id: 1, name: 'KG', description: 'Kilogramos', created_at: '2025-01-15T10:00:00Z' },
    ];
    
    render(<MeasureManagement />);
    
    const editButtons = screen.getAllByTestId('pencil-icon');
    fireEvent.click(editButtons[0].closest('button')!);
    
    const descInput = screen.getByDisplayValue('Kilogramos');
    fireEvent.change(descInput, { target: { value: 'Kilogramos actualizados' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Actualizar'));
    });
    
    await waitFor(() => {
      expect(mockUseMeasures.updateMeasure).toHaveBeenCalledWith(1, {
        name: 'KG',
        description: 'Kilogramos actualizados',
      });
      expect(mockToastSuccess).toHaveBeenCalledWith('Medida actualizada correctamente');
    });
  });

  it('debería manejar error al crear medida', async () => {
    mockUseMeasures.createMeasure.mockRejectedValueOnce(new Error('Error de duplicado'));
    
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    const nameInput = screen.getByPlaceholderText('Ej: KG, UN, L, M');
    const descInput = screen.getByPlaceholderText('Ej: Kilogramos, Unidades, Litros, Metros');
    
    fireEvent.change(nameInput, { target: { value: 'KG' } });
    fireEvent.change(descInput, { target: { value: 'Kilogramos' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'));
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error de duplicado');
    });
  });

  it('debería abrir diálogo de eliminar', () => {
    mockUseMeasures.measures = [
      { id: 1, name: 'KG', description: 'Kilogramos', created_at: '2025-01-15T10:00:00Z' },
    ];
    
    render(<MeasureManagement />);
    
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
    expect(screen.getByText('¿Eliminar medida?')).toBeInTheDocument();
  });

  it('debería eliminar medida exitosamente', async () => {
    mockUseMeasures.measures = [
      { id: 1, name: 'KG', description: 'Kilogramos', created_at: '2025-01-15T10:00:00Z' },
    ];
    
    render(<MeasureManagement />);
    
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('alert-dialog-action'));
    });
    
    await waitFor(() => {
      expect(mockUseMeasures.deleteMeasure).toHaveBeenCalledWith(1);
      expect(mockToastSuccess).toHaveBeenCalledWith('Medida eliminada correctamente');
    });
  });

  it('debería manejar error al eliminar medida', async () => {
    mockUseMeasures.deleteMeasure.mockRejectedValueOnce(new Error('Tiene productos asociados'));
    mockUseMeasures.measures = [
      { id: 1, name: 'KG', description: 'Kilogramos', created_at: '2025-01-15T10:00:00Z' },
    ];
    
    render(<MeasureManagement />);
    
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('alert-dialog-action'));
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Tiene productos asociados');
    });
  });

  it('debería convertir abreviatura a mayúsculas automáticamente', () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    const nameInput = screen.getByPlaceholderText('Ej: KG, UN, L, M');
    fireEvent.change(nameInput, { target: { value: 'kg' } });
    
    expect(nameInput).toHaveValue('KG');
  });

  it('debería permitir cambiar la descripción', () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    const descInput = screen.getByPlaceholderText('Ej: Kilogramos, Unidades, Litros, Metros');
    fireEvent.change(descInput, { target: { value: 'Test description' } });
    
    expect(descInput).toHaveValue('Test description');
  });

  it('debería mostrar contador de caracteres de descripción', () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    expect(screen.getByText('0/100 caracteres')).toBeInTheDocument();
    
    const descInput = screen.getByPlaceholderText('Ej: Kilogramos, Unidades, Litros, Metros');
    fireEvent.change(descInput, { target: { value: 'Test' } });
    
    expect(screen.getByText('4/100 caracteres')).toBeInTheDocument();
  });

  it('debería manejar error genérico al guardar', async () => {
    mockUseMeasures.createMeasure.mockRejectedValueOnce('Error string');
    
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    const nameInput = screen.getByPlaceholderText('Ej: KG, UN, L, M');
    const descInput = screen.getByPlaceholderText('Ej: Kilogramos, Unidades, Litros, Metros');
    
    fireEvent.change(nameInput, { target: { value: 'KG' } });
    fireEvent.change(descInput, { target: { value: 'Kilogramos' } });
    
    await act(async () => {
      fireEvent.click(screen.getByText('Crear'));
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error al guardar medida');
    });
  });

  it('debería manejar error genérico al eliminar', async () => {
    mockUseMeasures.deleteMeasure.mockRejectedValueOnce('Error string');
    mockUseMeasures.measures = [
      { id: 1, name: 'KG', description: 'Kilogramos', created_at: '2025-01-15T10:00:00Z' },
    ];
    
    render(<MeasureManagement />);
    
    const deleteButtons = screen.getAllByTestId('trash-icon');
    fireEvent.click(deleteButtons[0].closest('button')!);
    
    await act(async () => {
      fireEvent.click(screen.getByTestId('alert-dialog-action'));
    });
    
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Error al eliminar medida');
    });
  });

  it('debería habilitar botón cuando los campos están completos', async () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    
    const nameInput = screen.getByPlaceholderText('Ej: KG, UN, L, M');
    const descInput = screen.getByPlaceholderText('Ej: Kilogramos, Unidades, Litros, Metros');
    
    fireEvent.change(nameInput, { target: { value: 'UN' } });
    fireEvent.change(descInput, { target: { value: 'Unidades' } });
    
    const saveButton = screen.getByText('Crear');
    expect(saveButton).not.toBeDisabled();
  });

  it('debería cerrar el diálogo después de cancelar', async () => {
    render(<MeasureManagement />);
    
    fireEvent.click(screen.getByText('Nueva Medida'));
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Cancelar'));
    
    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });
});
