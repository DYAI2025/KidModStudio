import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'

test('Sprint 0 - App launches with workbench shell', async () => {
  const app = await electron.launch({
    args: ['./dist/index.js']
  })

  const window = await app.firstWindow()

  // Wait for app to load
  await window.waitForLoadState('domcontentloaded')

  // Verify title
  const title = await window.title()
  expect(title).toContain('KidModStudio')

  // Verify No-Fake compliance: NO export button
  const exportButton = await window.locator('button:has-text("export")').count()
  expect(exportButton).toBe(0)

  // Verify No-Fake compliance: NO Crafty window
  const craftyWindow = await window.locator('[data-testid="crafty-window"]').count()
  expect(craftyWindow).toBe(0)

  // Verify workbench layout exists
  const workbench = await window.locator('.workbench').count()
  expect(workbench).toBe(1)

  await app.close()
})
