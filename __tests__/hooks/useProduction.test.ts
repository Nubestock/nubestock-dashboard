import { renderHook, act, waitFor } from '@testing-library/react';
import { useProduction } from '@/app/hooks/useProduction';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useProduction', () => {
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

  const mockProductions = [
    {
      id: 1,
      id_product: 1,
      id_user: 1,
      quantity: 10,
      type: 'production',
      direction: '+',
      creation_date: '2024-01-01',
      modification_date: null,
      details: null,
      user_name: 'User Test',
      product_name: 'Product Test',
      sku: 'SKU001',
      category_name: 'Category',
      is_pending: true,
      status: 'pending' as const,
      production_details: null,
    },
  ];

  const mockResponse = {
    success: true,
    message: 'Success',
    data: {
      productions: mockProductions,
      summary: {
        total: 10,
        total_pending: 5,
        total_completed: 5,
        in_current_page: { pending: 1, completed: 0 },
      },
      pagination: { page: 1, limit: 10, total: 10, totalPages: 1 },
    },
    timestamp: '2024-01-01',
  };

  describe('fetchProductions', () => {
    it('should fetch productions successfully', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        await result.current.fetchProductions();
      });

      expect(result.current.productions).toEqual(mockProductions);
      expect(result.current.summary.total).toBe(10);
    });

    it('should fetch with filters', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        await result.current.fetchProductions({
          status: 'pending',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          id_user: 1,
          id_product: 1,
          page: 2,
          limit: 20,
        });
      });

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('status=pending'),
        expect.any(Object)
      );
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01'),
        expect.any(Object)
      );
    });

    it('should handle error', async () => {
      mockApiRequest.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        await expect(result.current.fetchProductions()).rejects.toThrow('Error');
      });

      expect(result.current.error).toBe('Error');
    });

    it('should use default error message when err.message is empty', async () => {
      mockApiRequest.mockRejectedValue({ message: '' });

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        await expect(result.current.fetchProductions()).rejects.toThrow('Error al cargar producciones');
      });

      expect(result.current.error).toBe('Error al cargar producciones');
    });

    it('should handle network error gracefully', async () => {
      mockApiRequest.mockRejectedValue(new Error('Failed to fetch'));

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        const response = await result.current.fetchProductions();
        expect(response.data.productions).toEqual([]);
      });

      expect(result.current.productions).toEqual([]);
    });

    it('should handle Network error gracefully', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        const response = await result.current.fetchProductions();
        expect(response.data.productions).toEqual([]);
      });
    });

    it('should use default pagination when not provided', async () => {
      mockApiRequest.mockResolvedValue({
        ...mockResponse,
        data: { ...mockResponse.data, pagination: null, summary: null },
      });

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        await result.current.fetchProductions();
      });

      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('completeProduction', () => {
    it('should complete production successfully', async () => {
      mockApiRequest.mockResolvedValue({ success: true, data: { status: 'completed' } });

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        const response = await result.current.completeProduction(1, 5);
        expect(response.success).toBe(true);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/production/1/complete', {
        method: 'PUT',
        body: JSON.stringify({ quantity: 5 }),
      });
    });

    it('should handle complete error', async () => {
      mockApiRequest.mockRejectedValue(new Error('Complete failed'));

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        await expect(result.current.completeProduction(1, 5)).rejects.toThrow('Complete failed');
      });

      expect(result.current.error).toBe('Complete failed');
    });

    it('should handle complete error without message', async () => {
      mockApiRequest.mockRejectedValue({});

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        await expect(result.current.completeProduction(1, 5)).rejects.toThrow('Error al completar producción');
      });
    });
  });

  describe('fetchGlobalSummary', () => {
    it('should fetch global summary', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        const summary = await result.current.fetchGlobalSummary();
        expect(summary.total).toBe(10);
      });

      expect(result.current.globalSummary.total).toBe(10);
    });

    it('should fetch with date filters', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        await result.current.fetchGlobalSummary({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });
      });

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01'),
        expect.any(Object)
      );
    });

    it('should handle error silently', async () => {
      mockApiRequest.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useProduction());

      await act(async () => {
        const summary = await result.current.fetchGlobalSummary();
        expect(summary).toBeUndefined();
      });
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useProduction());

      expect(result.current.productions).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
