import { renderHook, act, waitFor } from '@testing-library/react';
import { useDashboardStats } from '@/app/hooks/useDashboardStats';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useDashboardStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockStatsResponse = {
    success: true,
    data: {
      products: { total: 100, active: 80, inactive: 20, lowStock: 5, totalInventoryValue: 50000 },
      categories: { total: 10, active: 8, inactive: 2 },
      sales: {
        total: 50,
        active: 45,
        cancelled: 5,
        byStatus: { pending: 10, paid: 30, overdue: 5, cancelled: 5 },
        totalValue: 100000,
        paidValue: 60000,
        pendingValue: 20000,
        overdueValue: 15000,
        thisMonth: { count: 20, value: 40000 },
        thisYear: { count: 50, value: 100000 },
      },
      clients: { total: 30, active: 25, inactive: 5, withCredit: 10, totalCreditLimit: 50000 },
      production: { total: 200, thisMonth: 50, thisYear: 200 },
      alerts: {
        total: 15,
        active: 10,
        byPriority: { low: 3, medium: 5, high: 2 },
        byType: { stock_low: 8 },
      },
      users: { total: 5, active: 4, inactive: 1 },
      transactions: { total: 100, thisMonth: 30, recent: [] },
    },
    timestamp: '2024-01-01T00:00:00Z',
  };

  describe('fetchStats', () => {
    it('should fetch stats on mount', async () => {
      mockApiRequest.mockResolvedValue(mockStatsResponse);

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/stats', { method: 'GET' });
      expect(result.current.stats).toEqual(mockStatsResponse);
    });

    it('should handle unsuccessful response', async () => {
      mockApiRequest.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Respuesta inválida del servidor');
      expect(result.current.stats).toBeNull();
    });

    it('should handle 403 permission error', async () => {
      mockApiRequest.mockRejectedValue(new Error('403 Forbidden'));

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('No tienes permisos para ver las estadísticas del sistema');
      expect(result.current.stats).toBeNull();
    });

    it('should handle permission error message', async () => {
      mockApiRequest.mockRejectedValue(new Error('Sin permisos para esta acción'));

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('No tienes permisos para ver las estadísticas del sistema');
    });

    it('should handle database column error', async () => {
      mockApiRequest.mockRejectedValue(new Error('column "is_active" does not exist'));

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('error de base de datos');
    });

    it('should handle is_active column error', async () => {
      mockApiRequest.mockRejectedValue(new Error('Error with is_active column'));

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toContain('is_active');
    });

    it('should handle 404 not found error', async () => {
      mockApiRequest.mockRejectedValue(new Error('404 Not Found'));

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('El endpoint de estadísticas aún no está disponible');
    });

    it('should handle not found error message', async () => {
      mockApiRequest.mockRejectedValue(new Error('Resource not found'));

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('El endpoint de estadísticas aún no está disponible');
    });

    it('should handle failed to fetch error', async () => {
      mockApiRequest.mockRejectedValue(new Error('Failed to fetch'));

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('El endpoint de estadísticas aún no está disponible');
    });

    it('should handle other errors', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockApiRequest.mockRejectedValue('string error');

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Error desconocido');
    });
  });

  describe('refetch', () => {
    it('should refetch stats when called', async () => {
      mockApiRequest.mockResolvedValue(mockStatsResponse);

      const { result } = renderHook(() => useDashboardStats());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockApiRequest).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.refetch();
      });

      expect(mockApiRequest).toHaveBeenCalledTimes(2);
    });
  });
});
