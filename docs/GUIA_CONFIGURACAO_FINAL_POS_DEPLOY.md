# Guia Passo a Passo Pós-Deploy: AB Fitness

Projeto Vercel: `bafitness` (`https://www.abfitness.app`)  
Projeto Supabase: `tegdtjmglvrvgerrtivx`

Este guia explica tudo o que já está ativo em produção e os passos manuais exatos para ativar pagamentos Stripe, vídeos offline no Cloudflare R2, credenciais OAuth de wearables e abertura ao público.

---

## 1. O que já está 100% pronto e ativo

### Base de Dados & Edge Functions (Supabase)
- **Migrations `20261130` a `20261138` aplicadas e verificadas:**
  - `20261130_runs_muscle_fatigue.sql` + `20261137_weighted_muscle_fatigue.sql`: motor `compute_muscle_fatigue` com ponderação por esforço (RPE), intensidade (faixa de repetições), modulação por prontidão wearable (`athlete_biometrics`), exclusão de aquecimentos (`set_type = 'W'`) e impacto de corridas GPS em quadríceps, posteriores e gémeos. Usado em `get_muscle_fatigue` e `get_athlete_recovery_for_trainer`.
  - `20261131_pro_trial_and_stripe.sql`: colunas `trial_ends_at` e `stripe_customer_id` em `public.profiles`.
  - `20261132_wearables_strava_garmin.sql`: constraints alargadas em `wearable_connections` e `athlete_biometrics` para aceitar `'whoop'`, `'fitbit'`, `'strava'`, `'garmin'` e `'composite'`.
  - `20261133_trainer_b2b2c_trial_and_biometrics.sql`: RPC `get_athlete_recovery_for_trainer` e concessão de Trial PRO de 14 dias ao vincular com Personal Trainer via `redeem_trainer_invite_code`.
  - `20261134_p0_integrity.sql`: proteção contra alteração de `role` / `is_pro` / `trial_ends_at` no cliente (`prevent_profile_role_change` e `sanitize_profile_insert`), `profiles.timezone`, `trial_granted_at` (trial único por conta), `sync_workout_session_atomic` com `p_completed_at` real (8 argumentos) e histórico paginado `get_my_workout_history`.
  - `20261135_waitlist_funnel.sql`: funil da waitlist com atribuição (`utm_*`, `referrer`, `landing_path`), códigos de indicação (`referral_code`, `referred_by`), fila `join_waitlist` e `get_marketing_waitlist`.
  - `20261136_ab_coach_quota_and_context.sql`: tabela `ab_coach_usage`, `consume_ab_coach_quota` (Free vs PRO) e contexto de 8 semanas (`get_coach_training_context`).
  - `20261138_admin_aggregates.sql`: totais e listas paginadas no servidor (`admin_dashboard_summary`, `admin_list_athletes`, `admin_recent_sessions`).
- **Edge Function `ab-coach`:** publicada na versão `30` (`ACTIVE`), com quota persistente e contexto de 8 semanas.

### Código da Aplicação
- **Narrativa IA Pós-Treino e AB Coach:** contrato alinhado em `src/services/abCoach/coachInsightsService.js` (`messages` + `res.data?.mensagem`).
- **Gráficos Reais de Evolução:** `src/components/ProgressionCharts.jsx` ligado ao histórico real com `e1RM` e volume semanal efetivo por grupo muscular.
- **Mesociclos (4 a 6 semanas) e Deload:** `generateMesocyclePlan` em `src/data/planFromProfile.js` e `src/utils/mesocycleWeek.js`, com seletor semanal em `WeeklyDashboard.jsx` bloqueado para não PRO via `canAccessFeature`.
- **Bi-Sets & Trainer Hub B2B2C:** suporte a `supersetGroupId` no treino ativo (`ActiveWorkout.jsx` / `ExerciseListView.jsx`), Copiloto Biométrico e toggle Bi-Set em `ProgramBuilderSheet.jsx`, painel de fadiga/wearables em `AthleteWorkspace.jsx` e exportação PDF mensal (`exportAthleteMonthlyPdf`).
- **Wearables:** suporte multi-sensor para WHOOP, Fitbit, Strava e Garmin Connect em `wearableManager.js`, `WearablesModal.jsx`, `WearableReadinessCard.jsx`, `activeWorkoutHelpers.js` e endpoints `api/*-token.js`.
- **Vídeos Offline:** cache seletivo com `Range` 206/416 em `public/sw.js` e pre-cache em `src/services/videoPrecache.js`.

---

## 2. Passo a Passo: Configurar o Stripe (Pagamentos PRO + Webhook)

Os endpoints `api/stripe-checkout.js` e `api/stripe-webhook.js` e o cliente `src/services/billingService.js` + `ProUpgradeSheet.jsx` já estão ligados. Falta criar o produto no Stripe e ligar as chaves na Vercel.

### 2.1. Criar Produto e Preço no Stripe Dashboard
1. Acede ao [Stripe Dashboard](https://dashboard.stripe.com/) (alterna para **Modo Live** quando fores receber pagamentos reais, ou começa em **Modo Teste** para validar).
2. Vai a **Product Catalog -> + Add product**.
3. Preenche o nome (ex.: `AB Fitness PRO`), escolhe **Recurring** (recorrente mensal ou anual), define o preço em EUR e guarda.
4. Copia o **API ID do preço** (começa por `price_...`). Este é o valor de `STRIPE_PRO_PRICE_ID`.

### 2.2. Obter a Secret Key e Service Role Key
1. No Stripe Dashboard -> **Developers -> API keys**, copia a **Secret key** (`sk_live_...` ou `sk_test_...`). Este é o valor de `STRIPE_SECRET_KEY`.
2. No **Supabase Dashboard** (`tegdtjmglvrvgerrtivx`) -> **Project Settings -> API**, copia a chave `service_role` (secreta, nunca `VITE_*`). Este é o valor de `SUPABASE_SERVICE_ROLE_KEY`.

### 2.3. Criar o Webhook do Stripe
1. No Stripe Dashboard -> **Developers -> Webhooks -> + Add endpoint**.
2. Em **Endpoint URL**, insere exatamente:
   ```text
   https://www.abfitness.app/api/stripe-webhook
   ```
3. Em **Listen to events -> Select events**, marca estes 4 eventos obrigatórios:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Clica em **Add endpoint**, abre o detalhe do webhook criado e clica em **Reveal** por baixo de **Signing secret** (começa por `whsec_...`). Este é o valor de `STRIPE_WEBHOOK_SECRET`.

### 2.4. Guardar as 4 Variáveis na Vercel
Vai a **Vercel Dashboard -> Projeto `bafitness` -> Settings -> Environment Variables** (`Production` e `Preview`) e adiciona:

| Nome da Variável | Valor | Onde obter |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | `sk_live_...` ou `sk_test_...` | Stripe -> Developers -> API keys |
| `STRIPE_PRO_PRICE_ID` | `price_...` | Stripe -> Product Catalog -> Price ID |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe -> Webhooks -> Signing secret |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Supabase -> Settings -> API (`service_role`) |

Confirma também que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` já estão definidas na Vercel (usadas também por `api/stripe-checkout.js`). Depois de adicionar ou alterar variáveis na Vercel, faz **Redeploy** da última build para entrarem em vigor.

---

## 3. Passo a Passo: Bucket Cloudflare R2 (Vídeos Offline)

O Service Worker (`public/sw.js`) só consegue guardar vídeos para uso offline se o domínio de media responder com cabeçalhos **CORS** e suporte a `Range`. Atualmente os vídeos apontam para `pub-585d42eb1aa64a67aedf483ec328d3fe.r2.dev`, que pode ser substituído pelo teu próprio bucket via `VITE_MEDIA_BASE_URL` sem alterar nenhum dado do catálogo.

### 3.1. Descarregar os Vídeos e Posters para Pasta Local
Na raiz do projeto (`/Users/brunoaraujo/Downloads/AB-Fitness-main`), executa:

```bash
node scripts/mirror_exercise_media.mjs --out media --concurrency 6
```

Isto cria a pasta local `media/` (ignorada pelo Git em `.gitignore`) mantendo os caminhos exatos do catálogo.

### 3.2. Criar Bucket e Subir os Ficheiros
1. No painel da **Cloudflare -> R2 Object Storage -> Create bucket**, cria um bucket (ex.: `ab-fitness-media`).
2. Envia a pasta `media/` para o bucket (exemplo com `rclone`):
   ```bash
   rclone copy media r2:ab-fitness-media --progress
   ```
3. Em **Settings -> Public access** do bucket, ativa um domínio personalizado (ex.: `https://media.abfitness.app`) ou o subdomínio público `r2.dev`.

### 3.3. Aplicar Política CORS no Bucket R2
No painel do bucket R2 -> **Settings -> CORS Policy -> Add CORS policy**, cola exatamente o conteúdo de `scripts/r2-cors.json`:

```json
[
  {
    "AllowedOrigins": [
      "https://www.abfitness.app",
      "https://abfitness.app",
      "http://localhost:5173",
      "http://localhost:4173"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Range"],
    "ExposeHeaders": ["Content-Length", "Content-Range", "Accept-Ranges"],
    "MaxAgeSeconds": 86400
  }
]
```

### 3.4. Configurar `VITE_MEDIA_BASE_URL` na Vercel
1. Em **Vercel -> Settings -> Environment Variables**, adiciona:
   - **Nome:** `VITE_MEDIA_BASE_URL`
   - **Valor:** `https://media.abfitness.app` (o URL público do teu bucket R2, **sem barra `/` no final**)
2. Faz **Redeploy** na Vercel (necessário porque variáveis `VITE_*` são embutidas na build do Vite).

---

## 4. Passo a Passo: Chaves OAuth dos Wearables

Os 4 fornecedores usam exatamente o mesmo URL de callback no código (`src/App.jsx` e `WearablesModal.jsx`):

```text
https://www.abfitness.app/auth/callback/wearable
```
(Para testes locais, regista também `http://localhost:5173/auth/callback/wearable` se o portal permitir múltiplos callbacks.)

| Fornecedor | Portal Developer | Variáveis a colocar na Vercel |
| :--- | :--- | :--- |
| **WHOOP** | [developer.whoop.com](https://developer.whoop.com) | `VITE_WHOOP_CLIENT_ID` e `WHOOP_CLIENT_SECRET` *(já existem em `.env.local` local)* |
| **Fitbit** | [dev.fitbit.com/apps](https://dev.fitbit.com/apps) | `VITE_FITBIT_CLIENT_ID` e `FITBIT_CLIENT_SECRET` |
| **Strava** | [strava.com/settings/api](https://www.strava.com/settings/api) | `VITE_STRAVA_CLIENT_ID` e `STRAVA_CLIENT_SECRET` |
| **Garmin Connect** | [developer.garmin.com/gc-developer-program](https://developer.garmin.com/gc-developer-program) | `VITE_GARMIN_CLIENT_ID` e `GARMIN_CLIENT_SECRET` |

Enquanto um fornecedor não tiver o respetivo `VITE_*_CLIENT_ID` configurado na Vercel, o botão OAuth aparece desativado com aviso limpo no modal sem quebrar o restante da aplicação.

---

## 5. Controlo de Lançamento Privado vs Público (`PRIVATE_LAUNCH_MODE`)

- Ficheiro: `src/config/launchMode.js` (`PRIVATE_LAUNCH_MODE = true`, `TRIAL_DAYS = 14`).
- **Enquanto `PRIVATE_LAUNCH_MODE = true` (estado atual):**
  - Entram normalmente na aplicação: contas com `role` `'admin'`, `'ceo'` ou `'coach'` (Personal Trainers), e atletas vinculados a um PT (`hasActiveTrainer` ou chegando via link `?trainer=CODIGO`).
  - Visitantes comuns sem convite veem a landing page VIP de Waitlist com atribuição UTM, código de indicação próprio e posição dinâmica na fila.
  - O modo Convidado offline fica desativado.
- **Quando quiseres abrir ao público geral:**
  - Altera `export const PRIVATE_LAUNCH_MODE = false;` em `src/config/launchMode.js`, faz commit e push para `main`. A partir daí qualquer visitante pode criar conta ou assinar o PRO livremente pelo funil Stripe.

---

## 6. Pendências Administrativas & Supabase (Antes do Lançamento Público)

Estas recomendações vêm de `docs/CHECKLIST_LANCAMENTO.md`:
1. **SMTP Próprio no Supabase** (Dashboard -> Auth -> SMTP Settings) para que e-mails de confirmação/recuperação cheguem a domínios externos sem limite de 3-4/hora.
2. **Templates de E-mail PT-PT + Segurança** (Password mínima 8 caracteres, Leaked Password Protection no Auth).
3. **Billing ativo no Google Cloud (Gemini)** para que a `GEMINI_API_KEY` nos Supabase Secrets tenha garantia contratual de não treino sobre dados dos utilizadores (RGPD).
4. **Registo no Livro de Reclamações Eletrónico** (`www.livroreclamacoes.pt`, entidade reguladora ASAE) e arquivo do ROPA antes de abrir ao público pagante em Portugal.

---

## 7. Roteiro Rápido para Testar a App Agora Mesmo

1. **Acesso em Produção:** Abre `https://www.abfitness.app` e inicia sessão com a tua conta CEO/Admin (para entrar diretamente apesar de `PRIVATE_LAUNCH_MODE = true`). Em janela anónima, confirma que visitantes veem a Waitlist VIP com fila e link de indicação.
2. **Onboarding, Mesociclo & Paywall:** No perfil/dashboard, verifica a semana do mesociclo (`Semana 1..4` e `Semana 5 Deload`) e o estado PRO/Trial em `ProfileView` ou `ProUpgradeSheet`.
3. **Treino Ativo + Bi-Set + IA Pós-Treino:** Inicia um treino, conclui séries (se tiver Bi-Set, valida a alternância automática antes do timer de descanso), finaliza e confirma a narrativa pós-treino gerada pelo AB Coach v30.
4. **Gráficos & Fadiga Híbrida:** Regista uma corrida no `RunningHub` ou treino de pernas e verifica o impacto no Mapa de Recuperação Muscular (`quadriceps`, `posteriores`, `gemeos`) e os gráficos reais em Histórico -> Evolução.
5. **Trainer Hub B2B2C:** Abre o Trainer Hub, gera um código de convite, cria uma prescrição em `ProgramBuilderSheet` testando o toggle **Bi-Set** e os alertas biométricos no topo, e exporta o relatório em **PDF** dentro de `AthleteWorkspace`.
6. **Stripe Checkout (depois de colocar as 4 chaves na Vercel):** Toca em assinar PRO com conta não CEO para confirmar o redirecionamento para o Stripe e atualização automática de `is_pro` via `/api/stripe-webhook`.
