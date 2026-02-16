import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  checks: {
    api: {
      status: string;
      message: string;
    };
    database: {
      status: string;
      message: string;
    };
    environment: {
      status: string;
      message: string;
    };
  };
  responseTime: string;
}

interface ConfigContextType {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isBackendHealthy: boolean;
  checkBackendHealth: () => Promise<void>;
  lastHealthCheck: Date | null;
  healthCheckData: HealthCheckResponse | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

const STORAGE_KEY = 'nutregam_backend_url';

function getDefaultBackendUrl(): string {
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '';
}

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved != null && saved.trim() !== '') return saved;
    const defaultUrl = getDefaultBackendUrl();
    if (defaultUrl) localStorage.setItem(STORAGE_KEY, defaultUrl);
    return defaultUrl;
  });

  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean>(false);
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | null>(null);
  const [healthCheckData, setHealthCheckData] = useState<HealthCheckResponse | null>(null);

  // Persistir siempre la URL en storage; si está vacía, usar default y asignarla
  useEffect(() => {
    const urlToStore = backendUrl.trim() || getDefaultBackendUrl();
    localStorage.setItem(STORAGE_KEY, urlToStore);
    if (urlToStore && urlToStore !== backendUrl) {
      setBackendUrlState(urlToStore);
    }
  }, [backendUrl]);

  const handleSetBackendUrl = (url: string) => {
    setBackendUrlState(url);
    console.info('URL del backend actualizada:', url);
  };

  const checkBackendHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout de 3s

      console.log('Verificando salud del backend:', `${backendUrl}/healthcheck`);

      const response = await fetch(`${backendUrl}/healthcheck`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: HealthCheckResponse = await response.json();
      
      // Validar que el status sea "healthy"
      const isHealthy = data.status === 'healthy' && 
                       data.checks.api.status === 'healthy' &&
                       data.checks.database.status === 'healthy' &&
                       data.checks.environment.status === 'healthy';

      setIsBackendHealthy(isHealthy);
      setLastHealthCheck(new Date());
      setHealthCheckData(data);
      
      if (isHealthy) {
        console.info('Backend saludable:', {
          status: data.status,
          uptime: `${data.uptime.toFixed(2)}s`,
          responseTime: data.responseTime,
          database: data.checks.database.status,
          api: data.checks.api.status,
          environment: data.checks.environment.status,
        });
      } else {
        console.info('Estado del backend:', data.checks);
      }
    } catch (error) {
      setIsBackendHealthy(false);
      setLastHealthCheck(new Date());
      setHealthCheckData(null);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('Backend no responde: Timeout (3s)');
      } else {
        console.warn('Backend no accesible:', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  // Log inicial del modo de ejecución
  useEffect(() => {
    const mode = import.meta.env.MODE;
    const isProd = import.meta.env.PROD;
    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.info('NUTREGAM - Sistema de Gestión de Producción');
    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.info(`Entorno: ${mode.toUpperCase()}`);
    console.info(`Producción: ${isProd ? 'SÍ' : 'NO'}`);
    console.info(`Backend URL: ${backendUrl}`);
    console.info(`Modo de Datos: SOLO API REAL (sin mocks)`);
    console.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendUrl]);

  return (
    <ConfigContext.Provider
      value={{
        backendUrl,
        setBackendUrl: handleSetBackendUrl,
        isBackendHealthy,
        checkBackendHealth,
        lastHealthCheck,
        healthCheckData,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig debe ser usado dentro de un ConfigProvider');
  }
  return context;
}
