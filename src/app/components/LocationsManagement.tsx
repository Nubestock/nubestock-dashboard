import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Globe,
  MapPin,
  Building2,
  ChevronRight,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { 
  useLocations,
  Country,
  Province,
  City,
  CountryFormData,
  ProvinceFormData,
  CityFormData
} from '../hooks/useLocations';

type LocationType = 'countries' | 'provinces' | 'cities';

export default function LocationsManagement() {
  const [activeTab, setActiveTab] = useState<LocationType>('countries');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Country | Province | City | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    countries,
    provinces,
    cities,
    loading,
    error,
    fetchCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    fetchProvinces,
    createProvince,
    updateProvince,
    deleteProvince,
    fetchCities,
    createCity,
    updateCity,
    deleteCity,
  } = useLocations();

  // Cargar datos solo la primera vez que se monta el componente
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      // Intentar cargar datos pero sin mostrar errores si falla
      fetchCountries().catch(() => {});
      fetchProvinces().catch(() => {});
      fetchCities().catch(() => {});
    }
  }, []);

  // ============= FORM STATE =============
  const [countryForm, setCountryForm] = useState<CountryFormData>({
    name: '',
    is_code: '',
    is_active: true,
  });

  const [provinceForm, setProvinceForm] = useState<ProvinceFormData>({
    name: '',
    is_code: '',
    id_country: 0,
    is_active: true,
  });

  const [cityForm, setCityForm] = useState<CityFormData>({
    name: '',
    is_code: '',
    id_province: 0,
    is_active: true,
  });

  // ============= HANDLERS =============

  const handleOpenDialog = (item?: Country | Province | City) => {
    if (item) {
      setEditingItem(item);
      if (activeTab === 'countries') {
        setCountryForm(item as Country);
      } else if (activeTab === 'provinces') {
        setProvinceForm(item as Province);
      } else {
        setCityForm(item as City);
      }
    } else {
      setEditingItem(null);
      if (activeTab === 'countries') {
        setCountryForm({ name: '', is_code: '', is_active: true });
      } else if (activeTab === 'provinces') {
        setProvinceForm({ name: '', is_code: '', id_country: 0, is_active: true });
      } else {
        setCityForm({ name: '', is_code: '', id_province: 0, is_active: true });
      }
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      if (activeTab === 'countries') {
        if (!countryForm.name || !countryForm.is_code) {
          toast.error('Por favor completa todos los campos requeridos');
          return;
        }

        if (editingItem) {
          await updateCountry(editingItem.id, countryForm);
          toast.success('País actualizado correctamente');
        } else {
          await createCountry(countryForm);
          toast.success('País creado correctamente');
        }
      } else if (activeTab === 'provinces') {
        if (!provinceForm.name || !provinceForm.id_country) {
          toast.error('Por favor completa todos los campos requeridos');
          return;
        }

        if (editingItem) {
          await updateProvince(editingItem.id, provinceForm);
          toast.success('Provincia actualizada correctamente');
        } else {
          await createProvince(provinceForm);
          toast.success('Provincia creada correctamente');
        }
      } else {
        if (!cityForm.name || !cityForm.id_province) {
          toast.error('Por favor completa todos los campos requeridos');
          return;
        }

        if (editingItem) {
          await updateCity(editingItem.id, cityForm);
          toast.success('Ciudad actualizada correctamente');
        } else {
          await createCity(cityForm);
          toast.success('Ciudad creada correctamente');
        }
      }
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      if (activeTab === 'countries') {
        await deleteCountry(id);
        toast.success('País eliminado correctamente');
      } else if (activeTab === 'provinces') {
        await deleteProvince(id);
        toast.success('Provincia eliminada correctamente');
      } else {
        await deleteCity(id);
        toast.success('Ciudad eliminada correctamente');
      }
      setDeleteConfirmId(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar');
    }
  };

  // ============= FILTERING =============

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.is_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProvinces = provinces.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.country_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCities = cities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.province_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============= RENDER =============

  const renderDialogContent = () => {
    if (activeTab === 'countries') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre del País *</Label>
            <Input
              id="name"
              value={countryForm.name}
              onChange={(e) => setCountryForm({ ...countryForm, name: e.target.value })}
              placeholder="Ej: Ecuador"
            />
          </div>
          <div>
            <Label htmlFor="is_code">Código del País *</Label>
            <Input
              id="is_code"
              value={countryForm.is_code}
              onChange={(e) => setCountryForm({ ...countryForm, is_code: e.target.value.toUpperCase() })}
              placeholder="Ej: EC"
              maxLength={5}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={countryForm.is_active}
              onChange={(e) => setCountryForm({ ...countryForm, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active">Activo</Label>
          </div>
        </div>
      );
    } else if (activeTab === 'provinces') {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la Provincia *</Label>
            <Input
              id="name"
              value={provinceForm.name}
              onChange={(e) => setProvinceForm({ ...provinceForm, name: e.target.value })}
              placeholder="Ej: Pichincha"
            />
          </div>
          <div>
            <Label htmlFor="is_code">Código (Opcional)</Label>
            <Input
              id="is_code"
              value={provinceForm.is_code || ''}
              onChange={(e) => setProvinceForm({ ...provinceForm, is_code: e.target.value.toUpperCase() })}
              placeholder="Ej: PIC"
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="id_country">País *</Label>
            <Select
              value={provinceForm.id_country ? String(provinceForm.id_country) : ''}
              onValueChange={(value) => setProvinceForm({ ...provinceForm, id_country: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un país" />
              </SelectTrigger>
              <SelectContent>
                {countries.filter(c => c.is_active).map((country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {country.name} ({country.is_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_province"
              checked={provinceForm.is_active}
              onChange={(e) => setProvinceForm({ ...provinceForm, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active_province">Activo</Label>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nombre de la Ciudad *</Label>
            <Input
              id="name"
              value={cityForm.name}
              onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
              placeholder="Ej: Quito"
            />
          </div>
          <div>
            <Label htmlFor="is_code">Código (Opcional)</Label>
            <Input
              id="is_code"
              value={cityForm.is_code || ''}
              onChange={(e) => setCityForm({ ...cityForm, is_code: e.target.value.toUpperCase() })}
              placeholder="Ej: UIO"
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="id_province">Provincia *</Label>
            <Select
              value={cityForm.id_province ? String(cityForm.id_province) : ''}
              onValueChange={(value) => setCityForm({ ...cityForm, id_province: Number.parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una provincia" />
              </SelectTrigger>
              <SelectContent>
                {provinces.filter(p => p.is_active).map((province) => (
                  <SelectItem key={province.id} value={String(province.id)}>
                    {province.name} - {province.country_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_city"
              checked={cityForm.is_active}
              onChange={(e) => setCityForm({ ...cityForm, is_active: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active_city">Activo</Label>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Gestión de Ubicaciones</h1>
        <p className="text-gray-600">Administra países, provincias y ciudades del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('countries')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'countries'
              ? 'text-[#006A4E] border-b-2 border-[#006A4E]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Globe className="h-4 w-4" />
          Países
        </button>
        <button
          onClick={() => setActiveTab('provinces')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'provinces'
              ? 'text-[#006A4E] border-b-2 border-[#006A4E]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="h-4 w-4" />
          Provincias
        </button>
        <button
          onClick={() => setActiveTab('cities')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'cities'
              ? 'text-[#006A4E] border-b-2 border-[#006A4E]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Ciudades
        </button>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => handleOpenDialog()} className="bg-[#006A4E] hover:bg-[#005a42]">
              <Plus className="h-4 w-4 mr-2" />
              {activeTab === 'countries' ? 'Nuevo País' : activeTab === 'provinces' ? 'Nueva Provincia' : 'Nueva Ciudad'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {activeTab === 'countries' ? (
              <>
                <Globe className="h-5 w-5" />
                Países ({filteredCountries.length})
              </>
            ) : activeTab === 'provinces' ? (
              <>
                <MapPin className="h-5 w-5" />
                Provincias ({filteredProvinces.length})
              </>
            ) : (
              <>
                <Building2 className="h-5 w-5" />
                Ciudades ({filteredCities.length})
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#006A4E]"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  {activeTab === 'provinces' && <TableHead>País</TableHead>}
                  {activeTab === 'cities' && (
                    <>
                      <TableHead>Provincia</TableHead>
                      <TableHead>País</TableHead>
                    </>
                  )}
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeTab === 'countries' &&
                  filteredCountries.map((country) => (
                    <TableRow key={country.id}>
                      <TableCell className="font-medium">{country.name}</TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{country.is_code}</code>
                      </TableCell>
                      <TableCell>
                        <Badge className={country.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                          {country.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(country)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmId(country.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {activeTab === 'provinces' &&
                  filteredProvinces.map((province) => (
                    <TableRow key={province.id}>
                      <TableCell className="font-medium">{province.name}</TableCell>
                      <TableCell>
                        {province.is_code && (
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{province.is_code}</code>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{province.country_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={province.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                          {province.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(province)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmId(province.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {activeTab === 'cities' &&
                  filteredCities.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell className="font-medium">{city.name}</TableCell>
                      <TableCell>
                        {city.is_code && (
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">{city.is_code}</code>
                        )}
                      </TableCell>
                      <TableCell>{city.province_name}</TableCell>
                      <TableCell>{city.country_name}</TableCell>
                      <TableCell>
                        <Badge className={city.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                          {city.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDialog(city)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmId(city.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Crear/Editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar' : 'Crear'}{' '}
              {activeTab === 'countries' ? 'País' : activeTab === 'provinces' ? 'Provincia' : 'Ciudad'}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? 'Modifica los datos y guarda los cambios.'
                : 'Completa los datos para crear un nuevo registro.'}
            </DialogDescription>
          </DialogHeader>
          {renderDialogContent()}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="bg-[#006A4E] hover:bg-[#005a42]">
              {editingItem ? 'Guardar Cambios' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <Dialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}