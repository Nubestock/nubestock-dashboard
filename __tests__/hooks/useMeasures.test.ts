import { renderHook, act, waitFor } from '@testing-library/react';
import { useMeasures } from '@/app/hooks/useMeasures';

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

describe('useMeasures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockPut.mockReset();
    mockDel.mockReset();
  });

  const mockMeasures = [
    { id: 1, name: 'KG', description: 'Kilogramos', is_active: true, created_at: '2024-01-01' },
    { id: 2, name: 'LT', description: 'Litros', is_active: true, created_at: '2024-01-01' },
  ];

  describe('fetchMeasures', () => {
    it('should fetch measures on mount when autoFetch is true', async () => {
      mockGet.mockResolvedValue({ success: true, data: mockMeasures });
      
      const { result } = renderHook(() => useMeasures(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(mockGet).toHaveBeenCalledWith('/products/measures');
      expect(result.current.measures).toEqual(mockMeasures);
    });

    it('should not fetch on mount when autoFetch is false', () => {
      mockGet.mockResolvedValue({ success: true, data: mockMeasures });
      
      renderHook(() => useMeasures(false));
      
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('should handle empty response', async () => {
      mockGet.mockResolvedValue({ success: true, data: null });
      
      const { result } = renderHook(() => useMeasures(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.measures).toEqual([]);
    });

    it('should handle 404 error gracefully', async () => {
      mockGet.mockRejectedValue(new Error('404 Not Found'));
      
      const { result } = renderHook(() => useMeasures(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.measures).toEqual([]);
      expect(result.current.error).toBe('El sistema de medidas estará disponible próximamente');
    });

    it('should handle other errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGet.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useMeasures(true));
      
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
      
      const { result } = renderHook(() => useMeasures(true));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.error).toBe('Error al cargar medidas');
      consoleSpy.mockRestore();
    });
  });

  describe('createMeasure', () => {
    it('should create a new measure', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] });
      mockPost.mockResolvedValue({ success: true, data: mockMeasures[0] });
      
      const { result } = renderHook(() => useMeasures(false));
      
      let createdMeasure: any;
      await act(async () => {
        createdMeasure = await result.current.createMeasure({ name: 'KG', description: 'Kilogramos' });
      });
      
      expect(mockPost).toHaveBeenCalledWith('/products/measures', { name: 'KG', description: 'Kilogramos' });
      expect(createdMeasure).toEqual(mockMeasures[0]);
    });

    it('should throw error on create failure', async () => {
      mockPost.mockRejectedValue(new Error('Create failed'));
      
      const { result } = renderHook(() => useMeasures(false));
      
      await act(async () => {
        await expect(result.current.createMeasure({ name: 'KG', description: 'Kilogramos' }))
          .rejects.toThrow('Create failed');
      });
    });

    it('should handle non-Error exceptions on create', async () => {
      mockPost.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useMeasures(false));
      
      await act(async () => {
        await expect(result.current.createMeasure({ name: 'KG', description: 'Kilogramos' }))
          .rejects.toThrow('Error al crear medida');
      });
    });
  });

  describe('updateMeasure', () => {
    it('should update an existing measure', async () => {
      mockGet.mockResolvedValue({ success: true, data: mockMeasures });
      mockPut.mockResolvedValue({ success: true, data: { ...mockMeasures[0], name: 'GR' } });
      
      const { result } = renderHook(() => useMeasures(false));
      
      let updatedMeasure: any;
      await act(async () => {
        updatedMeasure = await result.current.updateMeasure(1, { name: 'GR' });
      });
      
      expect(mockPut).toHaveBeenCalledWith('/products/measures?id=1', { name: 'GR' });
      expect(updatedMeasure.name).toBe('GR');
    });

    it('should throw error on update failure', async () => {
      mockPut.mockRejectedValue(new Error('Update failed'));
      
      const { result } = renderHook(() => useMeasures(false));
      
      await act(async () => {
        await expect(result.current.updateMeasure(1, { name: 'GR' }))
          .rejects.toThrow('Update failed');
      });
    });

    it('should handle non-Error exceptions on update', async () => {
      mockPut.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useMeasures(false));
      
      await act(async () => {
        await expect(result.current.updateMeasure(1, { name: 'GR' }))
          .rejects.toThrow('Error al actualizar medida');
      });
    });
  });

  describe('deleteMeasure', () => {
    it('should delete a measure', async () => {
      mockGet.mockResolvedValue({ success: true, data: [] });
      mockDel.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useMeasures(false));
      
      await act(async () => {
        await result.current.deleteMeasure(1);
      });
      
      expect(mockDel).toHaveBeenCalledWith('/products/measures?id=1');
    });

    it('should throw error on delete failure', async () => {
      mockDel.mockRejectedValue(new Error('Delete failed'));
      
      const { result } = renderHook(() => useMeasures(false));
      
      await act(async () => {
        await expect(result.current.deleteMeasure(1))
          .rejects.toThrow('Delete failed');
      });
    });

    it('should handle non-Error exceptions on delete', async () => {
      mockDel.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useMeasures(false));
      
      await act(async () => {
        await expect(result.current.deleteMeasure(1))
          .rejects.toThrow('Error al eliminar medida');
      });
    });
  });
});
