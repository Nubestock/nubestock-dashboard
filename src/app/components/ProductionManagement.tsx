import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  Factory,
  Package,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Filter,
  Calendar,
  User,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart3,
  Image,
} from 'lucide-react';
import { toast } from 'sonner';
import { useProduction, Production } from '../hooks/useProduction';
import { format, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ProductionManagement() {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<Production | null>(null);
  const [finalQuantity, setFinalQuantity] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filtros - VACÍOS por defecto para ver TODAS las producciones
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const { 
    productions, 
    isLoading, 
    fetchProductions, 
    completeProduction, 
    pagination, 
    summary,
    globalSummary,
    fetchGlobalSummary 
  } = useProduction();

  // Helper para convertir fecha local a UTC para enviar al backend
  const convertLocalDateToUTC = (dateString: string, isEndDate: boolean = false): string => {
    // Crear fecha en zona horaria local
    const localDate = new Date(dateString + 'T00:00:00');
    
    // Si es fecha de fin, obtener el final del día (23:59:59.999)
    const date = isEndDate ? endOfDay(localDate) : startOfDay(localDate);
    
    // Convertir a ISO string (UTC)
    return date.toISOString();
  };

  // Helper para parsear valores numéricos que vienen como string
  const parseNumericValue = (value: string | number | undefined): number => {
    if (value === undefined || value === null) return 0;
    if (typeof value === 'number') return value;
    // Convertir string a número y manejar casos donde vienen mal formateados
    const parsed = parseFloat(String(value).replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  };

  // Calcular totales reales de materiales consumidos
  const calculateTotals = (materials?: any[]) => {
    if (!materials || materials.length === 0) {
      return { totalConsumed: 0, totalWaste: 0 };
    }
    
    const totalConsumed = materials.reduce((sum, m) => {
      return sum + parseNumericValue(m.quantity_used);
    }, 0);
    
    const totalWaste = materials.reduce((sum, m) => {
      return sum + parseNumericValue(m.waste);
    }, 0);
    
    return { totalConsumed, totalWaste };
  };

  // Agrupar materiales duplicados sumando sus cantidades
  const consolidateMaterials = (materials?: any[]) => {
    if (!materials || materials.length === 0) return [];

    const materialMap = new Map();
    
    materials.forEach((material) => {
      const key = material.id_product;
      
      if (materialMap.has(key)) {
        // Si ya existe, sumar las cantidades
        const existing = materialMap.get(key);
        existing.quantity_used = parseNumericValue(existing.quantity_used) + parseNumericValue(material.quantity_used);
        existing.waste = parseNumericValue(existing.waste) + parseNumericValue(material.waste);
        existing.effective_quantity = parseNumericValue(existing.effective_quantity) + parseNumericValue(material.effective_quantity);
      } else {
        // Si no existe, agregarlo (con valores parseados)
        materialMap.set(key, {
          ...material,
          quantity_used: parseNumericValue(material.quantity_used),
          waste: parseNumericValue(material.waste),
          effective_quantity: parseNumericValue(material.effective_quantity),
        });
      }
    });

    return Array.from(materialMap.values());
  };

  // Cargar producciones iniciales
  useEffect(() => {
    loadProductions();
  }, [activeTab, startDate, endDate]);

  // Cargar summary global al inicio y cuando cambian los filtros de fecha
  useEffect(() => {
    loadGlobalSummary();
  }, [startDate, endDate]);

  const loadGlobalSummary = async () => {
    try {
      const filters: any = {};

      if (startDate) {
        filters.startDate = convertLocalDateToUTC(startDate);
      }

      if (endDate) {
        filters.endDate = convertLocalDateToUTC(endDate, true);
      }

      await fetchGlobalSummary(filters);
    } catch (error) {
      console.error('Error al cargar summary global:', error);
    }
  };

  const loadProductions = async () => {
    try {
      // Crear objeto de filtros solo con valores definidos
      const filters: any = {
        status: activeTab,
      };

      // Solo agregar fechas si están definidas
      if (startDate) {
        const utcStartDate = convertLocalDateToUTC(startDate);
        filters.startDate = utcStartDate;
      }

      if (endDate) {
        const utcEndDate = convertLocalDateToUTC(endDate, true);
        filters.endDate = utcEndDate;
      }
      
      console.log('📅 Búsqueda de producciones:', {
        local: { startDate: startDate || 'sin filtro', endDate: endDate || 'sin filtro' },
        utc: { 
          startDate: filters.startDate || 'sin filtro', 
          endDate: filters.endDate || 'sin filtro' 
        },
        status: activeTab,
      });

      await fetchProductions(filters);
    } catch (error) {
      toast.error('Error al cargar producciones');
    }
  };

  const handleOpenCompleteDialog = (production: Production) => {
    setSelectedProduction(production);
    setFinalQuantity('');
    setIsCompleteDialogOpen(true);
  };

  const handleCompleteProduction = async () => {
    if (!selectedProduction) return;

    const quantity = Number(finalQuantity);

    if (!quantity || quantity <= 0) {
      toast.error('Ingresa una cantidad válida mayor a 0');
      return;
    }

    try {
      await completeProduction(selectedProduction.id, quantity);
      toast.success(`Producción completada: ${quantity} unidades generadas`);
      setIsCompleteDialogOpen(false);
      setSelectedProduction(null);
      setFinalQuantity('');
      // Recargar tanto las producciones como el summary global
      await loadProductions();
      await loadGlobalSummary();
    } catch (error: any) {
      toast.error(error.message || 'Error al completar producción');
    }
  };

  const toggleRowExpansion = (productionId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(productionId)) {
      newExpanded.delete(productionId);
    } else {
      newExpanded.add(productionId);
    }
    setExpandedRows(newExpanded);
  };

  // Calcular estadísticas
  const stats = {
    // Usar el globalSummary para estadísticas GLOBALES (sin filtro de status)
    totalPending: globalSummary.total_pending,
    totalCompleted: globalSummary.total_completed,
    // Calcular desperdicios y materiales de la página actual
    totalWaste: productions.reduce((sum, p) => {
      const totals = calculateTotals(p.production_details?.materials_consumed);
      return sum + totals.totalWaste;
    }, 0),
    totalMaterialsUsed: productions.reduce((sum, p) => {
      const totals = calculateTotals(p.production_details?.materials_consumed);
      return sum + totals.totalConsumed;
    }, 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl mb-2">Gestión de Producción</h1>
          <p className="text-gray-600">
            Administra y completa las producciones registradas por los operadores
          </p>
        </div>
        <Button onClick={loadProductions} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pendientes</p>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-gray-500 mt-1">requieren completar</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Completadas</p>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{stats.totalCompleted}</div>
            <p className="text-xs text-gray-500 mt-1">finalizadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Desperdicios</p>
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{stats.totalWaste.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">kg totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Materiales Usados</p>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats.totalMaterialsUsed.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">kg consumidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>
                Filtra producciones por rango de fechas (opcional). Sin filtros, verás todas las producciones.
              </CardDescription>
            </div>
            {(startDate || endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpiar Filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio (Opcional)</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Selecciona una fecha"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin (Opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Selecciona una fecha"
              />
            </div>
          </div>
          {!startDate && !endDate && (
            <p className="text-sm text-blue-600 mt-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Mostrando todas las producciones sin filtro de fecha
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tabs: Pendientes / Completadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5" />
            Producciones
          </CardTitle>
          <CardDescription>
            Revisa los materiales consumidos y completa las producciones pendientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'completed')}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pendientes ({stats.totalPending})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Completadas ({stats.totalCompleted})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-500">Cargando producciones pendientes...</p>
                </div>
              ) : productions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                  <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No hay producciones pendientes</p>
                  <p className="text-sm text-gray-500">
                    Todas las producciones han sido completadas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {productions.map((production) => (
                    <Card key={production.id} className="border-l-4 border-l-yellow-500">
                      <CardContent className="pt-6">
                        {/* Header de la producción - TODO EN UNA LÍNEA */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            {/* Título y SKU en la misma línea */}
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold">{production.product_name}</h3>
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                {production.sku}
                              </code>
                            </div>
                            {/* Usuario y fecha en la misma línea */}
                            <div className="text-sm text-gray-500">
                              {production.user_name} · {format(new Date(production.creation_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleOpenCompleteDialog(production)}
                            className="bg-[#006A4E] hover:bg-[#005a42]"
                          >
                            Completar
                          </Button>
                        </div>

                        {/* Resumen compacto - 3 columnas en una sola fila */}
                        <div className="grid grid-cols-3 gap-6 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Consumido</p>
                            <p className="text-lg font-semibold">
                              {calculateTotals(production.production_details?.materials_consumed).totalConsumed.toFixed(2)} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Desperdicio</p>
                            <p className="text-lg font-semibold text-orange-600">
                              {calculateTotals(production.production_details?.materials_consumed).totalWaste.toFixed(2)} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Materiales</p>
                            <p className="text-lg font-semibold">
                              {production.production_details?.materials_consumed?.length || 0}
                            </p>
                          </div>
                        </div>

                        {/* Toggle detalles */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(production.id)}
                          className="w-full text-gray-600"
                        >
                          {expandedRows.has(production.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Ocultar Detalles
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </>
                          )}
                        </Button>

                        {/* Detalles expandibles */}
                        {expandedRows.has(production.id) && (
                          <div className="mt-4 border-t pt-4">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead>Material</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead className="text-right">Cantidad Usada</TableHead>
                                  <TableHead className="text-right">Desperdicio</TableHead>
                                  <TableHead className="text-right">Cantidad Efectiva</TableHead>
                                  <TableHead className="text-right">Stock Actual</TableHead>
                                  <TableHead className="text-center">Evidencia</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {consolidateMaterials(production.production_details?.materials_consumed)?.map((material) => (
                                  <TableRow key={material.id_product}>
                                    <TableCell className="font-medium">
                                      <div className="flex items-center gap-2">
                                        {material.has_waste && (
                                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        )}
                                        {material.name}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                        {material.sku}
                                      </code>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {typeof material.quantity_used === 'number' 
                                        ? material.quantity_used.toFixed(2) 
                                        : material.quantity_used} kg
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {parseNumericValue(material.waste) > 0 ? (
                                        <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                                          {typeof material.waste === 'number' 
                                            ? material.waste.toFixed(2) 
                                            : material.waste} kg
                                        </Badge>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-green-700">
                                      {typeof material.effective_quantity === 'number' 
                                        ? material.effective_quantity.toFixed(2) 
                                        : material.effective_quantity} kg
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Badge variant="outline">{material.current_stock} kg</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {material.details ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedImage(material.details);
                                            setImageModalOpen(true);
                                          }}
                                        >
                                          <Image className="h-4 w-4 mr-1" />
                                          Ver Foto
                                        </Button>
                                      ) : (
                                        <span className="text-gray-400 text-xs">Sin foto</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                  <p className="text-gray-500">Cargando producciones completadas...</p>
                </div>
              ) : productions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                  <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No hay producciones completadas</p>
                  <p className="text-sm text-gray-500">
                    Las producciones finalizadas aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {productions.map((production) => (
                    <Card key={production.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-6">
                        {/* Header de la producción - Compacto */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold">{production.product_name}</h3>
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs text-gray-600">
                                {production.sku}
                              </code>
                            </div>
                            <div className="text-sm text-gray-500">
                              {production.user_name} · {format(new Date(production.creation_date), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                            Completada
                          </Badge>
                        </div>

                        {/* Resumen compacto - 4 columnas en una sola fila */}
                        <div className="grid grid-cols-4 gap-6 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Producto Generado</p>
                            <p className="text-lg font-semibold text-green-700">
                              {production.quantity} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Consumido</p>
                            <p className="text-lg font-semibold">
                              {calculateTotals(production.production_details?.materials_consumed).totalConsumed.toFixed(2)} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Desperdicio</p>
                            <p className="text-lg font-semibold text-orange-600">
                              {calculateTotals(production.production_details?.materials_consumed).totalWaste.toFixed(2)} kg
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Materiales</p>
                            <p className="text-lg font-semibold">
                              {production.production_details?.materials_consumed?.length || 0}
                            </p>
                          </div>
                        </div>

                        {/* Toggle detalles */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(production.id)}
                          className="w-full text-gray-600"
                        >
                          {expandedRows.has(production.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-2" />
                              Ocultar Detalles
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-2" />
                              Ver Detalles
                            </>
                          )}
                        </Button>

                        {/* Detalles expandibles */}
                        {expandedRows.has(production.id) && (
                          <div className="mt-4 border-t pt-4">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead>Material</TableHead>
                                  <TableHead>SKU</TableHead>
                                  <TableHead className="text-right">Cantidad Usada</TableHead>
                                  <TableHead className="text-right">Desperdicio</TableHead>
                                  <TableHead className="text-right">Cantidad Efectiva</TableHead>
                                  <TableHead className="text-right">Stock Actual</TableHead>
                                  <TableHead className="text-center">Evidencia</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {consolidateMaterials(production.production_details?.materials_consumed)?.map((material) => (
                                  <TableRow key={material.id_product}>
                                    <TableCell className="font-medium">
                                      <div className="flex items-center gap-2">
                                        {material.has_waste && (
                                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        )}
                                        {material.name}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                        {material.sku}
                                      </code>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {typeof material.quantity_used === 'number' 
                                        ? material.quantity_used.toFixed(2) 
                                        : material.quantity_used} kg
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {parseNumericValue(material.waste) > 0 ? (
                                        <Badge variant="destructive" className="bg-orange-100 text-orange-800">
                                          {typeof material.waste === 'number' 
                                            ? material.waste.toFixed(2) 
                                            : material.waste} kg
                                        </Badge>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-green-700">
                                      {typeof material.effective_quantity === 'number' 
                                        ? material.effective_quantity.toFixed(2) 
                                        : material.effective_quantity} kg
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Badge variant="outline">{material.current_stock} kg</Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {material.details ? (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedImage(material.details);
                                            setImageModalOpen(true);
                                          }}
                                        >
                                          <Image className="h-4 w-4 mr-1" />
                                          Ver Foto
                                        </Button>
                                      ) : (
                                        <span className="text-gray-400 text-xs">Sin foto</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog para completar producción */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Completar Producción</DialogTitle>
            <DialogDescription>
              Ingresa la cantidad de producto final generado en esta producción
            </DialogDescription>
          </DialogHeader>

          {selectedProduction && (
            <div className="space-y-4">
              {/* Info del producto */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Producto</p>
                <p className="text-lg font-semibold">{selectedProduction.product_name}</p>
                <code className="bg-gray-200 px-2 py-1 rounded text-xs mt-1 inline-block">
                  {selectedProduction.sku}
                </code>
              </div>

              {/* Resumen de materiales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700 mb-1">Materiales Consumidos</p>
                  <p className="text-xl font-bold text-blue-900">
                    {calculateTotals(selectedProduction.production_details?.materials_consumed).totalConsumed.toFixed(2)} kg
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-700 mb-1">Desperdicios</p>
                  <p className="text-xl font-bold text-orange-900">
                    {calculateTotals(selectedProduction.production_details?.materials_consumed).totalWaste.toFixed(2)} kg
                  </p>
                </div>
              </div>

              {/* Input de cantidad */}
              <div className="space-y-2">
                <Label htmlFor="finalQuantity">
                  Cantidad de Producto Final Generado (kg) *
                </Label>
                <Input
                  id="finalQuantity"
                  type="number"
                  placeholder="Ej: 10"
                  value={finalQuantity}
                  onChange={(e) => setFinalQuantity(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
                <p className="text-xs text-gray-500">
                  Esta cantidad se agregará al inventario del producto final
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCompleteProduction}
              className="bg-[#006A4E] hover:bg-[#005a42]"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completar Producción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para ver imagen en base64 */}
      <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evidencia Fotográfica</DialogTitle>
            <DialogDescription>
              Imagen capturada por el operador durante el registro
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center items-center bg-gray-50 rounded-lg p-4">
              <img
                src={selectedImage}
                alt="Evidencia"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setImageModalOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}