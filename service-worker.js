// کیش کا نیا ورژن تاکہ براؤزر لازمی طور پر اپ ڈیٹ کرے
const staticCacheName = 'hifz-tracker-static-v5';
const dynamicCacheName = 'hifz-tracker-dynamic-v5';

// وہ تمام فائلیں جو انسٹال ہوتے وقت لازمی کیش ہونی چاہییں
// سب سے اہم تبدیلی: Font Awesome کی فائل کو یہاں شامل کیا گیا ہے
const staticAssets = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css'
];

// انسٹال ایونٹ: مقامی اور ضروری بیرونی فائلیں کیش کرتا ہے
self.addEventListener('install', async (evt) => {
    try {
        const cache = await caches.open(staticCacheName);
        console.log('Caching static assets including Font Awesome');
        await cache.addAll(staticAssets);
    } catch (err) {
        console.error('Failed to cache static assets:', err);
    }
});

// ایکٹیویٹ ایونٹ: پرانے تمام کیش کو صاف کرتا ہے
self.addEventListener('activate', async (evt) => {
    const keys = await caches.keys();
    await Promise.all(
        keys
            .filter(key => key !== staticCacheName && key !== dynamicCacheName)
            .map(key => caches.delete(key))
    );
});

// فیچ ایونٹ: پہلے کیش میں دیکھتا ہے، پھر نیٹ ورک پر جاتا ہے
self.addEventListener('fetch', (evt) => {
    // صرف بیرونی GET درخواستوں کو کیش کریں
    if (evt.request.method === 'GET' && !evt.request.url.startsWith('chrome-extension://')) {
        evt.respondWith(
            caches.match(evt.request).then(cacheRes => {
                // اگر کیش میں ہے تو وہیں سے دیں
                if (cacheRes) {
                    return cacheRes;
                }
                // ورنہ نیٹ ورک سے لا کر ڈائنامک کیش میں محفوظ کریں
                return fetch(evt.request).then(fetchRes => {
                    return caches.open(dynamicCacheName).then(cache => {
                        cache.put(evt.request.url, fetchRes.clone());
                        return fetchRes;
                    });
                });
            })
        );
    }
});
