/**
 * Modo de Lançamento Privado / Gate de Marketing
 * 
 * Quando ativado (true), a aplicação fica completamente fechada ao público.
 * Entram contas com papel 'admin', 'ceo' ou 'coach' e alunos com vínculo ativo a um PT
 * (ver o gate em App.jsx).
 * 
 * Todos os outros visitantes (ou utilizadores sem privilégios) vêem a página
 * de Acesso Privado VIP / Early Access para captação de leads de marketing.
 */
export const PRIVATE_LAUNCH_MODE = true;
export const TRIAL_DAYS = 14;

