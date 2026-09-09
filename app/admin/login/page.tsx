'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Credenciais inválidas.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-6 py-12 relative overflow-hidden bg-areia text-preto">
      {/* Elementos visuais */}
      <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-laranja/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-magenta/15 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-sm flex flex-col items-center pt-6 z-10">
        <div className="relative w-40 h-14">
          <Image
            src="/brand/logo-dark.png?v=2"
            alt="Corte da Rainha"
            fill
            className="object-contain"
            priority
          />
        </div>
        <p className="font-fraunces italic text-cinza text-xs tracking-wider mt-1">
          Painel de Gestão e Entregas
        </p>
      </header>

      {/* Card de Login */}
      <div className="w-full max-w-sm bg-branco/90 backdrop-blur-md rounded-3xl p-8 border border-linha shadow-xl shadow-preto/5 z-10 my-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-preto text-branco mb-3 shadow-md">
            <ShieldCheck className="w-6 h-6 text-magenta" />
          </div>
          <h1 className="font-fraunces italic text-2xl text-preto">
            Acesso da Equipe
          </h1>
          <p className="text-cinza text-xs mt-1">
            Entre com suas credenciais para gerenciar clientes e entregas.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@cortedarainha.com.br"
              autoComplete="email"
              className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-magenta text-xs font-semibold text-center bg-magenta/10 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-preto hover:bg-magenta text-branco font-bold text-sm shadow-md transition-all active:scale-[0.99] disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-branco border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Entrar no Painel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-linha text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-cinza hover:text-preto transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar para a página inicial</span>
          </Link>
        </div>
      </div>

      <footer className="text-center text-xs text-cinza z-10">
        <p>© Corte da Rainha · Sistema Interno</p>
      </footer>
    </div>
  );
}
