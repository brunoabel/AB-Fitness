# Pendências Finais — AB Fitness

> **Atualizado:** 27/11/2026 · **Responsável:** Bruno Araújo / Bruno Abel Studio (`NIF 297261983`)
> **Supabase:** `tegdtjmglvrvgerrtivx` · **Vercel:** `bafitness` · **Produção:** https://www.abfitness.app

Faltam apenas **4 passos** para o lançamento público. Tudo o resto já está concluído e verificado.

---

## O que falta fazer

| # | Pendência | Prioridade | Estado |
|---|---|---|---|
| 1 | Faturação ativa no Google Cloud (Gemini API — RGPD) | P1 | Por fazer |
| 2 | Registo no Livro de Reclamações Eletrónico (ASAE) | P1 | Por fazer |
| 3 | Teste real ponta a ponta em produção | Final | Por fazer |
| 4 | Abrir ao público (`PRIVATE_LAUNCH_MODE = false`) | Final | Por fazer |
| 5 | Chaves OAuth de **Fitbit, Strava e Garmin** na Vercel | Opcional | Por fazer |
| 6 | Preço **Personal Trainer (€9,99)** no Stripe (`STRIPE_TRAINER_PRICE_ID`) | Opcional | Por fazer |
| 7 | Correr as migrations **20261144**, **20261145** e **20261146** no Supabase | P0 | Feito (27/11) |
| 8 | Ativar o **Customer Portal** da Stripe (gerir/cancelar subscrição) | P1 | Por fazer |

*(Nota: Leaked Password Protection no Supabase só desbloqueia no plano Pro; Cloudflare Turnstile CAPTCHA só mais tarde quando adicionarmos o widget no frontend.)*

---

### 1. Faturação ativa no Google Cloud (Gemini API — RGPD)
**Porquê:** só no plano pago (Pay-as-you-go) a Google garante contratualmente que os prompts enviados pela API Gemini não são usados para treinar modelos públicos — essencial porque o AB Coach recebe contexto de treino e recuperação.

1. Abre https://console.cloud.google.com/billing.
2. Confirma que o projeto da `GEMINI_API_KEY` (usada na Edge Function `ab-coach`) tem uma **conta de faturação ativa** (Pay-as-you-go).
3. Se ainda estiver no free tier, clica em **Link a billing account** e associa um cartão.
4. Em **Budgets & alerts**, cria um orçamento mensal (ex.: €20) com alertas a 50 %, 90 % e 100 %.

### 2. Registo no Livro de Reclamações Eletrónico (ASAE)
1. Abre https://www.livroreclamacoes.pt → **Operadores Económicos**.
2. Entra com as credenciais do Portal das Finanças ou Chave Móvel Digital do NIF `297261983`.
3. Regista o estabelecimento online (**AB Fitness / Bruno Abel Studio** — `https://www.abfitness.app`) e escolhe a entidade reguladora **ASAE**.
4. Guarda o comprovativo junto ao teu ROPA. *(O link no rodapé da app já está publicado.)*

### 3. Teste real ponta a ponta em produção
1. Numa janela anónima, regista uma conta nova em https://www.abfitness.app com um e-mail real (Gmail/Outlook).
2. Confirma que o e-mail chega via SMTP próprio (`no-reply@abfitness.app`), fora do spam e em PT-PT.
3. Clica em **Confirmar conta** e confirma que entras autenticado.
4. Testa **Repor palavra-passe**.
5. Carrega uma foto de perfil.
6. Faz um treino curto: testa Smart Swap, fecha a app a meio e valida o banner **"Treino em curso · Retomar"**; conclui e confirma o Mapa de Recuperação + ACWR.
7. Faz uma corrida curta ao ar livre (GPS, auto-pause e splits).
8. Testa ligar a WHOOP e um checkout de teste no Stripe (PRO €3,99 e Personal Trainer €9,99).

### 4. Abrir ao público (`PRIVATE_LAUNCH_MODE = false`)
1. Em `src/config/launchMode.js`, muda `export const PRIVATE_LAUNCH_MODE = true;` para `false`.
2. Faz commit, push e deploy (ou pede-me).
3. Confirma em janela anónima que qualquer visitante já pode criar conta livremente.

### 5. *(Opcional)* Chaves OAuth de Fitbit, Strava e Garmin
O código já está implementado (`api/fitbit-token.js`, `api/strava-token.js`, `api/garmin-token.js` e write-back Strava). Enquanto um fornecedor não tiver as chaves na Vercel, o botão aparece desativado sem quebrar nada. Para ativar cada um:

1. Cria a aplicação no respetivo portal de developers:
   - **Fitbit:** https://dev.fitbit.com/apps
   - **Strava:** https://www.strava.com/settings/api
   - **Garmin Connect:** https://developer.garmin.com/gc-developer-program *(requer aprovação da Garmin)*
2. Define o **Callback / Redirect URI** em todos como:
   - `https://www.abfitness.app/auth/callback/wearable`
   - *(Opcional local)* `http://localhost:5173/auth/callback/wearable`
3. Em **Vercel → `bafitness` → Settings → Environment Variables** (`Production` + `Preview`), adiciona as chaves do fornecedor que quiseres ligar:

| Fornecedor | Variáveis a adicionar |
|---|---|
| **Fitbit** | `VITE_FITBIT_CLIENT_ID`, `FITBIT_CLIENT_SECRET` |
| **Strava** | `VITE_STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` |
| **Garmin** | `VITE_GARMIN_CLIENT_ID`, `GARMIN_CLIENT_SECRET` |

4. Faz **Redeploy** na Vercel e testa no modal de Wearables.

### 6. *(Opcional)* Plano Personal Trainer (€9,99/mês) no Stripe
O código já está ligado: checkout (`plan: 'trainer'`), webhook (dá PRO + role `coach` e Trainer Hub) e o botão **Sou Personal Trainer** no menu lateral. Enquanto o preço não existir, o botão responde "ainda não está disponível".
1. No Stripe Dashboard → **Product catalog**, cria o preço recorrente mensal de **€9,99** para o plano **AB Fitness Personal Trainer** e copia o `price_...`.
2. Adiciona `STRIPE_TRAINER_PRICE_ID` na Vercel (`Production` + `Preview`) e faz **Redeploy**.
3. Confirma que o webhook da Stripe envia `checkout.session.completed` e `customer.subscription.created/updated/deleted`.
4. Ao cancelar, o PT perde o Trainer Hub (a role volta a `athlete` só se tiver sido dada pela subscrição); vínculos e programas ficam guardados e voltam se reassinar.

### 7. Migrations novas no Supabase (SQL Editor, como `postgres`, por esta ordem)
1. `20261144_profile_equipment_two_days.sql` (era `20261141_...`, que colidia com a versão do `athlete_streak`). Sem ela, o perfil de onboarding falha a sincronizar e fica só no aparelho.
2. `20261145_friend_messages_realtime.sql`: mensagens diretas em tempo real (antes caía no polling de 30 s).
3. `20261146_trainer_subscription.sql`: colunas protegidas do plano Personal Trainer.

### 8. Customer Portal da Stripe
1. Stripe Dashboard → **Settings → Billing → Customer portal** → ativa.
2. Permite **cancelar subscrição**, **atualizar método de pagamento** e **ver faturas**.
3. Em **Subscriptions → Switch plans**, junta os produtos PRO e Personal Trainer (assim um PRO pode passar a Trainer sem pagar duas subscrições; o checkout bloqueia uma segunda subscrição).

---

## Já concluído
- WHOOP Client Secret rodado e variáveis na Vercel configuradas e validadas em produção.
- Redesign OLED + Onda 1 + Onda 2 commitados, pushed (`main`) e publicados em produção.
- Stripe configurado para PRO €3,99/mês + webhook validado em produção.
- Supabase Auth: `Confirm email`, password mínima 8, Site URL e Redirect URLs.
- Resend SMTP próprio (SPF, DKIM, MX e DMARC propagados e validados) + 3 templates de e-mail em PT-PT.
- ROPA (Art. 30.º RGPD) atualizado para **Bruno Abel Studio** com ambos os planos.
- Alertas de uso configurados no Supabase.
- Base de dados: todas as migrações (incluindo RLS `waitlist`, Trainer Hub, segurança global, feed de amigos e `athlete_streak` com fuso + corridas) aplicadas; 7 tabelas órfãs removidas; Edge Function `ab-coach` v32 ativa.
