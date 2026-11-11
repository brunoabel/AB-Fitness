# Vídeo de apresentação do AB Coach

Vídeo explicativo da app AB Fitness, apresentado pelo AB Coach, feito em código com Remotion (React).
Vive isolado nesta pasta: não mexe em `src/`, no `package.json` da app nem no build do Vite.

- `AbCoachVertical`: 1080x1920, 30 fps (Reels, TikTok, Shorts)
- `AbCoachWide`: 1920x1080, 30 fps (YouTube, site)

As duas composições usam as mesmas cenas; só o layout muda (`src/layout.js`).

## Começar

```bash
cd video
npm install
npm run studio          # abre o Remotion Studio
```

## Voz (ElevenLabs)

1. Cria `video/.env` (já está no `.gitignore`) a partir de `.env.example`:
   `ELEVENLABS_API_KEY=...`
2. `npm run voice:candidates` procura vozes masculinas jovens com sotaque de Portugal na Voice Library
   e gera a cena 1 com as 3 melhores em `public/voiceover/candidates/`. Ouve e escolhe:
   `npm run voice:candidates -- --choose <voiceId>` (grava o `voiceId` no `src/script.json`).
3. `npm run voice` gera um MP3 por cena com `eleven_multilingual_v2` e os tempos palavra a palavra
   (endpoint `with-timestamps`), no formato `Caption` do `@remotion/captions`.
   Só regenera as cenas cujo texto, voz ou definições mudaram (hash por cena em `manifest.json`).

Sem voz gerada, o vídeo usa tempos estimados para o ritmo de fala. Assim que os MP3 existem,
o `calculateMetadata` mede cada um (mediabunny) e cada cena passa a durar o áudio dela + 12 frames
de respiro. Os cortes são ajustados para cair num tempo da música (110 BPM).

Definições de voz em `src/script.json` (`voiceSettings`): stability 0.5, similarity_boost 0.75, style 0.3.
Se soar robótico, baixa a stability para 0.4 e volta a correr `npm run voice -- <id-da-cena>`.

## Música

Antes de usar no vídeo final, confirma que o teu plano ElevenLabs permite uso comercial. Depois:
`npm run music -- --confirm-commercial 75`. Também podes pôr um ficheiro teu em `public/music/bg.mp3`
e ligar `"music": {"file": "music/bg.mp3", "bpm": 110}` no `script.json`.
Volume 0.15, fade in 1 s, fade out 2 s, ducking para 0.06 enquanto o Coach fala.

## Efeitos sonoros

Em `public/sfx/`, locais (o render não depende de URLs externos), volume 0.25 a 0.4:
`switch`/`click` (toques), `tick` (temporizador e vistos), `ding` (recorde), `unlock` (medalha),
`page-turn` (plano), `whoosh` (transições, sintetizado com ffmpeg).
Origem: Kenney Interface Sounds, licença CC0 (ver `public/sfx/KENNEY-LICENSE.txt`), via soundcn.

## Editar texto e tempos

Tudo em `src/script.json`: `lines` (legendas, máx. 12 palavras cada, também é o texto falado),
`speech` (opcional, se o texto falado tiver de ser diferente), `keyword` (chip marinho na legenda),
`pose`, `screen` e `extraFrames` (tempo extra para o visual depois da voz). Não há durações à mão.

## Storyboard e render

```bash
npm run storyboard           # stills do frame-chave de cada cena em out/storyboard/vertical
npm run storyboard:wide
npm run render:vertical      # out/ab-coach-vertical.mp4 (H.264, CRF 18, AAC)
npm run render:wide          # out/ab-coach-wide.mp4
```

O áudio sai em AAC a 48 kHz.

## Notas de design

- Tokens STYLESEED só em `src/theme.js`. Os ecrãs reais da app aparecem em monocromático, porque os
  screenshots atuais ainda têm ciano e dourado; recapturar os ecrãs com o novo design resolve isto.
- Fontes Plus Jakarta Sans, Barlow Condensed e Inter carregadas de ficheiros locais (`public/fonts`,
  licença OFL) com `@remotion/fonts`, para o render não depender do Google Fonts.
- Animação 100 % baseada em frame (`useCurrentFrame`, `interpolate`, `spring`); confettis com `random()`
  de semente fixa. Render repetido dá o mesmo resultado.
- Dados nos ecrãs e nos cartões são de demonstração (percurso, cargas, recorde).

## Licença do Remotion

O Remotion é gratuito para indivíduos e para organizações com até 3 pessoas, incluindo uso comercial.
Empresas com 4 ou mais pessoas precisam de uma Company License (remotion.pro).
Caso de uso deste projeto: POR CONFIRMAR. Se o AB Fitness é um projeto individual ou de uma equipa
com até 3 pessoas, aplica-se a Free License; com 4 ou mais pessoas, é preciso comprar a Company License.
Referências: https://www.remotion.dev/docs/license e https://www.remotion.dev/docs/license/faq
