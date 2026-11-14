/**
 * Vercel Serverless Function: Troca segura do código OAuth pelo token de acesso da Fitbit.
 * Mantém o Client Secret protegido no lado do servidor.
 */

const ALLOWED_REDIRECT_URI_PATTERNS = [
  /^https:\/\/(www\.)?abfitness\.app\/auth\/callback\/wearable$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/auth\/callback\/wearable$/
];

function isAllowedRedirectUri(uri) {
  return typeof uri === 'string' && ALLOWED_REDIRECT_URI_PATTERNS.some((re) => re.test(uri));
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  let body = {};
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  } catch {
    return res.status(400).json({ error: 'Corpo JSON inválido' });
  }

  const { code, redirectUri } = body;

  if (!code) {
    return res.status(400).json({ error: 'O código de autorização é obrigatório' });
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
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      redirect_uri: redirectUri || 'https://www.abfitness.app/auth/callback/wearable'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na API Fitbit Token:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Exceção ao trocar token Fitbit:', err);
    return res.status(500).json({ error: err.message || 'Erro interno no servidor' });
  }
}
