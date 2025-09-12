"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">プライバシーポリシー</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">プライバシーポリシー</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              最終更新日: 2025年9月12日
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">1. 基本方針</h3>
                <p className="text-sm leading-relaxed">
                  本アプリは、利用者の個人情報を保護することの重要性を認識し、適切に取り扱います。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">2. 収集する情報</h3>
                <p className="text-sm leading-relaxed mb-2">
                  本アプリは、利用者の入力した検索条件やお気に入り登録をブラウザのローカルストレージに保存します。
                </p>
                <p className="text-sm leading-relaxed">
                  本アプリは、外部サーバーに個人情報を送信することはありません。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">3. 情報の利用目的</h3>
                <p className="text-sm leading-relaxed mb-2">
                  保存した情報は以下の目的にのみ利用されます。
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>お気に入りメニューの表示</li>
                  <li>検索条件の再現</li>
                  <li>PWAにおけるオフライン利用</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">4. 情報の第三者提供</h3>
                <p className="text-sm leading-relaxed">
                  本アプリは、利用者の情報を第三者に提供することはありません。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">5. アクセス解析・広告</h3>
                <p className="text-sm leading-relaxed">
                  本アプリは広告配信やアクセス解析サービスを利用していません。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">6. セキュリティ</h3>
                <p className="text-sm leading-relaxed">
                  本アプリは身内利用を前提とし、パスワードによってアクセス制限を行っています。利用者はパスワードを第三者に漏らさないよう注意してください。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">7. 免責事項</h3>
                <p className="text-sm leading-relaxed">
                  利用者が本アプリを利用する際に入力・保存した情報が、利用者自身の端末の操作・設定等により消去または流出した場合、開発者は責任を負いません。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">8. プライバシーポリシーの変更</h3>
                <p className="text-sm leading-relaxed">
                  必要に応じて本ポリシーを改定することがあります。改定後の内容は、本アプリ内に掲示した時点で効力を生じます。
                </p>
              </section>

              <div className="text-center pt-6">
                <p className="text-sm text-muted-foreground">
                  以上
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
