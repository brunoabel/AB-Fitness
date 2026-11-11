#!/usr/bin/env python3
"""
Extrai um bloco JSX do return de um componente grande para um componente próprio.
Deteta as variáveis do escopo do componente (declaradas com 2 espaços de indentação) usadas no bloco
e passa-as como props; copia os imports necessários. Validar sempre com build + lint (no-undef).

  python3 scripts/extract_jsx_section.py <ficheiro> "<marcador início>" "<marcador fim>" <NomeComponente> <saida.jsx>
O bloco vai da linha do marcador de início até à linha anterior ao marcador de fim.
"""
import re
import sys
import os

src_path, start_marker, end_marker, comp, out_path = sys.argv[1:6]
lines = open(src_path, encoding='utf-8').read().split('\n')
start = next(i for i, l in enumerate(lines) if start_marker in l)
end = next(i for i in range(start + 1, len(lines)) if end_marker in lines[i])
block = lines[start:end]
text = '\n'.join(lines)

# Nomes declarados no escopo do componente (indentação de 2 espaços)
declared = set()
for l in lines:
    m = re.match(r'^  (?:const|let|function)\s+(\[?[^=(]+\]?)', l)
    if not m:
        continue
    decl = m.group(1)
    declared.update(re.findall(r'[A-Za-z_$][\w$]*', decl))
declared -= {'const', 'let', 'function'}

# Imports do ficheiro: nome -> linha de import
imports = {}
for m in re.finditer(r"^import\s+(.+?)\s+from\s+'([^']+)';", text, re.M):
    spec, mod = m.group(1), m.group(2)
    default = re.match(r'^([A-Za-z_$][\w$]*)', spec)
    if default and not spec.startswith('{'):
        imports[default.group(1)] = ('default', mod)
    named = re.search(r'\{([^}]*)\}', spec, re.S)
    if named:
        for n in named.group(1).split(','):
            n = n.strip().split(' as ')[-1].strip()
            if n:
                imports[n] = ('named', mod)

body = '\n'.join(block)
scan = re.sub(r'"[^"\n]*"|\'[^\'\n]*\'', ' ', body)  # ignora conteúdo de strings
used = set(re.findall(r'(?<![\w$.])([A-Za-z_$][\w$]*)', scan))
props = sorted(used & declared)
needed_imports = sorted(n for n in used & set(imports) if n not in declared)

# Ajusta caminhos relativos dos imports para a pasta do novo ficheiro
src_dir = os.path.dirname(os.path.abspath(src_path))
out_dir = os.path.dirname(os.path.abspath(out_path))
def fix(mod):
    if not mod.startswith('.'):
        return mod
    rel = os.path.relpath(os.path.join(src_dir, mod), out_dir)
    return rel if rel.startswith('.') else './' + rel

by_mod = {}
for n in needed_imports:
    kind, mod = imports[n]
    by_mod.setdefault(fix(mod), {'default': None, 'named': []})
    if kind == 'default':
        by_mod[fix(mod)]['default'] = n
    else:
        by_mod[fix(mod)]['named'].append(n)
imp_lines = ["import React from 'react';"]
for mod, d in by_mod.items():
    if mod == 'react':
        continue
    parts = []
    if d['default']:
        parts.append(d['default'])
    if d['named']:
        parts.append('{ ' + ', '.join(sorted(d['named'])) + ' }')
    imp_lines.append(f"import {', '.join(parts)} from '{mod}';")

indent = min(len(l) - len(l.lstrip()) for l in block if l.strip())
inner = '\n'.join(('      ' + l[indent:]) if l.strip() else '' for l in block)
props_sig = ', '.join(props)
component = '\n'.join(imp_lines) + f"""

/** Secção extraída de {os.path.basename(src_path)} (estado e handlers recebidos por props). */
export default function {comp}({{ {props_sig} }}) {{
  return (
    <>
{inner}
    </>
  );
}}
"""
open(out_path, 'w', encoding='utf-8').write(component)

pad = ' ' * indent
call = f"{pad}<{comp} {{...{{ {props_sig} }}}} />"
new_lines = lines[:start] + [call] + lines[end:]
open(src_path, 'w', encoding='utf-8').write('\n'.join(new_lines))
print(f'{comp}: {end - start} linhas, {len(props)} props, imports: {", ".join(needed_imports)}')
