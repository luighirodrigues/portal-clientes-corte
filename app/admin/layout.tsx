'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  PlusCircle,
  LogOut,
  ExternalLink,
  LayoutDashboard,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Se for a tela de login, não renderiza a barra de navegação administrativa
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-areia text-preto flex flex-col font-outfit">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-branco/90 backdrop-blur-md border-b border-linha px-6 py-3.5 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
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
              className="inline-flex items-center gap-1.5 text-xs text-magenta hover:bg-magenta/10 font-bold py-1.5 px-3 rounded-xl transition-colors"
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
    </div>
  );
}
