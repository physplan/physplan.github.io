/* ============================================================
   PhysPlan — page logic, rendering & charts (vanilla JS, no deps)
   ============================================================ */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (n, d = 2) => (n == null ? "—" : Number(n).toFixed(d));
  const ACCENT = "#3b5bbd", GRAY = "#c7ccd6", GRAYD = "#9aa1b0";

  /* ========================= HERO ========================= */
  $("#heroTitle").innerHTML = `<span class="brand">${SITE.title}</span>: ` + SITE.subtitle;
  $("#heroTagline").textContent = SITE.tagline;
  $("#abstractText").innerHTML = SITE.abstract;
  $("#footerLine").textContent = `${SITE.title} — ${SITE.subtitle}.`;

  $("#authors").innerHTML = SITE.authors.map(a => {
    const sup = a.aff.join(",") + (a.note || "");
    const name = a.link && a.link !== "#" ? `<a href="${a.link}" target="_blank">${a.name}</a>` : a.name;
    return `<span class="author">${name}<sup>${sup}</sup></span>`;
  }).join("");
  $("#affiliations").innerHTML = SITE.affiliations.map(f => `<span><sup>${f.id}</sup> ${f.name}</span>`).join("");
  $("#authorNote").textContent = SITE.authorNote;

  const linkDefs = [
    { k: "paper", label: "Paper", primary: true },
    { k: "supp", label: "Supplementary" },
    { k: "code", label: "Code" },
    { k: "bibtex", label: "BibTeX" }
  ];
  $("#ctaRow").innerHTML = linkDefs.filter(l => SITE.links[l.k] != null).map(l => {
    const href = SITE.links[l.k];
    const disabled = href === "#" ? `data-disabled="true" title="Coming soon"` : "";
    const tgt = href.startsWith("#") ? "" : `target="_blank" rel="noopener"`;
    return `<a class="btn ${l.primary ? "primary" : ""}" href="${href}" ${tgt} ${disabled}>${l.label}</a>`;
  }).join("");

  $("#contribList").innerHTML = CONTRIBUTIONS.map(c => `<li><b>${c.title}</b> — ${c.text}</li>`).join("");

  /* ========================= METHOD STEPPER ========================= */
  const stepper = $("#stepper"), stepperDetail = $("#stepperDetail");
  stepper.innerHTML = METHOD_STEPS.map((s, i) =>
    `${i ? '<span class="step-arrow">→</span>' : ""}<button class="step-btn" data-i="${i}"><span class="step-n">${i + 1}</span>${s.label}</button>`
  ).join("");
  function showStep(i) {
    $$(".step-btn", stepper).forEach((b, j) => b.classList.toggle("active", j === i));
    const s = METHOD_STEPS[i];
    stepperDetail.innerHTML = `<h5>${i + 1}. ${s.label}</h5><p>${s.desc}</p>`;
  }
  $$(".step-btn", stepper).forEach(b => b.addEventListener("click", () => showStep(+b.dataset.i)));
  showStep(0);

  /* ========================= OBJECT-CENTRIC GRADIENT ROUTING (SVG) ========================= */
  (function buildOCGR() {
    const el = $("#ocgrPanel"); if (!el) return;
    const FW = 250, FH = 176, OP = 70, top = 14;
    const x1 = 0, x2 = FW + OP, x3 = 2 * (FW + OP);
    const W = 3 * FW + 2 * OP;
    const A = "#3b5bbd", RED = "#c7503f", DARK = "#1b1f2a", BORD = "#d2d7e0", GRID = "#c7ccd6", MUTED = "#8b91a1";
    const ball = { cx: FW * 0.57, cy: FH * 0.40, r: 30 };

    const arrow = (px, py, ang, len, op) => {
      const c = Math.cos(ang), sn = Math.sin(ang);
      const tx = px + c * len, ty = py + sn * len;          // tip
      const back = 4.4, w = 2.6, bx = tx - c * back, by = ty - sn * back;
      return `<line x1="${px.toFixed(1)}" y1="${py.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${A}" stroke-width="1.5" opacity="${op}"/>`
        + `<path d="M${tx.toFixed(1)} ${ty.toFixed(1)} L${(bx - sn * w).toFixed(1)} ${(by + c * w).toFixed(1)} L${(bx + sn * w).toFixed(1)} ${(by - c * w).toFixed(1)} Z" fill="${A}" opacity="${op}"/>`;
    };
    const field = (ox, oy, mode) => {            // mode: "full" | "masked"
      let s = "", step = 24;
      for (let gx = step * 0.7; gx < FW; gx += step)
        for (let gy = step * 0.7; gy < FH; gy += step) {
          const inBall = Math.hypot(gx - ball.cx, gy - ball.cy) < ball.r - 2;
          const ang = Math.sin(gx * 0.05) * 0.8 + Math.cos(gy * 0.06) * 0.8 + (inBall ? 1.1 : 0);
          if (inBall) s += arrow(ox + gx, oy + gy, ang, 12, 0.95);
          else if (mode === "full") s += arrow(ox + gx, oy + gy, ang, 12, 0.5);
          else s += `<circle cx="${(ox + gx).toFixed(1)}" cy="${(oy + gy).toFixed(1)}" r="1.5" fill="${MUTED}" opacity="0.5"/>`; // zeroed gradient
        }
      return s;
    };
    const REDW = "#fdece9";
    const paintingArt = (x, y, stroke, fill) =>
      `<rect x="${x}" y="${y}" width="42" height="32" rx="2" fill="${fill}" stroke="${stroke}" stroke-width="1.3"/>`
      + `<circle cx="${x + 12}" cy="${y + 11}" r="4" fill="none" stroke="${stroke}" stroke-width="1.1"/>`
      + `<path d="M${x + 4} ${y + 27} L${x + 16} ${y + 16} L${x + 26} ${y + 24} L${x + 38} ${y + 15}" fill="none" stroke="${stroke}" stroke-width="1.1"/>`;
    const painting = (ox, oy, drift, lock) => {
      const px = ox + FW * 0.15, py = oy + FH * 0.20, pw = 42, ph = 32, cx = px + pw / 2, cy = py + ph / 2;
      let s = "";
      if (drift) {
        s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="2" fill="none" stroke="${GRID}" stroke-width="1.2" stroke-dasharray="3 2"/>`; // where it should be
        s += `<g transform="rotate(7 ${cx} ${cy}) translate(9 6)">${paintingArt(px, py, RED, REDW)}</g>`;                                              // drifted, rotated, red
        s += `<path d="M${px - 3} ${py + 7} q -6 2 -11 1 M${px - 3} ${py + 17} q -7 1 -12 -1" stroke="${RED}" stroke-width="1.3" fill="none" opacity=".85"/>`; // motion smear
      } else {
        s += paintingArt(px, py, DARK, "#fff");
        if (lock) {
          const lx = px + pw + 6, ly = py + ph - 9;
          s += `<rect x="${lx}" y="${ly}" width="11" height="9" rx="1.5" fill="${A}"/>`
            + `<path d="M${lx + 2} ${ly} v-3 a3.5 3.5 0 0 1 7 0 v3" fill="none" stroke="${A}" stroke-width="1.4"/>`;
        }
      }
      return s;
    };
    const ballObj = (ox, oy) => {
      const cx = ox + ball.cx, cy = oy + ball.cy, fy = oy + FH * 0.72;
      return `<ellipse cx="${cx}" cy="${fy}" rx="22" ry="4.5" fill="${DARK}" opacity="0.08"/>`
        + `<path d="M${cx - 36} ${cy - 24} Q ${cx - 8} ${cy - 46} ${cx} ${cy - 4}" fill="none" stroke="${MUTED}" stroke-width="1.3" stroke-dasharray="3 3"/>`
        + `<circle cx="${cx}" cy="${cy}" r="${ball.r}" fill="#eef1fb" stroke="${A}" stroke-width="1.8"/>`;
    };
    const frame = (ox, oy, mode) => {
      const fill = mode === "mask" ? DARK : "#f7f8fa";
      let s = `<rect x="${ox}" y="${oy}" width="${FW}" height="${FH}" rx="10" fill="${fill}" stroke="${BORD}"/>`;
      if (mode === "grad") s += `<rect x="${ox}" y="${oy}" width="${FW}" height="${FH}" rx="10" fill="${RED}" opacity="0.06"/>`;
      if (mode === "routed") s += `<rect x="${ox}" y="${oy}" width="${FW}" height="${FH}" rx="10" fill="${A}" opacity="0.05"/>`;
      if (mode !== "mask") s += `<line x1="${ox}" y1="${oy + FH * 0.72}" x2="${ox + FW}" y2="${oy + FH * 0.72}" stroke="${GRID}" stroke-width="1.3"/>`;
      return s;
    };
    const badge = (ox, ok) => {
      const w = ok ? 90 : 62, bx = ox + FW - w - 12, by = top + 11, col = ok ? A : RED;
      return `<rect x="${bx}" y="${by}" width="${w}" height="21" rx="10.5" fill="#fff" stroke="${col}" stroke-width="1.3"/>`
        + `<text x="${bx + w / 2}" y="${by + 15}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${col}">${ok ? "✓ preserved" : "✗ drift"}</text>`;
    };
    const lbl = (cx, title, sub, col) =>
      `<text x="${cx}" y="${top + FH + 18}" text-anchor="middle" font-size="13" font-weight="700" fill="${DARK}">${title}</text>`
      + (sub ? `<text x="${cx}" y="${top + FH + 33}" text-anchor="middle" font-size="11" fill="${col}">${sub}</text>` : "");
    const op = (cx, glyph) => `<text x="${cx}" y="${top + FH / 2 + 8}" text-anchor="middle" font-size="26" fill="${DARK}">${glyph}</text>`;

    const f1 = frame(x1, top, "grad") + ballObj(x1, top) + field(x1, top, "full") + painting(x1, top, true, false) + badge(x1, false);
    const f2 = frame(x2, top, "mask") + `<circle cx="${x2 + ball.cx}" cy="${top + ball.cy}" r="${ball.r}" fill="#fff"/>`;
    const f3 = frame(x3, top, "routed") + ballObj(x3, top) + field(x3, top, "masked") + painting(x3, top, false, true) + badge(x3, true);
    const Ht = top + FH + 42;

    el.innerHTML =
      `<svg viewBox="0 0 ${W} ${Ht}">
        ${f1}${f2}${f3}
        ${op(x1 + FW + OP / 2, "⊙")}${op(x2 + FW + OP / 2, "=")}
        ${lbl(x1 + FW / 2, "Global gradient ∇ℒ", "updates the entire latent", RED)}
        ${lbl(x2 + FW / 2, "Object mask M", "active region", MUTED)}
        ${lbl(x3 + FW / 2, "Routed update (Ours)", "background locked", A)}
      </svg>
      <div class="ocgr-eq">z<sub>t</sub> &larr; z<sub>t</sub> &minus; &Sigma;<sub>k</sub> &eta;<sub>k</sub> <b>(</b> M<sub>f</sub> &#8857; &nabla;<sub>z</sub>&#8466; <b>)</b></div>
      <div class="ocgr-legend">arrows &mdash; gradient direction &nbsp;·&nbsp; dots &mdash; gradient zeroed by the mask</div>`;
  })();

  /* ========================= KINETIC INTENSITY (live) ========================= */
  const KIP_W = (() => {                 // placeholder profile; replace with a real per-video array
    const F = 49, w = [];
    for (let f = 0; f < F; f++) {
      const t = f / (F - 1);
      const spike = Math.exp(-Math.pow((t - 0.42) / 0.07, 2));
      const after = 0.35 * Math.exp(-Math.pow((t - 0.68) / 0.16, 2));
      w.push(Math.min(1, 0.08 + 0.9 * spike + after));
    }
    return w;
  })();
  (function buildKIP() {
    const W = 900, H = 280, pad = { l: 42, r: 14, t: 14, b: 32 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const X = i => pad.l + (i / (KIP_W.length - 1)) * iw;
    const Y = v => pad.t + (1 - v) * ih;
    let area = `M ${X(0)} ${Y(0)}`, line = `M ${X(0)} ${Y(KIP_W[0])}`;
    KIP_W.forEach((v, i) => { line += ` L ${X(i)} ${Y(v)}`; area += ` L ${X(i)} ${Y(v)}`; });
    area += ` L ${X(KIP_W.length - 1)} ${Y(0)} Z`;
    const grid = [0, .25, .5, .75, 1].map(g =>
      `<line class="grid-line" x1="${pad.l}" y1="${Y(g)}" x2="${W - pad.r}" y2="${Y(g)}"/>
       <text class="bar-val" x="${pad.l - 8}" y="${Y(g) + 3}" text-anchor="end">${g.toFixed(2)}</text>`).join("");
    $("#kipPanel").innerHTML = `
      <svg viewBox="0 0 ${W} ${H}">
        ${grid}
        <path d="${area}" fill="${ACCENT}" fill-opacity=".10"/>
        <path d="${line}" fill="none" stroke="${ACCENT}" stroke-width="2.2"/>
        <line id="kipHead" x1="${X(0)}" y1="${pad.t}" x2="${X(0)}" y2="${pad.t + ih}" stroke="${ACCENT}" stroke-width="1.5" stroke-dasharray="3 3"/>
        <circle id="kipDot" cx="${X(0)}" cy="${Y(KIP_W[0])}" r="4.5" fill="${ACCENT}"/>
        <text class="bar-lbl" x="${pad.l}" y="${H - 6}">frame 0</text>
        <text class="bar-lbl" x="${W - pad.r}" y="${H - 6}" text-anchor="end">frame ${KIP_W.length - 1}</text>
        <text class="bar-lbl" x="4" y="${pad.t + ih / 2}" transform="rotate(-90 4 ${pad.t + ih / 2})" text-anchor="middle">kinetic intensity</text>
      </svg>
      <div class="kip-controls">
        <button id="kipPlay" aria-label="Play">▶</button>
        <div class="kip-readout">frame <b id="kipF">0</b> · intensity <b id="kipV">${fmt(KIP_W[0])}</b> · learning-rate scale <b id="kipLr">${fmt(1 + 1.5 * KIP_W[0])}×</b></div>
      </div>`;
    let frame = 0, playing = false, timer = null;
    const head = $("#kipHead"), dot = $("#kipDot");
    function render() {
      head.setAttribute("x1", X(frame)); head.setAttribute("x2", X(frame));
      dot.setAttribute("cx", X(frame)); dot.setAttribute("cy", Y(KIP_W[frame]));
      $("#kipF").textContent = frame; $("#kipV").textContent = fmt(KIP_W[frame]);
      $("#kipLr").textContent = fmt(1 + 1.5 * KIP_W[frame]) + "×";
    }
    $("#kipPlay").addEventListener("click", () => {
      playing = !playing; $("#kipPlay").textContent = playing ? "⏸" : "▶";
      if (playing) timer = setInterval(() => { frame = (frame + 1) % KIP_W.length; render(); }, 95);
      else clearInterval(timer);
    });
  })();

  /* ========================= CHAIN-OF-VISUAL-THOUGHT ========================= */
  (function buildCOVT() {
    const panel = $("#covtPanel"); if (!panel) return;
    const { prompt, frames, curve, states } = COVT;
    let active = 0, autoTimer = null;

    /* -- kinetic curve SVG -- */
    const CW = 900, CH = 148, cp = { l: 44, r: 16, t: 20, b: 30 };
    const ciw = CW - cp.l - cp.r, cih = CH - cp.t - cp.b;
    const cX = f => cp.l + (f / frames) * ciw;
    const cY = w => cp.t + (1 - w) * cih;
    function kip(f) {
      for (let i = 0; i < curve.length - 1; i++) {
        if (f <= curve[i + 1].f) {
          const t = (f - curve[i].f) / (curve[i + 1].f - curve[i].f);
          return curve[i].w + t * (curve[i + 1].w - curve[i].w);
        }
      }
      return curve[curve.length - 1].w;
    }
    let cPath = "", cArea = `M ${cX(0).toFixed(1)} ${cY(0).toFixed(1)}`;
    for (let f = 0; f <= frames; f++) {
      const w = kip(f);
      cPath += `${f ? " L" : "M"} ${cX(f).toFixed(1)} ${cY(w).toFixed(1)}`;
      cArea += ` L ${cX(f).toFixed(1)} ${cY(w).toFixed(1)}`;
    }
    cArea += ` L ${cX(frames).toFixed(1)} ${cY(0).toFixed(1)} Z`;
    const dLabels = ["t₀", "δ₁", "δ₂"];
    let cMarkers = "";
    states.forEach((s, i) => {
      const af = Math.round(s.anchor * frames);
      const ax = cX(af).toFixed(1), ay = cY(kip(af)).toFixed(1);
      cMarkers += `<line x1="${ax}" y1="${cp.t}" x2="${ax}" y2="${cY(0).toFixed(1)}"
                        stroke="${ACCENT}" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.5"/>
                   <circle cx="${ax}" cy="${ay}" r="4.5" fill="${ACCENT}"/>
                   <text x="${ax}" y="${cp.t - 3}" text-anchor="middle" font-size="9" fill="${ACCENT}" font-weight="700">${dLabels[i]}</text>`;
    });
    const curveSVG = `<svg viewBox="0 0 ${CW} ${CH}" class="covt-curve-svg">
      <line x1="${cp.l}" y1="${cY(0).toFixed(1)}" x2="${CW - cp.r}" y2="${cY(0).toFixed(1)}" class="grid-line"/>
      <line x1="${cp.l}" y1="${cY(0.5).toFixed(1)}" x2="${CW - cp.r}" y2="${cY(0.5).toFixed(1)}" class="grid-line"/>
      <line x1="${cp.l}" y1="${cY(1).toFixed(1)}" x2="${CW - cp.r}" y2="${cY(1).toFixed(1)}" class="grid-line"/>
      <text class="bar-val" x="${cp.l - 6}" y="${cY(0) + 4}" text-anchor="end">0</text>
      <text class="bar-val" x="${cp.l - 6}" y="${cY(1) + 4}" text-anchor="end">1</text>
      <path d="${cArea}" fill="${ACCENT}" fill-opacity="0.09"/>
      <path d="${cPath}" fill="none" stroke="${ACCENT}" stroke-width="2.1"/>
      ${cMarkers}
      <text class="bar-lbl" x="${cp.l}" y="${CH - 4}">t = 0</text>
      <text class="bar-lbl" x="${(CW - cp.r).toFixed(1)}" y="${CH - 4}" text-anchor="end">t = ${frames}</text>
      <text x="${cp.l - 6}" y="${(cY(0.5)).toFixed(1)}" text-anchor="middle" font-size="8.5" fill="${GRAYD}"
            transform="rotate(-90 ${cp.l - 28} ${cY(0.5).toFixed(1)})">w(t)</text>
    </svg>`;

    /* -- scene graph renderer: gravity-aware "physical scene graph" -- */
    const NODE = {
      ice:   { fill: "#dbeafe", stroke: "#60a5fa", text: "#1e40af", chip: "solid",         chipBd: "#bfdbfe", chipTx: "#1d4ed8", icon: "cube" },
      ice2:  { fill: "#e0f2fe", stroke: "#38bdf8", text: "#0c4a6e", chip: "solid → liquid", chipBd: "#bae6fd", chipTx: "#0369a1", icon: "cube" },
      water: { fill: "#cffafe", stroke: "#22d3ee", text: "#0e7490", chip: "liquid",         chipBd: "#a5f3fc", chipTx: "#0891b2", icon: "drop" },
      table: { fill: "#f3f4f6", stroke: "#d1d5db", text: "#374151", chip: "static support", chipBd: "#e5e7eb", chipTx: "#6b7280", icon: "table" }
    };
    function nodeIcon(kind, cx, cy) {
      const ic = (NODE[kind] || NODE.table).icon;
      if (ic === "cube") return `<g transform="translate(${cx} ${cy})" stroke="#0ea5e9" stroke-width="1.2" stroke-linejoin="round">
        <polygon points="-8,-4 0,-8 8,-4 0,0" fill="#bae6fd"/><polygon points="-8,-4 -8,6 0,10 0,0" fill="#7dd3fc"/><polygon points="0,0 0,10 8,6 8,-4" fill="#e0f2fe"/></g>`;
      if (ic === "drop") return `<g transform="translate(${cx} ${cy})"><path d="M0 -9 C 7 -1, 8 4, 0 9 C -8 4, -7 -1, 0 -9 Z" fill="#a5f3fc" stroke="#0891b2" stroke-width="1.2"/><path d="M-2 3 C -3 6, 2 7, 3 3" fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/></g>`;
      return `<g transform="translate(${cx} ${cy})" stroke="#6b7280" stroke-width="1.5" fill="none" stroke-linecap="round"><line x1="-10" y1="-5" x2="10" y2="-5"/><line x1="-6" y1="-5" x2="-6" y2="6"/><line x1="6" y1="-5" x2="6" y2="6"/></g>`;
    }
    function edgePath(sx, sy, ex, ey, label, type) {
      const d = `M${sx} ${sy} C ${sx} ${sy + 28}, ${ex} ${ey - 28}, ${ex} ${ey}`;
      const arrow = `<path d="M${ex} ${ey} L${ex - 4} ${ey - 7} L${ex + 4} ${ey - 7} Z" fill="${type === "fluid" ? "#22d3ee" : "#c2c8d2"}"/>`;
      const mx = (sx + ex) / 2, my = (sy + ey) / 2, lblW = label.length * 5.2 + 12;
      const lbl = `<rect x="${(mx - lblW / 2).toFixed(1)}" y="${(my - 9).toFixed(1)}" width="${lblW.toFixed(1)}" height="16" rx="8" fill="#fff" stroke="${type === "fluid" ? "#cffafe" : "#e3e6ec"}"/>
        <text x="${mx.toFixed(1)}" y="${(my + 2.5).toFixed(1)}" text-anchor="middle" font-size="8.5" font-style="italic" fill="${type === "fluid" ? "#0e9bb0" : "#9099a8"}">${label}</text>`;
      if (type === "fluid") return `<path d="${d}" fill="none" stroke="#22d3ee" stroke-width="2.6" opacity="0.25"/>
        <path d="${d}" fill="none" stroke="#22d3ee" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="2 7">
          <animate attributeName="stroke-dashoffset" from="18" to="0" dur="0.9s" repeatCount="indefinite"/></path>${arrow}${lbl}`;
      return `<path d="${d}" fill="none" stroke="#c2c8d2" stroke-width="2"/>${arrow}${lbl}`;
    }
    function makeGraph(state, prevState) {
      const { nodes, edges } = state.graph;
      const VW = 340, VH = 224;
      const prevIds = prevState ? prevState.graph.nodes.map(n => n.id) : [];

      // gravity-aware layout: table = grounded base; objects sit above it
      const objs = nodes.filter(n => n.kind !== "table");
      const tCx = VW / 2, tW = 224, tH = 40, tX = (VW - tW) / 2, tY = 170;
      const cardW = objs.length > 1 ? 124 : 150, cardH = 58, cardTop = 30;
      const centers = objs.length > 1 ? [96, 244] : [tCx];
      const layout = {};
      objs.forEach((n, i) => { const cx = centers[i]; layout[n.id] = { cx, x: cx - cardW / 2, top: cardTop }; });

      // typed edges (object -> grounded table)
      let edgeSVG = "";
      edges.forEach(e => {
        const lo = layout[e.from]; if (!lo) return;
        const sx = lo.cx, sy = lo.top + cardH, ex = tCx + (lo.cx - tCx) * 0.42, ey = tY;
        edgeSVG += edgePath(sx, sy, ex, ey, e.label, /flow/i.test(e.label) ? "fluid" : "support");
      });

      // grounded base
      const tc = NODE.table;
      const baseSVG = `<rect x="${tX}" y="${tY}" width="${tW}" height="${tH}" rx="12" fill="${tc.fill}" stroke="${tc.stroke}" stroke-width="1.6"/>
        ${nodeIcon("table", tCx - 50, tY + tH / 2)}
        <text x="${tCx + 4}" y="${tY + 18}" text-anchor="middle" font-size="13" font-weight="700" fill="${tc.text}">Table</text>
        <text x="${tCx + 4}" y="${tY + 31}" text-anchor="middle" font-size="8.5" fill="#9099a8">static support · ground</text>`;

      // object nodes (icon + label + phase chip; ring on changed/new)
      let nodeSVG = "";
      objs.forEach(n => {
        const lo = layout[n.id], st = NODE[n.kind] || NODE.table;
        const isNew = prevState && !prevIds.includes(n.id), changed = !isNew && !!n.changed;
        const cx = lo.cx, top = lo.top, chipW = st.chip.length * 4.4 + 14;
        if (isNew) nodeSVG += `<rect x="${lo.x}" y="${top}" width="${cardW}" height="${cardH}" rx="14" fill="none" stroke="${st.stroke}" stroke-width="2">
            <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="stroke-width" values="2;7;2" dur="2s" repeatCount="indefinite"/></rect>`;
        else if (changed) nodeSVG += `<rect x="${lo.x - 3}" y="${top - 3}" width="${cardW + 6}" height="${cardH + 6}" rx="16" fill="none" stroke="${ACCENT}" stroke-width="1.2" stroke-dasharray="4 3" opacity="0.45"/>`;
        nodeSVG += `<rect x="${lo.x}" y="${top}" width="${cardW}" height="${cardH}" rx="14" fill="${st.fill}" stroke="${st.stroke}" stroke-width="${isNew || changed ? 2.2 : 1.6}"/>
          ${nodeIcon(n.kind, cx, top + 16)}
          <text x="${cx}" y="${top + 35}" text-anchor="middle" font-size="11.5" font-weight="700" fill="${st.text}">${n.label}</text>
          <rect x="${(cx - chipW / 2).toFixed(1)}" y="${top + 42}" width="${chipW.toFixed(1)}" height="14" rx="7" fill="#fff" stroke="${st.chipBd}"/>
          <text x="${cx}" y="${top + 52}" text-anchor="middle" font-size="8" font-weight="600" fill="${st.chipTx}">${st.chip}</text>
          ${isNew ? `<rect x="${(lo.x + cardW - 36).toFixed(1)}" y="${top - 10}" width="40" height="18" rx="9" fill="${ACCENT}"/>
            <text x="${(lo.x + cardW - 16).toFixed(1)}" y="${top + 3}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#fff">NEW</text>` : ""}`;
      });

      return `<svg viewBox="0 0 ${VW} ${VH}" class="covt-graph-svg">${edgeSVG}${baseSVG}${nodeSVG}</svg>`;
    }

    /* -- detail panel -- */
    function renderDetail(i) {
      const det = $("#covtDetail"); if (!det) return;
      const state = states[i], prevState = i > 0 ? states[i - 1] : null;
      const panes = [];
      panes.push(`<div class="covt-detail-pane">
        <div class="covt-pane-title">Scene Graph</div>
        ${makeGraph(state, prevState)}
      </div>`);
      if (state.grounding) {
        panes.push(`<div class="covt-detail-pane">
          <div class="covt-pane-title">Grounding</div>
          <div class="covt-triptych">
            <div class="covt-trip"><img src="${state.kf}" class="covt-trip-img" alt="Keyframe"><div class="covt-trip-cap">Keyframe</div></div>
            <div class="covt-trip"><img src="${state.grounding.mask}" class="covt-trip-img covt-mask-img" alt="Mask"><div class="covt-trip-cap">SAM-2 mask</div></div>
            <div class="covt-trip"><img src="${state.grounding.depth}" class="covt-trip-img" alt="Depth"><div class="covt-trip-cap">DepthAnythingV2</div></div>
          </div>
        </div>`);
      }
      if (state.reasoning) {
        const r = state.reasoning;
        panes.push(`<div class="covt-detail-pane">
          <div class="covt-pane-title">VLM Reasoning</div>
          <div class="covt-reasoning">
            <div class="covt-reason-row"><span class="covt-rkey">obs</span><span class="covt-rval">${r.obs}</span></div>
            <div class="covt-reason-row"><span class="covt-rkey">phys</span><span class="covt-rval">${r.phys}</span></div>
            <div class="covt-reason-row"><span class="covt-rkey">kin</span><span class="covt-rval">${r.kin}</span></div>
            <div class="covt-reason-score">w(t) = <strong>${r.result.toFixed(2)}</strong></div>
          </div>
        </div>`);
      }
      const cls = panes.length === 1 ? "one-pane" : panes.length === 2 ? "two-pane" : "";
      det.innerHTML = `<div class="covt-detail-inner ${cls}">${panes.join("")}</div>`;
    }

    /* -- activate state -- */
    function setActive(i) {
      active = i;
      $$(".covt-state-card", panel).forEach((c, j) => c.classList.toggle("active", j === i));
      const det = $("#covtDetail"); if (!det) return;
      det.style.opacity = "0.15";
      requestAnimationFrame(() => { renderDetail(i); det.style.opacity = "1"; });
    }

    /* -- build HTML -- */
    panel.innerHTML = `
      <div class="covt-prompt-bar">
        <span class="covt-prompt-label">Prompt</span>
        <span class="covt-prompt-text">&ldquo;${prompt}&rdquo;</span>
        <button class="covt-play-btn" id="covtPlayBtn">⏸ Auto</button>
      </div>
      <div class="covt-states-strip">
        ${states.map((s, i) => `
          <div class="covt-state-card" data-i="${i}">
            <div class="covt-kf-wrap">
              <img src="${s.kf}" alt="${s.name}" class="covt-kf-img">
              <div class="covt-anchor-pill">f&thinsp;=&thinsp;${Math.round(s.anchor * frames)}</div>
              ${i > 0 ? `<div class="covt-delta-tag">${s.delta.split(" ")[0]}</div>` : ""}
            </div>
            <div class="covt-card-body">
              <div class="covt-delta">${s.delta}</div>
              <div class="covt-state-name">${s.name}</div>
              <div class="covt-law">${s.law}</div>
            </div>
          </div>`).join("")}
      </div>
      <div class="covt-curve-wrap">
        ${curveSVG}
        <div class="covt-curve-label">Kinetic intensity profile w(t) &mdash; guidance weight schedule</div>
      </div>
      <div class="covt-detail-wrap" id="covtDetail"></div>`;

    /* -- interactions -- */
    function startAuto() {
      autoTimer = setInterval(() => setActive((active + 1) % states.length), 2800);
      const btn = $("#covtPlayBtn"); if (btn) btn.textContent = "⏸ Auto";
    }
    function stopAuto() {
      clearInterval(autoTimer); autoTimer = null;
      const btn = $("#covtPlayBtn"); if (btn) btn.textContent = "▶ Play";
    }
    $$(".covt-state-card", panel).forEach(c =>
      c.addEventListener("click", () => { stopAuto(); setActive(+c.dataset.i); })
    );
    $("#covtPlayBtn").addEventListener("click", () => autoTimer ? stopAuto() : startAuto());

    setActive(0);
    startAuto();
  })();

  /* ========================= QUALITATIVE COMPARISONS ========================= */
  const domainTabs = $("#domainTabs"), compareGrid = $("#compareGrid");
  domainTabs.innerHTML = COMPARISONS.map((c, i) =>
    `<button class="domain-tab ${i === 0 ? "active" : ""}" data-i="${i}">${c.id}<span class="dt-domain"> · ${c.domain}</span></button>`).join("");
  function videoCell(method, comp) {
    const path = `assets/videos/${comp.id}_${method.key}.mp4`;
    return `<div class="compare-cell ${method.ours ? "ours" : ""}">
      <div class="cell-label">${method.label}</div>
      <div class="video-ph small" data-video="${path}">
        <span class="ph-play">▷</span>
        <span class="ph-label"><code>${comp.id}_${method.key}.mp4</code></span>
      </div></div>`;
  }
  function showComparison(i) {
    $$(".domain-tab", domainTabs).forEach((t, j) => t.classList.toggle("active", j === i));
    const comp = COMPARISONS[i];
    compareGrid.innerHTML = COMPARE_METHODS.map(m => videoCell(m, comp)).join("");
    $(".compare-prompt-text").textContent = `“${comp.prompt}”`;
    hydrateMedia();
  }
  $("#compareControls").innerHTML =
    `<button id="syncPlay">▶ Play all</button><span class="compare-prompt-text"></span>`;
  $$(".domain-tab", domainTabs).forEach(t => t.addEventListener("click", () => showComparison(+t.dataset.i)));
  $("#syncPlay").addEventListener("click", () => {
    const vids = $$("#compareGrid video");
    if (!vids.length) { alert("Drop the .mp4 clips into assets/videos/ (filenames are shown on each tile). Synced playback activates automatically once the videos are present."); return; }
    const play = vids[0].paused;
    vids.forEach(v => { v.currentTime = 0; play ? v.play() : v.pause(); });
    $("#syncPlay").textContent = play ? "⏸ Pause all" : "▶ Play all";
  });

  /* ========================= CHART HELPERS ========================= */
  function hBarChart(el, items, opts = {}) {
    const max = opts.max != null ? opts.max : Math.max(...items.map(d => d.value)) * 1.08;
    const min = opts.min || 0;
    const autoPadL = Math.max(...items.map(d => (d.label || "").length)) * 6.4 + 20;
    const rowH = 28, gap = 10, padL = opts.padL || Math.min(330, Math.max(120, autoPadL)), padR = 54, padT = 6, padB = opts.refLabel ? 24 : 6;
    const W = 900, ih = items.length * (rowH + gap);
    const H = padT + ih + padB, iw = W - padL - padR;
    const X = v => padL + ((v - min) / (max - min)) * iw;
    let svg = `<svg viewBox="0 0 ${W} ${H}">`;
    if (opts.ref != null) {
      svg += `<line x1="${X(opts.ref)}" y1="${padT}" x2="${X(opts.ref)}" y2="${padT + ih}" stroke="${ACCENT}" stroke-width="1.5" stroke-dasharray="4 3"/>
              <text class="bar-val" x="${X(opts.ref)}" y="${padT + ih + 17}" text-anchor="middle" fill="${ACCENT}">${opts.refLabel || ""}</text>`;
    }
    items.forEach((d, i) => {
      const y = padT + i * (rowH + gap);
      const fill = d.ours ? ACCENT : (d.base ? GRAYD : GRAY);
      svg += `<text class="bar-lbl" x="${padL - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" ${d.ours ? 'style="fill:#1b1f2a;font-weight:700"' : ""}>${d.label}</text>
        <rect x="${padL}" y="${y}" width="${Math.max(1, X(d.value) - padL)}" height="${rowH}" rx="4" fill="${fill}"/>
        <text class="bar-val" x="${X(d.value) + 8}" y="${y + rowH / 2 + 4}" ${d.ours ? `style="fill:${ACCENT};font-weight:700"` : ""}>${opts.fmt ? opts.fmt(d.value) : d.value}</text>`;
    });
    el.classList.add("chart"); el.innerHTML = svg + `</svg>`;
  }

  function lineChart(el, pts, measured) {
    const W = 700, H = 280, pad = { l: 46, r: 22, t: 16, b: 38 };
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const xs = pts.map(p => p.k), maxY = 100, minY = Math.min(...pts.map(p => p.rate)) - 10;
    const X = k => pad.l + ((k - xs[0]) / (xs[xs.length - 1] - xs[0])) * iw;
    const Y = r => pad.t + (1 - (r - minY) / (maxY - minY)) * ih;
    let grid = "", line = "";
    [0, 25, 50, 75, 100].filter(g => g >= minY).forEach(g =>
      grid += `<line class="grid-line" x1="${pad.l}" y1="${Y(g)}" x2="${W - pad.r}" y2="${Y(g)}"/>
               <text class="bar-val" x="${pad.l - 8}" y="${Y(g) + 3}" text-anchor="end">${g}%</text>`);
    pts.forEach((p, i) => line += `${i ? "L" : "M"} ${X(p.k)} ${Y(p.rate)} `);
    const dots = pts.map(p => {
      const m = measured.includes(p.k);
      return `<circle cx="${X(p.k)}" cy="${Y(p.rate)}" r="${m ? 5.5 : 4}" fill="${m ? ACCENT : "#fff"}" stroke="${ACCENT}" stroke-width="2"/>
              <text class="bar-val" x="${X(p.k)}" y="${Y(p.rate) - 11}" text-anchor="middle" ${m ? `fill="${ACCENT}"` : ""}>${p.rate}%</text>
              <text class="bar-lbl" x="${X(p.k)}" y="${H - 16}" text-anchor="middle">K=${p.k}</text>`;
    }).join("");
    el.classList.add("chart");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}">${grid}<path d="${line}" fill="none" stroke="${ACCENT}" stroke-width="2.5"/>${dots}
      <text class="bar-lbl" x="${pad.l}" y="${H - 3}">keyframes (K)</text></svg>
      <div class="legend"><span><i style="background:${ACCENT}"></i> measured</span><span><i style="background:#fff;border:2px solid ${ACCENT}"></i> interpolated</span></div>`;
  }

  function radarChart(el, dims, series) {
    const W = 380, R = 118, cx = W / 2, cy = W / 2, n = dims.length;
    const ang = i => -Math.PI / 2 + (i / n) * 2 * Math.PI;
    const pt = (i, r) => [cx + Math.cos(ang(i)) * R * r, cy + Math.sin(ang(i)) * R * r];
    let rings = [.25, .5, .75, 1].map(r =>
      `<polygon points="${dims.map((_, i) => pt(i, r).join(",")).join(" ")}" fill="none" class="grid-line"/>`).join("");
    let spokes = dims.map((d, i) => {
      const [x, y] = pt(i, 1), [lx, ly] = pt(i, 1.15);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="grid-line"/>
              <text class="bar-lbl" x="${lx}" y="${ly + 3}" text-anchor="middle">${d}</text>`;
    }).join("");
    let polys = series.map(s => {
      const p = s.vals.map((v, i) => pt(i, Math.max(0.04, v)).join(",")).join(" ");
      return `<polygon points="${p}" fill="${s.color}" fill-opacity="${s.ours ? .18 : .08}" stroke="${s.color}" stroke-width="${s.ours ? 2.4 : 1.6}"/>`;
    }).join("");
    el.classList.add("chart");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${W}">${rings}${spokes}${polys}</svg>
      <div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i> ${s.name}</span>`).join("")}</div>`;
  }

  function dataTable(el, head, rows) {
    el.innerHTML = `<table class="data"><thead><tr>${head.map(h => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.join("")}</tbody></table>`;
  }

  /* ========================= PHYGENBENCH ========================= */
  (function () {
    const all = PHYGENBENCH.groups.flatMap(g => g.rows);
    hBarChart($("#phygenChart"),
      all.map(r => ({ label: r.model, value: r.v[4], ours: r.ours, base: /CogVideoX-I2V/.test(r.model) })),
      { max: 0.65, fmt: v => v.toFixed(2) });
    let rows = "";
    PHYGENBENCH.groups.forEach(g => {
      rows += `<tr class="group-row"><td colspan="${PHYGENBENCH.cols.length + 1}">${g.name}</td></tr>`;
      const best = PHYGENBENCH.cols.map((_, ci) => Math.max(...g.rows.map(r => r.v[ci])));
      g.rows.forEach(r => {
        rows += `<tr class="${r.ours ? "ours" : ""}"><td>${r.model}</td>` +
          r.v.map((v, ci) => `<td class="${v === best[ci] ? "best" : ""}">${v.toFixed(2)}</td>`).join("") + `</tr>`;
      });
    });
    dataTable($("#phygenTable"), ["Model", ...PHYGENBENCH.cols], [rows]);
  })();

  /* ========================= PHYSICS-IQ ========================= */
  (function () {
    const best = PHYSICSIQ.cols.map((_, ci) => Math.max(...PHYSICSIQ.rows.map(r => r.v[ci])));
    const rows = PHYSICSIQ.rows.map(r =>
      `<tr class="${r.ours ? "ours" : (r.base ? "base" : "")}"><td>${r.model}</td>` +
      r.v.map((v, ci) => `<td class="${v === best[ci] ? "best" : ""}">${v.toFixed(1)}</td>`).join("") + `</tr>`).join("");
    dataTable($("#physiqTable"), ["Model", ...PHYSICSIQ.cols], [rows]);
  })();

  /* ========================= VLM GENERALIZATION ========================= */
  const gemini = VLM_ABLATION.rows.find(r => r.ours);
  hBarChart($("#vlmChart"),
    [...VLM_ABLATION.baselines, ...VLM_ABLATION.rows].map(r => ({ label: r.vlm, value: r.pgb, ours: r.ours, base: r.base })),
    { min: 0.48, max: 0.62, fmt: v => v.toFixed(3), ref: gemini.pgb, refLabel: `Gemini ${gemini.pgb}` });
  $("#vlmChart").insertAdjacentHTML("beforeend",
    `<div class="legend"><span>Bars: PhyGenBench average · dashed line: Gemini</span></div>`);
  let vrows = VLM_ABLATION.baselines.map(r =>
    `<tr class="base"><td>${r.vlm}</td><td>—</td><td>${fmt(r.piq, 1)}</td><td>${r.pgb.toFixed(3)}</td><td>${r.cost}</td></tr>`).join("");
  vrows += VLM_ABLATION.rows.map(r =>
    `<tr class="${r.ours ? "ours" : ""}"><td>${r.vlm}</td><td>${fmt(r.mmmu, 1)}</td><td>${fmt(r.piq, 1)}</td><td>${r.pgb.toFixed(3)}</td><td>${r.cost}</td></tr>`).join("");
  dataTable($("#vlmTable"), ["VLM", "MMMU-Pro", "Physics-IQ", "PhyGenBench", "Cost"], [vrows]);

  /* ========================= VBENCH ========================= */
  (function () {
    const { dims, rows, dimNames } = VBENCH;
    const mins = dims.map((_, c) => Math.min(...rows.map(r => r.v[c])));
    const maxs = dims.map((_, c) => Math.max(...rows.map(r => r.v[c])));
    const norm = r => r.v.map((v, c) => (v - mins[c]) / (maxs[c] - mins[c] || 1));
    const ours = rows.find(r => r.ours), base = rows.find(r => r.base);
    radarChart($("#vbenchRadar"), dims, [
      { name: ours.m, vals: norm(ours), color: ACCENT, ours: true },
      { name: base.m, vals: norm(base), color: GRAYD }
    ]);
    const best = dims.map((_, c) => Math.max(...rows.map(r => r.v[c])));
    const trows = rows.map(r =>
      `<tr class="${r.ours ? "ours" : (r.base ? "base" : "")}"><td>${r.m}</td>` +
      r.v.map((v, c) => `<td class="${v === best[c] ? "best" : ""}">${v.toFixed(2)}</td>`).join("") + `</tr>`).join("");
    dataTable($("#vbenchTable"), ["Method", ...dims], [trows]);
    $("#vbenchTable").insertAdjacentHTML("afterend",
      `<p class="muted">${dims.map(d => `<b>${d}</b> ${dimNames[d]}`).join(" · ")}</p>`);
  })();

  /* ========================= ABLATION ========================= */
  $("#ablationNote").textContent = ABLATION.note + " (metric: " + ABLATION.metric + ").";
  hBarChart($("#ablationChart"),
    ABLATION.rows.map(r => ({ label: r.name, value: r.score, ours: r.full })),
    { min: 25, max: 29, fmt: v => v.toFixed(1) });

  /* ========================= USER STUDY ========================= */
  $("#userStudyNote").textContent = `n = ${USER_STUDY.n} participants · ${USER_STUDY.protocol}.`;
  $("#userStudy").innerHTML = USER_STUDY.items.map(it => {
    const r = 54, c = 2 * Math.PI * r, off = c * (1 - it.pct / 100);
    return `<div class="gauge"><svg viewBox="0 0 132 132">
        <circle class="g-track" cx="66" cy="66" r="${r}"/>
        <circle class="g-fill" cx="66" cy="66" r="${r}" transform="rotate(-90 66 66)" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${off}"/>
        <text class="g-pct" x="66" y="74" text-anchor="middle">${it.pct}%</text>
      </svg><div class="g-label">${it.label}</div><div class="g-sub">prefer PhysPlan</div></div>`;
  }).join("");

  /* ========================= FAILURE ANALYSIS + LONG-HORIZON ========================= */
  $("#failNote").textContent = FAILURE_ATTR.note;
  (function () {
    const maxCell = Math.max(...FAILURE_ATTR.rows.filter(r => !r.avg).flatMap(r => r.v));
    const rows = FAILURE_ATTR.rows.map(r => {
      const cells = r.v.map(v =>
        `<td style="background:color-mix(in srgb, ${ACCENT} ${Math.round(v / maxCell * 45)}%, transparent)">${v}%</td>`).join("");
      return `<tr class="${r.avg ? "ours" : ""}"><td>${r.domain}</td>${cells}</tr>`;
    }).join("");
    dataTable($("#failTable"), ["Domain", ...FAILURE_ATTR.cols], [rows]);
  })();
  $("#longhorizonChart").innerHTML = `<p class="muted" style="text-align:center;margin-bottom:6px">Success rate vs. keyframe count. ${LONGHORIZON.note}</p>`;
  const lhEl = document.createElement("div");
  $("#longhorizonChart").appendChild(lhEl);
  lineChart(lhEl, LONGHORIZON.points, LONGHORIZON.measured);

  /* ========================= BIBTEX ========================= */
  $("#bibtexContent").textContent = BIBTEX;
  $("#copyBibtex").addEventListener("click", () => {
    navigator.clipboard.writeText(BIBTEX).then(() => {
      const b = $("#copyBibtex"); b.textContent = "Copied"; b.classList.add("done");
      setTimeout(() => { b.textContent = "Copy"; b.classList.remove("done"); }, 1600);
    });
  });

  /* ========================= AUTO-HYDRATE MEDIA ========================= */
  function hydrateMedia() {
    $$(".video-ph[data-video]").forEach(ph => {
      if (ph.dataset.hydrating) return; ph.dataset.hydrating = "1";
      const src = ph.getAttribute("data-video"); if (!src) return;
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = "metadata";
      v.className = "vid-real sync-video";
      v.addEventListener("loadeddata", () => { ph.replaceWith(v); v.play().catch(() => {}); }, { once: true });
      v.addEventListener("error", () => {}, { once: true });
      v.src = src;
    });
    $$(".video-ph[data-img]").forEach(ph => {
      if (ph.dataset.hydrating) return; ph.dataset.hydrating = "1";
      const src = ph.getAttribute("data-img"); if (!src) return;
      const img = new Image();
      img.onload = () => { img.className = "fig-img"; ph.replaceWith(img); };
      img.src = src;
    });
  }

  /* ========================= INTERACTIONS ========================= */
  showComparison(0);          // builds the grid, then hydrates
  hydrateMedia();             // hydrate the rest (teaser, figures, bglock, gallery)

  // gauges animate when scrolled into view
  const gio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.style.strokeDashoffset = e.target.dataset.off; gio.unobserve(e.target); }
  }), { threshold: .4 });
  $$(".g-fill").forEach(g => gio.observe(g));

  // scrollspy
  const navA = $$(".nav-links a"), secs = navA.map(a => $(a.getAttribute("href")));
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { const id = "#" + e.target.id; navA.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id)); }
  }), { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach(s => s && spy.observe(s));

  // to-top
  const toTop = $("#toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 700));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
