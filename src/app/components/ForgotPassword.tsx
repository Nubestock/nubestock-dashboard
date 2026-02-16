import React ,{ useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '../config/api';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingrese su correo electrónico');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Por favor ingrese un correo electrónico válido');
      return;
    }

    setLoading(true);

    try {
      console.log('Solicitando restablecimiento de contraseña para:', email);
      
      const response = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      console.log('Respuesta del servidor:', response);

      // Siempre mostrar éxito por seguridad (no revelar si el email existe o no)
      setSuccess(true);
      toast.success('Solicitud enviada exitosamente');
    } catch (err) {
      console.error('Error al solicitar restablecimiento:', err);
      
      // Por seguridad, siempre mostrar éxito incluso si hay error
      // Esto evita que atacantes puedan verificar qué emails existen en el sistema
      setSuccess(true);
      toast.success('Si el correo existe, recibirás instrucciones para restablecer tu contraseña');
    } finally {
      setLoading(false);
    }
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
              <CardTitle className="text-xl tracking-tight">Solicitud enviada</CardTitle>
              <CardDescription className="text-sm text-neutral-600">
                Revisa tu correo electrónico
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-[#006A4E]/20 bg-[#006A4E]/5">
              <Mail className="h-4 w-4 text-[#006A4E]" />
              <AlertDescription className="text-sm text-neutral-700">
                Si el correo <span className="font-medium text-neutral-900">{email}</span> está registrado, 
                recibirás un enlace para restablecer tu contraseña.
              </AlertDescription>
            </Alert>

            <div className="space-y-1.5 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-md border border-neutral-200">
              <p>• Revisa tu bandeja de entrada</p>
              <p>• Revisa tu carpeta de spam</p>
              <p>• El enlace expirará en 1 hora</p>
            </div>

            <Button onClick={onBackToLogin} variant="outline" className="w-full border-neutral-300 hover:bg-neutral-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
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
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-xl tracking-tight">¿Olvidaste tu contraseña?</CardTitle>
            <CardDescription className="text-sm text-neutral-600">
              Ingresa tu correo para recibir un enlace de restablecimiento
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-700">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
                className="border-neutral-200 focus:border-[#006A4E] focus:ring-[#006A4E]/20"
              />
            </div>

            <Alert className="border-neutral-200 bg-neutral-50">
              <AlertCircle className="h-4 w-4 text-neutral-600" />
              <AlertDescription className="text-xs text-neutral-600">
                Enviaremos instrucciones a tu correo. El enlace será válido por 1 hora.
              </AlertDescription>
            </Alert>

            <Button 
              type="submit" 
              className="w-full bg-[#006A4E] hover:bg-[#005741] shadow-sm" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar enlace
                </>
              )}
            </Button>

            <Button
              type="button"
              onClick={onBackToLogin}
              variant="outline"
              className="w-full border-neutral-300 hover:bg-neutral-50"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}