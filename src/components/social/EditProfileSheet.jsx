import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Check, X as XIcon, Loader2 } from 'lucide-react';
import AthleteCard from './AthleteCard';
import { Sheet, Switch, SPRING, TAP } from './ui';
import {
  ATHLETE_TAGS, BIO_MAX, COVER_STYLES, FEATURED_STATS, PRIVACY_FIELDS, USERNAME_RE,
  compressAvatar, isUsernameAvailable, updateMyProfile, uploadAvatar
} from '../../services/socialService';
import { triggerHaptic } from '../../utils/audio';

const Label = ({ children, aside, htmlFor }) => (
  <div className="flex items-baseline justify-between mb-2">
    <label htmlFor={htmlFor} className="text-[12px] font-medium uppercase tracking-[0.1em] text-zinc-500">{children}</label>
    {aside}
  </div>
);
const inputCls = 'w-full min-h-[48px] px-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-body text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-colors';

function Chip({ selected, onClick, children }) {
  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      whileTap={TAP}
      transition={SPRING}
      onClick={() => {
        triggerHaptic(8);
        onClick();
      }}
      className={`min-h-[40px] px-4 rounded-full border text-[13px] cursor-pointer touch-manipulation transition-colors duration-150 ${
        selected
          ? 'bg-white text-black border-white font-bold shadow-[0_4px_16px_rgba(255,255,255,0.12)]'
          : 'bg-white/[0.04] border-white/[0.08] text-zinc-300 font-medium hover:text-white hover:bg-white/[0.07]'
      }`}
    >
      {children}
    </motion.button>
  );
}

/** Estado do @username: idle | checking | ok | taken | invalid */
function useUsernameStatus(value, original) {
  const v = (value || '').trim().toLowerCase();
  const syncStatus = !v || v === original ? 'idle' : USERNAME_RE.test(v) ? null : 'invalid';
  const [remote, setRemote] = useState({ v: '', status: 'idle' });
  useEffect(() => {
    if (syncStatus) return undefined;
    let alive = true;
    const t = setTimeout(async () => {
      const ok = await isUsernameAvailable(v);
      if (alive) setRemote({ v, status: ok == null ? 'idle' : ok ? 'ok' : 'taken' });
    }, 400);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [v, syncStatus]);
  return syncStatus ?? (remote.v === v ? remote.status : 'checking');
}

export default function EditProfileSheet({ userId, profile, stats, onClose, onSaved }) {
  const [draft, setDraft] = useState(profile);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const status = useUsernameStatus(draft.username, profile.username);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const setPrivacy = (k, v) => setDraft((d) => ({ ...d, privacy_settings: { ...d.privacy_settings, [k]: v } }));

  useEffect(() => () => avatarPreview && URL.revokeObjectURL(avatarPreview), [avatarPreview]);

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setAvatarPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const blob = await compressAvatar(file);
      const { data, error: upErr } = await uploadAvatar(userId, blob);
      if (upErr) throw new Error(upErr);
      set('avatar_url', data);
      triggerHaptic([10, 30, 10]);
    } catch (err) {
      setAvatarPreview(null);
      setError(`A foto não foi enviada: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const blocked = uploading || saving || status === 'checking' || status === 'taken' || status === 'invalid' || !draft.username;

  const save = async () => {
    if (blocked) return;
    setSaving(true);
    setError('');
    const { data, error: saveErr } = await updateMyProfile(userId, {
      ...draft,
      full_name: (draft.full_name || '').trim(),
      bio: (draft.bio || '').trim() || null,
      home_gym: (draft.home_gym || '').trim() || null
    });
    setSaving(false);
    if (saveErr) return setError(saveErr);
    triggerHaptic([12, 40, 12]);
    onSaved(data);
  };

  const statusIcon = {
    checking: <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />,
    ok: <Check className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />,
    taken: <XIcon className="w-4 h-4 text-red-400" strokeWidth={2.5} />,
    invalid: <XIcon className="w-4 h-4 text-red-400" strokeWidth={2.5} />
  }[status];
  const statusText = { ok: 'Disponível', taken: 'Já está em uso', invalid: '3 a 20 caracteres: letras minúsculas, números, _ ou .' }[status];

  return (
    <Sheet
      onClose={onClose}
      title="Editar perfil"
      footer={
        <motion.button
          type="button"
          onClick={save}
          disabled={blocked}
          whileTap={blocked ? undefined : { scale: 0.98 }}
          className="w-full min-h-[52px] rounded-full bg-white text-black hover:bg-zinc-200 font-heading font-bold text-[15px] cursor-pointer touch-manipulation disabled:bg-white/[0.08] disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors shadow-[0_8px_28px_rgba(255,255,255,0.12)]"
        >
          {saving ? 'A guardar…' : 'Guardar perfil'}
        </motion.button>
      }
    >
      <div className="space-y-6 pt-1">
        {/* Pré-visualização ao vivo */}
        <div className="relative">
          <AthleteCard profile={draft} stats={stats} avatarPreview={avatarPreview} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Alterar foto de perfil"
            className="absolute left-[68px] top-[86px] w-9 h-9 rounded-full bg-primary text-app flex items-center justify-center border-2 border-app cursor-pointer active:scale-95 transition-transform"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" strokeWidth={2} />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
          <p className="mt-2 text-center text-[12px] text-zinc-500">Arrasta o dedo no cartão para o inclinar · toca no ↻ para ver o verso</p>
        </div>

        <div>
          <Label htmlFor="ep-username" aside={statusText && <span className={`text-[12px] ${status === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{statusText}</span>}>@username</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-body">@</span>
            <input
              id="ep-username"
              value={draft.username || ''}
              onChange={(e) => set('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={`${inputCls} pl-9 pr-11`}
              placeholder="nome.atleta"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4" aria-hidden>{statusIcon}</span>
          </div>
        </div>

        <div>
          <Label htmlFor="ep-name">Nome de exibição</Label>
          <input id="ep-name" value={draft.full_name || ''} onChange={(e) => set('full_name', e.target.value)} maxLength={40} className={inputCls} placeholder="O teu nome" />
        </div>

        <div>
          <Label htmlFor="ep-bio" aside={<span className={`text-[12px] tabular-nums ${BIO_MAX - (draft.bio || '').length <= 20 ? 'text-white' : 'text-zinc-500'}`}>{BIO_MAX - (draft.bio || '').length}</span>}>Bio</Label>
          <textarea
            id="ep-bio"
            value={draft.bio || ''}
            onChange={(e) => set('bio', e.target.value.slice(0, BIO_MAX))}
            rows={3}
            className={`${inputCls} py-3 resize-none leading-relaxed`}
            placeholder="O que te move no treino?"
          />
        </div>

        <div>
          <Label htmlFor="ep-gym">Ginásio</Label>
          <input id="ep-gym" value={draft.home_gym || ''} onChange={(e) => set('home_gym', e.target.value)} maxLength={40} className={inputCls} placeholder="Onde treinas" />
        </div>

        <div>
          <Label>Foco do atleta</Label>
          <div className="flex flex-wrap gap-2">
            {ATHLETE_TAGS.map((t) => (
              <Chip key={t} selected={draft.athlete_tag === t} onClick={() => set('athlete_tag', draft.athlete_tag === t ? null : t)}>{t}</Chip>
            ))}
          </div>
        </div>

        <div>
          <Label>Métrica em destaque no card</Label>
          <div className="grid grid-cols-3 gap-2">
            {FEATURED_STATS.map((f) => (
              <Chip key={f.id} selected={draft.featured_stat === f.id} onClick={() => set('featured_stat', f.id)}>{f.label}</Chip>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Estilo de Capa</Label>
            <span className="text-[12px] text-zinc-400 font-medium">{COVER_STYLES.length} Temas do Atleta</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {COVER_STYLES.map((c) => {
              const isSelected = draft.cover_style === c.id;
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  aria-pressed={isSelected}
                  whileTap={TAP}
                  onClick={() => {
                    triggerHaptic(8);
                    set('cover_style', c.id);
                  }}
                  className={`relative h-14 rounded-xl border p-2.5 flex flex-col justify-between overflow-hidden cursor-pointer transition-all ${c.className} ${isSelected ? 'ring-2 ring-white border-white scale-[1.02] shadow-lg' : 'border-white/[0.1] hover:border-white/20'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[12px] font-bold text-white tracking-tight drop-shadow-sm">{c.label}</span>
                    {c.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-white/25 text-white backdrop-blur-sm border border-white/20">
                        {c.badge}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <Label>Privacidade</Label>
          <ul className="border-y border-white/[0.06] divide-y divide-white/[0.06]">
            {PRIVACY_FIELDS.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <span className="block text-body text-white">{p.label}</span>
                  <span className="block text-[13px] text-zinc-400 leading-snug">{p.hint}</span>
                </div>
                <Switch label={p.label} checked={Boolean(draft.privacy_settings?.[p.id])} onChange={(v) => setPrivacy(p.id, v)} />
              </li>
            ))}
          </ul>
        </div>

        {error && <p role="alert" className="text-[14px] text-red-400">{error}</p>}
      </div>
    </Sheet>
  );
}
