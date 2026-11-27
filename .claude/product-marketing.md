# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-11-23

> Fonte única de contexto de marca para `/marketing-man` e todas as skills de marketing. Tudo aqui foi tirado do código (`src/`, `api/`, `index.html`, `src/index.css`, `CLAUDE.md`, `STYLESEED.md`). O que o código não define está marcado **[NÃO DEFINIDO]**: nunca preencher com suposição em peça nenhuma.

## Product Overview
**One-liner:** App de treino de musculação, corrida e recuperação muscular, com AB Coach e um Trainer Hub para Personal Trainers acompanharem os seus alunos.
**What it does:** Regista cargas e séries com sobrecarga progressiva, mostra um mapa de recuperação por região muscular com protocolos de mobilidade, faz corrida com GPS e junta tudo num perfil de atleta com conquistas e comunidade. O Personal Trainer convida alunos por código, prescreve programas e vê aderência, esforço e dor reportada de cada um.
**Product category:** App de treino / registo de musculação e corrida (PWA instalável).
**Product type:** PWA (Vite + React), instalável no telemóvel. Não existe build nativo nem listagem em App Store/Google Play no repositório.
**Business model:** Freemium com plano **AB Fitness PRO** por subscrição Stripe, 14 dias grátis (`TRIAL_DAYS = 14`). Preço: **[NÃO DEFINIDO]** no código (vem do `STRIPE_PRO_PRICE_ID`, só aparece no checkout). Nunca citar valor.
**Estado de lançamento:** `PRIVATE_LAUNCH_MODE = true`. O app está fechado: entram `admin`, `ceo`, `coach` e alunos com vínculo ativo a um PT. Os restantes caem na lista de acesso antecipado (waitlist com link de convite). CTA público hoje = entrar na lista, não "baixe agora".

## Target Audience
**Target companies:** B2B: Personal Trainers independentes que acompanham alunos à distância ou em presencial. B2C: atletas e alunos de musculação, híbridos e corredores.
**Decision-makers:** B2B: o próprio PT (papel `coach`). B2C: o atleta.
**Primary use case:** B2C: treinar com carga certa e saber quando um músculo está recuperado. B2B: acompanhar a carteira de alunos sem folhas de cálculo nem WhatsApp.
**Jobs to be done:**
- Registar a sessão rápido e ver se a carga está a subir.
- Saber que região muscular ainda não recuperou antes de treinar.
- (PT) Ver quem treinou, quem reportou dor e quem sumiu, e prescrever o próximo bloco.
**Use cases (objetivos do onboarding real):** Hipertrofia Muscular · Força & Powerlifting · Atleta Híbrido & Desportos · Corrida & Resistência GPS.

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Personal Trainer (`coach`) | Aderência e segurança dos alunos | Acompanhar vários alunos fora da sessão | Trainer Hub: atletas ativos, treinaram hoje, aderência 7d, alertas de dor/RPE/inatividade, prescrição e relatório PDF mensal |
| Aluno vinculado a PT | Seguir o plano do PT e dar feedback | Saber o que fazer hoje e comunicar dor | Programa "Prescrito pelo PT" no app + check-in pós-treino (esforço 1-10, dor) |
| Atleta autónomo | Progredir sem lesão | Escolher carga e gerir recuperação sozinho | Sobrecarga progressiva, mapa de recuperação, AB Coach, mesociclo PRO |
| Corredor / híbrido | Volume de corrida + força | Juntar corrida e ginásio num só sítio | Corrida com GPS, mapa e cartão de partilha no mesmo app |

## Problems & Pain Points
**Core problem:** Treinar sem saber se a carga está a progredir nem se o músculo já recuperou; PT sem visibilidade do que o aluno faz entre sessões.
**Why alternatives fall short:** **[NÃO DEFINIDO]** no código. Não afirmar fraquezas de concorrentes sem pesquisa citada (skill `competitor-profiling`).
**What it costs them:** **[NÃO DEFINIDO]** (sem dados de utilizadores). Não inventar números.
**Emotional tension:** **[NÃO DEFINIDO]**. Validar com pesquisa ou comentários reais antes de usar.

## Competitive Landscape
**[NÃO DEFINIDO]** no repositório. Preencher só com pesquisa datada e com fonte.

## Differentiation (funcionalidades que existem no código)
**Key differentiators:**
- **Catálogo de exercícios com vídeo 3D anatómico:** 375 exercícios em `EXERCISE_CATALOG`, 170 com vídeo auditado (`VERIFIED_EXERCISE_VIDEOS`). Vídeos no R2, avatar anatómico com o músculo trabalhado destacado. Manuais de atleta e biomecânica por exercício.
- **Mapa de recuperação muscular:** 13 regiões musculares, planos por região (13) e 39 drills de recuperação/mobilidade.
- **Sobrecarga progressiva e mesociclo:** registo de séries/cargas, gráficos de progressão, calculadora de discos, timer de descanso. PRO: mesociclo de 5 semanas com RIR alvo por semana e deload planeado.
- **AB Coach:** assistente no app. Gratuito: 5 mensagens/dia. PRO: até 50/dia.
- **Trainer Hub (B2B):** código de convite, roster com notas e etiquetas, construtor de programas (carga, descanso, superséries/bi-sets), alertas (Dor reportada, RPE alto, Sem treinar há +4d), contexto do atleta (sessões e volume 7d, recuperação, restrições articulares, wearable), relatório mensal em PDF. Aluno que se vincula a um PT recebe 14 dias de PRO.
- **Corrida com GPS:** HUD ao vivo, mapa, resumo e cartão de partilha.
- **Wearables:** Whoop, Garmin, Fitbit e Strava alimentam um índice de prontidão.
- **Comunidade:** feed do clube, ranking de squad, head-to-head, mensagens diretas, Athlete Pass com 14 temas, 16 badges, marcos de sequência.
**How we do it differently:** Treino, corrida, recuperação e acompanhamento do PT no mesmo app, com a mesma base de dados do atleta.
**Why customers choose us:** **[NÃO DEFINIDO]** (sem entrevistas ou reviews). Não afirmar.

## Objections
| Objection | Response |
|-----------|----------|
| "Quanto custa?" | 14 dias grátis; o preço aparece no checkout antes de confirmar. Não citar valor. |
| "Posso usar já?" | Lançamento privado: lista de acesso antecipado, convites por ordem da fila. |

**Anti-persona:** **[NÃO DEFINIDO]**.

## Switching Dynamics
**[NÃO DEFINIDO]**. Preencher após pesquisa ou entrevistas.

## Customer Language
**How they describe the problem / us:** **[NÃO DEFINIDO]**. Nenhuma citação real recolhida. Proibido inventar depoimentos.
**Words to use (vocabulário real do app):** sobrecarga progressiva, carga, série, RIR, RPE, deload, mesociclo, recuperação muscular, região muscular, drill, Trainer Hub, prescrever, aderência, check-in, AB Coach, Athlete Pass, squad.
**Words to avoid:** "IA"/"inteligência artificial" em legenda de Instagram (regra do `/marketing-man`); "transforme sua vida", "seja sua melhor versão", "revolucionário", "game changer", "desbloqueie seu potencial"; qualquer número de utilizadores, resultados ou preço.
**Glossary:**
| Term | Meaning |
|------|---------|
| PT | Personal Trainer (papel `coach` no app) |
| RIR | Reps in reserve, alvo semanal do mesociclo |
| RPE | Esforço percebido 1-10, recolhido no check-in pós-treino |
| Athlete Pass | Cartão de identidade do atleta, partilhável, 14 temas |
| AB Coach | Assistente do app (mascote em `public/coach/`) |

## Brand Voice
| Attribute | Means | Doesn't mean | Example line (código) |
|-----------|-------|--------------|------------------------|
| Direto | Frase curta, verbo à frente | Seco ou rude | "Como foi a sessão?" |
| Técnico | Usa o termo certo (RIR, deload, RPE) com contexto | Jargão para impressionar | "Mesociclo de 5 semanas com RIR alvo por semana e deload planeado" |
| Honesto | Só promete o que já existe | Prometer feature por lançar | "Só o que o PRO desbloqueia hoje no app" (comentário em `ProUpgradeSheet.jsx`) |
| Editorial | Pouco texto, hierarquia forte, tom de revista de desporto | Texto decorativo ou slogan vazio | "Sobrecarga Progressiva" / "Motor Biomecânico" |

**Tone by context:**
- Social: atlético, de quem treina de verdade, gancho concreto nos primeiros 125 caracteres.
- Launch: factual, mostra a interface real, um benefício por cena.
- Errors/Support: calmo e prático ("Tenta novamente").
- Sales (B2B): fala de aderência, alertas e tempo do PT, sem métricas inventadas.
**Zero clichê de IA:** nada de "não é X, é Y", listas "sem X, sem Y, sem Z", frases que terminam em cadeia de vírgulas, emojis em excesso, travessões.

### Idioma (regra fixa)
- **Peças brasileiras (`@abfitness_app` padrão): 100% PT-BR** ("você", "celular", "tela", "treino", "baixar").
- **Peças globais: 100% EN.**
- Nunca misturar variantes nem idiomas na mesma peça.
- **Atenção:** a UI e o site estão em **PT-PT** ("Registe", "Tenta novamente", "Inicia sessão", "ecrã"; `og:locale` pt_PT). Numa peça PT-BR, texto de interface reconstruída em vídeo/carrossel deve evitar telas com marcas de PT-PT visíveis em destaque; se a tela for indispensável, avisar o utilizador antes em vez de "traduzir" a UI em silêncio.

## Brand & Visual Constraints (Luxury Performance Dark Mode)
- **Paleta (tokens de `src/index.css`):** canvas `#000000` (`bg-app`), superfície `#070709` (`bg-surface`), Deep Midnight Navy `#0A1128` (`bg-surface-2`), `#0F172A` (`bg-surface-3`), `#1D3557` (`accent`), `#2B4A7A` (`accent-hover`). CTA branco (`bg-primary text-app`). Progresso, ativo e PR em branco.
- **Exceções de cor já usadas no app (só com significado):** violeta = drop-set, emerald = sucesso, rosa/vermelho = perigo/dor.
- **Tipografia real do app:** Plus Jakarta Sans (títulos e métricas, `font-heading`/`font-display`) e Inter (corpo). **Barlow Condensed não existe no repositório**: só usar em vídeo/carrossel se o `.woff2` for adicionado localmente e aprovado.
- **Layout:** suíço/editorial, grelha precisa, texto centrado nos vídeos, uma caixa só quando é unidade tocável ou o container único da secção.
- **Logo oficial:** `public/ab-logo.png` (PNG) ou `public/pwa-icon.svg` (SVG). `ab-logo-white.png` foi removida.
- **Vídeos 3D:** originais com fundo branco 1920x1080; em peças, sempre recoloridos para fundo preto e corpo marinho (`tools/marketing/grade-3d.mjs`), sem cartão nem moldura.
- **Proibições absolutas:**
  - laranja, âmbar e ciano (inclusive em realces de músculo e sinais de alerta em peças de marketing);
  - cartão branco solto sobre o Dark Mode, e cartão branco que cresce e vira fundo de cena;
  - stick figures e ilustrações desenhadas de corpo;
  - gradientes genéricos de IA, mesh, grain, vinheta, partículas, confete, sombra colorida;
  - dados reais de utilizadores (nomes, fotos, cargas, mensagens); usar perfis fictícios;
  - números de utilizadores, resultados ou preços não confirmados.

## Proof Points
**Metrics:** **[NÃO DEFINIDO]**. Só são citáveis contagens de produto verificadas no código: 375 exercícios no catálogo, 170 com vídeo 3D auditado, 13 regiões musculares, 39 drills de recuperação, 16 badges, 14 temas do Athlete Pass, 4 integrações de wearable.
**Customers:** **[NÃO DEFINIDO]**.
**Testimonials:** nenhum. Proibido inventar.
**Value themes:**
| Theme | Proof |
|-------|-------|
| Técnica de execução | Vídeo 3D real do catálogo (conferido por frame) |
| Recuperação | Tela real do mapa de recuperação |
| Progressão | Tela real de gráficos de progressão / mesociclo |
| Acompanhamento PT | Tela real do Trainer Hub com dados fictícios |

## Goals
**Business goal:** Crescer a lista de acesso antecipado e trazer Personal Trainers para o Trainer Hub durante o lançamento privado.
**Conversion action:** Entrar na lista VIP (link na bio) / PT pedir acesso.
**Current metrics:** `@abfitness_app` sem insights disponíveis (Graph API erro 10, falta permissão). **[NÃO DEFINIDO]**.

## Paid Ads (optional)
Não há campanhas pagas configuradas. **Agent may not (without approval):** gastar créditos, lançar, pausar ou publicar anúncios.

## Learnings
*Decisions and tested lessons. Newest first.*
| Date | Learning | Evidence | Applies to | Status |
|------|----------|----------|------------|--------|
| 2026-11-22 | Reel rejeitado por stick figure, cartão branco em volta do vídeo 3D, realce laranja, headline que repete a legenda, caixa escura de legenda, cortes secos, end card estático e TTS robótico | 3 rodadas rejeitadas do Reel da puxada | Vídeo, Reels | active |
| 2026-11-14 | Zero ciano e zero laranja, sem exceção | Decisão do utilizador (redesign) | Todas as peças | active |

## Changelog
*Newest first.*
- v1 (2026-11-23) — Initial context, auto-draft do código para unificar as skills do `/marketing-man`.
