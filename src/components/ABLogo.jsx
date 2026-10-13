import React from "react";

/**
 * ABLogo — Premium monogram logo for AB Fitness
 * Cursive "AB" with a star sparkle accent, faithful to the brand reference.
 *
 * Props:
 *   size    — number (default 36) — width/height in px
 *   variant — "dark" | "light" | "color"
 *             "dark"  = white letters (for dark header / dark bg)
 *             "light" = dark letters  (for light header / light bg)
 *             "color" = white on sky-blue bg (for PWA icon / splash)
 *   className — extra css classes
 */
export default function ABLogo({ size = 36, variant = "light", className = "" }) {
  const isLight = variant === "light";
  const isColor = variant === "color";
  const strokeColor = isLight ? "#0f172a" : "#ffffff";
  const bgFill = "#38bdf8";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="AB Fitness logo"
      role="img"
    >
      {isColor && <rect width="100" height="100" rx="18" fill={bgFill} />}

      {/* A — left diagonal */}
      <path
        d="M 20 78 L 38 22 Q 41 16 45 22 L 58 66"
        stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* A — crossbar */}
      <path
        d="M 27 56 L 51 56"
        stroke={strokeColor} strokeWidth="4.5" strokeLinecap="round" fill="none"
      />
      {/* A — connecting tail into B */}
      <path
        d="M 58 66 Q 60 72 62 68"
        stroke={strokeColor} strokeWidth="4" strokeLinecap="round" fill="none"
      />

      {/* B — stem */}
      <path
        d="M 44 22 L 44 80"
        stroke={strokeColor} strokeWidth="5.5" strokeLinecap="round" fill="none"
      />
      {/* B — upper bump */}
      <path
        d="M 44 22 Q 76 22 76 37 Q 76 51 44 51"
        stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* B — lower bump */}
      <path
        d="M 44 51 Q 80 51 80 65 Q 80 82 44 80"
        stroke={strokeColor} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* B — underline swoosh */}
      <path
        d="M 36 82 Q 60 88 74 84"
        stroke={strokeColor} strokeWidth="3" strokeLinecap="round" fill="none"
      />

      {/* 4-point star sparkle at A/B junction */}
      <g transform="translate(57,42)">
        <line x1="0" y1="-8" x2="0" y2="8" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" />
        <line x1="-8" y1="0" x2="8" y2="0" stroke={strokeColor} strokeWidth="2.4" strokeLinecap="round" />
        <line x1="-4.5" y1="-4.5" x2="4.5" y2="4.5" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" />
        <line x1="4.5" y1="-4.5" x2="-4.5" y2="4.5" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
