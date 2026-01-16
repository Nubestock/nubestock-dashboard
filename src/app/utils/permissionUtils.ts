/**
 * Sistema de Permisos - Nutregam
 * 
 * Mapeo de permisos del backend a acciones del frontend
 */

// ==================== TIPOS DE PERMISOS ====================

export type Permission = 
  | 'inventory_manage'
  | 'production_read'
  | 'production_write'
  | 'reports_view'
  | 'sales_manage'
  | 'user_manage';

export type Resource = 
  | 'inventory'
  | 'production'
  | 'reports'
  | 'sales'
  | 'users'
  | 'clients'
  | 'products'
  | 'materials'
  | 'recipes'
  | 'machinery'
  | 'alerts'
  | 'waste'
  | 'dashboard';

export type Action = 'read' | 'write' | 'manage' | 'view';

// ==================== MAPEO DE PERMISOS ====================

/**
 * Mapea permisos del backend a recursos y acciones del frontend
 */
export const PERMISSION_MAP: Record<Permission, { resource: Resource; action: Action }> = {
  'inventory_manage': { resource: 'inventory', action: 'manage' },
  'production_read': { resource: 'production', action: 'read' },
  'production_write': { resource: 'production', action: 'write' },
  'reports_view': { resource: 'reports', action: 'view' },
  'sales_manage': { resource: 'sales', action: 'manage' },
  'user_manage': { resource: 'users', action: 'manage' },
};

/**
 * Define qué recursos requieren qué permisos para cada acción
 */
export const RESOURCE_PERMISSIONS: Record<Resource, {
  view?: Permission[];
  create?: Permission[];
  edit?: Permission[];
  delete?: Permission[];
  manage?: Permission[];
}> = {
  dashboard: {
    view: [], // Todos pueden ver el dashboard
  },
  
  inventory: {
    view: ['inventory_manage'],
    create: ['inventory_manage'],
    edit: ['inventory_manage'],
    delete: ['inventory_manage'],
  },
  
  production: {
    view: ['production_read', 'production_write'],
    create: ['production_write'],
    edit: ['production_write'],
    delete: ['production_write'],
  },
  
  reports: {
    view: ['reports_view'],
  },
  
  sales: {
    view: ['sales_manage'],
    create: ['sales_manage'],
    edit: ['sales_manage'],
    delete: ['sales_manage'],
  },
  
  users: {
    view: ['user_manage'],
    create: ['user_manage'],
    edit: ['user_manage'],
    delete: ['user_manage'],
  },
  
  clients: {
    view: ['sales_manage'], // Los clientes son parte de ventas
    create: ['sales_manage'],
    edit: ['sales_manage'],
    delete: ['sales_manage'],
  },
  
  products: {
    view: ['inventory_manage'],
    create: ['inventory_manage'],
    edit: ['inventory_manage'],
    delete: ['inventory_manage'],
  },
  
  materials: {
    view: ['inventory_manage'],
    create: ['inventory_manage'],
    edit: ['inventory_manage'],
    delete: ['inventory_manage'],
  },
  
  recipes: {
    view: ['inventory_manage'],
    create: ['inventory_manage'],
    edit: ['inventory_manage'],
    delete: ['inventory_manage'],
  },
  
  machinery: {
    view: ['production_read', 'production_write'],
    create: ['production_write'],
    edit: ['production_write'],
    delete: ['production_write'],
  },
  
  alerts: {
    view: ['inventory_manage', 'production_read', 'production_write'],
    manage: ['inventory_manage'],
  },
  
  waste: {
    view: ['production_read', 'production_write'],
    create: ['production_write'],
    edit: ['production_write'],
    delete: ['production_write'],
  },
};

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Verifica si el usuario tiene un permiso específico
 */
export function hasPermission(
  userPermissions: Permission[],
  permission: Permission
): boolean {
  return userPermissions.includes(permission);
}

/**
 * Verifica si el usuario tiene al menos uno de los permisos requeridos
 */
export function hasAnyPermission(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

/**
 * Verifica si el usuario tiene todos los permisos requeridos
 */
export function hasAllPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

/**
 * Verifica si el usuario puede realizar una acción en un recurso
 */
export function canPerformAction(
  userPermissions: Permission[],
  resource: Resource,
  action: 'view' | 'create' | 'edit' | 'delete' | 'manage'
): boolean {
  const resourcePermissions = RESOURCE_PERMISSIONS[resource];
  const requiredPermissions = resourcePermissions?.[action];
  
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true; // Si no hay permisos requeridos, se permite
  }
  
  return hasAnyPermission(userPermissions, requiredPermissions);
}

/**
 * Obtiene todos los recursos a los que el usuario tiene acceso
 */
export function getAccessibleResources(
  userPermissions: Permission[]
): Resource[] {
  const resources: Resource[] = [];
  
  for (const resource in RESOURCE_PERMISSIONS) {
    if (canPerformAction(userPermissions, resource as Resource, 'view')) {
      resources.push(resource as Resource);
    }
  }
  
  return resources;
}

/**
 * Verifica si el usuario es administrador (tiene user_manage)
 */
export function isAdmin(userPermissions: Permission[]): boolean {
  return hasPermission(userPermissions, 'user_manage');
}

/**
 * Verifica si el usuario solo tiene permisos de producción
 */
export function isProductionOnly(userPermissions: Permission[]): boolean {
  const productionPermissions: Permission[] = ['production_read', 'production_write'];
  return (
    userPermissions.length <= 2 &&
    userPermissions.every(p => productionPermissions.includes(p))
  );
}

// ==================== MAPEO DE PERMISOS A MENÚ ====================

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  requiredPermissions?: Permission[];
  requiresAny?: boolean; // true = necesita al menos uno, false = necesita todos
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    requiredPermissions: [],
  },
  {
    id: 'products',
    label: 'Productos',
    icon: 'Package',
    requiredPermissions: ['inventory_manage'],
  },
  {
    id: 'materials',
    label: 'Materiales',
    icon: 'Boxes',
    requiredPermissions: ['inventory_manage'],
  },
  {
    id: 'recipes',
    label: 'Recetas',
    icon: 'BookOpen',
    requiredPermissions: ['inventory_manage'],
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: 'Users',
    requiredPermissions: ['sales_manage'],
  },
  {
    id: 'sales',
    label: 'Ventas',
    icon: 'ShoppingCart',
    requiredPermissions: ['sales_manage'],
  },
  {
    id: 'sales-reports',
    label: 'Reportes de Ventas',
    icon: 'FileText',
    requiredPermissions: ['reports_view', 'sales_manage'],
    requiresAny: true,
  },
  {
    id: 'production',
    label: 'Producción Diaria',
    icon: 'Factory',
    requiredPermissions: ['production_read', 'production_write'],
    requiresAny: true,
  },
  {
    id: 'machinery',
    label: 'Maquinaria',
    icon: 'Cpu',
    requiredPermissions: ['production_read', 'production_write'],
    requiresAny: true,
  },
  {
    id: 'waste',
    label: 'Desperdicios',
    icon: 'Trash2',
    requiredPermissions: ['production_read', 'production_write'],
    requiresAny: true,
  },
  {
    id: 'alerts',
    label: 'Alertas',
    icon: 'Bell',
    requiredPermissions: ['inventory_manage', 'production_read', 'production_write'],
    requiresAny: true,
  },
  {
    id: 'users',
    label: 'Usuarios',
    icon: 'UserCog',
    requiredPermissions: ['user_manage'],
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: 'Settings',
    requiredPermissions: [],
  },
];

/**
 * Filtra los items del menú según los permisos del usuario
 */
export function getAccessibleMenuItems(
  userPermissions: Permission[]
): MenuItem[] {
  return MENU_ITEMS.filter(item => {
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true; // Items sin permisos requeridos son visibles para todos
    }
    
    if (item.requiresAny) {
      return hasAnyPermission(userPermissions, item.requiredPermissions);
    }
    
    return hasAllPermissions(userPermissions, item.requiredPermissions);
  });
}
