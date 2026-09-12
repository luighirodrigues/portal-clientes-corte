import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const pathSegments = params.path;
  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse('Arquivo não informado', { status: 404 });
  }

  // Previne Path Traversal
  const safeRelativePath = path.join(...pathSegments);
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  const filePath = path.resolve(uploadsDir, safeRelativePath);

  // Garante que o arquivo solicitado está estritamente dentro da pasta uploads
  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse('Acesso negado', { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse('Imagem não encontrada', { status: 404 });
  }

  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
      return new NextResponse('Caminho inválido', { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Erro ao servir upload:', error);
    return new NextResponse('Erro interno ao ler arquivo', { status: 500 });
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  const pathSegments = params.path;
  if (!pathSegments || pathSegments.length === 0) {
    return new NextResponse(null, { status: 404 });
  }

  const safeRelativePath = path.join(...pathSegments);
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  const filePath = path.resolve(uploadsDir, safeRelativePath);

  if (!filePath.startsWith(uploadsDir)) {
    return new NextResponse(null, { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const stat = await fs.promises.stat(filePath);
    if (!stat.isFile()) {
      return new NextResponse(null, { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
