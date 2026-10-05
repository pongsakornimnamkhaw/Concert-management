// Moves files/directories with `git mv` and rewrites every "@/..." import that pointed at them.
// Usage (from frontend/):
//   node scripts/restructure/move.mjs scripts/restructure/moves/<file>.json
//   node scripts/restructure/move.mjs --rewrite-only scripts/restructure/moves/<file>.json
// The JSON maps frontend-relative paths: { "src/old/path": "src/new/path" }; entries without
// a file extension are directories. --rewrite-only skips `git mv` and only fixes imports
// (for branches that already merged the moved files from main).
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { buildRemapper, listSourceFiles, rewriteSpecifiers } from './lib.mjs'

const args = process.argv.slice(2)
const rewriteOnly = args.includes('--rewrite-only')
const mappingFile = args.find((a) => !a.startsWith('--'))
if (!mappingFile) {
  console.error('usage: node scripts/restructure/move.mjs [--rewrite-only] <mapping.json>')
  process.exit(1)
}
const mapping = JSON.parse(fs.readFileSync(mappingFile, 'utf8'))
const remap = buildRemapper(mapping)

if (!rewriteOnly) {
  for (const [from, to] of Object.entries(mapping)) {
    if (!fs.existsSync(from)) throw new Error(`source does not exist: ${from}`)
    if (fs.existsSync(to)) throw new Error(`target already exists: ${to}`)
  }
  for (const [from, to] of Object.entries(mapping)) {
    fs.mkdirSync(path.dirname(to), { recursive: true })
    execFileSync('git', ['mv', from, to], { stdio: 'inherit' })
  }
}

let changed = 0
for (const file of listSourceFiles('src')) {
  const before = fs.readFileSync(file, 'utf8')
  const after = rewriteSpecifiers(before, remap)
  if (after !== before) {
    fs.writeFileSync(file, after)
    changed++
  }
}
const moved = rewriteOnly ? 0 : Object.keys(mapping).length
console.log(`move: ${moved} paths moved, imports rewritten in ${changed} files`)
