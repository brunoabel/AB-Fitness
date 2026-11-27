import React from 'react';
import { HandMetal } from 'lucide-react';

/**
 * Selo Respect — Identidade de membro PRO / Founder da AB Fitness.
 * Liga a cultura social do Clube ("dar Respect") ao emblema de destaque junto ao nome.
 *
 * `variant`:
 *  - 'pro'  (padrão): Azul-Marinho metálico (#2B4A7A -> #1D3557) com ícone branco nítido.
 *  - 'gold': Dourado fosco (#E5C158 -> #B8860B) para Founder / CEO.
 */
export default function VerifiedBadge({
  size = 18,
  variant = 'pro',
  className = '',
  title
}) {
  const isGold = variant === 'gold';
  const label = title || (isGold ? 'Selo Respect · Founder' : 'Selo Respect · Membro PRO');
  const iconSize = Math.max(9, Math.round(size * 0.6));

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full shrink-0 align-middle select-none ring-1 ${
        isGold
          ? 'bg-gradient-to-br from-[#E5C158] to-[#B8860B] ring-amber-200/35 text-black'
          : 'bg-gradient-to-br from-[#2B4A7A] to-[#1D3557] ring-white/20 text-white'
      } ${className}`}
      style={{ width: size, height: size }}
      title={label}
      aria-label={label}
    >
      <HandMetal style={{ width: iconSize, height: iconSize }} strokeWidth={2.25} />
    </span>
  );
}
