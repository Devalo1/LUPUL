// Service Worker optimizat pentru Galaxy S24 FE
const CACHE_NAME = "lupul-corbul-galaxy-v1";
const CRITICAL_RESOURCES = [
  "/",
  "/src/main.tsx",
  "/src/index.css",
  "/src/assets/styles/main.css",
  "/src/assets/styles/mobile-galaxy-fix.css",
  "/galaxy-optimization.js",
  "/images/background.jpeg",
  "/images/LC.png",
];

// Instalarea service worker-ului
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("SW: Cache opened");
        // Pre-cache doar resursele critice pentru Galaxy
        return cache.addAll(
          CRITICAL_RESOURCES.map((url) => {
            return new Request(url, {
              mode: "no-cors",
              credentials: "omit",
            });
          })
        );
      })
      .catch((err) => {
        console.log("SW: Cache failed to open", err);
      })
  );
});

// Activarea service worker-ului
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("SW: Deleting old cache", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Strategia de fetch pentru Galaxy S24 FE
self.addEventListener("fetch", (event) => {
  // Doar pentru cereri GET
  if (event.request.method !== "GET") {
    return;
  }

  // Skip pentru cereri de API externe
  if (
    event.request.url.includes("api.openai.com") ||
    event.request.url.includes("firestore.googleapis.com")
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Returnează din cache dacă există
      if (response) {
        console.log("SW: Serving from cache:", event.request.url);
        return response;
      }

      // Altfel, fetch de la rețea
      return fetch(event.request.clone())
        .then((response) => {
          // Verifică dacă răspunsul este valid
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clonează răspunsul pentru cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // Cache doar pentru resurse statice
            if (
              event.request.url.includes(".css") ||
              event.request.url.includes(".js") ||
              event.request.url.includes(".jpeg") ||
              event.request.url.includes(".png") ||
              event.request.url.includes(".svg")
            ) {
              console.log("SW: Caching new resource:", event.request.url);
              cache.put(event.request, responseToCache);
            }
          });

          return response;
        })
        .catch(() => {
          // Fallback pentru imagini
          if (event.request.url.includes("/images/background.jpeg")) {
            return new Response(
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="%23333"/></svg>',
              { headers: { "Content-Type": "image/svg+xml" } }
            );
          }

          // Fallback pentru HTML
          if (event.request.headers.get("accept").includes("text/html")) {
            return caches.match("/offline.html");
          }
        });
    })
  );
});

// Optimizări specifice pentru Galaxy S24 FE
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "GALAXY_OPTIMIZATION") {
    // Preload resurse importante pentru Galaxy
    const criticalUrls = [
      "/src/assets/styles/mobile-galaxy-fix.css",
      "/galaxy-optimization.js",
    ];

    criticalUrls.forEach((url) => {
      fetch(url).then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(url, response.clone());
          });
        }
      });
    });
  }
});

// Performance monitoring pentru Galaxy devices
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync-galaxy") {
    event.waitUntil(
      // Sync în background pentru Galaxy
      Promise.resolve()
    );
  }
});
