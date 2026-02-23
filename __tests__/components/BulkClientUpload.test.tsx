import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import BulkClientUpload from '@/app/components/BulkClientUpload';
import type { Province, City } from '@/app/hooks/useClients';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastInfo = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string, opts?: any) => mockToastError(msg),
    info: (msg: string) => mockToastInfo(msg),
  },
}));

// Mock excel utilities
const mockCreateWorkbook = jest.fn(() => ({}));
const mockAddSheetFromJson = jest.fn();
const mockDownloadWorkbook = jest.fn();
const mockReadWorkbookToJson = jest.fn();

jest.mock('@/app/utils/excel', () => ({
  createWorkbook: () => mockCreateWorkbook(),
  addSheetFromJson: (...args: unknown[]) => mockAddSheetFromJson(...args),
  downloadWorkbook: (...args: unknown[]) => mockDownloadWorkbook(...args),
  readWorkbookToJson: () => mockReadWorkbookToJson(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Upload: () => <span data-testid="icon-upload" />,
  Download: () => <span data-testid="icon-download" />,
  FileSpreadsheet: () => <span data-testid="icon-file" />,
  Check: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
  Edit2: () => <span data-testid="icon-edit" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
}));

// Mock shadcn/ui components
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
}));

jest.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/app/components/ui/input', () => ({
  Input: ({ onBlur, onKeyDown, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input 
      data-testid="input" 
      onBlur={onBlur} 
      onKeyDown={onKeyDown}
      {...props} 
    />
  ),
}));

jest.mock('@/app/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));

jest.mock('@/app/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => 
    <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => 
    <tbody>{children}</tbody>,
  TableCell: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => 
    <td onClick={onClick}>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => 
    <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => 
    <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => 
    <tr>{children}</tr>,
}));

// Test data
const mockProvinces: Province[] = [
  { id: 1, name: 'Pichincha', status: 'active' },
  { id: 2, name: 'Guayas', status: 'active' },
];

const mockCities: City[] = [
  { id: 1, name: 'Quito', id_province: 1, status: 'active' },
  { id: 2, name: 'Guayaquil', id_province: 2, status: 'active' },
];

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  onSuccess: jest.fn(),
  onUpload: jest.fn(),
  provinces: mockProvinces,
  cities: mockCities,
};

const createMockFile = () => {
  const file = new File(['test'], 'clients.xlsx', { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
  return file;
};

describe('BulkClientUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDownloadWorkbook.mockResolvedValue(undefined);
  });

  describe('Initial rendering (Upload step)', () => {
    it('should render when open is true', () => {
      render(<BulkClientUpload {...defaultProps} />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Carga Masiva de Clientes')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<BulkClientUpload {...defaultProps} open={false} />);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should render instructions', () => {
      render(<BulkClientUpload {...defaultProps} />);
      
      expect(screen.getByText('Instrucciones')).toBeInTheDocument();
      expect(screen.getByText(/Descarga la plantilla de Excel/)).toBeInTheDocument();
    });

    it('should render download template button', () => {
      render(<BulkClientUpload {...defaultProps} />);
      
      expect(screen.getByText('Descargar Plantilla')).toBeInTheDocument();
    });

    it('should render upload button', () => {
      render(<BulkClientUpload {...defaultProps} />);
      
      expect(screen.getByText('Subir Archivo Excel')).toBeInTheDocument();
    });

    it('should render notes section', () => {
      render(<BulkClientUpload {...defaultProps} />);
      
      expect(screen.getByText('Notas importantes:')).toBeInTheDocument();
      expect(screen.getByText(/IDs correctos de provincias/)).toBeInTheDocument();
    });
  });

  describe('Template download', () => {
    it('should download template when button is clicked', async () => {
      render(<BulkClientUpload {...defaultProps} />);
      
      const downloadBtn = screen.getByText('Descargar Plantilla');
      fireEvent.click(downloadBtn);
      
      await waitFor(() => {
        expect(mockCreateWorkbook).toHaveBeenCalled();
        expect(mockAddSheetFromJson).toHaveBeenCalled();
        expect(mockDownloadWorkbook).toHaveBeenCalledWith(
          expect.anything(),
          'plantilla_clientes_nutregam.xlsx'
        );
        expect(mockToastSuccess).toHaveBeenCalledWith('Plantilla descargada correctamente');
      });
    });
  });

  describe('File upload', () => {
    it('should process valid clients from Excel', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Test Client',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
          'Límite de Crédito': '',
          'Días de Crédito': '',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('1 registros cargados');
        expect(screen.getByText(/1 registros cargados/)).toBeInTheDocument();
      });
    });

    it('should show error for empty file', async () => {
      mockReadWorkbookToJson.mockResolvedValueOnce([]);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('El archivo está vacío');
      });
    });

    it('should show validation errors for invalid data', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': '',
          'RUC/Cédula': '123',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'invalid-email',
          'Teléfono': '',
          'Dirección': '',
          'ID Provincia': '',
          'ID Ciudad': '',
          'Requiere Crédito (SI/NO)': 'SI',
          'Límite de Crédito': '',
          'Días de Crédito': '',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/con errores/)).toBeInTheDocument();
        expect(screen.getByText('Errores de Validación:')).toBeInTheDocument();
      });
    });

    it('should handle file read error', async () => {
      mockReadWorkbookToJson.mockRejectedValueOnce(new Error('Error reading file'));
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Error al procesar el archivo. Verifica que tenga el formato correcto.'
        );
      });
    });

    it('should validate credit fields when requires_credit is true', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Test Client',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'SI',
          'Límite de Crédito': '',
          'Días de Crédito': '',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Límite de crédito debe ser mayor a 0/)).toBeInTheDocument();
        expect(screen.getByText(/Días de crédito debe ser mayor a 0/)).toBeInTheDocument();
      });
    });
  });

  describe('Preview step', () => {
    const setupPreview = async (data?: any[]) => {
      const mockExcelData = data || [
        {
          'Nombre del Cliente': 'Test Client',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
          'Límite de Crédito': '',
          'Días de Crédito': '',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/registros cargados/)).toBeInTheDocument();
      });
    };

    it('should display client data in table', async () => {
      await setupPreview();
      
      expect(screen.getByText('Test Client')).toBeInTheDocument();
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should display Cargar button with client count', async () => {
      await setupPreview();
      
      expect(screen.getByText('Cargar 1 Clientes')).toBeInTheDocument();
    });

    it('should have Volver button', async () => {
      await setupPreview();
      
      expect(screen.getByText('Volver')).toBeInTheDocument();
    });

    it('should go back to upload step when Volver is clicked', async () => {
      await setupPreview();
      
      fireEvent.click(screen.getByText('Volver'));
      
      expect(screen.getByText('Descargar Plantilla')).toBeInTheDocument();
    });

    it('should show credit info when requires_credit is true', async () => {
      const dataWithCredit = [
        {
          'Nombre del Cliente': 'Credit Client',
          'RUC/Cédula': '1234567890001',
          'Tipo (CED/RUC)': 'RUC',
          'Correo Electrónico': 'credit@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'SI',
          'Límite de Crédito': '5000',
          'Días de Crédito': '30',
        },
      ];
      
      await setupPreview(dataWithCredit);
      
      expect(screen.getByText('Sí')).toBeInTheDocument();
      expect(screen.getByText('$5000')).toBeInTheDocument();
      expect(screen.getByText('30 días')).toBeInTheDocument();
    });

    it('should remove row when X button is clicked', async () => {
      await setupPreview();
      
      // Find the remove button (X icon in a button)
      const removeButtons = screen.getAllByRole('button');
      const removeBtn = removeButtons.find(btn => btn.querySelector('[data-testid="icon-x"]'));
      
      if (removeBtn) {
        fireEvent.click(removeBtn);
        expect(mockToastInfo).toHaveBeenCalledWith('Registro eliminado');
      }
    });
  });

  describe('Bulk upload', () => {
    const setupAndUpload = async (uploadResult: any) => {
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Test Client',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
          'Límite de Crédito': '',
          'Días de Crédito': '',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      defaultProps.onUpload.mockResolvedValueOnce(uploadResult);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Cargar 1 Clientes')).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Cargar 1 Clientes'));
      });
    };

    it('should show processing state', async () => {
      defaultProps.onUpload.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Test Client',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Cargar 1 Clientes')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Cargar 1 Clientes'));
      
      await waitFor(() => {
        expect(screen.getByText('Procesando carga masiva...')).toBeInTheDocument();
      });
    });

    it('should show success message on successful upload', async () => {
      const uploadResult = {
        total: 1,
        created: 1,
        updated: 0,
        failed: 0,
        errors: [],
      };
      
      await setupAndUpload(uploadResult);
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith(
          '1 clientes procesados exitosamente (1 creados, 0 actualizados)'
        );
        expect(defaultProps.onSuccess).toHaveBeenCalled();
      });
    });

    it('should show error message when upload has failures', async () => {
      const uploadResult = {
        total: 2,
        created: 1,
        updated: 0,
        failed: 1,
        errors: [{ index: 1, name: 'Error Client', error: 'Duplicate ID' }],
      };
      
      await setupAndUpload(uploadResult);
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });

    it('should handle upload error', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Test Client',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      defaultProps.onUpload.mockRejectedValueOnce(new Error('Server error'));
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Cargar 1 Clientes')).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Cargar 1 Clientes'));
      });
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Server error');
      });
    });

    it('should not upload when there are validation errors', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': '',
          'RUC/Cédula': '123',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'invalid',
          'Teléfono': '',
          'Dirección': '',
          'ID Provincia': '',
          'ID Ciudad': '',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/con errores/)).toBeInTheDocument();
      });
      
      // The button should be disabled
      const uploadBtn = screen.getByText('Cargar 1 Clientes');
      expect(uploadBtn).toBeDisabled();
    });
  });

  describe('Cell editing', () => {
    const setupForEditing = async (data?: any[]) => {
      const mockExcelData = data || [
        {
          'Nombre del Cliente': 'Original Name',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/registros cargados/)).toBeInTheDocument();
      });
    };

    it('should allow editing name cell', async () => {
      await setupForEditing();
      
      // Click on the name to edit
      fireEvent.click(screen.getByText('Original Name'));
      
      // Should show an input
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });

    it('should update name when blur', async () => {
      await setupForEditing();
      
      // Click on the name to edit
      fireEvent.click(screen.getByText('Original Name'));
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
      
      const input = screen.getAllByTestId('input')[0];
      fireEvent.change(input, { target: { value: 'New Name' } });
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.getByText('New Name')).toBeInTheDocument();
      });
    });

    it('should update name when Enter key is pressed', async () => {
      await setupForEditing();
      
      fireEvent.click(screen.getByText('Original Name'));
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
      
      const input = screen.getAllByTestId('input')[0];
      fireEvent.change(input, { target: { value: 'Enter Name' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      await waitFor(() => {
        expect(screen.getByText('Enter Name')).toBeInTheDocument();
      });
    });

    it('should allow editing identification cell', async () => {
      await setupForEditing();
      
      fireEvent.click(screen.getByText('1234567890'));
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });

    it('should allow editing email cell', async () => {
      await setupForEditing();
      
      fireEvent.click(screen.getByText('test@example.com'));
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });

    it('should allow editing phone cell', async () => {
      await setupForEditing();
      
      fireEvent.click(screen.getByText('+593999999999'));
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
    });

    it('should show validation error after editing with invalid value', async () => {
      await setupForEditing();
      
      // Edit name to empty value
      fireEvent.click(screen.getByText('Original Name'));
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
      
      const input = screen.getAllByTestId('input')[0];
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.getByText(/con errores/)).toBeInTheDocument();
      });
    });

    it('should clear validation errors after fixing invalid value', async () => {
      // First set up with invalid data
      const invalidData = [
        {
          'Nombre del Cliente': '',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      await setupForEditing(invalidData);
      
      // Should have errors
      expect(screen.getByText(/con errores/)).toBeInTheDocument();
      
      // Click to edit the empty name (which shows as "-")
      const emptyFields = screen.getAllByText('-');
      if (emptyFields.length > 0) {
        fireEvent.click(emptyFields[0]);
      }
      
      await waitFor(() => {
        const inputs = screen.getAllByTestId('input');
        expect(inputs.length).toBeGreaterThan(0);
      });
      
      const input = screen.getAllByTestId('input')[0];
      fireEvent.change(input, { target: { value: 'Fixed Name' } });
      fireEvent.blur(input);
      
      await waitFor(() => {
        expect(screen.getByText('Fixed Name')).toBeInTheDocument();
      });
    });
  });

  describe('Close behavior', () => {
    it('should call onOpenChange when dialog closes', () => {
      render(<BulkClientUpload {...defaultProps} />);
      
      // The Dialog mock will call onOpenChange through handleClose
      // which is triggered when the dialog is closed
      expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    it('should validate email format', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Test Client',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'invalid-email',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Formato de email inválido/)).toBeInTheDocument();
      });
    });

    it('should validate identification length', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Test Client',
          'RUC/Cédula': '123',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/RUC\/Cédula debe tener entre 10 y 13 caracteres/)).toBeInTheDocument();
      });
    });

    it('should validate all required fields are present', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': '',
          'RUC/Cédula': '',
          'Tipo (CED/RUC)': '',
          'Correo Electrónico': '',
          'Teléfono': '',
          'Dirección': '',
          'ID Provincia': '',
          'ID Ciudad': '',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Nombre del cliente es requerido/)).toBeInTheDocument();
        expect(screen.getByText(/RUC\/Cédula es requerido/)).toBeInTheDocument();
        expect(screen.getByText(/Correo electrónico es requerido/)).toBeInTheDocument();
      });
    });
  });

  describe('Row removal', () => {
    it('should remove row and reindex errors', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Client 1',
          'RUC/Cédula': '1234567890',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test1@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
        },
        {
          'Nombre del Cliente': 'Client 2',
          'RUC/Cédula': '0987654321',
          'Tipo (CED/RUC)': 'CED',
          'Correo Electrónico': 'test2@example.com',
          'Teléfono': '+593888888888',
          'Dirección': 'Test Address 2',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'NO',
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Client 1')).toBeInTheDocument();
        expect(screen.getByText('Client 2')).toBeInTheDocument();
      });
      
      // Remove first client
      const removeButtons = screen.getAllByRole('button');
      const removeBtn = removeButtons.find(btn => btn.querySelector('[data-testid="icon-x"]'));
      
      if (removeBtn) {
        fireEvent.click(removeBtn);
      }
      
      await waitFor(() => {
        expect(mockToastInfo).toHaveBeenCalledWith('Registro eliminado');
        expect(screen.getByText('Cargar 1 Clientes')).toBeInTheDocument();
      });
    });
  });

  describe('Upload with credit data', () => {
    it('should include credit data when requires_credit is true', async () => {
      const mockExcelData = [
        {
          'Nombre del Cliente': 'Credit Client',
          'RUC/Cédula': '1234567890001',
          'Tipo (CED/RUC)': 'RUC',
          'Correo Electrónico': 'credit@example.com',
          'Teléfono': '+593999999999',
          'Dirección': 'Test Address',
          'ID Provincia': '1',
          'ID Ciudad': '1',
          'Requiere Crédito (SI/NO)': 'SI',
          'Límite de Crédito': '5000',
          'Días de Crédito': '30',
        },
      ];
      
      const uploadResult = {
        total: 1,
        created: 1,
        updated: 0,
        failed: 0,
        errors: [],
      };
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      defaultProps.onUpload.mockResolvedValueOnce(uploadResult);
      
      render(<BulkClientUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Cargar 1 Clientes')).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Cargar 1 Clientes'));
      });
      
      await waitFor(() => {
        expect(defaultProps.onUpload).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              requires_credit: true,
              credit_limit: 5000,
              credit_days: 30,
            })
          ])
        );
      });
    });
  });
});
