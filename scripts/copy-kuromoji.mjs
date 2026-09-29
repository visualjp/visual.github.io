// npm install 後に kuromoji 本体と辞書を public/ へコピー（ふりがな自動生成用・オフライン対応）
import { cpSync, existsSync } from 'node:fs'
if (existsSync('node_modules/kuromoji')) {
  cpSync('node_modules/kuromoji/build/kuromoji.js', 'public/kuromoji.js')
  cpSync('node_modules/kuromoji/dict', 'public/dict', { recursive: true })
}
