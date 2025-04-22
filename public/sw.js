// Service Worker pentru cache-ing și funcționalități offline
// Acest fișier trebuie plasat în directorul public pentru a putea fi accesat

// Versiunea cache-ului - se incrementează la fiecare modificare a strategiei de cache
const CACHE_VERSION = 'v1';
const CACHE_NAME = `lupul-corbul-cache-${CACHE_VERSION}`;

// Lista resurselor care trebuie pre-cache-uite (pentru disponibilitate offline imediată)
const PRE_CACHED_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html', // Pagina afișată când utilizatorul este offline
  '/favicon.ico',
  '/manifest.json',
  '/images/LC.png',
  '/images/romanian-pattern.png'
];

// Pentru resursele dinamice, folosim o strategie de cache diferită
const DYNAMIC_CACHE_NAME = `lupul-corbul-dynamic-cache-${CACHE_VERSION}`;

// Strategii de cache pentru diferite tipuri de resurse
const CACHE_STRATEGIES = {
  cacheFirst: [
    // Resurse statice care nu se schimbă frecvent
    /\.(js|css|woff2?|ttf|eot|svg|png|jpe?g|gif|webp|ico)$/i
  ],
  networkFirst: [
    // Resurse dinamice sau care se actualizează frecvent
    '/',
    '/index.html',
    '/api/'
  ],
  networkOnly: [
    // Resurse care nu ar trebui niciodată cache-uite
    '/api/auth',
    '/api/checkout'
  ]
};

// Instalare - pre-cache-uiește resursele esențiale
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Pre-caching resources');
        return cache.addAll(PRE_CACHED_RESOURCES);
      })
      .then(() => {
        console.log('[Service Worker] Installation completed');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Pre-cache error:', error);
      })
  );
});

// Activare - curăță cache-urile vechi
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('lupul-corbul-cache') && 
                  cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Now ready to handle fetches!');
        return self.clients.claim();
      })
  );
});

// Funcție pentru a verifica dacă URL-ul se potrivește cu un pattern
const matchesPattern = (url, patterns) => {
  const urlString = url.toString();
  return patterns.some(pattern => {
    return typeof pattern === 'string' 
      ? urlString.includes(pattern) 
      : pattern.test(urlString);
  });
};

// Determină strategia de cache pentru un request
const getCacheStrategy = (request) => {
  const url = new URL(request.url);
  
  // Verifică dacă este o cerere de navigare
  if (request.mode === 'navigate') {
    return 'networkFirst';
  }
  
  // Verifică strategiile în funcție de URL
  if (matchesPattern(url, CACHE_STRATEGIES.cacheFirst)) {
    return 'cacheFirst';
  }
  
  if (matchesPattern(url, CACHE_STRATEGIES.networkFirst)) {
    return 'networkFirst';
  }
  
  if (matchesPattern(url, CACHE_STRATEGIES.networkOnly)) {
    return 'networkOnly';
  }
  
  // Implicit, folosim Network First pentru majoritatea resurselor
  return 'networkFirst';
};

// Strategie Cache First: prima dată încercăm din cache, apoi din rețea
const handleCacheFirst = async (request) => {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    
    // Clonăm răspunsul pentru că body-ul poate fi citit o singură dată
    if (request.method === 'GET' && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache First fetch failed:', error);
    // Dacă nu avem nimic în cache și rețeaua eșuează, returnăm o eroare
    return new Response('Network error occurred', { status: 408, headers: { 'Content-Type': 'text/plain' } });
  }
};

// Strategie Network First: prima dată încercăm din rețea, apoi din cache
const handleNetworkFirst = async (request) => {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    
    // Cache-uim doar requesturile GET și răspunsurile de succes
    if (request.method === 'GET' && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network First - falling back to cache');
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Dacă este o cerere de navigare și nu găsim nimic, servim pagina offline
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    // Pentru alte tipuri de cereri, returnăm o eroare
    return new Response('You are offline', { 
      status: 503, 
      headers: { 'Content-Type': 'text/plain' } 
    });
  }
};

// Strategie Network Only: doar din rețea, fără cache
const handleNetworkOnly = async (request) => {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[Service Worker] Network Only fetch failed:', error);
    // Pentru cereri de API, returnăm un JSON cu eroare
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({ error: 'You are offline' }), { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Pentru alte cereri, returnăm un text simplu
    return new Response('Network error occurred', { 
      status: 503, 
      headers: { 'Content-Type': 'text/plain' } 
    });
  }
};

// Interceptează cererile de fetch și aplică strategiile de cache corespunzătoare
self.addEventListener('fetch', (event) => {
  const strategy = getCacheStrategy(event.request);
  
  switch (strategy) {
    case 'cacheFirst':
      event.respondWith(handleCacheFirst(event.request));
      break;
    case 'networkFirst':
      event.respondWith(handleNetworkFirst(event.request));
      break;
    case 'networkOnly':
      event.respondWith(handleNetworkOnly(event.request));
      break;
    default:
      event.respondWith(handleNetworkFirst(event.request));
  }
});

// Ascultă mesajele de la aplicație
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});