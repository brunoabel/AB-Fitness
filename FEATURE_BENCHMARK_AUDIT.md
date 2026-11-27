# Auditoria de Gap Analysis — Benchmark Tier-1 Fitness App

> **Escopo:** Auditoria técnica estritamente *read-only* ao repositório `AB-Fitness-main` face às 20 funcionalidades de referência Tier-1 (padrão Nike Training Club / Hevy / WHOOP), baseada exclusivamente em evidências verificadas em código, assets e migrações de base de dados.

---

## 1. Resumo Executivo

### Stack Detectada e Limites de Plataforma
1. **Frontend:** React 19.2.8 + Vite 8.3 + Tailwind CSS v4 + Motion v12 + Lucide React + Leaflet 1.9.4 (`package.json`).
2. **Plataforma:** Web / PWA instalável (`public/manifest.json` com `display: standalone`, Service Worker manual `public/sw.js` `ab-fitness-v27`); **sem** Capacitor, Ionic, React Native/Expo nem targets nativos iOS, Android, watchOS ou WearOS.
3. **Backend & Dados:** Supabase (Auth, PostgreSQL com 34+ migrações + RLS + RPCs atómicas, Storage, Edge Function Deno `ab-coach`) + Vercel Serverless Functions (`api/`: Stripe, troca de tokens OAuth de wearables, `api/og-athlete.js`).
4. **Armazenamento Local:** `localStorage` (`src/utils/storage.js`) + IndexedDB pontual (`src/utils/idbDraft.js` para corrida ativa; `src/utils/bodyPortfolio.js`) + Cache API (`public/sw.js`).
5. **Limites de Plataforma:** A sandbox do browser bloqueia iOS Live Activities (`ActivityKit`), Android Foreground Services, Apple HealthKit, Android Health Connect, GPS contínuo em segundo plano com ecrã bloqueado, *audio ducking* de música externa (`AVAudioSession`/`AudioFocus`), hápticos via `navigator.vibrate` no iOS Safari e apps companion watchOS/WearOS.

### Placar Geral (20/20)
- **3/20 Implementadas** (`IMPLEMENTADO`: #7, #9, #17)
- **11/20 Parciais** (`PARCIAL`: #1, #2, #4, #5, #8, #10, #12, #13, #15, #18, #20)
- **0/20 Mockadas** (`MOCKADO / STUB`: nenhuma)
- **3/20 Ausentes** (`AUSENTE`: #11, #16, #19)
- **3/20 Limitação de Plataforma** (`LIMITAÇÃO DE PLATAFORMA`: #3, #6, #14)

> *(Nota: As features #5 — hápticos no iOS Safari, #13 — Apple HealthKit/Android Health Connect, e #15 — GPS contínuo com ecrã bloqueado também possuem componentes limitados pela plataforma Web/PWA dentro de suas classificações `PARCIAL`.)*

---

## 2. Matriz Consolidada

| # | Feature | Status | Evidência no Código (Arquivo/Símbolo) | Gap Principal |
|---:|---|---|---|---|
| 1 | Arquitetura Offline-First com Sync Otimista | `PARCIAL` | `public/sw.js` (`ab-fitness-v27`, `networkFirstWithTimeout`), `src/services/workoutService.js` (`recordWorkoutCompletion`, `ab_fitness_sync_queue_v1`, `ab_fitness_sync_deadletter_v1`, `flushWorkoutSyncQueue`), `src/utils/syncErrors.js`, `src/utils/syncQueue.js`, `src/utils/historyMerge.js`, `src/utils/idbDraft.js`, `supabase/migrations/20261123_atomic_session_sync_and_logs_metadata.sql` & `20261134_p0_integrity.sql` (`sync_workout_session_atomic`) | Corridas (`runningSyncService.js`), plano semanal (`saveCustomUserPlan`), treinos custom, cargas e check-ins não têm fila offline; dados e filas em `localStorage` (~5 MB, falhas de quota silenciadas); sem Background Sync API; merge de conflitos rudimentar. |
| 2 | Crash Recovery Instantâneo de Sessão | `PARCIAL` | `src/hooks/useWorkoutDraft.js` (debounce 500 ms + flush `pagehide`/`visibilitychange`), `src/hooks/useWorkoutTimer.js` (wall-clock), `src/components/ActiveWorkout.jsx` (`getActiveDraft`, `handlePauseAndExit`), `src/App.jsx:136,178-187`, `src/components/RunningHub.jsx` + `src/utils/idbDraft.js` (`active_run_draft`) | `App.jsx` abre sempre em `'dashboard'` sem auto-retoma nem banner "Retomar treino"; bug: `liveSwaps` não é persistido no draft; `RestTimer`, exercício focado e modos não persistem; programas de PT não recuperam no boot; corrida só grava IDB a cada 5 s (sem flush em `pagehide`). |
| 3 | Live Activities e Controles na Tela Bloqueada | `LIMITAÇÃO DE PLATAFORMA` | `src/components/RestTimer.jsx:10-12` (`ENABLE_SIMULATED_DYNAMIC_ISLAND = false`), `src/services/restMediaSessionService.js` (`navigator.mediaSession`, `SILENT_WAV_DATA_URI`), `src/hooks/useWakeLock.js`. Zero `Notification` API / `ActivityKit` / `ForegroundService` | Inviável sem wrapper nativo (ActivityKit / Android Foreground Service). Fallback Web via `mediaSession` com `<audio>` silencioso em loop rouba foco de áudio (pausa Spotify/Apple Music) e congela no iOS com ecrã bloqueado; sem Web Notifications de fim de descanso. |
| 4 | Smart Swap (Substituição Biomecânica em 1 Toque) | `PARCIAL` | `src/components/workout/SwapExerciseModal.jsx`, `src/services/abCoach/catalog.js:145-168` (`getBiomechanicalSubstitutes`), `src/components/ActiveWorkout.jsx:150-184` (`handleSwapExercise`), `src/components/workout/FocusExerciseCard.jsx:410-442`, `src/data/exerciseMedia.js:59-85` (`getHomeAlternative`) | Exige 3 toques no Modo Foco e não existe no Modo Lista (`ExerciseListView.jsx`); filtra só `grupo`+`porcao` (sem padrão de movimento, ignora `tipo`, não exclui duplicados); não consulta histórico real (`prevIndex`/`pastWeights`) do substituto nem converte carga entre equipamentos; deixa séries órfãs no envio e perde-se no reload. |
| 5 | Input Rápido com Memória de Carga e Hápticos | `PARCIAL` | `src/utils/activeWorkoutHelpers.js:38-89` (`buildInitialExercisesData`), `src/components/workout/FocusExerciseCard.jsx`, `src/components/SetRow.jsx`, `src/components/ui/NumberField.jsx` (long-press 500 ms), `src/utils/strengthMetrics.js:36-69` (`buildPrevIndex` retorna `Map`), `src/utils/audio.js:166-172` (`triggerHaptic` via `navigator.vibrate`) | **Bug crítico:** `FocusExerciseCard.jsx:148` e `ExerciseListView.jsx:98` usam `prevIndex[exercise.id]` num `Map` (sempre `undefined`), quebrando memória por série/drop-set nas séries 2+; `NumberField` não é usado no Modo Foco; hápticos indisponíveis no iOS Safari/PWA (limitação de plataforma). |
| 6 | Audio Ducking Inteligente com Cues de Voz | `LIMITAÇÃO DE PLATAFORMA` | `src/utils/speech.js` (`speechSynthesis`, `announceSplit`, `announceStart`/`Pause`/`Resume`/`Finish`), consumido apenas em `src/components/RunningHub.jsx`; `src/utils/audio.js` (`SoundService` Web Audio); `src/services/restMediaSessionService.js` | Audio ducking real de música externa (`AVAudioSession.duckOthers` / `AudioFocus`) é impossível na Web/PWA; WAV silencioso do `RestTimer` faz o oposto (pausa música). Além disso, cues de voz TTS existem só na corrida (ausentes em `RestTimer`/`ActiveWorkout`). |
| 7 | Motor Determinístico de Sobrecarga Progressiva | `IMPLEMENTADO` | `src/utils/strengthMetrics.js` (`e1RM`, `loadIncrement`, `calculateNextSessionPrescription`), `src/engine/{prescription,progressionConfig,volume,balancer,validator,exerciseMeta}.js`, `src/utils/mesocycleWeek.js`, `src/services/abCoach/coachInsightsService.js`, `src/components/ActiveWorkout.jsx:82-94`, `src/components/workout/FocusExerciseCard.jsx:447-465`, `src/components/workout/RirPicker.jsx`, testes `strengthMetrics.test.js`, `mesocycleWeek.test.js`, `engine.test.js` | Funcional ponta a ponta no Modo Foco (regras matemáticas puras desacopladas da LLM). Polimentos pendentes: invisível no Modo Lista (`ExerciseListView.jsx`), janela de 1 sessão (sem deteção de platô multi-sessão), semana do mesociclo manual e sem prescrição para exercícios bodyweight (`weight = 0`). |
| 8 | Auto-Regulação por Prontidão (Readiness Score) | `PARCIAL` | `src/services/wearables/wearableManager.js` (`computeReadinessIndex`), `src/utils/activeWorkoutHelpers.js` (`getCurrentReadinessScore`, `buildInitialExercisesData`), `src/utils/strengthMetrics.js` (trava `<55`), `src/utils/muscleFatigue.js` (`readinessHalfLifeMultiplier`), `src/components/DailyBriefing.jsx` + `src/utils/dailyBriefing.js`, `src/components/coach/SessionCheckin.jsx` | Sem algoritmo próprio combinando sono + HRV (baseline individual) + check-in subjetivo pré-treino (`null` sem wearable); bug no Ease Mode `−1 série` (`activeWorkoutHelpers.js:56-79` ignorado quando há `saved[ex.id]`); bug de matching de nomes de músculo (`peito` vs `"Peitoral Maior"`); baixa prontidão wearable não reduz séries/carga nem dispara deload. |
| 9 | Mapa de Fadiga por Volume Efetivo (com Sinergistas) | `IMPLEMENTADO` | `src/data/muscleRegions.js` (`MUSCLE_REGIONS`, `regionsForExercise` primário `1.0` / sinergista `0.5`), `src/utils/muscleFatigue.js` (`computeLocalFatigue`, `isHardSet` exclui aquecimento `'W'`, RPE/reps, meia-vida 72h, fusão com corridas), `supabase/migrations/{20261110_muscle_fatigue,20261110_muscle_fatigue_seed,20261130_runs_muscle_fatigue,20261134_p0_integrity,20261137_weighted_muscle_fatigue,20261140_muscle_targets_open_exercises}.sql`, `src/hooks/useMuscleRecovery.js`, `src/components/MuscleRecoveryMap.jsx`, `muscleFatigue.test.js` | Funcional ponta a ponta (cliente + SQL 1:1). Melhorias menores: peso sinergista fixo em `0.5`, corrida ignora intensidade/pace e SQL `20261137` não lê `sleep_score` do Fitbit quando `recovery_score` é `null`. |
| 10 | Periodização Híbrida (Força + Corrida sem Conflito) | `PARCIAL` | `src/components/onboarding/profileSchema.js` (`HIGH_IMPACT_LEG_SPORTS`, `sportDays`, `sportIntensity`, `sessionOrder`), `src/data/planFromProfile.js` (`applyLegFatigueProtection`, `applyDoubleSessionLoad`, `lockedDays`, `sportPreventionDrills`), `src/engine/balancer.js`, testes `planFromProfile.test.js` e `engine.test.js` | Sem periodização de corridas em `runGoals.js` (não diferencia Z2 vs tiros/longão); `sessionOrder` recolhido mas não usado; regras só correm na geração estática (sem reagendamento dinâmico pós-corrida); furo em splits Full Body (`groupShareOf < 0.5`). |
| 11 | Guardrails de Carga Aguda vs. Crônica (Prevenção de Lesão) | `AUSENTE` | Ausente em todo `src/` e `supabase/` (apenas tetos estáticos de plano em `src/engine/volume.js`, fadiga 72h em `muscleFatigue.js`, 3 red flags pontuais em `src/components/trainer/RedFlagList.jsx` e `volumeDiffPct` sem teto de segurança em `coachInsightsService.js`) | Sem cálculo ACWR (7d:28d ou EWMA), sem deteção de picos semanais de tonelagem/séries/corrida e sem alertas/guardrails preventivos acionáveis. |
| 12 | Biblioteca de Vídeos Ultra-Leves (60fps, Multi-Ângulo, Cache) | `PARCIAL` | `public/exercise-videos/` (474 `.mp4`, mediana 53,7 KB, 94,1% cobertura), `public/exercise-posters/`, `scripts/build_exercise_animations.mjs` (`h264`, `512×384`, `25 fps`), `src/services/videoPrecache.js`, `public/sw.js` (`VIDEO_CACHE`, HTTP `206 Partial Content`), `src/components/video/{VideoSurface,ExerciseVideoPlayer}.jsx` | 25 fps em vez de 60 fps (`-vf fps=25`); ângulo único (sem multi-ângulo); apenas H.264 (sem AV1/HEVC/WebM); 30 exercícios (5,9%) sem vídeo. |
| 13 | Sincronização Bidirecional com Wearables | `PARCIAL` | `src/services/wearables/{whoop,fitbit,garmin,strava}Service.js`, `wearableManager.js`, `api/{whoop,fitbit,garmin,strava}-token.js`, `src/components/wearables/WearablesModal.jsx`, `supabase/migrations/{20261122_wearables_biometrics,20261132_wearables_strava_garmin}.sql` | Estritamente unidirecional (read-only, zero escrita/push); zero deduplicação de sessões/calorias; Apple HealthKit e Android Health Connect bloqueados na Web (limitação de plataforma); chamadas client-side (CORS/PKCE/Garmin OAuth) e tokens em plaintext no `localStorage`. |
| 14 | App Companion Independente para Smartwatch | `LIMITAÇÃO DE PLATAFORMA` | Nenhum target `watchos/`, `wearos/`, `ios/` ou `android/` nem SDK nativo em `package.json`; apenas controlo passivo via `src/services/restMediaSessionService.js` | Ausente e impossível em Web/PWA puro; requer apps nativos watchOS (`WatchKit`/`WatchConnectivity`) e WearOS (`Health Services`). |
| 15 | Engine GPS de Alta Precisão com Auto-Pause Real | `PARCIAL` | `src/utils/runningService.js` (`GpsKalmanFilter2D`, `validateAndFilterGpsPoint`, `calculateRollingPace`, `computeSplits`, `simplifyRoute`), `src/hooks/useRunGpsWatch.js`, `src/utils/runSessionHelpers.js`, `src/utils/ghostPacer.js`, `src/components/RunningHub.jsx`, testes `runningService.test.js` & `runSessionHelpers.test.js` | GPS em background/ecrã bloqueado é suspenso em PWA (limitação de plataforma); `autoPauseSpeedMs: 0.5` (`runningService.js:20`) não é usado — auto-pause (`RunningHub.jsx:328-340`) depende só de timeout de 6 s sem ponto aceito; `computeSplits` não desconta tempo pausado (`accumulatedPausedMsRef`). |
| 16 | Análise de Movimento On-Device (Visão Computacional) | `AUSENTE` | Zero bibliotecas CV/ML em `package.json` (`@mediapipe/tasks-vision`, `@tensorflow/tfjs`, `onnxruntime-web` ausentes); zero uso de `getUserMedia`, pose tracking, ROM ou VBT em `src/` | Feature totalmente ausente (viável em Web via MediaPipe Tasks Vision + WebGL/WebGPU sem upload de vídeo, ou CoreML/Metal em nativo). |
| 17 | Cards Compartilháveis de Qualidade Editorial | `IMPLEMENTADO` | `src/utils/workoutResultCard.js` (`1080×1920`, opaco + PNG transparente `sticker-white`/`sticker-dark`), `src/components/share/runShareCanvas.js` + `themes.js` + `RunningShareModal.jsx` (Story/Feed, PNG transparente, mapa vetorial GPS), `src/utils/{shareCard,athletePassCard,badgeResultCard,streakResultCard,milestoneCard}.js`, `api/og-athlete.js` | Funcional ponta a ponta (Canvas alta resolução, transparência PNG, Web Share + Clipboard PNG). Polimentos menores: transparência só em força/corrida, tema `satellite-map` usa grid em vez de tiles reais, sticker de treino mostra só `prLines[0]`. |
| 18 | Marcos Atléticos no Lugar de Gamificação Infantil | `PARCIAL` | `src/utils/streak.js` (`computeStreak` protege `isRestDay`), `src/utils/streakMilestones.js`, `src/utils/userVerification.js` (`getAthleteRank`), `src/data/badges.js`, `src/utils/badgeRules.js`, `src/utils/badgeService.js`, `src/utils/bodyPortfolio.js` (`getTopLifts`) | Zero força relativa ao peso corporal (`badgeRules.js:74-99` usa 100 kg fixos); zero marcos de tonelagem vitalícia acumulada; bugs de streak (`ActiveWorkout.jsx:311,313` e `RunningHub.jsx:580,585` passam `WEEKLY_SCHEDULE` estático; SQL `public.athlete_streak` em `20261109` ignora rest days/corridas e usa UTC; `badgeRules.js:106-112` conta sessões totais); badges só em `localStorage`; mantém `canvas-confetti` e badges `early_bird`/`night_owl`. |
| 19 | Sessões Compartilhadas em Tempo Real | `AUSENTE` | Zero uso de `supabase.channel`, `postgres_changes`, `broadcast`, `presence`, `WebSocket` ou `supabase_realtime` em `src/` e `supabase/`. Até DMs (`src/components/social/DirectMessageSheet.jsx:55-70`) usam polling HTTP de 4 s; `SocialHub.jsx` e `HeadToHeadSheet.jsx` são assíncronos | Ausência total de infraestrutura realtime (treino em dupla sincronizado ou acompanhamento ao vivo de splits). |
| 20 | Importação e Exportação Aberta de Dados (CSV, JSON, FIT) | `PARCIAL` | Exportação GPX 1.1 de corrida única (`toGPX`/`downloadGPX` em `src/utils/runningService.js:514-557`, ligado em `RunSummary.jsx`/`RunHome.jsx`), CSV admin de waitlist (`waitlistService.js`), relatório HTML/PDF do PT (`trainerService.js`), exclusão GDPR (`accountService.js`) | Zero importadores de concorrentes (Hevy, Strong, Strava); zero exportação self-service completa em JSON/CSV (apesar de prometida em `src/legal/privacidade.js:126`); zero suporte a `.FIT`. |

---

## 3. Detalhamento Técnico (Itens Não-Implementados Totalmente)

> *(As features #7, #9 e #17 estão classificadas como `IMPLEMENTADO` e foram omitidas desta seção conforme o escopo.)*

### Domínio A — Execução "Zero Atrito" no Chão de Academia

#### 1. Arquitetura Offline-First com Sync Otimista (`PARCIAL`)
- **O que já existe reaproveitável:**
  - App shell, bundles `/assets/*`, posters e vídeos pré-cacheados em `public/sw.js` (`ab-fitness-v27`, `MEDIA_CACHE` até 150 entradas, `VIDEO_CACHE` até 40 entradas com `serveCachedVideo` para HTTP `206 Partial Content`, `networkFirstWithTimeout` de 3 s e bypass para `supabase.co`/`.supabase.in`).
  - Finalização otimista de treino de força em `src/services/workoutService.js` (`recordWorkoutCompletion`, `ab_fitness_sync_queue_v1`, `ab_fitness_sync_deadletter_v1`, `flushWorkoutSyncQueue`), com classificação de erros permanentes vs. transitórios em `src/utils/syncErrors.js` (`isPermanentSyncError`), dead-letter recuperável em `src/components/HistoryView.jsx` e RPC idempotente `sync_workout_session_atomic` (`supabase/migrations/20261123_atomic_session_sync_and_logs_metadata.sql` e `20261134_p0_integrity.sql`).
  - `src/utils/syncQueue.js` (`enqueueJob`/`flushQueue` idempotente por `job.key`), `src/utils/historyMerge.js` (`mergeHistory`) e auto-flush em `src/App.jsx:283-311` no boot e evento `online`.
- **O que falta construir:**
  - Enfileiramento offline para as restantes mutações: corridas (`src/services/runningSyncService.js:12-46`), plano semanal (`saveCustomUserPlan` em `workoutService.js:490-591`), treinos personalizados, cargas (`ab_fitness_weights_v1`), perfil fitness e check-ins.
  - Migração de `localStorage` (~5 MB síncrono, onde erros de quota em `writeQueue` são silenciados) para IndexedDB (`idb` / wrapper em `src/utils/idbDraft.js`) para histórico, corridas GPS e fila unificada de mutações.
  - Registo de Background Sync (`SyncManager`) no Service Worker para sincronizar mesmo com a aba fechada (Android/Desktop) e resolução de conflitos por timestamp/versão em vez de overwrite incondicional em `syncUserRunsFromSupabase` (`runningSyncService.js:73-89`).

#### 2. Crash Recovery Instantâneo de Sessão (`PARCIAL`)
- **O que já existe reaproveitável:**
  - `src/hooks/useWorkoutDraft.js` persiste `{ workoutDayId, elapsedSeconds, timerBaseSeconds, timerRunningSince, exercisesData, homeSwaps }` em `localStorage` (`ab_fitness_active_draft_v1`) com debounce de 500 ms e flush imediato em `pagehide`/`visibilitychange`.
  - `src/hooks/useWorkoutTimer.js` usa `Date.now() - since` (imune a throttling em background).
  - Corrida guarda coordenadas GPS e splits em IndexedDB (`active_run_draft` via `src/utils/idbDraft.js`) e reidrata em pausa em `src/components/RunningHub.jsx`.
- **O que falta construir:**
  - Corrigir `src/App.jsx:136,178-187`: hoje arranca sempre em `'dashboard'` sem abrir o treino ativo nem mostrar banner "Retomar treino" no Dashboard; resolver também programas atribuídos por PT (`trainer_program`).
  - Persistir `liveSwaps` no rascunho em `useWorkoutDraft` e `handlePauseAndExit` (`ActiveWorkout.jsx:159-166,388-395`) — hoje qualquer troca via Smart Swap perde-se no reload.
  - Persistir estado de `RestTimer` (`endAtRef`, `totalSeconds`, exercício), `focusedExerciseId`, `isFocusMode` e `isExpressMode`.
  - Adicionar flush imediato em `pagehide`/`visibilitychange` no `RunningHub.jsx:392-412` (hoje grava apenas de 5 em 5 s).

#### 3. Live Activities e Controles na Tela Bloqueada (`LIMITAÇÃO DE PLATAFORMA`)
- **O que já existe reaproveitável:**
  - `src/services/restMediaSessionService.js` (`navigator.mediaSession`, `setActionHandlers` para saltar descanso/`+30s`/pausa, `setPositionState` + artwork `/coach/ab-coach-rest-128.jpg`).
  - `src/hooks/useWakeLock.js` ativo em `ActiveWorkout.jsx` e `RunningHub.jsx`.
  - `src/components/RestTimer.jsx` já calcula contagem regressiva por timestamp (`endAtRef`).
- **O que falta construir (e caminho técnico):**
  - **Limitação da stack atual:** PWA não tem acesso a `ActivityKit` / Dynamic Island (iOS) nem Android `ForegroundService` persistente.
  - **Bugs/falhas do fallback Web atual:** o loop de `SILENT_WAV_DATA_URI` (`restMediaSessionService.js:30,47`) rouba foco de áudio do SO no mobile, **pausando Spotify/Apple Music** a cada descanso; no iOS Safari bloqueado o `setInterval` congela o texto do contador e impede o som/háptico no término.
  - **Caminho viável na Web:** tornar a `MediaSession` opt-in (ou desacoplada do loop `<audio>` quando música está a tocar) e adicionar Web Notifications via Service Worker (`Notification` API + `showNotification` com ações `+30s`/`Saltar`). **Caminho definitivo:** wrapper Capacitor com plugin nativo de Live Activities (iOS) e Foreground Notification (Android).

#### 4. Smart Swap (Substituição Biomecânica em 1 Toque) (`PARCIAL`)
- **O que já existe reaproveitável:**
  - `src/components/workout/SwapExerciseModal.jsx` + `getBiomechanicalSubstitutes` (`src/services/abCoach/catalog.js:145-168`) sobre 481 exercícios de `EXERCISE_BIOMECHANICS`.
  - `handleSwapExercise` (`ActiveWorkout.jsx:150-184`) e mapeamento "Modo Casa" (`src/data/exerciseMedia.js:59-85`, `home_alternative_id` em 194/375 exercícios + `src/data/homeExercises.js`).
- **O que falta construir:**
  - Reduzir de 3 toques para 1 toque rápido no card (Modo Foco) e expor `onOpenSwap` no Modo Lista (`ExerciseListView.jsx` hoje não recebe swap).
  - Enriquecer taxonomia em `catalog.js`: adicionar `movementPattern` (push horizontal, hinge, squat, etc.), respeitar `tipo` (composto vs. isolador), priorizar equipamentos distintos do ocupado e passar `excludeIds` para não sugerir exercícios já presentes na sessão.
  - Consultar `prevIndex.get(substitute.id)` e `pastWeights[substitute.id]` ao trocar, aplicar fator de conversão de carga entre equipamentos (barra ↔ halter ↔ máquina/unilateral), incluir substitutos em `progressionHints` e limpar séries órfãs do exercício trocado antes do sync em `handleFinishWorkout`.

#### 5. Input Rápido com Memória de Carga e Hápticos (`PARCIAL`)
- **O que já existe reaproveitável:**
  - Pré-preenchimento inicial via `buildInitialExercisesData` (`src/utils/activeWorkoutHelpers.js:38-89`, `ab_fitness_weights_v1`), steppers `±2,5 kg` / `±1 rep` / `±5 s`, drop-set automático a 80%, `NumberField` com long-press de 500 ms em `SetRow.jsx` e `triggerHaptic` via `navigator.vibrate` (`src/utils/audio.js:166-172`).
- **O que falta construir (e caminho técnico):**
  - **Correção crítica de bug:** `buildPrevIndex` (`src/utils/strengthMetrics.js:36-69`) devolve um `Map`, mas `FocusExerciseCard.jsx:148` (`prevIndex[exercise.id]?.[idx]`) e `ExerciseListView.jsx:98` (`prevIndex[exercise.id]?.[setIdx]`) indexam por colchetes (sempre `undefined`), quebrando o histórico por série nas séries 2+ e o cálculo de drop-set.
  - Adotar `NumberField` (ou teclado numérico custom/in-app) também no Modo Foco (`FocusExerciseCard.jsx:583-717` usa `<input type="number">` direto).
  - **Limitação iOS:** `navigator.vibrate` não existe no iOS Safari/PWA — apenas wrapper nativo (Capacitor Haptics / `UIImpactFeedbackGenerator`) desbloqueia resposta tátil em iPhones.

#### 6. Audio Ducking Inteligente com Cues de Voz (`LIMITAÇÃO DE PLATAFORMA`)
- **O que já existe reaproveitável:**
  - `src/utils/speech.js` (`speechSynthesis`, seleção `pt`/`pt-BR`, `unlockSpeechIOS`, cues de corrida `announceSplit`, `announceStart`/`Pause`/`Resume`/`Finish`) integrado em `RunningHub.jsx`.
  - `src/utils/audio.js` (`SoundService` Web Audio 100% offline).
- **O que falta construir (e caminho técnico):**
  - **Limitação da stack atual:** browsers não expõem `AVAudioSession.CategoryOptions.duckOthers` (iOS) nem `AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK` (Android); além disso, `restMediaSessionService.js` em descanso tende a pausar música externa.
  - **Viável na Web:** adicionar cues TTS opcionais no `ActiveWorkout`/`RestTimer` ("10 segundos", "Próxima série: X kg") e fallback de tom Web Audio curto sem loop de `<audio>`. **Ducking real:** exige Capacitor/módulo nativo de áudio.

---

### Domínio B — Inteligência Fisiológica e Progressão Real

#### 8. Auto-Regulação por Prontidão (Readiness Score) (`PARCIAL`)
- **O que já existe reaproveitável:**
  - `computeReadinessIndex` (`src/services/wearables/wearableManager.js`) com suporte a WHOOP/Garmin/Fitbit/Strava, trava de sobrecarga em `<55` (`calculateNextSessionPrescription`), `readinessHalfLifeMultiplier` em `muscleFatigue.js`, `DailyBriefing.jsx` (`setEaseModeToday`) e `SessionCheckin.jsx` (pós-treino).
- **O que falta construir:**
  - Algoritmo próprio combinando baseline individual (Z-score de HRV/RHR/sono quando disponível) + check-in subjetivo **pré-treino** rápido (sono, dor muscular, energia/stress) quando não houver wearable (hoje `readinessScore` fica `null`).
  - **Correção de 2 bugs silenciosos:** (a) em `activeWorkoutHelpers.js:56-79`, `targetsEasedMuscle` só aplica `−1 série` no ramo `else` quando não existe histórico `saved[ex.id]`, anulando o Ease Mode para quase todos os exercícios já treinados; (b) `DailyBriefing.jsx:18`, `ActiveWorkout.jsx:133` e `activeWorkoutHelpers.js:50` comparam IDs como `peito`/`posteriores` por `.includes()` contra `"Peitoral Maior"`/`"Isquiotibiais"` (deveriam usar `regionsForExercise`).
  - Regras acionáveis de auto-regulação quando prontidão < 55 mesmo sem fadiga muscular localizada (redução de séries/RPE alvo ou sugestão automática de *deload*).

#### 10. Periodização Híbrida (Força + Corrida sem Conflito) (`PARCIAL`)
- **O que já existe reaproveitável:**
  - `src/data/planFromProfile.js` (`applyLegFatigueProtection`, `applyDoubleSessionLoad`, `lockedDays`, `sportPreventionDrills`) ligado ao onboarding (`sportDays`, `sportIntensity`, `sessionOrder`) e `src/engine/balancer.js`, com suites de teste dedicadas (`planFromProfile.test.js`, `engine.test.js`).
- **O que falta construir:**
  - Periodização real das sessões de corrida em `src/utils/runGoals.js` (diferenciar regenerativa Z2, limiar/tiros e longão) para cruzar intensidade de corrida com dias de força.
  - Conectar `sessionOrder` (`gym_first` / `sport_first` / `split_hours`) ao motor de prescrição e corrigir a brecha em splits Full Body (`groupShareOf < 0.5`).
  - Reagendamento dinâmico em `WeeklyDashboard` quando uma corrida intensa real (via GPS ou wearable) ocorrer fora dos `sportDays` previstos no plano estático.

#### 11. Guardrails de Carga Aguda vs. Crônica (Prevenção de Lesão) (`AUSENTE`)
- **O que já existe reaproveitável:**
  - Tetos estáticos de volume semanal no gerador (`src/engine/volume.js`, `validator.js`), fadiga muscular de 72h (`muscleFatigue.js`), 3 red flags pontuais de PT (`src/components/trainer/RedFlagList.jsx`) e cálculo histórico de 4 sessões em `coachInsightsService.js`.
- **O que falta construir:**
  - Motor determinístico de ACWR (razão 7 dias : média 28 dias ou EWMA) calculado sobre carga executada (tonelagem/séries válidas + sRPE + carga interna/km de corrida).
  - Detector de picos semanais (`> +15%–30%` semana a semana ou ACWR `> 1.3–1.5`) com guardrails acionáveis: alerta preventivo antes da sessão, cap automático na progressão/volume e exposição no `RedFlagList` do PT e `ProgressionCharts.jsx`.

#### 12. Biblioteca de Vídeos Ultra-Leves (60fps, Multi-Ângulo, Cache) (`PARCIAL`)
- **O que já existe reaproveitável:**
  - 474 `.mp4` (mediana 53,7 KB, 25,84 MB totais) + 474 `.jpg` cobrindo 94,1% do catálogo (478/508 exercícios) e 100% dos drills, gerados por `scripts/build_exercise_animations.mjs` (`h264`, `512×384`, `+faststart`).
  - Prefetch inteligente via `src/services/videoPrecache.js`, cache SW com HTTP `206 Partial Content` (`public/sw.js`), player `VideoSurface.jsx`/`ExerciseVideoPlayer.jsx` (`1x`/`0.5x`, sticky mini-player, 3 cues curtos em PT-PT).
- **O que falta construir:**
  - Upgrade de pipeline para **60 fps** (hoje `-vf fps=25`), entrega moderna em WebM/AV1 (com fallback H.264), suporte a **múltiplos ângulos** (schema + seletor no player) e cobertura dos 30 exercícios restantes (5,9%).

---

### Domínio C — Ecossistema, Sensores e Telemetria

#### 13. Sincronização Bidirecional com Wearables (`PARCIAL`)
- **O que já existe reaproveitável:**
  - Provedores `whoopService.js`, `fitbitService.js`, `garminService.js`, `stravaService.js` + `wearableManager.js`, proxy OAuth em `api/{whoop,fitbit,garmin,strava}-token.js`, callback `/auth/callback/wearable` (`App.jsx:218-271`) e tabelas Supabase `wearable_connections` e `athlete_biometrics`.
- **O que falta construir (e caminho técnico):**
  - **Bidirecionalidade (Write-back):** implementar `POST /activities` para Strava (`activity:write`) / Garmin / WHOOP ao finalizar treino de força ou corrida GPS na AB Fitness.
  - **Deduplicação multi-fonte:** regra por janela temporal + duração/tipo/calorias para não duplicar treinos importados (ex.: corrida registada na app e sincronizada pelo Strava/Garmin).
  - **Segurança & Arquitetura:** mover fetch de APIs externas e tokens para Edge Functions / Vercel API (evitando CORS em WHOOP/Garmin, tokens em plaintext em `localStorage` `ab_wearable_connections_v1` e falta de PKCE/OAuth 1.0a em Garmin).
  - **Limitação da stack atual:** Apple HealthKit e Android Health Connect exigem wrapper nativo (Capacitor/React Native).

#### 14. App Companion Independente para Smartwatch (`LIMITAÇÃO DE PLATAFORMA`)
- **O que já existe reaproveitável:**
  - Apenas controlos passivos de descanso na lock screen/relógio via Media Session (`src/services/restMediaSessionService.js`).
- **O que falta construir (e caminho técnico):**
  - **Limitação da stack atual:** browsers/PWAs não instalam nem comunicam diretamente com apps nativos de relógio (`WatchConnectivity` / WearOS Data Layer).
  - **Caminho viável:** exige targets nativos watchOS (SwiftUI + `WatchKit` + HealthKit) e WearOS (Kotlin + Compose + Health Services) acoplados a um app host Capacitor/nativo com sync offline-first.

#### 15. Engine GPS de Alta Precisão com Auto-Pause Real (`PARCIAL`)
- **O que já existe reaproveitável:**
  - `GpsKalmanFilter2D`, `validateAndFilterGpsPoint` (descarte por precisão/salto de velocidade), `calculateRollingPace`, `computeSplits`, `simplifyRoute` (RDP), `estimateVO2Max`, `toGPX` em `src/utils/runningService.js`, `useRunGpsWatch.js`, `ghostPacer.js`, com testes unitários (`runningService.test.js`, `runSessionHelpers.test.js`, `ghostPacer.test.js`).
- **O que falta construir (e caminho técnico):**
  - **Bugs de Auto-Pause e Splits:** `autoPauseSpeedMs: 0.5` está definido em `runningService.js:20` mas **não é usado** — `RunningHub.jsx:328-340` só pausa por timeout de 6 s sem ponto GPS (confunde túnel/perda de sinal com paragem real e ignora `coords.speed`/velocidade filtrada); `computeSplits` (`runningService.js:374-428`) usa timestamps brutos sem descontar `accumulatedPausedMsRef`.
  - **Limitação da stack atual:** iOS Safari e Android Chrome suspendem `navigator.geolocation.watchPosition` com o ecrã bloqueado; `RunningHub.jsx:367-378` apenas ressincroniza o tempo ao voltar, perdendo a polilinha intermediária. GPS contínuo em background exige wrapper nativo (Capacitor Background Geolocation).

#### 16. Análise de Movimento On-Device (Visão Computacional) (`AUSENTE`)
- **O que já existe reaproveitável:**
  - Nenhuma infraestrutura de câmara em tempo real (`getUserMedia`), pose estimation, cálculo angular de ROM ou VBT no repositório (fotos de evolução em `BodyPortfolio.jsx` são uploads estáticos de ficheiro).
- **O que falta construir (e caminho técnico):**
  - Viável na stack atual sem upload de vídeo via `@mediapipe/tasks-vision` (PoseLandmarker com delegate GPU/WebGL/WebGPU) num Web Worker, calculando ângulos articulares (ROM), contagem de repetições e velocidade concêntrica estimada (VBT); em mobile de baixo consumo/alta frequência (60–120 fps), recomenda-se CoreML/Vision (iOS) e ML Kit/MediaPipe nativo (Android) via Capacitor.

---

### Domínio D — Retenção, Comunidade e Escala de Produto

#### 18. Marcos Atléticos no Lugar de Gamificação Infantil (`PARCIAL`)
- **O que já existe reaproveitável:**
  - `computeStreak` (`src/utils/streak.js`) com proteção a `isRestDay` e união ginásio+corrida; `STREAK_MILESTONES` (`src/utils/streakMilestones.js`, 3..365 dias), `getAthleteRank` (`src/utils/userVerification.js`), 16 badges (`src/data/badges.js` + `badgeRules.js`) e cálculo de top lifts (`src/utils/bodyPortfolio.js`).
- **O que falta construir:**
  - Adicionar **força relativa ao peso corporal** (ex.: `1.0×`, `1.5×`, `2.0× BW` no Supino/Agachamento/Terra em `badgeRules.js:74-99`, hoje fixo em 100 kg absolutos) e **marcos de tonelagem vitalícia acumulada** (50 t, 100 t, 500 t, 1.000 t — hoje só há marco de 5.000 kg numa sessão).
  - **Corrigir 3 bugs de streak:** (a) `ActiveWorkout.jsx:311,313` e `RunningHub.jsx:580,585` passam `WEEKLY_SCHEDULE` estático em vez do plano personalizado do utilizador; (b) `public.athlete_streak(uid)` (`20261109_social_profiles.sql:199-209`) ignora dias de descanso, ignora corridas e usa UTC; (c) `badgeRules.js:106-112` verifica contagem total e não dias consecutivos.
  - Sincronizar badges no Supabase (hoje só em `localStorage` `ab_fitness_unlocked_badges_v1`) e substituir elementos lúdicos (`canvas-confetti`, `early_bird`/`night_owl`) por marcos de performance atlética.

#### 19. Sessões Compartilhadas em Tempo Real (`AUSENTE`)
- **O que já existe reaproveitável:**
  - Módulo social (`SocialHub.jsx`, `HeadToHeadSheet.jsx`, `DirectMessageSheet.jsx`), tabela de perfis sociais no Supabase e `ghostPacer.js` (comparação local contra corrida passada).
- **O que falta construir:**
  - Infraestrutura **Supabase Realtime** (`supabase.channel` com Presence + Broadcast para treino em dupla ao vivo, séries/cargas partilhadas e acompanhamento de splits de corrida em tempo real) e migração do chat DM (`DirectMessageSheet.jsx:55-70`) do polling HTTP de 4 s para `postgres_changes`/Broadcast.

#### 20. Importação e Exportação Aberta de Dados (CSV, JSON, FIT) (`PARCIAL`)
- **O que já existe reaproveitável:**
  - Exportação GPX 1.1 individual por corrida (`toGPX`/`downloadGPX` em `src/utils/runningService.js:514-557`), gerador de relatório HTML/PDF pelo PT (`trainerService.js`) e exclusão GDPR (`accountService.js`).
- **O que falta construir:**
  - Exportação self-service completa em **JSON e CSV** (histórico de força, séries/RPE, PRs, métricas corporais, histórico de corridas e exportação GPX em lote — já prevista na política em `src/legal/privacidade.js:126`).
  - Parsers de importação de concorrentes (**Hevy CSV**, **Strong CSV**, **Strava CSV/GPX**) com mapeamento para os IDs do catálogo interno (`catalog.js`).
  - Encoder/decoder binário **`.FIT`** (Garmin/ANT+ SDK JS ou serviço serverless) para interoperabilidade completa com ecossistemas de endurance.

---

## 4. Plano de Ataque Recomendado (Sem Implementar Ainda)

### Onda 1 — Quick Wins (Alto impacto / Baixo esforço na stack atual)
1. **Corrigir bugs silenciosos de execução e fisiologia:**
   - Corrigir `prevIndex.get(exercise.id)` em `FocusExerciseCard.jsx` e `ExerciseListView.jsx` (#5 — desbloqueia memória de séries 2+ e drop-sets automaticamente).
   - Persistir `liveSwaps`, `RestTimer` e exercício focado no draft, e exibir banner "Retomar treino em curso" no `App.jsx`/`WeeklyDashboard.jsx` (#2).
   - Corrigir Ease Mode `−1 série` quando há pesos salvos e substituir `.includes()` por `regionsForExercise` (#8).
   - Passar o plano customizado do atleta ao cálculo de streak no cliente e alinhar `public.athlete_streak` no SQL (#18).
2. **Smart Swap de 1 toque e histórico real (#4):** acesso direto sem menu `...`, suporte no Modo Lista, filtro por padrão de movimento/tipo/equipamento + `excludeIds`, carregamento do histórico real (`prevIndex`) do substituto e remoção de séries órfãs.
3. **GPS Auto-Pause real + Cues sem quebrar música (#3, #6, #15):** ligar `autoPauseSpeedMs` + `coords.speed` em `RunningHub.jsx`, descontar pausas em `computeSplits`, desativar/tornar opt-in o loop de WAV silencioso que pausa Spotify/Apple Music no descanso e adicionar cues TTS opcionais no `RestTimer`.
4. **Portabilidade e Marcos Atléticos (#18, #20):** botão de exportação completa JSON/CSV do atleta, importador CSV Hevy/Strong e badges de força relativa (`× BW`) + tonelagem vitalícia sincronizados no Supabase.

### Onda 2 — Core Fisiológico & Arquitetura (Esforço médio/alto, diferencial real)
1. **Motor de ACWR e Guardrails de Lesão (#11):** cálculo determinístico 7d:28d / EWMA unificando força + corrida, alertas preventivos antes da sessão e integração direta no `RedFlagList.jsx` do Personal Trainer.
2. **Prontidão Própria + Periodização Híbrida Real (#8, #10):** check-in pré-treino rápido (3 toques) + baseline individual de HRV/sono reduzindo volume/carga automaticamente; plano periodizado de corridas (Z2/limiar/longão) integrado ao `sessionOrder`, cobertura de splits Full Body e reajuste dinâmico pós-corrida.
3. **Offline-First Unificado em IndexedDB (#1):** migrar histórico, corridas, planos e fila única com retry para todas as entidades (corridas, planos, cargas, check-ins), resolução de conflitos por timestamp e Background Sync API no Service Worker.
4. **Wearables Bidirecionais & Proxy Seguro (#13):** mover clientes OAuth/tokens de wearables para Edge Functions/Vercel API, ativar write-back para Strava (`activity:write`) e deduplicação multi-fonte de sessões/calorias.
5. **Tempo Real, Vídeos e Visão Computacional (#12, #16, #19):** sessões compartilhadas / dupla ao vivo + DMs via Supabase Realtime (`Presence`/`Broadcast`), upgrade da pipeline de vídeos (60 fps / WebM-AV1 + 30 exercícios em falta) e módulo opcional de ROM/VBT client-side com `@mediapipe/tasks-vision` em Web Worker.

### Onda 3 — Expansão Nativa & Ecossistema (Exige wrapper nativo / SDKs externos)
1. **Wrapper Nativo Capacitor sobre a base React/Vite:** empacotamento iOS e Android preservando ~95% do código web atual.
2. **Live Activities & Áudio/Hápticos Nativos (#3, #5, #6):** `ActivityKit` / Dynamic Island (iOS), `ForegroundService` (Android), *audio ducking* real (`AVAudioSession.duckOthers` / `AudioFocus`) e hápticos nativos (`UIImpactFeedbackGenerator`).
3. **HealthKit, Health Connect, GPS em Background e `.FIT` (#13, #15, #20):** leitura/escrita bidirecional com Apple HealthKit e Android Health Connect, `CoreLocation`/`FusedLocationProvider` contínuos com ecrã bloqueado e suporte nativo/SDK a `.FIT`.
4. **Apps Companion para Smartwatch (#14):** targets independentes em `watchOS` (SwiftUI + `WatchConnectivity`) e `WearOS` (Kotlin + Health Services) sincronizando séries, timer de descanso, FC e corridas autonomamente.
