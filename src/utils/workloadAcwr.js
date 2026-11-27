/**
 * AB Fitness — Motor Determinístico de Carga Aguda vs. Crónica (ACWR — Gabbett)
 * Prevenção de lesão e sobrecarga unificando treinos de força e corridas GPS.
 *
 * - Carga Aguda (Acute): soma de Unidades de Carga (AU) dos últimos 7 dias.
 * - Carga Crónica (Chronic): média semanal de AU das 3 semanas anteriores (dias 7 a 28), sem a semana atual.
 *   Com a semana atual incluída (rácio "acoplado"), quem volta de uma pausa de 2-3 semanas ficava com rácio > 2
 *   e a progressão travada sem haver sobrecarga real.
 * - ACWR = acute / chronic:
 *     < 0.80  -> underload  (Subcarga / destreino)
 *     0.80–1.30 -> sweet_spot (Zona ótima de progressão)
 *     1.30–1.50 -> caution    (Atenção: subida rápida de carga)
 *     > 1.50  -> high_risk  (Risco elevado de sobrecarga/lesão)
 */

const DAY_MS = 86400000;

function parseTimeMs(record) {
  if (!record) return 0;
  if (typeof record.timestamp === 'number' && record.timestamp > 0) return record.timestamp;
  const raw = record.completedAt || record.date || record.created_at;
  if (!raw) return 0;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Calcula Unidades de Carga (AU) de uma sessão de musculação. */
export function workoutSessionLoadAU(workout) {
  if (!workout) return 0;
  let hardSets = 0;
  let rpeSum = 0;
  let rpeCount = 0;

  const exData = workout.exercisesData || {};
  for (const sets of Object.values(exData)) {
    if (!Array.isArray(sets)) continue;
    for (const s of sets) {
      if (!(s?.completed || s?.done) || s?.type === 'W') continue;
      hardSets += 1;
      const rpe = Number(s?.rpe);
      if (Number.isFinite(rpe) && rpe >= 5 && rpe <= 10) {
        rpeSum += rpe;
        rpeCount += 1;
      }
    }
  }

  if (hardSets === 0) {
    hardSets = Math.max(0, Number(workout.totalSetsCompleted ?? workout.totalSets) || 0);
  }
  if (hardSets === 0) {
    const dur = Number(workout.durationMinutes) || 0;
    return dur > 0 ? Math.round(dur * 4) : 0;
  }

  const avgRpe = rpeCount > 0 ? rpeSum / rpeCount : 7.5;
  // ~15 séries a RPE 8 ≈ 120 AU (equivalente a ~10 km de corrida leve)
  return Math.round(hardSets * avgRpe);
}

/** Calcula Unidades de Carga (AU) de uma corrida GPS. */
export function runSessionLoadAU(run) {
  if (!run) return 0;
  const distKm = Number(run.distanceKm ?? run.distance_km) || 0;
  if (distKm <= 0) return 0;
  const elevM = Math.max(0, Number(run.elevationGainM ?? run.elevation_gain_m) || 0);
  const paceSec = Number(run.avgPaceSeconds ?? run.avg_pace_seconds) || 0;
  // Corrida mais rápida (< 4'30"/km) aumenta o fator de intensidade
  const paceFactor = paceSec > 0 && paceSec < 270 ? 1.2 : paceSec > 0 && paceSec < 315 ? 1.1 : 1.0;
  return Math.round(distKm * 12 * (1 + elevM / 300) * paceFactor);
}

/**
 * Calcula ACWR (7d : média semanal 28d), variação semana-a-semana e guardrails acionáveis.
 * Requer atividade nas 3 semanas anteriores para evitar falsos alarmes no arranque e no regresso de uma pausa.
 */
export function computeWorkloadACWR({ workouts = [], runs = [], now = Date.now() } = {}) {
  const nowMs = typeof now === 'number' ? now : new Date(now).getTime();
  const weekBuckets = [0, 0, 0, 0]; // [0..7d, 7..14d, 14..21d, 21..28d]

  const accumulate = (ts, load) => {
    if (load <= 0 || ts <= 0 || ts > nowMs + DAY_MS) return;
    const ageDays = Math.max(0, (nowMs - ts) / DAY_MS);
    if (ageDays >= 28) return;
    const idx = Math.min(3, Math.floor(ageDays / 7));
    weekBuckets[idx] += load;
  };

  for (const w of workouts || []) accumulate(parseTimeMs(w), workoutSessionLoadAU(w));
  for (const r of runs || []) accumulate(parseTimeMs(r), runSessionLoadAU(r));

  const acuteLoad = Math.round(weekBuckets[0]);
  const prevWeekLoad = Math.round(weekBuckets[1]);
  const priorActiveWeeks = weekBuckets.slice(1).filter((v) => v > 0).length;
  const chronicLoad = Math.round((weekBuckets[1] + weekBuckets[2] + weekBuckets[3]) / 3);

  if (chronicLoad < 40 || priorActiveWeeks < 3) {
    return {
      ready: false,
      acuteLoad,
      chronicLoad,
      ratio: null,
      weekOverWeekPct: null,
      status: 'insufficient_data',
      label: 'A calibrar histórico',
      recommendDeload: false,
      lockOverload: false,
      headline: null,
      detail: 'Precisas de 3 semanas seguidas de treino antes desta para calibrar a tua carga crónica.'
    };
  }

  const ratio = Number((acuteLoad / chronicLoad).toFixed(2));
  const weekOverWeekPct = prevWeekLoad >= 40
    ? Math.round(((acuteLoad - prevWeekLoad) / prevWeekLoad) * 100)
    : null;

  const sharpSpike = weekOverWeekPct !== null && weekOverWeekPct > 30 && acuteLoad >= 150;

  let status = 'sweet_spot';
  let label = 'Zona ótima';
  let recommendDeload = false;
  let lockOverload = false;
  let headline = 'Carga semanal equilibrada';
  let detail = `Rácio agudo:crónico em ${ratio.toFixed(2)} (zona ideal 0.80–1.30).`;

  if (ratio > 1.5 || (ratio >= 1.35 && sharpSpike)) {
    status = 'high_risk';
    label = 'Risco de sobrecarga';
    recommendDeload = true;
    lockOverload = true;
    headline = 'Pico de carga: protege as articulações';
    detail = `Esta semana carregaste ${ratio.toFixed(2).replace('.', ',')}× a tua média${sharpSpike ? ` (+${weekOverWeekPct}% face à anterior)` : ''}. Tira 1 série hoje.`;
  } else if (ratio > 1.3 || sharpSpike) {
    status = 'caution';
    label = 'Atenção ao pico';
    recommendDeload = false;
    lockOverload = false;
    headline = 'Carga semanal a subir depressa';
    detail = 'Mantém o volume. Não acrescentes séries esta semana.';
  } else if (ratio < 0.8) {
    status = 'underload';
    label = 'Carga baixa';
    headline = 'Volume abaixo da tua média habitual';
    detail = 'Boa altura para voltar ao ritmo, aos poucos.';
  }

  return {
    ready: true,
    acuteLoad,
    chronicLoad,
    ratio,
    weekOverWeekPct,
    status,
    label,
    recommendDeload,
    lockOverload,
    headline,
    detail
  };
}
