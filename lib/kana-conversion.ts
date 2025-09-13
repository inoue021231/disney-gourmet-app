/**
 * ひらがな・カタカナ変換ユーティリティ
 */

// ひらがなからカタカナへの変換マップ
const hiraganaToKatakanaMap: { [key: string]: string } = {
  'あ': 'ア', 'い': 'イ', 'う': 'ウ', 'え': 'エ', 'お': 'オ',
  'か': 'カ', 'き': 'キ', 'く': 'ク', 'け': 'ケ', 'こ': 'コ',
  'が': 'ガ', 'ぎ': 'ギ', 'ぐ': 'グ', 'げ': 'ゲ', 'ご': 'ゴ',
  'さ': 'サ', 'し': 'シ', 'す': 'ス', 'せ': 'セ', 'そ': 'ソ',
  'ざ': 'ザ', 'じ': 'ジ', 'ず': 'ズ', 'ぜ': 'ゼ', 'ぞ': 'ゾ',
  'た': 'タ', 'ち': 'チ', 'つ': 'ツ', 'て': 'テ', 'と': 'ト',
  'だ': 'ダ', 'ぢ': 'ヂ', 'づ': 'ヅ', 'で': 'デ', 'ど': 'ド',
  'な': 'ナ', 'に': 'ニ', 'ぬ': 'ヌ', 'ね': 'ネ', 'の': 'ノ',
  'は': 'ハ', 'ひ': 'ヒ', 'ふ': 'フ', 'へ': 'ヘ', 'ほ': 'ホ',
  'ば': 'バ', 'び': 'ビ', 'ぶ': 'ブ', 'べ': 'ベ', 'ぼ': 'ボ',
  'ぱ': 'パ', 'ぴ': 'ピ', 'ぷ': 'プ', 'ぺ': 'ペ', 'ぽ': 'ポ',
  'ま': 'マ', 'み': 'ミ', 'む': 'ム', 'め': 'メ', 'も': 'モ',
  'や': 'ヤ', 'ゆ': 'ユ', 'よ': 'ヨ',
  'ら': 'ラ', 'り': 'リ', 'る': 'ル', 'れ': 'レ', 'ろ': 'ロ',
  'わ': 'ワ', 'ゐ': 'ヰ', 'ゑ': 'ヱ', 'を': 'ヲ', 'ん': 'ン',
  'ゃ': 'ャ', 'ゅ': 'ュ', 'ょ': 'ョ', 'っ': 'ッ', 'ー': 'ー'
}

// カタカナからひらがなへの変換マップ
const katakanaToHiraganaMap: { [key: string]: string } = Object.fromEntries(
  Object.entries(hiraganaToKatakanaMap).map(([hira, kata]) => [kata, hira])
)

/**
 * ひらがなをカタカナに変換
 */
export function hiraganaToKatakana(text: string): string {
  return text.split('').map(char => hiraganaToKatakanaMap[char] || char).join('')
}

/**
 * カタカナをひらがなに変換
 */
export function katakanaToHiragana(text: string): string {
  return text.split('').map(char => katakanaToHiraganaMap[char] || char).join('')
}

/**
 * ひらがな・カタカナの両方で検索可能な正規表現パターンを生成
 */
export function createKanaSearchPattern(query: string): RegExp {
  const hiraganaQuery = katakanaToHiragana(query)
  const katakanaQuery = hiraganaToKatakana(query)
  
  // 元のクエリ、ひらがな版、カタカナ版のすべてで検索
  const patterns = [query, hiraganaQuery, katakanaQuery]
    .filter((pattern, index, array) => array.indexOf(pattern) === index) // 重複除去
    .map(pattern => pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // 正規表現エスケープ
  
  return new RegExp(`(${patterns.join('|')})`, 'i')
}

/**
 * テキストがクエリにマッチするかチェック（ひらがな・カタカナ対応）
 */
export function matchesKanaSearch(text: string, query: string): boolean {
  if (!query.trim()) return true
  
  const hiraganaText = katakanaToHiragana(text)
  const katakanaText = hiraganaToKatakana(text)
  const hiraganaQuery = katakanaToHiragana(query)
  const katakanaQuery = hiraganaToKatakana(query)
  
  const searchText = text.toLowerCase()
  const searchQuery = query.toLowerCase()
  
  return (
    searchText.includes(searchQuery) ||
    hiraganaText.includes(hiraganaQuery) ||
    katakanaText.includes(katakanaQuery) ||
    hiraganaText.includes(katakanaQuery) ||
    katakanaText.includes(hiraganaQuery)
  )
}
