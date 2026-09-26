/* =============================================================================
   PhysPlan — project page DATA
   Every number on this page is taken from the paper (main text + appendix). Edit here; js/main.js only renders.
   ============================================================================= */

const SITE = {
  title: "PhysPlan",
  subtitle: "Grounded Physical State Reasoning and Graph-Guided Optimization for Physically Plausible Video Generation",
  tagline:
    "A training-free image-to-video framework in which a state graph grounded in the observed frame " +
    "decides <b>what</b>, <b>where</b>, and <b>when</b> a frozen video diffusion model is guided.",

  links: {
    paper: "#",
    code: "#",
    bibtex: "#bibtex"
  },

  // ---- Authors (anonymous submission version) --------------------------------
  authors: [
    { name: "Anonymous Authors", aff: [], link: "" }
  ],
  affiliations: [],
  authorNote: "Paper under double-blind review",

  abstract:
    "Video diffusion models (VDMs) synthesize photorealistic content, yet they often fail to follow the course " +
    "that a physical phenomenon should take within a given scene. Recent training-free methods let a " +
    "vision-language model (VLM) plan the phenomenon and guide a frozen VDM toward the plan; however, such plans " +
    "are derived from the prompt and consumed as whole keyframes or trajectories, which leaves unspecified where " +
    "the consequences land in the observed scene and turns incidental visual details into optimization targets. " +
    "We observe that a phenomenon specified in words unfolds as sparse, local changes to the physical state of the " +
    "observed scene. Building on this observation, we present <strong>PhysPlan</strong>, a training-free " +
    "image-to-video framework that represents a phenomenon as a grounded state graph and uses this graph to decide " +
    "what, where, and when the guidance constrains. <em>Grounded Physical State Reasoning</em> decomposes the " +
    "phenomenon into physical deltas, each stating which objects change, to what state, and by which physical rule, " +
    "and translates each delta into graph edits, verified by deterministic checks, that leave all other objects " +
    "unchanged. <em>Graph-Guided Test-Time Optimization</em> renders a keyframe for each state, measures the " +
    "denoised estimates only along the properties selected by the edits, and concentrates the update on the edited " +
    "objects. On PhyGenBench and Physics-IQ, PhysPlan raises its base model from 0.52 to 0.77 and from 27.1 to " +
    "38.2, surpassing the strongest prior I2V method (0.60 and 34.6), and lowers FVD by over 20%."
};

/* ---- Headline numbers (Tables 2, 3, 16) ------------------------------------ */
const HIGHLIGHTS = [
  { big: "0.52 → 0.77", small: "PhyGenBench average (+0.25 over the base model)" },
  { big: "27.1 → 38.2", small: "Physics-IQ average (+11.1 over the base model)" },
  { big: "−21% / −29%", small: "FVD on PhyGenBench / Physics-IQ" },
  { big: "72%",         small: "preferred for physical plausibility (60 participants)" }
];

/* ---- Contributions (Section 1) --------------------------------------------- */
const CONTRIBUTIONS = [
  { title: "PhysPlan",
    text: "a general training-free framework in which a state graph grounded in the observed frame determines what, where, and when a frozen VDM is guided." },
  { title: "Grounded Physical State Reasoning",
    text: "which evolves the state graph only through physical deltas realized as verified edits, making every change traceable and every unchanged object explicit." },
  { title: "Graph-Guided Test-Time Optimization",
    text: "which selects the measured properties by the edit types, compares objects rather than pixels, and weights the update by the regions of the edited objects." },
  { title: "",
    text: "On PhyGenBench and Physics-IQ, PhysPlan raises its base model from 0.52 to 0.77 and from 27.1 to 38.2 while improving FVD, VBench quality, and human preference; ablations confirm that both gaps matter." }
];

/* ---- The two gaps PhysPlan addresses (Section 1) ---------------------------- */
const GAPS = [
  { title: "Plans come from the prompt, outcomes from the scene",
    text: "Where the consequences of a phenomenon land depends on the physical relations among the observed objects. A prompt-derived plan does not know which passive objects the scene contains, and when states are described anew as complete scenes, the VLM may omit passive objects, alter uninvolved ones, or lose object identities." },
  { title: "Plans are consumed as whole frames",
    text: "A keyframe commits to details the plan never intended, such as the exact contour of a puddle. Guiding toward whole keyframes turns these details into targets, and the gradient disturbs content that should remain unchanged." }
];

/* ---- WHAT / WHERE / WHEN (Eq. 1) ------------------------------------------- */
const WWW = [
  { k: "WHAT",  from: "edit type",       text: "Each edit type selects the single property that is measured: appearance, area, location, depth order, or presence." },
  { k: "WHERE", from: "edited objects",  text: "The instances of the edited objects define the region in which the gradient acts; everything else stays with the VDM." },
  { k: "WHEN",  from: "anchor frame fᵢ", text: "Each state Gᵢ is tied to the frame at which it should hold; the VDM fills in the motion between anchors." }
];

/* ---- GPSR steps (Section 3.1, Figure 2 top) --------------------------------- */
const GPSR_STEPS = [
  { id: "ground", label: "Ground", sym: "G₀",
    title: "Grounded phenomenon decomposition — scene graph",
    desc: "A VLM parses the observed frame I₀ and the prompt w into a state graph G₀ = (V₀, E₀). Nodes are <b>all</b> objects visible in I₀, not only those named in w: a prompt about melting ice never mentions the tray, yet the water spreads onto it. Each node has a persistent identifier, a category, and attributes under six fixed keys with open-vocabulary values (phase, integrity, surface, color, extent, configuration). Edges take a relation from a fixed set: physical relations (support, contact, containment, attachment) and spatial relations (left of, above, in front of, near)." },
  { id: "decompose", label: "Decompose", sym: "δ₁ … δₖ",
    title: "Physical deltas with qualitative rules",
    desc: "The VLM decomposes the phenomenon into a causally ordered sequence of physical deltas Δ = (δ₁, …, δ_K). Each entry gives a changing object, its new state, and the <b>physical rule</b> that produces it, e.g. (ice#1, partially melted, <i>ice above its melting point turns into water</i>). Rules are short qualitative statements without numbers: the VLM judges which objects change, how, and in what order, rather than estimating quantities." },
  { id: "evolve", label: "Evolve", sym: "Gᵢ = Gᵢ₋₁ ⊕ εᵢ",
    title: "Delta-driven graph evolution with deterministic checks",
    desc: "The same VLM translates each delta into typed edits εᵢ from a small operator set (UPDATE, LINK/UNLINK, SPAWN, CONSUME). Four deterministic checks (grounding, coverage, lineage, consistency) reject invalid proposals, and violations are returned to the VLM, which retries. Unedited nodes are copied unchanged, so every change comes from a delta and every unchanged object is explicit." },
  { id: "anchor", label: "Anchor", sym: "dᵢ → fᵢ",
    title: "Event timing estimation",
    desc: "VLMs are unreliable at absolute durations, so the VLM only divides the video among the events through fractions dᵢ, a relative judgment. With Σ dᵢ &lt; 1 the final state stays visible at the end. The anchor of Gᵢ is the end of event i: fᵢ = ⌊(Σ<sub>j≤i</sub> d<sub>j</sub>)(F − 1)⌉." }
];

/* ---- GTO steps (Section 3.2, Figure 2 bottom) -------------------------------- */
const GTO_STEPS = [
  { title: "Keyframe rendering", img: "assets/chain/I1.jpg", cap: "keyframe I₁",
    text: "For each event the net edits ε̄ᵢ (all edits so far, cancellations removed) are written as an editing instruction, and an image editor renders the keyframe Iᵢ from I₀. Editing every keyframe from I₀ rather than from the previous one prevents errors from accumulating. Object masks and depth are then extracted." },
  { title: "Graph-selected measurement", img: "assets/chain/occupancy.jpg", cap: "soft occupancy Φₒ(x̂₁)",
    text: "At each guided step only the latent slice around an anchor is decoded into a preview x̂ᵢ. Objects are located in it by a differentiable soft occupancy map Φₒ built from frozen features, matched to the keyframe instances with the Hungarian algorithm, and compared only on the property that their edit changes. Properties the graph does not select give no gradient." },
  { title: "Region-weighted update", img: "assets/chain/preview.jpg", cap: "preview x̂₁ (clean estimate)",
    text: "Each term's gradient is normalized and restricted to a region Ωₖ, the convex hull of where the object is and where it should be. Outside the region the update is scaled by λ ∈ [0, 1], so the background stays stable while edited objects are moved, grown, added, or removed." }
];

/* ---- Operator set O (Table 1) ----------------------------------------------- */
const OPERATORS = [
  { op: "UPDATE(o, α, s)",           effect: "set attribute α (other than extent) to s", term: "app",   name: "appearance",
    eq: "L<sub>app</sub> = Σ 1 − cos( F̄<sub>P</sub>(x̂ᵢ), F̄<sub>Q</sub>(Iᵢ) )", ex: "tray#2 becomes wet" },
  { op: "UPDATE(o, extent, s)",      effect: "set the extent of o to s",                 term: "ext",   name: "area",
    eq: "L<sub>ext</sub> = Σ log²( |Φₒ(x̂ᵢ)⊙R| / |Φₒ(Iᵢ)⊙R| )", ex: "puddle#3 spreads over the tray" },
  { op: "LINK / UNLINK(a, r, b)",    effect: "add/remove a planar relation",             term: "pos",   name: "location",
    eq: "L<sub>pos</sub> = Σ ‖ c(x̂ᵢ) − c(Iᵢ) ‖²", ex: "the ball ends up above the crate floor" },
  { op: "LINK / UNLINK(a, r, b)",    effect: "add/remove a depth relation",              term: "depth", name: "depth order",
    eq: "L<sub>depth</sub> = ( Δz<sub>ab</sub>(x̂ᵢ) − Δz<sub>ab</sub>(Iᵢ) )²", ex: "the match goes inside the glass" },
  { op: "SPAWN(o′ ← o), CONSUME(o)", effect: "add o′ with lineage o; remove o",          term: "cnt",   name: "presence",
    eq: "L<sub>count</sub>: suppress unmatched preview instances, fill in unmatched keyframe instances", ex: "ice#1 is consumed, puddle#3 spawns" }
];

/* ---- Event chain for "an ice cube melting in the sun" (Table 8, F = 49) ---- */
const EVENT_CHAIN = {
  prompt: "An ice cube melting in the sun.",
  frames: 49,
  states: [
    { i: 0, kf: "assets/chain/I0.jpg", f: 0, d: null,
      label: "Observed",
      state: "ice#1 on tray#2, tray#2 on table#4",
      rule: "grounded in the input frame I₀",
      edits: [] },
    { i: 1, kf: "assets/chain/I1.jpg", f: 14, d: 0.30,
      label: "Partially melted",
      state: "ice#1: partially melted; tray#2: wet beneath ice#1",
      rule: "ice above its melting point turns into water; liquid flows down onto its support",
      edits: [["UPDATE", "ice#1, material phase, partially melted"], ["UPDATE", "tray#2, surface, wet"]] },
    { i: 2, kf: "assets/chain/I2.jpg", f: 29, d: 0.30,
      label: "Melted into a puddle",
      state: "ice#1: melted into puddle#3 on tray#2",
      rule: "ice above its melting point turns into water",
      edits: [["SPAWN", "puddle#3 ← ice#1"], ["CONSUME", "ice#1"], ["LINK", "tray#2, support, puddle#3"]] },
    { i: 3, kf: "assets/chain/I3.jpg", f: 41, d: 0.25,
      label: "Spread over the tray",
      state: "puddle#3: spread over most of tray#2",
      rule: "liquid spreads over a flat support",
      edits: [["UPDATE", "puddle#3, extent, spread over most of the tray"]] }
  ],
  note: "The table on which the tray stands (table#4) is never named by a delta and stays unchanged throughout."
};

/* ---- Deterministic checks (Section 3.1, Table 11) --------------------------- */
const CHECKS = [
  { name: "Grounding",   text: "edits use existing or newly spawned nodes and valid keys or relation types", share: 31 },
  { name: "Coverage",    text: "exactly the objects named in the delta are edited",                          share: 46 },
  { name: "Lineage",     text: "nodes are added only by SPAWN and removed only by CONSUME",                  share: 8 },
  { name: "Consistency", text: "no attribute is set twice; support and containment stay acyclic",             share: 15 }
];
const CHECK_STATS = { first: 87, retries: 97, rejected: 3 };

/* ---- Video comparison gallery ---------------------------------------------
   Clips live in assets/videos/, named "<id>_<method-key>.mp4"; the input frame
   is "<id>_input.png". Same prompt and conditioning frame for every method.
   --------------------------------------------------------------------------- */
const COMPARISONS = [
  { id: "free_fall",     domain: "Mechanics", title: "Ball Released Above a Crate",
    prompt: "An orange inflatable basketball is suspended above a black plastic crate placed on a wooden table. The ball is then released. Static shot with no camera movement.",
    note: "CogVideoX and Frame Guidance duplicate the ball and Wan2.1 never lets it fall in; only PhysPlan keeps a single ball that comes to rest in the crate (Figure 4)." },
  { id: "match_water",   domain: "Thermal",   title: "Lit Match Lowered into Water",
    prompt: "A lit match is being lowered into a glass of water. Static shot with no camera movement.",
    note: "The flame vanishes too early (CogVideoX), keeps burning under water (Wan2.1, VLIPP), or the water warps (Frame Guidance); PhysPlan quenches the flame as the match enters the water (Figure 4)." },
  { id: "ramp_roll",     domain: "Mechanics", title: "Ball Rolling Down a Ramp",
    prompt: "A simple ramp made of cardboard propped up by a blue block on a light-colored wooden table. There's a black pipe to the left of the frame and a yellow tennis ball rolls out of the pipe towards the ramp. Static shot with no camera movement." },
  { id: "turntable",     domain: "Mechanics", title: "Block Spinning on a Turntable",
    prompt: "A blue rectangular wooden block is placed on a black rotating turntable that rotates clockwise illuminated by a spotlight casting a long shadow on the wall behind it. Static shot with no camera movement." },
  { id: "pour_glass",    domain: "Fluid",     title: "Pouring Liquid into a Glass",
    prompt: "A glass beverage dispenser filled with a bright red liquid is set up on a woven basket and is pouring the liquid into a clear glass on a wooden table. Static shot with no camera movement." },
  { id: "splash_domino", domain: "Fluid",     title: "Domino Dropped into Liquid",
    prompt: "A grabber tool holding a white domino drops the domino into a dark-colored liquid in a blue mug that is on a wooden surface. Static shot with no camera movement." },
  { id: "paper_water",   domain: "Fluid",     title: "Paper Dropped onto a Water Bowl",
    prompt: "A grabber tool is holding a crumpled piece of paper over a bowl of water on a wooden table. The grabber then releases the crumpled paper onto the bowl. Static shot with no camera movement." },
  { id: "leaves_fire",   domain: "Material",  title: "Match Ignites Dry Leaves",
    prompt: "A small burning match was thrown into a pile of dry leaves." }
];
// Columns (left → right), in the order of Figure 4.
const COMPARE_METHODS = [
  { key: "input",         label: "Input frame",   type: "image" },
  { key: "cogvideox",     label: "CogVideoX" },
  { key: "wan",           label: "Wan2.1" },
  { key: "vlipp",         label: "VLIPP" },
  { key: "frameguidance", label: "Frame Guidance" },
  { key: "physplan",      label: "PhysPlan (Ours)", ours: true }
];

/* =============================================================================
   QUANTITATIVE DATA
   ============================================================================= */

// ---- Table 2: PhyGenBench (PCA score in [0,1]) and Physics-IQ ----------------
const MAIN_TABLE = {
  pgbCols: ["Mech.", "Optics", "Thermal", "Material", "Avg."],
  piqCols: ["S.M.", "F.D.", "Optics", "Magn.", "Thermo.", "Avg."],
  groups: [
    { name: "Text-to-video models", rows: [
      { model: "Kling",             pgb: [0.45, 0.58, 0.50, 0.40, 0.49] },
      { model: "Wan2.2-14B",        pgb: [0.53, 0.61, 0.58, 0.43, 0.54] },
      { model: "CogVideoX-5B",      pgb: [0.39, 0.55, 0.40, 0.42, 0.45] },
      { model: "+ PhysHPO",         pgb: [0.55, 0.68, 0.50, 0.65, 0.61], sub: true },
      { model: "+ Chain-of-Events", pgb: [0.70, 0.79, 0.77, 0.64, 0.73], sub: true },
      { model: "LTX-Video",         pgb: [0.35, 0.45, 0.36, 0.38, 0.39] },
      { model: "+ CausalMotion",    pgb: [0.61, 0.71, 0.68, 0.61, 0.65], sub: true }
    ]},
    { name: "Image-to-video models", rows: [
      { model: "CogVideoX-I2V-5B", base: true, pgb: [0.48, 0.69, 0.43, 0.41, 0.52], piq: [30.4, 29.8, 16.7, 13.3, 8.5, 27.1] },
      { model: "SVD-XT",                       pgb: [0.46, 0.68, 0.48, 0.41, 0.52], piq: [21.9, 20.5, 6.8, 8.4, 17.1, 19.1] },
      { model: "LTX-Video-I2V",                pgb: [0.47, 0.65, 0.46, 0.37, 0.50], piq: [30.2, 29.8, 15.9, 13.2, 8.4, 26.8] }
    ]},
    { name: "Reasoning-guided and training-free guided I2V methods", rows: [
      { model: "VLIPP",                        pgb: [0.55, 0.71, 0.60, 0.53, 0.60], piq: [42.3, 34.1, 16.9, 13.4, 8.8, 34.6] },
      { model: "Frame Guidance",               pgb: [0.52, 0.56, 0.47, 0.48, 0.51], piq: [35.4, 27.4, 24.1, 13.9, 8.4, 30.3] },
      { model: "PhysPlan (Ours)", ours: true,  pgb: [0.81, 0.78, 0.74, 0.75, 0.77], piq: [45.6, 31.8, 30.4, 19.7, 9.5, 38.2] }
    ]}
  ],
  caption: "Higher is better; averages are weighted by the number of samples per domain. Best in each column is bold. T2V results are reported by prior work (Physics-IQ is evaluated for I2V models only); VLIPP is reported by its authors. S.M. Solid Mechanics · F.D. Fluid Dynamics · Magn. Magnetism · Thermo. Thermodynamics."
};

// ---- Table 3: FID / FVD ------------------------------------------------------
const PERCEPTUAL = {
  cols: ["PhyGenBench FID ↓", "PhyGenBench FVD ↓", "Physics-IQ FID ↓", "Physics-IQ FVD ↓"],
  rows: [
    { m: "CogVideoX-I2V-5B", v: [48.2, 632.8, 55.4, 698.5], base: true },
    { m: "Frame Guidance",   v: [46.4, 580.4, 49.2, 603.4] },
    { m: "PhysPlan (Ours)",  v: [45.4, 500.2, 47.7, 495.6], ours: true }
  ]
};

// ---- Table 9: VBench quality dimensions ------------------------------------
const VBENCH = {
  dims: ["QS", "SC", "BC", "TF", "MS", "DD", "AQ", "IQ"],
  dimNames: {
    QS: "Quality Score", SC: "Subject Consistency", BC: "Background Consistency",
    TF: "Temporal Flickering", MS: "Motion Smoothness", DD: "Dynamic Degree",
    AQ: "Aesthetic Quality", IQ: "Imaging Quality"
  },
  groups: [
    { name: "Closed-source VDMs", rows: [
      { m: "Runway Gen-3", v: [84.11, 97.10, 96.62, 98.61, 99.23, 60.14, 63.34, 66.82] },
      { m: "Kling",        v: [83.39, 98.33, 97.60, 99.30, 99.40, 46.94, 61.21, 65.62] },
      { m: "Pika",         v: [82.92, 96.94, 97.36, 99.74, 99.50, 47.50, 62.04, 61.87] },
      { m: "Luma",         v: [83.47, 97.33, 97.43, 98.64, 99.35, 44.26, 65.51, 66.55] }
    ]},
    { name: "Open-source", rows: [
      { m: "CogVideoX-I2V-5B", v: [83.05, 96.45, 96.71, 98.97, 97.20, 69.51, 61.88, 63.33], base: true },
      { m: "PhysPlan (Ours)",  v: [84.88, 97.06, 97.10, 98.72, 98.80, 75.62, 62.20, 65.78], ours: true }
    ]}
  ]
};

// ---- User study (Section 4.3, Appendix E, Tables 15–16) ---------------------
const USER_STUDY = {
  n: 60,
  protocol: "Two-alternative forced choice against CogVideoX-I2V-5B or Frame Guidance · 40 prompts (20 PhyGenBench, 20 Physics-IQ) · 2,400 ratings per criterion · randomized left/right order, no ties",
  criteria: ["Physical plausibility", "Frame quality", "Temporal smoothness"],
  pooled: [72, 60, 73],
  perBaseline: [
    { vs: "vs. CogVideoX-I2V-5B", v: [76, 63, 77] },
    { vs: "vs. Frame Guidance",   v: [68, 57, 69] },
    { vs: "Pooled",               v: [72, 60, 73], pooled: true }
  ]
};

// ---- Table 4: Ablation on Physics-IQ ---------------------------------------
const ABLATION = {
  cols: ["S.M.", "F.D.", "Optics", "Magn.", "Thermo.", "Avg."],
  full: { name: "PhysPlan (full)", v: [45.6, 31.8, 30.4, 19.7, 9.5, 38.2] },
  groups: [
    { name: "Grounded Physical State Reasoning", rows: [
      { id: "i",    name: "Prompt-derived plan",                    v: [31.1, 30.2, 20.4, 13.8, 8.6, 28.1] },
      { id: "ii",   name: "Full-graph regeneration",                v: [35.2, 30.2, 23.6, 15.9, 8.9, 30.9] }
    ]},
    { name: "Graph-Guided Test-Time Optimization", rows: [
      { id: "iii",  name: "Whole-frame L2 loss (= Frame Guidance)", v: [35.4, 27.4, 24.1, 13.9, 8.4, 30.3] },
      { id: "iv",   name: "w/o region weighting (λ = 1)",           v: [42.8, 30.7, 28.3, 17.1, 9.1, 36.0] }
    ]},
    { name: "Measurement terms", rows: [
      { id: "v",    name: "w/o L_app",   v: [42.6, 29.4, 25.5, 18.1, 9.3, 35.3] },
      { id: "vi",   name: "w/o L_ext",   v: [43.1, 30.6, 28.7, 18.8, 8.8, 36.2] },
      { id: "vii",  name: "w/o L_pos",   v: [40.7, 31.2, 29.2, 17.5, 9.2, 35.0] },
      { id: "viii", name: "w/o L_depth", v: [42.9, 31.2, 24.2, 15.4, 8.9, 35.6] }
    ]}
  ],
  note: "Each setting changes one component and keeps all others fixed. Every component contributes, and the two gaps cause the largest drops: removing the state graph (i) costs 10.1 points, of which grounding alone accounts for 2.2 when compared with (iii), which uses the same loss. Each term matters most where it is designed to: L<sub>pos</sub> for Solid Mechanics, L<sub>app</sub> for Fluid Dynamics and Optics, and L<sub>depth</sub> for Optics and Magnetism."
};

// ---- Table 10: Failure attribution on Physics-IQ ------------------------------
const FAILURE_ATTR = {
  cols: ["Reasoning", "Edits", "Keyframe", "Localization", "Guidance"],
  rows: [
    { domain: "Solid Mechanics", v: [12, 4, 30, 26, 28] },
    { domain: "Fluid Dynamics",  v: [8, 3, 20, 29, 40] },
    { domain: "Optics",          v: [10, 2, 14, 52, 22] },
    { domain: "Magnetism",       v: [18, 5, 12, 35, 30] },
    { domain: "Thermodynamics",  v: [21, 6, 30, 18, 25] },
    { domain: "All",             v: [11, 4, 25, 30, 30], avg: true }
  ],
  note: "Share of failed videos (%) per pipeline stage among the 66 lowest-scoring PhysPlan videos on Physics-IQ; each row sums to 100. Most failures happen after the plan is made: localization and guidance each account for 30%, keyframes for 25%, reasoning for 11%, and edits for only 4%."
};

// ---- Tables 12 & 14: cost ----------------------------------------------------
const RUNTIME = [
  { group: "Grounded Physical State Reasoning" },
  { stage: "Scene parsing and decomposition", model: "Gemini 3 Flash", t: 6.8 },
  { stage: "Delta translation and checks",    model: "Gemini 3 Flash", t: 4.2 },
  { stage: "Keyframe rendering",              model: "Gemini 3 Pro Image", t: 12.5 },
  { stage: "Masks and depth",                 model: "Grounded-SAM-2, Depth Anything V2", t: 4.0 },
  { group: "Graph-Guided Test-Time Optimization" },
  { stage: "Preview decoding",                model: "CogVideoX VAE", t: 24.5 },
  { stage: "Measurement and backpropagation", model: "DINOv3, CogVideoX", t: 214.0 },
  { stage: "Sampling and final decoding",     model: "CogVideoX", t: 100.0 },
  { total: true, stage: "Total", model: "", t: 366.0 }
];
const COST = [
  { m: "CogVideoX-I2V-5B", t: 100, mem: 26, api: "—", base: true },
  { m: "Frame Guidance",   t: 310, mem: 58, api: "—" },
  { m: "PhysPlan, K = 3",  t: 366, mem: 64, api: "$0.45", ours: true },
  { m: "PhysPlan, K = 5",  t: 471, mem: 70, api: "$0.73" },
  { m: "PhysPlan, K = 7",  t: 575, mem: 76, api: "$1.01" }
];
const COST_NOTE = "Single NVIDIA H100 (80 GB), CogVideoX-I2V-5B, 720×480, 49 frames, K = 3 events unless stated. All GPSR steps take 27.5 s (7.5% of the total) and about $0.45 in API calls, over 90% of it for rendering keyframes. Runtime and API cost grow roughly linearly with the number of events (≈52 s and $0.14 per event), and no training is required.";

const IMPLEMENTATION = [
  ["VLM", "Gemini 3 Flash, JSON-constrained outputs"],
  ["Keyframe editor", "Gemini 3 Pro Image"],
  ["Masks · depth", "Grounded-SAM-2 · Depth Anything V2"],
  ["Occupancy features", "DINOv3"],
  ["Frozen VDM", "CogVideoX-I2V-5B, guidance defaults from Frame Guidance"]
];

const LIMITATIONS =
  "PhysPlan represents a phenomenon through discrete objects: every node, edit, and measurement refers to an object " +
  "with an instance, a mask, and a centroid, and the video is constrained only at the anchor frames. This makes it most " +
  "effective when a phenomenon is carried by clearly delineated objects, where it achieves its largest gains (Solid " +
  "Mechanics, Optics, and Magnetism on Physics-IQ; Mechanics and Material on PhyGenBench). It is weaker in Fluid " +
  "Dynamics, where liquids that spread, splash, or split lack clear object boundaries and their continuous motion " +
  "between anchors is left to the VDM; VLIPP stays ahead there by planning trajectories. Future work includes " +
  "representations for phenomena beyond discrete objects, such as fields or particle sets for fluids, combined with " +
  "motion planning between anchors, as well as evaluation on further VDMs.";

const BIBTEX = `@inproceedings{anonymous2027physplan,
  title     = {PhysPlan: Grounded Physical State Reasoning and Graph-Guided
               Optimization for Physically Plausible Video Generation},
  author    = {Anonymous},
  booktitle = {Submitted to International Conference on Learning Representations},
  year      = {2027},
  note      = {Under review}
}`;
