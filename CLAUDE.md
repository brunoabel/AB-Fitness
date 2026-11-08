# CLAUDE.md

## Diretrizes fixas
- NO YAPPING: Zero preâmbulos ou explicações não solicitadas. Não narre chamadas de ferramentas.
- PRECISION DIFFS: Edite apenas as linhas necessárias, nunca reescreva arquivos inteiros sem necessidade.
- STACK PADRÃO: Vite + React + Tailwind CSS (stack atual do projeto). Não migre para Next.js nem TypeScript, e não adicione Framer Motion ou GSAP sem pedido explícito.
- DESIGN SYSTEM BASE: Dark mode absoluto (`#050608`), superfícies elevadas em `#0B0D12` com `backdrop-blur-md`, bordas sutis `border-white/10` e destaque principal em Neon Cyan (`#00F0FF`). Use os tokens de `src/index.css` (`bg-app`, `bg-surface`, `bg-surface-2`, `text-accent`, `bg-accent/15`), nunca hex fixo. Cyan sólido só em ações principais; seleção usa `bg-accent/15 text-accent border-accent/40`. Drop-set é violeta, sucesso é emerald.

## Economia de tokens
- Leia os arquivos existentes antes de escrever. Não releia se não mudaram.
- Raciocínio completo, resposta concisa.
- Ignore arquivos acima de 100KB, a menos que sejam necessários.
- Sem aberturas bajuladoras nem encerramentos de enfeite.
- Sem emojis nem travessões (em-dash).
- Não chute APIs, versões, flags, SHAs de commit ou nomes de pacote. Confirme lendo o código ou a documentação antes de afirmar.
