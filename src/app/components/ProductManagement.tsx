import React ,{ useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight, Eye, Upload, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts, useCategories, useOrigins, useMeasures, Product } from '../hooks/useProducts';
import ProductDetail from './ProductDetail';
import BulkProductUpload from './BulkProductUpload';
import { StockBadge } from './ui/corporate-badge';
import { createWorkbook, addSheetFromJson, addSheetFromAoa, downloadWorkbook } from '../utils/excel';
import { API_CONFIG, apiRequest } from '../config/api';

interface ProductManagementProps {
  initialProductId?: string | null;
  onProductViewed?: () => void;
}

export default function ProductManagement({ initialProductId, onProductViewed }: ProductManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [productType, setProductType] = useState<'MP' | 'PF'>('PF');
  const [newProductType, setNewProductType] = useState<'MP' | 'PF'>('PF');
  const [showDetail, setShowDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    id_category: '',
    id_origin: '',
    id_measure: '',
    quantity: '',
    min_stock: '',
    price: '', // Precio obligatorio
  });

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset a página 1 cuando cambia la búsqueda
    }, 500); // 500ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { products, pagination, isLoading, refetch, createProduct, updateProduct, deleteProduct, bulkCreateProducts } = useProducts(
    currentPage, 
    itemsPerPage, 
    productType,
    debouncedSearch // Usar el término debounced
  );
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { origins, isLoading: originsLoading } = useOrigins();
  const { measures, isLoading: measuresLoading } = useMeasures();

  // Effect para abrir el producto cuando se recibe initialProductId
  useEffect(() => {
    if (initialProductId && products.length > 0 && !showDetail) {
      const product = products.find(p => p.id.toString() === initialProductId);
      if (product) {
        setSelectedProduct(product);
        setShowDetail(true);
        toast.success('Producto encontrado');
        // Notificar que el producto fue visualizado
        if (onProductViewed) {
          onProductViewed();
        }
      } else {
        toast.error('Producto no encontrado en la página actual');
        // Notificar que se intentó visualizar
        if (onProductViewed) {
          onProductViewed();
        }
      }
    }
  }, [initialProductId, products, showDetail, onProductViewed]);

  // Si hay un producto seleccionado, mostrar vista detallada
  if (showDetail && selectedProduct) {
    return (
      <ProductDetail
        product={selectedProduct}
        onBack={() => {
          setShowDetail(false);
          setSelectedProduct(null);
        }}
        onEdit={(product) => {
          toast.info('Función de edición en desarrollo');
          // Aquí iría la lógica de edición
        }}
        onDuplicate={(product) => {
          toast.info('Función de duplicación en desarrollo');
          // Aquí iría la lógica de duplicación
        }}
        onDelete={(product) => {
          toast.success('Producto eliminado');
          setShowDetail(false);
          setSelectedProduct(null);
          refetch();
        }}
      />
    );
  }

  const handleAddProduct = () => {
    toast.success('Producto agregado correctamente');
    setIsAddDialogOpen(false);
    // Limpiar el formulario
    setFormData({
      name: '',
      sku: '',
      id_category: '',
      id_origin: '',
      id_measure: '',
      quantity: '',
      min_stock: '',
      price: '', // Precio obligatorio
    });
    setNewProductType('PF');
    refetch();
  };

  const handleDeleteProduct = (id: string) => {
    toast.success('Producto eliminado');
    refetch();
  };

  const validateAndSubmitProduct = async () => {
    // Validar campos requeridos
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es requerido');
      return;
    }
    if (!formData.sku.trim()) {
      toast.error('El SKU es requerido');
      return;
    }
    if (!formData.id_category) {
      toast.error('La categoría es requerida');
      return;
    }
    if (!formData.id_origin) {
      toast.error('El origen es requerido');
      return;
    }
    if (!formData.id_measure) {
      toast.error('La unidad de medida es requerida');
      return;
    }
    if (!formData.quantity || Number.parseFloat(formData.quantity) < 0) {
      toast.error('El stock actual es requerido y debe ser mayor o igual a 0');
      return;
    }
    if (!formData.min_stock || Number.parseFloat(formData.min_stock) < 0) {
      toast.error('El stock mínimo es requerido y debe ser mayor o igual a 0');
      return;
    }
    if (!formData.price || Number.parseFloat(formData.price) < 0) {
      toast.error('El precio es requerido y debe ser mayor o igual a 0');
      return;
    }

    // Validar decimales según el tipo
    if (newProductType === 'PF') {
      const quantity = Number.parseFloat(formData.quantity);
      const minStock = Number.parseFloat(formData.min_stock);
      if (!Number.isInteger(quantity) || !Number.isInteger(minStock)) {
        toast.error('Los productos finales solo permiten cantidades enteras');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        type: newProductType,
        id_category: Number.parseInt(formData.id_category),
        id_origin: Number.parseInt(formData.id_origin),
        id_measure: Number.parseInt(formData.id_measure),
        quantity: Number.parseFloat(formData.quantity),
        min_stock: Number.parseFloat(formData.min_stock),
        price: Number.parseFloat(formData.price),
      };

      await createProduct(payload);
      toast.success('Producto creado exitosamente');
      handleAddProduct();
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      toast.error(error.message || 'Error al crear el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const exportCurrentProducts = async () => {
    try {
      toast.info('Exportando todos los productos...');
      
      // Construir endpoint igual que en el hook useProducts
      let endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}?page=1&limit=10000&type=${productType}`;
      
      // Agregar parámetro de búsqueda si existe
      if (debouncedSearch && debouncedSearch.trim()) {
        endpoint += `&search=${encodeURIComponent(debouncedSearch.trim())}`;
      }

      console.log('Exportando productos desde:', endpoint);

      // Usar apiRequest en lugar de fetch
      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      console.log('Respuesta de exportación:', response);

      if (!response || !response.success || !response.data) {
        throw new Error('No se recibieron datos válidos del servidor');
      }

      const allProducts = response.data || [];

      if (allProducts.length === 0) {
        toast.error('No hay productos para exportar');
        return;
      }

      // Convertir TODOS los productos al formato del bulk upload
      const exportData = allProducts.map((product: Product) => ({
        'Nombre *': product.name,
        'SKU *': product.sku,
        'Tipo *': product.type,
        'ID Categoría': product.id_category,
        'ID Origen *': product.id_origin,
        'ID Medida *': product.id_measure,
        'Cantidad Inicial': product.quantity,
        'Stock Mínimo': product.min_stock,
        'Precio *': product.price,
      }));

      const wb = createWorkbook();
      addSheetFromJson(wb, 'Productos', exportData);

      const helpData = [
        ['CATÁLOGO DE CATEGORÍAS'],
        ['ID', 'Nombre'],
        ...categories.map((c) => [c.id, c.name]),
        [],
        ['CATÁLOGO DE ORÍGENES'],
        ['ID', 'Nombre'],
        ...origins.map((o) => [o.id, o.name]),
        [],
        ['CATÁLOGO DE MEDIDAS'],
        ['ID', 'Nombre', 'Abreviación'],
        ...measures.map((m) => [m.id, m.name, m.abbreviation]),
      ];
      addSheetFromAoa(wb, 'Catálogos', helpData);

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = productType === 'PF'
        ? `productos_finales_${timestamp}.xlsx`
        : `materias_primas_${timestamp}.xlsx`;
      await downloadWorkbook(wb, fileName);
      toast.success(`${allProducts.length} producto${allProducts.length > 1 ? 's' : ''} exportado${allProducts.length > 1 ? 's' : ''} exitosamente`);
    } catch (error: any) {
      console.error('Error al exportar productos:', error);
      toast.error(error.message || 'Error al exportar los productos');
    }
  };

  const handleExportProducts = () => {
    exportCurrentProducts();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      id_category: '',
      id_origin: '',
      id_measure: '',
      quantity: '',
      min_stock: '',
      price: '', // Precio obligatorio
    });
    setNewProductType('PF');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-1 sm:mb-2 text-neutral-900">Gestión de Productos</h1>
          <p className="text-sm sm:text-base text-neutral-600">Administra el inventario de productos</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleExportProducts} variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Download className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button onClick={() => setIsBulkUploadOpen(true)} variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Upload className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Importar</span>
          </Button>
          <Button onClick={() => { setIsAddDialogOpen(true); resetForm(); }} className="bg-[#006A4E] hover:bg-[#005a42] text-white flex-1 sm:flex-none" size="sm">
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="sm:inline">Nuevo Producto</span>
          </Button>
        </div>
      </div>

      {/* Tabs para Materia Prima y Producto Final */}
      <Tabs value={productType} onValueChange={(value) => {
        setProductType(value as 'MP' | 'PF');
        setCurrentPage(1); // Reset página al cambiar de tipo
        setSearchTerm(''); // Limpiar búsqueda
      }}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="PF">Productos Finales</TabsTrigger>
          <TabsTrigger value="MP">Materias Primas</TabsTrigger>
        </TabsList>

        <TabsContent value={productType} className="space-y-4 mt-6">
          {/* Estadísticas - Después del título y descripción */}
          {!isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="text-xl sm:text-2xl font-bold">{pagination.total}</div>
                  <p className="text-xs text-gray-600">
                    {productType === 'PF' ? 'Total Productos' : 'Total Materias'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {products.filter(p => p.quantity > p.min_stock * 1.5).length}
                  </div>
                  <p className="text-xs text-gray-600">Stock Normal</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {products.filter(p => p.quantity > p.min_stock && p.quantity <= p.min_stock * 1.5).length}
                  </div>
                  <p className="text-xs text-gray-600">Stock Bajo</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {products.filter(p => p.quantity <= p.min_stock).length}
                  </div>
                  <p className="text-xs text-gray-600">Stock Crítico</p>
                </CardContent>
              </Card>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  {productType === 'PF' ? 'Productos Finales' : 'Materias Primas'}
                </CardTitle>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl w-[95vw] sm:w-full p-4 sm:p-6">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">Agregar Nuevo Producto</DialogTitle>
                      <DialogDescription className="text-sm">
                        Completa todos los campos para registrar un nuevo producto en el inventario
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      {/* SELECTOR DE TIPO DE PRODUCTO - MINIMALISTA */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-900">
                          Tipo de Producto *
                        </Label>
                        <Select value={newProductType} onValueChange={(value: 'MP' | 'PF') => {
                          setNewProductType(value);
                          setFormData(prev => ({ ...prev, quantity: '', min_stock: '' }));
                        }}>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PF" className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#006A4E]"></div>
                                <span className="font-medium">Producto Final</span>
                                <span className="text-xs text-gray-500 hidden sm:inline">· Solo enteros</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="MP" className="cursor-pointer">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                <span className="font-medium">Materia Prima</span>
                                <span className="text-xs text-gray-500 hidden sm:inline">· Permite decimales</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {/* Mensaje informativo minimalista */}
                        <p className="text-xs text-gray-600">
                          {newProductType === 'MP' 
                            ? 'Puedes ingresar cantidades con decimales (ej: 15.75 kg)' 
                            : 'Solo se permiten cantidades enteras (ej: 100 unidades)'}
                        </p>
                      </div>

                      {/* Información básica */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-sm">Nombre del Producto *</Label>
                          <Input
                            placeholder="Ej: CHIFLE LIMON"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">SKU *</Label>
                          <Input
                            placeholder="Ej: CHI-LIM-001"
                            value={formData.sku}
                            onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Categoría *</Label>
                          <Select
                            value={formData.id_category}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, id_category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={categoriesLoading ? "Cargando..." : "Seleccionar categoría"} />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriesLoading ? (
                                <SelectItem value="_loading" disabled>Cargando categorías...</SelectItem>
                              ) : categories.length === 0 ? (
                                <SelectItem value="_empty" disabled>No hay categorías disponibles</SelectItem>
                              ) : (
                                categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Origen/Planta *</Label>
                          <Select
                            value={formData.id_origin}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, id_origin: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={originsLoading ? "Cargando..." : "Seleccionar origen"} />
                            </SelectTrigger>
                            <SelectContent>
                              {originsLoading ? (
                                <SelectItem value="_loading" disabled>Cargando orígenes...</SelectItem>
                              ) : origins.length === 0 ? (
                                <SelectItem value="_empty" disabled>No hay orígenes disponibles</SelectItem>
                              ) : (
                                origins.map((origin) => (
                                  <SelectItem key={origin.id} value={origin.id.toString()}>
                                    {origin.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Unidad de Medida *</Label>
                          <Select
                            value={formData.id_measure}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, id_measure: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={measuresLoading ? "Cargando..." : "Seleccionar unidad"} />
                            </SelectTrigger>
                            <SelectContent>
                              {measuresLoading ? (
                                <SelectItem value="_loading" disabled>Cargando unidades...</SelectItem>
                              ) : measures.length === 0 ? (
                                <SelectItem value="_empty" disabled>No hay unidades disponibles</SelectItem>
                              ) : (
                                measures.map((measure) => (
                                  <SelectItem key={measure.id} value={measure.id.toString()}>
                                    {measure.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Cantidades con validación según el tipo */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-2">
                          <Label className="text-sm">
                            Stock Actual *
                            <span className="text-xs text-gray-500 font-normal ml-1">
                              {newProductType === 'MP' ? '(decimales)' : '(enteros)'}
                            </span>
                          </Label>
                          <Input
                            type="number"
                            step={newProductType === 'MP' ? '0.01' : '1'}
                            min="0"
                            placeholder={newProductType === 'MP' ? '0.00' : '0'}
                            value={formData.quantity}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (newProductType === 'PF') {
                                setFormData(prev => ({ ...prev, quantity: value.replace(/\./g, '') }));
                              } else {
                                setFormData(prev => ({ ...prev, quantity: value }));
                              }
                            }}
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">
                            Stock Mínimo *
                            <span className="text-xs text-gray-500 font-normal ml-1">
                              {newProductType === 'MP' ? '(decimales)' : '(enteros)'}
                            </span>
                          </Label>
                          <Input
                            type="number"
                            step={newProductType === 'MP' ? '0.01' : '1'}
                            min="0"
                            placeholder={newProductType === 'MP' ? '0.00' : '0'}
                            value={formData.min_stock}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (newProductType === 'PF') {
                                setFormData(prev => ({ ...prev, min_stock: value.replace(/\./g, '') }));
                              } else {
                                setFormData(prev => ({ ...prev, min_stock: value }));
                              }
                            }}
                            className="font-mono"
                          />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label className="text-sm">Precio *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            className="font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                        Cancelar
                      </Button>
                      <Button
                        onClick={validateAndSubmitProduct}
                        className="bg-[#006A4E] hover:bg-[#005a42] w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Guardando...' : 'Guardar Producto'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Barra de búsqueda */}
              <div className="mb-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nombre, SKU, categoría o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                  setItemsPerPage(Number.parseInt(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 por pág</SelectItem>
                    <SelectItem value="25">25 por pág</SelectItem>
                    <SelectItem value="50">50 por pág</SelectItem>
                    <SelectItem value="100">100 por pág</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Mensaje de error */}
              {error && !isLoading && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </p>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando productos...</p>
                  </div>
                </div>
              )}

              {/* Tabla de productos - Desktop */}
              {!isLoading && (
                <>
                  {/* Vista Mobile - Cards */}
                  <div className="lg:hidden space-y-3">
                    {products.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>{debouncedSearch ? 'No se encontraron productos' : 'No hay productos disponibles'}</p>
                      </div>
                    ) : (
                      products.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            {/* Header del producto */}
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-base text-neutral-900 mb-1">
                                  {product.name}
                                </h3>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                  {product.sku}
                                </code>
                              </div>
                              <StockBadge
                                current={product.quantity}
                                minimum={product.min_stock}
                              />
                            </div>

                            {/* Info principal */}
                            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Categoría</p>
                                <Badge variant="outline" className="text-xs">
                                  {product.category_name || 'Sin categoría'}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Origen</p>
                                <p className="text-sm text-gray-900">{product.origin_name || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Stock Actual</p>
                                <p className={`text-sm font-semibold ${
                                  product.quantity <= product.min_stock ? 'text-red-600' : 'text-gray-900'
                                }`}>
                                  {product.quantity} {product.measure_name}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Stock Mínimo</p>
                                <p className="text-sm text-gray-900">{product.min_stock}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Precio</p>
                                <p className="text-lg font-bold text-[#006A4E]">
                                  {formatPrice(product.price || 0)}
                                </p>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-2 pt-3 border-t border-gray-100">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowDetail(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="flex-1"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id.toString())}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {/* Vista Desktop - Tabla */}
                  <div className="hidden lg:block rounded-lg border border-neutral-200 overflow-hidden bg-white shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Producto</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Origen</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Stock Actual</TableHead>
                          <TableHead>Stock Mín</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                              {debouncedSearch ? 'No se encontraron productos con ese criterio de búsqueda' : 'No hay productos disponibles'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          products.map((product) => (
                            <TableRow key={product.id}>
                              <TableCell>
                                <div className="font-medium">{product.name}</div>
                              </TableCell>
                              <TableCell>
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {product.sku}
                                </code>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{product.category_name || 'Sin categoría'}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{product.origin_name || 'N/A'}</div>
                              </TableCell>
                              <TableCell>
                                <span className="font-mono text-sm">{formatPrice(product.price || 0)}</span>
                              </TableCell>
                              <TableCell>
                                <span className={product.quantity <= product.min_stock ? 'text-red-600 font-semibold' : ''}>
                                  {product.quantity}
                                </span>
                              </TableCell>
                              <TableCell>{product.min_stock}</TableCell>
                              <TableCell>
                                <StockBadge
                                  current={product.quantity}
                                  minimum={product.min_stock}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    title="Ver Detalles"
                                    onClick={() => {
                                      setSelectedProduct(product);
                                      setShowDetail(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" title="Editar">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product.id.toString())}
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Paginación */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                        {pagination.total} productos
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Anterior
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .filter(page => {
                              // Mostrar solo algunas páginas alrededor de la actual
                              return page === 1 || 
                                     page === pagination.totalPages || 
                                     (page >= currentPage - 1 && page <= currentPage + 1);
                            })
                            .map((page, idx, arr) => (
                              <span key={page}>
                                {idx > 0 && arr[idx - 1] !== page - 1 && (
                                  <span className="px-2 text-gray-400">...</span>
                                )}
                                <Button
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              </span>
                            ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                          disabled={currentPage === pagination.totalPages}
                        >
                          Siguiente
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          <BulkProductUpload
            isOpen={isBulkUploadOpen}
            onClose={() => setIsBulkUploadOpen(false)}
            onUpload={bulkCreateProducts}
            categories={categories}
            origins={origins}
            measures={measures}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}