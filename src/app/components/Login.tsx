import React ,{ useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import ForgotPassword from './ForgotPassword';
import { Package } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  // Si el usuario está en la vista de "Olvidé mi contraseña"
  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Bienvenido a Nutregam');
    } catch (error) {
        console.error('Error en login:', error);
        
        let errorMessage = 'Error al iniciar sesión';
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        if (error.message.includes('Failed to fetch') || error.message.includes('conexión')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
      
      {/* Elemento decorativo con verde corporativo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#006A4E]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#006A4E]/5 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md border-neutral-200 shadow-sm relative z-10 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-6 pb-6">
          {/* Logo/Icono de Nutregam con verde corporativo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#006A4E]/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-[#006A4E] p-4 rounded-2xl">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <CardTitle className="text-2xl tracking-tight font-semibold text-neutral-900">
              Nutregam
            </CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Sistema de Gestión de Producción
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="pl-10 border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-neutral-700">
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="pl-10 pr-10 border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#006A4E] hover:bg-[#005741] text-white shadow-sm" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar sesión'
              )}
            </Button>

            {/* Enlace de "Olvidé mi contraseña" */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-neutral-600 hover:text-[#006A4E] transition-colors"
                disabled={isLoading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}