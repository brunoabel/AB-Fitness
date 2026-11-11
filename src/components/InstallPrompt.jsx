import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';
import { triggerHaptic } from '../utils/audio';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  const [isStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  });

  useEffect(() => {
    if (isStandalone) return;

    // Evento PWA para Chrome / Android
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('la_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Se for iOS e ainda não dispensou
    if (isIos && !localStorage.getItem('la_pwa_dismissed')) {
      const timer = setTimeout(() => setShowPrompt(true), 1500);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, [isIos, isStandalone]);

  const handleInstallClick = async () => {
    triggerHaptic(15);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    triggerHaptic(10);
    setShowPrompt(false);
    localStorage.setItem('la_pwa_dismissed', 'true');
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="mx-4 mt-3 animate-slideUp">
      <div className="p-3.5 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white leading-tight">
              Instalar a Aplicação no Telemóvel
            </h4>
            <p className="text-[11px] text-zinc-400 font-normal leading-snug">
              {isIos ? (
                <span className="flex items-center gap-1">
                  Toque em <Share className="w-3 h-3 inline text-zinc-300" /> e depois em <PlusSquare className="w-3 h-3 inline text-zinc-300" /> <strong>"Ecrã Principal"</strong>
                </span>
              ) : (
                'Abra em ecrã inteiro como aplicação nativa e use offline no treino'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isIos && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-primary text-app hover:bg-primary-hover text-xs font-bold active:scale-95 transition-colors cursor-pointer"
            >
              Instalar
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="w-9 h-9 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
            aria-label="Dispensar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
