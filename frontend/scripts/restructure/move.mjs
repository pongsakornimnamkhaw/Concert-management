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

// On Windows an editor/file watcher can hold a directory open, so renaming the directory
// fails with "Permission denied" even though its files can be moved one by one.
function gitMove(from, to) {
  try {
    execFileSync('git', ['mv', from, to], { stdio: 'pipe' })
    return
  } catch (error) {
    if (!fs.statSync(from).isDirectory()) throw error
  }
  const tracked = execFileSync('git', ['ls-files', '-z', '--', from], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
  for (const file of tracked) {
    const target = path.posix.join(to, path.posix.relative(from, file))
    fs.mkdirSync(path.dirname(target), { recursive: true })
    execFileSync('git', ['mv', file, target], { stdio: 'pipe' })
  }
  fs.rmSync(from, { recursive: true, force: true, maxRetries: 3 })
}

if (!rewriteOnly) {
  const pending = []
  for (const [from, to] of Object.entries(mapping)) {
    if (!fs.existsSync(from) && fs.existsSync(to)) {
      console.log(`skip (already moved): ${from}`)
      continue
    }
    if (!fs.existsSync(from)) throw new Error(`source does not exist: ${from}`)
    if (fs.existsSync(to)) throw new Error(`target already exists: ${to}`)
    pending.push([from, to])
  }
  for (const [from, to] of pending) {
    fs.mkdirSync(path.dirname(to), { recursive: true })
    gitMove(from, to)
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
