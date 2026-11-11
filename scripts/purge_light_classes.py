#!/usr/bin/env python3
"""
Remove as cores do modo claro (o app é só escuro): em cada trecho de string,
"bg-white dark:bg-surface" vira "bg-surface". Conservador:
  - só cores (bg/text/border/divide/ring/fill/stroke/placeholder/from/via/to/accent);
  - só quando o par claro + dark: está no MESMO trecho entre aspas e com as mesmas variantes (hover:, focus:...);
  - uma classe dark: sem par fica intacta (continua a funcionar com <html class="dark">).
Uso: python3 scripts/purge_light_classes.py src
"""
import re
import sys
import pathlib

COLOR_FAMILIES = {'bg', 'text', 'border', 'divide', 'ring', 'fill', 'stroke', 'placeholder', 'from', 'via', 'to', 'accent', 'outline', 'shadow'}
COLOR_VALUE = re.compile(
    r'^(white|black|transparent|current|inherit|app|surface(-\d)?|accent(-[a-z]+)?|[a-z]+-\d{2,3}|\[#?[0-9a-fA-F]{3,8}\]|\[rgba?\([^\]]*\)\])(/[\w.\[\]%]+)?$'
)
BORDER_SIDES = {'t', 'b', 'l', 'r', 'x', 'y', 's', 'e'}


def family(token):
    """('hover:', 'bg') para 'hover:bg-zinc-100'; None se não for uma cor."""
    parts = token.split(':')
    base, variants = parts[-1], ':'.join(parts[:-1])
    m = re.match(r'^([a-z]+)-(.+)$', base)
    if not m:
        return None
    fam, value = m.group(1), m.group(2)
    if fam == 'border':
        side = value.split('-', 1)
        if side[0] in BORDER_SIDES and len(side) == 2:
            fam, value = f'border-{side[0]}', side[1]
    if fam.split('-')[0] not in COLOR_FAMILIES or not COLOR_VALUE.match(value):
        return None
    return (variants, fam)


def transform_segment(seg):
    tokens = seg.split(' ')
    dark = {}
    for i, t in enumerate(tokens):
        if t.startswith('dark:'):
            f = family(t[5:])
            if f:
                dark.setdefault(f, []).append(i)
    if not dark:
        return seg, 0
    light = {}
    for i, t in enumerate(tokens):
        if t and not t.startswith('dark:'):
            f = family(t)
            if f in dark:
                light.setdefault(f, []).append(i)
    remove, unprefix = set(), set()
    for f, idxs in dark.items():
        if f in light:
            remove.update(light[f])
            unprefix.update(idxs)
    out = []
    for i, t in enumerate(tokens):
        if i in remove:
            continue
        out.append(t[5:] if i in unprefix else t)
    return ' '.join(out), len(remove)


def process(text):
    total = 0
    parts = re.split(r'(["\'`])', text)
    for i in range(0, len(parts), 2):
        if 'dark:' in parts[i]:
            lines = parts[i].split('\n')
            new_lines = []
            for line in lines:
                nl, n = transform_segment(line)
                total += n
                new_lines.append(nl)
            parts[i] = '\n'.join(new_lines)
    return ''.join(parts), total


def main(root):
    grand = 0
    for path in sorted(pathlib.Path(root).rglob('*.jsx')):
        src = path.read_text(encoding='utf-8')
        new, n = process(src)
        if n:
            path.write_text(new, encoding='utf-8')
            grand += n
            print(f'{n:4d}  {path}')
    print(f'Total de cores claras removidas: {grand}')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'src')
