// کیش کا نیا ورژن تاکہ براؤزر لازمی اپ ڈیٹ کرے
const staticCacheName = 'hifz-tracker-v2';

// وہ تمام فائلیں جو آف لائن چلانے کے لیے کیش کرنی ہیں (درست پاتھ کے ساتھ)
const assetsToCache = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    // آن لائن لائبریریاں بھی کیش کی جا رہی ہیں
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// انسٹال ایونٹ
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('Caching shell assets with correct paths');
            return cache.addAll(assetsToCache);
        })
    );
});

// ایکٹیویٹ ایونٹ
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// فیچ ایونٹ
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            return cacheRes || fetch(evt.request);
        })
    );
});
