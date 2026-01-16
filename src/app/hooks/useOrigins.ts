import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export interface Origin {
  id: number;
  name: string;
  id_city: number;
  city_name?: string;
  province_name?: string;
  id_facility?: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateOriginInput {
  name: string;
  id_city: number;
  id_facility?: string | null;
}

export interface UpdateOriginInput {
  name?: string;
  id_city?: number;
  id_facility?: string | null;
  is_active?: boolean;
}

export function useOrigins(autoFetch: boolean = true) {
  const { get, post, put, del } = useApi();
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los orígenes
  const fetchOrigins = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<{ success: boolean; data: Origin[] }>('/products/origins');
      setOrigins(response?.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar orígenes';
      
      // Si es 404, significa que el endpoint no existe aún - mostrar array vacío
      if (message.includes('404') || message.toLowerCase().includes('not found')) {
        // Solo warning ya emitido por apiRequest, no duplicar
        setOrigins([]);
        setError('El sistema de orígenes estará disponible próximamente');
      } else {
        setError(message);
        // Solo mostrar error en consola si NO es 404
        console.error('Error fetching origins:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Crear origen
  const createOrigin = async (input: CreateOriginInput): Promise<Origin> => {
    try {
      const response = await post<{ success: boolean; data: Origin }>('/products/origins', input);
      await fetchOrigins(); // Refrescar lista
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear origen';
      throw new Error(message);
    }
  };

  // Actualizar origen - Usando query parameter ?id={id}
  const updateOrigin = async (id: number, input: UpdateOriginInput): Promise<Origin> => {
    try {
      const response = await put<{ success: boolean; data: Origin }>(`/products/origins?id=${id}`, input);
      await fetchOrigins(); // Refrescar lista
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar origen';
      throw new Error(message);
    }
  };

  // Eliminar origen - Usando query parameter ?id={id}
  const deleteOrigin = async (id: number): Promise<void> => {
    try {
      await del(`/products/origins?id=${id}`);
      await fetchOrigins(); // Refrescar lista
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar origen';
      throw new Error(message);
    }
  };

  // Cargar orígenes al montar solo si autoFetch es true
  useEffect(() => {
    if (autoFetch) {
      fetchOrigins();
    }
  }, []); // Sin dependencias para evitar múltiples llamadas

  return {
    origins,
    loading,
    error,
    fetchOrigins,
    createOrigin,
    updateOrigin,
    deleteOrigin,
  };
}