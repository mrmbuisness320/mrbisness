(function () {
  "use strict";
  var M = window.MRM;
  if (!M) return;
  var $ = M.$, $$ = M.$$, esc = M.esc, safeUrl = M.safeUrl, ico = M.ico, sb = M.sb, C = M.C;
  var APK_BUCKET = C.apkBucket || "app-apks";
  var settings = {}, ROLE = "none", MYMAIL = "";
  function session_email() { return MYMAIL; }

  function show(el, t, ok) { if (!el) return; el.textContent = t; el.className = "msg " + (ok ? "ok" : "err"); }
  function fmt(b) {
    b = Number(b) || 0;
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
    if (b < 1073741824) return (b / 1048576).toFixed(1) + " MB";
    return (b / 1073741824).toFixed(2) + " GB";
  }
  function when(d) { try { return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); } catch (e) { return ""; } }

  /* ---------- gate ---------- */
  var gate = $("#gate"), ui = $("#adminUI");
  if (!sb) {
    gate.innerHTML = '<div class="empty">The backend is not connected yet.<br>Add your Supabase URL and anon key in <b>config.js</b> (see README), then reload.</div>';
    return;
  }
  M.getSession().then(function (session) {
    if (!session) { location.replace("login.html?next=admin.html"); return; }
    sb.rpc("my_role").then(function (a) {
      var role = a.error ? null : a.data;
      if (a.error) return sb.rpc("is_admin").then(function (b) { return b.data === true ? "developer" : "none"; });
      return role;
    }).then(function (role) {
      if (role !== "developer" && role !== "admin") {
        gate.innerHTML = '<div class="empty">This area is for the site owner only.<br><br><a class="btn btn-primary" href="index.html">Back to home</a></div>';
        return;
      }
      ROLE = role; MYMAIL = session.user.email;
      $("#who").textContent = session.user.email;
      var rp = $("#rolePill"); rp.textContent = role === "developer" ? "Developer" : "Admin"; rp.className = "role-pill " + role;
      gate.hidden = true; ui.hidden = false;
      start();
    });
  });

  function start() {
    var h = new Date().getHours();
    $("#greet").textContent = (h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening") + ", " + ((settings.owner_name || (C.defaults || {}).owner_name) || "MRM");
    if (ROLE === "developer") $("#greet").insertAdjacentHTML("beforeend", M.vtick());
    $("#railLogo").innerHTML = M.logo();
    $$("[data-i]").forEach(function (e) { e.innerHTML = ico(e.dataset.i); });
    $$("#rail button[data-ico]").forEach(function (b) { b.innerHTML = ico(b.dataset.ico) + "<span>" + esc(b.textContent) + "</span>"; });

    if (ROLE !== "developer") $$("[data-dev]").forEach(function (b) { b.remove(); });
    var iconDz = M.dropzone ? M.dropzone($("#icon"), { title: "App icon", hint: "PNG or JPG. Tap or drop an image", maxMB: 5 }) : null;
    var apkDz = M.dropzone ? M.dropzone($("#apk"), { title: "APK file", hint: "Tap or drop the APK (up to 50 MB)", maxMB: 50 }) : null;
    var pfDz = M.dropzone ? M.dropzone($("#pfImg"), { title: "Thumbnail", hint: "Tap or drop an image", maxMB: 5 }) : null;
    function dz(c, m) { if (c) c[m](); }
    var current = "overview";
    $("#rail").addEventListener("click", function (e) {
      var b = e.target.closest("button[data-tab]"); if (!b) return;
      current = b.dataset.tab;
      $$("#rail button").forEach(function (x) { x.classList.toggle("active", x === b); });
      ["overview", "apps", "portfolio", "reviews", "feedback", "notices", "users", "settings"].forEach(function (t) { $("#tab-" + t).hidden = t !== current; });
      if (current === "overview") loadStats();
      if (current === "reviews") loadReviews();
      if (current === "feedback") loadFeedback();
      if (current === "notices") loadNotices();
      if (current === "users") loadUsers();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    $("#logout").addEventListener("click", function () { sb.auth.signOut().then(function () { location.replace("login.html"); }); });

    M.getSettings().then(function (s) {
      settings = s;
      buildSettings(s);
      loadStats();
    });
    setInterval(function () { if (current === "overview" && !document.hidden) loadStats(); }, 60000);

    /* ---------- live visitors (Supabase Realtime presence) ---------- */
    function startPresence() {
      if (!sb.channel) return;
      var ch = sb.channel("site-presence", { config: { presence: { key: "admin-" + Math.random().toString(36).slice(2, 8) } } });
      function paint() {
        var st = ch.presenceState(), keys = Object.keys(st).filter(function (k) { return k.indexOf("admin-") !== 0; });
        $("#liveNum").textContent = keys.length;
        var pages = {}, apps = {};
        keys.forEach(function (k) {
          var arr = st[k] || [], m = arr[arr.length - 1] || {};
          var p = m.page || "Site"; pages[p] = (pages[p] || 0) + 1;
          if (m.app) apps[m.app] = (apps[m.app] || 0) + 1;
        });
        function rows(o) {
          var ks = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; });
          return ks.map(function (k) { return '<div class="kv"><span>' + esc(k) + "</span><span>" + o[k] + "</span></div>"; }).join("");
        }
        $("#liveByPage").innerHTML = rows(pages) || '<p class="hint">Nobody on the site right now.</p>';
        $("#liveApps").innerHTML = rows(apps) || '<p class="hint">Nobody has an app open right now.</p>';
      }
      ch.on("presence", { event: "sync" }, paint).on("presence", { event: "join" }, paint).on("presence", { event: "leave" }, paint).subscribe();
    }

    /* ---------- overview numbers ---------- */
    function gauge(el, pct, label, sub) {
      var R = 54, len = 2 * Math.PI * R, p = Math.max(0, Math.min(100, pct)), off = len * (1 - p / 100);
      var col = p < 70 ? "#a78bfa" : p < 90 ? "#fbbf24" : "#f87171";
      el.innerHTML = '<svg viewBox="0 0 132 132" aria-hidden="true"><circle class="trk" cx="66" cy="66" r="54"/><circle class="val" cx="66" cy="66" r="54" stroke="' + col + '" stroke-dasharray="' + len.toFixed(1) + '" stroke-dashoffset="' + len.toFixed(1) + '"/></svg>' +
        '<div class="mid">' + Math.round(p) + "%<small>used</small></div><div class=\"gl-lbl\">" + label + '</div><div class="gl-sub">' + sub + "</div>";
      requestAnimationFrame(function () { var v = el.querySelector(".val"); if (v) v.setAttribute("stroke-dashoffset", off.toFixed(1)); });
    }
    function loadStats() {
      var msg = $("#statsMsg");
      sb.rpc("admin_stats").then(function (r) {
        if (r.error) { show(msg, "Dashboard numbers need the latest database setup. Run supabase/upgrade-v2.sql in the Supabase SQL Editor. (" + r.error.message + ")", false); return; }
        msg.className = "msg";
        var s = r.data || {};
        var limF = (Number(settings.limit_storage_mb) || 1024) * 1048576, limD = (Number(settings.limit_db_mb) || 500) * 1048576;
        gauge($("#gaugeFiles"), s.storage_bytes / limF * 100, "File storage", fmt(s.storage_bytes) + " of " + fmt(limF) + " · " + fmt(Math.max(0, limF - s.storage_bytes)) + " free");
        gauge($("#gaugeDb"), s.db_bytes / limD * 100, "Database", fmt(s.db_bytes) + " of " + fmt(limD) + " · " + fmt(Math.max(0, limD - s.db_bytes)) + " free");
        $("#kvApk").textContent = fmt(s.apk_bytes); $("#kvIcons").textContent = fmt(s.icon_bytes); $("#kvDb").textContent = fmt(s.db_bytes);
        $("#tApps").textContent = s.apps; $("#tUsers").textContent = s.accounts; $("#tRatings").textContent = s.ratings; $("#tFeedback").textContent = s.feedback;
      });
      sb.from("app_ratings").select("stars").then(function (r) {
        var c = [0, 0, 0, 0, 0, 0], rows = (r && r.data) || [];
        rows.forEach(function (x) { c[x.stars]++; });
        var mx = Math.max.apply(null, c.slice(1).concat([1]));
        $("#ratingBars").innerHTML = [5, 4, 3, 2, 1].map(function (n) {
          return '<div class="bar-row"><span>' + n + '★</span><div class="bar"><i style="width:' + Math.round(c[n] / mx * 100) + '%"></i></div><span>' + c[n] + "</span></div>";
        }).join("");
        var avg = rows.length ? (rows.reduce(function (a, x) { return a + x.stars; }, 0) / rows.length).toFixed(1) : null;
        $("#ratingCap").textContent = avg ? "Average " + avg + " from " + rows.length + " ratings" : "No ratings yet";
      });
      sb.from("feedback").select("*").order("created_at", { ascending: false }).limit(3).then(function (r) {
        var rows = (r && r.data) || [];
        $("#latestFeedback").innerHTML = rows.length ? rows.map(function (f) {
          return '<div class="dl-row"><div class="grow"><small>' + esc(f.author || "User") + " · " + when(f.created_at) + "</small><p>" + esc(f.message) + "</p></div></div>";
        }).join("") : '<p class="hint">None yet.</p>';
      });
    }

    /* ---------- apps ---------- */
    var form = $("#appForm"), list = $("#adminApps"), msg = $("#appMsg"), editing = null, secrets = {}, apps = [];
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
    function publicPath(url) {
      var m = String(url || "").split("/object/public/" + C.storageBucket + "/");
      return m.length > 1 ? decodeURIComponent(m[1].split("?")[0]) : null;
    }
    function resetApp() {
      editing = null; form.reset(); form.elements.appid.value = "";
      $("#formTitle").textContent = "Add a new app"; $("#cancelEdit").hidden = true; $("#apkCurrent").textContent = "";
    }
    $("#cancelEdit").addEventListener("click", resetApp);

    function loadApps() {
      Promise.all([sb.from("apps").select("*").order("created_at", { ascending: false }), sb.from("app_secrets").select("*")]).then(function (res) {
        if (res[0].error) { list.innerHTML = '<p class="hint">Could not load apps: ' + esc(res[0].error.message) + "</p>"; return; }
        secrets = {}; ((res[1] && res[1].data) || []).forEach(function (s) { secrets[s.app_id] = s; });
        apps = res[0].data || [];
        list.innerHTML = apps.length ? apps.map(function (a) {
          var icon = safeUrl(a.icon_url);
          return '<div class="row-app">' + (icon ? '<img class="app-icon" src="' + esc(icon) + '" alt="">' : '<div class="app-icon">' + esc((a.name || "?").charAt(0).toUpperCase()) + "</div>") +
            '<div class="grow"><b>' + esc(a.name) + "</b><small>" + esc(a.version ? "v" + a.version : "") + (a.downloadable ? "" : " · no download yet") + "</small></div>" +
            '<button class="mini" type="button" data-edit="' + esc(a.id) + '">Edit</button><button class="mini danger" type="button" data-del="' + esc(a.id) + '">Delete</button></div>';
        }).join("") : '<p class="hint">No apps yet. Add your first app on the left.</p>';
      });
    }
    list.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-edit]"), del = e.target.closest("[data-del]");
      if (ed) {
        var a = apps.filter(function (x) { return String(x.id) === ed.dataset.edit; })[0]; if (!a) return;
        var sec = secrets[a.id] || {};
        editing = a; form.elements.appid.value = a.id;
        $("#appname").value = a.name || ""; $("#version").value = a.version || ""; $("#description").value = a.description || ""; $("#apkurl").value = sec.external_url || "";
        $("#apkCurrent").textContent = sec.apk_path ? "An APK file is already uploaded. Choose a new file only to replace it." : "";
        $("#formTitle").textContent = "Edit: " + a.name; $("#cancelEdit").hidden = false;
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (del) {
        var d = apps.filter(function (x) { return String(x.id) === del.dataset.del; })[0];
        if (!d || !confirm('Delete "' + d.name + '" permanently?')) return;
        var ip = publicPath(d.icon_url), ap = (secrets[d.id] || {}).apk_path;
        Promise.all([ip ? sb.storage.from(C.storageBucket).remove([ip]) : null, ap ? sb.storage.from(APK_BUCKET).remove([ap]) : null])
          .then(function () { return sb.from("apps").delete().eq("id", d.id); })
          .then(function (r) {
            if (r.error) show(msg, "Delete failed: " + r.error.message, false);
            else { show(msg, "App deleted.", true); if (editing && editing.id === d.id) resetApp(); loadApps(); }
          });
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      btn.disabled = true; btn.textContent = "Saving…"; msg.className = "msg";
      function done() { btn.disabled = false; btn.textContent = "Save app"; }
      var iconFile = $("#icon").files[0], apkFile = $("#apk").files[0];
      var old = editing ? (secrets[editing.id] || {}) : {};
      var sec = { apk_path: old.apk_path || null, external_url: $("#apkurl").value.trim() || null };
      if (sec.external_url && !safeUrl(sec.external_url)) { show(msg, "The external link must start with https://", false); done(); return; }
      var row = { name: $("#appname").value.trim(), version: $("#version").value.trim(), description: $("#description").value.trim(), icon_url: editing ? editing.icon_url : null };
      var replaced = null;
      if (iconFile) dz(iconDz, "busy"); if (apkFile) dz(apkDz, "busy");
      Promise.resolve().then(function () { return iconFile ? upload(C.storageBucket, iconFile, "icons").then(publicUrl) : row.icon_url; })
        .then(function (u) { row.icon_url = u; return apkFile ? upload(APK_BUCKET, apkFile, "apk") : sec.apk_path; })
        .then(function (p) {
          if (apkFile && sec.apk_path) replaced = sec.apk_path;
          sec.apk_path = p; row.downloadable = !!(sec.apk_path || sec.external_url);
          return editing ? sb.from("apps").update(row).eq("id", editing.id).select("id").single() : sb.from("apps").insert(row).select("id").single();
        })
        .then(function (r) {
          if (r.error) throw r.error;
          sec.app_id = r.data.id;
          return sb.from("app_secrets").upsert(sec, { onConflict: "app_id" });
        })
        .then(function (r) {
          if (r.error) throw r.error;
          if (replaced) sb.storage.from(APK_BUCKET).remove([replaced]);
          dz(iconDz, "done"); dz(apkDz, "done");
          show(msg, editing ? "App updated." : "App published!", true); resetApp(); loadApps(); loadStats();
        })
        .catch(function (err) { dz(iconDz, "fail"); dz(apkDz, "fail"); show(msg, "Error: " + (err.message || err), false); })
        .then(done);
    });

    /* ---------- portfolio items ---------- */
    var KINDS = {
      dev: [["app", "Android app (vertical image)"], ["web", "Website (wide image)"]],
      video: [["short", "Short-form edit (vertical)"], ["long", "Long-form edit (wide)"]]
    };
    var pf = $("#pfForm"), pfList = $("#pfList"), pfMsg = $("#pfMsg"), pfEditing = null, pfItems = [];
    function fillKinds(sel) {
      var k = $("#pfKind"); k.innerHTML = KINDS[$("#pfSection").value].map(function (x) { return '<option value="' + x[0] + '">' + x[1] + "</option>"; }).join("");
      if (sel) k.value = sel;
    }
    $("#pfSection").addEventListener("change", function () { fillKinds(); });
    fillKinds();
    function resetPf() {
      pfEditing = null; pf.reset(); pf.elements.pid.value = ""; fillKinds();
      $("#pfFormTitle").textContent = "Add portfolio item"; $("#pfCancel").hidden = true; $("#pfImgCurrent").textContent = "";
    }
    $("#pfCancel").addEventListener("click", resetPf);
    function loadPortfolio() {
      sb.from("portfolio_items").select("*").order("section").order("sort", { ascending: true }).order("created_at", { ascending: false }).then(function (r) {
        if (r.error) { pfList.innerHTML = '<p class="hint">Could not load items: ' + esc(r.error.message) + " (run supabase/upgrade-v2.sql)</p>"; return; }
        pfItems = r.data || [];
        pfList.innerHTML = pfItems.length ? pfItems.map(function (it) {
          var img = safeUrl(it.image_url);
          return '<div class="row-app">' + (img ? '<img class="app-icon" src="' + esc(img) + '" alt="">' : '<div class="app-icon">' + ico("image") + "</div>") +
            '<div class="grow"><b>' + esc(it.title) + "</b><small>" + (it.section === "dev" ? "App & Web" : "Video") + " · " + esc(it.kind) + "</small></div>" +
            '<button class="mini" type="button" data-pedit="' + esc(it.id) + '">Edit</button><button class="mini danger" type="button" data-pdel="' + esc(it.id) + '">Delete</button></div>';
        }).join("") : '<p class="hint">No items yet. The portfolio pages show "coming soon" placeholders until you add some.</p>';
      });
    }
    pfList.addEventListener("click", function (e) {
      var ed = e.target.closest("[data-pedit]"), del = e.target.closest("[data-pdel]");
      if (ed) {
        var it = pfItems.filter(function (x) { return String(x.id) === ed.dataset.pedit; })[0]; if (!it) return;
        pfEditing = it; pf.elements.pid.value = it.id;
        $("#pfSection").value = it.section; fillKinds(it.kind);
        $("#pfTitleIn").value = it.title || ""; $("#pfDescIn").value = it.description || ""; $("#pfLinkIn").value = it.link_url || ""; $("#pfSort").value = it.sort || 0;
        $("#pfImgCurrent").textContent = it.image_url ? "A thumbnail is already set. Choose a new image only to replace it." : "";
        $("#pfFormTitle").textContent = "Edit: " + it.title; $("#pfCancel").hidden = false;
        pf.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (del) {
        var d = pfItems.filter(function (x) { return String(x.id) === del.dataset.pdel; })[0];
        if (!d || !confirm('Delete "' + d.title + '"?')) return;
        var p = publicPath(d.image_url);
        (p ? sb.storage.from(C.storageBucket).remove([p]) : Promise.resolve()).then(function () { return sb.from("portfolio_items").delete().eq("id", d.id); }).then(function (r) {
          if (r.error) show(pfMsg, "Delete failed: " + r.error.message, false); else { show(pfMsg, "Item deleted.", true); if (pfEditing && pfEditing.id === d.id) resetPf(); loadPortfolio(); }
        });
      }
    });
    pf.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = pf.querySelector("button[type=submit]"); btn.disabled = true; btn.textContent = "Saving…"; pfMsg.className = "msg";
      function done() { btn.disabled = false; btn.textContent = "Save item"; }
      var link = $("#pfLinkIn").value.trim();
      if (link && !safeUrl(link)) { show(pfMsg, "The link must start with https://", false); done(); return; }
      var file = $("#pfImg").files[0];
      var row = { section: $("#pfSection").value, kind: $("#pfKind").value, title: $("#pfTitleIn").value.trim(), description: $("#pfDescIn").value.trim() || null, link_url: link || null, sort: parseInt($("#pfSort").value, 10) || 0, image_url: pfEditing ? pfEditing.image_url : null };
      var oldImg = null;
      if (file) dz(pfDz, "busy");
      Promise.resolve().then(function () {
        if (!file) return row.image_url;
        if (pfEditing) oldImg = publicPath(pfEditing.image_url);
        return upload(C.storageBucket, file, "portfolio").then(publicUrl);
      }).then(function (u) {
        row.image_url = u;
        return pfEditing ? sb.from("portfolio_items").update(row).eq("id", pfEditing.id) : sb.from("portfolio_items").insert(row);
      }).then(function (r) {
        if (r.error) throw r.error;
        if (oldImg) sb.storage.from(C.storageBucket).remove([oldImg]);
        dz(pfDz, "done");
        show(pfMsg, pfEditing ? "Item updated." : "Item added.", true); resetPf(); loadPortfolio();
      }).catch(function (err) { dz(pfDz, "fail"); show(pfMsg, "Error: " + (err.message || err), false); }).then(done);
    });

    /* ---------- reviews & feedback moderation ---------- */
    function loadReviews() {
      var box = $("#reviewList");
      Promise.all([sb.from("app_ratings").select("*").order("updated_at", { ascending: false }).limit(200), sb.from("apps").select("id,name")]).then(function (res) {
        if (res[0].error) { box.innerHTML = '<p class="hint">Could not load: ' + esc(res[0].error.message) + "</p>"; return; }
        var names = {}; ((res[1] && res[1].data) || []).forEach(function (a) { names[a.id] = a.name; });
        var rows = res[0].data || [];
        box.innerHTML = rows.length ? rows.map(function (r) {
          return '<div class="dl-row"><div class="grow"><small>' + esc(names[r.app_id] || "App") + " · " + esc(r.author || "User") + " · " + when(r.updated_at) + "</small><div>" + M.starsHTML(r.stars) + "</div>" +
            (r.comment ? "<p>" + esc(r.comment) + "</p>" : "") + '</div><button class="mini danger" type="button" data-rapp="' + esc(r.app_id) + '" data-ruser="' + esc(r.user_id) + '">Delete</button></div>';
        }).join("") : '<p class="hint">No reviews yet.</p>';
      });
    }
    $("#reviewList").addEventListener("click", function (e) {
      var b = e.target.closest("[data-rapp]"); if (!b || !confirm("Delete this review?")) return;
      sb.from("app_ratings").delete().eq("app_id", b.dataset.rapp).eq("user_id", b.dataset.ruser).then(function (r) {
        if (r.error) alert("Could not delete: " + r.error.message); else { loadReviews(); loadStats(); }
      });
    });
    function loadFeedback() {
      var box = $("#feedbackList");
      sb.from("feedback").select("*").order("created_at", { ascending: false }).limit(200).then(function (r) {
        if (r.error) { box.innerHTML = '<p class="hint">Could not load: ' + esc(r.error.message) + "</p>"; return; }
        var rows = r.data || [];
        box.innerHTML = rows.length ? rows.map(function (f) {
          return '<div class="dl-row"><div class="grow"><small>' + esc(f.email || f.author || "User") + " · " + when(f.created_at) + "</small>" + (f.site_rating ? "<div>" + M.starsHTML(f.site_rating) + "</div>" : "") +
            "<p>" + esc(f.message) + "</p>" + (f.image_path ? '<a class="fb-shot" target="_blank" rel="noopener" data-shot="' + esc(f.image_path) + '">Loading image…</a>' : "") +
            '</div><button class="mini danger" type="button" data-fdel="' + esc(f.id) + '">Delete</button></div>';
        }).join("") : '<p class="hint">No feedback yet.</p>';
        $$("[data-shot]", box).forEach(function (a) {
          sb.storage.from("feedback-files").createSignedUrl(a.dataset.shot, 3600).then(function (u) {
            var url = u && u.data && u.data.signedUrl;
            if (url) { a.href = url; a.innerHTML = '<img alt="Attached screenshot" src="' + esc(url) + '">'; } else a.textContent = "Image unavailable";
          });
        });
      });
    }
    $("#feedbackList").addEventListener("click", function (e) {
      var b = e.target.closest("[data-fdel]"); if (!b || !confirm("Delete this message?")) return;
      var shot = b.closest(".dl-row").querySelector("[data-shot]");
      sb.from("feedback").delete().eq("id", b.dataset.fdel).then(function (r) {
        if (!r.error && shot) sb.storage.from("feedback-files").remove([shot.dataset.shot]);
        if (r.error) alert("Could not delete: " + r.error.message); else { loadFeedback(); loadStats(); }
      });
    });

    /* ---------- site settings ---------- */
    var GROUPS = [
      ["Video Editing contacts", [
        ["edit_whatsapp", "WhatsApp number (with country code)"], ["edit_phone", "Business phone number"], ["edit_email", "Email"],
        ["edit_facebook", "Facebook link"], ["edit_tiktok", "TikTok link"], ["edit_capcut", "CapCut link"], ["edit_telegram", "Telegram channel link"]]],
      ["App & Web Development contacts", [
        ["dev_whatsapp", "WhatsApp number (with country code)"], ["dev_phone", "Business phone number"], ["dev_email", "Email"],
        ["dev_telegram", "Telegram channel link"], ["dev_facebook", "Facebook link"], ["dev_website", "Website link (leave empty to hide)"]]],
      ["Portfolio pages", [
        ["owner_name", "Your name on the portfolio"], ["portfolio_experience", "Years of experience, number only (empty hides the badge)"],
        ["dev_summary", "App & web summary", "area"], ["dev_skills", "App & web skills (comma separated, up to 6)"],
        ["video_summary", "Video editing summary", "area"], ["video_skills", "Video skills (comma separated, up to 6)"]]],
      ["Text", [["tagline", "Footer tagline"], ["about_text", "About text", "area"]]],
      ["Free-plan limits (for the storage meters)", [["limit_storage_mb", "File storage limit in MB"], ["limit_db_mb", "Database limit in MB"]]]
    ];
    function buildSettings(s) {
      $("#settingsFields").innerHTML = GROUPS.map(function (g) {
        return '<div class="setting-group"><h4>' + g[0] + "</h4>" + g[1].map(function (f) {
          var v = esc(s[f[0]] || "");
          return "<label>" + f[1] + "</label>" + (f[2] === "area" ? '<textarea class="field" data-key="' + f[0] + '">' + v + "</textarea>" : '<input class="field" data-key="' + f[0] + '" value="' + v + '">');
        }).join("") + "</div>";
      }).join("");
    }
    $("#saveSettings").addEventListener("click", function () {
      var rows = $$("[data-key]", $("#settingsFields")).map(function (i) { return { key: i.dataset.key, value: i.value.trim() }; });
      sb.from("site_settings").upsert(rows, { onConflict: "key" }).then(function (r) {
        if (r.error) { show($("#settingsMsg"), "Save failed: " + r.error.message, false); return; }
        rows.forEach(function (x) { settings[x.key] = x.value; });
        show($("#settingsMsg"), "Settings saved. Reload the public pages to see them.", true); loadStats();
      });
    });

    /* ---------- notices ---------- */
    function loadNotices() {
      var box = $("#noticeList");
      sb.from("notices").select("*").order("created_at", { ascending: false }).limit(100).then(function (r) {
        if (r.error) { box.innerHTML = '<p class="hint">Could not load: ' + esc(r.error.message) + " (run upgrade-v3.sql)</p>"; return; }
        var rows = r.data || [];
        box.innerHTML = rows.length ? rows.map(function (n) {
          return '<div class="dl-row"><div class="grow"><small>' + (n.urgent ? "URGENT · " : "") + when(n.created_at) + (n.active ? "" : " · hidden") + "</small><b>" + esc(n.title) + "</b>" +
            (n.body ? "<p>" + esc(n.body) + "</p>" : "") + '</div><button class="mini" type="button" data-ntoggle="' + esc(n.id) + '" data-on="' + (n.active ? 1 : 0) + '">' + (n.active ? "Hide" : "Show") +
            '</button><button class="mini danger" type="button" data-ndel="' + esc(n.id) + '">Delete</button></div>';
        }).join("") : '<p class="hint">No notices yet.</p>';
      });
    }
    $("#noticeList").addEventListener("click", function (e) {
      var t = e.target.closest("[data-ntoggle]"), d = e.target.closest("[data-ndel]");
      if (t) sb.from("notices").update({ active: t.dataset.on !== "1" }).eq("id", t.dataset.ntoggle).then(loadNotices);
      if (d && confirm("Delete this notice?")) sb.from("notices").delete().eq("id", d.dataset.ndel).then(loadNotices);
    });
    $("#noticeForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
      sb.from("notices").insert({ title: $("#nTitle").value.trim(), body: $("#nBody").value.trim() || null, urgent: $("#nUrgent").checked, author: ROLE }).then(function (r) {
        btn.disabled = false;
        if (r.error) { show($("#nMsg"), "Could not publish: " + r.error.message, false); return; }
        e.target.reset(); show($("#nMsg"), "Notice published.", true); loadNotices();
      });
    });

    /* ---------- users + admins (developer only) ---------- */
    var users = [];
    function drawUsers() {
      var q = ($("#userSearch").value || "").toLowerCase();
      var list = users.filter(function (u) { return (u.email || "").toLowerCase().indexOf(q) > -1; });
      $("#usersCap").textContent = users.length + " account" + (users.length === 1 ? "" : "s") + " · " + users.filter(function (u) { return u.verified; }).length + " verified";
      $("#userList").innerHTML = list.length ? list.map(function (u) {
        return '<div class="dl-row"><div class="grow"><b>' + esc(u.email) + "</b><small>Joined " + when(u.created_at) + (u.last_sign_in_at ? " · last seen " + when(u.last_sign_in_at) : "") + "</small></div>" +
          '<span class="pill ' + (u.verified ? "ok" : "warn") + '">' + (u.verified ? "Verified" : "Not verified") + "</span>" +
          (u.staff ? '<span class="pill adm">Admin</span><button class="mini danger" type="button" data-unstaff="' + esc(u.email) + '">Remove admin</button>' :
            '<button class="mini" type="button" data-mkstaff="' + esc(u.email) + '">Make admin</button>') + "</div>";
      }).join("") : '<p class="hint">No accounts found.</p>';
    }
    function loadUsers() {
      if (ROLE !== "developer") return;
      sb.rpc("admin_users").then(function (r) {
        if (r.error) { $("#userList").innerHTML = '<p class="hint">Could not load: ' + esc(r.error.message) + " (run upgrade-v3.sql)</p>"; return; }
        users = r.data || []; drawUsers();
      });
      sb.from("staff").select("*").order("created_at").then(function (r) {
        var rows = (r && r.data) || [];
        $("#staffList").innerHTML = rows.length ? "<h4>Current admins</h4>" + rows.map(function (x) { return '<div class="kv"><span>' + esc(x.email) + "</span><span>" + when(x.created_at) + "</span></div>"; }).join("") : '<p class="hint">No extra admins yet.</p>';
      });
    }
    function setStaff(email, on, msgEl) {
      var q = on ? sb.from("staff").upsert({ email: email.toLowerCase() }, { onConflict: "email" }) : sb.from("staff").delete().eq("email", email.toLowerCase());
      return q.then(function (r) {
        if (r.error) { show(msgEl || $("#staffMsg"), r.error.message, false); return; }
        show($("#staffMsg"), on ? email + " is now an admin." : "Admin removed.", true); loadUsers();
      });
    }
    $("#userSearch").addEventListener("input", drawUsers);
    $("#userList").addEventListener("click", function (e) {
      var a = e.target.closest("[data-mkstaff]"), b = e.target.closest("[data-unstaff]");
      if (a && confirm("Make " + a.dataset.mkstaff + " an admin?")) setStaff(a.dataset.mkstaff, true);
      if (b && confirm("Remove admin rights from " + b.dataset.unstaff + "?")) setStaff(b.dataset.unstaff, false);
    });
    $("#staffForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var em = $("#staffEmail").value.trim();
      if (em.toLowerCase() === String(session_email()).toLowerCase()) { show($("#staffMsg"), "You are already the developer.", false); return; }
      setStaff(em, true).then(function () { $("#staffEmail").value = ""; });
    });

    /* start everything once all variables above exist */
    startPresence();
    loadApps();
    loadPortfolio();
  }
})();
