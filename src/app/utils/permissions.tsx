/**
 * Sistema de Roles y Permisos - Guía de Implementación
 * 
 * Este archivo contiene ejemplos y guías para implementar un sistema
 * de roles y permisos basado en los requerimientos de Nutregam
 */

// ============================================================================
// TIPOS DE ROLES SEGÚN REQUERIMIENTOS
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',              // 3 administradores con permisos completos
  PRODUCTION = 'production',    // 2 usuarios de producción para app móvil
  PROVISIONAL = 'provisional',  // Usuarios provisionales
}

export interface UserWithRole {
  iduser: string;
  nameuser: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}

// ============================================================================
// PERMISOS POR MÓDULO
// ============================================================================

export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',
  
  // Productos
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCTS = 'create_products',
  EDIT_PRODUCTS = 'edit_products',
  DELETE_PRODUCTS = 'delete_products',
  
  // Clientes
  VIEW_CLIENTS = 'view_clients',
  CREATE_CLIENTS = 'create_clients',
  EDIT_CLIENTS = 'edit_clients',
  DELETE_CLIENTS = 'delete_clients',
  
  // Usuarios
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  
  // Maquinaria
  VIEW_MACHINERY = 'view_machinery',
  CREATE_MACHINERY = 'create_machinery',
  EDIT_MACHINERY = 'edit_machinery',
  DELETE_MACHINERY = 'delete_machinery',
  
  // Alertas
  VIEW_ALERTS = 'view_alerts',
  MANAGE_ALERTS = 'manage_alerts',
  
  // Desperdicios
  VIEW_WASTE = 'view_waste',
  CREATE_WASTE = 'create_waste',
  EDIT_WASTE = 'edit_waste',
  DELETE_WASTE = 'delete_waste',
  
  // Ventas
  VIEW_SALES = 'view_sales',
  CREATE_SALES = 'create_sales',
  EDIT_SALES = 'edit_sales',
  DELETE_SALES = 'delete_sales',
  MANAGE_SALES_REPORTS = 'manage_sales_reports',
  
  // Producción
  VIEW_PRODUCTION = 'view_production',
  CREATE_PRODUCTION = 'create_production',
  EDIT_PRODUCTION = 'edit_production',
  DELETE_PRODUCTION = 'delete_production',
}

// ============================================================================
// MATRIZ DE PERMISOS POR ROL
// ============================================================================

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Administradores tienen TODOS los permisos
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCTS,
    Permission.EDIT_PRODUCTS,
    Permission.DELETE_PRODUCTS,
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.DELETE_CLIENTS,
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.VIEW_MACHINERY,
    Permission.CREATE_MACHINERY,
    Permission.EDIT_MACHINERY,
    Permission.DELETE_MACHINERY,
    Permission.VIEW_ALERTS,
    Permission.MANAGE_ALERTS,
    Permission.VIEW_WASTE,
    Permission.CREATE_WASTE,
    Permission.EDIT_WASTE,
    Permission.DELETE_WASTE,
    Permission.VIEW_SALES,
    Permission.CREATE_SALES,
    Permission.EDIT_SALES,
    Permission.DELETE_SALES,
    Permission.MANAGE_SALES_REPORTS,
    Permission.VIEW_PRODUCTION,
    Permission.CREATE_PRODUCTION,
    Permission.EDIT_PRODUCTION,
    Permission.DELETE_PRODUCTION,
  ],
  
  [UserRole.PRODUCTION]: [
    // Usuarios de producción solo registran producción diaria
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTION,
    Permission.CREATE_PRODUCTION,
  ],
  
  [UserRole.PROVISIONAL]: [
    // Usuarios provisionales tienen permisos limitados
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PRODUCTS,
    Permission.VIEW_CLIENTS,
    Permission.VIEW_PRODUCTION,
  ],
};

// ============================================================================
// HOOKS PARA VERIFICAR PERMISOS
// ============================================================================

/**
 * Hook personalizado para verificar permisos
 * 
 * Uso:
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
 * 
 * if (hasPermission(Permission.CREATE_PRODUCTS)) {
 *   // Mostrar botón de crear producto
 * }
 */
export const usePermissions = () => {
  // Aquí deberías obtener el usuario del contexto de autenticación
  // const { user } = useAuth();
  // const userRole = user?.role || UserRole.PROVISIONAL;
  
  // Por ahora usamos un ejemplo
  const userRole = UserRole.ADMIN;
  const userPermissions = ROLE_PERMISSIONS[userRole];

  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission);
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some(permission => userPermissions.includes(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every(permission => userPermissions.includes(permission));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    userRole,
    userPermissions,
  };
};

// ============================================================================
// COMPONENTE DE EJEMPLO: ProtectedRoute
// ============================================================================

/**
 * Componente para proteger rutas/secciones según permisos
 * 
 * Uso:
 * <ProtectedRoute permission={Permission.VIEW_PRODUCTS}>
 *   <ProductManagement />
 * </ProtectedRoute>
 */
interface ProtectedRouteProps {
  permission?: Permission;
  anyPermissions?: Permission[];
  allPermissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const ProtectedRoute = ({
  permission,
  anyPermissions,
  allPermissions,
  fallback = <div>No tienes permiso para ver esta sección</div>,
  children,
}: ProtectedRouteProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermissions) {
    hasAccess = hasAnyPermission(anyPermissions);
  } else if (allPermissions) {
    hasAccess = hasAllPermissions(allPermissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// ============================================================================
// COMPONENTE DE EJEMPLO: ProtectedButton
// ============================================================================

/**
 * Botón que solo se muestra si el usuario tiene permisos
 * 
 * Uso:
 * <ProtectedButton permission={Permission.CREATE_PRODUCTS} onClick={handleCreate}>
 *   Crear Producto
 * </ProtectedButton>
 */
interface ProtectedButtonProps {
  permission: Permission;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const ProtectedButton = ({
  permission,
  children,
  onClick,
  className,
}: ProtectedButtonProps) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return null;
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

// ============================================================================
// EJEMPLO DE USO EN COMPONENTES
// ============================================================================

/**
 * Ejemplo 1: Verificar permisos en un componente
 */
export const ExampleProductManagement = () => {
  const { hasPermission } = usePermissions();

  return (
    <div>
      <h1>Gestión de Productos</h1>
      
      {hasPermission(Permission.CREATE_PRODUCTS) && (
        <button>Crear Nuevo Producto</button>
      )}
      
      {hasPermission(Permission.EDIT_PRODUCTS) && (
        <button>Editar</button>
      )}
      
      {hasPermission(Permission.DELETE_PRODUCTS) && (
        <button>Eliminar</button>
      )}
    </div>
  );
};

/**
 * Ejemplo 2: Sidebar con menús según permisos
 */
export const ExampleSidebarWithPermissions = () => {
  const { hasPermission } = usePermissions();

  const menuItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      permission: Permission.VIEW_DASHBOARD 
    },
    { 
      id: 'products', 
      label: 'Productos', 
      permission: Permission.VIEW_PRODUCTS 
    },
    { 
      id: 'users', 
      label: 'Usuarios', 
      permission: Permission.VIEW_USERS 
    },
  ];

  return (
    <nav>
      {menuItems
        .filter(item => hasPermission(item.permission))
        .map(item => (
          <a key={item.id} href={`#${item.id}`}>
            {item.label}
          </a>
        ))}
    </nav>
  );
};

/**
 * Ejemplo 3: Validación en el backend
 */
export const exampleBackendValidation = async () => {
  // En tus peticiones al backend, envía el rol/permisos
  // El backend SIEMPRE debe validar los permisos también
  
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer <token>',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Nuevo Producto',
      // ... otros campos
    }),
  });
  
  // El backend validará que el usuario tenga Permission.CREATE_PRODUCTS
};

// ============================================================================
// NOTAS DE IMPLEMENTACIÓN
// ============================================================================

/**
 * PASOS PARA IMPLEMENTAR:
 * 
 * 1. Actualizar el backend para incluir el campo 'role' en el objeto user
 *    de la respuesta del login
 * 
 * 2. Agregar el campo 'role' a la interfaz User en AuthContext.tsx:
 *    interface User {
 *      // ... campos existentes
 *      role: UserRole;
 *    }
 * 
 * 3. Actualizar el hook usePermissions para usar el rol real del usuario:
 *    const { user } = useAuth();
 *    const userRole = user?.role || UserRole.PROVISIONAL;
 * 
 * 4. Proteger cada sección del dashboard con ProtectedRoute
 * 
 * 5. Filtrar los items del menú en Sidebar según permisos
 * 
 * 6. Agregar verificación de permisos en cada acción (crear, editar, eliminar)
 * 
 * 7. Siempre validar permisos en el backend también (seguridad)
 */

/**
 * SEGURIDAD IMPORTANTE:
 * 
 * ⚠️ Los permisos en el frontend son SOLO para UX (mostrar/ocultar botones)
 * ⚠️ SIEMPRE valida los permisos en el backend antes de ejecutar acciones
 * ⚠️ Nunca confíes solo en la verificación del frontend
 */
