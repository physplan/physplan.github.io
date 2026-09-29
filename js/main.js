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
  if (!SITE.authors.length) $("#authors").style.display = "none";
  if (!SITE.affiliations.length) $("#affiliations").style.display = "none";
  $("#affiliations").innerHTML = SITE.affiliations.map(f => `<span><sup>${f.id}</sup> ${esc(f.name)}</span>`).join("");
  $("#authorNote").textContent = SITE.authorNote;
  const linkDefs = [
    { k: "paper", label: "Paper", primary: true },
    { k: "code", label: "Code" }
  ];
  $("#ctaRow").innerHTML = linkDefs.filter(l => SITE.links[l.k] != null).map(l => {
    const href = SITE.links[l.k];
    const disabled = href === "#" ? `data-disabled="true" title="Available after the review period"` : "";
    const tgt = href.startsWith("#") ? "" : `target="_blank" rel="noopener"`;
    return `<a class="btn ${l.primary ? "primary" : ""}" href="${href}" ${tgt} ${disabled}>${l.label}</a>`;
  }).join("");

  /* ========================= METHOD: gaps + WWW ========================= */
  $("#gaps").innerHTML = GAPS.map((g, i) =>
    `<div class="stage"><div class="stage-num">Gap ${i + 1}</div><h4>${g.title}</h4><p>${g.text}</p></div>`).join("");
  $("#www").innerHTML = WWW.map(w =>
    `<div class="www-card www-${w.k.toLowerCase()}"><div class="www-k">${w.k}</div><div class="www-from">← ${w.from}</div><p>${w.text}</p></div>`).join("");

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
  /* ========================= RESULTS ========================= */
  hBarChart($("#pgbChart"), PLAUSIBILITY.map(r => ({ label: r.model, value: r.pgb, ours: r.ours, base: r.base })),
    { min: 0.3, max: 0.8, padL: 180, W: 520, fmt: v => v.toFixed(2) });
  hBarChart($("#piqChart"), PLAUSIBILITY.map(r => ({ label: r.model, value: r.piq, ours: r.ours, base: r.base })),
    { min: 15, max: 40, padL: 180, W: 520, fmt: v => v.toFixed(1) });
  $("#plausNote").innerHTML = PLAUSIBILITY_NOTE;
  $("#qualityTiles").innerHTML = QUALITY_TILES.map(h =>
    `<div class="eff-cell"><div class="big">${h.big}</div><div class="small">${h.small}</div></div>`).join("");
  hBarChart($("#ablationChart"), ABLATION,
    { min: 20, max: 40, padL: 300, W: 760, fmt: (v, d) => d.ours ? v.toFixed(1) : `${v.toFixed(1)}  (−${(ABLATION[0].value - v).toFixed(1)})` });
  $("#ablationNote").innerHTML = ABLATION_NOTE;

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
  const navA = $$(".nav-links a"), secs = navA.map(a => $(a.getAttribute("href")));
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { const id = "#" + e.target.id; navA.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id)); }
  }), { rootMargin: "-45% 0px -50% 0px" });
  secs.forEach(s => s && spy.observe(s));

  const toTop = $("#toTop");
  window.addEventListener("scroll", () => toTop.classList.toggle("show", window.scrollY > 700));
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
})();
