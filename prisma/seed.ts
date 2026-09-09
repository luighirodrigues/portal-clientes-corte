import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();
const SECRET = process.env.APP_SECRET || 'cortedarainha_super_secret_key_32c';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(SECRET).digest();

function encryptPin(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

async function main() {
  console.log('--- Iniciando Seed do Banco PostgreSQL ---');

  // 1. Criar ou atualizar Admin
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@cortedarainha.com.br' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@cortedarainha.com.br',
      passwordHash: adminPasswordHash,
      name: 'Equipe Corte da Rainha',
    },
  });
  console.log('Admin configurado:', admin.email);

  // 2. Criar Cliente Laura Berthuline
  const pinLaura = '1234';
  const pinHashLaura = await bcrypt.hash(pinLaura, 10);
  const pinEncLaura = encryptPin(pinLaura);

  const laura = await prisma.client.upsert({
    where: { slug: 'lauraberthulinebeauty' },
    update: {
      pinHash: pinHashLaura,
      pinEncrypted: pinEncLaura,
      fotoPerfil: '/uploads/laura.jpg',
      whatsapp: '555391081395',
    },
    create: {
      nome: 'Laura Berthuline',
      slug: 'lauraberthulinebeauty',
      pinHash: pinHashLaura,
      pinEncrypted: pinEncLaura,
      whatsapp: '555391081395',
      fotoPerfil: '/uploads/laura.jpg',
    },
  });

  // Entrega Laura
  await prisma.delivery.upsert({
    where: { id: 'del-laura-1' },
    update: {},
    create: {
      id: 'del-laura-1',
      clienteId: laura.id,
      data: '29 de Agosto',
      videos: '125',
      fotos: '0',
      horas: '2h',
      fotoCapa: '/uploads/laura.jpg',
      linkDrive: 'https://drive.google.com/drive/folders/1Jd7w_kYt5TAx0ne6wFCla0pNelCJLt5H?usp=drive_link',
      frase: 'Criatividade não acaba. Quanto mais você usa, mais você tem.',
      autor: 'Maya Angelou',
      instagram: 'https://instagram.com/cortedarainha',
      whatsapp: 'https://wa.me/555391081395',
      status: 'publicado',
      acessosCount: 0,
    },
  });
  console.log('Cliente Laura Berthuline configurada.');

  // 3. Criar Cliente Mariana Garrastazu
  const pinMariana = '1234';
  const pinHashMariana = await bcrypt.hash(pinMariana, 10);
  const pinEncMariana = encryptPin(pinMariana);

  const mariana = await prisma.client.upsert({
    where: { slug: 'marianagarrastazu.art' },
    update: {
      pinHash: pinHashMariana,
      pinEncrypted: pinEncMariana,
      fotoPerfil: '/uploads/mariana.jpg',
      whatsapp: '555391081395',
    },
    create: {
      nome: 'Mariana Garrastazu',
      slug: 'marianagarrastazu.art',
      pinHash: pinHashMariana,
      pinEncrypted: pinEncMariana,
      whatsapp: '555391081395',
      fotoPerfil: '/uploads/mariana.jpg',
    },
  });

  // Entrega Mariana
  await prisma.delivery.upsert({
    where: { id: 'del-mariana-1' },
    update: {},
    create: {
      id: 'del-mariana-1',
      clienteId: mariana.id,
      data: '02 de setembro',
      videos: '9',
      fotos: '170',
      horas: '2h',
      fotoCapa: '/uploads/mariana.jpg',
      linkDrive: 'https://drive.google.com/drive/folders/1vakHSAW5iY23dREux4dkTCCzBAFdJ0dL?usp=drive_link',
      frase: 'Criatividade não acaba. Quanto mais você usa, mais você tem.',
      autor: 'Maya Angelou',
      instagram: 'https://instagram.com/cortedarainha',
      whatsapp: 'https://wa.me/555391081395',
      status: 'publicado',
      acessosCount: 0,
    },
  });
  console.log('Cliente Mariana Garrastazu configurada.');

  console.log('--- Seed Concluído com Sucesso! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
