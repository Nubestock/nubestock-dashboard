import { renderHook, act } from '@testing-library/react';
import { useApi } from '@/app/hooks/useApi';

const mockLogout = jest.fn();

jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: mockLogout,
  }),
}));

const mockApiRequest = jest.fn();
jest.mock('@/app/config/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
  });

  describe('apiRequest', () => {
    it('should make successful API request', async () => {
      mockApiRequest.mockResolvedValue({ data: 'test' });
      
      const { result } = renderHook(() => useApi());
      
      let response: any;
      await act(async () => {
        response = await result.current.apiRequest('/test');
      });
      
      expect(response).toEqual({ data: 'test' });
      expect(mockApiRequest).toHaveBeenCalledWith('/test', {});
    });

    it('should logout on 401 error', async () => {
      mockApiRequest.mockRejectedValue(new Error('401 Unauthorized'));
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await expect(result.current.apiRequest('/test')).rejects.toThrow(
          'Sesión expirada. Por favor, inicia sesión nuevamente.'
        );
      });
      
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should logout on unauthorized error', async () => {
      mockApiRequest.mockRejectedValue(new Error('Unauthorized access'));
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await expect(result.current.apiRequest('/test')).rejects.toThrow(
          'Sesión expirada. Por favor, inicia sesión nuevamente.'
        );
      });
      
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should rethrow other errors', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiRequest.mockRejectedValue(new Error('Network error'));
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await expect(result.current.apiRequest('/test')).rejects.toThrow('Network error');
      });
      
      expect(mockLogout).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not log error for optional endpoints with 404', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiRequest.mockRejectedValue(new Error('404 Not Found'));
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await expect(result.current.apiRequest('/origins')).rejects.toThrow('404 Not Found');
      });
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log error for non-optional endpoints with 404', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiRequest.mockRejectedValue(new Error('404 Not Found'));
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await expect(result.current.apiRequest('/users')).rejects.toThrow('404 Not Found');
      });
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle non-Error exceptions', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockApiRequest.mockRejectedValue('string error');
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await expect(result.current.apiRequest('/test')).rejects.toBe('string error');
      });
      
      consoleSpy.mockRestore();
    });
  });

  describe('get', () => {
    it('should make GET request', async () => {
      mockApiRequest.mockResolvedValue({ data: 'test' });
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await result.current.get('/test');
      });
      
      expect(mockApiRequest).toHaveBeenCalledWith('/test', { method: 'GET' });
    });
  });

  describe('post', () => {
    it('should make POST request with data', async () => {
      mockApiRequest.mockResolvedValue({ data: 'created' });
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await result.current.post('/test', { name: 'Test' });
      });
      
      expect(mockApiRequest).toHaveBeenCalledWith('/test', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });
    });
  });

  describe('put', () => {
    it('should make PUT request with data', async () => {
      mockApiRequest.mockResolvedValue({ data: 'updated' });
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await result.current.put('/test/1', { name: 'Updated' });
      });
      
      expect(mockApiRequest).toHaveBeenCalledWith('/test/1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Updated' }),
      });
    });
  });

  describe('del', () => {
    it('should make DELETE request', async () => {
      mockApiRequest.mockResolvedValue({ success: true });
      
      const { result } = renderHook(() => useApi());
      
      await act(async () => {
        await result.current.del('/test/1');
      });
      
      expect(mockApiRequest).toHaveBeenCalledWith('/test/1', { method: 'DELETE' });
    });
  });
});
