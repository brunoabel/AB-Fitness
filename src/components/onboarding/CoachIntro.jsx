import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { CALIBRATION_STEPS } from './calibrationSteps';

const EASE = [0.22, 1, 0.36, 1];
const rise = (delay) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: EASE, delay } });

/** O AB Coach apresenta-se antes da calibração (primeiro contacto depois de criar conta). */
export default function CoachIntro({ userName, onStart, onClose }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain">
      <div className="relative w-full max-w-md mx-auto aspect-[4/3] shrink-0 overflow-hidden">
        <motion.img
          src="/coach/ab-coach-hello.jpg"
          alt="AB Coach a acenar"
          width={800}
          height={447}
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[45%_20%]"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-app to-transparent" />
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Fechar" className="absolute right-3 top-[calc(env(safe-area-inset-top,0px)+10px)] w-11 h-11 rounded-xl flex items-center justify-center text-zinc-300 hover:text-white bg-black/40 cursor-pointer">
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        )}
      </div>

      <div className="max-w-md mx-auto w-full px-5 pt-2 flex-1 flex flex-col">
        <motion.h1 {...rise(0.15)} className="font-heading text-title-xl font-bold tracking-tight text-white">
          {userName ? `Olá, ${userName}! Eu sou o AB Coach.` : 'Olá! Eu sou o AB Coach.'}
        </motion.h1>
        <motion.p {...rise(0.25)} className="mt-3 text-body text-zinc-300 leading-relaxed">
          Vou ser o teu treinador aqui dentro. Antes do primeiro treino preciso de te conhecer: objetivo, experiência, biometria e a tua rotina.
        </motion.p>
        <motion.p {...rise(0.33)} className="mt-2 text-body text-zinc-400">
          São {CALIBRATION_STEPS.length} perguntas rápidas, cerca de 2 minutos. No fim monto um protocolo feito para ti.
        </motion.p>
        <div className="mt-auto pt-8 pb-[calc(env(safe-area-inset-bottom,0px)+16px)]">
          <motion.button
            {...rise(0.42)}
            type="button"
            onClick={onStart}
            whileTap={{ scale: 0.98 }}
            autoFocus
            className="w-full min-h-[56px] rounded-2xl bg-primary hover:bg-primary-hover text-app font-bold text-body cursor-pointer transition-colors"
          >
            Vamos começar
          </motion.button>
        </div>
      </div>
    </div>
  );
}
