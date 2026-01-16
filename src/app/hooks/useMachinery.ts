import { useState, useEffect } from 'react';
import { apiRequest } from '../config/api';

export interface Machinery {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
  creation_date: string;
  modification_date: string | null;
}

export interface Maintenance {
  id: number;
  id_machinery: number;
  name: string;
  type: 'PRV' | 'COR';
  is_active: boolean;
  next_maintainance_value: number | null;
  last_mantainance_date: string;
  machinery_name?: string;
  machinery_description?: string;
}

export interface MaintenanceHistory {
  id: number;
  id_mantainance: number;
  id_user: number;
  details: {
    attachments: Array<{
      id: number;
      content: string;
    }>;
  };
  price: number;
  next_mantainance_date: string;
  creation_date: string;
  maintenance_name?: string;
  maintenance_type?: string;
  machinery_name?: string;
  user_name?: string;
  user_email?: string;
}

export interface MachineryAlert {
  id: number;
  id_mantainance: number;
  type: string;
  date: string;
  title: string;
  message: string;
  is_sent: boolean;
  creation_date: string;
  maintenance_name?: string;
  maintenance_type?: string;
  machinery_name?: string;
}

export function useMachinery(search?: string, isActive?: boolean) {
  const [machinery, setMachinery] = useState<Machinery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachinery = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (isActive !== undefined) params.append('is_active', String(isActive));

      const response = await apiRequest(`/machinery?${params.toString()}`);
      setMachinery(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar maquinaria');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMachinery();
  }, [search, isActive]);

  const createMachinery = async (data: Omit<Machinery, 'id' | 'creation_date' | 'modification_date'>) => {
    const response = await apiRequest('/machinery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchMachinery();
    return response.data;
  };

  const updateMachinery = async (id: number, data: Partial<Machinery>) => {
    const response = await apiRequest(`/machinery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await fetchMachinery();
    return response.data;
  };

  const deleteMachinery = async (id: number) => {
    await apiRequest(`/machinery/${id}`, {
      method: 'DELETE',
    });
    await fetchMachinery();
  };

  return {
    machinery,
    isLoading,
    error,
    refetch: fetchMachinery,
    createMachinery,
    updateMachinery,
    deleteMachinery,
  };
}

export function useMaintenance(idMachinery?: number, type?: string, isActive?: boolean) {
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaintenance = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (idMachinery) params.append('id_machinery', String(idMachinery));
      if (type) params.append('type', type);
      if (isActive !== undefined) params.append('is_active', String(isActive));

      const response = await apiRequest(`/maintenance?${params.toString()}`);
      setMaintenance(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar mantenimientos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [idMachinery, type, isActive]);

  const createMaintenance = async (data: Omit<Maintenance, 'id' | 'machinery_name' | 'machinery_description'>) => {
    const response = await apiRequest('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchMaintenance();
    return response.data;
  };

  const updateMaintenance = async (id: number, data: Partial<Maintenance>) => {
    const response = await apiRequest(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await fetchMaintenance();
    return response.data;
  };

  const deleteMaintenance = async (id: number) => {
    await apiRequest(`/maintenance/${id}`, {
      method: 'DELETE',
    });
    await fetchMaintenance();
  };

  return {
    maintenance,
    isLoading,
    error,
    refetch: fetchMaintenance,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
  };
}

export function useMaintenanceHistory(idMaintenance?: number, idMachinery?: number) {
  const [history, setHistory] = useState<MaintenanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (idMaintenance) params.append('id_mantainance', String(idMaintenance));
      if (idMachinery) params.append('id_machinery', String(idMachinery));

      const response = await apiRequest(`/maintenance/history?${params.toString()}`);
      setHistory(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar historial');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [idMaintenance, idMachinery]);

  const createHistory = async (data: Omit<MaintenanceHistory, 'id' | 'id_user' | 'creation_date' | 'maintenance_name' | 'maintenance_type' | 'machinery_name' | 'user_name' | 'user_email'>) => {
    const response = await apiRequest('/maintenance/history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchHistory();
    return response.data;
  };

  const updateHistory = async (id: number, data: Partial<MaintenanceHistory>) => {
    const response = await apiRequest(`/maintenance/history/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    await fetchHistory();
    return response.data;
  };

  const deleteHistory = async (id: number) => {
    await apiRequest(`/maintenance/history/${id}`, {
      method: 'DELETE',
    });
    await fetchHistory();
  };

  return {
    history,
    isLoading,
    error,
    refetch: fetchHistory,
    createHistory,
    updateHistory,
    deleteHistory,
  };
}

export function useMachineryAlerts(idMaintenance?: number, type?: string, isSent?: boolean) {
  const [alerts, setAlerts] = useState<MachineryAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (idMaintenance) params.append('id_mantainance', String(idMaintenance));
      if (type) params.append('type', type);
      if (isSent !== undefined) params.append('is_sent', String(isSent));

      const response = await apiRequest(`/machinery-alerts?${params.toString()}`);
      setAlerts(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar alertas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [idMaintenance, type, isSent]);

  const detectAlerts = async () => {
    const response = await apiRequest('/machinery-alerts/detect');
    await fetchAlerts();
    return response.data;
  };

  const createAlert = async (data: Omit<MachineryAlert, 'id' | 'creation_date' | 'maintenance_name' | 'maintenance_type' | 'machinery_name'> & { user_ids?: number[] }) => {
    const response = await apiRequest('/machinery-alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    await fetchAlerts();
    return response.data;
  };

  return {
    alerts,
    isLoading,
    error,
    refetch: fetchAlerts,
    detectAlerts,
    createAlert,
  };
}