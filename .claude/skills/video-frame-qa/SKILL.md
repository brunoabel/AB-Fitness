---
name: video-frame-qa
description: Inspeção visual obrigatória de frames depois de renderizar qualquer vídeo do AB Fitness (Reels do /marketing-man, Remotion, OpenMotion, HyperFrames). Use logo após o render e antes de mostrar o preview ou pedir aprovação: extrai frames-chave em grade (abertura, meio de cada cena, cada corte, CTA, fim), mede laranja/âmbar, cartão branco, frames pretos, tela parada e loudness, e guia a leitura visual de cada frame. Também quando o utilizador pedir para revisar, checar ou validar um render.
---

# Video Frame QA (AB Fitness)

Um render só vai para o utilizador depois que você **olhou** os frames. O `review-video.mjs` confere codec, resolução e duração; esta skill confere o que se vê. As duas rodam, nesta ordem, em todo render.

## 1. Rodar

```bash
node tools/marketing/review-video.mjs tmp/marketing/current/reel.mp4      # técnico: ffprobe + 5 frames com zonas
node tools/marketing/frame-qa.mjs tmp/marketing/current/reel.mp4          # visual: grade de frames-chave + medições
```

`frame-qa.mjs` lê `reel.props.json` da mesma pasta para achar os cortes exatos (ou `--props <arquivo>`). Sem props, detecta as mudanças de cena sozinho. Saída em `tmp/marketing/current/qa/`:

| Arquivo | Para quê |
| --- | --- |
| `sheet.jpg` | grade 5 por linha, leitura em Z, na ordem da legenda impressa no terminal |
| `zones-sheet.jpg` | mesma grade com topo 250px, base 350px e direita 120px em vermelho |
| `frames/NN-<rótulo>.jpg` | cada frame em 540x960, para olhar de perto |
| `report.json` | rótulos, tempos e medições |

Código de saída 2 = falha automática. Corrija e renderize de novo antes de qualquer outra coisa.

## 2. Medições automáticas (o script decide)

| Medição | Regra | Causa comum |
| --- | --- | --- |
| Laranja/âmbar (matiz 8° a 50°) | falha acima de 0,1% da área em qualquer frame | vídeo 3D do R2 sem passar pelo `grade-3d.mjs` |
| Área quase branca | aviso acima de 6% | 3D cru (fundo branco) ou mídia dentro de cartão branco |
| Frame preto | falha fora do fade final (últimos 0,35s) | cena sem asset, `startFrom` além do fim do vídeo |
| Tela parada ≥ 1,2s | falha | CTA estático, imagem sem zoom/pan, vídeo que acabou antes da cena |
| Loudness | aviso fora de -14 ± 1,5 LUFS | áudio não passou pelo `render-reel.mjs` |

Medição verde não aprova nada sozinha. Ela só libera a inspeção visual.

## 3. Inspeção visual (você decide, frame a frame)

Abra com Read, nesta ordem: `qa/sheet.jpg`, `qa/zones-sheet.jpg` e qualquer `qa/frames/*.jpg` em que a grade deixar dúvida. Para cada frame, responda:

**Texto**
- [ ] No máximo uma camada de texto. Legenda + título repetindo a mesma frase = falha.
- [ ] Nenhum texto encosta nas faixas vermelhas do `zones-sheet.jpg`. Texto que faz parte de uma captura do app conta como mídia, mas não pode ficar atrás da coluna de botões da direita na metade de baixo.
- [ ] Legenda legível no celular: bloco de até 5 palavras, no máximo 2 linhas, sem caixa escura por trás.
- [ ] Nada cortado na borda, nenhuma palavra órfã sozinha numa linha.

**Mídia**
- [ ] 3D integrado ao preto: corpo em marinho, músculo em destaque claro, sem fundo branco, sem vão branco ou azul claro entre as barras da máquina, sem buraco preto no corpo (coluna, ombros).
- [ ] Telas do app são capturas reais (`capture-ui.mjs`), em Dark Mode, enquadradas no dado que a narração cita (ex.: a linha "Costas 49%" aparece quando a fala diz "recuperam").
- [ ] Nenhum stick figure, esquema desenhado, mockup inventado ou ilustração genérica.

**Ritmo e transições** (frames `corte-*`)
- [ ] O corte é um crossfade limpo de ~0,2s. Fantasma de dois planos por mais de um frame da grade = transição longa demais.
- [ ] Planos vizinhos mudam de enquadramento (zoom, ângulo ou tipo de mídia). Dois planos quase iguais em sequência parecem engasgo.
- [ ] O frame `abertura` já mostra o gancho (imagem forte + texto aparecendo). Tela vazia em 0,1s = gancho fraco.

**Fim**
- [ ] O frame da cena `cta` tem movimento de fundo ou de entrada, e `fim` ainda mostra o lockup antes do fade para o preto.
- [ ] O vídeo termina até ~0,3s depois da última palavra. Sobra maior = tela parada.

**Estética AB Fitness**
- [ ] Fundo `#000000`, acentos marinho, tipografia Plus Jakarta Sans branca.
- [ ] Zero laranja, âmbar ou ciano. Zero gradiente decorativo, glow colorido, grain ou vinheta.

## 4. Fechar o QA

- Qualquer item marcado como falha: corrija na causa (props, template, asset), renderize de novo e rode as duas etapas do passo 1 outra vez. Nunca conserte só a grade.
- Ao apresentar o preview, cite no resumo: saída do `review-video.mjs`, linha final do `frame-qa.mjs` e o que você conferiu na grade, incluindo os avisos que decidiu aceitar e por quê.
- Nunca descreva um frame que você não abriu.
