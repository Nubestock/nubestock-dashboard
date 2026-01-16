import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, ExternalLink } from 'lucide-react';

export default function BackendNotConfigured() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg border-yellow-200">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl text-yellow-900">Backend No Configurado</CardTitle>
            <CardDescription className="text-base mt-2">
              Necesitas configurar la URL de tu backend de Azure Functions
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">¿Qué hacer?</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
              <li>Abre el archivo <code className="bg-yellow-100 px-2 py-1 rounded">/src/app/config/api.ts</code></li>
              <li>Reemplaza <code className="bg-yellow-100 px-2 py-1 rounded">your-backend-url</code> con tu URL de Azure</li>
              <li>Guarda el archivo y recarga la aplicación</li>
            </ol>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Ejemplo de configuración:</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
{`export const API_CONFIG = {
  BASE_URL: 'https://nutregam-api.azurewebsites.net/api',
  // ...resto del archivo
};`}
            </pre>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.location.reload()}
            >
              Recargar Aplicación
            </Button>
            <Button
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              onClick={() => window.open('/QUICK_START_AUTH.md', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Documentación
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
            <p className="font-medium mb-1">¿Necesitas ayuda?</p>
            <p className="text-xs">Revisa los archivos QUICK_START_AUTH.md y AUTH_SETUP.md</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
