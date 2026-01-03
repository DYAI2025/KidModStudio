#!/usr/bin/env node
import { globSync } from 'glob'
import { scanFile } from './scanner.js'
import { resolve } from 'path'

async function main() {
  // When run via pnpm --filter, cwd is the package dir
  // We need to find project root by looking for pnpm-workspace.yaml
  let projectRoot = process.cwd()

  // Go up until we find pnpm-workspace.yaml
  while (projectRoot !== '/') {
    try {
      const fs = await import('fs')
      if (fs.existsSync(resolve(projectRoot, 'pnpm-workspace.yaml'))) {
        break
      }
    } catch {}
    projectRoot = resolve(projectRoot, '..')
  }

  const files = globSync('packages/*/src/**/*.ts', {
    ignore: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/node_modules/**',
      '**/no-stub-scanner/**' // Don't scan ourselves
    ],
    cwd: projectRoot
  }).map(f => resolve(projectRoot, f))

  console.log(`Scanning ${files.length} files...`)

  let totalViolations = 0

  for (const file of files) {
    const violations = await scanFile(file)
    if (violations.length > 0) {
      console.error(`\n❌ ${file}:`)
      violations.forEach(v => {
        console.error(`  Line ${v.line}:${v.column} - ${v.message}`)
      })
      totalViolations += violations.length
    }
  }

  if (totalViolations > 0) {
    console.error(`\n❌ Found ${totalViolations} violations`)
    process.exit(1)
  } else {
    console.log('\n✅ No violations found')
    process.exit(0)
  }
}

main()
