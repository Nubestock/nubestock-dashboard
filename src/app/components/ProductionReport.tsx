import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ClipboardList, Package, TrendingUp, Users, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ProductionRecord = {
  id: string;
  date: string;
  product: string;
  plannedQuantity: number;
  actualQuantity: number;
  operator: string;
  shift: string;
  confirmed: boolean;
};

export default function ProductionReport() {
  const [selectedDate, setSelectedDate] = useState('today');
  const [selectedProduct, setSelectedProduct] = useState('all');

  const productionRecords: ProductionRecord[] = [
    {
      id: '1',
      date: '2025-12-27',
      product: 'Papitas Limón 100g',
      plannedQuantity: 500,
      actualQuantity: 485,
      operator: 'Juan Pérez',
      shift: 'Mañana',
      confirmed: true,
    },
    {
      id: '2',
      date: '2025-12-27',
      product: 'Papitas Pollo 100g',
      plannedQuantity: 450,
      actualQuantity: 460,
      operator: 'Ana Martínez',
      shift: 'Tarde',
      confirmed: true,
    },
    {
      id: '3',
      date: '2025-12-27',
      product: 'Papitas Sal 100g',
      plannedQuantity: 350,
      actualQuantity: 340,
      operator: 'Pedro Sánchez',
      shift: 'Mañana',
      confirmed: false,
    },
    {
      id: '4',
      date: '2025-12-26',
      product: 'Papitas Limón 100g',
      plannedQuantity: 500,
      actualQuantity: 490,
      operator: 'Juan Pérez',
      shift: 'Mañana',
      confirmed: true,
    },
    {
      id: '5',
      date: '2025-12-26',
      product: 'Papitas Pollo 100g',
      plannedQuantity: 450,
      actualQuantity: 445,
      operator: 'Ana Martínez',
      shift: 'Tarde',
      confirmed: true,
    },
  ];

  const weeklyProductionData = [
    { date: 'Lun', produccion: 1200, meta: 1300 },
    { date: 'Mar', produccion: 1500, meta: 1400 },
    { date: 'Mié', produccion: 1350, meta: 1400 },
    { date: 'Jue', produccion: 1600, meta: 1500 },
    { date: 'Vie', produccion: 1450, meta: 1400 },
    { date: 'Sáb', produccion: 1100, meta: 1200 },
  ];

  const productionByProduct = [
    { product: 'Papitas Limón', produccion: 975 },
    { product: 'Papitas Pollo', produccion: 905 },
    { product: 'Papitas Sal', produccion: 340 },
  ];

  const todayRecords = productionRecords.filter(r => r.date === '2025-12-27');
  const yesterdayRecords = productionRecords.filter(r => r.date === '2025-12-26');

  const todayTotal = todayRecords.reduce((sum, r) => sum + r.actualQuantity, 0);
  const yesterdayTotal = yesterdayRecords.reduce((sum, r) => sum + r.actualQuantity, 0);
  const todayPlanned = todayRecords.reduce((sum, r) => sum + r.plannedQuantity, 0);

  const efficiencyRate = ((todayTotal / todayPlanned) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl mb-2">Reporte de Producción Diaria</h1>
          <p className="text-gray-600">Monitorea la producción diaria de la planta</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoy</SelectItem>
              <SelectItem value="yesterday">Ayer</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Productos</SelectItem>
              <SelectItem value="limon">Papitas Limón</SelectItem>
              <SelectItem value="pollo">Papitas Pollo</SelectItem>
              <SelectItem value="sal">Papitas Sal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Producción Hoy</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{todayTotal} kg</div>
            <p className="text-xs text-gray-500">Meta: {todayPlanned} kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Producción Ayer</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{yesterdayTotal} kg</div>
            <p className="text-xs text-gray-500">
              {todayTotal > yesterdayTotal ? '+' : ''}
              {((todayTotal - yesterdayTotal) / yesterdayTotal * 100).toFixed(1)}% vs hoy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Eficiencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{efficiencyRate}%</div>
            <p className="text-xs text-green-600">Meta: 95%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Operadores Activos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{new Set(todayRecords.map(r => r.operator)).size}</div>
            <p className="text-xs text-gray-500">{todayRecords.length} registros</p>
          </CardContent>
        </Card>
      </div>

      {/* Production Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparativa Hoy vs Ayer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Producción Hoy</span>
                  <span className="text-sm">{todayTotal} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full"
                    style={{ width: `${(todayTotal / todayPlanned) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Producción Ayer</span>
                  <span className="text-sm">{yesterdayTotal} kg</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-500 h-3 rounded-full"
                    style={{ width: `${(yesterdayTotal / todayPlanned) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t space-y-3">
                <h3 className="text-sm">Detalle por Producto - Hoy</h3>
                {todayRecords.map((record) => (
                  <div key={record.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">{record.product}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">
                        {record.actualQuantity} / {record.plannedQuantity} kg
                      </span>
                      {record.confirmed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Producción Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={weeklyProductionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="produccion" stroke="#f97316" strokeWidth={2} name="Producción Real (kg)" />
                <Line type="monotone" dataKey="meta" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Meta (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Production by Product */}
      <Card>
        <CardHeader>
          <CardTitle>Producción por Producto (Últimos 2 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productionByProduct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="produccion" fill="#f97316" name="Producción (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Production Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro Detallado de Producción</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Meta</TableHead>
                <TableHead>Producido</TableHead>
                <TableHead>Cumplimiento</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionRecords.map((record) => {
                const compliance = (record.actualQuantity / record.plannedQuantity * 100).toFixed(1);
                return (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.date).toLocaleDateString('es-EC')}</TableCell>
                    <TableCell>{record.product}</TableCell>
                    <TableCell>{record.plannedQuantity} kg</TableCell>
                    <TableCell>{record.actualQuantity} kg</TableCell>
                    <TableCell>
                      <span className={parseFloat(compliance) >= 95 ? 'text-green-600' : 'text-yellow-600'}>
                        {compliance}%
                      </span>
                    </TableCell>
                    <TableCell>{record.operator}</TableCell>
                    <TableCell>{record.shift}</TableCell>
                    <TableCell>
                      {record.confirmed ? (
                        <Badge className="bg-green-500">Confirmado</Badge>
                      ) : (
                        <Badge className="bg-yellow-500">Pendiente</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Operator Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Rendimiento por Operador - Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from(new Set(todayRecords.map(r => r.operator))).map((operator) => {
              const operatorRecords = todayRecords.filter(r => r.operator === operator);
              const total = operatorRecords.reduce((sum, r) => sum + r.actualQuantity, 0);
              const planned = operatorRecords.reduce((sum, r) => sum + r.plannedQuantity, 0);
              const efficiency = ((total / planned) * 100).toFixed(1);

              return (
                <div key={operator} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-sm">{operator}</h3>
                      <p className="text-xs text-gray-500">{operatorRecords.length} producto(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{total} kg producidos</p>
                      <p className="text-xs text-gray-500">Meta: {planned} kg</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${parseFloat(efficiency) >= 95 ? 'bg-green-500' : 'bg-yellow-500'}`}
                      style={{ width: `${Math.min(parseFloat(efficiency), 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Eficiencia: {efficiency}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
