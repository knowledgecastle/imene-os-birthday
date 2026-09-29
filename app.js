/* imene.os app logic. Content lives in content.js; icons in icons.js. */
(function () {
  "use strict";

  const C = window.CONTENT;
  const W = C.windows;
  const icon = window.icon;
  const $ = (s, r) => (r || document).querySelector(s);
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);
  const OG = params.has("og");

  /* ---------- storage (always wrapped) ---------- */
  const store = {
    get(k, d) {
      try { const v = localStorage.getItem("imeneos:" + k); return v == null ? d : JSON.parse(v); }
      catch (e) { return d; }
    },
    set(k, v) { try { localStorage.setItem("imeneos:" + k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    clear() {
      try { Object.keys(localStorage).filter((k) => k.startsWith("imeneos:") && k !== "imeneos:theme").forEach((k) => localStorage.removeItem(k)); }
      catch (e) { /* ignore */ }
    },
  };

  const WIN_IDS = Object.keys(W);
  const OTHERS = WIN_IDS.filter((id) => id !== "birthday");
  let state;
  function loadState() {
    state = {
      visited: new Set(store.get("visited", [])),
      cards: new Set(store.get("cards", [])),
      ach: new Set(store.get("ach", [])),
      skills: store.get("skills", false),
      unseenAch: false,
    };
  }
  loadState();
  function save() {
    store.set("visited", [...state.visited]);
    store.set("cards", [...state.cards]);
    store.set("ach", [...state.ach]);
    store.set("skills", state.skills);
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const isMobile = () => window.innerWidth < 720;

  /* ---------- scene ---------- */
  $(".scene-light").style.backgroundImage = `url("${C.backgrounds.light}")`;
  $(".scene-dark").style.backgroundImage = `url("${C.backgrounds.dark}")`;

  /* ---------- theme ---------- */
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  function effectiveTheme() {
    const t = root.getAttribute("data-theme");
    return t || (mq.matches ? "dark" : "light");
  }
  function applyTheme(t) {
    if (t) root.setAttribute("data-theme", t); else root.removeAttribute("data-theme");
    const eff = effectiveTheme();
    const btn = $("#themeBtn");
    btn.innerHTML = icon(eff === "dark" ? "sun" : "moon", 16) + `<span>${eff === "dark" ? "Light" : "Dark"}</span>`;
    btn.setAttribute("aria-label", `Switch to ${eff === "dark" ? "light" : "dark"} theme`);
    $('meta[name="theme-color"]').setAttribute("content", eff === "dark" ? "#0E1116" : "#F6F5F1");
    rain.sync();
  }
  $("#themeBtn").addEventListener("click", () => {
    const next = effectiveTheme() === "dark" ? "light" : "dark";
    store.set("theme", next);
    applyTheme(next);
    sound.blip(520);
  });
  mq.addEventListener && mq.addEventListener("change", () => applyTheme(root.getAttribute("data-theme")));

  /* ---------- rain (night scene only, off under reduced motion) ---------- */
  const rain = (function () {
    const cv = $("#rain");
    const ctx = cv.getContext("2d");
    let drops = [], running = false, raf = 0, w = 0, h = 0;
    function size() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 16000);
      drops = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, l: 8 + Math.random() * 16, v: 5 + Math.random() * 6 }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(190, 205, 235, 0.35)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const d of drops) {
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.l * 0.18, d.y + d.l);
        d.y += d.v; d.x -= d.v * 0.18;
        if (d.y > h) { d.y = -20; d.x = Math.random() * (w + 60); }
      }
      ctx.stroke();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running) return; running = true; size(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); ctx.clearRect(0, 0, w, h); }
    function sync() {
      const want = !reduced && !OG && !document.hidden && effectiveTheme() === "dark";
      want ? start() : stop();
    }
    window.addEventListener("resize", () => running && size());
    document.addEventListener("visibilitychange", sync);
    return { sync };
  })();

  /* ---------- sound (off by default, only after a click) ---------- */
  const sound = (function () {
    let ac = null, on = false, amb = null;
    function ensure() {
      if (!ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ac = new A(); }
      return ac;
    }
    function tone(freq, dur, vol, type) {
      if (!on || !ac) return;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      g.gain.setValueAtTime(0, ac.currentTime);
      g.gain.linearRampToValueAtTime(vol, ac.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
      o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + dur + 0.02);
    }
    function ambience() {
      // brown noise through a low-pass: soft rain on a window
      const len = ac.sampleRate * 4, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      let last = 0;
      for (let i = 0; i < len; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02; d[i] = last * 3.2;
        if (Math.random() < 0.00018) d[i] += (Math.random() - 0.5) * 0.9; // vinyl crackle
      }
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1100;
      const g = ac.createGain(); g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.09, ac.currentTime + 1.2);
      src.connect(lp).connect(g).connect(ac.destination); src.start();
      return { src, g };
    }
    function set(v) {
      on = v;
      const btn = $("#soundBtn");
      btn.setAttribute("aria-pressed", String(on));
      btn.innerHTML = icon(on ? "volume-2" : "volume-x", 16) + `<span>Sound ${on ? "on" : "off"}</span>`;
      btn.setAttribute("aria-label", on ? "Turn sound off" : "Turn sound on");
      $("#nowPlaying").hidden = !on;
      if (on) {
        if (!ensure()) return;
        ac.resume();
        if (!amb) amb = ambience();
        tone(660, 0.15, 0.05);
      } else if (amb) {
        const a = amb; amb = null;
        a.g.gain.linearRampToValueAtTime(0, ac.currentTime + 0.3);
        setTimeout(() => a.src.stop(), 400);
      }
    }
    return {
      toggle() { set(!on); },
      init() { set(false); },
      blip(f) { tone(f || 440, 0.12, 0.04); },
      tick() { tone(1800 + Math.random() * 400, 0.025, 0.012, "triangle"); },
    };
  })();
  $("#soundBtn").addEventListener("click", () => sound.toggle());

  /* ---------- clock ---------- */
  function clock() {
    const d = new Date();
    $("#clock").textContent = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (!OG) { clock(); setInterval(clock, 15000); }

  /* ---------- desktop icons ---------- */
  function unlockRemaining() {
    const opened = OTHERS.filter((id) => state.visited.has(id)).length;
    return Math.max(0, W.birthday.unlockAfter - opened);
  }
  const unlocked = () => unlockRemaining() === 0;

  function renderIcons() {
    const make = (id) => {
      const w = W[id];
      const locked = id === "birthday" && !unlocked();
      const b = document.createElement("button");
      b.type = "button";
      b.className = "icon" + (locked ? " locked" : "");
      b.dataset.win = id;
      const lockedLine = W.birthday.lockedLine.replace("{n}", unlockRemaining());
      b.setAttribute("aria-label", locked ? `${w.label}, locked. ${lockedLine}` : `Open ${w.label}${state.visited.has(id) ? "" : ", not visited yet"}`);
      if (locked) b.title = lockedLine;
      b.innerHTML =
        `<span class="tile">${icon(w.icon, 24)}` +
        (!state.visited.has(id) && !locked ? '<span class="dot"></span>' : "") +
        (locked ? `<span class="lock">${icon("lock", 13)}</span>` : "") +
        `</span><span class="label">${esc(w.label)}</span>`;
      b.addEventListener("click", () => openWindow(id, { via: "click", opener: b }));
      return b;
    };
    const L = $("#iconsLeft"), R = $("#iconsRight");
    L.innerHTML = ""; R.innerHTML = "";
    const half = Math.ceil(WIN_IDS.length / 2);
    WIN_IDS.slice(0, half).forEach((id) => L.appendChild(make(id)));
    WIN_IDS.slice(half).forEach((id) => R.appendChild(make(id)));
  }

  function renderProgress() {
    $("#progress").innerHTML = `year explored <b>${state.visited.size}</b>/${WIN_IDS.length}`;
  }

  /* ---------- achievements ---------- */
  function earn(id) {
    if (state.ach.has(id)) return;
    state.ach.add(id); save();
    state.unseenAch = true; renderTrophy();
    const a = C.achievements.find((x) => x.id === id);
    toast(a);
    sound.blip(880);
    refreshWindow("achievements");
  }
  function renderTrophy() {
    $("#trophyBtn").innerHTML = icon("trophy", 17) + (state.unseenAch ? '<span class="badge"></span>' : "");
  }
  function toast(a) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<span class="ai">${icon(a.icon, 20)}</span><span><small>achievement unlocked</small><strong>${esc(a.title)}</strong></span>`;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 260); }, 3200);
  }
  $("#trophyBtn").addEventListener("click", (e) => openWindow("achievements", { via: "click", opener: e.currentTarget }));

  function markVisited(id) {
    if (!W[id] || state.visited.has(id)) return;
    const wasLocked = !unlocked();
    state.visited.add(id); save();
    renderIcons(); renderProgress();
    if (OTHERS.filter((x) => state.visited.has(x)).length >= 4) earn("explorer");
    if (wasLocked && unlocked()) {
      print(`<span class="acc">✓ new folder unlocked: birthday. try "date"</span>`);
    }
  }

  /* ---------- windows ---------- */
  const open = new Map(); // id -> { el, opener }
  let z = 10, cascade = 0;

  const RENDER = {
    whoami: renderWhoami,
    shift: renderShift,
    clients: renderClients,
    templates: renderTemplates,
    community: renderCommunity,
    skills: renderSkills,
    lessons: renderLessons,
    apps: renderApps,
    achievements: renderAchievements,
    finale: renderFinaleCard,
  };
  const META = {
    achievements: { title: "achievements", icon: "trophy" },
    finale: { title: "v2026", icon: "cake" },
  };

  function openWindow(id, opts) {
    opts = opts || {};
    if (id === "birthday") return tryFinale(opts);
    if (opts.via === "type" && W[id]) earn("power-user");

    let rec = open.get(id);
    if (rec) {
      focusWin(rec.el);
      if (rec.update) rec.update(opts);
      return rec;
    }

    const meta = W[id] || META[id];
    const el = document.createElement("div");
    const titleId = "wt-" + id;
    el.className = "win" + (["clients", "skills", "apps"].includes(id) ? " wide" : "");
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-labelledby", titleId);
    el.dataset.id = id;
    el.innerHTML =
      `<div class="win-bar"><div class="win-title" id="${titleId}">${icon(meta.icon, 15)}<span>${esc(meta.title)}</span></div>` +
      `<button class="win-close" type="button" aria-label="Close ${esc(meta.title)}">${icon("x", 16)}</button></div>` +
      `<div class="win-body"></div>`;
    $("#windows").appendChild(el);

    rec = { el, opener: opts.opener || document.activeElement };
    open.set(id, rec);
    const body = $(".win-body", el);
    rec.update = RENDER[id](body, opts, rec) || null;

    place(el);
    focusWin(el);
    $(".win-close", el).addEventListener("click", () => closeWindow(id));
    el.addEventListener("pointerdown", () => focusWin(el));
    drag(el);
    requestAnimationFrame(() => $(".win-close", el).focus({ preventScroll: true }));

    sound.blip(id === "achievements" ? 740 : 600);
    if (id === "achievements") { state.unseenAch = false; renderTrophy(); }
    markVisited(id);
    return rec;
  }

  function place(el) {
    if (isMobile()) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const off = (cascade++ % 6) * 26;
    const left = Math.max(12, Math.min(vw - r.width - 12, (vw - r.width) / 2 - 60 + off));
    const top = Math.max(56, Math.min(vh - r.height - 16, (vh - r.height) / 2 - 30 + off));
    el.style.left = left + "px";
    el.style.top = top + "px";
  }

  function focusWin(el) {
    document.querySelectorAll(".win.focused").forEach((w) => w !== el && w.classList.remove("focused"));
    el.classList.add("focused");
    el.style.zIndex = ++z;
  }

  function topWin() {
    let best = null;
    open.forEach((rec) => { if (!best || +rec.el.style.zIndex > +best.el.style.zIndex) best = rec; });
    return best;
  }

  function closeWindow(id) {
    const rec = open.get(id);
    if (!rec) return;
    open.delete(id);
    rec.el.classList.add("closing");
    setTimeout(() => rec.el.remove(), reduced ? 0 : 140);
    if (id === "finale") endFinale();
    const next = topWin();
    if (next) { focusWin(next.el); }
    const target = rec.opener && document.contains(rec.opener) ? rec.opener : (next ? $(".win-close", next.el) : $("#termInput"));
    if (target && target.focus) target.focus({ preventScroll: true });
    // the opener icon may have re-rendered (visited dot); fall back to its fresh twin
    if (rec.opener && !document.contains(rec.opener) && rec.opener.dataset && rec.opener.dataset.win) {
      const twin = document.querySelector(`.icon[data-win="${rec.opener.dataset.win}"]`);
      twin && twin.focus({ preventScroll: true });
    }
  }
  function closeAll() { [...open.keys()].forEach(closeWindow); }

  function refreshWindow(id) {
    const rec = open.get(id);
    if (!rec) return;
    const body = $(".win-body", rec.el);
    body.innerHTML = "";
    rec.update = RENDER[id](body, {}, rec) || null;
  }

  function drag(el) {
    const bar = $(".win-bar", el);
    let sx, sy, ox, oy, dragging = false;
    bar.addEventListener("pointerdown", (e) => {
      if (isMobile() || e.button !== 0 || e.target.closest("button")) return;
      dragging = true; sx = e.clientX; sy = e.clientY;
      ox = el.offsetLeft; oy = el.offsetTop;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const x = Math.max(-el.offsetWidth + 80, Math.min(window.innerWidth - 80, ox + e.clientX - sx));
      const y = Math.max(44, Math.min(window.innerHeight - 44, oy + e.clientY - sy));
      el.style.left = x + "px"; el.style.top = y + "px";
    });
    const end = () => { dragging = false; };
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
  }

  // Escape closes the top window; Tab stays inside the focused dialog.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const t = topWin();
      if (t) { e.preventDefault(); closeWindow(t.el.dataset.id); return; }
      if (finaleActive) { e.preventDefault(); endFinale(); }
      return;
    }
    if (e.key === "Tab") {
      const win = document.activeElement && document.activeElement.closest && document.activeElement.closest(".win");
      if (!win) return;
      const f = [...win.querySelectorAll('button, a[href], input, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- helpers for window content ---------- */
  function pic(src, cls, alt) {
    return `<img class="${cls}" src="${esc(src)}" alt="${esc(alt || "")}" data-ph="${esc(src)}" loading="lazy">`;
  }
  function wirePics(scope, fallback) {
    scope.querySelectorAll("img[data-ph]").forEach((img) => {
      const swap = () => {
        const ph = document.createElement("div");
        ph.className = img.className + " ph";
        ph.innerHTML = fallback ? fallback(img) : `${icon("image", 22)}<span>${esc(img.dataset.ph)}</span>`;
        img.replaceWith(ph);
      };
      if (img.complete && img.naturalWidth === 0 && img.src) swap();
      else img.addEventListener("error", swap, { once: true });
    });
  }
  function countUp(scope) {
    scope.querySelectorAll("[data-count]").forEach((n) => {
      const to = +n.dataset.count, suf = n.dataset.suffix || "";
      const fmt = (v) => Math.round(v).toLocaleString("en-US") + suf;
      if (reduced) { n.textContent = fmt(to); return; }
      const t0 = performance.now();
      const step = (t) => {
        const p = Math.min(1, (t - t0) / 900);
        n.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      n.textContent = fmt(0);
      requestAnimationFrame(step);
    });
  }
  function statsHTML(stats) {
    return `<div class="stats">${stats.map((s) =>
      `<div class="stat"><div class="num"${s.value != null ? ` data-count="${s.value}" data-suffix="${esc(s.suffix || "")}"` : ""}>${esc(s.text || (s.value.toLocaleString("en-US") + (s.suffix || "")))}</div><div class="lbl">${esc(s.label)}</div></div>`
    ).join("")}</div>`;
  }

  /* ---------- window renderers ---------- */
  function renderWhoami(body) {
    const w = W.whoami;
    body.innerHTML =
      `<div class="who">${pic(w.picture, "portrait", w.name)}<div>` +
      `<p class="kicker">$ whoami</p><h2>${esc(w.name)}</h2>` +
      w.lines.map((l) => `<p>${esc(l)}</p>`).join("") +
      `<p class="kicker" style="margin-top:14px">languages</p><div class="langs">${w.languages.map((l) => `<span class="chip" ${/[؀-ۿ]/.test(l) ? 'lang="ar" dir="rtl"' : ""}>${esc(l)}</span>`).join("")}</div>` +
      `<a class="btn" href="${esc(w.link.href)}" target="_blank" rel="noopener">${icon("external-link", 15)}${esc(w.link.label)}</a>` +
      `</div></div>`;
    wirePics(body, (img) => `${icon("user", 26)}<span>${esc(img.dataset.ph.split("/").pop())}</span>`);
  }

  function renderShift(body) {
    const w = W.shift;
    body.innerHTML =
      `<p class="kicker">$ git diff 2025..2026 --stat</p>` +
      w.rows.map((r) =>
        `<div class="shift-row">` +
        `<div class="card before"><strong>${esc(r.before.title)}</strong><small>${esc(r.before.note)}</small></div>` +
        `<div class="shift-arrow">${icon("arrow-right", 20)}</div>` +
        `<div class="card after reveal"><strong>${esc(r.after.title)}</strong><small>${esc(r.after.note)}</small></div>` +
        `</div>`
      ).join("") +
      `<p class="kicker" style="margin-top:14px">3 files changed, 3 insertions(+), 3 deletions(-)</p>`;
    body.querySelectorAll(".reveal").forEach((el, i) => setTimeout(() => el.classList.add("in"), reduced ? 0 : 220 + i * 320));
  }

  function renderClients(body, opts) {
    const w = W.clients;
    let filter = opts.filter || "all";
    let selected = opts.slug || null;

    body.innerHTML =
      `<div class="explorer-head"><div class="chips" role="group" aria-label="Filter clients">` +
      w.filters.map((f) => `<button type="button" class="chip-btn" data-f="${f.id}">${esc(f.label)}</button>`).join("") +
      `</div><span class="counter">${esc(w.counter)}</span></div>` +
      `<div class="explorer"><div class="folders" role="group" aria-label="Industry folders"></div><div class="detail" aria-live="polite"></div></div>`;

    const folders = $(".folders", body), detail = $(".detail", body);

    function drawFolders() {
      body.querySelectorAll(".chip-btn").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.f === filter)));
      const list = C.clients.filter((c) => filter === "all" || c.type === filter);
      folders.innerHTML = list.map((c) =>
        `<button type="button" class="folder" data-slug="${c.slug}" aria-pressed="${c.slug === selected}">` +
        `<span class="ficon">${icon("folder", 40)}<span class="glyph">${icon(c.icon, 15)}</span></span>` +
        `<span class="fname">${esc(c.industry)}</span>` +
        (state.cards.has(c.slug) ? '<span class="seen" title="opened"></span>' : "") +
        `</button>`
      ).join("");
    }
    function drawDetail() {
      const c = C.clients.find((x) => x.slug === selected);
      if (!c) {
        detail.innerHTML = `<div class="detail-empty">${icon("folder-open", 30)}<span>pick a folder to open its case card</span></div>`;
        return;
      }
      const tagCls = c.tag === "In progress" ? "progress" : c.type === "consult" ? "consult" : "";
      const media = c.type === "build" ? pic(`assets/clients/${c.slug}.jpg`, "", `Anonymized view of the ${c.industry} build`) : icon(c.icon, 44);
      detail.innerHTML =
        `<div class="media">${media}</div>` +
        `<h3>${esc(c.industry)}</h3><span class="tag ${tagCls}">${esc(c.tag)}</span>` +
        `<dl class="dl"><dt>what I built</dt><dd>${esc(c.built)}</dd><dt>the change</dt><dd>${esc(c.change)}</dd></dl>` +
        `<p class="kicker" style="margin:14px 0 0">~/clients/${esc(c.slug)}</p>`;
      wirePics(detail, () => icon(c.icon, 44));
      // missing picture: show the icon large, no dashed box
      detail.querySelectorAll(".media .ph").forEach((p) => { p.className = ""; });
    }
    function select(slug, fromUser) {
      selected = slug;
      if (!state.cards.has(slug)) {
        state.cards.add(slug); save();
        if (state.cards.size >= 10) earn("deep-diver");
      }
      drawFolders(); drawDetail();
      const cur = folders.querySelector(`[data-slug="${slug}"]`);
      if (cur && !fromUser) cur.scrollIntoView({ block: "nearest" });
      if (fromUser) sound.blip(500);
      if (isMobile()) detail.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "nearest" });
    }

    body.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip-btn");
      if (chip) { filter = chip.dataset.f; drawFolders(); return; }
      const f = e.target.closest(".folder");
      if (f) { select(f.dataset.slug, true); const again = folders.querySelector(`[data-slug="${f.dataset.slug}"]`); again && again.focus(); }
    });

    drawFolders();
    if (selected) select(selected); else drawDetail();

    return (o) => {
      if (o.filter) { filter = o.filter; drawFolders(); }
      if (o.slug) { if (o.slug && !C.clients.find((c) => c.slug === o.slug && (filter === "all" || c.type === filter))) filter = "all"; select(o.slug); }
    };
  }

  function renderTemplates(body) {
    const w = W.templates;
    body.innerHTML =
      `<div class="strip" tabindex="0" aria-label="Template covers">${w.pictures.map((p, i) => pic(p, "", `Template cover ${i + 1}`)).join("")}</div>` +
      statsHTML(w.stats) +
      `<p>${esc(w.text)}</p>` +
      `<p class="kicker" style="margin-top:16px">new this year</p><ul class="list">${w.newThisYear.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    wirePics(body);
    countUp(body);
  }

  function renderCommunity(body) {
    const w = W.community;
    body.innerHTML = pic(w.picture, "hero-pic", "A live community session") + statsHTML(w.stats) + `<p>${esc(w.text)}</p>`;
    wirePics(body);
    countUp(body);
  }

  function renderSkills(body) {
    const w = W.skills;
    const first = !state.skills && !reduced;
    body.innerHTML =
      `<p class="kicker">$ brew list --learned</p>` +
      `<div class="pkgs">${w.packages.map((p) => `<div class="pkg${first ? "" : " done"}"><div class="row"><span>${esc(p)}</span><span class="chk">${icon("check", 14)}</span></div><span class="bar"></span></div>`).join("")}</div>` +
      `<table class="cmp"><thead><tr><th>a year ago</th><th>today</th></tr></thead><tbody>` +
      w.compare.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join("") +
      `</tbody></table>`;
    if (first) {
      body.querySelectorAll(".pkg").forEach((el, i) => {
        const bar = $(".bar", el);
        setTimeout(() => {
          bar.animate([{ width: "0%" }, { width: "100%" }], { duration: 420, easing: "ease-out", fill: "forwards" })
            .onfinish = () => { el.classList.add("done"); sound.tick(); };
        }, 150 + i * 110);
      });
    }
    state.skills = true; save();
  }

  function renderLessons(body) {
    const w = W.lessons;
    body.innerHTML =
      `<p class="kicker">$ cat lessons.txt</p><div class="flips">` +
      w.cards.map((c, i) =>
        `<button type="button" class="flip" aria-pressed="false" aria-label="Lesson ${i + 1}: ${esc(c.front)}. Flip for context.">` +
        `<span class="flip-inner"><span class="face front"><span class="n">0${i + 1}</span><p>${esc(c.front)}</p><span class="hint">click to flip</span></span>` +
        `<span class="face back" aria-hidden="true"><span class="n">0${i + 1} / context</span><p>${esc(c.back)}</p><span class="hint">click to flip back</span></span></span></button>`
      ).join("") + `</div>`;
    body.querySelectorAll(".flip").forEach((b, i) => b.addEventListener("click", () => {
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      $(".back", b).setAttribute("aria-hidden", String(!on));
      $(".front", b).setAttribute("aria-hidden", String(on));
      b.setAttribute("aria-label", on ? `Lesson ${i + 1} context: ${w.cards[i].back}` : `Lesson ${i + 1}: ${w.cards[i].front}. Flip for context.`);
      sound.blip(on ? 520 : 460);
    }));
  }

  function renderApps(body) {
    const w = W.apps;
    body.innerHTML =
      `<p class="kicker">$ ls ~/apps · ${esc(w.kicker)}</p><div class="apps">` +
      w.list.map((a) =>
        `<article class="app">` +
        `<header class="app-head">${pic(a.iconImage, "app-icon", a.name + " app icon")}` +
        `<div><h3>${esc(a.name)}</h3><span class="tag">${esc(a.tag)}</span></div></header>` +
        (a.screenshot ? `<img class="app-shot" src="${esc(a.screenshot)}" alt="${esc(a.name)} screenshot" loading="lazy">` : "") +
        `<p class="app-tagline">${esc(a.tagline)}</p>` +
        `<div class="langs">${a.platforms.map((x) => `<span class="chip">${esc(x)}</span>`).join("")}</div>` +
        `<ul class="list">${a.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` +
        (a.link ? `<a class="btn ghost app-link" href="${esc(a.link.href)}" target="_blank" rel="noopener">${icon("external-link", 14)}${esc(a.link.label)}</a>` : "") +
        `</article>`
      ).join("") + `</div>`;
    wirePics(body, () => icon("app-window", 28));
    // screenshots are optional: hide them quietly until the files exist
    body.querySelectorAll(".app-shot").forEach((img) => {
      const hide = () => img.remove();
      if (img.complete && img.naturalWidth === 0) hide(); else img.addEventListener("error", hide, { once: true });
    });
  }

  function shareHTML() {
    const line = C.share.replace("{n}", state.ach.size);
    return `<div class="share"><p class="kicker">share your run</p><div class="share-line">` +
      `<input type="text" readonly value="${esc(line)}" aria-label="Share line">` +
      `<button type="button" class="btn ghost copy-btn">${icon("copy", 14)}<span>Copy</span></button></div></div>`;
  }
  function wireShare(scope) {
    scope.querySelectorAll(".copy-btn").forEach((b) => b.addEventListener("click", async () => {
      const input = b.parentElement.querySelector("input");
      let ok = false;
      try { await navigator.clipboard.writeText(input.value); ok = true; }
      catch (e) {
        input.focus(); input.select();
        try { ok = document.execCommand("copy"); } catch (e2) { ok = false; }
      }
      $("span", b).textContent = ok ? "Copied" : "Press ⌘C";
      setTimeout(() => { $("span", b).textContent = "Copy"; }, 1800);
    }));
  }

  function renderAchievements(body) {
    body.innerHTML =
      `<p class="kicker">${state.ach.size}/${C.achievements.length} unlocked</p><div class="ach">` +
      C.achievements.map((a) => {
        const got = state.ach.has(a.id);
        return `<div class="ach-item${got ? " got" : ""}"><span class="ai">${icon(got ? a.icon : "lock", 18)}</span>` +
          `<span><strong>${esc(a.title)}</strong><small>${esc(a.desc)}</small></span><span class="state">${got ? "earned" : "locked"}</span></div>`;
      }).join("") + `</div>` +
      (state.ach.has("year-complete") ? shareHTML() : "");
    wireShare(body);
  }

  function renderFinaleCard(body) {
    const w = W.birthday;
    body.innerHTML =
      `<div class="finale-card"><p class="kicker">$ next</p><p class="q">${esc(w.question)}</p>` +
      `<a class="btn" href="${esc(w.cta.href)}" target="_blank" rel="noopener">${esc(w.cta.label)}</a></div>` + shareHTML();
    wireShare(body);
  }

  /* ---------- terminal ---------- */
  const out = $("#termOut"), input = $("#termInput"), body = $("#termBody"), ghost = $("#termGhost");
  $("#termTitle").textContent = `${C.site.prompt}: ${C.site.cwd}`;
  const promptHTML = `${esc(C.site.prompt)}:<span class="path">${esc(C.site.cwd)}</span>$`;
  $("#termPrompt").innerHTML = promptHTML;

  function print(html, cls) {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    body.scrollTop = body.scrollHeight;
    return d;
  }
  const printText = (t, cls) => print(esc(t), cls);
  function echo(cmd) { print(`<span class="p">${promptHTML}</span> ${esc(cmd)}`, "cmdline"); }
  const link = (label) => `<a href="${esc(C.site.url)}" target="_blank" rel="noopener">${esc(label || C.site.urlLabel)}</a>`;

  const history = store.get("history", []);
  let hIdx = history.length;

  const clientSlugs = C.clients.map((c) => c.slug);
  const COMPLETIONS = [
    "help", "whoami", "git diff 2025..2026", "ls clients", "ls clients --builds", "ls clients --consultations",
    "open templates", "open community", "open apps", "brew list --learned", "cat lessons.txt", "stats", "achievements",
    "date", "hire imene", "sudo make me a system", "coffee", "ls -a", "clear", "exit",
    ...clientSlugs.map((s) => "cd clients/" + s),
  ];

  const HELP = [
    ["help", "this list"],
    ["whoami", "who runs this machine"],
    ["git diff 2025..2026", "what changed this year"],
    ["ls clients", "28 major clients, add --builds or --consultations"],
    ["cd clients/<industry>", "open one case card (tab completes)"],
    ["open templates", "the template shelf"],
    ["open community", "teaching an Arabic-speaking community"],
    ["brew list --learned", "skills installed this year"],
    ["cat lessons.txt", "four lessons"],
    ["open apps", "two apps I vibecoded and shipped"],
    ["stats", "headline numbers"],
    ["achievements", "the trophy shelf"],
    ["date", "locked until you explore"],
    ["hire imene", "the shortest path to a call"],
    ["sudo make me a system", "try it"],
    ["coffee", "essential infrastructure"],
    ["ls -a", "show everything, even the hidden stuff"],
    ["clear / exit", "housekeeping"],
  ];

  function openFromTerminal(id, extra) {
    const w = W[id];
    printText(w.summary, "dim");
    openWindow(id, Object.assign({ via: "type", opener: input }, extra || {}));
  }

  function run(raw) {
    const cmd = raw.trim().replace(/\s+/g, " ");
    echo(raw);
    if (!cmd) return;
    history.push(cmd); if (history.length > 50) history.shift();
    store.set("history", history); hIdx = history.length;
    earn("first-command");
    const c = cmd.toLowerCase();

    if (c === "help") {
      print(`<table>${HELP.map(([a, b]) => `<tr><td class="help-cmd">${esc(a)}</td><td>${esc(b)}</td></tr>`).join("")}</table>`);
      return;
    }
    if (c === "whoami") return openFromTerminal("whoami");
    if (c === "git diff 2025..2026" || c === "git diff") return openFromTerminal("shift");
    if (c === "ls clients" || c === "cd clients" || c === "open clients") return openFromTerminal("clients");
    if (c === "ls clients --builds") return openFromTerminal("clients", { filter: "build" });
    if (c === "ls clients --consultations") return openFromTerminal("clients", { filter: "consult" });
    if (c.startsWith("cd clients/")) {
      const slug = c.slice(11).replace(/\/$/, "");
      const cl = C.clients.find((x) => x.slug === slug);
      if (!cl) { printText(`cd: no such folder: clients/${slug}. press tab after "cd clients/" to see them`, "dim"); return; }
      printText(`${cl.industry} · ${cl.tag}`, "dim");
      openWindow("clients", { via: "type", opener: input, slug });
      return;
    }
    if (c === "open templates") return openFromTerminal("templates");
    if (c === "open community") return openFromTerminal("community");
    if (c === "brew list --learned" || c === "brew list") return openFromTerminal("skills");
    if (c === "cat lessons.txt") return openFromTerminal("lessons");
    if (c === "open apps" || c === "ls apps" || c === "cd apps" || c === "ls ~/apps") return openFromTerminal("apps");
    if (c.startsWith("open ")) {
      const key = c.slice(5);
      const id = WIN_IDS.find((k) => W[k].label === key || k === key);
      if (id && id !== "birthday") return openFromTerminal(id);
    }
    if (c === "stats") {
      print(`<table>${C.stats.map(([k, v]) => `<tr><td>${esc(k)}</td><td class="acc">${esc(v)}</td></tr>`).join("")}</table>`);
      return;
    }
    if (c === "achievements") { printText(`${state.ach.size}/${C.achievements.length} achievements unlocked`, "dim"); openWindow("achievements", { via: "type", opener: input }); return; }
    if (c === "date") {
      if (!unlocked()) { printText(W.birthday.lockedCommand, "dim"); printText(W.birthday.lockedLine.replace("{n}", unlockRemaining()), "dim"); return; }
      tryFinale({ via: "type" }); return;
    }
    if (c === "hire imene") {
      printText(C.replies.hire[0], "dim");
      setTimeout(() => print(`→ ${link()}`), reduced ? 0 : 700);
      return;
    }
    if (c === "sudo make me a system") { print(esc(C.replies.sudo).replace(esc(C.site.urlLabel), link()), "ok"); return; }
    if (c === "coffee") { printText(C.replies.coffee); return; }
    if (c === "ls" || c === "ls -a" || c === "ls -la" || c === "ls -al") {
      const files = ["whoami", "the-shift", "clients/", "templates/", "community/", "skills", "lessons.txt", "apps/", unlocked() ? "birthday" : "birthday (locked)"];
      if (c !== "ls") files.unshift(".easter-egg");
      print(files.map((f) => f.startsWith(".") ? `<span class="acc">${esc(f)}</span>` : esc(f)).join("   "));
      return;
    }
    if (c === "cat .easter-egg") { printText(C.replies.easterEgg, "ok"); earn("easter-egg"); return; }
    if (c === "pwd") { printText(C.site.cwd); return; }
    if (c === "clear") { out.innerHTML = ""; return; }
    if (c === "exit" || c === "logout") { printText(C.replies.exit, "dim"); closeAll(); return; }
    printText(C.replies.notFound.replace("{input}", cmd), "dim");
  }

  function matches(v) {
    if (!v) return [];
    const lv = v.toLowerCase();
    return COMPLETIONS.filter((x) => x.startsWith(lv) && x !== lv);
  }
  function updateGhost() {
    const v = input.value;
    const m = matches(v);
    ghost.innerHTML = m.length && input.selectionStart === v.length ? `<span class="hide">${esc(v)}</span>${esc(m[0].slice(v.length))}` : "";
    ghost.style.transform = `translateX(${-input.scrollLeft}px)`;
  }

  $("#termForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (finaleTyping) return;
    const v = input.value;
    input.value = ""; updateGhost();
    run(v);
  });
  input.addEventListener("input", () => { updateGhost(); sound.tick(); });
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      if (!history.length) return;
      e.preventDefault(); hIdx = Math.max(0, hIdx - 1); input.value = history[hIdx] || ""; updateGhost();
    } else if (e.key === "ArrowDown") {
      e.preventDefault(); hIdx = Math.min(history.length, hIdx + 1); input.value = history[hIdx] || ""; updateGhost();
    } else if (e.key === "Tab") {
      const v = input.value;
      const m = matches(v);
      if (!v || !m.length) return; // let Tab move focus normally
      e.preventDefault();
      if (m.length === 1) { input.value = m[0]; }
      else {
        let p = m[0];
        for (const x of m) while (!x.startsWith(p)) p = p.slice(0, -1);
        if (p.length > v.length) input.value = p;
        else {
          echo(v);
          const shown = m.map((x) => x.startsWith("cd clients/") ? x.slice(11) : x);
          printText(shown.join("   "), "dim");
        }
      }
      updateGhost();
    } else if (e.key === "ArrowRight" && input.selectionStart === input.value.length) {
      const m = matches(input.value);
      if (m.length) { e.preventDefault(); input.value = m[0]; updateGhost(); }
    }
  });
  input.addEventListener("scroll", updateGhost);
  body.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    if (String(window.getSelection && window.getSelection()).length) return;
    input.focus({ preventScroll: true });
  });

  /* ---------- idle hint ---------- */
  let idleTimer = 0;
  function nextSuggestion() {
    const id = OTHERS.find((x) => !state.visited.has(x));
    if (id) return W[id].command;
    if (unlocked() && !state.visited.has("birthday")) return "date";
    if (!state.ach.has("easter-egg")) return "ls -a";
    if (state.cards.size < 10) return "cd clients/" + (C.clients.find((c) => !state.cards.has(c.slug)) || C.clients[0]).slug;
    return "coffee";
  }
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (finaleActive || !booted || OG) return;
      printText(C.replies.hint.replace("{cmd}", nextSuggestion()), "dim");
    }, 20000);
  }
  ["keydown", "pointerdown", "wheel", "touchstart"].forEach((ev) => document.addEventListener(ev, resetIdle, { passive: true }));

  /* ---------- birthday finale ---------- */
  let finaleActive = false, finaleTyping = false;

  function tryFinale(opts) {
    if (!unlocked()) {
      const b = document.querySelector('.icon[data-win="birthday"]');
      if (b) { b.classList.remove("shake"); void b.offsetWidth; b.classList.add("shake"); }
      printText(W.birthday.lockedLine.replace("{n}", unlockRemaining()), "dim");
      sound.blip(220);
      return;
    }
    if (opts && opts.via === "type") earn("power-user");
    runFinale();
  }

  async function runFinale() {
    if (finaleActive) return;
    finaleActive = true; finaleTyping = true;
    closeAll();
    const term = $("#terminal");
    term.classList.add("takeover");
    document.body.classList.add("finale");
    $("#termRestore").hidden = false;
    out.innerHTML = "";
    input.blur();

    for (const step of W.birthday.script) {
      if (!finaleActive) return;
      if (step.cmd) {
        const line = print(`<span class="p">${promptHTML}</span> <span class="typed"></span><span class="term-caret"></span>`, "cmdline");
        const t = $(".typed", line);
        if (reduced) t.textContent = step.cmd;
        else for (const ch of step.cmd) { t.textContent += ch; sound.tick(); await sleep(38 + Math.random() * 40); }
        $(".term-caret", line).remove();
        await sleep(reduced ? 0 : 380);
      } else {
        print(esc(step.out), step.accent ? "acc" : "dim");
        await sleep(reduced ? 0 : 520);
      }
    }
    finaleTyping = false;
    markVisited("birthday");
    earn("year-complete");
    confetti();
    await sleep(reduced ? 0 : 1600);
    if (!finaleActive) return;
    openWindow("finale", { via: "type", opener: input });
  }

  function endFinale() {
    if (!finaleActive) return;
    finaleActive = false; finaleTyping = false;
    const f = open.get("finale");
    if (f) { open.delete("finale"); f.el.remove(); }
    $("#terminal").classList.remove("takeover");
    document.body.classList.remove("finale");
    $("#termRestore").hidden = true;
    print(`<span class="dim">session resumed. the year is yours to explore again. type "achievements" to see your run.</span>`);
    input.focus({ preventScroll: true });
  }
  $("#termRestore").addEventListener("click", endFinale);

  function confetti() {
    if (reduced) return;
    const chars = ["{", "}", "[", "]", "✓", "*", "#"];
    const colors = ["#D97757", "#F2C48D", "#E8A08A", "#9CC49A", "#9DB4D0"];
    const box = $("#confetti");
    const n = isMobile() ? 60 : 120;
    for (let i = 0; i < n; i++) {
      const s = document.createElement("span");
      s.textContent = chars[i % chars.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.color = colors[Math.floor(Math.random() * colors.length)];
      s.style.fontSize = 14 + Math.random() * 18 + "px";
      box.appendChild(s);
      const drift = (Math.random() - 0.5) * 240;
      const rot = (Math.random() - 0.5) * 720;
      const delay = Math.random() * 500;
      s.animate(
        [
          { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
          { transform: `translate(${drift}px, ${window.innerHeight + 60}px) rotate(${rot}deg)`, opacity: 0.9 },
        ],
        { duration: 2000 + Math.random() * 500 - delay * 0.4, delay, easing: "cubic-bezier(.25,.6,.4,1)", fill: "forwards" }
      ).onfinish = () => s.remove();
    }
  }

  /* ---------- boot ---------- */
  let booted = false;

  function welcome() {
    out.innerHTML = "";
    print(`<span class="dim">imene.os v2026 · last login: ${esc(new Date().toDateString().toLowerCase())}</span>`);
    printText("my year, Sep 2025 to Sep 2026, as a tiny operating system.");
    print(`<span class="dim">${esc(C.site.terminalHint)}</span>`);
  }

  function finishBoot(bootEl) {
    if (booted) return;
    booted = true;
    store.set("booted", true);
    if (bootEl) {
      bootEl.classList.add("fade");
      setTimeout(() => { bootEl.hidden = true; bootEl.classList.remove("fade"); }, reduced ? 0 : 500);
    }
    welcome();
    const h = new Date().getHours();
    if (h >= 0 && h < 5) setTimeout(() => earn("night-owl"), 900);
    if (!isMobile() && !OG) input.focus({ preventScroll: true });
    resetIdle();
  }

  async function boot(force) {
    const el = $("#boot");
    if (OG || (!force && store.get("booted", false))) { finishBoot(null); return; }
    booted = false;
    el.hidden = false;
    const text = $("#bootText");
    text.innerHTML = "";
    const skip = $("#bootSkip");
    let skipped = false;
    const doSkip = () => { skipped = true; finishBoot(el); };
    skip.onclick = doSkip;
    skip.focus({ preventScroll: true });

    const lines = C.boot;
    const render = (arr, cur) => {
      text.innerHTML = arr.map((l) => l.startsWith("✓") ? `<span class="ok">✓</span>${esc(l.slice(1))}` : esc(l)).join("\n") + (cur ? '<span class="cur"></span>' : "");
    };
    if (reduced) { render(lines, false); await sleep(1400); if (!skipped) finishBoot(el); return; }

    const done = [];
    for (let li = 0; li < lines.length; li++) {
      const l = lines[li];
      let s = "";
      for (const ch of l) {
        if (skipped) return;
        s += ch; render([...done, s], true);
        await sleep(li === 0 ? 55 : 32);
      }
      done.push(l);
      await sleep(li === 0 ? 500 : 380);
    }
    await sleep(700);
    if (!skipped) finishBoot(el);
  }

  /* ---------- dock: restart tour ---------- */
  $("#restartBtn").innerHTML = icon("rotate-ccw", 16) + "<span>Restart tour</span>";
  $("#restartBtn").setAttribute("aria-label", "Restart the tour");
  $("#restartBtn").addEventListener("click", () => {
    if (finaleActive) endFinale();
    closeAll();
    store.clear();
    loadState();
    renderIcons(); renderProgress(); renderTrophy();
    boot(true);
  });

  /* ---------- init ---------- */
  applyTheme(store.get("theme", null));
  sound.init();
  renderIcons();
  renderProgress();
  renderTrophy();
  boot(false);
})();
