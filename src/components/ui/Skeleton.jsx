import React from 'react';

/** Bloco de carregamento em marinho com shimmer subtil (respeita reduced-motion). */
export function Skeleton({ className = '' }) {
  return (
    <span aria-hidden className={`relative block overflow-hidden rounded-xl bg-surface-2 ${className}`}>
      <span className="skeleton-shimmer" />
    </span>
  );
}

/** Lista de cartões esqueleto para estados de carregamento de ecrã ou secção. */
export function SkeletonList({ rows = 3, label = 'A carregar', className = '' }) {
  return (
    <div role="status" aria-label={label} className={`space-y-2.5 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface border border-white/[0.07]">
          <Skeleton className="w-9 h-9 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className={`h-3.5 rounded-md ${i % 2 ? 'w-1/2' : 'w-2/3'}`} />
            <Skeleton className="h-3 w-1/3 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
