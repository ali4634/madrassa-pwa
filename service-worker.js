 // کیش کا نام اور ورژن۔ جب بھی آپ فائلیں بدلیں تو اس ورژن کو بدل دیں (v1 سے v2، پھر v3)
const staticCacheName = 'site-static-v3';

// وہ فائلیں جو آپ کی ریپوزٹری میں ہیں اور آف لائن چلنے کے لیے ضروری ہیں
const assets = [
    '/madrassa-pwa/', // یہ آپ کی ایپ کا روٹ (root) ہے
    '/madrassa-pwa/index.html',
    '/madrassa-pwa/manifest.json',
    '/madrassa-pwa/icon-192.png',
    '/madrassa-pwa/icon-512.png',
    // --- اگر آپ کی ایپ میں CSS یا JS فائلیں ہیں تو انہیں بھی یہاں شامل کریں ---
    // مثال کے طور پر:
    // '/madrassa-pwa/css/styles.css',
    // '/madrassa-pwa/js/app.js'
];

// انسٹال ایونٹ: سروس ورکر انسٹال ہوتے وقت یہ تمام فائلیں کیش کر لیتا ہے
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching shell assets');
            return cache.addAll(assets);
        })
    );
});

// ایکٹیویٹ ایونٹ: پرانے کیش کو صاف کرتا ہے
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

// فیچ ایونٹ: جب ایپ کوئی فائل مانگتی ہے تو یہ ایونٹ چلتا ہے
self.addEventListener('fetch', evt => {
    evt.respondWith(
        // پہلے کیش میں تلاش کرو
        caches.match(evt.request).then(cacheRes => {
            // اگر فائل کیش میں موجود ہے تو وہیں سے دے دو، ورنہ انٹرنیٹ سے لاؤ
            return cacheRes || fetch(evt.request);
        })
    );
});
