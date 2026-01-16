import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_CONFIG } from '../config/api';
import { Permission } from '../utils/permissionUtils';
import { User as ApiUser } from '../types/api';

interface RoleDetail {
  id: number;
  name: string;
  description: string;
}

// Extender el tipo de User de la API con campos adicionales del JWT
interface User extends ApiUser {
  roles?: string[];
  rolesDetails?: RoleDetail[];
  permissions?: Permission[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isBackendConfigured: boolean;
  permissions: Permission[];
  roles: string[];
}

// Crear el contexto con un valor por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para decodificar JWT (sin verificar firma - solo lectura)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.warn('⚠️ Token no tiene el formato JWT esperado');
      return null;
    }

    const base64Url = parts[1];
    if (!base64Url) {
      console.warn('⚠️ Token no tiene payload');
      return null;
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error al decodificar JWT:', error);
    return null;
  }
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Durante el hot reload, el contexto puede perderse temporalmente
    if (import.meta.hot) {
      console.warn('⚠️ AuthContext no disponible durante HMR, usando valores por defecto');
      return {
        user: null,
        token: null,
        refreshToken: null,
        login: async () => {},
        logout: () => {},
        isLoading: true,
        isBackendConfigured: true,
        permissions: [],
        roles: [],
      };
    }
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendConfigured, setIsBackendConfigured] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<string[]>([]);

  // Verificar si el backend está configurado
  useEffect(() => {
    const backendConfigured = !API_CONFIG.BASE_URL.includes('your-backend-url');
    setIsBackendConfigured(backendConfigured);
  }, []);

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    console.log('🔍 Verificando localStorage:', {
      hasUser: !!storedUser,
      hasToken: !!storedToken,
      hasRefreshToken: !!storedRefreshToken,
    });

    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setToken(storedToken);
        setRefreshToken(storedRefreshToken);
        
        // Decodificar JWT para obtener permisos y roles
        const decodedToken = decodeJWT(storedToken);
        if (decodedToken) {
          setPermissions(decodedToken.permissions || []);
          setRoles(decodedToken.roles || []);
          console.log('🔑 Permisos del usuario:', decodedToken.permissions);
          console.log('🎭 Roles del usuario:', decodedToken.roles);
        }
        
        console.log('✅ Sesión restaurada desde localStorage');
      } catch (error) {
        console.error('Error al cargar datos del localStorage:', error);
        // Limpiar localStorage si hay datos corruptos
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    } else {
      console.log('⚠️ No hay sesión guardada - mostrando Login');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Intentando login...', {
        email,
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`,
      });

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        let errorMessage = 'Error al iniciar sesión';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('❌ Error del servidor:', errorData);
        } catch (e) {
          console.error('❌ No se pudo parsear error del servidor');
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📦 Datos recibidos:', {
        success: data.success,
        hasUser: !!data.data?.user,
        hasToken: !!data.data?.token,
      });

      if (data.success) {
        const { user, token, refreshToken } = data.data;
        
        // Decodificar JWT para obtener permisos y roles
        const decodedToken = decodeJWT(token);
        if (decodedToken) {
          const userPermissions = decodedToken.permissions || [];
          const userRoles = decodedToken.roles || [];
          
          setPermissions(userPermissions);
          setRoles(userRoles);
          
          console.log('🔑 Permisos del usuario:', userPermissions);
          console.log('🎭 Roles del usuario:', userRoles);
          
          // Validar si es administrador
          const isAdmin = userRoles.some((role: string) => 
            role.toLowerCase() === 'admin' || role.toLowerCase() === 'administrador'
          );
          
          if (isAdmin) {
            console.log('✅ Usuario con rol de ADMINISTRADOR - Acceso permitido');
          } else {
            console.warn('⚠️ Usuario SIN rol de administrador - Acceso DENEGADO al dashboard');
            console.warn('   Roles detectados:', userRoles);
          }
          
          // Agregar permisos y roles al objeto user
          user.permissions = userPermissions;
          user.roles = userRoles;
          user.rolesDetails = decodedToken.rolesDetails || [];
        }
        
        // Guardar en el estado
        setUser(user);
        setToken(token);
        setRefreshToken(refreshToken);

        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        console.log('✅ Login exitoso');
      } else {
        throw new Error(data.message || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    setPermissions([]);
    setRoles([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    console.log('👋 Logout exitoso');
  };

  const value = {
    user,
    token,
    refreshToken,
    login,
    logout,
    isLoading,
    isBackendConfigured,
    permissions,
    roles,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}