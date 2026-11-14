import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Clock3, UserPlus, X } from 'lucide-react';
import AthleteCard from './AthleteCard';
import { Avatar, SPRING, TAP } from './ui';
import { triggerHaptic } from '../../utils/audio';

const EXIT = { opacity: 0, x: 24, transition: { duration: 0.18 } };

/**
 * Cartão de convite direto via deep link (`?u=username`).
 */
export function InvitePassBanner({
  invitePass,
  friendships,
  inviteRequested,
  onClose,
  onRespond,
  onSendInvite
}) {
  if (!invitePass) return null;

  const existing = friendships.find((f) => f.friend_id === invitePass.id);

  return (
    <div className="space-y-3 py-4 border-y border-white/[0.08]">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-zinc-400">
          Athlete Pass · Convite
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar convite"
          className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <AthleteCard profile={invitePass} stats={invitePass} />
      {existing?.status === 'accepted' ? (
        <div className="min-h-[44px] rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-200 text-[13px] font-bold flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> Já são amigos de treino
        </div>
      ) : existing?.status === 'pending' && existing.incoming ? (
        <motion.button
          type="button"
          whileTap={TAP}
          transition={SPRING}
          onClick={() => onRespond(existing, true)}
          className="w-full min-h-[48px] rounded-full bg-white text-black font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_24px_rgba(255,255,255,0.16)]"
        >
          <Check className="w-4 h-4" /> Aceitar convite de @{invitePass.username}
        </motion.button>
      ) : inviteRequested || (existing?.status === 'pending' && !existing.incoming) ? (
        <div className="min-h-[44px] rounded-full bg-white/[0.06] border border-white/[0.12] text-zinc-200 text-[13px] font-semibold flex items-center justify-center gap-2">
          <Clock3 className="w-4 h-4 text-zinc-400" /> Pedido enviado a @{invitePass.username}
        </div>
      ) : (
        <motion.button
          type="button"
          whileTap={TAP}
          transition={SPRING}
          onClick={onSendInvite}
          className="w-full min-h-[48px] rounded-full bg-white text-black font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer shadow-[0_8px_24px_rgba(255,255,255,0.16)]"
        >
          <UserPlus className="w-4 h-4" strokeWidth={2.2} />
          Seguir &amp; Treinar Junto
        </motion.button>
      )}
    </div>
  );
}

/**
 * Faixa recolhível de pedidos de amizade recebidos e convites enviados pendentes.
 */
export function PendingRequestsSection({
  incoming,
  outgoing,
  requestsOpen,
  onToggleOpen,
  onRespond
}) {
  const pendingTotal = incoming.length + outgoing.length;
  if (pendingTotal <= 0) return null;

  return (
    <div className="border-y border-white/[0.07]">
      <button
        type="button"
        onClick={() => {
          triggerHaptic(8);
          onToggleOpen();
        }}
        aria-expanded={requestsOpen}
        className="w-full min-h-[48px] py-2.5 flex items-center justify-between gap-3 text-left cursor-pointer touch-manipulation"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          <span className="text-[13px] font-semibold text-white">
            {incoming.length > 0
              ? `${incoming.length} ${incoming.length === 1 ? 'pedido de amizade' : 'pedidos de amizade'}`
              : `${outgoing.length} ${outgoing.length === 1 ? 'convite enviado' : 'convites enviados'}`}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${requestsOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {requestsOpen && (
        <ul className="divide-y divide-white/[0.05] pb-2">
          <AnimatePresence initial={false}>
            {incoming.map((f) => (
              <motion.li
                key={f.friendship_id}
                layout="position"
                exit={EXIT}
                className="flex items-center gap-3 py-2.5"
              >
                <Avatar url={f.avatar_url} name={f.full_name || f.username} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-white truncate">
                    {f.full_name || `@${f.username}`}
                  </p>
                  <p className="text-[12px] text-zinc-400 truncate">quer treinar contigo</p>
                </div>
                <motion.button
                  type="button"
                  whileTap={TAP}
                  transition={SPRING}
                  onClick={() => onRespond(f, false)}
                  className="min-h-[40px] px-3 rounded-full text-[13px] font-medium text-zinc-400 hover:text-white cursor-pointer touch-manipulation"
                >
                  Recusar
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={TAP}
                  transition={SPRING}
                  onClick={() => onRespond(f, true)}
                  className="min-h-[40px] px-4 rounded-full bg-white text-black text-[13px] font-bold cursor-pointer touch-manipulation"
                >
                  Aceitar
                </motion.button>
              </motion.li>
            ))}
            {outgoing.map((f) => (
              <motion.li
                key={f.friendship_id}
                layout="position"
                exit={EXIT}
                className="flex items-center gap-3 py-2.5"
              >
                <Avatar url={f.avatar_url} name={f.full_name || f.username} size={34} />
                <p className="flex-1 min-w-0 text-[13px] text-zinc-300 truncate">
                  Pedido enviado a {f.full_name || `@${f.username}`}
                </p>
                <motion.button
                  type="button"
                  whileTap={TAP}
                  onClick={() => onRespond(f, false)}
                  className="min-h-[40px] px-3 text-[13px] font-medium text-zinc-400 hover:text-white cursor-pointer touch-manipulation"
                >
                  Cancelar
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
