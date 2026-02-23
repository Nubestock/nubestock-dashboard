import { renderHook, act, waitFor } from '@testing-library/react';
import { 
  useDailySalesReport, 
  useClientSalesReport, 
  useTopProductsReport, 
  useDashboardSummary 
} from '@/app/hooks/useSalesReports';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useDailySalesReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockResponse = {
    success: true,
    data: [{ date: '2024-01-01', total_sales: 100, number_of_sales: 5, average_sale: 20, total_paid: 80, total_pending: 20 }],
    summary: { total_sales: 100, total_transactions: 5, best_day: { date: '2024-01-01', total: 100 }, worst_day: { date: '2024-01-01', total: 100 }, average_per_day: 100 },
    timestamp: '2024-01-01',
  };

  it('should not fetch when dates are empty', async () => {
    const { result } = renderHook(() => useDailySalesReport('', ''));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it('should fetch report when dates are provided', async () => {
    mockApiRequest.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useDailySalesReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('/sales/reports/daily'),
      expect.any(Object)
    );
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useDailySalesReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Respuesta inválida del servidor');
    expect(result.current.data).toBeNull();
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useDailySalesReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.data).toBeNull();
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string error');

    const { result } = renderHook(() => useDailySalesReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Error al cargar reporte');
  });
});

describe('useClientSalesReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockResponse = {
    success: true,
    data: [{ idclient: '1', client_name: 'Test', business_name: 'Test Co', ruc_cedula: '123', total_sales: 100, number_of_sales: 5, average_sale: 20, total_paid: 80, total_pending: 20, first_sale_date: '2024-01-01', last_sale_date: '2024-01-31' }],
    summary: { total_clients: 1, total_sales: 100, average_per_client: 100, best_client: { client_name: 'Test', total: 100 } },
    timestamp: '2024-01-01',
  };

  it('should not fetch when dates are empty', async () => {
    const { result } = renderHook(() => useClientSalesReport('', ''));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it('should fetch report with default limit', async () => {
    mockApiRequest.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useClientSalesReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('limit=50'),
      expect.any(Object)
    );
  });

  it('should fetch report with custom limit', async () => {
    mockApiRequest.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useClientSalesReport('2024-01-01', '2024-01-31', 100));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('limit=100'),
      expect.any(Object)
    );
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useClientSalesReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Respuesta inválida del servidor');
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useClientSalesReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useClientSalesReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Error al cargar reporte');
  });
});

describe('useTopProductsReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockResponse = {
    success: true,
    data: [{ idfinal_product: '1', product_name: 'Product', sku: 'SKU001', category: 'Cat', total_quantity_sold: 100, total_sales: 1000, number_of_transactions: 10, average_price: 10 }],
    timestamp: '2024-01-01',
  };

  it('should not fetch when dates are empty', async () => {
    const { result } = renderHook(() => useTopProductsReport('', ''));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it('should fetch report with default limit', async () => {
    mockApiRequest.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useTopProductsReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('limit=20'),
      expect.any(Object)
    );
  });

  it('should fetch report with custom limit', async () => {
    mockApiRequest.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useTopProductsReport('2024-01-01', '2024-01-31', 50));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('limit=50'),
      expect.any(Object)
    );
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useTopProductsReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Respuesta inválida del servidor');
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useTopProductsReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useTopProductsReport('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Error al cargar reporte');
  });
});

describe('useDashboardSummary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockResponse = {
    success: true,
    data: {
      sales_summary: { total_sales: 1000, total_transactions: 50, average_ticket: 20, growth_percentage: 5 },
      payment_status: { paid: 800, pending: 150, overdue: 30, cancelled: 20 },
      top_clients: [{ client_name: 'Test', total: 100 }],
      top_products: [{ product_name: 'Product', quantity: 50 }],
      sales_by_payment_method: { cash: 500, card: 300, transfer: 150, credit: 50 },
    },
    timestamp: '2024-01-01',
  };

  it('should not fetch when dates are empty', async () => {
    const { result } = renderHook(() => useDashboardSummary('', ''));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it('should fetch summary', async () => {
    mockApiRequest.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useDashboardSummary('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockApiRequest).toHaveBeenCalledWith(
      expect.stringContaining('/sales/reports/summary'),
      expect.any(Object)
    );
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useDashboardSummary('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Respuesta inválida del servidor');
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useDashboardSummary('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useDashboardSummary('2024-01-01', '2024-01-31'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Error al cargar resumen');
  });
});
