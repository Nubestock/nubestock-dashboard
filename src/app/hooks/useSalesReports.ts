import { useState, useCallback } from 'react';
import { apiRequest } from '../config/api';

// Interfaces para los reportes
export interface DailySalesData {
  date: string;
  total_sales: number;
  number_of_sales: number;
  average_sale: number;
  total_paid: number;
  total_pending: number;
}

export interface DailySalesReport {
  success: boolean;
  data: DailySalesData[];
  summary: {
    total_sales: number;
    total_transactions: number;
    best_day: {
      date: string;
      total: number;
    };
    worst_day: {
      date: string;
      total: number;
    };
    average_per_day: number;
  };
  timestamp: string;
}

export interface ClientSalesData {
  idclient: string;
  client_name: string;
  business_name: string;
  ruc_cedula: string;
  total_sales: number;
  number_of_sales: number;
  average_sale: number;
  total_paid: number;
  total_pending: number;
  first_sale_date: string;
  last_sale_date: string;
}

export interface ClientSalesReport {
  success: boolean;
  data: ClientSalesData[];
  summary: {
    total_clients: number;
    total_sales: number;
    average_per_client: number;
    best_client: {
      client_name: string;
      total: number;
    };
  };
  timestamp: string;
}

export interface TopProductData {
  idfinal_product: string;
  product_name: string;
  sku: string;
  category: string;
  total_quantity_sold: number;
  total_sales: number;
  number_of_transactions: number;
  average_price: number;
}

export interface TopProductsReport {
  success: boolean;
  data: TopProductData[];
  timestamp: string;
}

export interface DashboardSummary {
  success: boolean;
  data: {
    sales_summary: {
      total_sales: number;
      total_transactions: number;
      average_ticket: number;
      growth_percentage: number;
    };
    payment_status: {
      paid: number;
      pending: number;
      overdue: number;
      cancelled: number;
    };
    top_clients: Array<{
      client_name: string;
      total: number;
    }>;
    top_products: Array<{
      product_name: string;
      quantity: number;
    }>;
    sales_by_payment_method: {
      cash?: number;
      card?: number;
      transfer?: number;
      credit?: number;
    };
  };
  timestamp: string;
}

// Hook para reporte de ventas diarias
export function useDailySalesReport(startDate: string, endDate: string) {
  const [data, setData] = useState<DailySalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando reporte de ventas diarias...', { startDate, endDate });

      const response = await apiRequest(
        `/sales/reports/daily?startDate=${startDate}&endDate=${endDate}`,
        { method: 'GET' }
      );

      console.log('Respuesta reporte diario:', response);

      if (response && response.success) {
        setData(response);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar reporte';
      console.error('Error al cargar reporte diario:', err);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  return { data, isLoading, error, refetch: fetchReport };
}

// Hook para reporte de ventas por cliente
export function useClientSalesReport(startDate: string, endDate: string, limit: number = 50) {
  const [data, setData] = useState<ClientSalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando reporte de ventas por cliente...', { startDate, endDate, limit });

      const response = await apiRequest(
        `/sales/reports/by-client?startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
        { method: 'GET' }
      );

      console.log('Respuesta reporte por cliente:', response);

      if (response && response.success) {
        setData(response);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar reporte';
      console.error('Error al cargar reporte por cliente:', err);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, limit]);

  return { data, isLoading, error, refetch: fetchReport };
}

// Hook para reporte de top productos
export function useTopProductsReport(startDate: string, endDate: string, limit: number = 20) {
  const [data, setData] = useState<TopProductsReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando reporte de top productos...', { startDate, endDate, limit });

      const response = await apiRequest(
        `/sales/reports/top-products?startDate=${startDate}&endDate=${endDate}&limit=${limit}`,
        { method: 'GET' }
      );

      console.log('Respuesta reporte productos:', response);

      if (response && response.success) {
        setData(response);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar reporte';
      console.error('Error al cargar reporte de productos:', err);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, limit]);

  return { data, isLoading, error, refetch: fetchReport };
}

// Hook para dashboard summary
export function useDashboardSummary(startDate: string, endDate: string) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!startDate || !endDate) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando dashboard summary...', { startDate, endDate });

      const response = await apiRequest(
        `/sales/reports/summary?startDate=${startDate}&endDate=${endDate}`,
        { method: 'GET' }
      );

      console.log('Respuesta dashboard summary:', response);

      if (response && response.success) {
        setData(response);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar resumen';
      console.error('Error al cargar dashboard summary:', err);
      setError(errorMessage);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  return { data, isLoading, error, refetch: fetchReport };
}
