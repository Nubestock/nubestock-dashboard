/**
 * Tests para el sistema de permisos
 */
import {
  Permission,
  Resource,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canPerformAction,
  getAccessibleResources,
  isAdmin,
  isProductionOnly,
  getAccessibleMenuItems,
  PERMISSION_MAP,
  RESOURCE_PERMISSIONS,
  MENU_ITEMS,
} from '../../src/app/utils/permissionUtils';

describe('permissionUtils', () => {
  describe('hasPermission', () => {
    it('debería retornar true si el usuario tiene el permiso', () => {
      const userPermissions: Permission[] = ['inventory_manage', 'sales_manage'];
      expect(hasPermission(userPermissions, 'inventory_manage')).toBe(true);
    });

    it('debería retornar false si el usuario no tiene el permiso', () => {
      const userPermissions: Permission[] = ['inventory_manage'];
      expect(hasPermission(userPermissions, 'user_manage')).toBe(false);
    });

    it('debería retornar false para un array vacío de permisos', () => {
      const userPermissions: Permission[] = [];
      expect(hasPermission(userPermissions, 'inventory_manage')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('debería retornar true si tiene al menos uno de los permisos', () => {
      const userPermissions: Permission[] = ['production_read'];
      const required: Permission[] = ['production_read', 'production_write'];
      expect(hasAnyPermission(userPermissions, required)).toBe(true);
    });

    it('debería retornar false si no tiene ninguno de los permisos', () => {
      const userPermissions: Permission[] = ['inventory_manage'];
      const required: Permission[] = ['production_read', 'production_write'];
      expect(hasAnyPermission(userPermissions, required)).toBe(false);
    });

    it('debería retornar false si los permisos requeridos están vacíos', () => {
      const userPermissions: Permission[] = ['inventory_manage'];
      expect(hasAnyPermission(userPermissions, [])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('debería retornar true si tiene todos los permisos', () => {
      const userPermissions: Permission[] = ['production_read', 'production_write', 'inventory_manage'];
      const required: Permission[] = ['production_read', 'production_write'];
      expect(hasAllPermissions(userPermissions, required)).toBe(true);
    });

    it('debería retornar false si falta algún permiso', () => {
      const userPermissions: Permission[] = ['production_read'];
      const required: Permission[] = ['production_read', 'production_write'];
      expect(hasAllPermissions(userPermissions, required)).toBe(false);
    });

    it('debería retornar true si los permisos requeridos están vacíos', () => {
      const userPermissions: Permission[] = ['inventory_manage'];
      expect(hasAllPermissions(userPermissions, [])).toBe(true);
    });
  });

  describe('canPerformAction', () => {
    it('debería permitir ver el dashboard a cualquier usuario', () => {
      const userPermissions: Permission[] = [];
      expect(canPerformAction(userPermissions, 'dashboard', 'view')).toBe(true);
    });

    it('debería requerir inventory_manage para gestionar inventario', () => {
      const userWithPermission: Permission[] = ['inventory_manage'];
      const userWithoutPermission: Permission[] = ['production_read'];

      expect(canPerformAction(userWithPermission, 'inventory', 'create')).toBe(true);
      expect(canPerformAction(userWithoutPermission, 'inventory', 'create')).toBe(false);
    });

    it('debería permitir ver producción con production_read o production_write', () => {
      const userWithRead: Permission[] = ['production_read'];
      const userWithWrite: Permission[] = ['production_write'];
      const userWithoutPermission: Permission[] = ['inventory_manage'];

      expect(canPerformAction(userWithRead, 'production', 'view')).toBe(true);
      expect(canPerformAction(userWithWrite, 'production', 'view')).toBe(true);
      expect(canPerformAction(userWithoutPermission, 'production', 'view')).toBe(false);
    });

    it('debería requerir production_write para crear en producción', () => {
      const userWithWrite: Permission[] = ['production_write'];
      const userWithRead: Permission[] = ['production_read'];

      expect(canPerformAction(userWithWrite, 'production', 'create')).toBe(true);
      expect(canPerformAction(userWithRead, 'production', 'create')).toBe(false);
    });
  });

  describe('getAccessibleResources', () => {
    it('debería retornar solo recursos accesibles', () => {
      const userPermissions: Permission[] = ['inventory_manage'];
      const resources = getAccessibleResources(userPermissions);

      expect(resources).toContain('dashboard');
      expect(resources).toContain('inventory');
      expect(resources).toContain('products');
      expect(resources).toContain('materials');
      expect(resources).toContain('recipes');
      expect(resources).toContain('alerts');
      expect(resources).not.toContain('users');
      expect(resources).not.toContain('sales');
    });

    it('debería incluir dashboard para usuarios sin permisos', () => {
      const userPermissions: Permission[] = [];
      const resources = getAccessibleResources(userPermissions);

      expect(resources).toContain('dashboard');
    });

    it('debería retornar todos los recursos para admin', () => {
      const adminPermissions: Permission[] = [
        'inventory_manage',
        'production_read',
        'production_write',
        'reports_view',
        'sales_manage',
        'user_manage',
      ];
      const resources = getAccessibleResources(adminPermissions);

      expect(resources.length).toBeGreaterThan(5);
      expect(resources).toContain('users');
    });
  });

  describe('isAdmin', () => {
    it('debería retornar true si tiene user_manage', () => {
      const userPermissions: Permission[] = ['user_manage', 'inventory_manage'];
      expect(isAdmin(userPermissions)).toBe(true);
    });

    it('debería retornar false si no tiene user_manage', () => {
      const userPermissions: Permission[] = ['inventory_manage', 'sales_manage'];
      expect(isAdmin(userPermissions)).toBe(false);
    });
  });

  describe('isProductionOnly', () => {
    it('debería retornar true si solo tiene permisos de producción', () => {
      const userPermissions: Permission[] = ['production_read', 'production_write'];
      expect(isProductionOnly(userPermissions)).toBe(true);
    });

    it('debería retornar true si solo tiene production_read', () => {
      const userPermissions: Permission[] = ['production_read'];
      expect(isProductionOnly(userPermissions)).toBe(true);
    });

    it('debería retornar false si tiene otros permisos', () => {
      const userPermissions: Permission[] = ['production_read', 'inventory_manage'];
      expect(isProductionOnly(userPermissions)).toBe(false);
    });
  });

  describe('getAccessibleMenuItems', () => {
    it('debería mostrar dashboard y settings a todos', () => {
      const userPermissions: Permission[] = [];
      const menuItems = getAccessibleMenuItems(userPermissions);
      const menuIds = menuItems.map(item => item.id);

      expect(menuIds).toContain('dashboard');
      expect(menuIds).toContain('settings');
    });

    it('debería filtrar items según permisos', () => {
      const userPermissions: Permission[] = ['inventory_manage'];
      const menuItems = getAccessibleMenuItems(userPermissions);
      const menuIds = menuItems.map(item => item.id);

      expect(menuIds).toContain('products');
      expect(menuIds).toContain('materials');
      expect(menuIds).toContain('recipes');
      expect(menuIds).not.toContain('users');
      expect(menuIds).not.toContain('clients');
    });

    it('debería manejar requiresAny correctamente', () => {
      const userWithRead: Permission[] = ['production_read'];
      const menuItems = getAccessibleMenuItems(userWithRead);
      const menuIds = menuItems.map(item => item.id);

      expect(menuIds).toContain('production');
      expect(menuIds).toContain('machinery');
    });
  });

  describe('constantes y mapeos', () => {
    it('PERMISSION_MAP debería tener todos los permisos definidos', () => {
      const expectedPermissions: Permission[] = [
        'inventory_manage',
        'production_read',
        'production_write',
        'reports_view',
        'sales_manage',
        'user_manage',
      ];

      expectedPermissions.forEach(permission => {
        expect(PERMISSION_MAP[permission]).toBeDefined();
        expect(PERMISSION_MAP[permission].resource).toBeDefined();
        expect(PERMISSION_MAP[permission].action).toBeDefined();
      });
    });

    it('RESOURCE_PERMISSIONS debería tener configuración para cada recurso', () => {
      const resources: Resource[] = [
        'dashboard',
        'inventory',
        'production',
        'reports',
        'sales',
        'users',
        'clients',
        'products',
        'materials',
        'recipes',
        'machinery',
        'alerts',
        'waste',
      ];

      resources.forEach(resource => {
        expect(RESOURCE_PERMISSIONS[resource]).toBeDefined();
      });
    });

    it('MENU_ITEMS debería tener estructura válida', () => {
      MENU_ITEMS.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.label).toBeDefined();
        expect(item.icon).toBeDefined();
      });
    });
  });
});
