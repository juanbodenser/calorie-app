// sw.js
self.addEventListener("install", e => { // evento de instalación del Service Worker
    console.log("Service Worker instalado");
});

self.addEventListener("fetch", e => {
    // de momento vacío
});