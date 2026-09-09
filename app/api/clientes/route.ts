import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';

const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'brand',
  'uploads',
  '_next',
  'favicon.ico',
  'public',
  'login',
  'logout',
  'dashboard',
]);

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const clients = await db.getClients();
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { nome, slug, pin, whatsapp, fotoPerfil } = body;

    if (!nome || !slug || !pin) {
      return NextResponse.json(
        { error: 'Nome, URL (slug) e PIN são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_.]/g, '-');

    // 1. Validação de Slugs Reservados do Sistema
    if (RESERVED_SLUGS.has(cleanSlug)) {
      return NextResponse.json(
        { error: `O link "/${cleanSlug}" é um endereço reservado do sistema e não pode ser usado para clientes.` },
        { status: 400 }
      );
    }

    // 2. Validação de formato do PIN (numérico)
    if (!/^\d{4,8}$/.test(pin.trim())) {
      return NextResponse.json(
        { error: 'O PIN deve conter entre 4 e 8 dígitos numéricos.' },
        { status: 400 }
      );
    }

    const existing = await db.getClientBySlug(cleanSlug);
    if (existing) {
      return NextResponse.json(
        { error: `O link /${cleanSlug} já está em uso por outro cliente.` },
        { status: 409 }
      );
    }

    // 3. Validação de Foto de Perfil (se URL)
    let safeFotoPerfil = fotoPerfil?.trim() || '';
    if (safeFotoPerfil && !safeFotoPerfil.startsWith('/') && !/^https?:\/\//i.test(safeFotoPerfil)) {
      safeFotoPerfil = '';
    }

    const newClient = await db.saveClient({
      nome: nome.trim(),
      slug: cleanSlug,
      pin: pin.trim(),
      whatsapp: whatsapp?.trim() || '',
      fotoPerfil: safeFotoPerfil,
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao cadastrar cliente no banco de dados.' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, nome, slug, pin, whatsapp, fotoPerfil } = body;

    if (!id || !nome || !slug || !pin) {
      return NextResponse.json(
        { error: 'ID, Nome, URL (slug) e PIN são obrigatórios.' },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_.]/g, '-');

    if (RESERVED_SLUGS.has(cleanSlug)) {
      return NextResponse.json(
        { error: `O link "/${cleanSlug}" é um endereço reservado do sistema.` },
        { status: 400 }
      );
    }

    if (!/^\d{4,8}$/.test(pin.trim())) {
      return NextResponse.json(
        { error: 'O PIN deve conter entre 4 e 8 dígitos numéricos.' },
        { status: 400 }
      );
    }

    // Verifica se o slug já é usado por outro cliente diferente deste
    const existing = await db.getClientBySlug(cleanSlug);
    if (existing && existing.id !== id) {
      return NextResponse.json(
        { error: `O link /${cleanSlug} já está em uso por outro cliente.` },
        { status: 409 }
      );
    }

    let safeFotoPerfil = fotoPerfil?.trim() || '';
    if (safeFotoPerfil && !safeFotoPerfil.startsWith('/') && !/^https?:\/\//i.test(safeFotoPerfil)) {
      safeFotoPerfil = '';
    }

    const updatedClient = await db.saveClient({
      id,
      nome: nome.trim(),
      slug: cleanSlug,
      pin: pin.trim(),
      whatsapp: whatsapp?.trim() || '',
      fotoPerfil: safeFotoPerfil,
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar dados do cliente.' },
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
    return NextResponse.json({ error: 'ID do cliente não informado.' }, { status: 400 });
  }

  await db.deleteClient(id);
  return NextResponse.json({ success: true });
}
