import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2, 
  Package, 
  DollarSign, 
  TrendingDown,
  MapPin,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive
} from 'lucide-react';
import { Product } from '../hooks/useProducts';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onEdit: (product: Product) => void;
  onDuplicate: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function ProductDetail({ 
  product, 
  onBack, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Calcular estadísticas
  const stockPercentage = (product.min_stock ?? 0) > 0 
    ? Math.round(((product.quantity ?? 0) / (product.min_stock ?? 0)) * 100)
    : 100;
  
  const stockStatus = (product.quantity ?? 0) === 0 
    ? 'out' 
    : (product.quantity ?? 0) < (product.min_stock ?? 0) 
      ? 'low' 
      : 'good';

  const getStockStatusBadge = () => {
    switch (stockStatus) {
      case 'out':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Sin Stock</Badge>;
      case 'low':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 gap-1"><TrendingDown className="h-3 w-3" /> Stock Bajo</Badge>;
      default:
        return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><CheckCircle className="h-3 w-3" /> Stock OK</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Datos de ejemplo para actividad reciente
  const recentActivity = [
    {
      id: '1',
      type: 'stock_adjustment',
      description: 'Ajuste de inventario: +500 unidades',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Admin Sistema',
    },
    {
      id: '2',
      type: 'price_change',
      description: `Cambio de precio: $0.17 → $${product.unit_price}`,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Admin Sistema',
    },
    {
      id: '3',
      type: 'production',
      description: 'Producción registrada: 1000 unidades',
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      user: 'Operador Producción',
    },
  ];

  // Datos de ejemplo para ventas
  const salesData = [
    { month: 'Ene', units: 450 },
    { month: 'Feb', units: 520 },
    { month: 'Mar', units: 380 },
    { month: 'Abr', units: 610 },
    { month: 'May', units: 490 },
    { month: 'Jun', units: 550 },
  ];

  const totalSales = salesData.reduce((sum, item) => sum + item.units, 0);
  const averageSales = Math.round(totalSales / salesData.length);

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl">{product.product_name}</h1>
              {getStockStatusBadge()}
              {!product.isactive && (
                <Badge variant="outline" className="gap-1">
                  <Archive className="h-3 w-3" />
                  Inactivo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <code className="bg-gray-100 px-2 py-1 rounded">{product.sku}</code>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {product.full_location}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onDuplicate(product)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(product)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => onDelete(product)}>
            <Trash2 className="h-4 w-4 mr-2 text-red-600" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Precio Unitario</p>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(product.unit_price)}</div>
          </CardContent>
        </Card>

        <Card className={stockStatus === 'out' ? 'border-red-300 bg-red-50' : stockStatus === 'low' ? 'border-yellow-300 bg-yellow-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Stock Actual</p>
              <Package className={`h-5 w-5 ${stockStatus === 'out' ? 'text-red-500' : stockStatus === 'low' ? 'text-yellow-500' : 'text-green-500'}`} />
            </div>
            <div className="text-2xl font-bold">{(product.quantity ?? 0).toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">
              Mínimo: {(product.min_stock ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Nivel de Stock</p>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stockPercentage}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  stockStatus === 'out' ? 'bg-red-500' : 
                  stockStatus === 'low' ? 'bg-yellow-500' : 
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Valor en Stock</p>
              <DollarSign className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency((product.quantity ?? 0) * (product.unit_price ?? 0))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {(product.quantity ?? 0).toLocaleString()} unidades
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs con información detallada */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Información General</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="activity">Actividad</TabsTrigger>
        </TabsList>

        {/* Tab: Información General */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalles del Producto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nombre</label>
                  <p className="mt-1">{product.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">SKU</label>
                  <p className="mt-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {product.sku}
                    </code>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción</label>
                  <p className="mt-1 text-gray-700">{product.description || 'Sin descripción'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Categoría</label>
                  <p className="mt-1">
                    <Badge variant="outline">{product.namecategory}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Origen</label>
                  <p className="mt-1">
                    <Badge variant="outline">{product.nameorigin}</Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <p className="mt-1">
                    <Badge className={product.isactive ? 'bg-green-500' : 'bg-gray-500'}>
                      {product.isactive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Precios e Inventario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Precio Unitario</label>
                  <p className="mt-1 text-2xl font-bold text-green-600">
                    {formatCurrency(product.unit_price)}
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-gray-600">Stock Actual</label>
                  <p className="mt-1 text-2xl font-bold">
                    {(product.quantity ?? 0).toLocaleString()} unidades
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Stock Mínimo</label>
                  <p className="mt-1 text-xl">
                    {(product.min_stock ?? 0).toLocaleString()} unidades
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Déficit/Excedente</label>
                  <p className={`mt-1 text-xl font-medium ${
                    (product.quantity ?? 0) < (product.min_stock ?? 0) ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {(product.quantity ?? 0) >= (product.min_stock ?? 0) ? '+' : ''}
                    {((product.quantity ?? 0) - (product.min_stock ?? 0)).toLocaleString()} unidades
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación y Origen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">País</label>
                  <p className="mt-1">{product.country_name || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Provincia</label>
                  <p className="mt-1">{product.province_name || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ciudad</label>
                  <p className="mt-1">{product.city_name || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ubicación Completa</label>
                  <p className="mt-1">{product.full_location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Fecha de Creación</label>
                <p className="mt-1 text-sm">{formatDate(product.creationdate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Última Modificación</label>
                <p className="mt-1 text-sm">{formatDate(product.modificationdate)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Inventario */}
        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stock Disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(product.quantity ?? 0).toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-1">unidades disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Stock Mínimo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{(product.min_stock ?? 0).toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-1">nivel de reorden</p>
              </CardContent>
            </Card>

            <Card className={(product.quantity ?? 0) < (product.min_stock ?? 0) ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}>
              <CardHeader>
                <CardTitle className="text-sm">Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stockPercentage}%
                </div>
                <p className="text-sm text-gray-500 mt-1">del mínimo requerido</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Movimientos de Inventario Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Entrada de producción</p>
                      <p className="text-sm text-gray-600">Hace 2 días</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+500</p>
                    <p className="text-sm text-gray-500">unidades</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Venta a cliente</p>
                      <p className="text-sm text-gray-600">Hace 3 días</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">-250</p>
                    <p className="text-sm text-gray-500">unidades</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Ajuste de inventario</p>
                      <p className="text-sm text-gray-600">Hace 5 días</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">+50</p>
                    <p className="text-sm text-gray-500">unidades</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Ventas */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Vendido (6 meses)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalSales.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-1">unidades</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Promedio Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{averageSales.toLocaleString()}</div>
                <p className="text-sm text-gray-500 mt-1">unidades/mes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ingresos Estimados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatCurrency(totalSales * product.unit_price)}
                </div>
                <p className="text-sm text-gray-500 mt-1">últimos 6 meses</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ventas Mensuales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {salesData.map((data, index) => {
                  const maxValue = Math.max(...salesData.map(d => d.units));
                  const percentage = (data.units / maxValue) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{data.month}</span>
                        <span className="text-sm text-gray-600">{data.units} unidades</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Actividad */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historial de Actividad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="w-px h-full bg-gray-200 mt-2"></div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>{new Date(activity.date).toLocaleDateString('es-EC')}</span>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}