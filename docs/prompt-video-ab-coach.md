# Prompt: vídeo de apresentação do AB Coach (motion graphics com Remotion)

Copia tudo abaixo da linha para uma sessão nova do Claude Code aberta na raiz do projeto AB Fitness.

---

## Papel

És um diretor de motion graphics e engenheiro de vídeo programático. Vais produzir, com código, um vídeo explicativo da app AB Fitness apresentado pelo AB Coach (o mascote/avatar oficial). O vídeo é para pessoas leigas: nunca treinaram com uma app, não conhecem termos como "série", "RPE" ou "PR". No fim do vídeo, a pessoa tem de saber o que a app faz, por onde começar e porque vale a pena.

## Ferramenta obrigatória: Remotion + skill oficial

1. Usa **Remotion** (vídeo feito em React, renderizado para MP4). É a ferramenta de motion graphics desta tarefa.
2. Antes de escrever código, instala as skills oficiais do Remotion com `npx skills add remotion-dev/skills` (repo github.com/remotion-dev/skills) e lê `remotion-best-practices` (em especial `voiceover.md`, `sfx.md`, `audio.md` e `get-audio-duration.md`) e `remotion-captions`. Para o som, instala também `npx skills add elevenlabs/skills` (skills `text-to-speech`, `sound-effects`, `music`). Se alguma skill não estiver disponível, lê a documentação de `useCurrentFrame`, `interpolate`, `spring`, `Sequence`, `Series`, `TransitionSeries`, `Img`, `staticFile`, `Audio` e do CLI de render antes de começar.
3. Não inventes APIs nem versões. Verifica em `node_modules` ou na documentação.
4. Toda a animação é determinística e baseada em frame (`useCurrentFrame` + `interpolate`/`spring`). Proibido CSS transitions, `setTimeout`, `requestAnimationFrame`, Framer Motion ou GSAP dentro do vídeo.

## Isolamento do projeto

- Cria o projeto de vídeo numa pasta própria: `video/` na raiz, com o seu próprio `package.json`. Não toques em `src/`, no `package.json` da app nem no build do Vite.
- Copia os assets necessários para `video/public/` e carrega-os com `staticFile()`.

## Assets que já existem (usa estes, não geres outros avatares)

Avatar do AB Coach (render 3D estilo animação, rapaz com cabelo encaracolado, casaco navy com "AB", fundo preto):

| Ficheiro | Pose | Uso no vídeo |
|---|---|---|
| `public/coach/ab-coach-hello.jpg` | a acenar | abertura e despedida |
| `public/coach/ab-coach-wide.jpg` | plano médio, a sorrir, 16:9 | narração principal |
| `public/coach/ab-coach-thinking.jpg` | a pensar | apresentar um problema / pergunta |
| `public/coach/ab-coach-checkin.jpg` | check-in | perguntar ao utilizador como está |
| `public/coach/ab-coach-celebrate.jpg` | dedo no ar, confettis | conquistas, recordes, final |
| `public/coach/ab-coach-rest.jpg` | descanso | descanso entre séries / recuperação |
| `public/coach/ab-coach-512.jpg` | recorte quadrado | avatar em balão de conversa |

Ecrãs reais da app:

- `public/screens/1-dashboard.png`, `2-biomechanics.png`, `3-workout.png`, `4-running.png`, `5-badges.png`
- `public/ab-logo-white.png` (logo sobre fundo escuro)
- Se precisares de mais ecrãs (AB Coach em conversa, mapa de recuperação muscular, temporizador de descanso, amigos), captura-os da app a correr em viewport mobile 390x844 com `puppeteer-core` (já é devDependency do projeto). Usa dados de demonstração, nunca dados reais de utilizadores.

Abre e olha para cada imagem antes de a usar. Respeita a orientação e o recorte reais de cada uma.

## Como animar um avatar que é uma imagem estática

O avatar não fala nem mexe a boca. Dá-lhe vida com motion graphics, não com lip-sync falso:

- **Respiração:** escala 1.00 para 1.015 em loop lento (ciclo de ~3 s, seno sobre o frame).
- **Ken Burns subtil:** push-in de 3 a 6 % ao longo da cena, com leve deriva lateral.
- **Troca de pose:** crossfade de 8 a 10 frames entre poses, com um pequeno "salto" de escala (spring) para parecer reação.
- **Entrada:** recorte circular ou máscara a revelar de baixo para cima, com spring (`stiffness 300, damping 28`).
- **Fala:** balão de diálogo ao lado do avatar com texto a aparecer palavra a palavra, sincronizado com a narração. Um indicador de "a falar" (3 barras brancas a oscilar) junto ao avatar enquanto há voz.
- **Fundo do avatar:** os JPG têm fundo preto. Coloca-os sobre o canvas `#000000` e funde as bordas com uma vinheta radial preta, para não se ver o retângulo da imagem.

## Formato

- Principal: **vertical 1080x1920, 30 fps**, para Reels, TikTok e Shorts.
- Secundário (mesmos componentes, layout adaptado): 1920x1080 para YouTube e site. Organiza as composições para que só mude o layout, não o conteúdo.
- Duração alvo: **60 a 75 segundos**. Nenhuma cena com mais de 9 s sem uma mudança visual.
- Zonas seguras verticais: nada importante nos 220 px de cima nem nos 380 px de baixo (interface das redes sociais).

## Identidade visual (STYLESEED, obrigatório)

- Canvas preto puro `#000000`, superfícies `#070709`, marinho `#0A1128` / `#0F172A`, marinho de destaque `#1D3557` com borda `#2B4A7A`.
- Branco puro `#FFFFFF` para títulos, números, progresso e o único CTA.
- Texto secundário `#8E929F`. Bordas `rgba(255,255,255,0.08)`.
- Sucesso `#73D083`. Drop-set violeta `#A78BFA` (só se aparecer drop-set).
- **Proibido:** ciano, laranja, dourado, glow, box-shadow colorido, gradientes decorativos, emojis.
- Tipografia: Plus Jakarta Sans (títulos), Barlow Condensed (números grandes, `tabular-nums`), Inter (legendas). Carrega-as com `@remotion/google-fonts` e confirma o nome do pacote antes.
- Easing de saída `cubic-bezier(0.22, 1, 0.36, 1)` (usa `Easing.bezier(0.22, 1, 0.36, 1)` no `interpolate`). Molas `stiffness 300, damping 28`.
- Centraliza estes tokens num único `video/src/theme.js`. Nada de hex espalhado pelos componentes.

## Linguagem para leigos (regra mais importante do roteiro)

- Fala como um amigo que treina, não como um manual. Frases curtas, máximo 12 palavras por legenda.
- Cada termo técnico é traduzido na primeira vez: "série (cada vez que repetes o exercício seguido)", "recorde pessoal (o teu melhor de sempre)".
- Uma ideia por cena. Mostra primeiro o benefício, depois o botão.
- Português de Portugal, coerente com a app ("ecrã", "telemóvel", "registar").
- Legendas sempre visíveis (muita gente vê sem som): Inter 56 px no vertical, branco sobre faixa `#070709` a 85 %, com a palavra-chave em destaque num chip marinho `#1D3557`.

## Roteiro base (ajusta tempos ao áudio final)

| # | Tempo | Pose | O que o Coach diz (legenda) | Motion graphics |
|---|---|---|---|---|
| 1 | 0-4 s | hello | "Olá! Eu sou o AB Coach." | Logo AB a desenhar-se em branco, avatar entra com spring, acena |
| 2 | 4-10 s | thinking | "Queres treinar mas não sabes por onde começar?" | 3 dúvidas em cartões a cair e empilhar ("Que exercício?", "Quanto peso?", "Estou a evoluir?") |
| 3 | 10-16 s | wide | "Eu monto o teu plano em menos de um minuto." | Cartões dissolvem-se e viram um plano semanal; checkmarks brancos dia a dia |
| 4 | 16-25 s | wide | "Abres o treino e eu mostro-te cada exercício." | Mockup de telemóvel com `3-workout.png`, zoom no exercício, anel de toque branco a carregar num botão |
| 5 | 25-32 s | wide | "Vês o movimento certo, para não te lesionares." | `2-biomechanics.png`, linhas guia a traçar o movimento, setas a apontar a postura |
| 6 | 32-38 s | rest | "Entre séries, eu conto o descanso por ti." | Temporizador circular branco a esvaziar, números grandes Barlow a contar |
| 7 | 38-45 s | wide | "Também gostas de correr? Registo a tua corrida." | `4-running.png`, rota a desenhar-se no mapa (stroke-dashoffset por frame), km a subir |
| 8 | 45-52 s | checkin | "Pergunto como te sentes e ajusto o treino." | Balão de chat com o avatar 512, resposta a aparecer, plano a mudar com transição suave |
| 9 | 52-60 s | celebrate | "Cada evolução vira conquista." | `5-badges.png`, medalha a desbloquear com scale spring, número de recorde a subir, confettis brancos e marinho (sem dourado) |
| 10 | 60-68 s | hello | "Eu sou o AB Coach. Bora começar?" | Avatar + logo + CTA branco "Experimenta grátis" com texto preto, pulsar subtil de escala |

## Linguagem de motion graphics

- **Mockup de telemóvel** feito em código (retângulo arredondado preto, borda `rgba(255,255,255,0.12)`, notch), com o ecrã real dentro. Nada de mockups com marcas de terceiros.
- **Foco guiado:** quando se fala de um botão, escurece o resto do ecrã a 60 % e recorta o elemento com um retângulo branco de 2 px que se desenha à volta.
- **Toques simulados:** círculo branco a 30 % que encolhe e desaparece, sempre 6 frames antes da mudança de ecrã.
- **Números:** contam com `interpolate` + `Math.round`, sempre `tabular-nums`, para não tremer.
- **Transições entre cenas:** usa `@remotion/transitions` (slide, wipe ou fade), 12 a 15 frames. Escolhe uma família e mantém-na.
- **Ritmo:** cada cena tem 1 movimento principal e no máximo 2 secundários. Se tudo se mexe, nada se destaca.
- **Composição vertical:** avatar no terço superior, telemóvel/visual no centro, legenda na zona segura inferior.

## Áudio

O áudio é a base do ritmo: **a voz manda na duração das cenas, não o contrário.**

### 1. Voz do AB Coach (ElevenLabs, seguindo `voiceover.md` da skill do Remotion)

- A chave fica em `video/.env` como `ELEVENLABS_API_KEY` (adiciona `video/.env` ao `.gitignore`). Nunca a escrevas no código nem no chat. Se não existir, pede-ma.
- Cria `video/scripts/generate-voiceover.mjs`: lê `script.json`, chama a API de text-to-speech da ElevenLabs uma vez por cena e grava `video/public/voiceover/<cena>.mp3`. Só regenera cenas cujo texto mudou (guarda um hash por cena).
- Modelo `eleven_multilingual_v2` (fala português). Antes de gerar tudo, propõe-me 3 vozes masculinas jovens e enérgicas com sotaque de Portugal da Voice Library, gera a cena 1 com cada uma e espera que eu escolha. Grava o `voiceId` escolhido no `script.json`.
- Tom: amigo motivador, ritmo calmo para leigos. Começa com `stability 0.5, similarity_boost 0.75, style 0.3` e ajusta se soar robótico.
- Escreve o texto falado a pensar no ouvido: números por extenso quando ajudar ("três séries"), sem siglas.
- Usa `calculateMetadata` + `getAudioDuration` para que cada cena dure o áudio dela + 12 frames de respiro, e a composição some o total. Nada de durações escritas à mão.

### 2. Legendas sincronizadas com a voz

- Gera timestamps palavra a palavra seguindo a skill `remotion-captions` (transcrição do MP3 gerado) e usa-os para o texto do balão e das legendas aparecerem exatamente quando a palavra é dita.
- O indicador "a falar" junto ao avatar só anima nos frames em que há voz.

### 3. Efeitos sonoros (seguindo `sfx.md`)

- Usa `<Audio>` de `@remotion/media`. Da lista da skill, só sons neutros e premium: `whoosh` (transições), `mouse-click` ou `switch` (toques no ecrã), `ding` (conquista), `page-turn` (mudança de secção). Proibidos os sons de meme da lista.
- Se faltar algum som (desbloqueio de medalha, contagem do temporizador), gera-o com a skill `sound-effects` da ElevenLabs ou procura em github.com/kapishdima/soundcn. Descarrega para `video/public/sfx/` em vez de depender de URLs externos no render.
- Volume dos SFX entre 0.25 e 0.4, sempre por baixo da voz.

### 4. Música de fundo

- Instrumental, eletrónica leve e motivadora, ~110 BPM, sem voz. Gera com a skill `music` da ElevenLabs ou usa um ficheiro que eu fornecer. Confirma comigo que o meu plano permite uso comercial antes de usar no vídeo final.
- Volume base 0.15, fade in de 1 s, fade out de 2 s, e ducking para 0.06 enquanto o Coach fala (volume como função do frame no `<Audio>`).
- Os cortes de cena principais caem no tempo forte da música sempre que possível.

### 5. Mistura e verificação

- Renderiza primeiro só a cena 1 com áudio e confirma: voz clara, música audível mas nunca a competir, sem cliques no início/fim dos ficheiros.
- No render final, áudio AAC 48 kHz. Ouve o vídeo inteiro antes de entregar.

## Estrutura técnica

```
video/
  src/
    Root.jsx              composições: AbCoachVertical (1080x1920) e AbCoachWide (1920x1080)
    theme.js              tokens STYLESEED, fontes, easing, springs
    script.json           roteiro: id, pose, legenda, duração em frames, ecrã
    scenes/               uma cena por ficheiro (Scene01Hello.jsx ...)
    components/           CoachAvatar, SpeechBubble, PhoneMockup, Caption, TapRing, FocusRing, CountUp, Confetti
  public/                 avatares e ecrãs copiados
```

- JavaScript + React (sem TypeScript, coerente com o projeto), salvo se o template do Remotion o exigir; nesse caso avisa-me antes.
- As cenas leem do `script.json`, para que eu possa mudar texto e tempos sem mexer em animação.
- Duração total calculada a partir do `script.json`, não escrita à mão.

## Processo de trabalho

1. Lê este prompt, carrega a skill do Remotion, olha para todos os assets.
2. Mostra-me um storyboard: um still (`npx remotion still`) do frame-chave de cada cena. Para aqui e espera a minha aprovação.
3. Implementa as cenas. Depois de cada 2 ou 3 cenas, renderiza stills e confirma: legendas legíveis, nada fora da zona segura, nenhuma cor fora da paleta, avatar sem borda de retângulo visível.
4. Abre o Remotion Studio para eu rever o vídeo inteiro.
5. Só depois da minha aprovação, renderiza o MP4 final (H.264, CRF ~18) para `video/out/ab-coach-vertical.mp4` e `video/out/ab-coach-wide.mp4`.

## Checklist final antes de entregar

- [ ] Uma pessoa que nunca usou uma app de treino percebe o que fazer só com as legendas, sem som.
- [ ] Todos os termos técnicos foram explicados na primeira aparição.
- [ ] Só cores do STYLESEED. Zero ciano, laranja, dourado, glow ou emojis.
- [ ] Avatar sempre com movimento subtil, nunca congelado mais de 1 s.
- [ ] Nenhum dado pessoal real nos ecrãs.
- [ ] Animação 100 % baseada em frame (render repetido dá o mesmo resultado).
- [ ] App em `src/` intacta; tudo novo vive em `video/`.
- [ ] Licença do Remotion verificada para o meu caso de uso (empresa vs. uso individual) e indicada no README de `video/`.
