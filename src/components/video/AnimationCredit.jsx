import React from 'react';
import { ANIMATION_CREDIT as C } from '../../data/exerciseAnimations';

/** Atribuição exigida pela licença CC BY 4.0 das animações de exercício. */
export default function AnimationCredit({ className = '' }) {
  return (
    <p className={`text-[10px] leading-snug text-zinc-500 ${className}`}>
      Animação:{' '}
      <a href={C.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-zinc-300">
        {C.title}
      </a>
      , de {C.author}, licença{' '}
      <a href={C.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-zinc-300">
        {C.license}
      </a>
      . Convertida para vídeo.
    </p>
  );
}
