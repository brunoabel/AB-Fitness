import React from 'react';
import { HandMetal } from 'lucide-react';

/**
 * Selo Respect — Ícone livre (sem bolinha), ligeiramente elevado e inclinado na diagonal
 * à direita junto ao nome, para leitura nítida e assinatura visual própria da AB Fitness.
 *
 * `variant`:
 *  - 'pro'  (padrão): Azul luminoso sobre OLED (#5B8DEF) com brilho subtil.
 *  - 'gold': Dourado metálico (#E5C158) para Founder / CEO.
 */
export default function VerifiedBadge({
  size = 18,
  variant = 'pro',
  className = '',
  title
}) {
  const isGold = variant === 'gold';
  const label = title || (isGold ? 'Selo Respect · Founder' : 'Selo Respect · Membro PRO');

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 align-top select-none -translate-y-[1.5px] rotate-[14deg] ${
        isGold
          ? 'text-[#E5C158] drop-shadow-[0_0_6px_rgba(229,193,88,0.38)]'
          : 'text-[#5B8DEF] drop-shadow-[0_0_6px_rgba(91,141,239,0.42)]'
      } ${className}`}
      title={label}
      aria-label={label}
    >
      <HandMetal style={{ width: size, height: size }} strokeWidth={2} />
    </span>
  );
}
