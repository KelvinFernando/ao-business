import { createServer } from 'vite'
import { chromium } from 'playwright-core'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const server = await createServer({ root, server: { host: '127.0.0.1', port: 4185, strictPort: true }, logLevel: 'error' })
await server.listen()
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle'] })
const page = await browser.newPage()
await page.goto('http://127.0.0.1:4185/')
const result = await page.evaluate(async () => {
  const { Rive } = await import('/node_modules/@rive-app/webgl2/rive.js')
  const canvas = document.createElement('canvas')
  canvas.width = 320
  canvas.height = 200
  document.body.appendChild(canvas)
  return await new Promise((resolve, reject) => {
    const rive = new Rive({
      src: '/prototype.riv',
      canvas,
      artboard: 'Prototype Badge',
      stateMachines: 'Prototype idle',
      autoplay: true,
      onLoad: () => resolve({
        animations: rive.animationNames,
        stateMachines: rive.stateMachineNames,
        inputs: (rive.stateMachineInputs('Prototype idle') ?? []).map(input => ({ name: input.name, type: input.type, value: input.value })),
      }),
      onLoadError: reject,
    })
  })
})
console.log(JSON.stringify(result, null, 2))
await browser.close()
await server.close()
