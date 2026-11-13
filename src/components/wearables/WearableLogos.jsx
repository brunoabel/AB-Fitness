import React from 'react';

/**
 * Emblemas vetoriais nítidos para identificar as integrações oficiais OAuth 2.0
 * (Uso Nominativo — sem sugestões de patrocínio ou certificação).
 */

export function WhoopMark({ size = 40, className = '' }) {
  const iconSize = Math.round(size * 0.56);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-black border border-white/[0.16] text-white shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3.2 6.5H6L8.4 14.3L10.9 6.5H13.1L15.6 14.3L18 6.5H20.8L16.9 17.5H14.5L12 10L9.5 17.5H7.1L3.2 6.5Z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

export function FitbitMark({ size = 40, className = '' }) {
  const iconSize = Math.round(size * 0.58);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl bg-[#00B0B9]/12 border border-[#00B0B9]/28 text-[#00B0B9] shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="4.8" cy="12" r="1.15" />

        <circle cx="8" cy="8.7" r="1.3" />
        <circle cx="8" cy="12" r="1.3" />
        <circle cx="8" cy="15.3" r="1.3" />

        <circle cx="11.4" cy="5.4" r="1.4" />
        <circle cx="11.4" cy="8.7" r="1.45" />
        <circle cx="11.4" cy="12" r="1.45" />
        <circle cx="11.4" cy="15.3" r="1.45" />
        <circle cx="11.4" cy="18.6" r="1.4" />

        <circle cx="15" cy="8.7" r="1.6" />
        <circle cx="15" cy="12" r="1.65" />
        <circle cx="15" cy="15.3" r="1.6" />

        <circle cx="18.8" cy="12" r="1.85" />
      </svg>
    </span>
  );
}
