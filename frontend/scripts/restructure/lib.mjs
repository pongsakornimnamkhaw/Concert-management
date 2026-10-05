import fs from 'node:fs'
import path from 'node:path'

// Matches module specifiers in: `from '...'`, `import '...'`, `import('...')`,
// and `vi.mock('...')`.
const SPECIFIER_RE = /(\bfrom\s*|\bimport\s*\(?\s*|\bvi\.mock\s*\(\s*)(['"])([^'"\n]+)\2/g

const CODE_EXT_RE = /\.(tsx?|jsx?)$/

export function rewriteSpecifiers(source, rewrite) {
  return source.replace(SPECIFIER_RE, (match, prefix, quote, spec) => {
    const next = rewrite(spec)
    return next == null || next === spec ? match : `${prefix}${quote}${next}${quote}`
  })
}

function splitQuery(spec) {
  const i = spec.indexOf('?')
  return i === -1 ? [spec, ''] : [spec.slice(0, i), spec.slice(i)]
}

// fileRel is the importing file's path relative to src/, e.g. "pages/Customer/Home/index.tsx".
export function toAliasSpecifier(fileRel, spec) {
  if (!spec.startsWith('./') && !spec.startsWith('../')) return null
  const [specPath, query] = splitQuery(spec)
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fileRel), specPath))
  if (resolved.startsWith('..')) return null // points outside src/, leave it alone
  return `@/${resolved}${query}`
}

// mapping: { "src/old/path": "src/new/path" } (frontend-relative). Entries without a file
// extension are directories. Returns a function that remaps one "@/..." specifier.
export function buildRemapper(mapping) {
  const files = new Map()
  const dirs = []
  for (const [from, to] of Object.entries(mapping)) {
    if (!from.startsWith('src/') || !to.startsWith('src/')) {
      throw new Error(`Mapping paths must start with src/: ${from} -> ${to}`)
    }
    const f = from.slice(4)
    const t = to.slice(4)
    if (path.posix.extname(from) === '') {
      dirs.push([f, t])
      continue
    }
    files.set(f, t)
    if (CODE_EXT_RE.test(f)) files.set(f.replace(CODE_EXT_RE, ''), t.replace(CODE_EXT_RE, ''))
  }
  dirs.sort((a, b) => b[0].length - a[0].length)

  return function remap(spec) {
    if (!spec.startsWith('@/')) return null
    const [specPath, query] = splitQuery(spec.slice(2))
    let next = files.get(specPath)
    if (next !== undefined && next.endsWith('/index') && !specPath.endsWith('/index')) {
      next = next.slice(0, -'/index'.length)
    }
    if (next === undefined) {
      const hit = dirs.find(([from]) => specPath === from || specPath.startsWith(`${from}/`))
      if (hit) next = hit[1] + specPath.slice(hit[0].length)
    }
    return next === undefined ? null : `@/${next}${query}`
  }
}

export function listSourceFiles(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.posix.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listSourceFiles(full))
    else if (CODE_EXT_RE.test(entry.name)) out.push(full)
  }
  return out
}
