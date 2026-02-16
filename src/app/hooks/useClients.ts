import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, apiRequest } from '../config/api';

export interface Client {
  id: number;
  id_city: number;
  id_province: number;
  name: string;
  identification: string;
  identification_type: 'CED' | 'RUC';
  email: string;
  phone: string;
  address: string;
  requires_credit: boolean;
  credit_limit: number | null;
  credit_days: number | null;
  is_active: boolean;
  creation_date: string;
  modification_date?: string | null;
  // Campos adicionales del backend (v2)
  province_name?: string;
  city_name?: string;
  country_name?: string;
  is_code?: string;
  full_location?: string;
}

export interface ClientsResponse {
  success: boolean;
  data: Client[];
  timestamp: string;
}

// Interface para crear/actualizar clientes
export interface ClientCreateData {
  name: string;
  identification: string;
  identification_type: 'CED' | 'RUC';
  email: string;
  phone: string;
  address: string;
  id_province: number;
  id_city: number;
  requires_credit: boolean;
  credit_limit?: number | null;
  credit_days?: number | null;
}

export interface ClientUpdateData extends Partial<ClientCreateData> {
  is_active?: boolean;
}

// Interface para carga masiva de clientes
export interface BulkClientItem {
  name: string;
  identification: string;
  identification_type: 'CED' | 'RUC';
  email: string;
  phone: string;
  address: string;
  id_province: number;
  id_city: number;
  requires_credit: boolean;
  credit_limit?: number | null;
  credit_days?: number | null;
}

export interface BulkClientResponse {
  total: number;
  created: number;
  updated: number;
  failed: number;
  clients: Client[];
  errors: Array<{
    index: number;
    identification: string;
    name: string;
    error: string;
  }>;
}

// Interfaces para ubicaciones (según Swagger v2.0)
export interface Province {
  id: number;
  id_country: number;
  name: string;
  is_code: string;
  is_active: boolean;
}

export interface City {
  id: number;
  id_province: number;
  name: string;
  is_code: string;
  is_active: boolean;
}

export interface Country {
  id: number;
  name: string;
  is_code: string;
  is_active: boolean;
}

export function useClients(isActive: boolean = true, limit: number = 1000, page: number = 1) {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 1000,
    total: 0,
    totalPages: 0,
  });

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando clientes desde API...', {
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLIENTS}?is_active=${isActive}&limit=${limit}&page=${page}`,
        isActive,
        limit,
        page,
      });

      const response = await apiRequest(
        `${API_CONFIG.ENDPOINTS.CLIENTS}?is_active=${isActive}&limit=${limit}&page=${page}`,
        {
          method: 'GET',
        }
      );

      console.log('Respuesta clientes:', response);

      if (response && response.success && response.data) {
        console.log('Clientes cargados:', {
          count: response.data.length,
        });
        setClients(response.data);
      } else {
        console.warn('Respuesta inesperada del servidor');
        setClients([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar clientes';
      
      // Manejo especial para errores 403 (sin permisos)
      if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('permisos')) {
        console.warn('Sin permisos para ver clientes');
        setError(null); // No mostrar error en UI
        setClients([]);
      } else {
        console.error('Error cargando clientes:', errorMessage);
        setError(errorMessage);
        setClients([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isActive, limit, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const refetch = useCallback(() => {
    fetchClients();
  }, [fetchClients]);

  // Crear cliente
  const createClient = useCallback(async (clientData: ClientCreateData) => {
    try {
      console.log('Creando cliente:', clientData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.CLIENTS, {
        method: 'POST',
        body: JSON.stringify(clientData),
      });

      console.log('Cliente creado:', response);
      
      if (response && response.success) {
        await fetchClients();
        return response;
      } else {
        throw new Error(response.message || 'Error al crear cliente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cliente';
      console.error('Error creando cliente:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchClients]);

  // Actualizar cliente
  const updateClient = useCallback(async (clientId: number, clientData: ClientUpdateData) => {
    try {
      console.log('Actualizando cliente:', clientId, clientData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.CLIENTS}/${clientId}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
      });

      console.log('Cliente actualizado:', response);
      
      if (response && response.success) {
        await fetchClients();
        return response;
      } else {
        throw new Error(response.message || 'Error al actualizar cliente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cliente';
      console.error('Error actualizando cliente:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchClients]);

  // Eliminar cliente (soft delete)
  const deleteClient = useCallback(async (clientId: number) => {
    try {
      console.log('Eliminando cliente:', clientId);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.CLIENTS}/${clientId}`, {
        method: 'DELETE',
      });

      console.log('Cliente eliminado:', response);
      
      if (response && response.success) {
        await fetchClients();
        return response;
      } else {
        throw new Error(response.message || 'Error al eliminar cliente');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cliente';
      console.error('Error eliminando cliente:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchClients]);

  // Crear clientes en lote
  const bulkCreateClients = useCallback(async (clients: BulkClientItem[]) => {
    try {
      console.log('Creando clientes en lote:', clients.length);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.CLIENTS}/bulk`, {
        method: 'POST',
        body: JSON.stringify(clients),
      });

      console.log('Respuesta bulk:', response);
      
      if (response && response.data) {
        await fetchClients();
        return response.data as BulkClientResponse;
      } else {
        throw new Error(response.message || 'Error al crear clientes en lote');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear clientes en lote';
      console.error('Error bulk create:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchClients]);

  return {
    clients,
    isLoading,
    error,
    refetch,
    pagination,
    createClient,
    updateClient,
    deleteClient,
    bulkCreateClients,
  };
}

// Hook para obtener provincias
export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Cargando provincias desde API...');
        
        const response = await apiRequest('/locations/provinces', {
          method: 'GET',
        });

        console.log('Provincias cargadas:', response);

        if (response && response.success && response.data) {
          setProvinces(response.data);
        } else {
          setProvinces([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar provincias';
        console.error('Error cargando provincias:', errorMessage);
        setError(errorMessage);
        setProvinces([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  return { provinces, isLoading, error };
}

// Hook para obtener ciudades por provincia
export function useCities(provinceId?: number) {
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Cargando ciudades desde API...', { provinceId });
        
        const endpoint = provinceId 
          ? `/locations/cities?id_province=${provinceId}`
          : '/locations/cities';
        
        const response = await apiRequest(endpoint, {
          method: 'GET',
        });

        console.log('Ciudades cargadas:', response);

        if (response && response.success && response.data) {
          setCities(response.data);
        } else {
          setCities([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar ciudades';
        console.error('Error cargando ciudades:', errorMessage);
        setError(errorMessage);
        setCities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();
  }, [provinceId]);

  return { cities, isLoading, error };
}