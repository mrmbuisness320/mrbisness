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
    return { summary: summary, skills: skills, exp: exp };
  }

  function typedSlice(text, p) { return text.slice(0, Math.floor(Math.max(0, Math.min(1, p)) * text.length)); }

  function setup(d) {
    var typed = $("#pfTyped"), skillEls = $$("#pfSkills div"), expEl = $("#pfExp");
    var total = d.skills.join("").length;
    function paint(p) {
      typed.textContent = typedSlice(d.summary, (p - 0.36) / 0.28);
      var shown = Math.floor(Math.max(0, Math.min(1, (p - 0.62) / 0.28)) * total), used = 0;
      skillEls.forEach(function (el, i) {
        var t = d.skills[i], n = Math.max(0, Math.min(t.length, shown - used));
        el.textContent = t.slice(0, n); used += t.length;
        el.style.visibility = n > 0 ? "visible" : "hidden";
      });
      if (d.exp) expEl.hidden = p < 0.85;
    }
    var still = !window.gsap || !window.ScrollTrigger || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) {
      $("#pf").style.height = "100svh";
      $("#pfPhoto").style.transform = "translateX(-12%)";
      $("#pfTitle").style.opacity = ".35";
      paint(1);
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    var mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 821px)", narrow: "(max-width: 820px)" }, function (ctx) {
      var wide = ctx.conditions.wide;
      gsap.set("#pfPhoto", { xPercent: -50 });
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#pf", start: "top top", end: "bottom bottom", scrub: true,
          onUpdate: function (self) { paint(self.progress); }
        }
      });
      tl.from("#pfTitle span", { yPercent: 120, opacity: 0, stagger: 0.08, duration: 1.2, ease: "power3.out" }, 0)
        .from("#pfPhoto", { yPercent: 28, opacity: 0, duration: 1.6, ease: "power2.out" }, 0.4)
        .to("#pfPhoto", { x: wide ? "22vw" : "26vw", scale: wide ? 0.94 : 0.84, transformOrigin: "50% 100%", duration: 2.2, ease: "power2.inOut" }, 2.6)
        .to("#pfTitle", { opacity: 0.22, yPercent: -10, duration: 2, ease: "none" }, 2.6)
        .from("#pfInfo", { opacity: 0, y: 40, duration: 1.4, ease: "power2.out" }, 3.2)
        .from("#pfSkills", { opacity: 0, x: 40, duration: 1.2, ease: "power2.out" }, 5.4);
      paint(0);
      return function () { paint(1); };
    });
    paint(0);
  }

  /* ---------- work grids ---------- */
  var RATIO = { app: "r916", short: "r916", web: "r169", long: "r169" };
  function card(it) {
    var img = safeUrl(it.image_url), link = safeUrl(it.link_url), tag = link ? "a" : "div";
    var attrs = link ? ' href="' + esc(link) + '" target="_blank" rel="noopener"' : "";
    return "<" + tag + ' class="w-card ' + RATIO[it.kind] + ' reveal"' + attrs + ">" +
      (img ? '<img src="' + esc(img) + '" alt="' + esc(it.title) + '" loading="lazy">' :
        '<div class="w-ph"><div>' + ico("image") + esc(it.title.slice(0, 40)) + "</div></div>") +
      '<div class="w-cap"><b>' + esc(it.title) + "</b>" + (it.description ? "<small>" + esc(it.description) + "</small>" : "") + "</div>" +
      (link ? '<span class="w-open">' + ico("ext") + "</span>" : "") + "</" + tag + ">";
  }
  function placeholders(kind, n) {
    var out = "";
    for (var i = 0; i < n; i++) {
      out += '<div class="w-card ' + RATIO[kind] + ' reveal"><div class="w-ph"><div>' + ico("image") + "Project coming soon</div></div></div>";
    }
    return out;
  }
  function loadWork() {
    var grids = $$(".w-grid");
    function fill(items) {
      grids.forEach(function (g) {
        var kind = g.dataset.kind;
        var mine = items.filter(function (x) { return x.kind === kind; });
        g.innerHTML = mine.length ? mine.map(card).join("") : placeholders(kind, kind === "short" || kind === "app" ? 4 : 2);
      });
      M.initReveal();
    }
    if (!sb) { fill([]); return; }
    sb.from("portfolio_items").select("*").eq("section", section).order("sort", { ascending: true }).order("created_at", { ascending: false })
      .then(function (r) { fill((r && r.data) || []); });
  }

  M.getSettings().then(function (s) { setup(intro(s)); });
  loadWork();
})();
