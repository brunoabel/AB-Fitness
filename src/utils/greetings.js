/**
 * Saudações contextuais do header (estilo "abrir o app e ele já te conhece").
 * Escolhe uma frase pelo contexto (hora, dia, treino de hoje, streak, semana) e mantém-na estável
 * durante a sessão: a semente é o dia + a sessão do browser, por isso não muda a cada render.
 */
const SEED_KEY = 'ab_greeting_seed_v1';

function sessionSeed() {
  try {
    let s = sessionStorage.getItem(SEED_KEY);
    if (!s) {
      s = String(Math.floor(Math.random() * 1e9));
      sessionStorage.setItem(SEED_KEY, s);
    }
    return Number(s);
  } catch {
    return 7;
  }
}

const pick = (list, seed) => list[seed % list.length];
const withName = (text, name) => text.replaceAll('{n}', name ? `, ${name}` : '').replaceAll('{N}', name || 'atleta');

/**
 * @param {{ name?: string, streak: number, done: number, target: number, todayWorkout?: object, trainedToday: boolean, now?: Date }} ctx
 */
export function buildGreeting({ name = '', streak = 0, done = 0, target = 4, todayWorkout, trainedToday = false, now = new Date() }) {
  const h = now.getHours();
  const dow = now.getDay(); // 0 = domingo
  const seed = sessionSeed() + now.getDate();
  const isRest = Boolean(todayWorkout?.isRestDay) || !todayWorkout?.exercises?.length;
  const workoutName = todayWorkout?.title ? todayWorkout.title.split(/[&:·-]/)[0].trim() : '';

  // Ordem de prioridade: o que é mais relevante agora ganha
  if (trainedToday) {
    return withName(pick(['Treino feito{n}. Agora é recuperar.', 'Missão de hoje cumprida{n}.', 'Já está{n}. Proteína e descanso.', 'Mais um no saco{n}.'], seed), name);
  }
  if (done >= target && target > 0) {
    return withName(pick(['Semana fechada{n}. Que consistência.', 'Meta da semana batida{n}.', 'Semana perfeita até aqui{n}.'], seed), name);
  }
  if (h >= 0 && h < 5) {
    return withName(pick(['Ainda acordado{n}? O descanso também conta.', 'Noite longa{n}? Amanhã treinamos.', 'Hora de dormir{n}. O músculo agradece.'], seed), name);
  }
  if (isRest) {
    return withName(pick(['Dia de descanso{n}. Recarrega.', 'Hoje o treino é recuperar{n}.', 'Folga merecida{n}. Bebe água.', 'Descansa hoje{n}, amanhã há mais.'], seed), name);
  }
  if (streak >= 7) {
    return withName(pick([`${streak} dias seguidos{n}. Não pares agora.`, `Streak de ${streak} dias{n}. Imparável.`, `${streak} dias em linha{n}. Isto é disciplina.`], seed), name);
  }
  if (streak === 0 && done === 0 && dow !== 1) {
    return withName(pick(['Bora recomeçar{n}?', 'Hoje é um bom dia para voltar{n}.', 'O primeiro treino da semana espera por ti{n}.'], seed), name);
  }
  if (dow === 1 && h < 14) {
    return withName(pick(['Segunda-feira{n}. A semana começa aqui.', 'Nova semana, nova carga{n}.', 'Bom arranque de semana{n}.'], seed), name);
  }
  if (dow === 5) {
    return withName(pick(['Sexta{n}. Fecha a semana em força.', 'Último empurrão da semana{n}.'], seed), name);
  }
  if (workoutName && seed % 3 === 0) {
    return withName(pick([`Hoje é dia de ${workoutName}{n}.`, `${workoutName} à tua espera{n}.`], seed), name);
  }
  if (h < 12) return withName(pick(['Bom dia{n}. Pronto para treinar?', 'Bom dia{n}. Vamos a isso?', 'Café tomado{n}? Bora treinar.'], seed), name);
  if (h < 19) return withName(pick(['Boa tarde{n}. Hora do treino?', 'Boa tarde{n}. O ginásio chama.', 'Ainda dá tempo de treinar hoje{n}.'], seed), name);
  return withName(pick(['Boa noite{n}. Treino noturno?', 'Ainda vais treinar hoje{n}?', 'Boa noite{n}. Fecha o dia em grande.'], seed), name);
}
