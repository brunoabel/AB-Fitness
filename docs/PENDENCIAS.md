# Pendências — AB Fitness (documento único)

> **Atualizado:** 27/11/2026 · **Supabase:** `tegdtjmglvrvgerrtivx` · **Vercel:** `bafitness` · **Produção:** https://www.abfitness.app
>
> Este documento substitui `docs/pendencias-manuais/*`, `docs/CHECKLIST_LANCAMENTO.md` e `docs/GUIA_CONFIGURACAO_FINAL_POS_DEPLOY.md`.
> Cada pendência foi verificada diretamente na base de dados do Supabase, no Security Advisor e na lista de variáveis da Vercel.

---

## Resumo

| # | Pendência | Prioridade | Estado verificado |
|---|---|---|---|
| 1 | Rodar o Client Secret da WHOOP e pôr as chaves na Vercel | P0 | **Por fazer** — não existe `WHOOP_CLIENT_SECRET` nem `VITE_WHOOP_CLIENT_ID` na Vercel |
| 2 | Publicar as alterações locais (redesign + Onda 1) | P0 | **Por fazer** — 152 ficheiros alterados por fazer commit |
| 3 | Configurar o Stripe (pagamentos PRO) | P1 | **Por fazer** — faltam `STRIPE_SECRET_KEY`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` |
| 4 | Ativar a Leaked Password Protection | P1 | **Por fazer** — o Security Advisor do Supabase confirma que está desligada |
| 5 | Confirmar password mínima de 8 caracteres e “Confirm email” | P1 | Por confirmar (não é visível por API) |
| 6 | Confirmar Site URL e Redirect URLs | P1 | Por confirmar (não é visível por API) |
| 7 | SMTP próprio (Resend) + domínio verificado | P1 | Por confirmar (não é visível por API) |
| 8 | Colar os 3 templates de e-mail em PT-PT | P1 | Por confirmar (não é visível por API) |
| 9 | Faturação ativa no Google Cloud (Gemini) | P1 | Por fazer |
| 10 | Livro de Reclamações Eletrónico | P1 | Por fazer |
| 11 | Arquivar o ROPA (Art. 30.º RGPD) | P2 | Por fazer |
| 12 | Alertas de uso no Supabase | P2 | Por fazer |
| 13 | Wearables Fitbit / Strava / Garmin (opcional) | P3 | Por fazer — sem variáveis na Vercel |
| 14 | CAPTCHA Cloudflare Turnstile | P3 | Bloqueado — precisa primeiro de código no frontend |
| 15 | Teste real ponta a ponta em produção | Final | Por fazer (depois de 1–10) |
| 16 | Abrir ao público (`PRIVATE_LAUNCH_MODE = false`) | Final | Por fazer — atualmente `true` |

### Já concluído (verificado e removido da lista)
- RLS da `waitlist` (`20261125`): só existem `waitlist_insert_public` e `waitlist_select_admin`.
- As 7 tabelas órfãs (`wishlist_products`, `favorites`, `qc_photos`, `haul_items`, `hauls`, `products`, `suppliers`) já não existem.
- Migração do Trainer Hub (`20261126`): trigger `trg_cascade_archive_programs` e função `set_roster_tags` presentes.
- Migração de segurança global (`20261127`): política `biometrics_delete_own` e índice `friend_messages_receiver_sender_idx` presentes.
- Reposição do feed de amigos (`20261128`): `get_friend_feed()` já não filtra por `is_shared`.
- Edge Function `ab-coach` republicada (v32, 481 exercícios).
- Fontes alojadas localmente (sem Google Fonts externo).
- `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` já existem na Vercel.

---

## P0 — Fazer primeiro

### 1. Rodar o Client Secret da WHOOP e configurar a Vercel
**Porquê:** o secret antigo esteve escrito no código (`api/whoop-token.js`) e continua no histórico do Git, por isso deve ser considerado exposto. Além disso, hoje a Vercel não tem nenhuma variável da WHOOP, por isso a ligação WHOOP não funciona em produção.

1. Abre https://developer.whoop.com e entra na tua app (Client ID `844f9ca9-cb10-4868-965c-d7746004f7f6`).
2. Gera um **novo Client Secret** (rodar / regenerar) e copia-o.
3. Na mesma app, confirma que as **Redirect URIs** incluem:
   - `https://www.abfitness.app/auth/callback/wearable`
   - `https://abfitness.app/auth/callback/wearable`
4. Abre **Vercel → bafitness → Settings → Environment Variables** e adiciona (marca **Production** e **Preview**):
   - `VITE_WHOOP_CLIENT_ID` = `844f9ca9-cb10-4868-965c-d7746004f7f6`
   - `WHOOP_CLIENT_SECRET` = o novo secret (**nunca** com prefixo `VITE_`)
5. Se testas no computador, atualiza também o `WHOOP_CLIENT_SECRET` no `.env.local`.
6. Na Vercel → **Deployments**, abre o último deploy → **⋯ → Redeploy**.
7. Teste: na app, abre **Wearables → Conectar WHOOP** e confirma que volta autenticado.

### 2. Publicar as alterações locais
**Porquê:** o redesign e as correções da Onda 1 (memória de carga, Smart Swap, retoma de treino, auto-pause GPS, etc.) estão só no teu computador. O site em produção ainda não os tem.

1. Pede-me “faz commit e deploy” — eu corro os testes, o build, o commit e o deploy por ti.
2. Se preferires fazer à mão, no terminal da pasta do projeto:
   ```bash
   npm test && npm run build
   git add -A
   git commit -m "Redesign + Onda 1: correções de execução e recuperação de sessão"
   git push origin main
   ```
3. Confirma em **Vercel → Deployments** que o novo deploy fica **Ready**.
4. No telemóvel, fecha e reabre a app (ou recarrega a página) para receber a nova versão.

---

## P1 — Antes de abrir ao público

### 3. Configurar o Stripe (pagamentos PRO)
O código (`api/stripe-checkout.js`, `api/stripe-webhook.js`, `ProUpgradeSheet.jsx`) já está pronto; só faltam as chaves.

1. Abre https://dashboard.stripe.com (começa em **modo de teste**; passa a **Live** quando quiseres cobrar a sério).
2. **Product catalog → + Add product**: nome `AB Fitness PRO`, preço em EUR, **Recurring** (mensal ou anual) → **Save**.
3. Abre o preço criado e copia o **Price ID** (`price_...`).
4. **Developers → API keys**: copia a **Secret key** (`sk_test_...` ou `sk_live_...`).
5. **Developers → Webhooks → + Add endpoint**:
   - Endpoint URL: `https://www.abfitness.app/api/stripe-webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Guarda, abre o webhook e clica em **Reveal** no **Signing secret** (`whsec_...`).
6. Na **Vercel → Environment Variables** (Production + Preview) adiciona:

   | Variável | Valor |
   |---|---|
   | `STRIPE_SECRET_KEY` | `sk_...` |
   | `STRIPE_PRO_PRICE_ID` | `price_...` |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_...` |

   (`SUPABASE_SERVICE_ROLE_KEY` já existe — não precisas de mexer.)
7. **Redeploy** na Vercel.
8. Teste: com uma conta que não seja CEO/admin, toca em **Assinar PRO**, paga com o cartão de teste `4242 4242 4242 4242` (qualquer data futura e CVC) e confirma que o perfil passa a PRO.

### 4. Ativar a Leaked Password Protection
1. Abre https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/auth/providers?provider=Email (ou **Authentication → Sign In / Providers → Email**; em alguns planos está em **Authentication → Attack Protection**).
2. Liga **Prevent use of leaked passwords** e guarda.
3. Se a opção estiver bloqueada, é porque exige o plano **Pro** do Supabase — nesse caso fica para quando fizeres upgrade.

### 5. Confirmar password mínima e confirmação de e-mail
1. No mesmo ecrã do passo 4 (provider **Email**):
   - **Confirm email**: ligado.
   - **Minimum password length**: `8`.
2. Guarda.
3. **Não** ligues o CAPTCHA ainda (ver pendência 14).

### 6. Confirmar Site URL e Redirect URLs
1. Abre https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/auth/url-configuration
2. **Site URL**: `https://www.abfitness.app`
3. **Redirect URLs** — garante que existem:
   - `https://www.abfitness.app/**`
   - `https://abfitness.app/**`
   - (opcional, para testes) `http://localhost:5173/**`
4. Remove entradas antigas como `https://ba-fitness.vercel.app/**` se já não usares esse endereço.
5. Guarda.

### 7. SMTP próprio com o Resend
**Porquê:** o envio de e-mails embutido do Supabase só permite 3–4 e-mails por hora e cai muitas vezes em spam.

**No Resend (https://resend.com):**
1. **Domains → Add Domain** → `abfitness.app`.
2. O Resend mostra registos **SPF (TXT)**, **DKIM (TXT/CNAME)** e um **DMARC (TXT)** sugerido.
3. Adiciona-os onde gerires o DNS do domínio (Vercel → **Domains → abfitness.app → DNS Records**, ou o teu registador).
4. Espera até o domínio aparecer **Verified** (minutos a algumas horas).
5. **API Keys → Create API Key** com permissão **Sending access** e copia a chave (`re_...`).

**No Supabase:**
1. Abre **Authentication → Emails → SMTP Settings** e liga **Enable Custom SMTP**.
2. Preenche:
   - Sender email: `no-reply@abfitness.app`
   - Sender name: `AB Fitness`
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: a chave `re_...`
   - Minimum interval per user: `60`
3. **Save changes**.

### 8. Colar os 3 templates de e-mail em PT-PT
Abre https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/auth/templates. Em cada separador, muda o **Subject**, substitui o corpo pelo HTML abaixo e clica em **Save**. Não alteres `{{ .ConfirmationURL }}`.

**A) Confirm signup** — Subject: `Confirma a tua conta na AB Fitness`
```html
<div style="margin:0;padding:32px 16px;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background-color:#0A0A0A;border:1px solid #1D3557;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8EA8C8;">AB FITNESS</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#FFFFFF;">Confirma o teu e-mail</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#B8C0CC;">
          Estás a um passo de entrar na tua conta. Clica no botão abaixo para validar o teu endereço e começar os treinos.
        </p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 26px;background-color:#FFFFFF;color:#000000;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;">
          Confirmar conta
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
          Se não criaste uma conta na AB Fitness, podes ignorar este e-mail com segurança.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #161B24;font-size:11px;color:#6B7280;">
        AB Fitness · ABEX Studio · <a href="https://www.abfitness.app" style="color:#9CA3AF;text-decoration:none;">www.abfitness.app</a>
      </td>
    </tr>
  </table>
</div>
```

**B) Reset password** — Subject: `Repor palavra-passe — AB Fitness`
```html
<div style="margin:0;padding:32px 16px;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background-color:#0A0A0A;border:1px solid #1D3557;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8EA8C8;">AB FITNESS</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#FFFFFF;">Repor palavra-passe</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#B8C0CC;">
          Recebemos um pedido para alterar a palavra-passe da tua conta. Clica no botão abaixo para definir uma nova.
        </p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 26px;background-color:#FFFFFF;color:#000000;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;">
          Definir nova palavra-passe
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
          Se não foste tu a pedir esta alteração, ignora este e-mail — a tua palavra-passe atual mantém-se igual.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #161B24;font-size:11px;color:#6B7280;">
        AB Fitness · ABEX Studio · <a href="https://www.abfitness.app" style="color:#9CA3AF;text-decoration:none;">www.abfitness.app</a>
      </td>
    </tr>
  </table>
</div>
```

**C) Magic Link** — Subject: `O teu link de acesso — AB Fitness`
```html
<div style="margin:0;padding:32px 16px;background-color:#000000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#FFFFFF;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background-color:#0A0A0A;border:1px solid #1D3557;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:32px 28px;">
        <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8EA8C8;">AB FITNESS</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#FFFFFF;">Entrar na tua conta</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#B8C0CC;">
          Usa o botão abaixo para iniciar sessão diretamente na AB Fitness sem precisares de palavra-passe.
        </p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 26px;background-color:#FFFFFF;color:#000000;text-decoration:none;font-size:14px;font-weight:700;border-radius:10px;">
          Entrar na AB Fitness
        </a>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#6B7280;">
          Se não pediste este link, podes ignorar este e-mail.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;border-top:1px solid #161B24;font-size:11px;color:#6B7280;">
        AB Fitness · ABEX Studio · <a href="https://www.abfitness.app" style="color:#9CA3AF;text-decoration:none;">www.abfitness.app</a>
      </td>
    </tr>
  </table>
</div>
```

### 9. Faturação ativa no Google Cloud (Gemini)
**Porquê (RGPD):** só no plano pago a Google se compromete a não usar os pedidos para treinar modelos — importante porque o AB Coach envia dados de treino e saúde.

1. Abre https://console.cloud.google.com/billing.
2. Confirma que o projeto da `GEMINI_API_KEY` (usada pela função `ab-coach` nos Secrets do Supabase) tem uma **conta de faturação ativa** (Pay-as-you-go).
3. Se não tiver, **Link a billing account** → adiciona cartão → associa ao projeto.
4. Em **Budgets & alerts**, cria um orçamento mensal (ex.: 20 €) com alertas a 50 %, 90 % e 100 %.

### 10. Registo no Livro de Reclamações Eletrónico
1. Abre https://www.livroreclamacoes.pt → área de **Operadores Económicos**.
2. Entra com o Portal das Finanças ou a Chave Móvel Digital do NIF `297261983`.
3. Regista o estabelecimento online (AB Fitness / www.abfitness.app) e escolhe a entidade reguladora **ASAE**.
4. Guarda o comprovativo. (O link no rodapé da app já existe.)

---

## P2 — Organização e monitorização

### 11. Arquivar o ROPA (Art. 30.º RGPD)
1. Prepara (ou revê) o Registo de Atividades de Tratamento com: dados recolhidos (conta, treinos, corridas/GPS, biometria de wearables, fotos), finalidade, base legal (consentimento explícito para dados de saúde), prazos de conservação e subcontratantes (Supabase, Vercel, Google Gemini, Stripe, Resend, fornecedores de wearables).
2. Guarda o PDF numa pasta de arquivo legal (fora do repositório) com a data.

### 12. Alertas de uso no Supabase
1. Abre https://supabase.com/dashboard/org/_/usage (organização do projeto `tegdtjmglvrvgerrtivx`).
2. Revê o consumo de **Database size**, **Egress**, **Storage** e **Edge Function invocations** (`ab-coach`).
3. Em **Billing**, confirma o **Spend Cap** e os e-mails de alerta de uso.

---

## P3 — Opcional / mais tarde

### 13. Wearables Fitbit, Strava e Garmin
O código está pronto; sem as variáveis, o botão de cada um aparece desativado (sem partir nada). Para cada fornecedor que quiseres ativar:

1. Cria a app no portal:
   - Fitbit: https://dev.fitbit.com/apps
   - Strava: https://www.strava.com/settings/api
   - Garmin: https://developer.garmin.com/gc-developer-program (exige aprovação da Garmin)
2. Callback / Redirect URI: `https://www.abfitness.app/auth/callback/wearable` (e `http://localhost:5173/auth/callback/wearable` para testes).
3. Na Vercel (Production + Preview):

   | Fornecedor | Variáveis |
   |---|---|
   | Fitbit | `VITE_FITBIT_CLIENT_ID`, `FITBIT_CLIENT_SECRET` |
   | Strava | `VITE_STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` |
   | Garmin | `VITE_GARMIN_CLIENT_ID`, `GARMIN_CLIENT_SECRET` |

4. **Redeploy** e testa o botão no modal de Wearables.

### 14. CAPTCHA (Cloudflare Turnstile)
**Bloqueado:** o login e o registo (`src/context/AuthContext.jsx`) ainda não enviam `captchaToken`. Se ligares o CAPTCHA no Supabase agora, **ninguém consegue entrar nem registar-se**.

1. Primeiro pede-me para implementar o widget Turnstile no ecrã de login/registo.
2. Só depois: cria o site no Cloudflare Turnstile, cola a **Secret key** em **Supabase → Authentication → Attack Protection → CAPTCHA** e a **Site key** na Vercel (`VITE_TURNSTILE_SITE_KEY`).
3. Redeploy e testa login e registo.

---

## Final — Dia do lançamento

### 15. Teste real ponta a ponta em produção
Depois de concluídas as pendências 1 a 10:

1. Numa janela anónima, regista uma conta nova em https://www.abfitness.app com um e-mail real (Gmail ou Outlook).
2. Confirma que o e-mail chega de `AB Fitness <no-reply@abfitness.app>`, fora do spam e com o template PT-PT.
3. Clica em **Confirmar conta** e confirma que entras autenticado na app.
4. Pede **Repor palavra-passe** e confirma o e-mail e a troca.
5. Carrega uma foto de perfil.
6. Faz um treino curto: conclui séries, troca um exercício (Smart Swap), fecha a app a meio e confirma que aparece **“Treino em curso · Retomar”**; termina e confirma o Mapa de Recuperação.
7. Faz uma corrida curta ao ar livre: permissão de GPS, auto-pause ao parar num semáforo e splits.
8. Liga a WHOOP (pendência 1).
9. Assina o PRO em modo de teste do Stripe (pendência 3).

### 16. Abrir ao público
1. Em `src/config/launchMode.js`, muda `export const PRIVATE_LAUNCH_MODE = true;` para `false`.
2. Faz commit, push e deploy (ou pede-me).
3. Confirma numa janela anónima que um visitante novo já consegue criar conta (em vez de ver a lista de espera).
