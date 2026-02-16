import React , { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { toast } from 'sonner';
import { ClientCreateData, Province, City } from '../hooks/useClients';

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (client: ClientCreateData) => Promise<any>;
  provinces: Province[];
  cities: City[];
}

export default function ClientForm({ open, onOpenChange, onSubmit, provinces, cities }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [formData, setFormData] = useState<ClientCreateData>({
    name: '',
    identification: '',
    identification_type: 'RUC',
    email: '',
    phone: '',
    address: '',
    id_province: 0,
    id_city: 0,
    requires_credit: false,
    credit_limit: null,
    credit_days: null,
  });

  // Filtrar ciudades según la provincia seleccionada
  const availableCities = selectedProvince
    ? cities.filter(c => c.id_province === Number.parseInt(selectedProvince))
    : [];

  const handleProvinceChange = (value: string) => {
    setSelectedProvince(value);
    setFormData({
      ...formData,
      id_province: Number.parseInt(value),
      id_city: 0, // Reset city when province changes
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.name || !formData.identification || !formData.email || 
        !formData.phone || !formData.address || !formData.id_province || !formData.id_city) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    // Validar RUC/Cédula
    if (formData.identification.length < 10 || formData.identification.length > 13) {
      toast.error('RUC/Cédula debe tener entre 10 y 13 caracteres');
      return;
    }

    // Validar crédito
    if (formData.requires_credit) {
      if (!formData.credit_limit || formData.credit_limit <= 0) {
        toast.error('Límite de crédito debe ser mayor a 0');
        return;
      }
      if (!formData.credit_days || formData.credit_days <= 0) {
        toast.error('Días de crédito debe ser mayor a 0');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Limpiar datos antes de enviar
      const dataToSubmit: any = {
        name: formData.name.trim(),
        identification: formData.identification.trim(),
        identification_type: formData.identification_type,
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        id_province: formData.id_province,
        id_city: formData.id_city,
        requires_credit: formData.requires_credit,
      };

      // Solo agregar credit_limit y credit_days si requires_credit es true
      if (formData.requires_credit && formData.credit_limit && formData.credit_limit > 0) {
        dataToSubmit.credit_limit = formData.credit_limit;
      }
      if (formData.requires_credit && formData.credit_days && formData.credit_days > 0) {
        dataToSubmit.credit_days = formData.credit_days;
      }

      console.log('Enviando cliente:', dataToSubmit);

      await onSubmit(dataToSubmit);
      toast.success('Cliente creado exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error al crear cliente:', error);
      toast.error(error instanceof Error ? error.message : 'Error al crear cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      identification: '',
      identification_type: 'RUC',
      email: '',
      phone: '',
      address: '',
      id_province: 0,
      id_city: 0,
      requires_credit: false,
      credit_limit: null,
      credit_days: null,
    });
    setSelectedProvince('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Completa la información del cliente. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Información Básica</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Nombre del Cliente *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Distribuidora XYZ S.A."
                  required
                />
              </div>

              <div>
                <Label htmlFor="identification">RUC/Cédula *</Label>
                <Input
                  id="identification"
                  value={formData.identification}
                  onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
                  placeholder="1234567890001"
                  required
                />
              </div>

              <div>
                <Label htmlFor="identification_type">Tipo de Identificación *</Label>
                <Select
                  value={formData.identification_type}
                  onValueChange={(value: 'CED' | 'RUC') =>
                    setFormData({ ...formData, identification_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CED">Cédula</SelectItem>
                    <SelectItem value="RUC">RUC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Información de Contacto</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contacto@ejemplo.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+593999999999"
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="address">Dirección *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Av. Principal 123"
                  required
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Ubicación</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Provincia *</Label>
                <Select
                  value={selectedProvince}
                  onValueChange={handleProvinceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una provincia" />
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

              <div>
                <Label htmlFor="city">Ciudad *</Label>
                <Select
                  value={formData.id_city.toString()}
                  onValueChange={(value) => setFormData({ ...formData, id_city: Number.parseInt(value) })}
                  disabled={!selectedProvince}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!selectedProvince ? "Primero selecciona una provincia" : "Selecciona una ciudad"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Información de crédito */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-700">Información de Crédito</h3>
                <p className="text-xs text-gray-500">¿Este cliente requiere línea de crédito?</p>
              </div>
              <Switch
                checked={formData.requires_credit}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, requires_credit: checked })
                }
              />
            </div>

            {formData.requires_credit && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label htmlFor="credit_limit">Límite de Crédito ($) *</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.credit_limit || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credit_limit: e.target.value ? Number.parseFloat(e.target.value) : null,
                      })
                    }
                    placeholder="5000.00"
                    required={formData.requires_credit}
                  />
                </div>

                <div>
                  <Label htmlFor="credit_days">Días de Crédito *</Label>
                  <Input
                    id="credit_days"
                    type="number"
                    min="1"
                    value={formData.credit_days || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credit_days: e.target.value ? Number.parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="30"
                    required={formData.requires_credit}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
