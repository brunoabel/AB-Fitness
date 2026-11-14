#  Checklist Pré-Lançamento — AB Fitness
> **Guia Oficial de Preparação para Lançamento Público**  
> Projeto: `AB Fitness` (`ba-fitness.vercel.app`) | Supabase: `tegdtjmglvrvgerrtivx` | Jurisdição: Portugal / União Europeia

Guarda este documento como referência. Ele contém tudo o que foi concluído a nível técnico e todas as ações administrativas, legais e de infraestrutura necessárias antes de abrires a aplicação ao público em geral.

---

## 📋 1. Obrigações Legais & Regulamentares (Portugal & RGPD)

### 🔴 Pendente antes do lançamento público
- [ ] **Registo no Livro de Reclamações Eletrónico**
  - **Onde:** [www.livroreclamacoes.pt](https://www.livroreclamacoes.pt)
  - **Como:** Entrar com as credenciais do Portal das Finanças / Chave Móvel Digital associada ao teu NIF (`297261983`).
  - **Entidade Reguladora:** Selecionar a **ASAE**.
  - *(Nota: A ligação obrigatória no rodapé da app para o Livro de Reclamações já está implementada e publicada).*
- [ ] **Guardar o ROPA em Arquivo (Art. 30.º do RGPD)**
  - Guardar cópia do Registo de Atividades de Tratamento (documento interno da ficha de tratamentos de saúde) na tua pasta de arquivo legal.
- [x] *(Opcional / Recomendado)* **Auto-alojamento de Fontes Google Fonts**
  - Fontes (`Inter`, `Plus Jakarta Sans`) alojadas localmente em `public/fonts/` e declaradas em `src/index.css`, eliminando pedidos externos a `fonts.googleapis.com` / `fonts.gstatic.com` e reforçando o cumprimento estrito do RGPD.

### 🟢 Já Implementado e Validado
- [x] **Identificação Legal e Fiscal (`src/legal/config.js`):** NIF `297261983`, morada fiscal em Gondomar / Porto e dados do prestador preenchidos nos Termos, Política de Privacidade e metadados Schema.org (Art. 10.º DL 7/2004).
- [x] Checkboxes de consentimento explícito desmarcadas no registo para dados de saúde (Art. 9.º RGPD).
- [x] Registo imutável de consentimentos com timestamp e versão na base de dados (`public.user_consents`).
- [x] Mecanismo de eliminação de conta e esquecimento integral em cascata (`delete_user_account_and_data`).
- [x] Termos de Uso com indicação expressa da entidade de Resolução Alternativa de Litígios (**CICAP no Porto**) e Portal do Consumidor (Lei n.º 144/2015).
- [x] Aviso Médico e de IA com salvaguardas de saúde, 112 e SNS 24 (MDCG 2019-11 & EU AI Act).
- [x] Transparência de cookies e armazenamento técnico estritamente necessário (Lei n.º 41/2004).

---

## 🛡️ 2. Infraestrutura Supabase & Autenticação

### 🔴 Pendente antes do lançamento público
- [ ] **Configurar SMTP Próprio (Resend / Brevo / Postmark)**
  - **Onde:** Supabase Dashboard > Project Settings > Authentication > Emails > **SMTP Settings**.
  - **Motivo:** O envio embutido do Supabase bloqueia utilizadores externos e tem limite de 3-4 e-mails/hora.
  - **Remetente sugerido:** `no-reply@teudominio.com` (ou `ola@teudominio.com`).
  - **DNS no domínio:** Criar registos SPF (`TXT`), DKIM (`CNAME`/`TXT`) e DMARC (`TXT`).
- [ ] **Colar os Templates de E-mail em Português de Portugal**
  - **Onde:** Supabase Dashboard > Authentication > **Email Templates**.
  - **Modelos:** Personalizar "Confirm signup", "Reset password" e "Magic link" com o estilo escuro AB Fitness, botão branco e a tag obrigatória `{{ .ConfirmationURL }}`.
- [ ] **Endurecimento de Autenticação (Authentication > Security)**
  - [ ] Definir **Minimum Password Length** para `8` caracteres.
  - [ ] Ativar **Leaked Password Protection** (se disponível no plano).
  - [ ] Ativar proteção **CAPTCHA (Cloudflare Turnstile)** no registo e login para prevenir criação automática de contas falsas.
- [ ] **Limpeza das 7 Tabelas Órfãs na Base de Dados**
  - Executar no SQL Editor (após confirmação de que os dados de teste/templates antigos não são necessários):
    ```sql
    DROP TABLE IF EXISTS public.wishlist_products CASCADE;
    DROP TABLE IF EXISTS public.favorites CASCADE;
    DROP TABLE IF EXISTS public.qc_photos CASCADE;
    DROP TABLE IF EXISTS public.haul_items CASCADE;
    DROP TABLE IF EXISTS public.hauls CASCADE;
    DROP TABLE IF EXISTS public.products CASCADE;
    DROP TABLE IF EXISTS public.suppliers CASCADE;
    ```

### 🟢 Já Implementado e Validado
- [x] `site_url` corrigido remotamente para `https://ba-fitness.vercel.app` e URLs de redirecionamento atualizados.
- [x] Botão "Reenviar e-mail de confirmação" implementado no ecrã de registo com cooldown de 60s.
- [x] Validação de palavra-passe mínima de 8 caracteres ativa no formulário de registo.
- [x] Removida verificação de administrador por e-mail no cliente: acesso estritamente dependente de `profiles.role = 'admin'`, protegido por RLS e trigger `trg_prevent_profile_role_change`.
- [x] RLS forçado em 100% das tabelas públicas (query de auditoria confirmou 0 tabelas desprotegidas).
- [x] Todas as migrações 1 a 8 aplicadas e verificadas no PostgreSQL.
- [x] Bucket `avatars` com limite de 1 MB, tipos de imagem permitidos e RLS restrito a `auth.uid()`.

---

## 🤖 3. Inteligência Artificial (AB Coach & Gemini)

### 🔴 Pendente antes do lançamento público
- [ ] **Verificar Faturação Ativa no Google Cloud (Plano Pago / Pay-as-you-go)**
  - **Onde:** Consola Google Cloud > Billing.
  - **Motivo de conformidade com o RGPD:** Garantir que os pedidos não são utilizados pela Google para treinar modelos de IA públicos com os dados de saúde dos atletas.

### 🟢 Já Implementado e Validado
- [x] Edge Function `ab-coach` publicada com `verify_jwt = true`.
- [x] Chamadas anónimas sem token JWT rejeitadas com `HTTP 401 Unauthorized`.
- [x] System prompt blindado contra diagnósticos médicos, prescrições clínicas e dietas restritivas.

---

## 🚀 4. Passos Finais no Dia do Lançamento
1. [ ] Fazer um teste de registo real de ponta a ponta:
   - Registar conta com e-mail exterior (ex: Gmail, Outlook).
   - Confirmar receção do e-mail de ativação via SMTP próprio.
   - Clicar na ligação e verificar redirecionamento automático autenticado para `https://ba-fitness.vercel.app`.
2. [ ] Testar upload de fotografia de perfil.
3. [ ] Criar o primeiro treino e verificar o cálculo do Mapa de Fadiga Muscular.
4. [ ] Iniciar uma corrida curta para testar a permissão do GPS.
5. [ ] Ativar alertas de uso no Supabase Dashboard (Database, Storage, Edge Functions).

