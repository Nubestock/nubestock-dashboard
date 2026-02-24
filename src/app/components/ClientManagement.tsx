import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Plus, Edit, Search, Eye, Users, CreditCard, DollarSign, MapPin, Upload, Download, Filter, Phone, Mail, ChevronRight, Building2, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useClients, useProvinces, useCities } from '../hooks/useClients';
import BulkClientUpload from './BulkClientUpload';
import ClientForm from './ClientForm';
import { createWorkbook, addSheetFromJson, downloadWorkbook } from '../utils/excel';
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

export default function ClientManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    province: '',
    hasCredit: '',
  });

  // Usar los hooks de clientes y ubicaciones
  const { clients, isLoading, error, refetch, createClient, bulkCreateClients } = useClients();
  const { provinces } = useProvinces();
  const { cities: allCities } = useCities();

  // Filtrar clientes por término de búsqueda y filtros avanzados
  const filteredClients = clients.filter(client => {
    // Filtro de búsqueda
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.identification.includes(searchTerm) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtros avanzados
    const matchesProvince = activeFilters.province === '' || client.id_province.toString() === activeFilters.province;
    const matchesCreditType = activeFilters.hasCredit === '' || 
      (activeFilters.hasCredit === 'credit' && client.requires_credit) ||
      (activeFilters.hasCredit === 'cash' && !client.requires_credit);
    
    return matchesSearch && matchesProvince && matchesCreditType;
  });

  // Limpiar filtros
  const clearFilters = () => {
    setActiveFilters({
      province: '',
      hasCredit: '',
    });
    setSearchTerm('');
  };

  // Exportar a Excel
  const exportToExcel = async () => {
    try {
      const dataToExport = filteredClients.map(client => ({
        'Identificación': client.identification,
        'Tipo': client.identification_type,
        'Nombre del Cliente': client.name,
        'Email': client.email,
        'Teléfono': client.phone,
        'Dirección': client.address,
        'Ciudad': client.city_name || 'N/A',
        'Provincia': client.province_name || 'N/A',
        'Tipo de Pago': client.requires_credit ? 'Crédito' : 'Contado',
        'Límite de Crédito': client.credit_limit ? `$${client.credit_limit.toFixed(2)}` : 'N/A',
        'Días de Crédito': client.credit_days || 'N/A',
        'Estado': client.is_active ? 'Activo' : 'Inactivo',
        'Fecha de Creación': new Date(client.creation_date).toLocaleDateString('es-EC'),
      }));

      const wb = createWorkbook();
      addSheetFromJson(wb, 'Clientes', dataToExport);
      const fileName = `Clientes_Nutregam_${new Date().toISOString().split('T')[0]}.xlsx`;
      await downloadWorkbook(wb, fileName);
      toast.success(`${filteredClients.length} clientes exportados exitosamente`);
    } catch (error) {
      console.error('Error al exportar:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const handleToggleActive = (id: string) => {
    toast.success('Estado del cliente actualizado');
    refetch();
  };

  const formatCreditLimit = (limit: number | null) => {
    if (!limit) return 'N/A';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(limit);
  };
  
  // Helper para obtener nombres de provincia y ciudad
  const getProvinceName = (id_province: number) => {
    const prov = provinces.find(p => p.id === id_province);
    return prov?.name || 'N/A';
  };
  
  const getCityName = (id_city: number) => {
    const city = allCities.find(c => c.id === id_city);
    return city?.name || 'N/A';
  };

  // Calcular estadísticas
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.is_active).length;
  const clientsWithCredit = clients.filter(c => c.requires_credit).length;
  const totalCreditLimit = clients
    .filter(c => c.requires_credit && c.credit_limit)
    .reduce((sum, c) => sum + (c.credit_limit || 0), 0);

  const hasActiveFilters = activeFilters.province !== '' || activeFilters.hasCredit !== '';

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl text-neutral-900">Gestión de Clientes</h1>
            <p className="text-sm text-neutral-600 mt-1">Administra la base de datos de clientes</p>
          </div>
          {/* Botón solo ícono en móvil, completo en desktop */}
          <Button 
            onClick={() => setIsAddDialogOpen(true)} 
            className="bg-[#006A4E] hover:bg-[#005a42] text-white h-9 sm:h-10"
            size="sm"
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
          </Button>
        </div>

        {/* Barra de búsqueda y acciones - Mobile First */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 sm:h-10 text-sm"
            />
          </div>
          
          {/* Filtros Sheet (Mobile) */}
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
                <SheetTitle>Filtros</SheetTitle>
                <SheetDescription>
                  Filtra clientes por diferentes criterios
                </SheetDescription>
              </SheetHeader>
              
              <div className="space-y-6 mt-6">
                {/* Filtro por Provincia */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Provincia</label>
                  <div className="space-y-2">
                    <Button
                      variant={activeFilters.province === '' ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilters.province === '' ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => setActiveFilters(prev => ({ ...prev, province: '' }))}
                    >
                      Todas las provincias
                    </Button>
                    {provinces.slice(0, 5).map((prov) => (
                      <Button
                        key={prov.id}
                        variant={activeFilters.province === prov.id.toString() ? 'default' : 'outline'}
                        className={`w-full justify-start ${activeFilters.province === prov.id.toString() ? 'bg-[#006A4E]' : ''}`}
                        size="sm"
                        onClick={() => setActiveFilters(prev => ({ ...prev, province: prov.id.toString() }))}
                      >
                        {prov.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Tipo de Pago */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Tipo de Pago</label>
                  <div className="space-y-2">
                    <Button
                      variant={activeFilters.hasCredit === '' ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilters.hasCredit === '' ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => setActiveFilters(prev => ({ ...prev, hasCredit: '' }))}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={activeFilters.hasCredit === 'credit' ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilters.hasCredit === 'credit' ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => setActiveFilters(prev => ({ ...prev, hasCredit: 'credit' }))}
                    >
                      Solo con Crédito
                    </Button>
                    <Button
                      variant={activeFilters.hasCredit === 'cash' ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilters.hasCredit === 'cash' ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => setActiveFilters(prev => ({ ...prev, hasCredit: 'cash' }))}
                    >
                      Solo al Contado
                    </Button>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearFilters}
                  >
                    Limpiar
                  </Button>
                  <Button
                    className="flex-1 bg-[#006A4E] hover:bg-[#005a42]"
                    onClick={() => setIsFiltersOpen(false)}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Botón de exportar - Solo desktop */}
          <Button 
            onClick={exportToExcel}
            variant="outline" 
            size="sm"
            className="hidden sm:flex h-9 sm:h-10"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>

          {/* Carga masiva - Solo desktop */}
          <Button 
            onClick={() => setIsBulkUploadOpen(true)}
            variant="outline" 
            size="sm"
            className="hidden sm:flex h-9 sm:h-10"
          >
            <Upload className="h-4 w-4 mr-2" />
            Carga Masiva
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
                <span className="text-xl sm:text-2xl font-bold text-neutral-900">{totalClients}</span>
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Activos</p>
              <div className="flex items-end justify-between">
                <span className="text-xl sm:text-2xl font-bold text-[#006A4E]">{activeClients}</span>
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#006A4E]/40" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Con Crédito</p>
              <div className="flex items-end justify-between">
                <span className="text-xl sm:text-2xl font-bold text-orange-600">{clientsWithCredit}</span>
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600/40" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-neutral-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-1">
              <p className="text-xs sm:text-sm text-neutral-600">Crédito Total</p>
              <div className="flex items-end justify-between">
                <span className="text-lg sm:text-xl font-bold text-purple-600">
                  {(Number.isFinite(totalCreditLimit) ? (totalCreditLimit / 1000).toFixed(0) : '') + 'K'}
                </span>
                <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600/40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mensaje de error */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006A4E] mx-auto mb-3"></div>
            <p className="text-sm text-neutral-600">Cargando clientes...</p>
          </div>
        </div>
      )}

      {/* Vista de Clientes - Cards para móvil, mejorado para desktop */}
      {!isLoading && (
        <>
          {filteredClients.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-1">No se encontraron clientes</h3>
                  <p className="text-sm text-neutral-500">
                    {searchTerm || hasActiveFilters 
                      ? 'Intenta ajustar los filtros de búsqueda' 
                      : 'Comienza agregando tu primer cliente'}
                  </p>
                  {(searchTerm || hasActiveFilters) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
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
                {filteredClients.map((client) => (
                  <Card key={client.id} className="border-neutral-200 hover:border-[#006A4E]/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Nombre y RUC */}
                          <div className="flex items-start gap-2 mb-2">
                            <Building2 className="h-4 w-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-neutral-900 truncate">{client.name}</h3>
                              <code className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {client.identification}
                              </code>
                            </div>
                          </div>

                          {/* Contacto */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                              <span className="text-neutral-600 truncate">{client.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                              <span className="text-neutral-600">{client.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                              <span className="text-neutral-600 truncate">
                                {client.city_name || getCityName(client.id_city)}, {client.province_name || getProvinceName(client.id_province)}
                              </span>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {client.requires_credit ? (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  {client.credit_days} días
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {formatCreditLimit(client.credit_limit)}
                                </Badge>
                              </>
                            ) : (
                              <Badge className="bg-blue-500 text-xs">
                                Contado
                              </Badge>
                            )}
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${client.is_active ? 'border-green-500 text-green-700 bg-green-50' : 'border-neutral-300 text-neutral-500'}`}
                            >
                              {client.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
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
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(client.id.toString())}>
                              {client.is_active ? 'Desactivar' : 'Activar'}
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
                          Contacto
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Ubicación
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Tipo de Pago
                        </th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {filteredClients.map((client) => (
                        <tr key={client.id} className="hover:bg-neutral-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <div className="font-medium text-neutral-900 text-sm">{client.name}</div>
                              <code className="text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                                {client.identification}
                              </code>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm space-y-0.5">
                              <div className="text-neutral-900">{client.email}</div>
                              <div className="text-neutral-500">{client.phone}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">
                              <div className="text-neutral-900">{client.city_name || getCityName(client.id_city)}</div>
                              <div className="text-neutral-500">{client.province_name || getProvinceName(client.id_province)}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {client.requires_credit ? (
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  {client.credit_days} días
                                </Badge>
                                <div className="text-xs text-neutral-600">
                                  {formatCreditLimit(client.credit_limit)}
                                </div>
                              </div>
                            ) : (
                              <Badge className="bg-blue-500 text-xs">Contado</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={client.is_active}
                                onCheckedChange={() => handleToggleActive(client.id.toString())}
                              />
                              <span className={`text-sm ${client.is_active ? 'text-green-600' : 'text-neutral-500'}`}>
                                {client.is_active ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
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
                  Mostrando {filteredClients.length} de {clients.length} clientes
                </span>
                {/* Acciones móviles en la parte inferior */}
                <div className="flex gap-2 lg:hidden">
                  <Button 
                    onClick={exportToExcel}
                    variant="outline" 
                    size="sm"
                    className="h-8"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Exportar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <BulkClientUpload
        open={isBulkUploadOpen}
        onOpenChange={setIsBulkUploadOpen}
        onSuccess={refetch}
        onUpload={bulkCreateClients}
        provinces={provinces}
        cities={allCities}
      />

      <ClientForm
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={createClient}
        provinces={provinces}
        cities={allCities}
      />
    </div>
  );
}
