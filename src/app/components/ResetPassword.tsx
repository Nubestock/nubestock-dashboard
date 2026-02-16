import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../config/api';

export default function ResetPassword() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Extraer token de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      console.log('Token extraído de la URL:', tokenFromUrl.substring(0, 20) + '...');
    } else {
      setError('Token no encontrado en la URL. Por favor, utilice el enlace del correo electrónico.');
    }
  }, []);

  const validatePassword = () => {
    if (!password) {
      toast.error('Por favor ingrese una contraseña');
      return false;
    }
    
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) return;
    if (!token) {
      toast.error('Token no válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Enviando solicitud de restablecimiento...');
      
      const response = await apiRequest('/auth/reset-password', {
        method: 'PUT',
        body: JSON.stringify({
          token: token,
          newPassword: password,
        }),
      });

      console.log('Respuesta del servidor:', response);

      if (response.success) {
        setSuccess(true);
        toast.success('¡Contraseña restablecida exitosamente!');
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      } else {
        throw new Error(response.message || 'Error al restablecer contraseña');
      }
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al restablecer contraseña';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    window.location.href = '/';
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
        {/* Patrón de fondo sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006A4E]/5 rounded-full blur-3xl"></div>
        
        <Card className="w-full max-w-md border-neutral-200 shadow-sm relative z-10 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#006A4E]/10 rounded-full blur-xl"></div>
                <div className="relative bg-[#006A4E]/10 rounded-full p-4">
                  <CheckCircle2 className="h-8 w-8 text-[#006A4E]" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl tracking-tight">Contraseña restablecida</CardTitle>
              <CardDescription className="text-sm text-neutral-600">
                Tu contraseña ha sido actualizada exitosamente
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-neutral-600">
              Serás redirigido al inicio de sesión en unos segundos...
            </p>
            <Button onClick={goToLogin} className="w-full bg-[#006A4E] hover:bg-[#005741]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir al inicio de sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#006A4E]/5 rounded-full blur-3xl"></div>
      
      <Card className="w-full max-w-md border-neutral-200 shadow-sm relative z-10 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#006A4E]/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-[#006A4E] p-4 rounded-2xl">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl tracking-tight">Restablecer contraseña</CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Ingresa tu nueva contraseña
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {!token ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-neutral-600">
                No se encontró un token válido. Por favor, utiliza el enlace enviado a tu correo electrónico.
              </p>
              <Button onClick={goToLogin} variant="outline" className="w-full border-neutral-300 hover:bg-neutral-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-neutral-700">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    className="pr-10 border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-neutral-500">Mínimo 8 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-700">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={loading}
                    className="pr-10 border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {password && confirmPassword && (
                <div className="text-sm">
                  {password === confirmPassword ? (
                    <p className="text-[#006A4E] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="text-xs">Las contraseñas coinciden</span>
                    </p>
                  ) : (
                    <p className="text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span className="text-xs">Las contraseñas no coinciden</span>
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-[#006A4E] hover:bg-[#005741] shadow-sm" 
                disabled={loading || !token}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  'Restablecer contraseña'
                )}
              </Button>

              <Button
                type="button"
                onClick={goToLogin}
                variant="outline"
                className="w-full border-neutral-300 hover:bg-neutral-50"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}