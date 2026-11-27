/**
 * AB Fitness — Catálogo Oficial de Conquistas & Medalhas
 * Sistema de gamificação para recompensar disciplina, força e performance.
 */

export const BADGES_CATALOG = [
  // 1. CORRIDA & RUNNING CLUB
  {
    id: 'first_run',
    title: 'Primeira Corrida',
    desc: 'Completou a sua 1ª corrida oficial no AB Running Club.',
    icon: 'Footprints',
    category: 'running',
    tier: 'bronze',
    color: '#ffffff' // Branco
  },
  {
    id: 'club_5k',
    title: 'Clube dos 5K',
    desc: 'Concluiu 5 km ininterruptos em uma única corrida.',
    icon: 'Trophy',
    category: 'running',
    tier: 'silver',
    color: '#a855f7' // Purple
  },
  {
    id: 'club_10k',
    title: 'Clube dos 10K',
    desc: 'Superou a marca mágica dos 10 km de corrida contínua.',
    icon: 'Crown',
    category: 'running',
    tier: 'gold',
    color: '#eab308' // Gold
  },
  {
    id: 'pace_sub5',
    title: 'Pace Sub-5',
    desc: 'Correu com ritmo médio abaixo de 5\'00" por quilómetro.',
    icon: 'Zap',
    category: 'running',
    tier: 'gold',
    color: '#f59e0b'
  },
  {
    id: 'speed_demon',
    title: 'Velocidade Pura',
    desc: 'Atingiu velocidade acima de 14 km/h em percurso.',
    icon: 'Flame',
    category: 'running',
    tier: 'silver',
    color: '#ef4444' // Red
  },
  {
    id: 'elevation_master',
    title: 'Explorador Altimétrico',
    desc: 'Superou mais de 30 metros de elevação acumulada numa corrida.',
    icon: 'Mountain',
    category: 'running',
    tier: 'silver',
    color: '#10b981' // Emerald
  },
  {
    id: 'total_50k',
    title: 'Meio Centenário (50 KM)',
    desc: 'Acumulou mais de 50 quilômetros totais no histórico.',
    icon: 'Award',
    category: 'running',
    tier: 'gold',
    color: '#dce3f0' // Gelo neutro
  },

  // 2. MUSCULAÇÃO & FORÇA PURA
  {
    id: 'first_workout',
    title: 'Primeiro Treino',
    desc: 'Finalizou a sua 1ª sessão de musculação no app.',
    icon: 'Dumbbell',
    category: 'gym',
    tier: 'bronze',
    color: '#ffffff'
  },
  {
    id: 'club_100kg_bench',
    title: 'Supino Centenário',
    desc: 'Alcançou a marca mítica de 100 kg ou mais no Supino.',
    icon: 'Target',
    category: 'gym',
    tier: 'gold',
    color: '#eab308'
  },
  {
    id: 'club_100kg_squat',
    title: 'Rei do Agachamento',
    desc: 'Executou Agachamento com 100 kg ou mais de carga.',
    icon: 'Shield',
    category: 'gym',
    tier: 'gold',
    color: '#eab308'
  },
  {
    id: 'club_100kg_deadlift',
    title: 'Levantamento Brutal',
    desc: 'Ergueu 100 kg ou mais no Levantamento Terra.',
    icon: 'Activity',
    category: 'gym',
    tier: 'gold',
    color: '#f59e0b'
  },
  {
    id: 'tonnage_titan',
    title: 'Titã do Volume',
    desc: 'Moveu mais de 5.000 kg em volume total numa única sessão.',
    icon: 'Weight',
    category: 'gym',
    tier: 'silver',
    color: '#a855f7'
  },
  {
    id: 'rel_bench_1x',
    title: 'Supino 1× Peso Corporal',
    desc: 'Ergueste no Supino pelo menos 1,0× o teu peso corporal.',
    icon: 'Target',
    category: 'gym',
    tier: 'silver',
    color: '#dce3f0'
  },
  {
    id: 'rel_squat_1_5x',
    title: 'Agachamento 1,5× Peso Corporal',
    desc: 'Executaste Agachamento com pelo menos 1,5× o teu peso corporal.',
    icon: 'Shield',
    category: 'gym',
    tier: 'gold',
    color: '#eab308'
  },
  {
    id: 'rel_deadlift_2x',
    title: 'Terra 2× Peso Corporal',
    desc: 'Ergueste no Levantamento Terra pelo menos 2,0× o teu peso corporal.',
    icon: 'Activity',
    category: 'gym',
    tier: 'gold',
    color: '#f59e0b'
  },
  {
    id: 'lifetime_50t',
    title: '50 Toneladas Acumuladas',
    desc: 'Acumulaste 50.000 kg de carga total levantada no teu histórico.',
    icon: 'Dumbbell',
    category: 'gym',
    tier: 'silver',
    color: '#dce3f0'
  },
  {
    id: 'lifetime_100t',
    title: '100 Toneladas Acumuladas',
    desc: 'Superaste 100.000 kg de tonelagem vitalícia em treinos de força.',
    icon: 'Trophy',
    category: 'gym',
    tier: 'gold',
    color: '#eab308'
  },
  {
    id: 'lifetime_500t',
    title: '500 Toneladas Acumuladas',
    desc: 'Marco de elite: meio milhão de quilos acumulados na tua carreira.',
    icon: 'Crown',
    category: 'gym',
    tier: 'gold',
    color: '#f59e0b'
  },

  // 3. CONSTÂNCIA & DISCIPLINA
  {
    id: 'streak_iron_week',
    title: 'Semana de Ferro',
    desc: '7 dias consecutivos cumprindo o cronograma sem falhas.',
    icon: 'Sparkles',
    category: 'consistency',
    tier: 'gold',
    color: '#eab308'
  },
  {
    id: 'streak_3_days',
    title: 'Trinca de Fogo',
    desc: 'Concluiu 3 treinos consecutivos com disciplina inabalável.',
    icon: 'Flame',
    category: 'consistency',
    tier: 'bronze',
    color: '#f59e0b'
  },
  {
    id: 'early_bird',
    title: 'Madrugador de Elite',
    desc: 'Completou um treino antes das 08:30 da manhã.',
    icon: 'Sun',
    category: 'consistency',
    tier: 'bronze',
    color: '#f59e0b'
  },
  {
    id: 'night_owl',
    title: 'Guerreiro Noturno',
    desc: 'Treinou após as 21:00 provando que não há desculpas.',
    icon: 'Moon',
    category: 'consistency',
    tier: 'bronze',
    color: '#e4e4e7'
  }
];
