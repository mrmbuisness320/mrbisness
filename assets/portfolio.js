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
