import { ReactNode } from 'react';
import { Permission, Resource } from '../utils/permissionUtils';
import { usePermissions } from '../hooks/usePermissions';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

// ==================== PROTECTED SECTION ====================

interface ProtectedSectionProps {
  /** Permiso específico requerido */
  permission?: Permission;
  /** Lista de permisos (requiere al menos uno) */
  anyPermissions?: Permission[];
  /** Lista de permisos (requiere todos) */
  allPermissions?: Permission[];
  /** Recurso y acción a verificar */
  resource?: Resource;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  /** Contenido a mostrar */
  children: ReactNode;
  /** Contenido alternativo si no tiene permisos */
  fallback?: ReactNode;
  /** Mostrar mensaje de error en lugar de ocultar */
  showError?: boolean;
}

/**
 * Componente para proteger secciones según permisos
 * 
 * Uso:
 * <ProtectedSection resource="products" action="create">
 *   <Button>Crear Producto</Button>
 * </ProtectedSection>
 */
export function ProtectedSection({
  permission,
  anyPermissions,
  allPermissions,
  resource,
  action,
  children,
  fallback = null,
  showError = false,
}: ProtectedSectionProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canPerformAction } = usePermissions();

  let hasAccess = true;

  // Verificar permiso específico
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Verificar al menos uno de los permisos
  else if (anyPermissions) {
    hasAccess = hasAnyPermission(anyPermissions);
  }
  // Verificar todos los permisos
  else if (allPermissions) {
    hasAccess = hasAllPermissions(allPermissions);
  }
  // Verificar recurso y acción
  else if (resource && action) {
    hasAccess = canPerformAction(resource, action);
  }

  if (!hasAccess) {
    if (showError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta sección
          </AlertDescription>
        </Alert>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// ==================== PROTECTED BUTTON ====================

interface ProtectedButtonProps {
  /** Permiso específico requerido */
  permission?: Permission;
  /** Lista de permisos (requiere al menos uno) */
  anyPermissions?: Permission[];
  /** Recurso y acción a verificar */
  resource?: Resource;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'manage';
  /** Contenido del botón */
  children: ReactNode;
  /** Si true, muestra el botón deshabilitado en lugar de ocultarlo */
  showDisabled?: boolean;
  /** Clases adicionales */
  className?: string;
  /** Evento onClick */
  onClick?: () => void;
}

/**
 * Botón que solo se muestra si el usuario tiene permisos
 * 
 * Uso:
 * <ProtectedButton resource="products" action="create" onClick={handleCreate}>
 *   Crear Producto
 * </ProtectedButton>
 */
export function ProtectedButton({
  permission,
  anyPermissions,
  resource,
  action,
  children,
  showDisabled = false,
  className,
  onClick,
}: ProtectedButtonProps) {
  const { hasPermission, hasAnyPermission, canPerformAction } = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermissions) {
    hasAccess = hasAnyPermission(anyPermissions);
  } else if (resource && action) {
    hasAccess = canPerformAction(resource, action);
  }

  if (!hasAccess) {
    if (showDisabled) {
      return (
        <button disabled className={`${className} opacity-50 cursor-not-allowed`}>
          {children}
        </button>
      );
    }
    return null;
  }

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
}

// ==================== PROTECTED ROUTE ====================

interface ProtectedRouteProps {
  /** Permiso específico requerido */
  permission?: Permission;
  /** Lista de permisos (requiere al menos uno) */
  anyPermissions?: Permission[];
  /** Lista de permisos (requiere todos) */
  allPermissions?: Permission[];
  /** Recurso a verificar (view) */
  resource?: Resource;
  /** Contenido de la ruta */
  children: ReactNode;
  /** Contenido alternativo si no tiene permisos */
  fallback?: ReactNode;
}

/**
 * Componente para proteger rutas/vistas según permisos
 * 
 * Uso:
 * <ProtectedRoute resource="products">
 *   <ProductManagement />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  permission,
  anyPermissions,
  allPermissions,
  resource,
  children,
  fallback,
}: ProtectedRouteProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, canView } = usePermissions();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermissions) {
    hasAccess = hasAnyPermission(anyPermissions);
  } else if (allPermissions) {
    hasAccess = hasAllPermissions(allPermissions);
  } else if (resource) {
    hasAccess = canView(resource);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-semibold mb-1">Acceso Denegado</p>
            <p>No tienes permisos para acceder a esta sección del sistema.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

// ==================== CAN COMPONENT ====================

interface CanProps {
  /** Función que retorna true/false según permisos */
  do: (perms: ReturnType<typeof usePermissions>) => boolean;
  /** Contenido a mostrar si tiene permiso */
  children: ReactNode;
  /** Contenido alternativo si no tiene permiso */
  fallback?: ReactNode;
}

/**
 * Componente flexible para lógica de permisos personalizada
 * 
 * Uso:
 * <Can do={({ canCreate, canEdit }) => canCreate('products') || canEdit('products')}>
 *   <Button>Modificar Producto</Button>
 * </Can>
 */
export function Can({ do: checkPermission, children, fallback = null }: CanProps) {
  const permissions = usePermissions();
  const hasAccess = checkPermission(permissions);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
