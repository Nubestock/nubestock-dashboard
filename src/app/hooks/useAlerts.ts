import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, apiRequest } from '../config/api';

// Interfaz para la respuesta del API
export interface AlertFromAPI {
  id: number;
  alert_type: string;
  alert_title: string;
  alert_message: string;
  entity_type: string;
  id_transaction: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  creation_date: string;
  modification_date: string | null;
  resolved_at: string | null;
  resolved_by: number | null;
  due_date: string | null;
}

// Interfaz normalizada para usar en el frontend
export interface Alert {
  idalert: string;
  alert_type: string;
  alert_title: string;
  alert_message: string;
  entity_type: string;
  entity_id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved';
  isactive: boolean;
  creationdate: string;
  modificationdate: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

export interface AlertsResponse {
  success: boolean;
  data: AlertFromAPI[];
  timestamp: string;
}

// Función para mapear la respuesta del API al formato del frontend
function mapAlertFromAPI(apiAlert: AlertFromAPI): Alert {
  // Determinar el status basado en is_active y resolved_at
  let status: 'active' | 'acknowledged' | 'resolved' = 'active';
  if (apiAlert.resolved_at) {
    status = 'resolved';
  } else if (apiAlert.modification_date && apiAlert.is_active) {
    status = 'acknowledged';
  } else if (apiAlert.is_active) {
    status = 'active';
  }

  return {
    idalert: String(apiAlert.id),
    alert_type: apiAlert.alert_type,
    alert_title: apiAlert.alert_title,
    alert_message: apiAlert.alert_message,
    entity_type: apiAlert.entity_type,
    entity_id: String(apiAlert.id_transaction),
    priority: apiAlert.priority,
    status,
    isactive: apiAlert.is_active,
    creationdate: apiAlert.creation_date,
    modificationdate: apiAlert.modification_date,
    resolved_at: apiAlert.resolved_at,
    resolved_by: apiAlert.resolved_by ? String(apiAlert.resolved_by) : null,
  };
}

export function useAlerts(isActive: boolean = true) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Construir la URL con parámetros según lo que espera el backend
      const endpoint = isActive 
        ? `${API_CONFIG.ENDPOINTS.ALERTS}?is_active=true`
        : API_CONFIG.ENDPOINTS.ALERTS;

      console.log('🚨 Cargando alertas desde API...', {
        endpoint,
        isActive,
      });

      const response = await apiRequest<AlertsResponse>(
        endpoint,
        {
          method: 'GET',
        }
      );

      console.log('📡 Respuesta alertas:', response);

      if (response && response.success && response.data) {
        console.log('✅ Alertas cargadas:', {
          count: response.data.length,
          alerts: response.data,
        });
        // Mapear las alertas del API al formato del frontend
        const mappedAlerts = response.data.map(mapAlertFromAPI);
        console.log('🔄 Alertas mapeadas:', mappedAlerts);
        setAlerts(mappedAlerts);
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor');
        setAlerts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar alertas';
      
      // Manejo especial para errores 403 (sin permisos)
      if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('permisos')) {
        console.warn('⚠️ Sin permisos para ver alertas');
        setError(null);
        setAlerts([]);
      } else {
        // No mostrar warning en consola - manejo silencioso
        setError(null);
        setAlerts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isActive]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const refetch = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    isLoading,
    error,
    refetch,
  };
}