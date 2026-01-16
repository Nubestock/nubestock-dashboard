import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG, apiRequest } from '../config/api';

// Interfaces según Swagger v2.0
export interface Recipe {
  id: number;
  id_product: number;
  quantity: number;
  creation_date: string;
  modification_date?: string;
}

// Interfaz para el material dentro de una receta (respuesta expandida del API)
export interface RecipeMaterial {
  id: number;
  name: string;
  code: string;
  type: 'MP' | 'PF';
  measure_name: string;
}

// Interfaz para el producto con sus recetas (respuesta del API v2.0 - simplificada)
export interface ProductWithRecipes {
  id_product: number;
  product_name: string;
  sku: string;
  receipe_id: number;
  creation_date: string;
  modification_date?: string | null;
  materials: RecipeMaterial[];
}

// Respuesta del API
export interface RecipeResponse {
  success: boolean;
  data: ProductWithRecipes[];
  count: number;
  totalRecipes: number;
  timestamp: string;
}

// Para crear una receta individual
export interface CreateRecipeData {
  id_product: number; // ID del producto final
  materials: Array<{
    id_product: number; // ID del material (MP)
    quantity: number;
  }>;
}

// Para actualizar una receta
export interface UpdateRecipeData {
  id_product?: number;
  quantity?: number;
}

export function useRecipes(productId?: number) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [productsWithRecipes, setProductsWithRecipes] = useState<ProductWithRecipes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let endpoint = API_CONFIG.ENDPOINTS.RECIPES;
      
      // Si se especifica un producto, filtrar por ese producto
      if (productId) {
        endpoint += `?id_product=${productId}`;
      }

      console.log('📋 Cargando recetas desde API...', { endpoint, productId });

      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      console.log('📡 Respuesta recetas:', response);

      if (response && response.success && response.data) {
        console.log('✅ Recetas cargadas:', {
          count: response.data.length,
        });
        
        // La respuesta del API es una lista de ProductWithRecipes
        setProductsWithRecipes(response.data);
        
        // Convertir a lista plana de recetas si es necesario
        const flatRecipes: Recipe[] = [];
        response.data.forEach((product: ProductWithRecipes) => {
          product.materials.forEach((material: RecipeMaterial) => {
            flatRecipes.push({
              id: material.id,
              id_product: product.id_product,
              quantity: material.quantity,
              creation_date: material.creation_date,
              modification_date: material.modification_date,
            });
          });
        });
        setRecipes(flatRecipes);
      } else {
        console.warn('⚠️ Respuesta inesperada del servidor');
        setRecipes([]);
        setProductsWithRecipes([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar recetas';
      
      // Manejo especial para errores 403 (sin permisos)
      if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('permisos')) {
        console.warn('⚠️ Sin permisos para ver recetas');
        setError(null);
        setRecipes([]);
        setProductsWithRecipes([]);
      } else {
        console.error('❌ Error cargando recetas:', errorMessage);
        setError(errorMessage);
        setRecipes([]);
        setProductsWithRecipes([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const refetch = useCallback(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Crear receta (con múltiples materiales)
  const createRecipe = useCallback(async (recipeData: CreateRecipeData) => {
    try {
      console.log('🆕 Creando receta:', recipeData);
      
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RECIPE, {
        method: 'POST',
        body: JSON.stringify(recipeData),
      });

      console.log('✅ Receta creada:', response);
      
      if (response && response.success) {
        await fetchRecipes();
        return response;
      } else {
        throw new Error(response.message || 'Error al crear receta');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear receta';
      console.error('❌ Error creando receta:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchRecipes]);

  // Actualizar receta
  const updateRecipe = useCallback(async (recipeId: number, recipeData: UpdateRecipeData) => {
    try {
      console.log('📝 Actualizando receta:', recipeId, recipeData);
      
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RECIPES}/${recipeId}`, {
        method: 'PUT',
        body: JSON.stringify(recipeData),
      });

      console.log('✅ Receta actualizada:', response);
      
      if (response && response.success) {
        await fetchRecipes();
        return response;
      } else {
        throw new Error(response.message || 'Error al actualizar receta');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar receta';
      console.error('❌ Error actualizando receta:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchRecipes]);

  // Eliminar receta
  const deleteRecipe = useCallback(async (recipeId: number) => {
    try {
      console.log('🗑️ Eliminando receta:', recipeId);
      
      // Según Swagger: DELETE /products/recipe?id_product={id}
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.RECIPE}?id_product=${recipeId}`, {
        method: 'DELETE',
      });

      console.log('✅ Receta eliminada:', response);
      
      if (response && response.success) {
        await fetchRecipes();
        return response;
      } else {
        throw new Error(response.message || 'Error al eliminar receta');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar receta';
      console.error('❌ Error eliminando receta:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchRecipes]);

  // Obtener recetas agrupadas por producto
  const getRecipesByProduct = useCallback(() => {
    const grouped: Record<number, ProductWithRecipes> = {};
    
    productsWithRecipes.forEach((product) => {
      grouped[product.id_product] = product;
    });
    
    return grouped;
  }, [productsWithRecipes]);

  // Crear receta completa con múltiples materiales (alias)
  const createRecipeWithMaterials = createRecipe;

  // Actualizar receta completa (usando el endpoint PUT /products/recipe)
  const updateCompleteRecipe = useCallback(async (productId: number, materials: Array<{ id_product: number; quantity_required: number }>) => {
    try {
      console.log('📝 Actualizando receta completa del producto:', productId);
      console.log('📦 Materiales a actualizar:', materials);
      
      // Usar el endpoint PUT /products/recipe con el body completo
      const response = await apiRequest(API_CONFIG.ENDPOINTS.RECIPE, {
        method: 'PUT',
        body: JSON.stringify({
          id_product: productId,
          materials: materials,
        }),
      });

      console.log('✅ Receta completa actualizada:', response);
      
      if (response && response.success) {
        await fetchRecipes();
        return response;
      } else {
        throw new Error(response.message || 'Error al actualizar receta');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar receta completa';
      console.error('❌ Error actualizando receta completa:', errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchRecipes]);

  return {
    recipes,
    productsWithRecipes,
    isLoading,
    error,
    refetch,
    createRecipe,
    createRecipeWithMaterials,
    updateRecipe,
    updateCompleteRecipe,
    deleteRecipe,
    getRecipesByProduct,
  };
}