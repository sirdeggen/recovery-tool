// Bundles src/scan.js with @bsv/sdk and inlines it into src/template.html -> index.html.
import { build } from 'esbuild'
import { readFileSync, writeFileSync } from 'node:fs'

const out = await build({
  entryPoints: ['src/scan.js'],
  bundle: true,
  format: 'iife',
  globalName: 'Scan',
  minify: true,
  platform: 'browser',
  target: 'es2020',
  write: false
})
const bundle = out.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')
const template = readFileSync('src/template.html', 'utf8')
writeFileSync('index.html', template.replace('/*BUNDLE*/', () => bundle))
console.log('wrote index.html')
