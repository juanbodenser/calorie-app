// sw.js

// Service Worker para cachear los archivos esenciales de la app y permitir su funcionamiento offline
const CACHE_NAME = "app-cache-v2";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/style.css",
    "/app.js",
    "/manifest.json",
    "/icono-192.png",
    "/icono-512.png"
];

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request)
            .then(res => res || fetch(e.request))
    );
});