/// <reference types="vite/client" />
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Settings, 
  Database, 
  Server, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Activity,
  Globe,
  Shield,
  Clock,
  Zap,
  MapPin,
  Ruler
} from 'lucide-react';
import { toast } from 'sonner';
import { useConfig } from '../contexts/ConfigContext';
import OriginManagement from './OriginManagement';
import MeasureManagement from './MeasureManagement';
import LocationsManagement from './LocationsManagement';

export default function ConfigurationView() {
  const { 
    backendUrl, 
    setBackendUrl,
    isBackendHealthy,
    checkBackendHealth,
    lastHealthCheck,
    healthCheckData,
  } = useConfig();

  const [tempUrl, setTempUrl] = useState(backendUrl);
  const [isChecking, setIsChecking] = useState(false);

  // Detectar si estamos en producción (Vite: import.meta.env)
  const isProduction = import.meta.env.PROD;
  const isDevelopment = import.meta.env.DEV;

  const handleSaveUrl = () => {
    if (!tempUrl.trim()) {
      toast.error('La URL del backend no puede estar vacía');
      return;
    }

    setBackendUrl(tempUrl);
    toast.success('URL del backend actualizada correctamente');
    
    // Verificar salud del nuevo backend
    handleCheckHealth();
  };

  const handleCheckHealth = async () => {
    setIsChecking(true);
    try {
      await checkBackendHealth();
      if (isBackendHealthy) {
        toast.success('Backend accesible y funcionando correctamente');
      } else {
        toast.error('El backend no está respondiendo correctamente');
      }
    } catch (error) {
      toast.error('Error al verificar el estado del backend');
    } finally {
      setIsChecking(false);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return new Intl.DateTimeFormat('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2">Administración</h1>
        <p className="text-gray-600">Configuración del sistema, orígenes y medidas</p>
      </div>

      {/* Tabs Navigation */}
      <Tabs defaultValue="system" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-neutral-100">
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Ubicaciones
          </TabsTrigger>
          <TabsTrigger value="origins" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Orígenes
          </TabsTrigger>
          <TabsTrigger value="measures" className="flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Medidas
          </TabsTrigger>
        </TabsList>

        {/* Tab Content: Sistema */}
        <TabsContent value="system" className="space-y-6 mt-6">
          {/* Estado General */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Modo de Datos - SIEMPRE API REAL */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Database className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Modo de Datos</p>
                    <p className="font-semibold">API Real</p>
                  </div>
                </div>

                {/* Estado del Backend */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Server className={`h-8 w-8 ${isBackendHealthy ? 'text-green-500' : 'text-red-500'}`} />
                  <div>
                    <p className="text-sm text-gray-600">Backend Status</p>
                    <p className="font-semibold">
                      {isBackendHealthy ? 'Conectado' : 'Desconectado'}
                    </p>
                  </div>
                </div>

                {/* Última Verificación */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Última Verificación</p>
                    <p className="text-sm font-medium">
                      {formatDate(lastHealthCheck)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Datos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Modo de Datos
              </CardTitle>
              <CardDescription>
                El sistema siempre usa datos reales desde la API - sin datos mock
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mensaje informativo - Solo API Real */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Globe className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-green-900 mb-2">Modo API Real Activo</h3>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>✓ El sistema está configurado para usar datos reales únicamente</li>
                      <li>✓ Todas las operaciones se conectan al backend de Azure Functions</li>
                      <li>✓ Los cambios se persisten en la base de datos</li>
                      <li>✓ Sin datos mock - 100% producción-ready</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración del Backend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Configuración del Backend
              </CardTitle>
              <CardDescription>
                URL de Azure Functions y estado de conexión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backendUrl">URL del Backend</Label>
                <div className="flex gap-2">
                  <Input
                    id="backendUrl"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder={import.meta.env.VITE_API_BASE_URL}
                  />
                  <Button 
                    onClick={handleSaveUrl}
                    disabled={tempUrl === backendUrl}
                  >
                    Guardar
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleCheckHealth}
                  disabled={isChecking}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Verificando...' : 'Verificar Conexión'}
                </Button>
                
                <div className="flex items-center gap-2 px-4 py-2 border rounded-lg">
                  {isBackendHealthy ? (
                    <>
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-green-700 font-medium">Conectado</span>
                    </>
                  ) : (
                    <>
                      <div className="h-3 w-3 bg-red-500 rounded-full" />
                      <span className="text-sm text-red-700 font-medium">Desconectado</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información Técnica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Información Técnica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded text-sm">
                  <div>
                    <span className="text-gray-600">Backend URL:</span>
                    <p className="font-mono text-xs mt-1 break-all">{backendUrl}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Modo Actual:</span>
                    <p className="font-medium mt-1">API Real</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Estado:</span>
                    <p className="font-medium mt-1">
                      {isBackendHealthy ? 'Conectado' : 'Desconectado'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Última Verificación:</span>
                    <p className="text-xs mt-1">{formatDate(lastHealthCheck)}</p>
                  </div>
                </div>

                {/* Detalles del Healthcheck */}
                {healthCheckData && isBackendHealthy && (
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50 mt-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Detalles del Healthcheck
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Información General */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">Estado General:</span>
                          <Badge className="bg-green-600 text-white">
                            {healthCheckData.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">Tiempo de Respuesta:</span>
                          <span className="font-mono text-green-900">{healthCheckData.responseTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">Uptime:</span>
                          <span className="font-mono text-green-900">
                            {healthCheckData.uptime.toFixed(2)}s
                          </span>
                        </div>
                      </div>

                      {/* Checks de Servicios */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">API:</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-900">{healthCheckData.checks.api.message}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">Base de Datos:</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-900">{healthCheckData.checks.database.message}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-green-700">Entorno:</span>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                            <span className="text-xs text-green-900">{healthCheckData.checks.environment.message}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-green-700">
                        <strong>Timestamp:</strong> {new Date(healthCheckData.timestamp).toLocaleString('es-EC', {
                          dateStyle: 'medium',
                          timeStyle: 'medium'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Content: Ubicaciones */}
        <TabsContent value="locations" className="mt-6">
          <LocationsManagement />
        </TabsContent>

        {/* Tab Content: Orígenes */}
        <TabsContent value="origins" className="mt-6">
          <OriginManagement />
        </TabsContent>

        {/* Tab Content: Medidas */}
        <TabsContent value="measures" className="mt-6">
          <MeasureManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}