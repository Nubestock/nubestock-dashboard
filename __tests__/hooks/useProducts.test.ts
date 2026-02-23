import { renderHook, act, waitFor } from '@testing-library/react';
import { useProducts, useCategories, useOrigins, useMeasures } from '@/app/hooks/useProducts';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  API_CONFIG: {
    ENDPOINTS: {
      PRODUCTS: '/products',
    },
  },
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useProducts', () => {
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

  const mockProducts = [
    { id: 1, name: 'Product 1', sku: 'SKU001', type: 'MP', quantity: '10.5', min_stock: '5', id_category: 1, id_origin: 1, id_measure: 1, is_active: true, creation_date: '2024-01-01' },
    { id: 2, name: 'Product 2', sku: 'SKU002', type: 'PF', quantity: 20, min_stock: 10, id_category: 1, id_origin: 1, id_measure: 1, is_active: true, creation_date: '2024-01-01' },
  ];

  const mockResponse = {
    success: true,
    data: mockProducts,
    pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    timestamp: '2024-01-01',
  };

  describe('fetchProducts', () => {
    it('should fetch products on mount', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[0].quantity).toBe(10.5);
    });

    it('should fetch with type and search filters', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      renderHook(() => useProducts(1, 10, 'MP', 'test'));

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith(
          expect.stringContaining('type=MP'),
          expect.any(Object)
        );
      });

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('search=test'),
        expect.any(Object)
      );
    });

    it('should handle response without pagination', async () => {
      mockApiRequest.mockResolvedValue({ success: true, data: mockProducts });

      const { result } = renderHook(() => useProducts(1, 10));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagination.totalPages).toBe(1);
    });

    it('should handle unsuccessful response', async () => {
      mockApiRequest.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.products).toEqual([]);
    });

    it('should handle 403 permission error', async () => {
      mockApiRequest.mockRejectedValue(new Error('403 Forbidden'));

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.products).toEqual([]);
    });

    it('should handle permission error message', async () => {
      mockApiRequest.mockRejectedValue(new Error('No tiene permisos'));

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle other errors', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockApiRequest.mockRejectedValue('string error');

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Error al cargar productos');
    });
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true, data: mockProducts[0] })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createProduct({
          name: 'New Product',
          sku: 'NEW001',
          type: 'MP',
          id_category: 1,
          id_origin: 1,
          id_measure: 1,
          min_stock: 5,
        });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/products', expect.objectContaining({ method: 'POST' }));
    });

    it('should handle create error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createProduct({ name: 'Test', sku: 'T', type: 'MP', id_category: 1, id_origin: 1, id_measure: 1, min_stock: 1 })
        ).rejects.toThrow('Create failed');
      });
    });

    it('should handle unsuccessful create response', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: false, message: 'Failed' });

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createProduct({ name: 'Test', sku: 'T', type: 'MP', id_category: 1, id_origin: 1, id_measure: 1, min_stock: 1 })
        ).rejects.toThrow('Failed');
      });
    });

    it('should handle non-Error exception on create', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce('string error');

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createProduct({ name: 'Test', sku: 'T', type: 'MP', id_category: 1, id_origin: 1, id_measure: 1, min_stock: 1 })
        ).rejects.toThrow('Error al crear producto');
      });
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateProduct(1, { name: 'Updated' });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/products/1', expect.objectContaining({ method: 'PUT' }));
    });

    it('should handle update error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateProduct(1, {})).rejects.toThrow('Update failed');
      });
    });

    it('should handle unsuccessful update response', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: false, message: 'Error' });

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateProduct(1, {})).rejects.toThrow('Error');
      });
    });

    it('should handle non-Error exception on update', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce('string');

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateProduct(1, {})).rejects.toThrow('Error al actualizar producto');
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteProduct(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/products/1', { method: 'DELETE' });
    });

    it('should handle delete error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteProduct(1)).rejects.toThrow('Delete failed');
      });
    });

    it('should handle unsuccessful delete response', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: false, message: 'Error' });

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteProduct(1)).rejects.toThrow('Error');
      });
    });

    it('should handle non-Error exception on delete', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce('string');

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteProduct(1)).rejects.toThrow('Error al eliminar producto');
      });
    });
  });

  describe('bulkCreateProducts', () => {
    it('should create products in bulk', async () => {
      const bulkResponse = { success: true, created: 2, updated: 0, failed: 0, products: mockProducts, errors: [] };
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ data: bulkResponse })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.bulkCreateProducts([
          { name: 'P1', sku: 'S1', id_origin: 1, id_measure: 1, price: 10 },
        ]);
        expect(response).toEqual(bulkResponse);
      });
    });

    it('should handle bulk create error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Bulk failed'));

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.bulkCreateProducts([])).rejects.toThrow('Bulk failed');
      });
    });

    it('should handle unsuccessful bulk response', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: false, message: 'Bulk error' });

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.bulkCreateProducts([])).rejects.toThrow('Bulk error');
      });
    });

    it('should handle non-Error exception on bulk', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce('string');

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.bulkCreateProducts([])).rejects.toThrow('Error al crear productos en lote');
      });
    });
  });

  describe('refetch', () => {
    it('should refetch products', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useProducts());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.refetch();
      });

      expect(mockApiRequest).toHaveBeenCalledTimes(2);
    });
  });
});

describe('useCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockCategories = [{ id: 1, name: 'Category 1', is_active: true }];

  it('should fetch categories on mount', async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: mockCategories });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual(mockCategories);
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.categories).toEqual([]);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar categorías');
  });

  it('should create a category', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: mockCategories });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createCategory({ name: 'New Category' });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/products/categories', expect.objectContaining({ method: 'POST' }));
  });

  it('should handle create error', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockRejectedValueOnce(new Error('Create failed'));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.createCategory({ name: 'Test' })).rejects.toThrow('Create failed');
    });
  });

  it('should handle unsuccessful create response', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockResolvedValueOnce({ success: false, message: 'Error' });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.createCategory({ name: 'Test' })).rejects.toThrow('Error');
    });
  });

  it('should handle non-Error exception on create', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockRejectedValueOnce('string');

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.createCategory({ name: 'Test' })).rejects.toThrow('Error al crear categoría');
    });
  });

  it('should update a category', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: mockCategories });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateCategory(1, { name: 'Updated' });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/products/categories?id=1', expect.objectContaining({ method: 'PUT' }));
  });

  it('should handle update error', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.updateCategory(1, {})).rejects.toThrow('Update failed');
    });
  });

  it('should handle unsuccessful update response', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockResolvedValueOnce({ success: false, message: 'Error' });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.updateCategory(1, {})).rejects.toThrow('Error');
    });
  });

  it('should handle non-Error exception on update', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockRejectedValueOnce('string');

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.updateCategory(1, {})).rejects.toThrow('Error al actualizar categoría');
    });
  });

  it('should delete a category', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ success: true, data: [] });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteCategory(1);
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/products/categories?id=1', { method: 'DELETE' });
  });

  it('should handle delete error', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.deleteCategory(1)).rejects.toThrow('Delete failed');
    });
  });

  it('should handle unsuccessful delete response', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockResolvedValueOnce({ success: false, message: 'Error' });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.deleteCategory(1)).rejects.toThrow('Error');
    });
  });

  it('should handle non-Error exception on delete', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ success: true, data: mockCategories })
      .mockRejectedValueOnce('string');

    const { result } = renderHook(() => useCategories());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.deleteCategory(1)).rejects.toThrow('Error al eliminar categoría');
    });
  });
});

describe('useOrigins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockOrigins = [{ id: 1, id_city: 1, name: 'Origin 1', id_facility: 'F1', is_active: true }];

  it('should fetch origins on mount', async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: mockOrigins });

    const { result } = renderHook(() => useOrigins());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.origins).toEqual(mockOrigins);
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useOrigins());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.origins).toEqual([]);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useOrigins());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useOrigins());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar orígenes');
  });
});

describe('useMeasures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockMeasures = [{ id: 1, name: 'KG', abbreviation: 'KG', is_active: true }];

  it('should fetch measures on mount', async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: mockMeasures });

    const { result } = renderHook(() => useMeasures());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.measures).toEqual(mockMeasures);
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useMeasures());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.measures).toEqual([]);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useMeasures());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useMeasures());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar unidades de medida');
  });
});
