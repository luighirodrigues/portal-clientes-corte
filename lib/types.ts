export interface Client {
  id: string;
  nome: string;
  slug: string; // Ex: 'lauraberthulinebeauty' or 'laura'
  pin: string; // Ex: '1234'
  whatsapp?: string; // Ex: '555391081395'
  fotoPerfil?: string;
  criadoEm: string;
}

export interface Delivery {
  id: string;
  clienteId: string;
  data: string; // Ex: "29 de Agosto"
  videos: string; // Ex: "125"
  fotos: string; // Ex: "0"
  horas: string; // Ex: "2h"
  fotoCapa?: string; // Path or URL to photo
  linkDrive: string; // Google Drive link
  frase?: string; // Quote
  autor?: string; // Author
  instagram?: string;
  whatsapp?: string;
  status: 'rascunho' | 'publicado' | 'arquivado';
  visualizadoEm?: string; // Timestamp of first unlock
  acessosCount: number;
  criadoEm: string;
}

export interface DatabaseSchema {
  clients: Client[];
  deliveries: Delivery[];
  admin: {
    email: string;
    senhaHash: string; // Simple hash or string for admin
  };
}
