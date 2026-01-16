import { useState } from 'react';
import { Bell, Menu, X, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import { useAlerts } from '../hooks/useAlerts';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';

interface NavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
  setActiveSection: (section: string) => void;
}

export default function Navbar({ onMenuClick, isSidebarOpen, setActiveSection }: NavbarProps) {
  const { alerts } = useAlerts(true);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Filtrar alertas activas
  const activeAlerts = alerts.filter(a => a.status === 'active');
  
  // Contar por prioridad
  const criticalAlerts = activeAlerts.filter(a => a.priority === 'critical');
  const highAlerts = activeAlerts.filter(a => a.priority === 'high');
  const mediumAlerts = activeAlerts.filter(a => a.priority === 'medium');

  // Determinar el color del badge según la prioridad más alta
  const getBadgeVariant = () => {
    if (criticalAlerts.length > 0) return 'destructive';
    if (highAlerts.length > 0) return 'default';
    return 'secondary';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace menos de 1 hora';
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-[60]">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Logo + Menu Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Menu Button - Visible en todas las resoluciones */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-9 w-9 p-0"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#006A4E] flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-gray-900">Nutregam</h1>
              <p className="text-xs text-gray-500 -mt-1">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        {/* Right: Alerts */}
        <div className="flex items-center gap-2">
          {/* Alerts Popover */}
          <Popover open={isAlertsOpen} onOpenChange={setIsAlertsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
                <Bell className="h-5 w-5" />
                {activeAlerts.length > 0 && (
                  <Badge
                    variant={getBadgeVariant()}
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {activeAlerts.length > 9 ? '9+' : activeAlerts.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[90vw] sm:w-[400px] p-0" align="end">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-base">Alertas del Sistema</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {activeAlerts.length === 0
                    ? 'No hay alertas activas'
                    : `${activeAlerts.length} alerta${activeAlerts.length > 1 ? 's' : ''} activa${activeAlerts.length > 1 ? 's' : ''}`}
                </p>
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {activeAlerts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm text-gray-500">No hay alertas en este momento</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {activeAlerts.slice(0, 10).map((alert) => (
                      <Card key={alert.idalert} className={`border ${getPriorityColor(alert.priority)}`}>
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2">
                            <div className="shrink-0 mt-0.5">
                              {getPriorityIcon(alert.priority)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                                {alert.alert_title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {alert.alert_message}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {alert.alert_type === 'low_stock' && 'Stock Bajo'}
                                  {alert.alert_type === 'expiration' && 'Próximo a Vencer'}
                                  {alert.alert_type === 'maintenance' && 'Mantenimiento'}
                                  {alert.alert_type === 'quality' && 'Calidad'}
                                  {alert.alert_type === 'production' && 'Producción'}
                                  {alert.alert_type === 'system' && 'Sistema'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatDate(alert.creationdate)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {activeAlerts.length > 0 && (
                <div className="p-3 border-t bg-gray-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setIsAlertsOpen(false);
                      setActiveSection('alerts');
                    }}
                  >
                    Ver todas las alertas
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
}