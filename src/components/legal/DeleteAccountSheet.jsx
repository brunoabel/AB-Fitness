import React, { useState } from 'react';
import { motion } from 'motion/react';
import { TriangleAlert } from 'lucide-react';
import { Sheet } from '../social/ui';
import { useAuth } from '../../context';
import { deleteMyAccount } from '../../services/accountService';
import { triggerHaptic } from '../../utils/audio';

const WORD = 'ELIMINAR';
const ERASED = [
  'Conta, perfil de atleta e fotografia',
  'Treinos, cargas, recordes e planos',
  'Dados de saúde: peso, altura, lesões, check-ins e fadiga',
  'Corridas e percursos GPS',
  'Amizades e atividade partilhada',
  'Dados guardados neste aparelho'
];

/** Direito ao apagamento: confirmação por palavra, eliminação imediata e irreversível no servidor e no aparelho. */
export default function DeleteAccountSheet({ onClose }) {
  const { user, signOut } = useAuth();
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ready = typed.trim().toUpperCase() === WORD && !busy;

  const confirm = async () => {
    if (!ready) return;
    triggerHaptic(20);
    setBusy(true);
    setError('');
    const res = await deleteMyAccount(user?.id);
    if (!res.ok) {
      setBusy(false);
      setError(res.error || 'Não foi possível eliminar a conta. Tente novamente.');
      return;
    }
    try {
      await signOut();
    } catch { /* a conta já não existe; a sessão local é limpa abaixo */ }
    window.location.replace('/');
  };

  return (
    <Sheet
      title="Eliminar conta"
      onClose={busy ? () => {} : onClose}
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} disabled={busy} className="min-h-[48px] rounded-2xl bg-surface-2 border border-white/[0.1] text-[14px] font-bold text-white cursor-pointer disabled:opacity-50">
            Cancelar
          </button>
          <motion.button
            type="button"
            whileTap={ready ? { scale: 0.96 } : undefined}
            onClick={confirm}
            disabled={!ready}
            className="min-h-[48px] rounded-2xl bg-red-400 text-app text-[14px] font-bold cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {busy ? 'A eliminar...' : 'Eliminar para sempre'}
          </motion.button>
        </div>
      }
    >
      <div className="flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.06] p-4">
        <TriangleAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden />
        <p className="text-[14px] leading-relaxed text-zinc-200">
          Esta ação é <strong className="text-white">imediata e irreversível</strong>. Não conseguimos recuperar a conta nem os dados depois de confirmar.
        </p>
      </div>

      <p className="mt-5 text-[13px] text-zinc-400">Vai ser eliminado:</p>
      <ul className="mt-2 space-y-2">
        {ERASED.map((t) => (
          <li key={t} className="relative pl-5 text-[14px] text-zinc-200 before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-white/40">{t}</li>
        ))}
      </ul>

      <label htmlFor="delete-confirm" className="mt-6 block text-[14px] text-zinc-200">
        Para confirmar, escreva <strong className="text-white tracking-wide">{WORD}</strong>
      </label>
      <input
        id="delete-confirm"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        disabled={busy}
        className="mt-2 w-full min-h-[48px] px-4 rounded-xl bg-app border border-white/[0.15] text-white text-[16px] tracking-wide focus:outline-none focus:border-white"
      />
      {error && <p role="alert" className="mt-3 text-[13px] text-red-400">{error}</p>}
    </Sheet>
  );
}
