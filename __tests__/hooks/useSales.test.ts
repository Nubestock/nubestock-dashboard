import { renderHook, act, waitFor } from '@testing-library/react';
import { useSales } from '@/app/hooks/useSales';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useSales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockSales = [
    {
      id: 1,
      id_client: 1,
      id_user: 1,
      sale_date: '2024-01-01',
      total_amount: '100.00',
      status: 'completed',
      method: 'cash',
      due_date: '2024-01-15',
      dispatch_guide: 'DG001',
      notes: 'Test sale',
      is_active: true,
      creation_date: '2024-01-01',
      modification_date: null,
      client_name: 'Cliente Test',
      identification: '123456',
      user_name: 'Usuario Test',
    },
  ];

  describe('fetchSales', () => {
    it('should fetch sales successfully', async () => {
      mockApiRequest.mockResolvedValue({
        data: mockSales,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const { result } = renderHook(() => useSales());

      await act(async () => {
        await result.current.fetchSales();
      });

      expect(result.current.sales).toEqual(mockSales);
      expect(result.current.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
      expect(result.current.isLoading).toBe(false);
    });

    it('should fetch sales with filters', async () => {
      mockApiRequest.mockResolvedValue({ data: mockSales });

      const { result } = renderHook(() => useSales());

      await act(async () => {
        await result.current.fetchSales({
          page: 2,
          limit: 20,
          status: 'pending',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        });
      });

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        expect.any(Object)
      );
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('limit=20'),
        expect.any(Object)
      );
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('status=pending'),
        expect.any(Object)
      );
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('startDate=2024-01-01'),
        expect.any(Object)
      );
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('endDate=2024-01-31'),
        expect.any(Object)
      );
    });

    it('should handle empty response', async () => {
      mockApiRequest.mockResolvedValue({ data: null });

      const { result } = renderHook(() => useSales());

      await act(async () => {
        await result.current.fetchSales();
      });

      expect(result.current.sales).toEqual([]);
    });

    it('should handle fetch error with Error object', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useSales());

      await act(async () => {
        await expect(result.current.fetchSales()).rejects.toThrow('Network error');
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle fetch error without message', async () => {
      mockApiRequest.mockRejectedValue({});

      const { result } = renderHook(() => useSales());

      await act(async () => {
        await expect(result.current.fetchSales()).rejects.toThrow('Error al obtener ventas');
      });

      expect(result.current.error).toBe('Error al obtener ventas');
    });

    it('should use default pagination when not provided', async () => {
      mockApiRequest.mockResolvedValue({ data: mockSales, pagination: null });

      const { result } = renderHook(() => useSales());

      await act(async () => {
        await result.current.fetchSales();
      });

      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });

  describe('createSale', () => {
    it('should create a sale successfully', async () => {
      mockApiRequest.mockResolvedValue({ success: true, data: mockSales[0] });

      const { result } = renderHook(() => useSales());

      const saleData = {
        id_client: 1,
        total_amount: 100,
        method: 'cash' as const,
        status: 'pending' as const,
        due_date: '2024-01-15',
        products: [{ id_product: 1, quantity: 2 }],
      };

      let response: any;
      await act(async () => {
        response = await result.current.createSale(saleData);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
      });
      expect(response).toEqual({ success: true, data: mockSales[0] });
    });

    it('should handle create error with Error object', async () => {
      mockApiRequest.mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useSales());

      const saleData = {
        id_client: 1,
        total_amount: 100,
        method: 'cash' as const,
        status: 'pending' as const,
        due_date: '2024-01-15',
        products: [],
      };

      await act(async () => {
        await expect(result.current.createSale(saleData)).rejects.toThrow('Create failed');
      });

      expect(result.current.error).toBe('Create failed');
    });

    it('should handle create error without message', async () => {
      mockApiRequest.mockRejectedValue({});

      const { result } = renderHook(() => useSales());

      const saleData = {
        id_client: 1,
        total_amount: 100,
        method: 'cash' as const,
        status: 'pending' as const,
        due_date: '2024-01-15',
        products: [],
      };

      await act(async () => {
        await expect(result.current.createSale(saleData)).rejects.toThrow('Error al crear venta');
      });
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useSales());

      expect(result.current.sales).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });
  });
});
