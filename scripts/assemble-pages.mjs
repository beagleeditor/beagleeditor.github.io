import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const output = path.join(root, 'dist')
const shell = await readFile(path.join(output, 'index.html'), 'utf8')

// Keep the familiar .html URLs while every route is rendered by the same React app.
const rootPages = (await readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.html') && entry.name !== 'index.html')
  .map(entry => entry.name)
for (const page of rootPages) await writeFile(path.join(output, page), shell)

const legacyDocsDir = path.join(root, 'documentations')
const docsOutput = path.join(output, 'docs')
await mkdir(docsOutput, { recursive: true })
const legacyDocs = (await readdir(legacyDocsDir, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
  .map(entry => entry.name)
const markdownDocs = (await readdir(path.join(root, 'docs'), { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
  .map(entry => entry.name === 'index.md' ? 'index.html' : `${entry.name.replace(/\.md$/, '')}.html`)
for (const page of new Set([...legacyDocs, ...markdownDocs])) {
  await writeFile(path.join(docsOutput, page), shell)
}
await writeFile(path.join(docsOutput, 'gettingstarted.html'), shell)

for (const directory of ['assets', 'screenshots']) {
  await cp(path.join(root, directory), path.join(output, directory), { recursive: true })
}
await cp(path.join(root, '404Error.png'), path.join(output, '404Error.png'))
await writeFile(path.join(output, '.nojekyll'), '')
console.log(`Assembled React site with ${rootPages.length + 1} root HTML routes and ${new Set([...legacyDocs, ...markdownDocs]).size} documentation routes under /docs/.`)
