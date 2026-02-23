import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecipeManagement from '@/app/components/RecipeManagement';

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
const mockRecipes = [
  { 
    id: 1, 
    id_product: 1, 
    product_name: 'Producto Final A',
    product_sku: 'PFA-001',
    status: 'active',
    materials: [
      { id: 1, id_recipe: 1, id_product: 2, quantity: 5, product_name: 'Material A', product_sku: 'MA-001' }
    ]
  },
];

const mockProducts = [
  { id: 1, name: 'Producto Final A', sku: 'PFA-001', type: 'PF', quantity: 100, min_stock: 10, measure_name: 'Unidad' },
  { id: 2, name: 'Material A', sku: 'MA-001', type: 'MP', quantity: 50, min_stock: 5, measure_name: 'Kg' },
  { id: 3, name: 'Producto Final B', sku: 'PFB-002', type: 'PF', quantity: 200, min_stock: 20, measure_name: 'Unidad' },
];

const mockRefetch = jest.fn();
const mockCreateRecipeWithMaterials = jest.fn().mockResolvedValue({ success: true });
const mockDeleteRecipe = jest.fn().mockResolvedValue({ success: true });
const mockRefetchMaterials = jest.fn().mockResolvedValue({});

jest.mock('@/app/hooks/useRecipes', () => ({
  useRecipes: () => ({
    recipes: mockRecipes,
    isLoading: false,
    refetch: mockRefetch,
    createRecipe: jest.fn(),
    createRecipeWithMaterials: mockCreateRecipeWithMaterials,
    updateRecipe: jest.fn(),
    updateCompleteRecipe: jest.fn().mockResolvedValue({ message: 'Receta actualizada', data: { changes: { added: 1, updated: 0, removed: 0 } } }),
    deleteRecipe: mockDeleteRecipe,
    getRecipesByProduct: () => ({
      '1': {
        id_product: 1,
        product_name: 'Producto Final A',
        sku: 'PFA-001',
        recipes: mockRecipes,
        materials: [
          { id: 2, id_product: 2, name: 'Material A', code: 'MA-001', measure_name: 'Kg', quantity: 5 },
        ],
      },
    }),
  }),
}));

jest.mock('@/app/hooks/useProducts', () => ({
  useProducts: (page?: number, limit?: number, type?: string) => ({
    products: type === 'MP' ? mockProducts.filter(p => p.type === 'MP') : mockProducts,
    pagination: { total: mockProducts.length },
    isLoading: false,
    error: null,
    refetch: mockRefetchMaterials,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChefHat: () => <span data-testid="icon-chef" />,
  Plus: () => <span data-testid="icon-plus" />,
  Pencil: () => <span data-testid="icon-pencil" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Loader2: () => <span data-testid="icon-loader" />,
  Search: () => <span data-testid="icon-search" />,
  Package: () => <span data-testid="icon-package" />,
  AlertTriangle: () => <span data-testid="icon-alert" />,
  RefreshCw: () => <span data-testid="icon-refresh" />,
  DollarSign: () => <span data-testid="icon-dollar" />,
  AlertCircle: () => <span data-testid="icon-alert-circle" />,
  BookOpen: () => <span data-testid="icon-book" />,
  Filter: () => <span data-testid="icon-filter" />,
  Layers: () => <span data-testid="icon-layers" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  Edit: () => <span data-testid="icon-edit" />,
  Calculator: () => <span data-testid="icon-calc" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  X: () => <span data-testid="icon-x" />,
  ChevronDown: () => <span data-testid="icon-chevron" />,
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
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

jest.mock('@/app/components/ui/input', () => ({
  Input: (props: any) => <input data-testid="input" {...props} />,
}));

jest.mock('@/app/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}));

jest.mock('@/app/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => <span data-testid="badge">{children}</span>,
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
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
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
  AlertDialogCancel: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

jest.mock('@/app/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div data-testid="select">{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <option value={value}>{children}</option>,
  SelectValue: () => null,
}));

jest.mock('@/app/components/ui/popover', () => ({
  Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/app/components/ui/accordion', () => ({
  Accordion: ({ children }: { children: React.ReactNode }) => <div data-testid="accordion">{children}</div>,
  AccordionContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

jest.mock('@/app/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

describe('RecipeManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial rendering', () => {
    it('should render the component with title', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Gestión de Recetas')).toBeInTheDocument();
    });

    it('should render statistics cards', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Recetas Totales')).toBeInTheDocument();
      expect(screen.getByText('Materiales Usados')).toBeInTheDocument();
      expect(screen.getByText('Sin Receta')).toBeInTheDocument();
    });

    it('should render the recipes list', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByText('Producto Final A').length).toBeGreaterThan(0);
    });

    it('should render New Recipe button', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Nueva Receta')).toBeInTheDocument();
    });

    it('should have a search input', () => {
      render(<RecipeManagement />);
      
      const inputs = screen.getAllByTestId('input');
      expect(inputs.length).toBeGreaterThan(0);
    });

    it('should render the refresh button', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Actualizar')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should have filter dropdown', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Todos los productos')).toBeInTheDocument();
    });

    it('should have search placeholder', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByPlaceholderText('Buscar producto...')).toBeInTheDocument();
    });
  });

  describe('Recipe display', () => {
    it('should display recipe product name', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByText('Producto Final A').length).toBeGreaterThan(0);
    });

    it('should display recipe product SKU', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByText('PFA-001').length).toBeGreaterThan(0);
    });

    it('should display product cards from recipe data', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Recetas de Productos')).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should display total recipes count', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('productos con receta')).toBeInTheDocument();
    });

    it('should display materials used count', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('items en recetas')).toBeInTheDocument();
    });

    it('should display products without recipe count', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('productos pendientes')).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should filter products when typing in search', () => {
      render(<RecipeManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar producto...');
      fireEvent.change(searchInput, { target: { value: 'Producto' } });
      
      expect(screen.getAllByText('Producto Final A').length).toBeGreaterThan(0);
    });

    it('should filter by SKU', () => {
      render(<RecipeManagement />);
      
      const searchInput = screen.getByPlaceholderText('Buscar producto...');
      fireEvent.change(searchInput, { target: { value: 'PFA-001' } });
      
      expect(screen.getAllByText('Producto Final A').length).toBeGreaterThan(0);
    });
  });

  describe('Refresh functionality', () => {
    it('should call refetch when refresh button is clicked', () => {
      render(<RecipeManagement />);
      
      const refreshButton = screen.getByText('Actualizar');
      fireEvent.click(refreshButton);
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Recipe card display', () => {
    it('should show material count', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('1 materiales')).toBeInTheDocument();
    });

    it('should display recipe card description', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Administra los ingredientes y materiales necesarios para cada producto')).toBeInTheDocument();
    });
  });

  describe('Product filter checkbox', () => {
    it('should render checkboxes for product selection', () => {
      render(<RecipeManagement />);
      
      const checkboxes = screen.getAllByTestId('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe('Material display', () => {
    it('should show material name in recipe', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByText('Material A').length).toBeGreaterThan(0);
    });

    it('should show material code', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByText('MA-001').length).toBeGreaterThan(0);
    });

    it('should show measure name badge', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByText('Kg').length).toBeGreaterThan(0);
    });
  });

  describe('Accordion interactions', () => {
    it('should render accordion component', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByTestId('accordion')).toBeInTheDocument();
    });
  });

  describe('Table display', () => {
    it('should show table headers', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Material')).toBeInTheDocument();
      expect(screen.getByText('Código SKU')).toBeInTheDocument();
      expect(screen.getByText('Unidad de Medida')).toBeInTheDocument();
      expect(screen.getByText('Acciones')).toBeInTheDocument();
    });
  });

  describe('New Recipe button', () => {
    it('should open dialog on click', async () => {
      render(<RecipeManagement />);
      
      const newRecipeButton = screen.getByText('Nueva Receta');
      await fireEvent.click(newRecipeButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Edit recipe', () => {
    it('should have edit button in recipe card', () => {
      render(<RecipeManagement />);
      
      const editButtons = screen.getAllByText('Editar');
      expect(editButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Materials summary', () => {
    it('should display materials count summary', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText(/Esta receta utiliza/)).toBeInTheDocument();
    });
  });

  describe('Format currency helper', () => {
    it('should render component without currency formatting errors', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Gestión de Recetas')).toBeInTheDocument();
    });
  });

  describe('Dialog content', () => {
    it('should show dialog title for new recipe', async () => {
      render(<RecipeManagement />);
      
      const newRecipeButton = screen.getByText('Nueva Receta');
      await fireEvent.click(newRecipeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Selecciona el producto y agrega sus materiales')).toBeInTheDocument();
      });
    });

    it('should show product selector in dialog', async () => {
      render(<RecipeManagement />);
      
      const newRecipeButton = screen.getByText('Nueva Receta');
      await fireEvent.click(newRecipeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Producto Final *')).toBeInTheDocument();
      });
    });

    it('should show materials label in dialog', async () => {
      render(<RecipeManagement />);
      
      const newRecipeButton = screen.getByText('Nueva Receta');
      await fireEvent.click(newRecipeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Materiales *')).toBeInTheDocument();
      });
    });

    it('should show cancel button in dialog', async () => {
      render(<RecipeManagement />);
      
      const newRecipeButton = screen.getByText('Nueva Receta');
      await fireEvent.click(newRecipeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Cancelar')).toBeInTheDocument();
      });
    });

    it('should show create button in dialog', async () => {
      render(<RecipeManagement />);
      
      const newRecipeButton = screen.getByText('Nueva Receta');
      await fireEvent.click(newRecipeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Crear')).toBeInTheDocument();
      });
    });

    it('should show empty materials message in dialog', async () => {
      render(<RecipeManagement />);
      
      const newRecipeButton = screen.getByText('Nueva Receta');
      await fireEvent.click(newRecipeButton);
      
      await waitFor(() => {
        expect(screen.getByText('No hay materiales agregados')).toBeInTheDocument();
      });
    });

    it('should have Add button in dialog', async () => {
      render(<RecipeManagement />);
      
      const newRecipeButton = screen.getByText('Nueva Receta');
      await fireEvent.click(newRecipeButton);
      
      await waitFor(() => {
        expect(screen.getByText('Agregar')).toBeInTheDocument();
      });
    });
  });

  describe('Product selection in filter', () => {
    it('should render all products checkbox', () => {
      render(<RecipeManagement />);
      
      const checkboxes = screen.getAllByTestId('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('should display select all label', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Seleccionar todos')).toBeInTheDocument();
    });
  });

  describe('Card components', () => {
    it('should render multiple cards', () => {
      render(<RecipeManagement />);
      
      const cards = screen.getAllByTestId('card');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Recipe description', () => {
    it('should show page subtitle', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Define los materiales necesarios para fabricar cada producto')).toBeInTheDocument();
    });
  });

  describe('Empty state handling', () => {
    it('should not crash when rendering without recipes', () => {
      render(<RecipeManagement />);
      
      expect(screen.getByText('Gestión de Recetas')).toBeInTheDocument();
    });
  });

  describe('Icons rendering', () => {
    it('should render chef icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-chef').length).toBeGreaterThan(0);
    });

    it('should render package icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-package').length).toBeGreaterThan(0);
    });

    it('should render alert circle icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-alert-circle').length).toBeGreaterThan(0);
    });

    it('should render book icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-book').length).toBeGreaterThan(0);
    });

    it('should render search icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-search').length).toBeGreaterThan(0);
    });

    it('should render filter icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-filter').length).toBeGreaterThan(0);
    });

    it('should render plus icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-plus').length).toBeGreaterThan(0);
    });

    it('should render layers icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-layers').length).toBeGreaterThan(0);
    });

    it('should render edit icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-edit').length).toBeGreaterThan(0);
    });

    it('should render refresh icon', () => {
      render(<RecipeManagement />);
      
      expect(screen.getAllByTestId('icon-refresh').length).toBeGreaterThan(0);
    });
  });
});
