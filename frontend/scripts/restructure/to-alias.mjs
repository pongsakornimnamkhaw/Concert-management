// Rewrites every relative import inside src/ to the "@/..." alias.
// Usage (from frontend/): node scripts/restructure/to-alias.mjs
import fs from 'node:fs'
import { listSourceFiles, rewriteSpecifiers, toAliasSpecifier } from './lib.mjs'

let changed = 0
for (const file of listSourceFiles('src')) {
  const fileRel = file.slice('src/'.length)
  const before = fs.readFileSync(file, 'utf8')
  const after = rewriteSpecifiers(before, (spec) => toAliasSpecifier(fileRel, spec))
  if (after !== before) {
    fs.writeFileSync(file, after)
    changed++
  }
}
console.log(`to-alias: rewrote imports in ${changed} files`)
