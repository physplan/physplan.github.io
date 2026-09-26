/* ============================================================
   PhysPlan — project page renderer (reads everything from data.js)
   ============================================================ */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ACCENT = "#3b5bbd", GRAY = "#c7ccd6", GRAYD = "#9aa1b0";
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const sub = s => esc(s).replace(/L_(app|ext|pos|depth|count)/g, "L<sub>$1</sub>");

  /* ========================= HERO ========================= */
  $("#heroTitle").innerHTML = `<span class="brand">${SITE.title}</span>: ` + SITE.subtitle;
  $("#heroTagline").innerHTML = SITE.tagline;
  $("#abstractText").innerHTML = SITE.abstract;
  $("#footerLine").textContent = `${SITE.title}: ${SITE.subtitle}.`;
  $("#authors").innerHTML = SITE.authors.map(a => `<span class="author">${esc(a.name)}</span>`).join("");
  $("#affiliations").innerHTML = SITE.affiliations.map(f => `<span><sup>${f.id}</sup> ${esc(f.name)}</span>`).join("");
  $("#authorNote").textContent = SITE.authorNote;
  const linkDefs = [
    { k: "paper", label: "Paper", primary: true },
    { k: "code", label: "Code" },
    { k: "bibtex", label: "BibTeX" }
  ];
  $("#ctaRow").innerHTML = linkDefs.filter(l => SITE.links[l.k] != null).map(l => {
    const href = SITE.links[l.k];
    const disabled = href === "#" ? `data-disabled="true" title="Available after the review period"` : "";
    const tgt = href.startsWith("#") ? "" : `target="_blank" rel="noopener"`;
    return `<a class="btn ${l.primary ? "primary" : ""}" href="${href}" ${tgt} ${disabled}>${l.label}</a>`;
  }).join("");

  $("#highlights").innerHTML = HIGHLIGHTS.map(h =>
    `<div class="eff-cell"><div class="big">${h.big}</div><div class="small">${h.small}</div></div>`).join("");
  $("#contribList").innerHTML = CONTRIBUTIONS.map(c => `<li>${c.title ? `<b>${c.title}</b>, ` : ""}${c.text}</li>`).join("");

  /* ========================= METHOD: gaps + WWW ========================= */
  $("#gaps").innerHTML = GAPS.map((g, i) =>
    `<div class="stage"><div class="stage-num">Gap ${i + 1}</div><h4>${g.title}</h4><p>${g.text}</p></div>`).join("");
  $("#www").innerHTML = WWW.map(w =>
    `<div class="www-card www-${w.k.toLowerCase()}"><div class="www-k">${w.k}</div><div class="www-from">← ${w.from}</div><p>${w.text}</p></div>`).join("");

  /* ========================= GPSR STEPPER ========================= */
  const stepper = $("#stepper"), stepperDetail = $("#stepperDetail");
  stepper.innerHTML = GPSR_STEPS.map((s, i) =>
    `${i ? '<span class="step-arrow">→</span>' : ""}<button class="step-btn" data-i="${i}"><span class="step-n">${i + 1}</span>${s.label} <span class="step-sym">${s.sym}</span></button>`
  ).join("");
  function showStep(i) {
    $$(".step-btn", stepper).forEach((b, j) => b.classList.toggle("active", j === i));
    const s = GPSR_STEPS[i];
    stepperDetail.innerHTML = `<h5>${i + 1}. ${s.title}</h5><p>${s.desc}</p>`;
  }
  $$(".step-btn", stepper).forEach(b => b.addEventListener("click", () => showStep(+b.dataset.i)));
  showStep(0);

  /* ========================= EVENT CHAIN EXPLORER ========================= */
  (function () {
    const { states, frames, prompt, note } = EVENT_CHAIN;
    const panel = $("#chainPanel");
    const opClass = op => "op-" + op.toLowerCase();
    // timeline
    const W = 900, H = 64, pl = 20, pr = 20, y = 30;
    const X = f => pl + (f / (frames - 1)) * (W - pl - pr);
    let tl = `<line x1="${X(0)}" y1="${y}" x2="${X(frames - 1)}" y2="${y}" stroke="#c7ccd6" stroke-width="3" stroke-linecap="round"/>`;
    for (let i = 1; i < states.length; i++) {
      tl += `<rect class="tl-seg" data-i="${i}" x="${X(states[i - 1].f)}" y="${y - 7}" width="${X(states[i].f) - X(states[i - 1].f)}" height="14" rx="4"/>`;
    }
    states.forEach(s => {
      tl += `<g class="tl-anchor" data-i="${s.i}"><circle cx="${X(s.f)}" cy="${y}" r="8"/><text x="${X(s.f)}" y="${y - 15}" text-anchor="middle">f${"₀₁₂₃₄₅₆"[s.i]} = ${s.f}</text></g>`;
    });
    tl += `<text x="${X(frames - 1)}" y="${y + 25}" text-anchor="end" class="tl-end">frame ${frames - 1} (F = ${frames})</text>
           <text x="${X(0)}" y="${y + 25}" class="tl-end">frame 0</text>`;

    panel.innerHTML = `
      <div class="chain-prompt"><span>prompt w</span>“${esc(prompt)}”</div>
      <div class="chain-cards">${states.map(s => `
        <button class="chain-card" data-i="${s.i}">
          <img src="${s.kf}" alt="Keyframe I${s.i}"/>
          <div class="chain-card-b"><b>G${"₀₁₂₃₄₅₆"[s.i]}</b> <span>${esc(s.label)}</span></div>
        </button>`).join("")}</div>
      <svg class="chain-tl" viewBox="0 0 ${W} ${H}">${tl}</svg>
      <div class="chain-detail" id="chainDetail"></div>
      <p class="muted" style="margin-top:10px">${esc(note)} Keyframes are rendered from I₀ and the net edits.</p>`;

    function show(i) {
      $$(".chain-card", panel).forEach(c => c.classList.toggle("active", +c.dataset.i === i));
      $$(".tl-anchor", panel).forEach(c => c.classList.toggle("active", +c.dataset.i === i));
      $$(".tl-seg", panel).forEach(c => c.classList.toggle("active", +c.dataset.i === i));
      const s = states[i];
      const edits = s.edits.length
        ? s.edits.map(([op, a]) => `<span class="edit-chip ${opClass(op)}"><b>${op}</b>(${esc(a)})</span>`).join("")
        : `<span class="muted">none: G₀ is parsed from I₀ and w</span>`;
      $("#chainDetail").innerHTML = `
        <div class="cd-row"><div class="cd-k">State s<sub>o</sub></div><div>${esc(s.state)}</div></div>
        <div class="cd-row"><div class="cd-k">Physical rule r<sub>o</sub></div><div><i>${esc(s.rule)}</i></div></div>
        <div class="cd-row"><div class="cd-k">Edits ε<sub>${s.i}</sub></div><div class="cd-edits">${edits}</div></div>
        <div class="cd-row"><div class="cd-k">Timing</div><div>${s.d == null ? "f₀ = 0 (input frame)" : `d<sub>${s.i}</sub> = ${s.d.toFixed(2)} of the video → anchor f<sub>${s.i}</sub> = ${s.f}`}</div></div>`;
    }
    $$(".chain-card, .tl-anchor", panel).forEach(c => c.addEventListener("click", () => { stop(); show(+c.dataset.i); }));
    let cur = 0, timer = null;
    const stop = () => { clearInterval(timer); timer = null; };
    show(0);
    // gentle autoplay while visible
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !timer && !panel.dataset.touched) {
        timer = setInterval(() => { cur = (cur + 1) % states.length; show(cur); }, 2600);
      } else if (!e.isIntersecting) stop();
    }), { threshold: .35 });
    io.observe(panel);
    panel.addEventListener("click", () => { panel.dataset.touched = "1"; stop(); });
  })();

  /* ========================= CHECKS ========================= */
  $("#checks").innerHTML = `
    <div class="check-grid">${CHECKS.map((c, i) => `
      <div class="check-card"><div class="check-n">(${"i ii iii iv".split(" ")[i]})</div><b>${c.name}</b><p>${esc(c.text)}</p>
        <div class="check-bar"><i style="width:${c.share}%"></i></div><div class="check-share">${c.share}% of violations</div></div>`).join("")}
    </div>
    <p class="muted" style="margin-top:12px"><b>${CHECK_STATS.first}%</b> of all edit sets pass at the first attempt and <b>${CHECK_STATS.retries}%</b> after retries (${CHECK_STATS.rejected}% rejected). Coverage is the most frequently violated check: the VLM most often edits an object that the delta does not name, or forgets one that it does, which is exactly the error the checks keep out of the state graph.</p>`;

  /* ========================= GTO ========================= */
  $("#gtoSteps").innerHTML = GTO_STEPS.map((g, i) => `
    <div class="gto-card"><img src="${g.img}" alt="${esc(g.cap)}"/><div class="gto-cap">${g.cap}</div>
      <div class="stage-num">Step ${i + 1}</div><h4>${g.title}</h4><p>${g.text}</p></div>`).join("");

  (function () {
    const el = $("#opPanel");
    el.innerHTML = `<div class="op-list">${OPERATORS.map((o, i) =>
      `<button class="op-btn" data-i="${i}"><code>${esc(o.op)}</code><span>${esc(o.effect)}</span></button>`).join("")}</div>
      <div class="op-detail" id="opDetail"></div>`;
    function show(i) {
      $$(".op-btn", el).forEach((b, j) => b.classList.toggle("active", j === i));
      const o = OPERATORS[i];
      const terms = ["app", "ext", "pos", "depth", "cnt"];
      $("#opDetail").innerHTML = `
        <div class="term-row">${terms.map(t => `<span class="term ${t === o.term ? "on" : ""}">${t}</span>`).join("")}</div>
        <div class="op-name">measured by <b>${o.name}</b></div>
        <div class="op-eq">${o.eq}</div>
        <div class="muted">e.g. ${esc(o.ex)}</div>`;
    }
    $$(".op-btn", el).forEach(b => b.addEventListener("click", () => show(+b.dataset.i)));
    show(0);
  })();

  $("#impl").innerHTML = IMPLEMENTATION.map(([k, v]) => `<div class="impl-cell"><div class="impl-k">${k}</div><div>${esc(v)}</div></div>`).join("");

  /* ========================= QUALITATIVE COMPARISONS ========================= */
  const domainTabs = $("#domainTabs"), compareGrid = $("#compareGrid");
  domainTabs.innerHTML = COMPARISONS.map((c, i) =>
    `<button class="domain-tab ${i === 0 ? "active" : ""}" data-i="${i}"><span class="dom">${c.domain}</span> ${c.title}</button>`).join("");

  function videoCell(method, comp) {
    if (method.type === "image") {
      return `<div class="compare-cell"><div class="cell-label">${method.label}</div>
        <div class="video-ph small" data-img="assets/videos/${comp.id}_${method.key}.png"><span class="ph-play">▣</span></div></div>`;
    }
    return `<div class="compare-cell ${method.ours ? "ours" : ""}"><div class="cell-label">${method.label}</div>
      <div class="video-ph small" data-video="assets/videos/${comp.id}_${method.key}.mp4"><span class="ph-play">▷</span></div></div>`;
  }
  let activeCompare = 0;
  function showComparison(i) {
    activeCompare = (i + COMPARISONS.length) % COMPARISONS.length;
    $$(".domain-tab", domainTabs).forEach((t, j) => t.classList.toggle("active", j === activeCompare));
    const comp = COMPARISONS[activeCompare];
    compareGrid.innerHTML = COMPARE_METHODS.map(m => videoCell(m, comp)).join("");
    $("#compareTitle").textContent = `${comp.domain} · ${comp.title}`;
    $("#comparePrompt").textContent = `“${comp.prompt}”`;
    $("#compareNote").textContent = comp.note || "";
    $("#syncPlay") && ($("#syncPlay").textContent = "⏸ Pause all");
    hydrateMedia();
  }
  $("#compareControls").innerHTML = `<button id="syncPlay">⏸ Pause all</button><button id="restartAll">↺ Restart together</button>`;
  $$(".domain-tab", domainTabs).forEach(t => t.addEventListener("click", () => showComparison(+t.dataset.i)));
  $("#compareArrowLeft").addEventListener("click", () => showComparison(activeCompare - 1));
  $("#compareArrowRight").addEventListener("click", () => showComparison(activeCompare + 1));
  $("#syncPlay").addEventListener("click", () => {
    const vids = $$("#compareGrid video"); if (!vids.length) return;
    const play = vids[0].paused;
    vids.forEach(v => play ? v.play().catch(() => {}) : v.pause());
    $("#syncPlay").textContent = play ? "⏸ Pause all" : "▶ Play all";
  });
  $("#restartAll").addEventListener("click", () => {
    $$("#compareGrid video").forEach(v => { v.currentTime = 0; v.play().catch(() => {}); });
    $("#syncPlay").textContent = "⏸ Pause all";
  });

  /* ========================= CHART / TABLE HELPERS ========================= */
  function hBarChart(el, items, opts = {}) {
    const max = opts.max, min = opts.min || 0;
    const rowH = 24, gap = 8, padL = opts.padL || 150, padR = 64, padT = 4, padB = 4;
    const W = opts.W || 560, ih = items.length * (rowH + gap);
    const H = padT + ih + padB, iw = W - padL - padR;
    const X = v => padL + ((v - min) / (max - min)) * iw;
    let svg = `<svg viewBox="0 0 ${W} ${H}" role="img">`;
    items.forEach((d, i) => {
      const y = padT + i * (rowH + gap);
      const fill = d.ours ? ACCENT : (d.base ? GRAYD : GRAY);
      svg += `<text class="bar-lbl" x="${padL - 10}" y="${y + rowH / 2 + 4}" text-anchor="end" ${d.ours ? 'style="fill:#1b1f2a;font-weight:700"' : ""}>${esc(d.label).replace(/L_(\w+)/g, 'L<tspan baseline-shift="sub" font-size="75%">$1</tspan>')}</text>
        <rect x="${padL}" y="${y}" width="${Math.max(1, X(d.value) - padL)}" height="${rowH}" rx="4" fill="${fill}"/>
        <text class="bar-val" x="${X(d.value) + 8}" y="${y + rowH / 2 + 4}" ${d.ours ? `style="fill:${ACCENT};font-weight:700"` : ""}>${opts.fmt ? opts.fmt(d.value, d) : d.value}</text>`;
    });
    el.classList.add("chart"); el.innerHTML = svg + `</svg>`;
  }
  function radarChart(el, dims, series) {
    const W = 380, R = 118, cx = W / 2, cy = W / 2, n = dims.length;
    const ang = i => -Math.PI / 2 + (i / n) * 2 * Math.PI;
    const pt = (i, r) => [cx + Math.cos(ang(i)) * R * r, cy + Math.sin(ang(i)) * R * r];
    const rings = [.25, .5, .75, 1].map(r =>
      `<polygon points="${dims.map((_, i) => pt(i, r).join(",")).join(" ")}" fill="none" class="grid-line"/>`).join("");
    const spokes = dims.map((d, i) => {
      const [x, y] = pt(i, 1), [lx, ly] = pt(i, 1.15);
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="grid-line"/><text class="bar-lbl" x="${lx}" y="${ly + 3}" text-anchor="middle">${d}</text>`;
    }).join("");
    const polys = series.map(s => {
      const p = s.vals.map((v, i) => pt(i, Math.max(0.04, v)).join(",")).join(" ");
      return `<polygon points="${p}" fill="${s.color}" fill-opacity="${s.ours ? .18 : .06}" stroke="${s.color}" stroke-width="${s.ours ? 2.4 : 1.4}" ${s.dash ? 'stroke-dasharray="4 3"' : ""}/>`;
    }).join("");
    el.classList.add("chart");
    el.innerHTML = `<svg viewBox="0 0 ${W} ${W}">${rings}${spokes}${polys}</svg>
      <div class="legend">${series.map(s => `<span><i style="background:${s.color}"></i> ${s.name}</span>`).join("")}</div>`;
  }
  const table = (el, head, body) =>
    el.innerHTML = `<table class="data"><thead>${head}</thead><tbody>${body}</tbody></table>`;
  const cls = r => r.ours ? "ours" : (r.base ? "base" : "");

  /* ========================= TABLE 2 ========================= */
  (function () {
    const T = MAIN_TABLE, all = T.groups.flatMap(g => g.rows);
    const bestP = T.pgbCols.map((_, c) => Math.max(...all.map(r => r.pgb[c])));
    const bestQ = T.piqCols.map((_, c) => Math.max(...all.filter(r => r.piq).map(r => r.piq[c])));
    const base = all.find(r => r.base);
    const head = `<tr><th rowspan="2">Model</th><th colspan="${T.pgbCols.length}" class="grp-h">PhyGenBench</th><th colspan="${T.piqCols.length}" class="grp-h">Physics-IQ</th></tr>
      <tr>${T.pgbCols.map(c => `<th>${c}</th>`).join("")}${T.piqCols.map(c => `<th>${c}</th>`).join("")}</tr>`;
    let body = "";
    T.groups.forEach((g, gi) => {
      body += `<tr class="group-row"><td colspan="${1 + T.pgbCols.length + T.piqCols.length}">${g.name}</td></tr>`;
      g.rows.forEach((r, ri) => {
        body += `<tr class="${cls(r)}"><td class="${r.sub ? "sub" : ""}">${esc(r.model)}</td>` +
          r.pgb.map((v, c) => `<td class="${v === bestP[c] ? "best" : ""}">${v.toFixed(2)}${r.ours && c === 4 ? ` <span class="gain">+${(v - base.pgb[4]).toFixed(2)}</span>` : ""}</td>`).join("");
        if (r.piq) body += r.piq.map((v, c) => `<td class="${v === bestQ[c] ? "best" : ""}">${v.toFixed(1)}${r.ours && c === 5 ? ` <span class="gain">+${(v - base.piq[5]).toFixed(1)}</span>` : ""}</td>`).join("");
        else if (gi === 0 && ri === 0) body += `<td colspan="${T.piqCols.length}" rowspan="${g.rows.length}" class="na">Physics-IQ is evaluated for I2V models only</td>`;
        body += `</tr>`;
      });
    });
    table($("#mainTable"), head, body);
    $("#mainCaption").textContent = T.caption;

    const i2v = T.groups.slice(1).flatMap(g => g.rows);
    hBarChart($("#pgbChart"), i2v.map(r => ({ label: r.model, value: r.pgb[4], ours: r.ours, base: r.base })),
      { max: 0.85, fmt: v => v.toFixed(2) });
    hBarChart($("#piqChart"), i2v.map(r => ({ label: r.model, value: r.piq[5], ours: r.ours, base: r.base })),
      { max: 42, fmt: v => v.toFixed(1) });
  })();

  /* ========================= TABLE 3 ========================= */
  (function () {
    const P = PERCEPTUAL, best = P.cols.map((_, c) => Math.min(...P.rows.map(r => r.v[c])));
    table($("#perceptualTable"), `<tr><th>Model</th>${P.cols.map(c => `<th>${c}</th>`).join("")}</tr>`,
      P.rows.map(r => `<tr class="${cls(r)}"><td>${r.m}</td>${r.v.map((v, c) => `<td class="${v === best[c] ? "best" : ""}">${v.toFixed(1)}</td>`).join("")}</tr>`).join(""));
  })();

  /* ========================= VBENCH ========================= */
  (function () {
    const { dims, groups, dimNames } = VBENCH, rows = groups.flatMap(g => g.rows);
    const mins = dims.map((_, c) => Math.min(...rows.map(r => r.v[c])));
    const maxs = dims.map((_, c) => Math.max(...rows.map(r => r.v[c])));
    const norm = r => r.v.map((v, c) => (v - mins[c]) / (maxs[c] - mins[c] || 1));
    const ours = rows.find(r => r.ours), base = rows.find(r => r.base);
    radarChart($("#vbenchRadar"), dims, [
      { name: base.m, vals: norm(base), color: GRAYD, dash: true },
      { name: ours.m, vals: norm(ours), color: ACCENT, ours: true }
    ]);
    const best = dims.map((_, c) => Math.max(...rows.map(r => r.v[c])));
    let body = "";
    groups.forEach(g => {
      body += `<tr class="group-row"><td colspan="${dims.length + 1}">${g.name}</td></tr>`;
      body += g.rows.map(r => `<tr class="${cls(r)}"><td>${r.m}</td>` +
        r.v.map((v, c) => `<td class="${v === best[c] ? "best" : ""}">${v.toFixed(2)}</td>`).join("") + `</tr>`).join("");
    });
    table($("#vbenchTable"), `<tr><th>Method</th>${dims.map(d => `<th title="${dimNames[d]}">${d} ↑</th>`).join("")}</tr>`, body);
    $("#vbenchLegend").innerHTML = dims.map(d => `<b>${d}</b> ${dimNames[d]}`).join(" · ");
  })();

  /* ========================= USER STUDY ========================= */
  $("#userStudyNote").textContent = `${USER_STUDY.n} participants · ${USER_STUDY.protocol}. 50% means no preference.`;
  $("#userStudy").innerHTML = USER_STUDY.criteria.map((label, i) => {
    const pct = USER_STUDY.pooled[i], r = 54, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return `<div class="gauge"><svg viewBox="0 0 132 132">
        <circle class="g-track" cx="66" cy="66" r="${r}"/>
        <circle class="g-fill" cx="66" cy="66" r="${r}" transform="rotate(-90 66 66)" stroke-dasharray="${c}" stroke-dashoffset="${c}" data-off="${off}"/>
        <text class="g-pct" x="66" y="74" text-anchor="middle">${pct}%</text>
      </svg><div class="g-label">${label}</div><div class="g-sub">prefer PhysPlan (pooled)</div></div>`;
  }).join("");
  table($("#userTable"), `<tr><th>Preference for PhysPlan</th>${USER_STUDY.criteria.map(c => `<th>${c}</th>`).join("")}</tr>`,
    USER_STUDY.perBaseline.map(r => `<tr class="${r.pooled ? "ours" : ""}"><td>${r.vs}</td>${r.v.map(v => `<td>${v}%</td>`).join("")}</tr>`).join(""));

  /* ========================= ABLATION ========================= */
  (function () {
    const A = ABLATION, full = A.full.v[5];
    $("#ablationNote").innerHTML = A.note;
    const rows = A.groups.flatMap(g => g.rows);
    hBarChart($("#ablationChart"),
      [{ label: A.full.name, value: full, ours: true }, ...rows.map(r => ({ label: `(${r.id}) ${r.name}`, value: r.v[5] }))],
      { min: 20, max: 40, padL: 280, W: 760, fmt: (v, d) => d.ours ? v.toFixed(1) : `${v.toFixed(1)}  (−${(full - v).toFixed(1)})` });
    let body = `<tr class="ours"><td>${A.full.name}</td>${A.full.v.map(v => `<td>${v.toFixed(1)}</td>`).join("")}</tr>`;
    A.groups.forEach(g => {
      body += `<tr class="group-row"><td colspan="${A.cols.length + 1}">${g.name}</td></tr>`;
      body += g.rows.map(r => `<tr><td>(${r.id}) ${sub(r.name)}</td>${r.v.map((v, c) =>
        `<td>${v.toFixed(1)}${c === 5 ? ` <span class="drop">−${(full - v).toFixed(1)}</span>` : ""}</td>`).join("")}</tr>`).join("");
    });
    table($("#ablationTable"), `<tr><th>Setting</th>${A.cols.map(c => `<th>${c} ↑</th>`).join("")}</tr>`, body);
  })();

  /* ========================= FAILURE ANALYSIS ========================= */
  (function () {
    const F = FAILURE_ATTR;
    $("#failNote").textContent = F.note;
    const maxCell = Math.max(...F.rows.flatMap(r => r.v));
    table($("#failTable"), `<tr><th>Category</th>${F.cols.map(c => `<th>${c}</th>`).join("")}</tr>`,
      F.rows.map(r => `<tr class="${r.avg ? "ours" : ""}"><td>${r.domain}</td>${r.v.map(v =>
        `<td class="heat" style="background:color-mix(in srgb, ${ACCENT} ${Math.round(v / maxCell * 42)}%, transparent)">${v}%</td>`).join("")}</tr>`).join(""));
  })();

  /* ========================= COST ========================= */
  $("#costNote").textContent = COST_NOTE;
  table($("#runtimeTable"), `<tr><th>Stage</th><th class="left">Model</th><th>Time (s)</th></tr>`,
    RUNTIME.map(r => r.group ? `<tr class="group-row"><td colspan="3">${r.group}</td></tr>`
      : `<tr class="${r.total ? "ours" : ""}"><td>${r.stage}</td><td class="left">${r.model}</td><td>${r.t.toFixed(1)}</td></tr>`).join(""));
  table($("#costTable"), `<tr><th>Method</th><th>Time (s)</th><th>Peak mem. (GB)</th><th>API cost</th></tr>`,
    COST.map(r => `<tr class="${cls(r)}"><td>${r.m}</td><td>${r.t}</td><td>${r.mem}</td><td>${r.api}</td></tr>`).join(""));

  $("#limitations").textContent = LIMITATIONS;

  /* ========================= BIBTEX ========================= */
  $("#bibtexContent").textContent = BIBTEX;
  $("#copyBibtex").addEventListener("click", () => {
    navigator.clipboard.writeText(BIBTEX).then(() => {
      const b = $("#copyBibtex"); b.textContent = "Copied"; b.classList.add("done");
      setTimeout(() => { b.textContent = "Copy"; b.classList.remove("done"); }, 1600);
    });
  });

  /* ========================= MEDIA HYDRATION ========================= */
  function hydrateMedia() {
    $$(".video-ph[data-video]").forEach(ph => {
      if (ph.dataset.hydrating) return; ph.dataset.hydrating = "1";
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.preload = "auto";
      v.setAttribute("muted", ""); v.setAttribute("playsinline", "");
      v.className = "vid-real sync-video";
      v.addEventListener("loadeddata", () => { ph.classList.add("hydrated"); ph.replaceChildren(v); v.play().catch(() => {}); }, { once: true });
      v.src = ph.getAttribute("data-video");
    });
    $$(".video-ph[data-img]").forEach(ph => {
      if (ph.dataset.hydrating) return; ph.dataset.hydrating = "1";
      const img = new Image();
      img.onload = () => { img.className = "vid-real"; ph.classList.add("hydrated"); ph.replaceChildren(img); };
      img.alt = "Input frame";
      img.src = ph.getAttribute("data-img");
    });
  }
  showComparison(0);

  /* ========================= INTERACTIONS ========================= */
  const gio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.style.strokeDashoffset = e.target.dataset.off; gio.unobserve(e.target); }
  }), { threshold: .4 });
  $$(".g-fill").forEach(g => gio.observe(g));

  const navA = $$(".nav-links a"), secs = navA.map(a => $(a.getAttribute("href")));
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { const id = "#" + e.target.id; navA.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id)); }
  }), { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach(s => s && spy.observe(s));

  const toTop = $("#toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 700));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
