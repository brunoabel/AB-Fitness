import React, { useState } from 'react';
import { 
  Activity, 
  Moon, 
  Heart, 
  Flame, 
  Sparkles, 
  Sliders, 
  TrendingUp, 
  X 
} from 'lucide-react';
import { 
  getTodayBiometrics, 
  saveTodayBiometrics, 
  getBiometricHistory, 
  getWhoopArnoldRecommendation 
} from '../utils/wearableService';
import { triggerHaptic } from '../utils/audio';

export default function WhoopRecoveryHub({ currentWorkoutName = 'Peito e Costas' }) {
  const [biometrics, setBiometrics] = useState(() => getTodayBiometrics());
  const [history, setHistory] = useState(() => getBiometricHistory());
  const [isEditing, setIsEditing] = useState(false);
  const [tempScore, setTempScore] = useState(biometrics.recoveryScore);
  const [tempStrain, setTempStrain] = useState(biometrics.strain);
  const [tempHrv, setTempHrv] = useState(biometrics.hrv);
  const [tempSleep, setTempSleep] = useState(biometrics.sleepHours);

  const recommendation = getWhoopArnoldRecommendation(biometrics, currentWorkoutName);

  const handleSaveMetrics = (e) => {
    e?.preventDefault();
    triggerHaptic(15);
    const updated = saveTodayBiometrics({
      ...biometrics,
      recoveryScore: Number(tempScore),
      strain: Number(tempStrain),
      hrv: Number(tempHrv),
      sleepHours: Number(tempSleep),
      sleepPerformance: Math.min(100, Math.round((Number(tempSleep) / 8) * 95))
    });
    setBiometrics(updated);
    setHistory(getBiometricHistory());
    setIsEditing(false);
  };

  const handlePreset = (type) => {
    triggerHaptic(10);
    if (type === 'green') {
      setTempScore(90);
      setTempStrain(15.2);
      setTempHrv(84);
      setTempSleep(8.2);
    } else if (type === 'yellow') {
      setTempScore(58);
      setTempStrain(14.0);
      setTempHrv(62);
      setTempSleep(6.9);
    } else {
      setTempScore(28);
      setTempStrain(11.0);
      setTempHrv(45);
      setTempSleep(5.4);
    }
  };

  // Cores dinâmicas baseadas no Whoop Recovery Score
  const score = biometrics.recoveryScore;
  const isGreen = score >= 67;
  const isYellow = score >= 34 && score < 67;

  const ringColor = isGreen ? '#10b981' : isYellow ? '#f59e0b' : '#f43f5e';
  const ringBg = isGreen ? 'text-emerald-500' : isYellow ? 'text-amber-500' : 'text-rose-500';

  // Cálculo da circunferência SVG (raio 44 -> 2 * PI * 44 = 276.46)
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Card Principal: Monitor de Prontidão Wearable (Whoop 4.0 Style) */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden transition-colors">
        
        {/* Cabeçalho do Card */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: ringColor }} />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
              <span>WHOOP • BIOMETRIA & PRONTIDÃO</span>
            </span>
          </div>

          <button
            onClick={() => {
              setTempScore(biometrics.recoveryScore);
              setTempStrain(biometrics.strain);
              setTempHrv(biometrics.hrv);
              setTempSleep(biometrics.sleepHours);
              setIsEditing(true);
              triggerHaptic(10);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-bold text-zinc-700 dark:text-zinc-300 transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Ajustar / Sincronizar</span>
          </button>
        </div>

        {/* Indicador Central: Anel de Recuperação Circular */}
        <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
          
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              {/* Círculo de fundo */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Arco de recuperação com gradiente */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={ringColor}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Texto Central da Recuperação */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white leading-none">
                {score}%
              </span>
              <span className={`text-[10px] font-extrabold uppercase mt-1 tracking-wider ${ringBg}`}>
                {isGreen ? 'ÓTIMO' : isYellow ? 'MODERADO' : 'DELOAD'}
              </span>
            </div>
          </div>

          {/* Métricas-Chave em Grid */}
          <div className="w-full grid grid-cols-2 gap-2 text-xs">
            {/* Day Strain */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Day Strain</span>
                <Flame className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white">
                {biometrics.strain} <span className="text-[10px] font-normal text-zinc-400">/ 21.0</span>
              </div>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Alvo: {biometrics.targetStrain || '14.0 - 17.5'}
              </span>
            </div>

            {/* HRV */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">HRV (SNC)</span>
                <Activity className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white">
                {biometrics.hrv} <span className="text-[10px] font-normal text-zinc-400">ms</span>
              </div>
              <span className="text-[9px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-0.5">
                <TrendingUp className="w-2.5 h-2.5" /> +5ms vs média
              </span>
            </div>

            {/* Sono */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Sono</span>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white">
                {biometrics.sleepHours}h
              </div>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Eficiência: {biometrics.sleepPerformance}%
              </span>
            </div>

            {/* Frequência Cardíaca de Repouso */}
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col justify-between">
              <div className="flex items-center justify-between text-zinc-400 dark:text-zinc-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">RHR (Repouso)</span>
                <Heart className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white">
                {biometrics.restingHeartRate} <span className="text-[10px] font-normal text-zinc-400">bpm</span>
              </div>
              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Excelente condicionamento
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso de Strain Diário Whoop */}
        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">
              Carga Fisiológica Acumulada (Strain)
            </span>
            <span className="font-bold text-zinc-900 dark:text-white">
              {biometrics.strain} / 21.0
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-amber-400 to-orange-500 transition-all duration-700"
              style={{ width: `${Math.min(100, (biometrics.strain / 21) * 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Card de Recomendação Biomecânica Adaptativa para o Arnold Split */}
      <div className={`p-4 rounded-3xl border ${recommendation.borderColor} ${recommendation.bgColor} space-y-2.5 transition-all`}>
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-current ${recommendation.textColor}`}>
            {recommendation.badge}
          </span>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
            Arnold Split
          </span>
        </div>

        <h4 className={`text-sm font-bold ${recommendation.textColor}`}>
          {recommendation.title}
        </h4>

        <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {recommendation.description}
        </p>

        <div className="pt-2 border-t border-zinc-200/40 dark:border-zinc-700/40 flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Diretriz da Sessão:</span>
          <span className={`flex items-center gap-1 ${recommendation.textColor}`}>
            <Sparkles className="w-3.5 h-3.5" />
            {recommendation.actionTitle}
          </span>
        </div>
      </div>

      {/* Histórico dos últimos dias (Mini Sparkline / Timeline) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
            Últimos 7 Dias de Recuperação
          </h4>
          <span className="text-[10px] text-zinc-400">Média: 74%</span>
        </div>

        <div className="flex items-end justify-between gap-1.5 pt-2 h-24">
          {history.slice(-7).map((day, idx) => {
            const barHeight = Math.max(15, (day.recoveryScore / 100) * 80);
            const isBarGreen = day.recoveryScore >= 67;
            const isBarYellow = day.recoveryScore >= 34 && day.recoveryScore < 67;
            const colorClass = isBarGreen 
              ? 'bg-emerald-500' 
              : isBarYellow 
                ? 'bg-amber-500' 
                : 'bg-rose-500';

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">
                  {day.recoveryScore}%
                </span>
                <div className="w-full max-w-[28px] h-16 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg flex items-end p-0.5">
                  <div 
                    className={`w-full rounded-md ${colorClass} transition-all duration-500`}
                    style={{ height: `${barHeight}%` }}
                    title={`${day.dayLabel}: ${day.recoveryScore}% recovery, ${day.strain} strain`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal / Sheet para Ajustar & Simular Wearables */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 space-y-4 animate-scaleUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Ajustar Métricas Whoop / Wearable
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets Rápidos */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Simulações Rápidas de Prontidão:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePreset('green')}
                  className="py-1.5 px-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold active:scale-95 transition-all"
                >
                  🟢 90% (Verde)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('yellow')}
                  className="py-1.5 px-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold active:scale-95 transition-all"
                >
                  🟡 58% (Amarelo)
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('red')}
                  className="py-1.5 px-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold active:scale-95 transition-all"
                >
                  🔴 28% (Vermelho)
                </button>
              </div>
            </div>

            {/* Sliders Manuais */}
            <form onSubmit={handleSaveMetrics} className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Recovery Score:</span>
                  <span className="text-sky-400">{tempScore}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={tempScore}
                  onChange={(e) => setTempScore(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span>Day Strain (0 - 21):</span>
                  <span className="text-orange-400">{tempStrain}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="21"
                  step="0.5"
                  value={tempStrain}
                  onChange={(e) => setTempStrain(Number(e.target.value))}
                  className="w-full accent-orange-400 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">HRV (ms):</label>
                  <input
                    type="number"
                    value={tempHrv}
                    onChange={(e) => setTempHrv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold border border-zinc-200 dark:border-zinc-700 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1">Sono (horas):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tempSleep}
                    onChange={(e) => setTempSleep(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs font-bold border border-zinc-200 dark:border-zinc-700 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black text-xs font-bold cursor-pointer"
                >
                  Salvar Dados
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
