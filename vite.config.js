import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

/**
 * Como src/main.jsx importa App.jsx dinamicamente para manter /termos, /privacidade e
 * /aviso-medico ultraleves, injetamos <link rel="modulepreload"> dos chunks principais da app
 * em dist/index.html para eliminar o waterfall de rede na abertura do BootSequence.
 * scripts/prerender_legal.mjs remove esses preloads nas páginas legais estáticas.
 */
function preloadMainAppChunks() {
  return {
    name: 'preload-main-app-chunks',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle) return html;
        const targets = Object.values(ctx.bundle)
          .filter(
            (chunk) =>
              chunk.type === 'chunk' &&
              /^assets\/(App|react|supabase)-.*\.js$/.test(chunk.fileName)
          )
          .map(
            (chunk) =>
              `    <link rel="modulepreload" crossorigin href="/${chunk.fileName}" data-app-preload>`
          );
        if (!targets.length) return html;
        return html.replace('  </head>', `${targets.join('\n')}\n  </head>`);
      }
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadMainAppChunks()],
})
