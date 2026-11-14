import { buildAthleteOgHtml, sanitizeUsername } from '../src/utils/ogAthleteHtml.js';

const DEFAULT_SUPABASE_URL = 'https://tegdtjmglvrvgerrtivx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZ2R0am1nbHZydmdlcnJ0aXZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyMjI0MjMsImV4cCI6MjEwMTc5ODQyM30.9QCEIfHfhtRqfG3xrpHLYmb5-Zd-OonMp_IraT0rzk4';

function extractUsername(req) {
  if (req?.query?.u) return sanitizeUsername(req.query.u);
  try {
    const parsed = new URL(req?.url || '/', 'https://www.abfitness.app');
    return sanitizeUsername(parsed.searchParams.get('u') || '');
  } catch {
    return '';
  }
}

async function fetchPublicAthletePass(username) {
  if (!username) return null;
  const supabaseUrl = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const anonKey = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();
  if (!supabaseUrl || !anonKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_public_athlete_pass`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_username: username }),
      signal: controller.signal,
    });
    if (!response.ok) return null;
    const rows = await response.json();
    return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Vercel Serverless Function: Open Graph dinâmico para convites Athlete Pass (/?u=username).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const username = extractUsername(req);
  const athlete = await fetchPublicAthletePass(username);
  const html = buildAthleteOgHtml({ username, athlete });

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  if (req.method === 'HEAD') {
    return res.status(200).end();
  }
  return res.status(200).send(html);
}
