import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, CalendarClock } from 'lucide-react';
import ABLogo from '../ABLogo';
import { LEGAL_PAGES, SITE_URL, formatDatePt } from '../../legal/config';
import { tokenize } from '../../legal/markup';

const linkCls = 'text-white underline underline-offset-[3px] decoration-white/40 hover:decoration-white rounded-sm focus-visible:outline-2 focus-visible:outline-white';

function Inline({ text }) {
  return tokenize(text).map((tk, i) => {
    if (tk.t === 'b') return <strong key={i} className="font-semibold text-zinc-100">{tk.text}</strong>;
    if (tk.t === 'a') {
      const external = /^https?:/.test(tk.href);
      return <a key={i} href={tk.href} className={linkCls} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{tk.text}</a>;
    }
    return <React.Fragment key={i}>{tk.text}</React.Fragment>;
  });
}

function Table({ head, rows }) {
  return (
    <>
      <div className="hidden sm:block my-5 overflow-x-auto rounded-2xl border border-white/[0.1]">
        <table className="w-full text-left text-[14px] leading-relaxed">
          <thead className="bg-surface-2 text-zinc-100">
            <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold align-bottom">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-white/[0.08]">
            {rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={`px-4 py-3 align-top ${j === 0 ? 'font-medium text-zinc-100' : 'text-zinc-300'}`}><Inline text={c} /></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="sm:hidden my-5 space-y-3">
        {rows.map((r, i) => (
          <li key={i} className="rounded-2xl bg-surface-2 border border-white/[0.1] p-4 text-[15px] leading-relaxed">
            <p className="font-semibold text-zinc-100"><Inline text={r[0]} /></p>
            <dl className="mt-2 space-y-2">
              {r.slice(1).map((c, j) => (
                <div key={j}>
                  <dt className="text-[12px] text-zinc-400">{head[j + 1]}</dt>
                  <dd className="text-zinc-300"><Inline text={c} /></dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}

function Block({ block }) {
  if (typeof block === 'string') return <p className="mt-4 text-zinc-300"><Inline text={block} /></p>;
  if (block.ul) {
    return (
      <ul className="mt-4 space-y-2.5 text-zinc-300">
        {block.ul.map((li, i) => (
          <li key={i} className="relative pl-5 before:absolute before:left-0 before:top-[0.72em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-accent-hover">
            <Inline text={li} />
          </li>
        ))}
      </ul>
    );
  }
  if (block.table) return <Table {...block.table} />;
  if (block.note) {
    return (
      <p role="note" className="mt-5 rounded-2xl bg-accent/70 border border-accent-hover px-4 py-3.5 text-zinc-100">
        <Inline text={block.note} />
      </p>
    );
  }
  return null;
}

/** Secção atualmente visível, para destacar no índice. */
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -65% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids]);
  return active;
}

function useDocumentMeta(doc, path) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${doc.title} · AB Fitness`;
    const set = (sel, attr, val) => {
      const el = document.head.querySelector(sel);
      const old = el?.getAttribute(attr);
      el?.setAttribute(attr, val);
      return () => old != null && el?.setAttribute(attr, old);
    };
    const undo = [
      set('meta[name="description"]', 'content', doc.description),
      set('link[rel="canonical"]', 'href', `${SITE_URL}${path}`)
    ];
    return () => {
      document.title = prevTitle;
      undo.forEach((u) => u());
    };
  }, [doc, path]);
}

/** Layout das páginas legais: leitura a 65ch, índice lateral fixo com destaque da secção atual, data e impressão. */
export default function LegalPageLayout({ doc, path }) {
  const ids = doc.sections.map((s) => s.id);
  const active = useActiveSection(ids);
  useDocumentMeta(doc, path);

  const go = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${id}`);
  };

  return (
    <div className="legal-page dark min-h-screen bg-app text-zinc-300 font-sans antialiased">
      <a href="#conteudo" className="legal-noprint sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-white focus:text-black">Saltar para o conteúdo</a>

      <header className="legal-noprint sticky top-0 z-30 bg-app/85 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto h-14 px-4 sm:px-6 flex items-center justify-between gap-3">
          <a href="/" className="inline-flex items-center gap-2 min-h-[44px] pr-2 text-zinc-100 hover:text-white rounded-lg" aria-label="Voltar ao AB Fitness">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            <ABLogo size={24} showText={false} />
            <span className="font-heading text-[14px] font-semibold whitespace-nowrap">AB Fitness</span>
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl bg-surface-2 border border-white/[0.12] text-[14px] font-semibold text-zinc-100 hover:bg-surface-3 cursor-pointer"
          >
            <Printer className="w-4 h-4" strokeWidth={1.75} />
            <span className="sm:hidden">PDF</span>
            <span className="hidden sm:inline">Descarregar em PDF / Imprimir</span>
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24 lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
        <aside className="legal-noprint hidden lg:block">
          <nav aria-label="Índice do documento" className="sticky top-24">
            <p className="mb-3 text-[13px] font-semibold text-zinc-100">Neste documento</p>
            <ol className="space-y-0.5 border-l border-white/[0.1]">
              {doc.sections.map((s) => {
                const on = active === s.id;
                return (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      onClick={(e) => go(e, s.id)}
                      aria-current={on ? 'location' : undefined}
                      className={`block -ml-px py-1.5 pl-4 border-l-2 text-[14px] leading-snug transition-colors ${on ? 'border-white text-white font-semibold' : 'border-transparent text-zinc-400 hover:text-zinc-100'}`}
                    >
                      {s.title.replace(/^\d+\.\s*/, '')}
                    </a>
                  </li>
                );
              })}
            </ol>
            <div className="mt-8 pt-6 border-t border-white/[0.08]">
              <p className="mb-2 text-[13px] font-semibold text-zinc-100">Outros documentos</p>
              <ul className="space-y-1">
                {LEGAL_PAGES.filter((p) => p.path !== path).map((p) => (
                  <li key={p.path}><a href={p.path} className="text-[14px] text-zinc-400 hover:text-white underline underline-offset-[3px] decoration-white/20">{p.label}</a></li>
                ))}
              </ul>
            </div>
          </nav>
        </aside>

        <main id="conteudo" className="legal-doc min-w-0">
          <article className="max-w-[65ch] lg:max-w-[72ch]">
            <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/70 border border-accent-hover text-[13px] font-medium text-zinc-100">
              <CalendarClock className="w-3.5 h-3.5" strokeWidth={1.75} aria-hidden />
              Última atualização: <time dateTime={doc.updated}>{formatDatePt(doc.updated)}</time>
            </p>
            <h1 className="mt-5 font-heading text-[2rem] sm:text-[2.5rem] font-bold tracking-tight leading-[1.1] text-zinc-100 text-balance">{doc.title}</h1>
            <p className="mt-5 text-[1.0625rem] leading-[1.7] text-zinc-300">{doc.intro}</p>

            {/* Índice em ecrãs pequenos */}
            <details className="legal-noprint lg:hidden mt-6 rounded-2xl bg-surface-2 border border-white/[0.1]">
              <summary className="min-h-[48px] px-4 flex items-center text-[15px] font-semibold text-zinc-100 cursor-pointer">Neste documento</summary>
              <ol className="px-4 pb-3 space-y-0.5">
                {doc.sections.map((s) => (
                  <li key={s.id}><a href={`#${s.id}`} onClick={(e) => go(e, s.id)} className="block py-2 text-[15px] text-zinc-300 hover:text-white">{s.title}</a></li>
                ))}
              </ol>
            </details>

            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-12 scroll-mt-24">
                <h2 id={`${s.id}-h`} className="font-heading text-[1.375rem] font-semibold tracking-tight text-zinc-100">{s.title}</h2>
                <div className="text-[1rem] leading-[1.75]">
                  {s.blocks.map((b, i) => <Block key={i} block={b} />)}
                </div>
              </section>
            ))}

            <footer className="legal-noprint mt-16 pt-6 border-t border-white/[0.1] text-[14px] text-zinc-400">
              <p>ABEX Studio, Porto, Portugal.</p>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {LEGAL_PAGES.map((p) => (
                  <a key={p.path} href={p.path} aria-current={p.path === path ? 'page' : undefined} className={`underline underline-offset-[3px] decoration-white/20 hover:text-white ${p.path === path ? 'text-zinc-100' : ''}`}>{p.label}</a>
                ))}
                <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="underline underline-offset-[3px] decoration-white/20 hover:text-white">Livro de Reclamações</a>
                <a href="https://www.cicap.pt" target="_blank" rel="noopener noreferrer" className="underline underline-offset-[3px] decoration-white/20 hover:text-white">Litígios (CICAP)</a>
              </p>
            </footer>
          </article>
        </main>
      </div>
    </div>
  );
}
