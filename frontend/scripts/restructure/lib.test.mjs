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
