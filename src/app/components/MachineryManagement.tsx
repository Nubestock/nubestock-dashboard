import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Settings,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  History,
  Image as ImageIcon,
  DollarSign,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { useMachinery, useMaintenance, useMaintenanceHistory, useMachineryAlerts } from '../hooks/useMachinery';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function useMachineryManagementState() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);
  const [selectedMachinery, setSelectedMachinery] = useState<any>(null);
  const [isCreateMachineryOpen, setIsCreateMachineryOpen] = useState(false);
  const [isEditMachineryOpen, setIsEditMachineryOpen] = useState(false);
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [isViewMaintenanceOpen, setIsViewMaintenanceOpen] = useState(false);
  const [isCreateHistoryOpen, setIsCreateHistoryOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: 'machinery' | 'maintenance' } | null>(null);
  const [machineryForm, setMachineryForm] = useState({ name: '', description: '', is_active: true });
  const [maintenanceForm, setMaintenanceForm] = useState({
    id_machinery: 0, name: '', type: 'PRV' as 'PRV' | 'COR',
    next_maintainance_value: 30, last_mantainance_date: '', is_active: true,
  });
  const [historyForm, setHistoryForm] = useState({
    id_mantainance: 0, price: 0, next_mantainance_date: '', images: [] as string[],
  });
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  return {
    searchTerm, setSearchTerm, isFiltersOpen, setIsFiltersOpen, activeFilter, setActiveFilter,
    selectedMachinery, setSelectedMachinery, isCreateMachineryOpen, setIsCreateMachineryOpen,
    isEditMachineryOpen, setIsEditMachineryOpen, isCreateMaintenanceOpen, setIsCreateMaintenanceOpen,
    isViewMaintenanceOpen, setIsViewMaintenanceOpen, isCreateHistoryOpen, setIsCreateHistoryOpen,
    deleteConfirmOpen, setDeleteConfirmOpen, itemToDelete, setItemToDelete,
    machineryForm, setMachineryForm, maintenanceForm, setMaintenanceForm, historyForm, setHistoryForm,
    selectedMaintenance, setSelectedMaintenance, isCreating, setIsCreating, isUpdating, setIsUpdating, isDeleting, setIsDeleting,
  };
}

export default function MachineryManagement() {
  const state = useMachineryManagementState();
  const {
    searchTerm, setSearchTerm, isFiltersOpen, setIsFiltersOpen, activeFilter, setActiveFilter,
    selectedMachinery, setSelectedMachinery, isCreateMachineryOpen, setIsCreateMachineryOpen,
    isEditMachineryOpen, setIsEditMachineryOpen, isCreateMaintenanceOpen, setIsCreateMaintenanceOpen,
    isViewMaintenanceOpen, setIsViewMaintenanceOpen, isCreateHistoryOpen, setIsCreateHistoryOpen,
    deleteConfirmOpen, setDeleteConfirmOpen, itemToDelete, setItemToDelete,
    machineryForm, setMachineryForm, maintenanceForm, setMaintenanceForm, historyForm, setHistoryForm,
    selectedMaintenance, setSelectedMaintenance, isCreating, setIsCreating, isUpdating, setIsUpdating, isDeleting, setIsDeleting,
  } = state;

  const { machinery, isLoading: loadingMachinery, refetch: refetchMachinery, createMachinery, updateMachinery, deleteMachinery } = useMachinery(searchTerm, activeFilter);
  const { maintenance, isLoading: loadingMaintenance, refetch: refetchMaintenance, createMaintenance, updateMaintenance, deleteMaintenance } = useMaintenance();
  const { history, refetch: refetchHistory, createHistory } = useMaintenanceHistory(selectedMaintenance?.id);
  const { alerts, isLoading: loadingAlerts, refetch: refetchAlerts, detectAlerts } = useMachineryAlerts();

  // Filtrar maquinaria por búsqueda
  const filteredMachinery = machinery.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const stats = {
    total: machinery.length,
    active: machinery.filter(m => m.is_active).length,
    inactive: machinery.filter(m => !m.is_active).length,
    alerts: alerts.length > 0 ? alerts.filter(a => !a.is_sent).length : 0,
  };

  const handleCreateMachinery = async () => {
    if (!machineryForm.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    setIsCreating(true);
    try {
      await createMachinery(machineryForm);
      toast.success('Maquinaria creada exitosamente');
      setIsCreateMachineryOpen(false);
      setMachineryForm({ name: '', description: '', is_active: true });
    } catch (error: any) {
      toast.error(error.message || 'Error al crear maquinaria');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditMachinery = (machinery: any) => {
    setSelectedMachinery(machinery);
    setMachineryForm({
      name: machinery.name,
      description: machinery.description,
      is_active: machinery.is_active,
    });
    setIsEditMachineryOpen(true);
  };

  const handleUpdateMachinery = async () => {
    if (!selectedMachinery) return;

    setIsUpdating(true);
    try {
      await updateMachinery(selectedMachinery.id, machineryForm);
      toast.success('Maquinaria actualizada exitosamente');
      setIsEditMachineryOpen(false);
      setSelectedMachinery(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar maquinaria');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteMachinery = async (id: number, name: string) => {
    setIsDeleting(true);
    try {
      await deleteMachinery(id);
      toast.success('Maquinaria eliminada exitosamente');
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar maquinaria');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteConfirm = (id: number, name: string, type: 'machinery' | 'maintenance') => {
    setItemToDelete({ id, name, type });
    setDeleteConfirmOpen(true);
  };

  const handleCreateMaintenance = async () => {
    if (!maintenanceForm.name.trim() || !maintenanceForm.id_machinery) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    setIsCreating(true);
    try {
      await createMaintenance(maintenanceForm);
      toast.success('Mantenimiento creado exitosamente');
      setIsCreateMaintenanceOpen(false);
      setMaintenanceForm({
        id_machinery: 0,
        name: '',
        type: 'PRV',
        next_maintainance_value: 30,
        last_mantainance_date: '',
        is_active: true,
      });
      refetchMaintenance();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear mantenimiento');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateHistory = async () => {
    if (!historyForm.id_mantainance || !historyForm.next_mantainance_date) {
      toast.error('Complete todos los campos requeridos');
      return;
    }

    setIsCreating(true);
    try {
      const payload = {
        id_mantainance: historyForm.id_mantainance,
        price: historyForm.price,
        next_mantainance_date: new Date(historyForm.next_mantainance_date).toISOString(),
        details: {
          attachments: historyForm.images.map((img, idx) => ({
            id: idx + 1,
            content: img,
          })),
        },
      };

      await createHistory(payload);
      toast.success('Mantenimiento registrado exitosamente');
      setIsCreateHistoryOpen(false);
      setHistoryForm({
        id_mantainance: 0,
        price: 0,
        next_mantainance_date: '',
        images: [],
      });
      refetchHistory();
    } catch (error: any) {
      toast.error(error.message || 'Error al registrar mantenimiento');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push(reader.result as string);
        if (newImages.length === files.length) {
          setHistoryForm({ ...historyForm, images: [...historyForm.images, ...newImages] });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setHistoryForm({
      ...historyForm,
      images: historyForm.images.filter((_, i) => i !== index),
    });
  };

  const handleDetectAlerts = async () => {
    try {
      await detectAlerts();
      toast.success('Detección de alertas completada');
      refetchAlerts();
    } catch (error: any) {
      toast.error(error.message || 'Error al detectar alertas');
    }
  };

  const hasActiveFilters = activeFilter !== undefined;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl text-neutral-900">Gestión de Maquinaria</h1>
        <p className="text-sm text-neutral-600 mt-1">Administra maquinaria, mantenimientos y alertas</p>
      </div>

      <Tabs defaultValue="machinery" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="machinery">Maquinaria</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimientos</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertas
            {stats.alerts > 0 && (
              <Badge className="ml-2 bg-red-500 text-white text-xs h-5 min-w-[20px] px-1">
                {stats.alerts}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Maquinaria */}
        <TabsContent value="machinery" className="space-y-4">
          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-neutral-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-neutral-600">Total</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-neutral-900">{stats.total}</span>
                    <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-neutral-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-neutral-600">Activos</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-[#006A4E]">{stats.active}</span>
                    <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-[#006A4E]/40" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-neutral-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-neutral-600">Inactivos</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-red-600">{stats.inactive}</span>
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600/40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barra de búsqueda y acciones */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Buscar maquinaria..."
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
                  <SheetTitle>Filtrar Maquinaria</SheetTitle>
                  <SheetDescription>
                    Filtra por estado
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Button
                      variant={activeFilter === undefined ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilter === undefined ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => {
                        setActiveFilter(undefined);
                        setIsFiltersOpen(false);
                      }}
                    >
                      Todas las maquinarias
                    </Button>
                    <Button
                      variant={activeFilter === true ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilter === true ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => {
                        setActiveFilter(true);
                        setIsFiltersOpen(false);
                      }}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Solo activas
                    </Button>
                    <Button
                      variant={activeFilter === false ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilter === false ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => {
                        setActiveFilter(false);
                        setIsFiltersOpen(false);
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Solo inactivas
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button 
              onClick={refetchMachinery}
              variant="outline" 
              size="sm"
              className="h-9 sm:h-10 px-3"
              disabled={loadingMachinery}
            >
              <RefreshCw className={`h-4 w-4 ${loadingMachinery ? 'animate-spin' : ''}`} />
            </Button>

            <Button 
              onClick={() => setIsCreateMachineryOpen(true)} 
              className="bg-[#006A4E] hover:bg-[#005a42] h-9 sm:h-10 px-3 sm:px-4"
              size="sm"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nueva</span>
            </Button>
          </div>

          {/* Loading State */}
          {loadingMachinery && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006A4E] mx-auto mb-3"></div>
                <p className="text-sm text-neutral-600">Cargando maquinaria...</p>
              </div>
            </div>
          )}

          {/* Vista de Maquinaria */}
          {!loadingMachinery && (
            <>
              {filteredMachinery.length === 0 ? (
                <Card>
                  <CardContent className="py-16">
                    <div className="text-center">
                      <Settings className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                      <h3 className="text-lg font-medium text-neutral-900 mb-1">No se encontró maquinaria</h3>
                      <p className="text-sm text-neutral-500">
                        {searchTerm || hasActiveFilters
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'Comienza agregando tu primera maquinaria'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {/* Mobile: Cards */}
                  <div className="grid grid-cols-1 gap-3 lg:hidden">
                    {filteredMachinery.map((machine) => (
                      <Card key={machine.id} className="border-neutral-200 hover:border-[#006A4E]/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-neutral-900 truncate">{machine.name}</h3>
                                  <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{machine.description}</p>
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${machine.is_active ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}
                                >
                                  {machine.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-2">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Creado: {format(new Date(machine.creation_date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                            </div>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditMachinery(machine)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openDeleteConfirm(machine.id, machine.name, 'machinery')}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
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
                              Nombre
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Descripción
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Fecha Creación
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 bg-white">
                          {filteredMachinery.map((machine) => (
                            <tr key={machine.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-neutral-900 text-sm">{machine.name}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-neutral-600 max-w-md truncate">{machine.description}</div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${machine.is_active ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}
                                >
                                  {machine.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-neutral-600">
                                  {format(new Date(machine.creation_date), 'dd/MM/yyyy', { locale: es })}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditMachinery(machine)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openDeleteConfirm(machine.id, machine.name, 'machinery')}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Tab: Mantenimientos - Implementación básica */}
        <TabsContent value="maintenance" className="space-y-4">
          {/* Barra de acciones */}
          <div className="flex justify-between items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">Mantenimientos</h2>
            <div className="flex gap-2">
              <Button 
                onClick={refetchMaintenance}
                variant="outline" 
                size="sm"
                className="h-9 sm:h-10 px-3"
                disabled={loadingMaintenance}
              >
                <RefreshCw className={`h-4 w-4 ${loadingMaintenance ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setIsCreateMaintenanceOpen(true)} className="bg-[#006A4E] hover:bg-[#005a42] h-9 sm:h-10 px-3 sm:px-4" size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo</span>
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loadingMaintenance && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006A4E] mx-auto mb-3"></div>
                <p className="text-sm text-neutral-600">Cargando mantenimientos...</p>
              </div>
            </div>
          )}

          {/* Vista de Mantenimientos */}
          {!loadingMaintenance && (
            <>
              {maintenance.length === 0 ? (
                <Card>
                  <CardContent className="py-16">
                    <div className="text-center">
                      <Wrench className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                      <h3 className="text-lg font-medium text-neutral-900 mb-1">No hay mantenimientos</h3>
                      <p className="text-sm text-neutral-500 mb-4">Comienza agregando un nuevo mantenimiento programado</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {/* Mobile: Cards */}
                  <div className="grid grid-cols-1 gap-3 lg:hidden">
                    {maintenance.map((maint) => (
                      <Card key={maint.id} className="border-neutral-200 hover:border-[#006A4E]/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-neutral-900">{maint.name}</h3>
                                <p className="text-sm text-neutral-600 mt-1">{maint.machinery_name}</p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${maint.type === 'PRV' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-orange-500 text-orange-700 bg-orange-50'}`}
                                >
                                  {maint.type === 'PRV' ? 'Preventivo' : 'Correctivo'}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${maint.is_active ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}
                                >
                                  {maint.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                <span>Cada {maint.next_maintainance_value} días</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                <span>{format(new Date(maint.last_mantainance_date), 'dd/MM/yyyy', { locale: es })}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-neutral-100">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 h-8 text-xs"
                                onClick={() => {
                                  setSelectedMaintenance(maint);
                                  setIsViewMaintenanceOpen(true);
                                }}
                              >
                                <History className="h-3.5 w-3.5 mr-1.5" />
                                Ver Historial
                              </Button>
                              <Button 
                                size="sm" 
                                className="flex-1 h-8 text-xs bg-[#006A4E] hover:bg-[#005a42]"
                                onClick={() => {
                                  setHistoryForm({ ...historyForm, id_mantainance: maint.id });
                                  setIsCreateHistoryOpen(true);
                                }}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                Registrar
                              </Button>
                            </div>
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
                              Mantenimiento
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Maquinaria
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Tipo
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Frecuencia
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Último Mantenimiento
                            </th>
                            <th className="text-center px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 bg-white">
                          {maintenance.map((maint) => (
                            <tr key={maint.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-neutral-900 text-sm">{maint.name}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-neutral-600">{maint.machinery_name}</div>
                                {maint.machinery_description && (
                                  <div className="text-xs text-neutral-500">{maint.machinery_description}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${maint.type === 'PRV' ? 'border-blue-500 text-blue-700 bg-blue-50' : 'border-orange-500 text-orange-700 bg-orange-50'}`}
                                >
                                  {maint.type === 'PRV' ? 'Preventivo' : 'Correctivo'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="text-sm text-neutral-600">
                                  {maint.next_maintainance_value} días
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className="text-sm text-neutral-600">
                                  {format(new Date(maint.last_mantainance_date), 'dd/MM/yyyy', { locale: es })}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${maint.is_active ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}
                                >
                                  {maint.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 px-2 text-xs"
                                    onClick={() => {
                                      setSelectedMaintenance(maint);
                                      setIsViewMaintenanceOpen(true);
                                    }}
                                  >
                                    <History className="h-4 w-4 mr-1" />
                                    Historial
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="h-8 px-2 text-xs bg-[#006A4E] hover:bg-[#005a42]"
                                    onClick={() => {
                                      setHistoryForm({ ...historyForm, id_mantainance: maint.id });
                                      setIsCreateHistoryOpen(true);
                                    }}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Registrar
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Tab: Alertas - Implementación básica */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">Alertas de Mantenimiento</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                onClick={refetchAlerts}
                variant="outline" 
                size="sm"
                className="h-9 sm:h-10 px-3 flex-1 sm:flex-initial"
                disabled={loadingAlerts}
              >
                <RefreshCw className={`h-4 w-4 ${loadingAlerts ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={handleDetectAlerts} className="bg-[#006A4E] hover:bg-[#005a42] h-9 sm:h-10 px-3 sm:px-4 flex-1 sm:flex-initial" size="sm">
                <RefreshCw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Detectar Alertas</span>
                <span className="sm:hidden">Detectar</span>
              </Button>
            </div>
          </div>

          {alerts.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No hay alertas</h3>
                  <p className="text-sm text-neutral-500">Todos los mantenimientos están al día</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {alerts.map((alert) => (
                <Card key={alert.id} className="border-orange-200 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-neutral-900 text-sm">{alert.title}</h3>
                        <p className="text-sm text-neutral-600 mt-1">{alert.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                          <span>{alert.machinery_name}</span>
                          <span>{format(new Date(alert.creation_date), 'dd/MM/yyyy', { locale: es })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog: Crear Maquinaria */}
      <Dialog open={isCreateMachineryOpen} onOpenChange={setIsCreateMachineryOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nueva Maquinaria</DialogTitle>
            <DialogDescription>
              Agrega una nueva maquinaria al sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                placeholder="Extrusora Principal"
                value={machineryForm.name}
                onChange={(e) => setMachineryForm({ ...machineryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción de la maquinaria"
                value={machineryForm.description}
                onChange={(e) => setMachineryForm({ ...machineryForm, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMachineryOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateMachinery} disabled={isCreating} className="bg-[#006A4E] hover:bg-[#005a42]">
              {isCreating ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Maquinaria */}
      <Dialog open={isEditMachineryOpen} onOpenChange={setIsEditMachineryOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Maquinaria</DialogTitle>
            <DialogDescription>
              Modifica la información de la maquinaria
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre *</Label>
              <Input
                placeholder="Extrusora Principal"
                value={machineryForm.name}
                onChange={(e) => setMachineryForm({ ...machineryForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea
                placeholder="Descripción de la maquinaria"
                value={machineryForm.description}
                onChange={(e) => setMachineryForm({ ...machineryForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={machineryForm.is_active}
                onChange={(e) => setMachineryForm({ ...machineryForm, is_active: e.target.checked })}
                className="rounded"
              />
              <Label>Maquinaria activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditMachineryOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateMachinery} disabled={isUpdating} className="bg-[#006A4E] hover:bg-[#005a42]">
              {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear Mantenimiento */}
      <Dialog open={isCreateMaintenanceOpen} onOpenChange={setIsCreateMaintenanceOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nuevo Mantenimiento</DialogTitle>
            <DialogDescription>
              Configura un nuevo mantenimiento programado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Maquinaria *</Label>
              <Select
                value={maintenanceForm.id_machinery.toString()}
                onValueChange={(value) => setMaintenanceForm({ ...maintenanceForm, id_machinery: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una maquinaria" />
                </SelectTrigger>
                <SelectContent>
                  {machinery.filter(m => m.is_active).map((m) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nombre del Mantenimiento *</Label>
              <Input
                placeholder="Mantenimiento Preventivo Mensual"
                value={maintenanceForm.name}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={maintenanceForm.type}
                onValueChange={(value: 'PRV' | 'COR') => setMaintenanceForm({ ...maintenanceForm, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRV">Preventivo</SelectItem>
                  <SelectItem value="COR">Correctivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Frecuencia (días)</Label>
              <Input
                type="number"
                placeholder="30"
                value={maintenanceForm.next_maintainance_value}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, next_maintainance_value: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Último Mantenimiento *</Label>
              <Input
                type="date"
                value={maintenanceForm.last_mantainance_date}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, last_mantainance_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMaintenanceOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateMaintenance} disabled={isCreating} className="bg-[#006A4E] hover:bg-[#005a42]">
              {isCreating ? 'Creando...' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert: Confirmar Eliminación */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar <strong>{itemToDelete?.name}</strong>. Esta acción marcará el elemento como inactivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (itemToDelete) {
                  if (itemToDelete.type === 'machinery') {
                    handleDeleteMachinery(itemToDelete.id, itemToDelete.name);
                  }
                }
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}