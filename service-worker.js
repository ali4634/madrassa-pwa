const staticCacheName = 'hifz-tracker-static-v3'; // مقامی فائلوں کا کیش
const dynamicCacheName = 'hifz-tracker-dynamic-v3'; // بیرونی فائلوں کا کیش

// وہ مقامی فائلیں جو انسٹال ہوتے ہی کیش ہونی چاہییں
const staticAssets = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// انسٹال ایونٹ: صرف مقامی فائلیں کیش کرتا ہے
self.addEventListener('install', evt => {
    evt.waitUntil(
        caches.open(staticCacheName).then(cache => {
            console.log('Caching static assets');
            return cache.addAll(staticAssets);
        })
    );
});

// ایکٹیویٹ ایونٹ: پرانے تمام کیش کو صاف کرتا ہے
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

// فیچ ایونٹ: یہ ہے سب سے اہم حصہ
self.addEventListener('fetch', evt => {
    evt.respondWith(
        caches.match(evt.request).then(cacheRes => {
            // اگر فائل کیش میں موجود ہے تو وہیں سے دے دو
            if (cacheRes) {
                return cacheRes;
            }
            
            // اگر کیش میں نہیں ہے، تو نیٹ ورک سے لاؤ
            return fetch(evt.request).then(fetchRes => {
                // اور اس نئی فائل کو ڈائنامک کیش میں محفوظ کر لو
                return caches.open(dynamicCacheName).then(cache => {
                    // response کو کلون کرنا ضروری ہے کیونکہ اسے دو جگہ استعمال کیا جا رہا ہے
                    cache.put(evt.request.url, fetchRes.clone());
                    return fetchRes;
                });
            });
        }).catch(() => {
            // اگر نیٹ ورک بھی فیل ہو جائے (یعنی صارف مکمل آف لائن ہے)
            // تو یہاں ایک آف لائن فال بیک صفحہ دکھایا جا سکتا ہے
        })
    );
});
