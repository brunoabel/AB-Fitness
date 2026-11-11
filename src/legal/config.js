/** Dados do responsável e das páginas legais. JS puro: também é lido por scripts/prerender_legal.mjs. */
export const SITE_URL = 'https://www.abfitness.app';
export const BRAND = 'AB Fitness';
export const STUDIO = 'ABEX Studio';
export const OWNER = 'Bruno Abel';
export const CONTACT_EMAIL = 'brunoaaraujo2005@gmail.com';
/** NIF/NIPC do responsável; quando preenchido aparece nos documentos (exigido para prestadores em Portugal). */
export const LEGAL_ID = '297261983';
export const LEGAL_ADDRESS = 'Rua das Mimosas 115, 1.º Esquerdo, São Cosme, 4420-204 Gondomar, Porto, Portugal';
export const CONSENT_VERSION = '2026-11';
export const LAST_UPDATED = '2026-11-11';

export const LEGAL_PAGES = [
  { path: '/termos', key: 'termos', label: 'Termos e Condições' },
  { path: '/privacidade', key: 'privacidade', label: 'Privacidade e Cookies' },
  { path: '/aviso-medico', key: 'aviso-medico', label: 'Aviso Médico e de IA' }
];

export const formatDatePt = (iso) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
