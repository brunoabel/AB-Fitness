/**
 * AB Fitness — Infraestrutura Realtime (Supabase Realtime Channels: Presence + Broadcast)
 * Permite treinos sincronizados em dupla (séries/cargas ao vivo) e acompanhamento de splits em tempo real.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Entra numa sala de sessão partilhada via Supabase Realtime (Presence + Broadcast).
 * Devolve o handle do canal (ou null se Supabase não estiver configurado).
 */
export function joinLiveWorkoutRoom({
  roomCode,
  userId,
  displayName = 'Atleta',
  activityType = 'workout',
  onPresenceChange,
  onEvent
} = {}) {
  if (!isSupabaseConfigured() || !supabase || !roomCode || !userId) return null;

  const cleanCode = String(roomCode).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  if (!cleanCode) return null;

  const channel = supabase.channel(`ab-live:${cleanCode}`, {
    config: {
      presence: { key: userId },
      broadcast: { self: false }
    }
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const members = Object.values(state)
        .flat()
        .map((m) => ({
          userId: m.userId,
          displayName: m.displayName,
          activityType: m.activityType,
          joinedAt: m.joinedAt
        }));
      onPresenceChange?.(members);
    })
    .on('broadcast', { event: 'session_update' }, ({ payload }) => {
      if (payload) onEvent?.(payload);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId,
          displayName,
          activityType,
          joinedAt: new Date().toISOString()
        });
      }
    });

  return channel;
}

/** Emite uma atualização ao vivo (série concluída, PR ou split de corrida) para os colegas na sala. */
export async function broadcastLiveUpdate(channel, payload) {
  if (!channel || !payload) return false;
  try {
    await channel.send({
      type: 'broadcast',
      event: 'session_update',
      payload: { ...payload, sentAt: Date.now() }
    });
    return true;
  } catch {
    return false;
  }
}

/** Sai da sala e liberta o canal Realtime. */
export function leaveLiveWorkoutRoom(channel) {
  if (!channel || !supabase) return;
  try {
    supabase.removeChannel(channel);
  } catch {}
}
