/* MRM drag-and-drop upload card with a basketball hoop.
   MRM.dropzone(fileInput, { title, hint, maxMB }) keeps the real <input type=file>, so forms work as before.
   Returns { busy(), done(), fail(), reset() } to mirror the real upload state. */
(function () {
  "use strict";
  var M = window.MRM; if (!M) return;
  var count = 0, counters = [];
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var HOOP = '<svg class="dz-hoop" viewBox="0 0 90 100" aria-hidden="true"><rect x="12" y="4" width="66" height="44" rx="6" class="bb"/><rect x="33" y="22" width="24" height="18" rx="2" class="sq"/>' +
    '<g class="net"><path d="M24 54 36 90M34 55 41 92M45 56 45 94M56 55 49 92M66 54 54 90M26 66h38M30 78h30"/></g><ellipse cx="45" cy="54" rx="22" ry="6" class="rim"/></svg>';

  function fmt(b) { return b < 1048576 ? Math.max(1, Math.round(b / 1024)) + " KB" : (b / 1048576).toFixed(1) + " MB"; }
  function ext(n) { var m = /\.([a-z0-9]{1,5})$/i.exec(n || ""); return (m ? m[1] : "file").toUpperCase(); }

  M.dropzone = function (input, o) {
    o = o || {};
    var isImg = /image/.test(input.accept || "");
    var root = document.createElement("div"); root.className = "dz";
    root.innerHTML =
      '<div class="dz-head"><b>' + M.esc(o.title || "Upload file") + '</b><span class="dz-count">Uploaded <i>0</i></span></div>' +
      '<div class="dz-zone" tabindex="0" role="button" aria-label="' + M.esc(o.title || "Upload file") + '">' +
        '<div class="dz-txt"><span class="dz-ic">' + M.ico("upload") + "</span><b>Drop file here</b><small>" + M.esc(o.hint || "or tap to choose") + "</small></div>" + HOOP +
        '<div class="dz-file" hidden><span class="dz-thumb"></span><div class="dz-meta"><div class="dz-row"><b class="dz-name"></b><span class="dz-pct">0%</span></div><div class="dz-bar"><i></i></div><small class="dz-state"></small></div></div>' +
      "</div>";
    input.style.display = "none";
    input.parentNode.insertBefore(root, input);
    var lab = input.parentNode.querySelector('label[for="' + input.id + '"]'); if (lab) lab.style.display = "none";
    var zone = root.querySelector(".dz-zone"), fileBox = root.querySelector(".dz-file"), bar = root.querySelector(".dz-bar i"),
      pct = root.querySelector(".dz-pct"), stateEl = root.querySelector(".dz-state"), hoop = root.querySelector(".dz-hoop"),
      cnt = root.querySelector(".dz-count i"), state = "idle", timer = null, thumb = root.querySelector(".dz-thumb"), url = null;

    function setPct(p) { bar.style.width = p + "%"; pct.textContent = Math.round(p) + "%"; }
    function tween(from, to, ms, cb) {
      var t0 = performance.now(); clearInterval(timer);
      timer = setInterval(function () {
        var k = Math.min(1, (performance.now() - t0) / ms); setPct(from + (to - from) * k);
        if (k >= 1) { clearInterval(timer); cb && cb(); }
      }, 30);
    }
    function clear() {
      clearInterval(timer); state = "idle"; root.className = "dz"; fileBox.hidden = true; setPct(0);
      zone.querySelector(".dz-txt").style.visibility = "visible";
      if (url) { URL.revokeObjectURL(url); url = null; } thumb.innerHTML = "";
    }
    function shoot(done) {
      if (reduce || !zone.animate) { done(); return; }
      var z = zone.getBoundingClientRect(), h = hoop.getBoundingClientRect();
      var fly = document.createElement("span"); fly.className = "dz-fly"; fly.textContent = ext(input.files[0].name);
      zone.appendChild(fly);
      var sx = z.width * 0.1, sy = z.height - 44, tx = h.left - z.left + h.width / 2 - 20, ty = h.top - z.top + h.height * 0.5;
      var a = fly.animate([
        { transform: "translate(" + sx + "px," + sy + "px) scale(1) rotate(0)", opacity: 1 },
        { transform: "translate(" + (sx + (tx - sx) * 0.5) + "px," + (Math.min(sy, ty) - 70) + "px) scale(.95) rotate(200deg)", opacity: 1, offset: 0.55 },
        { transform: "translate(" + tx + "px," + ty + "px) scale(.45) rotate(400deg)", opacity: 0.9 }
      ], { duration: 720, easing: "cubic-bezier(.3,.1,.4,1)", fill: "forwards" });
      a.onfinish = function () { fly.remove(); hoop.classList.remove("swish"); void hoop.offsetWidth; hoop.classList.add("swish"); done(); };
    }
    function picked() {
      var f = input.files && input.files[0]; if (!f) { clear(); return; }
      if (o.maxMB && f.size > o.maxMB * 1048576) {
        input.value = ""; clear(); stateEl.textContent = "";
        alert("That file is " + fmt(f.size) + ". The limit here is " + o.maxMB + " MB."); return;
      }
      clearInterval(timer); state = "shooting";
      zone.querySelector(".dz-txt").style.visibility = "hidden";
      fileBox.hidden = false; root.classList.remove("is-done", "is-busy", "is-err"); root.classList.add("is-shoot");
      root.querySelector(".dz-name").textContent = f.name + " · " + fmt(f.size);
      if (url) URL.revokeObjectURL(url);
      thumb.innerHTML = ""; if (isImg && /^image\//.test(f.type)) { url = URL.createObjectURL(f); thumb.innerHTML = '<img alt="" src="' + url + '">'; } else thumb.textContent = ext(f.name);
      setPct(0); stateEl.textContent = "Taking the shot…";
      shoot(function () { state = "ready"; root.classList.remove("is-shoot"); tween(0, 100, 700, function () { stateEl.textContent = "Ready. It uploads when you press save."; }); });
    }
    input.addEventListener("change", picked);
    zone.addEventListener("click", function () { input.click(); });
    zone.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    ["dragenter", "dragover"].forEach(function (n) { zone.addEventListener(n, function (e) { e.preventDefault(); root.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (n) { zone.addEventListener(n, function (e) { e.preventDefault(); root.classList.remove("is-over"); }); });
    zone.addEventListener("drop", function (e) {
      var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (!f) return;
      try { var dt = new DataTransfer(); dt.items.add(f); input.files = dt.files; } catch (er) { return; }
      picked();
    });
    if (input.form) input.form.addEventListener("reset", function () { setTimeout(clear, state === "done" ? 1200 : 0); });

    var ctl = {
      busy: function () { if (!input.files[0]) return; state = "busy"; root.classList.add("is-busy"); stateEl.textContent = "Uploading…"; setPct(8); tween(8, 92, 9000); },
      done: function () {
        if (!input.files[0]) return; state = "done"; root.classList.remove("is-busy"); root.classList.add("is-done");
        clearInterval(timer); setPct(100); stateEl.textContent = "Uploaded successfully"; count++; counters.forEach(function (c) { c.textContent = count; });
      },
      fail: function () { if (state !== "busy") return; state = "ready"; clearInterval(timer); root.classList.remove("is-busy"); root.classList.add("is-err"); setPct(100); stateEl.textContent = "Upload failed. You can try again."; },
      reset: clear
    };
    counters.push(cnt); cnt.textContent = count;
    return ctl;
  };
})();
