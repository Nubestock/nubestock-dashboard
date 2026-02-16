import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../config/api';

// Interface para las estadísticas del dashboard
export interface DashboardStats {
  success: boolean;
  data: {
    products: {
      total: number;
      active: number;
      inactive: number;
      lowStock: number;
      totalInventoryValue: number;
    };
    categories: {
      total: number;
      active: number;
      inactive: number;
    };
    sales: {
      total: number;
      active: number;
      cancelled: number;
      byStatus: {
        pending: number;
        paid: number;
        overdue: number;
        cancelled: number;
      };
      totalValue: number;
      paidValue: number;
      pendingValue: number;
      overdueValue: number;
      thisMonth: {
        count: number;
        value: number;
      };
      thisYear: {
        count: number;
        value: number;
      };
    };
    clients: {
      total: number;
      active: number;
      inactive: number;
      withCredit: number;
      totalCreditLimit: number;
    };
    production: {
      total: number;
      thisMonth: number;
      thisYear: number;
    };
    alerts: {
      total: number;
      active: number;
      byPriority: {
        low: number;
        medium: number;
        high: number;
      };
      byType: {
        stock_low: number;
      };
    };
    users: {
      total: number;
      active: number;
      inactive: number;
    };
    transactions: {
      total: number;
      thisMonth: number;
      recent: Transaction[];
    };
  };
  timestamp: string;
}

export interface Transaction {
  id: number;
  product_name: string;
  product_sku: string;
  user_name: string;
  quantity: number;
  type: string;
  direction: '+' | '-';
  creation_date: string;
  has_waste: boolean;
}

// Hook para obtener estadísticas del dashboard
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando estadísticas del dashboard...');

      const response = await apiRequest('/stats', {
        method: 'GET',
      });

      console.log('Estadísticas cargadas:', response);

      if (response && response.success) {
        setStats(response);
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error cargando estadísticas:', errorMessage);
      
      // Verificar si es error de permisos (403)
      if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('sin permisos')) {
        console.warn('Sin permisos para acceder a /stats');
        setError('No tienes permisos para ver las estadísticas del sistema');
        setStats(null);
      // Verificar si es error de SQL del backend (500 con column "is_active" does not exist)
      } else if (errorMessage.includes('is_active') || errorMessage.includes('does not exist')) {
        console.warn('Error de backend: La tabla tb_ope_transaction no tiene columna is_active');
        setError('El backend tiene un error de base de datos. La columna "is_active" no existe en la tabla tb_ope_transaction.');
        setStats(null);
      } else if (errorMessage.toLowerCase().includes('not found') || errorMessage.includes('404')) {
        console.warn('Endpoint /stats no disponible (404)');
        setError('El endpoint de estadísticas aún no está disponible');
        setStats(null);
      } else if (errorMessage.toLowerCase().includes('failed to fetch')) {
        console.warn('Endpoint /stats no disponible aún');
        setError('El endpoint de estadísticas aún no está disponible');
        setStats(null);
      } else {
        setError(errorMessage);
        setStats(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar stats al montar el componente
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}