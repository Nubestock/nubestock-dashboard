import { useState } from 'react';
import {
  useCategories,
  Category,
  CategoryCreateData,
  CategoryUpdateData,
} from '../hooks/useProducts';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
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
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Plus, Pencil, Trash2, FolderOpen, Search, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CategoryManagement() {
  const { 
    categories, 
    isLoading, 
    error, 
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();

  // Estados para diálogos
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del formulario
  const [formData, setFormData] = useState<CategoryCreateData>({
    name: '',
  });

  // Filtrar categorías según búsqueda
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      name: '',
    });
  };

  // Abrir diálogo de creación
  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  // Abrir diálogo de edición
  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
    });
    setIsEditDialogOpen(true);
  };

  // Abrir diálogo de eliminación
  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Guardar nueva categoría
  const handleSaveCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    setIsSaving(true);
    try {
      await createCategory(formData);
      toast.success('Categoría creada exitosamente');
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Guardar edición
  const handleSaveEdit = async () => {
    if (!selectedCategory) return;
    
    if (!formData.name.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    setIsSaving(true);
    try {
      const updateData: CategoryUpdateData = {
        name: formData.name,
      };

      await updateCategory(selectedCategory.id, updateData);
      toast.success('Categoría actualizada exitosamente');
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;

    setIsSaving(true);
    try {
      await deleteCategory(selectedCategory.id);
      toast.success('Categoría eliminada exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Error al cargar categorías: {error}</p>
            <Button onClick={refetch} className="mt-4 bg-[#006A4E] hover:bg-[#005741]">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-[#006A4E]/10 rounded-xl blur-md"></div>
            <div className="relative w-12 h-12 bg-[#006A4E] rounded-xl flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-neutral-900">Gestión de Categorías</h1>
            <p className="text-neutral-600">Organiza y administra las categorías de productos</p>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <Card className="mb-6 border-neutral-200 shadow-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Buscador */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar categorías..."
                className="pl-10 border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Botón crear */}
            <Button 
              onClick={handleCreate}
              className="bg-[#006A4E] hover:bg-[#005741] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de categorías */}
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader className="border-b border-neutral-100">
          <CardTitle>Categorías</CardTitle>
          <CardDescription>
            {filteredCategories.length} categoría(s) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#006A4E]" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
              <p className="text-neutral-600">
                {searchTerm ? 'No se encontraron categorías' : 'No hay categorías registradas'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleCreate} 
                  className="mt-4 bg-[#006A4E] hover:bg-[#005741]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primera categoría
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Nombre</TableHead>
                    <TableHead className="font-semibold">Estado</TableHead>
                    <TableHead className="font-semibold text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.map((category) => (
                    <TableRow 
                      key={category.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <TableCell className="font-mono text-sm text-neutral-600">
                        #{category.id}
                      </TableCell>
                      <TableCell className="font-medium text-neutral-900">
                        {category.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.is_active ? 'default' : 'secondary'}
                          className={
                            category.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-100'
                              : 'bg-neutral-200 text-neutral-600'
                          }
                        >
                          {category.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                            className="text-neutral-600 hover:text-[#006A4E] hover:bg-[#006A4E]/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category)}
                            className="text-neutral-600 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo de creación */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#006A4E] rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              Nueva Categoría
            </DialogTitle>
            <DialogDescription>
              Crea una nueva categoría para organizar tus productos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Snacks, Bebidas, etc."
                className="border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveCreate}
              disabled={isSaving}
              className="bg-[#006A4E] hover:bg-[#005741]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Categoría'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#006A4E] rounded-lg flex items-center justify-center">
                <Pencil className="h-4 w-4 text-white" />
              </div>
              Editar Categoría
            </DialogTitle>
            <DialogDescription>
              Modifica los datos de la categoría
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre de la categoría"
                className="border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-[#006A4E] hover:bg-[#005741]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-red-600" />
              </div>
              ¿Eliminar categoría?
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la categoría{' '}
              <span className="font-semibold text-neutral-900">
                "{selectedCategory?.name}"
              </span>
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}