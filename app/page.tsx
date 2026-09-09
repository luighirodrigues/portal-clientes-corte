'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Lock, Sparkles } from 'lucide-react';

export default function HomePage() {
  const [slug, setSlug] = useState('');
  const router = useRouter();

  const handleAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (slug.trim()) {
      router.push(`/${slug.trim().toLowerCase()}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between items-center px-6 py-12 relative overflow-hidden bg-areia text-preto">
      {/* Elementos orgânicos de fundo (Blobs da marca) */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-laranja/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-magenta/15 blur-3xl pointer-events-none" />

      {/* Header com Logo */}
      <header className="w-full max-w-md flex flex-col items-center pt-8 z-10">
        <div className="relative w-44 h-16">
          <Image
            src="/brand/logo-dark.png?v=2"
            alt="Corte da Rainha"
            fill
            className="object-contain"
            priority
          />
        </div>
        <p className="font-fraunces italic font-light text-cinza text-sm tracking-wide mt-2">
          Não é sorte. É gestão.
        </p>
      </header>

      {/* Card Central */}
      <div className="w-full max-w-md bg-branco/80 backdrop-blur-md rounded-3xl p-8 border border-linha shadow-xl shadow-preto/5 z-10 my-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-laranja to-magenta text-branco mb-4 shadow-md shadow-magenta/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="font-fraunces italic text-3xl font-normal text-preto">
            Portal da Cliente
          </h1>
          <p className="text-cinza text-sm mt-2 font-outfit">
            Acesse seus vídeos gravados, fotos e conteúdos organizados pela nossa equipe.
          </p>
        </div>

        <form onSubmit={handleAccess} className="space-y-4">
          <div>
            <label
              htmlFor="slug"
              className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2"
            >
              Seu link exclusivo ou usuário
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cinza text-sm font-medium">
                /
              </span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="seunome"
                className="w-full pl-8 pr-4 py-3.5 rounded-2xl border border-linha bg-branco text-preto placeholder-cinza/60 focus:outline-none focus:ring-2 focus:ring-magenta/30 focus:border-magenta text-sm transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-grad-brand text-branco font-bold text-base shadow-lg shadow-magenta/30 hover:opacity-95 active:scale-[0.99] transition-all"
          >
            <span>Acessar meu espaço</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-linha text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs text-cinza hover:text-magenta transition-colors font-medium"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Área da Equipe Corte da Rainha</span>
          </Link>
        </div>
      </div>

      {/* Rodapé */}
      <footer className="text-center text-xs text-cinza z-10 font-outfit">
        <p>© {new Date().getFullYear()} Corte da Rainha · Todos os direitos reservados</p>
      </footer>
    </main>
  );
}
