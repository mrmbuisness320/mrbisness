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
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88M14.47 14.48 20 20M8.12 8.12 12 12"/>',
    code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
    phoneapp: '<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'
  };
  var ico = function (n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || "") + "</svg>";
  };
  var logoN = 0;
  var logo = function () {
    var id = "lg" + (++logoN);
    return '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset=".5" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/></linearGradient></defs>' +
      '<rect x="3" y="3" width="58" height="58" rx="16" fill="#0b0716" stroke="url(#' + id + ')" stroke-width="2.5"/>' +
      '<path d="M17 24 9 32l8 8" fill="none" stroke="url(#' + id + ')" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M22 44V21l10 12 10-12v23" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M45 25.5v13l10-6.5z" fill="url(#' + id + ')"/></svg>';
  };

  /* ---------- shared layout ---------- */
  var LINKS = [
    ["Video Editing", "video-editing.html", "Edits, templates & motion"],
    ["App & Web Development", "development.html", "Android apps & websites"],
    ["Apps", "apps.html", "Free downloads"]
  ];
  var SUB = [["Home", "index.html"], ["About", "about.html"], ["Terms & Conditions", "terms.html"], ["Privacy Policy", "privacy.html"]];

  function buildLayout() {
    var page = document.body.dataset.page || "";
    var header =
      '<header class="header"><a class="brand" href="index.html" aria-label="MRM home">' + logo() +
      '<span><b>MRM</b><small>App · Web · Video</small></span></a>' +
      '<button class="menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></header>';
    var drawer =
      '<nav class="drawer" id="drawer" aria-label="Main menu"><div class="main-links">' +
      LINKS.map(function (l) { return '<a href="' + l[1] + '">' + l[0] + "<small>" + l[2] + "</small></a>"; }).join("") +
      '</div><div class="sub-links">' + SUB.map(function (l) { return '<a href="' + l[1] + '">' + l[0] + "</a>"; }).join("") +
      '</div><div class="drawer-actions"><a class="login-link" id="authLink" href="login.html">Login / Sign up</a>' +
      '<button class="login-link install" id="installBtn" type="button" hidden>' + ico("download") + ' Install App</button></div></nav>';
    document.body.insertAdjacentHTML("afterbegin", header + drawer);

    if (!document.body.hasAttribute("data-nofooter")) {
      var s = C.defaults || {};
      document.body.insertAdjacentHTML("beforeend",
        '<footer class="footer"><div class="container"><div class="foot-grid"><div><a class="brand" href="index.html">' + logo() +
        '<span><b>MRM</b><small>App · Web · Video</small></span></a><p>' + esc(s.tagline || "") + "</p></div>" +
        '<div><h5>Services</h5><ul><li><a href="video-editing.html">Video Editing</a></li><li><a href="development.html">App &amp; Web Development</a></li><li><a href="apps.html">Free Apps</a></li></ul></div>' +
        '<div><h5>Company</h5><ul><li><a href="about.html">About</a></li><li><a href="terms.html">Terms &amp; Conditions</a></li><li><a href="privacy.html">Privacy Policy</a></li><li><a href="login.html">Login / Sign up</a></li></ul></div></div>' +
        '<div class="copy"><span>© ' + new Date().getFullYear() + " MRM. All rights reserved.</span><span>App · Website · Video Editing</span></div></div></footer>");
    }

    var btn = $("#menuBtn"), dr = $("#drawer");
    function toggle(open) {
      var o = typeof open === "boolean" ? open : !dr.classList.contains("open");
      dr.classList.toggle("open", o);
      btn.classList.toggle("open", o);
      btn.setAttribute("aria-expanded", o);
      document.body.style.overflow = o ? "hidden" : "";
    }
    btn.addEventListener("click", function () { toggle(); });
    $$("a", dr).forEach(function (a) { a.addEventListener("click", function () { toggle(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") toggle(false); });
    void page;
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
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault(); deferred = e; btn.hidden = false;
    });
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
    var els = $$(".reveal");
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
      if (r && r.data) r.data.forEach(function (row) { if (row.value !== null && row.value !== undefined) s[row.key] = row.value; });
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
    var tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: 0.8 } });
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

  /* ---------- apps page ---------- */
  function appCard(a, loggedIn) {
    var icon = safeUrl(a.icon_url);
    var init = esc((a.name || "?").trim().charAt(0).toUpperCase());
    var action;
    if (!a.downloadable) action = '<span class="hint">Download coming soon</span>';
    else if (loggedIn) action = '<button class="btn btn-primary" type="button" data-dl="' + esc(a.id) + '">' + ico("download") + "Download free</button>";
    else action = '<a class="btn btn-primary" href="login.html?next=apps.html">' + ico("lock") + "Login to download</a>";
    return '<article class="app-card reveal"><div class="app-top">' +
      (icon ? '<img class="app-icon" src="' + esc(icon) + '" alt="" loading="lazy">' : '<div class="app-icon">' + init + "</div>") +
      "<div><h3>" + esc(a.name) + "</h3><small>" + (a.version ? "Version " + esc(a.version) : "Android app") + "</small></div></div>" +
      "<p>" + esc(a.description || "") + "</p>" + action + "</article>";
  }

  function initApps() {
    var grid = $("#appsGrid"), search = $("#appSearch");
    var all = [], loggedIn = false;
    function draw() {
      var q = (search.value || "").toLowerCase();
      var list = all.filter(function (a) { return (a.name + " " + (a.description || "")).toLowerCase().indexOf(q) > -1; });
      grid.innerHTML = list.length ? list.map(function (a) { return appCard(a, loggedIn); }).join("") : "";
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
    if (!sb) {
      $("#appsEmpty").hidden = false;
      $("#appsEmpty").textContent = configured ? "Could not load apps right now." : "Apps will appear here once the database is connected (see README).";
      return;
    }
    grid.addEventListener("click", function (e) {
      var b = e.target.closest("[data-dl]");
      if (!b) return;
      var html = b.innerHTML;
      b.disabled = true; b.textContent = "Preparing…";
      downloadApp(b.dataset.dl).catch(function (err) {
        alert("Could not start the download: " + (err.message || err));
      }).then(function () { setTimeout(function () { b.disabled = false; b.innerHTML = html; }, 1500); });
    });
    Promise.all([
      sb.auth.getSession(),
      sb.from("apps").select("*").order("created_at", { ascending: false })
    ]).then(function (res) {
      loggedIn = !!(res[0].data && res[0].data.session);
      var r = res[1];
      if (r.error) { $("#appsEmpty").hidden = false; $("#appsEmpty").textContent = "Could not load apps right now."; return; }
      all = r.data || [];
      if (!all.length) $("#appsEmpty").textContent = "No apps published yet. Check back soon!";
      var note = $("#loginNote");
      if (note) note.hidden = loggedIn;
      draw();
    });
    search.addEventListener("input", draw);
  }

  /* ---------- menu: login / logout state ---------- */
  function initSession() {
    var link = $("#authLink");
    if (!sb || !link) return;
    sb.auth.getSession().then(function (r) {
      var s = r.data && r.data.session;
      if (!s) return;
      link.textContent = "Log out";
      link.setAttribute("href", "#");
      link.addEventListener("click", function (e) {
        e.preventDefault();
        sb.auth.signOut().then(function () { location.reload(); });
      });
      sb.rpc("is_admin").then(function (a) {
        if (a && a.data === true) link.insertAdjacentHTML("beforebegin", '<a class="login-link" href="admin.html">Admin panel</a>');
      });
    });
  }

  /* ---------- about ---------- */
  function initAbout(s) {
    var el = $("#aboutText");
    if (el) el.textContent = s.about_text || "";
  }

  /* ---------- login ---------- */
  function initLogin() {
    var form = $("#loginForm"), vform = $("#verifyForm"), msg = $("#loginMsg");
    var seg = $("#authTabs"), title = $("#authTitle"), sub = $("#authSub");
    var mode = "signin", pendingEmail = "", cooldown = null;
    function show(t, ok) { msg.textContent = t; msg.className = "msg " + (ok ? "ok" : "err"); }
    function clear() { msg.className = "msg"; msg.textContent = ""; }
    if (!sb) { show("Backend is not connected yet. Add your Supabase keys in config.js (see README).", false); return; }

    var m = /^[a-z-]+\.html$/.exec(new URLSearchParams(location.search).get("next") || "");
    var next = m ? m[0] : "";
    function goAfter() {
      sb.rpc("is_admin").then(function (r) {
        var admin = !r.error && r.data === true;
        location.replace(next || (admin ? "admin.html" : "apps.html"));
      });
    }

    function setMode(md) {
      mode = md; clear();
      $$(".tab", seg).forEach(function (t) { t.classList.toggle("active", t.dataset.mode === md); });
      $("#confirmWrap").hidden = md !== "signup";
      form.confirm.required = md === "signup";
      form.password.setAttribute("autocomplete", md === "signup" ? "new-password" : "current-password");
      form.querySelector("button[type=submit]").textContent = md === "signup" ? "Create account" : "Sign in";
      title.textContent = md === "signup" ? "Create account" : "Welcome back";
      sub.textContent = md === "signup" ? "Sign up with your email. We will send you a 6-digit code to verify it." : "Sign in to download apps.";
    }
    $$(".tab", seg).forEach(function (t) { t.addEventListener("click", function () { setMode(t.dataset.mode); }); });

    function startCooldown() {
      var b = $("#resendBtn"), n = 45;
      b.disabled = true; clearInterval(cooldown);
      cooldown = setInterval(function () {
        n--; b.textContent = n > 0 ? "Resend code (" + n + "s)" : "Resend code";
        if (n <= 0) { clearInterval(cooldown); b.disabled = false; }
      }, 1000);
      b.textContent = "Resend code (" + n + "s)";
    }
    function showVerify(email) {
      pendingEmail = email; clear();
      form.hidden = true; seg.hidden = true; vform.hidden = false;
      title.textContent = "Verify your email";
      sub.textContent = "Enter the code we sent to " + email + ". Check your spam folder too.";
      vform.code.value = ""; vform.code.focus();
      startCooldown();
    }

    sb.auth.getSession().then(function (r) { if (r.data && r.data.session) goAfter(); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var email = form.email.value.trim(), pw = form.password.value;
      clear();
      if (mode === "signup") {
        if (pw.length < 8) { show("Password must be at least 8 characters.", false); return; }
        if (pw !== form.confirm.value) { show("Passwords do not match.", false); return; }
        btn.disabled = true;
        sb.auth.signUp({ email: email, password: pw }).then(function (r) {
          btn.disabled = false;
          if (r.error) { show(r.error.message, false); return; }
          if (r.data && r.data.session) { goAfter(); return; }
          if (r.data && r.data.user && r.data.user.identities && r.data.user.identities.length === 0) {
            show("This email already has an account. Please sign in instead.", false); setMode("signin"); return;
          }
          showVerify(email);
        });
      } else {
        btn.disabled = true;
        sb.auth.signInWithPassword({ email: email, password: pw }).then(function (r) {
          btn.disabled = false;
          if (r.error) {
            if (r.error.code === "email_not_confirmed" || /not confirmed/i.test(r.error.message)) {
              sb.auth.resend({ type: "signup", email: email }).then(function () { showVerify(email); });
              return;
            }
            show("Login failed: " + r.error.message, false); return;
          }
          goAfter();
        });
      }
    });

    vform.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = vform.querySelector("button[type=submit]");
      var code = vform.code.value.replace(/\s/g, "");
      if (!/^\d{6,8}$/.test(code)) { show("Enter the numeric code from the email.", false); return; }
      btn.disabled = true; clear();
      sb.auth.verifyOtp({ email: pendingEmail, token: code, type: "signup" }).then(function (r) {
        btn.disabled = false;
        if (r.error) { show("That code is wrong or has expired. Request a new one.", false); return; }
        show("Email verified. Opening your account…", true);
        goAfter();
      });
    });
    $("#resendBtn").addEventListener("click", function () {
      clear();
      sb.auth.resend({ type: "signup", email: pendingEmail }).then(function (r) {
        if (r.error) { show(r.error.message, false); return; }
        show("A new code has been sent.", true); startCooldown();
      });
    });
    $("#backBtn").addEventListener("click", function () {
      clearInterval(cooldown); vform.hidden = true; form.hidden = false; seg.hidden = false; setMode("signup");
    });
    setMode(new URLSearchParams(location.search).get("mode") === "signup" ? "signup" : "signin");
  }

  /* ---------- admin ---------- */
  var SETTING_GROUPS = [
    ["Video Editing contacts", [
      ["edit_whatsapp", "WhatsApp number (with country code)"], ["edit_phone", "Business phone number"], ["edit_email", "Email"],
      ["edit_facebook", "Facebook link"], ["edit_tiktok", "TikTok link"], ["edit_capcut", "CapCut link"], ["edit_telegram", "Telegram channel link"]
    ]],
    ["App & Web Development contacts", [
      ["dev_whatsapp", "WhatsApp number (with country code)"], ["dev_phone", "Business phone number"], ["dev_email", "Email"],
      ["dev_telegram", "Telegram channel link"], ["dev_facebook", "Facebook link"], ["dev_website", "Website link (leave empty to hide)"]
    ]],
    ["Text", [["tagline", "Footer tagline"], ["about_text", "About text", "area"]]]
  ];

  function initAdmin() {
    var gate = $("#gate"), ui = $("#adminUI");
    if (!sb) {
      gate.innerHTML = '<div class="empty">The backend is not connected yet.<br>Add your Supabase URL and anon key in <b>config.js</b> (see README), then reload.</div>';
      return;
    }
    sb.auth.getSession().then(function (r) {
      var session = r.data && r.data.session;
      if (!session) { location.replace("login.html?next=admin.html"); return; }
      sb.rpc("is_admin").then(function (a) {
        if (a.error || a.data !== true) {
          gate.innerHTML = '<div class="empty">This area is for the site owner only.<br><br><a class="btn" href="index.html">Back to home</a></div>';
          return;
        }
        $("#who").textContent = "Signed in as " + session.user.email;
        gate.hidden = true; ui.hidden = false;
        startAdmin();
      });
    });
  }

  function startAdmin() {
    var form = $("#appForm"), list = $("#adminApps"), msg = $("#appMsg"), editing = null;
    function show(el, t, ok) { el.textContent = t; el.className = "msg " + (ok ? "ok" : "err"); }

    $("#logout").addEventListener("click", function () { sb.auth.signOut().then(function () { location.replace("login.html"); }); });
    $$(".tab").forEach(function (t) {
      t.addEventListener("click", function () {
        $$(".tab").forEach(function (x) { x.classList.toggle("active", x === t); });
        $("#tab-apps").hidden = t.dataset.tab !== "apps";
        $("#tab-settings").hidden = t.dataset.tab !== "settings";
      });
    });

    var APK_BUCKET = C.apkBucket || "app-apks";
    function upload(bucket, file, folder) {
      var ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      var path = folder + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
      var type = ext === "apk" ? "application/vnd.android.package-archive" : (file.type || "application/octet-stream");
      return sb.storage.from(bucket).upload(path, file, { contentType: type, upsert: false }).then(function (r) {
        if (r.error) throw r.error;
        return path;
      });
    }
    function publicUrl(path) { return sb.storage.from(C.storageBucket).getPublicUrl(path).data.publicUrl; }
    function storagePath(url) {
      var m = String(url || "").split("/object/public/" + C.storageBucket + "/");
      return m.length > 1 ? decodeURIComponent(m[1].split("?")[0]) : null;
    }
    window.__secrets = {};

    function reset() {
      editing = null; form.reset(); form.appid.value = "";
      $("#formTitle").textContent = "Add a new app";
      $("#cancelEdit").hidden = true;
      $("#apkCurrent").textContent = "";
    }
    $("#cancelEdit").addEventListener("click", reset);

    function load() {
      Promise.all([
        sb.from("apps").select("*").order("created_at", { ascending: false }),
        sb.from("app_secrets").select("*")
      ]).then(function (res) {
        var r = res[0];
        window.__secrets = {};
        ((res[1] && res[1].data) || []).forEach(function (s) { window.__secrets[s.app_id] = s; });
        if (r.error) { list.innerHTML = '<p class="hint">Could not load apps: ' + esc(r.error.message) + "</p>"; return; }
        var rows = r.data || [];
        window.__apps = rows;
        list.innerHTML = rows.length ? rows.map(function (a) {
          var icon = safeUrl(a.icon_url);
          return '<div class="row-app">' + (icon ? '<img class="app-icon" src="' + esc(icon) + '" alt="">' : '<div class="app-icon">' + esc((a.name || "?").charAt(0).toUpperCase()) + "</div>") +
            '<div class="grow"><b>' + esc(a.name) + "</b><small>" + esc(a.version ? "v" + a.version : "") + "</small></div>" +
            '<button class="mini" data-edit="' + esc(a.id) + '">Edit</button><button class="mini danger" data-del="' + esc(a.id) + '">Delete</button></div>';
        }).join("") : '<p class="hint">No apps yet. Add your first app above.</p>';
      });
    }
    list.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
      var rows = window.__apps || [];
      if (ed) {
        var a = rows.filter(function (x) { return String(x.id) === ed.dataset.edit; })[0];
        if (!a) return;
        editing = a; form.appid.value = a.id; form.appname.value = a.name || ""; form.version.value = a.version || "";
        var sec = window.__secrets[a.id] || {};
        form.description.value = a.description || ""; form.apkurl.value = sec.external_url || "";
        $("#apkCurrent").textContent = sec.apk_path ? "An APK file is already uploaded. Choose a new file only if you want to replace it." : "";
        $("#formTitle").textContent = "Edit: " + a.name; $("#cancelEdit").hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (del) {
        var d = rows.filter(function (x) { return String(x.id) === del.dataset.del; })[0];
        if (!d || !confirm('Delete "' + d.name + '" permanently?')) return;
        var iconPath = storagePath(d.icon_url);
        var apkPath = (window.__secrets[d.id] || {}).apk_path;
        Promise.all([
          iconPath ? sb.storage.from(C.storageBucket).remove([iconPath]) : null,
          apkPath ? sb.storage.from(APK_BUCKET).remove([apkPath]) : null
        ]).then(function () {
          return sb.from("apps").delete().eq("id", d.id);
        }).then(function (r) {
          if (r && r.error) show(msg, "Delete failed: " + r.error.message, false); else { show(msg, "App deleted.", true); if (editing && editing.id === d.id) reset(); load(); }
        });
      }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Saving…"; msg.className = "msg";
      var iconFile = form.icon.files[0], apkFile = form.apk.files[0];
      var oldSec = editing ? (window.__secrets[editing.id] || {}) : {};
      var sec = { apk_path: oldSec.apk_path || null, external_url: form.apkurl.value.trim() || null };
      if (sec.external_url && !safeUrl(sec.external_url)) { show(msg, "The external link must start with https://", false); btn.disabled = false; btn.textContent = "Save app"; return; }
      var row = {
        name: form.appname.value.trim(), version: form.version.value.trim(), description: form.description.value.trim(),
        icon_url: editing ? editing.icon_url : null
      };
      var replacedApk = null, savedId = editing ? editing.id : null;
      Promise.resolve().then(function () { return iconFile ? upload(C.storageBucket, iconFile, "icons").then(publicUrl) : row.icon_url; })
        .then(function (u) { row.icon_url = u; return apkFile ? upload(APK_BUCKET, apkFile, "apk") : sec.apk_path; })
        .then(function (p) {
          if (apkFile && sec.apk_path) replacedApk = sec.apk_path;
          sec.apk_path = p;
          row.downloadable = !!(sec.apk_path || sec.external_url);
          return editing ? sb.from("apps").update(row).eq("id", editing.id).select("id").single() : sb.from("apps").insert(row).select("id").single();
        })
        .then(function (r) {
          if (r.error) throw r.error;
          savedId = r.data.id;
          sec.app_id = savedId;
          return sb.from("app_secrets").upsert(sec, { onConflict: "app_id" });
        })
        .then(function (r) {
          if (r.error) throw r.error;
          if (replacedApk) sb.storage.from(APK_BUCKET).remove([replacedApk]);
          show(msg, editing ? "App updated." : "App published!", true); reset(); load();
        })
        .catch(function (err) { show(msg, "Error: " + (err.message || err), false); })
        .then(function () { btn.disabled = false; btn.textContent = "Save app"; });
    });

    /* settings tab */
    var sBox = $("#settingsFields"), sMsg = $("#settingsMsg");
    getSettings().then(function (s) {
      sBox.innerHTML = SETTING_GROUPS.map(function (g) {
        return '<div class="setting-group"><h4>' + g[0] + "</h4>" + g[1].map(function (f) {
          var v = esc(s[f[0]] || "");
          return "<label>" + f[1] + "</label>" + (f[2] === "area"
            ? '<textarea class="field" data-key="' + f[0] + '">' + v + "</textarea>"
            : '<input class="field" data-key="' + f[0] + '" value="' + v + '">');
        }).join("") + "</div>";
      }).join("");
    });
    $("#saveSettings").addEventListener("click", function () {
      var rows = $$("[data-key]", sBox).map(function (i) { return { key: i.dataset.key, value: i.value.trim() }; });
      sb.from("site_settings").upsert(rows, { onConflict: "key" }).then(function (r) {
        if (r.error) show(sMsg, "Save failed: " + r.error.message, false); else show(sMsg, "Settings saved. Reload the public pages to see them.", true);
      });
    });

    load();
  }

  /* ---------- boot ---------- */
  document.documentElement.classList.remove("no-js");
  buildLayout();
  initInstall();
  initReveal();
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
  var page = document.body.dataset.page;
  if (page === "home") initHero();
  if (page === "edit" || page === "dev") getSettings().then(function (s) { renderContacts(page, s); });
  if (page === "about") getSettings().then(initAbout);
  initSession();
  if (page === "apps") initApps();
  if (page === "login") initLogin();
  if (page === "admin") initAdmin();
})();
