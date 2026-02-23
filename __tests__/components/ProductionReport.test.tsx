import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductionReport from '../../src/app/components/ProductionReport';

// Mock recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  LineChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ClipboardList: () => <span data-testid="clipboard-icon">ClipboardList</span>,
  Package: () => <span data-testid="package-icon">Package</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">TrendingUp</span>,
  Users: () => <span data-testid="users-icon">Users</span>,
  CheckCircle: () => <span data-testid="check-icon">CheckCircle</span>,
  XCircle: () => <span data-testid="x-icon">XCircle</span>,
}));

// Mock UI components
jest.mock('../../src/app/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <h2 data-testid="card-title" className={className}>{children}</h2>
  ),
}));

jest.mock('../../src/app/components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
  }) => (
    <button onClick={onClick} data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

jest.mock('../../src/app/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: { 
    children: React.ReactNode; 
    value: string; 
    onValueChange: (val: string) => void 
  }) => (
    <div data-testid="select" data-value={value}>
      <select onChange={(e) => onValueChange(e.target.value)} value={value}>
        {children}
      </select>
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <option value={value}>{children}</option>
  ),
  SelectTrigger: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={className}>{children}</span>
  ),
  SelectValue: () => null,
}));

jest.mock('../../src/app/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table data-testid="table">{children}</table>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableCell: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <td className={className}>{children}</td>
  ),
  TableHead: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <th className={className}>{children}</th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

jest.mock('../../src/app/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode; variant?: string; className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  ),
}));

describe('ProductionReport', () => {
  it('debería renderizar el título principal', () => {
    render(<ProductionReport />);
    
    expect(screen.getByText('Reporte de Producción Diaria')).toBeInTheDocument();
    expect(screen.getByText('Monitorea la producción diaria de la planta')).toBeInTheDocument();
  });

  it('debería renderizar las tarjetas de estadísticas', () => {
    render(<ProductionReport />);
    
    expect(screen.getAllByText('Producción Hoy').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Producción Ayer').length).toBeGreaterThan(0);
    expect(screen.getByText('Eficiencia')).toBeInTheDocument();
    expect(screen.getByText('Operadores Activos')).toBeInTheDocument();
  });

  it('debería renderizar el selector de fecha', () => {
    render(<ProductionReport />);
    
    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Ayer')).toBeInTheDocument();
    expect(screen.getByText('Esta Semana')).toBeInTheDocument();
  });

  it('debería renderizar el selector de producto', () => {
    render(<ProductionReport />);
    
    expect(screen.getByText('Todos los Productos')).toBeInTheDocument();
  });

  it('debería cambiar el filtro de fecha', () => {
    render(<ProductionReport />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'yesterday' } });
    
    expect(selects[0]).toHaveValue('yesterday');
  });

  it('debería cambiar el filtro de producto', () => {
    render(<ProductionReport />);
    
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'limon' } });
    
    expect(selects[1]).toHaveValue('limon');
  });

  it('debería renderizar los gráficos', () => {
    render(<ProductionReport />);
    
    expect(screen.getByText('Producción Semanal')).toBeInTheDocument();
    expect(screen.getByText('Comparativa Hoy vs Ayer')).toBeInTheDocument();
    expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
  });

  it('debería renderizar la tabla de registros', () => {
    render(<ProductionReport />);
    
    expect(screen.getByText('Detalle por Producto - Hoy')).toBeInTheDocument();
  });

  it('debería mostrar los productos del día', () => {
    render(<ProductionReport />);
    
    // Muestra productos del día en el detalle
    expect(screen.getAllByText(/Papitas/).length).toBeGreaterThan(0);
  });

  it('debería mostrar los registros de producción', () => {
    render(<ProductionReport />);
    
    expect(screen.getAllByText('Papitas Limón 100g').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Papitas Pollo 100g').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Papitas Sal 100g').length).toBeGreaterThan(0);
  });

  it('debería mostrar íconos de check y x para confirmados', () => {
    render(<ProductionReport />);
    
    // Los registros confirmados muestran check, los no confirmados muestran x
    expect(screen.getAllByTestId('check-icon').length).toBeGreaterThan(0);
  });

  it('debería mostrar la cantidad de operadores activos', () => {
    render(<ProductionReport />);
    
    // Los datos tienen 3 operadores únicos para hoy: Juan, Ana, Pedro
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('debería mostrar el porcentaje de eficiencia', () => {
    render(<ProductionReport />);
    
    // Eficiencia: (485+460+340) / (500+450+350) * 100 = 98.8%
    expect(screen.getByText('98.8%')).toBeInTheDocument();
  });

  it('debería mostrar la variación respecto a ayer', () => {
    render(<ProductionReport />);
    
    // Today: 1285, Yesterday: 935
    // Variation: ((1285-935)/935)*100 = 37.4%
    expect(screen.getByText(/37\.4%/)).toBeInTheDocument();
  });
});
