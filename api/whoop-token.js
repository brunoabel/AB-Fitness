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

  const clientId = process.env.VITE_WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('WHOOP_CLIENT_SECRET ou VITE_WHOOP_CLIENT_ID em falta nas variáveis de ambiente do servidor.');
    return res.status(500).json({ error: 'Configuração do servidor incompleta' });
  }

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

