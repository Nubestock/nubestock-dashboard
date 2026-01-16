import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
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
import { Badge } from './ui/badge';
import { Ruler, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMeasures, type Measure, type CreateMeasureInput, type UpdateMeasureInput } from '../hooks/useMeasures';

export default function MeasureManagement() {
  const { measures, loading, error, createMeasure, updateMeasure, deleteMeasure } = useMeasures();

  // Estados para el diálogo de crear/editar
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeasure, setEditingMeasure] = useState<Measure | null>(null);
  const [formData, setFormData] = useState<CreateMeasureInput>({
    name: '', // Abreviatura (máx 5 caracteres)
    description: '', // Descripción completa (requerido)
  });
  const [isSaving, setIsSaving] = useState(false);

  // Estados para el diálogo de eliminar
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [measureToDelete, setMeasureToDelete] = useState<Measure | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Abrir diálogo para crear
  const handleCreate = () => {
    setEditingMeasure(null);
    setFormData({ name: '', description: '' });
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar
  const handleEdit = (measure: Measure) => {
    setEditingMeasure(measure);
    setFormData({
      name: measure.name,
      description: measure.description,
    });
    setIsDialogOpen(true);
  };

  // Guardar (crear o actualizar)
  const handleSave = async () => {
    // Validaciones
    if (!formData.name.trim()) {
      toast.error('La abreviatura es obligatoria');
      return;
    }
    if (formData.name.trim().length > 5) {
      toast.error('La abreviatura no puede tener más de 5 caracteres');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }
    if (formData.description.trim().length > 100) {
      toast.error('La descripción no puede tener más de 100 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      if (editingMeasure) {
        // Actualizar
        const updateData: UpdateMeasureInput = {
          name: formData.name.trim().toUpperCase(),
          description: formData.description.trim(),
        };
        await updateMeasure(editingMeasure.id, updateData);
        toast.success('Medida actualizada correctamente');
      } else {
        // Crear
        const createData: CreateMeasureInput = {
          name: formData.name.trim().toUpperCase(),
          description: formData.description.trim(),
        };
        await createMeasure(createData);
        toast.success('Medida creada correctamente');
      }
      setIsDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar medida';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteClick = (measure: Measure) => {
    setMeasureToDelete(measure);
    setIsDeleteDialogOpen(true);
  };

  // Eliminar medida
  const handleDelete = async () => {
    if (!measureToDelete) return;

    setIsDeleting(true);
    try {
      await deleteMeasure(measureToDelete.id);
      toast.success('Medida eliminada correctamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar medida';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-[#006A4E]" />
                Gestión de Medidas
              </CardTitle>
              <CardDescription>
                Administra las unidades de medida utilizadas en los productos
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-[#006A4E] hover:bg-[#005741]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Medida
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#006A4E]" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-md mx-auto">
                <Ruler className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-amber-900 mb-2">Endpoint no disponible</h3>
                <p className="text-sm text-amber-700 mb-4">{error}</p>
                <p className="text-xs text-amber-600">
                  El backend aún no tiene implementado el endpoint <code className="bg-amber-100 px-1 rounded">/products/measures</code>. 
                  Por favor, contacta al equipo de desarrollo.
                </p>
              </div>
            </div>
          ) : measures.length === 0 ? (
            <div className="text-center py-12">
              <Ruler className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 mb-4">No hay medidas registradas</p>
              <Button
                onClick={handleCreate}
                variant="outline"
                className="border-[#006A4E] text-[#006A4E] hover:bg-[#006A4E]/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Medida
              </Button>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50">
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead className="w-32">Abreviatura</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-32">Fecha Creación</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measures.map((measure) => (
                    <TableRow key={measure.id}>
                      <TableCell className="font-mono text-sm text-neutral-600">
                        #{measure.id}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className="font-mono text-sm font-semibold border-[#006A4E] text-[#006A4E]"
                        >
                          {measure.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-neutral-900">
                        {measure.description}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">
                        {formatDate(measure.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(measure)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(measure)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
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

      {/* Diálogo Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMeasure ? 'Editar Medida' : 'Crear Nueva Medida'}
            </DialogTitle>
            <DialogDescription>
              {editingMeasure
                ? 'Modifica la información de la medida'
                : 'Completa los datos de la nueva medida'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Abreviatura <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  if (value.length <= 5) {
                    setFormData({ ...formData, name: value });
                  }
                }}
                placeholder="Ej: KG, UN, L, M"
                maxLength={5}
                className="uppercase font-mono font-semibold"
              />
              <p className="text-xs text-neutral-500">
                Máximo 5 caracteres. Se convertirá automáticamente a mayúsculas.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 100) {
                    setFormData({ ...formData, description: value });
                  }
                }}
                placeholder="Ej: Kilogramos, Unidades, Litros, Metros"
                rows={2}
                maxLength={100}
              />
              <p className="text-xs text-neutral-500">
                {formData.description.length}/100 caracteres
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> La abreviatura será única en el sistema. Ejemplos: KG (Kilogramos), 
                UN (Unidades), L (Litros), M (Metros), CM (Centímetros).
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim() || !formData.description.trim()}
              className="bg-[#006A4E] hover:bg-[#005741]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{editingMeasure ? 'Actualizar' : 'Crear'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar medida?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar la medida{' '}
              <span className="font-semibold font-mono">{measureToDelete?.name}</span>
              {' '}({measureToDelete?.description}).
              Esta acción no se puede deshacer y no se podrá eliminar si hay productos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
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
    </>
  );
}
