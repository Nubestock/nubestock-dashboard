import { useAuth } from '../contexts/AuthContext';
import { 
  Permission, 
  Resource,
  hasPermission as checkPermission,
  hasAnyPermission as checkAnyPermission,
  hasAllPermissions as checkAllPermissions,
  canPerformAction as checkCanPerformAction,
  getAccessibleResources,
  isAdmin as checkIsAdmin,
  isProductionOnly as checkIsProductionOnly,
} from '../utils/permissionUtils';

/**
 * Hook personalizado para verificar permisos del usuario actual
 * 
 * Uso:
 * const { hasPermission, canCreate, canEdit, canDelete } = usePermissions();
 * 
 * if (canCreate('products')) {
 *   // Mostrar botón de crear producto
 * }
 */
export function usePermissions() {
  const { permissions, roles } = useAuth();

  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(permissions, permission);
  };

  /**
   * Verifica si el usuario tiene al menos uno de los permisos requeridos
   */
  const hasAnyPermission = (requiredPermissions: Permission[]): boolean => {
    return checkAnyPermission(permissions, requiredPermissions);
  };

  /**
   * Verifica si el usuario tiene todos los permisos requeridos
   */
  const hasAllPermissions = (requiredPermissions: Permission[]): boolean => {
    return checkAllPermissions(permissions, requiredPermissions);
  };

  /**
   * Verifica si el usuario puede realizar una acción en un recurso
   */
  const canPerformAction = (
    resource: Resource,
    action: 'view' | 'create' | 'edit' | 'delete' | 'manage'
  ): boolean => {
    return checkCanPerformAction(permissions, resource, action);
  };

  /**
   * Shortcuts para acciones comunes
   */
  const canView = (resource: Resource): boolean => canPerformAction(resource, 'view');
  const canCreate = (resource: Resource): boolean => canPerformAction(resource, 'create');
  const canEdit = (resource: Resource): boolean => canPerformAction(resource, 'edit');
  const canDelete = (resource: Resource): boolean => canPerformAction(resource, 'delete');
  const canManage = (resource: Resource): boolean => canPerformAction(resource, 'manage');

  /**
   * Obtiene todos los recursos a los que el usuario tiene acceso
   */
  const accessibleResources = getAccessibleResources(permissions);

  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = checkIsAdmin(permissions);

  /**
   * Verifica si el usuario solo tiene permisos de producción
   */
  const isProductionOnly = checkIsProductionOnly(permissions);

  return {
    // Permisos y roles del usuario
    permissions,
    roles,

    // Funciones de verificación
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,

    // Shortcuts
    canView,
    canCreate,
    canEdit,
    canDelete,
    canManage,

    // Helpers
    accessibleResources,
    isAdmin,
    isProductionOnly,
  };
}
