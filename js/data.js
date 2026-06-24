/* =============================================================================
   PhysPlan — project page DATA & CONFIG
   -----------------------------------------------------------------------------
   THIS FILE IS THE SINGLE PLACE YOU EDIT.
   All authors, links, numbers and the video gallery are defined here.
   Search for "TODO" to find the few things you still need to fill in.
   ============================================================================= */

const SITE = {
  title: "PhysPlan",
  subtitle: "Physics-Aware Video Generation via Agentic Planning and Graph-Guided Optimization",
  tagline:
    "A training-free framework that casts a vision-language model as a physics planner — backbone-agnostic, " +
    "with no fine-tuning of the video diffusion model.",

  // ---- Links (TODO: add the real URLs) ---------------------------------------
  links: {
    paper: "#",            // TODO: arXiv / publisher URL (supplementary is bundled in the paper)
    code: "#",             // TODO: GitHub URL (even a stub repo helps credibility)
    bibtex: "#bibtex"
  },

  // ---- Authors (TODO: add profile / homepage links via `link`) ---------------
  authors: [
    { name: "Minh-Loi Nguyen",  aff: [1, 2], link: "#", note: "*" },
    { name: "Xuan-Vu Le",       aff: [1, 2], link: "#", note: "*" },
    { name: "Thanh-Toan Do",    aff: [3], link: "#", note: "‡" },
    { name: "Tam V. Nguyen",    aff: [4], link: "#" },
    { name: "Minh-Triet Tran",  aff: [1, 2], link: "#" },
    { name: "Trung-Nghia Le",   aff: [1, 2], link: "#", note: "†‡" }
  ],
  affiliations: [
    { id: 1, name: "University of Science" },
    { id: 2, name: "Vietnam National University, Ho Chi Minh City" },
    { id: 3, name: "Monash University" },
    { id: 4, name: "University of Dayton" }
  ],
  authorNote: "* Equal contribution  ·  † Corresponding author  ·  ‡ Co-supervisor",

  abstract:
    "Video diffusion models (VDMs) synthesize high-fidelity, photorealistic video, yet they fundamentally lack an " +
    "intrinsic understanding of physical laws and frequently produce visually appealing but causally illogical " +
    "sequences — structural hallucinations and physically implausible dynamics. Injecting physical awareness via " +
    "training-free test-time optimization is promising, but existing methods rely on global gradient updates and rigid " +
    "scheduling heuristics that corrupt passive backgrounds and fail to model complex dynamic state changes. We propose " +
    "<strong>PhysPlan</strong>, a training-free guidance framework that shifts the paradigm from stochastic visual " +
    "interpolation to <em>agentic physics simulation</em>. First, a VLM acts as an iterative cognitive planner, " +
    "decomposing prompts into a causal <strong>Chain-of-Visual-Thought</strong> — a multimodal representation of " +
    "kinematic trajectories and 3D depth geometries. These signals drive an object-centric test-time optimization: " +
    "<strong>Object-Centric Gradient Routing</strong> isolates kinematic modifications and completely locks the passive " +
    "environment, while <strong>Kinetic Intensity Profiling</strong> dynamically parameterizes hyperparameters to match " +
    "the severity of physical deformations. On PhyGenBench and Physics-IQ, PhysPlan significantly outperforms both " +
    "foundational and controllable VDM baselines."
};

/* ---- Contributions (academic list) ---------------------------------------- */
const CONTRIBUTIONS = [
  { title: "A two-stage agentic framework",
    text: "that couples VLM-driven physical planning with training-free, graph-guided video optimization, requiring no fine-tuning of the base video diffusion model." },
  { title: "Object-Centric Gradient Routing",
    text: "which confines test-time gradient updates to active-object regions, eliminating the background drift common to global guidance methods." },
  { title: "Kinetic Intensity Profiling",
    text: "which links the planner's semantic estimate of physical severity to the optimization schedule, adapting guidance to diverse physical dynamics." }
];

/* ---- Method stepper: Chain-of-Visual-Thought ------------------------------ */
const METHOD_STEPS = [
  { id: "prompt", label: "Prompt + Image",
    desc: "A textual prompt p and an optional initial frame I₀ enter the cognitive planner." },
  { id: "graph", label: "Scene Graph",
    desc: "The VLM parses the scene into a graph G=(V,E): nodes are physical entities & materials, edges are physical relations and forces." },
  { id: "delta", label: "Physical Delta",
    desc: "It infers the governing physical law and predicts a causal sequence of K discrete state transitions Δ_phys = {δ₁,…,δ_K}." },
  { id: "keyframes", label: "Keyframes",
    desc: "Each state is rendered into a visual keyframe via a conditional image-editing prior, anchored to a target frame index." },
  { id: "masks", label: "Kinematic Masks + Depth",
    desc: "Grounded-SAM-2 isolates active objects; DepthAnythingV2 extracts 3D depth — turning RGB states into enforceable conditions." },
  { id: "kip", label: "Kinetic Intensity Profile",
    desc: "The VLM scores per-frame physical volatility w ∈ [0,1]^F, driving adaptive learning rate and guidance step density." }
];

/* ---- Chain-of-Visual-Thought worked example (ice cube) ----
   Keyframes, masks and depth maps are the real exported assets. The scene-graph
   nodes/edges and the δ₁ Melting reasoning block (result w=0.45) match the
   supplementary's worked example. The δ₂ Puddle Formation reasoning/score and the
   per-frame kinetic curve are illustrative, chosen to be physically consistent
   (volatility peaks at the phase change, then tapers as the puddle settles). */
const COVT = {
  prompt: "An ice cube melting in the sun.",
  frames: 49,
  // Kinetic-intensity profile: volatility peaks during the phase change (melting),
  // then tapers as the puddle settles under gravity (low-energy fluid motion).
  curve: [{ f: 0, w: 0.08 }, { f: 12, w: 0.13 }, { f: 22, w: 0.45 }, { f: 30, w: 0.52 }, { f: 38, w: 0.40 }, { f: 49, w: 0.31 }],
  states: [
    {
      name: "Initial state", delta: "—", law: "Observed scene", anchor: 0.0,
      kf: "assets/covt/kf0_solid.jpg",
      graph: {
        nodes: [{ id: "ice", label: "Solid Ice", kind: "ice" }, { id: "table", label: "Table", kind: "table" }],
        edges: [{ from: "ice", to: "table", label: "resting on" }]
      }
    },
    {
      name: "Melting", delta: "δ₁  Melting", law: "Thermodynamics · Heat Transfer", anchor: 0.45,
      kf: "assets/covt/kf1_melted.jpg",
      grounding: { mask: "assets/covt/mask.png", depth: "assets/covt/depth.jpg" },
      graph: {
        nodes: [{ id: "ice", label: "Half-Melted Ice", kind: "ice2", changed: true }, { id: "table", label: "Table", kind: "table" }],
        edges: [{ from: "ice", to: "table", label: "resting on" }]
      },
      reasoning: { obs: "Solid Ice transitions to Half-Melted Ice.", phys: "Gradual thermodynamic phase change.", kin: "Continuous deformation, moderate entropy.", result: 0.45 }
    },
    {
      name: "Puddle Formation", delta: "δ₂  Puddle Formation", law: "Fluid Mechanics · Gravity", anchor: 0.78,
      kf: "assets/covt/kf2_water.jpg",
      grounding: { mask: "assets/covt/mask2.png", depth: "assets/covt/depth2.jpg" },
      graph: {
        nodes: [{ id: "ice", label: "Half-Melted Ice", kind: "ice2" }, { id: "table", label: "Table", kind: "table" },
                { id: "water", label: "Water Puddle", kind: "water", changed: true }],
        edges: [{ from: "ice", to: "table", label: "resting on" }, { from: "water", to: "table", label: "flowing on" }]
      },
      reasoning: { obs: "A new Water Puddle node emerges as the ice collapses.", phys: "Gravity-driven spreading of liquid across the surface.", kin: "Low-energy fluid motion; volatility tapers after the phase change.", result: 0.40 }
    }
  ]
};

/* ---- Video comparison gallery (PLACEHOLDERS) ------------------------------
   Drop your encoded clips into assets/videos/ using the file names below.
   When a file exists it auto-plays; until then a labelled placeholder shows.
   methods[].src "" => placeholder.  Keep all clips time-aligned & same size.
   --------------------------------------------------------------------------- */
const COMPARISONS = [
  { id: "glass",   domain: "Mechanics", prompt: "A glass cup falls off a table and shatters on the floor." },
  { id: "melt",    domain: "Thermal",   prompt: "An ice cube melting in the sun, slowly turning into a puddle." },
  { id: "balloon", domain: "Material",  prompt: "A balloon is pricked by a needle and bursts." },
  { id: "water",   domain: "Fluid",     prompt: "Water is poured from a jug into a transparent glass." },
  { id: "ball",    domain: "Mechanics", prompt: "A rubber ball is dropped and bounces several times." },
  { id: "lens",    domain: "Optics",    prompt: "Light refracts through a glass prism, splitting into colors." }
];
// Baseline columns shown for each comparison (left→right).
const COMPARE_METHODS = [
  { key: "input",  label: "Input frame" },
  { key: "cogvideox", label: "CogVideoX-I2V" },
  { key: "frameguid", label: "Frame Guidance" },
  { key: "physplan",  label: "PhysPlan (Ours)", ours: true }
];

/* ---- Background-lock slider (PLACEHOLDER) --------------------------------- */
const BGLOCK = {
  prompt: "Object-Centric Gradient Routing keeps the background pixel-static while the object transforms.",
  // TODO: drop two clips: assets/videos/bglock_frameguid.mp4 & bglock_physplan.mp4
  left:  { label: "Frame Guidance — background drifts", src: "" },
  right: { label: "PhysPlan — background locked",       src: "" }
};

/* =============================================================================
   QUANTITATIVE DATA (all numbers from the manuscript + rebuttal)
   ============================================================================= */

// ---- PhyGenBench (manuscript Tab.1) — higher is better, normalized 0-1 ------
const PHYGENBENCH = {
  cols: ["Mechanics", "Optics", "Thermal", "Material", "Average"],
  groups: [
    { name: "Text-to-Video (T2V)", rows: [
      { model: "CogVideoX-T2V-5B", v: [0.43, 0.55, 0.40, 0.42, 0.45] },
      { model: "LTX-Video-T2V",    v: [0.35, 0.45, 0.36, 0.38, 0.39] },
      { model: "OpenSora",         v: [0.43, 0.50, 0.44, 0.37, 0.44] },
      { model: "PhyT2V",           v: [0.49, 0.61, 0.49, 0.47, 0.52] },
      { model: "LLM-Grounding",    v: [0.32, 0.41, 0.26, 0.24, 0.31] }
    ]},
    { name: "Image-to-Video (I2V) & Controllable", rows: [
      { model: "CogVideoX-I2V-5B", v: [0.48, 0.69, 0.43, 0.41, 0.52] },
      { model: "SVD-XT",           v: [0.46, 0.68, 0.48, 0.41, 0.52] },
      { model: "LTX-Video-I2V",    v: [0.47, 0.65, 0.46, 0.37, 0.50] },
      { model: "Frame Guidance",   v: [0.52, 0.56, 0.47, 0.48, 0.51] },
      { model: "PhysPlan (Ours)",  v: [0.55, 0.73, 0.58, 0.51, 0.59], ours: true }
    ]}
  ]
};

// ---- Physics-IQ (manuscript Tab.2) — per-domain, higher is better ----------
const PHYSICSIQ = {
  cols: ["Solid Mech.", "Fluid Dyn.", "Optics", "Magnetism", "Thermal", "Average"],
  rows: [
    { model: "CogVideoX-I2V-5B", v: [30.4, 29.8, 16.7, 13.3, 8.5, 27.1], base: true },
    { model: "SVD-XT",           v: [21.9, 20.5, 6.8, 8.4, 17.1, 19.1] },
    { model: "LTX-Video-I2V",    v: [30.2, 29.8, 15.9, 13.2, 8.4, 26.8] },
    { model: "Frame Guidance",   v: [30.4, 27.4, 21.1, 10.9, 9.4, 26.5] },
    { model: "PhysPlan (Ours)",  v: [30.6, 30.8, 26.4, 12.7, 11.9, 28.1], ours: true }
  ]
};

// ---- User study (60 participants, 2AFC vs Frame Guidance) -------------------
const USER_STUDY = {
  n: 60,
  protocol: "2AFC · randomized order · no neutral option · vs. Frame Guidance",
  items: [
    { label: "Physical Plausibility", pct: 72 },
    { label: "Frame Quality",         pct: 60 },
    { label: "Temporal Smoothness",   pct: 73 }
  ]
};

// ---- VLM ablation (rebuttal Tab.2): open-source VLMs vs Gemini --------------
const VLM_ABLATION = {
  note: "Full pipeline re-benchmarked with 9 open-source VLMs. Open models match or beat Gemini — at $0 API cost.",
  baselines: [
    { vlm: "CogVideoX-I2V-5B", mmmu: null, piq: 27.1, pgb: 0.503, cost: "—", base: true },
    { vlm: "Frame Guidance",   mmmu: null, piq: 26.5, pgb: 0.508, cost: "—", base: true }
  ],
  rows: [
    { vlm: "LLaVA-NeXT-7B",     mmmu: 17.0, piq: 27.3, pgb: 0.510, cost: "$0" },
    { vlm: "LLaVA-NeXT-13B",    mmmu: 17.2, piq: 27.5, pgb: 0.523, cost: "$0" },
    { vlm: "LLaVA-NeXT-32B",    mmmu: 23.8, piq: 27.7, pgb: 0.545, cost: "$0" },
    { vlm: "Qwen3.5-4B",        mmmu: 66.3, piq: 27.6, pgb: 0.560, cost: "$0" },
    { vlm: "Qwen3.5-9B",        mmmu: 70.1, piq: 27.7, pgb: 0.575, cost: "$0" },
    { vlm: "Qwen3.5-27B",       mmmu: 75.0, piq: 28.1, pgb: 0.595, cost: "$0" },
    { vlm: "Qwen3.5-35B-A3B",   mmmu: 75.1, piq: 28.0, pgb: 0.595, cost: "$0" },
    { vlm: "Gemma 4 31B",       mmmu: 73.8, piq: 28.0, pgb: 0.588, cost: "$0" },
    { vlm: "Gemma 4 26B-A4B",   mmmu: 76.9, piq: 28.3, pgb: 0.590, cost: "$0" },
    { vlm: "Gemini-3-Flash",    mmmu: 80.0, piq: 28.1, pgb: 0.593, cost: "$0.03", ours: true }
  ]
};

// ---- VBench quality dimensions (rebuttal Tab.3) — no quality-physics tradeoff
const VBENCH = {
  dims: ["QS", "SC", "BC", "TF", "MS", "DD", "AQ", "IQ"],
  dimNames: {
    QS: "Quality Score", SC: "Subject Consistency", BC: "Background Consistency",
    TF: "Temporal Flickering", MS: "Motion Smoothness", DD: "Dynamic Degree",
    AQ: "Aesthetic Quality", IQ: "Imaging Quality"
  },
  rows: [
    { m: "CogVideoX-I2V-5B (base)", v: [83.05,96.45,96.71,98.97,97.20,69.51,61.88,63.33], base: true },
    { m: "PhysPlan (Ours)",         v: [84.88,97.06,97.10,98.72,98.80,75.62,62.20,65.78], ours: true },
    { m: "Runway Gen-3",            v: [84.11,97.10,96.62,98.61,99.23,60.14,63.34,66.82] },
    { m: "Kling",                   v: [83.39,98.33,97.60,99.30,99.40,46.94,61.21,65.62] },
    { m: "Pika",                    v: [82.92,96.94,97.36,99.74,99.50,47.50,62.04,61.87] },
    { m: "Luma",                    v: [83.47,97.33,97.43,98.64,99.35,44.26,65.51,66.55] }
  ]
};

// ---- Component diagnostics (rebuttal C2): every sub-module improves ---------
const COMPONENT_DIAG = [
  { comp: "Keyframe", metric: "DreamSim ↓", fg: 0.246, ours: 0.217, better: "down" },
  { comp: "Mask",     metric: "IoU ↑",      fg: 0.530, ours: 0.613, better: "up" },
  { comp: "Depth",    metric: "AbsRel ↓",   fg: 0.221, ours: 0.184, better: "down" }
];

// ---- Failure attribution (rebuttal Tab.1): where it breaks ------------------
const FAILURE_ATTR = {
  note: "Mask extraction on transparent surfaces is the dominant, replaceable bottleneck (48% avg).",
  cols: ["Keyframe", "Mask", "Depth", "Optimization"],
  rows: [
    { domain: "Solid Mech.", v: [18, 24, 16, 42] },
    { domain: "Magnetism",   v: [14, 53, 22, 11] },
    { domain: "Thermal",     v: [39, 31, 21, 9] },
    { domain: "Optics",      v: [19, 58, 17, 6] },
    { domain: "Fluid Dyn.",  v: [31, 44, 19, 6] },
    { domain: "Average",     v: [22, 48, 19, 11], avg: true }
  ]
};

// ---- Long-horizon degradation (rebuttal C2) --------------------------------
const LONGHORIZON = {
  note: "Most reliable for short rigid-body phenomena (K ∈ [3,5]). Beyond K=5, autoregressive keyframe editing accumulates error.",
  points: [ { k: 3, rate: 68 }, { k: 4, rate: 64 }, { k: 5, rate: 60 }, { k: 6, rate: 48 }, { k: 7, rate: 36 } ],
  // TODO: K=4,5,6 are interpolated for the curve; replace with your measured success rates if available.
  measured: [3, 7]
};

// ---- Efficiency / cost panel -----------------------------------------------
const EFFICIENCY = [
  { big: "366.5 s", small: "end-to-end latency per video" },
  { big: "$0.03",   small: "API cost / video (Gemini) — $0 with open VLMs" },
  { big: "0",       small: "training / fine-tuning steps" },
  { big: "720×480 · 49f", small: "resolution × frames" }
];

// ---- Ablation (manuscript Tab.4, Physics-IQ average) -----------------------
const ABLATION = {
  note: "Each component is removed in isolation. Kinetic Intensity Profiling and Object-Centric Gradient Routing yield the largest drops.",
  metric: "Physics-IQ average",
  rows: [
    { name: "Full PhysPlan", score: 28.1, full: true },
    { name: "− 3D Structural Consistency Loss", score: 27.8 },
    { name: "− Masked Spatial Trajectory Loss", score: 27.5 },
    { name: "− Object-Centric Gradient Routing", score: 26.9 },
    { name: "− Kinetic Intensity Profiling", score: 26.7 }
  ]
};

// ---- Reproducibility callouts ----------------------------------------------
const REPRO = [
  "All VLM calls are deterministic (temperature = 0, fixed seed).",
  "Stage 2 uses a fixed seed and default Frame Guidance hyperparameters.",
  "Built on fully open weights: CogVideoX-I2V-5B, Grounded-SAM-2, DepthAnythingV2.",
  "Works with open-source VLMs (Qwen3.5, Gemma 4, LLaVA-NeXT) — no proprietary API required.",
  "Full config, prompts, and Algorithm 1 will be released with the code."
];

const BIBTEX = `@article{nguyen2026physplan,
  title   = {Physics-Aware Video Generation via Agentic Planning and Graph-Guided Optimization},
  author  = {Nguyen, Minh-Loi and Le, Xuan-Vu and Do, Thanh-Toan and
             Nguyen, Tam V. and Tran, Minh-Triet and Le, Trung-Nghia},
  journal = {arXiv preprint},
  year    = {2026}
}`;
