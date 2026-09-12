'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Client, Delivery } from '@/lib/types';
import { ArrowRight, Calendar, ExternalLink, Sparkles } from 'lucide-react';

interface ClientDeliveryViewProps {
  client: Client;
  deliveries: Delivery[];
}

export default function ClientDeliveryView({ client, deliveries }: ClientDeliveryViewProps) {
  const [selectedDeliveryIndex, setSelectedDeliveryIndex] = useState(0);

  const delivery = deliveries[selectedDeliveryIndex] || deliveries[0];

  const defaultPhoto = '/uploads/laura.jpg';
  const rawFoto = (delivery?.fotoCapa && delivery.fotoCapa.trim()) || (client.fotoPerfil && client.fotoPerfil.trim()) || defaultPhoto;
  const [fotoSrc, setFotoSrc] = useState(rawFoto);

  useEffect(() => {
    const updated = (delivery?.fotoCapa && delivery.fotoCapa.trim()) || (client.fotoPerfil && client.fotoPerfil.trim()) || defaultPhoto;
    setFotoSrc(updated);
  }, [delivery?.fotoCapa, client.fotoPerfil]);

  // Caso ainda não haja entregas publicadas
  if (!delivery) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-areia text-preto">
        <div className="max-w-md bg-branco rounded-3xl p-8 border border-linha shadow-sm">
          <Sparkles className="w-10 h-10 text-magenta mx-auto mb-4" />
          <h1 className="font-fraunces italic text-2xl">Olá, {client.nome}</h1>
          <p className="text-cinza text-sm mt-2">
            Nossa equipe ainda está preparando sua primeira entrega de conteúdo. Em breve você receberá a notificação!
          </p>
        </div>
      </div>
    );
  }

  const primeiroNome = client.nome.split(' ')[0];
  const tickerItem = `✦ captação de ${delivery.data} ✦ ${delivery.videos} vídeos ✦ ${delivery.fotos} fotos ✦ não é sorte, é gestão `;

  return (
    <div className="relative min-h-screen bg-areia text-preto overflow-x-hidden font-outfit selection:bg-magenta selection:text-white">
      {/* Manchas orgânicas da identidade visual da Corte da Rainha */}
      <svg
        className="absolute pointer-events-none z-0 fill-laranja opacity-85 -right-20 top-[50vh] w-56 h-56"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <path d="M52 18c34-22 88-14 112 22 24 36 8 82-26 108-34 26-90 34-118 4S18 40 52 18z" />
      </svg>
      <svg
        className="absolute pointer-events-none z-0 fill-laranja opacity-85 -left-28 top-[115vh] w-64 h-64"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <path d="M30 60c18-40 72-56 112-40 40 16 56 66 36 104-20 38-78 48-118 26C20 128 12 100 30 60z" />
      </svg>
      <svg
        className="absolute pointer-events-none z-0 fill-laranja opacity-85 -right-14 bottom-28 w-36 h-36"
        viewBox="0 0 200 200"
        aria-hidden="true"
      >
        <path d="M60 30c40-24 96-6 112 34 16 40-14 90-54 104-40 14-92-10-104-50C2 78 20 54 60 30z" />
      </svg>

      {/* Seletor de Entregas (caso a cliente tenha mais de uma) */}
      {deliveries.length > 1 && (
        <div className="relative z-20 bg-branco/90 backdrop-blur-md border-b border-linha py-2.5 px-4 text-center">
          <div className="max-w-md mx-auto flex items-center justify-center gap-2 text-xs font-semibold">
            <span className="text-cinza flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-magenta" /> Entregas:
            </span>
            <div className="flex gap-1 overflow-x-auto py-1 scrollbar-none">
              {deliveries.map((del, idx) => (
                <button
                  key={del.id}
                  onClick={() => setSelectedDeliveryIndex(idx)}
                  className={`px-3 py-1 rounded-full text-xs transition-all whitespace-nowrap ${
                    selectedDeliveryIndex === idx
                      ? 'bg-magenta text-branco shadow-sm'
                      : 'bg-areia-2 text-preto hover:bg-areia'
                  }`}
                >
                  {del.data}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero com Foto e Logo */}
      <header className="relative w-full h-[62vh] min-h-[390px] max-w-[720px] mx-auto z-10">
        <div className="absolute inset-0 overflow-hidden md:rounded-b-[28px]">
          <img
            src={fotoSrc}
            alt={`Foto de ${client.nome}`}
            onError={() => {
              if (fotoSrc !== defaultPhoto) {
                setFotoSrc(defaultPhoto);
              }
            }}
            className="w-full h-full object-cover object-center anim-revelar"
          />
          {/* Degradê sobre a imagem */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-areia/40 to-areia" />
        </div>

        {/* Logo superior */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-32 h-14 z-20">
          <Image
            src="/brand/logo-dark.png?v=2"
            alt="Corte da Rainha"
            fill
            className="object-contain drop-shadow-[0_2px_10px_rgba(251,246,241,0.85)]"
            priority
          />
        </div>

        {/* Selo circular giratório da Corte da Rainha */}
        <div className="absolute left-4 -bottom-8 w-28 h-28 z-30 drop-shadow-lg" aria-hidden="true">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <linearGradient id="gradSelo" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F0642C" />
                <stop offset="100%" stopColor="#E3195A" />
              </linearGradient>
              <path id="circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
            </defs>
            <circle cx="60" cy="60" r="58" fill="url(#gradSelo)" />
            <g className="anim-girar">
              <text fill="#FBF6F1" fontSize="11.5" fontWeight="700" letterSpacing="0.14em">
                <textPath href="#circ">CONTEÚDO PRONTO · CORTE DA RAINHA · </textPath>
              </text>
            </g>
            <text
              x="60"
              y="70"
              textAnchor="middle"
              fill="#FBF6F1"
              fontFamily="var(--font-fraunces), serif"
              fontStyle="italic"
              fontWeight="300"
              fontSize="30"
            >
              ok
            </text>
          </svg>
        </div>
      </header>

      {/* Saudação */}
      <section className="relative z-10 mt-12 px-6 max-w-[420px] md:max-w-[720px] mx-auto text-center">
        <h1 className="font-fraunces italic font-light text-4xl md:text-5xl tracking-tight leading-tight">
          Olá,{' '}
          <em className="not-italic font-outfit font-extrabold inline-block ml-1 px-3 py-1 bg-magenta text-branco -rotate-1 shadow-md shadow-magenta/20">
            {primeiroNome}
          </em>
        </h1>
        <p className="mt-4 text-base md:text-lg font-medium text-preto max-w-[32ch] mx-auto leading-relaxed">
          Seu conteúdo tá pronto. Organizado, revisado e no ponto de postar.
        </p>
      </section>

      {/* Botão de Ação CTA para o Google Drive */}
      <div className="mt-7 px-6 max-w-[420px] md:max-w-[720px] mx-auto text-center relative z-10">
        <a
          href={delivery.linkDrive}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between bg-grad-brand text-branco font-bold text-lg py-4 px-6 rounded-full shadow-xl shadow-magenta/35 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-magenta/50 active:scale-[0.99] transition-all"
        >
          <span className="font-outfit font-bold">Acessar meus conteúdos</span>
          <span className="w-10 h-10 rounded-full bg-branco flex items-center justify-center text-magenta transition-transform group-hover:translate-x-1 shadow-sm">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </span>
        </a>
        <p className="mt-3 text-cinza text-xs md:text-sm font-medium">
          <b className="text-magenta">»</b> Brutos e editados na mesma pasta. Baixa, salva e usa.
        </p>
      </div>

      {/* Faixa Rolante Animada */}
      <div className="mt-9 border-y border-linha py-2.5 overflow-hidden whitespace-nowrap relative z-10 select-none">
        <div className="anim-rolar">
          <span className="font-fraunces italic font-light text-base md:text-lg px-4">
            {tickerItem}
          </span>
          <span className="font-fraunces italic font-light text-base md:text-lg px-4">
            {tickerItem}
          </span>
        </div>
      </div>

      {/* Bloco de Números */}
      <main className="max-w-[420px] md:max-w-[720px] mx-auto px-6 relative z-10">
        <section className="mt-9">
          <div className="flex items-baseline justify-center gap-3 py-3 border-y border-linha">
            <strong className="font-outfit font-extrabold text-5xl md:text-6xl text-laranja tracking-tight">
              {delivery.videos}
            </strong>
            <span className="text-sm md:text-base font-medium text-preto">vídeos gravados</span>
          </div>

          <div className="flex items-baseline justify-center gap-3 py-3 border-b border-linha">
            <strong className="font-outfit font-extrabold text-5xl md:text-6xl text-laranja tracking-tight">
              {delivery.fotos}
            </strong>
            <span className="text-sm md:text-base font-medium text-preto">fotos feitas</span>
          </div>

          <div className="flex items-baseline justify-center gap-3 py-3 border-b border-linha">
            <strong className="font-outfit font-extrabold text-5xl md:text-6xl text-laranja tracking-tight">
              {delivery.horas}
            </strong>
            <span className="text-sm md:text-base font-medium text-preto">de gravação</span>
          </div>
        </section>

        {/* Frase Inspiracional */}
        {delivery.frase && (
          <section className="mt-10 text-center pt-6 border-t-4 border-magenta max-w-[34ch] mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cinza mb-2.5">
              Pra levar junto
            </h2>
            <p className="font-fraunces italic font-light text-xl md:text-2xl leading-relaxed text-preto">
              “{delivery.frase}”
            </p>
            {delivery.autor && (
              <cite className="block mt-3 not-italic text-sm font-bold text-magenta">
                — {delivery.autor}
              </cite>
            )}
          </section>
        )}
      </main>

      {/* Rodapé Degradê */}
      <footer className="mt-14 bg-grad-brand text-branco py-10 px-6 relative z-10 text-center">
        <div className="max-w-[420px] md:max-w-[720px] mx-auto">
          <div className="relative w-36 h-14 mx-auto mb-2">
            <Image
              src="/brand/logo.png"
              alt="Corte da Rainha"
              fill
              className="object-contain brightness-0 invert"
            />
          </div>
          <p className="font-fraunces italic font-light text-base md:text-lg">
            Não é sorte. É gestão.
          </p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <a
              href={delivery.instagram || 'https://instagram.com/cortedarainha'}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-branco/70 hover:bg-branco hover:text-magenta text-branco text-xs font-bold py-2 px-5 rounded-full transition-colors"
            >
              Instagram
            </a>
            <a
              href={delivery.whatsapp || 'https://wa.me/555391081395'}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-branco/70 hover:bg-branco hover:text-magenta text-branco text-xs font-bold py-2 px-5 rounded-full transition-colors"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
