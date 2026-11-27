/**
 * Vercel Serverless Function: Troca segura do código OAuth pelo token de acesso da Fitbit.
 * Mantém o Client Secret protegido no lado do servidor.
 */

import { requireSupabaseUser } from './_auth.js';

const ALLOWED_REDIRECT_URI_PATTERNS = [
  /^https:\/\/(www\.)?abfitness\.app\/auth\/callback\/wearable$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/auth\/callback\/wearable$/
];

function isAllowedRedirectUri(uri) {
  return typeof uri === 'string' && ALLOWED_REDIRECT_URI_PATTERNS.some((re) => re.test(uri));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { user, error: authError } = await requireSupabaseUser(req);
  if (authError || !user) {
    return res.status(401).json({ error: authError || 'Autenticação necessária' });
  }

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Corpo JSON inválido' });
  }

  const { code, refreshToken, redirectUri } = body;

  const isRefresh = typeof refreshToken === 'string' && refreshToken.trim().length > 0;
  const hasValidCode = typeof code === 'string' && code.trim().length > 0 && code.length <= 1024;
  const hasValidRefresh = isRefresh && refreshToken.length <= 1024;

  if (!hasValidCode && !hasValidRefresh) {
    return res.status(400).json({ error: 'Código de autorização ou refresh token inválido' });
  }

  if (redirectUri !== undefined && redirectUri !== null && !isAllowedRedirectUri(redirectUri)) {
    return res.status(400).json({ error: 'redirect_uri inválido' });
  }

  const clientId = process.env.VITE_FITBIT_CLIENT_ID;
  const clientSecret = process.env.FITBIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('FITBIT_CLIENT_SECRET ou VITE_FITBIT_CLIENT_ID em falta nas variáveis de ambiente do servidor.');
    return res.status(500).json({ error: 'Configuração Fitbit incompleta no servidor' });
  }

  try {
    const tokenUrl = 'https://api.fitbit.com/oauth2/token';
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const params = new URLSearchParams(
      hasValidRefresh
        ? {
            grant_type: 'refresh_token',
            refresh_token: refreshToken.trim()
          }
        : {
            grant_type: 'authorization_code',
            code: code.trim(),
            client_id: clientId,
            redirect_uri: redirectUri || 'https://www.abfitness.app/auth/callback/wearable'
          }
    );

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('Erro na API Fitbit Token:', response.status);
      return res.status(response.status).json({ error: 'Falha ao validar credenciais na Fitbit' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Exceção ao trocar token Fitbit:', err);
    return res.status(500).json({ error: 'Erro interno ao processar autenticação com a Fitbit' });
  }
}
