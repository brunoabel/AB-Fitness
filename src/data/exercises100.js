/**
 * exercises100.js — Enciclopédia Completa de Exercícios • AB Fitness
 * Base de dados com mais de 300 exercícios estruturados com especificações biomecânicas:
 * Grupo muscular, mecânica (Composto / Isolado / Funcional / Alongamento), séries recomendadas, repetições e descanso ideal.
 */

import { HOME_EXERCISES } from './homeExercises.js';

/** Catálogo original (320). O script scripts/build_exercise_catalog.mjs lê esta lista. */
export const EXERCISES_BASE = [
  // --- BASE HISTÓRICA 1 A 100 ---
  { id: 1, nome: "Supino Reto com Barra", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 120, slug: "supino-reto-barra" },
  { id: 2, nome: "Supino Inclinado com Halteres", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "supino-inclinado-halteres" },
  { id: 3, nome: "Supino Declinado com Barra", grupo: "Peito", mecanica: "Composto", series: 3, reps: "8-12", descanso_seg: 90, slug: "supino-declinado-barra" },
  { id: 4, nome: "Crucifixo Reto com Halteres", grupo: "Peito", mecanica: "Isolado", series: 3, reps: "10-15", descanso_seg: 60, slug: "crucifixo-reto-halteres" },
  { id: 5, nome: "Crucifixo Inclinado com Halteres", grupo: "Peito", mecanica: "Isolado", series: 3, reps: "10-15", descanso_seg: 60, slug: "crucifixo-inclinado-halteres" },
  { id: 6, nome: "Crossover Polia Alta", grupo: "Peito", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "crossover-polia-alta" },
  { id: 7, nome: "Crossover Polia Média", grupo: "Peito", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "crossover-polia-media" },
  { id: 8, nome: "Crossover Polia Baixa", grupo: "Peito", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "crossover-polia-baixa" },
  { id: 9, nome: "Voador (Peck Deck)", grupo: "Peito", mecanica: "Isolado", series: 4, reps: "10-15", descanso_seg: 60, slug: "voador-peck-deck" },
  { id: 10, nome: "Pullover com Halter", grupo: "Peito", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "pullover-halter" },
  { id: 11, nome: "Flexão de Braço", grupo: "Peito", mecanica: "Composto", series: 3, reps: "Falha", descanso_seg: 60, slug: "flexao-de-braco" },
  { id: 12, nome: "Paralelas (Foco Peito)", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "paralelas-foco-peito" },
  { id: 13, nome: "Barra Fixa Pronada", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 120, slug: "barra-fixa-pronada" },
  { id: 14, nome: "Barra Fixa Supinada", grupo: "Costas", mecanica: "Composto", series: 3, reps: "8-12", descanso_seg: 90, slug: "barra-fixa-supinada" },
  { id: 15, nome: "Puxada Frontal Aberta", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "puxada-frontal-aberta" },
  { id: 16, nome: "Puxada com Triângulo", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "puxada-com-triangulo" },
  { id: 17, nome: "Remada Curvada com Barra", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 120, slug: "remada-curvada-barra" },
  { id: 18, nome: "Remada Cavalinho", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "remada-cavalinho" },
  { id: 19, nome: "Remada Unilateral (Serrote)", grupo: "Costas", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "remada-unilateral-serrote" },
  { id: 20, nome: "Remada Baixa no Cabo", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-15", descanso_seg: 60, slug: "remada-baixa-cabo" },
  { id: 21, nome: "Remada Articulada Máquina", grupo: "Costas", mecanica: "Composto", series: 3, reps: "8-12", descanso_seg: 90, slug: "remada-articulada-maquina" },
  { id: 22, nome: "Pulldown com Corda", grupo: "Costas", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "pulldown-com-corda" },
  { id: 23, nome: "Pulldown com Barra", grupo: "Costas", mecanica: "Isolado", series: 3, reps: "10-15", descanso_seg: 60, slug: "pulldown-com-barra" },
  { id: 24, nome: "Levantamento Terra (Deadlift)", grupo: "Costas", mecanica: "Composto", series: 4, reps: "5-8", descanso_seg: 180, slug: "levantamento-terra" },
  { id: 25, nome: "Extensão Lombar (Banco Romano)", grupo: "Costas", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "extensao-lombar-banco-romano" },
  { id: 26, nome: "Rack Pull", grupo: "Costas", mecanica: "Composto", series: 3, reps: "6-10", descanso_seg: 120, slug: "rack-pull" },
  { id: 27, nome: "Desenvolvimento Militar", grupo: "Ombros", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 120, slug: "desenvolvimento-militar" },
  { id: 28, nome: "Desenvolvimento com Halteres", grupo: "Ombros", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "desenvolvimento-com-halteres" },
  { id: 29, nome: "Desenvolvimento na Máquina", grupo: "Ombros", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "desenvolvimento-na-maquina" },
  { id: 30, nome: "Elevação Lateral com Halteres", grupo: "Ombros", mecanica: "Isolado", series: 4, reps: "12-20", descanso_seg: 60, slug: "elevacao-lateral-halteres" },
  { id: 31, nome: "Elevação Lateral na Polia", grupo: "Ombros", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "elevacao-lateral-polia" },
  { id: 32, nome: "Elevação Frontal com Halteres", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "10-15", descanso_seg: 60, slug: "elevacao-frontal-halteres" },
  { id: 33, nome: "Elevação Frontal na Polia", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "elevacao-frontal-polia" },
  { id: 34, nome: "Crucifixo Invertido com Halteres", grupo: "Ombros", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "crucifixo-invertido-halteres" },
  { id: 35, nome: "Crucifixo Invertido na Máquina", grupo: "Ombros", mecanica: "Isolado", series: 4, reps: "10-15", descanso_seg: 60, slug: "crucifixo-invertido-maquina" },
  { id: 36, nome: "Crucifixo Invertido na Polia", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "crucifixo-invertido-polia" },
  { id: 37, nome: "Face Pull", grupo: "Ombros", mecanica: "Composto", series: 4, reps: "12-15", descanso_seg: 60, slug: "face-pull" },
  { id: 38, nome: "Remada Alta", grupo: "Ombros", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "remada-alta" },
  { id: 39, nome: "Encolhimento com Barra", grupo: "Trapézio", mecanica: "Isolado", series: 4, reps: "12-20", descanso_seg: 60, slug: "encolhimento-com-barra" },
  { id: 40, nome: "Encolhimento com Halteres", grupo: "Trapézio", mecanica: "Isolado", series: 4, reps: "12-20", descanso_seg: 60, slug: "encolhimento-com-halteres" },
  { id: 41, nome: "Rosca Direta com Barra", grupo: "Bíceps", mecanica: "Isolado", series: 4, reps: "8-12", descanso_seg: 90, slug: "rosca-direta-barra" },
  { id: 42, nome: "Rosca Alternada", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-alternada" },
  { id: 43, nome: "Rosca Martelo com Halteres", grupo: "Bíceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 90, slug: "rosca-martelo-halteres" },
  { id: 44, nome: "Rosca Martelo na Corda", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "rosca-martelo-corda" },
  { id: 45, nome: "Rosca Scott com Barra W", grupo: "Bíceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 90, slug: "rosca-scott-barra-w" },
  { id: 46, nome: "Rosca Scott na Máquina", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "rosca-scott-maquina" },
  { id: 47, nome: "Rosca Concentrada", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-concentrada" },
  { id: 48, nome: "Rosca Inversa", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "rosca-inversa" },
  { id: 49, nome: "Rosca na Polia Baixa", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "rosca-polia-baixa" },
  { id: 50, nome: "Rosca Aranha (Spider Curl)", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-aranha-spider-curl" },
  { id: 51, nome: "Tríceps Testa com Barra W", grupo: "Tríceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 90, slug: "triceps-testa-barra-w" },
  { id: 52, nome: "Tríceps Pulley (Barra Reta)", grupo: "Tríceps", mecanica: "Isolado", series: 4, reps: "10-15", descanso_seg: 60, slug: "triceps-pulley-barra-reta" },
  { id: 53, nome: "Tríceps Corda", grupo: "Tríceps", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "triceps-corda" },
  { id: 54, nome: "Tríceps Francês com Halter", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 90, slug: "triceps-frances-halter" },
  { id: 55, nome: "Tríceps Francês na Polia", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "triceps-frances-polia" },
  { id: 56, nome: "Extensão Unilateral na Polia", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "extensao-unilateral-polia" },
  { id: 57, nome: "Tríceps Coice com Halter", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "triceps-coice-halter" },
  { id: 58, nome: "Tríceps Coice na Polia", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "triceps-coice-polia" },
  { id: 59, nome: "Supino Fechado", grupo: "Tríceps", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 120, slug: "supino-fechado" },
  { id: 60, nome: "Mergulho no Banco", grupo: "Tríceps", mecanica: "Composto", series: 3, reps: "Falha", descanso_seg: 60, slug: "mergulho-no-banco" },
  { id: 61, nome: "Agachamento Livre", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 180, slug: "agachamento-livre" },
  { id: 62, nome: "Agachamento no Smith", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 120, slug: "agachamento-smith" },
  { id: 63, nome: "Agachamento Frontal", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "8-10", descanso_seg: 120, slug: "agachamento-frontal" },
  { id: 64, nome: "Agachamento Búlgaro", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "agachamento-bulgaro" },
  { id: 65, nome: "Leg Press 45°", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "10-15", descanso_seg: 120, slug: "leg-press-45" },
  { id: 66, nome: "Leg Press Horizontal", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "12-15", descanso_seg: 90, slug: "leg-press-horizontal" },
  { id: 67, nome: "Cadeira Extensora", grupo: "Quadríceps", mecanica: "Isolado", series: 4, reps: "12-20", descanso_seg: 60, slug: "cadeira-extensora" },
  { id: 68, nome: "Passada (Walking Lunges)", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "12-15", descanso_seg: 90, slug: "passada-walking-lunges" },
  { id: 69, nome: "Afundo com Halteres", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "afundo-com-halteres" },
  { id: 70, nome: "Sissy Squat", grupo: "Quadríceps", mecanica: "Isolado", series: 3, reps: "10-15", descanso_seg: 60, slug: "sissy-squat" },
  { id: 71, nome: "Stiff com Barra", grupo: "Posteriores", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 120, slug: "stiff-com-barra" },
  { id: 72, nome: "Stiff com Halteres", grupo: "Posteriores", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "stiff-com-halteres" },
  { id: 73, nome: "Levantamento Terra Romeno (RDL)", grupo: "Posteriores", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 120, slug: "terra-romeno-rdl" },
  { id: 74, nome: "Cadeira Flexora", grupo: "Posteriores", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "cadeira-flexora" },
  { id: 75, nome: "Mesa Flexora", grupo: "Posteriores", mecanica: "Isolado", series: 4, reps: "10-15", descanso_seg: 60, slug: "mesa-flexora" },
  { id: 76, nome: "Flexora em Pé Unilateral", grupo: "Posteriores", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "flexora-em-pe-unilateral" },
  { id: 77, nome: "Good Morning", grupo: "Posteriores", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "good-morning" },
  { id: 78, nome: "Elevação Pélvica (Hip Thrust)", grupo: "Glúteos", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 120, slug: "elevacao-pelvica-hip-thrust" },
  { id: 79, nome: "Elevação Pélvica na Máquina", grupo: "Glúteos", mecanica: "Composto", series: 3, reps: "10-15", descanso_seg: 90, slug: "elevacao-pelvica-maquina" },
  { id: 80, nome: "Glúteo na Polia Baixa", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "gluteo-polia-baixa" },
  { id: 81, nome: "Cadeira Abdutora", grupo: "Glúteos", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 60, slug: "cadeira-abdutora" },
  { id: 82, nome: "Cadeira Adutora", grupo: "Adutores", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 60, slug: "cadeira-adutora" },
  { id: 83, nome: "Agachamento Sumô", grupo: "Glúteos", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "agachamento-sumo" },
  { id: 84, nome: "Gêmeos em Pé na Máquina", grupo: "Panturrilhas", mecanica: "Isolado", series: 4, reps: "12-20", descanso_seg: 60, slug: "gemeos-em-pe-maquina" },
  { id: 85, nome: "Gêmeos Sentado", grupo: "Panturrilhas", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 60, slug: "gemeos-sentado" },
  { id: 86, nome: "Gêmeos no Leg Press", grupo: "Panturrilhas", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "gemeos-leg-press" },
  { id: 87, nome: "Gêmeos no Smith", grupo: "Panturrilhas", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "gemeos-smith" },
  { id: 88, nome: "Elevação Unilateral de Panturrilha", grupo: "Panturrilhas", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "elevacao-unilateral-panturrilha" },
  { id: 89, nome: "Gêmeos no Hack", grupo: "Panturrilhas", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "gemeos-hack" },
  { id: 90, nome: "Crunch (Abdominal Clássico)", grupo: "Abdômen", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 60, slug: "crunch-abdominal-classico" },
  { id: 91, nome: "Crunch na Polia", grupo: "Abdômen", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "crunch-polia" },
  { id: 92, nome: "Elevação de Pernas em Suspensão", grupo: "Abdômen", mecanica: "Isolado", series: 4, reps: "10-15", descanso_seg: 60, slug: "elevacao-pernas-suspensao" },
  { id: 93, nome: "Elevação de Pernas Deitado", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "elevacao-pernas-deitado" },
  { id: 94, nome: "Abdominal Infra Reverso", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "abdominal-infra-reverso" },
  { id: 95, nome: "Prancha Isométrica", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "60s", descanso_seg: 60, slug: "prancha-isometrica" },
  { id: 96, nome: "Roda Abdominal (Ab Wheel)", grupo: "Abdômen", mecanica: "Composto", series: 3, reps: "10-15", descanso_seg: 90, slug: "roda-abdominal-ab-wheel" },
  { id: 97, nome: "Abdominal Russo (Russian Twist)", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "20", descanso_seg: 60, slug: "abdominal-russo-russian-twist" },
  { id: 98, nome: "Máquina de Abdominal", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "maquina-abdominal" },
  { id: 99, nome: "Flexão de Punho com Barra", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "flexao-punho-barra" },
  { id: 100, nome: "Extensão de Punho com Barra", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "extensao-punho-barra" },

  // --- EXPANSÃO ENCICLOPÉDICA: +220 NOVOS EXERCÍCIOS (IDs 101 A 320) ---
  
  // === PEITORAL (EXPANSÃO) ===
  { id: 101, nome: "Supino Inclinado com Barra", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 120, slug: "supino-inclinado-barra" },
  { id: 102, nome: "Supino Reto no Smith", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "supino-reto-smith" },
  { id: 103, nome: "Supino Inclinado no Smith", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "supino-inclinado-smith" },
  { id: 104, nome: "Supino Declinado com Halteres", grupo: "Peito", mecanica: "Composto", series: 3, reps: "8-12", descanso_seg: 90, slug: "supino-declinado-halteres" },
  { id: 105, nome: "Supino Declinado no Smith", grupo: "Peito", mecanica: "Composto", series: 3, reps: "8-12", descanso_seg: 90, slug: "supino-declinado-smith" },
  { id: 106, nome: "Supino no Chão com Halteres (Floor Press)", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "supino-chao-floor-press-halteres" },
  { id: 107, nome: "Supino no Chão com Barra (Barbell Floor Press)", grupo: "Peito", mecanica: "Composto", series: 4, reps: "6-8", descanso_seg: 120, slug: "supino-chao-barra" },
  { id: 108, nome: "Supino com Pegada Neutra com Halteres", grupo: "Peito", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "supino-pegada-neutra-halteres" },
  { id: 109, nome: "Supino Articulado Máquina Reto", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "supino-articulado-maquina-reto" },
  { id: 110, nome: "Supino Articulado Máquina Inclinado", grupo: "Peito", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "supino-articulado-maquina-inclinado" },
  { id: 111, nome: "Supino Articulado Máquina Declinado", grupo: "Peito", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "supino-articulado-maquina-declinado" },
  { id: 112, nome: "Chest Press Sentado Convergente", grupo: "Peito", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "chest-press-convergente" },
  { id: 113, nome: "Crucifixo Declinado com Halteres", grupo: "Peito", mecanica: "Isolado", series: 3, reps: "10-15", descanso_seg: 60, slug: "crucifixo-declinado-halteres" },
  { id: 114, nome: "Crucifixo Inclinado na Polia", grupo: "Peito", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "crucifixo-inclinado-polia" },
  { id: 115, nome: "Crucifixo Reto na Polia no Banco", grupo: "Peito", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "crucifixo-reto-polia-banco" },
  { id: 116, nome: "Flexão Diamante", grupo: "Peito", mecanica: "Composto", series: 3, reps: "Falha", descanso_seg: 60, slug: "flexao-diamante" },
  { id: 117, nome: "Flexão Declinada com Pés Elevados", grupo: "Peito", mecanica: "Composto", series: 3, reps: "10-15", descanso_seg: 60, slug: "flexao-declinada-pes-elevados" },
  { id: 118, nome: "Flexão Inclinada com Mãos Elevadas", grupo: "Peito", mecanica: "Composto", series: 3, reps: "12-15", descanso_seg: 60, slug: "flexao-inclinada-maos-elevadas" },
  { id: 119, nome: "Flexão com Déficit em Blocos", grupo: "Peito", mecanica: "Composto", series: 3, reps: "Falha", descanso_seg: 90, slug: "flexao-deficit-blocos" },
  { id: 120, nome: "Spoto Press com Pausa no Supino", grupo: "Peito", mecanica: "Composto", series: 4, reps: "6-8", descanso_seg: 120, slug: "spoto-press-supino" },
  { id: 121, nome: "Larsen Press (Supino sem Apoio dos Pés)", grupo: "Peito", mecanica: "Composto", series: 3, reps: "8-10", descanso_seg: 90, slug: "larsen-press-sem-pes" },
  { id: 122, nome: "Svend Press com Anilha", grupo: "Peito", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "svend-press-anilha" },

  // === COSTAS & DORSAIS (EXPANSÃO) ===
  { id: 123, nome: "Barra Fixa com Pegada Neutra", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 120, slug: "barra-fixa-pegada-neutra" },
  { id: 124, nome: "Barra Fixa com Carga Adicional", grupo: "Costas", mecanica: "Composto", series: 4, reps: "5-8", descanso_seg: 180, slug: "barra-fixa-carga-adicional" },
  { id: 125, nome: "Puxada com Pegada Supinada (Underhand)", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "puxada-pegada-supinada" },
  { id: 126, nome: "Puxada com Pegada Neutra Paralela", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "puxada-pegada-neutra-paralela" },
  { id: 127, nome: "Puxada Unilateral na Polia Alta", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 60, slug: "puxada-unilateral-polia-alta" },
  { id: 128, nome: "Puxada Atrás da Nuca na Polia", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "puxada-atras-nuca" },
  { id: 129, nome: "Puxada com Braços Retos na Polia (Straight-Arm)", grupo: "Costas", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "puxada-bracos-retos-straight-arm" },
  { id: 130, nome: "Remada Baixa Unilateral na Polia", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 60, slug: "remada-baixa-unilateral-polia" },
  { id: 131, nome: "Remada Curvada com Halteres", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "remada-curvada-halteres" },
  { id: 132, nome: "Remada Apoiada no Banco Inclinado com Halteres", grupo: "Costas", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "remada-apoiada-banco-inclinado-halteres" },
  { id: 133, nome: "Remada Seal Row no Banco Reto", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "remada-seal-row-banco" },
  { id: 134, nome: "Remada Pendlay do Solo", grupo: "Costas", mecanica: "Composto", series: 4, reps: "6-8", descanso_seg: 120, slug: "remada-pendlay-solo" },
  { id: 135, nome: "Remada Yates Supinada com Barra", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "remada-yates-supinada" },
  { id: 136, nome: "Remada Curvada no Smith", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "remada-curvada-smith" },
  { id: 137, nome: "Remada Cavalinho Unilateral", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 60, slug: "remada-cavalinho-unilateral" },
  { id: 138, nome: "Remada Kroc com Halter Pesado", grupo: "Costas", mecanica: "Composto", series: 3, reps: "15-20", descanso_seg: 90, slug: "remada-kroc-row-halter" },
  { id: 139, nome: "Remada Meadows com Barra T", grupo: "Costas", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "remada-meadows-barra-t" },
  { id: 140, nome: "Remada Articulada Pegada Neutra", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "remada-articulada-pegada-neutra" },
  { id: 141, nome: "Remada Articulada Pegada Aberta", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "remada-articulada-pegada-aberta" },
  { id: 142, nome: "Puxada Articulada Unilateral na Máquina", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 60, slug: "puxada-articulada-unilateral-maquina" },
  { id: 143, nome: "Levantamento Terra Sumô", grupo: "Costas", mecanica: "Composto", series: 4, reps: "5-8", descanso_seg: 180, slug: "levantamento-terra-sumo" },
  { id: 144, nome: "Levantamento Terra com Barra Hexagonal (Trap Bar)", grupo: "Costas", mecanica: "Composto", series: 4, reps: "5-8", descanso_seg: 180, slug: "terra-trap-bar-hexagonal" },
  { id: 145, nome: "Barra Australiana Invertida (Inverted Row)", grupo: "Costas", mecanica: "Composto", series: 3, reps: "10-15", descanso_seg: 60, slug: "barra-australiana-inverted-row" },
  { id: 146, nome: "Hiperextensão Lombar no Banco 45° com Peso", grupo: "Costas", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "hiperextensao-lombar-45-peso" },

  // === OMBROS & DELTOIDES (EXPANSÃO) ===
  { id: 147, nome: "Desenvolvimento Arnold com Halteres", grupo: "Ombros", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "desenvolvimento-arnold" },
  { id: 148, nome: "Desenvolvimento no Smith", grupo: "Ombros", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "desenvolvimento-smith" },
  { id: 149, nome: "Push Press com Barra", grupo: "Ombros", mecanica: "Composto", series: 4, reps: "5-8", descanso_seg: 120, slug: "push-press-barra" },
  { id: 150, nome: "Desenvolvimento Unilateral em Pé com Halter", grupo: "Ombros", mecanica: "Composto", series: 3, reps: "8-10", descanso_seg: 60, slug: "desenvolvimento-unilateral-em-pe-halter" },
  { id: 151, nome: "Elevação Lateral no Banco Inclinado", grupo: "Ombros", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "elevacao-lateral-banco-inclinado" },
  { id: 152, nome: "Elevação Lateral Deitado de Lado no Banco", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "elevacao-lateral-deitado-lado" },
  { id: 153, nome: "Elevação Lateral Unilateral na Polia por Trás", grupo: "Ombros", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "elevacao-lateral-polia-por-tras" },
  { id: 154, nome: "Elevação Lateral na Máquina Articulada", grupo: "Ombros", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "elevacao-lateral-maquina-articulada" },
  { id: 155, nome: "Elevação Frontal com Barra Reta", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "elevacao-frontal-barra-reta" },
  { id: 156, nome: "Elevação Frontal com Anilha (Plate Raise)", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "elevacao-frontal-anilha-plate-raise" },
  { id: 157, nome: "Elevação Frontal Alternada com Halteres", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "elevacao-frontal-alternada-halteres" },
  { id: 158, nome: "Elevação Frontal com Corda na Polia Baixa", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "elevacao-frontal-corda-polia-baixa" },
  { id: 159, nome: "Elevação Y no Banco Inclinado (Y-Raise)", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "elevacao-y-raise-banco-inclinado" },
  { id: 160, nome: "Crucifixo Invertido no Banco Inclinado com Halteres", grupo: "Ombros", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "crucifixo-invertido-banco-inclinado-halteres" },
  { id: 161, nome: "Pássaro com Halteres em Pé", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "passaro-halteres-em-pe" },
  { id: 162, nome: "Face Pull na Polia Alta com Pegada Neutra Dupla", grupo: "Ombros", mecanica: "Composto", series: 4, reps: "12-15", descanso_seg: 60, slug: "face-pull-polia-alta-pegada-dupla" },
  { id: 163, nome: "Remada Alta com Halteres", grupo: "Ombros", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "remada-alta-halteres" },
  { id: 164, nome: "Remada Alta na Polia Baixa", grupo: "Ombros", mecanica: "Composto", series: 3, reps: "12-15", descanso_seg: 60, slug: "remada-alta-polia-baixa" },
  { id: 165, nome: "Rotação Externa de Ombro na Polia (Manguito Rotador)", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "rotacao-externa-ombro-polia-manguito" },
  { id: 166, nome: "Rotação Interna de Ombro na Polia (Manguito Rotador)", grupo: "Ombros", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "rotacao-interna-ombro-polia-manguito" },

  // === TRAPÉZIO (EXPANSÃO) ===
  { id: 167, nome: "Encolhimento no Smith", grupo: "Trapézio", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "encolhimento-smith" },
  { id: 168, nome: "Encolhimento na Polia Baixa", grupo: "Trapézio", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "encolhimento-polia-baixa" },
  { id: 169, nome: "Encolhimento com Barra por Trás (Lee Haney Shrug)", grupo: "Trapézio", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "encolhimento-barra-por-tras-haney" },
  { id: 170, nome: "Encolhimento na Barra Hexagonal Trap Bar", grupo: "Trapézio", mecanica: "Isolado", series: 4, reps: "10-15", descanso_seg: 60, slug: "encolhimento-trap-bar-hexagonal" },

  // === BÍCEPS (EXPANSÃO) ===
  { id: 171, nome: "Rosca Direta com Halteres", grupo: "Bíceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 60, slug: "rosca-direta-halteres" },
  { id: 172, nome: "Rosca no Banco Inclinado 45° com Halteres", grupo: "Bíceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 75, slug: "rosca-banco-inclinado-45-halteres" },
  { id: 173, nome: "Rosca Scott Unilateral com Halter", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-scott-unilateral-halter" },
  { id: 174, nome: "Rosca 21 com Barra W", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "21", descanso_seg: 90, slug: "rosca-21-barra-w" },
  { id: 175, nome: "Rosca Drag com Barra (Drag Curl)", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-drag-curl-barra" },
  { id: 176, nome: "Rosca Zottman com Halteres", grupo: "Bíceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 60, slug: "rosca-zottman-halteres" },
  { id: 177, nome: "Rosca Martelo no Banco Inclinado", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-martelo-banco-inclinado" },
  { id: 178, nome: "Rosca Martelo Cruzada no Peito (Cross-Body)", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-martelo-cruzada-cross-body" },
  { id: 179, nome: "Rosca Concentrada na Polia Baixa", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "rosca-concentrada-polia-baixa" },
  { id: 180, nome: "Rosca no Crossover Duplo Bíceps (High Cable Curl)", grupo: "Bíceps", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "rosca-crossover-duplo-biceps" },
  { id: 181, nome: "Rosca com Barra Reta Pegada Aberta", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-barra-reta-pegada-aberta" },
  { id: 182, nome: "Rosca com Barra Reta Pegada Fechada", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "rosca-barra-reta-pegada-fechada" },
  { id: 183, nome: "Rosca Scott na Polia com Barra", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "rosca-scott-polia-barra" },
  { id: 184, nome: "Rosca Inversa na Polia com Barra", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "rosca-inversa-polia-barra" },
  { id: 185, nome: "Rosca Bayesiana na Polia Baixa (Bayesian Curl)", grupo: "Bíceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 60, slug: "rosca-bayesiana-polia-bayesian-curl" },
  { id: 186, nome: "Rosca Garçom com Anilha (Waiter Curl)", grupo: "Bíceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "rosca-garcom-anilha-waiter-curl" },

  // === ANTEBRAÇOS & PEGADA (EXPANSÃO) ===
  { id: 187, nome: "Flexão de Punho com Halteres", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "flexao-punho-halteres" },
  { id: 188, nome: "Extensão de Punho com Halteres", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "extensao-punho-halteres" },
  { id: 189, nome: "Rosca de Punho Inversa no Banco com Barra", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "rosca-punho-inversa-banco-barra" },
  { id: 190, nome: "Rolo de Punho com Peso (Wrist Roller)", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "3 subidas", descanso_seg: 60, slug: "rolo-punho-wrist-roller" },
  { id: 191, nome: "Suspensão Isométrica na Barra Fixa (Dead Hang)", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "45-60s", descanso_seg: 60, slug: "suspensao-dead-hang-barra-fixa" },
  { id: 192, nome: "Pinçamento de Dedos com Anilhas (Pinch Grip)", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "30s", descanso_seg: 45, slug: "pincamento-pinch-grip-anilhas" },
  { id: 193, nome: "Caminhada do Fazendeiro com Halteres (Farmer's Walk)", grupo: "Antebraços", mecanica: "Funcional", series: 3, reps: "40 metros", descanso_seg: 90, slug: "caminhada-fazendeiro-farmers-walk" },
  { id: 194, nome: "Flexão de Punho na Polia Baixa com Barra", grupo: "Antebraços", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "flexao-punho-polia-baixa-barra" },

  // === TRÍCEPS (EXPANSÃO) ===
  { id: 195, nome: "Tríceps Testa com Halteres no Banco Reto", grupo: "Tríceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 75, slug: "triceps-testa-halteres-banco-reto" },
  { id: 196, nome: "Tríceps Testa no Banco Declinado com Barra W", grupo: "Tríceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 75, slug: "triceps-testa-banco-declinado-barra-w" },
  { id: 197, nome: "Tríceps Testa na Polia Baixa com Corda", grupo: "Tríceps", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "triceps-testa-polia-baixa-corda" },
  { id: 198, nome: "Tríceps Francês Sentado com Barra W", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 75, slug: "triceps-frances-sentado-barra-w" },
  { id: 199, nome: "Tríceps Francês Unilateral com Halter", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "triceps-frances-unilateral-halter" },
  { id: 200, nome: "Tríceps Francês com Corda na Polia Baixa", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "triceps-frances-corda-polia-baixa" },
  { id: 201, nome: "Tríceps Katana na Polia (Overhead Cable Extension)", grupo: "Tríceps", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "triceps-katana-polia-overhead" },
  { id: 202, nome: "Tríceps Pulley com Barra V", grupo: "Tríceps", mecanica: "Isolado", series: 4, reps: "10-12", descanso_seg: 60, slug: "triceps-pulley-barra-v" },
  { id: 203, nome: "Tríceps Pulley Inverso com Pegada Supinada", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "triceps-pulley-inverso-supinado" },
  { id: 204, nome: "Tríceps Coice na Polia Baixa Unilateral sem Pegador", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 45, slug: "triceps-coice-polia-unilateral" },
  { id: 205, nome: "JM Press com Barra no Smith", grupo: "Tríceps", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "jm-press-barra-smith" },
  { id: 206, nome: "JM Press com Barra W Livre", grupo: "Tríceps", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "jm-press-barra-w-livre" },
  { id: 207, nome: "Paralelas com Foco em Tríceps (Corpo Vertical)", grupo: "Tríceps", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "paralelas-foco-triceps-vertical" },
  { id: 208, nome: "Paralelas com Carga Adicional no Cinto", grupo: "Tríceps", mecanica: "Composto", series: 4, reps: "6-8", descanso_seg: 120, slug: "paralelas-carga-adicional" },
  { id: 209, nome: "Tate Press no Banco Reto com Halteres", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "tate-press-banco-reto-halteres" },
  { id: 210, nome: "California Press no Banco Reto com Barra", grupo: "Tríceps", mecanica: "Composto", series: 3, reps: "8-10", descanso_seg: 90, slug: "california-press-barra" },
  { id: 211, nome: "Extensão Unilateral de Tríceps com Halter Deitado", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 45, slug: "extensao-unilateral-triceps-halter-deitado" },
  { id: 212, nome: "Mergulho na Máquina Articulada de Tríceps", grupo: "Tríceps", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 75, slug: "mergulho-maquina-articulada-triceps" },
  { id: 213, nome: "Tríceps Pulley com Pegada Neutra (Corda Dupla)", grupo: "Tríceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "triceps-pulley-pegada-neutra-corda-dupla" },
  { id: 214, nome: "Flexão Fechada no Chão com Isometria", grupo: "Tríceps", mecanica: "Composto", series: 3, reps: "Falha", descanso_seg: 60, slug: "flexao-fechada-chao-isometria" },

  // === QUADRÍCEPS (EXPANSÃO) ===
  { id: 215, nome: "Agachamento Hack na Máquina (Hack Squat)", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 120, slug: "agachamento-hack-maquina" },
  { id: 216, nome: "Agachamento Zercher com Barra", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "6-8", descanso_seg: 120, slug: "agachamento-zercher-barra" },
  { id: 217, nome: "Agachamento Taça com Halter ou Kettlebell (Goblet Squat)", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "10-15", descanso_seg: 75, slug: "agachamento-taca-goblet-squat" },
  { id: 218, nome: "Agachamento Sumô com Halter Pesado", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "agachamento-sumo-halter-pesado" },
  { id: 219, nome: "Agachamento Búlgaro no Smith", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "agachamento-bulgaro-smith" },
  { id: 220, nome: "Agachamento Pistola Unilateral (Pistol Squat)", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "6-8", descanso_seg: 90, slug: "agachamento-pistola-pistol-squat" },
  { id: 221, nome: "Passada com Barra nas Costas (Walking Lunge)", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "12-15", descanso_seg: 90, slug: "passada-barra-costas-walking-lunge" },
  { id: 222, nome: "Afundo com Barra no Smith", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "afundo-barra-smith" },
  { id: 223, nome: "Afundo Reverso com Halteres (Reverse Lunge)", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 75, slug: "afundo-reverso-halteres" },
  { id: 224, nome: "Afundo Lateral (Cossack Squat)", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 60, slug: "afundo-lateral-cossack-squat" },
  { id: 225, nome: "Step-Up na Caixa com Halteres (Subida no Banco)", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 75, slug: "step-up-caixa-halteres" },
  { id: 226, nome: "Step-Up no Smith", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 75, slug: "step-up-smith" },
  { id: 227, nome: "Cadeira Extensora Unilateral", grupo: "Quadríceps", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "cadeira-extensora-unilateral" },
  { id: 228, nome: "Leg Press 45° Unilateral", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 90, slug: "leg-press-45-unilateral" },
  { id: 229, nome: "Leg Press Vertical na Máquina", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 120, slug: "leg-press-vertical-maquina" },
  { id: 230, nome: "Agachamento com Pausa de 3s no Fundo (Pause Squat)", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "6-8", descanso_seg: 150, slug: "agachamento-pausa-fundo" },
  { id: 231, nome: "Belt Squat (Agachamento com Cinto)", grupo: "Quadríceps", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "belt-squat-cinto" },
  { id: 232, nome: "Agachamento Isométrico na Parede (Wall Sit)", grupo: "Quadríceps", mecanica: "Isolado", series: 3, reps: "45-60s", descanso_seg: 60, slug: "agachamento-isometrico-parede-wall-sit" },
  { id: 233, nome: "Sissy Squat com Carga no Peito", grupo: "Quadríceps", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "sissy-squat-carga-peito" },
  { id: 234, nome: "Agachamento OverHead com Barra (Overhead Squat)", grupo: "Quadríceps", mecanica: "Composto", series: 3, reps: "8-10", descanso_seg: 120, slug: "agachamento-overhead-barra" },

  // === POSTERIORES DE COXA (EXPANSÃO) ===
  { id: 235, nome: "Levantamento Terra Romeno (RDL) com Halteres", grupo: "Posteriores", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "terra-romeno-rdl-halteres" },
  { id: 236, nome: "RDL Unilateral com Halter (Single-Leg RDL)", grupo: "Posteriores", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 60, slug: "rdl-unilateral-halter-single-leg" },
  { id: 237, nome: "RDL no Smith com Calço nos Calcanhares", grupo: "Posteriores", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 90, slug: "rdl-smith-calco" },
  { id: 238, nome: "Stiff com Déficit sobre Bloco de Madeira", grupo: "Posteriores", mecanica: "Composto", series: 4, reps: "8-10", descanso_seg: 120, slug: "stiff-deficit-bloco" },
  { id: 239, nome: "Flexão Nórdica para Isquiotibiais (Nordic Hamstring)", grupo: "Posteriores", mecanica: "Isolado", series: 3, reps: "6-8", descanso_seg: 120, slug: "flexao-nordica-nordic-hamstring" },
  { id: 240, nome: "Mesa Flexora Unilateral", grupo: "Posteriores", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "mesa-flexora-unilateral" },
  { id: 241, nome: "Cadeira Flexora Unilateral", grupo: "Posteriores", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "cadeira-flexora-unilateral" },
  { id: 242, nome: "Flexora de Pernas com Bola Suíça", grupo: "Posteriores", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "flexora-bola-suica" },
  { id: 243, nome: "Flexora na Polia Baixa Unilateral em Pé", grupo: "Posteriores", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 45, slug: "flexora-polia-baixa-unilateral" },
  { id: 244, nome: "Good Morning Sentado no Banco", grupo: "Posteriores", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 75, slug: "good-morning-sentado-banco" },
  { id: 245, nome: "Glute Ham Raise (GHR Máquina)", grupo: "Posteriores", mecanica: "Composto", series: 3, reps: "8-10", descanso_seg: 90, slug: "glute-ham-raise-ghr" },

  // === GLÚTEOS & QUADRIL (EXPANSÃO) ===
  { id: 246, nome: "Elevação Pélvica (Hip Thrust) com Halter Pesado", grupo: "Glúteos", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "elevacao-pelvica-hip-thrust-halter" },
  { id: 247, nome: "Hip Thrust Unilateral no Chão ou Banco", grupo: "Glúteos", mecanica: "Composto", series: 3, reps: "10-12", descanso_seg: 60, slug: "hip-thrust-unilateral-chao-banco" },
  { id: 248, nome: "Hip Thrust no Smith", grupo: "Glúteos", mecanica: "Composto", series: 4, reps: "8-12", descanso_seg: 90, slug: "hip-thrust-smith" },
  { id: 249, nome: "Ponte de Glúteos no Solo com Barra (Glute Bridge)", grupo: "Glúteos", mecanica: "Composto", series: 4, reps: "12-15", descanso_seg: 75, slug: "ponte-gluteos-barra-glute-bridge" },
  { id: 250, nome: "Ponte de Glúteos Unilateral", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 45, slug: "ponte-gluteos-unilateral" },
  { id: 251, nome: "Glúteo Coice no Cabo com Caneleira (Cable Kickback)", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 45, slug: "gluteo-coice-cabo-kickback" },
  { id: 252, nome: "Glúteo 4 Apoios com Caneleira Pesada", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "gluteo-4-apoios-caneleira" },
  { id: 253, nome: "Coice no Smith (Donkey Kick no Smith)", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "coice-donkey-kick-smith" },
  { id: 254, nome: "Cadeira Abdutora com Tronco Inclinado à Frente", grupo: "Glúteos", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 45, slug: "cadeira-abdutora-tronco-inclinado" },
  { id: 255, nome: "Abdução de Quadril na Polia Baixa em Pé", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 45, slug: "abducao-quadril-polia-baixa" },
  { id: 256, nome: "Monster Walk Lateral com Mini Band", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "20 passos", descanso_seg: 45, slug: "monster-walk-lateral-mini-band" },
  { id: 257, nome: "Clamshell com Mini Band no Colchonete (Ostra)", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "clamshell-ostra-mini-band" },
  { id: 258, nome: "Agachamento Búlgaro com Foco em Glúteo (Tronco Inclinado)", grupo: "Glúteos", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "agachamento-bulgaro-foco-gluteo" },
  { id: 259, nome: "Frog Pump no Colchonete com Halter", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "20", descanso_seg: 45, slug: "frog-pump-colchonete-halter" },
  { id: 260, nome: "Hiperextensão 45° com Foco em Glúteo (Arredondamento Lombar)", grupo: "Glúteos", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "hiperextensao-45-foco-gluteo" },

  // === PANTURRILHAS & ADUTORES (EXPANSÃO) ===
  { id: 261, nome: "Gêmeos Sentado com Halter sobre os Joelhos", grupo: "Panturrilhas", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 45, slug: "gemeos-sentado-halter-joelhos" },
  { id: 262, nome: "Gêmeos Donkey (Donkey Calf Raise / Burrinho)", grupo: "Panturrilhas", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 60, slug: "gemeos-donkey-calf-raise" },
  { id: 263, nome: "Gêmeos no Step com Halteres", grupo: "Panturrilhas", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 45, slug: "gemeos-step-halteres" },
  { id: 264, nome: "Gêmeos Unilateral no Step sem Carga", grupo: "Panturrilhas", mecanica: "Isolado", series: 3, reps: "20", descanso_seg: 30, slug: "gemeos-unilateral-step-sem-carga" },
  { id: 265, nome: "Gêmeos no Leg Press Horizontal", grupo: "Panturrilhas", mecanica: "Isolado", series: 4, reps: "12-15", descanso_seg: 60, slug: "gemeos-leg-press-horizontal" },
  { id: 266, nome: "Panturrilha no Agachamento Smith", grupo: "Panturrilhas", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 60, slug: "panturrilha-agachamento-smith" },
  { id: 267, nome: "Dorsiflexão Tibial Anterior com Halter", grupo: "Panturrilhas", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "dorsiflexao-tibial-anterior-halter" },
  { id: 268, nome: "Tibial Anterior na Polia com Alça", grupo: "Panturrilhas", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "tibial-anterior-polia-alca" },
  { id: 269, nome: "Cadeira Adutora com Isometria no Final", grupo: "Adutores", mecanica: "Isolado", series: 4, reps: "15-20", descanso_seg: 60, slug: "cadeira-adutora-isometria" },
  { id: 270, nome: "Adução de Quadril na Polia Baixa em Pé", grupo: "Adutores", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "aducao-quadril-polia-baixa" },
  { id: 271, nome: "Prancha Copenhagen", grupo: "Adutores", mecanica: "Isolado", series: 3, reps: "30-45s", descanso_seg: 60, slug: "prancha-copenhagen-adutores" },
  { id: 272, nome: "Agachamento Sumô no Step com Déficit", grupo: "Adutores", mecanica: "Composto", series: 4, reps: "10-12", descanso_seg: 90, slug: "agachamento-sumo-step-deficit" },

  // === ABDÔMEN & CORE (EXPANSÃO) ===
  { id: 273, nome: "Prancha Lateral no Solo", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "45s", descanso_seg: 45, slug: "prancha-lateral-solo" },
  { id: 274, nome: "Prancha Lateral com Elevação de Perna", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "30s", descanso_seg: 45, slug: "prancha-lateral-elevacao-perna" },
  { id: 275, nome: "Prancha Spiderman com Joelho no Cotovelo", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "20", descanso_seg: 45, slug: "prancha-spiderman-joelho-cotovelo" },
  { id: 276, nome: "Prancha com Toque nos Ombros (Shoulder Taps)", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "20", descanso_seg: 45, slug: "prancha-toque-ombros-shoulder-taps" },
  { id: 277, nome: "Crunch Bicicleta no Chão (Bicycle Crunch)", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "20-30", descanso_seg: 45, slug: "crunch-bicicleta-bicycle-crunch" },
  { id: 278, nome: "Abdominal Canivete V-Up", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "abdominal-canivete-v-up" },
  { id: 279, nome: "Dragon Flag no Banco Reto", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "6-10", descanso_seg: 90, slug: "dragon-flag-banco-reto" },
  { id: 280, nome: "Limpador de Pára-brisa na Barra (Windshield Wipers)", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "limpador-para-brisa-barra-wipers" },
  { id: 281, nome: "Toes to Bar na Barra Fixa (Pés na Barra)", grupo: "Abdômen", mecanica: "Isolado", series: 4, reps: "8-12", descanso_seg: 60, slug: "toes-to-bar-pes-barra" },
  { id: 282, nome: "Knee to Elbow na Barra Fixa", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 60, slug: "knee-to-elbow-barra-fixa" },
  { id: 283, nome: "Pallof Press na Polia com Isometria", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "12", descanso_seg: 45, slug: "pallof-press-polia-isometria" },
  { id: 284, nome: "Woodchopper na Polia Alta (Lenhador Diagonal)", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 45, slug: "woodchopper-polia-alta-lenhador" },
  { id: 285, nome: "Woodchopper na Polia Baixa", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 45, slug: "woodchopper-polia-baixa" },
  { id: 286, nome: "Hollow Body Hold (Canoa Isométrica)", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "45-60s", descanso_seg: 45, slug: "hollow-body-hold-canoa" },
  { id: 287, nome: "Abdominal Declinado com Anilha no Peito", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 60, slug: "abdominal-declinado-anilha-peito" },
  { id: 288, nome: "Stomach Vacuum (Vácuo Abdominal)", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "20s", descanso_seg: 30, slug: "stomach-vacuum-vacuo-abdominal" },
  { id: 289, nome: "Deadbug com Controle Respiratório", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "16", descanso_seg: 45, slug: "deadbug-controle-respiratorio" },
  { id: 290, nome: "Bird-Dog (Perdigueiro com Isometria)", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "12", descanso_seg: 45, slug: "bird-dog-perdigueiro-isometria" },
  { id: 291, nome: "Roda Abdominal em Pé (Advanced Ab Wheel)", grupo: "Abdômen", mecanica: "Composto", series: 3, reps: "6-10", descanso_seg: 90, slug: "roda-abdominal-em-pe-advanced" },
  { id: 292, nome: "Crunch na Bola Suíça com Extensão Lombar", grupo: "Abdômen", mecanica: "Isolado", series: 3, reps: "15-20", descanso_seg: 45, slug: "crunch-bola-suica-extensao" },

  // === FUNCIONAL, CARDIO & PERFORMANCE ATLÉTICA (EXPANSÃO) ===
  { id: 293, nome: "Kettlebell Swing Russo", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "15-20", descanso_seg: 60, slug: "kettlebell-swing-russo" },
  { id: 294, nome: "Kettlebell Snatch (Arranque)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 3, reps: "10", descanso_seg: 60, slug: "kettlebell-snatch-arranque" },
  { id: 295, nome: "Kettlebell Clean and Press", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 3, reps: "8-10", descanso_seg: 75, slug: "kettlebell-clean-and-press" },
  { id: 296, nome: "Levantamento Turco com Kettlebell (Turkish Get-Up)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 3, reps: "5", descanso_seg: 90, slug: "turkish-get-up-levantamento-turco" },
  { id: 297, nome: "Burpee Completo com Salto", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "12-15", descanso_seg: 60, slug: "burpee-completo-salto" },
  { id: 298, nome: "Salto na Caixa Pliométrica (Box Jump)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "8-10", descanso_seg: 75, slug: "salto-caixa-pliometrica-box-jump" },
  { id: 299, nome: "Slam Ball com Bola Medicinal Pesada", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 3, reps: "15", descanso_seg: 45, slug: "slam-ball-bola-medicinal" },
  { id: 300, nome: "Wall Ball com Medicine Ball", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "15-20", descanso_seg: 60, slug: "wall-ball-medicine-ball" },
  { id: 301, nome: "Corda Naval Ondas Alternadas (Battle Ropes)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "30s", descanso_seg: 45, slug: "corda-naval-ondas-alternadas" },
  { id: 302, nome: "Corda Naval Batida Dupla (Double Slam)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 3, reps: "30s", descanso_seg: 45, slug: "corda-naval-batida-dupla-slam" },
  { id: 303, nome: "Pulo de Corda Rápido (Jump Rope)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "60s", descanso_seg: 45, slug: "pulo-corda-jump-rope" },
  { id: 304, nome: "Mountain Climbers no Solo (Escalador)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 3, reps: "40", descanso_seg: 45, slug: "mountain-climbers-escalador" },
  { id: 305, nome: "Empurrar Trenó de Carga (Prowler Sled Push)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "25m", descanso_seg: 90, slug: "empurrar-treno-sled-push" },
  { id: 306, nome: "Puxar Trenó com Corda (Sled Pull)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "25m", descanso_seg: 90, slug: "puxar-treno-sled-pull" },
  { id: 307, nome: "Remo Seco Ergômetro (Rowing Machine)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "500m", descanso_seg: 90, slug: "remo-seco-rowing-machine" },
  { id: 308, nome: "Assault Bike (Air Bike em Alta Intensidade)", grupo: "Funcional & Cardio", mecanica: "Funcional", series: 4, reps: "30s tiro", descanso_seg: 60, slug: "assault-bike-air-bike" },

  // === MOBILIDADE, POSTURA & RECUPERAÇÃO ARTICULAR (EXPANSÃO) ===
  { id: 309, nome: "Rotação Torácica em 4 Apoios", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "10", descanso_seg: 30, slug: "rotacao-toracica-4-apoios" },
  { id: 310, nome: "Maior Alongamento do Mundo (World's Greatest Stretch)", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "5", descanso_seg: 30, slug: "worlds-greatest-stretch-mobilidade" },
  { id: 311, nome: "Ativação Escapular na Barra Fixa (Scapular Pull-Up)", grupo: "Mobilidade", mecanica: "Isolado", series: 3, reps: "10-12", descanso_seg: 45, slug: "ativacao-escapular-barra-fixa" },
  { id: 312, nome: "Flexão Escapular no Chão (Scapular Push-Up)", grupo: "Mobilidade", mecanica: "Isolado", series: 3, reps: "12-15", descanso_seg: 45, slug: "flexao-escapular-scapular-push-up" },
  { id: 313, nome: "Dislocação de Ombros com Bastão ou Elástico", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "12", descanso_seg: 30, slug: "deslocacao-ombros-bastao-elastico" },
  { id: 314, nome: "Agachamento Cócoras Isométrico (Deep Squat Hold)", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "60s", descanso_seg: 30, slug: "agachamento-cocoras-deep-squat-hold" },
  { id: 315, nome: "Mobilidade de Quadril 90/90 com Transição Dinâmica", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "10", descanso_seg: 30, slug: "mobilidade-quadril-9090-transicao" },
  { id: 316, nome: "Alongamento de Peitoral e Bíceps na Parede", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "30s", descanso_seg: 30, slug: "alongamento-peitoral-biceps-parede" },
  { id: 317, nome: "Alongamento de Flexores de Quadril (Psoas) no Chão", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "40s", descanso_seg: 30, slug: "alongamento-flexores-quadril-psoas" },
  { id: 318, nome: "Alongamento Dinâmico de Isquiotibiais em Movimento", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "10", descanso_seg: 30, slug: "alongamento-dinamico-isquiotibiais" },
  { id: 319, nome: "Rolo de Liberação Miofascial em Quadríceps (Foam Roller)", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "60s", descanso_seg: 30, slug: "liberacao-miofascial-quadriceps-foam-roller" },
  { id: 320, nome: "Mobilidade de Tornozelo na Parede com Joelho à Frente", grupo: "Mobilidade", mecanica: "Alongamento", series: 3, reps: "15", descanso_seg: 30, slug: "mobilidade-tornozelo-parede-dorsiflexao" }
];

/** Catálogo completo: os 320 originais + o lote de casa gerado (src/data/homeExercises.js). */
export const EXERCISES_100 = [...EXERCISES_BASE, ...HOME_EXERCISES];

// Agrupamento prático por grupo muscular
export const EXERCISES_BY_GROUP = EXERCISES_100.reduce((acc, ex) => {
  if (!acc[ex.grupo]) {
    acc[ex.grupo] = [];
  }
  acc[ex.grupo].push(ex);
  return acc;
}, {});

// Lista única de todos os grupos musculares
export const MUSCLE_GROUPS = Object.keys(EXERCISES_BY_GROUP);

// Aliases convenientes
export const ALL_EXERCISES = EXERCISES_100;
export const EXERCISES_DATABASE = EXERCISES_100;

// Apelidos históricos e chaves usadas nos planos/geradores -> slug canônico em EXERCISES_100
export const EXERCISE_SLUG_ALIASES = {
  'incline-dumbbell-soccer': 'supino-inclinado-halteres',
  'crucifixo-reto-cabos': 'crossover-polia-alta',
  'puxada-alta-soccer': 'puxada-frontal-aberta',
  'remada-serrote-soccer': 'remada-unilateral-serrote',
  'remada-baixa-triangulo': 'remada-baixa-cabo',
  'desenvolvimento-halteres': 'desenvolvimento-com-halteres',
  'desenvolvimento-militar-halteres': 'desenvolvimento-com-halteres',
  'elevacao-lateral-speed': 'elevacao-lateral-halteres',
  'face-pull-corda': 'face-pull',
  'rosca-w-soccer': 'rosca-21-barra-w',
  'rosca-direta-barra-w': 'rosca-21-barra-w',
  'rosca-martelo-soccer': 'rosca-martelo-halteres',
  'triceps-corda-soccer': 'triceps-corda',
  'triceps-corda-polia': 'triceps-corda',
  'triceps-pulley-corda': 'triceps-corda',
  'triceps-frances-soccer': 'triceps-frances-halter',
  'triceps-frances-halteres': 'triceps-frances-halter',
  'agachamento-livre-barra': 'agachamento-livre',
  'agachamento-livre-ou-goblet': 'agachamento-taca-goblet-squat',
  'agachamento-goblet': 'agachamento-taca-goblet-squat',
  'bulgaro-soccer': 'agachamento-bulgaro',
  'stiff-romeno-halteres': 'stiff-com-halteres',
  'stiff-halteres': 'stiff-com-halteres',
  'stiff-barra': 'stiff-com-barra',
  'rdl-halteres': 'terra-romeno-rdl-halteres',
  'elevacao-pelvica-soccer': 'elevacao-pelvica-hip-thrust',
  'elevacao-pelvica-barra': 'elevacao-pelvica-hip-thrust',
  'elevacao-pelvica-quadril': 'elevacao-pelvica-hip-thrust',
  'panturrilha-explosiva': 'gemeos-em-pe-maquina',
  'panturrilha-em-pe-maquina': 'gemeos-em-pe-maquina',
  'panturrilha-em-pe': 'gemeos-step-halteres',
  'panturrilha-sentado': 'gemeos-sentado',
  'panturrilha-sentado-gemeos': 'gemeos-sentado',
  'copenhague-leves': 'prancha-copenhagen-adutores',
  'adutor-copenhagen': 'prancha-copenhagen-adutores',
  'aducao-copenhague': 'prancha-copenhagen-adutores',
  'abdominal-crunch-chute': 'crunch-abdominal-classico',
  'crunch-solo': 'crunch-abdominal-classico',
  'abdominal-polia-rope-crunch': 'crunch-polia',
  'prancha-frontal-ativa': 'prancha-isometrica',
  'prancha-abdominal-frontal': 'prancha-isometrica',
  'prancha-rotacional': 'prancha-lateral-solo',
  'mobilidade-9090-soccer': 'mobilidade-quadril-9090-transicao',
  'mobilidade-quadril-90-90': 'mobilidade-quadril-9090-transicao',
  'alongamento-isquiotibiais-dinamico': 'alongamento-dinamico-isquiotibiais'
};

/**
 * Busca um exercício pelo seu ID numérico, slug ou correspondência aproximada de nome
 */
export function findExerciseIn100(idOrNameOrSlug) {
  if (!idOrNameOrSlug) return null;

  // 1. Por ID numérico
  if (typeof idOrNameOrSlug === 'number') {
    return EXERCISES_100.find(e => e.id === idOrNameOrSlug) || null;
  }

  const str = String(idOrNameOrSlug).toLowerCase().trim();

  // 2. Se for string com dígito numérico (ex: "42", "150", "285")
  const num = parseInt(str, 10);
  if (!isNaN(num) && num >= 1 && String(num) === str) {
    return EXERCISES_100.find(e => e.id === num) || null;
  }

  // 3. Por alias explícito -> slug canônico
  const aliasedSlug = EXERCISE_SLUG_ALIASES[str];
  if (aliasedSlug) {
    const byAlias = EXERCISES_100.find(e => e.slug === aliasedSlug);
    if (byAlias) return byAlias;
  }

  // 4. Por slug exato
  const bySlug = EXERCISES_100.find(e => e.slug === str);
  if (bySlug) return bySlug;

  // 5. Por correspondência de nome exato
  const byName = EXERCISES_100.find(e => e.nome.toLowerCase() === str);
  if (byName) return byName;

  // 6. Por inclusão de substring
  return EXERCISES_100.find(e => 
    e.nome.toLowerCase().includes(str) || 
    str.includes(e.nome.toLowerCase()) ||
    e.slug.includes(str)
  ) || null;
}

/**
 * Filtra exercícios por termo de pesquisa e grupo muscular
 */
export function filterExercises100(searchTerm = '', selectedGroup = 'Todos') {
  const term = searchTerm.toLowerCase().trim();

  return EXERCISES_100.filter((ex) => {
    const matchesGroup = selectedGroup === 'Todos' || ex.grupo === selectedGroup;
    const matchesSearch = !term || 
      (ex.nome && ex.nome.toLowerCase().includes(term)) || 
      (ex.grupo && ex.grupo.toLowerCase().includes(term)) ||
      (ex.mecanica && ex.mecanica.toLowerCase().includes(term));

    return matchesGroup && matchesSearch;
  });
}
