import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth(res.data.access_token, res.data.usuario);
      navigate('/');
    } catch {
      setError('Correo o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div
  className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat"
  style={{ backgroundImage: "url('/fondo-login.jpg')" }}
  >
      {/* Fondo decorativo */}
        {/* Capa oscura sobre la imagen */}
        <div className="absolute inset-0 bg-black/50" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/15 backdrop-blur-xl rounded-2xl shadow-2xl p-10 border border-white/30">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Comunidad Campesina de Marco</h1>
          <p className="text-slate-400 text-base mt-2">Ingresa tus datos para acceder al sistema</p>

        </div>

        {/* Formulario */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-400 text-sm font-medium">
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-400 text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="h-11 border-slate-200 bg-slate-50 focus:bg-white transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <Button
            className="w-full h-11 bg-slate-900 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors mt-2"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </Button>
        </div>
      </div>
    </div>
  );
}