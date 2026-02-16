import { useState } from 'react';
import { apiRequest } from '../config/api';

export interface SaleProduct {
  id_product: number;
  quantity: number;
}

export interface Sale {
  id: number;
  id_client: number;
  id_user: number;
  sale_date: string | null;
  total_amount: string | number;
  status: 'pending' | 'completed' | 'cancelled';
  method: 'cash' | 'credit' | 'transfer' | 'other';
  due_date: string;
  dispatch_guide: string;
  notes: string;
  is_active: boolean;
  creation_date: string;
  modification_date: string | null;
  client_name: string;
  identification: string;
  user_name: string;
}

export interface CreateSaleData {
  id_client: number;
  total_amount: number;
  method: 'cash' | 'credit' | 'transfer' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  due_date: string;
  dispatch_guide?: string;
  notes?: string;
  products: SaleProduct[];
}

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Obtener ventas con filtros opcionales
  const fetchSales = async (filters?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', String(filters?.page || 1));
      params.append('limit', String(filters?.limit || 10));

      if (filters?.status) params.append('status', filters.status);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);

      const endpoint = `/sales?${params.toString()}`;

      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      console.log('Sales fetched:', response.data);

      setSales(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener ventas';
      setError(errorMessage);
      console.error('Error fetching sales:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Crear una nueva venta
  const createSale = async (saleData: CreateSaleData) => {
    try {
      setIsLoading(true);
      setError(null);

      const endpoint = '/sales';

      const response = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(saleData),
      });

      console.log('Sale created:', response);

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al crear venta';
      setError(errorMessage);
      console.error('Error creating sale:', err);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sales,
    isLoading,
    error,
    pagination,
    fetchSales,
    createSale,
  };
}