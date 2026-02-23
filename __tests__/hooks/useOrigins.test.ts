import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrigins } from '@/app/hooks/useOrigins';

const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDel = jest.fn();

jest.mock('@/app/hooks/useApi', () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
    put: mockPut,
    del: mockDel,
  }),
}));

describe('useOrigins', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPut.mockReset();
    mockDel.mockReset();
  });

  const mockOrigins = [
    { id: 1, name: 'Origen 1', id_city: 1, city_name: 'Ciudad 1', is_active: true, created_at: '2024-01-01' },
    { id: 2, name: 'Origen 2', id_city: 2, city_name: 'Ciudad 2', is_active: true, created_at: '2024-01-01' },
  ];

  describe('fetchOrigins', () => {
    it('should fetch origins on mount when autoFetch is true', async () => {
      mockGet.mockResolvedValue({ success: true, data: mockOrigins });
      
      const { result } = renderHook(() => useOrigins(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGet).toHaveBeenCalledWith('/products/origins');
      expect(result.current.origins).toEqual(mockOrigins);
    });

    it('should not fetch on mount when autoFetch is false', () => {
      mockGet.mockResolvedValue({ success: true, data: mockOrigins });
      
      renderHook(() => useOrigins(false));
      
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should handle empty response', async () => {
      mockGet.mockResolvedValue({ success: true, data: null });
      
      const { result } = renderHook(() => useOrigins(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.origins).toEqual([]);
    });

    it('should handle 404 error gracefully', async () => {
      mockGet.mockRejectedValue(new Error('404 Not Found'));
      
      const { result } = renderHook(() => useOrigins(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.origins).toEqual([]);
      expect(result.current.error).toBe('El sistema de orígenes estará disponible próximamente');
    });

    it('should handle not found error', async () => {
      mockGet.mockRejectedValue(new Error('Resource not found'));
      
      const { result } = renderHook(() => useOrigins(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.origins).toEqual([]);
      expect(result.current.error).toBe('El sistema de orígenes estará disponible próximamente');
    });

    it('should handle other errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGet.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useOrigins(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('Network error');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGet.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useOrigins(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('Error al cargar orígenes');
      consoleSpy.mockRestore();
    });
  });

  describe('createOrigin', () => {
    it('should create a new origin', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] });
      mockPost.mockResolvedValue({ success: true, data: mockOrigins[0] });
      
      const { result } = renderHook(() => useOrigins(false));
      
      let createdOrigin: any;
      await act(async () => {
        createdOrigin = await result.current.createOrigin({ name: 'Origen 1', id_city: 1 });
      });
      
      expect(mockPost).toHaveBeenCalledWith('/products/origins', { name: 'Origen 1', id_city: 1 });
      expect(createdOrigin).toEqual(mockOrigins[0]);
    });

    it('should throw error on create failure', async () => {
      mockPost.mockRejectedValue(new Error('Create failed'));
      
      const { result } = renderHook(() => useOrigins(false));
      
      await act(async () => {
        await expect(result.current.createOrigin({ name: 'Origen', id_city: 1 }))
          .rejects.toThrow('Create failed');
      });
    });

    it('should handle non-Error exceptions on create', async () => {
      mockPost.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useOrigins(false));
      
      await act(async () => {
        await expect(result.current.createOrigin({ name: 'Origen', id_city: 1 }))
          .rejects.toThrow('Error al crear origen');
      });
    });
  });

  describe('updateOrigin', () => {
    it('should update an existing origin', async () => {
      mockGet.mockResolvedValue({ success: true, data: mockOrigins });
      mockPut.mockResolvedValue({ success: true, data: { ...mockOrigins[0], name: 'Nuevo Nombre' } });
      
      const { result } = renderHook(() => useOrigins(false));
      
      let updatedOrigin: any;
      await act(async () => {
        updatedOrigin = await result.current.updateOrigin(1, { name: 'Nuevo Nombre' });
      });
      
      expect(mockPut).toHaveBeenCalledWith('/products/origins?id=1', { name: 'Nuevo Nombre' });
      expect(updatedOrigin.name).toBe('Nuevo Nombre');
    });

    it('should throw error on update failure', async () => {
      mockPut.mockRejectedValue(new Error('Update failed'));
      
      const { result } = renderHook(() => useOrigins(false));
      
      await act(async () => {
        await expect(result.current.updateOrigin(1, { name: 'Nuevo' }))
          .rejects.toThrow('Update failed');
      });
    });

    it('should handle non-Error exceptions on update', async () => {
      mockPut.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useOrigins(false));
      
      await act(async () => {
        await expect(result.current.updateOrigin(1, { name: 'Nuevo' }))
          .rejects.toThrow('Error al actualizar origen');
      });
    });
  });

  describe('deleteOrigin', () => {
    it('should delete an origin', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] });
      mockDel.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useOrigins(false));
      
      await act(async () => {
        await result.current.deleteOrigin(1);
      });
      
      expect(mockDel).toHaveBeenCalledWith('/products/origins?id=1');
    });

    it('should throw error on delete failure', async () => {
      mockDel.mockRejectedValue(new Error('Delete failed'));
      
      const { result } = renderHook(() => useOrigins(false));
      
      await act(async () => {
        await expect(result.current.deleteOrigin(1))
          .rejects.toThrow('Delete failed');
      });
    });

    it('should handle non-Error exceptions on delete', async () => {
      mockDel.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useOrigins(false));
      
      await act(async () => {
        await expect(result.current.deleteOrigin(1))
          .rejects.toThrow('Error al eliminar origen');
      });
    });
  });
});
