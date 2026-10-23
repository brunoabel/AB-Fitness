/**
 * AB Fitness — Serviço de Locução e Feedback de Voz (Web Speech API)
 * Transmite avisos auditivos nos fones de ouvido durante a corrida (splits, pausas e metas).
 */

const STORAGE_VOICE_KEY = 'ab_fitness_voice_cues_enabled_v1';

export const isSpeechSupported = () => {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
};

export const getVoiceCuesPreference = () => {
  try {
    const saved = localStorage.getItem(STORAGE_VOICE_KEY);
    return saved !== null ? saved === 'true' : true; // Ativo por padrão
  } catch {
    return true;
  }
};

export const saveVoiceCuesPreference = (enabled) => {
  try {
    localStorage.setItem(STORAGE_VOICE_KEY, String(Boolean(enabled)));
  } catch {}
};

/**
 * Desbloqueia o sintetizador de voz no iOS Safari (deve ser invocado em resposta a um gesto do utilizador)
 */
export const unlockSpeechIOS = () => {
  if (!isSpeechSupported()) return;
  try {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(' ');
    utterance.volume = 0.01;
    synth.speak(utterance);
  } catch {}
};


/**
 * Fala uma mensagem de texto usando a melhor voz em Português disponível no dispositivo
 */
export const speakText = (text) => {
  if (!isSpeechSupported() || !getVoiceCuesPreference() || !text) return;

  try {
    const synth = window.speechSynthesis;
    // Cancela fala anterior para evitar atrasos ou sobreposições
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR'; // Tenta PT-BR ou PT-PT
    utterance.rate = 1.05;    // Ritmo ligeiramente mais enérgico para esporte
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Tentar selecionar voz nativa em português se disponível
    const voices = synth.getVoices ? synth.getVoices() : [];
    if (voices && voices.length > 0) {
      const ptVoice = voices.find((v) => v.lang && (v.lang.startsWith('pt') || v.lang.includes('Portuguese')));
      if (ptVoice) {
        utterance.voice = ptVoice;
      }
    }

    synth.speak(utterance);
  } catch (err) {
    console.warn('Falha no sintetizador de voz:', err);
  }
};

/**
 * Anúncio de KM Concluído (Split)
 */
export const announceSplit = (km, durationSeconds, paceStr) => {
  if (!durationSeconds || durationSeconds <= 0) return;

  const splitMinutes = Math.floor(durationSeconds / 60);
  const splitSeconds = durationSeconds % 60;
  
  let timeText = '';
  if (splitMinutes > 0 && splitSeconds > 0) {
    timeText = `${splitMinutes} ${splitMinutes === 1 ? 'minuto' : 'minutos'} e ${splitSeconds} segundos`;
  } else if (splitMinutes > 0) {
    timeText = `${splitMinutes} ${splitMinutes === 1 ? 'minuto' : 'minutos'}`;
  } else {
    timeText = `${splitSeconds} segundos`;
  }

  // Converter pace (ex: "5'12\"" ou "5:12") para pronúncia limpa
  let paceText = '';
  if (paceStr) {
    const match = paceStr.match(/(\d+)[':](\d+)/);
    if (match) {
      paceText = `Ritmo médio: ${match[1]} e ${match[2]} por quilômetro.`;
    }
  }

  const message = `Quilômetro ${km} concluído. Tempo da parcial: ${timeText}. ${paceText}`.trim();
  speakText(message);
};

export const announceStart = () => {
  speakText('Corrida iniciada. Bom treino, atleta!');
};

export const announcePause = () => {
  speakText('Corrida pausada.');
};

export const announceResume = () => {
  speakText('Corrida retomada.');
};

export const announceFinish = (distanceKm, durationSeconds) => {
  const kmFormatted = Number(distanceKm || 0).toFixed(1);
  const mins = Math.floor((durationSeconds || 0) / 60);
  speakText(`Treino de corrida concluído! Distância total de ${kmFormatted} quilômetros em ${mins} minutos. Parabéns!`);
};
