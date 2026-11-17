# Pendências Manuais — AB Fitness

Tudo o que depende de painéis externos (Supabase, Vercel, Resend, Google Cloud, WHOOP/Fitbit e obrigações legais) para fechares com calma depois.

> **Projeto Supabase:** `tegdtjmglvrvgerrtivx`  
> **Domínio de Produção:** `https://www.abfitness.app`

---

## Ordem recomendada de execução

### P0 — Segurança crítica (fazer primeiro)
- [ ] **Rodar o Client Secret da WHOOP** na consola de developer da WHOOP e atualizar `WHOOP_CLIENT_SECRET` na Vercel + fazer Redeploy  
  -> Ver [01-seguranca-e-wearables.md](./01-seguranca-e-wearables.md)

### P1 — Supabase (SQL, URLs e Segurança Auth)
- [ ] Confirmar/correr a migration `20261125_waitlist_rls_hardening.sql` (RLS da `waitlist`)
- [ ] Inspecionar e apagar as **7 tabelas órfãs** antigas no SQL Editor
- [ ] Confirmar **Site URL** (`https://www.abfitness.app`) e **Redirect URLs**
- [ ] Conferir **Minimum password length = 8**, **Confirm email = ON** e **Leaked Password Protection** *(manter Turnstile DESLIGADO até haver suporte no frontend)*  
  -> Ver [02-supabase-sql-e-urls.md](./02-supabase-sql-e-urls.md)

### P1 — E-mails (SMTP próprio + Templates PT-PT)
- [ ] Verificar domínio `abfitness.app` no **Resend** (SPF, DKIM, DMARC) e ligar **Custom SMTP** no Supabase
- [ ] Colar os 3 templates HTML em PT-PT (**Confirm signup**, **Reset password**, **Magic Link**)  
  -> Ver [03-supabase-smtp-e-emails.md](./03-supabase-smtp-e-emails.md)

### P2 — Wearables opcionais (Fitbit)
- [ ] *(Só se quiseres ativar Fitbit em produção)* Criar app na consola da Fitbit e configurar `VITE_FITBIT_CLIENT_ID` e `FITBIT_CLIENT_SECRET` na Vercel  
  -> Ver [01-seguranca-e-wearables.md](./01-seguranca-e-wearables.md)

### P3 — Legal, Google Cloud & Validação final antes de abrir ao público
- [ ] Confirmar faturação ativa (**Pay-as-you-go**) no Google Cloud para a API Gemini (RGPD)
- [ ] Registo no **Livro de Reclamações Eletrónico** (NIF `297261983`, ASAE) e arquivo do **ROPA**
- [ ] Ativar alertas de uso no Supabase Dashboard
- [ ] Fazer teste real ponta a ponta em produção  
  -> Ver [04-legal-ia-e-validacao-final.md](./04-legal-ia-e-validacao-final.md)

---

## Links rápidos
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/sql/new
- **Supabase URL Configuration:** https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/auth/url-configuration
- **Supabase Email Templates:** https://supabase.com/dashboard/project/tegdtjmglvrvgerrtivx/auth/templates
- **Livro de Reclamações:** https://www.livroreclamacoes.pt
