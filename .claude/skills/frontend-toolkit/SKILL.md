---
name: frontend-toolkit
description: Comprehensive toolkit and engineering guidelines for high-performance, mobile-first frontend development with React, Tailwind CSS, accessibility (WCAG AA), motion design, and touch ergonomics.
---

# Frontend Engineering Toolkit & Standards

Production-grade engineering standards for building responsive, accessible, high-performance web and mobile interfaces.

---

## 1. Ergonomics & Mobile-First Foundation

- **Thumb Zone Design**: Primary interactive elements (navigation, key CTAs, tab bars, quick action sheets) must sit within easy reach of the thumb in the lower half of the viewport.
- **Minimum Touch Targets**: All buttons, links, toggles, and clickable items must have a minimum interactive hit area of `44x44px` (`min-h-[44px] min-w-[44px]` or adequate padding).
- **8pt Spacing Grid**: Layout margins, paddings, and gap distances should strictly follow multiples of 4px / 8px (`gap-2`, `p-4`, `space-y-3`, `my-6`).
- **Safe Area Insets**: Always respect native notches and home indicators using `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.

---

## 2. Visual Architecture & Design Token Discipline

- **Single Source of Truth**: Consume theme tokens from `index.css` and Tailwind variables (`bg-app`, `bg-surface`, `bg-surface-2`, `text-body`, `border-white/[0.08]`).
- **Strict Color Semantics**:
  - Avoid raw hex values in individual JSX components.
  - Dark mode backgrounds must avoid muddy greys in favor of true dark canvas tones with layered surface luminescence.
  - Accent colors must be intentional, high-contrast, and meaningful (e.g. status emerald for success, rose/crimson for destructive actions, violet for special modifiers).
- **Typography Hierarchy**:
  - Set explicit typographic scale with appropriate line heights (minimum 1.4 for body text).
  - Maximum readable line length of 70–80 characters (`max-w-prose`).
  - No orphaned single-word highlights or unnecessary uppercase labeling.

---

## 3. Motion, Interaction & Haptics

- **Hardware Acceleration**: Only animate `transform` and `opacity`. Never animate `width`, `height`, `top`, or `left`.
- **Spring Physics**: Use natural spring easing (`damping`, `stiffness`) for modais, bottom sheets, and drawers.
- **Tactile Haptic Feedback**: Trigger subtle haptic vibration (`navigator.vibrate`) on critical micro-interactions (completing sets, saving profile changes, liking/respecting posts).
- **Reduced Motion**: Respect `@media (prefers-reduced-motion: reduce)` by disabling non-essential transitions.

---

## 4. Accessibility (a11y) & Usability

- **Contrast Ratios**: Maintain at least `4.5:1` contrast for body text and `3:1` for large text and key UI icons.
- **Semantic HTML**: Prefer `<button>`, `<nav>`, `<header>`, `<main>`, `<section>`, and `<dialog>` over generic `<div>` with `onClick`.
- **Keyboard & Screen Reader Nav**:
  - All interactive elements must be focusable with visible focus indicators.
  - Icon-only buttons must have descriptive `aria-label` or `title`.
  - Modals and sheets must trap focus and close on `Escape`.

---

## 5. Performance & Asset Delivery

- **Zero Layout Shift (CLS < 0.1)**: Always reserve aspect-ratio or explicit dimensions for media, avatars, and dynamic cards before loading.
- **Lazy Loading & Code Splitting**: Heavy components (charts, modals, audio engines, rich editors) must be loaded dynamically via `React.lazy()` and `Suspense`.
- **Client-Side Compression**: Compress camera images via canvas bitmap processing before uploading or storing locally.
- **Resilient Fallbacks**: Every network request must gracefully fall back to local storage or cached states when offline or during transient server errors.

