import React from 'react';

/**
 * ABLogo — Logo Oficial AB Fitness
 * 
 * Especificações:
 * - Novo logo principal oficial em alta resolução (/icon-512.png)
 * - showText=true: exibe o logo oficial completo (Monograma AB estilizado + FITNESS integrado)
 * - showText=false: exibe o monograma AB isolado em alta resolução (/ab-logo-monogram.png)
 * - Fundo preto puro (#000000) com cantos arredondados proporcionais e borda sutil neutra
 * - Estilo 100% minimalista de acordo com STYLESEED.md (sem LED azul ou bordas saturadas)
 */
export default function ABLogo({ 
  size = 44, 
  className = '' 
}) {
  const borderRadius = Math.max(8, Math.round(size * 0.22));

  return (
    <div
      className={`inline-flex items-center justify-center select-none overflow-hidden relative shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: '#000000',
        borderRadius: `${borderRadius}px`,
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
      }}
      aria-label="AB Fitness Logo"
    >
      <img
        src="/ab-logo.png"
        alt="AB Fitness"
        className="w-full h-full object-contain pointer-events-none"
        style={{
          filter: 'contrast(1.05) brightness(1.02)',
        }}
      />
    </div>
  );
}

