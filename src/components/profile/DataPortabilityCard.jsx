import React, { useRef, useState } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import {
  getWorkoutHistory,
  getRunsHistory,
  getSavedWeights,
  getCustomWorkouts,
  getCompletedDays,
  getSavedUserProfile,
  addWorkoutToHistory
} from '../../utils/storage';
import { getLocalFitnessProfile } from '../../services/fitnessProfileService';
import { getUnlockedBadges, evaluateAndUnlockBadges } from '../../utils/badgeService';
import { getLocalBiometrics } from '../../services/wearables/wearableManager';
import { localDateKey } from '../../utils/dateKey';
import { triggerHaptic } from '../../utils/audio';
import {
  workoutsToCsv,
  runsToCsv,
  parseCompetitorWorkoutsCsv,
  triggerFileDownload
} from '../../utils/dataPortability';

/**
 * Portabilidade Aberta de Dados (RGPD + Importação Hevy / Strong / AB Fitness).
 */
export default function DataPortabilityCard({ onImported }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null); // { type: 'ok' | 'error', text: string }

  const handleExportJson = () => {
    triggerHaptic(10);
    const payload = {
      app: 'AB Fitness',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: getSavedUserProfile(),
      fitnessProfile: getLocalFitnessProfile(),
      workouts: getWorkoutHistory(),
      runs: getRunsHistory(),
      savedWeights: getSavedWeights(),
      customWorkouts: getCustomWorkouts(),
      completedDays: getCompletedDays(),
      unlockedBadges: getUnlockedBadges(),
      biometrics: getLocalBiometrics()
    };
    const dateTag = localDateKey(new Date());
    triggerFileDownload(
      JSON.stringify(payload, null, 2),
      `ab-fitness-backup-${dateTag}.json`,
      'application/json;charset=utf-8'
    );
    setStatus({ type: 'ok', text: 'Backup completo em JSON transferido.' });
  };

  const handleExportWorkoutsCsv = () => {
    triggerHaptic(10);
    const workouts = getWorkoutHistory();
    if (!workouts.length) {
      setStatus({ type: 'error', text: 'Ainda não tens treinos de força registados para exportar.' });
      return;
    }
    const csv = `\uFEFF${workoutsToCsv(workouts)}`;
    triggerFileDownload(
      csv,
      `ab-fitness-treinos-${localDateKey(new Date())}.csv`,
      'text/csv;charset=utf-8'
    );
    setStatus({ type: 'ok', text: `${workouts.length} treinos exportados em CSV.` });
  };

  const handleExportRunsCsv = () => {
    triggerHaptic(10);
    const runs = getRunsHistory();
    if (!runs.length) {
      setStatus({ type: 'error', text: 'Ainda não tens corridas registadas para exportar.' });
      return;
    }
    const csv = `\uFEFF${runsToCsv(runs)}`;
    triggerFileDownload(
      csv,
      `ab-fitness-corridas-${localDateKey(new Date())}.csv`,
      'text/csv;charset=utf-8'
    );
    setStatus({ type: 'ok', text: `${runs.length} corridas exportadas em CSV.` });
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const existing = getWorkoutHistory();
      const result = parseCompetitorWorkoutsCsv(text, existing);

      if (result.error) {
        setStatus({ type: 'error', text: result.error });
        return;
      }

      if (result.workouts.length === 0) {
        setStatus({
          type: 'ok',
          text: result.skippedDuplicates > 0
            ? `Todos os ${result.skippedDuplicates} treinos deste ficheiro já existiam no teu histórico.`
            : 'Nenhum treino novo encontrado no ficheiro.'
        });
        return;
      }

      // Inserir do mais antigo para o mais recente para preservar ordenação cronológica
      const sorted = [...result.workouts].sort((a, b) => a.timestamp - b.timestamp);
      sorted.forEach((w) => addWorkoutToHistory(w));
      evaluateAndUnlockBadges('workout');
      triggerHaptic([15, 40, 15]);

      const formatLabel = result.format === 'hevy' ? 'Hevy' : result.format === 'strong' ? 'Strong' : 'AB Fitness';
      const dupNote = result.skippedDuplicates > 0 ? ` (${result.skippedDuplicates} duplicados ignorados)` : '';
      setStatus({
        type: 'ok',
        text: `${result.workouts.length} treinos (${result.setsImported} séries) importados da ${formatLabel}${dupNote}.`
      });
      onImported?.();
    } catch {
      setStatus({ type: 'error', text: 'Não foi possível ler o ficheiro CSV selecionado.' });
    }
  };

  return (
    <section aria-label="Exportar ou importar dados" className="space-y-4 pt-1">
      <p className="text-sm text-zinc-400">Exporta em JSON ou CSV, ou importa da Hevy e da Strong.</p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleExportJson}
          className="min-h-[44px] px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-white inline-flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-[background-color,transform] duration-150"
        >
          <FileJson className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.75} />
          <span>Exportar JSON</span>
        </button>

        <button
          type="button"
          onClick={handleExportWorkoutsCsv}
          className="min-h-[44px] px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-zinc-200 inline-flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-[background-color,transform] duration-150"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.75} />
          <span>CSV Treinos</span>
        </button>

        <button
          type="button"
          onClick={handleExportRunsCsv}
          className="min-h-[44px] px-3.5 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-zinc-200 inline-flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-[background-color,transform] duration-150"
        >
          <Download className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.75} />
          <span>CSV Corridas</span>
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="min-h-[44px] px-3.5 py-2 rounded-full bg-accent/40 hover:bg-accent/60 border border-accent-hover text-xs font-semibold text-white inline-flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-[background-color,transform] duration-150"
        >
          <Upload className="w-3.5 h-3.5 text-white" strokeWidth={1.75} />
          <span>Importar CSV (Hevy / Strong)</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleImportFile}
          className="hidden"
        />
      </div>

      {status && (
        <div
          role="status"
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs border ${
            status.type === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/25 text-rose-300'
          }`}
        >
          {status.type === 'ok' ? (
            <Check className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span>{status.text}</span>
        </div>
      )}
    </section>
  );
}
