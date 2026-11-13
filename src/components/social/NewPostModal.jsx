import React, { useEffect, useId, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Camera, Check, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { compressPostPhoto, createAthletePost, uploadPostPhoto } from '../../services/socialService';
import { triggerHaptic } from '../../utils/audio';
import { isAthleteVerified } from '../../utils/userVerification';
import VerifiedBadge from '../ui/VerifiedBadge';
import { Avatar, SPRING } from './ui';

const MAX_CAPTION_LENGTH = 300;
const QUICK_CAPTIONS = ['Treino concluído', 'Novo PR', 'Check-in do dia', 'Cardio feito'];

function revokePreviewUrl(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore revoke errors on already-released URLs
    }
  }
}

export default function NewPostModal({ isOpen, onClose, userId, profile, onPostCreated }) {
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const captionInputRef = useRef(null);
  const captionId = useId();
  const titleId = useId();
  const reducedMotion = useReducedMotion();

  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      revokePreviewUrl(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const athleteName = profile?.full_name || (profile?.username ? `@${profile.username}` : 'Atleta AB');
  const verified = isAthleteVerified(profile);

  const processFile = async (file) => {
    if (!file) return;
    if (file.type && !file.type.startsWith('image/')) {
      setError('Seleciona um ficheiro de imagem válido.');
      return;
    }

    setError('');
    triggerHaptic(10);

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setPhotoBlob(null);
    setIsCompressing(true);

    try {
      const blob = await compressPostPhoto(file, 1280);
      if (!blob) throw new Error('Falha ao otimizar');
      setPhotoBlob(blob);
    } catch {
      setPhotoPreview(null);
      setPhotoBlob(null);
      setError('Não foi possível processar esta imagem. Tenta outra foto.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handlePickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await processFile(file);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) await processFile(file);
  };

  const clearPhoto = () => {
    triggerHaptic(6);
    setPhotoPreview(null);
    setPhotoBlob(null);
    setError('');
  };

  const applyQuickCaption = (tag) => {
    triggerHaptic(6);
    setCaption((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return tag.slice(0, MAX_CAPTION_LENGTH);
      if (trimmed.toLowerCase().includes(tag.toLowerCase())) return prev;
      const next = `${trimmed} · ${tag}`;
      return next.slice(0, MAX_CAPTION_LENGTH);
    });
    captionInputRef.current?.focus();
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setPhotoBlob(null);
    setPhotoPreview(null);
    setCaption('');
    setError('');
    onClose();
  };

  const handlePost = async () => {
    if (isCompressing || isSubmitting) return;
    if (!photoBlob) {
      setError('Escolhe uma foto da galeria ou tira uma com a câmara.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    triggerHaptic(12);

    try {
      const uploadRes = await uploadPostPhoto(userId, photoBlob);
      const imageUrl = uploadRes.data;
      if (!imageUrl) throw new Error('Não foi possível carregar a imagem.');

      const { data, error: postErr } = await createAthletePost(userId, {
        imageUrl,
        caption,
        profile
      });

      if (postErr) throw new Error(postErr);

      triggerHaptic([10, 30, 10]);
      onPostCreated?.(data);
      setPhotoBlob(null);
      setPhotoPreview(null);
      setCaption('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao publicar foto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canPublish = Boolean(photoBlob) && !isCompressing && !isSubmitting;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <motion.div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reducedMotion ? { duration: 0.01 } : { duration: 0.18 }}
        onClick={handleClose}
      />

      <motion.div
        className="relative w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-app border-t sm:border border-white/[0.1] shadow-[0_-24px_80px_rgba(0,0,0,0.92)] overflow-hidden flex flex-col max-h-[94dvh] will-change-transform"
        initial={reducedMotion ? { opacity: 0 } : { y: '100%' }}
        animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
        exit={reducedMotion ? { opacity: 0 } : { y: '100%' }}
        transition={reducedMotion ? { duration: 0.01 } : SPRING}
      >
        {/* Mobile grabber */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-0.5 shrink-0">
          <span className="w-9 h-1 rounded-full bg-white/20" aria-hidden="true" />
        </div>

        {/* Slim Editorial Header */}
        <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar url={profile?.avatar_url} name={athleteName} size={36} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white truncate flex items-center gap-1.5">
                <span className="truncate">{athleteName}</span>
                {verified && <VerifiedBadge size={13} />}
              </p>
              <h2 id={titleId} className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">
                Nova publicação no Clube
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Fechar janela de publicação"
            className="min-w-[44px] min-h-[44px] -mr-2 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] cursor-pointer touch-manipulation transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Scrollable Studio Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Hidden dual inputs: gallery (no capture attribute!) and direct camera */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickPhoto}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePickPhoto}
          />

          {/* Photo Stage */}
          {photoPreview ? (
            <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] max-h-[46dvh] bg-zinc-950 overflow-hidden">
              <img
                src={photoPreview}
                alt="Pré-visualização da publicação"
                className="w-full h-full object-cover"
              />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35"
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={clearPhoto}
                disabled={isSubmitting}
                aria-label="Remover foto selecionada"
                className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer touch-manipulation disabled:opacity-40"
              >
                <span className="w-9 h-9 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-black/85 transition-colors">
                  <X className="w-4 h-4" />
                </span>
              </button>

              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2">
                <div>
                  {isCompressing && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-[12px] font-medium text-zinc-200">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>A preparar...</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="min-h-[38px] px-3.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/15 text-[12px] font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer touch-manipulation transition-colors disabled:opacity-40"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Galeria</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={isSubmitting}
                    className="min-h-[38px] px-3 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/15 text-[12px] font-medium text-zinc-200 inline-flex items-center gap-1.5 cursor-pointer touch-manipulation transition-colors disabled:opacity-40"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Câmara</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative px-6 py-10 sm:py-12 flex flex-col items-center justify-center text-center transition-colors ${
                isDragging
                  ? 'bg-white/[0.06]'
                  : 'bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_68%)]'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-zinc-200 mb-4">
                <ImageIcon className="w-5 h-5" strokeWidth={1.6} />
              </div>

              <h3 className="font-heading text-[20px] font-bold text-white tracking-tight">
                Partilha o teu momento
              </h3>
              <p className="text-[13px] text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                Treino concluído, check-in no ginásio ou a tua evolução física.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 w-full">
                <motion.button
                  type="button"
                  whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                  transition={SPRING}
                  onClick={() => galleryInputRef.current?.click()}
                  className="min-h-[48px] px-6 rounded-full bg-white text-black hover:bg-zinc-200 font-heading font-bold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer touch-manipulation transition-colors shadow-[0_8px_28px_rgba(255,255,255,0.12)]"
                >
                  <ImageIcon className="w-4 h-4" strokeWidth={2.1} />
                  <span>Escolher da Galeria</span>
                </motion.button>

                <motion.button
                  type="button"
                  whileTap={reducedMotion ? undefined : { scale: 0.96 }}
                  transition={SPRING}
                  onClick={() => cameraInputRef.current?.click()}
                  className="min-h-[48px] px-5 rounded-full bg-white/[0.06] hover:bg-white/[0.11] border border-white/[0.1] text-white font-semibold text-[14px] inline-flex items-center justify-center gap-2 cursor-pointer touch-manipulation transition-colors"
                >
                  <Camera className="w-4 h-4" strokeWidth={1.8} />
                  <span>Tirar Foto</span>
                </motion.button>
              </div>
            </div>
          )}

          {/* Borderless Editorial Caption Flow */}
          <div className="border-t border-white/[0.06]">
            <label htmlFor={captionId} className="sr-only">
              Legenda da publicação
            </label>
            <textarea
              id={captionId}
              ref={captionInputRef}
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION_LENGTH))}
              rows={3}
              placeholder="Legenda opcional — conta como foi a sessão, novo recorde ou sensação de hoje..."
              className="w-full bg-transparent px-5 pt-4 pb-2 text-[15px] leading-relaxed text-white placeholder:text-zinc-600 focus:outline-none resize-none"
            />

            <div className="px-5 pb-4 pt-1 flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {QUICK_CAPTIONS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => applyQuickCaption(tag)}
                    className="px-3 py-1.5 rounded-full border border-white/[0.08] hover:border-white/25 hover:bg-white/[0.05] text-[11px] font-medium text-zinc-400 hover:text-white whitespace-nowrap cursor-pointer touch-manipulation transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono tabular-nums text-zinc-600 shrink-0">
                {MAX_CAPTION_LENGTH - caption.length}
              </span>
            </div>
          </div>

          {error && (
            <p role="alert" className="px-5 pb-3 text-[13px] text-red-400 font-medium">
              {error}
            </p>
          )}
        </div>

        {/* Thumb-Zone Publish Bar */}
        <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/[0.06] bg-app shrink-0">
          <motion.button
            type="button"
            whileTap={canPublish && !reducedMotion ? { scale: 0.98 } : undefined}
            transition={SPRING}
            onClick={handlePost}
            disabled={!canPublish}
            className={`w-full min-h-[52px] rounded-full font-heading font-bold text-[15px] tracking-tight flex items-center justify-center gap-2 transition-all touch-manipulation ${
              canPublish
                ? 'bg-white text-black hover:bg-zinc-200 cursor-pointer shadow-[0_8px_32px_rgba(255,255,255,0.14)]'
                : 'bg-white/[0.07] text-zinc-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>A publicar no Clube...</span>
              </>
            ) : isCompressing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>A preparar foto...</span>
              </>
            ) : !photoPreview ? (
              <span>Escolhe uma foto para publicar</span>
            ) : (
              <>
                <Check className="w-4 h-4" strokeWidth={2.5} />
                <span>Publicar no Clube</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
