import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';

// Interfaces según la documentación
export interface MaterialConsumed {
  id_product: number;
  name: string;
  sku: string;
  quantity_used: string | number; // Backend puede retornar string
  waste: string | number; // Backend puede retornar string
  effective_quantity: number;
  has_waste: boolean;
  current_stock: string | number; // Backend puede retornar string
  transaction_id: number;
  details: string | null;
}

export interface ProductionDetails {
  materials_consumed: MaterialConsumed[];
  total_consumed: string | number; // Backend retorna string
  total_waste: string | number; // Backend retorna string
  registered_by: number;
  registered_at: string;
  completed_at?: string;
}

export interface Production {
  id: number;
  id_product: number;
  id_user: number;
  quantity: number;
  type: string;
  direction: string;
  creation_date: string;
  modification_date: string | null;
  details: string | null;
  user_name: string;
  product_name: string;
  sku: string;
  category_name: string;
  is_pending: boolean;
  pending_count?: string; // Backend retorna string
  status: 'pending' | 'completed';
  production_details: ProductionDetails | null;
}

export interface ProductionSummary {
  total: number;
  total_pending: number;
  total_completed: number;
  in_current_page: {
    pending: number;
    completed: number;
  };
}

export interface ProductionResponse {
  success: boolean;
  message: string;
  data: {
    productions: Production[];
    summary: ProductionSummary;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface CompleteProductionRequest {
  quantity: number;
}

export interface CompleteProductionResponse {
  success: boolean;
  message: string;
  data: {
    production_id: number;
    product_final: {
      id: number;
      name: string;
      sku: string;
      quantity_generated: number;
    };
    materials_consumed: MaterialConsumed[];
    status: string;
  };
  timestamp: string;
}

export function useProduction() {
  const [productions, setProductions] = useState<Production[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    total: 0,
    total_pending: 0,
    total_completed: 0,
    in_current_page: {
      pending: 0,
      completed: 0,
    },
  });
  // Summary global sin filtros (para estadísticas generales)
  const [globalSummary, setGlobalSummary] = useState({
    total: 0,
    total_pending: 0,
    total_completed: 0,
  });

  // Obtener producciones con filtros
  const fetchProductions = async (filters?: {
    status?: 'pending' | 'completed';
    startDate?: string;
    endDate?: string;
    id_user?: number;
    id_product?: number;
    page?: number;
    limit?: number;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.id_user) params.append('id_user', String(filters.id_user));
      if (filters?.id_product) params.append('id_product', String(filters.id_product));
      params.append('page', String(filters?.page || 1));
      params.append('limit', String(filters?.limit || 10));

      const endpoint = `/production/daily?${params.toString()}`;

      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      console.log('✅ Productions fetched:', response);

      setProductions(response.data.productions || []);
      setPagination(response.data.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
      setSummary(response.data.summary || {
        total: 0,
        total_pending: 0,
        total_completed: 0,
        in_current_page: {
          pending: 0,
          completed: 0,
        },
      });

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar producciones';
      setError(errorMessage);
      console.error('❌ Error fetching productions:', err);
      
      // Si es un error de red, retornar datos vacíos en lugar de fallar
      if (err.message === 'Failed to fetch' || err.message.includes('Network')) {
        console.warn('⚠️ Network error - returning empty data');
        const emptyResponse: ProductionResponse = {
          success: true,
          message: 'No se pudo cargar las producciones',
          data: {
            productions: [],
            summary: {
              total: 0,
              total_pending: 0,
              total_completed: 0,
              in_current_page: {
                pending: 0,
                completed: 0,
              },
            },
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
              totalPages: 0,
            },
          },
          timestamp: new Date().toISOString(),
        };
        setProductions([]);
        setPagination(emptyResponse.data.pagination);
        setSummary(emptyResponse.data.summary);
        return emptyResponse;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Completar una producción
  const completeProduction = async (productionId: number, quantity: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = `/production/${productionId}/complete`;

      const response = await apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });

      console.log('✅ Production completed:', response);

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al completar producción';
      setError(errorMessage);
      console.error('❌ Error completing production:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar resumen global sin filtros (para estadísticas generales)
  const fetchGlobalSummary = async (filters?: {
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      
      // Solo agregamos filtros de fecha, NO de status
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      params.append('page', '1');
      params.append('limit', '1'); // Solo necesitamos el summary, no las producciones

      const endpoint = `/production/daily?${params.toString()}`;

      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      console.log('📊 Global summary fetched:', response.data.summary);

      setGlobalSummary({
        total: response.data.summary.total,
        total_pending: response.data.summary.total_pending,
        total_completed: response.data.summary.total_completed,
      });

      return response.data.summary;
    } catch (err: any) {
      console.error('❌ Error fetching global summary:', err);
      // No lanzar error, solo log
    }
  };

  return {
    productions,
    isLoading,
    error,
    pagination,
    summary,
    globalSummary,
    fetchProductions,
    completeProduction,
    fetchGlobalSummary,
  };
}