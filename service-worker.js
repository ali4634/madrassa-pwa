 // اس ریپوزٹری کے لیے کیش کا نیا نام اور ورژن
const staticCacheName = 'madrassa-pwa-static-v1';

// آپ کی ریپوزٹری میں موجود فائلوں کی درست لسٹ
const assets = [
    '/madrassa-pwa/',
    '/madrassa-pwa/index.html',
    '/madrassa-pwa/manifest.json',
    '/madrassa-pwa/icon-192.png',
    '/madrassa-pwa/icon-512.png'
    // نوٹ: اس لسٹ میں style.css یا script.js شامل نہیں کیونکہ وہ موجود نہیں ہیں
];

// انسٹال ایونٹ: سروس ورکر انسٹال ہوتے وقت یہ تمام فائلیں کیش کر لیتا ہے
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching assets for madrassa-pwa');
            return cache.addAll(assets);
        })
    );
});

// ایکٹیویٹ ایونٹ: پرانے کیش کو صاف کرتا ہے
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName) // صرف پرانے کیش ڈیلیٹ ہوں گے
                .map(key => caches.delete(key))
            );
        })
    );
});

// فیچ ایونٹ: جب ایپ کوئی فائل مانگتی ہے تو یہ ایونٹ چلتا ہے
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            // اگر فائل کیش میں موجود ہے تو وہیں سے دے دو، ورنہ انٹرنیٹ سے لاؤ
            return cacheRes || fetch(evt.request);
        })
    );
});
