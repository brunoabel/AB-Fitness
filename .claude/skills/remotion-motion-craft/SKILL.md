---
name: remotion-motion-craft
description: Direção de movimento para os Reels do AB Fitness feitos com o template Remotion do /marketing-man (tools/marketing/reel-template). Use antes de montar o storyboard, o reel.props.json ou mexer no Reel.jsx: ritmo com micro-cortes no tempo da narração, câmera sutil (zoom/pan), springs e curvas com clamp, uma camada de texto curta por cena, safe zones do Instagram Reels e a estética Luxury Performance Dark Mode. Vale também para OpenMotion e HyperFrames quando o destino é um Reel do @abfitness_app.
---

# Remotion Motion Craft (AB Fitness)

Regras de direção para Reels 1080x1920 a 30fps. A skill global `remotion-motion-graphics` continua valendo para técnica (springs, `OffthreadVideo`, tempo derivado de `fps`, verificação por frames). **Onde ela manda pôr fundo em mesh, grain, vinheta ou gradiente, esta skill ganha: o fundo do AB Fitness é preto puro.**

## 1. Pipeline real (não invente outro)

| Etapa | Ferramenta | Observação |
| --- | --- | --- |
| Narração | `python3 tools/marketing/narrate.py <pasta>/narration.spec.json` | `"mode": "single"` (texto inteiro numa chamada, entonação contínua) + `"maxGap": 0.38`. Gera `narration.wav`, `narration.captions.json` (tempo por palavra) e `narration.timing.json` |
| 3D | `node tools/marketing/grade-3d.mjs <r2.mp4> <pasta>/g-<nome>.mp4` | fundo branco → preto, corpo marinho, músculo claro. **Nunca use o mp4 cru do R2 no Reel** |
| App | `node tools/marketing/capture-ui.mjs --out <pasta>/ui-<nome>.png ...` | captura real em Dark Mode (dev server `ab-fitness-dev`). `--storage` para reproduzir um estado real |
| Render | `node tools/marketing/render-reel.mjs <pasta>/reel.props.json` | normaliza áudio, entrega yuv420p + faststart |
| QA | skill `video-frame-qa` | obrigatória depois de todo render |

### Narração que não soa robótica
- Frases inteiras com pontuação natural. Nada de lista picotada ("tronco, barra, braço").
- `rate` entre `+0%` e `+5%`. Acima de `+8%` a voz atropela.
- Vozes: `pt-BR-ThalitaMultilingualNeural` (padrão atual), `pt-BR-AntonioNeural`, `pt-BR-FranciscaNeural`. As `pt-PT-*` têm sotaque de Portugal: não use em conteúdo PT-BR.
- ` | ` dentro da frase força a quebra do bloco de legenda naquele ponto e não vai para a voz. Use para não deixar palavra órfã ("recuperam.").
- Na dúvida sobre a voz, gere amostras curtas em `vozes/` e deixe o utilizador ouvir antes do render final.

## 2. Ritmo e micro-cortes

- Planos de **1,5s a 3s**. O primeiro plano (gancho) tem no máximo 1,8s.
- **Corte no tempo da fala:** cada corte cai no início de um bloco de `narration.captions.json` (tolerância ±0,15s). Calcule os `seconds` das cenas a partir desses tempos, não no olho.
- Nunca mais de 3s sem mudança visual (corte, troca de direção do zoom ou pan).
- Planos vizinhos sempre mudam algo: ângulo (costas ↔ 3/4), escala (fechado ↔ aberto) ou tipo de mídia (3D ↔ app). Dois planos quase iguais em sequência parecem engasgo.
- Duração total = fim da última palavra + 0,2s a 0,3s. A peça termina com fade para o preto, sem frame congelado.
- Mapa padrão para Reel de 15s a 17s:

| Trecho | Conteúdo |
| --- | --- |
| 0s a 3s | gancho: 3D fechado no músculo com punch-in + primeira frase |
| 3s a 9,5s | 2 ou 3 planos 3D alternando ângulo e escala |
| 9,5s a 14s | 2 telas reais do app (a primeira entra com `rise`) |
| 14s ao fim | `cta` com 3D escurecido rodando atrás |

## 3. Câmera e curvas

Valores aceitos pelo template (`reel.props.json`):

| Cena | Campos | Faixa recomendada |
| --- | --- | --- |
| `video3d` | `src` (sempre `g-*.mp4`), `startFrom` (frames), `zoom: [de, para]`, `focusX`, `focusY` | zoom entre 1,0 e 1,9; variação de 0,12 a 0,35 por plano; alterne aproximar e afastar entre planos vizinhos |
| `ui` | `src`, `pan: [y0, y1]` em px da captura 1170x2532, `rise` | pan que termina no dado citado pela fala; `rise: true` só na primeira tela do app |
| `cta` | `src` (3D de fundo a 38%), `startFrom`, `logo`, `url` | a linha do CTA acende sozinha no tempo da narração |
| `image` / `title` | `src` / `kicker` + `headline` | `title` esconde a legenda; evite em Reel narrado |

- Gancho: punch-in começando fechado (`zoom` ~1,8) e abrindo, com `focusY` ~0,36 no dorsal.
- Entradas usam `spring({ damping: 200, mass: 0.4 a 0.7 })`. Movimento contínuo usa a curva cúbica de saída (`EASE`) do template. Todo `interpolate` leva `extrapolateLeft/Right: 'clamp'`.
- Transição padrão: crossfade de 6 frames + escala 1,03 → 1 (`XFADE` no `Reel.jsx`). Proibido: whip, glitch, flash, zoom blur, wipe colorido.
- Movimento mínimo: toda mídia na tela por mais de 1,5s tem zoom ou pan ativo. O `cta` mantém o 3D rodando até o fade final.

## 4. Texto e safe zones

```
y 0    a 250    topo: interface do Instagram, nada de texto
y 280  a 1360   mídia (3D sem cartão em 1080x1080; app em painel escuro 1000 de largura)
y 1370 a 1545   legenda (uma camada, sem caixa)
y 1570 a 1920   base: legenda do post e botões, nada de texto
x 960  a 1080   coluna de botões à direita, nada de texto
texto sempre em x 64 a 960
```

- **Uma camada de texto por cena.** Em cenas narradas, essa camada é a legenda. Nada de título repetindo a frase falada.
- Blocos de até 5 palavras (`"maxWords": 5` no spec), no máximo 2 linhas, Plus Jakarta Sans 800 em 70px, palavra falada em branco e as próximas a 38%.
- Sem caixa escura atrás da legenda e sem ponto final no fim do bloco (o template remove).
- `cta` e `title` escondem a legenda: o próprio lockup é a camada.

## 5. Estética obrigatória

- Fundo `#000000`. Superfícies e acentos dos tokens de `src/index.css`: surface `#070709`, marinho `#0a1128` / `#0f172a`, accent `#1d3557`, filete `rgba(255,255,255,0.08)`. Tipografia Plus Jakarta Sans branca.
- **Proibido:** stick figure ou esquema desenhado, cartão ou moldura branca em volta de vídeo/imagem, laranja, âmbar, ciano, gradiente decorativo ou glow colorido, grain, vinheta, emoji, mockup ou dado inventado.
- O destaque muscular vem do `grade-3d.mjs` (branco azulado). Se aparecer vermelho ou laranja no frame, o asset cru escapou.
- Toda prova de produto é uma captura real do app, nunca uma tela desenhada.

## 6. Checklist antes de renderizar

- [ ] `narration.spec.json` em `mode: single`, rate ≤ +5%, duração da fala dentro da pauta
- [ ] Todo `video3d` e `cta` aponta para `g-*.mp4` (tratado), nunca para o mp4 cru ou a URL do R2
- [ ] `seconds` das cenas batem com os blocos de `narration.captions.json` e a soma fica até 0,3s depois da última palavra
- [ ] Cada cena muda ângulo, escala ou tipo de mídia em relação à anterior
- [ ] Pan das telas do app termina no dado que a fala cita
- [ ] Depois do render: skill `video-frame-qa`
