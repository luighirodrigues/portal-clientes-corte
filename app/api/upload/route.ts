import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
]);

/**
 * Validação de Magic Bytes para garantir que o arquivo é realmente uma imagem
 * e não um script executável renomeado com extensão .jpg.
 */
function isValidImageHeader(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return true;

  // PNG: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return true;

  // WEBP: 'RIFF' .... 'WEBP'
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  )
    return true;

  // AVIF: .... 'ftyp'
  if (buffer.length >= 12 && buffer.toString('ascii', 4, 8) === 'ftyp') {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    // 1. Validação de Tamanho Máximo (Prevenção de DoS por esgotamento de disco)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Arquivo excede o limite máximo permitido de 10 MB.' },
        { status: 413 }
      );
    }

    // 2. Validação de Extensão (Whitelist estrita)
    const rawExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: 'Extensão de arquivo não permitida. Use apenas JPG, PNG, WEBP ou AVIF.' },
        { status: 400 }
      );
    }

    // 3. Validação de MIME Type
    if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { error: 'Tipo de imagem inválido detectado.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 4. Verificação de Integridade dos Magic Bytes
    if (!isValidImageHeader(buffer)) {
      return NextResponse.json(
        { error: 'O arquivo não é uma imagem válida.' },
        { status: 400 }
      );
    }

    // 5. Nome de Arquivo Seguro e Imprevisível (Crypto Random)
    const randomName = crypto.randomBytes(16).toString('hex');
    const safeFileName = `upload_${Date.now()}_${randomName}${rawExt}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({
      url: `/uploads/${safeFileName}`,
    });
  } catch (error) {
    console.error('Erro no upload de foto:', error);
    return NextResponse.json({ error: 'Falha ao processar o upload da imagem.' }, { status: 500 });
  }
}
