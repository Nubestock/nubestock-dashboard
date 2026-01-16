import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
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
import { MapPin, Plus, Pencil, Trash2, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOrigins, type Origin, type CreateOriginInput, type UpdateOriginInput } from '../hooks/useOrigins';
import { useCities, useProvinces } from '../hooks/useClients';

export default function OriginManagement() {
  const { origins, loading, error, createOrigin, updateOrigin, deleteOrigin } = useOrigins();
  const { provinces } = useProvinces();
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | undefined>(undefined);
  const { cities } = useCities(selectedProvinceId);

  // Estados para el diálogo de crear/editar
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOrigin, setEditingOrigin] = useState<Origin | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    id_city: number | undefined;
    id_facility: string;
  }>({
    name: '',
    id_city: undefined,
    id_facility: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Estados para el diálogo de eliminar
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [originToDelete, setOriginToDelete] = useState<Origin | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Abrir diálogo para crear
  const handleCreate = () => {
    setEditingOrigin(null);
    setFormData({ name: '', id_city: undefined, id_facility: '' });
    setSelectedProvinceId(undefined);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar
  const handleEdit = (origin: Origin) => {
    setEditingOrigin(origin);
    setFormData({
      name: origin.name,
      id_city: origin.id_city,
      id_facility: origin.id_facility || '',
    });
    
    // Encontrar la provincia de la ciudad seleccionada
    const city = cities.find(c => c.id === origin.id_city);
    if (city) {
      setSelectedProvinceId(city.id_province);
    }
    
    setIsDialogOpen(true);
  };

  // Guardar (crear o actualizar)
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es obligatorio');
      return;
    }
    if (!formData.id_city) {
      toast.error('La ciudad es obligatoria');
      return;
    }

    setIsSaving(true);
    try {
      if (editingOrigin) {
        // Actualizar
        const updateData: UpdateOriginInput = {
          name: formData.name.trim(),
          id_city: formData.id_city,
        };
        if (formData.id_facility?.trim()) {
          updateData.id_facility = formData.id_facility.trim();
        }
        await updateOrigin(editingOrigin.id, updateData);
        toast.success('Origen actualizado correctamente');
      } else {
        // Crear
        const createData: CreateOriginInput = {
          name: formData.name.trim(),
          id_city: formData.id_city,
        };
        if (formData.id_facility?.trim()) {
          createData.id_facility = formData.id_facility.trim();
        }
        await createOrigin(createData);
        toast.success('Origen creado correctamente');
      }
      setIsDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar origen';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Confirmar eliminación
  const handleDeleteClick = (origin: Origin) => {
    setOriginToDelete(origin);
    setIsDeleteDialogOpen(true);
  };

  // Eliminar origen
  const handleDelete = async () => {
    if (!originToDelete) return;

    setIsDeleting(true);
    try {
      await deleteOrigin(originToDelete.id);
      toast.success('Origen eliminado correctamente');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al eliminar origen';
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

  // Resetear ciudad cuando cambia la provincia
  useEffect(() => {
    if (!editingOrigin) {
      setFormData(prev => ({ ...prev, id_city: undefined }));
    }
  }, [selectedProvinceId, editingOrigin]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[#006A4E]" />
                Gestión de Orígenes
              </CardTitle>
              <CardDescription>
                Administra las ubicaciones y plantas de producción
              </CardDescription>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-[#006A4E] hover:bg-[#005741]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Origen
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
                <MapPin className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                <h3 className="font-semibold text-amber-900 mb-2">Endpoint no disponible</h3>
                <p className="text-sm text-amber-700 mb-4">{error}</p>
                <p className="text-xs text-amber-600">
                  El backend aún no tiene implementado el endpoint <code className="bg-amber-100 px-1 rounded">/products/origins</code>. 
                  Por favor, contacta al equipo de desarrollo.
                </p>
              </div>
            </div>
          ) : origins.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 mb-4">No hay orígenes registrados</p>
              <Button
                onClick={handleCreate}
                variant="outline"
                className="border-[#006A4E] text-[#006A4E] hover:bg-[#006A4E]/10"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Origen
              </Button>
            </div>
          ) : (
            <div className="border border-neutral-200 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-neutral-50">
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="w-32">ID Facilidad</TableHead>
                    <TableHead className="w-32">Fecha Creación</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {origins.map((origin) => (
                    <TableRow key={origin.id}>
                      <TableCell className="font-mono text-sm text-neutral-600">
                        #{origin.id}
                      </TableCell>
                      <TableCell className="font-semibold text-neutral-900">
                        {origin.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {origin.city_name && (
                            <div className="flex items-center gap-1 text-sm text-neutral-700">
                              <MapPin className="h-3 w-3" />
                              {origin.city_name}
                            </div>
                          )}
                          {origin.province_name && (
                            <span className="text-xs text-neutral-500">
                              {origin.province_name}
                            </span>
                          )}
                          {!origin.city_name && !origin.province_name && (
                            <span className="text-neutral-400 italic text-sm">Sin ubicación</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {origin.id_facility ? (
                          <Badge variant="outline" className="font-mono text-xs">
                            {origin.id_facility}
                          </Badge>
                        ) : (
                          <span className="text-neutral-400 italic text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-neutral-600">
                        {formatDate(origin.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEdit(origin)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(origin)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingOrigin ? 'Editar Origen' : 'Crear Nuevo Origen'}
            </DialogTitle>
            <DialogDescription>
              {editingOrigin
                ? 'Modifica la información del origen'
                : 'Completa los datos del nuevo origen'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Planta Principal, Bodega Norte"
                maxLength={200}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="province">
                  Provincia <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedProvinceId?.toString()}
                  onValueChange={(value) => setSelectedProvinceId(Number(value))}
                >
                  <SelectTrigger id="province">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.id} value={province.id.toString()}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  Ciudad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.id_city?.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_city: Number(value) })}
                  disabled={!selectedProvinceId}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder={selectedProvinceId ? "Seleccionar..." : "Primero selecciona provincia"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_facility">
                ID de Facilidad <span className="text-neutral-500 text-xs">(opcional)</span>
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  id="id_facility"
                  value={formData.id_facility}
                  onChange={(e) => setFormData({ ...formData, id_facility: e.target.value })}
                  placeholder="Ej: FAC-001, BODEGA-A"
                  maxLength={100}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-neutral-500">
                Código o identificador de la instalación o facilidad
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
              disabled={isSaving || !formData.name.trim() || !formData.id_city}
              className="bg-[#006A4E] hover:bg-[#005741]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>{editingOrigin ? 'Actualizar' : 'Crear'}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmación de Eliminación */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar origen?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar el origen{' '}
              <span className="font-semibold">{originToDelete?.name}</span>.
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
