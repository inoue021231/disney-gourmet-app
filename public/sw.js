const CACHE_NAME = "theme-park-food-v4"
const urlsToCache = [
  "/",
  "/favorites",
  "/restaurants",
  "/settings",
  "/manifest.json",
  // 静的アセット
  "/icon.png",
  "/no-image-light.png",
  "/no-image-dark.png",
  // フォント（Geist）
  // 画像は動的にキャッシュ
]

// インストール時
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// フェッチ時
self.addEventListener("fetch", (event) => {
  // 開発環境の場合、Next.jsの開発用ファイルはキャッシュしない
  if (event.request.url.includes('/_next/') || 
      event.request.url.includes('/hot-reload') ||
      event.request.url.includes('localhost:3000') ||
      event.request.url.includes('localhost:3001') ||
      event.request.url.includes('127.0.0.1:3000') ||
      event.request.url.includes('127.0.0.1:3001') ||
      event.request.url.includes('.hot-update.') ||
      event.request.url.includes('webpack-hmr')) {
    return // Service Workerを通さず、直接fetchする
  }

  // ナビゲーションリクエスト（ページ遷移）の場合は常にネットワークから取得
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // ネットワークエラーの場合はキャッシュから返す
        return caches.match('/')
      })
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // キャッシュにあればそれを返す
      if (response) {
        return response
      }

      return fetch(event.request).then((response) => {
        // 有効なレスポンスでない場合はそのまま返す
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // レスポンスをクローンしてキャッシュに保存
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          // 画像やAPIレスポンスをキャッシュ
          if (event.request.destination === "image" || event.request.url.includes("/api/")) {
            cache.put(event.request, responseToCache)
          }
        })

        return response
      })
    }),
  )
})

// アクティベート時（古いキャッシュを削除）
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
