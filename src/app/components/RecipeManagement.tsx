import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { 
  ChefHat, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  Search, 
  Package, 
  AlertTriangle, 
  RefreshCw,
  DollarSign,
  AlertCircle,
  BookOpen,
  Filter,
  Layers,
  TrendingUp,
  Edit,
  Calculator,
  CheckCircle2,
  X,
  ChevronDown
} from 'lucide-react';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from './ui/accordion';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { useRecipes, Recipe, CreateRecipeData } from '../hooks/useRecipes';
import { useProducts } from '../hooks/useProducts';

// Interfaz para materiales en el formulario
interface RecipeMaterialRow {
  id_product: number;
  quantity: number;
  tempId: string;
  id_recipe?: number;
}

export default function RecipeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  
  // Form state - ahora maneja múltiples materiales
  const [selectedProductForRecipe, setSelectedProductForRecipe] = useState<string>('');
  const [recipeMaterials, setRecipeMaterials] = useState<RecipeMaterialRow[]>([]);

  // Hooks
  const { recipes, isLoading, refetch, createRecipe, createRecipeWithMaterials, updateRecipe, updateCompleteRecipe, deleteRecipe, getRecipesByProduct } = useRecipes();
  
  // Cargar productos y materiales desde hooks individuales
  const { products: allProducts, isLoading: productsLoading } = useProducts(1, 1000);
  const { products: materials, isLoading: materialsLoading, error: materialsError, refetch: refetchMaterials } = useProducts(1, 1000, 'MP');
  
  // Filtrar solo productos finales (type = 'PF')
  const finalProducts = Array.isArray(allProducts) ? allProducts.filter(p => p.type === 'PF') : [];

  // Agrupar recetas por producto
  const recipesByProduct = getRecipesByProduct();

  // Filtrar por búsqueda
  const filteredProducts = Object.entries(recipesByProduct).filter(([_, data]) => 
    data.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    data.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir modal para crear/editar receta completa
  const handleOpenDialog = async (productId?: string) => {
    // Refrescar materiales antes de abrir el diálogo
    console.log('Refrescando materiales antes de abrir el diálogo...');
    await refetchMaterials();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ABRIENDO MODAL DE RECETA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Estado de materiales:');
    console.log('   - Total materiales disponibles:', materials.length);
    console.log('   - Cargando:', materialsLoading);
    console.log('   - Error:', materialsError);
    console.log('   - Fuente: useData() -> DataContext -> API /products/materials');
    if (materials.length > 0) {
      console.log('   - Materiales cargados desde API:');
      materials.slice(0, 5).forEach((mat, idx) => {
        console.log(`      ${idx + 1}. ${mat.name} (${mat.sku})`);
      });
      if (materials.length > 5) {
        console.log(`      ... y ${materials.length - 5} más`);
      }
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (productId) {
      // Modo edición: cargar receta existente desde productsWithRecipes
      setEditingProductId(productId);
      setSelectedProductForRecipe(productId);
      const productIdNum = Number(productId);
      const data = recipesByProduct[productIdNum];
      const loadedMaterials: RecipeMaterialRow[] = data?.materials?.map((m) => ({
        id_product: m.id_product ?? m.id,
        quantity: m.quantity ?? 0,
        tempId: String(m.id),
        id_recipe: m.id,
      })) ?? [];
      setRecipeMaterials(loadedMaterials);
    } else {
      // Modo creación: formulario vacío
      setEditingProductId(null);
      setSelectedProductForRecipe(finalProducts[0]?.id ? String(finalProducts[0].id) : '');
      setRecipeMaterials([]);
    }
    setIsDialogOpen(true);
  };

  // Agregar una nueva fila de material
  const handleAddMaterialRow = () => {
    const newRow: RecipeMaterialRow = {
      id_product: 0,
      quantity: 0,
      tempId: `temp-${Date.now()}-${Math.random()}`,
    };
    setRecipeMaterials([...recipeMaterials, newRow]);
  };

  // Actualizar un material en la fila
  const handleUpdateMaterialRow = (tempId: string, field: keyof RecipeMaterialRow, value: string | number) => {
    setRecipeMaterials(recipeMaterials.map(row => {
      if (row.tempId === tempId) {
        return { ...row, [field]: field === 'id_product' || field === 'quantity' || field === 'id_recipe' ? Number(value) : value };
      }
      return row;
    }));
  };

  // Eliminar una fila de material
  const handleRemoveMaterialRow = (tempId: string) => {
    setRecipeMaterials(recipeMaterials.filter(row => row.tempId !== tempId));
  };

  // Guardar receta completa (crear o actualizar múltiples materiales)
  const handleSaveRecipe = async () => {
    try {
      // Validaciones
      if (!selectedProductForRecipe) {
        toast.error('Selecciona un producto para la receta');
        return;
      }

      if (recipeMaterials.length === 0) {
        toast.error('Agrega al menos un material a la receta');
        return;
      }

      // Validar que todos los materiales estén completos
      const invalidRows = recipeMaterials.filter(
        row => !row.id_product
      );

      if (invalidRows.length > 0) {
        console.error('Filas inválidas encontradas:', invalidRows);
        toast.error('Completa todos los materiales con cantidad válida');
        return;
      }

      // Verificar duplicados
      const materialIds = recipeMaterials.map(r => r.id_product);
      const hasDuplicates = materialIds.length !== new Set(materialIds).size;
      
      if (hasDuplicates) {
        toast.error('No puedes agregar el mismo material dos veces');
        return;
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('VALIDACIÓN COMPLETA - Preparando envío al backend');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Datos del formulario:');
      console.log('  - Producto ID:', selectedProductForRecipe);
      console.log('  - Total materiales:', recipeMaterials.length);
      console.log('\nMateriales seleccionados:');
      recipeMaterials.forEach((row, idx) => {
        const material = materials.find(m => m.id === row.id_product);
        console.log(`  ${idx + 1}. Material:`, {
          nombre: material?.name || 'Desconocido',
          sku: material?.sku || 'N/A',
          id_product: row.id_product,
          unit: material?.measure_name || 'N/A'
        });
      });
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Si estamos creando una nueva receta, usar el endpoint que acepta múltiples materiales
      if (!editingProductId) {
        const recipeRequest: CreateRecipeData = {
          id_product: Number(selectedProductForRecipe),
          materials: recipeMaterials.map(row => ({
            id_product: Number(row.id_product),
            quantity: Number(row.quantity),
          })),
        };

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('REQUEST BODY - CREAR RECETA (POST)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Body completo:');
        console.log(JSON.stringify(recipeRequest, null, 2));
        console.log('');
        console.log('Detalle por campo:');
        console.log('   └─ id_product (Producto Final):', recipeRequest.id_product, `(tipo: ${typeof recipeRequest.id_product})`);
        console.log('   └─ materials (total):', recipeRequest.materials.length);
        recipeRequest.materials.forEach((mat, idx) => {
          const materialInfo = materials.find(m => m.id === mat.id_product);
          console.log(`      ${idx + 1}. ${materialInfo?.name || 'Desconocido'} (${materialInfo?.sku || 'N/A'})`);
          console.log(`         - id_product: ${mat.id_product} (tipo: ${typeof mat.id_product})`);
        });
        console.log('NOTA: POST no envía quantity_required según Swagger');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await createRecipeWithMaterials(recipeRequest);
        toast.success('Receta creada correctamente');
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('RECETA CREADA - Recargando lista de recetas...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } else {
        // ⭐ USAR EL NUEVO ENDPOINT RECOMENDADO para actualizar recetas completas
        const materialsToUpdate = recipeMaterials.map(row => ({
          id_product: Number(row.id_product), // ID del material
          quantity_required: Number(row.quantity), // Cantidad requerida
        }));

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('ACTUALIZANDO RECETA COMPLETA');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Body completo:');
        console.log(JSON.stringify({
          id_product: Number(selectedProductForRecipe),
          materials: materialsToUpdate
        }, null, 2));
        console.log('');
        console.log('Detalle por campo:');
        console.log('   └─ id_product (Producto Final):', Number(selectedProductForRecipe), `(tipo: ${typeof Number(selectedProductForRecipe)})`);
        console.log('   └─ materials (total):', materialsToUpdate.length);
        materialsToUpdate.forEach((mat, idx) => {
          const materialInfo = materials.find(m => m.id === mat.id_product);
          console.log(`      ${idx + 1}. ${materialInfo?.name || 'Desconocido'} (${materialInfo?.sku || 'N/A'})`);
          console.log(`         - id_product: ${mat.id_product} (tipo: ${typeof mat.id_product})`);
          console.log(`         - quantity_required: ${mat.quantity_required} (tipo: ${typeof mat.quantity_required})`);
        });
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const response = await updateCompleteRecipe(Number(selectedProductForRecipe), materialsToUpdate);

        console.log('Resultado de actualización:');
        console.log('   - Agregados:', response.data?.changes?.added || 0);
        console.log('   - Actualizados:', response.data?.changes?.updated || 0);
        console.log('   - Eliminados:', response.data?.changes?.removed || 0);

        toast.success(response.message || 'Receta actualizada correctamente');
      }
      
      setIsDialogOpen(false);
      setRecipeMaterials([]);
      setSelectedProductForRecipe('');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar la receta');
      console.error(error)
    }
  };

  const handleDeleteRecipe = async (idrecipe: string, materialName: string) => {
    if (confirm(`¿Estás seguro de eliminar "${materialName}" de esta receta?`)) {
      try {
        await deleteRecipe(Number(idrecipe));
        toast.success('Material eliminado de la receta');
        refetch();
      } catch (error) {
        toast.error('Error al eliminar el material');
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  // Calcular totales
  const totalRecipes = Object.keys(recipesByProduct).length;
  const totalMaterials = Object.values(recipesByProduct).reduce((sum, p) => sum + p.materials.length, 0);

  // Manejar selección múltiple de productos
  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const toggleAllProducts = () => {
    if (selectedProducts.length === finalProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(finalProducts.map(p => String(p.id)));
    }
  };

  // Filtrar productos en el popover por búsqueda
  const filteredProductsInPopover = finalProducts.filter(product =>
    product.name.toLowerCase().includes(filterSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(filterSearch.toLowerCase())
  );

  // Filtrar recetas por productos seleccionados Y búsqueda general
  const filteredRecipesList = Object.entries(recipesByProduct).filter(([productId, data]) => {
    const matchesSearch =  
      data.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      data.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      selectedProducts.length === 0 || selectedProducts.includes(productId);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl mb-1 sm:mb-2 text-neutral-900">Gestión de Recetas</h1>
          <p className="text-sm sm:text-base text-neutral-600">Define los materiales necesarios para fabricar cada producto</p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCw className={`h-4 w-4 sm:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Recetas Totales</p>
              <ChefHat className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold">{totalRecipes}</div>
            <p className="text-xs text-gray-500 mt-1">productos con receta</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Materiales Usados</p>
              <Package className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold">{totalMaterials}</div>
            <p className="text-xs text-gray-500 mt-1">items en recetas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Sin Receta</p>
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold">
              {finalProducts.length - totalRecipes}
            </div>
            <p className="text-xs text-gray-500 mt-1">productos pendientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <BookOpen className="h-5 w-5" />
            Recetas de Productos
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Administra los ingredientes y materiales necesarios para cada producto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[280px] justify-between">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {selectedProducts.length === 0
                        ? 'Todos los productos'
                        : selectedProducts.length === 1
                        ? finalProducts.find(p => String(p.id) === selectedProducts[0])?.name || '1 producto'
                        : `${selectedProducts.length} productos`}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0" align="start">
                <div className="flex flex-col max-h-[400px]">
                  {/* Buscador dentro del popover */}
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar productos..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                  </div>

                  {/* Opciones de selección */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Opción "Todos" */}
                    <div className="px-3 py-2 border-b bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="select-all"
                          checked={selectedProducts.length === finalProducts.length}
                          onCheckedChange={toggleAllProducts}
                        />
                        <label
                          htmlFor="select-all"
                          className="text-sm font-medium cursor-pointer flex-1"
                        >
                          {selectedProducts.length === finalProducts.length
                            ? 'Deseleccionar todos'
                            : 'Seleccionar todos'}
                        </label>
                        <Badge variant="secondary" className="text-xs">
                          {finalProducts.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Lista de productos */}
                    <div className="p-2">
                      {filteredProductsInPopover.length === 0 ? (
                        <div className="text-center py-6 text-sm text-gray-500">
                          No se encontraron productos
                        </div>
                      ) : (
                        filteredProductsInPopover.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center space-x-2 rounded-md px-2 py-2.5 hover:bg-gray-100 cursor-pointer"
                            onClick={() => toggleProductSelection(String(product.id))}
                          >
                            <Checkbox
                              id={`product-${product.id}`}
                              checked={selectedProducts.includes(String(product.id))}
                              onCheckedChange={() => toggleProductSelection(String(product.id))}
                            />
                            <label
                              htmlFor={`product-${product.id}`}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{product.name}</span>
                                <span className="text-xs text-gray-500">{product.sku}</span>
                              </div>
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Footer con contador */}
                  {selectedProducts.length > 0 && (
                    <div className="border-t p-3 bg-gray-50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProducts([])}
                          className="h-7 text-xs"
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Receta
            </Button>
          </div>

          {/* Lista de recetas por producto */}
          <div className="mt-6">{isLoading ? (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
                <p>Cargando recetas...</p>
              </div>
            ) : filteredRecipesList.length === 0 ? (
              <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed">
                <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No se encontraron recetas</p>
                <p className="text-sm mb-4">
                  {selectedProducts.length > 0 
                    ? 'No hay recetas para los productos seleccionados' 
                    : 'Comienza creando una receta para tus productos'}
                </p>
                <Button onClick={() => handleOpenDialog()} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Receta
                </Button>
              </div>
            ) : (
              <Accordion type="multiple" className="space-y-3">
                {filteredRecipesList.map(([productId, data]) => (
                  <AccordionItem 
                    key={productId} 
                    value={productId}
                    className="border-2 border-neutral-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="px-4 sm:px-6 py-3 sm:py-4 hover:no-underline hover:bg-gray-50/50">
                      <div className="flex items-center justify-between w-full pr-2 sm:pr-4">
                        {/* Left: Product Info */}
                        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                          <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                            <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-lg text-gray-900 truncate">
                              {data.product_name}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-xs sm:text-sm text-gray-600">
                              <code className="bg-gray-100 px-2 py-0.5 rounded text-xs w-fit">
                                {data.sku}
                              </code>
                              <span className="flex items-center gap-1">
                                <Layers className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                {data.materials.length} materiales
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Edit Button */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDialog(productId);
                          }}
                          className="shrink-0 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border border-neutral-300 rounded-md hover:bg-neutral-100 cursor-pointer transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm font-medium hidden sm:inline">Editar</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    
                    <AccordionContent className="px-4 sm:px-6 pb-4 pt-0">
                      <div className="border-t border-neutral-200 pt-4">
                        {/* Resumen simple */}
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-3 sm:p-4 mb-4">
                          <div className="flex items-center justify-center gap-2">
                            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                            <p className="text-xs sm:text-sm text-gray-600">
                              Esta receta utiliza <span className="font-bold text-gray-900">{data.materials.length}</span> materiales
                            </p>
                          </div>
                        </div>

                        {/* Vista Mobile - Cards */}
                        <div className="lg:hidden space-y-2">
                          {data.materials.map((material) => (
                            <Card key={material.id} className="overflow-hidden">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-sm text-gray-900 truncate">
                                        {material.name}
                                      </h4>
                                      <code className="bg-gray-100 px-2 py-0.5 rounded text-xs text-gray-700 inline-block mt-1">
                                        {material.code}
                                      </code>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteRecipe(String(data.id_product), material.name)}
                                    className="hover:bg-red-50 hover:text-red-700 h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-500">Unidad:</span>
                                  <Badge variant="outline" className="font-mono font-semibold text-xs">
                                    {material.measure_name}
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        {/* Vista Desktop - Tabla */}
                        <div className="hidden lg:block overflow-x-auto rounded-lg border border-neutral-200">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="font-semibold">Material</TableHead>
                                <TableHead className="font-semibold">Código SKU</TableHead>
                                <TableHead className="font-semibold">Unidad de Medida</TableHead>
                                <TableHead className="font-semibold text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.materials.map((material) => (
                                <TableRow key={material.id} className="hover:bg-gray-50/50">
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                      {material.name}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                      {material.code}
                                    </code>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="font-mono font-semibold">
                                      {material.measure_name}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteRecipe(String(data.id_product), material.name)}
                                      className="hover:bg-red-50 hover:text-red-700"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para agregar/editar material en receta */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] flex flex-col p-0">
          {/* Header */}
          <DialogHeader className="px-4 sm:px-6 pt-5 pb-4 border-b">
            <DialogTitle className="text-base sm:text-lg">
              {editingProductId ? 'Editar Receta' : 'Nueva Receta'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Selecciona el producto y agrega sus materiales
            </DialogDescription>
          </DialogHeader>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6">
            {/* Alerta si no hay materiales disponibles */}
            {materials.length === 0 && (
              <Alert className="border-orange-200 bg-orange-50 mt-4">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-xs sm:text-sm text-orange-800">
                  <strong>No hay materiales disponibles</strong>
                  <div className="mt-1">
                    {materialsLoading ? (
                      'Cargando materiales...'
                    ) : materialsError ? (
                      `Error: ${materialsError}`
                    ) : (
                      'Primero crea materias primas en Productos.'
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-5 py-4 sm:py-5">
              {/* Selector de producto */}
              <div className="space-y-2">
                <Label htmlFor="idfinal_product" className="text-sm">Producto Final *</Label>
                <Select
                  value={selectedProductForRecipe}
                  onValueChange={(value) => setSelectedProductForRecipe(value)}
                  disabled={!!editingProductId}
                >
                  <SelectTrigger id="idfinal_product" className="h-11">
                    <SelectValue placeholder="Selecciona un producto..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[280px]">
                    {finalProducts.map((product) => (
                      <SelectItem 
                        key={product.id} 
                        value={String(product.id)}
                        className="py-2.5"
                      >
                        <span className="font-medium">{product.name}</span>
                        <span className="text-xs text-gray-500 ml-2">· {product.sku}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editingProductId && (
                  <p className="text-xs text-gray-500">No puedes cambiar el producto al editar</p>
                )}
              </div>

              {/* Tabla de materiales dinámicos */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm">Materiales *</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMaterialRow}
                    type="button"
                    disabled={materials.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                </div>

                {recipeMaterials.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50">
                    <Package className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">No hay materiales agregados</p>
                    <p className="text-xs text-gray-500 mt-1">Haz clic en "Agregar"</p>
                  </div>
                ) : (
                  <>
                    {/* Mobile - Cards */}
                    <div className="lg:hidden space-y-2">
                      {recipeMaterials.map((row) => {
                        const material = materials.find(m => m.id === row.id_product);
                        
                        return (
                          <Card key={row.tempId} className="border">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <Select
                                    value={String(row.id_product)}
                                    onValueChange={(value) => handleUpdateMaterialRow(row.tempId, 'id_product', Number(value))}
                                  >
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[200px]">
                                      {materials.map((mat) => (
                                        <SelectItem key={mat.id} value={String(mat.id)}>
                                          <span className="text-sm font-medium">{mat.name}</span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveMaterialRow(row.tempId)}
                                  type="button"
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 shrink-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              {material && (
                                <div className="flex items-center gap-3 text-xs text-gray-600">
                                  <code className="bg-gray-100 px-2 py-0.5 rounded">{material.sku}</code>
                                  <Badge variant="outline" className="text-xs font-mono">{material.measure_name}</Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {/* Desktop - Tabla */}
                    <div className="hidden lg:block border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead>Material</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Unidad</TableHead>
                            <TableHead className="w-20"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recipeMaterials.map((row) => {
                            const material = materials.find(m => m.id === row.id_product);
                            
                            return (
                              <TableRow key={row.tempId}>
                                <TableCell>
                                  <Select
                                    value={String(row.id_product)}
                                    onValueChange={(value) => handleUpdateMaterialRow(row.tempId, 'id_product', Number(value))}
                                  >
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Seleccionar..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {materials.map((mat) => (
                                        <SelectItem key={mat.id} value={String(mat.id)}>
                                          {mat.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell>
                                  <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {material?.sku || '-'}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="font-mono">
                                    {material?.measure_name || '-'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveMaterialRow(row.tempId)}
                                    type="button"
                                    className="hover:bg-red-50 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Contador */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <span className="text-sm text-gray-600">Total materiales:</span>
                      <span className="text-lg font-semibold text-[#006A4E]">{recipeMaterials.length}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer con botones fijos */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 px-4 sm:px-6 py-4 border-t bg-gray-50">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              type="button"
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveRecipe} 
              type="button"
              className="w-full sm:w-auto bg-[#006A4E] hover:bg-[#005a42]"
              disabled={!selectedProductForRecipe || recipeMaterials.length === 0}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {editingProductId ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}