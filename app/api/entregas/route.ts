import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

/**
 * Validação rigorosa de URL para impedir XSS por pseudo-protocolos como javascript: ou data:
 */
function isValidHttpUrl(str: string): boolean {
  try {
    const parsed = new URL(str);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const clienteId = searchParams.get('clienteId');

  const deliveries = await db.getDeliveries(clienteId || undefined);
  return NextResponse.json(deliveries);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      id,
      clienteId,
      data,
      videos,
      fotos,
      horas,
      fotoCapa,
      linkDrive,
      frase,
      autor,
      status,
    } = body;

    if (!clienteId || !data || !linkDrive) {
      return NextResponse.json(
        { error: 'Cliente, data da captação e link do Drive são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Validação de Link do Google Drive (Apenas URLs HTTP/HTTPS legítimas)
    const cleanLinkDrive = linkDrive.trim();
    if (!isValidHttpUrl(cleanLinkDrive)) {
      return NextResponse.json(
        { error: 'O link do Google Drive deve ser uma URL válida iniciando com https://' },
        { status: 400 }
      );
    }

    // 2. Validação da Foto de Capa (se informada)
    let cleanFotoCapa = fotoCapa?.trim() || '';
    if (cleanFotoCapa && !cleanFotoCapa.startsWith('/') && !isValidHttpUrl(cleanFotoCapa)) {
      return NextResponse.json(
        { error: 'A foto de capa deve ser um arquivo do sistema ou uma URL válida (http/https).' },
        { status: 400 }
      );
    }

    const saved = await db.saveDelivery({
      id,
      clienteId,
      data: data.trim(),
      videos: String(videos || '0'),
      fotos: String(fotos || '0'),
      horas: String(horas || '2h'),
      fotoCapa: cleanFotoCapa,
      linkDrive: cleanLinkDrive,
      frase: frase || 'Criatividade não acaba. Quanto mais você usa, mais você tem.',
      autor: autor || 'Maya Angelou',
      status: status || 'publicado',
    });

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error('Erro ao salvar entrega:', error);
    return NextResponse.json(
      { error: 'Erro ao salvar entrega no banco de dados.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID não informado.' }, { status: 400 });
  }

  await db.deleteDelivery(id);
  return NextResponse.json({ success: true });
}
