'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  PlusCircle,
  LogOut,
  ExternalLink,
  LayoutDashboard,
  Key,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Estados para modal de alteração de senha
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Se for a tela de login, não renderiza a barra de navegação administrativa
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('A confirmação da nova senha não confere.');
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || 'Erro ao alterar a senha.');
      } else {
        setPasswordSuccess('Senha alterada com sucesso!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess(null);
        }, 2000);
      }
    } catch {
      setPasswordError('Erro de conexão ao alterar a senha.');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-areia text-preto flex flex-col font-outfit">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-branco/90 backdrop-blur-md border-b border-linha px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="relative w-32 h-10">
                <Image
                  src="/brand/logo-dark.png?v=2"
                  alt="Corte da Rainha"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-magenta/10 text-magenta uppercase tracking-wider">
                Painel
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin'
                    ? 'bg-preto text-branco font-semibold'
                    : 'text-cinza hover:text-preto hover:bg-areia-2'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/admin/clientes/novo"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/clientes/novo'
                    ? 'bg-preto text-branco font-semibold'
                    : 'text-cinza hover:text-preto hover:bg-areia-2'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Novo Cliente</span>
              </Link>

              <Link
                href="/admin/entregas/nova"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors ${
                  pathname === '/admin/entregas/nova'
                    ? 'bg-preto text-branco font-semibold'
                    : 'text-cinza hover:text-preto hover:bg-areia-2'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Nova Entrega</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowPasswordModal(true);
                setPasswordError(null);
                setPasswordSuccess(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-cinza hover:text-preto py-1.5 px-2.5 sm:px-3 rounded-lg border border-linha bg-branco hover:bg-areia-2 transition-colors font-medium"
              title="Alterar senha do administrador"
            >
              <Key className="w-3.5 h-3.5 text-laranja" />
              <span className="hidden sm:inline">Alterar Senha</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-cinza hover:text-preto py-1.5 px-3 rounded-lg border border-linha transition-colors"
            >
              <span>Ver Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 text-xs text-magenta hover:bg-magenta/10 font-bold py-1.5 px-2.5 sm:px-3 rounded-xl transition-colors"
              title="Sair do painel"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Modal de Alteração de Senha */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-preto/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-branco rounded-3xl p-6 sm:p-8 border border-linha shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-linha mb-5">
              <div>
                <h3 className="font-fraunces italic text-2xl text-preto">
                  Alterar Senha de Acesso
                </h3>
                <p className="text-cinza text-xs mt-0.5">
                  Atualize a senha da equipe da Corte da Rainha.
                </p>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 rounded-full hover:bg-areia-2 text-cinza hover:text-preto transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-magenta/10 text-magenta text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-500/10 text-emerald-700 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full px-4 py-2.5 rounded-xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
                  Nova Senha (mínimo 6 caracteres)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha forte"
                  className="w-full px-4 py-2.5 rounded-xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-4 py-2.5 rounded-xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                  required
                />
              </div>

              <div className="pt-4 border-t border-linha flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="py-2.5 px-4 rounded-full border border-linha text-cinza hover:text-preto text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="py-2.5 px-5 rounded-full bg-grad-brand text-branco text-xs font-bold shadow-md shadow-magenta/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all"
                >
                  {savingPassword ? 'Salvando...' : 'Salvar Nova Senha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
