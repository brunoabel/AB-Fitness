import { useEffect, useRef, useState } from 'react';

/**
 * Indica quando o player saiu do ecrã por cima (o utilizador rolou para registar séries).
 * O elemento observado é o "lugar" do player, que mantém a altura para não haver salto de layout.
 */
export default function useStickyMini(enabled, topOffset = 72) {
  const anchorRef = useRef(null);
  const [isMini, setIsMini] = useState(false);

  useEffect(() => {
    const el = anchorRef.current;
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => setIsMini(!entry.isIntersecting && entry.boundingClientRect.top < topOffset),
      { rootMargin: `-${topOffset}px 0px 0px 0px`, threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, topOffset]);

  return { anchorRef, isMini: enabled && isMini };
}
