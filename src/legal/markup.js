/** Marcação mínima dos textos legais: **negrito** e [texto](url). Devolve tokens para React ou HTML. */
export function tokenize(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: 'text', text: text.slice(last, m.index) });
    out.push(m[1] ? { t: 'b', text: m[1] } : { t: 'a', text: m[2], href: m[3] });
    last = re.lastIndex;
  }
  if (last < text.length) out.push({ t: 'text', text: text.slice(last) });
  return out;
}
