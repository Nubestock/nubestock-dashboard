import { renderHook, act, waitFor } from '@testing-library/react';
import { useClients, useProvinces, useCities } from '@/app/hooks/useClients';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  API_CONFIG: {
    BASE_URL: 'http://test.api',
    ENDPOINTS: {
      CLIENTS: '/clients',
    },
  },
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useClients', () => {
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

  const mockClients = [
    {
      id: 1,
      name: 'Cliente Test',
      identification: '1234567890',
      identification_type: 'CED' as const,
      email: 'test@test.com',
      phone: '0999999999',
      address: 'Dirección test',
      id_province: 1,
      id_city: 1,
      requires_credit: false,
      credit_limit: null,
      credit_days: null,
      is_active: true,
      creation_date: '2024-01-01',
    },
  ];

  describe('fetchClients', () => {
    it('should fetch clients on mount', async () => {
      mockApiRequest.mockResolvedValue({ success: true, data: mockClients });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clients).toEqual(mockClients);
    });

    it('should handle unsuccessful response', async () => {
      mockApiRequest.mockResolvedValue({ success: false });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clients).toEqual([]);
    });

    it('should handle 403 permission error', async () => {
      mockApiRequest.mockRejectedValue(new Error('403 Forbidden'));

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clients).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle permission error message', async () => {
      mockApiRequest.mockRejectedValue(new Error('No tiene permisos'));

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle other errors', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockApiRequest.mockRejectedValue('string error');

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Error al cargar clientes');
    });
  });

  describe('createClient', () => {
    it('should create a client', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockResolvedValueOnce({ success: true, data: mockClients[0] })
        .mockResolvedValueOnce({ success: true, data: mockClients });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createClient({
          name: 'Nuevo Cliente',
          identification: '0987654321',
          identification_type: 'RUC',
          email: 'nuevo@test.com',
          phone: '0988888888',
          address: 'Nueva dirección',
          id_province: 1,
          id_city: 1,
          requires_credit: false,
        });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/clients', expect.any(Object));
    });

    it('should handle create error', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createClient({
            name: 'Test',
            identification: '123',
            identification_type: 'CED',
            email: 'test@test.com',
            phone: '123',
            address: 'Test',
            id_province: 1,
            id_city: 1,
            requires_credit: false,
          })
        ).rejects.toThrow('Create failed');
      });
    });

    it('should handle unsuccessful create response', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockResolvedValueOnce({ success: false, message: 'Failed' });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createClient({
            name: 'Test',
            identification: '123',
            identification_type: 'CED',
            email: 'test@test.com',
            phone: '123',
            address: 'Test',
            id_province: 1,
            id_city: 1,
            requires_credit: false,
          })
        ).rejects.toThrow('Failed');
      });
    });
  });

  describe('updateClient', () => {
    it('should update a client', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockResolvedValueOnce({ success: true, data: mockClients[0] })
        .mockResolvedValueOnce({ success: true, data: mockClients });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateClient(1, { name: 'Updated Name' });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/clients/1', expect.any(Object));
    });

    it('should handle update error', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateClient(1, { name: 'Test' })).rejects.toThrow('Update failed');
      });
    });

    it('should handle unsuccessful update response', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockResolvedValueOnce({ success: false, message: 'Update error' });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateClient(1, { name: 'Test' })).rejects.toThrow('Update error');
      });
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce({ success: true, data: [] });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteClient(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/clients/1', { method: 'DELETE' });
    });

    it('should handle delete error', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteClient(1)).rejects.toThrow('Delete failed');
      });
    });

    it('should handle unsuccessful delete response', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockResolvedValueOnce({ success: false, message: 'Cannot delete' });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteClient(1)).rejects.toThrow('Cannot delete');
      });
    });
  });

  describe('bulkCreateClients', () => {
    it('should create clients in bulk', async () => {
      const bulkResponse = {
        total: 2,
        created: 2,
        updated: 0,
        failed: 0,
        clients: mockClients,
        errors: [],
      };

      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockResolvedValueOnce({ data: bulkResponse })
        .mockResolvedValueOnce({ success: true, data: mockClients });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        const response = await result.current.bulkCreateClients([
          {
            name: 'Cliente 1',
            identification: '111',
            identification_type: 'CED',
            email: 'c1@test.com',
            phone: '111',
            address: 'Address 1',
            id_province: 1,
            id_city: 1,
            requires_credit: false,
          },
        ]);
        expect(response).toEqual(bulkResponse);
      });
    });

    it('should handle bulk create error', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockRejectedValueOnce(new Error('Bulk failed'));

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.bulkCreateClients([])).rejects.toThrow('Bulk failed');
      });
    });

    it('should handle unsuccessful bulk response', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ success: true, data: mockClients })
        .mockResolvedValueOnce({ success: false, message: 'Bulk error' });

      const { result } = renderHook(() => useClients());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.bulkCreateClients([])).rejects.toThrow('Bulk error');
      });
    });
  });

  describe('refetch', () => {
    it('should refetch clients', async () => {
      mockApiRequest.mockResolvedValue({ success: true, data: mockClients });

      const { result } = renderHook(() => useClients());

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

describe('useProvinces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockProvinces = [
    { id: 1, name: 'Pichincha', id_country: 1, is_code: 'PIC', is_active: true },
  ];

  it('should fetch provinces on mount', async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: mockProvinces });

    const { result } = renderHook(() => useProvinces());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.provinces).toEqual(mockProvinces);
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useProvinces());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.provinces).toEqual([]);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useProvinces());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.provinces).toEqual([]);
  });

  it('should handle non-Error exceptions', async () => {
    mockApiRequest.mockRejectedValue('string error');

    const { result } = renderHook(() => useProvinces());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar provincias');
  });
});

describe('useCities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockCities = [
    { id: 1, name: 'Quito', id_province: 1, is_code: 'QUI', is_active: true },
  ];

  it('should fetch all cities when no provinceId provided', async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: mockCities });

    const { result } = renderHook(() => useCities());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/locations/cities', { method: 'GET' });
    expect(result.current.cities).toEqual(mockCities);
  });

  it('should fetch cities by province', async () => {
    mockApiRequest.mockResolvedValue({ success: true, data: mockCities });

    const { result } = renderHook(() => useCities(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/locations/cities?id_province=1', { method: 'GET' });
  });

  it('should handle unsuccessful response', async () => {
    mockApiRequest.mockResolvedValue({ success: false });

    const { result } = renderHook(() => useCities());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.cities).toEqual([]);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCities());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.cities).toEqual([]);
  });

  it('should handle non-Error exceptions', async () => {
    mockApiRequest.mockRejectedValue('string error');

    const { result } = renderHook(() => useCities());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error al cargar ciudades');
  });
});
