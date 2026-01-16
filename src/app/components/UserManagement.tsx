import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Plus, Edit, Trash2, Shield, Search, UserCog, AlertCircle, KeyRound, RefreshCw, Users, UserCheck, UserX, MoreVertical, Eye, Mail, Phone, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useUsers, useRoles, useRolesWithPermissions, useUserPermissions, Role } from '../hooks/useUsers';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from '../contexts/AuthContext';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  
  const isAdmin = currentUser?.roles?.some(role => 
    role.toLowerCase() === 'administrador' || role.toLowerCase() === 'admin'
  ) || false;

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isAssignRoleOpen, setIsAssignRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Estados para confirmaciones
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [resetPasswordConfirmOpen, setResetPasswordConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [userToResetPassword, setUserToResetPassword] = useState<{ email: string; name: string } | null>(null);

  // Estados para búsqueda y filtrado de permisos
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form states
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    is_active: true,
  });

  // Estados para edición de roles
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [editRoleForm, setEditRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as number[],
  });
  
  const [createRoleForm, setCreateRoleForm] = useState({
    name: '',
    description: '',
    permissions: [] as number[],
  });

  // Estado para asignar rol a usuario
  const [selectedRoleForUser, setSelectedRoleForUser] = useState<number>(0);
  const [assignmentReason, setAssignmentReason] = useState('');
  
  // Estados para loading
  const [isAssigningRole, setIsAssigningRole] = useState(false);
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks
  const { users, isLoading, error, pagination, refetch, createUser, updateUser, deleteUser, adminResetPassword } = useUsers(
    currentPage,
    10,
    searchTerm,
    activeFilter
  );
  const { roles, isLoading: rolesLoading } = useRoles();
  const { rolesData, isLoading: rolesWithPermissionsLoading, updateRole, createRole, refetch: refetchRoles } = useRolesWithPermissions();
  
  const userPermissionsHook = useUserPermissions(selectedUser?.id);

  const handleAddUser = async () => {
    if (!newUserForm.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }
    if (!newUserForm.email.trim()) {
      toast.error('El correo electrónico es requerido');
      return;
    }
    if (!newUserForm.password || newUserForm.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setIsCreatingUser(true);
    try {
      await createUser(newUserForm);
      toast.success('Usuario creado exitosamente');
      setIsAddUserOpen(false);
      setNewUserForm({
        name: '',
        email: '',
        password: '',
        phone: '',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear usuario';
      toast.error(errorMessage);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUserId(user.id);
    setEditUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      is_active: user.is_active,
    });
    setIsEditUserOpen(true);
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    setIsDeletingUser(true);
    try {
      await deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar usuario';
      toast.error(errorMessage);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const openDeleteConfirm = (userId: number, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteConfirmOpen(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleForUser) {
      toast.error('Debe seleccionar un usuario y un rol');
      return;
    }

    if (!assignmentReason || assignmentReason.trim() === '') {
      toast.error('Debe proporcionar una razón para la asignación del rol');
      return;
    }

    const payload = {
      userId: selectedUser.id,
      roleId: selectedRoleForUser,
      assignment_reason: assignmentReason.trim(),
    };

    setIsAssigningRole(true);
    try {
      await userPermissionsHook.assignRole(payload);
      toast.success('Rol asignado exitosamente');
      setIsAssignRoleOpen(false);
      setSelectedRoleForUser(0);
      setAssignmentReason('');
      setSelectedUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al asignar rol';
      toast.error(errorMessage);
    } finally {
      setIsAssigningRole(false);
    }
  };

  const handleResetPassword = async (userEmail: string, userName: string) => {
    setIsResettingPassword(true);
    try {
      const response = await adminResetPassword(userEmail);
      
      const message = response.data?.message || response.message || 'Solicitud generada';
      const resetToken = response.data?.resetToken || null;
      const expiresAt = response.data?.expiresAt || null;
      
      toast.success(`Solicitud generada exitosamente para ${userName}`, {
        description: resetToken 
          ? `Token: ${resetToken.substring(0, 20)}... (expira: ${expiresAt || 'N/A'})`
          : `Se enviará un correo a ${userEmail}`,
        duration: 10000,
      });
      setResetPasswordConfirmOpen(false);
      setUserToResetPassword(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al generar solicitud';
      toast.error(errorMessage);
    } finally {
      setIsResettingPassword(false);
    }
  };

  const openResetPasswordConfirm = (userEmail: string, userName: string) => {
    setUserToResetPassword({ email: userEmail, name: userName });
    setResetPasswordConfirmOpen(true);
  };

  const openAssignRoleDialog = (user: any) => {
    setSelectedUser(user);
    setIsAssignRoleOpen(true);
  };

  const handleRefreshUsers = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Datos actualizados correctamente');
    } catch (err) {
      toast.error('Error al actualizar datos');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefreshRoles = async () => {
    setIsRefreshing(true);
    try {
      await refetchRoles();
      toast.success('Roles actualizados correctamente');
    } catch (err) {
      toast.error('Error al actualizar roles');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingUserId) return;

    setIsUpdatingUser(true);
    try {
      await updateUser(editingUserId, editUserForm);
      toast.success('Usuario actualizado exitosamente');
      setIsEditUserOpen(false);
      setEditingUserId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar usuario';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const openEditRoleDialog = (role: any) => {
    setSelectedRole(role);
    setEditRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((p: any) => p.id),
    });
    setIsEditRoleDialogOpen(true);
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;

    setIsUpdatingRole(true);
    try {
      await updateRole(selectedRole.id, editRoleForm);
      toast.success('Rol actualizado exitosamente');
      setIsEditRoleDialogOpen(false);
      setSelectedRole(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar rol';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const togglePermission = (permissionId: number) => {
    setEditRoleForm((prev) => {
      const isSelected = prev.permissions.includes(permissionId);
      return {
        ...prev,
        permissions: isSelected
          ? prev.permissions.filter((p) => p !== permissionId)
          : [...prev.permissions, permissionId],
      };
    });
  };
  
  const toggleCreateRolePermission = (permissionId: number) => {
    setCreateRoleForm((prev) => {
      const isSelected = prev.permissions.includes(permissionId);
      return {
        ...prev,
        permissions: isSelected
          ? prev.permissions.filter((p) => p !== permissionId)
          : [...prev.permissions, permissionId],
      };
    });
  };
  
  const handleCreateRole = async () => {
    if (!createRoleForm.name.trim()) {
      toast.error('El nombre del rol es requerido');
      return;
    }
    
    setIsUpdatingRole(true);
    try {
      await createRole(createRoleForm);
      toast.success('Rol creado exitosamente');
      setIsCreateRoleDialogOpen(false);
      setCreateRoleForm({
        name: '',
        description: '',
        permissions: [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear rol';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const filteredPermissions = rolesData && rolesData.allPermissions
    ? rolesData.allPermissions.filter((permission) => {
        const matchesSearch = permission.name.toLowerCase().includes(permissionSearch.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || permission.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    : [];

  const categories = rolesData && rolesData.allPermissions
    ? Array.from(new Set(rolesData.allPermissions.map((p) => p.category)))
    : [];

  const hasActiveFilters = activeFilter !== undefined;

  // Estadísticas
  const stats = {
    total: pagination.total,
    active: users.filter((u) => u.is_active).length,
    inactive: users.filter((u) => !u.is_active).length,
  };

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl text-neutral-900">Gestión de Usuarios</h1>
          <p className="text-sm text-neutral-600 mt-1">Administra usuarios, roles y permisos del sistema</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl text-neutral-900">Gestión de Usuarios</h1>
        <p className="text-sm text-neutral-600 mt-1">Administra usuarios, roles y permisos del sistema</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-neutral-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-neutral-600">Total</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-neutral-900">{stats.total}</span>
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-neutral-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-neutral-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-neutral-600">Activos</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-[#006A4E]">{stats.active}</span>
                    <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-[#006A4E]/40" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-neutral-200">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm text-neutral-600">Inactivos</p>
                  <div className="flex items-end justify-between">
                    <span className="text-xl sm:text-2xl font-bold text-red-600">{stats.inactive}</span>
                    <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600/40" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barra de búsqueda y acciones */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <Input
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 sm:h-10 text-sm"
              />
            </div>

            {/* Filtros Sheet */}
            <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-9 sm:h-10 px-3 relative"
                >
                  <Shield className="h-4 w-4" />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-[#006A4E] rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filtrar Usuarios</SheetTitle>
                  <SheetDescription>
                    Filtra los usuarios por estado
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Button
                      variant={activeFilter === undefined ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilter === undefined ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => {
                        setActiveFilter(undefined);
                        setIsFiltersOpen(false);
                      }}
                    >
                      Todos los usuarios
                    </Button>
                    <Button
                      variant={activeFilter === true ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilter === true ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => {
                        setActiveFilter(true);
                        setIsFiltersOpen(false);
                      }}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Solo activos
                    </Button>
                    <Button
                      variant={activeFilter === false ? 'default' : 'outline'}
                      className={`w-full justify-start ${activeFilter === false ? 'bg-[#006A4E]' : ''}`}
                      size="sm"
                      onClick={() => {
                        setActiveFilter(false);
                        setIsFiltersOpen(false);
                      }}
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Solo inactivos
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Button 
              onClick={handleRefreshUsers}
              variant="outline" 
              size="sm"
              className="h-9 sm:h-10 px-3"
              disabled={isRefreshing || isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Button 
              onClick={() => setIsAddUserOpen(true)} 
              className="bg-[#006A4E] hover:bg-[#005a42] h-9 sm:h-10 px-3 sm:px-4"
              size="sm"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nuevo</span>
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006A4E] mx-auto mb-3"></div>
                <p className="text-sm text-neutral-600">Cargando usuarios...</p>
              </div>
            </div>
          )}

          {/* Vista de Usuarios */}
          {!isLoading && (
            <>
              {users.length === 0 ? (
                <Card>
                  <CardContent className="py-16">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-3 text-neutral-300" />
                      <h3 className="text-lg font-medium text-neutral-900 mb-1">No se encontraron usuarios</h3>
                      <p className="text-sm text-neutral-500">
                        {searchTerm || hasActiveFilters
                          ? 'Intenta ajustar los filtros de búsqueda'
                          : 'Comienza agregando tu primer usuario'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {/* Mobile: Cards */}
                  <div className="grid grid-cols-1 gap-3 lg:hidden">
                    {users.map((user) => (
                      <Card key={user.id} className="border-neutral-200 hover:border-[#006A4E]/30 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {/* Nombre y Estado */}
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-neutral-900 truncate">{user.name}</h3>
                                  {user.roles && user.roles.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {user.roles.map((role: string, index: number) => (
                                        <Badge 
                                          key={index} 
                                          variant="outline" 
                                          className="bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/20 text-xs"
                                        >
                                          {role}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${user.is_active ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}
                                >
                                  {user.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </div>

                              {/* Detalles */}
                              <div className="space-y-1.5 mb-3">
                                <div className="flex items-center gap-2 text-sm text-neutral-600">
                                  <Mail className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                                  <span className="truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <Phone className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                                    <span>{user.phone}</span>
                                  </div>
                                )}
                                {user.last_login && (
                                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                                    <Calendar className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                                    <span className="text-xs">Último ingreso: {new Date(user.last_login).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Acciones */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openAssignRoleDialog(user)}>
                                  <UserCog className="h-4 w-4 mr-2" />
                                  Asignar rol
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openResetPasswordConfirm(user.email, user.name)}>
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Restablecer contraseña
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openDeleteConfirm(user.id, user.name)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop: Table View */}
                  <Card className="hidden lg:block border-neutral-200">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                          <tr>
                            <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Usuario
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Contacto
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Rol
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Estado
                            </th>
                            <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Último Login
                            </th>
                            <th className="text-right px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 bg-white">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium text-neutral-900 text-sm">{user.name}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm space-y-0.5">
                                  <div className="text-neutral-900">{user.email}</div>
                                  {user.phone && <div className="text-neutral-500">{user.phone}</div>}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {user.roles && user.roles.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {user.roles.map((role: string, index: number) => (
                                      <Badge 
                                        key={index} 
                                        variant="outline" 
                                        className="bg-[#006A4E]/10 text-[#006A4E] border-[#006A4E]/20 text-xs"
                                      >
                                        {role}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-neutral-400 text-sm">Sin rol</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${user.is_active ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'}`}
                                >
                                  {user.is_active ? 'Activo' : 'Inactivo'}
                                </Badge>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-neutral-600">
                                  {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Nunca'}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEditUser(user)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openAssignRoleDialog(user)}>
                                    <UserCog className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openDeleteConfirm(user.id, user.name)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>

                  {/* Paginación y contador */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-neutral-600 px-1">
                    <span>
                      Mostrando {users.length} de {pagination.total} usuarios
                    </span>
                    {pagination.totalPages > 1 && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                          disabled={currentPage === pagination.totalPages}
                        >
                          Siguiente
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Roles Tab - Mantener funcionalidad pero simplificar UI */}
        <TabsContent value="roles" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900">Roles y Permisos</h2>
              <p className="text-sm text-neutral-600 mt-1">Administra los roles del sistema</p>
            </div>
            <Button 
              onClick={() => setIsCreateRoleDialogOpen(true)}
              className="bg-[#006A4E] hover:bg-[#005a42] h-9 sm:h-10"
              size="sm"
            >
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Nuevo Rol</span>
            </Button>
          </div>

          {rolesWithPermissionsLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#006A4E] mx-auto mb-3"></div>
                <p className="text-sm text-neutral-600">Cargando roles...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rolesData?.roles.map((role) => (
                <Card key={role.id} className="border-neutral-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{role.name}</CardTitle>
                        <p className="text-sm text-neutral-600 mt-1">{role.description}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditRoleDialog(role)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-neutral-600">
                      <span className="font-medium">{role.permissions.length}</span> permisos asignados
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs y AlertDialogs (mantener funcionalidad existente) */}
      
      {/* Dialog: Agregar Usuario */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Ingresa la información del nuevo usuario del sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input
                placeholder="Juan Pérez"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input
                type="email"
                placeholder="juan@nutregam.com"
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                placeholder="+593999999999"
                value={newUserForm.phone}
                onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
              />
              <p className="text-xs text-gray-500">Mínimo 8 caracteres</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} disabled={isCreatingUser} className="bg-[#006A4E] hover:bg-[#005a42]">
              {isCreatingUser ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Usuario */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre Completo</Label>
              <Input
                placeholder="Juan Pérez"
                value={editUserForm.name}
                onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input
                type="email"
                placeholder="juan@nutregam.com"
                value={editUserForm.email}
                onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                placeholder="+593999999999"
                value={editUserForm.phone}
                onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={editUserForm.is_active}
                onCheckedChange={(checked) => setEditUserForm({ ...editUserForm, is_active: checked as boolean })}
              />
              <Label>Usuario activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdatingUser} className="bg-[#006A4E] hover:bg-[#005a42]">
              {isUpdatingUser ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Asignar Rol */}
      <Dialog open={isAssignRoleOpen} onOpenChange={setIsAssignRoleOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Asignar Rol a Usuario</DialogTitle>
            <DialogDescription>
              Asigna un rol a {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Seleccionar Rol</Label>
              <Select
                value={selectedRoleForUser.toString()}
                onValueChange={(value) => setSelectedRoleForUser(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Razón de la asignación</Label>
              <Input
                placeholder="Describe el motivo de esta asignación"
                value={assignmentReason}
                onChange={(e) => setAssignmentReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignRoleOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignRole} disabled={isAssigningRole} className="bg-[#006A4E] hover:bg-[#005a42]">
              {isAssigningRole ? 'Asignando...' : 'Asignar Rol'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert: Confirmar Eliminación */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar al usuario <strong>{userToDelete?.name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && handleDeleteUser(userToDelete.id, userToDelete.name)}
              disabled={isDeletingUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingUser ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert: Confirmar Reset Password */}
      <AlertDialog open={resetPasswordConfirmOpen} onOpenChange={setResetPasswordConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restablecer Contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              Se generará una solicitud de restablecimiento de contraseña para <strong>{userToResetPassword?.name}</strong> ({userToResetPassword?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToResetPassword && handleResetPassword(userToResetPassword.email, userToResetPassword.name)}
              disabled={isResettingPassword}
              className="bg-[#006A4E] hover:bg-[#005a42]"
            >
              {isResettingPassword ? 'Generando...' : 'Generar Solicitud'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Editar Rol - Versión simplificada para mobile */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Rol</DialogTitle>
            <DialogDescription>
              Modifica el nombre, descripción y permisos del rol
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Rol</Label>
              <Input
                placeholder="Nombre del rol"
                value={editRoleForm.name}
                onChange={(e) => setEditRoleForm({ ...editRoleForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                placeholder="Descripción del rol"
                value={editRoleForm.description}
                onChange={(e) => setEditRoleForm({ ...editRoleForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Permisos ({editRoleForm.permissions.length} seleccionados)</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {filteredPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-2 py-2">
                    <Checkbox
                      checked={editRoleForm.permissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{permission.name}</p>
                      <p className="text-xs text-neutral-500">{permission.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditRole} disabled={isUpdatingRole} className="bg-[#006A4E] hover:bg-[#005a42]">
              {isUpdatingRole ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Crear Rol */}
      <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Rol</DialogTitle>
            <DialogDescription>
              Define el nombre, descripción y permisos del nuevo rol
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Rol</Label>
              <Input
                placeholder="Nombre del rol"
                value={createRoleForm.name}
                onChange={(e) => setCreateRoleForm({ ...createRoleForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Input
                placeholder="Descripción del rol"
                value={createRoleForm.description}
                onChange={(e) => setCreateRoleForm({ ...createRoleForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Permisos ({createRoleForm.permissions.length} seleccionados)</Label>
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                {filteredPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center gap-2 py-2">
                    <Checkbox
                      checked={createRoleForm.permissions.includes(permission.id)}
                      onCheckedChange={() => toggleCreateRolePermission(permission.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{permission.name}</p>
                      <p className="text-xs text-neutral-500">{permission.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateRole} disabled={isUpdatingRole} className="bg-[#006A4E] hover:bg-[#005a42]">
              {isUpdatingRole ? 'Creando...' : 'Crear Rol'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
