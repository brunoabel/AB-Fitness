# Pendências Finais — AB Fitness

> **Atualizado:** 27/11/2026 · **Responsável:** Bruno Araújo / Bruno Abel Studio (`NIF 297261983`)
> **Supabase:** `tegdtjmglvrvgerrtivx` · **Vercel:** `bafitness` · **Produção:** https://www.abfitness.app

Faltam apenas **4 passos** para o lançamento público. Tudo o resto já está concluído e verificado.

---

## O que falta fazer (4 itens)

| # | Pendência | Prioridade | Estado |
|---|---|---|---|
| 1 | Faturação ativa no Google Cloud (Gemini API — RGPD) | P1 | Por fazer |
| 2 | Registo no Livro de Reclamações Eletrónico (ASAE) | P1 | Por fazer |
| 3 | Teste real ponta a ponta em produção | Final | Por fazer |
| 4 | Abrir ao público (`PRIVATE_LAUNCH_MODE = false`) | Final | Por fazer |

*(Opcional: atualizar o rodapé dos 3 templates de e-mail no Supabase de `ABEX Studio` para `Bruno Abel Studio` se colaste a versão anterior; e Cloudflare Turnstile CAPTCHA só mais tarde quando adicionarmos o widget no frontend.)*

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

---

## Já concluído
- WHOOP Client Secret rodado e variáveis na Vercel configuradas.
- Redesign OLED + Onda 1 + Onda 2 commitados, pushed (`main`) e publicados em produção.
- Stripe configurado (PRO €3,99/mês + Personal Trainer €9,99/mês + webhook).
- Supabase Auth: `Confirm email`, password mínima 8, `Leaked Password Protection`, Site URL e Redirect URLs.
- Resend SMTP próprio (SPF/DKIM/DMARC) + 3 templates de e-mail em PT-PT.
- ROPA (Art. 30.º RGPD) atualizado para **Bruno Abel Studio** com ambos os planos.
- Alertas de uso configurados no Supabase e wearables opcionais tratados.
- Base de dados: todas as migrações (incluindo RLS `waitlist`, Trainer Hub, segurança global, feed de amigos e `athlete_streak` com fuso + corridas) aplicadas; 7 tabelas órfãs removidas; Edge Function `ab-coach` v32 ativa.
