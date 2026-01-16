import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, Calendar, Users, TrendingUp, DollarSign, Package, RefreshCw } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { useDailySalesReport, useClientSalesReport, useTopProductsReport } from '../hooks/useSalesReports';
import * as XLSX from 'xlsx';

export default function SalesReports() {
  const [reportType, setReportType] = useState<'daily' | 'byClient' | 'byProduct'>('daily');
  
  // Calcular fechas por defecto (últimos 30 días)
  const getDefaultDates = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    };
  };

  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  // Hooks para los reportes
  const dailyReport = useDailySalesReport(startDate, endDate);
  const clientReport = useClientSalesReport(startDate, endDate, 50);
  const productReport = useTopProductsReport(startDate, endDate, 20);

  // Cargar reportes cuando cambien las fechas
  useEffect(() => {
    if (startDate && endDate) {
      if (reportType === 'daily') {
        dailyReport.refetch();
      } else if (reportType === 'byClient') {
        clientReport.refetch();
      } else if (reportType === 'byProduct') {
        productReport.refetch();
      }
    }
  }, [startDate, endDate, reportType]);

  const handleRefresh = () => {
    if (reportType === 'daily') {
      dailyReport.refetch();
    } else if (reportType === 'byClient') {
      clientReport.refetch();
    } else if (reportType === 'byProduct') {
      productReport.refetch();
    }
    toast.success('Reporte actualizado');
  };

  // Preparar datos para gráficos
  const dailyChartData = dailyReport.data?.data.map(item => ({
    fecha: new Date(item.date).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' }),
    fullDate: item.date,
    ventas: item.total_sales,
    cantidad: item.number_of_sales,
  })) || [];

  const clientChartData = clientReport.data?.data.map(item => ({
    name: item.client_name.split(' ')[0],
    fullName: item.client_name,
    total: item.total_sales,
    count: item.number_of_sales,
  })) || [];

  const productChartData = productReport.data?.data.map(item => ({
    name: item.product_name.length > 20 ? item.product_name.substring(0, 20) + '...' : item.product_name,
    fullName: item.product_name,
    quantity: item.total_quantity_sold,
    sales: item.total_sales,
  })) || [];

  // Exportar a Excel
  const exportToExcel = () => {
    try {
      let dataToExport: any[] = [];
      let sheetName = '';

      if (reportType === 'daily' && dailyReport.data) {
        dataToExport = dailyReport.data.data.map(item => ({
          'Fecha': new Date(item.date).toLocaleDateString('es-EC'),
          'Número de Ventas': item.number_of_sales,
          'Total Ventas': `$${item.total_sales.toFixed(2)}`,
          'Promedio por Venta': `$${item.average_sale.toFixed(2)}`,
          'Total Pagado': `$${item.total_paid.toFixed(2)}`,
          'Total Pendiente': `$${item.total_pending.toFixed(2)}`,
        }));
        sheetName = 'Ventas Diarias';
      } else if (reportType === 'byClient' && clientReport.data) {
        dataToExport = clientReport.data.data.map(item => ({
          'Cliente': item.client_name,
          'Razón Social': item.business_name,
          'RUC/Cédula': item.ruc_cedula,
          'Número de Ventas': item.number_of_sales,
          'Total Compras': `$${item.total_sales.toFixed(2)}`,
          'Promedio por Venta': `$${item.average_sale.toFixed(2)}`,
          'Total Pagado': `$${item.total_paid.toFixed(2)}`,
          'Total Pendiente': `$${item.total_pending.toFixed(2)}`,
          'Primera Venta': new Date(item.first_sale_date).toLocaleDateString('es-EC'),
          'Última Venta': new Date(item.last_sale_date).toLocaleDateString('es-EC'),
        }));
        sheetName = 'Ventas por Cliente';
      } else if (reportType === 'byProduct' && productReport.data) {
        dataToExport = productReport.data.data.map(item => ({
          'Producto': item.product_name,
          'SKU': item.sku,
          'Categoría': item.category,
          'Cantidad Vendida': item.total_quantity_sold,
          'Total Ventas': `$${item.total_sales.toFixed(2)}`,
          'Número de Transacciones': item.number_of_transactions,
          'Precio Promedio': `$${item.average_price.toFixed(2)}`,
        }));
        sheetName = 'Top Productos';
      }

      if (dataToExport.length === 0) {
        toast.error('No hay datos para exportar');
        return;
      }

      // Crear hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(dataToExport);

      // Ajustar ancho de columnas
      const maxWidth = 35;
      ws['!cols'] = Object.keys(dataToExport[0]).map(() => ({ wch: maxWidth }));

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Descargar archivo
      const fileName = `Reporte_${sheetName.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Reporte exportado exitosamente');
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar el reporte');
    }
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const isLoading = dailyReport.isLoading || clientReport.isLoading || productReport.isLoading;
  const hasError = dailyReport.error || clientReport.error || productReport.error;
  
  // Calcular estadísticas según el tipo de reporte
  const stats = {
    daily: dailyReport.data?.summary,
    client: clientReport.data?.summary,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl mb-2">Reportes de Ventas</h2>
          <p className="text-gray-600">Análisis detallado de ventas por período y clientes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button onClick={exportToExcel} disabled={isLoading || !startDate || !endDate}>
            <Download className="h-4 w-4 mr-2" />
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* Estadísticas generales */}
      {reportType === 'daily' && stats.daily && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ventas</p>
                  <div className="text-2xl font-bold">${stats.daily.total_sales.toFixed(2)}</div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Transacciones</p>
                  <div className="text-2xl font-bold">{stats.daily.total_transactions}</div>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio Diario</p>
                  <div className="text-2xl font-bold">${stats.daily.average_per_day.toFixed(2)}</div>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mejor Día</p>
                  <div className="text-2xl font-bold">${stats.daily.best_day.total.toFixed(2)}</div>
                  <p className="text-xs text-gray-500">
                    {new Date(stats.daily.best_day.date).toLocaleDateString('es-EC', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'byClient' && stats.client && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Ventas</p>
                  <div className="text-2xl font-bold">${stats.client.total_sales.toFixed(2)}</div>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clientes</p>
                  <div className="text-2xl font-bold">{stats.client.total_clients}</div>
                </div>
                <Users className="h-8 w-8 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Promedio por Cliente</p>
                  <div className="text-2xl font-bold">${stats.client.average_per_client.toFixed(2)}</div>
                </div>
                <DollarSign className="h-8 w-8 text-orange-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mejor Cliente</p>
                  <div className="text-lg font-bold">{stats.client.best_client.client_name.split(' ')[0]}</div>
                  <p className="text-xs text-gray-500">${stats.client.best_client.total.toFixed(2)}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Reporte</Label>
              <Select value={reportType} onValueChange={(v: 'daily' | 'byClient' | 'byProduct') => setReportType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ventas Diarias</SelectItem>
                  <SelectItem value="byClient">Ventas por Cliente</SelectItem>
                  <SelectItem value="byProduct">Top Productos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {hasError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">
              {dailyReport.error || clientReport.error || productReport.error}
            </p>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Reporte de Ventas Diarias */}
          {reportType === 'daily' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Tendencia de Ventas Diarias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyChartData.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      Selecciona un rango de fechas para ver el reporte
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={dailyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="ventas"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          name="Ventas ($)"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {dailyChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detalle Diario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Número de Ventas</TableHead>
                            <TableHead>Total del Día</TableHead>
                            <TableHead>Promedio por Venta</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dailyChartData.map((day, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">
                                {new Date(day.fullDate).toLocaleDateString('es-EC', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </TableCell>
                              <TableCell>{day.cantidad}</TableCell>
                              <TableCell className="font-bold text-green-600">
                                ${day.ventas.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ${(day.ventas / day.cantidad).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50 font-bold">
                            <TableCell>TOTAL</TableCell>
                            <TableCell>{dailyChartData.reduce((sum, d) => sum + d.cantidad, 0)}</TableCell>
                            <TableCell className="text-green-600">
                              ${dailyChartData.reduce((sum, d) => sum + d.ventas, 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              ${(dailyChartData.reduce((sum, d) => sum + d.ventas, 0) / dailyChartData.reduce((sum, d) => sum + d.cantidad, 0)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Reporte de Ventas por Cliente */}
          {reportType === 'byClient' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Top Clientes por Ventas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clientChartData.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No hay datos disponibles para el período seleccionado
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={clientChartData.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                          <Legend />
                          <Bar dataKey="total" fill="#3b82f6" name="Total Ventas ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clientChartData.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No hay datos disponibles
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={clientChartData.slice(0, 8)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name.split(' ')[0]}`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="total"
                          >
                            {clientChartData.slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {clientChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detalle por Cliente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Razón Social</TableHead>
                            <TableHead>Número de Ventas</TableHead>
                            <TableHead>Total Compras</TableHead>
                            <TableHead>Promedio por Venta</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientChartData.map((client, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{client.fullName}</TableCell>
                              <TableCell className="text-sm text-gray-600">{client.business_name}</TableCell>
                              <TableCell>{client.count}</TableCell>
                              <TableCell className="font-bold text-green-600">
                                ${client.total.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ${(client.total / client.count).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50 font-bold">
                            <TableCell colSpan={3}>TOTAL</TableCell>
                            <TableCell>{clientChartData.reduce((sum, c) => sum + c.count, 0)}</TableCell>
                            <TableCell className="text-green-600">
                              ${clientChartData.reduce((sum, c) => sum + c.total, 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              ${(clientChartData.reduce((sum, c) => sum + c.total, 0) / clientChartData.reduce((sum, c) => sum + c.count, 0)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Reporte de Top Productos */}
          {reportType === 'byProduct' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Top Productos Vendidos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productChartData.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No hay datos disponibles para el período seleccionado
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={productChartData.slice(0, 10)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                          <Legend />
                          <Bar dataKey="sales" fill="#3b82f6" name="Total Ventas ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribución de Ventas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productChartData.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        No hay datos disponibles
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                          <Pie
                            data={productChartData.slice(0, 8)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name.split(' ')[0]}`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="sales"
                          >
                            {productChartData.slice(0, 8).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>

              {productChartData.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Detalle por Producto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border border-neutral-200 overflow-hidden bg-white shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Producto</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead>Cantidad Vendida</TableHead>
                            <TableHead>Total Ventas</TableHead>
                            <TableHead>Promedio por Venta</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productChartData.map((product, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{product.fullName}</TableCell>
                              <TableCell className="text-sm text-gray-600">{product.category}</TableCell>
                              <TableCell>{product.quantity}</TableCell>
                              <TableCell className="font-bold text-green-600">
                                ${product.sales.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                ${(product.sales / product.quantity).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-gray-50 font-bold">
                            <TableCell colSpan={3}>TOTAL</TableCell>
                            <TableCell>{productChartData.reduce((sum, p) => sum + p.quantity, 0)}</TableCell>
                            <TableCell className="text-green-600">
                              ${productChartData.reduce((sum, p) => sum + p.sales, 0).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              ${(productChartData.reduce((sum, p) => sum + p.sales, 0) / productChartData.reduce((sum, p) => sum + p.quantity, 0)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}