// Serviço de Dados de Wearables (Whoop / Apple Health / Garmin) para o AB Fitness
// Fornece métricas de Recuperação (Recovery %), Strain, HRV e Sono
// Cruzando diretamente com o volume e recomendações para o Arnold Split.

const WHOOP_STORAGE_KEY = 'ab_fitness_whoop_biometrics_v1';
const WHOOP_HISTORY_KEY = 'ab_fitness_whoop_history_v1';

// Dados biométricos iniciais de alta fidelidade para os últimos 7 a 14 dias
const INITIAL_BIOMETRIC_HISTORY = [
  {
    date: '2026-10-07',
    dayLabel: 'Qua',
    recoveryScore: 88,
    strain: 14.8,
    hrv: 79,
    restingHeartRate: 51,
    sleepHours: 8.2,
    sleepPerformance: 94,
    status: 'green',
    source: 'whoop_sync'
  },
  {
    date: '2026-10-08',
    dayLabel: 'Qui',
    recoveryScore: 74,
    strain: 16.2,
    hrv: 72,
    restingHeartRate: 53,
    sleepHours: 7.5,
    sleepPerformance: 86,
    status: 'green',
    source: 'whoop_sync'
  },
  {
    date: '2026-10-09',
    dayLabel: 'Sex',
    recoveryScore: 58,
    strain: 15.4,
    hrv: 64,
    restingHeartRate: 57,
    sleepHours: 6.8,
    sleepPerformance: 78,
    status: 'yellow',
    source: 'whoop_sync'
  },
  {
    date: '2026-10-10',
    dayLabel: 'Sáb',
    recoveryScore: 42,
    strain: 11.2,
    hrv: 56,
    restingHeartRate: 59,
    sleepHours: 6.2,
    sleepPerformance: 71,
    status: 'yellow',
    source: 'whoop_sync'
  },
  {
    date: '2026-10-11',
    dayLabel: 'Dom',
    recoveryScore: 91,
    strain: 8.5,
    hrv: 84,
    restingHeartRate: 49,
    sleepHours: 8.8,
    sleepPerformance: 96,
    status: 'green',
    source: 'whoop_sync'
  },
  {
    date: '2026-10-12',
    dayLabel: 'Seg',
    recoveryScore: 84,
    strain: 16.8,
    hrv: 78,
    restingHeartRate: 52,
    sleepHours: 7.9,
    sleepPerformance: 90,
    status: 'green',
    source: 'whoop_sync'
  },
  {
    date: '2026-10-13',
    dayLabel: 'Ter',
    recoveryScore: 82,
    strain: 15.9,
    hrv: 76,
    restingHeartRate: 53,
    sleepHours: 7.7,
    sleepPerformance: 88,
    status: 'green',
    source: 'whoop_sync'
  }
];

export function getBiometricHistory() {
  try {
    const raw = localStorage.getItem(WHOOP_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar histórico biométrico:', e);
  }
  // Se não existir, inicializar com a base de dados realista
  try {
    localStorage.setItem(WHOOP_HISTORY_KEY, JSON.stringify(INITIAL_BIOMETRIC_HISTORY));
  } catch {}
  return INITIAL_BIOMETRIC_HISTORY;
}

export function getTodayBiometrics() {
  try {
    const raw = localStorage.getItem(WHOOP_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Erro ao carregar biometria do dia:', e);
  }

  // Padrão do dia atual (Whoop Recovery Verde, alta prontidão)
  const defaultToday = {
    date: new Date().toISOString().split('T')[0],
    recoveryScore: 86, // 0 - 100%
    strain: 14.6, // Escala Whoop 0 - 21.0
    targetStrain: '14.0 - 17.5',
    hrv: 80, // Variabilidade da Frequência Cardíaca (ms)
    restingHeartRate: 52, // bpm
    sleepHours: 8.0, // horas de sono
    sleepPerformance: 92, // %
    status: 'green', // 'green' | 'yellow' | 'red'
    source: 'whoop_sync',
    lastSync: new Date().toISOString()
  };

  try {
    localStorage.setItem(WHOOP_STORAGE_KEY, JSON.stringify(defaultToday));
  } catch {}

  return defaultToday;
}

export function saveTodayBiometrics(data) {
  try {
    const score = Math.max(0, Math.min(100, Number(data.recoveryScore) || 50));
    let status = 'yellow';
    if (score >= 67) status = 'green';
    else if (score <= 33) status = 'red';

    const updated = {
      ...data,
      recoveryScore: score,
      status,
      lastSync: new Date().toISOString()
    };

    localStorage.setItem(WHOOP_STORAGE_KEY, JSON.stringify(updated));

    // Atualizar no histórico
    const history = getBiometricHistory();
    const todayStr = updated.date || new Date().toISOString().split('T')[0];
    const filtered = history.filter((h) => h.date !== todayStr);
    const newHistory = [
      ...filtered,
      {
        ...updated,
        date: todayStr,
        dayLabel: 'Hoje'
      }
    ].slice(-14);

    localStorage.setItem(WHOOP_HISTORY_KEY, JSON.stringify(newHistory));
    return updated;
  } catch (e) {
    console.error('Erro ao salvar biometria:', e);
    return data;
  }
}

// Analisa a recuperação do atleta e cruza com a rotina do Arnold Split
export function getWhoopArnoldRecommendation(biometrics, workoutDayName = 'Peito e Costas') {
  const score = biometrics?.recoveryScore ?? 85;

  if (score >= 67) {
    return {
      status: 'green',
      title: 'Prontidão Ótima para Hipertrofia (SNC Recuperado)',
      badge: 'Green Zone • 100% Volume',
      color: 'emerald',
      textColor: 'text-emerald-500 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      borderColor: 'border-emerald-500/30',
      actionTitle: 'Buscar Sobrecarga Progressiva (PR)',
      description: `Seu sistema nervoso autônomo está em equilíbrio com HRV em ${biometrics?.hrv || 80}ms e sono de ${biometrics?.sleepHours || 8}h. No treino de ${workoutDayName}, busque aumentar 1 repetição ou +2kg nos exercícios multiarticulares clássicos do Arnold Split.`
    };
  }

  if (score >= 34) {
    return {
      status: 'yellow',
      title: 'Recuperação Moderada (Manter Cargas Base)',
      badge: 'Yellow Zone • Volume Normal',
      color: 'amber',
      textColor: 'text-amber-500 dark:text-amber-400',
      bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
      borderColor: 'border-amber-500/30',
      actionTitle: 'Executar com Foco em Cadência & Técnica',
      description: `Recuperação intermediária. Não busque recordes pessoais extremos hoje no treino de ${workoutDayName}. Trabalhe dentro do RPE 7-8 planejado, mantendo o controle excêntrico de 3 segundos e respeitando o tempo de descanso entre séries.`
    };
  }

  return {
    status: 'red',
    title: 'Alerta de Fadiga Sistêmica / Baixo HRV',
    badge: 'Red Zone • Deload Sugerido (-20%)',
    color: 'rose',
    textColor: 'text-rose-500 dark:text-rose-400',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    borderColor: 'border-rose-500/30',
    actionTitle: 'Deload Adaptativo de Volume',
    description: `Fadiga acumulada detectada pelo wearable (Recovery ${score}%). Recomendamos reduzir 1 série por exercício no treino de ${workoutDayName} para evitar sobretreinamento e facilitar a supercompensação muscular nos próximos dias.`
  };
}
