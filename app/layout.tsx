import type { Metadata } from 'next';
import { Outfit, Fraunces } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['400', '500', '700', '800'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  style: ['italic', 'normal'],
  weight: ['300', '400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Corte da Rainha — Portal de Conteúdos',
  description: 'Seu conteúdo está pronto. Organizado, revisado e no ponto de postar.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="grain-overlay antialiased selection:bg-magenta selection:text-white">
        {children}
      </body>
    </html>
  );
}
