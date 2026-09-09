import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { isClientAuthenticated } from '@/lib/auth';
import ClientPortalWrapper from './ClientPortalWrapper';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps) {
  const client = await db.getClientBySlug(params.slug);
  if (!client) {
    return {
      title: 'Portal não encontrado — Corte da Rainha',
    };
  }
  return {
    title: `Seu conteúdo está pronto, ${client.nome.split(' ')[0]} — Corte da Rainha`,
    description: 'Seu conteúdo tá pronto. Organizado, revisado e no ponto de postar.',
  };
}

export default async function ClientPage({ params }: PageProps) {
  const client = await db.getClientBySlug(params.slug);

  if (!client) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-areia text-preto">
        <div className="max-w-md bg-branco/90 backdrop-blur-md rounded-3xl p-8 border border-linha shadow-sm">
          <div className="relative w-36 h-14 mx-auto mb-4">
            <Image
              src="/brand/logo.png"
              alt="Corte da Rainha"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="font-fraunces italic text-2xl mb-2">Portal não encontrado</h1>
          <p className="text-cinza text-sm mb-6 leading-relaxed">
            Não encontramos um portal ativo para o endereço <b className="text-preto">/{params.slug}</b>. Verifique o link enviado pela equipe da Corte da Rainha.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-preto text-branco text-xs font-bold hover:bg-magenta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao início</span>
          </Link>
        </div>
      </div>
    );
  }

  const authenticated = isClientAuthenticated(client.slug);
  const deliveries = client.deliveries;

  return (
    <ClientPortalWrapper
      client={client as any}
      deliveries={deliveries as any}
      initiallyAuthenticated={authenticated}
    />
  );
}
