'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Upload, Check, AlertCircle } from 'lucide-react';

export default function NovoClientePage() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [slug, setSlug] = useState('');
  const [pin, setPin] = useState(generateRandomPin());
  const [whatsapp, setWhatsapp] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function generateRandomPin() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  const handleNomeChange = (val: string) => {
    setNome(val);
    // Auto-gera o slug caso o usuário ainda não tenha editado manualmente
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
    setSlug(autoSlug);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setFotoPerfil(data.url);
      } else {
        setError(data.error || 'Erro no upload da foto.');
      }
    } catch (err) {
      setError('Erro ao enviar imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          slug,
          pin,
          whatsapp,
          fotoPerfil,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao cadastrar cliente.');
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
            Cadastrar Nova Cliente
          </h1>
          <p className="text-cinza text-xs mt-0.5">
            Crie o portal exclusivo e defina o PIN de acesso da sua cliente.
          </p>
        </div>
      </div>

      <div className="bg-branco/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-linha shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-magenta/10 text-magenta text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
              Nome da Cliente
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => handleNomeChange(e.target.value)}
              placeholder="Ex: Laura Berthuline"
              className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
              required
            />
          </div>

          {/* Slug e PIN lado a lado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
                Link do Portal (URL)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cinza text-sm font-medium">
                  /
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="lauraberthulin"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                  required
                />
              </div>
              <span className="text-[11px] text-cinza mt-1 block">
                Ex: seudominio.com.br/<b>{slug || 'cliente'}</b>
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
                PIN de Acesso (4 dígitos)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm font-bold tracking-wider text-center focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setPin(generateRandomPin())}
                  className="p-3 rounded-2xl border border-linha bg-areia/40 hover:bg-areia text-cinza hover:text-preto transition-colors"
                  title="Gerar outro PIN aleatório"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] text-cinza mt-1 block">
                A cliente usará este PIN para desbloquear o portal.
              </span>
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
              WhatsApp da Cliente (com DDD)
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="Ex: 555391081395"
              className="w-full px-4 py-3 rounded-2xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
            />
          </div>

          {/* Foto de Perfil */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-2">
              Foto de Perfil ou Capa da Cliente
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-linha bg-areia-2 flex items-center justify-center shrink-0">
                {fotoPerfil ? (
                  <img
                    src={fotoPerfil}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-cinza font-medium">Sem foto</span>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <label className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl border border-linha bg-branco hover:bg-areia-2 text-preto text-xs font-bold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-magenta" />
                  <span>{uploading ? 'Enviando...' : 'Fazer upload de foto'}</span>
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
                  value={fotoPerfil}
                  onChange={(e) => setFotoPerfil(e.target.value)}
                  placeholder="Ou cole a URL direta da imagem aqui"
                  className="w-full px-3 py-2 rounded-xl border border-linha bg-branco text-preto text-xs"
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
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
              {loading ? 'Salvando...' : 'Salvar e Criar Portal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
