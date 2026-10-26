import { createServer } from 'vite'
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({ root, server: { host: '127.0.0.1', port: 4176, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
try {
  await mkdir(`${root}validation/badge`, { recursive: true })
  await page.goto('http://127.0.0.1:4176/#/02-0-start?v=default')
  await page.waitForTimeout(2200)
  const travelBefore = await page.locator('.prototype-badge-travel').evaluate(element => getComputedStyle(element).transform)
  await page.waitForTimeout(700)
  const travelAfter = await page.locator('.prototype-badge-travel').evaluate(element => getComputedStyle(element).transform)
  const box = await page.locator('.prototype-badge-button').boundingBox()
  if (!box) throw new Error('Badge button has no clickable bounds')
  const clip = { x: box.x - 30, y: box.y - 120, width: box.width + 60, height: box.height + 150 }
  await page.addStyleTag({ content: '.prototype-badge-travel { animation-play-state: paused !important; }' })
  await page.screenshot({ path: `${root}validation/badge/before-click.png`, clip })
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.65)
  const frameTimes = [100, 200, 300, 400, 500, 600, 800, 1000, 1200]
  let previousTime = 0
  for (const time of frameTimes) {
    await page.waitForTimeout(time - previousTime)
    await page.screenshot({ path: `${root}validation/badge/jump-${time}ms.png`, clip })
    previousTime = time
  }
  await page.locator('.prototype-badge-button').focus()
  await page.keyboard.press('Enter')
  await page.waitForTimeout(200)
  await page.screenshot({ path: `${root}validation/badge/keyboard-jump-200ms.png`, clip })
  await page.waitForTimeout(30100)
  const hidden = await page.locator('.prototype-badge').evaluate(element => {
    const style = getComputedStyle(element)
    return { opacity: style.opacity, visibility: style.visibility, transform: style.transform }
  })
  const exitPage = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
  exitPage.on('pageerror', error => errors.push(error.message))
  exitPage.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await exitPage.goto('http://127.0.0.1:4176/#/02-0-start?v=default')
  await exitPage.waitForTimeout(1800)
  const barBox = await exitPage.locator('.prototype-bar').boundingBox()
  if (!barBox) throw new Error('Prototype bar has no bounds')
  const exitClip = { x: Math.max(0, barBox.x - 60), y: Math.max(0, barBox.y - 180), width: Math.min(1440, barBox.width + 220), height: Math.min(1000 - Math.max(0, barBox.y - 180), 360) }
  const exitTimes = [27000, 28300, 28800, 29200, 29500, 29800, 30050]
  for (const time of exitTimes) {
    await exitPage.evaluate(timestamp => {
      for (const selector of ['.prototype-badge', '.prototype-badge-travel']) {
        const element = document.querySelector(selector)
        for (const animation of element?.getAnimations() ?? []) {
          animation.pause()
          animation.currentTime = timestamp
        }
      }
    }, time)
    await exitPage.waitForTimeout(50)
    await exitPage.screenshot({ path: `${root}validation/badge/exit-${time - 27000}ms.png`, clip: exitClip })
  }
  await exitPage.close()
  console.log(JSON.stringify({ travelBefore, travelAfter, moved: travelBefore !== travelAfter, hidden, errors: [...new Set(errors)] }, null, 2))
} catch (error) {
  console.error('Browser errors:', errors)
  throw error
} finally {
  await browser.close()
  await server.close()
}
