# Auditoria científica do motor de treinos

Data: 2026-11-27. Estado do código: `main` com alterações locais por commitar (catálogo de 508 exercícios).
Âmbito: geração do plano, prescrição (séries, reps, RIR, descanso), progressão e AB Coach.
Nada foi alterado no código; os números da secção 1.2 foram medidos a correr `buildPlanFromProfile` em Node.

Convenção das referências: citações sem marca são consensos que considero sólidos. `[VERIFICAR NO PUBMED]` marca um
detalhe (ano, revista, número exato ou estado de publicação) que não tenho 100% de certeza. Os valores numéricos
propostos para o motor são **parâmetros de partida calibráveis**, não verdades da literatura.

---

## 0. Resumo

1. **O plano não depende do utilizador.** Iniciante e avançado recebem exatamente o mesmo treino; hipertrofia e força
   recebem as mesmas 8-12 reps. O gerador escolhe um de 4 modelos fixos pelo número de dias e o resto é cosmético.
2. **O volume semanal não é calculado, é consequência dos modelos.** No plano de 6 dias o ombro chega a 43,5 séries
   fracionadas por semana e o quadríceps é treinado 1x/semana; no de 4 dias o quadríceps leva 15 séries numa só sessão.
3. **A progressão existe, mas corre "às cegas".** A dupla progressão está implementada, mas o RIR quase nunca é registado
   (assume-se 2), a faixa de reps é sempre 8-12 e o incremento é +2,5 kg para tudo, do agachamento à elevação lateral.
4. **O mesociclo não avança sozinho.** A semana é escolhida à mão e guardada só no `localStorage`; o deload é só planeado.
5. **O AB Coach tem liberdade total dentro do catálogo.** As regras estão só no prompt; a validação pós-geração apenas
   limita séries (1-6) e descanso (20-240 s) e corrige ids.

---

## 1. Diagnóstico atual

### 1.1 Mapa do sistema

| Peça | Onde | O que faz hoje |
|---|---|---|
| Gerador base | `src/data/workoutGenerator.js:392` `generatePersonalizedWorkoutPlan` | 4 modelos fixos (3, 4, 5, 6 dias) com listas de exercícios escritas à mão (`getEx('slug')`). |
| Adaptação ao perfil | `src/data/planFromProfile.js:206` `buildPlanFromProfile` | Remapeia dias, troca exercícios por local/lesão (por palavras no nome), +1 série nos prioritários, regras de desporto. |
| Mesociclo | `src/data/planFromProfile.js:355` + `src/utils/mesocycleWeek.js` | 4-6 semanas: RIR 3→1, +2,5% carga/semana, última semana deload (-40% séries, -10% carga). |
| Progressão por exercício | `src/utils/strengthMetrics.js:116` `calculateNextSessionPrescription` | Dupla progressão por RIR + trava por prontidão (wearables < 55). |
| Fadiga muscular | `src/utils/muscleFatigue.js`, `src/data/muscleRegions.js` | Fadiga por região (13 regiões), primário 1,0 e secundário 0,5, com corridas das últimas 72 h. |
| Perfil | `src/components/onboarding/profileSchema.js`, tabela `user_fitness_profiles` | Objetivo, nível, local, 3-6 dias, 45/60/75 min, split, 5 lesões, 2 músculos prioritários, desportos. |
| Histórico | tabelas `workout_sessions`, `exercise_logs` | Carga, reps, tipo de série, `rpe` (coluna existe), RPE e dor por sessão (só programas de treinador). |
| AB Coach | `supabase/functions/ab-coach/` + `_shared/trainingGuidelines.ts` | LLM escolhe exercícios do catálogo; diretrizes só no prompt; sanitização de ids e limites largos. |
| Catálogo | `src/data/exerciseCatalog.js` (gerado) + `src/data/openExercisesBatch.js` | 508 exercícios em JS no cliente (não há tabela de exercícios na base de dados). |

### 1.2 O que o gerador produz (medido)

Perfil fixo: ginásio, 60 min, hipertrofia, sem lesões. Formato: séries diretas / séries fracionadas (secundário = 0,5) ·
frequência semanal · máximo de séries diretas numa sessão.

| Plano | Quadríceps | Posteriores | Glúteos | Peito | Costas | Ombros* | Tríceps | Total/semana |
|---|---|---|---|---|---|---|---|---|
| 3 dias, Full Body | 11/11 · 2x · 8 | 4/9,5 · 1x | 4/7,5 · 1x | 12/12 · 3x | 12/18 · 3x | 12/25,5 · 3x | 8/14 | 73 |
| 4 dias, Upper/Lower | **15/15 · 1x · 15** | **11/18,5 · 1x · 11** | 4/7,5 · 1x | 11/11 · 2x | 11/16,5 · 2x | 8/19 · 2x | 8/14 | 90 |
| 5 dias, PPL+UL | 15/15 · 2x · 11 | 7/14,5 · 2x | 8/11,5 · 1x | 15/15 · 2x · 12 | 15/20,5 · 2x · 12 | 16/31 · 3x | 8/14 | 105 |
| 6 dias, PPL x2 | **15/15 · 1x · 15** | 7/14,5 · 1x | 8/11,5 · 1x | 20/22 · 2x · 12 | 23/28,5 · 2x · 12 | **24/43,5 · 4x** | 12/26 | 137 |

\* "Ombros" junta as três cabeças do deltoide; o catálogo não distingue anterior, lateral e posterior.

**Os resultados para iniciante e avançado são idênticos em todas as linhas.** Adutores: 0 séries diretas em todos os planos.

### 1.3 Falhas por pilar

| # | Pilar | Estado | Evidência no código |
|---|---|---|---|
| 1 | Volume por nível (MEV/MAV/MRV) | **Ausente** | `getEx` usa `found100.series` antes de `goalParams.sets` (`workoutGenerator.js:487`), por isso `experience` e `duration` não mudam nada. Não existe orçamento de volume. Teto por sessão inexistente (15 séries de quadríceps numa sessão). |
| 2 | Volume fracionado | **Parcial** | Existe para fadiga (`regionsForExercise`, 1,0/0,5), não para prescrição. Granularidade grosseira: deltoide inteiro numa região, glúteo médio misturado com máximo. |
| 3 | Frequência e split | **Parcial** | Split fixo por dias (`SPLIT_BY_DAYS`). 2 dias/semana não suportado (constraint SQL 3-6). Quadríceps e posteriores a 1x/semana em 4 e 6 dias. |
| 4 | Padrões de movimento e alongamento | **Ausente** | Sem campo `movement_pattern`. "Inferior B" tem duas dobradiças (stiff barra + stiff halteres) e nenhum dominante de joelho; "Superior B" não tem puxada vertical. Ênfase em comprimento alongado não é considerada. |
| 5 | SFR e fadiga axial | **Parcial** | Só nos dias com desporto (`HIGH_CNS_LUMBAR`, por palavras no nome). Num dia normal podem coexistir agachamento livre, stiff e remada curvada. |
| 6 | RIR e faixas de reps | **Ausente na prática** | `goalParams.reps` ignorado: força recebe 8-12 (medido). RIR só existe como alvo semanal do mesociclo; não há RIR por exercício nem por nível. Nenhum exercício define `repRange`, por isso a progressão usa sempre [8, 12]. |
| 7 | Ordem e descanso | **Parcial** | A ordem vem bem dos modelos (compostos primeiro), mas os prioritários não sobem na sessão. Descanso fixo por exercício do catálogo; no AB Coach compostos ficam em 90-120 s. |
| 8 | Progressão e deload | **Parcial** | Dupla progressão implementada, mas: RPE só é gravado como 10 em séries de falha (`SetRow.jsx:135`), noutro caso assume RIR 2; incremento fixo 2,5 kg; `suggestedWeight` inicial é 8/12/16 kg para qualquer exercício. Semana do mesociclo escolhida à mão (`WeeklyDashboard.jsx:88`), só no `localStorage`. Sem deload reativo. |
| 9 | Casa/ginásio e lesões | **Parcial** | Bloqueio por palavras no nome (`LOCATION_BLOCK`, `INJURY_BLOCK`); substituto = primeiro exercício do mesmo grupo com a mesma mecânica (`adaptExercise`), não do mesmo padrão. Ex.: uma lesão no joelho pode trocar agachamento por qualquer "Quadríceps" composto que não contenha as palavras bloqueadas. |
| 10 | Treino concorrente | **Parcial** | Regras boas para desporto declarado (véspera e dia de jogo, sessão dupla), mas ignoram o volume real de corrida registado no módulo de corrida (que só alimenta a fadiga). |

### 1.4 Integridade científica do conteúdo

`EXERCISE_DATABASE` (`workoutGenerator.js:16`) tem 16 `evidenceTip`, vários com números que não consigo confirmar e que
parecem inventados ou distorcidos, por exemplo:

- "recrutando até 14% mais fibras do peitoral (Schoenfeld, 2020)" `[VERIFICAR NO PUBMED]`, provavelmente sem fonte.
- "A puxada pela frente ativa 20% mais o grande dorsal" sem fonte.
- "O agachamento profundo estimula até 3x mais os glúteos (Hartmann et al., 2013)": Hartmann et al. 2013 é uma revisão
  sobre profundidade e cargas articulares; não sustenta "3x". O dado de hipertrofia de glúteo com agachamento profundo
  é de Kubo et al. 2019 e não indica "3x" `[VERIFICAR NO PUBMED]`.
- "O RDL ... reduz em até 65% a incidência de estiramentos": sem fonte; o efeito preventivo forte é do nórdico, não do RDL.
- "A prancha ... gera até 4x mais recrutamento": sem fonte.

O cabeçalho do gerador ("GERADOR CIENTÍFICO", "Literatura de ponta") promete mais do que o código entrega. Estes textos
aparecem pouco (a ficha técnica tem prioridade), mas devem ser removidos ou reescritos sem números.

---

## 2. Schema enriquecido de exercícios

O catálogo vive em JS no cliente (não há tabela `exercises`). Proposta: um módulo `src/data/exerciseMeta.js` como fonte
única, partilhado com a função `ab-coach` (o Deno importa ESM) e, se for útil para análises, espelhado numa tabela
`exercise_meta` gerada por script. Os campos abaixo são preenchidos por exercício do catálogo (508).

| Campo | Tipo | Valores / exemplo | Para que serve |
|---|---|---|---|
| `movement_pattern` | enum | `horizontal_push`, `vertical_push`, `horizontal_pull`, `vertical_pull`, `knee_dominant`, `hip_hinge`, `hip_extension`, `hip_abduction`, `hip_adduction`, `elbow_flexion`, `elbow_extension`, `shoulder_abduction`, `shoulder_horizontal_abduction`, `calf`, `core_anti_extension`, `core_anti_rotation`, `core_flexion`, `carry`, `conditioning`, `mobility` | Slots do plano, cobertura e substituição. |
| `muscles` | `{ [músculo]: peso }` | `{ chest: 1, front_delt: 0.5, triceps: 0.5 }` | Volume fracionado. Taxonomia mais fina que hoje: `front_delt`, `side_delt`, `rear_delt`, `glute_max`, `glute_med`, `upper_back`, `lats`, `quads`, `hamstrings`, `adductors`, `calves`, `biceps`, `triceps`, `forearms`, `abs`, `obliques`, `lower_back`, `traps`. |
| `lengthened_bias` | 0-2 | 2 = tensão máxima em comprimento longo (tríceps acima da cabeça, flexora sentada); 0 = encurtado | Priorizar estímulo em alongamento onde a evidência é mais forte. |
| `axial_load` | 1-5 | 5 = agachamento/terra com barra; 1 = máquina sentada | Teto de carga axial por sessão. |
| `systemic_fatigue` | 1-5 | Custo sistémico por série | Descanso dinâmico e teto de séries por sessão. |
| `sfr` | 1-5 | Heurística de estímulo/fadiga | Desempate na escolha de exercícios para volume adicional. |
| `skill_level` | `beginner` / `intermediate` / `advanced` | Snatch, pistol: `advanced` | Filtrar por nível. |
| `load_type` | enum | `barbell`, `dumbbell`, `machine_stack`, `cable`, `bodyweight`, `band`, `plate_loaded` | Incremento de carga e progressão (reps vs. carga). |
| `equipment_required` | `string[]` | `['bench', 'dumbbells']` | Filtro casa/ginásio por inventário real (hoje é por palavras no nome). |
| `contraindications` | `{ [articulação]: 'avoid' \| 'caution' }` | `{ shoulder: 'avoid', lower_back: 'caution' }` | Matriz de lesões explícita, em vez de palavras-chave. |
| `substitution_group` | string | `vertical_pull_neutral`, `knee_dominant_bilateral_machine` | Substituição equivalente (mesmo padrão e perfil de estímulo). |
| `unilateral` | boolean | | Contar séries e tempo de sessão corretamente. |
| `rep_class` | enum | `heavy_compound`, `compound`, `isolation`, `timed` | Faixa de reps, RIR e descanso por defeito. |
| `increment` | `{ kg, pct }` | barra: `{ kg: 2.5, pct: 0.025 }`; elevação lateral: `{ kg: 1, pct: 0.05 }` | Dupla progressão realista. |

Mudanças na base de dados:

- `exercise_logs`: usar de facto a coluna `rpe` existente (ou `rir SMALLINT`), mais `target_rir`, `rep_min`, `rep_max`.
- `workout_sessions`: `meso_id`, `meso_week`, `session_rpe`, `pain_flag` (já existe), `readiness_score`.
- Nova tabela `mesocycles` (`user_id`, `start_date`, `weeks`, `split`, `volume_plan JSONB`, `status`), para a semana
  avançar pelo calendário e o deload reativo ficar registado.
- `user_fitness_profiles`: permitir `days_per_week` 2; adicionar `equipment TEXT[]`, `weekly_run_km`, `run_quality_days`,
  `recovery_capacity` (sono/stress, opcional), `injury_severity JSONB`.

---

## 3. Arquitetura híbrida (determinística + IA)

Nota de stack: o `CLAUDE.md` do projeto proíbe migrar para TypeScript. Proponho o motor em **JavaScript ESM com JSDoc**,
puro e sem dependências, num diretório `src/engine/`, importado pelo cliente e pela função `ab-coach` (Deno lê `.js`).
Se quiseres mesmo TypeScript só no motor, é uma exceção que tens de aprovar.

```
Estado do utilizador
  perfil + inventário + lesões + histórico (cargas, reps, RIR) + fadiga + prontidão + corrida registada
        │
        ▼
[1] Engine determinístico (src/engine/)
    a. chooseSplit(dias, objetivo, nível, desporto)        → split e sessões
    b. weeklyVolumeBudget(nível, objetivo, prioritários,   → séries alvo por músculo (fracionadas)
       semana do mesociclo, corrida)
    c. distributeToSessions(budget, split)                 → séries por músculo por sessão (teto por sessão)
    d. buildSlots(sessão)                                  → slots por padrão de movimento, ordem e rep_class
    e. candidatesFor(slot, perfil)                         → exercícios válidos (equipamento, lesão, nível, axial)
        │
        ▼
[2] Camada de IA (opcional; sem IA o engine escolhe o melhor por sfr/lengthened_bias)
    - recebe slots com listas fechadas de candidatos (enum de ids por slot no schema JSON)
    - escolhe 1 exercício por slot, escreve justificativa curta e adapta pedidos ("hoje só tenho 30 min")
    - não define séries, reps, RIR nem descanso: isso vem do engine
        │
        ▼
[3] Validador pós-geração (mesmo código no cliente e na função)
    - regras com código e severidade; erro → reparação automática determinística; aviso → nota ao utilizador
        │
        ▼
Plano final + notas explicáveis ("subi o quadríceps para 2x/semana porque…")
```

### 3.1 Parâmetros de partida (calibráveis)

Volume semanal fracionado por músculo (séries com RIR ≤ 4):

| Nível | Início do mesociclo | Teto do mesociclo | Prioritário |
|---|---|---|---|
| Iniciante | 8 | 12 | +2 |
| Intermediário | 10 | 16 | +3 a +4 |
| Avançado | 12 | 20 | +4 (teto 22-24) |

Base: relação dose-resposta entre séries semanais e hipertrofia, com ganhos adicionais a partir de ~10 séries/semana
(Schoenfeld, Ogborn & Krieger 2017) e retornos decrescentes em volumes altos (Pelland et al. 2024, contagem fracionada
como melhor preditor `[VERIFICAR NO PUBMED]`: estado de publicação). MEV/MAV/MRV são um modelo prático de
Israetel/Renaissance Periodization, não limiares medidos; usamo-los como estrutura, não como números exatos.

Outros parâmetros:

- **Teto por sessão:** 8 séries diretas por músculo (10 para prioritário em avançados). Heurística prática para limitar
  séries de baixa qualidade por fadiga; a evidência de retornos decrescentes por sessão existe mas é recente
  `[VERIFICAR NO PUBMED]` (Pelland et al. 2024, análise por sessão).
- **Frequência:** ≥ 2x/semana por músculo grande quando os dias o permitem. Com volume igualado, a frequência por si só
  tem efeito pequeno (Schoenfeld, Grgic & Krieger 2019); o ganho real é distribuir o volume e respeitar o teto por sessão.
- **Reps por `rep_class`:** `heavy_compound` 5-8 (força) ou 6-10 (hipertrofia); `compound` 8-12; `isolation` 10-20;
  `timed` em segundos. A hipertrofia é semelhante entre cargas altas e baixas quando perto da falha; a força máxima
  favorece cargas altas (Schoenfeld, Grgic, Ogborn & Krieger 2017).
- **RIR alvo:** iniciante 2-3 em tudo; compostos com carga axial 1-3 (nunca 0 planeado); isoladores 0-2. A hipertrofia
  tende a aumentar com a proximidade da falha e a força é menos sensível (Robinson et al. 2024); treinar à falha não é
  necessário com volume igualado (Refalo et al. 2023).
- **Descanso:** `heavy_compound` 150-240 s; `compound` 120-180 s; `isolation` 60-90 s. Descansos curtos (~1 min) em
  compostos reduziram ganhos face a ~3 min em treinados (Schoenfeld et al. 2016).
- **Ordem:** prioritários e compostos primeiro; os exercícios feitos no início rendem mais reps e mais ganhos de força
  (Simão et al. 2012).
- **Carga axial:** soma de `axial_load` por sessão ≤ 8 e no máximo um exercício com `axial_load` 5. Heurística de
  gestão de fadiga, sem evidência direta de RCT.
- **Ênfase em alongamento:** em cada músculo com orçamento ≥ 6 séries, pelo menos uma escolha com `lengthened_bias` 2
  quando disponível. Evidência mais forte para tríceps acima da cabeça (Maeo et al. 2023 `[VERIFICAR NO PUBMED]`: ano),
  flexora sentada vs. deitada (Maeo et al. 2021), extensora e gémeos em comprimento longo (Pedrosa et al. 2022;
  Kassiano et al. 2023). Para elevação lateral no cabo a evidência é mais fraca; tratar como preferência, não regra.

### 3.2 Regras do validador

| Código | Regra | Severidade | Reparação |
|---|---|---|---|
| `VOL_LOW` | Músculo abaixo do início do orçamento | erro | Adicionar série no slot de melhor `sfr`. |
| `VOL_HIGH` | Músculo acima do teto (fracionado) | erro | Remover séries de acessórios com mais carga indireta. |
| `SESSION_CAP` | > teto de séries diretas numa sessão | erro | Mover séries para outra sessão do mesmo músculo. |
| `FREQ_1X` | Músculo grande 1x/semana com ≥ 3 dias | aviso | Redistribuir se o split permitir. |
| `PATTERN_GAP` | Padrão essencial em falta na semana | erro | Preencher com candidato do padrão. |
| `PATTERN_DUP` | Dois exercícios do mesmo `substitution_group` na sessão | aviso | Trocar o segundo. |
| `AXIAL_STACK` | Carga axial acima do teto | erro | Trocar pelo equivalente de menor `axial_load`. |
| `INJURY` | Exercício com `contraindications` `avoid` para lesão ativa | erro | Substituir no mesmo `substitution_group`. |
| `EQUIPMENT` | Equipamento não disponível | erro | Substituir no mesmo grupo. |
| `SKILL` | `skill_level` acima do nível | erro | Substituir. |
| `ORDER` | Isolador antes de composto do mesmo músculo | aviso | Reordenar. |
| `DURATION` | Tempo estimado (séries × (execução + descanso)) acima do disponível | erro | Cortar séries de menor prioridade. |
| `CONCURRENT` | Pernas pesadas < 24 h antes de corrida de qualidade/jogo | aviso | Trocar dia ou reduzir volume. |

---

## 4. Motor de progressão semana a semana

### 4.1 Por exercício (dupla progressão com RIR)

Entrada: séries de trabalho da última sessão do exercício (carga, reps, RIR registado), `rep_min`, `rep_max`,
`target_rir`, `increment`, prontidão.

```
1. RIR de cada série = valor registado; se não houver, inferir: falha → 0; senão "desconhecido" (não assumir 2).
2. Se todas as séries ≥ rep_max e RIR médio ≥ target_rir:
      carga += max(increment.kg, arredondar(carga × increment.pct ao disco disponível)); reps alvo = rep_min
3. Senão, se reps < rep_max e RIR médio ≥ target_rir - 0,5:  reps alvo = reps atuais + 1 (mesma carga)
4. Senão, se alguma série < rep_min com RIR 0 em 2 sessões seguidas:  carga × 0,95 (ou trocar exercício)
5. Senão: manter
6. Prontidão < 55 ou dor registada no músculo: travar subidas (já existe), não reduzir automaticamente.
7. Exercícios de peso corporal / elástico: progredir por reps, depois por variante mais difícil do mesmo grupo.
```

A progressão por carga e por reps produz resultados semelhantes (Plotkin et al. 2022); a dupla progressão combina as duas.
O incremento relativo evita o problema atual (+2,5 kg numa elevação lateral de 6 kg é +42%).

Requisito de UI: registar RIR em cada série de trabalho com um toque (0, 1, 2, 3, 4+), pré-preenchido com o alvo.
Sem RIR real, os passos 2-4 ficam a adivinhar.

### 4.2 Por mesociclo (volume e intensidade)

- Duração 4-6 semanas, com `start_date` na base de dados; a semana avança pelo calendário, não à mão.
- Semana 1: volume no início do orçamento, RIR alvo 3 (2 em avançados).
- Semanas seguintes: RIR alvo -1 por semana até 1 (0 só em isoladores); **+1 série por músculo por semana** apenas se
  a performance desse músculo se manteve ou subiu e o check-in de recuperação não indica fadiga; nunca acima do teto.
- Deload planeado na última semana: ~50% das séries, carga igual ou -10%, RIR 4+. A evidência sobre a forma ótima de
  deload é escassa e sobretudo de inquéritos a praticantes (Bell et al. `[VERIFICAR NO PUBMED]`); tratar como prática
  recomendada, não como protocolo comprovado.

### 4.3 Deload reativo (gatilhos)

Antecipar o deload se, numa janela de 7 dias, ocorrerem **2 ou mais** destes sinais:

1. e1RM a cair ≥ 5% em ≥ 2 exercícios-âncora em sessões consecutivas (com RIR registado).
2. Falhas do passo 4 em ≥ 3 exercícios.
3. Prontidão de wearables < 55 em ≥ 3 dias.
4. `session_rpe` ≥ 9 em sessões planeadas para RIR ≥ 2, em 2 sessões seguidas.
5. `pain_flag` ou check-in de dor no mesmo músculo/articulação 2 vezes.

Os limiares são heurísticas iniciais; devem ser afinados com os dados reais do app.

---

## 5. Treino concorrente

- A meta-análise de Schumann et al. 2022 não encontrou interferência relevante do treino aeróbio na hipertrofia nem na
  força máxima, mas encontrou na força explosiva, sobretudo com as duas coisas na mesma sessão. A interferência parece
  maior com corrida do que com ciclismo e aumenta com frequência e duração do aeróbio (Wilson et al. 2012).
- Regras propostas: usar os km reais do módulo de corrida (`getRunsHistory`), não só o desporto declarado.
  Acima de ~25 km/semana `[parâmetro]`, reduzir o orçamento de quadríceps/posteriores em 20%; não marcar pernas pesadas
  nas 24 h antes de uma corrida de qualidade (intervalos, tempo run) nem logo a seguir a uma longa; preferir corrida
  leve e perna no mesmo dia separados por várias horas quando a semana não deixa alternativa
  `[VERIFICAR NO PUBMED]`: intervalo mínimo ideal.

---

## 6. Roadmap priorizado

### P0: máximo impacto, baixa complexidade (1 a 2 semanas)

**Estado (2026-11-27): implementado.** Motor em `src/engine/` (metadados, prescrição, volume, balanceamento, validador,
configuração de progressão), ligado a `workoutGenerator.js`, `planFromProfile.js` e ao treino ativo; seletor de RIR em
`src/components/workout/RirPicker.jsx`; teste `src/engine/engine.test.js` corre 4320 perfis + Arnold + desporto sem erros.
Decisões tomadas na implementação:
- Os metadados manuais cobrem os 41 exercícios dos modelos; os restantes 467 usam metadados derivados do catálogo (P1 revê-os).
- `VOL_LOW` é erro só em ginásio sem lesões; com lesão ou equipamento reduzido é aviso, porque só a escolha por slots (P1)
  consegue repor exercícios. Tolerância de 1 série no mínimo semanal.
- Músculos prioritários podem ir a 6 séries por exercício. Quando não cabe o volume mínimo no tempo, o plano explica-o numa nota.
- RIR guardado como RPE (10 - RIR) na coluna `exercise_logs.rpe` existente; sem migration.
- O AB Coach (`trainingGuidelines.ts`) ainda não usa o motor: fica para o P1.5.

1. **Ligar o perfil ao plano.** Corrigir a ordem de precedência em `getEx` para nível, objetivo e duração mudarem séries,
   reps e descanso por `rep_class`. Força passa a 5-8 reps nos compostos pesados.
2. **Teto por sessão e frequência mínima.** No 4 e 6 dias, dividir o volume de quadríceps e posteriores por 2 sessões;
   tirar o segundo stiff do "Inferior B" e pôr um dominante de joelho; pôr puxada vertical no "Superior B".
3. **Orçamento de volume fracionado** com `muscles` (pesos) para os ~60 exercícios usados nos modelos, e o validador com
   `VOL_LOW`, `VOL_HIGH`, `SESSION_CAP`, `PATTERN_GAP`, `DURATION`. Teste que corre todos os perfis (níveis × objetivos ×
   dias × local) e falha se alguma regra for violada.
4. **RIR real.** Botões de RIR por série, gravados em `exercise_logs.rpe`/`rir`; o motor deixa de assumir RIR 2.
5. **Faixa e incremento por exercício.** `rep_class` e `increment` no catálogo; `repRange` passado ao motor de progressão;
   incremento relativo.
6. **Carga inicial realista.** Trocar os 8/12/16 kg fixos por "sem sugestão" na 1.ª sessão (o utilizador escolhe) ou por
   uma tabela por `load_type`.
7. **Higiene científica.** Remover ou reescrever os `evidenceTip` com números sem fonte e o cabeçalho "científico".

### P1: motor determinístico completo (3 a 5 semanas)

**Estado (2026-11-27): implementado.**
- Metadados dos 508 exercícios em `src/engine/exerciseMeta.js` (regras + `OVERRIDES` revistos com
  `scripts/review_exercise_meta.mjs`): padrão, classe de reps, tipo de carga, carga axial, músculos com pesos,
  contraindicações por articulação (avoid/caution), nível técnico, equipamento necessário, unilateral.
- Escolha por slots (`src/engine/slots.js`): cada exercício dos modelos é um slot (padrão + músculo principal + semente);
  os candidatos são pontuados por lesão, equipamento, nível, alongamento e orçamento axial. A substituição por palavras
  no nome deixou de existir. O validador volta a dar erro em `VOL_LOW` sempre que há exercício que caiba.
- 2 dias/semana (Full Body A/B) e inventário de equipamento em casa no onboarding
  (migration `20261141_profile_equipment_two_days.sql`).
- Mesociclo com data de início (`src/utils/mesocycleState.js`), avanço automático por semana de calendário, deload
  planeado na última semana e reativo (`src/engine/deload.js`, 2 ou mais sinais em 7 dias), tabela `mesocycles`
  (migration `20261142_mesocycles.sql`) sincronizada por `src/services/mesocycleService.js`.
- AB Coach: `supabase/functions/ab-coach/engine.ts` recebe o perfil estruturado (`perfil.motor`), limita o `id` do schema
  aos exercícios permitidos, aplica séries, reps, descanso e RIR das tabelas do app e valida a sessão (teto por músculo,
  carga axial, duração) antes de responder. Os dados vêm de `engineData.ts`, gerado por `scripts/build_edge_engine.mjs`
  (correr de novo sempre que o catálogo ou as tabelas mudarem). A IA continua a escolher e ordenar os exercícios; os
  candidatos não são fechados por slot, só pela lista de permitidos.
- Testes: `src/engine/engine.test.js` (todos os perfis, dias 2 a 6, lesões, inventário), `src/engine/deload.test.js`,
  `src/utils/mesocycleState.test.js`, `src/engine/edgeEngine.test.js`.

1. `src/engine/` com `chooseSplit`, `weeklyVolumeBudget`, `distributeToSessions`, `buildSlots`, `candidatesFor` e o
   validador completo; os 4 modelos fixos passam a ser só "sementes" de ordem e preferência.
2. Metadados completos dos 508 exercícios (`movement_pattern`, `axial_load`, `lengthened_bias`, `contraindications`,
   `substitution_group`, `skill_level`, `equipment_required`), gerados por script e revistos à mão.
3. Substituição por `substitution_group` em vez de palavras no nome; inventário de equipamento no onboarding; 2 dias/semana.
4. Tabela `mesocycles` e avanço automático da semana; deload planeado + reativo (secção 4.3).
5. AB Coach com slots: o prompt recebe candidatos fechados por slot e o schema JSON limita `id` a esse enum; séries, reps,
   RIR e descanso vêm do engine; o validador corre no servidor antes de responder.

### P2: refinamento e personalização (contínuo)

**Estado (2026-11-27): primeira versão implementada.** Todos os limiares abaixo são heurísticas iniciais `[parâmetro]`.
- Treino concorrente (`src/engine/concurrent.js`): km reais das últimas 4 semanas (`getRunsHistory`). O registo de
  corrida não guarda o tipo de sessão, por isso o tipo é inferido: longa = 12 km ou mais e 1,5x a mediana; qualidade =
  ritmo 7% mais rápido que a mediana (com 5 ou mais corridas). Dia habitual = mesmo dia da semana em 2 ou mais semanas.
  Acima de 25 km/semana corta 20% das séries de quadríceps e posteriores; sem pernas pesadas no dia e na véspera de uma
  corrida de qualidade nem no dia a seguir a uma longa (mesma troca de dias do desporto de impacto).
- Volume por músculo guiado pela performance (`src/engine/muscleVolume.js`, `src/utils/muscleVolumeState.js`): no início
  de cada semana de acumulação, +1 série semanal por músculo se a força estimada se manteve ou subiu (queda = 2,5% ou
  mais) e não houve check-in "Demais" nem dor numa zona ligada ao músculo; nunca acima do teto. As séries extra vão para
  os exercícios do músculo com as regras do balanceamento (teto por sessão, duração, limite de séries) e o treino ativo
  junta-as às séries da semana. Quando não cabem, o painel diz que falta tempo.
- Calibração individual (MEV/MRV) entre mesociclos: estagnar perto do teto em 2 mesociclos baixa o teto 2 séries;
  estagnar com pouco volume e sem fadiga em 2 mesociclos sobe o mínimo 2 séries; progredir no teto sem fadiga sobe o
  teto 2 séries. Desvio máximo de 4 séries. Guardada no mesociclo ativo (migration `20261143_engine_p2_calibration_metrics.sql`).
- Ênfase em alongamento pesa mais em hipertrofia (x3) e menos em força (x1). Favoritos e exercícios a evitar
  (botões na ficha do exercício, guardados no aparelho) pesam na escolha por slots e o AB Coach no servidor exclui os
  exercícios a evitar.
- Plano recalculado: o painel compara o plano atual com o recalculado (corridas, preferências, calibração) e propõe
  aplicá-lo; aplicar substitui o plano semanal.
- Painel admin, separador "Motor": adesão, séries com RIR registado, exercícios a progredir, mesociclos e deloads
  reativos (`admin_engine_metrics`), e verificação do validador nos 900 perfis da grelha.
- Testes: `src/engine/p2.test.js`.
- Por fazer: guardar o tipo de sessão de corrida no registo (em vez de inferir), sincronizar as preferências com a conta,
  e afinar os limiares com os dados do painel.

1. Treino concorrente com km reais de corrida e tipo de sessão (secção 5).
2. Progressão de volume por músculo guiada pela performance (secção 4.2) e calibração de MEV/MRV individual a partir do
   histórico (músculos que respondem/estagnam).
3. Ênfase em alongamento com dados por exercício; preferências do utilizador (exercícios favoritos/odiados) como pesos.
4. Painel interno com métricas do motor: violações do validador por perfil, taxa de progressão, frequência de deloads,
   adesão; usar para afinar os parâmetros da secção 3.1.

---

## 7. Referências

Consensos considerados sólidos:

- Schoenfeld BJ, Ogborn D, Krieger JW. Dose-response relationship between weekly resistance training volume and increases
  in muscle mass: a systematic review and meta-analysis. J Sports Sci. 2017.
- Schoenfeld BJ, Ogborn D, Krieger JW. Effects of resistance training frequency on measures of muscle hypertrophy:
  a systematic review and meta-analysis. Sports Med. 2016.
- Schoenfeld BJ, Grgic J, Krieger J. How many times per week should a muscle be trained to maximize muscle hypertrophy?
  J Sports Sci. 2019.
- Schoenfeld BJ, Grgic J, Ogborn D, Krieger JW. Strength and hypertrophy adaptations between low- vs. high-load
  resistance training: a systematic review and meta-analysis. J Strength Cond Res. 2017.
- Schoenfeld BJ et al. Longer interset rest periods enhance muscle strength and hypertrophy in resistance-trained men.
  J Strength Cond Res. 2016.
- Simão R et al. Exercise order in resistance training. Sports Med. 2012.
- Refalo MC et al. Influence of resistance training proximity-to-failure on skeletal muscle hypertrophy: a systematic
  review with meta-analysis. Sports Med. 2023.
- Robinson ZP et al. Exploring the dose-response relationship between estimated resistance training proximity to
  failure, strength gain, and muscle hypertrophy. Sports Med. 2024.
- Schumann M et al. Compatibility of concurrent aerobic and strength training for skeletal muscle size and function:
  an updated systematic review and meta-analysis. Sports Med. 2022.
- Wilson JM et al. Concurrent training: a meta-analysis examining interference of aerobic and resistance exercises.
  J Strength Cond Res. 2012.
- Maeo S et al. Greater hamstrings muscle hypertrophy but similar damage protection after training at long versus short
  muscle lengths. Med Sci Sports Exerc. 2021.
- Pedrosa GF et al. Partial range of motion training elicits favorable improvements in muscular adaptations when carried
  out at long muscle lengths. Eur J Sport Sci. 2022.
- Plotkin D et al. Progressive overload without progressing load? The effects of load or repetition progression on
  muscular adaptations. PeerJ. 2022.

Com detalhe a confirmar:

- Pelland JC et al. The resistance training dose-response: meta-regressions exploring the effects of weekly volume and
  frequency on muscle hypertrophy and strength gain. `[VERIFICAR NO PUBMED]`: publicado como preprint (SportRxiv, 2024);
  confirmar revista final e os números de contagem fracionada e de volume por sessão.
- Baz-Valle E et al. A systematic review of the effects of different resistance training volumes on muscle hypertrophy.
  J Hum Kinet. 2022 `[VERIFICAR NO PUBMED]`.
- Maeo S et al. Triceps brachii hypertrophy is substantially greater after elbow extension training performed in the
  overhead versus neutral arm position. Eur J Sport Sci. `[VERIFICAR NO PUBMED]`: ano (2022 ou 2023).
- Kassiano W et al. Greater gastrocnemius muscle hypertrophy after partial range of motion training performed at long
  muscle lengths. J Strength Cond Res. 2023 `[VERIFICAR NO PUBMED]`.
- Wolf M et al. Partial vs full range of motion resistance training: a systematic review and meta-analysis.
  `[VERIFICAR NO PUBMED]`: revista e ano.
- Bell L et al. Estudos sobre práticas de deload (inquérito e revisão) `[VERIFICAR NO PUBMED]`: títulos e anos.
- Kubo K et al. Effects of squat training with different depths on lower limb muscle volumes. Eur J Appl Physiol. 2019
  `[VERIFICAR NO PUBMED]`.
