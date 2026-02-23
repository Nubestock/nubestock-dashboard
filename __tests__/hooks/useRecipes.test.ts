import { renderHook, act, waitFor } from '@testing-library/react';
import { useRecipes } from '@/app/hooks/useRecipes';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  API_CONFIG: {
    ENDPOINTS: {
      RECIPES: '/products/recipes',
      RECIPE: '/products/recipe',
    },
  },
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useRecipes', () => {
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

  const mockProductsWithRecipes = [
    {
      id_product: 1,
      product_name: 'Producto Final',
      sku: 'PF001',
      receipe_id: 1,
      creation_date: '2024-01-01',
      modification_date: null,
      materials: [
        { id: 1, id_product: 2, name: 'Material A', code: 'MA001', type: 'MP' as const, measure_name: 'KG', quantity: 5, creation_date: '2024-01-01', modification_date: null },
        { id: 2, id_product: 3, name: 'Material B', code: 'MB001', type: 'MP' as const, measure_name: 'LT', quantity: 2, creation_date: '2024-01-01', modification_date: null },
      ],
    },
  ];

  const mockResponse = {
    success: true,
    data: mockProductsWithRecipes,
    count: 1,
    totalRecipes: 2,
    timestamp: '2024-01-01',
  };

  describe('fetchRecipes', () => {
    it('should fetch recipes on mount', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.productsWithRecipes).toEqual(mockProductsWithRecipes);
      expect(result.current.recipes).toHaveLength(2);
    });

    it('should fetch recipes for specific product', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      renderHook(() => useRecipes(1));

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith(
          expect.stringContaining('id_product=1'),
          expect.any(Object)
        );
      });
    });

    it('should handle unsuccessful response', async () => {
      mockApiRequest.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.recipes).toEqual([]);
      expect(result.current.productsWithRecipes).toEqual([]);
    });

    it('should handle 403 permission error', async () => {
      mockApiRequest.mockRejectedValue(new Error('403 Forbidden'));

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.recipes).toEqual([]);
    });

    it('should handle permission error message', async () => {
      mockApiRequest.mockRejectedValue(new Error('No tiene permisos'));

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle other errors', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockApiRequest.mockRejectedValue('string error');

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Error al cargar recetas');
    });
  });

  describe('createRecipe', () => {
    it('should create recipe successfully', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true, data: {} })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createRecipe({
          id_product: 1,
          materials: [{ id_product: 2, quantity: 5 }],
        });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/products/recipe', expect.objectContaining({ method: 'POST' }));
    });

    it('should handle create error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createRecipe({ id_product: 1, materials: [] })
        ).rejects.toThrow('Create failed');
      });
    });

    it('should handle unsuccessful create response', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: false, message: 'Failed' });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createRecipe({ id_product: 1, materials: [] })
        ).rejects.toThrow('Failed');
      });
    });

    it('should handle non-Error exception on create', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce('string error');

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createRecipe({ id_product: 1, materials: [] })
        ).rejects.toThrow('Error al crear receta');
      });
    });
  });

  describe('updateRecipe', () => {
    it('should update recipe successfully', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateRecipe(1, { quantity: 10 });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/products/recipes/1', expect.objectContaining({ method: 'PUT' }));
    });

    it('should handle update error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateRecipe(1, {})).rejects.toThrow('Update failed');
      });
    });

    it('should handle unsuccessful update response', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: false, message: 'Update error' });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateRecipe(1, {})).rejects.toThrow('Update error');
      });
    });

    it('should handle non-Error exception on update', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce('string error');

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateRecipe(1, {})).rejects.toThrow('Error al actualizar receta');
      });
    });
  });

  describe('deleteRecipe', () => {
    it('should delete recipe successfully', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteRecipe(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/products/recipe?id_product=1', { method: 'DELETE' });
    });

    it('should handle delete error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteRecipe(1)).rejects.toThrow('Delete failed');
      });
    });

    it('should handle unsuccessful delete response', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: false, message: 'Cannot delete' });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteRecipe(1)).rejects.toThrow('Cannot delete');
      });
    });

    it('should handle non-Error exception on delete', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce('string error');

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteRecipe(1)).rejects.toThrow('Error al eliminar receta');
      });
    });
  });

  describe('updateCompleteRecipe', () => {
    it('should update complete recipe', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateCompleteRecipe(1, [{ id_product: 2, quantity_required: 5 }]);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/products/recipe', expect.objectContaining({ method: 'PUT' }));
    });

    it('should handle update complete recipe error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateCompleteRecipe(1, [])).rejects.toThrow('Update failed');
      });
    });

    it('should handle unsuccessful update complete response', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: false, message: 'Error' });

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateCompleteRecipe(1, [])).rejects.toThrow('Error');
      });
    });

    it('should handle non-Error exception on update complete', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce('string error');

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateCompleteRecipe(1, [])).rejects.toThrow('Error al actualizar receta completa');
      });
    });
  });

  describe('getRecipesByProduct', () => {
    it('should return recipes grouped by product', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const grouped = result.current.getRecipesByProduct();
      expect(grouped[1]).toEqual(mockProductsWithRecipes[0]);
    });
  });

  describe('refetch', () => {
    it('should refetch recipes', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        result.current.refetch();
      });

      expect(mockApiRequest).toHaveBeenCalledTimes(2);
    });
  });

  describe('createRecipeWithMaterials', () => {
    it('should be an alias for createRecipe', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useRecipes());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createRecipeWithMaterials({
          id_product: 1,
          materials: [{ id_product: 2, quantity: 5 }],
        });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/products/recipe', expect.objectContaining({ method: 'POST' }));
    });
  });
});
