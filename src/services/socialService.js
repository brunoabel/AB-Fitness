/**
 * Perfil de atleta + sistema social (amigos, feed, respect, head-to-head).
 * Dados de amigos vêm só de RPCs SECURITY DEFINER (supabase/migrations/20261109_social_profiles.sql),
 * que verificam amizade e privacidade no servidor.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const GUEST_ID = 'guest-local-user';
export const canUseSocial = (userId) => Boolean(isSupabaseConfigured() && supabase && userId && userId !== GUEST_ID);

export const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;
export const BIO_MAX = 160;
export const ATHLETE_TAGS = ['Hipertrofia', 'Força', 'Híbrido', 'Powerlifting', 'Recomposição', 'Corrida'];
export const COVER_STYLES = [
  { id: 'midnight', label: 'Midnight', className: 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900' },
  { id: 'carbon', label: 'Carbono', className: 'bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:8px_8px] bg-zinc-950' },
  { id: 'abyss', label: 'Abismo', className: 'bg-gradient-to-r from-slate-950 via-sky-950/80 to-slate-950' },
  { id: 'gold', label: 'Ouro 24K', className: 'bg-gradient-to-r from-amber-950 via-yellow-700/50 to-amber-900 border-amber-500/30', badge: 'PRO' },
  { id: 'titanium', label: 'Titânio', className: 'bg-gradient-to-r from-neutral-800 via-stone-700 to-neutral-900 border-white/20', badge: 'PRO' },
  { id: 'cyberpunk', label: 'Neon Ciano', className: 'bg-gradient-to-r from-slate-950 via-cyan-950/80 to-teal-950 border-cyan-500/30', badge: 'PRO' },
  { id: 'aurora', label: 'Aurora', className: 'bg-gradient-to-r from-emerald-950 via-teal-900/70 to-slate-950 border-emerald-500/30', badge: 'PRO' },
  { id: 'crimson', label: 'Crimson', className: 'bg-gradient-to-r from-rose-950 via-red-950/80 to-zinc-950 border-rose-500/25', badge: 'PRO' }
];
export const FEATURED_STATS = [
  { id: 'total_workouts', label: 'Total de treinos' },
  { id: 'streak', label: 'Streak atual' },
  { id: 'monthly_volume', label: 'Volume mensal' }
];
export const PRIVACY_FIELDS = [
  { id: 'public_profile', label: 'Perfil encontrável', hint: 'Outros atletas podem encontrar-te pela pesquisa' },
  { id: 'show_history', label: 'Histórico de treinos', hint: 'Amigos veem os treinos que concluis no feed' },
  { id: 'show_weights', label: 'Cargas e volume', hint: 'Amigos veem kg exatos e volume total' },
  { id: 'show_streak', label: 'Streak', hint: 'Amigos veem os dias seguidos de treino' },
  { id: 'show_biometrics', label: 'Biometria', hint: 'Peso e medidas visíveis no teu perfil' }
];
export const DEFAULT_PRIVACY = { public_profile: true, show_history: true, show_weights: true, show_streak: true, show_biometrics: false };

const PROFILE_COLUMNS = 'id, username, full_name, avatar_url, cover_style, bio, athlete_tag, home_gym, featured_stat, privacy_settings';

const fail = (error) => ({ data: null, error: error?.message || String(error) });

export async function getMyProfile(userId) {
  if (!canUseSocial(userId)) return { data: null, error: 'Sem sessão' };
  const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', userId).maybeSingle();
  if (error) return fail(error);
  if (data) {
    return { data: { ...data, privacy_settings: { ...DEFAULT_PRIVACY, ...data.privacy_settings } }, error: null };
  }
  const { data: authData } = await supabase.auth.getUser();
  const u = authData?.user;
  if (u && u.id === userId) {
    const seed = {
      id: userId,
      email: u.email || '',
      full_name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Atleta'
    };
    const { data: created, error: insertErr } = await supabase
      .from('profiles')
      .upsert(seed, { onConflict: 'id' })
      .select(PROFILE_COLUMNS)
      .maybeSingle();
    if (!insertErr && created) {
      return { data: { ...created, privacy_settings: { ...DEFAULT_PRIVACY, ...created.privacy_settings } }, error: null };
    }
  }
  return { data: null, error: null };
}

export async function updateMyProfile(userId, patch) {
  if (!canUseSocial(userId)) return fail('Sem sessão');
  const allowed = ['username', 'full_name', 'avatar_url', 'cover_style', 'bio', 'athlete_tag', 'home_gym', 'featured_stat', 'privacy_settings'];
  const row = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)));
  if (row.username) row.username = row.username.trim().toLowerCase();
  const { data, error } = await supabase.from('profiles').update(row).eq('id', userId).select(PROFILE_COLUMNS).single();
  if (error) return fail(error.code === '23505' ? 'Esse @username já está em uso.' : error);
  return { data, error: null };
}

export async function isUsernameAvailable(candidate) {
  const { data, error } = await supabase.rpc('username_available', { candidate });
  if (error) return null;
  return Boolean(data);
}

export async function getMyCardStats() {
  const { data, error } = await supabase.rpc('get_my_card_stats');
  if (error) return null;
  return data?.[0] || null;
}

/** Redimensiona para no máx. 500 px e exporta WebP (JPEG como fallback) antes do upload. */
export async function compressAvatar(file, max = 500) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(max, side);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  // Recorte quadrado centrado (o círculo é feito no CSS)
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close?.();
  const toBlob = (type, q) => new Promise((r) => canvas.toBlob(r, type, q));
  let blob = await toBlob('image/webp', 0.82);
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg', 0.85);
  return blob;
}

export async function uploadAvatar(userId, blob) {
  if (!canUseSocial(userId)) return fail('Sem sessão');
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/avatar-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('avatars').upload(path, blob, { contentType: blob.type, cacheControl: '31536000', upsert: false });
  if (error) return fail(error);
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { data: data.publicUrl, error: null };
}

// ---------- Social ----------
export async function searchAthletes(q) {
  const { data, error } = await supabase.rpc('search_athletes', { q });
  return error ? fail(error) : { data: data || [], error: null };
}

export async function listFriendships() {
  const { data, error } = await supabase.rpc('list_friendships');
  return error ? fail(error) : { data: data || [], error: null };
}

export async function sendFriendRequest(userId, addresseeId) {
  const { error } = await supabase.from('friendships').insert({ requester_id: userId, addressee_id: addresseeId });
  if (error) return fail(error.code === '23505' ? 'Já existe um pedido entre vocês.' : error);
  return { data: true, error: null };
}

export async function respondFriendRequest(friendshipId, accept) {
  const q = accept
    ? supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    : supabase.from('friendships').delete().eq('id', friendshipId);
  const { error } = await q;
  return error ? fail(error) : { data: true, error: null };
}

export async function removeFriendship(friendshipId) {
  return respondFriendRequest(friendshipId, false);
}

export async function getFriendsWeeklySummary() {
  const { data, error } = await supabase.rpc('get_friends_weekly_summary');
  return error ? fail(error) : { data: data || [], error: null };
}

export async function getFriendFeed(maxItems = 30) {
  const { data, error } = await supabase.rpc('get_friend_feed', { max_items: maxItems });
  return error ? fail(error) : { data: data || [], error: null };
}

export async function toggleRespect(sessionId) {
  const { data, error } = await supabase.rpc('toggle_respect', { target_session: sessionId });
  return error ? fail(error) : { data, error: null };
}

export async function getHeadToHead(friendId, days = 7) {
  const { data, error } = await supabase.rpc('get_head_to_head', { friend: friendId, days });
  if (error) return fail(error);
  const by = Object.fromEntries((data || []).map((r) => [r.who, r]));
  return { data: { me: by.me || null, friend: by.friend || null }, error: null };
}

export function athleteLink(username) {
  return `${window.location.origin}/?add=${encodeURIComponent(username)}`;
}

export async function shareAthleteLink(username) {
  const url = athleteLink(username);
  const payload = { title: 'AB Fitness', text: `Treina comigo no AB Fitness: @${username}`, url };
  try {
    if (navigator.share) {
      await navigator.share(payload);
      return 'shared';
    }
    await navigator.clipboard.writeText(url);
    return 'copied';
  } catch (e) {
    if (e?.name === 'AbortError') return 'cancelled';
    try {
      await navigator.clipboard.writeText(url);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
}
