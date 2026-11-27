(function () {
  "use strict";
  var M = window.MRM;
  if (!M) return;
  var $ = M.$, $$ = M.$$, esc = M.esc, safeUrl = M.safeUrl, ico = M.ico, sb = M.sb;
  var section = document.body.dataset.section === "video" ? "video" : "dev";

  /* ---------- intro text (editable in admin -> Settings) ---------- */
  function intro(s) {
    var name = (s.owner_name || "MRM").trim();
    var summary = (s[section + "_summary"] || "").trim();
    var skills = String(s[section + "_skills"] || "").split(",").map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 6);
    var exp = String(s.portfolio_experience || "").trim();
    $("#pfName").textContent = name;
    var title = $("#pfTitle");
    title.innerHTML = "PORTFOLIO".split("").map(function (c) { return "<span>" + c + "</span>"; }).join("");
    var skillBox = $("#pfSkills");
    skillBox.innerHTML = skills.map(function () { return "<div></div>"; }).join("");
    if (exp) { $("#pfExpNum").textContent = exp; }
    if (M.vtick) $("#pfName").insertAdjacentHTML("beforeend", M.vtick());
    return { summary: summary, skills: skills, exp: exp };
  }

  function typedSlice(text, p) { return text.slice(0, Math.floor(Math.max(0, Math.min(1, p)) * text.length)); }

  /* Plays by itself like the reference video: title draws in, photo rises, camera pushes in,
     summary types, badge slides in, skills type with a highlight, camera pulls back. */
  function setup(d) {
    var typed = $("#pfTyped"), skillEls = $$("#pfSkills div"), expEl = $("#pfExp");
    var total = d.skills.join("").length;
    var st = { sum: 0, sk: 0 };
    function paint() {
      typed.textContent = typedSlice(d.summary, st.sum);
      var shown = Math.floor(Math.max(0, Math.min(1, st.sk)) * total), used = 0;
      skillEls.forEach(function (el, i) {
        var t = d.skills[i], n = Math.max(0, Math.min(t.length, shown - used));
        el.textContent = t.slice(0, n); used += t.length;
        el.style.visibility = n > 0 ? "visible" : "hidden";
        el.classList.toggle("typing", n > 0 && n < t.length);
      });
    }
    var still = !window.gsap || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      $("#pf").classList.add("is-still");
      st.sum = 1; st.sk = 1; paint();
      if (d.exp) expEl.hidden = false;
      $$("#pfTitle span").forEach(function (sp) { sp.style.backgroundSize = "100% 100%"; });
      return;
    }
    var wide = window.matchMedia("(min-width: 821px)").matches;
    var touch = window.matchMedia("(pointer: coarse)").matches;
    gsap.set("#pfPhoto", { xPercent: -50 });
    gsap.set("#pfTitle span", { backgroundSize: "100% 0%" });
    gsap.set(["#pfInfo", "#pfSkills", ".pf-label"], { opacity: 0 });
    if (d.exp) { expEl.hidden = false; gsap.set(expEl, { opacity: 0, x: 60 }); }
    var tl = gsap.timeline({ defaults: { ease: "power2.out" }, onUpdate: paint });
    tl.from("#pfTitle span", { opacity: 0, y: 40, stagger: 0.12, duration: 0.7 }, 0.2)
      .to("#pfTitle span", { backgroundSize: "100% 100%", stagger: 0.1, duration: 0.9, ease: "power1.inOut" }, 1.0)
      .to(".pf-label", { opacity: 1, duration: 0.8 }, 2.0)
      .from("#pfPhoto", { yPercent: 35, opacity: 0, duration: 1.4, ease: "power3.out" }, 2.0)
      /* camera push-in, name + summary */
      .to("#pfStage", { scale: wide ? 1.3 : 1.15, x: wide ? "16vw" : "8vw", transformOrigin: "50% 70%", duration: 1.6, ease: "power2.inOut" }, 3.6)
      .to("#pfInfo", { opacity: 1, duration: 0.8 }, 4.0)
      .to(st, { sum: 1, duration: 3.2, ease: "none" }, 4.6)
      /* second shot: face on the left, badge and skills on the right */
      .to("#pfInfo", { opacity: wide ? 0.0 : 1, duration: 0.6 }, 8.0)
      .to("#pfStage", { scale: wide ? 1.5 : 1.15, x: wide ? "-18vw" : "8vw", duration: 1.4, ease: "power2.inOut" }, 8.0);
    if (d.exp) tl.to(expEl, { opacity: 1, x: 0, duration: 0.8 }, 9.0);
    tl.to("#pfSkills", { opacity: 1, duration: 0.6 }, 9.2)
      .to(st, { sk: 1, duration: 2.6, ease: "none" }, 9.4)
      /* pull back to the full composition */
      .to("#pfStage", { scale: 1, x: 0, duration: 1.6, ease: "power2.inOut" }, 12.4)
      .to("#pfInfo", { opacity: 1, duration: 0.8 }, 13.0);
    if (touch) tl.timeScale(1.15);
    $("#pf").addEventListener("click", function () { if (tl.progress() < 1) tl.progress(1); });
    paint();
  }

  /* ---------- works board ---------- */
  var KINDS = section === "video"
    ? [["short", "Short videos"], ["long", "Long videos"]]
    : [["app", "Apps"], ["web", "Websites"]];
  var KLABEL = { app: "App", web: "Website", short: "Short", long: "Long video" };
  var RATIO = { app: "r916", short: "r916", web: "r169", long: "r169" };
  var items = [], cur = "all", viewList = [], viewIdx = 0, WA = "";

  function ytId(u) {
    var m = String(u || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{11})/);
    return m ? m[1] : "";
  }
  function thumb(it) {
    var img = safeUrl(it.image_url);
    if (img) return img;
    var y = ytId(it.link_url);
    return y ? "https://i.ytimg.com/vi/" + y + "/hqdefault.jpg" : "";
  }
  function tagsOf(it) {
    return String(it.tags || "").split(",").map(function (t) { return t.trim(); }).filter(Boolean).slice(0, 5);
  }
  function card(it, i) {
    var img = thumb(it), isVid = it.kind === "short" || it.kind === "long";
    var tg = tagsOf(it).map(function (t) { return "<i>" + esc(t) + "</i>"; }).join("");
    return '<button type="button" class="pw-card ' + RATIO[it.kind] + ' reveal" data-i="' + i + '" style="--d:' + Math.min(i, 8) * 60 + 'ms">' +
      '<span class="pw-media">' +
      (img ? '<img src="' + esc(img) + '" alt="' + esc(it.title) + '" loading="lazy">' :
        '<span class="w-ph"><span>' + ico("image") + esc(it.title.slice(0, 40)) + "</span></span>") +
      '<span class="pw-shine"></span></span>' +
      '<span class="pw-badge">' + KLABEL[it.kind] + "</span>" +
      (isVid ? '<span class="pw-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg></span>' : "") +
      '<span class="pw-cap"><b>' + esc(it.title) + "</b>" +
      (it.description ? "<small>" + esc(it.description) + "</small>" : "") +
      (tg ? '<span class="pw-tags">' + tg + "</span>" : "") + "</span></button>";
  }
  function placeholders() {
    var out = "";
    for (var i = 0; i < 4; i++) {
      var k = KINDS[i % 2][0];
      out += '<div class="pw-card ' + RATIO[k] + ' reveal"><span class="pw-media"><span class="w-ph"><span>' + ico("image") + "Project coming soon</span></span></span></div>";
    }
    return out;
  }
  function renderStats() {
    var el = $("#pfStats"); if (!el || !items.length) return;
    var html = '<div><b>' + items.length + '</b><span>Projects</span></div>';
    KINDS.forEach(function (k) {
      var n = items.filter(function (x) { return x.kind === k[0]; }).length;
      if (n) html += "<div><b>" + n + "</b><span>" + k[1] + "</span></div>";
    });
    el.innerHTML = html; el.hidden = false;
  }
  function renderFilter() {
    var el = $("#pfFilter"); if (!el) return;
    var present = KINDS.filter(function (k) { return items.some(function (x) { return x.kind === k[0]; }); });
    if (present.length < 2) { el.hidden = true; return; }
    var html = '<button type="button" role="tab" data-k="all" class="' + (cur === "all" ? "on" : "") + '">All <em>' + items.length + "</em></button>";
    present.forEach(function (k) {
      var n = items.filter(function (x) { return x.kind === k[0]; }).length;
      html += '<button type="button" role="tab" data-k="' + k[0] + '" class="' + (cur === k[0] ? "on" : "") + '">' + k[1] + " <em>" + n + "</em></button>";
    });
    el.innerHTML = html; el.hidden = false;
  }
  function renderBoard() {
    var el = $("#pfBoard"); if (!el) return;
    if (!items.length) { el.className = "pw-grid"; el.innerHTML = placeholders(); M.initReveal(); return; }
    viewList = items.filter(function (x) { return cur === "all" || x.kind === cur; });
    el.className = "pw-grid" + (cur === "all" ? " mixed" : "");
    el.innerHTML = viewList.map(card).join("");
    M.initReveal();
    $$(".pw-card", el).forEach(function (c, i) { setTimeout(function () { c.classList.add("in"); }, 40 + Math.min(i, 10) * 70); });
  }

  /* ---------- viewer ---------- */
  var vw = null;
  function waLink(it) {
    if (!WA) return "";
    var txt = "Hi! I saw your " + (it.title || "project") + " in your portfolio and I want something like this.";
    return "https://wa.me/" + WA + "?text=" + encodeURIComponent(txt);
  }
  function buildViewer() {
    if (vw) return;
    vw = document.createElement("div");
    vw.className = "pw-view"; vw.hidden = true; vw.setAttribute("role", "dialog"); vw.setAttribute("aria-modal", "true");
    vw.innerHTML = '<div class="pw-back"></div><div class="pw-box"><button class="pw-x" type="button" aria-label="Close">&times;</button>' +
      '<button class="pw-nav prev" type="button" aria-label="Previous">&#8249;</button><button class="pw-nav next" type="button" aria-label="Next">&#8250;</button>' +
      '<div class="pw-stage"></div><div class="pw-info"></div></div>';
    document.body.appendChild(vw);
    vw.querySelector(".pw-back").addEventListener("click", closeView);
    vw.querySelector(".pw-x").addEventListener("click", closeView);
    vw.querySelector(".prev").addEventListener("click", function () { step(-1); });
    vw.querySelector(".next").addEventListener("click", function () { step(1); });
    document.addEventListener("keydown", function (e) {
      if (vw.hidden) return;
      if (e.key === "Escape") closeView();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
    });
    var x0 = null;
    vw.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    vw.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
    });
  }
  function showItem() {
    var it = viewList[viewIdx]; if (!it) return;
    var y = ytId(it.link_url), img = thumb(it), link = safeUrl(it.link_url), st = vw.querySelector(".pw-stage");
    st.className = "pw-stage " + RATIO[it.kind];
    if (y) st.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + y + '?rel=0&playsinline=1" title="' + esc(it.title) + '" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    else if (img) st.innerHTML = '<img src="' + esc(img) + '" alt="' + esc(it.title) + '">';
    else st.innerHTML = '<div class="w-ph"><div>' + ico("image") + esc(it.title) + "</div></div>";
    var tg = tagsOf(it).map(function (t) { return "<i>" + esc(t) + "</i>"; }).join("");
    var wl = waLink(it);
    vw.querySelector(".pw-info").innerHTML = '<span class="pw-badge static">' + KLABEL[it.kind] + "</span><h3>" + esc(it.title) + "</h3>" +
      (it.description ? "<p>" + esc(it.description) + "</p>" : "") + (tg ? '<div class="pw-tags">' + tg + "</div>" : "") +
      '<div class="pw-act">' + (link && !y ? '<a class="btn btn-primary" href="' + esc(link) + '" target="_blank" rel="noopener">Open project</a>' : "") +
      (link && y ? '<a class="btn btn-primary" href="' + esc(link) + '" target="_blank" rel="noopener">Watch on YouTube</a>' : "") +
      (wl ? '<a class="btn btn-green" href="' + esc(wl) + '" target="_blank" rel="noopener">Start one like this</a>' : "") + "</div>" +
      '<small class="pw-count">' + (viewIdx + 1) + " / " + viewList.length + "</small>";
    var multi = viewList.length > 1;
    vw.querySelector(".prev").style.display = vw.querySelector(".next").style.display = multi ? "" : "none";
  }
  function openView(i) { buildViewer(); viewIdx = i; showItem(); vw.hidden = false; document.body.classList.add("pw-lock"); vw.querySelector(".pw-x").focus(); }
  function closeView() { if (!vw) return; vw.hidden = true; vw.querySelector(".pw-stage").innerHTML = ""; document.body.classList.remove("pw-lock"); }
  function step(d) { viewIdx = (viewIdx + d + viewList.length) % viewList.length; showItem(); }

  function bind() {
    var b = $("#pfBoard"), f = $("#pfFilter");
    if (b) b.addEventListener("click", function (e) {
      var c = e.target.closest(".pw-card[data-i]"); if (c) openView(parseInt(c.dataset.i, 10));
    });
    if (f) f.addEventListener("click", function (e) {
      var t = e.target.closest("button[data-k]"); if (!t) return;
      cur = t.dataset.k; renderFilter(); renderBoard();
    });
  }
  function loadWork() {
    function fill(list) { items = list; renderStats(); renderFilter(); renderBoard(); }
    bind();
    if (!sb) { fill([]); return; }
    sb.from("portfolio_items").select("*").eq("section", section).order("sort", { ascending: true }).order("created_at", { ascending: false })
      .then(function (r) { fill((r && r.data) || []); }, function () { fill([]); });
  }

  M.getSettings().then(function (s) {
    setup(intro(s));
    WA = String(s[section === "video" ? "edit_whatsapp" : "dev_whatsapp"] || s.edit_whatsapp || "").replace(/[^\d]/g, "");
    var w = $("#ctaWa"), m = $("#ctaMail"), em = String(s.email || "").trim();
    if (w && WA) w.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent("Hi! I saw your portfolio and I want to start a project.");
    else if (w) w.hidden = true;
    if (m && em) m.href = "mailto:" + em; 
  });
  loadWork();
})();
