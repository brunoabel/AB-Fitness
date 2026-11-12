/**
 * Vercel Serverless Function: Troca segura do código OAuth pelo token de acesso da WHOOP.
 * Mantém o Client Secret protegido no lado do servidor.
 */

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
  const { code, redirectUri } = body;

  if (!code) {
    return res.status(400).json({ error: 'O código de autorização é obrigatório' });
  }

  const clientId = process.env.VITE_WHOOP_CLIENT_ID || '844f9ca9-cb10-4868-965c-d7746004f7f6';
  const clientSecret = process.env.WHOOP_CLIENT_SECRET || '92ac010329d1a5b4b4a1b9d56bcc76e4516d6874dece094b9efca20db815fb49';

  try {
    const tokenUrl = 'https://api.prod.whoop.com/oauth/oauth2/token';
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri || 'https://www.abfitness.app/auth/callback/wearable'
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na API Whoop Token:', data);
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Exceção ao trocar token Whoop:', err);
    return res.status(500).json({ error: err.message || 'Erro interno no servidor' });
  }
}

