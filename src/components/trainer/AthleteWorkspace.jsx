import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, Plus, Archive, StickyNote, Tag, X as XIcon, MessageSquareText } from 'lucide-react';
import { SkeletonList } from '../ui/Skeleton';
import { useAuth } from '../../context';
import {
  getAthleteContext, listAssignedProgramsForAthlete, archiveAssignedProgram, setRosterNote,
  setRosterTags, listAthleteFeedback
} from '../../services/trainerService';
import { triggerHaptic } from '../../utils/audio';
import VerifiedBadge from '../ui/VerifiedBadge';
import { isAthleteVerified } from '../../utils/userVerification';
import ProgramBuilderSheet from './ProgramBuilderSheet';
import AthleteFeedback from './AthleteFeedback';

/**
 * Ficha do atleta: contexto de lesão/recuperação + prescrições ativas.
 * `embedded`: usado como painel direito do master-detail (sem cabeçalho/voltar próprios —
 * a seleção já acontece no RosterPanel ao lado). Sem `embedded`: tela cheia (mobile).
 */
export default function AthleteWorkspace({ athleteId, onBack, embedded = false, tags: initialTags = [], onTagsChanged }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [context, setContext] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [building, setBuilding] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [tags, setTags] = useState(initialTags);
  const [tagInput, setTagInput] = useState('');
  const [savingTags, setSavingTags] = useState(false);

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
    setLoading(false);
  };

  useEffect(() => {
    load();
    setNote('');
    setTags(initialTags);
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
  const lastProgram = programs[0] || null; // já vem ordenado por assigned_at desc

  const handleArchive = async (programId) => {
    triggerHaptic(10);
    await archiveAssignedProgram(programId);
    load();
  };

  const saveNote = async () => {
    setSavingNote(true);
    await setRosterNote(athleteId, note);
    setSavingNote(false);
    triggerHaptic(10);
  };

  const content = (
    <main className={embedded ? 'max-w-2xl px-5 py-5 space-y-5' : 'max-w-5xl mx-auto w-full px-4 sm:px-6 py-5 space-y-5 flex-1'}>
      {loading ? (
        <SkeletonList rows={4} label="A carregar ficha do atleta" />
      ) : (
        <>
          <div>
            <h2 className="font-heading text-section font-semibold text-white mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" strokeWidth={1.75} />
              Tags
            </h2>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span key={tag} className="pl-2.5 pr-1.5 py-1 rounded-lg bg-surface-2 border border-white/[0.08] text-[12px] font-semibold text-white inline-flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="w-4 h-4 rounded-full hover:bg-white/10 cursor-pointer flex items-center justify-center">
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
                placeholder={tags.length ? 'Adicionar...' : 'Ex: iniciante, VIP...'}
                disabled={savingTags}
                className="min-w-[100px] flex-1 px-2 py-1 rounded-lg bg-transparent border border-dashed border-white/[0.15] text-[12px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-hover"
              />
            </div>
          </div>

          {injuries.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-400/10 border border-rose-400/40 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" strokeWidth={1.75} />
              <p className="text-[13px] text-zinc-200 leading-relaxed">
                <strong className="text-rose-400 font-semibold">Lesões/restrições reportadas:</strong> {injuries.join(', ')}. Evita exercícios que sobrecarreguem estas zonas.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-heading text-section font-semibold text-white">Treinos prescritos</h2>
            <button
              onClick={() => { triggerHaptic(10); setBuilding(true); }}
              className="min-h-[40px] px-3.5 rounded-xl bg-primary text-app font-bold text-[13px] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Atribuir treino
            </button>
          </div>

          <div className="space-y-2">
            {activePrograms.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-white/[0.1] text-center text-[13px] text-zinc-400">
                Ainda sem treino ativo atribuído.
              </div>
            ) : (
              activePrograms.map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-surface-2 border border-white/[0.08] flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-white truncate">{p.title}</p>
                    <p className="text-[12px] text-zinc-400">
                      {(p.structure_json || []).length} exercícios{p.target_rpe ? ` • RPE ${p.target_rpe}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => handleArchive(p.id)}
                    className="w-9 h-9 rounded-xl bg-surface-3 border border-white/[0.08] text-zinc-400 hover:text-white cursor-pointer flex items-center justify-center shrink-0"
                    title="Arquivar"
                  >
                    <Archive className="w-4 h-4" strokeWidth={1.75} />
                  </button>
                </div>
              ))
            )}
            {pastPrograms.length > 0 && (
              <p className="text-[12px] text-zinc-500 pt-1">{pastPrograms.length} treino(s) anteriores arquivados.</p>
            )}
          </div>

          <div>
            <h2 className="font-heading text-section font-semibold text-white mb-2 flex items-center gap-2">
              <MessageSquareText className="w-4 h-4" strokeWidth={1.75} />
              Feedback recente
            </h2>
            <AthleteFeedback sessions={feedback} />
          </div>

          <div>
            <h2 className="font-heading text-section font-semibold text-white mb-2 flex items-center gap-2">
              <StickyNote className="w-4 h-4" strokeWidth={1.75} />
              Nota privada
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="Só tu vês isto (ex: histórico, preferências, combinados)"
              className="w-full px-4 py-3 rounded-2xl bg-surface-2 border border-white/[0.08] text-body text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-accent-hover"
            />
            <button
              onClick={saveNote}
              disabled={savingNote}
              className="mt-2 min-h-[40px] px-3.5 rounded-xl bg-surface-2 border border-white/[0.08] text-white text-[13px] font-semibold cursor-pointer disabled:opacity-60"
            >
              {savingNote ? 'A guardar...' : 'Guardar nota'}
            </button>
          </div>
        </>
      )}
    </main>
  );

  return (
    <div className={embedded ? 'h-full overflow-y-auto' : 'min-h-screen bg-app text-zinc-100 flex flex-col'}>
      {!embedded && (
        <header className="sticky top-0 z-20 w-full bg-surface/95 backdrop-blur-md border-b border-white/[0.08] pt-[max(env(safe-area-inset-top,0px),12px)]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-2.5 pb-3 flex items-center gap-3">
            <button onClick={onBack} className="w-11 h-11 rounded-xl bg-surface-2 border border-white/[0.08] text-zinc-300 hover:text-white cursor-pointer active:scale-95 flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            </button>
            <h1 className="font-heading text-section font-semibold text-white truncate flex items-center gap-1.5">
              <span>{context?.profile?.full_name || 'Atleta'}</span>
              {isAthleteVerified(context?.profile) && <VerifiedBadge size={16} />}
            </h1>
          </div>
        </header>
      )}

      {content}

      {building && (
        <ProgramBuilderSheet
          trainerId={user?.id}
          athleteId={athleteId}
          lastProgram={lastProgram}
          onClose={() => setBuilding(false)}
          onSaved={() => {
            setBuilding(false);
            load();
          }}
        />
      )}
    </div>
  );
}
