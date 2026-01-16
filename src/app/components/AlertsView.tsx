import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AlertTriangle, Package, Bell, RefreshCw, CheckCircle, Eye, ShoppingCart, ArrowUpRight, TrendingDown, Search, Filter, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useAlerts } from '../hooks/useAlerts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface AlertsViewProps {
  onViewProduct?: (productId: string) => void;
}

export default function AlertsView({ onViewProduct }: AlertsViewProps) {
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  const { alerts, isLoading, error, refetch } = useAlerts(showActiveOnly);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50 text-xs">Crítica</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50 text-xs">Alta</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50 text-xs">Media</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Baja</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50 text-xs">Requiere Atención</Badge>;
      case 'acknowledged':
        return <Badge variant="outline" className="border-blue-500 text-blue-700 bg-blue-50 text-xs">En Revisión</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 text-xs">Resuelta</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleAcknowledge = (alertId: string) => {
    toast.success('Alerta marcada como en revisión');
    refetch();
  };

  const handleResolve = (alertId: string) => {
    toast.success('Alerta resuelta correctamente');
    refetch();
  };

  const handleViewProduct = (productId: string) => {
    toast.info('Abriendo detalles del producto...');
    if (onViewProduct) {
      onViewProduct(productId);
    }
  };

  const handleCreateOrder = () => {
    toast.info('Generando orden de producción...');
  };

  // Agrupar alertas por tipo
  const stockAlerts = alerts.filter(a => a.alert_type === 'stock_low' || a.alert_type === 'stock_critical');
  const maintenanceAlerts = alerts.filter(a => a.alert_type === 'maintenance');
  const paymentAlerts = alerts.filter(a => a.alert_type === 'payment');
  const productionAlerts = alerts.filter(a => a.alert_type === 'production');

  // Estadísticas
  const activeAlerts = alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = alerts.filter(a => a.status === 'acknowledged');
  const criticalCount = alerts.filter(a => a.priority === 'critical' || a.priority === 'high').length;

  // Extraer información del producto del mensaje
  const extractProductInfo = (alert: any) => {
    const nameMatch = alert.alert_message.match(/"([^"]+)"/);
    const productName = nameMatch ? nameMatch[1] : 'Producto';
    
    const skuMatch = alert.alert_message.match(/SKU:\s*([^\)]+)/);
    const sku = skuMatch ? skuMatch[1] : 'N/A';
    
    const stockMatch = alert.alert_message.match(/Stock actual:\s*(\d+)/);
    const currentStock = stockMatch ? parseInt(stockMatch[1]) : 0;
    
    const minMatch = alert.alert_message.match(/Mínimo requerido:\s*(\d+)/);
    const minRequired = minMatch ? parseInt(minMatch[1]) : 0;
    
    const deficit = minRequired - currentStock;
    
    return { productName, sku, currentStock, minRequired, deficit };
  };

  // Formatear fecha relativa
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    return date.toLocaleDateString('es-EC', { month: 'short', day: 'numeric' });
  };

  // Filtrar alertas por búsqueda y prioridad
  const filteredAlerts = (alertsList: any[]) => {
    return alertsList.filter(alert => {
      const matchesSearch = searchTerm === '' || 
        alert.alert_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.alert_message.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
      
      return matchesSearch && matchesPriority;
    });
  };

  const hasActiveFilters = priorityFilter !== 'all';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl text-neutral-900">Centro de Alertas</h1>
            <p className="text-sm text-neutral-600 mt-1">Monitoreo y gestión de alertas del sistema</p>
          </div>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar alerta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Filtros Sheet */}
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="h-9 sm:h-10 px-3 relative"
              >
                <Filter className="h-4 w-4" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#006A4E] rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filtrar Alertas</SheetTitle>
                <SheetDescription>
                  Filtra las alertas por prioridad
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Prioridad</h3>
                  <Button
                    variant={priorityFilter === 'all' ? 'default' : 'outline'}
                    className={`w-full justify-start ${priorityFilter === 'all' ? 'bg-[#006A4E]' : ''}`}
                    size="sm"
                    onClick={() => {
                      setPriorityFilter('all');
                      setIsFiltersOpen(false);
                    }}
                  >
                    Todas las prioridades
                  </Button>
                  <Button
                    variant={priorityFilter === 'critical' ? 'default' : 'outline'}
                    className={`w-full justify-start ${priorityFilter === 'critical' ? 'bg-[#006A4E]' : ''}`}
                    size="sm"
                    onClick={() => {
                      setPriorityFilter('critical');
                      setIsFiltersOpen(false);
                    }}
                  >
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Críticas
                  </Button>
                  <Button
                    variant={priorityFilter === 'high' ? 'default' : 'outline'}
                    className={`w-full justify-start ${priorityFilter === 'high' ? 'bg-[#006A4E]' : ''}`}
                    size="sm"
                    onClick={() => {
                      setPriorityFilter('high');
                      setIsFiltersOpen(false);
                    }}
                  >
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    Altas
                  </Button>
                  <Button
                    variant={priorityFilter === 'medium' ? 'default' : 'outline'}
                    className={`w-full justify-start ${priorityFilter === 'medium' ? 'bg-[#006A4E]' : ''}`}
                    size="sm"
                    onClick={() => {
                      setPriorityFilter('medium');
                      setIsFiltersOpen(false);
                    }}
                  >
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                    Medias
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            onClick={refetch}
            variant="outline" 
            size="sm"
            className="h-9 sm:h-10 px-3"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Estadísticas - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className={`border-neutral-200 ${criticalCount > 0 ? 'border-red-300 bg-red-50' : ''}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Urgentes</p>
              <div className="flex items-end justify-between">
                <span className={`text-xl sm:text-2xl font-bold ${criticalCount > 0 ? 'text-red-600' : 'text-neutral-900'}`}>
                  {criticalCount}
                </span>
                <AlertTriangle className={`h-5 w-5 sm:h-6 sm:w-6 ${criticalCount > 0 ? 'text-red-500' : 'text-neutral-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border-neutral-200 ${stockAlerts.length > 0 ? 'border-orange-300 bg-orange-50' : ''}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Stock Bajo</p>
              <div className="flex items-end justify-between">
                <span className={`text-xl sm:text-2xl font-bold ${stockAlerts.length > 0 ? 'text-orange-600' : 'text-neutral-900'}`}>
                  {stockAlerts.length}
                </span>
                <Package className={`h-5 w-5 sm:h-6 sm:w-6 ${stockAlerts.length > 0 ? 'text-orange-500' : 'text-neutral-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border-neutral-200 ${acknowledgedAlerts.length > 0 ? 'border-blue-300 bg-blue-50' : ''}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">En Revisión</p>
              <div className="flex items-end justify-between">
                <span className={`text-xl sm:text-2xl font-bold ${acknowledgedAlerts.length > 0 ? 'text-blue-600' : 'text-neutral-900'}`}>
                  {acknowledgedAlerts.length}
                </span>
                <Eye className={`h-5 w-5 sm:h-6 sm:w-6 ${acknowledgedAlerts.length > 0 ? 'text-blue-500' : 'text-neutral-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Total</p>
              <div className="flex items-end justify-between">
                <span className="text-xl sm:text-2xl font-bold text-neutral-900">{alerts.length}</span>
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensaje de error */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006A4E] mx-auto mb-3"></div>
            <p className="text-sm text-neutral-600">Cargando alertas...</p>
          </div>
        </div>
      )}

      {/* Sin alertas */}
      {!isLoading && alerts.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <h3 className="text-lg font-medium text-neutral-900 mb-1">¡Todo en orden!</h3>
              <p className="text-sm text-neutral-500">No hay alertas activas en este momento</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs por categoría */}
      {!isLoading && alerts.length > 0 && (
        <Tabs defaultValue="stock" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
            <TabsTrigger value="stock" className="text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Stock</span>
              <span className="sm:hidden">Stock</span>
              {stockAlerts.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-orange-500 text-white text-xs h-5 min-w-[20px] px-1">
                  {stockAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Mantenimiento</span>
              <span className="sm:hidden">Mtto</span>
              {maintenanceAlerts.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-blue-500 text-white text-xs h-5 min-w-[20px] px-1">
                  {maintenanceAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payment" className="text-xs sm:text-sm py-2">
              Pagos
              {paymentAlerts.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-purple-500 text-white text-xs h-5 min-w-[20px] px-1">
                  {paymentAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="production" className="text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Producción</span>
              <span className="sm:hidden">Prod</span>
              {productionAlerts.length > 0 && (
                <Badge className="ml-1 sm:ml-2 bg-green-500 text-white text-xs h-5 min-w-[20px] px-1">
                  {productionAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm py-2 col-span-2 sm:col-span-1">
              Todas ({alerts.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab: Alertas de Stock */}
          <TabsContent value="stock" className="space-y-3">
            {filteredAlerts(stockAlerts).length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Package className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-1">No hay alertas de stock</h3>
                    <p className="text-sm text-neutral-500">
                      {searchTerm || hasActiveFilters
                        ? 'Intenta ajustar los filtros de búsqueda'
                        : 'El inventario está en niveles óptimos'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Header de acción - solo desktop */}
                {stockAlerts.length > 0 && (
                  <div className="hidden lg:flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div>
                      <h3 className="font-medium text-orange-900">Productos con Stock Bajo ({stockAlerts.length})</h3>
                      <p className="text-sm text-orange-700 mt-0.5">Estos productos necesitan reabastecimiento urgente</p>
                    </div>
                    <Button onClick={handleCreateOrder} className="bg-[#006A4E] hover:bg-[#005a42]">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Generar Orden
                    </Button>
                  </div>
                )}

                {/* Mobile: Cards */}
                <div className="grid grid-cols-1 gap-3 lg:hidden">
                  {filteredAlerts(stockAlerts)
                    .sort((a, b) => {
                      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
                      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
                      if (aPriority !== bPriority) return aPriority - bPriority;
                      
                      const aInfo = extractProductInfo(a);
                      const bInfo = extractProductInfo(b);
                      return bInfo.deficit - aInfo.deficit;
                    })
                    .map((alert, index) => {
                      const info = extractProductInfo(alert);
                      const deficitPercentage = info.minRequired > 0 
                        ? Math.round((info.deficit / info.minRequired) * 100)
                        : 0;

                      return (
                        <Card key={alert.idalert || `stock-alert-${index}`} className="border-neutral-200 hover:border-[#006A4E]/30 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                {/* Producto y Prioridad */}
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-neutral-900 truncate">{info.productName}</h3>
                                    <code className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                      {info.sku}
                                    </code>
                                  </div>
                                  {getPriorityBadge(alert.priority)}
                                </div>

                                {/* Métricas de Stock */}
                                <div className="grid grid-cols-3 gap-2 mb-3 p-3 bg-neutral-50 rounded-lg">
                                  <div>
                                    <p className="text-xs text-neutral-600">Actual</p>
                                    <p className="text-lg font-bold text-red-600">{info.currentStock}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-neutral-600">Mínimo</p>
                                    <p className="text-lg font-bold text-neutral-900">{info.minRequired}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-neutral-600">Déficit</p>
                                    <p className="text-lg font-bold text-orange-600">-{info.deficit}</p>
                                    <p className="text-xs text-neutral-500">({deficitPercentage}%)</p>
                                  </div>
                                </div>

                                {/* Estado y Fecha */}
                                <div className="flex items-center justify-between">
                                  {getStatusBadge(alert.status)}
                                  <span className="text-xs text-neutral-500">{formatDate(alert.creationdate)}</span>
                                </div>
                              </div>

                              {/* Acciones */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewProduct(alert.entity_id)}>
                                    <ArrowUpRight className="h-4 w-4 mr-2" />
                                    Ver producto
                                  </DropdownMenuItem>
                                  {alert.status === 'active' && (
                                    <DropdownMenuItem onClick={() => handleAcknowledge(alert.idalert)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Marcar en revisión
                                    </DropdownMenuItem>
                                  )}
                                  {(alert.status === 'active' || alert.status === 'acknowledged') && (
                                    <DropdownMenuItem onClick={() => handleResolve(alert.idalert)}>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Resolver
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                {/* Desktop: Table View */}
                <Card className="hidden lg:block border-neutral-200">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-neutral-200 bg-neutral-50">
                        <tr>
                          <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            Stock Actual
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            Mínimo
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            Déficit
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            Prioridad
                          </th>
                          <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="text-right px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200 bg-white">
                        {filteredAlerts(stockAlerts)
                          .sort((a, b) => {
                            const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                            const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
                            const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
                            if (aPriority !== bPriority) return aPriority - bPriority;
                            
                            const aInfo = extractProductInfo(a);
                            const bInfo = extractProductInfo(b);
                            return bInfo.deficit - aInfo.deficit;
                          })
                          .map((alert, index) => {
                            const info = extractProductInfo(alert);
                            const deficitPercentage = info.minRequired > 0 
                              ? Math.round((info.deficit / info.minRequired) * 100)
                              : 0;
                            
                            return (
                              <tr key={alert.idalert || `stock-alert-${index}`} className="hover:bg-neutral-50 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-medium text-neutral-900 text-sm">{info.productName}</div>
                                </td>
                                <td className="px-4 py-3">
                                  <code className="text-xs bg-neutral-100 px-2 py-1 rounded">
                                    {info.sku}
                                  </code>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="text-red-600 font-medium">{info.currentStock}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className="font-medium">{info.minRequired}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="font-bold text-red-600">-{info.deficit}</span>
                                    <span className="text-xs text-neutral-500">({deficitPercentage}%)</span>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {getPriorityBadge(alert.priority)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {getStatusBadge(alert.status)}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="text-sm text-neutral-600">
                                    {formatDate(alert.creationdate)}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleViewProduct(alert.entity_id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                    {alert.status === 'active' && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleAcknowledge(alert.idalert)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {(alert.status === 'active' || alert.status === 'acknowledged') && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleResolve(alert.idalert)}
                                        className="h-8 w-8 p-0"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tab: Mantenimiento */}
          <TabsContent value="maintenance">
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No hay alertas de mantenimiento</h3>
                  <p className="text-sm text-neutral-500">Todo el equipo está funcionando correctamente</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Pagos */}
          <TabsContent value="payment">
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No hay alertas de pagos</h3>
                  <p className="text-sm text-neutral-500">Todos los pagos están al día</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Producción */}
          <TabsContent value="production">
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No hay alertas de producción</h3>
                  <p className="text-sm text-neutral-500">La producción está en niveles normales</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Todas */}
          <TabsContent value="all" className="space-y-3">
            {filteredAlerts(alerts).length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-1">No se encontraron alertas</h3>
                    <p className="text-sm text-neutral-500">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredAlerts(alerts).map((alert, index) => (
                  <Card key={alert.idalert || `all-alert-${index}`} className="border-neutral-200 hover:border-[#006A4E]/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-medium text-neutral-900">{alert.alert_title}</h3>
                            {getPriorityBadge(alert.priority)}
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-sm text-neutral-600 mb-2">{alert.alert_message}</p>
                          <span className="text-xs text-neutral-500">{formatDate(alert.creationdate)}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {alert.status === 'active' && (
                              <DropdownMenuItem onClick={() => handleAcknowledge(alert.idalert)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Marcar en revisión
                              </DropdownMenuItem>
                            )}
                            {(alert.status === 'active' || alert.status === 'acknowledged') && (
                              <DropdownMenuItem onClick={() => handleResolve(alert.idalert)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Resolver
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
