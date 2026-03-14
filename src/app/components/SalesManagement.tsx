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
import {
  ShoppingCart,
  Plus,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  Package,
  Trash2,
  RefreshCw,
  CreditCard,
  Banknote,
  FileText,
  Search,
  X,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Receipt,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSales, CreateSaleData, SaleProduct } from '../hooks/useSales';
import { useClients } from '../hooks/useClients';
import { useProducts } from '../hooks/useProducts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SalesManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario de nueva venta
  const [formData, setFormData] = useState<Omit<CreateSaleData, 'products'>>(({
    id_client: 0,
    total_amount: 0,
    method: 'cash',
    status: 'pending',
    due_date: '',
  }));

  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [productQuantity, setProductQuantity] = useState<string>('');

  // Búsqueda de clientes
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Búsqueda de productos
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const { sales, isLoading, fetchSales, createSale, pagination } = useSales();
  const { clients } = useClients(true, 1000);
  const { products } = useProducts(1, 1000, 'PF'); // Solo productos finales

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.client-dropdown-container')) {
        setShowClientDropdown(false);
      }
      if (!target.closest('.product-dropdown-container')) {
        setShowProductDropdown(false);
      }
    };

    if (showClientDropdown || showProductDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showClientDropdown, showProductDropdown]);

  useEffect(() => {
    loadSales();
  }, [activeFilter]);

  const loadSales = async () => {
    try {
      const filters: any = { page: 1, limit: 10 };
      if (activeFilter !== 'all') {
        filters.status = activeFilter;
      }
      await fetchSales(filters);
    } catch (error) {
      toast.error('Error al cargar ventas');
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductId || !productQuantity || Number(productQuantity) <= 0) {
      toast.error('Selecciona un producto y una cantidad válida');
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;

    // Verificar si el producto ya está en la lista
    const existingIndex = saleProducts.findIndex(p => p.id_product === selectedProductId);
    
    if (existingIndex >= 0) {
      // Actualizar cantidad
      const updated = [...saleProducts];
      updated[existingIndex].quantity += Number(productQuantity);
      setSaleProducts(updated);
      toast.success('Cantidad actualizada');
    } else {
      // Agregar nuevo producto
      setSaleProducts([...saleProducts, {
        id_product: selectedProductId,
        quantity: Number(productQuantity),
      }]);
      toast.success('Producto agregado');
    }

    // Limpiar selección
    setSelectedProduct(null);
    setSelectedProductId(0);
    setProductQuantity('');
    setProductSearch('');
  };

  const handleRemoveProduct = (id_product: number) => {
    setSaleProducts(saleProducts.filter(p => p.id_product !== id_product));
    toast.success('Producto eliminado');
  };

  // Filtrar clientes por búsqueda
  const filteredClients = clients.filter((client) => {
    const searchLower = clientSearch.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.identification.toLowerCase().includes(searchLower)
    );
  });

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((product) => {
    const searchLower = productSearch.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setFormData({ ...formData, id_client: client.id });
    setClientSearch('');
    setShowClientDropdown(false);
    toast.success(`Cliente seleccionado: ${client.name}`);
  };

  const handleClearClient = () => {
    setSelectedClient(null);
    setFormData({ ...formData, id_client: 0 });
    setClientSearch('');
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setSelectedProductId(product.id);
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleClearProduct = () => {
    setSelectedProduct(null);
    setSelectedProductId(0);
    setProductSearch('');
  };

  const calculateTotal = () => {
    let total = 0;
    saleProducts.forEach(sp => {
      const product = products.find(p => p.id === sp.id_product);
      if (product) {
        total += Number(product.price || 0) * sp.quantity;
      }
    });
    return total;
  };

  const handleCreateSale = async () => {
    // Validaciones
    if (!formData.id_client) {
      toast.error('Selecciona un cliente');
      return;
    }

    if (saleProducts.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    if (!formData.due_date) {
      toast.error('Selecciona una fecha de vencimiento');
      return;
    }

    const total = calculateTotal();

    try {
      const saleData: CreateSaleData = {
        ...formData,
        total_amount: total,
        due_date: new Date(formData.due_date + 'T00:00:00').toISOString(),
        products: saleProducts,
      };

      await createSale(saleData);
      toast.success('Venta creada exitosamente');
      
      // Resetear formulario
      setFormData({
        id_client: 0,
        total_amount: 0,
        method: 'cash',
        status: 'pending',
        due_date: '',
      });
      setSaleProducts([]);
      setSelectedClient(null);
      setClientSearch('');
      setIsCreateDialogOpen(false);
      
      // Recargar ventas
      loadSales();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear venta');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">Pendiente</Badge>;
      case 'completed':
        return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">Completada</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'credit':
        return 'Crédito';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-3.5 w-3.5" />;
      case 'credit':
        return <CreditCard className="h-3.5 w-3.5" />;
      default:
        return <DollarSign className="h-3.5 w-3.5" />;
    }
  };

  // Filtrar ventas por búsqueda
  const filteredSales = sales.filter(sale => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      sale.client_name?.toLowerCase().includes(searchLower) ||
      sale.identification?.toLowerCase().includes(searchLower) ||
      sale.dispatch_guide?.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: sales.length,
    pending: sales.filter(s => s.status === 'pending').length,
    completed: sales.filter(s => s.status === 'completed').length,
    // Monto total: suma de total_amount solo de ventas con estado distinto de pending
    totalAmount: sales
      .filter(s => s.status !== 'pending')
      .reduce((sum, s) => sum + Number(s.total_amount || 0), 0),
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl text-neutral-900">Gestión de Ventas</h1>
            <p className="text-sm text-neutral-600 mt-1">Registra y administra las ventas de productos</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="bg-[#006A4E] hover:bg-[#005a42] h-9 sm:h-10"
            size="sm"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nueva Venta</span>
          </Button>
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar venta..."
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
                {activeFilter !== 'all' && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#006A4E] rounded-full" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filtrar Ventas</SheetTitle>
                <SheetDescription>
                  Filtra las ventas por estado
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Button
                    variant={activeFilter === 'all' ? 'default' : 'outline'}
                    className={`w-full justify-start ${activeFilter === 'all' ? 'bg-[#006A4E]' : ''}`}
                    size="sm"
                    onClick={() => {
                      setActiveFilter('all');
                      setIsFiltersOpen(false);
                    }}
                  >
                    Todas las ventas
                  </Button>
                  <Button
                    variant={activeFilter === 'pending' ? 'default' : 'outline'}
                    className={`w-full justify-start ${activeFilter === 'pending' ? 'bg-[#006A4E]' : ''}`}
                    size="sm"
                    onClick={() => {
                      setActiveFilter('pending');
                      setIsFiltersOpen(false);
                    }}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Pendientes
                  </Button>
                  <Button
                    variant={activeFilter === 'completed' ? 'default' : 'outline'}
                    className={`w-full justify-start ${activeFilter === 'completed' ? 'bg-[#006A4E]' : ''}`}
                    size="sm"
                    onClick={() => {
                      setActiveFilter('completed');
                      setIsFiltersOpen(false);
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completadas
                  </Button>
                  <Button
                    variant={activeFilter === 'cancelled' ? 'default' : 'outline'}
                    className={`w-full justify-start ${activeFilter === 'cancelled' ? 'bg-[#006A4E]' : ''}`}
                    size="sm"
                    onClick={() => {
                      setActiveFilter('cancelled');
                      setIsFiltersOpen(false);
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Canceladas
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Button 
            onClick={loadSales}
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
        <Card className="border-neutral-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Total</p>
              <div className="flex items-end justify-between">
                <span className="text-xl sm:text-2xl font-bold text-neutral-900">{stats.total}</span>
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Pendientes</p>
              <div className="flex items-end justify-between">
                <span className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</span>
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600/40" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Completadas</p>
              <div className="flex items-end justify-between">
                <span className="text-xl sm:text-2xl font-bold text-[#006A4E]">{stats.completed}</span>
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#006A4E]/40" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Monto Total</p>
              <div className="flex items-end justify-between">
                <span className="text-lg sm:text-xl font-bold text-purple-600">
                  ${(stats.totalAmount / 1000).toFixed(1)}K
                </span>
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600/40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006A4E] mx-auto mb-3"></div>
            <p className="text-sm text-neutral-600">Cargando ventas...</p>
          </div>
        </div>
      )}

      {/* Vista de Ventas */}
      {!isLoading && (
        <>
          {filteredSales.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No hay ventas registradas</h3>
                  <p className="text-sm text-neutral-500">
                    {searchTerm || activeFilter !== 'all'
                      ? 'No se encontraron ventas con los filtros aplicados'
                      : 'Crea tu primera venta usando el botón "Nueva Venta"'}
                  </p>
                  {(searchTerm || activeFilter !== 'all') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm('');
                        setActiveFilter('all');
                      }}
                      className="mt-4"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Mobile: Cards */}
              <div className="grid grid-cols-1 gap-3 lg:hidden">
                {filteredSales.map((sale) => (
                  <Card key={sale.id} className="border-neutral-200 hover:border-[#006A4E]/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Cliente y Estado */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-neutral-900 truncate">{sale.client_name}</h3>
                              <code className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {sale.identification}
                              </code>
                            </div>
                            {getStatusBadge(sale.status)}
                          </div>

                          {/* Detalles */}
                          <div className="space-y-1.5 mb-3">
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              <Calendar className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                              <span>{format(new Date(sale.creation_date), 'dd/MM/yyyy HH:mm', { locale: es })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-neutral-600">
                              {getMethodIcon(sale.method)}
                              <span>{getMethodLabel(sale.method)}</span>
                            </div>
                            {sale.dispatch_guide && (
                              <div className="flex items-center gap-2 text-sm text-neutral-600">
                                <FileText className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                                <code className="text-xs bg-neutral-100 px-1.5 py-0.5 rounded">
                                  {sale.dispatch_guide}
                                </code>
                              </div>
                            )}
                          </div>

                          {/* Monto */}
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-bold text-[#006A4E]">
                              ${Number(sale.total_amount).toFixed(2)}
                            </span>
                            {sale.user_name && (
                              <span className="text-xs text-neutral-500">Por: {sale.user_name}</span>
                            )}
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
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Receipt className="h-4 w-4 mr-2" />
                              Generar factura
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop: Table View */}
              <Card className="hidden lg:block border-neutral-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-neutral-200 bg-neutral-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Método Pago
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Guía
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Monto
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {filteredSales.map((sale) => (
                        <tr key={sale.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-neutral-900 text-sm">{sale.client_name}</div>
                              <code className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {sale.identification}
                              </code>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-neutral-900">
                              {format(new Date(sale.creation_date), 'dd/MM/yyyy', { locale: es })}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {format(new Date(sale.creation_date), 'HH:mm', { locale: es })}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {getStatusBadge(sale.status)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-sm text-neutral-900">
                              {getMethodIcon(sale.method)}
                              <span>{getMethodLabel(sale.method)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {sale.dispatch_guide ? (
                              <code className="text-xs bg-neutral-100 px-2 py-1 rounded">
                                {sale.dispatch_guide}
                              </code>
                            ) : (
                              <span className="text-neutral-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-semibold text-neutral-900">
                              ${Number(sale.total_amount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Receipt className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Contador de resultados */}
              <div className="flex items-center justify-between text-sm text-neutral-600 px-1">
                <span>
                  Mostrando {filteredSales.length} de {sales.length} ventas
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Dialog: Nueva Venta */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Venta</DialogTitle>
            <DialogDescription>
              Registra una nueva venta de productos finales
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del Cliente */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                {!selectedClient ? (
                  <div className="relative client-dropdown-container">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar cliente..."
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setShowClientDropdown(true);
                        }}
                        onFocus={() => setShowClientDropdown(true)}
                        className="pl-10"
                      />
                    </div>
                    {showClientDropdown && (
                      <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredClients.length > 0 ? (
                          filteredClients.slice(0, 10).map((client) => (
                            <div
                              key={client.id}
                              className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                              onMouseDown={() => handleSelectClient(client)}
                            >
                              <p className="font-medium text-sm">{client.name}</p>
                              <p className="text-xs text-gray-500">{client.identification}</p>
                            </div>
                          ))
                        ) : clientSearch ? (
                          <div className="px-4 py-8 text-center">
                            <User className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm text-gray-500">No se encontraron clientes</p>
                          </div>
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <User className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm text-gray-500">Escribe para buscar clientes</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-sm">{selectedClient.name}</p>
                      <p className="text-xs text-gray-500">{selectedClient.identification}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearClient}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Método de Pago *</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value: any) => setFormData({ ...formData, method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Efectivo</SelectItem>
                    <SelectItem value="credit">Crédito</SelectItem>
                    <SelectItem value="transfer">Transferencia</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Fecha Vencimiento *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dispatch_guide">Guía de Despacho</Label>
                <Input
                  id="dispatch_guide"
                  placeholder="Ej: 2103ASD"
                  value={formData.dispatch_guide}
                  onChange={(e) => setFormData({ ...formData, dispatch_guide: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                placeholder="Observaciones adicionales"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            {/* Agregar Productos */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">Productos</h3>
              
              <div className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-12 sm:col-span-7">
                  <Label>Producto *</Label>
                  {!selectedProduct ? (
                    <div className="relative product-dropdown-container">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Buscar producto..."
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setShowProductDropdown(true);
                          }}
                          onFocus={() => setShowProductDropdown(true)}
                          className="pl-10"
                        />
                      </div>
                      {showProductDropdown && (
                        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.slice(0, 10).map((product) => (
                              <div
                                key={product.id}
                                className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition-colors"
                                onMouseDown={() => handleSelectProduct(product)}
                              >
                                <p className="font-medium text-sm">{product.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{product.sku}</code>
                                  <span className="text-xs text-[#006A4E] font-medium">${Number(product.price || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            ))
                          ) : productSearch ? (
                            <div className="px-4 py-8 text-center">
                              <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm text-gray-500">No se encontraron productos</p>
                            </div>
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <Package className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm text-gray-500">Escribe para buscar productos</p>
                              <p className="text-xs text-gray-400 mt-1">{products.length} producto{products.length !== 1 ? 's' : ''} disponible{products.length !== 1 ? 's' : ''}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{selectedProduct.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{selectedProduct.sku}</code>
                          <span className="text-xs text-[#006A4E] font-medium">${Number(selectedProduct.price || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearProduct}
                        className="h-8 w-8 p-0 ml-2 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="col-span-8 sm:col-span-3">
                  <Label>Cantidad</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(e.target.value)}
                    min="1"
                  />
                </div>

                <div className="col-span-4 sm:col-span-2 flex items-end">
                  <Button onClick={handleAddProduct} className="w-full bg-[#006A4E] hover:bg-[#005a42]">
                    <Plus className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Agregar</span>
                  </Button>
                </div>
              </div>

              {/* Lista de productos agregados */}
              {saleProducts.length > 0 && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="space-y-3">
                    {saleProducts.map((sp) => {
                      const product = products.find(p => p.id === sp.id_product);
                      const subtotal = Number(product?.price || 0) * sp.quantity;
                      return (
                        <div key={sp.id_product} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{product?.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <code className="text-xs text-gray-500">{product?.sku}</code>
                              <span className="text-xs text-gray-500">×{sp.quantity}</span>
                              <span className="text-xs text-gray-500">${Number(product?.price || 0).toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-sm">${subtotal.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(sp.id_product)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-lg text-[#006A4E]">
                        ${calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSale} className="bg-[#006A4E] hover:bg-[#005a42]">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Crear Venta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}