#!/usr/bin/env python3
"""
Narração com edge-tts frase a frase, com tempo real por palavra (WordBoundary) e pausas controladas.

  python3 tools/marketing/narrate.py tmp/marketing/current/narration.spec.json

narration.spec.json (caminhos relativos à pasta do próprio JSON):
  {
    "voice": "pt-BR-AntonioNeural", "rate": "+2%", "pitch": "-2Hz",
    "mode": "single",                  # "single": texto inteiro numa chamada (entonação contínua) + encurta silêncios > maxGap
    "maxGap": 0.38,                    #   (padrão sem mode: frase a frase, coladas com "gap")
    "gap": 0.28,                       # pausa entre frases, em segundos (o edge-tts sozinho deixa ~0,85s)
    "maxWords": 5,                     # palavras por bloco de legenda
    "sentences": ["Frase um.", "Frase dois."]
  }

Saídas na mesma pasta: narration.wav (48 kHz estéreo), narration.captions.json
([{start, end, words: [{text, start, end}]}]) e narration.timing.json (início e fim de cada frase).
"""
import asyncio, json, os, subprocess, sys, tempfile

import edge_tts

spec_path = os.path.abspath(sys.argv[1])
base = os.path.dirname(spec_path)
spec = json.load(open(spec_path, encoding="utf-8"))
voice = spec.get("voice", "pt-BR-AntonioNeural")
gap = float(spec.get("gap", 0.28))
max_words = int(spec.get("maxWords", 5))
LEAD, TAIL = 0.04, 0.14  # respiro antes da 1ª e depois da última palavra de cada frase


async def synth(text, path):
    words = []
    com = edge_tts.Communicate(text, voice, rate=spec.get("rate", "+0%"), pitch=spec.get("pitch", "+0Hz"), boundary="WordBoundary")
    with open(path, "wb") as f:
        async for chunk in com.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                s = chunk["offset"] / 1e7
                words.append({"text": chunk["text"], "start": s, "end": s + chunk["duration"] / 1e7})
    return words


def run(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


tmp = tempfile.mkdtemp()
pieces, all_words, timing, t = [], [], [], 0.0
# " | " dentro da frase força quebra de bloco de legenda naquele ponto (não vai para o TTS)
breaks_after = set()
plain = []
for sentence in spec["sentences"]:
    toks = sentence.split()
    for tok in toks:
        if tok == "|":
            breaks_after.add(len(plain) - 1)
        else:
            plain.append(tok)
spoken = [" ".join(t for t in s.split() if t != "|") for s in spec["sentences"]]

if spec.get("mode") == "single":
    # Texto inteiro numa chamada só: a entonação entre frases fica a do próprio motor (sem colagem).
    # Só encurta silêncios acima de maxGap, cortando o meio do silêncio (nunca dentro de uma palavra).
    max_gap = float(spec.get("maxGap", 0.38))
    mp3 = os.path.join(tmp, "all.mp3")
    words = asyncio.run(synth(" ".join(spoken), mp3))
    keep, cursor, shift = [], max(0.0, words[0]["start"] - LEAD), []
    removed = 0.0
    for k in range(len(words) - 1):
        g = words[k + 1]["start"] - words[k]["end"]
        if g > max_gap:
            cut_a, cut_b = words[k]["end"] + max_gap / 2, words[k + 1]["start"] - max_gap / 2
            keep.append((cursor, cut_a))
            cursor = cut_b
    end = words[-1]["end"] + TAIL
    keep.append((cursor, end))
    # Tempo de cada palavra no áudio editado
    out_t, mapped = 0.0, []
    for a, b in keep:
        for w in words:
            if a <= w["start"] < b:
                mapped.append({"text": w["text"], "start": round(out_t + w["start"] - a, 3), "end": round(out_t + min(w["end"], b) - a, 3)})
        out_t += b - a
    t = out_t
    filt = "".join(f"[0:a]atrim={a:.3f}:{b:.3f},asetpts=PTS-STARTPTS[s{i}];" for i, (a, b) in enumerate(keep))
    filt += "".join(f"[s{i}]" for i in range(len(keep))) + f"concat=n={len(keep)}:v=0:a=1[out]"
    run("-i", mp3, "-filter_complex", filt, "-map", "[out]", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", os.path.join(base, "narration.wav"))
    # Frase de cada palavra pela contagem de palavras de cada frase do texto
    counts = [len(s.split()) for s in spoken]
    idx = 0
    for si, n in enumerate(counts):
        for _ in range(n):
            if idx < len(mapped):
                mapped[idx]["sentence"] = si
                idx += 1
    for w in mapped[idx:]:
        w["sentence"] = len(spoken) - 1
    all_words = mapped
    for si, s in enumerate(spoken):
        ws = [w for w in all_words if w["sentence"] == si]
        if ws:
            timing.append({"sentence": s, "start": ws[0]["start"], "end": ws[-1]["end"]})
    spoken_iter = []
else:
    spoken_iter = list(enumerate(spoken))

for i, sentence in spoken_iter:
    mp3 = os.path.join(tmp, f"s{i}.mp3")
    words = asyncio.run(synth(sentence, mp3))
    a = max(0.0, words[0]["start"] - LEAD)
    b = words[-1]["end"] + TAIL
    wav = os.path.join(tmp, f"s{i}.wav")
    run("-i", mp3, "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-ar", "48000", "-ac", "2", wav)
    pieces.append(wav)
    for w in words:
        all_words.append({"text": w["text"], "start": round(t + w["start"] - a, 3), "end": round(t + w["end"] - a, 3), "sentence": i})
    timing.append({"sentence": sentence, "start": round(t, 3), "end": round(t + b - a, 3)})
    t += b - a
    if i < len(spoken) - 1:
        sil = os.path.join(tmp, f"g{i}.wav")
        run("-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", f"{gap:.3f}", sil)
        pieces.append(sil)
        t += gap

if pieces:
    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{p}'\n" for p in pieces)
    run("-f", "concat", "-safe", "0", "-i", lst, "-c", "pcm_s16le", os.path.join(base, "narration.wav"))

# Pontuação do texto original volta às palavras (o WordBoundary entrega a palavra sem vírgula/ponto)
aligned = len(plain) == len(all_words)
if aligned:
    for w, tok in zip(all_words, plain):
        w["text"] = tok
else:
    print(f"⚠️  WordBoundary devolveu {len(all_words)} palavras para {len(plain)} no texto: quebras manuais ignoradas")

# Blocos de legenda: até max_words palavras, quebrando cedo em pontuação ou troca de frase
captions, cur = [], []
for i, w in enumerate(all_words):
    cur.append(w)
    nxt = all_words[i + 1] if i + 1 < len(all_words) else None
    forced = aligned and i in breaks_after
    if not nxt or forced or len(cur) >= max_words or nxt["sentence"] != w["sentence"] or w["text"][-1] in ",.:;?!":
        captions.append({"start": cur[0]["start"], "end": nxt["start"] if nxt and nxt["sentence"] == w["sentence"] else round(cur[-1]["end"] + 0.12, 3), "words": [{k: x[k] for k in ("text", "start", "end")} for x in cur]})
        cur = []

json.dump(captions, open(os.path.join(base, "narration.captions.json"), "w"), ensure_ascii=False, indent=1)
json.dump(timing, open(os.path.join(base, "narration.timing.json"), "w"), ensure_ascii=False, indent=1)
print(f"🎙  narration.wav {t:.2f}s · {len(all_words)} palavras · {len(captions)} blocos de legenda")
for s in timing:
    print(f"    {s['start']:6.2f} → {s['end']:6.2f}  {s['sentence']}")
