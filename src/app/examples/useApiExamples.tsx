/**
 * Ejemplo de uso del hook useApi en tus componentes
 * 
 * Este archivo muestra cómo puedes usar el hook useApi para hacer
 * peticiones autenticadas al backend de Azure Functions
 */

import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import { toast } from 'sonner';

// Ejemplo 1: Obtener datos (GET)
export function ExampleGetData() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        
        if (response.success) {
          setProducts(response.data);
        }
      } catch (error) {
        toast.error('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <ul>
          {products.map((product: any) => (
            <li key={product.id}>{product.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Ejemplo 2: Crear datos (POST)
export function ExampleCreateData() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.post('/products', {
        name,
        price: 100,
        // ... otros campos
      });

      if (response.success) {
        toast.success('Producto creado exitosamente');
        setName('');
      }
    } catch (error) {
      toast.error('Error al crear producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre del producto"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear Producto'}
      </button>
    </form>
  );
}

// Ejemplo 3: Actualizar datos (PUT)
export function ExampleUpdateData() {
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleUpdate = async (productId: string) => {
    try {
      setLoading(true);
      const response = await api.put(`/products/${productId}`, {
        name: 'Nuevo nombre',
        price: 150,
      });

      if (response.success) {
        toast.success('Producto actualizado');
      }
    } catch (error) {
      toast.error('Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleUpdate('123')} disabled={loading}>
      {loading ? 'Actualizando...' : 'Actualizar'}
    </button>
  );
}

// Ejemplo 4: Eliminar datos (DELETE)
export function ExampleDeleteData() {
  const [loading, setLoading] = useState(false);
  const api = useApi();

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.del(`/products/${productId}`);

      if (response.success) {
        toast.success('Producto eliminado');
      }
    } catch (error) {
      toast.error('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={() => handleDelete('123')} disabled={loading}>
      {loading ? 'Eliminando...' : 'Eliminar'}
    </button>
  );
}

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. El hook useApi automáticamente:
 *    - Agrega el token de autenticación a todas las peticiones
 *    - Maneja errores 401 (token expirado) y cierra sesión automáticamente
 *    - Proporciona métodos convenientes: get, post, put, del
 * 
 * 2. Todas las peticiones ya incluyen el BASE_URL configurado en api.ts
 *    Solo necesitas proporcionar el endpoint relativo (ej: '/products')
 * 
 * 3. Siempre maneja los errores con try-catch para dar feedback al usuario
 * 
 * 4. Estructura esperada del backend:
 *    {
 *      "success": boolean,
 *      "data": any,
 *      "message": string,
 *      "timestamp": string
 *    }
 */
