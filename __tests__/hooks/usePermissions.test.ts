import { renderHook } from '@testing-library/react';
import { usePermissions } from '@/app/hooks/usePermissions';

const mockPermissions = ['products:view', 'products:create', 'products:edit', 'users:view'];
const mockRoles = ['admin'];

jest.mock('@/app/contexts/AuthContext', () => ({
  useAuth: () => ({
    permissions: mockPermissions,
    roles: mockRoles,
  }),
}));

jest.mock('@/app/utils/permissionUtils', () => ({
  hasPermission: jest.fn((perms: string[], perm: string) => perms.includes(perm)),
  hasAnyPermission: jest.fn((perms: string[], reqPerms: string[]) => 
    reqPerms.some(p => perms.includes(p))
  ),
  hasAllPermissions: jest.fn((perms: string[], reqPerms: string[]) => 
    reqPerms.every(p => perms.includes(p))
  ),
  canPerformAction: jest.fn((perms: string[], resource: string, action: string) => 
    perms.includes(`${resource}:${action}`)
  ),
  getAccessibleResources: jest.fn((perms: string[]) => {
    const resources = new Set<string>();
    perms.forEach(p => {
      const [resource] = p.split(':');
      resources.add(resource);
    });
    return Array.from(resources);
  }),
  isAdmin: jest.fn((perms: string[]) => perms.includes('admin:all')),
  isProductionOnly: jest.fn((perms: string[]) => 
    perms.every(p => p.startsWith('production:'))
  ),
}));

describe('usePermissions', () => {
  describe('basic properties', () => {
    it('should return permissions from auth context', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.permissions).toEqual(mockPermissions);
    });

    it('should return roles from auth context', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.roles).toEqual(mockRoles);
    });
  });

  describe('hasPermission', () => {
    it('should return true for existing permission', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission('products:view')).toBe(true);
    });

    it('should return false for non-existing permission', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasPermission('products:delete')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has at least one permission', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAnyPermission(['products:view', 'products:delete'])).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAnyPermission(['products:delete', 'users:delete'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAllPermissions(['products:view', 'products:create'])).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.hasAllPermissions(['products:view', 'products:delete'])).toBe(false);
    });
  });

  describe('canPerformAction', () => {
    it('should return true for allowed action', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canPerformAction('products', 'view')).toBe(true);
    });

    it('should return false for disallowed action', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canPerformAction('products', 'delete')).toBe(false);
    });
  });

  describe('shortcut methods', () => {
    it('canView should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canView('products')).toBe(true);
      expect(result.current.canView('sales')).toBe(false);
    });

    it('canCreate should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canCreate('products')).toBe(true);
      expect(result.current.canCreate('users')).toBe(false);
    });

    it('canEdit should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canEdit('products')).toBe(true);
      expect(result.current.canEdit('users')).toBe(false);
    });

    it('canDelete should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canDelete('products')).toBe(false);
    });

    it('canManage should work correctly', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.canManage('products')).toBe(false);
    });
  });

  describe('helper properties', () => {
    it('should return accessible resources', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.accessibleResources).toContain('products');
      expect(result.current.accessibleResources).toContain('users');
    });

    it('should return isAdmin status', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAdmin).toBe(false);
    });

    it('should return isProductionOnly status', () => {
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isProductionOnly).toBe(false);
    });
  });
});
