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
  { id: 'crimson', label: 'Crimson', className: 'bg-gradient-to-r from-rose-950 via-red-950/80 to-zinc-950 border-rose-500/25', badge: 'PRO' },
  { id: 'emerald', label: 'Esmeralda Real', className: 'bg-gradient-to-r from-emerald-950 via-emerald-800/60 to-teal-950 border-emerald-400/30', badge: 'PRO' },
  { id: 'amethyst', label: 'Ametista Real', className: 'bg-gradient-to-r from-indigo-950 via-purple-900/70 to-fuchsia-950 border-purple-500/30', badge: 'PRO' },
  { id: 'sunset', label: 'Solar Flare', className: 'bg-gradient-to-r from-amber-950 via-orange-700/60 to-rose-950 border-orange-500/30', badge: 'PRO' },
  { id: 'electric_blue', label: 'Azul Elétrico', className: 'bg-gradient-to-r from-blue-950 via-indigo-900/80 to-sky-950 border-sky-400/30', badge: 'PRO' },
  { id: 'magma', label: 'Magma Vulcânico', className: 'bg-gradient-to-r from-red-950 via-orange-950/90 to-zinc-950 border-orange-500/30', badge: 'PRO' },
  { id: 'monochrome_luxury', label: 'Platina Stealth', className: 'bg-gradient-to-r from-zinc-950 via-zinc-700/40 to-black border-zinc-500/30', badge: 'PRO' }
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

// ---------- Publicação de Fotos no Perfil & Feed ----------

const POSTS_STORAGE_KEY = 'ab_athlete_posts';
const DM_STORAGE_PREFIX = 'ab_dm_';

/** Redimensiona fotos para publicação preservando a proporção de ecrã (máx 1280px) */
export async function compressPostPhoto(file, maxWidth = 1280) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const toBlob = (type, q) => new Promise((r) => canvas.toBlob(r, type, q));
  let blob = await toBlob('image/webp', 0.85);
  if (!blob || blob.type !== 'image/webp') blob = await toBlob('image/jpeg', 0.88);
  return blob;
}

export async function uploadPostPhoto(userId, blob) {
  if (!canUseSocial(userId)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ data: reader.result, error: null });
      reader.readAsDataURL(blob);
    });
  }
  const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/posts/post-${Date.now()}.${ext}`;
  try {
    const { error } = await supabase.storage.from('avatars').upload(path, blob, {
      contentType: blob.type,
      cacheControl: '31536000',
      upsert: false
    });
    if (error) throw error;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return { data: data.publicUrl, error: null };
  } catch (_err) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({ data: reader.result, error: null });
      reader.readAsDataURL(blob);
    });
  }
}

export function getLocalPosts() {
  try {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalPosts(posts) {
  try {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn('Não foi possível guardar posts localmente:', e);
  }
}

export async function createAthletePost(userId, { imageUrl, caption = '', profile = null }) {
  const newPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    user_id: userId,
    image_url: imageUrl,
    caption: (caption || '').trim(),
    full_name: profile?.full_name || 'Atleta AB',
    username: profile?.username || null,
    avatar_url: profile?.avatar_url || null,
    is_verified: Boolean(profile?.is_verified),
    is_ceo: Boolean(profile?.is_ceo),
    is_pro: Boolean(profile?.is_pro),
    respect_count: 0,
    respected_by_me: false,
    created_at: new Date().toISOString()
  };

  const local = getLocalPosts();
  saveLocalPosts([newPost, ...local]);

  if (canUseSocial(userId)) {
    try {
      const { data, error } = await supabase.from('athlete_posts').insert({
        user_id: userId,
        image_url: imageUrl,
        caption: (caption || '').trim()
      }).select().maybeSingle();

      if (!error && data) {
        newPost.id = data.id;
        const updated = getLocalPosts().map((p) => (p.image_url === imageUrl ? { ...p, id: data.id } : p));
        saveLocalPosts(updated);
      }
    } catch (_e) {}
  }

  return { data: newPost, error: null };
}

export async function listAthletePosts(targetUserId) {
  let posts = [];
  if (canUseSocial(targetUserId)) {
    try {
      const { data, error } = await supabase
        .from('athlete_posts')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      if (!error && data) posts = data;
    } catch (_e) {}
  }

  const local = getLocalPosts().filter((p) => p.user_id === targetUserId);
  const mergedMap = new Map();
  [...local, ...posts].forEach((p) => {
    if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
  });
  const result = Array.from(mergedMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return { data: result, error: null };
}

export async function listFeedPosts() {
  const local = getLocalPosts();
  let serverPosts = [];
  try {
    const { data } = await supabase
      .from('athlete_posts')
      .select('*, profiles:user_id(username, full_name, avatar_url, is_verified, role)')
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) {
      serverPosts = data.map((sp) => ({
        ...sp,
        username: sp.profiles?.username,
        full_name: sp.profiles?.full_name,
        avatar_url: sp.profiles?.avatar_url,
        is_verified: sp.profiles?.is_verified,
        is_ceo: sp.profiles?.role === 'ceo'
      }));
    }
  } catch (_e) {}

  const mergedMap = new Map();
  [...serverPosts, ...local].forEach((p) => {
    if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
  });
  const result = Array.from(mergedMap.values()).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return { data: result, error: null };
}

export async function togglePostRespect(postId, currentUserId) {
  const local = getLocalPosts();
  let updatedRespects = 0;
  const updated = local.map((p) => {
    if (p.id === postId) {
      const respected = !p.respected_by_me;
      const count = Math.max(0, (p.respect_count || 0) + (respected ? 1 : -1));
      updatedRespects = count;
      return { ...p, respected_by_me: respected, respect_count: count };
    }
    return p;
  });
  saveLocalPosts(updated);

  if (canUseSocial(currentUserId)) {
    try {
      await supabase.rpc('toggle_post_respect', { target_post: postId });
    } catch (_e) {}
  }
  return { data: updatedRespects, error: null };
}

// ---------- Conversas e Mensagens Diretas (DMs) ----------

function getDmKey(userA, userB) {
  const pair = [userA, userB].sort().join('_');
  return `${DM_STORAGE_PREFIX}${pair}`;
}

export async function listDirectMessages(currentUserId, friendId) {
  if (!currentUserId || !friendId) return { data: [], error: null };
  const key = getDmKey(currentUserId, friendId);
  let localMsgs = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) localMsgs = JSON.parse(raw);
  } catch {}

  if (canUseSocial(currentUserId)) {
    try {
      const { data, error } = await supabase
        .from('friend_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        const map = new Map();
        [...localMsgs, ...data].forEach((m) => map.set(m.id, m));
        const combined = Array.from(map.values()).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        localStorage.setItem(key, JSON.stringify(combined));
        return { data: combined, error: null };
      }
    } catch (_e) {}
  }

  return { data: localMsgs, error: null };
}

export async function sendDirectMessage(currentUserId, friendId, content, senderProfile = null) {
  if (!content || !content.trim()) return { data: null, error: 'Mensagem vazia' };
  const key = getDmKey(currentUserId, friendId);
  const newMsg = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    sender_id: currentUserId,
    receiver_id: friendId,
    content: content.trim(),
    created_at: new Date().toISOString(),
    sender_name: senderProfile?.full_name || 'Eu'
  };

  try {
    const raw = localStorage.getItem(key);
    const msgs = raw ? JSON.parse(raw) : [];
    msgs.push(newMsg);
    localStorage.setItem(key, JSON.stringify(msgs));
  } catch {}

  if (canUseSocial(currentUserId)) {
    try {
      const { data, error } = await supabase.from('friend_messages').insert({
        sender_id: currentUserId,
        receiver_id: friendId,
        content: content.trim()
      }).select().maybeSingle();
      if (!error && data) {
        newMsg.id = data.id;
      }
    } catch (_e) {}
  }

  return { data: newMsg, error: null };
}
