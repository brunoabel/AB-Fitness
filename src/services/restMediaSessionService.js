// restMediaSessionService.js — Live Activity do descanso via Web Media Session API
//
// Liga o temporizador de descanso ao ecrã de bloqueio / Dynamic Island (iOS, Android,
// Apple Watch): metadata com o tempo restante, e os botões de media (auscultadores
// Bluetooth incluídos) a controlar o descanso sem desbloquear o telemóvel.

// Silêncio ultraleve (WAV 8-bit/8kHz, 0.1s, ~850 bytes): mantém a sessão de media
// "a tocar" para o SO continuar a mostrar os controlos com o ecrã bloqueado.
const SILENT_WAV_DATA_URI =
  'data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YSADAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

function formatTime(secs) {
  const s = Math.max(0, Math.round(secs || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? '0' : ''}${r}`;
}

class RestMediaSessionService {
  constructor() {
    this.supported = typeof navigator !== 'undefined' && 'mediaSession' in navigator;
    this.audioEl = null;
  }

  // Elemento de áudio silencioso: só criado/tocado num gesto do utilizador (startCountdown)
  ensureAudio() {
    if (typeof window === 'undefined' || !this.supported) return null;
    if (!this.audioEl) {
      try {
        const el = new Audio(SILENT_WAV_DATA_URI);
        el.loop = true;
        el.preload = 'auto';
        el.volume = 0;
        el.setAttribute('playsinline', '');
        this.audioEl = el;
      } catch {
        this.audioEl = null;
      }
    }
    return this.audioEl;
  }

  primeAudio() {
    const el = this.ensureAudio();
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    }
  }

  setActionHandlers({ onSkipRest, onAddRest, onTogglePause } = {}) {
    if (!this.supported) return;
    const set = (action, handler) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler || null);
      } catch {
        // Ação não suportada neste navegador
      }
    };
    set('nexttrack', onSkipRest ? () => onSkipRest() : null);
    set('seekforward', onAddRest ? () => onAddRest(30) : null);
    set('pause', onTogglePause ? () => onTogglePause(true) : null);
    set('play', onTogglePause ? () => onTogglePause(false) : null);
  }

  // Chamado a cada segundo (ou ao pausar/retomar) com o estado atual do descanso
  updateRestSession({ timeLeft, totalSeconds, exerciseName, nextSetInfo, paused = false } = {}) {
    if (!this.supported) return;
    this.primeAudio();
    try {
      const title = `${formatTime(timeLeft)} · ${paused ? 'Descanso em pausa' : 'Descanso'}${exerciseName ? ` (${exerciseName})` : ''}`;
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist: nextSetInfo || 'AB Fitness · Série concluída',
        album: 'AB Fitness · Atleta Híbrido',
        artwork: [
          { src: '/coach/ab-coach-rest-128.jpg', sizes: '128x128', type: 'image/jpeg' },
          { src: '/coach/ab-coach-rest-128.jpg', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
      navigator.mediaSession.playbackState = paused ? 'paused' : 'playing';
      if (typeof navigator.mediaSession.setPositionState === 'function' && totalSeconds > 0) {
        navigator.mediaSession.setPositionState({
          duration: totalSeconds,
          position: Math.min(totalSeconds, Math.max(0, totalSeconds - timeLeft)),
          playbackRate: 1
        });
      }
    } catch {
      // Media Session API instável nalguns navegadores: falha silenciosa
    }
  }

  // Descanso terminou: título de celebração no ecrã de bloqueio
  markFinished({ exerciseName } = {}) {
    if (!this.supported) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: '🔔 Descanso Concluído! Inicia a próxima série',
        artist: exerciseName || 'AB Fitness',
        album: 'AB Fitness · Atleta Híbrido',
        artwork: [
          { src: '/coach/ab-coach-rest-128.jpg', sizes: '128x128', type: 'image/jpeg' },
          { src: '/coach/ab-coach-rest-128.jpg', sizes: '512x512', type: 'image/jpeg' }
        ]
      });
      navigator.mediaSession.playbackState = 'paused';
    } catch {
      // falha silenciosa
    }
  }

  // Limpa handlers, metadata e para o áudio silencioso (fim do descanso ou do treino)
  clearRestSession() {
    if (this.supported) {
      try {
        ['nexttrack', 'seekforward', 'pause', 'play'].forEach((action) => {
          navigator.mediaSession.setActionHandler(action, null);
        });
        navigator.mediaSession.metadata = null;
        navigator.mediaSession.playbackState = 'none';
      } catch {
        // falha silenciosa
      }
    }
    if (this.audioEl) {
      try {
        this.audioEl.pause();
        this.audioEl.currentTime = 0;
      } catch {
        // falha silenciosa
      }
    }
  }
}

export const restMediaSessionService = new RestMediaSessionService();
export { formatTime as formatRestTime };
