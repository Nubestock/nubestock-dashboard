import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, apiRequest } from '../config/api';

// Interfaces según Swagger v2.0
export interface Product {
  id: number;
  id_category: number;
  id_origin: number;
  id_measure: number;
  name: string;
  sku: string;
  type: 'MP' | 'PF'; // MP = Materia Prima, PF = Producto Final
  min_stock: number;
  quantity: number;
  is_active: boolean;
  creation_date: string;
  modification_date?: string;
  // Campos adicionales que vienen en la respuesta (joins)
  category_name?: string;
  origin_name?: string;
  measure_name?: string;
  measure_description?: string;
}

export interface Category {
  id: number;
  name: string;
  is_active: boolean;
  creation_date?: string;
  modification_date?: string;
}

export interface CategoryCreateData {
  name: string;
}

export interface CategoryUpdateData extends Partial<CategoryCreateData> {
  is_active?: boolean;
}

export interface Origin {
  id: number;
  id_city: number;
  name: string;
  id_facility: string;
  is_active: boolean;
}

export interface Measure {
  id: number;
  name: string;
  abbreviation: string;
  is_active: boolean;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
}

export interface ProductCreateData {
  name: string;
  sku: string;
  type: 'MP' | 'PF';
  id_category: number;
  id_origin: number;
  id_measure: number;
  quantity?: number;
  min_stock: number;
}

export interface ProductUpdateData extends Partial<ProductCreateData> {
  is_active?: boolean;
}

export interface BulkProductItem {
  name: string;
  sku: string;
  id_category?: number | null;
  id_origin: number;
  id_measure: number;
  type?: 'MP' | 'PF';
  quantity?: number;
  min_stock?: number;
  price: number; // Precio obligatorio
}

export interface BulkProductResponse {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  failed: number;
  products: Product[];
  errors: Array<{
    index: number;
    sku: string;
    name: string;
    error: string;
  }>;
}

// Helper para normalizar productos del backend (convierte strings a números)
function normalizeProduct(product: any): Product {
  return {
    ...product,
    quantity: typeof product.quantity === 'string' ? parseFloat(product.quantity) : product.quantity,
    min_stock: typeof product.min_stock === 'string' ? parseFloat(product.min_stock) : product.min_stock,
  };
}

export function useProducts(page: number = 1, limit: number = 10, type?: 'MP' | 'PF', search?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}?page=${page}&limit=${limit}`;
      
      // Agregar filtro de tipo si se especifica
      if (type) {
        endpoint += `&type=${type}`;
      }

      // Agregar parámetro de búsqueda si existe
      if (search && search.trim()) {
        endpoint += `&search=${encodeURIComponent(search.trim())}`;
      }

      console.log('📦 Cargando productos...', { endpoint, page, limit, type, search });

      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      console.log('📡 Respuesta productos:', response);

      if (response && response.success && response.data) {
        console.log('✅ Productos cargados:', {
          count: response.data.length,
          total: response.pagination?.total || response.data.length,
        });
        setProducts(response.data.map(normalizeProduct));
        
        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination({
            page,
            limit,
            total: response.data.length,
            totalPages: Math.ceil(response.data.length / limit),
          });
        }
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor');
        setProducts([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar productos';
      
      // Manejo especial para errores 403 (sin permisos)
      if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('permisos')) {
        console.warn('⚠️ Sin permisos para ver productos');
        setError(null);
        setProducts([]);
      } else {
        console.error('❌ Error cargando productos:', errorMessage);
        setError(errorMessage);
        setProducts([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, type, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const refetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Crear producto
  const createProduct = useCallback(async (productData: ProductCreateData) => {
    try {
      console.log('🆕 Creando producto:', productData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.PRODUCTS, {
        method: 'POST',
        body: JSON.stringify(productData),
      });

      console.log('✅ Producto creado:', response);
      
      if (response && response.success) {
        await fetchProducts();
        return response;
      } else {
        throw new Error(response.message || 'Error al crear producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear producto';
      console.error('❌ Error creando producto:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProducts]);

  // Actualizar producto
  const updateProduct = useCallback(async (productId: number, productData: ProductUpdateData) => {
    try {
      console.log('📝 Actualizando producto:', productId, productData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });

      console.log('✅ Producto actualizado:', response);
      
      if (response && response.success) {
        await fetchProducts();
        return response;
      } else {
        throw new Error(response.message || 'Error al actualizar producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar producto';
      console.error('❌ Error actualizando producto:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProducts]);

  // Eliminar producto (soft delete)
  const deleteProduct = useCallback(async (productId: number) => {
    try {
      console.log('🗑️ Eliminando producto:', productId);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/${productId}`, {
        method: 'DELETE',
      });

      console.log('✅ Producto eliminado:', response);
      
      if (response && response.success) {
        await fetchProducts();
        return response;
      } else {
        throw new Error(response.message || 'Error al eliminar producto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar producto';
      console.error('❌ Error eliminando producto:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProducts]);

  // Crear productos en lote
  const bulkCreateProducts = useCallback(async (products: BulkProductItem[]) => {
    try {
      console.log('📦 Creando productos en lote:', products.length);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.PRODUCTS}/bulk`, {
        method: 'POST',
        body: JSON.stringify(products),
      });

      console.log('✅ Respuesta bulk:', response);
      
      if (response && response.data) {
        await fetchProducts();
        return response.data as BulkProductResponse;
      } else {
        throw new Error(response.message || 'Error al crear productos en lote');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear productos en lote';
      console.error('❌ Error bulk create:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchProducts]);

  return {
    products,
    pagination,
    isLoading,
    error,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkCreateProducts,
  };
}

// Hook para obtener categorías
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('📂 Cargando categorías desde API...');
      
      const response = await apiRequest('/products/categories', {
        method: 'GET',
      });

      console.log('✅ Categorías cargadas:', response);

      if (response && response.success && response.data) {
        setCategories(response.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar categorías';
      console.error('❌ Error cargando categorías:', errorMessage);
      setError(errorMessage);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Crear categoría
  const createCategory = useCallback(async (categoryData: CategoryCreateData) => {
    try {
      console.log('🆕 Creando categoría:', categoryData);
      
      const response = await apiRequest('/products/categories', {
        method: 'POST',
        body: JSON.stringify(categoryData),
      });

      console.log('✅ Categoría creada:', response);
      
      if (response && response.success) {
        await fetchCategories();
        return response;
      } else {
        throw new Error(response.message || 'Error al crear categoría');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear categoría';
      console.error('❌ Error creando categoría:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCategories]);

  // Actualizar categoría
  const updateCategory = useCallback(async (categoryId: number, categoryData: CategoryUpdateData) => {
    try {
      console.log('📝 Actualizando categoría:', categoryId, categoryData);
      
      const response = await apiRequest(`/products/categories?id=${categoryId}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
      });

      console.log('✅ Categoría actualizada:', response);
      
      if (response && response.success) {
        await fetchCategories();
        return response;
      } else {
        throw new Error(response.message || 'Error al actualizar categoría');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar categoría';
      console.error('❌ Error actualizando categoría:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCategories]);

  // Eliminar categoría (soft delete)
  const deleteCategory = useCallback(async (categoryId: number) => {
    try {
      console.log('🗑️ Eliminando categoría:', categoryId);
      
      const response = await apiRequest(`/products/categories?id=${categoryId}`, {
        method: 'DELETE',
      });

      console.log('✅ Categoría eliminada:', response);
      
      if (response && response.success) {
        await fetchCategories();
        return response;
      } else {
        throw new Error(response.message || 'Error al eliminar categoría');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar categoría';
      console.error('❌ Error eliminando categoría:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchCategories]);

  return { 
    categories, 
    isLoading, 
    error, 
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}

// Hook para obtener orígenes
export function useOrigins() {
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrigins = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('🏭 Cargando orígenes desde API...');
        
        const response = await apiRequest('/products/origins', {
          method: 'GET',
        });

        console.log('✅ Orígenes cargados:', response);

        if (response && response.success && response.data) {
          setOrigins(response.data);
        } else {
          setOrigins([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar orígenes';
        console.error('❌ Error cargando orígenes:', errorMessage);
        setError(errorMessage);
        setOrigins([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrigins();
  }, []);

  return { origins, isLoading, error };
}

// Hook para obtener unidades de medida
export function useMeasures() {
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeasures = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('📏 Cargando unidades de medida desde API...');
        
        const response = await apiRequest('/products/measures', {
          method: 'GET',
        });

        console.log('✅ Unidades de medida cargadas:', response);

        if (response && response.success && response.data) {
          setMeasures(response.data);
        } else {
          setMeasures([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar unidades de medida';
        console.error('❌ Error cargando unidades de medida:', errorMessage);
        setError(errorMessage);
        setMeasures([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeasures();
  }, []);

  return { measures, isLoading, error };
}