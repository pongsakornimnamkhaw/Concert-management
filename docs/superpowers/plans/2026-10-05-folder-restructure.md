# Folder Structure Standardization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the Concert-management repo into a standard layout: a feature-based React frontend (`src/features/<subsystem>/{api,components,pages,…}`), a conventional Go `cmd/<tool>` backend, and all non-code material under a root `docs/` folder. No behavior changes.

**Architecture:** Frontend moves are done mechanically by two small Node scripts committed to `frontend/scripts/restructure/`. `to-alias.mjs` first converts every relative import to the existing `@/` alias. After that, `move.mjs` runs `git mv` from a JSON mapping and rewrites every `@/old/path` import to `@/new/path`. One mapping file per subsystem gives one reviewable commit per subsystem. The same scripts (with `--rewrite-only`) let teammates migrate their open branches. Backend changes are plain `git mv`/`git rm` because Go import paths do not change (only `package main` dirs move).

**Tech Stack:** React 19 + TypeScript 6 + Vite 8 + Vitest 4 + oxlint (frontend); Go 1.26 + Fiber + GORM (backend); Node 24 `node:test` for the script tests.

**Spec:** No separate spec doc. The requirements come from the user request "จัดโครงสร้างโฟลเดอร์ให้เป็นมาตรฐาน" plus two answers given in this session: **full restructure** (feature-based frontend) and **course files may move to `docs/`**. The whole migration was dry-run in a scratch worktree before this plan was written. Every mapping below was run, and the result passed `tsc -b`, 211/211 vitest tests, `vite build`, oxlint (18 warnings / 0 errors, same as before), and `go build/vet/test ./...`.

## Global Constraints

- No behavior changes: no route paths, API calls, component logic or styling may change. The only edits allowed inside source files are import specifiers, plus the specific text edits listed in a task.
- Use `git mv` / `git rm` for every move and deletion so history follows the files.
- Run all shell commands in **Git Bash** (the commands use POSIX syntax). Frontend commands run from `frontend/`; backend commands run from `backend/`.
- Frontend green bar after every task: `npx tsc -b` exits 0, and `npx vitest run` reports `Tests 211 passed` (minus tests deleted in Task 1, which is none). Known flake: `PasswordResetRequestsPanel.test.tsx › allows rejecting a request with a reason` can hit the 5 s timeout when the machine is loaded. If it is the only failure, rerun that one file (`npx vitest run PasswordResetRequestsPanel`), and it must pass.
- Backend green bar: `go build ./... && go vet ./... && go test ./...` all OK.
- If `go` fails with `creating work dir: GetFileAttributesEx D:/gotmp`, run `export GOTMPDIR="$(cygpath -w "$TEMP")"` first. The machine's `GOTMPDIR` points to a missing folder.
- **Do not move `frontend/src/assets/poster/`.** `backend/cmd/server/poster_seed.go` and `backend/cmd/seed-reports/main.go` read the `.png` files there by path.
- Naming conventions for the new tree: feature folders are camelCase (`userManagement`, `eventRegistration`), page folders are PascalCase with an `index.tsx` (`pages/PromotionList/index.tsx`), grouping folders inside `components/` are camelCase (`components/seatSelection`), and imports use the `@/` alias.
- `features/eventRegistration` and `features/ticketPlanning` are already feature folders. Leave their internals untouched.
- Out of scope (do not do these): splitting `backend/internal/handlers` into per-domain Go packages, which would require exporting shared helpers (an API change, not a move); splitting `promotion/types/promotion.ts` (it also holds employee types used by `userManagement`/`auth`). Both are possible follow-ups.
- Work on branch `chore/restructure-folders`. Five teammates have open remote branches (`korn`, `gg`, `gg-new`, `B6733377`, `chinese_people`, `java`). Task 15 writes the migration guide for them.

---

## Target layout

```
Concert-management/
├── README.md                    (new)
├── go.work / go.work.sum        (unchanged)
├── docs/
│   ├── RESTRUCTURE.md           (new: old→new map + teammate migration)
│   ├── test-accounts.md         (← test.md)
│   ├── team/B67xxxxx.md         (← frontend/B*.md; backend duplicates removed)
│   ├── diagrams/{booking,payment}/
│   ├── ui-examples/<subsystem>/ (← frontend/ui-example, English folder names)
│   ├── backend/{MANAGEMENT.md,REPORT_DATA.md}
│   └── superpowers/plans/
├── backend/
│   ├── cmd/
│   │   ├── server/                (API server + poster seed)
│   │   ├── check-demo-data/       (← cmd/server/check-demo-data)
│   │   ├── seed-customer-demo/    (← cmd/server/…)
│   │   ├── seed-employees/
│   │   ├── seed-management/
│   │   └── seed-reports/
│   ├── internal/{access,config,eventregistration,handlers,mailer,models,seed,ticketplanning}/
│   ├── tests/                     (API integration tests)
│   ├── compose.yml, run.ps1, .env.example, go.mod, README.md
│   └── (removed: database/, tmp/, *.exe, B*.md)
└── frontend/
    ├── index.html, vite.config.ts, tsconfig*.json, package.json, .oxlintrc.json, README.md
    ├── public/logo.png
    ├── scripts/restructure/       (migration scripts + mappings)
    └── src/
        ├── main.tsx, index.css, setupTests.ts, vite-env.d.ts
        ├── app/            App.tsx (routes), App.css
        ├── theme/          theme.ts
        ├── layouts/        backoffice/ (Layout, Header, Sidebar, PromotionLayout), customer/ (CustomerHeader, …)
        ├── shared/         components/ (ConfirmDeleteDialog, ErrorAlert, Logo, Pagination), utils/posterPalette.ts
        ├── assets/         contact/, logo/, poster/, posterSlide/, promptpay-qr/, report/
        └── features/
            ├── auth/              access/, api/, components/, pages/, utils/
            ├── userManagement/    api/, components/, pages/
            ├── promotion/         api/, components/, pages/, types/, utils/
            ├── concert/           api/, components/, data/, hooks/, pages/, utils/
            ├── artist/            api/, pages/, utils/
            ├── booking/           api/, components/, pages/, types/, utils/   (booking + payment)
            ├── contact/           components/, pages/, types/
            ├── report/            api/, components/, data/, pages/, types/
            ├── eventRegistration/ (unchanged)
            └── ticketPlanning/    (unchanged)
```

Subsystem → owner (from the team files): concert + artist → B6707651; eventRegistration + ticketPlanning → B6708856; promotion + userManagement → B6717537; booking (booking + payment) → B6728786; contact + report → B6733377. `auth` is cross-cutting infrastructure.

---

### Task 0: Branch

**Files:** none

- [ ] **Step 1: Create the working branch from an up-to-date main**

```bash
git checkout main && git pull --ff-only && git checkout -b chore/restructure-folders
```

Expected: `Switched to a new branch 'chore/restructure-folders'`.

- [ ] **Step 2: Record the baseline**

```bash
cd frontend && npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests " ; npx oxlint 2>&1 | grep -c ': warning'
```

Expected: tsc silent, `Tests 211 passed (211)` (see the flake note in Global Constraints), and `18` warnings.

---

### Task 1: Delete dead frontend code and unused assets; move the theme into `src/`

Every file below was verified unreachable from `src/main.tsx` with `tsc --listFilesOnly` on an entry-only tsconfig, and no test imports any of them. The asset files have zero references in `src/` or `index.html`.

**Files:**
- Delete: `frontend/src/auth/` (AuthContext, AuthProvider, useAuth), `frontend/src/interface/`, `frontend/src/services/`, `frontend/src/components/third-party/`, `frontend/src/features/registration/`, `frontend/src/features/venueSeats/`, `frontend/src/assets/posters/`
- Delete: `frontend/src/components/{BuyTicketButton,ConcertCard,ConcertGrid,NavBar,PosterImage,SlidePoster}.tsx`, `frontend/src/components/SeatSelection/SeatMap.tsx`, `frontend/src/components/_frontend/{Header,LoginModal}.tsx`, `frontend/src/components/compo_ConsertReport/Header.tsx`, `frontend/src/components/posterShow/index.ts`
- Delete: `frontend/src/data/mockPromotions.ts`, `frontend/src/hooks/useConcerts.ts`, `frontend/src/theme.ts`, `frontend/src/theme/theme.ts`, `frontend/src/utils/{arenaShapes,format,mockConcerts,mockZones,zoneTierColors}.ts`
- Delete assets: `frontend/src/assets/{hero.png,react.svg,vite.svg,logo1.png,logo2.png}`, `frontend/src/assets/poster/{celestial,flux,pulse,starlight}.jpg` (the `.png` files stay), `frontend/src/assets/poster_neon_flux_1786112915843.jpg`, `poster_neon_pulse_1786112899522.jpg`, `poster_neon_pulse_live_1786112930705.jpg`, `poster_starlight_1786112947982.jpg`, `frontend/public/banners/`, `frontend/public/icons.svg`, `frontend/public/favicon.svg`
- Delete: `frontend/eslint.config.js` (the project lints with oxlint; eslint is not a dependency)
- Move: `frontend/theme.ts` → `frontend/src/theme/theme.ts`
- Modify: `frontend/src/main.tsx:8`, `frontend/tsconfig.app.json:28`

- [ ] **Step 1: Delete the dead files**

```bash
cd frontend
git rm -r -q src/assets/posters src/auth src/components/BuyTicketButton.tsx src/components/ConcertCard.tsx \
  src/components/ConcertGrid.tsx src/components/NavBar.tsx src/components/PosterImage.tsx src/components/SlidePoster.tsx \
  src/components/SeatSelection/SeatMap.tsx src/components/_frontend/Header.tsx src/components/_frontend/LoginModal.tsx \
  src/components/compo_ConsertReport/Header.tsx src/components/posterShow/index.ts src/components/third-party \
  src/data/mockPromotions.ts src/features/registration src/features/venueSeats src/hooks/useConcerts.ts src/interface \
  src/services src/theme.ts src/theme/theme.ts src/utils/arenaShapes.ts src/utils/format.ts src/utils/mockConcerts.ts \
  src/utils/mockZones.ts src/utils/zoneTierColors.ts src/assets/hero.png src/assets/react.svg src/assets/vite.svg \
  src/assets/logo1.png src/assets/logo2.png src/assets/poster/celestial.jpg src/assets/poster/flux.jpg \
  src/assets/poster/pulse.jpg src/assets/poster/starlight.jpg src/assets/poster_neon_flux_1786112915843.jpg \
  src/assets/poster_neon_pulse_1786112899522.jpg src/assets/poster_neon_pulse_live_1786112930705.jpg \
  src/assets/poster_starlight_1786112947982.jpg public/banners public/icons.svg public/favicon.svg eslint.config.js
```

Expected: no output, exit 0.

- [ ] **Step 2: Move the real theme into `src/theme/`**

```bash
mkdir -p src/theme && git mv theme.ts src/theme/theme.ts
```

- [ ] **Step 3: Point `main.tsx` at the moved theme**

In `frontend/src/main.tsx`, replace line 8:

```ts
import theme from '../theme.ts'
```

with:

```ts
import theme from '@/theme/theme'
```

- [ ] **Step 4: Drop the root `theme.ts` from the tsconfig include list**

In `frontend/tsconfig.app.json`, replace:

```json
  "include": ["src", "theme.ts"]
```

with:

```json
  "include": ["src"]
```

- [ ] **Step 5: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests " && npm run build 2>&1 | grep -E "built in|error"
```

Expected: tsc silent, `Tests 211 passed (211)`, and `✓ built in …` with no `error`.

- [ ] **Step 6: Commit**

```bash
git add -A . && git commit -m "chore(frontend): remove unreachable code and unused assets, move theme into src"
```

---

### Task 2: Add the restructure scripts (TDD)

**Files:**
- Create: `frontend/scripts/restructure/lib.mjs`
- Create: `frontend/scripts/restructure/lib.test.mjs`
- Create: `frontend/scripts/restructure/to-alias.mjs`
- Create: `frontend/scripts/restructure/move.mjs`

**Interfaces:**
- Produces (used by Tasks 3–12 and by teammates):
  - `node scripts/restructure/to-alias.mjs`: rewrites relative imports under `src/` to `@/…`.
  - `node scripts/restructure/move.mjs [--rewrite-only] <mapping.json>`: the mapping is `{ "src/old": "src/new" }`, frontend-relative, and keys with no file extension are directories.
  - `lib.mjs` exports `rewriteSpecifiers(source, rewrite)`, `toAliasSpecifier(fileRel, spec)`, `buildRemapper(mapping)`, and `listSourceFiles(dir)`.

- [ ] **Step 1: Write the failing tests**

Create `frontend/scripts/restructure/lib.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildRemapper, rewriteSpecifiers, toAliasSpecifier } from './lib.mjs'

test('toAliasSpecifier converts relative paths inside src', () => {
  assert.equal(toAliasSpecifier('pages/Customer/Home/index.tsx', '../../../api/concertApi'), '@/api/concertApi')
  assert.equal(toAliasSpecifier('App.tsx', './App.css'), '@/App.css')
  assert.equal(
    toAliasSpecifier('features/ticketPlanning/TicketPlanningModule.tsx', './styles.css?inline'),
    '@/features/ticketPlanning/styles.css?inline',
  )
})

test('toAliasSpecifier leaves packages, aliases and paths outside src alone', () => {
  assert.equal(toAliasSpecifier('main.tsx', 'react'), null)
  assert.equal(toAliasSpecifier('main.tsx', '@/App'), null)
  assert.equal(toAliasSpecifier('main.tsx', '../theme.ts'), null)
})

test('rewriteSpecifiers handles every import form', () => {
  const src = [
    "import a from './a'",
    "import './a.css'",
    "export * from './b'",
    "import {",
    "  c,",
    "} from './c'",
    "const d = await import('./d')",
    "vi.mock('./e', () => ({}))",
    "import React from 'react'",
  ].join('\n')
  const out = rewriteSpecifiers(src, (spec) => (spec.startsWith('./') ? `@/x/${spec.slice(2)}` : null))
  assert.equal(
    out,
    [
      "import a from '@/x/a'",
      "import '@/x/a.css'",
      "export * from '@/x/b'",
      "import {",
      "  c,",
      "} from '@/x/c'",
      "const d = await import('@/x/d')",
      "vi.mock('@/x/e', () => ({}))",
      "import React from 'react'",
    ].join('\n'),
  )
})

test('buildRemapper remaps files, extensionless imports, index files and directories', () => {
  const remap = buildRemapper({
    'src/components/ErrorAlert.tsx': 'src/shared/components/ErrorAlert.tsx',
    'src/ConsertReportPage.tsx': 'src/features/report/pages/ConcertReportPage/index.tsx',
    'src/ConsertReportPage.css': 'src/features/report/pages/ConcertReportPage/ConcertReportPage.css',
    'src/components/SeatSelection': 'src/features/booking/components/seatSelection',
  })
  assert.equal(remap('@/components/ErrorAlert'), '@/shared/components/ErrorAlert')
  assert.equal(remap('@/components/ErrorAlert.tsx'), '@/shared/components/ErrorAlert.tsx')
  assert.equal(remap('@/ConsertReportPage'), '@/features/report/pages/ConcertReportPage')
  assert.equal(
    remap('@/ConsertReportPage.css'),
    '@/features/report/pages/ConcertReportPage/ConcertReportPage.css',
  )
  assert.equal(
    remap('@/components/SeatSelection/dialogs/QRCodeDialog'),
    '@/features/booking/components/seatSelection/dialogs/QRCodeDialog',
  )
  assert.equal(remap('@/components/SeatSelectionX'), null)
  assert.equal(remap('@/components/ErrorAlertBox'), null)
  assert.equal(remap('react'), null)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
node --test scripts/restructure/lib.test.mjs
```

Expected: FAIL with `Cannot find module '.../scripts/restructure/lib.mjs'`. (Pass the file path explicitly. `node --test <dir>` does not work on Windows.)

- [ ] **Step 3: Implement `lib.mjs`**

Create `frontend/scripts/restructure/lib.mjs`:

```js
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
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
node --test scripts/restructure/lib.test.mjs 2>&1 | grep -E "^ℹ (pass|fail)"
```

Expected: `ℹ pass 4` and `ℹ fail 0`.

- [ ] **Step 5: Add the two CLI scripts**

Create `frontend/scripts/restructure/to-alias.mjs`:

```js
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
```

Create `frontend/scripts/restructure/move.mjs`:

```js
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
```

- [ ] **Step 6: Make sure the scripts don't break the app's checks**

```bash
npx tsc -b && npx oxlint 2>&1 | grep -c ': error'
```

Expected: tsc silent and `0`. (`scripts/` is outside `src/`, so tsc and vitest ignore it.)

- [ ] **Step 7: Commit**

```bash
git add scripts/restructure && git commit -m "chore(frontend): add import codemod and move scripts for restructure"
```

---

### Task 3: Convert all relative imports to the `@/` alias

**Files:**
- Modify: about 63 files under `frontend/src/` (import lines only)

**Interfaces:**
- Consumes: `scripts/restructure/to-alias.mjs` (Task 2)
- Produces: a `src/` where every internal import starts with `@/`. Task 4 onward depends on this.

- [ ] **Step 1: Run the codemod**

```bash
node scripts/restructure/to-alias.mjs
```

Expected: `to-alias: rewrote imports in 63 files` (± a few if main moved on).

- [ ] **Step 2: Verify that no relative imports remain**

```bash
grep -rEn "(from|import|mock\()\s*\(?['\"]\.\.?/" src | wc -l
```

Expected: `0`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src && git commit -m "refactor(frontend): use @/ alias for all internal imports"
```

---

### Task 4: Move the app shell, layouts and shared components

**Files:**
- Create: `frontend/scripts/restructure/moves/01-app-shared.json`
- Move: everything listed in the JSON below

**Interfaces:**
- Consumes: `move.mjs` (Task 2), alias-only imports (Task 3)
- Produces: `@/app/App`, `@/layouts/backoffice/{Layout,Header,Sidebar,PromotionLayout}`, `@/layouts/customer/{CustomerHeader,CustomerConcertNotifications}`, `@/shared/components/{ConfirmDeleteDialog,Logo,ErrorAlert,Pagination}`, `@/shared/utils/posterPalette`, `@/assets/logo/octavia-logo.png`

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/01-app-shared.json`:

```json
{
  "src/App.tsx": "src/app/App.tsx",
  "src/App.css": "src/app/App.css",
  "src/components/layout": "src/layouts/backoffice",
  "src/components/common/CustomerHeader.tsx": "src/layouts/customer/CustomerHeader.tsx",
  "src/components/common/CustomerHeader.test.tsx": "src/layouts/customer/CustomerHeader.test.tsx",
  "src/components/common/CustomerConcertNotifications.tsx": "src/layouts/customer/CustomerConcertNotifications.tsx",
  "src/components/common/ConfirmDeleteDialog.tsx": "src/shared/components/ConfirmDeleteDialog.tsx",
  "src/components/common/Logo.tsx": "src/shared/components/Logo.tsx",
  "src/components/ErrorAlert.tsx": "src/shared/components/ErrorAlert.tsx",
  "src/components/ui/Pagination.tsx": "src/shared/components/Pagination.tsx",
  "src/utils/posterPalette.ts": "src/shared/utils/posterPalette.ts",
  "src/utils/posterPalette.test.ts": "src/shared/utils/posterPalette.test.ts",
  "src/assets/octavia-logo.png": "src/assets/logo/octavia-logo.png"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/01-app-shared.json
```

Expected: `move: 13 paths moved, imports rewritten in 45 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move app shell, layouts and shared components"
```

---

### Task 5: Move the auth feature

**Files:**
- Create: `frontend/scripts/restructure/moves/02-auth.json`
- Move: everything listed in the JSON below

**Interfaces:**
- Produces: `@/features/auth/access/{backofficeAccess,useFeatureAccess,useModuleAccess}`, `@/features/auth/api/{customerAccountApi,employeeAuthApi}`, `@/features/auth/utils/{customerSession,employeeSession}`, `@/features/auth/components/{CustomerRouteGuard,EmployeeRouteGuard,LoginForm,RegisterForm,ForgotPasswordForm,ResetPasswordForm}`, `@/features/auth/pages/{CustomerLogin,CustomerForgotPassword,CustomerResetPassword,CustomerRegister,EmployeeLogin,EmployeePasswordRecovery,EmployeePasswordSetup}`

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/02-auth.json`:

```json
{
  "src/access": "src/features/auth/access",
  "src/api/customerAccountApi.ts": "src/features/auth/api/customerAccountApi.ts",
  "src/api/customerAccountApi.test.ts": "src/features/auth/api/customerAccountApi.test.ts",
  "src/api/employeeAuthApi.ts": "src/features/auth/api/employeeAuthApi.ts",
  "src/api/employeeAuthApi.test.ts": "src/features/auth/api/employeeAuthApi.test.ts",
  "src/utils/customerSession.ts": "src/features/auth/utils/customerSession.ts",
  "src/utils/employeeSession.ts": "src/features/auth/utils/employeeSession.ts",
  "src/components/auth/CustomerRouteGuard.tsx": "src/features/auth/components/CustomerRouteGuard.tsx",
  "src/components/auth/EmployeeRouteGuard.tsx": "src/features/auth/components/EmployeeRouteGuard.tsx",
  "src/components/auth/EmployeeRouteGuard.test.tsx": "src/features/auth/components/EmployeeRouteGuard.test.tsx",
  "src/components/common/LoginForm.tsx": "src/features/auth/components/LoginForm.tsx",
  "src/components/common/LoginForm.test.tsx": "src/features/auth/components/LoginForm.test.tsx",
  "src/components/common/RegisterForm.tsx": "src/features/auth/components/RegisterForm.tsx",
  "src/components/common/ForgotPasswordForm.tsx": "src/features/auth/components/ForgotPasswordForm.tsx",
  "src/components/common/ForgotPasswordForm.test.tsx": "src/features/auth/components/ForgotPasswordForm.test.tsx",
  "src/components/common/ResetPasswordForm.tsx": "src/features/auth/components/ResetPasswordForm.tsx",
  "src/components/common/ResetPasswordForm.test.tsx": "src/features/auth/components/ResetPasswordForm.test.tsx",
  "src/pages/Login_page/Login": "src/features/auth/pages/CustomerLogin",
  "src/pages/Login_page/ForgotPassword": "src/features/auth/pages/CustomerForgotPassword",
  "src/pages/Login_page/ResetPassword": "src/features/auth/pages/CustomerResetPassword",
  "src/pages/Customer/Register": "src/features/auth/pages/CustomerRegister",
  "src/pages/Employee/Login": "src/features/auth/pages/EmployeeLogin",
  "src/pages/Employee/PasswordRecovery": "src/features/auth/pages/EmployeePasswordRecovery",
  "src/pages/Employee/PasswordSetup": "src/features/auth/pages/EmployeePasswordSetup"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/02-auth.json
```

Expected: `move: 24 paths moved, imports rewritten in 53 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move auth into features/auth"
```

---

### Task 6: Move the userManagement feature

**Files:**
- Create: `frontend/scripts/restructure/moves/03-user-management.json`
- Move: everything listed in the JSON below

**Interfaces:**
- Produces: `@/features/userManagement/api/employeeAccountApi`, `@/features/userManagement/components/PasswordResetRequestsPanel`, `@/features/userManagement/pages/{EmployeeList,EmployeeForm,UsageHistory,EmployeeAccount}`

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/03-user-management.json`:

```json
{
  "src/api/employeeAccountApi.ts": "src/features/userManagement/api/employeeAccountApi.ts",
  "src/api/employeeAccountApi.test.ts": "src/features/userManagement/api/employeeAccountApi.test.ts",
  "src/pages/Employee/employees/EmployeeListPage.tsx": "src/features/userManagement/pages/EmployeeList/index.tsx",
  "src/pages/Employee/employees/EmployeeFormPage.tsx": "src/features/userManagement/pages/EmployeeForm/index.tsx",
  "src/pages/Employee/employees/PasswordResetRequestsPanel.tsx": "src/features/userManagement/components/PasswordResetRequestsPanel.tsx",
  "src/pages/Employee/employees/PasswordResetRequestsPanel.test.tsx": "src/features/userManagement/components/PasswordResetRequestsPanel.test.tsx",
  "src/pages/Employee/history/UsageHistoryPage.tsx": "src/features/userManagement/pages/UsageHistory/index.tsx",
  "src/pages/Employee/history/UsageHistoryPage.test.tsx": "src/features/userManagement/pages/UsageHistory/UsageHistoryPage.test.tsx",
  "src/pages/Employee/Account": "src/features/userManagement/pages/EmployeeAccount"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/03-user-management.json
```

Expected: `move: 9 paths moved, imports rewritten in 15 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move user management into features/userManagement"
```

---

### Task 7: Move the promotion feature

**Files:**
- Create: `frontend/scripts/restructure/moves/04-promotion.json`
- Move: everything listed in the JSON below

**Interfaces:**
- Produces: `@/features/promotion/api/{managementApi,customerPromotionApi}`, `@/features/promotion/types/{promotion,customerPromotion}`, `@/features/promotion/utils/{customerPromotion,typography}`, `@/features/promotion/components/StatusBadge`, `@/features/promotion/pages/{PromotionList,PromotionDetail,PromotionForm,PromotionApproval,CustomerPromotions,CustomerPromotionDetail}`
- Note: `managementApi` and `types/promotion` are also imported by `userManagement`, `auth` and `app/App.tsx`. That cross-feature import is intentional (see Global Constraints → out of scope).

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/04-promotion.json`:

```json
{
  "src/api/managementApi.ts": "src/features/promotion/api/managementApi.ts",
  "src/api/customerPromotionApi.ts": "src/features/promotion/api/customerPromotionApi.ts",
  "src/api/customerPromotionApi.test.ts": "src/features/promotion/api/customerPromotionApi.test.ts",
  "src/types/promotion.ts": "src/features/promotion/types/promotion.ts",
  "src/types/customerPromotion.ts": "src/features/promotion/types/customerPromotion.ts",
  "src/utils/customerPromotion.ts": "src/features/promotion/utils/customerPromotion.ts",
  "src/utils/customerPromotion.test.ts": "src/features/promotion/utils/customerPromotion.test.ts",
  "src/pages/Employee/promotions/typography.ts": "src/features/promotion/utils/typography.ts",
  "src/components/ui/StatusBadge.tsx": "src/features/promotion/components/StatusBadge.tsx",
  "src/pages/Employee/promotions/list/PromotionListPage.tsx": "src/features/promotion/pages/PromotionList/index.tsx",
  "src/pages/Employee/promotions/detail/PromotionDetailPage.tsx": "src/features/promotion/pages/PromotionDetail/index.tsx",
  "src/pages/Employee/promotions/form/PromotionFormPage.tsx": "src/features/promotion/pages/PromotionForm/index.tsx",
  "src/pages/Employee/promotions/form/PromotionFormPage.test.tsx": "src/features/promotion/pages/PromotionForm/PromotionFormPage.test.tsx",
  "src/pages/Employee/promotions/approval/PromotionApprovalPage.tsx": "src/features/promotion/pages/PromotionApproval/index.tsx",
  "src/pages/Customer/Promotions": "src/features/promotion/pages/CustomerPromotions",
  "src/pages/Customer/PromotionDetail": "src/features/promotion/pages/CustomerPromotionDetail"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/04-promotion.json
```

Expected: `move: 16 paths moved, imports rewritten in 35 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move promotion into features/promotion"
```

---

### Task 8: Move the concert feature (back-office concert pages + customer concert browsing)

**Files:**
- Create: `frontend/scripts/restructure/moves/05-concert.json`
- Move: everything listed in the JSON below. Renames: `ConcertDashBoard` → `ConcertDashboard`, `intro` → `Intro`, `posterShow.tsx` → `PosterShow.tsx`.

**Interfaces:**
- Produces: `@/features/concert/api/concertApi`, `@/features/concert/components/{NotificationBell,PosterShow,Slide}`, `@/features/concert/hooks/useCustomerConcerts`, `@/features/concert/utils/customerConcertCard`, `@/features/concert/data/customerEvents`, `@/features/concert/pages/{ConcertDashboard,AddConcert,EditConcert,ConcertEditHistory,ConcertStatus,AddDocument,Responsibility,SearchConcert,Home,Events,EventDetail,Intro}`

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/05-concert.json`:

```json
{
  "src/api/concertApi.ts": "src/features/concert/api/concertApi.ts",
  "src/components/Notification/NotificationBell.tsx": "src/features/concert/components/NotificationBell.tsx",
  "src/components/posterShow/posterShow.tsx": "src/features/concert/components/PosterShow.tsx",
  "src/components/posterShow/posterShow.test.tsx": "src/features/concert/components/PosterShow.test.tsx",
  "src/components/slide/Slide.tsx": "src/features/concert/components/Slide.tsx",
  "src/hooks/useCustomerConcerts.ts": "src/features/concert/hooks/useCustomerConcerts.ts",
  "src/utils/customerConcertCard.ts": "src/features/concert/utils/customerConcertCard.ts",
  "src/utils/customerConcertCard.test.ts": "src/features/concert/utils/customerConcertCard.test.ts",
  "src/data/customerEvents.ts": "src/features/concert/data/customerEvents.ts",
  "src/pages/Employee/ConcertDashBoard": "src/features/concert/pages/ConcertDashboard",
  "src/pages/Employee/AddConcert": "src/features/concert/pages/AddConcert",
  "src/pages/Employee/EditConcert": "src/features/concert/pages/EditConcert",
  "src/pages/Employee/ConcertEditHistory": "src/features/concert/pages/ConcertEditHistory",
  "src/pages/Employee/ConcertStatus": "src/features/concert/pages/ConcertStatus",
  "src/pages/Employee/AddDocument": "src/features/concert/pages/AddDocument",
  "src/pages/Employee/Responsibility": "src/features/concert/pages/Responsibility",
  "src/pages/Employee/SearchConcert": "src/features/concert/pages/SearchConcert",
  "src/pages/Customer/Home": "src/features/concert/pages/Home",
  "src/pages/Customer/Events": "src/features/concert/pages/Events",
  "src/pages/Customer/EventDetail": "src/features/concert/pages/EventDetail",
  "src/pages/Customer/intro": "src/features/concert/pages/Intro"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/05-concert.json
```

Expected: `move: 21 paths moved, imports rewritten in 29 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move concert pages into features/concert"
```

---

### Task 9: Move the artist feature

**Files:**
- Create: `frontend/scripts/restructure/moves/06-artist.json`
- Move: everything listed in the JSON below. Fixes the `Perfomance` typo.

**Interfaces:**
- Produces: `@/features/artist/api/artistApi`, `@/features/artist/utils/scheduleRules`, `@/features/artist/pages/{ArtistDashboard,ArtistDetail,ArtistEditHistory,ArtistInfo,ArtistInvitation,ArtistRequirement,ArtistSearch,PerformanceSchedule,PerformanceDetail,EditPerformance}`

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/06-artist.json`:

```json
{
  "src/api/artistApi.ts": "src/features/artist/api/artistApi.ts",
  "src/utils/scheduleRules.ts": "src/features/artist/utils/scheduleRules.ts",
  "src/pages/Employee/ArtistDashboard": "src/features/artist/pages/ArtistDashboard",
  "src/pages/Employee/ArtistDetail": "src/features/artist/pages/ArtistDetail",
  "src/pages/Employee/ArtistEditHistory": "src/features/artist/pages/ArtistEditHistory",
  "src/pages/Employee/ArtistInfo": "src/features/artist/pages/ArtistInfo",
  "src/pages/Employee/ArtistInvitation": "src/features/artist/pages/ArtistInvitation",
  "src/pages/Employee/ArtistRequirement": "src/features/artist/pages/ArtistRequirement",
  "src/pages/Employee/ArtistSearch": "src/features/artist/pages/ArtistSearch",
  "src/pages/Employee/PerfomanceSchedule": "src/features/artist/pages/PerformanceSchedule",
  "src/pages/Employee/PerfomanceDetail": "src/features/artist/pages/PerformanceDetail",
  "src/pages/Employee/EditPerfomance": "src/features/artist/pages/EditPerformance"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/06-artist.json
```

Expected: `move: 12 paths moved, imports rewritten in 12 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move artist and performance pages into features/artist"
```

---

### Task 10: Move the booking feature (booking + payment)

Booking and payment share one API client (`bookingPaymentApi.ts`) and one backend handler (`booking_payment.go`), so they form a single feature folder.

**Files:**
- Create: `frontend/scripts/restructure/moves/07-booking.json`
- Move: everything listed in the JSON below

**Interfaces:**
- Produces: `@/features/booking/api/{bookingPaymentApi,seatInventoryApi}`, `@/features/booking/types/booking`, `@/features/booking/utils/{bookingStore,ticketCode,seatPromotion}`, `@/features/booking/components/seatSelection/*`, `@/features/booking/components/tickets/*`, `@/features/booking/pages/{ZoneSelection,SeatSelection,VenueSeatsView,CustomerAccount,SalesBookingManagement}`

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/07-booking.json`:

```json
{
  "src/api/bookingPaymentApi.ts": "src/features/booking/api/bookingPaymentApi.ts",
  "src/api/bookingPaymentApi.test.ts": "src/features/booking/api/bookingPaymentApi.test.ts",
  "src/api/seatInventoryApi.ts": "src/features/booking/api/seatInventoryApi.ts",
  "src/api/seatInventoryApi.test.ts": "src/features/booking/api/seatInventoryApi.test.ts",
  "src/types/booking.ts": "src/features/booking/types/booking.ts",
  "src/utils/bookingStore.ts": "src/features/booking/utils/bookingStore.ts",
  "src/utils/ticketCode.ts": "src/features/booking/utils/ticketCode.ts",
  "src/utils/seatPromotion.ts": "src/features/booking/utils/seatPromotion.ts",
  "src/utils/seatPromotion.test.ts": "src/features/booking/utils/seatPromotion.test.ts",
  "src/components/SeatSelection": "src/features/booking/components/seatSelection",
  "src/components/tickets": "src/features/booking/components/tickets",
  "src/pages/Customer/ZoneSelection": "src/features/booking/pages/ZoneSelection",
  "src/pages/Customer/SeatSelection": "src/features/booking/pages/SeatSelection",
  "src/pages/Customer/VenueSeatsView": "src/features/booking/pages/VenueSeatsView",
  "src/pages/Customer/Account": "src/features/booking/pages/CustomerAccount",
  "src/pages/Employee/SalesBookingManagement": "src/features/booking/pages/SalesBookingManagement"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/07-booking.json
```

Expected: `move: 16 paths moved, imports rewritten in 27 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`. `ZoneSelectionPoster.test.tsx` still asserts `/src/assets/poster/flux.png`, which is correct because `assets/poster` does not move.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move booking and payment into features/booking"
```

---

### Task 11: Move the contact feature (external coordination)

**Files:**
- Create: `frontend/scripts/restructure/moves/08-contact.json`
- Move: everything listed in the JSON below (removes the `_frontend` folder)

**Interfaces:**
- Produces: `@/features/contact/types/contact`, `@/features/contact/components/{ExternalContactLayout,Sidebar,StatusTimeline}`, `@/features/contact/pages/{ContactHQ,GeneralInquiryForm,PlanningForm,SponsorForm,TicketingSupport}` (named exports are unchanged, e.g. `import { ContactHQ } from '@/features/contact/pages/ContactHQ'`), `@/assets/contact/{banner1.jpg,banner2.jpg,map.jpg}`

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/08-contact.json`:

```json
{
  "src/types/contact.ts": "src/features/contact/types/contact.ts",
  "src/components/_frontend/ExternalContactLayout.tsx": "src/features/contact/components/ExternalContactLayout.tsx",
  "src/components/_frontend/Sidebar.tsx": "src/features/contact/components/Sidebar.tsx",
  "src/components/_frontend/StatusTimeline.tsx": "src/features/contact/components/StatusTimeline.tsx",
  "src/pages/Customer/ContactHQ.tsx": "src/features/contact/pages/ContactHQ/index.tsx",
  "src/pages/Customer/GeneralInquiryForm.tsx": "src/features/contact/pages/GeneralInquiryForm/index.tsx",
  "src/pages/Customer/PlanningForm.tsx": "src/features/contact/pages/PlanningForm/index.tsx",
  "src/pages/Customer/SponsorForm.tsx": "src/features/contact/pages/SponsorForm/index.tsx",
  "src/pages/Customer/TicketingSupport.tsx": "src/features/contact/pages/TicketingSupport/index.tsx",
  "src/assets/banner1.jpg": "src/assets/contact/banner1.jpg",
  "src/assets/banner2.jpg": "src/assets/contact/banner2.jpg",
  "src/assets/map.jpg": "src/assets/contact/map.jpg"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/08-contact.json
```

Expected: `move: 12 paths moved, imports rewritten in 9 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move external contact pages into features/contact"
```

---

### Task 12: Move the report feature

**Files:**
- Create: `frontend/scripts/restructure/moves/09-report.json`
- Move: everything listed in the JSON below. Fixes the `Consert` typo and removes `compo_ConsertReport`.

**Interfaces:**
- Produces: `@/features/report/api/reportApi`, `@/features/report/types/report`, `@/features/report/data/concerts`, `@/features/report/components/{ConcertCard,ConcertDetailReport,FinishedConcertList}`, `@/features/report/pages/ConcertReport` (default export unchanged), `@/assets/report/poster_*.jpg`

- [ ] **Step 1: Write the mapping**

Create `frontend/scripts/restructure/moves/09-report.json`:

```json
{
  "src/api/reportApi.ts": "src/features/report/api/reportApi.ts",
  "src/types/report.ts": "src/features/report/types/report.ts",
  "src/data/concerts.ts": "src/features/report/data/concerts.ts",
  "src/components/compo_ConsertReport": "src/features/report/components",
  "src/ConsertReportPage.tsx": "src/features/report/pages/ConcertReport/index.tsx",
  "src/ConsertReportPage.css": "src/features/report/pages/ConcertReport/ConcertReport.css",
  "src/assets/poster_celestial.jpg": "src/assets/report/poster_celestial.jpg",
  "src/assets/poster_flux.jpg": "src/assets/report/poster_flux.jpg",
  "src/assets/poster_pulse_live.jpg": "src/assets/report/poster_pulse_live.jpg",
  "src/assets/poster_starlight.jpg": "src/assets/report/poster_starlight.jpg"
}
```

- [ ] **Step 2: Run the move**

```bash
node scripts/restructure/move.mjs scripts/restructure/moves/09-report.json
```

Expected: `move: 10 paths moved, imports rewritten in 8 files`.

- [ ] **Step 3: Verify**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests "
```

Expected: tsc silent, `Tests 211 passed (211)`.

- [ ] **Step 4: Commit**

```bash
git add -A src scripts && git commit -m "refactor(frontend): move concert report into features/report"
```

---

### Task 13: Frontend final check, README and env example

**Files:**
- Modify: `frontend/README.md` (full replacement; the current file is the Vite template boilerplate)
- Modify: `frontend/.env.example` (remove backend-only keys)

- [ ] **Step 1: Remove empty leftover folders and confirm the top-level layout**

```bash
find src -type d -empty -delete && ls src
```

Expected exactly: `app  assets  features  index.css  layouts  main.tsx  setupTests.ts  shared  theme  vite-env.d.ts`. If `api`, `components`, `pages`, `utils`, `types`, `hooks`, `data` or `access` still appear, a file was added on main after this plan was written. Run `find src/<dir> -type f`, add the file to the mapping of the feature it belongs to, and rerun that move with `--rewrite-only` after a manual `git mv`.

- [ ] **Step 2: Remove backend-only keys from `frontend/.env.example`**

The frontend never reads `APP_BASE_URL` or `SMTP_*` (checked with `grep -rn "SMTP\|APP_BASE_URL" src vite.config.ts`, which returns nothing). Those keys belong to `backend/.env.example`, which already has them. Replace `frontend/.env.example` with:

```
# Base URL of the backend API used by the app at runtime
VITE_API_URL=http://localhost:8080/api

# Base URL for the venue-seat API (falls back to /api if unset)
VITE_API_BASE_URL=http://localhost:8080/api

# Proxy target used by the Vite dev server for /api requests
VITE_API_PROXY_TARGET=http://127.0.0.1:8080
```

- [ ] **Step 3: Replace `frontend/README.md`**

```markdown
# Octavia — Frontend

React 19 + TypeScript + Vite + MUI

## เริ่มต้นใช้งาน

```bash
npm install
cp .env.example .env
npm run dev        # http://localhost:5173 (proxy /api → http://127.0.0.1:8080)
npm test           # vitest (watch); ใช้ `npx vitest run` สำหรับรันครั้งเดียว
npm run build      # tsc -b && vite build
npm run lint       # oxlint
```

## โครงสร้างโฟลเดอร์

```
src/
├── main.tsx            entry ของ Vite
├── app/                App.tsx (กำหนด route ทั้งหมด), App.css
├── theme/              MUI theme
├── layouts/            โครงหน้าที่ใช้ร่วมกัน
│   ├── backoffice/     Layout, Header, Sidebar, PromotionLayout ของฝั่งพนักงาน
│   └── customer/       CustomerHeader ของฝั่งลูกค้า
├── shared/             ของที่ใช้ข้ามหลายระบบ (components/, utils/)
├── assets/             รูปภาพ (assets/poster ห้ามย้าย — backend seed อ่านไฟล์จากที่นี่)
└── features/           หนึ่งโฟลเดอร์ต่อหนึ่งระบบย่อย
    ├── auth/              เข้าสู่ระบบ / สิทธิ์การเข้าถึง (access/)
    ├── userManagement/    ระบบจัดการผู้ใช้งานและการกำหนดสิทธิ์
    ├── promotion/         ระบบจัดการโปรโมชั่นคอนเสิร์ต
    ├── concert/           ระบบจัดการข้อมูลคอนเสิร์ต + หน้าแสดงคอนเสิร์ตฝั่งลูกค้า
    ├── artist/            ระบบจัดการศิลปินและการแสดง
    ├── booking/           ระบบจองบัตร + ระบบชำระเงิน
    ├── contact/           ระบบประสานงานภายนอก (ติดต่อ - สอบถาม)
    ├── report/            ระบบรายงานและสรุปผล
    ├── eventRegistration/ ระบบลงทะเบียนเข้างาน
    └── ticketPlanning/    ระบบวางแผนการจำหน่ายบัตร
```

ภายในแต่ละ feature แบ่งเป็น `api/`, `components/`, `pages/`, `hooks/`, `types/`, `utils/`, `data/` ตามที่จำเป็น

## ข้อตกลง

- import ภายในโปรเจกต์ใช้ alias `@/` เสมอ เช่น `import { concertApi } from '@/features/concert/api/concertApi'`
- หน้าแต่ละหน้าเป็นโฟลเดอร์ PascalCase ที่มี `index.tsx` เช่น `features/promotion/pages/PromotionList/index.tsx`
- ไฟล์ทดสอบ `*.test.ts(x)` วางคู่กับไฟล์ที่ทดสอบ
- ของที่ใช้แค่ระบบเดียวให้อยู่ใน feature นั้น; ย้ายเข้า `shared/` เมื่อมีมากกว่าหนึ่ง feature ใช้
```

- [ ] **Step 4: Run the full frontend verification**

```bash
npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests " && npm run build 2>&1 | grep -E "built in|error" ; npx oxlint 2>&1 | grep -c ': warning' ; npx oxlint 2>&1 | grep -c ': error'
```

Expected: tsc silent, `Tests 211 passed (211)`, `✓ built in …`, `18`, `0`.

- [ ] **Step 5: Commit**

```bash
git add -A . && git commit -m "docs(frontend): document feature-based structure; drop backend keys from env example"
```

---

### Task 14: Backend standard `cmd/` layout and cleanup

**Files:**
- Move: `backend/cmd/server/{check-demo-data,seed-customer-demo,seed-employees,seed-management,seed-reports}/` → `backend/cmd/<same-name>/`
- Delete: `backend/database/` (unused package; it reads env vars literally named `postgres`, `5432` and so on, and nothing imports it), `backend/tmp/check_created_at.sql` (ad-hoc debug query)
- Untrack: `backend/octavia-server.exe`, `backend/seed-employees.exe`
- Modify: `.gitignore` (root), `backend/cmd/server/main.go:46`, `backend/internal/handlers/management_promotions.go:91`, `backend/README.md`

Why it is safe: Go import paths are unchanged, because these dirs are `package main` and nothing imports them. The seed tools resolve `.env` and `../frontend/src/assets/Poster` from the **working directory** (`backend/`), not from the source location. `poster_seed.go` stays in `cmd/server`, so its `runtime.Caller`-relative path is unchanged. `MANAGEMENT.md` and `REPORT_DATA.md` already document `go run ./cmd/seed-management` and `./cmd/seed-reports`, so this move makes those docs correct. As a side effect, `seed-customer-demo/main_test.go`'s `godotenv.Read("../../.env")` now resolves to `backend/.env` instead of the nonexistent `backend/cmd/.env`. That test is skipped unless `CUSTOMER_DEMO_SEED_TEST=1`.

- [ ] **Step 1: Move the tools**

```bash
cd ../backend
for t in check-demo-data seed-customer-demo seed-employees seed-management seed-reports; do git mv cmd/server/$t cmd/$t; done
ls cmd
```

Expected: `check-demo-data  seed-customer-demo  seed-employees  seed-management  seed-reports  server`.

- [ ] **Step 2: Remove dead code, debug files and committed binaries**

```bash
git rm -r -q database tmp/check_created_at.sql && git rm -q --cached octavia-server.exe seed-employees.exe
```

- [ ] **Step 3: Ignore build outputs**

Append to the root `.gitignore`:

```
# Build outputs
*.exe
```

- [ ] **Step 4: Fix references to moved docs**

In `backend/cmd/server/main.go:46`, change:

```go
	log.Printf("Demo accounts ready: 10 employees + 10 customers (see test.md)")
```

to:

```go
	log.Printf("Demo accounts ready: 10 employees + 10 customers (see docs/test-accounts.md)")
```

In `backend/internal/handlers/management_promotions.go:91`, change:

```go
// PromotionUI is the singular-relation view used by frontend/src/types/promotion.ts.
```

to:

```go
// PromotionUI is the singular-relation view used by frontend/src/features/promotion/types/promotion.ts.
```

- [ ] **Step 5: Replace `backend/README.md`**

The current README describes only the models and links a `CUSTOMER_DEMO.md` that does not exist. Replace it with:

```markdown
# Octavia — Backend

Go + Fiber + GORM + PostgreSQL

## เริ่มต้นใช้งาน

```bash
docker compose up -d          # PostgreSQL :5432 และ pgAdmin :8081 (ดู compose.yml)
cp .env.example .env
go run ./cmd/server           # API ที่ http://localhost:8080 — migrate และ seed บัญชีเดโมให้อัตโนมัติ
go test ./...
```

บัญชีทดสอบ: [docs/test-accounts.md](../docs/test-accounts.md)

## โครงสร้างโฟลเดอร์

```
cmd/
├── server/              API server (main.go) + poster seed
├── check-demo-data/     ตรวจข้อมูลเดโมในฐานข้อมูล
├── seed-customer-demo/  seed ข้อมูลลูกค้า/บัตรเดโม       (go run ./cmd/seed-customer-demo --apply)
├── seed-employees/      seed บัญชีพนักงานเดโม           (go run ./cmd/seed-employees --apply)
├── seed-management/     seed โปรโมชั่น/พนักงานเดโม       (go run ./cmd/seed-management --apply)
└── seed-reports/        seed ข้อมูลรายงาน               (go run ./cmd/seed-reports --apply)
internal/
├── access/              สิทธิ์การเข้าถึงโมดูลของพนักงาน
├── config/              โหลด .env และเชื่อมต่อฐานข้อมูล
├── eventregistration/   API ระบบลงทะเบียนเข้างาน
├── handlers/            HTTP handlers ของระบบอื่น ๆ
├── mailer/              ส่งอีเมล (SMTP หรือ log ลง console)
├── models/              GORM models + AutoMigrate
├── seed/                ข้อมูลเริ่มต้น (บัญชีเดโม)
└── ticketplanning/      API ระบบวางแผนการจำหน่ายบัตร
tests/                   integration tests ของ API
```

ทุกคำสั่ง `go run ./cmd/...` ต้องรันจากโฟลเดอร์ `backend` (เครื่องมือ seed อ่าน `.env` จาก working directory)

เอกสารเพิ่มเติม: [docs/backend/MANAGEMENT.md](../docs/backend/MANAGEMENT.md), [docs/backend/REPORT_DATA.md](../docs/backend/REPORT_DATA.md)
```

- [ ] **Step 6: Verify**

```bash
go build ./... && go vet ./... && go test ./... 2>&1 | grep -v "no test files"
```

Expected: every line `ok`, including `backend/cmd/seed-customer-demo`, `backend/cmd/seed-management` and `backend/cmd/server`. No `FAIL`.

- [ ] **Step 7: Commit**

```bash
cd .. && git add -A backend .gitignore && git commit -m "chore(backend): move tools to cmd/<name>, drop dead database pkg and committed binaries"
```

---

### Task 15: Root `docs/`, root README, and the teammate migration guide

**Files:**
- Move: `frontend/B67*.md` + `frontend/b6733377.md` → `docs/team/` (the frontend copies have the correct spelling of B6728786's name; the backend copies are deleted)
- Move: `frontend/diagram/` → `docs/diagrams/`
- Move: `frontend/ui-example/<…>/` → `docs/ui-examples/<english-name>/`
- Move: `backend/MANAGEMENT.md`, `backend/REPORT_DATA.md` → `docs/backend/`; `test.md` → `docs/test-accounts.md`
- Modify: `docs/backend/MANAGEMENT.md:5`
- Create: `README.md`, `docs/RESTRUCTURE.md`

- [ ] **Step 1: Move the team files (one copy each)**

```bash
mkdir -p docs/team docs/ui-examples docs/backend
for f in B6707651 B6708856 B6717537 B6728786; do git mv frontend/$f.md docs/team/$f.md; git rm -q backend/$f.md; done
git mv frontend/b6733377.md docs/team/B6733377.md && git rm -q backend/b6733377.md
```

- [ ] **Step 2: Move diagrams and UI examples, renaming folders to English**

The `*Booking` glob is deliberate. The real folder name starts with an invisible Thai character (U+0E3A), and the glob matches it without typing that character.

```bash
git mv frontend/diagram docs/diagrams
cd frontend/ui-example
git mv Artist-and-Show-management-system ../../docs/ui-examples/artist-and-show
git mv Concert-infomation-management-system ../../docs/ui-examples/concert-information
git mv Payment ../../docs/ui-examples/payment
git mv "ระบบจัดการสิทธิ์" ../../docs/ui-examples/access-management
git mv "ระบบจัดการโปรโมชั่น" ../../docs/ui-examples/promotion
git mv "ระบบลงทะเบียนเข้างาน" ../../docs/ui-examples/event-registration
git mv "ระบบวางแผนหารจำหน่ายบัตร" ../../docs/ui-examples/ticket-planning
git mv *Booking ../../docs/ui-examples/booking
cd ../.. && rmdir frontend/ui-example && ls docs/ui-examples
```

Expected: `access-management  artist-and-show  booking  concert-information  event-registration  payment  promotion  ticket-planning`.

- [ ] **Step 3: Move the remaining docs**

```bash
git mv backend/MANAGEMENT.md docs/backend/MANAGEMENT.md && git mv backend/REPORT_DATA.md docs/backend/REPORT_DATA.md && git mv test.md docs/test-accounts.md
```

In `docs/backend/MANAGEMENT.md` line 5, replace `frontend/src/api/managementApi.ts` with `frontend/src/features/promotion/api/managementApi.ts`.

- [ ] **Step 4: Check for stale path references**

```bash
grep -rn "ui-example\|frontend/diagram\|test\.md\|frontend/src/api/\|frontend/src/types/\|frontend/src/pages/\|cmd/server/seed\|cmd/server/check" --include=*.md --include=*.go --include=*.ps1 . | grep -v node_modules | grep -v "docs/superpowers/" | grep -v "docs/RESTRUCTURE.md"
```

Expected: no output. Fix any hit the same way as Step 3.

- [ ] **Step 5: Create the root `README.md`**

```markdown
# Octavia — Concert Management System

ระบบบริหารจัดการคอนเสิร์ต (SA กลุ่ม T01)

| โฟลเดอร์ | เนื้อหา |
|---|---|
| [`frontend/`](frontend/README.md) | React + TypeScript + Vite |
| [`backend/`](backend/README.md) | Go + Fiber + GORM + PostgreSQL |
| [`docs/`](docs/) | เอกสาร, diagram, ตัวอย่าง UI, บัญชีทดสอบ |

## รันทั้งระบบ

```bash
cd backend && docker compose up -d && cp .env.example .env && go run ./cmd/server
cd frontend && npm install && cp .env.example .env && npm run dev
```

เปิด http://localhost:5173 — บัญชีทดสอบอยู่ที่ [docs/test-accounts.md](docs/test-accounts.md)

## ผู้จัดทำและระบบที่รับผิดชอบ

| รหัสนักศึกษา | ระบบ | โฟลเดอร์ frontend |
|---|---|---|
| [B6707651](docs/team/B6707651.md) | จัดการข้อมูลคอนเสิร์ต, จัดการศิลปินและการแสดง | `features/concert`, `features/artist` |
| [B6708856](docs/team/B6708856.md) | ลงทะเบียนเข้างาน, วางแผนการจำหน่ายบัตร | `features/eventRegistration`, `features/ticketPlanning` |
| [B6717537](docs/team/B6717537.md) | จัดการโปรโมชั่น, จัดการผู้ใช้งานและสิทธิ์ | `features/promotion`, `features/userManagement` |
| [B6728786](docs/team/B6728786.md) | จองบัตร, ชำระเงิน | `features/booking` |
| [B6733377](docs/team/B6733377.md) | ประสานงานภายนอก, รายงานและสรุปผล | `features/contact`, `features/report` |

โครงสร้างโฟลเดอร์ถูกจัดใหม่เมื่อ 2026-10 — ถ้ามี branch เก่าค้างอยู่ ดู [docs/RESTRUCTURE.md](docs/RESTRUCTURE.md)
```

- [ ] **Step 6: Create `docs/RESTRUCTURE.md` (teammate migration guide)**

```markdown
# การจัดโครงสร้างโฟลเดอร์ใหม่ (2026-10)

ไม่มีการเปลี่ยนพฤติกรรมของระบบ — ย้ายไฟล์และแก้ path ของ import เท่านั้น
ตารางการย้ายไฟล์ฝั่ง frontend ทั้งหมดอยู่ใน `frontend/scripts/restructure/moves/*.json`

## สรุปการเปลี่ยนแปลง

- frontend: `src/pages`, `src/components`, `src/api`, `src/utils`, `src/types`, `src/hooks`, `src/data`, `src/access`
  ถูกแยกเข้า `src/features/<ระบบ>/` (ดู frontend/README.md); `App.tsx` → `src/app/App.tsx`
- frontend: import ภายในทั้งหมดเปลี่ยนเป็น alias `@/...`
- frontend: ลบโค้ดที่ไม่ถูกใช้ (`src/auth`, `src/interface`, `src/services`, `features/registration`, `features/venueSeats` ฯลฯ)
- backend: `cmd/server/<tool>` → `cmd/<tool>`; ลบ `database/` ที่ไม่ถูกใช้; เลิก commit ไฟล์ `.exe`
- เอกสาร: `B67xxxxx.md`, `diagram/`, `ui-example/`, `MANAGEMENT.md`, `REPORT_DATA.md`, `test.md` → `docs/`

## ย้าย branch เก่าของตัวเองมาโครงสร้างใหม่

```bash
git fetch origin
git checkout <branch-ของคุณ>
git merge origin/main
```

Git ตรวจจับการ rename ได้เอง — การแก้ไขในไฟล์เดิมจะตามไปอยู่ในไฟล์ที่ย้ายแล้ว
ถ้ามี conflict ให้แก้ตามปกติ (ส่วนใหญ่จะเป็นบรรทัด import) แล้วรัน:

```bash
cd frontend
node scripts/restructure/to-alias.mjs
for f in scripts/restructure/moves/*.json; do node scripts/restructure/move.mjs --rewrite-only "$f"; done
npx tsc -b && npx vitest run
```

คำสั่งชุดนี้แปลง import ที่ยังชี้ path เก่าให้เป็น path ใหม่โดยไม่ย้ายไฟล์

ไฟล์ใหม่ที่คุณสร้างไว้ในโฟลเดอร์เก่า (เช่น `src/pages/Employee/NewPage/`) จะไม่ถูกย้ายอัตโนมัติ —
ให้ `git mv` เข้า `src/features/<ระบบของคุณ>/pages/` เอง แล้วรัน `npx tsc -b` เพื่อเช็ก
```

- [ ] **Step 7: Commit**

```bash
git add -A . && git commit -m "docs: collect course docs under docs/, add root README and restructure guide"
```

---

### Task 16: End-to-end verification

**Files:** none

- [ ] **Step 1: Full test suites from a clean state**

```bash
cd frontend && npx tsc -b && npx vitest run 2>&1 | grep -E "Test Files|Tests " && npm run build 2>&1 | grep -E "built in|error" && node --test scripts/restructure/lib.test.mjs 2>&1 | grep -E "^ℹ (pass|fail)"
cd ../backend && go build ./... && go vet ./... && go test ./... 2>&1 | grep -E "FAIL|ok" | grep -c FAIL
```

Expected: `Tests 211 passed (211)`, `✓ built in …`, `ℹ pass 4` / `ℹ fail 0`, and a final `0` (no Go failures).

- [ ] **Step 2: Smoke-test the running app**

Start PostgreSQL (`docker compose up -d` in `backend/`), then run `go run ./cmd/server` from `backend/` and `npm run dev` from `frontend/`. In a browser, load each of these and confirm it renders with no console errors: `/` (intro), the customer login page, the customer home/events page, an event detail page, the employee login page, and (after logging in as `araya.admin@octavia.test` from `docs/test-accounts.md`) the concert dashboard, artist dashboard, promotion list, employee list, ticket planning, event registration, sales booking management, and concert report. Each of these touches a different moved feature folder.

Expected: every page renders as before the restructure.

- [ ] **Step 3: Confirm the tree matches the target layout**

```bash
cd .. && ls && ls docs && ls backend && ls backend/cmd && ls frontend && ls frontend/src && ls frontend/src/features
```

Expected (each `ls` in order):
- root: `README.md  backend  docs  frontend  go.work  go.work.sum`
- docs: `RESTRUCTURE.md  backend  diagrams  superpowers  team  test-accounts.md  ui-examples`
- backend: `README.md  cmd  compose.yml  go.mod  go.sum  internal  run.ps1  tests` (plus untracked `.env` and any locally built `.exe`)
- backend/cmd: `check-demo-data  seed-customer-demo  seed-employees  seed-management  seed-reports  server`
- frontend: `README.md  index.html  node_modules  package-lock.json  package.json  public  scripts  src  tsconfig.app.json  tsconfig.json  tsconfig.node.json  vite.config.ts`
- frontend/src: `app  assets  features  index.css  layouts  main.tsx  setupTests.ts  shared  theme  vite-env.d.ts`
- frontend/src/features: `artist  auth  booking  concert  contact  eventRegistration  promotion  report  ticketPlanning  userManagement`

- [ ] **Step 4: Hand off**

Use superpowers:finishing-a-development-branch. When opening the PR, say in the description that teammates with open branches should follow `docs/RESTRUCTURE.md` after it merges, and recommend merging it at a moment when the other branches are quiet.
