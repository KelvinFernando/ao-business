import { createServer } from 'vite'
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({ root, server: { host: '127.0.0.1', port: 4174, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
await mkdir(`${root}validation/audit`, { recursive: true })
await page.goto('http://127.0.0.1:4174/#/02-0-start?v=default')
await page.waitForTimeout(2500)
await page.screenshot({ path: `${root}validation/audit/start-control.png`, fullPage: false })
const rive = await page.locator('.prototype-badge').evaluate(element => ({ box: element.getBoundingClientRect().toJSON(), canvases: element.querySelectorAll('canvas').length }))
const product = await page.locator('.selected-product').evaluate(element => {
  const row = element.querySelector('.selected-product-row')
  const copy = element.querySelector('.selected-product-copy')
  return {
    height: element.getBoundingClientRect().height,
    rowAlign: getComputedStyle(row).alignItems,
    copyGap: getComputedStyle(copy).gap,
  }
})
for (const route of ['02-0-start', '02-1-prequal', '03-1-prepare', '04-1-business-details', '10-1-status-waiting-signer', '11-2-verify-code']) {
  await page.goto(`http://127.0.0.1:4174/#/${route}?clean=1`)
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${root}validation/audit/${route}.png`, fullPage: true })
}
await page.goto('http://127.0.0.1:4174/#/02-1-prequal?clean=1')
const selectedRadio = await page.locator('.choice-tile:has(input:checked)').first().evaluate(element => {
  const dot = element.querySelector('.radio-dot')
  const tileStyle = getComputedStyle(element)
  const dotStyle = getComputedStyle(dot)
  const centreStyle = getComputedStyle(dot, '::after')
  return {
    tileBackground: tileStyle.backgroundColor,
    tileBorder: tileStyle.borderColor,
    dotSize: [dotStyle.width, dotStyle.height],
    dotBackground: dotStyle.backgroundColor,
    dotBorder: dotStyle.borderColor,
    centreSize: [centreStyle.width, centreStyle.height],
    centreBackground: centreStyle.backgroundColor,
  }
})
console.log(JSON.stringify({ rive, product, selectedRadio, errors: [...new Set(errors)] }, null, 2))
await browser.close()
await server.close()
