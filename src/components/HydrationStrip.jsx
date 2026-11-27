import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Droplets, Bell, BellOff, RotateCcw, Check } from 'lucide-react';
import {
  computeDailyWaterTargetMl,
  formatLiters,
  getHydrationToday,
  addWaterToday,
  undoLastWaterToday,
  getHydrationPrefs,
  saveHydrationPrefs,
  getNotificationSupport,
  requestHydrationNotificationPermission
} from '../utils/hydration';
import { getLocalFitnessProfile, subscribeFitnessProfile } from '../services/fitnessProfileService';
import { sound, triggerHaptic } from '../utils/audio';

const QUICK_AMOUNTS = [250, 500, 750];
const INTERVAL_OPTIONS = [
  { minutes: 60, label: '1h' },
  { minutes: 90, label: '1h30' },
  { minutes: 120, label: '2h' },
  { minutes: 180, label: '3h' }
];

/**
 * Faixa editorial de Hidratação Diária (sem card pesado):
 * meta mínima calculada automaticamente pelo peso do perfil + registo em 1 toque + lembretes.
 */
export default function HydrationStrip() {
  const [profile, setProfile] = useState(() => getLocalFitnessProfile());
  const [log, setLog] = useState(() => getHydrationToday());
  const [prefs, setPrefs] = useState(() => getHydrationPrefs());
  const [showSettings, setShowSettings] = useState(false);
  const [permMessage, setPermMessage] = useState(null);

  useEffect(() => subscribeFitnessProfile(setProfile), []);

  const targetMl = useMemo(() => {
    if (Number.isFinite(prefs.customTargetMl) && prefs.customTargetMl >= 1000) {
      return prefs.customTargetMl;
    }
    return computeDailyWaterTargetMl(profile?.weightKg, profile?.primaryGoal);
  }, [profile?.weightKg, profile?.primaryGoal, prefs.customTargetMl]);

  const pct = Math.min(100, Math.round((log.consumedMl / targetMl) * 100));
  const goalReached = log.consumedMl >= targetMl;
  const remainingMl = Math.max(0, targetMl - log.consumedMl);

  const handleAdd = (ml) => {
    const wasReached = log.consumedMl >= targetMl;
    const next = addWaterToday(ml);
    setLog(next);
    if (!wasReached && next.consumedMl >= targetMl) {
      triggerHaptic([12, 30, 18]);
      sound.playSuccess();
    } else {
      triggerHaptic(8);
    }
  };

  const handleUndo = () => {
    triggerHaptic(6);
    setLog(undoLastWaterToday());
  };

  const handleToggleReminders = async () => {
    triggerHaptic(10);
    setPermMessage(null);
    if (prefs.enabled) {
      setPrefs(saveHydrationPrefs({ enabled: false }));
      return;
    }
    const { supported } = getNotificationSupport();
    if (!supported) {
      setPrefs(saveHydrationPrefs({ enabled: true }));
      setPermMessage('Lembretes ativos na app. Para alertas fora da app, instala no ecrã inicial.');
      return;
    }
    const result = await requestHydrationNotificationPermission();
    if (result === 'granted') {
      setPrefs(saveHydrationPrefs({ enabled: true, lastNotifiedAt: new Date().toISOString() }));
    } else {
      setPrefs(saveHydrationPrefs({ enabled: false }));
      setPermMessage('Notificações bloqueadas no navegador. Ativa nas definições para receber alertas.');
    }
  };

  const handleSelectInterval = (minutes) => {
    triggerHaptic(6);
    setPrefs(saveHydrationPrefs({ intervalMinutes: minutes }));
  };

  return (
    <section
      aria-label="Hidratação diária"
      className="pt-7 border-t border-white/[0.08] space-y-3.5"
    >
      {/* Cabeçalho compacto */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Droplets
            className={`w-4 h-4 shrink-0 ${goalReached ? 'text-emerald-400' : 'text-sky-400'}`}
            strokeWidth={1.9}
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h2 className="text-[14px] font-semibold text-white">Hidratação</h2>
              <span className="text-[13px] font-medium text-zinc-400 tabular-nums">
                {formatLiters(log.consumedMl)}{' '}
                <span className="text-zinc-600">/</span>{' '}
                {formatLiters(targetMl)}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
              {goalReached ? (
                <span className="text-emerald-400 inline-flex items-center gap-1 font-medium">
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                  Meta diária cumprida
                </span>
              ) : (
                <>
                  Faltam {formatLiters(remainingMl)}
                  {profile?.weightKg ? ` · base ${profile.weightKg} kg` : ''}
                </>
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            setShowSettings((v) => !v);
          }}
          aria-expanded={showSettings}
          aria-label="Configurar lembretes de água"
          className={`min-h-[36px] px-3 rounded-full border text-[11px] font-semibold inline-flex items-center gap-1.5 cursor-pointer touch-manipulation transition-colors shrink-0 ${
            prefs.enabled
              ? 'bg-sky-500/15 border-sky-400/35 text-sky-300'
              : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white'
          }`}
        >
          {prefs.enabled ? (
            <Bell className="w-3.5 h-3.5" strokeWidth={1.9} />
          ) : (
            <BellOff className="w-3.5 h-3.5" strokeWidth={1.8} />
          )}
          <span>{prefs.enabled ? `A cada ${INTERVAL_OPTIONS.find((o) => o.minutes === prefs.intervalMinutes)?.label || '2h'}` : 'Lembretes'}</span>
        </button>
      </div>

      {/* Barra fina de progresso */}
      <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
        <div
          className={`h-full rounded-full transition-[width,background-color] duration-300 ease-out ${
            goalReached ? 'bg-emerald-400' : 'bg-sky-400'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Botões rápidos de registo */}
      <div className="flex items-center gap-2">
        {QUICK_AMOUNTS.map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => handleAdd(ml)}
            className="flex-1 min-h-[40px] rounded-full bg-white/[0.04] hover:bg-white/[0.09] active:scale-[0.97] border border-white/[0.08] text-[12px] font-semibold text-white tabular-nums transition-[background-color,transform] duration-150 cursor-pointer touch-manipulation"
          >
            +{ml} ml
          </button>
        ))}

        {log.entries.length > 0 && (
          <button
            type="button"
            onClick={handleUndo}
            aria-label="Desfazer último registo de água"
            title="Desfazer último registo"
            className="min-h-[40px] min-w-[40px] rounded-full bg-transparent hover:bg-white/[0.06] border border-white/[0.08] text-zinc-400 hover:text-white inline-flex items-center justify-center transition-colors cursor-pointer touch-manipulation shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.9} />
          </button>
        )}
      </div>

      {/* Painel inline subtil de configuração de lembretes */}
      <AnimatePresence initial={false}>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-1 border-t border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[12px] font-semibold text-white">Lembretes de água</p>
                  <p className="text-[11px] text-zinc-500">
                    Entre as {String(prefs.startHour).padStart(2, '0')}h e as {String(prefs.endHour).padStart(2, '0')}h, até cumprires a meta.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.enabled}
                  onClick={handleToggleReminders}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                    prefs.enabled ? 'bg-sky-500' : 'bg-white/[0.12]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      prefs.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                {INTERVAL_OPTIONS.map((opt) => {
                  const active = prefs.intervalMinutes === opt.minutes;
                  return (
                    <button
                      key={opt.minutes}
                      type="button"
                      onClick={() => handleSelectInterval(opt.minutes)}
                      className={`flex-1 min-h-[34px] rounded-full text-[11px] font-semibold border transition-colors cursor-pointer touch-manipulation ${
                        active
                          ? 'bg-sky-500/20 border-sky-400/40 text-sky-200'
                          : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {permMessage && (
                <p className="text-[11px] text-amber-300 leading-relaxed">{permMessage}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
