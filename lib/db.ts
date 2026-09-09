import { prisma } from './prisma';
import { hashPassword, encryptPin, decryptPin } from './crypto';

export interface ClientData {
  id?: string;
  nome: string;
  slug: string;
  pin: string; // PIN puro passado ao cadastrar/atualizar
  whatsapp?: string;
  fotoPerfil?: string;
}

export interface DeliveryData {
  id?: string;
  clienteId: string;
  data: string;
  videos: string;
  fotos: string;
  horas: string;
  fotoCapa?: string;
  linkDrive: string;
  frase?: string;
  autor?: string;
  instagram?: string;
  whatsapp?: string;
  status?: string;
}

export const db = {
  async getClients() {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { deliveries: true },
    });

    return clients.map((c) => ({
      id: c.id,
      nome: c.nome,
      slug: c.slug,
      pin: decryptPin(c.pinEncrypted) || '****', // Decodifica para exibição no painel administrativo
      whatsapp: c.whatsapp,
      fotoPerfil: c.fotoPerfil,
      criadoEm: c.createdAt.toISOString(),
      deliveries: c.deliveries,
      totalEntregas: c.deliveries.length,
      ultimaEntrega: c.deliveries[0]?.data || null,
      totalAcessos: c.deliveries.reduce((sum, d) => sum + d.acessosCount, 0),
    }));
  },

  async getClientBySlug(slug: string) {
    const clean = slug.toLowerCase().trim();
    const client = await prisma.client.findUnique({
      where: { slug: clean },
      include: {
        deliveries: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) return null;

    return {
      id: client.id,
      nome: client.nome,
      slug: client.slug,
      pinHash: client.pinHash,
      whatsapp: client.whatsapp,
      fotoPerfil: client.fotoPerfil,
      criadoEm: client.createdAt.toISOString(),
      deliveries: client.deliveries.map((d) => ({
        id: d.id,
        clienteId: d.clienteId,
        data: d.data,
        videos: d.videos,
        fotos: d.fotos,
        horas: d.horas,
        fotoCapa: d.fotoCapa,
        linkDrive: d.linkDrive,
        frase: d.frase,
        autor: d.autor,
        instagram: d.instagram,
        whatsapp: d.whatsapp,
        status: d.status,
        acessosCount: d.acessosCount,
        visualizadoEm: d.visualizadoEm?.toISOString() || null,
        criadoEm: d.createdAt.toISOString(),
      })),
    };
  },

  async getClientById(id: string) {
    return prisma.client.findUnique({
      where: { id },
      include: { deliveries: true },
    });
  },

  async saveClient(data: ClientData) {
    const cleanSlug = data.slug.toLowerCase().trim();
    const pinHash = await hashPassword(data.pin);
    const pinEncrypted = encryptPin(data.pin);

    if (data.id) {
      return prisma.client.update({
        where: { id: data.id },
        data: {
          nome: data.nome.trim(),
          slug: cleanSlug,
          pinHash,
          pinEncrypted,
          whatsapp: data.whatsapp || null,
          fotoPerfil: data.fotoPerfil || null,
        },
      });
    }

    return prisma.client.create({
      data: {
        nome: data.nome.trim(),
        slug: cleanSlug,
        pinHash,
        pinEncrypted,
        whatsapp: data.whatsapp || null,
        fotoPerfil: data.fotoPerfil || null,
      },
    });
  },

  async deleteClient(id: string) {
    return prisma.client.delete({
      where: { id },
    });
  },

  async getDeliveries(clienteId?: string) {
    const deliveries = await prisma.delivery.findMany({
      where: clienteId ? { clienteId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { cliente: true },
    });

    return deliveries.map((d) => ({
      id: d.id,
      clienteId: d.clienteId,
      data: d.data,
      videos: d.videos,
      fotos: d.fotos,
      horas: d.horas,
      fotoCapa: d.fotoCapa,
      linkDrive: d.linkDrive,
      frase: d.frase,
      autor: d.autor,
      instagram: d.instagram,
      whatsapp: d.whatsapp,
      status: d.status,
      acessosCount: d.acessosCount,
      visualizadoEm: d.visualizadoEm?.toISOString() || null,
      criadoEm: d.createdAt.toISOString(),
    }));
  },

  async saveDelivery(data: DeliveryData) {
    if (data.id) {
      return prisma.delivery.update({
        where: { id: data.id },
        data: {
          clienteId: data.clienteId,
          data: data.data.trim(),
          videos: String(data.videos || '0'),
          fotos: String(data.fotos || '0'),
          horas: String(data.horas || '2h'),
          fotoCapa: data.fotoCapa || null,
          linkDrive: data.linkDrive.trim(),
          frase: data.frase || null,
          autor: data.autor || null,
          status: data.status || 'publicado',
        },
      });
    }

    return prisma.delivery.create({
      data: {
        clienteId: data.clienteId,
        data: data.data.trim(),
        videos: String(data.videos || '0'),
        fotos: String(data.fotos || '0'),
        horas: String(data.horas || '2h'),
        fotoCapa: data.fotoCapa || null,
        linkDrive: data.linkDrive.trim(),
        frase: data.frase || null,
        autor: data.autor || null,
        status: data.status || 'publicado',
      },
    });
  },

  async deleteDelivery(id: string) {
    return prisma.delivery.delete({
      where: { id },
    });
  },

  async registerAccess(deliveryId: string, clienteId?: string, ip?: string, userAgent?: string) {
    await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        acessosCount: { increment: 1 },
        visualizadoEm: new Date(),
      },
    });

    await prisma.accessLog.create({
      data: {
        clienteId: clienteId || null,
        ip: ip || null,
        userAgent: userAgent || null,
        sucesso: true,
      },
    });
  },

  async logFailedAccess(clienteId?: string, ip?: string, userAgent?: string, motivo?: string) {
    await prisma.accessLog.create({
      data: {
        clienteId: clienteId || null,
        ip: ip || null,
        userAgent: userAgent || null,
        sucesso: false,
        motivo: motivo || 'PIN inválido',
      },
    });
  },

  async getAdmin() {
    return prisma.adminUser.findFirst();
  },

  async updateAdminPassword(email: string, newPasswordHash: string) {
    return prisma.adminUser.update({
      where: { email },
      data: { passwordHash: newPasswordHash },
    });
  },
};
