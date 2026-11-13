import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { triggerHaptic } from '../../utils/audio';

const LONG_PRESS_MS = 500;

/**
 * Display tipográfico de um valor numérico que NÃO abre o teclado do sistema operativo ao
 * toque normal — só um toque longo (500ms) entra em modo de edição (campo nativo real, para
 * introduzir um valor exato). Incrementos usam sempre steppers dedicados ao lado. Expõe
 * `.focus()` por ref para fluxos de validação forçarem a edição.
 */
const NumberField = forwardRef(function NumberField(
  { value, placeholder, disabled, invalid, onCommit, inputMode = 'decimal', step, ariaLabel, className = '' },
  ref
) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const pressTimerRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      if (disabled) return;
      setEditing(true);
    }
  }));

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startPress = () => {
    if (disabled) return;
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => {
      triggerHaptic(15);
      setEditing(true);
    }, LONG_PRESS_MS);
  };
  const cancelPress = () => clearTimeout(pressTimerRef.current);

  const boxClass = `w-full h-11 sm:h-12 rounded-lg text-center font-display font-semibold text-[18px] tracking-[-0.02em] tabular-nums border bg-transparent transition-all ${className}`;

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode={inputMode}
        step={step}
        value={value ?? ''}
        placeholder={placeholder}
        onFocus={(e) => e.target.select()}
        onChange={(e) => onCommit(e.target.value)}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur();
        }}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className={`${boxClass} ${invalid ? 'border-red-500 ring-2 ring-red-500/60 text-zinc-50' : 'border-accent ring-1 ring-accent text-zinc-50'}`}
      />
    );
  }

  const hasValue = !(value === '' || value === null || value === undefined);

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={ariaLabel}
      className={`${boxClass} select-none touch-manipulation cursor-pointer active:scale-[0.97] ${
        disabled
          ? 'border-transparent text-zinc-400'
          : invalid
            ? 'border-red-500 ring-2 ring-red-500/60 text-zinc-50'
            : 'border-transparent text-zinc-50'
      }`}
    >
      {hasValue ? value : <span className="text-zinc-600">{placeholder}</span>}
    </button>
  );
});

export default NumberField;
