import React, { useEffect } from 'react';
import { animate, motion, useDragControls, useMotionValue, useReducedMotion } from 'motion/react';
import { triggerHaptic } from '../../utils/audio';

/**
 * Peças de modal com entrada/saída animadas, fechar com Escape e gesto 1:1 de arrastar para baixo no mobile.
 * Para a saída animar, o modal tem de estar dentro de <AnimatePresence>.
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

export function ModalPanel({
  className = '',
  children,
  onClick,
  onClose,
  swipeToDismiss = true,
  role = 'dialog',
  ariaLabel,
  ariaLabelledBy
}) {
  const reduce = useReducedMotion();
  const y = useMotionValue(0);
  const dragControls = useDragControls();
  const canSwipe = Boolean(onClose && swipeToDismiss);

  useEffect(() => {
    if (!onClose) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleDragEnd = (_, info) => {
    if (info.offset.y > 110 || info.velocity.y > 450) {
      triggerHaptic(8);
      onClose?.();
      return;
    }
    animate(y, 0, reduce ? { duration: 0.08 } : { type: 'spring', stiffness: 460, damping: 38 });
  };

  return (
    <motion.div
      role={role}
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={className}
      onClick={onClick}
      style={canSwipe ? { y } : undefined}
      drag={canSwipe ? 'y' : false}
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0 }}
      dragElastic={{ top: 0.08, bottom: 0.2 }}
      dragMomentum={false}
      onDragEnd={canSwipe ? handleDragEnd : undefined}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
    >
      {canSwipe && (
        <div
          onPointerDown={(e) => dragControls.start(e)}
          aria-hidden="true"
          className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0 drag-handle cursor-grab active:cursor-grabbing"
        >
          <span className="w-9 h-1 rounded-full bg-white/20" />
        </div>
      )}
      {children}
    </motion.div>
  );
}
