import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Image as ImageIcon, Sparkles, Loader2, Check } from 'lucide-react';
import { compressPostPhoto, uploadPostPhoto, createAthletePost } from '../../services/socialService';
import { triggerHaptic } from '../../utils/audio';

const QUICK_EMOJIS = ['🔥', '💪', '⚡', '🏆', '🎯', '🦍', '🥇'];

export default function NewPostModal({ isOpen, onClose, userId, profile, onPostCreated }) {
  const fileInputRef = useRef(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePickPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      triggerHaptic(10);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      const blob = await compressPostPhoto(file, 1280);
      setPhotoBlob(blob);
    } catch (err) {
      setError('Erro ao processar imagem. Escolhe outra foto.');
    }
  };

  const handlePost = async () => {
    if (!photoBlob && !photoPreview) {
      setError('Escolhe uma foto para publicar.');
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
      handleClose();
    } catch (err) {
      setError(err.message || 'Erro ao publicar foto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPhotoBlob(null);
    setPhotoPreview(null);
    setCaption('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />

      <motion.div
        className="relative w-full max-w-lg rounded-t-[28px] sm:rounded-3xl bg-surface border border-white/[0.1] shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 35 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </span>
            <h2 className="font-heading text-section font-bold text-white tracking-tight">Nova Publicação</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {photoPreview ? (
            <div className="relative rounded-2xl overflow-hidden bg-black/50 border border-white/[0.08] max-h-80 flex items-center justify-center group">
              <img src={photoPreview} alt="Pré-visualização" className="w-full h-full max-h-80 object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null);
                  setPhotoBlob(null);
                }}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 text-white backdrop-blur-md cursor-pointer hover:bg-black/90 transition-colors"
                title="Trocar foto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-60 rounded-2xl border-2 border-dashed border-white/[0.12] hover:border-white/25 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer bg-surface-2/40 group p-4"
            >
              <span className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:scale-105 transition-all">
                <ImageIcon className="w-7 h-7" strokeWidth={1.5} />
              </span>
              <div className="text-center">
                <p className="text-body font-semibold text-white">Escolhe ou tira uma foto</p>
                <p className="text-[12px] text-zinc-400 mt-0.5">Progresso físico, treino do dia ou momentos de superação</p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handlePickPhoto}
          />

          {/* Caption */}
          <div>
            <label className="block text-[13px] font-semibold text-zinc-300 mb-1.5">
              Legenda do Treino / Evolução
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, 300))}
              rows={3}
              placeholder="Conta aos teus amigos como foi este treino, novos recordes ou sensações..."
              className="w-full px-4 py-3 rounded-2xl bg-surface-2 border border-white/[0.08] text-body text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-hover resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1.5">
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setCaption((prev) => (prev ? `${prev} ${em}` : em))}
                    className="w-7 h-7 rounded-lg bg-surface-2 text-body flex items-center justify-center hover:bg-surface-3 transition-colors cursor-pointer"
                  >
                    {em}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">{300 - caption.length}</span>
            </div>
          </div>

          {error && <p className="text-[13px] text-red-400 font-medium">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-surface-2/50 flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 min-h-[48px] rounded-2xl bg-surface-2 border border-white/[0.08] text-zinc-300 font-bold text-[14px] cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handlePost}
            disabled={!photoPreview || isSubmitting}
            className="flex-1 min-h-[48px] rounded-2xl bg-primary text-app font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-opacity"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>A publicar...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Publicar Foto</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

