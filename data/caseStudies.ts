import { z } from "zod";

export type CaseStudyTag = string;

export type SceneType = "Dialogue" | "Reveal" | "Montage" | "Action" | "Atmosphere";

export type CaseStudy = {
  id: string;
  title: string;
  projectLabel: string;
  sceneType: SceneType;
  duration: string;
  tags: CaseStudyTag[];
  isPublic: boolean;
  festivalCirculation: boolean;

  // PUBLIC ONLY
  embedUrl: string; // Vimeo/YouTube embed URL or HLS playlist (.m3u8). Must be set.
  posterImage?: string | null;

  context: string;

  goal: string;
  chosen: { key: "A" | "B" | "C"; summary: string; reason: string };
  result: string;
  timing: {
    in: { time: string; label: string };
    turn?: { time: string; label: string };
    out: { time: string; label: string };
  };
  spottingNote?: string;

  directorWanted: string;
  directorAvoid: string;

  versionsTested: { A: string; B: string; C: string };
  finalChoice: string;

  delivered: string;
  technicalDeliverables: string[];
  quote?: { text: string; attribution: string };
  musicChoices?: string;
  musicalLanguage?: string;
  trackTitle?: string;

  // Only inside <details>
  technicalNotes: string[];
};

export type CaseStudyInput = Omit<CaseStudy, "sceneType" | "tags"> & {
  sceneType: string;
  tags?: CaseStudyTag[];
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

const durationSchema = z
  .string()
  .refine((value) => value === "00:??" || /^\d{2}:\d{2}$/.test(value), {
    message: "duration must be MM:SS or 00:??",
  });

const tagsSchema = z.preprocess((value) => {
  if (!Array.isArray(value)) return [];
  return value.filter((tag) => typeof tag === "string");
}, z.array(z.string()));

const caseStudyBaseSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1),
    projectLabel: z.string().min(1),
    sceneType: z.string().min(1),
    duration: durationSchema,
    tags: tagsSchema.optional().default([]),
  })
  .passthrough();

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

function findSceneTypeInTitle(title: string) {
  const match = title.match(/\((Dialogue|Reveal|Montage|Action|Atmosphere)\)/i);
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
      const fromTitle = findSceneTypeInTitle(data.title ?? "");
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

  return {
    ...(data as CaseStudyInput),
    sceneType,
    tags,
  } as CaseStudy;
}

const caseStudySchema = caseStudyBaseSchema.transform((data) =>
  normalizeCaseStudy(data as CaseStudyInput)
);

const caseStudiesSchema = z.array(caseStudySchema);

export const caseStudies: CaseStudyInput[] = [
  {
    id: "soggetto-obsoleto-sitting-on-the-seashore",
    title: "Sitting on the Seashore, First Theme Entrance (Beach)",
    projectLabel: "Soggetto Obsoleto",
    sceneType: "Reveal",
    duration: "01:44",
    tags: ["Emotion", "Release", "Theme entrance", "Reveal", "Piano ticks", "Major-to-minor landing"],
    isPublic: false,
    festivalCirculation: true,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/_hls/Soggetto%20Obsoleto/Soggetto%20Obsoleto%20Sitting%20On%20The%20Seashore%20Case%20Stu/index.m3u8",

    context:
      "Marco reaches the beach. His father is already there, facing the sea. This is the first cue where the score is allowed to bloom fully. The music must open emotional space from the inside, not illustrate the location.",
    goal: "Crack open Marco’s emotions for the first time, without turning the moment into catharsis. Let the theme enter on the father reveal, then cut before the first line so dialogue lands clean.",
    chosen: {
      key: "B",
      summary: "Theme on the father reveal with light strings, piano, and airy synth.",
      reason: "Exits before the first line so the words land clean."
    },
    result: "The scene finally breathes, but the ending lands in minor, keeping the release incomplete. The theme reads as recognition, not commentary.",
    timing: {
      in: { time: "00:00", label: "Piano ticks begin (time held, no melody)" },
      turn: { time: "00:32", label: "Theme enters on father reveal" },
      out: { time: "01:44", label: "Cut before “May I sit here with you?”" }
    },
    spottingNote: "This is intentionally the first full cue. It opens the film emotionally, but exits before the first spoken line so the dialogue lands pristine.",

    directorWanted: "Restraint. Internal breathing. Music that feels born inside the scene.",
    directorAvoid: "Melodrama. Telegraphed emotion. Covering the first spoken line.",

    versionsTested: {
      A: "Only piano ticks. No theme. Too cold, no emotional doorway.",
      B: "Theme on father reveal (light strings + piano + airy synth), stop right before the first request to sit.",
      C: "Theme earlier during the walk. Feels manipulative and telegraphs the moment."
    },
    finalChoice: "B",

    delivered: "Final mix plus alternates, clearly labelled. Revisions tracked.",
    technicalDeliverables: [
      "Clean filenames and versioning",
      "Alternates ready on request",
      "Notes/revisions tracked"
    ],
    musicalLanguage:
      "Goal: unlock Marco’s emotions for the first time after a full film of restraint, but without catharsis.\n\n0:00–0:32: only piano ticks, acting as an emotional clock (time held, no melody).\n\n0:32–1:44: the theme, in G major, enters on the father reveal with piano leading, light strings, and an airy synth bed. The orchestration stays deliberately clean and restrained so it opens space without pushing the viewer, then cuts before “May I sit here with you?” so dialogue lands clean.\n\nHarmony keeps a major colour but lands in minor: G–F♯m–A–Em, with B minor withheld until the final chord (promise held back, release not complete).",
    quote: {
      text: "Revision handling was always clear. Pietro anticipated requests and already proposed alternative solutions.",
      attribution: "Nicola Pegg, director"
    },

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture",
      "Stems: Piano, Strings, Synth",
      "Alt: reduced version for dialogue/editorial flexibility",
      "Clean filenames and versioning"
    ]
  },
  {
    id: "i-veneti-antichi-battle-with-the-spartans",
    title: "I Veneti Antichi, The Battle With The Spartans (Action)",
    projectLabel: "I Veneti Antichi",
    sceneType: "Action",
    duration: "04:59",
    tags: [
      "Modern orchestra",
      "Low strings incipit",
      "Trombones",
      "Heartbeat kick",
      "Battle rhythm"
    ],
    isPublic: false,
    festivalCirculation: true,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/I%20Veneti%20Antichi/I%20Veneti%20Antichi%20The%20Battle.mp4",

    context:
      "Reconstruction of the battle with the Spartans, built on fast cuts and long battlefield wides. The sequence needs drive without turning into a modern action trailer, and it must leave space for historical narration and sound design.",
    goal:
      "Hold a clear rhythmic spine for the edit, give the clashes weight, and keep the cue readable so the educational tone stays intact.",
    chosen: {
      key: "B",
      summary:
        "Low strings pulse with restrained percussion, brass calls on formation changes, full orchestra only at the first clash.",
      reason:
        "Keeps tension and momentum while leaving space for narration and diegetic battle sound."
    },
    result:
      "The scene feels kinetic but intelligible. The rhythm stays locked to the edit, the clashes land with weight, and the narration still reads cleanly.",
    trackTitle: "The Battle",
    timing: {
      in: { time: "00:00", label: "Wide battlefield shot, pulse enters." },
      turn: { time: "02:06", label: "First clash, brass and percussion lock to cuts." },
      out: { time: "04:59", label: "Aftermath wide, cue releases into sustain." }
    },
    spottingNote:
      "Keep the cue lean until the first clash. Avoid constant hits so the narration and battle FX remain dominant.",

    directorWanted:
      "Drive and clarity. A historical tone with orchestral weight, but never trailer-style.",
    directorAvoid:
      "Wall-to-wall percussion, oversized hits, or music that masks narration.",

    versionsTested: {
      A: "Percussion-only pulse. Too dry and not enough identity.",
      B: "Low strings pulse, brass calls on shifts, full orchestra only at the first clash.",
      C: "Full orchestral wall from the start. Overwhelming and flattened the dynamics."
    },
    finalChoice: "B",

    delivered: "Final mix plus a lighter percussion alternate, clearly labelled.",
    technicalDeliverables: [
      "48 kHz, 24-bit stereo master",
      "Alt: reduced percussion for VO",
      "Stems: strings, brass, percussion"
    ],
    musicalLanguage:
      "Built on a low strings ostinato and a heartbeat kick to keep the pulse steady while the edit accelerates.\n\nShort brass calls and trombone figures mark shifts in formation, but the full orchestra is held back until the first clash, so the impact reads as a narrative turn instead of constant intensity.\n\nAfter the collision, the harmony opens into sustained low strings to let the aftermath breathe while keeping tension under the narration.",

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture",
      "Alt: reduced percussion for VO",
      "Stems: strings, brass, percussion"
    ]
  },
  {
    id: "scene-03",
    title: "Eris Reads, The Banshee Story and the First Cough (Dialogue)",
    projectLabel: "La Sonata Del Chaos",
    sceneType: "Dialogue",
    duration: "00:??",
    tags: ["Dialogue", "Theme layering", "Motif seed", "Foreshadowing", "Piano", "Banshee motif"],
    isPublic: false,
    festivalCirculation: true,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/La%20Sonata%20Del%20Caos/La%20Sonata%20Del%20Caos%20Something%20Threatening%20Case%20Stud.mp4",

    context:
      "La Sonata Del Chaos is a short film where a family folktale, the Banshee, shifts from a spoken legend into a real force inside the home. The story follows Eris through grief after her violin teacher’s death, and the Banshee idea later becomes inseparable from an incurable illness that hits the mother and then Talia.\n\nThis cue sits inside a warm bedtime conversation where the myth is spoken aloud, and the mother’s cough quietly reframes it as something already inside the house.",
    goal:
      "Keep the scene tender and dialogue first, while turning the family myth into a real threat through one precise hinge, the mother’s cough, without telegraphing horror.",
    chosen: {
      key: "C",
      summary: "Eris theme on piano, a gentle Talia hint, and a minimal Banshee accent exactly on the cough.",
      reason: "Connects the family myth to the physical symptom without shifting the scene into horror."
    },
    result:
      "The beat stays domestic and readable. Eris is framed through a soft piano statement, Talia is gently seeded, and the cough carries a minimal Banshee fingerprint that links folklore to the first physical crack.",
    trackTitle: "Something Threatening",
    timing: {
      in: {
        time: "00:00",
        label: "Eris finishes reading. The family talks about the ‘Banshee’ as a story from the grandmother."
      },
      turn: {
        time: "00:??",
        label: "Fear rises as the myth is treated as real. Talia voices doubt and fear."
      },
      out: {
        time: "00:??",
        label: "Mother coughs three times, dismisses it, sends them to bed. End tag."
      }
    },
    spottingNote:
      "Dialogue remains primary. The cue only surfaces as a tiny motif accent on the cough, then immediately retreats back under the scene.",

    directorWanted:
      "Warm domestic intimacy. Clear dialogue and breath. Foreshadowing without signalling horror. Motifs that can recur later in variation.",
    directorAvoid:
      "Overt Banshee statement. Music that competes with the reading rhythm. Early genre shift into horror. Any masking of consonants.",

    versionsTested: {
      A: "Only Eris theme on soft piano, no other references.",
      B: "Eris theme plus a short Talia hint, still purely domestic.",
      C: "Eris theme on piano, a gentle Talia hint, and a minimal Banshee accent exactly on the cough, then immediate return to domestic neutrality."
    },
    finalChoice:
      "C, because the Banshee is introduced as a family-transmitted myth and later becomes physical through the mother’s illness. The cough is the smallest bridge from folklore to the body, so the motif can function narratively without announcing itself.",

    delivered: "Final mix plus dialogue safe alternate, clearly labelled. Revisions tracked.",
    technicalDeliverables: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ],
    musicChoices:
      "I treated this as a dialogue bed with a leitmotif function. The piano carries Eris in a fragile, domestic profile to keep the scene human. Talia appears as an incomplete warmth marker to build attachment early. On the cough, a minimal Banshee fingerprint briefly leaks in. It is a contour, not a full phrase. The point is to connect myth and illness as two faces of the same narrative force, while keeping the scene believable and intimate.",
    musicalLanguage:
      "I treated this as a dialogue bed with a leitmotif function. The piano carries Eris in a fragile, domestic profile to keep the scene human. Talia appears as an incomplete warmth marker to build attachment early. On the cough, a minimal Banshee fingerprint briefly leaks in. It is a contour, not a full phrase. The point is to connect myth and illness as two faces of the same narrative force, while keeping the scene believable and intimate.",

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ]
  },
  {
    id: "la-sonata-del-chaos-mothers-tale-banshee",
    title: "The Mother's Tale, Banshee Motif in Focus (Dialogue)",
    projectLabel: "La Sonata Del Chaos",
    sceneType: "Dialogue",
    duration: "00:52",
    tags: ["Dialogue", "Leitmotif", "Motif recall", "Foreground theme", "Mystery", "Foreshadowing"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/La%20Sonata%20Del%20Caos/La%20Sonata%20Del%20Caos%20The%20Mother_s%20Tale%20Case%20Study.mp4",

    context:
      "La Sonata Del Chaos is a short film where a family folktale, the Banshee, shifts from a spoken legend into a real force inside the home. The story follows Eris through grief after her violin teacher’s death, and the Banshee idea later becomes inseparable from an incurable illness that hits the mother and then Talia.\n\nThe mother tells her daughter the legend of the Banshee. The motif already exists in the score, but here it becomes audible and central for the first time, carrying the scene without stepping on the dialogue.",
    goal:
      "Bring the already established Banshee leitmotif into clear focus for the first time, assigning it to the violins while the piano and harp sustain the scene, so the dialogue remains fully readable.",
    chosen: {
      key: "B",
      summary: "Piano bed with a short motif tucked under the first Banshee mention.",
      reason: "Plants the leitmotif while keeping consonants and breaths clear."
    },
    result:
      "The motif becomes unmistakable and memorable without overpowering the scene. Later variations are perceived as narrative recall rather than new material, strengthening cohesion across the short.",
    timing: {
      in: { time: "00:00", label: "Mother: “It is said…”" },
      out: { time: "00:52", label: "End of the tale beat" }
    },
    musicalLanguage:
      "Piano-led orchestral writing built as a narrative hinge, not as background mood.\n\nAt 0:09 Eris’ theme enters on piano: it opens in C major, immediately slips to the minor subdominant (Fm), then pivots into C minor and confirms it through a cadential reconfirmation. This harmonic “bright-to-shadow” turn makes grief and unease part of the theme’s DNA while keeping the mother’s dialogue pristine.\n\nAt 0:32 Talia’s motif is briefly hinted in B♭, intentionally clashing against Eris’ C minor centre. The friction reads as vulnerability entering the room, not as a melodic decoration.\n\nImmediately after, the Banshee motif appears in violas and hammered dulcimer. The dulcimer’s percussive string attack gives an “alien” texture that suggests the monstrous and the unknown, with a controlled sense of threat. This is where the motif is allowed to speak clearly as the scene’s spine, not just as a background hint.\n\nOn the mother’s cough, the cue introduces the “illness” idea (0:48 to the end): related to the Banshee material but not identical, so the film can later separate folklore as myth from illness as body, while still keeping them psychologically linked.",
    trackTitle: "Something Threatening",
    spottingNote: "Enters under the opening line to seed the motif without pulling focus.",

    directorWanted: "Keep dialogue pristine while letting the myth feel unsettling.",
    directorAvoid: "No horror stabs. No swelling under lines.",

    versionsTested: {
      A: "Room tone and light pad only. Clear dialogue but no thematic seed.",
      B: "Piano bed plus short motif on the first Banshee mention.",
      C: "Full motif early. Draws too much attention away from the story."
    },
    finalChoice: "B, because it planted the motif without pulling focus from the legend.",

    delivered: "Final mix plus alternates, clearly labelled. Revisions tracked.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: lighter motif",
      "Stems: piano, strings, pads"
    ],

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ]
  },
  {
    id: "scene-05",
    title: "A Close Encounter in the Wood, Scream to Face-to-Face (Reveal)",
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
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/La%20Sonata%20Del%20Caos/La%20Sonata%20Del%20Caos%20A%20Close%20Encounter%20In%20The%20Wood.mp4",

    context:
      "La Sonata Del Chaos is a short film where a family folktale, the Basci (Banshee), shifts from a spoken legend into a real force inside the home. The story follows Eris through grief after her violin teacher’s death, and the Banshee idea later becomes inseparable from an incurable illness that hits the mother and then Talia.\n\nIn this scene Eris wakes from a nightmare, hears Talia coughing, checks on her, then hears the Banshee screaming from the woods. She goes outside to confront it and finds it face-to-face.",
    goal: "Turn a domestic night cue into a real external threat in one clean arc. Start from Talia’s fragile presence, introduce the Banshee identity the moment the scream is heard, drive Eris’ run with rhythm, then stop the music exactly on the first sight of the Banshee so the reveal lands on picture and the line can stay clear.",
    chosen: {
      key: "B",
      summary:
        "Talia motif on celesta at 00:00, Banshee incipit in contrabasses at 00:20, orchestral climb and rhythmic drive for the run, hard stop on reveal.",
      reason: "Balances identity handoff with propulsion and leaves the reveal clean."
    },
    result: "The audience feels the threat arrive as an identity, not as generic horror mood. The escalation motivates Eris’ movement, and the hard stop makes the face-to-face moment hit as a visual shock rather than a musical sting.",
    trackTitle: "A Close Encounter in the Wood",
    timing: {
      in: { time: "00:00", label: "Talia motif enters on celesta." },
      turn: {
        time: "00:20",
        label:
          "Banshee incipit starts in contrabasses, then climbs through the strings as Eris runs into the woods."
      },
      out: { time: "01:02", label: "Cue ends exactly on the first sight of the Banshee." }
    },
    spottingNote:
      "No early horror signalling. Use a clear identity handoff at 00:20, then convert the motif into propulsion for the run. End with a hard stop on the reveal so the image, the scream, and the line remain the focus.",

    directorWanted:
      "A believable escalation from inside the house to the woods. Clear space for the scream. No trailer stings. Let the reveal land on picture.",
    directorAvoid:
      "Generic horror pads. Telegraphed jump scares. Music continuing under the reveal and stealing focus from the face-to-face moment.",

    versionsTested: {
      A: "Atmosphere only, save the motif for the reveal. Too neutral and the run feels less motivated.",
      B: "Talia motif on celesta at 00:00, Banshee incipit in contrabasses at 00:20, orchestral climb into celli, violas, violins, then a more rhythmic drive for the run, hard stop on reveal.",
      C: "Banshee theme stated strongly before the scream. It announces the monster early and kills the discovery."
    },
    finalChoice: "B",

    delivered: "Final mix plus alternates, clearly labelled. Revisions tracked.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: no-music",
      "Stems: pads, room tone"
    ],
    musicalLanguage:
      "This cue is built as an identity handoff.\n\n00:00: Talia’s motif enters on celesta, framing the house as fragile and innocent.\n\n00:20 to end: the Banshee incipit starts in contrabasses, then transfers upward to celli, violas and violins, as if the threat is rising out of the ground and taking over the sonic space. As Eris runs into the woods the writing becomes more rhythmic, turning the motif into propulsion rather than a static horror colour.\n\nThe cue ends exactly when Eris sees the Banshee, creating a hard stop that lets the face-to-face moment land on the image instead of on a musical sting.",

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture",
      "Alt: no-music",
      "Stems: pads, room tone"
    ]
  },
  {
    id: "scene-04",
    title: "Talia's Farewell, Last Story (Reveal)",
    projectLabel: "La Sonata Del Chaos",
    sceneType: "Reveal",
    duration: "02:00",
    tags: ["Reveal", "Emotion", "Release", "Dialogue support"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/La%20Sonata%20Del%20Caos/La%20Sonata%20Del%20Caos%20Talia_s%20Farewell.mp4",

    context:
      "La Sonata Del Chaos is a short film where a family folktale, the Basci (Banshee), shifts from a spoken legend into a real force inside the home, later inseparable from an incurable illness that hits the mother and then Talia.\n\nIn this scene Eris reads Talia’s favourite story one last time. The music functions as a soft eulogy: it does not comment on death, it accompanies the act of love that survives it.",
    goal: "Write a funeral elegy that stays gentle and intimate, supporting Eris reading without turning the scene into melodrama. Make Talia feel pure and present even as the illness wins, and let the cue carry the goodbye without stealing focus from the story.",
    chosen: {
      key: "B",
      summary: "Strings-led melody with soft synth bed and wordless choir, held back under the reading.",
      reason: "Keeps the farewell intimate and dialogue-first without melodrama."
    },
    result: "The scene feels like a tender farewell rather than a dramatic hit. The music reads as love and dignity, with a quiet sense of inevitability. Talia is framed as innocent, while the shadow of the Banshee remains implied, not announced.",
    trackTitle: "Talia's Farewell",
    timing: {
      in: { time: "00:00", label: "Eris reads Talia’s favourite story." },
      out: { time: "02:00", label: "End of the farewell beat." }
    },
    spottingNote:
      "The cue must stay under the voice and breathe with the reading. No horror signalling. No ‘scare’ gesture. The emotion comes from warmth, restraint, and a slow harmonic surrender.",

    directorWanted: "Intimate, dialogue-first elegy. No melodrama.",
    directorAvoid: "Horror signalling. Over-scoring. Masking the reading.",

    versionsTested: {
      A: "Only pads and choir. Too vague, lacked emotional contour.",
      B: "Strings-led melody with soft synth bed and wordless choir, held back dynamically under the reading.",
      C: "Stronger orchestral swell. Felt theatrical and pulled focus."
    },
    finalChoice: "B",

    delivered: "Final mix plus alternates, clearly labelled. Revisions tracked.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: lighter pulse",
      "Stems: pulse, low hits, textures"
    ],
    musicalLanguage:
      "D minor, built as a lullaby that slowly becomes a requiem.\n\nThe cue starts at 00:00 with warm strings, a soft synth bed, and wordless choir, not to dramatise the moment, but to make it feel sacred and close, like a whispered funeral praise. The orchestration stays light on purpose, so Eris’ reading remains the foreground and the music feels like a private breath around it.\n\nHarmonically the cue sits in D minor, one whole step above the Banshee’s centre, as if Talia’s innocence is placed ‘above’ the curse rather than inside it. That distance is the point: the illness wins physically, but the music frames Talia as untouched in spirit. The choir stays pure and non-theatrical, almost like air, while the strings carry the melody with long, unbroken lines, avoiding sharp attacks.\n\nBy the final stretch the harmony stops searching and simply accepts. The cue does not resolve with triumph. It resolves with tenderness. It ends at 02:00 like the last page of a story being closed, gently, without noise.",

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture",
      "Alt: lighter pulse",
      "Stems: pulse, low hits, textures"
    ]
  },
  {
    id: "claudio-re-opening-titles-storm-theme",
    title: "Opening Titles, Glass Resonance and the Storm Theme (Main Titles)",
    projectLabel: "Claudio re",
    sceneType: "Modern orchestral",
    duration: "01:48",
    tags: ["Opening titles", "Modern orchestra", "Resonant texture", "Leitmotif", "Power paranoia"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/Claudio%20Re/Claudio%20Re%20The%20Storm%20Case%20Study.mp4",

    context:
      "Claudio re is inspired by Hamlet. Claudio murders his own brother to take the crown and the queen, then rules under a surface of stability while the crime keeps echoing through the court. His guilt is real, but his repentance is not: he refuses the price of redemption because he will not give up what he stole. That split turns into paranoia, a cold logic of power: if he rose through blood, he can be taken by blood.\n\nThe opening titles introduce the film’s core idea, the “storm”: not weather, but the irreversible disturbance Claudio has unleashed, moral, political, and psychological. The score’s job here is to make the world feel cracked from the first frame, and to establish the storm theme as consequence advancing, not as decorative mood.",
    goal: "Set the film’s moral and political fracture from the first frame: a world that looks stable but vibrates with guilt and paranoia. Establish the “storm” theme as the engine of consequence, and frame Claudio as a man with real guilt but no repentance, trapped in the logic of power.",
    chosen: {
      key: "B",
      summary: "Modern orchestra + synth pressure with bowed-glass resonance, then storm theme introduced as a slow advance.",
      reason: "Delivers inevitability without losing tragic weight or clarity."
    },
    result: "The titles land with immediate tension and inevitability. The glass-like resonance reads as a crack in the world, and the storm theme feels like an advancing force rather than decorative atmosphere, aligning the viewer with Claudio’s unstable inner control.",
    trackTitle: "Storm Theme (Opening Titles)",
    timing: {
      in: {
        time: "00:00",
        label: "Opening titles begin. The bowed-glass resonance hits only on the title reveal."
      },
      turn: { time: "01:12", label: "After a brief strings-and-brass crescendo, the storm theme detonates." },
      out: { time: "01:48", label: "End of opening titles cue." }
    },
    spottingNote:
      "The bowed-glass resonance is a signature hit tied to the title reveal, not a continuous bed. The cue holds tension under the surface, then a short crescendo in strings and brass detonates into the storm theme. The storm must feel like a sudden rupture in control, not a gradual swell, and it should remain premium and legible rather than trailer-like.",

    directorWanted:
      "Inevitable tension. Modern orchestral weight with controlled synth pressure. A clear thematic identity from the start.",
    directorAvoid:
      "Generic trailer hits. Over-the-top horror. Anything that feels like copied Batman rather than a tailored language.",

    versionsTested: {
      A: "Orchestra-only. Too period, lacked psychological edge.",
      B: "Modern orchestra + synth pressure with bowed-glass resonance, then storm theme introduced as a slow advance.",
      C: "Heavier synth dominance. Felt less cinematic and reduced the tragic weight."
    },
    finalChoice: "B",

    delivered: "Final mix plus alternates, clearly labelled. Revisions tracked.",
    technicalDeliverables: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ],
    musicalLanguage:
      "Hybrid modern orchestra and synth. The bowed-glass resonant colour is used as a signature hit only when the title appears, a brief, cutting vibration that reads as a crack in the world. Underneath, tension is held back until a short crescendo in strings and brass builds pressure, then the storm theme breaks in suddenly, like control snapping into consequence. The reference behaviour from Giacchino’s The Batman is used as a model for weight and clarity (low-register authority, simple thematic identity), but the impact here is defined by contrast: restraint first, then a sharp thematic eruption. The storm is not weather. It is Claudio’s irreversible disturbance made audible.",

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ]
  },
  {
    id: "claudio-re-my-sin-is-rotten",
    title: "My Sin is Rotten, The Crown Trap (Dialogue)",
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
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/Claudio%20Re/Claudio%20Re%20My%20Sin%20Is%20Rotten.mp4",

    context:
      "Claudio re is inspired by Hamlet. Claudio murders his own brother to take the crown and the queen, then rules under a surface of stability while the crime keeps echoing through the court. His guilt is real, but he refuses the price of repentance because he will not give up what he stole.\n\nIn this monologue he names the sin as rotten and admits it is the oldest curse, the murder of a brother, then exposes the trap: forgiveness cannot ‘go through’ while he remains in possession of the fruits of the murder, the crown, ambition, and the queen. The cue mirrors that contradiction: a veneer of nobility struggling to stand over something fundamentally corrupt.",
    goal:
      "Support Claudio’s confession without granting him redemption. Keep the dialogue pristine while making the ‘rottenness’ feel physical and inescapable: real guilt, no repentance, and paranoia as the logic of power.",
    chosen: {
      key: "B",
      summary:
        "Piano motif surrounded by dark ambient synth, with restrained orchestral shadows and controlled harmonic ‘rot’ via non-chord tones.",
      reason: "Keeps the confession intimate while embedding unease without melodrama."
    },
    result:
      "The monologue lands as self-awareness trapped in denial. The cue reads as inner corrosion rather than sadness, and the tension stays under the speech without masking it.",
    trackTitle: "My Crown, My Ambition, My Queen",
    timing: {
      in: {
        time: "00:00",
        label: "Claudio: “My sin is rotten and its stench reaches heaven.”"
      },
      out: {
        time: "01:27",
        label: "End of the confession beat. Music releases without redemption."
      }
    },
    spottingNote:
      "Dialogue-first, but the cue has a clear thematic reveal. Claudio’s real theme appears in D minor on the ‘Light! Light!’ section. Before the line “My queen?” the melody is carried by viola da gamba to introduce historical colour. On “my queen” the full orchestra joins, reinforced by the historical instruments and a dark synth bed: it reads as epic self-mythologising, then the mask slips. The ending uses intentionally dissonant chords and a rotten brass aftertaste, with trombones staining the final words, as a narrative bridge into the following sequence where Claudio confronts the spectre in an imagined duel and is killed.",

    directorWanted: "Dialogue-safe psychological decay. Noble veneer with corruption underneath.",
    directorAvoid: "Redemptive cadences, big swells, anything that masks the words.",

    versionsTested: {
      A: "Only synth ambience. Too flat, lacked character identity.",
      B: "Piano motif + dark ambient contamination, then D minor theme reveal with historical colour and rotten brass tail.",
      C: "More orchestral emotion. Felt sympathetic and reduced the rot."
    },
    finalChoice: "B",

    delivered: "Final mix plus alternates, clearly labelled. Revisions tracked.",
    technicalDeliverables: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ],
    musicalLanguage:
      "The harmonic language is built around Claudio’s piano motif, kept exposed and intimate, then surrounded by dark ambient synth layers as if the camera is entering his sick mind and distorted emotional space. The piano carries the ‘human’ confession, while the synth bed acts like an internal fog that never clears.\n\nTo underline the rot, the harmony is deliberately contaminated: non-chord tones, chromatic neighbours and foreign notes sit against the implied chordal centre, creating a controlled discomfort that reads as thought decay rather than jump-scare dissonance. These tensions must stay small and persistent, never turning into a dramatic gesture, so the audience feels the stench as something embedded in him.\n\nOrchestral elements appear sparingly as shadows, adding weight without stealing speech. The cue ends at 01:27 without a redemptive resolution, leaving Claudio suspended between confession and refusal.",

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ]
  },
  {
    id: "scene-09",
    title: "My Crown, My Ambition, My Queen. The Crown Trap (Dialogue)",
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
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/Claudio%20Re/Claudio%20Re%20My%20Crown%2C%20My%20Ambition%2C%20My%20Queen%20Case%20St.mp4",

    context:
      "Claudio re is inspired by Hamlet. Claudio murders his own brother to take the crown and the queen, then rules under a surface of stability while the crime keeps echoing through the court. His guilt is real, but he refuses the price of repentance because he will not give up what he stole.\n\nIn this monologue he names the sin as rotten and admits it is the oldest curse, the murder of a brother, then exposes the trap: forgiveness cannot ‘go through’ while he remains in possession of the fruits of the murder, the crown, ambition, and the queen. The cue mirrors that contradiction: a veneer of nobility struggling to stand over something fundamentally corrupt.",
    goal:
      "Support Claudio’s confession without granting him redemption. Keep the dialogue pristine while making the ‘rottenness’ feel physical and inescapable: real guilt, no repentance, and paranoia as the logic of power.",
    chosen: {
      key: "B",
      summary:
        "Piano motif + dark ambient contamination, then D minor theme reveal with historical colour and rotten brass tail.",
      reason: "Preserves dialogue while revealing Claudio’s true theme and decay."
    },
    result:
      "The monologue lands as self-awareness trapped in denial. The cue reads as inner corrosion rather than sadness, and the tension stays under the speech without masking it.",
    trackTitle: "My Crown, My Ambition, My Queen",
    timing: {
      in: {
        time: "00:00",
        label: "Claudio: “My sin is rotten and its stench reaches heaven.”"
      },
      out: {
        time: "01:27",
        label: "End of the confession beat. Music releases without redemption."
      }
    },
    spottingNote:
      "Dialogue-first, but the cue has a clear thematic reveal. Claudio’s real theme appears in D minor on the ‘Light! Light!’ section. Before the line “My queen?” the melody is carried by viola da gamba to introduce historical colour. Monochord and hurdy gurdy enter as ancient-texture markers, while trombones add a rotten aftertaste. The ending uses intentionally dissonant chords as a narrative bridge into the following sequence, where Claudio confronts the spectre in an imagined duel and is killed.",

    directorWanted: "Dialogue-safe psychological decay. Noble veneer with corruption underneath.",
    directorAvoid: "Redemptive cadences, big swells, anything that masks the words.",

    versionsTested: {
      A: "Only synth ambience. Too flat, lacked character identity.",
      B: "Piano motif + dark ambient contamination, then D minor theme reveal with historical colour and rotten brass tail.",
      C: "More orchestral emotion. Felt sympathetic and reduced the rot."
    },
    finalChoice: "B",

    delivered: "Final mix plus alternates, clearly labelled. Revisions tracked.",
    technicalDeliverables: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ],
    musicalLanguage:
      "The harmonic language is built around Claudio’s piano motif, kept exposed and intimate, then surrounded by dark ambient synth layers as if we are entering his sick mind and distorted emotional space. Non-chord tones and foreign notes contaminate the implied centre, creating a controlled, persistent discomfort that reads as moral rot rather than theatrical dissonance.\n\nOn the ‘Light! Light!’ section the cue reveals Claudio’s theme in full, in D minor. It carries a dramatic, almost ‘noble’ contour, but the nobility is a veneer: trombones stain the tail of phrases with a rotten aftertaste, and cadences refuse clean closure. Before “My queen?” the line is entrusted to viola da gamba, and historical colours (monochord, hurdy gurdy) enter to evoke the antique weight of the tale without turning it into pastiche.\n\nOn the words “my queen” the orchestration blooms: full orchestra joins, the ancient instruments remain present, and the synth bed deepens, creating an epic surge of self-justification. The cue then undercuts that grandeur: final chords are deliberately dissonant and the trombones bring the corruption to the surface on Claudio’s last words. It does not resolve as repentance. It hangs as consequence, designed to connect seamlessly into the following section where Claudio’s guilt turns into confrontation and he is killed.",

    technicalNotes: [
      "Delivery format: WAV (linear PCM)",
      "Specs: 48 kHz, 24-bit",
      "Sync: aligned to final picture"
    ]
  },
  {
    id: "scene-07",
    title: "No Shuffling Up There, The Spectre Wins (Vision Fight)",
    projectLabel: "Claudio re",
    sceneType: "Action",
    duration: "00:??",
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
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/Claudio%20Re/Claudio%20Re%20The%20Spectre.mp4",

    context:
      "“But not up there? Ah no. Up there there is no trickery, eh? There, action exists in its true nature. And we ourselves are compelled to bear witness, as beggars, on the forehead of our guilt. Anyone. And then, what remains? [Music]”\n\nClaudio enters the imagined duel with the Spectre, is dominated and stabbed. The music starts when the words end.",
    goal:
      "Turn Claudio’s guilt into a physical event: anxiety, fear, loss of control. Make the defeat inevitable.",
    chosen: {
      key: "C",
      summary:
        "Braams plus benders plus a kick that accelerates, then slows to a stop on the stab.",
      reason: "Makes the panic physical and closes the scene with a clean narrative stop."
    },
    result:
      "The kick becomes a heartbeat. It accelerates with anxiety and fear, then slows to a precise stop on the stab. The defeat reads as collapse.",
    trackTitle: "The Spectre",
    timing: {
      in: {
        time: "00:00",
        label: "Music enters right after ‘And then, what remains?’"
      },
      out: {
        time: "00:??",
        label: "The Spectre stabs Claudio. The kick stops."
      }
    },
    spottingNote:
      "The kick must feel like a heartbeat, not a trailer beat.\nAcceleration equals panic.\nSlowdown equals collapse.\nStop on the stab equals narrative punctuation.\nBraams equal the pressure of guilt.\nBenders equal mental distortion.\nNo heroism, no “cool” aesthetic.",

    directorWanted:
      "Claustrophobic anxiety. Physical fear. Inevitability. Heartbeat realism. Hard sync to the stab.",
    directorAvoid:
      "Epic action feel. Trailer risers. Constant tempo. “Cool” aesthetics. Any sense of victory.",

    versionsTested: {
      A: "Dissonant braams only, no kick.",
      B: "Kick at a constant tempo, no slowdown and no stop.",
      C: "Braams plus benders plus a kick that accelerates, then slows to a stop on the stab."
    },
    finalChoice: "C, because the heartbeat accelerates and collapses on the strike, making the defeat inevitable.",

    delivered:
      "Final mix, dialogue-safe alternate, and stems delivered with clear post labels (Braams, Benders, Kick, FX).",
    technicalDeliverables: [
      "Delivery: WAV, 48 kHz, 24-bit",
      "Stems: Braams, Benders, Kick, FX (labelled for post)",
      "Sync: kick stop aligned to the stab"
    ],
    musicalLanguage:
      "Dissonant synth braams and unstable benders. Kick with tempo automation that mimics a heartbeat: it accelerates with anxiety and fear, then progressively slows until it stops when the Spectre stabs Claudio.",

    technicalNotes: [
      "Delivery: WAV, 48 kHz, 24-bit",
      "Stems: Braams, Benders, Kick, FX (labelled for post)",
      "Sync: kick stop aligned to the stab"
    ]
  },
  {
    id: "scene-10",
    title: "What If A Man Can't Regret, The Prayer That Fails (Dialogue)",
    projectLabel: "Claudio re",
    sceneType: "Modern orchestral",
    duration: "01:03",
    tags: ["Release", "Emotion"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "https://ui0he7mtsmc0vwcb.public.blob.vercel-storage.com/uploads/video/Claudio%20Re/Claudio%20Re%20What%20If%20A%20Man%20Can_t%20Regret%20Case%20Study.mp4",

    context:
      "“...try what repentance can do. What can it not do? Yet what can it do if a man cannot repent? To die, to sleep, and heart attack. And with a sleep, to say we end the heartache and the thousand natural shocks of flesh. This is a consummation to be wished, devoutly to be wished. To die, to sleep—do we not dream ahead? bent close, stubborn, and you, heart of steel snares. Yes, but I orbit, like muscles in a child, just gone. Everything can end... ...repenting. [Music]”\n\nClaudio searches for a path to repentance but remains trapped by the real price of redemption. The scene works as a distorted echo of Hamlet’s central knots: conscience, guilt, the impossibility of action, and the desire for an end as escape.",
    goal:
      "Make repentance feel like an impossible invocation. Make judgment inevitable and fate perceptible in strikes, without catharsis.",
    chosen: {
      key: "C",
      summary:
        "Drone + ostinato + trombones + theme entrance on sparse sampled violins + hit.",
      reason: "Keeps judgment in the foreground and moves fate forward without catharsis."
    },
    result:
      "Judgment starts distant, then closes in and becomes internal. String ostinato as a prison. Ascending dissonant trombones as escalation without salvation. Theme on sparse violins as inner rot and tragedy. Hits as fate advancing.",
    trackTitle: "What Can Repentance Do",
    timing: {
      in: { time: "00:00", label: "Music enters right after ‘…repenting.’" },
      out: { time: "00:??", label: "End of cue." }
    },
    spottingNote:
      "No trailer language. Drone as judgment, not groove. Strings as prison. Trombones as escalation without redemption. Hits as a system advancing, not “cool” accents.",

    directorWanted:
      "Judgement, inevitability, tragic interior rot, tightening tension, fate advances in strikes, no catharsis.",
    directorAvoid:
      "Easy risers, noble melodies, hope, recognizable modern groove, romanticizing repentance.",

    versionsTested: {
      A: "Distant drone + hit, no theme.",
      B: "String ostinato + ascending trombones, no theme.",
      C: "Drone + ostinato + trombones + theme entrance on sparse sampled violins + hit."
    },
    finalChoice: "C, because it structures judgment and fate without catharsis.",

    delivered:
      "Final mix ready, alternates on request, stems organized and labeled for post.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: no-music",
      "Stems: pads, textures"
    ],
    musicalLanguage:
      "Distant drum drone as judgment. Repetitive ostinato violins. Ascending dissonant trombones. Theme entrance on sparse sampled violins with intertwined aching lines. Trombones and percussion hits as fate advancing.",

    technicalNotes: [
      "Delivery: WAV, 48 kHz, 24-bit",
      "Stems: Drone, Violins (ostinato), Trombones, Theme strings, Percussion hits (labelled for post)",
      "Mix: dialogue safe, low end controlled, hits kept short for editorial flexibility"
    ]
  }
];

const parsedCaseStudies = caseStudiesSchema.safeParse(caseStudies);

if (!parsedCaseStudies.success) {
  const issues = parsedCaseStudies.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`[case-studies] Invalid case studies data:\n${issues}`);
}

export const caseStudiesNormalized = parsedCaseStudies.data as CaseStudy[];
