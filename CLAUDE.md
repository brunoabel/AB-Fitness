# CLAUDE.md

## Diretrizes fixas
- NO YAPPING: Zero preâmbulos ou explicações não solicitadas. Não narre chamadas de ferramentas.
- PRECISION DIFFS: Edite apenas as linhas necessárias, nunca reescreva arquivos inteiros sem necessidade.
- STACK PADRÃO: Vite + React + Tailwind CSS (stack atual do projeto). Não migre para Next.js nem TypeScript, e não adicione Framer Motion ou GSAP sem pedido explícito.
- DESIGN SYSTEM BASE: Pure Black + White + Midnight Navy, definido em `STYLESEED.md` (fonte de verdade). Canvas `bg-app` #000000, superfície `bg-surface` #070709, marinho `bg-surface-2`/`bg-surface-3`, bordas `border-white/[0.08]`, CTA branco `bg-primary text-app`, seleção marinho `bg-accent/70 text-white border-accent-hover`, ativo/progresso/PR em branco. Zero box-shadow colorido, zero ciano, zero laranja. Use os tokens de `src/index.css`, nunca hex fixo. Drop-set é violeta, sucesso é emerald.

## Economia de tokens
- Leia os arquivos existentes antes de escrever. Não releia se não mudaram.
- Raciocínio completo, resposta concisa.
- Ignore arquivos acima de 100KB, a menos que sejam necessários.
- Sem aberturas bajuladoras nem encerramentos de enfeite.
- Sem emojis nem travessões (em-dash).
- Não chute APIs, versões, flags, SHAs de commit ou nomes de pacote. Confirme lendo o código ou a documentação antes de afirmar.
