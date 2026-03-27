import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Stethoscope, LogIn, Mail, Lock, AlertCircle, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push('/');
    } catch (err: any) {
      setError('E-mail ou senha incorretos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/');
    } catch (err: any) {
      setError('Falha ao entrar com Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 font-sans">
      {/* Lado Esquerdo - Ilustração/Marketing */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">VetERP<span className="text-blue-200">Pro</span></span>
          </div>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            A gestão completa da sua clínica <br />
            <span className="text-blue-200">em um só lugar.</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-lg">
            Otimize seus atendimentos, controle seu financeiro e fidelize seus clientes com a plataforma mais intuitiva do mercado veterinário.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex gap-8 items-center opacity-80">
            <div className="flex flex-col">
              <span className="text-3xl font-bold">100%</span>
              <span className="text-sm text-blue-100">Seguro</span>
            </div>
            <div className="w-px h-8 bg-blue-400"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">24/7</span>
              <span className="text-sm text-blue-100">Suporte</span>
            </div>
            <div className="w-px h-8 bg-blue-400"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold">Nuvem</span>
              <span className="text-sm text-blue-100">Acesso Remoto</span>
            </div>
          </div>
        </div>

        {/* Elementos Decorativos */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-700 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <div className="md:hidden flex justify-center mb-8">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-slate-900">VetERP<span className="text-blue-600">Pro</span></span>
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Bem-vindo de volta!</h2>
            <p className="text-slate-500 mt-2">Acesse sua conta para gerenciar sua clínica.</p>
          </div>

          <Card className="border-0 shadow-xl shadow-slate-200/60 rounded-2xl overflow-hidden">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl font-bold">Entrar no sistema</CardTitle>
              <CardDescription>Insira suas credenciais abaixo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Senha</Label>
                    <Link href="#" className="text-xs font-bold text-blue-600 hover:underline">
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-blue-500"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Acessar Sistema
                    </div>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-bold tracking-widest">Ou continue com</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full h-11 rounded-xl border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <Chrome className="w-4 h-4 mr-2 text-blue-500" />
                Entrar com Google
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-500">
            Ainda não tem uma conta?{' '}
            <Link href="#" className="font-bold text-blue-600 hover:underline">
              Experimente grátis por 7 dias
            </Link>
          </p>
          
          <div className="pt-8 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              © 2026 VetERP Pro • Todos os direitos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
