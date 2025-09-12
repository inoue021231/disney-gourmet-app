"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

export default function TermsPage() {
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
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">利用規約</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">利用規約</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              最終更新日: 2025年9月12日
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-3">第1条（適用）</h3>
                <p className="text-sm leading-relaxed">
                  本利用規約（以下「本規約」といいます。）は、本アプリ「ディズニーグルメアプリ」の利用条件を定めるものです。本アプリを利用される場合は、本規約に同意したものとみなします。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">第2条（非公式であることの明示）</h3>
                <p className="text-sm leading-relaxed mb-2">
                  本アプリは、東京ディズニーリゾート、株式会社オリエンタルランド、ウォルト・ディズニー・カンパニー等の関連会社とは一切関係がありません。
                </p>
                <p className="text-sm leading-relaxed">
                  本アプリは個人の趣味による非営利かつ身内限定の利用を目的としており、商用利用は行いません。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">第3条（著作権・商標）</h3>
                <p className="text-sm leading-relaxed mb-2">
                  本アプリに表示されるメニュー名称、価格、画像、文章等に関する著作権・商標権は、すべて各権利者に帰属します。
                </p>
                <p className="text-sm leading-relaxed">
                  利用者は、権利者の許可なく本アプリの内容を複製、転載、頒布、改変してはなりません。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">第4条（免責事項）</h3>
                <p className="text-sm leading-relaxed mb-2">
                  本アプリに掲載されている情報は、作成時点の内容をもとにしています。実際の提供内容・価格・期間等は変更される場合があります。利用者は必ず公式サイト等で最新の情報を確認してください。
                </p>
                <p className="text-sm leading-relaxed">
                  本アプリの利用により生じた損害について、開発者は一切の責任を負いません。
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">第5条（禁止事項）</h3>
                <p className="text-sm leading-relaxed mb-2">
                  利用者は、以下の行為を行ってはなりません。
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                  <li>本アプリを営利目的で利用すること</li>
                  <li>不正アクセス、改ざん、リバースエンジニアリング等の行為</li>
                  <li>本アプリのパスワードを無断で第三者に公開する行為</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-3">第6条（規約の変更）</h3>
                <p className="text-sm leading-relaxed">
                  開発者は、必要に応じて本規約を変更することがあります。変更後の内容は、本アプリ内に掲示した時点で効力を生じます。
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
