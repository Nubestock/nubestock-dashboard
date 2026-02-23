import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WasteManagement from '../../src/app/components/WasteManagement';

// Mock recharts - return simple divs to avoid rendering issues
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
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  Line: () => <div data-testid="line" />,
  Pie: ({ children }: { children?: React.ReactNode }) => <div data-testid="pie">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Trash2: () => <span data-testid="trash-icon">Trash2</span>,
  TrendingDown: () => <span data-testid="trending-down-icon">TrendingDown</span>,
  TrendingUp: () => <span data-testid="trending-up-icon">TrendingUp</span>,
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
  TableCell: ({ children }: { children: React.ReactNode }) => <td>{children}</td>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
}));

describe('WasteManagement', () => {
  it('debería renderizar el título principal', () => {
    render(<WasteManagement />);
    
    expect(screen.getByText('Administración de Desperdicios')).toBeInTheDocument();
    expect(screen.getByText('Monitorea y analiza los desperdicios de producción')).toBeInTheDocument();
  });

  it('debería renderizar las tarjetas de estadísticas', () => {
    render(<WasteManagement />);
    
    expect(screen.getByText('Desperdicio Total')).toBeInTheDocument();
    expect(screen.getByText('Promedio Diario')).toBeInTheDocument();
    expect(screen.getByText('Desperdicio Hoy')).toBeInTheDocument();
    expect(screen.getByText('% vs Producción')).toBeInTheDocument();
  });

  it('debería mostrar el total de desperdicio calculado', () => {
    render(<WasteManagement />);
    
    // Total de los registros: 15 + 8 + 12 + 5 + 20 = 60
    expect(screen.getByText('60 kg')).toBeInTheDocument();
  });

  it('debería mostrar el promedio diario calculado', () => {
    render(<WasteManagement />);
    
    // Promedio: 60 / 3 = 20.0
    expect(screen.getByText('20.0 kg')).toBeInTheDocument();
  });

  it('debería renderizar el selector de período', () => {
    render(<WasteManagement />);
    
    expect(screen.getByText('Esta Semana')).toBeInTheDocument();
    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByText('Este Mes')).toBeInTheDocument();
  });

  it('debería cambiar el período seleccionado', () => {
    render(<WasteManagement />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'month' } });
    
    expect(select).toHaveValue('month');
  });

  it('debería renderizar los gráficos', () => {
    render(<WasteManagement />);
    
    expect(screen.getByText('Tendencia Semanal')).toBeInTheDocument();
    expect(screen.getByText('Desperdicios por Razón')).toBeInTheDocument();
    expect(screen.getByText('Desperdicios por Producto')).toBeInTheDocument();
    expect(screen.getByText('Top Razones de Desperdicio')).toBeInTheDocument();
  });

  it('debería renderizar componentes de recharts', () => {
    render(<WasteManagement />);
    
    expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('debería renderizar la tabla de registros', () => {
    render(<WasteManagement />);
    
    expect(screen.getByText('Registro de Desperdicios Recientes')).toBeInTheDocument();
    expect(screen.getByTestId('table')).toBeInTheDocument();
  });

  it('debería mostrar los encabezados de la tabla', () => {
    render(<WasteManagement />);
    
    expect(screen.getByText('Fecha')).toBeInTheDocument();
    expect(screen.getByText('Producto')).toBeInTheDocument();
    expect(screen.getByText('Cantidad')).toBeInTheDocument();
    expect(screen.getByText('Razón')).toBeInTheDocument();
    expect(screen.getByText('Operador')).toBeInTheDocument();
    expect(screen.getByText('Turno')).toBeInTheDocument();
  });

  it('debería mostrar los registros de desperdicio', () => {
    render(<WasteManagement />);
    
    expect(screen.getAllByText('Papitas Limón 100g').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Papitas Pollo 100g').length).toBeGreaterThan(0);
    expect(screen.getByText('Papitas Sal 100g')).toBeInTheDocument();
    expect(screen.getAllByText('Producto quemado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Empaque defectuoso').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Juan Pérez').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ana Martínez').length).toBeGreaterThan(0);
  });

  it('debería mostrar las razones de desperdicio en el resumen', () => {
    render(<WasteManagement />);
    
    // En el gráfico "Top Razones de Desperdicio"
    expect(screen.getAllByText('Producto quemado').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Empaque defectuoso').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Sabor incorrecto').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Otros/).length).toBeGreaterThan(0);
  });

  it('debería mostrar los turnos correctamente', () => {
    render(<WasteManagement />);
    
    expect(screen.getAllByText('Mañana').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Tarde').length).toBeGreaterThan(0);
  });

  it('debería mostrar íconos correctamente', () => {
    render(<WasteManagement />);
    
    expect(screen.getAllByTestId('trash-icon').length).toBeGreaterThan(0);
    expect(screen.getByTestId('trending-down-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
  });

  it('debería mostrar las estadísticas adicionales', () => {
    render(<WasteManagement />);
    
    expect(screen.getByText('23 kg')).toBeInTheDocument();
    expect(screen.getByText('1.6%')).toBeInTheDocument();
    expect(screen.getByText('Meta: <2%')).toBeInTheDocument();
    expect(screen.getByText('-8% vs semana anterior')).toBeInTheDocument();
  });

  it('debería mostrar valores de peso en la tabla', () => {
    render(<WasteManagement />);
    
    expect(screen.getAllByText('15 kg').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8 kg').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/12 kg/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('5 kg').length).toBeGreaterThan(0);
    expect(screen.getAllByText('20 kg').length).toBeGreaterThan(0);
  });
});
