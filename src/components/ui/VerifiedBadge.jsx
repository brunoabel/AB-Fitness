import React from 'react';

/**
 * Selo de Perfil Verificado (estilo Instagram / Meta / Apple).
 * Atribuído ao criador do app, atletas certificados e futuros membros Premium.
 */
export default function VerifiedBadge({
  size = 18,
  className = '',
  title = 'Perfil Verificado'
}) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 align-middle select-none ${className}`}
      title={title}
      aria-label={title}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_1px_3px_rgba(2,132,199,0.4)]"
      >
        <path
          d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"
          fill="url(#ab-verified-sky)"
        />
        <path
          d="m8.8 12.1 2.2 2.25 4.5-4.7"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="ab-verified-sky" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
