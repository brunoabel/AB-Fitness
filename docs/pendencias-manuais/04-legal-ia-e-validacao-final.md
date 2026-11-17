# 04 — Legal, Inteligência Artificial & Validação Final

Itens administrativos, de conformidade (Portugal / RGPD) e testes finais fora do código (baseados em `docs/CHECKLIST_LANCAMENTO.md`).

---

## 1. Obrigações Legais & RGPD (Portugal)

- [ ] **Registo no Livro de Reclamações Eletrónico**
  - **Onde:** https://www.livroreclamacoes.pt
  - **Como:** Entrar com as credenciais do Portal das Finanças / Chave Móvel Digital associadas ao NIF `297261983`.
  - **Entidade Reguladora:** Selecionar a **ASAE**.
  - *(A ligação obrigatória no rodapé da app para o Livro de Reclamações já está implementada.)*

- [ ] **Guardar o ROPA em arquivo (Art. 30.º do RGPD)**
  - Guardar cópia do Registo de Atividades de Tratamento (ficha de tratamentos de dados de saúde/treino) na tua pasta de arquivo legal.

---

## 2. Inteligência Artificial (AB Coach & Gemini)

- [ ] **Verificar faturação ativa no Google Cloud (Plano Pago / Pay-as-you-go)**
  - **Onde:** Google Cloud Console > Billing
  - **Porquê (RGPD):** No tier pago da API Gemini, os pedidos não são utilizados pela Google para treinar modelos públicos com dados dos atletas.

---

## 3. Monitorização no Supabase

- [ ] **Ativar alertas de uso** no Supabase Dashboard (`tegdtjmglvrvgerrtivx`):
  - Database size / egress
  - Storage
  - Edge Functions (`ab-coach`)

---

## 4. Roteiro de Teste Real Ponta a Ponta (Dia do Lançamento)

1. [ ] Registar uma conta nova em `https://www.abfitness.app` usando um e-mail externo real (Gmail ou Outlook).
2. [ ] Confirmar que o e-mail chega via SMTP próprio (`AB Fitness <no-reply@abfitness.app>`), sem cair em spam e com o template PT-PT.
3. [ ] Clicar no botão **Confirmar conta** e validar redirecionamento autenticado para `https://www.abfitness.app`.
4. [ ] Testar upload de fotografia de perfil (bucket `avatars`).
5. [ ] Registar um treino e confirmar a atualização do Mapa de Fadiga Muscular.
6. [ ] Iniciar uma corrida curta para testar permissão e rastreio de GPS.
