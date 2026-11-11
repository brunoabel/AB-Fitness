import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check } from 'lucide-react';
import { saveCheckin } from '../../utils/sessionCheckin';
import { triggerHaptic } from '../../utils/audio';

const EASE = [0.22, 1, 0.36, 1];
const SPRING = { type: 'spring', stiffness: 520, damping: 40 };

const EFFORT = [
  { id: 1, label: 'Muito leve' },
  { id: 2, label: 'Leve' },
  { id: 3, label: 'No ponto' },
  { id: 4, label: 'Pesado' },
  { id: 5, label: 'Demais' }
];
const PAIN = ['Ombro', 'Lombar', 'Joelho', 'Punho / cotovelo', 'Quadril'];
const CHANGES = ['Mais carga', 'Menos volume', 'Treino mais curto', 'Trocar exercícios', 'Mais foco num músculo', 'Mais descanso'];

function Chip({ selected, onClick, children }) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      whileTap={{ scale: 0.96 }}
      transition={SPRING}
      onClick={() => {
        triggerHaptic(8);
        onClick();
      }}
      className={`min-h-[44px] px-3.5 rounded-xl border text-[14px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors duration-150 ${
        selected ? 'bg-accent/70 border-accent-hover text-white' : 'bg-surface-2 border-white/[0.08] text-zinc-300 hover:text-white'
      }`}
    >
      {selected && <Check className="w-3.5 h-3.5" strokeWidth={2.5} />}
      {children}
    </motion.button>
  );
}

/** Resposta do coach a partir das respostas (honesta: regista e orienta, não altera o plano sozinha). */
function coachReply({ effort, pain, changes }) {
  if (pain.length) return `Anotei o desconforto em ${pain.join(', ').toLowerCase()}. Abre o AB Coach e pede alternativas: ele já sabe disto e evita exercícios que carreguem essa zona.`;
  if (effort <= 2 || changes.includes('Mais carga')) return 'Estás a ficar mais forte. Na próxima sessão sobe 2,5 a 5% nos exercícios principais e mantém a técnica.';
  if (effort >= 5) return 'Puxaste demais. Na próxima sessão tira uma série nos exercícios mais pesados e garante o descanso entre treinos.';
  if (effort === 4) return 'Treino exigente, bom sinal. Mantém as cargas na próxima sessão e foca em fechar todas as reps com técnica limpa.';
  if (changes.length) return 'Registado. Quando pedires um treino ao AB Coach, ele vai ter isto em conta.';
  return 'Treino no ponto. É exatamente aqui que se evolui: continua assim.';
}

const Q = ({ children }) => <h2 className="font-heading text-section font-semibold text-white mb-3">{children}</h2>;

/**
 * Check-in do AB Coach a cada 3 sessões: carga percebida, desconforto, o que mudar e nota livre.
 * Usar dentro de <AnimatePresence>.
 */
export default function SessionCheckin({ workout, onDone }) {
  const [effort, setEffort] = useState(null);
  const [pain, setPain] = useState([]);
  const [changes, setChanges] = useState([]);
  const [note, setNote] = useState('');
  const [reply, setReply] = useState('');

  const toggle = (list, setList, v) => setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = () => {
    if (!effort) return;
    saveCheckin({
      workoutTitle: workout?.title || workout?.name || 'Treino',
      effort,
      effortLabel: EFFORT.find((e) => e.id === effort)?.label,
      pain,
      changes,
      note: note.trim() || null
    });
    triggerHaptic([12, 40, 12]);
    setReply(coachReply({ effort, pain, changes }));
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] bg-app flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Como foi o treino"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.32, ease: EASE }}
    >
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="relative w-full max-w-md mx-auto aspect-[16/10] overflow-hidden">
          <img
            src="/coach/ab-coach-checkin.jpg"
            alt="AB Coach a tomar notas"
            width={800}
            height={447}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-[55%_25%]"
          />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-app to-transparent" />
        </div>

        <div className="max-w-md mx-auto w-full px-5 pt-1 pb-6">
          <AnimatePresence mode="wait" initial={false}>
            {reply ? (
              <motion.div key="reply" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                <h1 className="font-heading text-title-xl font-bold tracking-tight text-white">Obrigado, anotei tudo.</h1>
                <p className="mt-3 text-body text-zinc-300 leading-relaxed">{reply}</p>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="space-y-7">
                <div>
                  <h1 className="font-heading text-title-xl font-bold tracking-tight text-white">Como foi o treino?</h1>
                  <p className="mt-2 text-body text-zinc-400">A cada 3 sessões faço este check-in rápido para afinar o teu plano.</p>
                </div>

                <section>
                  <Q>Como sentiste a carga?</Q>
                  <div role="radiogroup" aria-label="Carga percebida" className="grid grid-cols-5 gap-1.5">
                    {EFFORT.map((e) => (
                      <motion.button
                        key={e.id}
                        type="button"
                        role="radio"
                        aria-checked={effort === e.id}
                        whileTap={{ scale: 0.96 }}
                        transition={SPRING}
                        onClick={() => {
                          triggerHaptic(8);
                          setEffort(e.id);
                        }}
                        className={`min-h-[64px] rounded-xl border flex flex-col items-center justify-center gap-1 px-1 cursor-pointer transition-colors duration-150 ${
                          effort === e.id ? 'bg-accent border-accent-hover text-white' : 'bg-surface-2 border-white/[0.08] text-zinc-300'
                        }`}
                      >
                        <span className="font-display font-bold text-[22px] leading-none tabular-nums">{e.id}</span>
                        <span className="text-[11px] leading-tight text-center">{e.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </section>

                <section>
                  <Q>Sentiste algum desconforto?</Q>
                  <div className="flex flex-wrap gap-2">
                    <Chip selected={pain.length === 0} onClick={() => setPain([])}>Nenhum</Chip>
                    {PAIN.map((p) => (
                      <Chip key={p} selected={pain.includes(p)} onClick={() => toggle(pain, setPain, p)}>{p}</Chip>
                    ))}
                  </div>
                </section>

                <section>
                  <Q>O que mudarias no treino?</Q>
                  <div className="flex flex-wrap gap-2">
                    {CHANGES.map((c) => (
                      <Chip key={c} selected={changes.includes(c)} onClick={() => toggle(changes, setChanges, c)}>{c}</Chip>
                    ))}
                  </div>
                </section>

                <section>
                  <label htmlFor="checkin-note" className="block font-heading text-section font-semibold text-white mb-3">Queres dizer mais alguma coisa?</label>
                  <textarea
                    id="checkin-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 280))}
                    rows={3}
                    placeholder="Opcional"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-2 border border-white/[0.08] text-body text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-accent-hover"
                  />
                </section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0 max-w-md mx-auto w-full px-5 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] border-t border-white/[0.06] flex gap-2">
        {reply ? (
          <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onDone} autoFocus className="flex-1 min-h-[54px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer">
            Voltar ao painel
          </motion.button>
        ) : (
          <>
            <button type="button" onClick={onDone} className="min-h-[54px] px-4 rounded-2xl text-[14px] font-semibold text-zinc-400 hover:text-white cursor-pointer">
              Agora não
            </button>
            <motion.button
              type="button"
              whileTap={effort ? { scale: 0.98 } : undefined}
              onClick={submit}
              disabled={!effort}
              className="flex-1 min-h-[54px] rounded-2xl bg-primary text-app font-bold text-body cursor-pointer disabled:bg-surface-2 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
            >
              {effort ? 'Enviar ao coach' : 'Escolhe a carga'}
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
}
