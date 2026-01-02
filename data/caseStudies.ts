export type CaseStudyTag = "Tension" | "Emotion" | "Rhythm" | "Suspense" | "Release";

export type CaseStudy = {
  id: string;
  title: string;
  projectLabel: string;
  sceneType: "Dialogue" | "Montage" | "Reveal" | "Action" | "Atmosphere";
  duration: string;
  tags: CaseStudyTag[];
  isPublic: boolean;
  festivalCirculation: boolean;

  // PUBLIC ONLY
  embedUrl: string; // Vimeo/YouTube embed URL or HLS playlist (.m3u8). Must be set.

  context: string;

  goal: string;
  chosen: { key: "A" | "B" | "C"; summary: string; reason: string };
  result: string;
  timing: {
    in: { time: string; label: string };
    turn: { time: string; label: string };
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

  // Only inside <details>
  technicalNotes: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    id: "soggetto-obsoleto-sitting-on-the-seashore",
    title: "Sitting on the Seashore, First Theme Entrance (Beach)",
    projectLabel: "Soggetto Obsoleto",
    sceneType: "Reveal",
    duration: "01:44",
    tags: ["Emotion", "Release"],
    isPublic: false,
    festivalCirculation: true,
    embedUrl: "/uploads/video/_hls/Soggetto Obsoleto/Soggetto Obsoleto Sitting On The Seashore Case Stu/index.m3u8",

    context:
      "Marco reaches the beach. His father is already there, facing the sea. First full music entrance: it must open an emotional space, not create an effect.",
    goal: "Crack open Marco’s emotions for the first time, without turning the moment into catharsis. Theme enters on the father reveal, then cuts before the first line so dialogue lands clean.",
    chosen: {
      key: "B",
      summary: "Theme on the father reveal with light strings, piano, and airy synth.",
      reason: "Exits before the first line so the words land clean."
    },
    result: "The scene finally breathes, but the ending lands in minor, keeping the release incomplete. The theme reads as recognition, not commentary.",
    timing: {
      in: { time: "00:00", label: "Piano ticks begin (time held, no melody)" },
      turn: { time: "00:32", label: "Theme enters on father reveal" },
      out: { time: "01:44", label: "Cut before “Posso sedermi qui con te?”" }
    },
    spottingNote: "Enters at the reveal to open emotional space without telegraphing.",

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
    quote: {
      text: "La gestione delle revisioni è sempre stata limpida. Pietro anticipava le richieste e proponeva già soluzioni alternative.",
      attribution: "Nicola Pegg, director"
    },

    technicalNotes: [
      "Clean filenames and versioning",
      "Alternates ready on request",
      "Notes/revisions tracked",
      "Harmony: G–F♯m–A–Em, with B minor withheld until the final chord (promise held back, release not complete)."
    ]
  },
  {
    id: "scene-01",
    title: "Scene 01: Confrontation",
    projectLabel: "Short film",
    sceneType: "Dialogue",
    duration: "00:48",
    tags: ["Tension"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/Soggetto Obsoleto/Soggetto Obsoleto Sitting On The Seashore Case Stu/index.m3u8",

    context: "A dialogue scene where performance must stay clean, but the scene still needs forward motion.",
    goal: "Hold tension under dialogue, then open slightly on the cut.",
    chosen: {
      key: "A",
      summary: "Sparse pulse under dialogue.",
      reason: "Supports pacing without fighting speech."
    },
    result: "Dialogue stays clear while tension keeps moving.",
    timing: {
      in: { time: "00:12", label: "" },
      turn: { time: "00:27", label: "" },
      out: { time: "00:48", label: "" }
    },
    spottingNote: "Enters once the shoreline settles, keeping the tension focused.",

    directorWanted: "Keep it tense, never cover the words.",
    directorAvoid: "No big hits. No obvious horror tropes.",

    versionsTested: {
      A: "Sparse pulse, low register, almost invisible.",
      B: "More movement in the mid range, risks touching dialogue.",
      C: "No pulse, only texture, risks feeling flat."
    },
    finalChoice: "A, because it supported pacing without fighting speech.",

    delivered: "Stereo master, alternate without pulse, and separated tracks for the mix, clearly labeled.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Stems: pulse, textures",
      "Alt: no pulse",
      "Versioned exports (v1, v2, lock)"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Stems: pulse, textures",
      "Alt: no pulse",
      "Versioned exports (v1, v2, lock)"
    ]
  },
  {
    id: "scene-02",
    title: "Scene 02: Montage",
    projectLabel: "Documentary",
    sceneType: "Montage",
    duration: "00:55",
    tags: ["Rhythm"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/La Sonata Del Caos/La Sonata Del Caos The Mother_s Tale Case Study/index.m3u8",

    context: "A fast cut montage that needed continuity and energy without becoming commercial.",
    goal: "Glue the edit and shape the arc with dynamics, not with loudness.",
    chosen: {
      key: "B",
      summary: "Hybrid pulse that follows the edit.",
      reason: "Keeps momentum without a trailer feel."
    },
    result: "The cut feels intentional without becoming glossy.",
    timing: {
      in: { time: "00:00", label: "" },
      turn: { time: "00:31", label: "" },
      out: { time: "00:55", label: "" }
    },
    spottingNote: "Starts on the first cut to glue the montage.",

    directorWanted: "Momentum, but still human.",
    directorAvoid: "Overly shiny trailer vibe.",

    versionsTested: {
      A: "Percussive drive, might feel too branded.",
      B: "Hybrid pulse, more subtle, follows cuts.",
      C: "No pulse, only pads, loses structure."
    },
    finalChoice: "B, because it followed the edit without turning into an ad.",

    delivered: "Stereo master, alternate lighter version, and separated tracks for the mix.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: lighter percussion",
      "Stems: drums, bass, synths"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Alt: lighter percussion",
      "Stems: drums, bass, synths"
    ]
  },
  {
    id: "scene-03",
    title: "Scene 03: Reveal",
    projectLabel: "Short film",
    sceneType: "Reveal",
    duration: "00:42",
    tags: ["Suspense", "Release"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/La Sonata Del Caos/La Sonata Del Caos Something Threatening Case Stud/index.m3u8",

    context: "A reveal moment where timing matters more than harmony.",
    goal: "Build suspense with restraint and release exactly on the edit.",
    chosen: {
      key: "A",
      summary: "Slow rise with a clean release.",
      reason: "Delivers the turn without overstating it."
    },
    result: "The reveal lands cleanly without a jump scare feel.",
    timing: {
      in: { time: "00:10", label: "" },
      turn: { time: "00:29", label: "" },
      out: { time: "00:42", label: "" }
    },
    spottingNote: "Builds just before the reveal for a clean turn.",

    directorWanted: "A turn that feels inevitable.",
    directorAvoid: "No jumpscare music.",

    versionsTested: {
      A: "Slow rising texture, clean release on cut.",
      B: "More harmony, risks feeling too musical.",
      C: "Minimal, risks being too quiet."
    },
    finalChoice: "A, because it delivered the turn without overstating it.",

    delivered: "Stereo master and separated tracks for the mix, with a precise cut aligned version.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Cut aligned version",
      "Stems: textures, impacts"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Cut aligned version",
      "Stems: textures, impacts"
    ]
  },
  {
    id: "scene-04",
    title: "Scene 04: Chase",
    projectLabel: "Feature film",
    sceneType: "Action",
    duration: "01:06",
    tags: ["Rhythm", "Tension"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/La Sonata Del Caos/La Sonata Del Caos Talia_s Farewell/index.m3u8",

    context: "A night chase where footsteps and breath needed space, but the cut needed drive.",
    goal: "Push momentum without overpowering the sound on screen.",
    chosen: {
      key: "A",
      summary: "Tight pulse with short hits.",
      reason: "Drives the cut without overpowering the scene."
    },
    result: "Urgency stays high without overpowering breath and steps.",
    timing: {
      in: { time: "00:08", label: "" },
      turn: { time: "00:36", label: "" },
      out: { time: "01:06", label: "" }
    },
    spottingNote: "Enters with the first run beat to push urgency.",

    directorWanted: "Urgency that never turns heroic.",
    directorAvoid: "No big action drums.",

    versionsTested: {
      A: "Tight pulse with short hits, stays dark.",
      B: "Faster rhythm, risks feeling like a trailer.",
      C: "Ambient only, loses energy."
    },
    finalChoice: "A, because it drove the cut while staying under the scene.",

    delivered: "Stereo master, a lighter drive option, and separated tracks for the mix.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: lighter pulse",
      "Stems: pulse, low hits, textures"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Alt: lighter pulse",
      "Stems: pulse, low hits, textures"
    ]
  },
  {
    id: "scene-05",
    title: "Scene 05: Quiet Room",
    projectLabel: "Indie drama",
    sceneType: "Atmosphere",
    duration: "01:02",
    tags: ["Emotion"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/La Sonata Del Caos/La Sonata Del Caos A Close Encounter In The Wood/index.m3u8",

    context: "A still scene after bad news where silence is powerful but needs support.",
    goal: "Hold attention with warmth and let the room breathe.",
    chosen: {
      key: "A",
      summary: "Very light bed, almost silent.",
      reason: "Supports the stillness without pushing emotion."
    },
    result: "The room stays quiet but never empty.",
    timing: {
      in: { time: "00:05", label: "" },
      turn: { time: "00:38", label: "" },
      out: { time: "01:02", label: "" }
    },
    spottingNote: "Comes in after the silence settles.",

    directorWanted: "Soft, close, and human.",
    directorAvoid: "No sentimental swell.",

    versionsTested: {
      A: "Very light bed, almost silent.",
      B: "Slow harmonic lift near the end.",
      C: "No music, only tone."
    },
    finalChoice: "A, because it supported the stillness without pushing emotion.",

    delivered: "Stereo master, no-music option, and separated tracks for the mix.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: no-music",
      "Stems: pads, room tone"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Alt: no-music",
      "Stems: pads, room tone"
    ]
  },
  {
    id: "scene-06",
    title: "Scene 06: Breakdown",
    projectLabel: "TV drama",
    sceneType: "Dialogue",
    duration: "00:58",
    tags: ["Emotion", "Release"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/Claudio Re/Claudio Re The Storm Case Study/index.m3u8",

    context: "A conversation that shifts from control to honesty in a few lines.",
    goal: "Let the words lead, then open on the final breath.",
    chosen: {
      key: "A",
      summary: "Subtle pulse with a small lift.",
      reason: "Opens the scene without melodrama."
    },
    result: "The scene opens emotionally without melodrama.",
    timing: {
      in: { time: "00:14", label: "" },
      turn: { time: "00:34", label: "" },
      out: { time: "00:58", label: "" }
    },
    spottingNote: "Enters as the conversation turns honest.",

    directorWanted: "Intimate, not heavy.",
    directorAvoid: "No melodrama.",

    versionsTested: {
      A: "Subtle pulse, then a small lift.",
      B: "More harmony, risks being too warm.",
      C: "Texture only, risks feeling cold."
    },
    finalChoice: "A, because it opened the scene without overselling it.",

    delivered: "Stereo master, softer alternate, and separated tracks for the mix.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: softer lift",
      "Stems: pulse, pads"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Alt: softer lift",
      "Stems: pulse, pads"
    ]
  },
  {
    id: "scene-07",
    title: "Scene 07: Crossing",
    projectLabel: "Short film",
    sceneType: "Montage",
    duration: "01:12",
    tags: ["Rhythm"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/Claudio Re/Claudio Re The Spectre/index.m3u8",

    context: "A travel montage that had to feel purposeful, not like a postcard.",
    goal: "Shape a clear arc while keeping it natural and grounded.",
    chosen: {
      key: "A",
      summary: "Gentle pulse that follows cuts.",
      reason: "Holds the montage together without a sales feel."
    },
    result: "The montage feels cohesive and purposeful.",
    timing: {
      in: { time: "00:00", label: "" },
      turn: { time: "00:44", label: "" },
      out: { time: "01:12", label: "" }
    },
    spottingNote: "Starts on motion to keep the montage moving.",

    directorWanted: "Steady progress with a small lift.",
    directorAvoid: "No glossy travel vibe.",

    versionsTested: {
      A: "Gentle pulse that follows cuts.",
      B: "More drive, risks feeling too busy.",
      C: "No pulse, loses direction."
    },
    finalChoice: "A, because it held the montage together without a sales feel.",

    delivered: "Stereo master, lighter option, and separated tracks for the mix.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: lighter pulse",
      "Stems: pulse, bass, textures"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Alt: lighter pulse",
      "Stems: pulse, bass, textures"
    ]
  },
  {
    id: "scene-08",
    title: "Scene 08: First Look",
    projectLabel: "Series",
    sceneType: "Reveal",
    duration: "00:49",
    tags: ["Suspense", "Emotion"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/Claudio Re/Claudio Re My Sin Is Rotten/index.m3u8",

    context: "A first look at a place that should feel both safe and uneasy.",
    goal: "Hold a gentle tension and release it with the edit.",
    chosen: {
      key: "A",
      summary: "Thin texture with a small lift.",
      reason: "Balances wonder with restraint."
    },
    result: "Wonder stays gentle with a hint of doubt.",
    timing: {
      in: { time: "00:11", label: "" },
      turn: { time: "00:33", label: "" },
      out: { time: "00:49", label: "" }
    },
    spottingNote: "Enters on the first wide shot to hint unease.",

    directorWanted: "Quiet wonder with a hint of doubt.",
    directorAvoid: "No obvious mystery cue.",

    versionsTested: {
      A: "Thin texture with a small lift.",
      B: "More harmony, risks feeling too bright.",
      C: "No lift, risks feeling flat."
    },
    finalChoice: "A, because it balanced wonder with restraint.",

    delivered: "Stereo master, alternate without lift, and separated tracks for the mix.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: no lift",
      "Stems: textures, soft hits"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Alt: no lift",
      "Stems: textures, soft hits"
    ]
  },
  {
    id: "scene-09",
    title: "Scene 09: Escape",
    projectLabel: "Feature film",
    sceneType: "Action",
    duration: "01:20",
    tags: ["Tension", "Release"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/Claudio Re/Claudio Re My Crown, My Ambition, My Queen Case St/index.m3u8",

    context: "An escape that builds pressure and then opens as the door clears.",
    goal: "Stack tension and let it release on the cut.",
    chosen: {
      key: "A",
      summary: "Rising pulse with a clean release.",
      reason: "Matches the cut and releases cleanly."
    },
    result: "Pressure builds and releases right on the cut.",
    timing: {
      in: { time: "00:18", label: "" },
      turn: { time: "00:52", label: "" },
      out: { time: "01:20", label: "" }
    },
    spottingNote: "Starts as the escape begins to build pressure.",

    directorWanted: "Pressure without chaos.",
    directorAvoid: "No loud drops.",

    versionsTested: {
      A: "Rising pulse with a clean release.",
      B: "More hits, risks pulling focus.",
      C: "Low drone only, loses drive."
    },
    finalChoice: "A, because it matched the cut and released cleanly.",

    delivered: "Stereo master, alternate with softer release, and separated tracks for the mix.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: softer release",
      "Stems: pulse, impacts, textures"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Alt: softer release",
      "Stems: pulse, impacts, textures"
    ]
  },
  {
    id: "scene-10",
    title: "Scene 10: Aftermath",
    projectLabel: "Short film",
    sceneType: "Atmosphere",
    duration: "01:03",
    tags: ["Release", "Emotion"],
    isPublic: true,
    festivalCirculation: false,
    embedUrl: "/uploads/video/_hls/Claudio Re/Claudio Re What If A Man Can_t Regret Case Study/index.m3u8",

    context: "A quiet ending that needs closure without feeling final too soon.",
    goal: "Let the scene settle and leave a soft echo.",
    chosen: {
      key: "A",
      summary: "Light bed that fades with the cut.",
      reason: "Closes the scene without forcing emotion."
    },
    result: "The ending settles with a soft, honest close.",
    timing: {
      in: { time: "00:07", label: "" },
      turn: { time: "00:41", label: "" },
      out: { time: "01:03", label: "" }
    },
    spottingNote: "Enters after the last line to let it settle.",

    directorWanted: "Calm and honest.",
    directorAvoid: "No big emotional lift.",

    versionsTested: {
      A: "Light bed that fades with the cut.",
      B: "More harmony, risks feeling too resolved.",
      C: "No music, risks feeling unfinished."
    },
    finalChoice: "A, because it closed the scene without forcing emotion.",

    delivered: "Stereo master, no-music option, and separated tracks for the mix.",
    technicalDeliverables: [
      "48 kHz, 24 bit stereo master",
      "Alt: no-music",
      "Stems: pads, textures"
    ],

    technicalNotes: [
      "48 kHz, 24 bit stereo master",
      "Alt: no-music",
      "Stems: pads, textures"
    ]
  }
];
