import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

export interface Measure {
  id: number;
  name: string; // Abreviatura corta (máx 5 caracteres) - ej: "KG"
  description: string; // Descripción completa (requerido) - ej: "Kilogramos"
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreateMeasureInput {
  name: string; // Abreviatura (máx 5 caracteres, requerido)
  description: string; // Descripción completa (máx 100 caracteres, requerido)
  is_active?: boolean;
}

export interface UpdateMeasureInput {
  name?: string; // Abreviatura (máx 5 caracteres)
  description?: string; // Descripción completa (máx 100 caracteres)
  is_active?: boolean;
}

export function useMeasures(autoFetch: boolean = true) {
  const { get, post, put, del } = useApi();
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todas las medidas
  const fetchMeasures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await get<{ success: boolean; data: Measure[] }>('/products/measures');
      setMeasures(response?.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar medidas';
      
      // Si es 404, significa que el endpoint no existe aún - mostrar array vacío
      if (message.includes('404') || message.toLowerCase().includes('not found')) {
        // Solo warning ya emitido por apiRequest, no duplicar
        setMeasures([]);
        setError('El sistema de medidas estará disponible próximamente');
      } else {
        setError(message);
        // Solo mostrar error en consola si NO es 404
        console.error('Error fetching measures:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [get]);

  // Crear medida
  const createMeasure = async (input: CreateMeasureInput): Promise<Measure> => {
    try {
      const response = await post<{ success: boolean; data: Measure }>('/products/measures', input);
      await fetchMeasures(); // Refrescar lista
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear medida';
      throw new Error(message);
    }
  };

  // Actualizar medida - Usando query parameter ?id={id}
  const updateMeasure = async (id: number, input: UpdateMeasureInput): Promise<Measure> => {
    try {
      const response = await put<{ success: boolean; data: Measure }>(`/products/measures?id=${id}`, input);
      await fetchMeasures(); // Refrescar lista
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al actualizar medida';
      throw new Error(message);
    }
  };

  // Eliminar medida - Usando query parameter ?id={id}
  const deleteMeasure = async (id: number): Promise<void> => {
    try {
      await del(`/products/measures?id=${id}`);
      await fetchMeasures(); // Refrescar lista
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar medida';
      throw new Error(message);
    }
  };

  // Cargar medidas al montar solo si autoFetch es true
  useEffect(() => {
    if (autoFetch) {
      fetchMeasures();
    }
  }, []); // Sin dependencias para evitar múltiples llamadas

  return {
    measures,
    loading,
    error,
    fetchMeasures,
    createMeasure,
    updateMeasure,
    deleteMeasure,
  };
}