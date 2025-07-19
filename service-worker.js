 const staticCacheName = 'site-static-v5'; // ورژن نمبر بدل دیا ہے تاکہ یہ اپ ڈیٹ ہو
const dynamicCacheName = 'site-dynamic-v5';

// سروس ورکر کو انسٹال کرتے وقت کیش کی جانے والی فائلیں
const assets = [
    '/madrassa-pwa/',
    '/madrassa-pwa/index.html',
    '/madrassa-pwa/js/app.js',
    '/madrassa-pwa/js/ui.js',
    '/madrassa-pwa/js/materialize.min.js',
    '/madrassa-pwa/css/styles.css',
    '/madrassa-pwa/css/materialize.min.css',
    '/madrassa-pwa/img/dish.png',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
    '/madrassa-pwa/pages/fallback.html',
    '/madrassa-pwa/manifest.json' // مینی فیسٹ کو بھی کیش کر لیں
];

// کیش کا سائز محدود کرنے کی فنکشن
const limitCacheSize = (name, size) => {
    caches.open(name).then(cache => {
        cache.keys().then(keys => {
            if(keys.length > size){
                cache.delete(keys[0]).then(() => limitCacheSize(name, size));
            }
        });
    });
};

// انسٹال ایونٹ
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('caching shell assets');
            return cache.addAll(assets);
        })
    );
});

// ایکٹیویٹ ایونٹ
self.addEventListener('activate', evt => {
    evt.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(keys
                .filter(key => key !== staticCacheName && key !== dynamicCacheName)
                .map(key => caches.delete(key))
            );
        })
    );
});

// فیچ ایونٹ (سب سے اہم)
self.addEventListener('fetch', evt => {
    if(evt.request.url.indexOf('firestore.googleapis.com') === -1){ // اگر فائر اسٹور کی ریکویسٹ نہ ہو
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                // اگر کیش میں ہے تو وہیں سے دیں
                return cacheRes || fetch(evt.request).then(fetchRes => {
                    // اگر کیش میں نہیں تو نیٹ ورک سے لائیں اور ڈائنامک کیش میں ڈال دیں
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone());
                        limitCacheSize(dynamicCacheName, 15);
                        return fetchRes;
                    });
                });
            }).catch(() => {
                // اگر نیٹ ورک فیل ہو جائے تو فال بیک پیج دکھائیں
                if(evt.request.url.indexOf('.html') > -1){
                    return caches.match('/madrassa-pwa/pages/fallback.html');
                }
            })
        );
    }
});```

       ۔
