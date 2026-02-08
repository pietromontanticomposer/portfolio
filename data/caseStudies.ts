/**
 * HLS VIDEO REQUIREMENTS FOR CASE STUDIES
 * ========================================
 * All case study videos must use HLS with the following specs:
 *
 * FFmpeg command:
 *   ffmpeg -i input.mp4 \
 *     -c:v libx264 -preset fast -crf 23 \
 *     -c:a aac -b:a 128k \
 *     -f hls \
 *     -hls_time 6 \
 *     -hls_list_size 0 \
 *     -hls_segment_filename "output_dir/seg_%03d.ts" \
 *     -hls_playlist_type vod \
 *     -hls_flags independent_segments \
 *     "output_dir/index.m3u8"
 *
 * Required manifest structure:
 *   - #EXT-X-VERSION:6
 *   - #EXT-X-INDEPENDENT-SEGMENTS
 *   - #EXT-X-PLAYLIST-TYPE:VOD
 *   - Segments named: seg_000.ts, seg_001.ts, etc.
 *
 * Each segment must contain both video (h264) and audio (aac).
 * Upload to Vercel Blob using scripts/upload-veneti-hls.mjs as reference.
 */

export type CaseStudyTag = string;

export type SceneType = "Dialogue" | "Reveal" | "Montage" | "Action" | "Atmosphere";

export type BilingualText = { it: string; en: string };

export type CaseStudy = {
  id: string;
  title: BilingualText;
  projectLabel: string;
  sceneType: SceneType;
  duration: string | null;
  tags: CaseStudyTag[];
  isPublic: boolean;
  festivalCirculation: boolean;

  // PUBLIC ONLY
  embedUrl: string; // Vimeo/YouTube embed URL or HLS playlist (.m3u8). Must be set.
  posterImage?: string | null;

  context: BilingualText;

  goal: BilingualText;
  chosen: { key: "A" | "B" | "C"; summary: BilingualText; reason: BilingualText };
  result: BilingualText;
  timing: {
    in: { time: string | null; label: BilingualText };
    turn?: { time: string | null; label: BilingualText };
    out: { time: string | null; label: BilingualText };
  };
  spottingNote?: BilingualText;

  directorWanted: BilingualText;
  directorAvoid: BilingualText;

  versionsTested: { A: BilingualText; B: BilingualText; C: BilingualText };
  finalChoice: BilingualText;

  delivered: BilingualText;
  technicalDeliverables: BilingualText[];
  quote?: { text: BilingualText; attribution: string };
  musicChoices?: BilingualText;
  musicalLanguage?: BilingualText;
  trackTitle?: string;

  // Only inside <details>
  technicalNotes: BilingualText[];
};

// Flexible input type that accepts both BilingualText and string for text fields
type BilingualOrString = BilingualText | string;

export type CaseStudyInput = {
  id: string;
  title: BilingualOrString;
  projectLabel: string;
  sceneType: string;
  duration?: string | null;
  tags?: CaseStudyTag[];
  isPublic: boolean;
  festivalCirculation: boolean;
  embedUrl: string;
  posterImage?: string | null;
  context: BilingualOrString;
  goal: BilingualOrString;
  chosen: { key: "A" | "B" | "C"; summary: BilingualOrString; reason: BilingualOrString };
  result: BilingualOrString;
  timing: {
    in: { time: string | null; label: BilingualOrString };
    turn?: { time: string | null; label: BilingualOrString };
    out: { time: string | null; label: BilingualOrString };
  };
  spottingNote?: BilingualOrString;
  directorWanted: BilingualOrString;
  directorAvoid: BilingualOrString;
  versionsTested: { A: BilingualOrString; B: BilingualOrString; C: BilingualOrString };
  finalChoice: BilingualOrString;
  delivered: BilingualOrString;
  technicalDeliverables: BilingualOrString[];
  quote?: { text: BilingualOrString; attribution: string };
  musicChoices?: BilingualOrString;
  musicalLanguage?: BilingualOrString;
  trackTitle?: string;
  technicalNotes: BilingualOrString[];
};

const allowedSceneTypes: SceneType[] = [
  "Dialogue",
  "Reveal",
  "Montage",
  "Action",
  "Atmosphere",
];
const allowedSceneTypeMap = new Map(
  allowedSceneTypes.map((sceneType) => [sceneType.toLowerCase(), sceneType])
);

const tagSynonyms = new Map<string, string>([
  ["modern orchestral", "Modern orchestra"],
  ["modern orchestra", "Modern orchestra"],
  ["theme reveal", "Theme entrance"],
  ["theme entrance", "Theme entrance"],
]);

const paletteTags = new Set([
  "Ambient synth",
  "Celesta",
  "Dissonant braams",
  "Heartbeat kick",
  "Hurdy gurdy",
  "Low strings incipit",
  "Modern orchestra",
  "Monochord",
  "Piano",
  "Piano motif",
  "Piano ticks",
  "Resonant texture",
  "Synth",
  "Trombones",
  "Viola da gamba",
]);

const moodTags = new Set([
  "Anxiety",
  "Emotion",
  "Guilt",
  "Guilt without repentance",
  "Mystery",
  "Paranoia",
  "Power paranoia",
  "Release",
  "Spectre",
  "Vision",
]);

const lowPriorityMoodTags = new Set(["Emotion", "Release"]);

// Validation functions (replacing Zod schemas)
function isValidDuration(value: string): boolean {
  return /^\d{2}:\d{2}$/.test(value);
}

function isBilingualText(value: unknown): value is BilingualText {
  return (
    typeof value === "object" &&
    value !== null &&
    "it" in value &&
    "en" in value &&
    typeof (value as BilingualText).it === "string" &&
    typeof (value as BilingualText).en === "string"
  );
}

function validateCaseStudyBase(data: CaseStudyInput): string[] {
  const errors: string[] = [];
  if (!data.id || typeof data.id !== "string") errors.push("id is required");
  if (!data.title || (!isBilingualText(data.title) && typeof data.title !== "string")) errors.push("title is required");
  if (!data.projectLabel || typeof data.projectLabel !== "string") errors.push("projectLabel is required");
  if (!data.sceneType || typeof data.sceneType !== "string") errors.push("sceneType is required");
  if (data.duration && !isValidDuration(data.duration)) {
    errors.push(`duration must be MM:SS (got: ${data.duration})`);
  }
  return errors;
}

function normalizeSpacing(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function canonicalizeTag(value: string) {
  const normalized = normalizeSpacing(value);
  if (!normalized) return null;
  const key = normalized.toLowerCase();
  return tagSynonyms.get(key) ?? normalized;
}

function findAllowedSceneType(value: string) {
  const normalized = normalizeSpacing(value).toLowerCase();
  return allowedSceneTypeMap.get(normalized) ?? null;
}

function findSceneTypeInTags(tags: string[]) {
  for (const tag of tags) {
    const candidate = findAllowedSceneType(tag);
    if (candidate) return candidate;
  }
  return null;
}

function findSceneTypeInTitle(title: BilingualText | string) {
  const titleStr = typeof title === "string" ? title : title.en;
  const match = titleStr.match(/\((Dialogue|Reveal|Montage|Action|Atmosphere)\)/i);
  if (!match) return null;
  return findAllowedSceneType(match[1] ?? "");
}

function extractStyleTag(value: string) {
  const normalized = normalizeSpacing(value);
  if (!normalized) return null;
  const lowered = normalized.toLowerCase();
  const styleKeywords = ["orchestral", "orchestra", "synth", "hybrid"];
  if (!styleKeywords.some((keyword) => lowered.includes(keyword))) return null;
  return canonicalizeTag(normalized);
}

function orderTags(tags: string[]) {
  const narrative: string[] = [];
  const palette: string[] = [];
  const mood: string[] = [];

  for (const tag of tags) {
    if (paletteTags.has(tag)) {
      palette.push(tag);
    } else if (moodTags.has(tag)) {
      mood.push(tag);
    } else {
      narrative.push(tag);
    }
  }

  const moodPrimary: string[] = [];
  const moodSecondary: string[] = [];
  for (const tag of mood) {
    if (lowPriorityMoodTags.has(tag)) {
      moodSecondary.push(tag);
    } else {
      moodPrimary.push(tag);
    }
  }

  return [...narrative, ...palette, ...moodPrimary, ...moodSecondary];
}

function normalizeTags(rawTags: string[], sceneType: SceneType) {
  const deduped = new Map<string, string>();
  for (const tag of rawTags) {
    const canonical = canonicalizeTag(tag);
    if (!canonical) continue;
    const key = canonical.toLowerCase();
    if (key === sceneType.toLowerCase()) continue;
    if (!deduped.has(key)) {
      deduped.set(key, canonical);
    }
  }

  const ordered = orderTags(Array.from(deduped.values()));
  return ordered.slice(0, 5);
}

function normalizeCaseStudy(data: CaseStudyInput): CaseStudy {
  const rawSceneType = normalizeSpacing(String(data.sceneType ?? ""));
  const rawTags = Array.isArray(data.tags)
    ? data.tags
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => normalizeSpacing(tag))
        .filter(Boolean)
    : [];
  let sceneType = findAllowedSceneType(rawSceneType);
  let appliedCorrection: string | null = null;
  let extraTags: string[] = [];

  if (!sceneType) {
    const fromTags = findSceneTypeInTags(rawTags);
    if (fromTags) {
      sceneType = fromTags;
      appliedCorrection = "from tags";
    } else {
      const fromTitle = findSceneTypeInTitle(data.title || { it: "", en: "" });
      if (fromTitle) {
        sceneType = fromTitle;
        appliedCorrection = "from title";
      } else {
        const styleTag = extractStyleTag(rawSceneType);
        if (styleTag) {
          sceneType = "Atmosphere";
          extraTags = [styleTag];
          appliedCorrection = "style fallback";
        } else {
          sceneType = "Atmosphere";
          appliedCorrection = "fallback";
        }
      }
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[case-studies] sceneType normalized for \"${data.id}\": \"${rawSceneType}\" -> \"${sceneType}\" (${appliedCorrection})`
      );
    }
  }

  const tags = normalizeTags([...rawTags, ...extraTags], sceneType);

  // Helper to normalize string to BilingualText
  const toBilingual = (value: BilingualOrString | undefined): BilingualText => {
    if (!value) return { it: "", en: "" };
    if (typeof value === "string") return { it: value, en: value };
    return value;
  };

  const toBilingualOptional = (value: BilingualOrString | undefined): BilingualText | undefined => {
    if (!value) return undefined;
    if (typeof value === "string") return { it: value, en: value };
    return value;
  };

  const toBilingualArray = (arr: BilingualOrString[]): BilingualText[] => {
    return arr.map(item => typeof item === "string" ? { it: item, en: item } : item);
  };

  return {
    id: data.id,
    title: toBilingual(data.title),
    projectLabel: data.projectLabel,
    sceneType,
    duration: data.duration ?? null,
    tags,
    isPublic: data.isPublic,
    festivalCirculation: data.festivalCirculation,
    embedUrl: data.embedUrl,
    posterImage: data.posterImage,
    context: toBilingual(data.context),
    goal: toBilingual(data.goal),
    chosen: {
      key: data.chosen.key,
      summary: toBilingual(data.chosen.summary),
      reason: toBilingual(data.chosen.reason),
    },
    result: toBilingual(data.result),
    timing: {
      in: { time: data.timing.in.time ?? null, label: toBilingual(data.timing.in.label) },
      turn: data.timing.turn ? { time: data.timing.turn.time ?? null, label: toBilingual(data.timing.turn.label) } : undefined,
      out: { time: data.timing.out.time ?? null, label: toBilingual(data.timing.out.label) },
    },
    spottingNote: toBilingualOptional(data.spottingNote),
    directorWanted: toBilingual(data.directorWanted),
    directorAvoid: toBilingual(data.directorAvoid),
    versionsTested: {
      A: toBilingual(data.versionsTested.A),
      B: toBilingual(data.versionsTested.B),
      C: toBilingual(data.versionsTested.C),
    },
    finalChoice: toBilingual(data.finalChoice),
    delivered: toBilingual(data.delivered),
    technicalDeliverables: toBilingualArray(data.technicalDeliverables),
    quote: data.quote ? { text: toBilingual(data.quote.text), attribution: data.quote.attribution } : undefined,
    musicChoices: toBilingualOptional(data.musicChoices),
    musicalLanguage: toBilingualOptional(data.musicalLanguage),
    trackTitle: data.trackTitle,
    technicalNotes: toBilingualArray(data.technicalNotes),
  };
}

export const caseStudies: CaseStudyInput[] = [
  {
    id: "soggetto-obsoleto-sitting-on-the-seashore",
    title: {
      it: "In riva al mare, prima entrata del tema (Spiaggia)",
      en: "Sitting on the Seashore, First Theme Entrance (Beach)"
    },
    projectLabel: "Soggetto Obsoleto",
    sceneType: "Reveal",
    duration: "01:44",
    tags: ["Emotion", "Release", "Theme entrance", "Reveal", "Piano ticks", "Major-to-minor landing"],
    isPublic: false,
    festivalCirculation: true,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Soggetto%20Obsoleto/Soggetto%20Obsoleto%20Sitting%20On%20The%20Seashore%20Case%20Stu/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/Soggetto%20Obsoleto%20Sitting%20On%20The%20Seashore%20Case%20Stu.jpg",

    context: {
      it: "Marco raggiunge la spiaggia. Suo padre e gia li, di fronte al mare. Questo e il primo cue in cui la colonna sonora puo finalmente fiorire. La musica deve aprire uno spazio emotivo dall'interno, non illustrare il luogo.",
      en: "Marco reaches the beach. His father is already there, facing the sea. This is the first cue where the score is allowed to bloom fully. The music must open emotional space from the inside, not illustrate the location."
    },
    goal: {
      it: "Aprire le emozioni di Marco per la prima volta, senza trasformare il momento in catarsi. Far entrare il tema sulla rivelazione del padre, poi tagliare prima della prima battuta cosi il dialogo arriva pulito.",
      en: "Crack open Marco's emotions for the first time, without turning the moment into catharsis. Let the theme enter on the father reveal, then cut before the first line so dialogue lands clean."
    },
    chosen: {
      key: "B",
      summary: {
        it: "Tema sulla rivelazione del padre con archi leggeri, piano e synth arioso.",
        en: "Theme on the father reveal with light strings, piano, and airy synth."
      },
      reason: {
        it: "Esce prima della prima battuta cosi le parole arrivano pulite.",
        en: "Exits before the first line so the words land clean."
      }
    },
    result: {
      it: "La scena finalmente respira, ma il finale atterra in minore, mantenendo il rilascio incompleto. Il tema si legge come riconoscimento, non come commento.",
      en: "The scene finally breathes, but the ending lands in minor, keeping the release incomplete. The theme reads as recognition, not commentary."
    },
    timing: {
      in: { time: "00:00", label: { it: "Iniziano i tick del piano (tempo sospeso, nessuna melodia)", en: "Piano ticks begin (time held, no melody)" } },
      turn: { time: "00:32", label: { it: "Il tema entra sulla rivelazione del padre", en: "Theme enters on father reveal" } },
      out: { time: "01:44", label: { it: "Taglio prima di 'Posso sedermi qui con te?'", en: "Cut before 'May I sit here with you?'" } }
    },
    spottingNote: {
      it: "Questo e intenzionalmente il primo cue completo. Apre il film emotivamente, ma esce prima della prima battuta cosi il dialogo arriva incontaminato.",
      en: "This is intentionally the first full cue. It opens the film emotionally, but exits before the first spoken line so the dialogue lands pristine."
    },

    directorWanted: {
      it: "Trattenimento. Respiro interno. Musica che sembra nata dentro la scena.",
      en: "Restraint. Internal breathing. Music that feels born inside the scene."
    },
    directorAvoid: {
      it: "Melodramma. Emozione telefonata. Coprire la prima battuta.",
      en: "Melodrama. Telegraphed emotion. Covering the first spoken line."
    },

    versionsTested: {
      A: { it: "Solo tick del piano. Nessun tema. Troppo freddo, nessuna porta emotiva.", en: "Only piano ticks. No theme. Too cold, no emotional doorway." },
      B: { it: "Tema sulla rivelazione del padre (archi leggeri + piano + synth arioso), stop appena prima della richiesta di sedersi.", en: "Theme on father reveal (light strings + piano + airy synth), stop right before the first request to sit." },
      C: { it: "Tema prima, durante la camminata. Risulta manipolativo e anticipa il momento.", en: "Theme earlier during the walk. Feels manipulative and telegraphs the moment." }
    },
    finalChoice: { it: "B", en: "B" },

    delivered: {
      it: "Mix finale piu alternate, etichettate chiaramente. Revisioni tracciate.",
      en: "Final mix plus alternates, clearly labelled. Revisions tracked."
    },
    technicalDeliverables: [
      { it: "Nomi file puliti e versioning", en: "Clean filenames and versioning" },
      { it: "Alternate pronte su richiesta", en: "Alternates ready on request" },
      { it: "Note/revisioni tracciate", en: "Notes/revisions tracked" }
    ],
    musicalLanguage: {
      it: "Obiettivo: sbloccare le emozioni di Marco per la prima volta dopo un intero film di trattenimento, ma senza catarsi.\n\n0:00-0:32: solo tick del piano, che fungono da orologio emotivo (tempo sospeso, nessuna melodia).\n\n0:32-1:44: il tema, in Sol maggiore, entra sulla rivelazione del padre con piano in primo piano, archi leggeri e un letto di synth arioso. L'orchestrazione resta volutamente pulita e trattenuta per aprire spazio senza spingere lo spettatore, poi taglia prima di 'Posso sedermi qui con te?' cosi il dialogo arriva pulito.\n\nL'armonia mantiene un colore maggiore ma atterra in minore: Sol-Fa#m-La-Mim, con Si minore trattenuto fino all'accordo finale (promessa trattenuta, rilascio non completo).",
      en: "Goal: unlock Marco's emotions for the first time after a full film of restraint, but without catharsis.\n\n0:00-0:32: only piano ticks, acting as an emotional clock (time held, no melody).\n\n0:32-1:44: the theme, in G major, enters on the father reveal with piano leading, light strings, and an airy synth bed. The orchestration stays deliberately clean and restrained so it opens space without pushing the viewer, then cuts before 'May I sit here with you?' so dialogue lands clean.\n\nHarmony keeps a major colour but lands in minor: G-F#m-A-Em, with B minor withheld until the final chord (promise held back, release not complete)."
    },
    quote: {
      text: {
        it: "La gestione delle revisioni e sempre stata chiara. Pietro anticipava le richieste e proponeva gia soluzioni alternative.",
        en: "Revision handling was always clear. Pietro anticipated requests and already proposed alternative solutions."
      },
      attribution: "Nicola Pegg, director"
    },

    technicalNotes: [
      { it: "Formato delivery: WAV (linear PCM)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" },
      { it: "Stem: Piano, Archi, Synth", en: "Stems: Piano, Strings, Synth" },
      { it: "Alt: versione ridotta per dialogo/flessibilita editoriale", en: "Alt: reduced version for dialogue/editorial flexibility" },
      { it: "Nomi file puliti e versioning", en: "Clean filenames and versioning" }
    ]
  },
  {
    id: "i-veneti-antichi-battle-with-the-spartans",
    title: {
      it: "I Veneti Antichi, La Battaglia con gli Spartani (Azione)",
      en: "I Veneti Antichi, The Battle With The Spartans (Action)"
    },
    projectLabel: "I Veneti Antichi",
    sceneType: "Action",
    duration: "04:59",
    tags: [
      "Modern orchestra",
      "Low strings incipit",
      "Trombones",
      "Heartbeat kick",
      "Battle rhythm",
      "Timbri antichi"
    ],
    isPublic: false,
    festivalCirculation: true,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/I%20Veneti%20Antichi%20The%20Battle%20New/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/I%20Veneti%20Antichi%20The%20Battle.jpg",

    context: {
      it: "Ricostruzione della battaglia con gli Spartani: tagli rapidi alternati a campi lunghi sul campo di battaglia. Serve drive e chiarezza senza scivolare nel trailer moderno, lasciando sempre priorità a narrazione storica e sound design.",
      en: "Reconstruction of the battle with the Spartans, built on fast cuts and long battlefield wides. The sequence needs drive without turning into a modern action trailer, and it must leave space for historical narration and sound design."
    },
    goal: {
      it: "Costruire un battle cue in stile blockbuster che sostenga il montaggio senza coprire narrazione e FX. Tenere una spina dorsale ritmica leggibile e riservare i picchi ai beat chiave, così la scena resta chiara e il tono storico rimane credibile.",
      en: "Hold a clear rhythmic spine for the edit, give the clashes weight, and keep the cue readable so the educational tone stays intact."
    },
    chosen: {
      key: "B",
      summary: {
        it: "Pulse di archi bassi con percussioni contenute, chiamate di ottoni sui cambi di formazione, orchestra piena solo al primo scontro.",
        en: "Low strings pulse with restrained percussion, brass calls on formation changes, full orchestra only at the first clash."
      },
      reason: {
        it: "Mantiene tensione e slancio lasciando spazio per la narrazione e il suono diegetico della battaglia.",
        en: "Keeps tension and momentum while leaving space for narration and diegetic battle sound."
      }
    },
    result: {
      it: "La scena corre, ma non diventa rumore. Il ritmo resta agganciato ai tagli, gli impatti arrivano con peso, e nei momenti di lettura la musica si apre e lascia spazio alla narrazione.",
      en: "The scene feels kinetic but intelligible. The rhythm stays locked to the edit, the clashes land with weight, and the narration still reads cleanly."
    },
    trackTitle: "The Battle",
    timing: {
      in: { time: "00:00", label: { it: "Campo largo sul campo di battaglia. Entra il pulse, sobrio e leggibile.", en: "Wide battlefield shot, pulse enters." } },
      turn: { time: "02:06", label: { it: "Primo scontro. Gli accenti si agganciano ai tagli e il peso sale senza saturare la scena.", en: "First clash, brass and percussion lock to cuts." } },
      out: { time: "04:59", label: { it: "Campo largo sulle conseguenze. Il cue si rilascia in sustain controllato.", en: "Aftermath wide, cue releases into sustain." } }
    },
    spottingNote: {
      it: "Mantenere il cue snello fino al primo scontro. Evitare colpi costanti: i picchi devono leggere come svolte narrative, non come intensità continua. In due passaggi chiave, usare un cambio armonico dedicato per evidenziare la transizione senza alzare volume.",
      en: "Keep the cue lean until the first clash. Avoid constant hits so the narration and battle FX remain dominant."
    },

    directorWanted: {
      it: "Drive, chiarezza e peso. Tono storico con orchestra e timbri antichi come colore, mai estetica da trailer.",
      en: "Drive and clarity. A historical tone with orchestral weight, but never trailer-style."
    },
    directorAvoid: {
      it: "Percussioni muro a muro, colpi sovradimensionati, o musica che maschera narrazione e sound design.",
      en: "Wall-to-wall percussion, oversized hits, or music that masks narration."
    },

    versionsTested: {
      A: { it: "Pulse solo percussioni e timbri antichi. Troppo secco e poco narrativo.", en: "Percussion-only pulse. Too dry and not enough identity." },
      B: { it: "Pulse su archi bassi e percussioni, chiamate di ottoni sui cambi. Elementi etnici e antichi come accenti. Orchestra piena solo al primo scontro.", en: "Low strings pulse, brass calls on shifts, full orchestra only at the first clash." },
      C: { it: "Orchestra piena dall'inizio. Opprimente: appiattisce le dinamiche e copre la narrazione.", en: "Full orchestral wall from the start. Overwhelming and flattened the dynamics." }
    },
    finalChoice: { it: "B", en: "B" },

    delivered: {
      it: "Mix finale più una versione alternativa con percussioni alleggerite per voce e dialoghi. Stems ordinati e nominati in modo coerente, pronti per la post.",
      en: "Final mix plus a lighter percussion alternate, clearly labelled."
    },
    technicalDeliverables: [
      { it: "Master stereo 48 kHz, 24-bit", en: "48 kHz, 24-bit stereo master" },
      { it: "Alt: percussioni ridotte per VO", en: "Alt: reduced percussion for VO" },
      { it: "Stem: archi, ottoni, percussioni", en: "Stems: strings, brass, percussion" }
    ],
    musicalLanguage: {
      it: "Base ritmica su ostinato di archi bassi e pulse di percussioni per sostenere l'accelerazione del montaggio. Timbri etnici e strumenti dal sapore antico entrano come spezia, per dare flavour storico senza modernizzare la scena.\n\nI cambi di formazione e i passaggi chiave sono segnati da brevi chiamate di ottoni e da soluzioni armoniche dedicate, così ogni svolta si legge anche a volume basso e senza invadere FX e racconto.\n\nDopo il primo impatto, l'orchestra si apre in sustain controllati e l'armonia respira: tensione sotto pelle, ma spazio sopra per conseguenze e narrazione.",
      en: "Built on a low strings ostinato and a heartbeat kick to keep the pulse steady while the edit accelerates.\n\nShort brass calls and trombone figures mark shifts in formation, but the full orchestra is held back until the first clash, so the impact reads as a narrative turn instead of constant intensity.\n\nAfter the collision, the harmony opens into sustained low strings to let the aftermath breathe while keeping tension under the narration."
    },

    technicalNotes: [
      { it: "Formato delivery: WAV (linear PCM)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24 bit (standard richiesto da molte delivery spec, inclusi stems e mix master)", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture lock", en: "Sync: aligned to final picture" },
      { it: "Alt: versione VO friendly con percussioni alleggerite", en: "Alt: reduced percussion for VO" },
      { it: "Stem: archi, ottoni, percussioni, timbri etnici e antichi (più eventuali synth e bassi)", en: "Stems: strings, brass, percussion" },
      { it: "Naming: coerente e versionato tra mix e stems", en: "Separate stems where needed, clear naming and tracked versions for a safe post delivery." }
    ]
  },
  {
    id: "scene-03",
    title: {
      it: "Eris legge, La storia della Banshee e il primo colpo di tosse (Dialogo)",
      en: "Eris Reads, The Banshee Story and the First Cough (Dialogue)"
    },
    projectLabel: "La Sonata Del Chaos",
    sceneType: "Dialogue",
    duration: null,
    tags: ["Dialogue", "Theme layering", "Motif seed", "Foreshadowing", "Piano", "Banshee motif"],
    isPublic: false,
    festivalCirculation: true,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/La%20Sonata%20Del%20Caos/La%20Sonata%20Del%20Caos%20Something%20Threatening%20Case%20Stud/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/La%20Sonata%20Del%20Caos%20Something%20Threatening%20Case%20Stud.jpg",

    context: {
      it: "La Sonata Del Chaos e un cortometraggio in cui una fiaba familiare, la Banshee, passa da leggenda raccontata a forza reale dentro casa. La storia segue Eris attraverso il lutto per la morte della sua insegnante di violino, e l'idea della Banshee diventa poi inseparabile da una malattia incurabile che colpisce la madre e poi Talia.\n\nQuesto cue si trova dentro una calda conversazione della buonanotte dove il mito viene pronunciato ad alta voce, e il colpo di tosse della madre lo riformula silenziosamente come qualcosa gia dentro casa.",
      en: "La Sonata Del Chaos is a short film where a family folktale, the Banshee, shifts from a spoken legend into a real force inside the home. The story follows Eris through grief after her violin teacher's death, and the Banshee idea later becomes inseparable from an incurable illness that hits the mother and then Talia.\n\nThis cue sits inside a warm bedtime conversation where the myth is spoken aloud, and the mother's cough quietly reframes it as something already inside the house."
    },
    goal: {
      it: "Mantenere la scena tenera e con il dialogo in primo piano, trasformando al contempo il mito familiare in una minaccia reale attraverso un cardine preciso, il colpo di tosse della madre, senza telefonare l'horror.",
      en: "Keep the scene tender and dialogue first, while turning the family myth into a real threat through one precise hinge, the mother's cough, without telegraphing horror."
    },
    chosen: {
      key: "C",
      summary: {
        it: "Tema di Eris al piano, un delicato accenno a Talia, e un accento minimo della Banshee esattamente sul colpo di tosse.",
        en: "Eris theme on piano, a gentle Talia hint, and a minimal Banshee accent exactly on the cough."
      },
      reason: {
        it: "Collega il mito familiare al sintomo fisico senza far scivolare la scena nell'horror.",
        en: "Connects the family myth to the physical symptom without shifting the scene into horror."
      }
    },
    result: {
      it: "Il beat resta domestico e leggibile. Eris e inquadrata attraverso una morbida dichiarazione al piano, Talia e delicatamente seminata, e il colpo di tosse porta un'impronta minima della Banshee che collega il folklore alla prima crepa fisica.",
      en: "The beat stays domestic and readable. Eris is framed through a soft piano statement, Talia is gently seeded, and the cough carries a minimal Banshee fingerprint that links folklore to the first physical crack."
    },
    trackTitle: "Something Threatening",
    timing: {
      in: {
        time: "00:00",
        label: {
          it: "Eris finisce di leggere. La famiglia parla della 'Banshee' come una storia della nonna.",
          en: "Eris finishes reading. The family talks about the 'Banshee' as a story from the grandmother."
        }
      },
      turn: {
        time: null,
        label: {
          it: "La paura sale mentre il mito viene trattato come reale. Talia esprime dubbio e paura.",
          en: "Fear rises as the myth is treated as real. Talia voices doubt and fear."
        }
      },
      out: {
        time: null,
        label: {
          it: "La madre tossisce tre volte, liquida il fatto, le manda a letto. Tag finale.",
          en: "Mother coughs three times, dismisses it, sends them to bed. End tag."
        }
      }
    },
    spottingNote: {
      it: "Il dialogo resta primario. Il cue emerge solo come un piccolo accento di motivo sul colpo di tosse, poi si ritrae immediatamente sotto la scena.",
      en: "Dialogue remains primary. The cue only surfaces as a tiny motif accent on the cough, then immediately retreats back under the scene."
    },

    directorWanted: {
      it: "Calda intimita domestica. Dialogo e respiro chiari. Foreshadowing senza segnalare horror. Motivi che possono ricorrere dopo in variazione.",
      en: "Warm domestic intimacy. Clear dialogue and breath. Foreshadowing without signalling horror. Motifs that can recur later in variation."
    },
    directorAvoid: {
      it: "Dichiarazione esplicita della Banshee. Musica che compete con il ritmo della lettura. Cambio di genere prematuro verso l'horror. Qualsiasi mascheramento delle consonanti.",
      en: "Overt Banshee statement. Music that competes with the reading rhythm. Early genre shift into horror. Any masking of consonants."
    },

    versionsTested: {
      A: { it: "Solo tema di Eris su piano morbido, nessun altro riferimento.", en: "Only Eris theme on soft piano, no other references." },
      B: { it: "Tema di Eris piu un breve accenno a Talia, ancora puramente domestico.", en: "Eris theme plus a short Talia hint, still purely domestic." },
      C: { it: "Tema di Eris al piano, un delicato accenno a Talia, e un accento minimo della Banshee esattamente sul colpo di tosse, poi ritorno immediato alla neutralita domestica.", en: "Eris theme on piano, a gentle Talia hint, and a minimal Banshee accent exactly on the cough, then immediate return to domestic neutrality." }
    },
    finalChoice: {
      it: "C, perche la Banshee e introdotta come un mito trasmesso dalla famiglia e poi diventa fisica attraverso la malattia della madre. Il colpo di tosse e il ponte piu piccolo dal folklore al corpo, cosi il motivo puo funzionare narrativamente senza annunciarsi.",
      en: "C, because the Banshee is introduced as a family-transmitted myth and later becomes physical through the mother's illness. The cough is the smallest bridge from folklore to the body, so the motif can function narratively without announcing itself."
    },

    delivered: {
      it: "Mix finale piu alternata dialogue-safe, etichettata chiaramente. Revisioni tracciate.",
      en: "Final mix plus dialogue safe alternate, clearly labelled. Revisions tracked."
    },
    technicalDeliverables: [
      { it: "Formato delivery: WAV (linear PCM)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ],
    musicChoices: {
      it: "Ho trattato questo come un bed per dialogo con funzione di leitmotif. Il piano porta Eris in un profilo fragile e domestico per mantenere la scena umana. Talia appare come un marcatore di calore incompleto per costruire attaccamento presto. Sul colpo di tosse, un'impronta minima della Banshee trapela brevemente. E un contorno, non una frase completa. Il punto e connettere mito e malattia come due facce della stessa forza narrativa, mantenendo la scena credibile e intima.",
      en: "I treated this as a dialogue bed with a leitmotif function. The piano carries Eris in a fragile, domestic profile to keep the scene human. Talia appears as an incomplete warmth marker to build attachment early. On the cough, a minimal Banshee fingerprint briefly leaks in. It is a contour, not a full phrase. The point is to connect myth and illness as two faces of the same narrative force, while keeping the scene believable and intimate."
    },
    musicalLanguage: {
      it: "Ho trattato questo come un bed per dialogo con funzione di leitmotif. Il piano porta Eris in un profilo fragile e domestico per mantenere la scena umana. Talia appare come un marcatore di calore incompleto per costruire attaccamento presto. Sul colpo di tosse, un'impronta minima della Banshee trapela brevemente. E un contorno, non una frase completa. Il punto e connettere mito e malattia come due facce della stessa forza narrativa, mantenendo la scena credibile e intima.",
      en: "I treated this as a dialogue bed with a leitmotif function. The piano carries Eris in a fragile, domestic profile to keep the scene human. Talia appears as an incomplete warmth marker to build attachment early. On the cough, a minimal Banshee fingerprint briefly leaks in. It is a contour, not a full phrase. The point is to connect myth and illness as two faces of the same narrative force, while keeping the scene believable and intimate."
    },

    technicalNotes: [
      { it: "Formato delivery: WAV (linear PCM)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ]
  },
  {
    id: "la-sonata-del-chaos-mothers-tale-banshee",
    title: {
      it: "Il racconto della madre, Motivo della Banshee in primo piano (Dialogo)",
      en: "The Mother's Tale, Banshee Motif in Focus (Dialogue)"
    },
    projectLabel: "La Sonata Del Chaos",
    sceneType: "Dialogue",
    duration: "00:52",
    tags: ["Dialogue", "Leitmotif", "Motif recall", "Foreground theme", "Mystery", "Foreshadowing"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/La%20Sonata%20Del%20Caos/La%20Sonata%20Del%20Caos%20The%20Mother_s%20Tale%20Case%20Study/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/La%20Sonata%20Del%20Caos%20The%20Mother_s%20Tale%20Case%20Study.jpg",

    context: {
      it: "La Sonata Del Chaos e un cortometraggio in cui una fiaba familiare, la Banshee, passa da leggenda raccontata a forza reale dentro casa. La storia segue Eris attraverso il lutto per la morte della sua insegnante di violino, e l'idea della Banshee diventa poi inseparabile da una malattia incurabile che colpisce la madre e poi Talia.\n\nLa madre racconta alla figlia la leggenda della Banshee. Il motivo esiste gia nella colonna sonora, ma qui diventa udibile e centrale per la prima volta, portando la scena senza calpestare il dialogo.",
      en: "La Sonata Del Chaos is a short film where a family folktale, the Banshee, shifts from a spoken legend into a real force inside the home. The story follows Eris through grief after her violin teacher's death, and the Banshee idea later becomes inseparable from an incurable illness that hits the mother and then Talia.\n\nThe mother tells her daughter the legend of the Banshee. The motif already exists in the score, but here it becomes audible and central for the first time, carrying the scene without stepping on the dialogue."
    },
    goal: {
      it: "Portare il leitmotif della Banshee gia stabilito in chiaro fuoco per la prima volta, assegnandolo ai violini mentre piano e arpa sostengono la scena, cosi il dialogo resta pienamente leggibile.",
      en: "Bring the already established Banshee leitmotif into clear focus for the first time, assigning it to the violins while the piano and harp sustain the scene, so the dialogue remains fully readable."
    },
    chosen: {
      key: "B",
      summary: {
        it: "Bed di piano con un breve motivo infilato sotto la prima menzione della Banshee.",
        en: "Piano bed with a short motif tucked under the first Banshee mention."
      },
      reason: {
        it: "Pianta il leitmotif mantenendo consonanti e respiri chiari.",
        en: "Plants the leitmotif while keeping consonants and breaths clear."
      }
    },
    result: {
      it: "Il motivo diventa inconfondibile e memorabile senza sopraffare la scena. Le variazioni successive vengono percepite come richiamo narrativo piuttosto che materiale nuovo, rafforzando la coesione del corto.",
      en: "The motif becomes unmistakable and memorable without overpowering the scene. Later variations are perceived as narrative recall rather than new material, strengthening cohesion across the short."
    },
    timing: {
      in: { time: "00:00", label: { it: "Madre: 'Si dice...'", en: "Mother: 'It is said...'" } },
      out: { time: "00:52", label: { it: "Fine del beat del racconto", en: "End of the tale beat" } }
    },
    musicalLanguage: {
      it: "Scrittura orchestrale guidata dal piano costruita come cardine narrativo, non come mood di sottofondo.\n\nA 0:09 il tema di Eris entra al piano: si apre in Do maggiore, scivola immediatamente nella sottodominante minore (Fam), poi pivota in Do minore e lo conferma attraverso una riconferma cadenzale. Questa svolta armonica 'da luce a ombra' rende lutto e inquietudine parte del DNA del tema mantenendo il dialogo della madre incontaminato.\n\nA 0:32 il motivo di Talia e brevemente accennato in Sib, intenzionalmente in attrito con il centro in Do minore di Eris. L'attrito si legge come vulnerabilita che entra nella stanza, non come decorazione melodica.\n\nSubito dopo, il motivo della Banshee appare in viole e dulcimer a martello. L'attacco percussivo delle corde del dulcimer da una texture 'aliena' che suggerisce il mostruoso e l'ignoto, con un senso controllato di minaccia. Questo e dove al motivo e permesso parlare chiaramente come spina dorsale della scena, non solo come accenno di sottofondo.\n\nSul colpo di tosse della madre, il cue introduce l'idea della 'malattia' (0:48 fino alla fine): correlata al materiale della Banshee ma non identica, cosi il film puo poi separare il folklore come mito dalla malattia come corpo, mantenendoli comunque psicologicamente collegati.",
      en: "Piano-led orchestral writing built as a narrative hinge, not as background mood.\n\nAt 0:09 Eris' theme enters on piano: it opens in C major, immediately slips to the minor subdominant (Fm), then pivots into C minor and confirms it through a cadential reconfirmation. This harmonic 'bright-to-shadow' turn makes grief and unease part of the theme's DNA while keeping the mother's dialogue pristine.\n\nAt 0:32 Talia's motif is briefly hinted in Bb, intentionally clashing against Eris' C minor centre. The friction reads as vulnerability entering the room, not as a melodic decoration.\n\nImmediately after, the Banshee motif appears in violas and hammered dulcimer. The dulcimer's percussive string attack gives an 'alien' texture that suggests the monstrous and the unknown, with a controlled sense of threat. This is where the motif is allowed to speak clearly as the scene's spine, not just as a background hint.\n\nOn the mother's cough, the cue introduces the 'illness' idea (0:48 to the end): related to the Banshee material but not identical, so the film can later separate folklore as myth from illness as body, while still keeping them psychologically linked."
    },
    trackTitle: "Something Threatening",
    spottingNote: {
      it: "Entra sotto la battuta di apertura per seminare il motivo senza rubare l'attenzione.",
      en: "Enters under the opening line to seed the motif without pulling focus."
    },

    directorWanted: {
      it: "Mantenere il dialogo incontaminato lasciando che il mito risulti inquietante.",
      en: "Keep dialogue pristine while letting the myth feel unsettling."
    },
    directorAvoid: {
      it: "Niente stab horror. Niente crescendo sotto le battute.",
      en: "No horror stabs. No swelling under lines."
    },

    versionsTested: {
      A: { it: "Solo room tone e pad leggero. Dialogo chiaro ma nessun seme tematico.", en: "Room tone and light pad only. Clear dialogue but no thematic seed." },
      B: { it: "Bed di piano piu breve motivo sulla prima menzione della Banshee.", en: "Piano bed plus short motif on the first Banshee mention." },
      C: { it: "Motivo completo presto. Attira troppa attenzione lontano dalla storia.", en: "Full motif early. Draws too much attention away from the story." }
    },
    finalChoice: {
      it: "B, perche pianta il motivo senza rubare l'attenzione dalla leggenda.",
      en: "B, because it planted the motif without pulling focus from the legend."
    },

    delivered: {
      it: "Mix finale piu alternate, etichettate chiaramente. Revisioni tracciate.",
      en: "Final mix plus alternates, clearly labelled. Revisions tracked."
    },
    technicalDeliverables: [
      { it: "Master stereo 48 kHz, 24-bit", en: "48 kHz, 24 bit stereo master" },
      { it: "Alt: motivo piu leggero", en: "Alt: lighter motif" },
      { it: "Stem: piano, archi, pad", en: "Stems: piano, strings, pads" }
    ],

    technicalNotes: [
      { it: "Formato delivery: WAV (linear PCM)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ]
  },
  {
    id: "scene-05",
    title: {
      it: "Un incontro ravvicinato nel bosco, dall'urlo al faccia a faccia (Rivelazione)",
      en: "A Close Encounter in the Wood, Scream to Face-to-Face (Reveal)"
    },
    projectLabel: "La Sonata Del Chaos",
    sceneType: "Reveal",
    duration: "01:02",
    tags: [
      "Reveal",
      "Motif handoff",
      "Celesta",
      "Low strings incipit",
      "Orchestral climb",
      "Running rhythm",
      "Hard stop"
    ],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/La%20Sonata%20Del%20Caos/La%20Sonata%20Del%20Caos%20A%20Close%20Encounter%20In%20The%20Wood/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/La%20Sonata%20Del%20Caos%20A%20Close%20Encounter%20In%20The%20Wood.jpg",

    context: {
      it: "La Sonata Del Chaos e un cortometraggio in cui un racconto di famiglia, i Basci (Banshee), passa da leggenda raccontata a forza reale dentro casa. La storia segue Eris nel lutto dopo la morte della sua insegnante di violino, e l'idea della Banshee diventa poi inseparabile da una malattia incurabile che colpisce la madre e poi Talia.\n\nIn questa scena Eris si sveglia da un incubo, sente Talia tossire, va a controllarla, poi sente la Banshee urlare dal bosco. Esce per affrontarla e la trova faccia a faccia.",
      en: "La Sonata Del Chaos is a short film where a family folktale, the Basci (Banshee), shifts from a spoken legend into a real force inside the home. The story follows Eris through grief after her violin teacher’s death, and the Banshee idea later becomes inseparable from an incurable illness that hits the mother and then Talia.\n\nIn this scene Eris wakes from a nightmare, hears Talia coughing, checks on her, then hears the Banshee screaming from the woods. She goes outside to confront it and finds it face-to-face."
    },
    goal: {
      it: "Trasformare un cue notturno domestico in una minaccia esterna reale in un arco pulito. Partire dalla presenza fragile di Talia, introdurre l'identita della Banshee nel momento in cui si sente l'urlo, spingere la corsa di Eris con il ritmo, poi fermare la musica esattamente alla prima visione della Banshee cosi la rivelazione cade in immagine e la battuta resta chiara.",
      en: "Turn a domestic night cue into a real external threat in one clean arc. Start from Talia’s fragile presence, introduce the Banshee identity the moment the scream is heard, drive Eris’ run with rhythm, then stop the music exactly on the first sight of the Banshee so the reveal lands on picture and the line can stay clear."
    },
    chosen: {
      key: "B",
      summary: {
        it: "Motivo di Talia al celesta a 00:00, incipit della Banshee nei contrabbassi a 00:20, salita orchestrale e spinta ritmica per la corsa, stop secco sulla rivelazione.",
        en: "Talia motif on celesta at 00:00, Banshee incipit in contrabasses at 00:20, orchestral climb and rhythmic drive for the run, hard stop on reveal."
      },
      reason: {
        it: "Bilancia il passaggio di identita con la propulsione e lascia pulita la rivelazione.",
        en: "Balances identity handoff with propulsion and leaves the reveal clean."
      }
    },
    result: {
      it: "Il pubblico percepisce la minaccia come identita, non come generico mood horror. L'escalation motiva il movimento di Eris e lo stop netto fa arrivare il faccia a faccia come shock visivo invece che come stinger musicale.",
      en: "The audience feels the threat arrive as an identity, not as generic horror mood. The escalation motivates Eris’ movement, and the hard stop makes the face-to-face moment hit as a visual shock rather than a musical sting."
    },
    trackTitle: "A Close Encounter in the Wood",
    timing: {
      in: {
        time: "00:00",
        label: { it: "Entra il motivo di Talia al celesta.", en: "Talia motif enters on celesta." }
      },
      turn: {
        time: "00:20",
        label: {
          it: "L'incipit della Banshee parte nei contrabbassi, poi sale attraverso gli archi mentre Eris corre nel bosco.",
          en: "Banshee incipit starts in contrabasses, then climbs through the strings as Eris runs into the woods."
        }
      },
      out: {
        time: "01:02",
        label: { it: "Il cue finisce esattamente alla prima visione della Banshee.", en: "Cue ends exactly on the first sight of the Banshee." }
      }
    },
    spottingNote: {
      it: "Nessun segnale horror anticipato. Usa un passaggio di identita chiaro a 00:20, poi trasforma il motivo in propulsione per la corsa. Chiudi con uno stop secco sulla rivelazione cosi l'immagine, l'urlo e la battuta restano il focus.",
      en: "No early horror signalling. Use a clear identity handoff at 00:20, then convert the motif into propulsion for the run. End with a hard stop on the reveal so the image, the scream, and the line remain the focus."
    },

    directorWanted: {
      it: "Una escalation credibile dall'interno della casa al bosco. Spazio chiaro per l'urlo. Niente stinger da trailer. Lascia che la rivelazione cada in immagine.",
      en: "A believable escalation from inside the house to the woods. Clear space for the scream. No trailer stings. Let the reveal land on picture."
    },
    directorAvoid: {
      it: "Pad horror generici. Jump scare telefonati. Musica che continua sotto la rivelazione e ruba attenzione al faccia a faccia.",
      en: "Generic horror pads. Telegraphed jump scares. Music continuing under the reveal and stealing focus from the face-to-face moment."
    },

    versionsTested: {
      A: {
        it: "Solo atmosfera, tenere il motivo per la rivelazione. Troppo neutro e la corsa risulta meno motivata.",
        en: "Atmosphere only, save the motif for the reveal. Too neutral and the run feels less motivated."
      },
      B: {
        it: "Motivo di Talia al celesta a 00:00, incipit della Banshee nei contrabbassi a 00:20, salita orchestrale in violoncelli, viole, violini, poi spinta piu ritmica per la corsa, stop secco sulla rivelazione.",
        en: "Talia motif on celesta at 00:00, Banshee incipit in contrabasses at 00:20, orchestral climb into celli, violas, violins, then a more rhythmic drive for the run, hard stop on reveal."
      },
      C: {
        it: "Tema della Banshee dichiarato forte prima dell'urlo. Annuncia il mostro troppo presto e uccide la scoperta.",
        en: "Banshee theme stated strongly before the scream. It announces the monster early and kills the discovery."
      }
    },
    finalChoice: { it: "B", en: "B" },

    delivered: {
      it: "Mix finale piu alternate, etichettate chiaramente. Revisioni tracciate.",
      en: "Final mix plus alternates, clearly labelled. Revisions tracked."
    },
    technicalDeliverables: [
      { it: "Master stereo 48 kHz, 24 bit", en: "48 kHz, 24 bit stereo master" },
      { it: "Alt: senza musica", en: "Alt: no-music" },
      { it: "Stem: pad, rumore di sala", en: "Stems: pads, room tone" }
    ],
    musicalLanguage: {
      it: "Questo cue e costruito come un passaggio di identita.\n\n00:00: il motivo di Talia entra al celesta, incorniciando la casa come fragile e innocente.\n\n00:20 fino alla fine: l'incipit della Banshee parte nei contrabbassi e poi si trasferisce verso l'alto in violoncelli, viole e violini, come se la minaccia stesse risalendo dal terreno e occupando lo spazio sonoro. Quando Eris corre nel bosco la scrittura diventa piu ritmica, trasformando il motivo in propulsione invece che in colore horror statico.\n\nIl cue finisce esattamente quando Eris vede la Banshee, creando uno stop secco che lascia il faccia a faccia cadere sull'immagine invece che su uno stinger musicale.",
      en: "This cue is built as an identity handoff.\n\n00:00: Talia’s motif enters on celesta, framing the house as fragile and innocent.\n\n00:20 to end: the Banshee incipit starts in contrabasses, then transfers upward to celli, violas and violins, as if the threat is rising out of the ground and taking over the sonic space. As Eris runs into the woods the writing becomes more rhythmic, turning the motif into propulsion rather than a static horror colour.\n\nThe cue ends exactly when Eris sees the Banshee, creating a hard stop that lets the face-to-face moment land on the image instead of on a musical sting."
    },

    technicalNotes: [
      { it: "Formato delivery: WAV (linear PCM)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" },
      { it: "Alt: senza musica", en: "Alt: no-music" },
      { it: "Stem: pad, rumore di sala", en: "Stems: pads, room tone" }
    ]
  },
  {
    id: "scene-04",
    title: { it: "Addio di Talia, l'ultima storia (Rivelazione)", en: "Talia's Farewell, Last Story (Reveal)" },
    projectLabel: "La Sonata Del Chaos",
    sceneType: "Reveal",
    duration: "02:00",
    tags: ["Reveal", "Emotion", "Release", "Dialogue support"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/La%20Sonata%20Del%20Caos/La%20Sonata%20Del%20Caos%20Talia_s%20Farewell/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/La%20Sonata%20Del%20Caos%20Talia_s%20Farewell.jpg",

    context: {
      it: "La Sonata Del Chaos e un cortometraggio in cui un racconto di famiglia, i Basci (Banshee), passa da leggenda raccontata a forza reale dentro casa, poi inseparabile da una malattia incurabile che colpisce la madre e poi Talia.\n\nIn questa scena Eris legge per l'ultima volta la storia preferita di Talia. La musica funziona come un'elegia morbida: non commenta la morte, accompagna l'atto d'amore che la supera.",
      en: "La Sonata Del Chaos is a short film where a family folktale, the Basci (Banshee), shifts from a spoken legend into a real force inside the home, later inseparable from an incurable illness that hits the mother and then Talia.\n\nIn this scene Eris reads Talia’s favourite story one last time. The music functions as a soft eulogy: it does not comment on death, it accompanies the act of love that survives it."
    },
    goal: {
      it: "Scrivere un'elegia funebre che resti delicata e intima, sostenendo la lettura di Eris senza trasformare la scena in melodramma. Far sentire Talia pura e presente anche mentre la malattia vince, e lasciare che il cue porti l'addio senza rubare il focus alla storia.",
      en: "Write a funeral elegy that stays gentle and intimate, supporting Eris reading without turning the scene into melodrama. Make Talia feel pure and present even as the illness wins, and let the cue carry the goodbye without stealing focus from the story."
    },
    chosen: {
      key: "B",
      summary: {
        it: "Melodia guidata dagli archi con letto di synth morbido e coro senza parole, trattenuta sotto la lettura.",
        en: "Strings-led melody with soft synth bed and wordless choir, held back under the reading."
      },
      reason: {
        it: "Mantiene l'addio intimo e con il dialogo in primo piano senza melodramma.",
        en: "Keeps the farewell intimate and dialogue-first without melodrama."
      }
    },
    result: {
      it: "La scena si percepisce come un addio tenero piu che come un colpo drammatico. La musica comunica amore e dignita, con un senso quieto di inevitabilita. Talia e inquadrata come innocente, mentre l'ombra della Banshee resta implicata, non dichiarata.",
      en: "The scene feels like a tender farewell rather than a dramatic hit. The music reads as love and dignity, with a quiet sense of inevitability. Talia is framed as innocent, while the shadow of the Banshee remains implied, not announced."
    },
    trackTitle: "Talia's Farewell",
    timing: {
      in: {
        time: "00:00",
        label: { it: "Eris legge la storia preferita di Talia.", en: "Eris reads Talia’s favourite story." }
      },
      out: { time: "02:00", label: { it: "Fine del beat di addio.", en: "End of the farewell beat." } }
    },
    spottingNote: {
      it: "Il cue deve restare sotto la voce e respirare con la lettura. Niente segnali horror. Nessun gesto da 'spavento'. L'emozione arriva da calore, trattenimento e una lenta resa armonica.",
      en: "The cue must stay under the voice and breathe with the reading. No horror signalling. No ‘scare’ gesture. The emotion comes from warmth, restraint, and a slow harmonic surrender."
    },

    directorWanted: { it: "Elegia intima, dialogo in primo piano. Niente melodramma.", en: "Intimate, dialogue-first elegy. No melodrama." },
    directorAvoid: { it: "Segnali horror. Over-scoring. Coprire la lettura.", en: "Horror signalling. Over-scoring. Masking the reading." },

    versionsTested: {
      A: { it: "Solo pad e coro. Troppo vago, mancava un contorno emotivo.", en: "Only pads and choir. Too vague, lacked emotional contour." },
      B: {
        it: "Melodia guidata dagli archi con letto di synth morbido e coro senza parole, trattenuta dinamicamente sotto la lettura.",
        en: "Strings-led melody with soft synth bed and wordless choir, held back dynamically under the reading."
      },
      C: { it: "Swell orchestrale piu forte. Sembrava teatrale e rubava il focus.", en: "Stronger orchestral swell. Felt theatrical and pulled focus." }
    },
    finalChoice: { it: "B", en: "B" },

    delivered: {
      it: "Mix finale piu alternate, etichettate chiaramente. Revisioni tracciate.",
      en: "Final mix plus alternates, clearly labelled. Revisions tracked."
    },
    technicalDeliverables: [
      { it: "Master stereo 48 kHz, 24 bit", en: "48 kHz, 24 bit stereo master" },
      { it: "Alt: pulsazione piu leggera", en: "Alt: lighter pulse" },
      { it: "Stem: pulsazione, colpi bassi, texture", en: "Stems: pulse, low hits, textures" }
    ],
    musicalLanguage: {
      it: "Re minore, costruito come una ninna nanna che lentamente diventa un requiem.\n\nIl cue parte a 00:00 con archi caldi, un letto di synth morbido e coro senza parole, non per drammatizzare il momento ma per farlo sentire sacro e vicino, come una lode funebre sussurrata. L'orchestrazione resta volutamente leggera, cosi la lettura di Eris rimane in primo piano e la musica sembra un respiro privato attorno a essa.\n\nArmonicamente il cue sta in Re minore, un tono intero sopra il centro della Banshee, come se l'innocenza di Talia fosse posta 'sopra' la maledizione invece che dentro. Quella distanza e il punto: la malattia vince fisicamente, ma la musica inquadra Talia come intatta nello spirito. Il coro resta puro e non teatrale, quasi aria, mentre gli archi portano la melodia con linee lunghe e continue, evitando attacchi netti.\n\nNell'ultima parte l'armonia smette di cercare e semplicemente accetta. Il cue non si risolve con trionfo. Si risolve con tenerezza. Finisce a 02:00 come l'ultima pagina di una storia che si chiude, delicatamente, senza rumore.",
      en: "D minor, built as a lullaby that slowly becomes a requiem.\n\nThe cue starts at 00:00 with warm strings, a soft synth bed, and wordless choir, not to dramatise the moment, but to make it feel sacred and close, like a whispered funeral praise. The orchestration stays light on purpose, so Eris’ reading remains the foreground and the music feels like a private breath around it.\n\nHarmonically the cue sits in D minor, one whole step above the Banshee’s centre, as if Talia’s innocence is placed ‘above’ the curse rather than inside it. That distance is the point: the illness wins physically, but the music frames Talia as untouched in spirit. The choir stays pure and non-theatrical, almost like air, while the strings carry the melody with long, unbroken lines, avoiding sharp attacks.\n\nBy the final stretch the harmony stops searching and simply accepts. The cue does not resolve with triumph. It resolves with tenderness. It ends at 02:00 like the last page of a story being closed, gently, without noise."
    },

    technicalNotes: [
      { it: "Formato delivery: WAV (linear PCM)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" },
      { it: "Alt: pulsazione piu leggera", en: "Alt: lighter pulse" },
      { it: "Stem: pulsazione, colpi bassi, texture", en: "Stems: pulse, low hits, textures" }
    ]
  },
  {
    id: "claudio-re-opening-titles-storm-theme",
    title: {
      it: "Titoli di testa, risonanza di vetro e Storm Theme (Main Titles)",
      en: "Opening Titles, Glass Resonance and the Storm Theme (Main Titles)"
    },
    projectLabel: "Claudio re",
    sceneType: "Modern orchestral",
    duration: "01:48",
    tags: ["Opening titles", "Modern orchestra", "Resonant texture", "Leitmotif", "Power paranoia"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Claudio%20Re/Claudio%20Re%20The%20Storm%20Case%20Study/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/Claudio%20Re%20The%20Storm%20Case%20Study.jpg",

    context: {
      it: "Claudio re e' ispirato ad Amleto. Claudio uccide il fratello per prendere la corona e la regina, poi governa sotto una superficie di stabilita' mentre il crimine continua a riecheggiare a corte. La sua colpa e' reale, ma il pentimento no: rifiuta il prezzo della redenzione perche' non vuole rinunciare a cio' che ha rubato. Quella frattura diventa paranoia, una fredda logica di potere: se e' salito col sangue, col sangue puo' essere tolto.\n\nI titoli di testa introducono l'idea centrale del film, la \"tempesta\": non il meteo, ma la perturbazione irreversibile che Claudio ha scatenato, morale, politica e psicologica. Qui la musica deve far sentire un mondo gia' incrinato dal primo fotogramma e fissare lo Storm Theme come conseguenza che avanza, non come atmosfera decorativa.",
      en: "Claudio re is inspired by Hamlet. Claudio murders his own brother to take the crown and the queen, then rules under a surface of stability while the crime keeps echoing through the court. His guilt is real, but his repentance is not: he refuses the price of redemption because he will not give up what he stole. That split turns into paranoia, a cold logic of power: if he rose through blood, he can be taken by blood.\n\nThe opening titles introduce the film’s core idea, the “storm”: not weather, but the irreversible disturbance Claudio has unleashed, moral, political, and psychological. The score’s job here is to make the world feel cracked from the first frame, and to establish the storm theme as consequence advancing, not as decorative mood."
    },
    goal: {
      it: "Fissare fin dal primo fotogramma la frattura morale e politica del film: un mondo che appare stabile ma vibra di colpa e paranoia. Stabilire lo Storm Theme come motore delle conseguenze e inquadrare Claudio come un uomo con colpa reale ma senza pentimento, intrappolato nella logica del potere.",
      en: "Set the film’s moral and political fracture from the first frame: a world that looks stable but vibrates with guilt and paranoia. Establish the “storm” theme as the engine of consequence, and frame Claudio as a man with real guilt but no repentance, trapped in the logic of power."
    },
    chosen: {
      key: "B",
      summary: {
        it: "Orchestra moderna + pressione dei synth con risonanza di vetro sfregato, poi lo Storm Theme introdotto come un'avanzata lenta.",
        en: "Modern orchestra + synth pressure with bowed-glass resonance, then storm theme introduced as a slow advance."
      },
      reason: {
        it: "Trasmette inevitabilita' senza perdere peso tragico o chiarezza.",
        en: "Delivers inevitability without losing tragic weight or clarity."
      }
    },
    result: {
      it: "I titoli arrivano con tensione immediata e inevitabilita'. La risonanza vitrea si percepisce come una crepa nel mondo, e lo Storm Theme appare come una forza che avanza piu' che come atmosfera decorativa, allineando lo spettatore al controllo interno instabile di Claudio.",
      en: "The titles land with immediate tension and inevitability. The glass-like resonance reads as a crack in the world, and the storm theme feels like an advancing force rather than decorative atmosphere, aligning the viewer with Claudio’s unstable inner control."
    },
    trackTitle: "Storm Theme (Opening Titles)",
    timing: {
      in: {
        time: "00:00",
        label: {
          it: "Iniziano i titoli di testa. La risonanza di vetro sfregato entra solo sulla comparsa del titolo.",
          en: "Opening titles begin. The bowed-glass resonance hits only on the title reveal."
        }
      },
      turn: {
        time: "01:12",
        label: {
          it: "Dopo un breve crescendo di archi e ottoni, esplode lo Storm Theme.",
          en: "After a brief strings-and-brass crescendo, the storm theme detonates."
        }
      },
      out: {
        time: "01:48",
        label: {
          it: "Fine del cue dei titoli di testa.",
          en: "End of opening titles cue."
        }
      }
    },
    spottingNote: {
      it: "La risonanza di vetro sfregato e' un colpo firma legato alla comparsa del titolo, non un tappeto continuo. Il cue mantiene la tensione sotto la superficie, poi un breve crescendo di archi e ottoni detona nello Storm Theme. La tempesta deve sembrare una rottura improvvisa del controllo, non un crescendo graduale, e deve restare di classe e leggibile, non da trailer.",
      en: "The bowed-glass resonance is a signature hit tied to the title reveal, not a continuous bed. The cue holds tension under the surface, then a short crescendo in strings and brass detonates into the storm theme. The storm must feel like a sudden rupture in control, not a gradual swell, and it should remain premium and legible rather than trailer-like."
    },

    directorWanted: {
      it: "Tensione inevitabile. Peso orchestrale moderno con pressione dei synth controllata. Identita' tematica chiara fin dall'inizio.",
      en: "Inevitable tension. Modern orchestral weight with controlled synth pressure. A clear thematic identity from the start."
    },
    directorAvoid: {
      it: "Colpi da trailer generici. Horror sopra le righe. Qualsiasi cosa che sembri un Batman copiato invece di un linguaggio su misura.",
      en: "Generic trailer hits. Over-the-top horror. Anything that feels like copied Batman rather than a tailored language."
    },

    versionsTested: {
      A: {
        it: "Solo orchestra. Troppo d'epoca, mancava il taglio psicologico.",
        en: "Orchestra-only. Too period, lacked psychological edge."
      },
      B: {
        it: "Orchestra moderna + pressione dei synth con risonanza di vetro sfregato, poi lo Storm Theme introdotto come un'avanzata lenta.",
        en: "Modern orchestra + synth pressure with bowed-glass resonance, then storm theme introduced as a slow advance."
      },
      C: {
        it: "Dominanza synth piu' pesante. Meno cinematografico e riduceva il peso tragico.",
        en: "Heavier synth dominance. Felt less cinematic and reduced the tragic weight."
      }
    },
    finalChoice: { it: "B", en: "B" },

    delivered: {
      it: "Mix finale piu' alternate, etichettate chiaramente. Revisioni tracciate.",
      en: "Final mix plus alternates, clearly labelled. Revisions tracked."
    },
    technicalDeliverables: [
      { it: "Formato delivery: WAV (PCM lineare)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ],
    musicalLanguage: {
      it: "Orchestra moderna ibrida e synth. Il colore risonante del vetro sfregato e' usato come colpo firma solo quando appare il titolo, una vibrazione breve e tagliente che si legge come una crepa nel mondo. Sotto, la tensione resta trattenuta finche' un breve crescendo di archi e ottoni accumula pressione, poi lo Storm Theme irrompe all'improvviso, come il controllo che si spezza in conseguenza. Il comportamento di riferimento da Giacchino in The Batman e' usato come modello di peso e chiarezza (autorita' nel registro grave, identita' tematica semplice), ma l'impatto qui e' definito dal contrasto: prima contenimento, poi un'eruzione tematica netta. La tempesta non e' meteo. E' la perturbazione irreversibile di Claudio resa udibile.",
      en: "Hybrid modern orchestra and synth. The bowed-glass resonant colour is used as a signature hit only when the title appears, a brief, cutting vibration that reads as a crack in the world. Underneath, tension is held back until a short crescendo in strings and brass builds pressure, then the storm theme breaks in suddenly, like control snapping into consequence. The reference behaviour from Giacchino’s The Batman is used as a model for weight and clarity (low-register authority, simple thematic identity), but the impact here is defined by contrast: restraint first, then a sharp thematic eruption. The storm is not weather. It is Claudio’s irreversible disturbance made audible."
    },

    technicalNotes: [
      { it: "Formato delivery: WAV (PCM lineare)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ]
  },
  {
    id: "claudio-re-my-sin-is-rotten",
    title: {
      it: "My Sin is Rotten, la trappola della corona (Dialogo)",
      en: "My Sin is Rotten, The Crown Trap (Dialogue)"
    },
    projectLabel: "Claudio re",
    sceneType: "Dialogue",
    duration: "01:27",
    tags: [
      "Dialogue",
      "Monologue",
      "Guilt without repentance",
      "Paranoia",
      "Ambient synth",
      "Piano motif",
      "Viola da gamba",
      "Hurdy gurdy",
      "Monochord",
      "Trombones",
      "Harmonic corrosion"
    ],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Claudio%20Re/Claudio%20Re%20My%20Sin%20Is%20Rotten/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/Claudio%20Re%20My%20Sin%20Is%20Rotten.jpg",

    context: {
      it: "Claudio re e' ispirato ad Amleto. Claudio uccide il fratello per prendere la corona e la regina, poi governa sotto una superficie di stabilita' mentre il crimine continua a riecheggiare a corte. La sua colpa e' reale, ma rifiuta il prezzo del pentimento perche' non vuole rinunciare a cio' che ha rubato.\n\nIn questo monologo definisce il peccato come marcio e ammette che e' la piu' antica maledizione, l'uccisione di un fratello, poi rivela la trappola: il perdono non puo' \"passare\" finche' resta in possesso dei frutti dell'omicidio, la corona, l'ambizione e la regina. Il cue rispecchia questa contraddizione: una patina di nobilta' che fatica a reggere sopra qualcosa di fondamentalmente corrotto.",
      en: "Claudio re is inspired by Hamlet. Claudio murders his own brother to take the crown and the queen, then rules under a surface of stability while the crime keeps echoing through the court. His guilt is real, but he refuses the price of repentance because he will not give up what he stole.\n\nIn this monologue he names the sin as rotten and admits it is the oldest curse, the murder of a brother, then exposes the trap: forgiveness cannot ‘go through’ while he remains in possession of the fruits of the murder, the crown, ambition, and the queen. The cue mirrors that contradiction: a veneer of nobility struggling to stand over something fundamentally corrupt."
    },
    goal: {
      it: "Sostenere la confessione di Claudio senza concedergli redenzione. Tenere il dialogo intatto mentre la \"marcescenza\" deve essere fisica e ineludibile: colpa reale, nessun pentimento, paranoia come logica del potere.",
      en: "Support Claudio’s confession without granting him redemption. Keep the dialogue pristine while making the ‘rottenness’ feel physical and inescapable: real guilt, no repentance, and paranoia as the logic of power."
    },
    chosen: {
      key: "B",
      summary: {
        it: "Motivo di piano circondato da synth ambientali scuri, con ombre orchestrali contenute e \"marciume\" armonico controllato tramite note estranee.",
        en: "Piano motif surrounded by dark ambient synth, with restrained orchestral shadows and controlled harmonic ‘rot’ via non-chord tones."
      },
      reason: {
        it: "Rende la confessione intima, ma innesta inquietudine senza melodramma.",
        en: "Keeps the confession intimate while embedding unease without melodrama."
      }
    },
    result: {
      it: "Il monologo arriva come autoconsapevolezza intrappolata nel diniego. Il cue suona come corrosione interna piu' che tristezza, e la tensione resta sotto le parole senza coprirle.",
      en: "The monologue lands as self-awareness trapped in denial. The cue reads as inner corrosion rather than sadness, and the tension stays under the speech without masking it."
    },
    trackTitle: "My Crown, My Ambition, My Queen",
    timing: {
      in: {
        time: "00:00",
        label: {
          it: "Claudio: \"Il mio peccato e' marcio e il suo lezzo arriva al cielo.\"",
          en: "Claudio: “My sin is rotten and its stench reaches heaven.”"
        }
      },
      out: {
        time: "01:27",
        label: {
          it: "Fine del beat di confessione. La musica si scioglie senza redenzione.",
          en: "End of the confession beat. Music releases without redemption."
        }
      }
    },
    spottingNote: {
      it: "Dialogo in primo piano, ma il cue ha un chiaro reveal tematico. Il vero tema di Claudio appare in re minore nella sezione \"Light! Light!\". Prima della battuta \"My queen?\" la melodia e' affidata alla viola da gamba per introdurre un colore storico. Su \"my queen\" entra l'orchestra completa, sostenuta dagli strumenti storici e da un letto di synth scuro: suona come auto-mitizzazione epica, poi la maschera scivola. Il finale usa accordi volutamente dissonanti e un retrogusto \"marcio\" degli ottoni, con i tromboni che macchiano le ultime parole, come ponte narrativo verso la sequenza successiva in cui Claudio affronta The Spectre in un duello immaginato e viene ucciso.",
      en: "Dialogue-first, but the cue has a clear thematic reveal. Claudio’s real theme appears in D minor on the ‘Light! Light!’ section. Before the line “My queen?” the melody is carried by viola da gamba to introduce historical colour. On “my queen” the full orchestra joins, reinforced by the historical instruments and a dark synth bed: it reads as epic self-mythologising, then the mask slips. The ending uses intentionally dissonant chords and a rotten brass aftertaste, with trombones staining the final words, as a narrative bridge into the following sequence where Claudio confronts the spectre in an imagined duel and is killed."
    },

    directorWanted: {
      it: "Decadenza psicologica compatibile col dialogo. Patina nobile con corruzione sotto.",
      en: "Dialogue-safe psychological decay. Noble veneer with corruption underneath."
    },
    directorAvoid: {
      it: "Cadenze redentive, grandi swell, qualsiasi cosa che copra le parole.",
      en: "Redemptive cadences, big swells, anything that masks the words."
    },

    versionsTested: {
      A: {
        it: "Solo ambiente synth. Troppo piatto, mancava l'identita' del personaggio.",
        en: "Only synth ambience. Too flat, lacked character identity."
      },
      B: {
        it: "Motivo di piano + contaminazione ambient scura, poi reveal del tema in re minore con colore storico e coda di ottoni marcia.",
        en: "Piano motif + dark ambient contamination, then D minor theme reveal with historical colour and rotten brass tail."
      },
      C: {
        it: "Piu' emozione orchestrale. Sembrava empatico e riduceva il marcio.",
        en: "More orchestral emotion. Felt sympathetic and reduced the rot."
      }
    },
    finalChoice: { it: "B", en: "B" },

    delivered: {
      it: "Mix finale piu' alternate, etichettate chiaramente. Revisioni tracciate.",
      en: "Final mix plus alternates, clearly labelled. Revisions tracked."
    },
    technicalDeliverables: [
      { it: "Formato delivery: WAV (PCM lineare)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ],
    musicalLanguage: {
      it: "Il linguaggio armonico e' costruito attorno al motivo di pianoforte di Claudio, tenuto esposto e intimo, poi circondato da strati di synth ambientali scuri come se la camera entrasse nella sua mente malata e nel suo spazio emotivo distorto. Il piano porta la confessione \"umana\", mentre il letto di synth agisce come una nebbia interna che non si dissolve.\n\nPer sottolineare il marciume, l'armonia e' volutamente contaminata: note estranee, cromatismi di vicinanza e note fuori accordo si appoggiano al centro armonico implicito, creando un disagio controllato che suona come decomposizione del pensiero piu' che dissonanza da jump-scare. Queste tensioni devono restare piccole e persistenti, senza diventare gesto drammatico, cosi' il pubblico sente il lezzo come qualcosa di incorporato in lui.\n\nGli elementi orchestrali appaiono con parsimonia, come ombre, aggiungendo peso senza rubare parola. Il cue finisce a 01:27 senza risoluzione redentiva, lasciando Claudio sospeso tra confessione e rifiuto.",
      en: "The harmonic language is built around Claudio’s piano motif, kept exposed and intimate, then surrounded by dark ambient synth layers as if the camera is entering his sick mind and distorted emotional space. The piano carries the ‘human’ confession, while the synth bed acts like an internal fog that never clears.\n\nTo underline the rot, the harmony is deliberately contaminated: non-chord tones, chromatic neighbours and foreign notes sit against the implied chordal centre, creating a controlled discomfort that reads as thought decay rather than jump-scare dissonance. These tensions must stay small and persistent, never turning into a dramatic gesture, so the audience feels the stench as something embedded in him.\n\nOrchestral elements appear sparingly as shadows, adding weight without stealing speech. The cue ends at 01:27 without a redemptive resolution, leaving Claudio suspended between confession and refusal."
    },

    technicalNotes: [
      { it: "Formato delivery: WAV (PCM lineare)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ]
  },
  {
    id: "scene-09",
    title: {
      it: "My Crown, My Ambition, My Queen. La trappola della corona (Dialogo)",
      en: "My Crown, My Ambition, My Queen. The Crown Trap (Dialogue)"
    },
    projectLabel: "Claudio re",
    sceneType: "Dialogue",
    duration: "01:27",
    tags: [
      "Dialogue",
      "Monologue",
      "Guilt without repentance",
      "Paranoia",
      "Ambient synth",
      "Piano motif",
      "Viola da gamba",
      "Hurdy gurdy",
      "Monochord",
      "Trombones",
      "Harmonic corrosion"
    ],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Claudio%20Re/Claudio%20Re%20My%20Crown%2C%20My%20Ambition%2C%20My%20Queen%20Case%20St/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/Claudio%20Re%20My%20Crown%2C%20My%20Ambition%2C%20My%20Queen%20Case%20St.jpg",

    context: {
      it: "Claudio re e' ispirato ad Amleto. Claudio uccide il fratello per prendere la corona e la regina, poi governa sotto una superficie di stabilita' mentre il crimine continua a riecheggiare a corte. La sua colpa e' reale, ma rifiuta il prezzo del pentimento perche' non vuole rinunciare a cio' che ha rubato.\n\nIn questo monologo definisce il peccato come marcio e ammette che e' la piu' antica maledizione, l'uccisione di un fratello, poi rivela la trappola: il perdono non puo' \"passare\" finche' resta in possesso dei frutti dell'omicidio, la corona, l'ambizione e la regina. Il cue rispecchia questa contraddizione: una patina di nobilta' che fatica a reggere sopra qualcosa di fondamentalmente corrotto.",
      en: "Claudio re is inspired by Hamlet. Claudio murders his own brother to take the crown and the queen, then rules under a surface of stability while the crime keeps echoing through the court. His guilt is real, but he refuses the price of repentance because he will not give up what he stole.\n\nIn this monologue he names the sin as rotten and admits it is the oldest curse, the murder of a brother, then exposes the trap: forgiveness cannot ‘go through’ while he remains in possession of the fruits of the murder, the crown, ambition, and the queen. The cue mirrors that contradiction: a veneer of nobility struggling to stand over something fundamentally corrupt."
    },
    goal: {
      it: "Sostenere la confessione di Claudio senza concedergli redenzione. Tenere il dialogo intatto mentre la \"marcescenza\" deve essere fisica e ineludibile: colpa reale, nessun pentimento, paranoia come logica del potere.",
      en: "Support Claudio’s confession without granting him redemption. Keep the dialogue pristine while making the ‘rottenness’ feel physical and inescapable: real guilt, no repentance, and paranoia as the logic of power."
    },
    chosen: {
      key: "B",
      summary: {
        it: "Motivo di piano + contaminazione ambient scura, poi reveal del tema in re minore con colore storico e coda di ottoni marcia.",
        en: "Piano motif + dark ambient contamination, then D minor theme reveal with historical colour and rotten brass tail."
      },
      reason: {
        it: "Preserva il dialogo mentre rivela il vero tema di Claudio e il suo decadimento.",
        en: "Preserves dialogue while revealing Claudio’s true theme and decay."
      }
    },
    result: {
      it: "Il monologo arriva come autoconsapevolezza intrappolata nel diniego. Il cue suona come corrosione interna piu' che tristezza, e la tensione resta sotto le parole senza coprirle.",
      en: "The monologue lands as self-awareness trapped in denial. The cue reads as inner corrosion rather than sadness, and the tension stays under the speech without masking it."
    },
    trackTitle: "My Crown, My Ambition, My Queen",
    timing: {
      in: {
        time: "00:00",
        label: {
          it: "Claudio: \"Il mio peccato e' marcio e il suo lezzo arriva al cielo.\"",
          en: "Claudio: “My sin is rotten and its stench reaches heaven.”"
        }
      },
      out: {
        time: "01:27",
        label: {
          it: "Fine del beat di confessione. La musica si scioglie senza redenzione.",
          en: "End of the confession beat. Music releases without redemption."
        }
      }
    },
    spottingNote: {
      it: "Dialogo in primo piano, ma il cue ha un chiaro reveal tematico. Il vero tema di Claudio appare in re minore nella sezione \"Light! Light!\". Prima della battuta \"My queen?\" la melodia e' affidata alla viola da gamba per introdurre un colore storico. Monocordo e ghironda entrano come marcatori di texture antica, mentre i tromboni aggiungono un retrogusto marcio. Il finale usa accordi volutamente dissonanti come ponte narrativo verso la sequenza successiva, in cui Claudio affronta The Spectre in un duello immaginato e viene ucciso.",
      en: "Dialogue-first, but the cue has a clear thematic reveal. Claudio’s real theme appears in D minor on the ‘Light! Light!’ section. Before the line “My queen?” the melody is carried by viola da gamba to introduce historical colour. Monochord and hurdy gurdy enter as ancient-texture markers, while trombones add a rotten aftertaste. The ending uses intentionally dissonant chords as a narrative bridge into the following sequence, where Claudio confronts the spectre in an imagined duel and is killed."
    },

    directorWanted: {
      it: "Decadenza psicologica compatibile col dialogo. Patina nobile con corruzione sotto.",
      en: "Dialogue-safe psychological decay. Noble veneer with corruption underneath."
    },
    directorAvoid: {
      it: "Cadenze redentive, grandi swell, qualsiasi cosa che copra le parole.",
      en: "Redemptive cadences, big swells, anything that masks the words."
    },

    versionsTested: {
      A: {
        it: "Solo ambiente synth. Troppo piatto, mancava l'identita' del personaggio.",
        en: "Only synth ambience. Too flat, lacked character identity."
      },
      B: {
        it: "Motivo di piano + contaminazione ambient scura, poi reveal del tema in re minore con colore storico e coda di ottoni marcia.",
        en: "Piano motif + dark ambient contamination, then D minor theme reveal with historical colour and rotten brass tail."
      },
      C: {
        it: "Piu' emozione orchestrale. Sembrava empatico e riduceva il marcio.",
        en: "More orchestral emotion. Felt sympathetic and reduced the rot."
      }
    },
    finalChoice: { it: "B", en: "B" },

    delivered: {
      it: "Mix finale piu' alternate, etichettate chiaramente. Revisioni tracciate.",
      en: "Final mix plus alternates, clearly labelled. Revisions tracked."
    },
    technicalDeliverables: [
      { it: "Formato delivery: WAV (PCM lineare)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ],
    musicalLanguage: {
      it: "Il linguaggio armonico e' costruito attorno al motivo di pianoforte di Claudio, tenuto esposto e intimo, poi circondato da strati di synth ambientali scuri come se entrassimo nella sua mente malata e nel suo spazio emotivo distorto. Note estranee e non accordali contaminano il centro implicito, creando un disagio controllato e persistente che si legge come marciume morale piu' che dissonanza teatrale.\n\nNella sezione \"Light! Light!\" il cue rivela il tema di Claudio in pieno, in re minore. Ha un profilo drammatico, quasi \"nobile\", ma la nobilta' e' una patina: i tromboni sporcano la coda delle frasi con un retrogusto marcio, e le cadenze rifiutano una chiusura pulita. Prima di \"My queen?\" la linea e' affidata alla viola da gamba, e i colori storici (monocordo, ghironda) entrano per evocare il peso antico del racconto senza trasformarlo in pastiche.\n\nSulle parole \"my queen\" l'orchestrazione sboccia: entra l'orchestra completa, gli strumenti antichi restano presenti e il letto di synth si approfondisce, creando un'ondata epica di auto-giustificazione. Il cue poi smonta quella grandezza: gli accordi finali sono deliberatamente dissonanti e i tromboni portano la corruzione in superficie sulle ultime parole di Claudio. Non risolve come pentimento. Resta sospeso come conseguenza, progettato per collegarsi senza soluzione di continuita' alla sezione successiva in cui la colpa di Claudio diventa confronto e lui viene ucciso.",
      en: "The harmonic language is built around Claudio’s piano motif, kept exposed and intimate, then surrounded by dark ambient synth layers as if we are entering his sick mind and distorted emotional space. Non-chord tones and foreign notes contaminate the implied centre, creating a controlled, persistent discomfort that reads as moral rot rather than theatrical dissonance.\n\nOn the ‘Light! Light!’ section the cue reveals Claudio’s theme in full, in D minor. It carries a dramatic, almost ‘noble’ contour, but the nobility is a veneer: trombones stain the tail of phrases with a rotten aftertaste, and cadences refuse clean closure. Before “My queen?” the line is entrusted to viola da gamba, and historical colours (monochord, hurdy gurdy) enter to evoke the antique weight of the tale without turning it into pastiche.\n\nOn the words “my queen” the orchestration blooms: full orchestra joins, the ancient instruments remain present, and the synth bed deepens, creating an epic surge of self-justification. The cue then undercuts that grandeur: final chords are deliberately dissonant and the trombones bring the corruption to the surface on Claudio’s last words. It does not resolve as repentance. It hangs as consequence, designed to connect seamlessly into the following section where Claudio’s guilt turns into confrontation and he is killed."
    },

    technicalNotes: [
      { it: "Formato delivery: WAV (PCM lineare)", en: "Delivery format: WAV (linear PCM)" },
      { it: "Specifiche: 48 kHz, 24-bit", en: "Specs: 48 kHz, 24-bit" },
      { it: "Sync: allineato al picture finale", en: "Sync: aligned to final picture" }
    ]
  },
  {
    id: "scene-07",
    title: {
      it: "Nessun trucco lassu', The Spectre vince (Scontro visionario)",
      en: "No Shuffling Up There, The Spectre Wins (Vision Fight)"
    },
    projectLabel: "Claudio re",
    sceneType: "Action",
    duration: null,
    tags: [
      "Vision",
      "Guilt",
      "Spectre",
      "Dissonant braams",
      "Heartbeat kick",
      "Tempo automation",
      "Anxiety"
    ],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Claudio%20Re/Claudio%20Re%20The%20Spectre/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/Claudio%20Re%20The%20Spectre.jpg",

    context: {
      it: "\"Ma non lassu'? Ah no. Lassu' non c'e' inganno, eh? Li' l'azione esiste nella sua vera natura. E noi siamo costretti ad assistere, come mendicanti, sulla fronte della nostra colpa. Chiunque. E poi, cosa resta? [Musica]\"\n\nClaudio entra nel duello immaginato con The Spectre, viene dominato e pugnalato. La musica inizia quando finiscono le parole.",
      en: "“But not up there? Ah no. Up there there is no trickery, eh? There, action exists in its true nature. And we ourselves are compelled to bear witness, as beggars, on the forehead of our guilt. Anyone. And then, what remains? [Music]”\n\nClaudio enters the imagined duel with the Spectre, is dominated and stabbed. The music starts when the words end."
    },
    goal: {
      it: "Trasformare la colpa di Claudio in un evento fisico: ansia, paura, perdita di controllo. Rendere la sconfitta inevitabile.",
      en: "Turn Claudio’s guilt into a physical event: anxiety, fear, loss of control. Make the defeat inevitable."
    },
    chosen: {
      key: "C",
      summary: {
        it: "Braams piu' benders piu' un kick che accelera, poi rallenta fino allo stop sulla pugnalata.",
        en: "Braams plus benders plus a kick that accelerates, then slows to a stop on the stab."
      },
      reason: {
        it: "Rende il panico fisico e chiude la scena con uno stop narrativo netto.",
        en: "Makes the panic physical and closes the scene with a clean narrative stop."
      }
    },
    result: {
      it: "Il kick diventa un battito. Accelera con ansia e paura, poi rallenta fino a fermarsi precisamente sulla pugnalata. La sconfitta si legge come collasso.",
      en: "The kick becomes a heartbeat. It accelerates with anxiety and fear, then slows to a precise stop on the stab. The defeat reads as collapse."
    },
    trackTitle: "The Spectre",
    timing: {
      in: {
        time: "00:00",
        label: {
          it: "La musica entra subito dopo \"E poi, cosa resta?\"",
          en: "Music enters right after ‘And then, what remains?’"
        }
      },
      out: {
        time: null,
        label: {
          it: "The Spectre pugnala Claudio. Il kick si ferma.",
          en: "The Spectre stabs Claudio. The kick stops."
        }
      }
    },
    spottingNote: {
      it: "Il kick deve sembrare un battito, non un colpo da trailer.\nAccelerazione = panico.\nRallentamento = crollo.\nStop sulla pugnalata = punteggiatura narrativa.\nBraams = pressione della colpa.\nBenders = distorsione mentale.\nNiente eroismo, niente estetica \"cool\".",
      en: "The kick must feel like a heartbeat, not a trailer beat.\nAcceleration equals panic.\nSlowdown equals collapse.\nStop on the stab equals narrative punctuation.\nBraams equal the pressure of guilt.\nBenders equal mental distortion.\nNo heroism, no “cool” aesthetic."
    },

    directorWanted: {
      it: "Ansia claustrofobica. Paura fisica. Inevitabilita'. Realismo del battito. Sync duro sulla pugnalata.",
      en: "Claustrophobic anxiety. Physical fear. Inevitability. Heartbeat realism. Hard sync to the stab."
    },
    directorAvoid: {
      it: "Sensazione di azione epica. Risers da trailer. Tempo costante. Estetica \"cool\". Qualsiasi senso di vittoria.",
      en: "Epic action feel. Trailer risers. Constant tempo. “Cool” aesthetics. Any sense of victory."
    },

    versionsTested: {
      A: {
        it: "Solo braams dissonanti, nessun kick.",
        en: "Dissonant braams only, no kick."
      },
      B: {
        it: "Kick a tempo costante, senza rallentamento e senza stop.",
        en: "Kick at a constant tempo, no slowdown and no stop."
      },
      C: {
        it: "Braams piu' benders piu' un kick che accelera, poi rallenta fino allo stop sulla pugnalata.",
        en: "Braams plus benders plus a kick that accelerates, then slows to a stop on the stab."
      }
    },
    finalChoice: {
      it: "C, perche' il battito accelera e crolla sul colpo, rendendo la sconfitta inevitabile.",
      en: "C, because the heartbeat accelerates and collapses on the strike, making the defeat inevitable."
    },

    delivered: {
      it: "Mix finale, alternate dialogue-safe e stems consegnati con etichette chiare per la post (Braams, Benders, Kick, FX).",
      en: "Final mix, dialogue-safe alternate, and stems delivered with clear post labels (Braams, Benders, Kick, FX)."
    },
    technicalDeliverables: [
      { it: "Delivery: WAV, 48 kHz, 24-bit", en: "Delivery: WAV, 48 kHz, 24-bit" },
      { it: "Stems: Braams, Benders, Kick, FX (etichettati per la post)", en: "Stems: Braams, Benders, Kick, FX (labelled for post)" },
      { it: "Sync: stop del kick allineato alla pugnalata", en: "Sync: kick stop aligned to the stab" }
    ],
    musicalLanguage: {
      it: "Braams synth dissonanti e benders instabili. Kick con automazione di tempo che imita un battito: accelera con ansia e paura, poi rallenta progressivamente fino a fermarsi quando The Spectre pugnala Claudio.",
      en: "Dissonant synth braams and unstable benders. Kick with tempo automation that mimics a heartbeat: it accelerates with anxiety and fear, then progressively slows until it stops when the Spectre stabs Claudio."
    },

    technicalNotes: [
      { it: "Delivery: WAV, 48 kHz, 24-bit", en: "Delivery: WAV, 48 kHz, 24-bit" },
      { it: "Stems: Braams, Benders, Kick, FX (etichettati per la post)", en: "Stems: Braams, Benders, Kick, FX (labelled for post)" },
      { it: "Sync: stop del kick allineato alla pugnalata", en: "Sync: kick stop aligned to the stab" }
    ]
  },
  {
    id: "scene-10",
    title: {
      it: "What If A Man Can't Regret, la preghiera che fallisce (Dialogo)",
      en: "What If A Man Can't Regret, The Prayer That Fails (Dialogue)"
    },
    projectLabel: "Claudio re",
    sceneType: "Modern orchestral",
    duration: "01:03",
    tags: ["Release", "Emotion"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Claudio%20Re/Claudio%20Re%20What%20If%20A%20Man%20Can_t%20Regret%20Case%20Study/index.m3u8",
    posterImage: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/Claudio%20Re%20What%20If%20A%20Man%20Can_t%20Regret%20Case%20Study.jpg",

    context: {
      it: "\"...prova cosa puo' fare il pentimento. Cosa non puo' fare? Eppure cosa puo' fare se un uomo non puo' pentirsi? Morire, dormire, e un infarto. E con un sonno, dire che poniamo fine al dolore del cuore e ai mille naturali colpi della carne. E' una conclusione da desiderare, devotamente da desiderare. Morire, dormire—e non sogniamo forse? piegati, ostinati, e tu, cuore d'acciaio alle strette. Si', ma io orbito, come muscoli in un bambino, appena finito. Tutto puo' finire... ...pentendosi. [Musica]\"\n\nClaudio cerca un varco al pentimento ma resta intrappolato nel prezzo reale della redenzione. La scena funziona come un'eco distorta dei nodi centrali di Amleto: coscienza, colpa, l'impossibilita' dell'azione e il desiderio di una fine come fuga.",
      en: "“...try what repentance can do. What can it not do? Yet what can it do if a man cannot repent? To die, to sleep, and heart attack. And with a sleep, to say we end the heartache and the thousand natural shocks of flesh. This is a consummation to be wished, devoutly to be wished. To die, to sleep—do we not dream ahead? bent close, stubborn, and you, heart of steel snares. Yes, but I orbit, like muscles in a child, just gone. Everything can end... ...repenting. [Music]”\n\nClaudio searches for a path to repentance but remains trapped by the real price of redemption. The scene works as a distorted echo of Hamlet’s central knots: conscience, guilt, the impossibility of action, and the desire for an end as escape."
    },
    goal: {
      it: "Far percepire il pentimento come un'invocazione impossibile. Rendere il giudizio inevitabile e il destino percepibile negli strike, senza catarsi.",
      en: "Make repentance feel like an impossible invocation. Make judgment inevitable and fate perceptible in strikes, without catharsis."
    },
    chosen: {
      key: "C",
      summary: {
        it: "Drone + ostinato + tromboni + ingresso del tema su violini campionati sparsi + colpo.",
        en: "Drone + ostinato + trombones + theme entrance on sparse sampled violins + hit."
      },
      reason: {
        it: "Mantiene il giudizio in primo piano e spinge avanti il destino senza catarsi.",
        en: "Keeps judgment in the foreground and moves fate forward without catharsis."
      }
    },
    result: {
      it: "Il giudizio parte distante, poi si avvicina e diventa interno. Ostinato degli archi come prigione. Tromboni dissonanti ascendenti come escalation senza salvezza. Tema sui violini sparsi come marciume interiore e tragedia. Colpi come destino che avanza.",
      en: "Judgment starts distant, then closes in and becomes internal. String ostinato as a prison. Ascending dissonant trombones as escalation without salvation. Theme on sparse violins as inner rot and tragedy. Hits as fate advancing."
    },
    trackTitle: "What Can Repentance Do",
    timing: {
      in: {
        time: "00:00",
        label: { it: "La musica entra subito dopo \"...pentendosi.\"", en: "Music enters right after ‘…repenting.’" }
      },
      out: { time: null, label: { it: "Fine del cue.", en: "End of cue." } }
    },
    spottingNote: {
      it: "Niente linguaggio da trailer. Drone come giudizio, non groove. Archi come prigione. Tromboni come escalation senza redenzione. Colpi come sistema che avanza, non accenti \"cool\".",
      en: "No trailer language. Drone as judgment, not groove. Strings as prison. Trombones as escalation without redemption. Hits as a system advancing, not “cool” accents."
    },

    directorWanted: {
      it: "Giudizio, inevitabilita', marciume interiore tragico, tensione che si stringe, destino che avanza in colpi, niente catarsi.",
      en: "Judgement, inevitability, tragic interior rot, tightening tension, fate advances in strikes, no catharsis."
    },
    directorAvoid: {
      it: "Risers facili, melodie nobili, speranza, groove moderno riconoscibile, romanticizzare il pentimento.",
      en: "Easy risers, noble melodies, hope, recognizable modern groove, romanticizing repentance."
    },

    versionsTested: {
      A: { it: "Drone distante + colpo, senza tema.", en: "Distant drone + hit, no theme." },
      B: { it: "Ostinato degli archi + tromboni ascendenti, senza tema.", en: "String ostinato + ascending trombones, no theme." },
      C: {
        it: "Drone + ostinato + tromboni + ingresso del tema su violini campionati sparsi + colpo.",
        en: "Drone + ostinato + trombones + theme entrance on sparse sampled violins + hit."
      }
    },
    finalChoice: {
      it: "C, perche' struttura giudizio e destino senza catarsi.",
      en: "C, because it structures judgment and fate without catharsis."
    },

    delivered: {
      it: "Mix finale pronto, alternate su richiesta, stems organizzati e etichettati per la post.",
      en: "Final mix ready, alternates on request, stems organized and labeled for post."
    },
    technicalDeliverables: [
      { it: "Master stereo 48 kHz, 24 bit", en: "48 kHz, 24 bit stereo master" },
      { it: "Alt: senza musica", en: "Alt: no-music" },
      { it: "Stems: pads, texture", en: "Stems: pads, textures" }
    ],
    musicalLanguage: {
      it: "Drone di tamburo distante come giudizio. Violini in ostinato ripetitivo. Tromboni dissonanti ascendenti. Ingresso del tema su violini campionati sparsi con linee intrecciate e dolenti. Tromboni e colpi di percussione come destino che avanza.",
      en: "Distant drum drone as judgment. Repetitive ostinato violins. Ascending dissonant trombones. Theme entrance on sparse sampled violins with intertwined aching lines. Trombones and percussion hits as fate advancing."
    },

    technicalNotes: [
      { it: "Delivery: WAV, 48 kHz, 24-bit", en: "Delivery: WAV, 48 kHz, 24-bit" },
      {
        it: "Stems: Drone, Violini (ostinato), Tromboni, Archi tema, Colpi di percussione (etichettati per la post)",
        en: "Stems: Drone, Violins (ostinato), Trombones, Theme strings, Percussion hits (labelled for post)"
      },
      {
        it: "Mix: dialogo safe, basse frequenze controllate, colpi tenuti corti per flessibilita' editoriale",
        en: "Mix: dialogue safe, low end controlled, hits kept short for editorial flexibility"
      }
    ]
  }
];

// Validate and normalize all case studies
const allErrors: string[] = [];
const normalizedData: CaseStudy[] = [];

for (let i = 0; i < caseStudies.length; i++) {
  const cs = caseStudies[i];
  const errors = validateCaseStudyBase(cs);
  if (errors.length > 0) {
    allErrors.push(`caseStudies[${i}] (${cs.id}): ${errors.join(", ")}`);
  }
  normalizedData.push(normalizeCaseStudy(cs));
}

if (allErrors.length > 0) {
  throw new Error(`[case-studies] Invalid case studies data:\n${allErrors.join("\n")}`);
}

export const caseStudiesNormalized = normalizedData;
