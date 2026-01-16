import { useAuth } from '../contexts/AuthContext';
import { apiRequest as centralApiRequest } from '../config/api';

export const useApi = () => {
  const { logout } = useAuth();

  const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
    try {
      return await centralApiRequest(endpoint, options);
    } catch (error) {
      // Si el error incluye "401" o "sesión expirada", hacer logout
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('401') || errorMessage.toLowerCase().includes('unauthorized')) {
        logout();
        throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
      
      // Lista de endpoints opcionales que pueden fallar sin mostrar error en consola
      const optionalEndpoints = ['/origins', '/measures', '/stats', '/products/measures', '/products/origins'];
      const isOptionalEndpoint = optionalEndpoints.some(ep => endpoint.startsWith(ep));
      const is404 = errorMessage.includes('404');
      
      // Solo mostrar error en consola si NO es un endpoint opcional con 404
      if (!isOptionalEndpoint || !is404) {
        console.error('API Request Error:', error);
      }
      
      throw error;
    }
  };

  const get = (endpoint: string) => {
    return apiRequest(endpoint, { method: 'GET' });
  };

  const post = (endpoint: string, data: any) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const put = (endpoint: string, data: any) => {
    return apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  const del = (endpoint: string) => {
    return apiRequest(endpoint, { method: 'DELETE' });
  };

  return { get, post, put, del, apiRequest };
};