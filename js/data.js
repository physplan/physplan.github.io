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
    code: "#"
  },

  // ---- Authors: kept empty while under double-blind review (page shared by the
  // ICLR submission and the arXiv version). Add names/BibTeX after notification.
  authors: [],
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

/* ---- Video comparison gallery ---------------------------------------------
   Clips live in assets/videos/, named "<id>_<method-key>.mp4"; the input frame
   is "<id>_input.png". Same prompt and conditioning frame for every method.
   --------------------------------------------------------------------------- */
const COMPARISONS = [
  { id: "free_fall",     domain: "Mechanics", title: "Ball Released Above a Crate",
    prompt: "An orange inflatable basketball is suspended above a black plastic crate placed on a wooden table. The ball is then released. Static shot with no camera movement.",
    note: "CogVideoX and Frame Guidance duplicate the ball and Wan2.1 never lets it fall in; only PhysPlan keeps a single ball that comes to rest in the crate." },
  { id: "match_water",   domain: "Thermal",   title: "Lit Match Lowered into Water",
    prompt: "A lit match is being lowered into a glass of water. Static shot with no camera movement.",
    note: "The flame vanishes too early (CogVideoX), keeps burning under water (Wan2.1, VLIPP), or the water warps (Frame Guidance); PhysPlan quenches the flame as the match enters the water." },
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
   QUANTITATIVE DATA (only what the page shows; full tables are in the paper)
   ============================================================================= */

// ---- Table 2: averages of the guided I2V methods -----------------------------
const PLAUSIBILITY = [
  { model: "CogVideoX-I2V-5B (base)", pgb: 0.52, piq: 27.1, base: true },
  { model: "Frame Guidance",          pgb: 0.51, piq: 30.3 },
  { model: "VLIPP",                   pgb: 0.60, piq: 34.6 },
  { model: "PhysPlan (Ours)",         pgb: 0.77, piq: 38.2, ours: true }
];
const PLAUSIBILITY_NOTE =
  "Frame Guidance matches the same keyframes as whole frames and does not improve over its base model on PhyGenBench " +
  "(0.51 vs. 0.52); guided by the state graph, PhysPlan gains +0.25 on PhyGenBench and +11.1 on Physics-IQ, and improves in every domain of both benchmarks.";

// ---- Tables 3, 9, 12, 16: one number each ------------------------------------
const QUALITY_TILES = [
  { big: "−21% / −29%",     small: "FVD vs. the base model<br>PhyGenBench / Physics-IQ" },
  { big: "83.1 → 84.9",     small: "VBench Quality Score<br>above closed-source VDMs" },
  { big: "72%",             small: "human preference for physical plausibility<br>60 participants, 2AFC" },
  { big: "≈ 6 min",         small: "per video on one H100<br>no training, ≈ $0.45 in API calls" }
];

// ---- Table 4: ablation on Physics-IQ (average) -------------------------------
const ABLATION = [
  { label: "PhysPlan (full)",                              value: 38.2, ours: true },
  { label: "w/o region weighting (λ = 1)",                 value: 36.0 },
  { label: "Gap 2 · whole-frame L2 loss (= Frame Guidance)", value: 30.3 },
  { label: "Gap 1 · prompt-derived plan, no grounding",   value: 28.1 }
];
const ABLATION_NOTE =
  "Physics-IQ average; each setting changes one component. Replacing the grounded state graph with a prompt-derived plan " +
  "costs 10.1 points, and matching whole keyframes instead of graph-selected properties costs 7.9.";

