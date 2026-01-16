import { ShieldX, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

export default function AccessDenied() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Icono */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100">
          <ShieldX className="w-8 h-8 text-neutral-700" />
        </div>

        {/* Título y mensaje */}
        <div className="space-y-3">
          <h1 className="text-2xl text-neutral-900">
            Acceso Denegado
          </h1>
          <p className="text-neutral-600">
            No tienes permisos de administrador para acceder a este sistema.
          </p>
        </div>

        {/* Info del usuario */}
        <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-600">Usuario:</span>
            <span className="text-neutral-900">{user?.email}</span>
          </div>
          {user?.roles && user.roles.length > 0 && (
            <div className="flex justify-between">
              <span className="text-neutral-600">Rol:</span>
              <span className="text-neutral-900 capitalize">{user.roles.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <Button
            onClick={logout}
            className="w-full bg-[#006A4E] hover:bg-[#005a42] text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
          
          <p className="text-sm text-neutral-500">
            Contacta con IT para solicitar acceso
          </p>
        </div>
      </div>
    </div>
  );
}