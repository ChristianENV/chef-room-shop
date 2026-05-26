/**
 * Audits source files for corrupted Spanish copy (accent/ñ replaced by "?").
 * Does not modify files. Exit code 1 when issues are found.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = process.cwd()

const SCAN_DIRS = ['src', 'components', 'lib', 'e2e'] as const

const IGNORE_DIR_NAMES = new Set([
  'node_modules',
  '.next',
  'dist',
  'build',
  '.git',
  'migrations',
])

const IGNORE_FILES = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'audit-spanish-copy.ts',
  'copywriting.md',
])

/** Letter ? inside a word (not URL query ?key=). */
const CORRUPT_WORD_PATTERN = /[A-Za-zÁÉÍÓÚáéíóúÑñ]\?[A-Za-zÁÉÍÓÚáéíóúÑñ]/g

const REPLACEMENT_CHAR = '\uFFFD'

const KNOWN_CORRUPT_FRAGMENTS = [
  'sesi?n',
  'Sesi?n',
  'direcci?n',
  'env?o',
  'contrase?a',
  'informaci?n',
  'personalizaci?n',
  'cat?logo',
  'm?todo',
  'tel?fono',
  'facturaci?n',
  'producci?n',
  'verificaci?n',
  'configuraci?n',
  'administraci?n',
  'electr?nico',
  'inv?lidos',
  'contin?a',
  'estar?',
  'recuperaci?n',
] as const

type Finding = {
  file: string
  line: number
  match: string
  kind: 'word' | 'fragment' | 'replacement-char'
}

function shouldSkipDir(name: string): boolean {
  return IGNORE_DIR_NAMES.has(name)
}

function shouldScanFile(name: string): boolean {
  if (IGNORE_FILES.has(name)) return false
  const ext = name.split('.').pop() ?? ''
  return ['ts', 'tsx', 'md', 'mdx'].includes(ext)
}

function walk(dir: string, findings: Finding[]): void {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (shouldSkipDir(entry)) continue
      walk(fullPath, findings)
      continue
    }

    if (!shouldScanFile(entry)) continue
    auditFile(fullPath, findings)
  }
}

function isLikelyUrlQuery(line: string, index: number): boolean {
  const charBefore = line[index - 1] ?? ''
  const after = line.slice(index + 1)

  if (charBefore === '/' || charBefore === '&' || charBefore === '=') {
    return true
  }

  if (/^[a-zA-Z_][a-zA-Z0-9_]*=/.test(after)) {
    return true
  }

  if (
    /^(token|order|payment|secret|sslmode|design|tipo|error|key|category|callbackUrl|returnUrl)/.test(
      after,
    )
  ) {
    return true
  }

  if (charBefore === 'h' && (after.startsWith('q=') || after.startsWith('q'))) {
    return true
  }

  if (charBefore === 'n' && after.startsWith('returnUrl')) {
    return true
  }

  if (charBefore === 'l' && after.startsWith('callbackUrl')) {
    return true
  }

  const before = line.slice(Math.max(0, index - 12), index)
  return /[/?&=]\s*$/.test(before)
}

function auditFile(filePath: string, findings: Finding[]): void {
  const rel = relative(ROOT, filePath).replace(/\\/g, '/')
  const content = readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/)

  lines.forEach((line, lineIndex) => {
    if (line.includes(REPLACEMENT_CHAR)) {
      findings.push({
        file: rel,
        line: lineIndex + 1,
        match: REPLACEMENT_CHAR,
        kind: 'replacement-char',
      })
    }

    const isCodeFile = rel.endsWith('.ts') || rel.endsWith('.tsx')
    if (isCodeFile) {
      for (const fragment of KNOWN_CORRUPT_FRAGMENTS) {
        if (line.includes(fragment)) {
          findings.push({
            file: rel,
            line: lineIndex + 1,
            match: fragment,
            kind: 'fragment',
          })
        }
      }
    }

    CORRUPT_WORD_PATTERN.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = CORRUPT_WORD_PATTERN.exec(line)) !== null) {
      const qIndex = match.index + match[0].indexOf('?')
      if (qIndex >= 0 && isLikelyUrlQuery(line, qIndex)) continue
      findings.push({
        file: rel,
        line: lineIndex + 1,
        match: match[0],
        kind: 'word',
      })
    }
  })
}

function main(): void {
  const findings: Finding[] = []

  for (const dir of SCAN_DIRS) {
    walk(join(ROOT, dir), findings)
  }

  const unique = new Map<string, Finding>()
  for (const f of findings) {
    unique.set(`${f.file}:${f.line}:${f.match}`, f)
  }
  const sorted = [...unique.values()].sort((a, b) =>
    a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file),
  )

  if (sorted.length === 0) {
    console.log('audit-spanish-copy: no corrupted Spanish copy found.')
    process.exit(0)
  }

  console.error(`audit-spanish-copy: found ${sorted.length} issue(s):\n`)
  for (const f of sorted) {
    console.error(`  ${f.file}:${f.line}  [${f.kind}]  ${f.match}`)
  }
  console.error(
    '\nFix UTF-8 strings in source (e.g. sesión, not sesi?n). See docs/copywriting.md',
  )
  process.exit(1)
}

main()
