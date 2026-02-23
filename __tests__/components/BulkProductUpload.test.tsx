import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import BulkProductUpload from '@/app/components/BulkProductUpload';
import type { BulkProductResponse, Category, Origin, Measure } from '@/app/hooks/useProducts';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
const mockToastWarning = jest.fn();

jest.mock('sonner', () => ({
  toast: {
    success: (msg: string) => mockToastSuccess(msg),
    error: (msg: string) => mockToastError(msg),
    warning: (msg: string) => mockToastWarning(msg),
  },
}));

// Mock excel utilities
const mockCreateWorkbook = jest.fn(() => ({}));
const mockAddSheetFromJson = jest.fn();
const mockAddSheetFromAoa = jest.fn();
const mockDownloadWorkbook = jest.fn();
const mockReadWorkbookToJson = jest.fn();

jest.mock('@/app/utils/excel', () => ({
  createWorkbook: () => mockCreateWorkbook(),
  addSheetFromJson: (...args: unknown[]) => mockAddSheetFromJson(...args),
  addSheetFromAoa: (...args: unknown[]) => mockAddSheetFromAoa(...args),
  downloadWorkbook: (...args: unknown[]) => mockDownloadWorkbook(...args),
  readWorkbookToJson: () => mockReadWorkbookToJson(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader2: () => <span data-testid="icon-loader" />,
  Upload: () => <span data-testid="icon-upload" />,
  Download: () => <span data-testid="icon-download" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  AlertCircle: () => <span data-testid="icon-alert" />,
  X: () => <span data-testid="icon-x" />,
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
}));

jest.mock('@/app/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/app/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => 
    <div data-testid="card-content">{children}</div>,
}));

jest.mock('@/app/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => 
    <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => 
    <tbody>{children}</tbody>,
  TableCell: ({ children }: { children: React.ReactNode }) => 
    <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => 
    <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => 
    <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => 
    <tr>{children}</tr>,
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

jest.mock('@/app/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => 
    <span data-testid="badge">{children}</span>,
}));

// Test data
const mockCategories: Category[] = [
  { id: 1, name: 'Snacks', status: 'active' },
  { id: 2, name: 'Bebidas', status: 'active' },
];

const mockOrigins: Origin[] = [
  { id: 1, name: 'Nacional', status: 'active' },
  { id: 2, name: 'Importado', status: 'active' },
];

const mockMeasures: Measure[] = [
  { id: 1, name: 'Kilogramo', abbreviation: 'kg', status: 'active' },
  { id: 2, name: 'Unidad', abbreviation: 'un', status: 'active' },
];

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onUpload: jest.fn(),
  categories: mockCategories,
  origins: mockOrigins,
  measures: mockMeasures,
};

describe('BulkProductUpload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDownloadWorkbook.mockResolvedValue(undefined);
  });

  describe('Initial rendering (Step 1)', () => {
    it('should render when isOpen is true', () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
      expect(screen.getByText('Carga Masiva')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<BulkProductUpload {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('should render step indicators', () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      expect(screen.getByText('Plantilla')).toBeInTheDocument();
      expect(screen.getByText('Cargar')).toBeInTheDocument();
      expect(screen.getByText('Revisar')).toBeInTheDocument();
      expect(screen.getByText('Resultado')).toBeInTheDocument();
    });

    it('should render product type selector', () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      expect(screen.getByText('Tipo de producto')).toBeInTheDocument();
      expect(screen.getByText('Productos Finales')).toBeInTheDocument();
      expect(screen.getByText('Materias Primas')).toBeInTheDocument();
    });

    it('should render download template button', () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      expect(screen.getByText('Descargar Plantilla')).toBeInTheDocument();
      expect(screen.getByTestId('icon-download')).toBeInTheDocument();
    });

    it('should render Siguiente button', () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });
  });

  describe('Template download (Step 1)', () => {
    it('should download template for Productos Finales', async () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      const downloadBtn = screen.getByText('Descargar Plantilla');
      fireEvent.click(downloadBtn);
      
      await waitFor(() => {
        expect(mockCreateWorkbook).toHaveBeenCalled();
        expect(mockAddSheetFromJson).toHaveBeenCalled();
        expect(mockAddSheetFromAoa).toHaveBeenCalled();
        expect(mockDownloadWorkbook).toHaveBeenCalledWith(
          expect.anything(),
          'plantilla_productos_finales.xlsx'
        );
        expect(mockToastSuccess).toHaveBeenCalledWith('Plantilla descargada');
      });
    });

    it('should download template for Materias Primas', async () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      // Change to Materias Primas
      const select = screen.getByTestId('select-trigger');
      fireEvent.change(select, { target: { value: 'MP' } });
      
      const downloadBtn = screen.getByText('Descargar Plantilla');
      fireEvent.click(downloadBtn);
      
      await waitFor(() => {
        expect(mockDownloadWorkbook).toHaveBeenCalledWith(
          expect.anything(),
          'plantilla_materias_primas.xlsx'
        );
      });
    });
  });

  describe('Navigation to Step 2', () => {
    it('should navigate to step 2 when Siguiente is clicked', () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      const nextBtn = screen.getByText('Siguiente');
      fireEvent.click(nextBtn);
      
      expect(screen.getByText('Seleccionar archivo Excel')).toBeInTheDocument();
      expect(screen.getByText('Máximo 1000 productos')).toBeInTheDocument();
      expect(screen.getByText('Volver')).toBeInTheDocument();
    });

    it('should go back to step 1 from step 2', () => {
      render(<BulkProductUpload {...defaultProps} />);
      
      // Go to step 2
      fireEvent.click(screen.getByText('Siguiente'));
      
      // Go back to step 1
      fireEvent.click(screen.getByText('Volver'));
      
      expect(screen.getByText('Descargar Plantilla')).toBeInTheDocument();
    });
  });

  describe('File upload (Step 2)', () => {
    const createMockFile = () => {
      const file = new File(['test'], 'test.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      // Mock arrayBuffer method
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
      return file;
    };

    it('should process valid products from Excel', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      // Navigate to step 2
      fireEvent.click(screen.getByText('Siguiente'));
      
      // Simulate file upload
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('1 productos cargados');
        expect(screen.getByText(/Productos Válidos/)).toBeInTheDocument();
      });
    });

    it('should show error for empty file', async () => {
      mockReadWorkbookToJson.mockResolvedValueOnce([]);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
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

    it('should show validation errors for PF products with decimals', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto con decimal',
          'SKU *': 'SKU-002',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 10.5,
          'Stock Mínimo': 5,
          'Precio *': 10.00,
        },
        {
          'Nombre *': 'Producto válido',
          'SKU *': 'SKU-003',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 15.00,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(mockToastWarning).toHaveBeenCalledWith('1 válidos, 1 con errores');
      });
    });

    it('should show validation errors for products with invalid price', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto sin precio',
          'SKU *': 'SKU-004',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 0,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/No hay productos válidos/)).toBeInTheDocument();
      });
    });

    it('should allow decimals for MP (Materias Primas) products', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Materia Prima',
          'SKU *': 'MP-001',
          'Tipo *': 'MP',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 15.75,
          'Stock Mínimo': 5.5,
          'Precio *': 8.75,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('1 productos cargados');
      });
    });

    it('should handle file read error', async () => {
      mockReadWorkbookToJson.mockRejectedValueOnce(new Error('Error reading file'));
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Error reading file');
      });
    });
  });

  describe('Preview step (Step 3)', () => {
    const createMockFile = (name: string = 'products.xlsx') => {
      const file = new File(['test'], name, { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
      return file;
    };

    const setupStep3 = async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Productos Válidos/)).toBeInTheDocument();
      });
    };

    it('should display file name and product count', async () => {
      await setupStep3();
      
      expect(screen.getByText(/products\.xlsx/)).toBeInTheDocument();
      // Multiple elements may match, use getAllByText
      expect(screen.getAllByText(/1 productos/).length).toBeGreaterThan(0);
    });

    it('should display product details in table', async () => {
      await setupStep3();
      
      expect(screen.getByText('Producto Test')).toBeInTheDocument();
      expect(screen.getByText('SKU-001')).toBeInTheDocument();
    });

    it('should display category, origin, and measure names', async () => {
      await setupStep3();
      
      expect(screen.getByText('Snacks')).toBeInTheDocument();
      expect(screen.getByText('Nacional')).toBeInTheDocument();
      expect(screen.getByText('Kilogramo')).toBeInTheDocument();
    });

    it('should have Confirmar button with product count', async () => {
      await setupStep3();
      
      expect(screen.getByText('Confirmar 1 productos')).toBeInTheDocument();
    });

    it('should go back to step 2 when Volver is clicked', async () => {
      await setupStep3();
      
      fireEvent.click(screen.getByText('Volver'));
      
      expect(screen.getByText('Seleccionar archivo Excel')).toBeInTheDocument();
    });
  });

  describe('Upload confirmation (Step 3 -> Step 4)', () => {
    const createMockFile = () => {
      const file = new File(['test'], 'products.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
      return file;
    };

    const setupAndConfirm = async (uploadResult: BulkProductResponse) => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      defaultProps.onUpload.mockResolvedValueOnce(uploadResult);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Confirmar 1 productos/)).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Confirmar 1 productos'));
      });
    };

    it('should show success result', async () => {
      const uploadResult: BulkProductResponse = {
        total: 1,
        created: 1,
        updated: 0,
        failed: 0,
        products: [{ id: 1, sku: 'SKU-001', name: 'Producto Test', quantity: 100 }],
        errors: [],
      };
      
      await setupAndConfirm(uploadResult);
      
      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('1 creados, 0 actualizados');
        expect(screen.getByText('Creados')).toBeInTheDocument();
      });
    });

    it('should show result with errors', async () => {
      const uploadResult: BulkProductResponse = {
        total: 2,
        created: 1,
        updated: 0,
        failed: 1,
        products: [{ id: 1, sku: 'SKU-001', name: 'Producto Test', quantity: 100 }],
        errors: [{ index: 1, sku: 'SKU-002', error: 'Duplicate SKU' }],
      };
      
      await setupAndConfirm(uploadResult);
      
      await waitFor(() => {
        expect(mockToastWarning).toHaveBeenCalledWith('1 errores. 1 creados, 0 actualizados');
      });
    });

    it('should handle upload error', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      defaultProps.onUpload.mockRejectedValueOnce(new Error('Server error'));
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Confirmar 1 productos/)).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Confirmar 1 productos'));
      });
      
      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Server error');
      });
    });
  });

  describe('Result step (Step 4)', () => {
    const createMockFile = () => {
      const file = new File(['test'], 'products.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
      return file;
    };

    it('should display successful products table', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      const uploadResult: BulkProductResponse = {
        total: 1,
        created: 1,
        updated: 0,
        failed: 0,
        products: [{ id: 1, sku: 'SKU-001', name: 'Producto Test', quantity: 100 }],
        errors: [],
      };
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      defaultProps.onUpload.mockResolvedValueOnce(uploadResult);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Confirmar 1 productos/)).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Confirmar 1 productos'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Exitosos (1)')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument();
      });
    });

    it('should display errors table when there are errors', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      const uploadResult: BulkProductResponse = {
        total: 2,
        created: 1,
        updated: 0,
        failed: 1,
        products: [{ id: 1, sku: 'SKU-001', name: 'Producto Test', quantity: 100 }],
        errors: [{ index: 2, sku: 'SKU-002', error: 'Duplicate SKU' }],
      };
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      defaultProps.onUpload.mockResolvedValueOnce(uploadResult);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Confirmar 1 productos/)).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Confirmar 1 productos'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Errores (1)')).toBeInTheDocument();
        expect(screen.getByText('Duplicate SKU')).toBeInTheDocument();
      });
    });
  });

  describe('Close behavior', () => {
    const createMockFile = () => {
      const file = new File(['test'], 'products.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
      return file;
    };

    it('should call onClose and reset state when Cerrar is clicked', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': 1,
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      const uploadResult: BulkProductResponse = {
        total: 1,
        created: 1,
        updated: 0,
        failed: 0,
        products: [{ id: 1, sku: 'SKU-001', name: 'Producto Test', quantity: 100 }],
        errors: [],
      };
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      defaultProps.onUpload.mockResolvedValueOnce(uploadResult);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Confirmar 1 productos/)).toBeInTheDocument();
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Confirmar 1 productos'));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Cerrar')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Cerrar'));
      
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Helper functions', () => {
    const createMockFile = () => {
      const file = new File(['test'], 'products.xlsx', { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      file.arrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8));
      return file;
    };

    it('should display "Sin categoría" for null category', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': '',
          'ID Origen *': 1,
          'ID Medida *': 1,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Sin categoría')).toBeInTheDocument();
      });
    });

    it('should display ID for unknown category/origin/measure', async () => {
      const mockExcelData = [
        {
          'Nombre *': 'Producto Test',
          'SKU *': 'SKU-001',
          'Tipo *': 'PF',
          'ID Categoría': 999,
          'ID Origen *': 999,
          'ID Medida *': 999,
          'Cantidad Inicial': 100,
          'Stock Mínimo': 20,
          'Precio *': 10.50,
        },
      ];
      
      mockReadWorkbookToJson.mockResolvedValueOnce(mockExcelData);
      
      render(<BulkProductUpload {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Siguiente'));
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const file = createMockFile();
      
      await act(async () => {
        Object.defineProperty(fileInput, 'files', { value: [file] });
        fireEvent.change(fileInput);
      });
      
      await waitFor(() => {
        // Should display ID: 999 for unknown category, origin, and measure
        // There will be 3 instances (one for each), so use getAllByText
        const idElements = screen.getAllByText('ID: 999');
        expect(idElements.length).toBe(3);
      });
    });
  });
});
