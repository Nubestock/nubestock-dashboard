import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, apiRequest } from '../config/api';

// ============= INTERFACES =============

export interface Country {
  id: number;
  name: string;
  is_code: string;
  is_active: boolean;
  creation_date?: string;
  modification_date?: string | null;
}

export interface Province {
  id: number;
  name: string;
  is_code?: string;
  id_country: number;
  is_active: boolean;
  creation_date?: string;
  modification_date?: string | null;
  // Campos adicionales del backend (joins)
  country_name?: string;
}

export interface City {
  id: number;
  name: string;
  is_code?: string;
  id_province: number;
  is_active: boolean;
  creation_date?: string;
  modification_date?: string | null;
  // Campos adicionales del backend (joins)
  province_name?: string;
  country_name?: string;
}

// Interfaces para crear/actualizar
export interface CountryFormData {
  name: string;
  is_code: string;
  is_active?: boolean;
}

export interface ProvinceFormData {
  name: string;
  is_code?: string;
  id_country: number;
  is_active?: boolean;
}

export interface CityFormData {
  name: string;
  is_code?: string;
  id_province: number;
  is_active?: boolean;
}

// ============= HOOK PRINCIPAL =============

export function useLocations() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============= COUNTRIES =============

  const fetchCountries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: Country[] }>(
        '/locations/countries',
        { method: 'GET' }
      );
      setCountries(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar países';
      setError(errorMessage);
      // Silenciar errores en consola cuando el backend no está disponible
      setCountries([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCountry = useCallback(async (data: CountryFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: Country }>(
        '/locations/countries',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      await fetchCountries();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Error al crear país');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCountries]);

  const updateCountry = useCallback(async (id: number, data: Partial<CountryFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: Country }>(
        `/locations/countries?id=${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      await fetchCountries();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar país');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCountries]);

  const deleteCountry = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(
        `/locations/countries?id=${id}`,
        { method: 'DELETE' }
      );
      await fetchCountries();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar país');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCountries]);

  // ============= PROVINCES =============

  const fetchProvinces = useCallback(async (id_country?: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = id_country 
        ? `/locations/provinces?id_country=${id_country}`
        : '/locations/provinces';
      
      const response = await apiRequest<{ data: Province[] }>(url, { method: 'GET' });
      setProvinces(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar provincias';
      setError(errorMessage);
      // Silenciar errores en consola cuando el backend no está disponible
      setProvinces([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createProvince = useCallback(async (data: ProvinceFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: Province }>(
        '/locations/provinces',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      await fetchProvinces();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Error al crear provincia');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProvinces]);

  const updateProvince = useCallback(async (id: number, data: Partial<ProvinceFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: Province }>(
        `/locations/provinces?id=${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      await fetchProvinces();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar provincia');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProvinces]);

  const deleteProvince = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(
        `/locations/provinces?id=${id}`,
        { method: 'DELETE' }
      );
      await fetchProvinces();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar provincia');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProvinces]);

  // ============= CITIES =============

  const fetchCities = useCallback(async (id_province?: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = id_province 
        ? `/locations/cities?id_province=${id_province}`
        : '/locations/cities';
      
      const response = await apiRequest<{ data: City[] }>(url, { method: 'GET' });
      setCities(response.data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar ciudades';
      setError(errorMessage);
      // Silenciar errores en consola cuando el backend no está disponible
      setCities([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createCity = useCallback(async (data: CityFormData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: City }>(
        '/locations/cities',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      await fetchCities();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Error al crear ciudad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCities]);

  const updateCity = useCallback(async (id: number, data: Partial<CityFormData>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<{ data: City }>(
        `/locations/cities?id=${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      );
      await fetchCities();
      return response.data;
    } catch (err: any) {
      setError(err.message || 'Error al actualizar ciudad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCities]);

  const deleteCity = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest(
        `/locations/cities?id=${id}`,
        { method: 'DELETE' }
      );
      await fetchCities();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar ciudad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCities]);

  // Cargar datos iniciales
  useEffect(() => {
    fetchCountries();
    fetchProvinces();
    fetchCities();
  }, [fetchCountries, fetchProvinces, fetchCities]);

  return {
    // Data
    countries,
    provinces,
    cities,
    loading,
    error,
    
    // Countries
    fetchCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    
    // Provinces
    fetchProvinces,
    createProvince,
    updateProvince,
    deleteProvince,
    
    // Cities
    fetchCities,
    createCity,
    updateCity,
    deleteCity,
  };
}