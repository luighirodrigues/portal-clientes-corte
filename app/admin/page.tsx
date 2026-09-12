'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Film,
  Eye,
  Plus,
  Copy,
  Check,
  ExternalLink,
  MessageCircle,
  Trash2,
  Lock,
  PlusCircle,
  Calendar,
  Clock,
  Sparkles,
  Pencil,
  X,
  Upload,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { Client, Delivery } from '@/lib/types';

interface ClientWithStats extends Client {
  totalEntregas: number;
  ultimaEntrega: string | null;
  totalAcessos: number;
}

export default function AdminDashboardPage() {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Estados para edição do cliente e PIN
  const [editingClient, setEditingClient] = useState<ClientWithStats | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editPin, setEditPin] = useState('');
  const [editWhatsapp, setEditWhatsapp] = useState('');
  const [editFotoPerfil, setEditFotoPerfil] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEdit = (client: ClientWithStats) => {
    setEditingClient(client);
    setEditNome(client.nome);
    setEditSlug(client.slug);
    setEditPin(client.pin);
    setEditWhatsapp(client.whatsapp || '');
    setEditFotoPerfil(client.fotoPerfil || '');
    setEditPreviewUrl('');
    setEditError(null);
  };

  const handleGenerateRandomPin = () => {
    setEditPin(Math.floor(1000 + Math.random() * 9000).toString());
  };

  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview local instantâneo
    const localUrl = URL.createObjectURL(file);
    setEditPreviewUrl(localUrl);

    setEditUploading(true);
    setEditError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setEditFotoPerfil(data.url);
      } else {
        setEditError(data.error || 'Erro no upload da foto.');
        setEditPreviewUrl('');
      }
    } catch {
      setEditError('Erro ao enviar imagem.');
      setEditPreviewUrl('');
    } finally {
      setEditUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    setEditSaving(true);
    setEditError(null);

    try {
      const res = await fetch('/api/clientes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClient.id,
          nome: editNome,
          slug: editSlug,
          pin: editPin,
          whatsapp: editWhatsapp,
          fotoPerfil: editFotoPerfil,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Erro ao salvar alterações.');
      } else {
        setEditingClient(null);
        fetchData();
      }
    } catch {
      setEditError('Erro de conexão ao salvar.');
    } finally {
      setEditSaving(false);
    }
  };

  const fetchData = async () => {
    try {
      const [resClients, resDeliveries] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/entregas'),
      ]);

      if (resClients.ok && resDeliveries.ok) {
        const c = await resClients.json();
        const d = await resDeliveries.json();
        setClients(c);
        setDeliveries(d);
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyWhatsappMessage = (client: ClientWithStats) => {
    const url = `${window.location.origin}/${client.slug}`;
    const primeiroNome = client.nome.split(' ')[0];
    const text = `Olá, ${primeiroNome}! ✨\n\nSeu conteúdo da Corte da Rainha está pronto, revisado e no ponto de postar! 🎬\n\nAcesse seu portal exclusivo pelo link:\n👉 ${url}\n\nSeu PIN de acesso é: 🔒 ${client.pin}\n\nBrutos e editados na mesma pasta. Baixa, salva e usa!`;

    navigator.clipboard.writeText(text);
    setCopiedMessageId(client.id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleDeleteClient = async (id: string, nome: string) => {
    if (!confirm(`Deseja realmente excluir a cliente "${nome}" e todas as suas entregas?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/clientes?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClients((prev) => prev.filter((c) => c.id !== id));
        setDeliveries((prev) => prev.filter((d) => d.clienteId !== id));
      }
    } catch (err) {
      alert('Erro ao excluir cliente.');
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta entrega?')) {
      return;
    }

    try {
      const res = await fetch(`/api/entregas?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeliveries((prev) => prev.filter((d) => d.id !== id));
        fetchData();
      }
    } catch (err) {
      alert('Erro ao excluir entrega.');
    }
  };

  const totalAcessos = deliveries.reduce((sum, d) => sum + (d.acessosCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-magenta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-fraunces italic text-3xl md:text-4xl text-preto">
            Painel de Gestão
          </h1>
          <p className="text-cinza text-sm mt-1">
            Gerencie suas clientes, gere entregas e acompanhe os acessos aos portais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/clientes/novo"
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-full bg-branco border border-linha hover:bg-areia-2 text-preto text-xs font-bold transition-all shadow-sm"
          >
            <Users className="w-3.5 h-3.5 text-magenta" />
            <span>Novo Cliente</span>
          </Link>

          <Link
            href="/admin/entregas/nova"
            className="flex items-center gap-1.5 py-2.5 px-4 rounded-full bg-grad-brand text-branco text-xs font-bold transition-all shadow-md shadow-magenta/25 hover:opacity-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Lançar Entrega</span>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-branco/90 backdrop-blur-sm rounded-3xl p-6 border border-linha shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cinza">
              Clientes Ativas
            </span>
            <span className="w-8 h-8 rounded-full bg-laranja/10 flex items-center justify-center text-laranja">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="font-outfit font-extrabold text-3xl text-preto mt-3">
            {clients.length}
          </p>
        </div>

        <div className="bg-branco/90 backdrop-blur-sm rounded-3xl p-6 border border-linha shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cinza">
              Entregas Realizadas
            </span>
            <span className="w-8 h-8 rounded-full bg-magenta/10 flex items-center justify-center text-magenta">
              <Film className="w-4 h-4" />
            </span>
          </div>
          <p className="font-outfit font-extrabold text-3xl text-preto mt-3">
            {deliveries.length}
          </p>
        </div>

        <div className="bg-branco/90 backdrop-blur-sm rounded-3xl p-6 border border-linha shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-cinza">
              Visualizações de Portais
            </span>
            <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Eye className="w-4 h-4" />
            </span>
          </div>
          <p className="font-outfit font-extrabold text-3xl text-preto mt-3">
            {totalAcessos}
          </p>
        </div>
      </div>

      {/* Seção de Clientes */}
      <div className="bg-branco/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-linha shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-linha pb-4">
          <div>
            <h2 className="font-fraunces italic text-2xl text-preto">
              Clientes e Portais
            </h2>
            <p className="text-cinza text-xs mt-0.5">
              Cada cliente possui sua URL única e PIN de desbloqueio.
            </p>
          </div>

          <Link
            href="/admin/clientes/novo"
            className="inline-flex items-center gap-1 text-xs font-bold text-magenta hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </Link>
        </div>

        {clients.length === 0 ? (
          <div className="text-center py-12 text-cinza text-sm">
            Nenhuma cliente cadastrada ainda.{' '}
            <Link href="/admin/clientes/novo" className="text-magenta font-bold underline">
              Cadastre a primeira
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-areia/40 hover:bg-areia/60 rounded-2xl p-5 border border-linha transition-all flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-linha bg-areia-2 shrink-0 flex items-center justify-center font-bold text-cinza">
                      <span className="text-sm">{client.nome[0]}</span>
                      {client.fotoPerfil && (
                        <img
                          src={client.fotoPerfil}
                          alt={client.nome}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-preto leading-tight truncate">
                        {client.nome}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-cinza">
                        <span>Link:</span>
                        <code className="text-magenta font-semibold bg-magenta/10 px-1.5 py-0.5 rounded truncate max-w-[140px] sm:max-w-none">
                          /{client.slug}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-branco px-2.5 py-1 rounded-full border border-linha text-preto shadow-2xs">
                      <Lock className="w-3 h-3 text-magenta" />
                      PIN: {client.pin}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-linha/60 text-xs">
                  <button
                    onClick={() => handleCopyLink(client.slug, client.id)}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-branco border border-linha hover:bg-areia-2 text-preto transition-colors"
                    title="Copiar URL direta do portal"
                  >
                    {copiedId === client.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-cinza" />
                        <span>Copiar Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleCopyWhatsappMessage(client)}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-branco font-bold transition-colors shadow-2xs"
                    title="Copiar mensagem pronta para mandar no WhatsApp"
                  >
                    {copiedMessageId === client.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Mensagem Copiada!</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Copiar p/ WhatsApp</span>
                      </>
                    )}
                  </button>

                  <Link
                    href={`/${client.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-branco border border-linha hover:bg-areia-2 text-preto transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-cinza" />
                    <span>Abrir</span>
                  </Link>

                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-branco border border-linha hover:bg-areia-2 text-preto transition-colors font-medium"
                    title="Editar dados e alterar PIN da cliente"
                  >
                    <Pencil className="w-3.5 h-3.5 text-magenta" />
                    <span>Editar / PIN</span>
                  </button>

                  <Link
                    href={`/admin/entregas/nova?clienteId=${client.id}`}
                    className="flex items-center gap-1 py-1.5 px-3 rounded-lg bg-magenta/10 hover:bg-magenta/20 text-magenta font-bold transition-colors ml-auto"
                    title="Criar nova entrega para esta cliente"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ Entrega</span>
                  </Link>

                  <button
                    onClick={() => handleDeleteClient(client.id, client.nome)}
                    className="p-1.5 text-cinza hover:text-red-600 transition-colors"
                    title="Excluir cliente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção de Entregas Cadastradas */}
      <div className="bg-branco/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-linha shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-linha pb-4">
          <div>
            <h2 className="font-fraunces italic text-2xl text-preto">
              Entregas de Conteúdo
            </h2>
            <p className="text-cinza text-xs mt-0.5">
              Lista de captações e pacotes disponibilizados nos portais.
            </p>
          </div>

          <Link
            href="/admin/entregas/nova"
            className="inline-flex items-center gap-1 text-xs font-bold text-magenta hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Entrega</span>
          </Link>
        </div>

        {deliveries.length === 0 ? (
          <div className="text-center py-12 text-cinza text-sm">
            Nenhuma entrega cadastrada ainda.{' '}
            <Link href="/admin/entregas/nova" className="text-magenta font-bold underline">
              Lançar a primeira
            </Link>
            .
          </div>
        ) : (
          <>
            {/* Cards no Mobile (telas pequenas) */}
            <div className="md:hidden space-y-3">
              {deliveries.map((del) => {
                const client = clients.find((c) => c.id === del.clienteId);
                return (
                  <div
                    key={del.id}
                    className="bg-areia/40 rounded-2xl p-4 border border-linha space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-preto truncate">
                          {client ? client.nome : 'Cliente não encontrado'}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-cinza mt-0.5">
                          <Calendar className="w-3 h-3 text-magenta shrink-0" />
                          <span>{del.data}</span>
                          <span>·</span>
                          <Clock className="w-3 h-3 text-cinza shrink-0" />
                          <span>{del.horas}</span>
                        </div>
                      </div>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-branco border border-linha text-preto shrink-0"
                        title="Total de acessos"
                      >
                        <Eye className="w-3 h-3 text-emerald-600" />
                        {del.acessosCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-branco/80 border border-linha/60">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-laranja">{del.videos}</span>
                        <span className="text-cinza">vídeos ·</span>
                        <span className="font-bold text-laranja">{del.fotos}</span>
                        <span className="text-cinza">fotos</span>
                      </div>

                      <a
                        href={del.linkDrive}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-magenta font-bold hover:underline"
                      >
                        <span>Abrir Drive</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="flex justify-end pt-0.5">
                      <button
                        onClick={() => handleDeleteDelivery(del.id)}
                        className="flex items-center gap-1 text-xs text-cinza hover:text-red-600 transition-colors py-1 px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tabela para Tablets e Desktops */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[650px]">
                <thead>
                  <tr className="border-b border-linha text-xs font-semibold uppercase tracking-wider text-cinza">
                    <th className="pb-3">Cliente</th>
                    <th className="pb-3">Captação</th>
                    <th className="pb-3">Vídeos / Fotos</th>
                    <th className="pb-3">Horas</th>
                    <th className="pb-3">Google Drive</th>
                    <th className="pb-3 text-center">Acessos</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-linha/50">
                  {deliveries.map((del) => {
                    const client = clients.find((c) => c.id === del.clienteId);
                    return (
                      <tr key={del.id} className="hover:bg-areia/20 transition-colors">
                        <td className="py-3.5 font-bold text-preto">
                          {client ? client.nome : 'Cliente não encontrado'}
                        </td>
                        <td className="py-3.5 text-cinza flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-magenta" />
                          <span>{del.data}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="font-bold text-laranja">{del.videos}</span> vídeos ·{' '}
                          <span className="font-bold text-laranja">{del.fotos}</span> fotos
                        </td>
                        <td className="py-3.5 text-cinza">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {del.horas}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <a
                            href={del.linkDrive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-magenta hover:underline font-semibold"
                          >
                            <span>Abrir Pasta</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-areia-2 text-preto">
                            {del.acessosCount || 0}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            onClick={() => handleDeleteDelivery(del.id)}
                            className="p-1.5 text-cinza hover:text-red-600 transition-colors"
                            title="Excluir entrega"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Edição de Cliente & Alteração de PIN */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-preto/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-branco rounded-3xl p-6 md:p-8 border border-linha shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-linha mb-6">
              <div>
                <h3 className="font-fraunces italic text-2xl text-preto">
                  Editar Cliente & PIN
                </h3>
                <p className="text-cinza text-xs mt-0.5">
                  Atualize os dados e redefina o PIN de acesso de <b>{editingClient.nome}</b>.
                </p>
              </div>
              <button
                onClick={() => setEditingClient(null)}
                className="p-2 rounded-full hover:bg-areia-2 text-cinza hover:text-preto transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editError && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-magenta/10 text-magenta text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
                  Nome da Cliente
                </label>
                <input
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
                    Link do Portal (/slug)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cinza text-sm font-medium">/</span>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value.toLowerCase())}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
                    PIN de Acesso
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={8}
                      value={editPin}
                      onChange={(e) => setEditPin(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-linha bg-branco text-preto text-sm font-bold text-center tracking-widest focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleGenerateRandomPin}
                      className="p-2.5 rounded-xl border border-linha bg-areia-2 hover:bg-areia text-cinza hover:text-preto transition-colors shrink-0"
                      title="Gerar outro PIN aleatório"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
                  WhatsApp (com DDD)
                </label>
                <input
                  type="text"
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                  placeholder="555391081395"
                  className="w-full px-4 py-2.5 rounded-xl border border-linha bg-branco text-preto text-sm focus:outline-none focus:border-magenta focus:ring-2 focus:ring-magenta/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cinza mb-1.5">
                  Foto de Perfil
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-linha bg-areia-2 shrink-0">
                    {(editPreviewUrl || editFotoPerfil) ? (
                      <img
                        src={editPreviewUrl || editFotoPerfil}
                        alt="Preview"
                        className={`w-full h-full object-cover transition-opacity ${editUploading ? 'opacity-50' : 'opacity-100'}`}
                      />
                    ) : (
                      <span className="text-[10px] text-cinza flex items-center justify-center h-full">Sem foto</span>
                    )}
                    {editUploading && (
                      <div className="absolute inset-0 bg-preto/30 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-branco border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-linha bg-branco hover:bg-areia-2 text-preto text-xs font-bold cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5 text-magenta" />
                      <span>{editUploading ? 'Enviando foto...' : 'Trocar foto'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={handleEditFileUpload}
                        className="hidden"
                        disabled={editUploading}
                      />
                    </label>
                    <input
                      type="text"
                      value={editFotoPerfil}
                      onChange={(e) => {
                        setEditFotoPerfil(e.target.value);
                        setEditPreviewUrl('');
                      }}
                      placeholder="Ou cole a URL direta"
                      className="w-full px-3 py-1.5 rounded-lg border border-linha bg-branco text-preto text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-linha flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="py-2.5 px-4 rounded-full border border-linha text-cinza hover:text-preto text-xs font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editSaving || editUploading}
                  className="py-2.5 px-5 rounded-full bg-grad-brand text-branco text-xs font-bold shadow-md shadow-magenta/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 transition-all"
                >
                  {editSaving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
