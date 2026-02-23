import { renderHook, act, waitFor } from '@testing-library/react';
import { useUsers, useRoles, useRolesWithPermissions, usePermissions, useUserPermissions } from '@/app/hooks/useUsers';

const mockApiRequest = jest.fn();

jest.mock('@/app/config/api', () => ({
  apiRequest: (...args: any[]) => mockApiRequest(...args),
}));

describe('useUsers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockUsers = [
    { id: 1, name: 'User 1', email: 'user1@test.com', is_active: true },
    { id: 2, name: 'User 2', email: 'user2@test.com', is_active: true },
  ];

  const mockResponse = {
    data: mockUsers,
    pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
  };

  describe('fetchUsers', () => {
    it('should fetch users on mount', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.users).toEqual(mockUsers);
    });

    it('should fetch with search and is_active params', async () => {
      mockApiRequest.mockResolvedValue(mockResponse);

      renderHook(() => useUsers(1, 10, 'test', true));

      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith(
          expect.stringContaining('search=test'),
          expect.any(Object)
        );
      });

      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.stringContaining('is_active=true'),
        expect.any(Object)
      );
    });

    it('should use default pagination when not provided', async () => {
      mockApiRequest.mockResolvedValue({ data: mockUsers });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    });

    it('should handle 403 permission error', async () => {
      mockApiRequest.mockRejectedValue(new Error('403 Forbidden'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
      expect(result.current.users).toEqual([]);
    });

    it('should handle permission error message', async () => {
      mockApiRequest.mockRejectedValue(new Error('No tiene permisos'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeNull();
    });

    it('should handle other errors', async () => {
      mockApiRequest.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
    });

    it('should handle non-Error exceptions', async () => {
      mockApiRequest.mockRejectedValue('string error');

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Error desconocido');
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ data: mockUsers[0] })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.createUser({
          name: 'New User',
          email: 'new@test.com',
          password: 'password123',
          phone: '123456789',
        });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/auth/register', expect.objectContaining({ method: 'POST' }));
    });

    it('should handle create error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Create failed'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.createUser({ name: 'Test', email: 't@t.com', password: '123' })
        ).rejects.toThrow('Create failed');
      });
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ data: mockUsers[0] })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.updateUser(1, { name: 'Updated' });
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/users/1', expect.objectContaining({ method: 'PUT' }));
    });

    it('should handle update error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.updateUser(1, {})).rejects.toThrow('Update failed');
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true })
        .mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteUser(1);
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/users/1', { method: 'DELETE' });
    });

    it('should handle delete error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Delete failed'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.deleteUser(1)).rejects.toThrow('Delete failed');
      });
    });
  });

  describe('adminResetPassword', () => {
    it('should request password reset', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce({ success: true, message: 'Email sent' });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.adminResetPassword('user@test.com');
      });

      expect(mockApiRequest).toHaveBeenCalledWith('/auth/admin-reset-password', expect.objectContaining({ method: 'POST' }));
    });

    it('should handle reset password error', async () => {
      mockApiRequest
        .mockResolvedValueOnce(mockResponse)
        .mockRejectedValueOnce(new Error('Reset failed'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await expect(result.current.adminResetPassword('user@test.com')).rejects.toThrow('Reset failed');
      });
    });
  });
});

describe('useRoles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockRoles = [
    { id: 1, name: 'Admin', description: 'Administrator' },
    { id: 2, name: 'User', description: 'Regular user' },
  ];

  it('should fetch roles on mount', async () => {
    mockApiRequest.mockResolvedValue({ data: mockRoles });

    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.roles).toEqual(mockRoles);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useRoles());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error desconocido');
  });
});

describe('useRolesWithPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockRolesData = {
    roles: [{ id: 1, name: 'Admin', permissions: [1, 2] }],
    totalRoles: 1,
    allPermissions: [{ id: 1, name: 'read' }, { id: 2, name: 'write' }],
    totalPermissions: 2,
  };

  it('should fetch roles with permissions on mount', async () => {
    mockApiRequest.mockResolvedValue({ data: mockRolesData });

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.rolesData).toEqual(mockRolesData);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error');
    expect(result.current.rolesData).toBeNull();
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error desconocido');
  });

  it('should update role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: mockRolesData });

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.updateRole(1, { name: 'Updated', description: 'Desc', permissions: [1] });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/roles/1', expect.objectContaining({ method: 'PUT' }));
  });

  it('should handle update role error', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockRejectedValueOnce(new Error('Update failed'));

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.updateRole(1, { name: 'Test', description: 'Test', permissions: [] })
      ).rejects.toThrow('Update failed');
    });
  });

  it('should handle non-Error on update role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockRejectedValueOnce('string');

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.updateRole(1, { name: 'Test', description: 'Test', permissions: [] })
      ).rejects.toThrow('Error al actualizar rol');
    });
  });

  it('should create role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: mockRolesData });

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.createRole({ name: 'New Role', description: 'Desc', permissions: [1] });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/roles', expect.objectContaining({ method: 'POST' }));
  });

  it('should handle create role error', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockRejectedValueOnce(new Error('Create failed'));

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.createRole({ name: 'Test', description: 'Test', permissions: [] })
      ).rejects.toThrow('Create failed');
    });
  });

  it('should handle non-Error on create role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockRejectedValueOnce('string');

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.createRole({ name: 'Test', description: 'Test', permissions: [] })
      ).rejects.toThrow('Error al crear rol');
    });
  });

  it('should delete role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: mockRolesData });

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteRole(1);
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/roles/1', { method: 'DELETE' });
  });

  it('should handle delete role error', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockRejectedValueOnce(new Error('Delete failed'));

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.deleteRole(1)).rejects.toThrow('Delete failed');
    });
  });

  it('should handle non-Error on delete role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockRolesData })
      .mockRejectedValueOnce('string');

    const { result } = renderHook(() => useRolesWithPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.deleteRole(1)).rejects.toThrow('Error al eliminar rol');
    });
  });
});

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockPermissions = [
    { id: 1, name: 'read', resource: 'products' },
    { id: 2, name: 'write', resource: 'products' },
  ];

  it('should fetch permissions on mount', async () => {
    mockApiRequest.mockResolvedValue({ data: mockPermissions });

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.permissions).toEqual(mockPermissions);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => usePermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error desconocido');
  });
});

describe('useUserPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiRequest.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const mockUserPermissions = {
    userId: 1,
    userName: 'User',
    roles: [{ roleId: 1, roleName: 'Admin', permissions: [] }],
  };

  it('should not fetch when userId is not provided', async () => {
    const { result } = renderHook(() => useUserPermissions());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it('should fetch user permissions when userId is provided', async () => {
    mockApiRequest.mockResolvedValue({ data: mockUserPermissions });

    const { result } = renderHook(() => useUserPermissions(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.userPermissions).toEqual(mockUserPermissions);
  });

  it('should handle error', async () => {
    mockApiRequest.mockRejectedValue(new Error('Error'));

    const { result } = renderHook(() => useUserPermissions(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error');
  });

  it('should handle non-Error exception', async () => {
    mockApiRequest.mockRejectedValue('string');

    const { result } = renderHook(() => useUserPermissions(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Error desconocido');
  });

  it('should assign role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockUserPermissions })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: mockUserPermissions });

    const { result } = renderHook(() => useUserPermissions(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.assignRole({ userId: 1, roleId: 1, assignment_reason: 'Test' });
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/user-permissions', expect.objectContaining({ method: 'POST' }));
  });

  it('should handle assign role error', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockUserPermissions })
      .mockRejectedValueOnce(new Error('Assign failed'));

    const { result } = renderHook(() => useUserPermissions(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.assignRole({ userId: 1, roleId: 1, assignment_reason: 'Test' })
      ).rejects.toThrow('Assign failed');
    });
  });

  it('should handle non-Error on assign role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockUserPermissions })
      .mockRejectedValueOnce('string');

    const { result } = renderHook(() => useUserPermissions(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(
        result.current.assignRole({ userId: 1, roleId: 1, assignment_reason: 'Test' })
      ).rejects.toThrow('Error al asignar rol');
    });
  });

  it('should remove role', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockUserPermissions })
      .mockResolvedValueOnce({ success: true })
      .mockResolvedValueOnce({ data: mockUserPermissions });

    const { result } = renderHook(() => useUserPermissions(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.removeRole(1, 1);
    });

    expect(mockApiRequest).toHaveBeenCalledWith('/user-permissions/1/role/1', { method: 'DELETE' });
  });

  it('should handle remove role error', async () => {
    mockApiRequest
      .mockResolvedValueOnce({ data: mockUserPermissions })
      .mockRejectedValueOnce(new Error('Remove failed'));

    const { result } = renderHook(() => useUserPermissions(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await expect(result.current.removeRole(1, 1)).rejects.toThrow('Remove failed');
    });
  });
});
