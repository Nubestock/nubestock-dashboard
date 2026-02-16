// Configuración del backend: VITE_API_BASE_URL = ruta completa (ej. https://xxx.azurewebsites.net/api)
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  /** Código de invocación (query ?code=) que exige el backend. Viene de VITE_API_CODE. */
  API_CODE: import.meta.env.VITE_API_CODE || '',
  // Endpoints
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PRODUCTS: '/products',
    CLIENTS: '/clients',
    ALERTS: '/alerts',
    RECIPES: '/products/recipes',
    RECIPE: '/products/recipe',
    SALES: '/sales',
  },
  
  // Timeout por defecto (en milisegundos)
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
};

// Helper para obtener la configuración desde localStorage
export const getBackendUrl = (): string => {
  const saved = localStorage.getItem('nutregam_backend_url');
  return saved || API_CONFIG.BASE_URL;
};

// Helper para hacer requests con autenticación
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const base = getBackendUrl();
  const separator = endpoint.includes('?') ? '&' : '?';
  const codeParam = API_CONFIG.API_CODE ? `${separator}code=${encodeURIComponent(API_CONFIG.API_CODE)}` : '';
  const fullUrl = `${base}${endpoint}${codeParam}`;
  console.log(`🌐 API Request: ${options.method || 'GET'} ${fullUrl}`);
  if (options.body) {
    console.log(`📦 Request Body:`, options.body);
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      // Lista de endpoints que pueden no estar implementados aún
      const optionalEndpoints = ['/origins', '/measures', '/stats', '/products/measures', '/products/origins', '/locations/countries', '/locations/provinces', '/locations/cities'];
      const isOptionalEndpoint = optionalEndpoints.some(ep => endpoint.startsWith(ep));
      
      // Para 404 en endpoints opcionales, solo un warning silencioso
      if (response.status === 404 && isOptionalEndpoint) {
        console.warn(`⚠️ Endpoint ${endpoint} no disponible aún (404)`);
        throw new Error(`Error: 404`);
      }
      
      // Para 403 (sin permisos), warning silencioso
      if (response.status === 403) {
        console.warn(`⚠️ Sin permisos para acceder a ${endpoint}`);
        throw new Error(errorMessage);
      }
      
      // Para otros errores, mostrar log completo
      console.error(`❌ Error Response:`, {
        status: response.status,
        statusText: response.statusText,
        errorData,
        endpoint,
        method: options.method,
      });
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // Si es un error de red (Failed to fetch), no loguear nada
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw err;
    }
    // Para otros errores, propagar sin logging adicional
    throw err;
  }
};