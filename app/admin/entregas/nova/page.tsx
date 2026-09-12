'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Upload, AlertCircle } from 'lucide-react';
import { Client } from '@/lib/types';

const SUGGESTED_QUOTES = [
  {
    frase: 'Criatividade não acaba. Quanto mais você usa, mais você tem.',
    autor: 'Maya Angelou',
  },
  {
    frase: 'O segredo de progredir é começar.',
    autor: 'Mark Twain',
  },
  {
    frase: 'Não é sobre ter ideias, é sobre fazer as ideias acontecerem.',
    autor: 'Scott Belsky',
  },
  {
    frase: 'Simplicidade é a sofisticação máxima.',
    autor: 'Leonardo da Vinci',
  },
  {
    frase: 'A consistência é a chave que transforma esforço em legado.',
    autor: 'Corte da Rainha',
  },
];

function NovaEntregaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedClienteId = searchParams.get('clienteId') || '';

  const [clients, setClients] = useState<Client[]>([]);
  const [clienteId, setClienteId] = useState(preSelectedClienteId);
  const [data, setData] = useState('');
  const [videos, setVideos] = useState('12');
  const [fotos, setFotos] = useState('60');
  const [horas, setHoras] = useState('2h');
  const [linkDrive, setLinkDrive] = useState('');
  const [fotoCapa, setFotoCapa] = useState('');
  const [previewCapaUrl, setPreviewCapaUrl] = useState('');
  const [frase, setFrase] = useState(SUGGESTED_QUOTES[0].frase);
  const [autor, setAutor] = useState(SUGGESTED_QUOTES[0].autor);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/clientes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClients(data);
          if (!clienteId && data.length > 0) {
            setClienteId(preSelectedClienteId || data[0].id);
          }
        }
      })
      .catch((err) => console.error('Erro ao buscar clientes:', err));
  }, [preSelectedClienteId]);

  const handleSuggestQuote = () => {
    const random = SUGGESTED_QUOTES[Math.floor(Math.random() * SUGGESTED_QUOTES.length)];
    setFrase(random.frase);
    setAutor(random.autor);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local instantâneo
    const localUrl = URL.createObjectURL(file);
    setPreviewCapaUrl(localUrl);

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const resData = await res.json();
      if (res.ok) {
        setFotoCapa(resData.url);
      } else {
        setError(resData.error || 'Erro no upload da foto.');
        setPreviewCapaUrl('');
      }
    } catch (err) {
      setError('Erro ao enviar imagem.');
      setPreviewCapaUrl('');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/entregas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId,
          data,
          videos,
          fotos,
          horas,
          linkDrive,
          fotoCapa,
          frase,
          autor,
          status: 'publicado',
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        setError(resData.error || 'Erro ao criar entrega.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-branco/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-linha shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-magenta/10 text-magenta text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
            Selecione a Cliente
          </label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm font-medium focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} (/{c.slug})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
            Data da Captação
          </label>
          <input
            type="text"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Ex: 06 de Setembro ou Setembro/2026"
            className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
              Vídeos
            </label>
            <input
              type="number"
              value={videos}
              onChange={(e) => setVideos(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl border border-linha bg-branco text-preto text-center text-sm font-bold focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
              Fotos
            </label>
            <input
              type="number"
              value={fotos}
              onChange={(e) => setFotos(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl border border-linha bg-branco text-preto text-center text-sm font-bold focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
              Horas
            </label>
            <input
              type="text"
              value={horas}
              onChange={(e) => setHoras(e.target.value)}
              placeholder="2h"
              className="w-full px-3 py-3 rounded-2xl border border-linha bg-branco text-preto text-center text-sm font-bold focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
            Link da Pasta do Google Drive (Brutos e Editados)
          </label>
          <input
            type="url"
            value={linkDrive}
            onChange={(e) => setLinkDrive(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
            Foto de Capa do Portal (Topo)
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-linha bg-areia-2 flex items-center justify-center shrink-0">
              {(previewCapaUrl || fotoCapa) ? (
                <img
                  src={previewCapaUrl || fotoCapa}
                  alt="Preview"
                  className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-50' : 'opacity-100'}`}
                />
              ) : (
                <span className="text-xs text-cinza font-medium">Padrão</span>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-preto/30 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-branco border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl border border-linha bg-branco hover:bg-areia-2 text-preto text-xs font-bold cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-magenta" />
                <span>{uploading ? 'Enviando foto...' : 'Fazer upload de foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              <input
                type="text"
                value={fotoCapa}
                onChange={(e) => {
                  setFotoCapa(e.target.value);
                  setPreviewCapaUrl('');
                }}
                placeholder="Ou cole a URL direta da foto aqui"
                className="w-full px-3 py-2 rounded-xl border border-linha bg-branco text-preto text-xs"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-linha">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-cinza">
              Frase Inspiracional ("Pra levar junto")
            </label>
            <button
              type="button"
              onClick={handleSuggestQuote}
              className="inline-flex items-center gap-1 text-xs font-bold text-magenta hover:underline"
            >
              <Sparkles className="w-3 h-3" />
              <span>Sugerir outra frase</span>
            </button>
          </div>

          <textarea
            rows={2}
            value={frase}
            onChange={(e) => setFrase(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all font-fraunces italic"
          />

          <input
            type="text"
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            placeholder="Autor da frase"
            className="w-full px-4 py-2.5 rounded-xl border border-linha bg-branco text-preto text-xs focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
          />
        </div>

        <div className="pt-4 border-t border-linha flex items-center justify-end gap-3">
          <Link
            href="/admin"
            className="py-3 px-5 rounded-full border border-linha text-cinza hover:text-preto text-xs font-bold transition-colors"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={loading || uploading}
            className="py-3 px-6 rounded-full bg-grad-brand text-branco text-xs font-bold shadow-md shadow-magenta/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all"
          >
            {loading ? 'Publicando...' : 'Publicar Entrega'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NovaEntregaPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="p-2 rounded-full bg-branco border border-linha hover:bg-areia-2 transition-colors text-cinza hover:text-preto"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-fraunces italic text-3xl text-preto">
            Lançar Nova Entrega
          </h1>
          <p className="text-cinza text-xs mt-0.5">
            Preencha os dados da captação e o link do Google Drive para o portal da cliente.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="p-8 text-center text-cinza">Carregando formulário...</div>}>
        <NovaEntregaForm />
      </Suspense>
    </div>
  );
}
