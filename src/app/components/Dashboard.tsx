import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Package, Users, TrendingUp, AlertTriangle, ShoppingCart, ClipboardList, DollarSign, Archive, RefreshCw, LayoutDashboard, ArrowUpCircle, ArrowDownCircle, PackagePlus, PackageMinus } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

// Mock data para producción (hasta tener endpoint específico de tendencias de producción)
const productionData = [
  { name: 'Lun', produccion: 1200, desperdicios: 45 },
  { name: 'Mar', produccion: 1500, desperdicios: 52 },
  { name: 'Mié', produccion: 1350, desperdicios: 38 },
  { name: 'Jue', produccion: 1600, desperdicios: 48 },
  { name: 'Vie', produccion: 1450, desperdicios: 41 },
  { name: 'Sáb', produccion: 1100, desperdicios: 35 },
];

// Colores corporativos
const COLORS = ['#006A4E', '#404040', '#737373', '#a3a3a3'];

// Función para obtener el ícono de transacción según el tipo
const getTransactionIcon = (type: string, direction: string) => {
  if (type === 'SAL') {
    return <ShoppingCart className="h-4 w-4 text-[#006A4E]" />;
  }
  if (type === 'OUT' || direction === '-') {
    return <ArrowDownCircle className="h-4 w-4 text-red-600" />;
  }
  if (type === 'IN' || direction === '+') {
    return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
  }
  if (type === 'PROD') {
    return <ClipboardList className="h-4 w-4 text-blue-600" />;
  }
  return <Package className="h-4 w-4 text-gray-600" />;
};

// Función para obtener el label del tipo de transacción
const getTransactionLabel = (type: string) => {
  const types: Record<string, string> = {
    'SAL': 'Venta',
    'OUT': 'Salida',
    'IN': 'Ingreso',
    'PROD': 'Producción',
    'AJU': 'Ajuste',
    'DEV': 'Devolución',
  };
  return types[type] || type;
};

export default function Dashboard() {
  const { stats, isLoading, error, refetch } = useDashboardStats();

  // Preparar datos para el gráfico de ventas por estado
  const salesByStatusData = stats ? [
    { name: 'Pagadas', value: stats.data.sales.byStatus.paid, color: '#006A4E' },
    { name: 'Pendientes', value: stats.data.sales.byStatus.pending, color: '#737373' },
    { name: 'Vencidas', value: stats.data.sales.byStatus.overdue, color: '#dc2626' },
    { name: 'Canceladas', value: stats.data.sales.byStatus.cancelled, color: '#a3a3a3' },
  ].filter(item => item.value > 0) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006A4E] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl mb-2 text-gray-900">Dashboard</h1>
            <p className="text-gray-500">Resumen general del sistema Nutregam</p>
          </div>
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="bg-amber-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border-2 border-amber-200">
                <AlertTriangle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-gray-900 mb-2 font-semibold">Estadísticas no disponibles</h3>
              <p className="text-sm text-gray-600 mb-2 max-w-md mx-auto">
                {error || 'El endpoint de estadísticas aún no está implementado en el backend.'}
              </p>
              {error && error.includes('is_active') && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg mx-auto mt-4 text-left">
                  <p className="text-xs font-semibold text-red-800 mb-2">🔧 Solución para el equipo backend:</p>
                  <code className="text-xs bg-red-100 px-2 py-1 rounded block mb-2 text-red-900">
                    La tabla "tb_ope_transaction" no tiene la columna "is_active"
                  </code>
                  <p className="text-xs text-red-700">
                    Por favor, verificar el esquema de la base de datos o actualizar la query del endpoint <code className="bg-red-100 px-1 rounded">GET /stats</code>
                  </p>
                </div>
              )}
              {error && error.includes('no está disponible') && (
                <p className="text-xs text-gray-400 mb-4 mt-2">
                  El backend necesita implementar el endpoint <code className="bg-gray-100 px-2 py-1 rounded">GET /stats</code>
                </p>
              )}
              <Button onClick={refetch} variant="outline" size="sm" className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-1 sm:mb-2 text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-500">Resumen general del sistema Nutregam</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* KPI Cards - Fila 1: Ventas y Clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-[#006A4E]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm text-gray-600">Ventas del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              ${stats.data.sales.thisMonth.value.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600">
              {stats.data.sales.thisMonth.count} transacciones
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#006A4E]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm text-gray-600">Ventas Cobradas</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              ${stats.data.sales.paidValue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600">
              {stats.data.sales.byStatus.paid} pagadas
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#006A4E]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm text-gray-600">Por Cobrar</CardTitle>
            <ShoppingCart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              ${stats.data.sales.pendingValue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600">
              {stats.data.sales.byStatus.pending} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl">{stats.data.clients.active}</div>
            <p className="text-xs text-gray-500">
              {stats.data.clients.total} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Fila 2: Productos e Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm text-gray-600">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.data.products.active}</div>
            <p className="text-xs text-gray-600">
              {stats.data.categories.active} categorías
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm text-gray-600">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-red-600">
              {stats.data.products.lowStock}
            </div>
            <p className="text-xs text-gray-600">
              productos requieren reposición
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm text-gray-600">Valor Inventario</CardTitle>
            <Archive className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              ${stats.data.products.totalInventoryValue.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600">
              {stats.data.products.total} productos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-sm text-gray-600">Producción del Mes</CardTitle>
            <ClipboardList className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.data.production.thisMonth}</div>
            <p className="text-xs text-gray-600">
              {stats.data.production.thisYear} este año
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(stats.data.products.lowStock > 0 || stats.data.sales.byStatus.overdue > 0) && (
        <Card className="border-l-4 border-l-amber-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Alertas Activas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.data.products.lowStock > 0 && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{stats.data.products.lowStock} productos con stock bajo</p>
                  <p className="text-xs text-gray-600">Revisar inventario y solicitar reposición</p>
                </div>
              </div>
            )}
            {stats.data.sales.byStatus.overdue > 0 && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded border border-gray-200">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{stats.data.sales.byStatus.overdue} facturas vencidas</p>
                  <p className="text-xs text-gray-600">Gestionar cobros pendientes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Producción Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="name" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="produccion" stroke="#006A4E" strokeWidth={2} name="Producción (kg)" />
                <Line type="monotone" dataKey="desperdicios" stroke="#dc2626" strokeWidth={2} name="Desperdicios (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Ventas del Mes por Semana</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.data.sales.byWeek && stats.data.sales.byWeek.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.data.sales.byWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis dataKey="week_label" stroke="#737373" />
                  <YAxis stroke="#737373" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'value' ? `$${value.toFixed(2)}` : value,
                      name === 'value' ? 'Monto' : name
                    ]}
                    labelFormatter={(label) => label}
                  />
                  <Legend formatter={(value) => value === 'value' ? 'Ventas ($)' : value === 'count' ? 'Cantidad' : value} />
                  <Bar dataKey="value" fill="#006A4E" name="value" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 text-sm">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No hay datos de ventas este mes</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Ventas por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={salesByStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {salesByStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-gray-900">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.data.transactions.recent && stats.data.transactions.recent.length > 0 ? (
              <div className="space-y-3">
                {stats.data.transactions.recent.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center gap-3 ${index < stats.data.transactions.recent.length - 1 ? 'pb-3 border-b border-gray-200' : ''}`}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {getTransactionIcon(transaction.type, transaction.direction)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {getTransactionLabel(transaction.type)} - {transaction.product_name}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {transaction.user_name} · {transaction.direction}{transaction.quantity.toFixed(2)} kg
                        {transaction.has_waste && ' · Con desperdicio'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDistanceToNow(new Date(transaction.creation_date), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm">
                <ClipboardList className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No hay actividad reciente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}