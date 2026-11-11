import React from 'react';
import { THEMES } from './themes';
import { Camera } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

/** Secção extraída de RunningShareModal.jsx (estado e handlers recebidos por props). */
export default function ShareThemePicker({ aspectRatio, bgMode, fileInputRef, handlePhotoUpload, setAspectRatio, setBgMode, setThemeId, themeId }) {
  return (
    <>
      {/* Seletor de Aspect Ratio e Temas */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
        {/* Proporção */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => { setAspectRatio('story'); triggerHaptic(8); }}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              aspectRatio === 'story' 
                ? 'bg-white text-black shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Story 9:16
          </button>
          <button
            onClick={() => { setAspectRatio('post'); triggerHaptic(8); }}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
              aspectRatio === 'post' 
                ? 'bg-white text-black shadow' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Feed 1:1
          </button>
        </div>

        {/* Temas */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          {Object.values(THEMES).map((th) => (
            <button
              key={th.id}
              onClick={() => { setThemeId(th.id); setBgMode('map'); triggerHaptic(8); }}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                themeId === th.id && bgMode === 'map'
                  ? 'bg-zinc-800 text-white border border-zinc-700 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={th.name}
            >
              {th.badge}
            </button>
          ))}

          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handlePhotoUpload} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              bgMode === 'custom-photo'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Carregar Foto Própria"
          >
            <Camera className="w-3 h-3" />
            <span>Foto</span>
          </button>
        </div>
      </div>

    </>
  );
}
