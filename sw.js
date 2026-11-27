/* MRM service worker: makes the site installable and usable offline.
   Bump CACHE when you change files so visitors get the new version. */
var CACHE = "mrm-v11";
var CORE = [
  "./", "index.html", "video-editing.html", "development.html", "apps.html", "about.html",
  "terms.html", "privacy.html", "login.html", "admin.html", "feedback.html",
  "portfolio-dev.html", "portfolio-video.html", "config.js",
  "assets/style.css", "assets/app.js", "assets/admin.js", "assets/dropzone.js", "verified.html", "reset.html", "report.html", "assets/portfolio.js", "verified.html",
  "assets/logo.svg", "assets/me.webp",
  "assets/icon-192.png", "assets/icon-512.png", "manifest.webmanifest"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return; // never touch Supabase / CDN requests
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) {
        return hit || (req.mode === "navigate" ? caches.match("index.html") : undefined);
      });
    })
  );
});
