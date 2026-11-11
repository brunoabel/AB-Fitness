# STYLESEED · AB Fitness

Design lock do produto. Toda tela nova ou redesenhada segue estes tokens. Implementação em `src/index.css` (`@theme`).

## Direção de arte: Pure Black + White + Midnight Navy

Preto OLED como abismo, branco puro como sinal e Deep Midnight Navy como única cor secundária. Sem laranja, sem ciano, sem dourado.

## Regra 60-30-10

| Papel | % | Token | Hex | Uso |
|---|---|---|---|---|
| Preto | 60 | `bg-app` / `bg-surface` | `#000000` / `#070709` | Canvas e superfícies primárias |
| Marinho | 30 | `bg-surface-2` / `bg-surface-3` | `#0A1128` / `#0F172A` | Cards destacados, folhas, inputs |
| Marinho elevado | 10 | `bg-accent` / `border-accent-hover` | `#1D3557` / `#2B4A7A` | Seleção, card ativo, badge, botão secundário, dia selecionado |

- **Ação primária (CTA):** `bg-primary text-app` (branco `#FFFFFF`, texto preto, 21:1). Um por tela.
- **Seleção:** `bg-accent/70 text-white border-accent-hover`. Marinho sólido `bg-accent text-white` (12.9:1) para estado ativo pontual.
- **Indicadores e progresso:** `bg-white` sobre trilho `bg-white/[0.06]`.
- **Ícone ativo / números / PR:** `text-white` (`text-pr` = branco).
- **Bordas:** `border-white/[0.08]`. Elevação = superfície um degrau acima + realce de 1 px no topo.
- **Proibido:** box-shadow colorido, glow, gradiente decorativo, ciano, laranja, dourado, emoji em títulos.

## Neutros (cinza frio)

`zinc-100 #F1F2F4` · `zinc-300 #B9BCC6` · `zinc-400 #8E929F` · `zinc-500 #767A87` · `zinc-600 #4A4D57` · `zinc-700 #2C2E35` · `zinc-800 #1A1B20` · `zinc-900 #0E0F12` · `zinc-950 #070709`.

## Texto (contraste sobre preto)

| Papel | Hex | Contraste |
|---|---|---|
| Primário | `#FFFFFF` | 21:1 |
| Secundário (`zinc-400`) | `#8E929F` | 6.6:1 |
| Muted (`zinc-500`) | `#767A87` | 4.6:1 |
| Branco sobre marinho `#1D3557` | `#FFFFFF` | 12.9:1 |

`zinc-600` e abaixo só para elementos não textuais.

## Estados semânticos

Sucesso `#73D083` · Atenção `#E1AD57` · Perigo `#FF968A` · Drop-set `#A78BFA` (violeta) · Aquecimento `#FBBF24`.

Fadiga muscular (mapa de recuperação): rampa térmica `--color-heat-0..3` (#121C33, #2B4A7A, #8EA6D6, #F4F7FF), de marinho frio (fresco) a branco gelo (fadigado), com halo branco desfocado acima de 35%. Nunca vermelho nem laranja.

## Tipografia editorial (4 tamanhos mobile)

| Token | Tamanho | Uso |
|---|---|---|
| `text-title-xl` + `font-heading font-bold tracking-tight` | 28/32 | Título de tela / pergunta |
| `text-section` + `font-heading font-semibold` | 17/22 | Cabeçalho de secção |
| `text-body` | 15/22 | Texto corrido |
| `text-micro uppercase tracking-wider text-zinc-400` | 11/16 | Rótulos, telemetria |

- Títulos: Plus Jakarta Sans (`font-heading`). Métricas grandes: Barlow Condensed (`font-display`). Corpo: Inter.
- Números (cronómetros, cargas, séries, biometria): sempre `tabular-nums`.

## Movimento

- Easing de saída: `cubic-bezier(0.22, 1, 0.36, 1)`. Molas: `stiffness 300, damping 28`.
- Toque: `scale(0.98)`. Respeitar `prefers-reduced-motion` (`MotionConfig reducedMotion="user"`).
- Carregamento: skeleton em `bg-surface` com shimmer subtil, nunca spinner genérico.

## Ícones

`lucide-react`, `strokeWidth={1.75}`. Ícone de secção dentro de um contentor 36×36 `bg-white/[0.04] border border-white/[0.06] rounded-xl`.
