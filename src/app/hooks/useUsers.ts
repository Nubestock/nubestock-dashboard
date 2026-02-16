import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../config/api';
import { 
  User, 
  Role, 
  Permission, 
  UserCreate, 
  UserUpdate,
  PaginatedResponse 
} from '../types/api';

// Re-exportar tipos necesarios para los componentes
export type { User, Role, Permission };

// ==================== INTERFACES ADICIONALES ====================

export interface RolesWithPermissions {
  roles: Role[];
  totalRoles: number;
  allPermissions: Permission[];
  totalPermissions: number;
}

export interface UserPermissions {
  userId: number;
  userName: string;
  roles: Array<{
    roleId: number;
    roleName: string;
    permissions: Permission[];
  }>;
}

export interface AssignRoleData {
  userId: number;
  roleId: number;
  assignment_reason: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== HOOK DE USUARIOS ====================

export function useUsers(page: number = 1, limit: number = 10, search: string = '', is_active?: boolean) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (search) params.append('search', search);
      if (is_active !== undefined) params.append('is_active', is_active.toString());

      const url = `/users?${params.toString()}`;

      console.log('Cargando usuarios desde:', url);

      const response = await apiRequest(url, {
        method: 'GET',
      });

      console.log('Usuarios cargados:', response.data?.length || 0);

      setUsers(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      
      // Manejo especial para errores 403 (sin permisos)
      if (errorMessage.includes('403') || errorMessage.toLowerCase().includes('permisos')) {
        console.warn('Sin permisos para ver usuarios');
        setError(null);
        setUsers([]);
      } else {
        console.error('Error al cargar usuarios:', err);
        setError(errorMessage);
        setUsers([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, is_active]);

  const createUser = async (userData: UserCreate) => {
    try {
      console.log('Creando usuario (registro):', userData);

      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
        is_active: userData.is_active ?? true,
      };

      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      console.log('Usuario registrado exitosamente:', response.data);

      await fetchUsers();

      return response;
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      throw err;
    }
  };

  const updateUser = async (userId: number, updateData: UserUpdate) => {
    try {
      console.log(`Actualizando usuario ${userId}:`, updateData);

      const payload = {
        name: updateData.name,
        email: updateData.email,
        phone: updateData.phone,
        is_active: updateData.is_active,
      };

      const response = await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      console.log('Usuario actualizado:', response.data);

      await fetchUsers();

      return response;
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      throw err;
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      console.log(`Eliminando usuario ${userId}`);

      await apiRequest(`/users/${userId}`, {
        method: 'DELETE',
      });

      console.log('Usuario eliminado');

      await fetchUsers();
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      throw err;
    }
  };

  const adminResetPassword = async (email: string) => {
    try {
      console.log(`Administrador generando solicitud de restablecimiento para: ${email}`);

      const response = await apiRequest('/auth/admin-reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      console.log('Respuesta del servidor:', response);

      return response;
    } catch (err) {
      console.error('Error al generar solicitud de restablecimiento:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    pagination,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    adminResetPassword,
  };
}

// ==================== HOOK DE ROLES ====================

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando roles...');

      const response = await apiRequest('/roles', {
        method: 'GET',
      });

      console.log('Roles cargados:', response.data?.length || 0);

      setRoles(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al cargar roles:', err);
      setError(errorMessage);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    isLoading,
    error,
    refetch: fetchRoles,
  };
}

// ==================== HOOK DE ROLES CON PERMISOS ====================

export function useRolesWithPermissions() {
  const [rolesData, setRolesData] = useState<RolesWithPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRolesWithPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando roles con permisos...');

      const response = await apiRequest('/roles/all', {
        method: 'GET',
      });

      console.log('Roles con permisos cargados:', {
        roles: response.data?.roles?.length || 0,
        permissions: response.data?.allPermissions?.length || 0,
      });

      setRolesData(response.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al cargar roles con permisos:', err);
      setError(errorMessage);
      setRolesData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateRole = useCallback(
    async (roleId: number, data: { name: string; description: string; permissions: number[] }) => {
      try {
        console.log('Actualizando rol:', { roleId, data });

        const response = await apiRequest(`/roles/${roleId}`, {
          method: 'PUT',
          body: JSON.stringify(data),
        });

        console.log('Rol actualizado exitosamente');

        await fetchRolesWithPermissions();

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rol';
        console.error('Error al actualizar rol:', err);
        throw new Error(errorMessage);
      }
    },
    [fetchRolesWithPermissions]
  );

  const createRole = useCallback(
    async (data: { name: string; description: string; permissions: number[] }) => {
      try {
        console.log('Creando rol:', data);

        const response = await apiRequest('/roles', {
          method: 'POST',
          body: JSON.stringify(data),
        });

        console.log('Rol creado exitosamente');

        await fetchRolesWithPermissions();

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al crear rol';
        console.error('Error al crear rol:', err);
        throw new Error(errorMessage);
      }
    },
    [fetchRolesWithPermissions]
  );

  const deleteRole = useCallback(
    async (roleId: number) => {
      try {
        console.log('Eliminando rol:', roleId);

        const response = await apiRequest(`/roles/${roleId}`, {
          method: 'DELETE',
        });

        console.log('Rol eliminado exitosamente');

        await fetchRolesWithPermissions();

        return response;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al eliminar rol';
        console.error('Error al eliminar rol:', err);
        throw new Error(errorMessage);
      }
    },
    [fetchRolesWithPermissions]
  );

  useEffect(() => {
    fetchRolesWithPermissions();
  }, [fetchRolesWithPermissions]);

  return {
    rolesData,
    isLoading,
    error,
    refetch: fetchRolesWithPermissions,
    updateRole,
    createRole,
    deleteRole,
  };
}

// ==================== HOOK DE PERMISOS ====================

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Cargando permisos...');

      const response = await apiRequest('/roles/permissions', {
        method: 'GET',
      });

      console.log('Permisos cargados:', response.data?.length || 0);

      setPermissions(response.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al cargar permisos:', err);
      setError(errorMessage);
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    isLoading,
    error,
    refetch: fetchPermissions,
  };
}

// ==================== HOOK DE PERMISOS DE USUARIO ====================

export function useUserPermissions(userId?: number) {
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserPermissions = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`Cargando permisos del usuario ${userId}...`);

      const response = await apiRequest(`/user-permissions/${userId}`, {
        method: 'GET',
      });

      console.log('Permisos de usuario cargados');

      setUserPermissions(response.data || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error al cargar permisos de usuario:', err);
      setError(errorMessage);
      setUserPermissions(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const assignRole = async (data: AssignRoleData) => {
    try {
      console.log('Asignando rol:', data);

      const response = await apiRequest('/user-permissions', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      console.log('Rol asignado exitosamente');

      await fetchUserPermissions();

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar rol';
      console.error('Error al asignar rol:', err);
      throw new Error(errorMessage);
    }
  };

  const removeRole = async (userId: number, roleId: number) => {
    try {
      console.log(`Removiendo rol ${roleId} del usuario ${userId}`);

      await apiRequest(`/user-permissions/${userId}/role/${roleId}`, {
        method: 'DELETE',
      });

      console.log('Rol removido');

      await fetchUserPermissions();
    } catch (err) {
      console.error('Error al remover rol:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

  return {
    userPermissions,
    isLoading,
    error,
    refetch: fetchUserPermissions,
    assignRole,
    removeRole,
  };
}