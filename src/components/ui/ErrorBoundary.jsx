import React, { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export const ERROR_LOG_STORAGE_KEY = 'ab_error_log_v1';
const MAX_ERROR_LOG_ENTRIES = 10;

function persistErrorEntry(entry) {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(ERROR_LOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    const list = Array.isArray(parsed) ? parsed : [];
    const next = [entry, ...list].slice(0, MAX_ERROR_LOG_ENTRIES);
    localStorage.setItem(ERROR_LOG_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Silencioso em ambientes sem storage ou quota cheia
  }
}

/**
 * ErrorBoundary OLED para isolar falhas inesperadas sem derrubar toda a aplicação.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    const scope = this.props.scope || 'app';
    persistErrorEntry({
      timestamp: new Date().toISOString(),
      scope,
      message: error?.message ? String(error.message).slice(0, 240) : 'Erro inesperado',
      stack: info?.componentStack ? String(info.componentStack).slice(0, 600) : '',
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (typeof this.props.onReset === 'function') {
      this.props.onReset();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { compact = false, title } = this.props;
    const heading = title || (compact ? 'Não foi possível carregar esta secção' : 'Algo correu mal neste ecrã');

    return (
      <div
        role="alert"
        className={`${
          compact ? 'min-h-[280px] mx-4 my-6 rounded-3xl border border-white/[0.08] bg-surface' : 'min-h-screen bg-app'
        } flex flex-col items-center justify-center p-6 text-center`}
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-rose-400" />
        </div>
        <h2 className="font-heading text-lg font-bold text-white tracking-[-0.02em]">
          {heading}
        </h2>
        <p className="mt-1.5 max-w-sm text-xs text-zinc-400 leading-relaxed">
          Ocorreu uma falha temporária neste painel. Os teus treinos e registos locais continuam protegidos.
        </p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={this.handleRetry}
            className="min-h-[44px] px-5 rounded-full bg-white text-black hover:bg-zinc-200 font-semibold text-xs inline-flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Tentar novamente</span>
          </button>

          {!compact && typeof window !== 'undefined' && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[44px] px-4 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.1] font-semibold text-xs cursor-pointer transition-colors"
            >
              Recarregar página
            </button>
          )}
        </div>
      </div>
    );
  }
}
