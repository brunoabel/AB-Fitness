# 01 — Segurança & Wearables (Vercel / WHOOP / Fitbit)

## 1. [P0] Rodar o Client Secret da WHOOP

O antigo Client Secret da WHOOP esteve hardcoded anteriormente em `api/whoop-token.js` (já foi removido do código atual, mas ficou no histórico Git). Enquanto não for rodado na consola da WHOOP, esse valor antigo deve ser considerado exposto.

### O que fazer:
1. Aceder ao **WHOOP Developer Dashboard** e gerar/rodar um novo **Client Secret** para o Client ID (`VITE_WHOOP_CLIENT_ID`, atualmente `844f9ca9-cb10-4868-965c-d7746004f7f6` em `.env.example`).
2. Confirmar que as **Redirect URIs** registadas na WHOOP incluem:
   - `https://www.abfitness.app/auth/callback/wearable`
   - `https://abfitness.app/auth/callback/wearable`
3. Ir à **Vercel > Projeto > Settings > Environment Variables**:
   - Atualizar `WHOOP_CLIENT_SECRET` com o **novo secret** (marcar Production/Preview conforme necessário; nunca usar prefixo `VITE_`).
   - Confirmar que `VITE_WHOOP_CLIENT_ID` está definido corretamente.
4. *(Se testares wearables localmente)* Atualizar também o `.env.local` na tua máquina.
5. Fazer **Redeploy** em produção na Vercel para a função `api/whoop-token.js` passar a usar o novo secret.

---

## 2. [P2 — Opcional] Configurar Fitbit em produção

O endpoint serverless [api/fitbit-token.js](../../api/fitbit-token.js) e o fluxo OAuth já estão implementados no código. Hoje, se as variáveis da Fitbit não estiverem preenchidas, a ligação não funciona sem credenciais válidas.

### O que fazer (se quiseres ativar Fitbit):
1. Criar/configurar a aplicação no portal de developers da **Fitbit**.
2. Definir o **Callback URL / Redirect URI** para:
   - `https://www.abfitness.app/auth/callback/wearable`
   - *(Opcional local)* `http://localhost:5173/auth/callback/wearable`
3. Na **Vercel > Settings > Environment Variables**, adicionar:
   - `VITE_FITBIT_CLIENT_ID` = Client ID da tua app Fitbit
   - `FITBIT_CLIENT_SECRET` = Client Secret da tua app Fitbit (apenas server-side, sem `VITE_`)
4. Fazer **Redeploy** na Vercel e testar o botão **"Conectar com Fitbit"** no modal de Wearables.
