import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type WasteRecord = {
  id: string;
  date: string;
  product: string;
  quantity: number;
  reason: string;
  operator: string;
  shift: string;
};

export default function WasteManagement() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const wasteRecords: WasteRecord[] = [
    {
      id: '1',
      date: '2025-12-27',
      product: 'Papitas Limón 100g',
      quantity: 15,
      reason: 'Producto quemado',
      operator: 'Juan Pérez',
      shift: 'Mañana',
    },
    {
      id: '2',
      date: '2025-12-27',
      product: 'Papitas Pollo 100g',
      quantity: 8,
      reason: 'Empaque defectuoso',
      operator: 'Ana Martínez',
      shift: 'Tarde',
    },
    {
      id: '3',
      date: '2025-12-26',
      product: 'Papitas Limón 100g',
      quantity: 12,
      reason: 'Sabor incorrecto',
      operator: 'Pedro Sánchez',
      shift: 'Mañana',
    },
    {
      id: '4',
      date: '2025-12-26',
      product: 'Papitas Sal 100g',
      quantity: 5,
      reason: 'Producto quemado',
      operator: 'Juan Pérez',
      shift: 'Mañana',
    },
    {
      id: '5',
      date: '2025-12-25',
      product: 'Papitas Pollo 100g',
      quantity: 20,
      reason: 'Empaque defectuoso',
      operator: 'Ana Martínez',
      shift: 'Tarde',
    },
  ];

  const weeklyData = [
    { name: 'Lun', desperdicio: 45 },
    { name: 'Mar', desperdicio: 52 },
    { name: 'Mié', desperdicio: 38 },
    { name: 'Jue', desperdicio: 48 },
    { name: 'Vie', desperdicio: 41 },
    { name: 'Sáb', desperdicio: 35 },
    { name: 'Dom', desperdicio: 28 },
  ];

  const wasteByReason = [
    { name: 'Producto quemado', value: 35, color: '#ef4444' },
    { name: 'Empaque defectuoso', value: 28, color: '#f97316' },
    { name: 'Sabor incorrecto', value: 12, color: '#eab308' },
    { name: 'Otros', value: 10, color: '#6b7280' },
  ];

  const wasteByProduct = [
    { name: 'Papitas Limón', value: 42 },
    { name: 'Papitas Pollo', value: 38 },
    { name: 'Papitas Sal', value: 18 },
    { name: 'Otros', value: 12 },
  ];

  const totalWaste = wasteRecords.reduce((sum, record) => sum + record.quantity, 0);
  const averageWastePerDay = totalWaste / 3;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl mb-2">Administración de Desperdicios</h1>
          <p className="text-gray-600">Monitorea y analiza los desperdicios de producción</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Esta Semana</SelectItem>
            <SelectItem value="month">Este Mes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Desperdicio Total</CardTitle>
            <Trash2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalWaste} kg</div>
            <p className="text-xs text-gray-500">Últimos 3 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Promedio Diario</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{averageWastePerDay.toFixed(1)} kg</div>
            <p className="text-xs text-green-600">-8% vs semana anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Desperdicio Hoy</CardTitle>
            <Trash2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">23 kg</div>
            <p className="text-xs text-gray-500">2 registros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">% vs Producción</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">1.6%</div>
            <p className="text-xs text-green-600">Meta: &lt;2%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="desperdicio" stroke="#ef4444" strokeWidth={2} name="Desperdicio (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desperdicios por Razón</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={wasteByReason}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {wasteByReason.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Desperdicios por Producto</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wasteByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#f97316" name="Desperdicio (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Razones de Desperdicio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wasteByReason.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{item.name}</span>
                    <span className="text-sm">{item.value} kg</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(item.value / 85) * 100}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waste Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Desperdicios Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Razón</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Turno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wasteRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString('es-EC')}</TableCell>
                  <TableCell>{record.product}</TableCell>
                  <TableCell>{record.quantity} kg</TableCell>
                  <TableCell>{record.reason}</TableCell>
                  <TableCell>{record.operator}</TableCell>
                  <TableCell>{record.shift}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
