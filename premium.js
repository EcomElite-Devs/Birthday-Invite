(() => {
  /* ===== EASY SETTINGS ===== */
  const C = {
    dir: "assets/",        // folder holding your media
    photos: 19,            // pic1.jpeg ... pic19.jpeg
    ext: "jpeg",
    video: "video1.mp4",   // change extension if needed, or "" to skip
    videoAt: 4,            // position of the video inside the gallery
    music: "",             // e.g. "assets/song.mp3" (leave "" to hide the music button)
    eventISO: "2026-10-12T19:00:00+05:30", // event start (IST); drives both countdowns
    delay: 3500            // ms each slide stays on screen
  };
  const caps = ["First little adventures", "All the smiles", "Giggles & games", "Growing up fast", "Sweet little moments", "Pure joy", "Family love", "Our little star"];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const items = [];
  for (let i = 1; i <= C.photos; i++) items.push({ t: "image", s: `${C.dir}pic${i}.${C.ext}`, c: caps[(i - 1) % caps.length] });
  if (C.video) items.splice(Math.min(C.videoAt, items.length), 0, { t: "video", s: C.dir + C.video, c: "Playtime moments" });
  const N = items.length;

  const media = (it, lazy = true) => {
    if (it.t === "video") {
      const v = document.createElement("video");
      v.src = it.s; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "metadata";
      return v;
    }
    const im = new Image();
    im.src = it.s; im.alt = it.c; if (lazy) im.loading = "lazy";
    im.onerror = () => im.closest(".slide,.grid-item")?.remove();
    return im;
  };

  /* ===== Lightbox with prev/next ===== */
  const lb = $("#mediaLightbox"), lbBox = $("#lightboxContainer");
  let lbi = 0;
  ["prev", "next"].forEach((d, k) => {
    const b = document.createElement("button");
    b.className = `lb-nav lb-${d}`; b.textContent = k ? "›" : "‹"; b.setAttribute("aria-label", d);
    b.onclick = (e) => { e.stopPropagation(); showLB(lbi + (k ? 1 : -1)); };
    lb.appendChild(b);
  });
  function showLB(i) {
    lbi = (i + N) % N;
    const it = items[lbi];
    lbBox.innerHTML = "";
    const el = document.createElement(it.t === "video" ? "video" : "img");
    el.src = it.s;
    if (it.t === "video") { el.controls = true; el.autoplay = true; el.playsInline = true; }
    lbBox.appendChild(el);
    lb.classList.add("active");
  }
  const closeLB = () => { lb.classList.remove("active"); lbBox.innerHTML = ""; };
  $("#lightboxClose").onclick = closeLB;
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLB();
    if (lb.classList.contains("active")) {
      if (e.key === "ArrowRight") showLB(lbi + 1);
      if (e.key === "ArrowLeft") showLB(lbi - 1);
    }
  });

  /* ===== Auto carousel ===== */
  const car = $("#carousel"), bar = $("#cBar");
  const slides = items.map((it, i) => {
    const s = document.createElement("div");
    s.className = "slide" + (it.t === "video" ? " vid" : "");
    s.appendChild(media(it, i > 3));
    s.onclick = () => (s.classList.contains("on") ? showLB(i) : go(i));
    car.appendChild(s);
    return s;
  });
  let cur = 0, timer, hover = false;
  function layout() {
    const half = Math.floor(N / 2);
    slides.forEach((s, i) => {
      const o = ((i - cur + N + half) % N) - half, a = Math.abs(o);
      s.style.transform = `translateX(calc(-50% + ${o * 58}%)) scale(${1 - Math.min(a, 3) * 0.12})`;
      s.style.opacity = a > 2 ? 0 : 1 - a * 0.35;
      s.style.zIndex = 10 - a;
      s.style.pointerEvents = a > 2 ? "none" : "auto";
      s.classList.toggle("on", o === 0);
      const v = $("video", s);
      if (v) o === 0 ? v.play().catch(() => {}) : v.pause();
    });
    $("#cCap").textContent = items[cur].c;
    $("#cCount").textContent = `${cur + 1} / ${N}`;
    arm();
  }
  function arm() {
    clearTimeout(timer);
    const d = items[cur].t === "video" ? 8000 : C.delay;
    bar.classList.remove("run"); void bar.offsetWidth;
    bar.style.animationDuration = d + "ms";
    if (hover || lb.classList.contains("active") || reduce) return;
    bar.classList.add("run");
    timer = setTimeout(() => go(cur + 1), d);
  }
  function go(i) { cur = (i + N) % N; layout(); }
  $(".c-nav.prev").onclick = () => go(cur - 1);
  $(".c-nav.next").onclick = () => go(cur + 1);
  car.addEventListener("mouseenter", () => { hover = true; arm(); });
  car.addEventListener("mouseleave", () => { hover = false; arm(); });
  let sx = 0;
  car.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; hover = true; }, { passive: true });
  car.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    hover = false;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1)); else arm();
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? clearTimeout(timer) : arm()));
  layout();

  /* ===== Masonry grid + filter tabs ===== */
  const grid = $("#masonryGrid");
  items.forEach((it, i) => {
    const a = document.createElement("article");
    a.className = `grid-item ${it.t === "video" ? "video vid" : "photo"}`;
    a.appendChild(media(it));
    a.insertAdjacentHTML("beforeend", `<div class="item-overlay"><span>${it.c}</span></div>`);
    a.onclick = () => showLB(i);
    grid.appendChild(a);
  });
  $$(".tab-btn").forEach((t) => t.addEventListener("click", () => {
    $$(".tab-btn").forEach((x) => x.classList.toggle("active", x === t));
    const f = t.dataset.filter;
    $$(".grid-item", grid).forEach((g) => g.classList.toggle("hide", f !== "all" && !g.classList.contains(f.slice(0, -1))));
  }));

  /* ===== Scroll reveal, progress bar, parallax ===== */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  const reveal = (sel) => $$(sel).forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${(i % 4) * 90}ms`;
    io.observe(el);
  });
  reveal(".section-heading,.invite-art,.detail,.carousel,.c-meta,.timeline-item,.quiz-card,.game-card,.rsvp-form,.map-card,.gallery-tabs,.footer p");
  const obsGrid = new MutationObserver(() => {});
  $$(".grid-item").forEach((g, i) => { g.classList.add("reveal"); g.style.transitionDelay = `${(i % 3) * 90}ms`; io.observe(g); });

  const prog = $("#progress"), floats = $$(".floaty");
  addEventListener("scroll", () => {
    const h = document.documentElement;
    prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + "%";
    if (!reduce && scrollY < 900) floats.forEach((f, i) => (f.style.translate = `0 ${scrollY * (0.08 + i * 0.04)}px`));
  }, { passive: true });

  /* Tilt on invitation card */
  const art = $(".invite-art");
  if (art && matchMedia("(hover:hover)").matches) {
    art.addEventListener("mousemove", (e) => {
      const r = art.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      art.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    });
    art.addEventListener("mouseleave", () => (art.style.transform = ""));
  }

  /* ===== Countdown (in-page + sticky) ===== */
  if (C.eventISO) {
    const box = document.createElement("div");
    box.className = "countdown";
    $(".event-details").prepend(box);
    const bar = document.createElement("div");
    bar.id = "sticky";
    bar.innerHTML = '<span class="st-l">Party starts in</span><b id="stT"></b><a class="st-b" href="#rsvp">RSVP</a>';
    document.body.append(bar);
    document.body.classList.add("has-sticky");
    const z = (n) => String(n).padStart(2, "0");
    const tick = () => {
      let ms = new Date(C.eventISO) - Date.now();
      if (ms <= 0) { box.innerHTML = "<div><b>🎉</b><small>Party time!</small></div>"; $("#stT").textContent = "It's party time! 🎉"; $(".st-l").hidden = true; return; }
      const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
      box.innerHTML = [["Days", d], ["Hours", h], ["Mins", m], ["Secs", s]].map(([l, v]) => `<div><b>${z(v)}</b><small>${l}</small></div>`).join("");
      $("#stT").textContent = `${d}d ${z(h)}h ${z(m)}m ${z(s)}s`;
    };
    tick(); setInterval(tick, 1000);
  }

  /* ===== Add to calendar (.ics) ===== */
  $("#addCal")?.addEventListener("click", () => {
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Birthday Invite//EN", "BEGIN:VEVENT", "UID:bday-2026-10-12@invite", "DTSTAMP:20261001T000000Z",
      "DTSTART:20261012T133000Z", "DTEND:20261012T163000Z", "SUMMARY:Birthday Celebration", "LOCATION:Mayur Banquet\, Mithapur Service Lane\, Mumbai Expressway",
      "DESCRIPTION:You are invited!", "BEGIN:VALARM", "TRIGGER:-PT3H", "ACTION:DISPLAY", "DESCRIPTION:Birthday celebration today", "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "birthday-invite.ics";
    a.click();
  });
  $(".hero-photo-wrap")?.addEventListener("click", (e) => burst(e.clientX, e.clientY, 70));

  /* ===== Confetti bursts ===== */
  const cv = document.createElement("canvas");
  cv.id = "fx"; document.body.appendChild(cv);
  const cx = cv.getContext("2d"); let parts = [], raf;
  const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
  fit(); addEventListener("resize", fit);
  const cols = ["#e8a9b2", "#ead17f", "#b6c7e0", "#c8b9d9", "#efb6a4", "#d9a94c"];
  function burst(x, y, n = 60) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, v = 3 + Math.random() * 7;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, r: 3 + Math.random() * 4, c: cols[i % cols.length], life: 90 + Math.random() * 40, rot: Math.random() * 6 });
    }
    if (!raf) raf = requestAnimationFrame(draw);
  }
  window.__burst = burst;
  function draw() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter((p) => p.life-- > 0);
    parts.forEach((p) => {
      p.vy += 0.25; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += 0.15;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot);
      cx.globalAlpha = Math.min(1, p.life / 30); cx.fillStyle = p.c;
      cx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); cx.restore();
    });
    raf = parts.length ? requestAnimationFrame(draw) : 0;
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest(".button,.quiz-option");
    if (t) burst(e.clientX, e.clientY, t.classList.contains("game-balloon") ? 40 : 30);
  });
  $("#rsvpForm")?.addEventListener("submit", () => burst(innerWidth / 2, innerHeight / 2, 140));
  $("#restartQuiz")?.addEventListener("click", () => burst(innerWidth / 2, innerHeight / 2, 80));

  /* ===== Music ===== */
  const mt = $("#musicToggle");
  if (!C.music) mt.style.display = "none";
  else {
    const au = new Audio(C.music); au.loop = true;
    mt.addEventListener("click", () => (mt.getAttribute("aria-pressed") === "true" ? au.play().catch(() => {}) : au.pause()));
  }

  /* ===== Intro ===== */
  const start = () => setTimeout(() => {
    $("#loader").classList.add("done");
    document.body.classList.add("ready");
    setTimeout(() => burst(innerWidth / 2, innerHeight * 0.35, 90), 500);
  }, 1100);
  document.readyState === "complete" ? start() : addEventListener("load", start);
})();
