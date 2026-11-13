const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Ordena a lista semanal do squad para o Ranking do Clube:
 * treinos na semana (desc) -> volume semanal conhecido (desc) -> streak (desc).
 */
export function sortWeeklySquad(summary = []) {
  if (!Array.isArray(summary)) return [];
  return [...summary].sort((a, b) => {
    const wDiff = (Number(b?.workouts_week) || 0) - (Number(a?.workouts_week) || 0);
    if (wDiff !== 0) return wDiff;

    const volA = a?.volume_week_kg == null ? -1 : Number(a.volume_week_kg) || 0;
    const volB = b?.volume_week_kg == null ? -1 : Number(b.volume_week_kg) || 0;
    if (volB !== volA) return volB - volA;

    const sDiff = (Number(b?.streak) || 0) - (Number(a?.streak) || 0);
    if (sDiff !== 0) return sDiff;

    return String(a?.full_name || a?.username || '').localeCompare(
      String(b?.full_name || b?.username || ''),
      'pt'
    );
  });
}

/**
 * Deriva a faixa "Ativos nas últimas 24h" a partir de dados reais do resumo semanal e feed.
 * Nunca inventa atividade: apenas atletas cuja última sessão ou publicação ocorreu <= 24h.
 */
export function deriveActiveToday({
  summary = [],
  feed = [],
  currentUserId = null,
  now = new Date()
} = {}) {
  const cutoff = now.getTime() - DAY_MS;
  const nowMs = now.getTime();
  const byId = new Map();

  // 1. Feed recente (tem workout_title real ou foto publicada)
  for (const item of Array.isArray(feed) ? feed : []) {
    const id = item?.friend_id || item?.user_id;
    if (!id || id === currentUserId) continue;
    const ts = new Date(item?.completed_at || item?.created_at || 0).getTime();
    if (!Number.isFinite(ts) || ts < cutoff || ts > nowMs + 60000) continue;

    const existing = byId.get(id);
    if (!existing || ts > existing.activeAt) {
      byId.set(id, {
        friend_id: id,
        full_name: item.full_name || null,
        username: item.username || null,
        avatar_url: item.avatar_url || null,
        streak: null,
        workouts_week: null,
        volume_week_kg: null,
        activeAt: ts,
        activityLabel: item._type === 'photo'
          ? 'Publicou foto'
          : (item.workout_title || 'Treino concluído')
      });
    }
  }

  // 2. Resumo semanal (enriquece streak/volume e captura sessões mesmo sem feed visível)
  for (const s of Array.isArray(summary) ? summary : []) {
    const id = s?.friend_id;
    if (!id || id === currentUserId) continue;
    const ts = s?.last_workout_at ? new Date(s.last_workout_at).getTime() : 0;
    const existing = byId.get(id);

    if (existing) {
      byId.set(id, {
        ...s,
        ...existing,
        streak: s.streak ?? existing.streak,
        workouts_week: s.workouts_week ?? existing.workouts_week,
        volume_week_kg: s.volume_week_kg ?? existing.volume_week_kg
      });
      continue;
    }

    if (Number.isFinite(ts) && ts >= cutoff && ts <= nowMs + 60000) {
      byId.set(id, {
        ...s,
        activeAt: ts,
        activityLabel: 'Treinou hoje'
      });
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.activeAt - a.activeAt);
}
