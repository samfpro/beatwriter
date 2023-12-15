// service-worker.js

const CACHE_NAME = 'beatwriter-cache-v1';
const urlsToCache = [
  'index.html',
  'styles.css',
  'constants.js',
  'cell.js',
  'gridView.js',
  'getSyllables.js',
  'modeWrite.js',
  'modeArrange.js',
  'modePlay.js',
  'fileManager.js',
  'textToAudioBlob.js',
  'controlPanel.js',
  'valueController.js',
  'beatWriter.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});