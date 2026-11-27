# Auditoria Técnica Pré-Deploy — AB Fitness

**Data:** 2026-11-27
**Commit auditado:** `d8310e506400f591701cb179c2a22d5d8bcbab05` (`main`)
**Stack:** Vite `8.3.0` + React `19.2.8` (JS/ESM, SPA) + Tailwind CSS `4.3.3` + Supabase (`@supabase/supabase-js` `2.117.3`, PostgreSQL + RLS + Edge Functions Deno) + Vercel Serverless Functions (`api/`).

---

## 1. Veredito de Deploy

**`GO` (Após Correção dos Lotes 1, 2 e 3)**

Todos os **4 achados P0 (Blockers)**, **6 P1**, **7 P2** e **3 P3** aplicáveis foram corrigidos no código, na base de dados Supabase (via migration `20261139_pre_deploy_audit_hardening`) e na Edge Function `ab-coach` (v31 `ACTIVE`).

> Nota P2-5 (tokens em `localStorage`): foi aplicada a parte SQL/RLS (`athlete_posts` e `post_respects` em `TO authenticated`) e autenticação JWT obrigatória nos 4 endpoints `/api/*-token`. A migração completa dos refresh tokens de wearables para storage apenas server-side (HTTP-only cookies / tabela cifrada) fica registada como melhoria futura de hardening sem impacto funcional no deploy atual.

### Verificações Finais Pós-Correção
- `npm run lint`: **OK (`exit 0`, 0 erros, 2 warnings em `scripts/`)**
- `npm test`: **OK (`exit 0`, 191/191 testes em 54 suites)**
- `npm run build`: **OK (`exit 0`, Vite + prerender legal + sitemap/robots)**
- Supabase SQL: políticas `trainer_templates_insert_own` (`coach`/`admin`/`ceo`), `athlete_posts_*` e `post_respects_all` (`authenticated`), RPC `get_friend_posts(int)` e tabela `stripe_webhook_events` verificadas em produção.
- Edge Function `ab-coach`: versão **31** (`ACTIVE`) com fallback `gemini-2.5-flash-lite`.

---

## 2. Resumo dos Comandos Automáticos

| Verificação | Comando | Resultado | Detalhes |
|---|---|---|---|
| Typecheck | `tsc --noEmit` | `N/A` | Projeto JavaScript puro (sem `tsconfig.json` / TypeScript). |
| Lint global | `npm run lint` (`oxlint`) | **FALHA (`exit 1`)** | 21 erros (`no-undef`: `process`/`Buffer`) e 6 warnings fora da app (`video/scripts/**`, `tools/marketing/**`, `scripts/`). |
| Lint app + API | `npx oxlint src api` | **OK (`exit 0`)** | 0 erros e 0 warnings em 241 ficheiros. |
| Testes unitários | `npm test` (`node --test`) | **OK (`exit 0`)** | 186/186 testes passaram em 52 suites (`0` falhas). |
| Build de produção | `npm run build` | **OK (`exit 0`)** | `vite build` (328 ms) + `scripts/prerender_legal.mjs` concluídos sem erros. |
| Case-sensitivity & Deps | Verificação Node em `src/` e `api/` | **OK** | 0 imports com mismatch de capitalização (Linux-safe) e 0 pacotes não declarados em `package.json`. |
| Git status | `git status -sb` | **Atenção** | `.gitignore` modificado localmente + pastas untracked de marketing/tooling (`.claude/commands/`, `marketing/`, `tools/`, `scripts/publish-instagram.mjs`). |

### Diff de Variáveis de Ambiente vs `.env.example`

Variáveis referenciadas no código e **ausentes** de `.env.example`:
- `VITE_MEDIA_BASE_URL` (`src/main.jsx:27`)
- `GEMINI_API_KEY` (`supabase/functions/ab-coach/index.ts:557`)
- `GEMINI_MODEL` (`supabase/functions/ab-coach/index.ts:568`)
- `SITE_URL` (`scripts/prerender_legal.mjs:11`)

---

## 3. Tabela Resumo dos 20 Itens

| ID | Categoria | Status | Severidade Máx | Ocorrências |
|---|---|---|---|---|
| 1 | RLS e controlo de acesso na BD | FALHA | P0 | 3 (`trainer_templates` sem CEO/admin; join `profiles` bloqueado no feed de fotos; `athlete_posts`/`post_respects` com role `public`) |
| 2 | Segredos e chaves no client-side | FALHA | P2 | 1 (tokens OAuth de wearables guardados em texto claro em `localStorage`; zero `service_role`/`sk_live` em `src/`) |
| 3 | Validação só no frontend / IDOR | FALHA | P0 | 4 (`stripe-checkout` sem allowlist de `priceId` + trial infinito; `stripe-webhook` ignora erro DB e quebra rotação `v1`; 4 endpoints OAuth sem JWT) |
| 4 | Loops de autenticação e middleware | OK | - | 0 (SPA sem middleware SSR; listener `onAuthStateChange` com cleanup correto) |
| 5 | Erros de hidratação (SSR) | N/A | - | 0 (SPA `createRoot` sem SSR/hydration; páginas legais estáticas substituídas no mount) |
| 6 | Loops infinitos / churn em `useEffect` | FALHA | P2 | 2 (`useRunGpsWatch.js` reinicia `setInterval` via `currentFix`; `SetRow.jsx` chama `onChange` dentro de updater de estado sob StrictMode) |
| 7 | Race conditions em pedidos assíncronos | FALHA | P1 | 2 (`App.jsx` callback OAuth de wearables corre antes de `user?.id` resolver; `DirectMessageSheet.jsx` sem lock de duplo clique) |
| 8 | Estado obsoleto / fontes duplicadas | FALHA | P1 | 1 (`socialService.js` + `DirectMessageSheet.jsx` duplicam permanentemente todas as DMs enviadas e travam o poll após falha) |
| 9 | Memory leaks | FALHA | P3 | 1 (`SocialHub.jsx` `flash()` cria `setTimeout` sem limpeza; `useWakeLock`, `RunningHub`, `SetRow` e `RestTimer` limpam corretamente) |
| 10 | Dados mockados esquecidos | FALHA | P3 | 1 (`wearableManager.js` mantém `mode = 'simulated'` como default e fallback no `else if`, embora a UI só exponha OAuth) |
| 11 | Queries N+1 e falta de paginação | FALHA | P2 | 4 (`workoutService.js` fallback admin e `fetchAthleteDetails` com `select('*')` sem `limit`; `trainerService.js` e `socialService.js` sem `limit`) |
| 12 | Falhas silenciosas (Swallowed Errors) | FALHA | P0 | 3 (`api/stripe-webhook.js` ignora `{ error }` do Supabase; `sendDirectMessage` e `DirectMessageSheet` engolem erro de envio; `listUserPosts`/`listFeedPosts` têm `catch {}`) |
| 13 | Desalinhamento de schema / consultas | FALHA | P1 | 1 (`listFeedPosts` faz join `profiles:user_id(...)` que retorna `null` sob RLS atual de `profiles`) |
| 14 | Fusos horários e datas | FALHA | P2 | 2 (`wearableManager.js` e geradores de wearables usam `toISOString().slice(0, 10)` em UTC; `AdminDashboard.jsx` export CSV usa UTC) |
| 15 | Versões misturadas e APIs alucinadas | FALHA | P0 | 1 (`ab-coach/index.ts` e `bundle_edge_function.js` usam fallback `"gemini-3.5-flash-lite"`) |
| 16 | Regressões silenciosas | FALHA | P1 | 1 (`DailyBriefing.jsx` não foi atualizado no commit `4bb673a` e ignora Strava e Garmin no cálculo de prontidão) |
| 17 | Lógica duplicada e fragmentação | FALHA | P3 | 1 (constantes hardcoded `DEFAULT_SUPABASE_URL`/`ANON_KEY` duplicadas entre `src/lib/supabase.js` e `api/og-athlete.js`) |
| 18 | Edge cases ignorados (Happy Path Bias) | OK | - | 0 (acessos protegidos com optional chaining, `Array.isArray` e `maybeSingle`; 186 testes verdes) |
| 19 | Layout quebrado em mobile e overflow | FALHA | P2 | 2 (`RunningMap.jsx` usa `calc(100vh - 24px)` em fullscreen móvel; `src/index.css` usa `100vh` sem `100dvh`) |
| 20 | Falhas exclusivas de produção | FALHA | P1 | 3 (`npm run lint` falha em `video/scripts`; `vercel.json` CORS global `GET,OPTIONS,HEAD` com `*` em `/api/*`; `.env.example` incompleto) |

---

## 4. Achados Detalhados (Ordenados de P0 a P3)

### P0 — Blockers (Impedem Deploy)

#### [P0-1] Checklist #3 e #12 — Webhook Stripe engole erros de BD e devolve HTTP 200
- **Localização:** `api/stripe-webhook.js:104-155`
- **Problema & Impacto Real:** Todas as chamadas `await supabase.from('profiles').update(...).eq(...)` ignoram o objeto `{ error }` retornado pelo `@supabase/supabase-js`. Em erros de PostgREST, trigger ou rede, o cliente Supabase não lança exceção; a função responde `200 { received: true }`, a Stripe considera o evento entregue (não faz retry) e o cliente que pagou nunca recebe `is_pro = true`.
- **Correção Recomendada:** Capturar `const { error } = await supabase.from('profiles').update(...)` em cada ramo do `switch`; se `error`, registar log estruturado e responder HTTP `500` para a Stripe reenviar o webhook.

#### [P0-2] Checklist #3 — `priceId` arbitrário e trial Stripe de 14 dias ilimitado
- **Localização:** `api/stripe-checkout.js:68, 85`
- **Problema & Impacto Real:** A linha 68 aceita `const priceId = body.priceId || DEFAULT_PRICE_ID` diretamente do cliente sem validação contra uma allowlist de preços do servidor. Qualquer utilizador autenticado pode iniciar checkout com qualquer Price ID da conta Stripe e receber `is_pro = true` no webhook. Além disso, a linha 85 aplica `subscription_data[trial_period_days] = 14` incondicionalmente em todos os checkouts sem verificar `profiles.trial_granted_at` ou subscrição anterior, permitindo trials gratuitos repetidos indefinidamente.
- **Correção Recomendada:** Ignorar `body.priceId` (ou validar contra uma allowlist explícita de env vars do servidor como `[DEFAULT_PRICE_ID]`) e consultar `profiles.trial_granted_at` / `stripe_customer_id` antes de incluir `subscription_data[trial_period_days]`.

#### [P0-3] Checklist #1 — Política RLS `trainer_templates_insert_own` bloqueia CEO e Admin
- **Localização:** `supabase/migrations/20261113_trainer_hub.sql:300-304` (confirmado em `pg_policies` na base de dados em produção)
- **Problema & Impacto Real:** A política exige `p.role = 'coach'` exclusivamente, omitindo `'admin'` e `'ceo'`. No entanto, `src/context/AuthContext.jsx:218` concede acesso de Personal Trainer ao CEO (`isTrainer = isCeo || profileRole === 'coach'`) e `redeem_trainer_invite_code` já aceita `('coach', 'admin', 'ceo')`. Ao tentar guardar um modelo de treino no Trainer Hub, a conta CEO falha com erro Postgres `42501`.
- **Correção Recomendada:** Criar nova migration alterando `trainer_templates_insert_own` para `p.role IN ('coach', 'admin', 'ceo')`.

#### [P0-4] Checklist #15 — Fallback de modelo Gemini inexistente na Edge Function do AB Coach
- **Localização:** `supabase/functions/ab-coach/index.ts:568` e `scripts/bundle_edge_function.js:453`
- **Problema & Impacto Real:** O código define `const model = Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash-lite";`. Se o secret `GEMINI_MODEL` não estiver configurado no projeto Supabase, a Edge Function envia pedidos para um identificador de modelo inexistente na API Gemini (`v1beta`), provocando erro 404 em todas as conversas e análises do AB Coach.
- **Correção Recomendada:** Trocar o fallback por um modelo estável verificado na API Gemini (ex.: `gemini-2.5-flash-lite` ou `gemini-2.5-flash`) em ambos os ficheiros e garantir `GEMINI_MODEL` nos Supabase Secrets.

---

### P1 — Alto

#### [P1-1] Checklist #7 — Race condition no callback OAuth de wearables impede persistência na nuvem
- **Localização:** `src/App.jsx:217-269`
- **Problema & Impacto Real:** Ao regressar de `/auth/callback/wearable?code=...&state=...`, o `useEffect` executa no primeiro mount antes de `AuthContext` concluir `supabase.auth.getSession()`. O código remove imediatamente as chaves de estado do `sessionStorage` (linhas 228-231), troca o `code` e invoca `connectWearable(user?.id, ...)` com `user?.id === undefined` (linha 253). Em `src/services/wearables/wearableManager.js:167`, `canSyncUser(undefined)` é `false`, pelo que a ligação e os tokens nunca são gravados em `public.wearable_connections` e o URL é limpo com `replaceState` antes do `user` existir.
- **Correção Recomendada:** Aguardar `!loading` (de `useAuth()`) antes de processar `/auth/callback/wearable` e usar uma `useRef` de guarda (`processedRef`) para executar a troca exatamente uma vez já com `user?.id` resolvido.

#### [P1-2] Checklist #8 e #12 — Mensagens diretas (DMs) duplicam permanentemente e travam polling em falha
- **Localização:** `src/services/socialService.js:526-559` e `src/components/social/DirectMessageSheet.jsx:57, 72-88`
- **Problema & Impacto Real:**
  1. `sendDirectMessage` grava `newMsg` em `localStorage` com `id: "msg_<timestamp>_..."` (linhas 530-543), insere no Supabase e atualiza apenas `newMsg.id = data.id` em memória (linha 553) sem reescrever o `localStorage`. No poll seguinte (4 s), `listDirectMessages` (`socialService.js:515`) junta `localMsgs` e `data` por `id` num `Map`, gerando duas cópias permanentes de cada mensagem enviada.
  2. Erros do `INSERT` são engolidos (`catch {}` na linha 555) e `DirectMessageSheet.jsx:84` não trata `{ error }`. Se falhar, a mensagem otimista fica na lista e faz `prev.length` exceder o servidor; como o poll só atualiza quando `data.length > prev.length` (linha 57), a resposta seguinte do amigo fica invisível.
  3. `handleSend` não tem guarda `isSending`, permitindo envios duplicados por duplo clique nas reações rápidas ou Enter.
- **Correção Recomendada:** Persistir em `localStorage` apenas após receber o UUID real do servidor (ou substituir o registo temporário no storage pelo UUID real), devolver `{ data: null, error }` quando o `INSERT` falhar, reverter a mensagem otimista na UI com aviso visual, comparar último `id`/timestamp no poll em vez de apenas `length`, e adicionar lock `sending`.

#### [P1-3] Checklist #1 e #13 — Join de `profiles` no feed de fotos retorna `null` para amigos
- **Localização:** `src/services/socialService.js:439-453`
- **Problema & Impacto Real:** `listFeedPosts()` consulta `.from('athlete_posts').select('*, profiles:user_id(username, full_name, avatar_url, is_verified, role)')`. A tabela `public.profiles` só possui políticas SELECT para o próprio utilizador (`profiles_select_own`) e para o seu Personal Trainer (`profiles_select_trainer`). Assim, nos posts de amigos, o objeto `sp.profiles` vem `null` e o cabeçalho do post perde nome, `@username`, avatar e selo verificado.
- **Correção Recomendada:** Criar uma RPC `SECURITY DEFINER` (`get_friend_posts(max_items int)`) seguindo o mesmo padrão seguro de `get_friend_feed`, devolvendo apenas os campos públicos permitidos do autor para amigos aceites.

#### [P1-4] Checklist #3 e #20 — Endpoints OAuth de wearables sem autenticação e CORS global restritivo em `/api/*`
- **Localização:** `api/whoop-token.js:15-93`, `api/fitbit-token.js:15-91`, `api/strava-token.js:15-91`, `api/garmin-token.js:15-91`, `vercel.json:31-37`
- **Problema & Impacto Real:** Os 4 endpoints serverless aceitam `POST` de qualquer cliente anónimo na internet (sem validar JWT do Supabase nem rate limit), atuando como proxy público que anexa o `CLIENT_SECRET` da aplicação. Além disso, `vercel.json:33-34` injeta `Access-Control-Allow-Origin: *` e `Access-Control-Allow-Methods: GET,OPTIONS,HEAD` em `/(.*)`, omitindo `POST` nos headers globais das rotas `/api/*`.
- **Correção Recomendada:** Validar o header `Authorization: Bearer <supabase_jwt>` nos 4 endpoints `api/*-token.js` (e passar o token nos serviços `src/services/wearables/*Service.js`), e restringir os headers CORS em `vercel.json` ao domínio `https://www.abfitness.app` com `POST` permitido em `/api/(.*)`.

#### [P1-5] Checklist #16 — Regressão silenciosa: `DailyBriefing` ignora Strava e Garmin
- **Localização:** `src/components/DailyBriefing.jsx:36`
- **Problema & Impacto Real:** No commit `4bb673a` foram adicionados Strava e Garmin em `WearableReadinessCard.jsx:32-37` e `wearableManager.js`, mas `DailyBriefing.jsx:36` continuou a passar apenas `{ whoop, fitbit }` para `computeReadinessIndex`. Utilizadores com Garmin ou Strava veem prontidão na faixa de wearables mas o briefing diário ignora completamente esses sensores.
- **Correção Recomendada:** Passar `strava: conns.strava ? bios.strava : null` e `garmin: conns.garmin ? bios.garmin : null` na chamada `computeReadinessIndex` em `src/components/DailyBriefing.jsx:36`.

#### [P1-6] Checklist #20 — `npm run lint` falha com `exit 1` por ficheiros auxiliares não configurados
- **Localização:** `.oxlintrc.json:16-30` (`video/scripts/voice-candidates.mjs:14` e scripts irmãos)
- **Problema & Impacto Real:** Qualquer pipeline de CI que corra `npm run lint` falha com 21 erros (`no-undef` em `process` e `Buffer` dentro de `video/scripts/**`) e 6 warnings (`tools/marketing/`, `video/src/`, `scripts/`), mascarando eventuais regressões em `src/` e `api/`.
- **Correção Recomendada:** Adicionar `video/scripts/**` aos overrides com `"env": { "node": true }` ou adicionar `"ignorePatterns": ["video/**", "tools/**", "marketing/**"]` em `.oxlintrc.json` para que `npm run lint` audite a aplicação de produção com saída limpa.

---

### P2 — Médio

#### [P2-1] Checklist #3 — Verificação de assinatura Stripe falha durante rotação de segredo e sem idempotência
- **Localização:** `api/stripe-webhook.js:36-44, 99-161`
- **Problema & Impacto Real:** `verifyStripeSignature` reduz `sigHeader.split(',')` num objeto simples (`acc[k] = v`), sobrescrevendo entradas repetidas `v1=`. Quando o webhook secret é rodado na Stripe, o header traz múltiplos `v1=` e apenas o último é validado. Não há ainda dedupe por `event.id` nem tratamento explícito de `invoice.payment_failed`.
- **Correção Recomendada:** Recolher todos os valores `v1` num array (`v1Signatures.push(v)`) e aceitar se qualquer assinatura coincidir via `crypto.timingSafeEqual`; adicionar tabela `stripe_webhook_events(event_id PK)` para idempotência.

#### [P2-2] Checklist #14 — Data UTC em vez de data local na sincronização de wearables
- **Localização:** `src/services/wearables/wearableManager.js:242` (e defaults em `whoopService.js:141`, `fitbitService.js:132`, `stravaService.js:142`, `garminService.js:122`)
- **Problema & Impacto Real:** Usa `new Date().toISOString().slice(0, 10)` apesar de o projeto já ter `localDateKey()` em `src/utils/dateKey.js` especificamente para evitar que o dia vire às 21:00 no Brasil (UTC-3). Sincronizações noturnas gravam a biometria no dia seguinte em `athlete_biometrics`.
- **Correção Recomendada:** Substituir por `localDateKey()` importado de `../../utils/dateKey.js`.

#### [P2-3] Checklist #6 — Churn de `setInterval` na simulação GPS e `setState` no pai dentro de updater em `SetRow`
- **Localização:** `src/hooks/useRunGpsWatch.js:231, 257` e `src/components/SetRow.jsx:103-107`
- **Problema & Impacto Real:**
  1. `useRunGpsWatch.js:257` inclui `currentFix` nas dependências do `useEffect` que chama `setCurrentFix(smoothedStart)` na linha 231, destruindo e recriando o `setInterval` logo no arranque da simulação (e a cada atualização de `currentFix`).
  2. `SetRow.jsx:103-107` chama `onChange({ seconds: nextSec, reps: nextSec })` dentro do callback updater de `setHoldTimerSeconds`. Sob `<StrictMode>` (`src/main.jsx:18`), React executa updaters duas vezes, gerando chamadas duplicadas e aviso de atualização de componente durante renderização.
- **Correção Recomendada:** Em `useRunGpsWatch.js`, ler o fix inicial a partir de um `ref` (`currentFixRef`) removendo `currentFix` das deps. Em `SetRow.jsx`, manter o contador num `ref` (`holdSecRef.current += 1`), chamar `setHoldTimerSeconds(nextSec)` e `onChange(...)` diretamente no callback do `setInterval`, fora do updater.

#### [P2-4] Checklist #11 — Queries `SELECT *` sem paginação/limite
- **Localização:** `src/services/workoutService.js:646-669, 694-710`, `src/services/trainerService.js:104-112, 240-248`, `src/services/socialService.js:419-422`
- **Problema & Impacto Real:** `fetchAthleteDetails` (`workoutService.js:700-709`) e o fallback de `fetchAdminAthletesData` (`workoutService.js:647, 658, 668`) executam `.select('*')` sem `.limit()` sobre tabelas que crescem continuamente (`workout_sessions`, `exercise_logs`, `profiles`). `listTemplates`, `listAssignedProgramsForAthlete` e `listUserPosts` também não têm `.limit()`.
- **Correção Recomendada:** Selecionar apenas colunas necessárias e aplicar `.limit()` explícito (ex.: `limit(50)` em `fetchAthleteDetails` e `listUserPosts`, `limit(100)` em templates/programas, e remover ou limitar a `200` o fallback legacy do admin).

#### [P2-5] Checklist #1 e #2 — Políticas RLS com role `public` e tokens OAuth de wearables em `localStorage`
- **Localização:** `public.athlete_posts` e `public.post_respects` (confirmado em `pg_policies`); `src/services/wearables/wearableManager.js:56, 159`
- **Problema & Impacto Real:**
  1. `athlete_posts` e `post_respects` aplicam políticas a `roles: ["public"]` com `auth.uid()` sem subselect `(SELECT auth.uid())`, destoando do endurecimento `TO authenticated` aplicado às restantes tabelas.
  2. `wearableManager.js` persiste `access_token` e `refresh_token` de WHOOP/Fitbit/Strava/Garmin em `localStorage`, aumentando o raio de impacto caso ocorra qualquer XSS.
- **Correção Recomendada:** Migrar as políticas de `athlete_posts` e `post_respects` para `TO authenticated` com `(SELECT auth.uid())`, e armazenar apenas metadados não sensíveis (status, `provider`, `last_synced_at`) em `localStorage`, movendo a renovação/leitura de tokens para endpoint serverless autenticado.

#### [P2-6] Checklist #19 — Uso de `100vh` em vez de `100dvh` em mapa expandido e raiz CSS
- **Localização:** `src/components/RunningMap.jsx:661` e `src/index.css:209`
- **Problema & Impacto Real:** Em Safari iOS e Chrome Android, `100vh` inclui a altura da barra de endereços retrátil; ao expandir o mapa (`calc(100vh - 24px)`), os controlos inferiores do mapa ficam parcialmente ocultos ou provocam scroll indesejado.
- **Correção Recomendada:** Trocar para `calc(100dvh - 24px)` em `RunningMap.jsx:661` e adicionar `min-height: 100dvh;` após `min-height: 100vh;` em `src/index.css:209`.

#### [P2-7] Checklist #20 — `.env.example` incompleto face às variáveis usadas em produção
- **Localização:** `.env.example:1-24`
- **Problema & Impacto Real:** Faltam `VITE_MEDIA_BASE_URL`, `GEMINI_API_KEY`, `GEMINI_MODEL` e `SITE_URL`, aumentando o risco de deploys incompletos por outro engenheiro ou novo ambiente.
- **Correção Recomendada:** Documentar as 4 variáveis em `.env.example` indicando claramente quais são de build Vercel vs Supabase Secrets.

---

### P3 — Baixo

#### [P3-1] Checklist #10 — Modo simulado como default em `wearableManager.js`
- **Localização:** `src/services/wearables/wearableManager.js:144, 312-320`
- **Problema & Impacto Real:** Embora `WearablesModal.jsx` só ofereça ligação OAuth real, `connectWearable(..., mode = 'simulated')` e o bloco `else if` de `syncWearableData` ainda geram biometria fictícia se forem invocados sem `access_token` (ex.: se o token desaparecer do cache).
- **Correção Recomendada:** Restringir geração simulada explicitamente a `conn?.status === 'simulated'` (nunca como fallback implícito quando `status === 'connected'` sem token).

#### [P3-2] Checklist #9 e #14 — `setTimeout` sem cleanup em toast e nome de CSV em UTC
- **Localização:** `src/components/social/SocialHub.jsx:230-233` e `src/components/AdminDashboard.jsx:181`
- **Problema & Impacto Real:** Chamadas sucessivas a `flash()` em menos de 2,2 s fazem o primeiro timer limpar a segunda mensagem cedo (e não há limpeza no unmount). O nome do CSV de waitlist usa data UTC.
- **Correção Recomendada:** Guardar o timer de `flash()` num `useRef` com `clearTimeout` prévio e no unmount; usar `localDateKey()` em `AdminDashboard.jsx:181`.

#### [P3-3] Checklist #17 — Constantes de fallback Supabase duplicadas
- **Localização:** `src/lib/supabase.js:4-5` e `api/og-athlete.js:3-4`
- **Problema & Impacto Real:** `DEFAULT_SUPABASE_URL` e `DEFAULT_SUPABASE_ANON_KEY` estão duplicadas em dois ficheiros. Embora a anon key seja pública por desenho, dificulta apontar ambientes de staging sem alterar código.
- **Correção Recomendada:** Em produção, exigir variáveis de ambiente em `api/og-athlete.js` ou centralizar a configuração de fallback num único módulo partilhado.

---

## 5. Plano de Correção em Lotes

- **Lote 1 — Blockers P0 (Segurança, Stripe, RLS CEO e AB Coach):**
  1. Corrigir `api/stripe-webhook.js` (verificar `{ error }` em todos os updates, devolver `500` em falha, suportar múltiplos `v1=` na assinatura).
  2. Endurecer `api/stripe-checkout.js` (allowlist de `priceId` no servidor e validação de elegibilidade de trial via `trial_granted_at`).
  3. Criar e aplicar migration SQL para `trainer_templates_insert_own` aceitar `('coach', 'admin', 'ceo')` e endurecer `athlete_posts`/`post_respects` para `TO authenticated`.
  4. Corrigir fallback `GEMINI_MODEL` em `supabase/functions/ab-coach/index.ts` e `scripts/bundle_edge_function.js` e redeploy da Edge Function.

- **Lote 2 — P1 (Wearables OAuth, Social/DMs, DailyBriefing e Lint CI):**
  1. Corrigir race condition do callback OAuth de wearables em `src/App.jsx` (aguardar `!loading`).
  2. Corrigir duplicação de DMs, tratamento de erro e duplo clique em `src/services/socialService.js` e `src/components/social/DirectMessageSheet.jsx`.
  3. Criar RPC `get_friend_posts` para resolver join `profiles` nulo em `listFeedPosts()`.
  4. Exigir JWT Supabase nos 4 endpoints `api/*-token.js` e ajustar CORS em `vercel.json`.
  5. Adicionar Strava e Garmin em `src/components/DailyBriefing.jsx:36`.
  6. Ajustar `.oxlintrc.json` para `npm run lint` passar com 0 erros.

- **Lote 3 — P2/P3 (Datas, Hooks, Paginação, Mobile e Limpeza):**
  1. Trocar `toISOString().slice(0, 10)` por `localDateKey()` em `wearableManager.js`, serviços de wearables e `AdminDashboard.jsx`.
  2. Corrigir `useRunGpsWatch.js` (`currentFix` ref) e `SetRow.jsx` (`onChange` fora do updater).
  3. Adicionar `.limit()` e projeções explícitas em `workoutService.js`, `trainerService.js` e `socialService.js`.
  4. Trocar `100vh` por `100dvh` em `RunningMap.jsx` e `src/index.css`, completar `.env.example`, limpar `flash()` em `SocialHub.jsx` e restringir fallback simulado em `wearableManager.js`.
