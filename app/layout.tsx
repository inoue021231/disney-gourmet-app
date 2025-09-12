import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { BottomNavigation } from "@/components/bottom-navigation"
import { ToastProvider } from "@/components/toast-provider"
import { FavoritesProvider } from "@/components/favorites-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "ディズニーグルメ検索",
  description: "ディズニーリゾートのグルメ情報を検索・お気に入り登録できるアプリ",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ディズニーグルメ検索",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "ディズニーグルメ検索",
    title: "ディズニーグルメ検索",
    description: "ディズニーリゾートのグルメ情報を検索・お気に入り登録できるアプリ",
  },
  twitter: {
    card: "summary",
    title: "ディズニーグルメ検索",
    description: "ディズニーリゾートのグルメ情報を検索・お気に入り登録できるアプリ",
  },
}

export const viewport: Viewport = {
  themeColor: "#003DA5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#003DA5" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <FavoritesProvider>
            <ToastProvider>
              <Suspense fallback={null}>
                <div className="pb-16 min-h-screen">{children}</div>
                <BottomNavigation />
              </Suspense>
            </ToastProvider>
          </FavoritesProvider>
        </ThemeProvider>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Service Workerは本番環境でのみ有効化
              if ('serviceWorker' in navigator && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              } else if ('serviceWorker' in navigator) {
                // 開発環境では既存のService Workerを削除
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for(let registration of registrations) {
                    registration.unregister();
                    console.log('SW unregistered for development');
                  }
                });
                // キャッシュも削除
                caches.keys().then(function(names) {
                  for (let name of names) {
                    caches.delete(name);
                    console.log('Cache deleted:', name);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
