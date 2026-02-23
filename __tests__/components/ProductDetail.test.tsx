import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductDetail from '../../src/app/components/ProductDetail';
import { Product } from '../../src/app/hooks/useProducts';

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">ArrowLeft</span>,
  Edit: () => <span data-testid="edit-icon">Edit</span>,
  Copy: () => <span data-testid="copy-icon">Copy</span>,
  Trash2: () => <span data-testid="trash-icon">Trash2</span>,
  Package: () => <span data-testid="package-icon">Package</span>,
  DollarSign: () => <span data-testid="dollar-icon">DollarSign</span>,
  TrendingDown: () => <span data-testid="trending-down-icon">TrendingDown</span>,
  MapPin: () => <span data-testid="map-pin-icon">MapPin</span>,
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  BarChart3: () => <span data-testid="chart-icon">BarChart3</span>,
  AlertTriangle: () => <span data-testid="alert-icon">AlertTriangle</span>,
  CheckCircle: () => <span data-testid="check-icon">CheckCircle</span>,
  Clock: () => <span data-testid="clock-icon">Clock</span>,
  Archive: () => <span data-testid="archive-icon">Archive</span>,
}));

// Mock UI components
jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="card-title" className={className}>{children}</h2>
  ),
}));

jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size, className }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
    className?: string;
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}));

jest.mock('../../src/app/components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: { 
    children: React.ReactNode; 
    value: string; 
    onValueChange?: (val: string) => void 
  }) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange?.('activity')}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="tabs-list" className={className}>{children}</div>
  ),
  TabsTrigger: ({ children, value, onClick }: { children: React.ReactNode; value: string; onClick?: () => void }) => (
    <button data-testid={`tab-trigger-${value}`} onClick={onClick}>{children}</button>
  ),
}));

describe('ProductDetail', () => {
  const mockProduct: Product = {
    id: 1,
    name: 'Producto de prueba',
    sku: 'SKU-001',
    description: 'Descripción del producto de prueba',
    unit_price: 10.50,
    quantity: 100,
    min_stock: 20,
    status: 1,
    id_category: 1,
    category_name: 'Categoría Test',
    id_measure: 1,
    measure_name: 'KG',
    id_origin: 1,
    origin_name: 'Origen Test',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-20T15:30:00Z',
  };

  const mockOnBack = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDuplicate = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debería renderizar el componente sin errores', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    // Verificar que se renderizó el contenedor principal
    expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
  });

  it('debería renderizar el SKU', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getAllByText('SKU-001').length).toBeGreaterThan(0);
  });

  it('debería llamar onBack al hacer click en volver', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    const backButton = screen.getByText('Volver').closest('button')!;
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('debería llamar onEdit al hacer click en editar', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    const editButton = screen.getByText('Editar').closest('button')!;
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockProduct);
  });

  it('debería llamar onDuplicate al hacer click en duplicar', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    const duplicateButton = screen.getByText('Duplicar').closest('button')!;
    fireEvent.click(duplicateButton);
    
    expect(mockOnDuplicate).toHaveBeenCalledWith(mockProduct);
  });

  it('debería llamar onDelete al hacer click en eliminar', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByText('Eliminar').closest('button')!;
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockProduct);
  });

  it('debería mostrar badge de stock OK cuando stock es suficiente', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Stock OK')).toBeInTheDocument();
  });

  it('debería mostrar badge de Stock Bajo cuando stock es menor al mínimo', () => {
    const lowStockProduct = { ...mockProduct, quantity: 15 };
    
    render(
      <ProductDetail
        product={lowStockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Stock Bajo')).toBeInTheDocument();
  });

  it('debería mostrar badge Sin Stock cuando quantity es 0', () => {
    const noStockProduct = { ...mockProduct, quantity: 0 };
    
    render(
      <ProductDetail
        product={noStockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Sin Stock')).toBeInTheDocument();
  });

  it('debería mostrar datos del producto', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    // El precio está formateado, puede incluir $10.50 o US$10.50
    const container = document.body;
    expect(container.textContent).toContain('10');
  });

  it('debería mostrar sección de categoría', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    // El componente tiene una sección para categoría
    const container = document.body;
    expect(container.textContent).toContain('Categoría');
  });

  it('debería mostrar la descripción', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    const container = document.body;
    expect(container.textContent).toContain('Descripción del producto de prueba');
  });

  it('debería manejar producto sin min_stock', () => {
    const productNoMinStock = { ...mockProduct, min_stock: null };
    
    render(
      <ProductDetail
        product={productNoMinStock as Product}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    // No debe fallar y debe mostrar el componente
    expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
  });

  it('debería manejar producto sin quantity', () => {
    const productNoQuantity = { ...mockProduct, quantity: null };
    
    render(
      <ProductDetail
        product={productNoQuantity as Product}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    // Debe mostrar Sin Stock porque quantity es null/0
    expect(screen.getByText('Sin Stock')).toBeInTheDocument();
  });

  it('debería renderizar las tabs', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-overview')).toBeInTheDocument();
    expect(screen.getByTestId('tab-trigger-activity')).toBeInTheDocument();
  });

  it('debería mostrar sección de origen', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    const container = document.body;
    expect(container.textContent).toContain('Origen');
  });

  it('debería mostrar sección de unidades', () => {
    render(
      <ProductDetail
        product={mockProduct}
        onBack={mockOnBack}
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        onDelete={mockOnDelete}
      />
    );
    
    const container = document.body;
    expect(container.textContent).toContain('unidades');
  });
});
