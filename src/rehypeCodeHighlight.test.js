import assert from 'node:assert/strict'
import test from 'node:test'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeCodeHighlight from './rehypeCodeHighlight.js'

function renderMarkdown(markdown) {
  return unified().use(remarkParse).use(remarkRehype).use(rehypeCodeHighlight).runSync(
    unified().use(remarkParse).parse(markdown),
  )
}

function codeNode(tree) {
  let result
  const visit = node => {
    if (node.tagName === 'code') result = node
    for (const child of node.children || []) visit(child)
  }
  visit(tree)
  return result
}

function textContent(node) {
  if (node.type === 'text') return node.value
  return (node.children || []).map(textContent).join('')
}

function classesFor(node) {
  const classes = []
  const visit = child => {
    for (const name of child.properties?.className || []) classes.push(name)
    for (const nested of child.children || []) visit(nested)
  }
  visit(node)
  return classes
}

test('highlights JavaScript tokens without changing code text', () => {
  const source = 'const greet = (name) => "hello"; // say hi\n#privateField'
  const tree = renderMarkdown(`\`\`\`js\n${source}\n\`\`\``)
  const code = codeNode(tree)
  assert.equal(textContent(code), `${source}\n`)
  const classes = classesFor(code)
  assert.ok(classes.includes('syntax-keyword'))
  assert.ok(classes.includes('syntax-string'))
  assert.ok(classes.includes('syntax-comment'))
  assert.equal(classes.filter(name => name === 'syntax-comment').length, 1)
})

test('highlights JSON strings, keys, numbers and literals', () => {
  const source = '{\n  "enabled": true,\n  "count": 42\n}'
  const code = codeNode(renderMarkdown(`\`\`\`json\n${source}\n\`\`\``))
  assert.equal(textContent(code), `${source}\n`)
  const classes = classesFor(code)
  assert.ok(classes.includes('syntax-string'))
  assert.ok(classes.includes('syntax-number'))
  assert.ok(classes.includes('syntax-literal'))
})

test('treats hash as a comment in Python but not JavaScript', () => {
  const python = codeNode(renderMarkdown('\`\`\`python\nvalue = 3 # comment\n\`\`\`'))
  assert.ok(classesFor(python).includes('syntax-comment'))
  const javascript = codeNode(renderMarkdown('\`\`\`js\nthis.#privateField\n\`\`\`'))
  assert.ok(!classesFor(javascript).includes('syntax-comment'))
})

test('leaves code without a language class unmodified', () => {
  const code = codeNode(renderMarkdown('\`\`\`\nextensions/\n└── word-counter/\n    ├── manifest.json\n    └── main.js\n\`\`\`'))
  assert.equal(code.properties.className, undefined)
  assert.equal(code.children.map(textContent).join(''), 'extensions/\n└── word-counter/\n    ├── manifest.json\n    └── main.js\n')
})

test('detects common unlabeled JavaScript, JSON and shell examples', () => {
  const javascript = codeNode(renderMarkdown('\`\`\`\nexport function activate(api) { return api.showMessage("Hi") }\n\`\`\`'))
  assert.ok(classesFor(javascript).includes('syntax-keyword'))
  const json = codeNode(renderMarkdown('\`\`\`\n{"enabled": true}\n\`\`\`'))
  assert.ok(classesFor(json).includes('syntax-string'))
  const shell = codeNode(renderMarkdown('\`\`\`\nbun install\nbun run tauri dev\n\`\`\`'))
  assert.ok(classesFor(shell).includes('syntax-function'))
})
