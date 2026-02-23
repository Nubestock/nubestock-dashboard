import { renderHook, act, waitFor } from '@testing-library/react';
import { useLocations } from '@/app/hooks/useLocations';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  API_CONFIG: {},
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useLocations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
  });

  const mockCountries = [
    { id: 1, name: 'Ecuador', is_code: 'EC', is_active: true },
    { id: 2, name: 'Colombia', is_code: 'CO', is_active: true },
  ];

  const mockProvinces = [
    { id: 1, name: 'Pichincha', id_country: 1, is_active: true },
    { id: 2, name: 'Guayas', id_country: 1, is_active: true },
  ];

  const mockCities = [
    { id: 1, name: 'Quito', id_province: 1, is_active: true },
    { id: 2, name: 'Guayaquil', id_province: 2, is_active: true },
  ];

  describe('initial load', () => {
    it('should fetch all data on mount', async () => {
      mockApiRequest
        .mockResolvedValueOnce({ data: mockCountries })
        .mockResolvedValueOnce({ data: mockProvinces })
        .mockResolvedValueOnce({ data: mockCities });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/countries', { method: 'GET' });
      expect(mockApiRequest).toHaveBeenCalledWith('/locations/provinces', { method: 'GET' });
      expect(mockApiRequest).toHaveBeenCalledWith('/locations/cities', { method: 'GET' });
    });
  });

  describe('countries', () => {
    beforeEach(() => {
      mockApiRequest
        .mockResolvedValueOnce({ data: mockCountries })
        .mockResolvedValueOnce({ data: mockProvinces })
        .mockResolvedValueOnce({ data: mockCities });
    });

    it('should fetch countries', async () => {
      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.countries).toEqual(mockCountries);
      });
    });

    it('should create a country', async () => {
      mockApiRequest.mockResolvedValueOnce({ data: mockCountries[0] });
      mockApiRequest.mockResolvedValueOnce({ data: mockCountries });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createCountry({ name: 'Peru', is_code: 'PE' });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/countries', {
        method: 'POST',
        body: JSON.stringify({ name: 'Peru', is_code: 'PE' }),
      });
    });

    it('should update a country', async () => {
      mockApiRequest.mockResolvedValueOnce({ data: { ...mockCountries[0], name: 'Updated' } });
      mockApiRequest.mockResolvedValueOnce({ data: mockCountries });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateCountry(1, { name: 'Updated' });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/countries?id=1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });
    });

    it('should delete a country', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true });
      mockApiRequest.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteCountry(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/countries?id=1', { method: 'DELETE' });
    });

    it('should handle fetch countries error', async () => {
      mockApiRequest.mockReset();
      mockApiRequest.mockRejectedValueOnce(new Error('Network error'));
      mockApiRequest.mockResolvedValueOnce({ data: mockProvinces });
      mockApiRequest.mockResolvedValueOnce({ data: mockCities });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });

      expect(result.current.countries).toEqual([]);
    });

    it('should handle create country error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.createCountry({ name: 'Test', is_code: 'TS' }))
          .rejects.toThrow();
      });

      expect(result.current.error).toBe('Create failed');
    });

    it('should handle update country error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateCountry(1, { name: 'Test' }))
          .rejects.toThrow();
      });
    });

    it('should handle delete country error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteCountry(1))
          .rejects.toThrow();
      });
    });
  });

  describe('provinces', () => {
    beforeEach(() => {
      mockApiRequest
        .mockResolvedValueOnce({ data: mockCountries })
        .mockResolvedValueOnce({ data: mockProvinces })
        .mockResolvedValueOnce({ data: mockCities });
    });

    it('should fetch provinces', async () => {
      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.provinces).toEqual(mockProvinces);
      });
    });

    it('should fetch provinces by country', async () => {
      mockApiRequest.mockResolvedValueOnce({ data: [mockProvinces[0]] });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchProvinces(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/provinces?id_country=1', { method: 'GET' });
    });

    it('should create a province', async () => {
      mockApiRequest.mockResolvedValueOnce({ data: mockProvinces[0] });
      mockApiRequest.mockResolvedValueOnce({ data: mockProvinces });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createProvince({ name: 'Azuay', id_country: 1 });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/provinces', {
        method: 'POST',
        body: JSON.stringify({ name: 'Azuay', id_country: 1 }),
      });
    });

    it('should update a province', async () => {
      mockApiRequest.mockResolvedValueOnce({ data: mockProvinces[0] });
      mockApiRequest.mockResolvedValueOnce({ data: mockProvinces });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateProvince(1, { name: 'Updated' });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/provinces?id=1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });
    });

    it('should delete a province', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true });
      mockApiRequest.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteProvince(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/provinces?id=1', { method: 'DELETE' });
    });

    it('should handle fetch provinces error', async () => {
      mockApiRequest.mockReset();
      mockApiRequest.mockResolvedValueOnce({ data: mockCountries });
      mockApiRequest.mockRejectedValueOnce(new Error('Network error'));
      mockApiRequest.mockResolvedValueOnce({ data: mockCities });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.provinces).toEqual([]);
      });
    });

    it('should handle create province error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.createProvince({ name: 'Test', id_country: 1 }))
          .rejects.toThrow();
      });
    });

    it('should handle update province error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateProvince(1, { name: 'Test' }))
          .rejects.toThrow();
      });
    });

    it('should handle delete province error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteProvince(1))
          .rejects.toThrow();
      });
    });
  });

  describe('cities', () => {
    beforeEach(() => {
      mockApiRequest
        .mockResolvedValueOnce({ data: mockCountries })
        .mockResolvedValueOnce({ data: mockProvinces })
        .mockResolvedValueOnce({ data: mockCities });
    });

    it('should fetch cities', async () => {
      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.cities).toEqual(mockCities);
      });
    });

    it('should fetch cities by province', async () => {
      mockApiRequest.mockResolvedValueOnce({ data: [mockCities[0]] });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.fetchCities(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/cities?id_province=1', { method: 'GET' });
    });

    it('should create a city', async () => {
      mockApiRequest.mockResolvedValueOnce({ data: mockCities[0] });
      mockApiRequest.mockResolvedValueOnce({ data: mockCities });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.createCity({ name: 'Cuenca', id_province: 3 });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/cities', {
        method: 'POST',
        body: JSON.stringify({ name: 'Cuenca', id_province: 3 }),
      });
    });

    it('should update a city', async () => {
      mockApiRequest.mockResolvedValueOnce({ data: mockCities[0] });
      mockApiRequest.mockResolvedValueOnce({ data: mockCities });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.updateCity(1, { name: 'Updated' });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/cities?id=1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });
    });

    it('should delete a city', async () => {
      mockApiRequest.mockResolvedValueOnce({ success: true });
      mockApiRequest.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteCity(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/locations/cities?id=1', { method: 'DELETE' });
    });

    it('should handle fetch cities error', async () => {
      mockApiRequest.mockReset();
      mockApiRequest.mockResolvedValueOnce({ data: mockCountries });
      mockApiRequest.mockResolvedValueOnce({ data: mockProvinces });
      mockApiRequest.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.cities).toEqual([]);
      });
    });

    it('should handle create city error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.createCity({ name: 'Test', id_province: 1 }))
          .rejects.toThrow();
      });
    });

    it('should handle update city error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateCity(1, { name: 'Test' }))
          .rejects.toThrow();
      });
    });

    it('should handle delete city error', async () => {
      mockApiRequest.mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteCity(1))
          .rejects.toThrow();
      });
    });
  });

  describe('error handling with missing message', () => {
    it('should use default error message for countries', async () => {
      mockApiRequest.mockReset();
      mockApiRequest.mockRejectedValueOnce({});
      mockApiRequest.mockResolvedValueOnce({ data: [] });
      mockApiRequest.mockResolvedValueOnce({ data: [] });

      const { result } = renderHook(() => useLocations());

      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar países');
      });
    });
  });
});
