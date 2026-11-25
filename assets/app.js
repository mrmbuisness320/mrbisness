(function () {
  "use strict";

  /* ---------- setup ---------- */
  var C = window.MRM_CONFIG || { defaults: {} };
  var configured =
    !!C.supabaseUrl && !/^YOUR_/.test(C.supabaseUrl) &&
    !!C.supabaseAnonKey && !/^YOUR_/.test(C.supabaseAnonKey);
  var sb = null;
  if (configured && window.supabase) {
    try { sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey); }
    catch (e) { console.warn("Supabase init failed", e); }
  }

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var safeUrl = function (u) { u = String(u || "").trim(); return /^https?:\/\//i.test(u) ? u : ""; };

  /* ---------- icons ---------- */
  var P = {
    wa: '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.5A8.4 8.4 0 1 1 21 11.5z"/><path d="M9 9.5c.4 2 2.1 3.8 4.5 4.5l1.2-1.2-1.6-1-.8.6c-.7-.3-1.4-1-1.7-1.7l.6-.8-1-1.6z"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    fb: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    telegram: '<path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
    tiktok: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
    film: '<rect x="2" y="2" width="20" height="20" rx="2.2"/><path d="M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    ext: '<path d="M7 17 17 7M8 7h9v9"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    eye: '<path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/>',
    star: '<path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/>',
    phoneapp: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>'
  };
  var ico = function (n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>";
  };
  var STAR_PATH = P.star;
  var starSvg = '<svg viewBox="0 0 24 24" aria-hidden="true">' + STAR_PATH + "</svg>";
  function starsHTML(avg, cls) {
    var v = Number(avg) || 0, pct = Math.max(0, Math.min(100, v / 5 * 100));
    var five = starSvg + starSvg + starSvg + starSvg + starSvg;
    return '<span class="stars ' + (cls || "") + '" role="img" aria-label="' + v + ' out of 5"><span class="base">' + five +
      '</span><span class="fill" style="width:' + pct + '%">' + five + "</span></span>";
  }
  var vtickN = 0;
  function vtick() {
    var id = "vt" + (++vtickN);
    return '<span class="vtick" title="Verified developer" aria-label="Verified"><svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10d9a0"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs>' +
      '<path fill="url(#' + id + ')" d="M12 1.6l2.7 1.9 3.3-.1 1 3.1 2.7 2-1 3.1 1 3.1-2.7 2-1 3.1-3.3-.1L12 22.4l-2.7-1.9-3.3.1-1-3.1-2.7-2 1-3.1-1-3.1 2.7-2 1-3.1 3.3.1z"/>' +
      '<path d="m8 12.3 2.8 2.8L16.4 9.4" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  }
  var logoN = 0;
  var logo = function () {
    var id = "lg" + (++logoN);
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/></linearGradient></defs>' +
      '<rect x="3" y="3" width="58" height="58" rx="16" fill="#0b0716" stroke="url(#' + id + ')" stroke-width="2.5"/>' +
      '<path d="M17 24 9 32l8 8" fill="none" stroke="url(#' + id + ')" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M22 44V21l10 12 10-12v23" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M45 25.5v13l10-6.5z" fill="url(#' + id + ')"/></svg>';
  };

  function getSession() {
    if (!sb) return Promise.resolve(null);
    return sb.auth.getSession().then(function (r) { return (r.data && r.data.session) || null; });
  }

  /* ---------- page labels + live presence (anonymous visitor counter) ---------- */
  var LABELS = { home: "Home", edit: "Video Editing", dev: "App & Web Dev", apps: "Apps", about: "About", terms: "Terms", privacy: "Privacy", login: "Login", feedback: "Feedback" };
  function pageLabel() {
    var b = document.body, p = b.dataset.page;
    if (p === "portfolio") return b.dataset.section === "video" ? "Video Portfolio" : "Dev Portfolio";
    return LABELS[p] || "Site";
  }
  var presence = null;
  function track(extra) {
    if (!presence || !presence.ready) return;
    try { presence.ch.track(Object.assign({ page: pageLabel(), t: Date.now() }, extra || {})); } catch (e) {}
  }
  function initPresence() {
    if (!sb || !sb.channel) return;
    try {
      var key = "v" + Math.random().toString(36).slice(2, 10);
      presence = { ch: sb.channel("site-presence", { config: { presence: { key: key } } }), ready: false };
      presence.ch.subscribe(function (status) {
        if (status === "SUBSCRIBED") { presence.ready = true; track(); }
      });
    } catch (e) { presence = null; }
  }

  /* ---------- shared layout: curved glass sidebar + footer ---------- */
  var SIDE_PATH = "M0.10,0 L0.90,0 Q0.985,0.02 0.965,0.10 Q0.940,0.50 0.965,0.90 Q0.985,0.98 0.90,1 L0.10,1 Q0.015,0.98 0.035,0.90 Q0.060,0.50 0.035,0.10 Q0.015,0.02 0.10,0 Z";
  var NAV = [
    { t: "Home", h: "index.html", i: "home" },
    { t: "Video Editing", i: "film", g: [["Portfolio", "portfolio-video.html"], ["Contact & templates", "video-editing.html"]] },
    { t: "App & Web Development", i: "code", g: [["Portfolio", "portfolio-dev.html"], ["Contact", "development.html"]] },
    { t: "Free Apps", h: "apps.html", i: "download" },
    { t: "Feedback", h: "feedback.html", i: "chat" },
    { t: "About", h: "about.html", i: "info" }
  ];

  function buildLayout() {
    var here = (location.pathname.split("/").pop() || "index.html");
    var n = 0;
    function cur(h) { return h === here ? ' aria-current="page"' : ""; }
    var navHtml = NAV.map(function (it) {
      var i = ++n;
      if (!it.g) {
        return '<a class="nav-item stag" style="--i:' + i + '" href="' + it.h + '"' + cur(it.h) + '><span class="nav-ic">' + ico(it.i) + "</span>" + esc(it.t) + "</a>";
      }
      var open = it.g.some(function (x) { return x[1] === here; });
      return '<div class="nav-group stag' + (open ? " open" : "") + '" style="--i:' + i + '"><button class="nav-item" type="button" aria-expanded="' + open + '"><span class="nav-ic">' + ico(it.i) + "</span>" + esc(it.t) +
        '<span class="chev">' + ico("chevron") + '</span></button><div class="nav-sub"><div>' +
        it.g.map(function (x) { return '<a href="' + x[1] + '"' + cur(x[1]) + ">" + esc(x[0]) + "</a>"; }).join("") + "</div></div></div>";
    }).join("");

    var header =
      '<header class="header"><a class="brand" href="index.html" aria-label="MRM home">' + logo() +
      '<span><b>MRM' + vtick() + '</b><small>App · Web · Video</small></span></a>' +
      '<button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="drawer"><span></span><span></span><span></span></button></header>';
    var defs = '<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><clipPath id="sideClip" clipPathUnits="objectBoundingBox"><path d="' + SIDE_PATH + '"/></clipPath></defs></svg>';
    var side =
      '<div class="side-scrim" id="scrim"></div>' +
      '<aside class="side" id="drawer" aria-label="Main menu"><svg class="side-edge" viewBox="0 0 1 1" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sideStroke" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset=".5" stop-color="#c4b5fd" stop-opacity=".22"/><stop offset="1" stop-color="#d946ef" stop-opacity=".65"/></linearGradient></defs><path d="' + SIDE_PATH + '"/></svg>' +
      '<div class="side-in">' +
      '<div class="side-head stag" style="--i:0"><a class="brand" href="index.html">' + logo() + '<span><b>MRM' + vtick() + '</b></span></a><button class="side-close" id="sideClose" type="button" aria-label="Close menu">' + ico("close") + "</button></div>" +
      '<div class="side-profile stag" style="--i:1"><img class="side-avatar" src="assets/me.webp" alt="" loading="lazy"><div><b>MRM<span class="pill-tag">PRO</span></b><small>App · Website · Video</small></div></div>' +
      '<nav class="nav-list">' + navHtml + "</nav>" +
      '<div class="side-card stag" style="--i:' + (n + 1) + '"><small>FREE APPS</small><p>Download my Android apps for free.</p><a class="btn btn-blue" href="apps.html">Browse apps</a></div>' +
      '<div class="side-foot stag" style="--i:' + (n + 2) + '"><a class="nav-item" id="authLink" href="login.html"><span class="nav-ic">' + ico("user") + '</span><span id="authText">Login / Sign up</span></a>' +
      '<button class="nav-item" id="installBtn" type="button" hidden><span class="nav-ic">' + ico("download") + "</span>Install App</button></div>" +
      '<div class="side-legal"><a href="terms.html">Terms</a><a href="privacy.html">Privacy</a></div>' +
      "</div></aside>";
    document.body.insertAdjacentHTML("afterbegin", defs + header + side);

    if (!document.body.hasAttribute("data-nofooter")) {
      var s = C.defaults || {};
      document.body.insertAdjacentHTML("beforeend",
        '<footer class="footer"><div class="container"><div class="foot-grid"><div><a class="brand" href="index.html">' + logo() +
        '<span><b>MRM</b><small>App · Web · Video</small></span></a><p>' + esc(s.tagline || "") + "</p></div>" +
        '<div><h5>Services</h5><ul><li><a href="video-editing.html">Video Editing</a></li><li><a href="development.html">App &amp; Web Development</a></li><li><a href="apps.html">Free Apps</a></li></ul></div>' +
        '<div><h5>Portfolio</h5><ul><li><a href="portfolio-dev.html">App &amp; Web</a></li><li><a href="portfolio-video.html">Video Editing</a></li><li><a href="feedback.html">Feedback</a></li></ul></div>' +
        '<div><h5>Company</h5><ul><li><a href="about.html">About</a></li><li><a href="terms.html">Terms &amp; Conditions</a></li><li><a href="privacy.html">Privacy Policy</a></li><li><a href="login.html">Login / Sign up</a></li></ul></div></div>' +
        '<div class="copy"><span>© ' + new Date().getFullYear() + " MRM. All rights reserved.</span><span>App · Website · Video Editing</span></div></div></footer>");
    }

    var btn = $("#menuBtn"), dr = $("#drawer"), scrim = $("#scrim");
    function toggle(open) {
      var o = typeof open === "boolean" ? open : !dr.classList.contains("open");
      dr.classList.toggle("open", o); scrim.classList.toggle("open", o); btn.classList.toggle("open", o);
      btn.setAttribute("aria-expanded", o);
      document.body.style.overflow = o ? "hidden" : "";
    }
    btn.addEventListener("click", function () { toggle(); });
    scrim.addEventListener("click", function () { toggle(false); });
    $("#sideClose").addEventListener("click", function () { toggle(false); });
    $$(".nav-group > .nav-item", dr).forEach(function (b) {
      b.addEventListener("click", function () {
        var g = b.parentNode, o = !g.classList.contains("open");
        g.classList.toggle("open", o); b.setAttribute("aria-expanded", o);
      });
    });
    $$("a", dr).forEach(function (a) { a.addEventListener("click", function () { toggle(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
  }

  /* ---------- menu: login / logout state ---------- */
  function initSession() {
    var link = $("#authLink");
    if (!sb || !link) return;
    getSession().then(function (s) {
      if (!s) return;
      $("#authText").textContent = "Log out";
      link.querySelector(".nav-ic").innerHTML = ico("logout");
      link.setAttribute("href", "#");
      link.addEventListener("click", function (e) {
        e.preventDefault();
        sb.auth.signOut().then(function () { location.reload(); });
      });
      sb.rpc("is_admin").then(function (a) {
        if (a && a.data === true) {
          link.insertAdjacentHTML("beforebegin", '<a class="nav-item" href="admin.html"><span class="nav-ic">' + ico("shield") + "</span>Admin panel</a>");
        }
      });
    });
  }

  /* ---------- install as app (PWA) ---------- */
  function initInstall() {
    var btn = $("#installBtn");
    if (!btn) return;
    var deferred = null;
    var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    var ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (standalone) return;
    if (ios) btn.hidden = false;
    window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; btn.hidden = false; });
    window.addEventListener("appinstalled", function () { btn.hidden = true; deferred = null; });
    btn.addEventListener("click", function () {
      if (deferred) {
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; btn.hidden = true; });
      } else if (ios) {
        alert('To install: tap the Share button in Safari, then choose "Add to Home Screen".');
      }
    });
  }

  function initReveal() {
    var els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- settings ---------- */
  function getSettings() {
    var s = Object.assign({}, C.defaults || {});
    if (!sb) return Promise.resolve(s);
    return sb.from("site_settings").select("key,value").then(function (r) {
      if (r && r.data) r.data.forEach(function (row) { if (row.value !== null && row.value !== undefined && row.value !== "") s[row.key] = row.value; });
      return s;
    }).catch(function () { return s; });
  }

  var CONTACTS = {
    edit: [
      ["whatsapp", "WhatsApp", "wa"], ["phone", "Call us", "phone"], ["email", "Email", "mail"],
      ["facebook", "Facebook", "fb"], ["tiktok", "TikTok", "tiktok"], ["capcut", "CapCut Templates", "film"], ["telegram", "Telegram Channel", "telegram"]
    ],
    dev: [
      ["whatsapp", "WhatsApp", "wa"], ["phone", "Call us", "phone"], ["email", "Email", "mail"],
      ["telegram", "Telegram Channel", "telegram"], ["facebook", "Facebook", "fb"], ["website", "Website", "globe"]
    ]
  };

  function contactHref(kind, key, val) {
    if (key === "whatsapp") {
      var msg = kind === "edit" ? "Hi MRM, I need a video edit." : "Hi MRM, I have an app/website project.";
      return "https://wa.me/" + val.replace(/\D/g, "") + "?text=" + encodeURIComponent(msg);
    }
    if (key === "phone") return "tel:" + val.replace(/[^\d+]/g, "");
    if (key === "email") return "mailto:" + val;
    return safeUrl(val);
  }

  function renderContacts(kind, s) {
    var box = $("#contacts");
    if (!box) return;
    var html = CONTACTS[kind].map(function (d) {
      var val = String(s[kind + "_" + d[0]] || "").trim();
      if (!val) return "";
      var href = contactHref(kind, d[0], val);
      if (!href) return "";
      var shown = /^https?:/i.test(val) ? val.replace(/^https?:\/\//i, "").replace(/\/$/, "").slice(0, 38) : val;
      var ext = /^https?:/i.test(href) ? ' target="_blank" rel="noopener"' : "";
      return '<a class="contact reveal' + (d[0] === "whatsapp" ? " wa" : "") + '" href="' + esc(href) + '"' + ext + '><span class="ic">' + ico(d[2]) + "</span><div><b>" + d[1] + "</b><span>" + esc(shown) + "</span></div></a>";
    }).join("");
    box.innerHTML = html || '<div class="empty">Contact details will appear here soon.</div>';
    var wa = $("#waMain");
    if (wa && s[kind + "_whatsapp"]) wa.href = contactHref(kind, "whatsapp", s[kind + "_whatsapp"]);
    initReveal();
  }

  /* ---------- home hero animation ---------- */
  function initHero() {
    var hero = $("#hero");
    if (!hero || !window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var touch = window.matchMedia("(pointer: coarse)").matches;
    var st;
    window.addEventListener("scroll", function () {
      hero.classList.add("is-scrolling");
      clearTimeout(st);
      st = setTimeout(function () { hero.classList.remove("is-scrolling"); }, 160);
    }, { passive: true });
    var tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: touch ? true : 0.35 } });
    tl.from(".photo-layer", { scale: 0.82, yPercent: 10, duration: 1, ease: "power2.out" }, 0)
      .from(".hero-title", { scale: 0.78, duration: 1.2, ease: "power2.out" }, 0)
      .from(".fi.L", { xPercent: -280, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out" }, 0.2)
      .from(".fi.R", { xPercent: 280, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out" }, 0.2)
      .to(".scroll-hint", { opacity: 0, duration: 0.3 }, 0)
      .to(".photo-layer", { scale: 1.08, duration: 1.2, ease: "none" }, 1.3)
      .to(".hero-title", { scale: 1.18, yPercent: -8, duration: 1.2, ease: "none" }, 1.3)
      .to(".fi.L", { xPercent: -25, duration: 1.2, ease: "none" }, 1.3)
      .to(".fi.R", { xPercent: 25, duration: 1.2, ease: "none" }, 1.3);
  }

  /* ---------- apps page: cards, downloads, ratings ---------- */
  function initApps() {
    var grid = $("#appsGrid"), search = $("#appSearch");
    var all = [], stats = {}, loggedIn = false, uid = null;

    function card(a) {
      var icon = safeUrl(a.icon_url), st = stats[a.id];
      var init = esc((a.name || "?").trim().charAt(0).toUpperCase());
      var action;
      if (!a.downloadable) action = '<span class="hint">Download coming soon</span>';
      else if (loggedIn) action = '<button class="btn btn-blue block" type="button" data-dl="' + esc(a.id) + '">Download free</button>';
      else action = '<a class="btn btn-primary block" href="login.html?next=apps.html">Login to download</a>';
      var rate = '<button class="rate-line" type="button" data-open="' + esc(a.id) + '">' + starsHTML(st ? st.avg_stars : 0) +
        "<span>" + (st && st.ratings ? Number(st.avg_stars).toFixed(1) + " · " + st.ratings + (st.ratings > 1 ? " ratings" : " rating") : "Be the first to rate") + "</span></button>";
      return '<article class="app-card reveal"><div class="app-top">' +
        (icon ? '<img class="app-icon" src="' + esc(icon) + '" alt="" loading="lazy">' : '<div class="app-icon">' + init + "</div>") +
        "<div><h3>" + esc(a.name) + "</h3><small>" + (a.version ? "Version " + esc(a.version) : "Android app") + "</small></div></div>" +
        "<p>" + esc(a.description || "") + "</p>" + rate + '<div class="app-actions">' + action + "</div></article>";
    }
    function draw() {
      var q = (search.value || "").toLowerCase();
      var list = all.filter(function (a) { return (a.name + " " + (a.description || "")).toLowerCase().indexOf(q) > -1; });
      grid.innerHTML = list.length ? list.map(card).join("") : "";
      $("#appsEmpty").hidden = list.length > 0;
      initReveal();
    }
    function downloadApp(id) {
      return sb.from("app_secrets").select("apk_path,external_url").eq("app_id", id).maybeSingle().then(function (r) {
        if (r.error) throw r.error;
        var s = r.data;
        if (!s) throw new Error("Your session may have expired. Please log in again.");
        var app = all.filter(function (x) { return String(x.id) === String(id); })[0] || {};
        if (s.apk_path) {
          var fname = String(app.name || "app").replace(/[^\w.-]+/g, "_") + ".apk";
          return sb.storage.from(C.apkBucket || "app-apks").createSignedUrl(s.apk_path, 120, { download: fname }).then(function (x) {
            if (x.error) throw x.error;
            location.href = x.data.signedUrl;
          });
        }
        var u = safeUrl(s.external_url);
        if (!u) throw new Error("Download is not available yet.");
        location.href = u;
      });
    }

    /* rating modal */
    var modal = document.createElement("div");
    modal.className = "modal"; modal.id = "appModal"; modal.setAttribute("role", "dialog"); modal.setAttribute("aria-modal", "true");
    modal.innerHTML = '<div class="sheet" id="sheet"></div>';
    document.body.appendChild(modal);
    var sheet = $("#sheet"), current = null, picked = 0, mine = null;

    function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; track(); current = null; }
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && current) closeModal(); });

    function paintPicked() {
      $$(".star-input button", sheet).forEach(function (b) { b.classList.toggle("on", Number(b.dataset.s) <= picked); });
    }
    function renderSheet(reviews) {
      var a = current, st = stats[a.id] || { avg_stars: 0, ratings: 0 };
      var icon = safeUrl(a.icon_url);
      var head = '<div class="sheet-head">' + (icon ? '<img class="app-icon" src="' + esc(icon) + '" alt="">' : '<div class="app-icon">' + esc((a.name || "?").charAt(0).toUpperCase()) + "</div>") +
        "<div><h3>" + esc(a.name) + "</h3>" + starsHTML(st.avg_stars, "lg") + ' <small style="color:var(--muted)">' + (st.ratings ? Number(st.avg_stars).toFixed(1) + " · " + st.ratings : "No ratings yet") + '</small></div><button class="sheet-x" type="button" data-close aria-label="Close">×</button></div>';
      var form;
      if (!loggedIn) form = '<div class="note" style="margin-top:0">Log in with your verified email to rate this app.</div><a class="btn btn-primary block" style="margin-top:14px" href="login.html?next=apps.html">Login to rate</a>';
      else form = '<h3 style="margin:18px 0 0;font-size:1rem">' + (mine ? "Your review" : "Rate this app") + '</h3><div class="star-input" role="radiogroup" aria-label="Your rating">' +
        [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-s="' + n + '" aria-label="' + n + ' star' + (n > 1 ? "s" : "") + '">' + starSvg + "</button>"; }).join("") +
        '</div><textarea class="field" id="rvText" maxlength="500" placeholder="Write a short comment (optional)"></textarea>' +
        '<div class="btn-row" style="margin-top:14px"><button class="btn btn-primary" id="rvSave" type="button">' + (mine ? "Update review" : "Submit review") + "</button>" +
        (mine ? '<button class="mini danger" id="rvDel" type="button">Remove mine</button>' : "") + '</div><div class="msg" id="rvMsg" role="status"></div>';
      var list = reviews.length ? reviews.map(function (r) {
        return '<div class="review"><div class="meta">' + starsHTML(r.stars) + "<span>" + esc(r.author || "User") + (r.user_id === uid ? " (you)" : "") + "</span><span>" + new Date(r.updated_at).toLocaleDateString() + "</span></div>" +
          (r.comment ? "<p>" + esc(r.comment) + "</p>" : "") + "</div>";
      }).join("") : '<p class="hint">No reviews yet.</p>';
      sheet.innerHTML = head + list + form;
      if (loggedIn) {
        picked = mine ? mine.stars : 0;
        if (mine && mine.comment) $("#rvText").value = mine.comment;
        paintPicked();
      }
    }
    function loadReviews() {
      return sb.from("app_ratings").select("*").eq("app_id", current.id).order("updated_at", { ascending: false }).limit(50).then(function (r) {
        var rows = r.data || [];
        mine = rows.filter(function (x) { return x.user_id === uid; })[0] || null;
        renderSheet(rows);
      });
    }
    function refreshStats() {
      return sb.from("app_rating_stats").select("*").then(function (r) {
        stats = {}; ((r && r.data) || []).forEach(function (s) { stats[s.app_id] = s; }); draw();
      });
    }
    function openModal(id) {
      current = all.filter(function (x) { return String(x.id) === String(id); })[0];
      if (!current) return;
      sheet.innerHTML = '<p class="hint">Loading…</p>';
      modal.classList.add("open"); document.body.style.overflow = "hidden";
      track({ app: current.name });
      loadReviews();
    }
    sheet.addEventListener("click", function (e) {
      var msg = $("#rvMsg");
      function show(t, ok) { if (msg) { msg.textContent = t; msg.className = "msg " + (ok ? "ok" : "err"); } }
      if (e.target.closest("[data-close]")) { closeModal(); return; }
      var s = e.target.closest(".star-input button");
      if (s) { picked = Number(s.dataset.s); paintPicked(); return; }
      if (e.target.closest("#rvSave")) {
        if (!picked) { show("Please choose 1 to 5 stars.", false); return; }
        var text = $("#rvText").value.trim() || null;
        var req = mine
          ? sb.from("app_ratings").update({ stars: picked, comment: text }).eq("app_id", current.id).eq("user_id", uid)
          : sb.from("app_ratings").insert({ app_id: current.id, stars: picked, comment: text });
        req.then(function (r) {
          if (r.error) { show("Could not save: " + r.error.message, false); return; }
          return refreshStats().then(loadReviews);
        });
      }
      if (e.target.closest("#rvDel")) {
        sb.from("app_ratings").delete().eq("app_id", current.id).eq("user_id", uid).then(function (r) {
          if (r.error) { show("Could not remove: " + r.error.message, false); return; }
          return refreshStats().then(loadReviews);
        });
      }
    });

    if (!sb) {
      $("#appsEmpty").hidden = false;
      $("#appsEmpty").textContent = configured ? "Could not load apps right now." : "Apps will appear here once the database is connected (see README).";
      return;
    }
    grid.addEventListener("click", function (e) {
      var o = e.target.closest("[data-open]");
      if (o) { openModal(o.dataset.open); return; }
      var b = e.target.closest("[data-dl]");
      if (!b) return;
      var html = b.innerHTML;
      b.disabled = true; b.textContent = "Preparing…";
      downloadApp(b.dataset.dl).catch(function (err) {
        alert("Could not start the download: " + (err.message || err));
      }).then(function () { setTimeout(function () { b.disabled = false; b.innerHTML = html; }, 1500); });
    });
    Promise.all([
      getSession(),
      sb.from("apps").select("*").order("created_at", { ascending: false }),
      sb.from("app_rating_stats").select("*")
    ]).then(function (res) {
      loggedIn = !!res[0]; uid = res[0] ? res[0].user.id : null;
      var r = res[1];
      if (r.error) { $("#appsEmpty").hidden = false; $("#appsEmpty").textContent = "Could not load apps right now."; return; }
      all = r.data || [];
      ((res[2] && res[2].data) || []).forEach(function (s) { stats[s.app_id] = s; });
      if (!all.length) $("#appsEmpty").textContent = "No apps published yet. Check back soon!";
      var note = $("#loginNote");
      if (note) note.hidden = loggedIn;
      draw();
    });
    search.addEventListener("input", draw);
  }

  /* ---------- about ---------- */
  function initAbout(s) {
    var el = $("#aboutText");
    if (el) el.textContent = s.about_text || "";
  }

  /* ---------- feedback ---------- */
  function initFeedback() {
    var wrap = $("#fbWrap");
    if (!sb) { wrap.innerHTML = '<div class="empty">Feedback opens once the database is connected (see README).</div>'; return; }
    getSession().then(function (s) {
      if (!s) {
        wrap.innerHTML = '<div class="note" style="margin-top:0">Please log in with your verified email to send feedback. This keeps spam away.</div>' +
          '<div class="btn-row"><a class="btn btn-primary" href="login.html?next=feedback.html">Login to send feedback</a></div>';
        return;
      }
      var picked = 0;
      wrap.innerHTML = '<form id="fbForm"><label>How do you like the website? (optional)</label><div class="star-input" id="fbStars">' +
        [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-s="' + n + '" aria-label="' + n + ' star' + (n > 1 ? "s" : "") + '">' + starSvg + "</button>"; }).join("") +
        '</div><label for="fbText">Your message</label><textarea class="field" id="fbText" maxlength="1000" required placeholder="Tell me what you like, what is confusing, or what I should add"></textarea>' +
        '<label for="fbImg">Screenshot (optional)</label><input type="file" id="fbImg" accept="image/*">' +
        '<button class="btn btn-primary" type="submit" style="margin-top:18px">Send feedback</button><div class="msg" id="fbMsg" role="status"></div></form>';
      var form = $("#fbForm"), msg = $("#fbMsg"), fbDz = null;
      (function mount(n) { if (window.MRM && MRM.dropzone) fbDz = MRM.dropzone($("#fbImg"), { title: "Screenshot (optional)", hint: "Tap or drop an image, up to 2 MB", maxMB: 2 }); else if (n < 30) setTimeout(function () { mount(n + 1); }, 100); })(0);
      $("#fbStars").addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        picked = picked === Number(b.dataset.s) ? 0 : Number(b.dataset.s);
        $$("#fbStars button").forEach(function (x) { x.classList.toggle("on", Number(x.dataset.s) <= picked); });
      });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var btn = form.querySelector("button[type=submit]");
        btn.disabled = true; msg.className = "msg";
        var file = $("#fbImg").files[0], path = null;
        if (file) {
          var ex = (/\.(png|jpe?g|webp|gif)$/i.exec(file.name) || [".png"])[0].toLowerCase();
          path = s.user.id + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 7) + ex;
          if (fbDz) fbDz.busy();
        }
        Promise.resolve(file ? sb.storage.from("feedback-files").upload(path, file, { contentType: file.type || "image/png" }) : { error: null }).then(function (up) {
          if (up.error) { if (fbDz) fbDz.fail(); return { error: up.error }; }
          if (fbDz) fbDz.done();
          return sb.from("feedback").insert({ site_rating: picked || null, message: $("#fbText").value.trim(), image_path: path });
        }).then(function (r) {
          if (r.error) { msg.textContent = r.error.message; msg.className = "msg err"; btn.disabled = false; return; }
          wrap.innerHTML = '<div class="note" style="margin-top:0">Thank you! Your feedback was sent.</div>';
        });
      });
    });
  }

  /* ---------- login / sign up (flip disc) ---------- */
  function initLogin() {
    var disc = $("#disc"), lform = $("#loginForm"), sform = $("#signupForm"), vform = $("#verifyForm"), msg = $("#loginMsg");
    var sw = $("#authSwitch"), backTitle = $("#backTitle"), backSub = $("#backSub");
    var pendingEmail = "", cooldown = null;
    function verifiedUrl() { return new URL("verified.html", location.href).href; }
    function show(t, ok) { msg.textContent = t; msg.className = "msg auth-msg " + (ok ? "ok" : "err"); }
    function clear() { msg.className = "msg auth-msg"; msg.textContent = ""; }

    function socials(s) {
      var items = [["facebook", "Facebook", "fb"], ["telegram", "Telegram", "telegram"], ["tiktok", "TikTok", "tiktok"], ["capcut", "CapCut", "film"]];
      $("#authRail").innerHTML = items.map(function (d) {
        var u = safeUrl(s["edit_" + d[0]]);
        return u ? '<a href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + d[1] + '" title="' + d[1] + '">' + ico(d[2]) + "</a>" : "";
      }).join("");
    }
    socials(C.defaults || {});
    getSettings().then(socials);

    if (!sb) { show("Backend is not connected yet. Add your Supabase keys in config.js (see README).", false); return; }

    var m = /^[a-z-]+\.html$/.exec(new URLSearchParams(location.search).get("next") || "");
    var next = m ? m[0] : "";
    function goAfter() {
      sb.rpc("is_admin").then(function (r) {
        var admin = !r.error && r.data === true;
        location.replace(next || (admin ? "admin.html" : "apps.html"));
      });
    }

    function setSide(side) {
      clear();
      disc.classList.toggle("flip", side !== "signin");
      if (side === "signin") sw.innerHTML = 'New here? <button type="button" data-go="signup">Create account</button>';
      else if (side === "signup") sw.innerHTML = 'Already have an account? <button type="button" data-go="signin">Sign in</button>';
      else sw.innerHTML = "";
      if (side === "signup") { sform.hidden = false; vform.hidden = true; backTitle.textContent = "Sign Up"; backSub.textContent = "We will email you a link to confirm your address."; }
    }
    sw.addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) setSide(b.dataset.go); });

    function startCooldown() {
      var b = $("#resendBtn"), n = 45;
      b.disabled = true; clearInterval(cooldown);
      cooldown = setInterval(function () {
        n--; b.textContent = n > 0 ? "Resend link (" + n + "s)" : "Resend link";
        if (n <= 0) { clearInterval(cooldown); b.disabled = false; }
      }, 1000);
      b.textContent = "Resend link (" + n + "s)";
    }
    function showVerify(email) {
      pendingEmail = email;
      setSide("verify");
      sform.hidden = true; vform.hidden = false;
      backTitle.textContent = "Check your email";
      backSub.textContent = "";
      $("#verifyNote").textContent = "We sent a confirmation link to " + email + ". Tap it, then come back and sign in. Check spam too.";
      startCooldown();
    }

    getSession().then(function (s) { if (s) goAfter(); });

    $("#forgotBtn").addEventListener("click", function () {
      var em = lform.email.value.trim();
      if (!em) { show("Type your email above first, then tap Forgot password.", false); lform.email.focus(); return; }
      sb.auth.resetPasswordForEmail(em, { redirectTo: new URL("reset.html", location.href).href }).then(function (r) {
        if (r.error) show(r.error.message, false); else show("If that email has an account, a reset link is on its way.", true);
      });
    });
    lform.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = lform.querySelector("button[type=submit]");
      var email = lform.email.value.trim(), pw = lform.password.value;
      clear(); btn.disabled = true;
      sb.auth.signInWithPassword({ email: email, password: pw }).then(function (r) {
        btn.disabled = false;
        if (r.error) {
          if (r.error.code === "email_not_confirmed" || /not confirmed/i.test(r.error.message)) {
            sb.auth.resend({ type: "signup", email: email, options: { emailRedirectTo: verifiedUrl() } }).then(function () { showVerify(email); });
            return;
          }
          show("Login failed: " + r.error.message, false); return;
        }
        goAfter();
      });
    });

    sform.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = sform.querySelector("button[type=submit]");
      var email = sform.email.value.trim(), pw = sform.password.value;
      clear();
      if (pw.length < 8) { show("Password must be at least 8 characters.", false); return; }
      if (pw !== sform.confirm.value) { show("Passwords do not match.", false); return; }
      btn.disabled = true;
      sb.auth.signUp({ email: email, password: pw, options: { emailRedirectTo: verifiedUrl() } }).then(function (r) {
        btn.disabled = false;
        if (r.error) { show(r.error.message, false); return; }
        if (r.data && r.data.session) { goAfter(); return; }
        if (r.data && r.data.user && r.data.user.identities && r.data.user.identities.length === 0) {
          show("This email already has an account. Please sign in instead.", false); setSide("signin"); return;
        }
        showVerify(email);
      });
    });

    vform.addEventListener("submit", function (e) {
      e.preventDefault();
      setSide("signin"); lform.email.value = pendingEmail; lform.password.focus({ preventScroll: true });
      show("Once you have tapped the link in the email, sign in here.", true);
    });
    $("#resendBtn").addEventListener("click", function () {
      clear();
      sb.auth.resend({ type: "signup", email: pendingEmail, options: { emailRedirectTo: verifiedUrl() } }).then(function (r) {
        if (r.error) { show(r.error.message, false); return; }
        show("A new link has been sent.", true); startCooldown();
      });
    });
    $("#backBtn").addEventListener("click", function () { clearInterval(cooldown); setSide("signup"); });
    setSide(new URLSearchParams(location.search).get("mode") === "signup" ? "signup" : "signin");
  }

  /* ---------- reset password page ---------- */
  function initReset() {
    var box = $("#vBox");
    function form() {
      box.innerHTML = '<div class="v-ic ok">' + ico("check") + '</div><h1>New password</h1><p>Choose a new password for your account.</p>' +
        '<form id="rpForm"><input class="field" type="password" name="pw" minlength="6" required placeholder="New password (6+ characters)" autocomplete="new-password">' +
        '<button class="btn btn-primary block" type="submit" style="margin-top:14px">Save password</button><div class="msg" id="rpMsg" role="status"></div></form>';
      $("#rpForm").addEventListener("submit", function (e) {
        e.preventDefault();
        sb.auth.updateUser({ password: e.target.pw.value }).then(function (r) {
          var m = $("#rpMsg");
          if (r.error) { m.textContent = r.error.message; m.className = "msg err"; return; }
          box.innerHTML = '<div class="v-ic ok">' + ico("check") + '</div><h1>Password updated</h1><p>You are signed in.</p><div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="apps.html">Browse apps</a></div>';
        });
      });
    }
    function bad() { box.innerHTML = '<div class="v-ic bad">!</div><h1>Link expired</h1><p>Request a new reset link from the login page.</p><div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="login.html">Back to login</a></div>'; }
    if (!sb) { bad(); return; }
    var done = false;
    sb.auth.onAuthStateChange(function (ev) { if (ev === "PASSWORD_RECOVERY" && !done) { done = true; form(); } });
    setTimeout(function () { if (!done) getSession().then(function (s) { if (s && !done) { done = true; form(); } else if (!done) bad(); }); }, 1500);
  }

  /* ---------- notice banner (posted from the admin panel) ---------- */
  function initNotices() {
    if (!sb || document.body.dataset.page === "admin" || document.body.dataset.page === "login") return;
    sb.from("notices").select("id,title,body,urgent,created_at").eq("active", true).order("urgent", { ascending: false }).order("created_at", { ascending: false }).limit(1).then(function (r) {
      var n = r && r.data && r.data[0]; if (!n) return;
      var key = "mrm-notice-" + n.id;
      try { if (sessionStorage.getItem(key)) return; } catch (e) {}
      var bar = document.createElement("div");
      bar.className = "notice-bar" + (n.urgent ? " urgent" : ""); bar.setAttribute("role", "status");
      bar.innerHTML = "<div><b>" + (n.urgent ? "Important: " : "") + esc(n.title) + "</b>" + (n.body ? "<span>" + esc(n.body) + "</span>" : "") + '</div><button type="button" aria-label="Dismiss">×</button>';
      bar.querySelector("button").addEventListener("click", function () { try { sessionStorage.setItem(key, "1"); } catch (e) {} bar.remove(); });
      document.body.appendChild(bar);
    });
  }

  /* ---------- email confirmed page ---------- */
  function initVerified() {
    var box = $("#vBox");
    var h = new URLSearchParams((location.hash || "").replace(/^#/, "")), q = new URLSearchParams(location.search);
    var err = h.get("error_description") || q.get("error_description");
    function ok() {
      box.innerHTML = '<div class="v-ic ok">' + ico("check") + '</div><h1>Email verified</h1><p>Your account is ready. You can now download apps and leave reviews.</p>' +
        '<div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="apps.html">Browse apps</a><a class="btn btn-primary btn-blue" href="index.html">Go home</a></div>';
    }
    if (err) {
      box.innerHTML = '<div class="v-ic bad">!</div><h1>Link expired</h1><p>' + esc(err.replace(/\+/g, " ")) + '</p><div class="btn-row" style="justify-content:center"><a class="btn btn-primary" href="login.html">Back to login</a></div>';
      return;
    }
    ok();
    if (sb) getSession().then(function (s) { if (s) { try { history.replaceState(null, "", location.pathname); } catch (e) {} } });
  }

  /* ---------- shared with admin.js / portfolio.js ---------- */
  window.MRM = {
    C: C, sb: sb, configured: configured, $: $, $$: $$, esc: esc, safeUrl: safeUrl, ico: ico, logo: logo,
    starsHTML: starsHTML, vtick: vtick, getSettings: getSettings, getSession: getSession, initReveal: initReveal, track: track
  };

  /* ---------- boot ---------- */
  document.documentElement.classList.remove("no-js");
  buildLayout();
  initInstall();
  initReveal();
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
  var page = document.body.dataset.page;
  if (page !== "admin") initPresence();
  if (page === "home") initHero();
  if (page === "edit" || page === "dev") getSettings().then(function (s) { renderContacts(page, s); });
  if (page === "verified") initVerified();
  if (page === "reset") initReset();
  initNotices();
  if (page === "about") getSettings().then(initAbout);
  initSession();
  if (page === "apps") initApps();
  if (page === "feedback") initFeedback();
  if (page === "login") initLogin();
})();
