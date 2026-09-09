'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Lock, ArrowRight, MessageCircle, AlertCircle } from 'lucide-react';
import { Client } from '@/lib/types';

interface ClientLockScreenProps {
  client: Client;
  onUnlocked: () => void;
}

export default function ClientLockScreen({ client, onUnlocked }: ClientLockScreenProps) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focar no primeiro dígito ao abrir
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Aceitar apenas números
    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...digits];

    if (cleanVal.length > 1) {
      // Se colou múltiplos números
      const splitDigits = cleanVal.slice(0, 4).split('');
      splitDigits.forEach((d, i) => {
        if (i < 4) newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextIdx = Math.min(splitDigits.length, 3);
      inputsRef.current[nextIdx]?.focus();
      if (splitDigits.length === 4) {
        verifyPin(newDigits.join(''));
      }
      return;
    }

    newDigits[index] = cleanVal;
    setDigits(newDigits);
    setError(null);

    // Auto-avanço para o próximo input
    if (cleanVal && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    // Se preencheu os 4 dígitos, valida automaticamente
    if (cleanVal && index === 3 && newDigits.every((d) => d !== '')) {
      verifyPin(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const verifyPin = async (pinCode: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: client.slug,
          pin: pinCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'PIN incorreto. Tente novamente.');
        setDigits(['', '', '', '']);
        inputsRef.current[0]?.focus();
      } else {
        onUnlocked();
      }
    } catch (err) {
      setError('Erro de conexão ao verificar o PIN.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pinCode = digits.join('');
    if (pinCode.length === 4) {
      verifyPin(pinCode);
    }
  };

  // Primeiro nome para a saudação
  const primeiroNome = client.nome.split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col justify-between items-center px-6 py-12 relative overflow-hidden bg-areia text-preto select-none">
      {/* Blobs orgânicos da identidade da marca */}
      <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-laranja/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-20 w-80 h-80 rounded-full bg-magenta/15 blur-3xl pointer-events-none" />

      {/* Header com Logo */}
      <header className="w-full max-w-sm flex flex-col items-center pt-4 z-10">
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
          Não é sorte. É gestão.
        </p>
      </header>

      {/* Card de Desbloqueio */}
      <div className="w-full max-w-sm bg-branco/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-linha shadow-xl shadow-preto/5 z-10 my-auto text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-laranja to-magenta text-branco mb-4 shadow-lg shadow-magenta/25">
          <Lock className="w-6 h-6" />
        </div>

        <h1 className="font-fraunces italic text-3xl font-light text-preto">
          Olá, <em className="not-italic font-outfit font-extrabold text-magenta">{primeiroNome}</em>
        </h1>
        <p className="text-cinza text-sm mt-3 font-outfit leading-relaxed">
          Seu conteúdo está pronto. Digite seu PIN de acesso para liberar sua entrega.
        </p>

        {/* Inputs de PIN */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex justify-center gap-2.5 sm:gap-3 mb-6">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border-2 bg-branco text-preto transition-all outline-none ${
                  error
                    ? 'border-magenta text-magenta animate-shake'
                    : digit
                    ? 'border-magenta ring-2 ring-magenta/20 shadow-sm'
                    : 'border-linha focus:border-magenta focus:ring-2 focus:ring-magenta/20'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-magenta text-xs font-semibold mb-4 bg-magenta/10 py-2.5 px-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || digits.some((d) => d === '')}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-grad-brand text-branco font-bold text-base shadow-lg shadow-magenta/30 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-branco border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Desbloquear conteúdo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Ajuda / Esqueci o PIN */}
        <div className="mt-6 pt-5 border-t border-linha">
          <a
            href="https://wa.me/555391081395?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20o%20PIN%20do%20meu%20portal%20na%20Corte%20da%20Rainha"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-cinza hover:text-magenta transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Não sabe ou esqueceu o PIN? Fale conosco</span>
          </a>
        </div>
      </div>

      {/* Rodapé institucional */}
      <footer className="text-center text-xs text-cinza z-10">
        <p>© Corte da Rainha · Conteúdos Audiovisuais</p>
      </footer>
    </div>
  );
}
