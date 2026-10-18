import React from 'react';

/**
 * ABLogo — Logo Oficial AB Fitness
 * 
 * Especificações do usuário:
 * - Imagem original do monograma AB estilizado (/ab-logo.png)
 * - Embaixo escrito "FITNESS" em branco, em tamanho discreto / reduzido
 * - Fundo preto puro (#000000)
 * - Sem parte azul (borda neutra/sutil escura ou sem led azul, 100% minimalista e funcional)
 */
export default function ABLogo({ 
  size = 44, 
  showText = true,
  className = '' 
}) {
  // Escalas proporcionais baseadas em size
  const borderRadius = Math.max(8, Math.round(size * 0.22));
  // Tamanho do texto FITNESS reduzido e discreto
  const textSize = Math.max(5.5, Math.round(size * 0.095));
  const letterSpacing = Math.max(1.2, size * 0.04);

  return (
    <div
      className={`inline-flex flex-col items-center justify-center select-none overflow-hidden relative shrink-0 ${className}`}
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
      {/* Imagem original do Monograma AB */}
      <div 
        className="flex items-center justify-center overflow-hidden"
        style={{
          width: showText ? '78%' : '86%',
          height: showText ? '66%' : '86%',
          marginTop: showText ? '2%' : '0',
        }}
      >
        <img
          src="/ab-logo.png"
          alt="AB"
          className="w-full h-full object-contain pointer-events-none"
          style={{
            filter: 'contrast(1.1) brightness(1.02)',
          }}
        />
      </div>

      {/* Escrito FITNESS em branco reduzido e sutil */}
      {showText && (
        <span
          className="font-bold uppercase text-white/90 pointer-events-none leading-none tracking-widest text-center"
          style={{
            fontSize: `${textSize}px`,
            letterSpacing: `${letterSpacing}px`,
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            marginTop: '2px',
            paddingBottom: `${Math.max(2, Math.round(size * 0.04))}px`,
          }}
        >
          FITNESS
        </span>
      )}
    </div>
  );
}
