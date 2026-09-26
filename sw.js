/* Service Worker سبک «دفتریار معلم»
   وظیفه: کش‌کردن فایل‌های همین پروژه (HTML/Manifest/آیکن‌ها) تا برنامه پس از اولین بار باز شدن،
   تا حد امکان بدون اینترنت هم اجرا شود. هیچ تماسی با سرور یا API نمی‌زند،
   و به localStorage / ساختار داده برنامه کاری ندارد. */

const CACHE_NAME = 'daftaryar-moallem-v1';

self.addEventListener('install', function (event) {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* راهبرد: ابتدا شبکه (تا همیشه آخرین نسخه گرفته شود)، و اگر شبکه در دسترس نبود،
   نسخه‌ی کش‌شده برگردانده می‌شود. هر پاسخ موفق شبکه، خودکار در کش تازه می‌شود —
   نیازی به فهرست ثابتی از نام فایل‌ها نیست (چون نام فایل HTML ممکن است فارسی/متفاوت باشد). */
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;

  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // فقط فایل‌های همین پروژه، نه منابع بیرونی

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return fetch(event.request)
        .then(function (networkResponse) {
          if (networkResponse && networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(function () {
          return cache.match(event.request).then(function (cached) {
            if (cached) return cached;
            if (event.request.mode === 'navigate') {
              return cache.match('./');
            }
            return undefined;
          });
        });
    })
  );
});
