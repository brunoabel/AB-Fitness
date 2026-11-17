import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Plus,
  Archive,
  StickyNote,
  Tag,
  X as XIcon,
  MessageSquareText,
  Check,
  Copy,
  UserMinus
} from 'lucide-react';
import { SkeletonList } from '../ui/Skeleton';
import { useAuth } from '../../context';
import {
  getAthleteContext,
  listAssignedProgramsForAthlete,
  archiveAssignedProgram,
  setRosterNote,
  setRosterTags,
  listAthleteFeedback
} from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';
import VerifiedBadge from '../ui/VerifiedBadge';
import { isAthleteVerified } from '../../utils/userVerification';
import ProgramBuilderSheet from './ProgramBuilderSheet';
import AthleteFeedback from './AthleteFeedback';

/**
 * Dossiê do atleta em fluxo OLED sem blocos: telemetria de 7 dias, restrições articulares,
 * prescrições ativas em ledger, feedback pós-treino e nota clínica persistida.
 */
export default function AthleteWorkspace({
  athleteId,
  athleteSummary = null,
  onBack,
  onArchiveAthlete,
  embedded = false,
  tags: initialTags = [],
  onTagsChanged
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [buildingProgram, setBuildingProgram] = useState(null); // null | { seedProgram }
  const [note, setNote] = useState(athleteSummary?.private_notes || '');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedFlash, setNoteSavedFlash] = useState(false);
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [savingTags, setSavingTags] = useState(false);
  const [confirmArchiveProgId, setConfirmArchiveProgId] = useState(null);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const load = async () => {
    setLoading(true);
    const [ctx, progs, fb] = await Promise.all([
      getAthleteContext(athleteId),
      listAssignedProgramsForAthlete(athleteId),
      listAthleteFeedback(athleteId)
    ]);
    setContext(ctx.data);
    setPrograms(progs.data || []);
    setFeedback(fb.data || []);
    const resolvedNote = athleteSummary?.private_notes ?? ctx.data?.privateNote ?? '';
    setNote(resolvedNote);
    if (ctx.data?.tags?.length && (!initialTags || initialTags.length === 0)) {
      setTags(ctx.data.tags);
    }
    setLoading(false);
  };

  useEffect(() => {
    setConfirmArchiveProgId(null);
    setConfirmUnlink(false);
    setTags(initialTags);
    setNote(athleteSummary?.private_notes || '');
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athleteId]);

  const persistTags = async (nextTags) => {
    setTags(nextTags);
    setSavingTags(true);
    await setRosterTags(athleteId, nextTags);
    setSavingTags(false);
    onTagsChanged?.();
  };

  const addTag = () => {
    const value = tagInput.trim();
    if (!value || tags.includes(value)) {
      setTagInput('');
      return;
    }
    setTagInput('');
    persistTags([...tags, value]);
  };

  const removeTag = (tag) => {
    triggerHaptic(8);
    persistTags(tags.filter((t) => t !== tag));
  };

  const injuries = context?.fitness?.injuries || [];
  const activePrograms = programs.filter((p) => p.status === 'active');
  const pastPrograms = programs.filter((p) => p.status !== 'active');
  const lastProgram = programs[0] || null;

  const displayName = context?.profile?.full_name || athleteSummary?.full_name || 'Atleta';
  const avatarUrl = context?.profile?.avatar_url || athleteSummary?.avatar_url || '';
  const initials = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  const workouts7d = athleteSummary?.workouts_7d ?? 0;
  const volume7d = Math.round(Number(athleteSummary?.volume_7d_kg || 0));
  const streak = athleteSummary?.streak ?? 0;

  const handleArchiveProgram = async (programId) => {
    if (confirmArchiveProgId !== programId) {
      triggerHaptic(8);
      setConfirmArchiveProgId(programId);
      return;
    }
    triggerHaptic(10);
    setConfirmArchiveProgId(null);
    await archiveAssignedProgram(programId);
    load();
  };

  const saveNote = async () => {
    setSavingNote(true);
    const { error } = await setRosterNote(athleteId, note);
    setSavingNote(false);
    if (!error) {
      triggerHaptic(10);
      setNoteSavedFlash(true);
      setTimeout(() => setNoteSavedFlash(false), 2000);
      onTagsChanged?.();
    }
  };

  const handleUnlinkConfirm = async () => {
    if (!confirmUnlink) {
      triggerHaptic(8);
      setConfirmUnlink(true);
      return;
    }
    triggerHaptic(12);
    await onArchiveAthlete?.(athleteId);
  };

  const content = (
    <main className={embedded ? 'max-w-3xl px-5 sm:px-7 py-5 space-y-6' : 'max-w-3xl mx-auto w-full px-4 sm:px-6 py-5 space-y-6 flex-1'}>
      {loading ? (
        <SkeletonList rows={4} label="A carregar dossiê do atleta" />
      ) : (
        <>
          {/* Cabeçalho de Identidade e Ledger 7 Dias */}
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-12 h-12 rounded-full bg-white/[0.08] ring-1 ring-white/[0.15] text-white flex items-center justify-center font-heading font-bold text-[15px] shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-heading text-[20px] font-bold tracking-tight text-white truncate">
                      {displayName}
                    </h2>
                    {isAthleteVerified(context?.profile) && <VerifiedBadge size={16} />}
                  </div>
                  <p className="text-[12px] text-zinc-400 truncate mt-0.5">
                    {[context?.fitness?.experience_level, context?.fitness?.primary_goal]
                      .filter(Boolean)
                      .join(' · ') || 'Acompanhamento ativo'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => { triggerHaptic(10); setBuildingProgram({ seedProgram: lastProgram }); }}
                className="min-h-[42px] px-3.5 rounded-xl bg-primary text-app font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                Prescrever
              </button>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/[0.08] border-y border-white/[0.08] py-3">
              <div className="pr-3">
                <span className="block text-[11px] text-zinc-400">Sessões (7d)</span>
                <span className="font-display text-[20px] font-bold tabular-nums text-white mt-0.5 block">
                  {workouts7d}
                </span>
              </div>
              <div className="px-3">
                <span className="block text-[11px] text-zinc-400">Volume (7d)</span>
                <span className="font-display text-[20px] font-bold tabular-nums text-white mt-0.5 block">
                  {volume7d.toLocaleString('pt-PT')} <span className="text-[12px] font-normal text-zinc-400">kg</span>
                </span>
              </div>
              <div className="pl-3">
                <span className="block text-[11px] text-zinc-400">Sequência</span>
                <span className="font-display text-[20px] font-bold tabular-nums text-white mt-0.5 block">
                  {streak} <span className="text-[12px] font-normal text-zinc-400">dias</span>
                </span>
              </div>
            </div>
          </section>

          {/* Restrições / Lesões em linha editorial */}
          {injuries.length > 0 && (
            <div className="border-l-2 border-rose-400 pl-3.5 py-1 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="text-[13px] text-zinc-200 leading-relaxed">
                <strong className="text-rose-400 font-semibold">Restrições articulares reportadas:</strong>{' '}
                {injuries.join(', ')}. Evita exercícios de sobrecarga direta nestas estruturas.
              </p>
            </div>
          )}

          {/* Tags do Atleta */}
          <section>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400 mb-2">
              <Tag className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Etiquetas do treinador</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="pl-2.5 pr-1.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[12px] font-medium text-white inline-flex items-center gap-1"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    aria-label={`Remover etiqueta ${tag}`}
                    className="w-4 h-4 rounded-full hover:bg-white/10 cursor-pointer flex items-center justify-center"
                  >
                    <XIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                onBlur={addTag}
                placeholder={tags.length ? 'Nova etiqueta...' : 'Ex: hipertrofia, VIP, ombro...'}
                disabled={savingTags}
                className="min-w-[140px] flex-1 px-2.5 py-1 rounded-full bg-transparent border border-dashed border-white/[0.15] text-[12px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-hover"
              />
            </div>
          </section>

          {/* Treinos Prescritos em Ledger */}
          <section className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-section font-semibold text-white">
                Treinos prescritos
              </h3>
              {pastPrograms.length > 0 && (
                <span className="text-[12px] text-zinc-500 tabular-nums">
                  {pastPrograms.length} arquivado(s)
                </span>
              )}
            </div>

            {activePrograms.length === 0 ? (
              <div className="py-6 border-y border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[14px] font-medium text-zinc-300">
                    Ainda sem treino ativo atribuído.
                  </p>
                  <p className="text-[12px] text-zinc-500 mt-0.5">
                    Cria uma prescrição do zero ou aplica um modelo guardado.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { triggerHaptic(10); setBuildingProgram({ seedProgram: lastProgram }); }}
                  className="self-start sm:self-auto min-h-[40px] px-3.5 rounded-xl bg-primary text-app font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                  Prescrever primeiro treino
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
                {activePrograms.map((p) => {
                  const isConfirming = confirmArchiveProgId === p.id;
                  return (
                    <div key={p.id} className="py-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-white truncate">{p.title}</p>
                        <p className="text-[12px] text-zinc-400 tabular-nums mt-0.5">
                          {(p.structure_json || []).length} exercícios
                          {p.target_rpe ? ` · RPE ${p.target_rpe}` : ''}
                          {p.rest_timer_seconds ? ` · Descanso ${p.rest_timer_seconds}s` : ''}
                        </p>
                        {p.coach_notes && (
                          <p className="text-[12px] text-zinc-300 mt-1 line-clamp-2">
                            Nota: {p.coach_notes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => { triggerHaptic(8); setBuildingProgram({ seedProgram: p }); }}
                          title="Duplicar e progredir carga"
                          className="min-h-[34px] px-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-200 text-[12px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span>Progredir</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveProgram(p.id)}
                          title="Arquivar prescrição"
                          className={`min-h-[34px] px-2.5 rounded-lg text-[12px] font-semibold cursor-pointer inline-flex items-center justify-center transition-colors ${
                            isConfirming
                              ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-400 hover:text-white'
                          }`}
                        >
                          {isConfirming ? 'Confirmar' : <Archive className="w-3.5 h-3.5" strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Feedback Recente */}
          <section className="space-y-2">
            <h3 className="font-heading text-section font-semibold text-white flex items-center gap-2">
              <MessageSquareText className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
              Feedback pós-treino
            </h3>
            <AthleteFeedback sessions={feedback} />
          </section>

          {/* Nota Privada do Treinador */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-section font-semibold text-white flex items-center gap-2">
                <StickyNote className="w-4 h-4 text-zinc-400" strokeWidth={1.75} />
                Nota clínica privada
              </h3>
              {noteSavedFlash && (
                <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-400">
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Guardada
                </span>
              )}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Visível apenas para ti (histórico clínico, ajustes de postura, combinados)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-body text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-accent-hover"
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={saveNote}
                disabled={savingNote}
                className="min-h-[40px] px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-[13px] font-semibold cursor-pointer disabled:opacity-60 transition-colors"
              >
                {savingNote ? 'A guardar...' : 'Guardar nota'}
              </button>

              {onArchiveAthlete && (
                <div className="flex items-center gap-2">
                  {confirmUnlink && (
                    <button
                      type="button"
                      onClick={() => setConfirmUnlink(false)}
                      className="min-h-[36px] px-2.5 text-[12px] font-medium text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleUnlinkConfirm}
                    className={`min-h-[36px] px-3 rounded-lg text-[12px] font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                      confirmUnlink
                        ? 'bg-rose-500/20 border border-rose-400/40 text-rose-300'
                        : 'text-zinc-500 hover:text-rose-400'
                    }`}
                  >
                    <UserMinus className="w-3.5 h-3.5" strokeWidth={1.75} />
                    {confirmUnlink ? 'Confirmar arquivo do vínculo' : 'Arquivar vínculo'}
                  </button>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );

  return (
    <div className={embedded ? 'h-full overflow-y-auto' : 'min-h-screen bg-app text-zinc-100 flex flex-col'}>
      {!embedded && (
        <header className="sticky top-0 z-20 w-full bg-surface/95 backdrop-blur-md border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0px),12px)]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-2.5 pb-3 flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              aria-label="Voltar à lista"
              className="w-11 h-11 rounded-xl bg-surface-2 border border-white/[0.08] text-zinc-300 hover:text-white cursor-pointer active:scale-95 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <h1 className="font-heading text-section font-semibold text-white truncate flex items-center gap-1.5">
              <span>{displayName}</span>
              {isAthleteVerified(context?.profile) && <VerifiedBadge size={16} />}
            </h1>
          </div>
        </header>
      )}

      {content}

      {buildingProgram && (
        <ProgramBuilderSheet
          trainerId={user?.id}
          athleteId={athleteId}
          athleteName={displayName}
          lastProgram={buildingProgram.seedProgram || lastProgram}
          onClose={() => setBuildingProgram(null)}
          onSaved={() => {
            setBuildingProgram(null);
            load();
          }}
        />
      )}
    </div>
  );
}
