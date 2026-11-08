import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Peças de modal com entrada/saída animadas. Para a saída animar, o modal tem de estar dentro de <AnimatePresence>.
 * Fundo: fade. Painel: sobe de baixo (folha no telemóvel) com mola curta; sem deslocamento com "reduzir movimento".
 */
export function ModalBackdrop({ className = '', children, onClick }) {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

export function ModalPanel({ className = '', children, onClick }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      onClick={onClick}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
    >
      {children}
    </motion.div>
  );
}
