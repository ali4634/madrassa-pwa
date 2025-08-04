// اس ریپوزٹری کے لیے کیش کا نیا نام اور ورژن
const staticCacheName = 'madrassa-pwa-static-v2';

// تمام پاتھ کو relative (./) کردیا گیا ہے تاکہ وہ ہر حال میں کام کریں
const assets = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// انسٹال ایونٹ: سروس ورکر انسٹال ہوتے وقت یہ تمام فائلیں کیش کر لیتا ہے
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching assets with relative paths');
            return cache.addAll(assets);
        }).catch(err => {
            console.error('Failed to cache assets:', err); // ایرر دیکھنے کے لیے
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
