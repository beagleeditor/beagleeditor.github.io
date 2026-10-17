const commonKeywords = new Set(('as async await break case catch class const continue else export extends finally for from function if import in let new of return static super switch this throw try typeof var void while yield').split(' '))
const languageKeywords = {
  javascript: commonKeywords,
  js: commonKeywords,
  jsx: commonKeywords,
  typescript: new Set([...commonKeywords, 'abstract', 'declare', 'enum', 'implements', 'interface', 'keyof', 'namespace', 'private', 'protected', 'public', 'readonly', 'satisfies', 'type', 'unknown'] ),
  ts: new Set([...commonKeywords, 'abstract', 'declare', 'enum', 'implements', 'interface', 'keyof', 'namespace', 'private', 'protected', 'public', 'readonly', 'satisfies', 'type', 'unknown']),
  tsx: new Set([...commonKeywords, 'abstract', 'declare', 'enum', 'implements', 'interface', 'keyof', 'namespace', 'private', 'protected', 'public', 'readonly', 'satisfies', 'type', 'unknown']),
  python: new Set(('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield').split(' ')),
  py: new Set(('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield').split(' ')),
  rust: new Set(('as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while').split(' ')),
  rs: new Set(('as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while').split(' ')),
  shell: new Set(('case do done elif else esac fi for function if in select then time until while').split(' ')),
  sh: new Set(('case do done elif else esac fi for function if in select then time until while').split(' ')),
  bash: new Set(('case do done elif else esac fi for function if in select then time until while').split(' ')),
}
const literals = new Set(('false null true undefined NaN Infinity None none True False').split(' '))
const hashCommentLanguages = new Set(['python', 'py', 'shell', 'sh', 'bash', 'yaml', 'yml', 'toml', 'makefile', 'dockerfile'])
const slashCommentLanguages = new Set(['javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx', 'jsonc', 'rust', 'rs', 'go', 'java', 'c', 'cpp', 'c++', 'css', 'scss', 'kotlin', 'kt', 'swift', 'php', 'json'])

function tokenClass(value, language, nextText, previousText) {
  if (value.startsWith('//') || value.startsWith('/*') || value.startsWith('#')) return 'comment'
  if (/^(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)$/.test(value)) return 'string'
  if (/^(?:0[xX][\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?n?)$/.test(value)) return 'number'
  if (literals.has(value) || (language === 'python' || language === 'py') && value === 'None') return 'literal'
  if (languageKeywords[language]?.has(value) || language === 'json' && /^(?:true|false|null)$/.test(value)) return 'keyword'
  if (['shell', 'sh', 'bash'].includes(language) && /(?:^|\n)\s*$/.test(previousText)) return 'function'
  if (/^[A-Za-z_$][\w$]*$/.test(value) && /^\s*\(/.test(nextText)) return 'function'
  if (/^(?:===?|!==?|=>|\+\+|--|&&|\|\||\?\?|\*\*|[-+*/%=<>!&|^~?:])$/.test(value)) return 'operator'
  return null
}

function tokenize(source, language) {
  const alternatives = []
  if (slashCommentLanguages.has(language)) alternatives.push('/\\*[\\s\\S]*?\\*/', '//[^\\n]*')
  if (hashCommentLanguages.has(language)) alternatives.push('#[^\\n]*')
  alternatives.push('"(?:\\\\.|[^"\\\\])*"', "'(?:\\\\.|[^'\\\\])*'", '`(?:\\\\.|[^`\\\\])*`', '0[xX][\\da-fA-F]+|\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?n?', '[A-Za-z_$][\\w$]*', '===?|!==?|=>|\\+\\+|--|&&|\\|\\||\\?\\?|\\*\\*|[-+*/%=<>!&|^~?:]')
  const pattern = new RegExp(`(?:${alternatives.join('|')})`, 'g')
  const nodes = []
  let last = 0
  for (const match of source.matchAll(pattern)) {
    const index = match.index
    if (index > last) nodes.push({ type: 'text', value: source.slice(last, index) })
    const value = match[0]
    const type = tokenClass(value, language, source.slice(index + value.length), source.slice(0, index))
    nodes.push(type ? { type: 'element', tagName: 'span', properties: { className: [`syntax-${type}`] }, children: [{ type: 'text', value }] } : { type: 'text', value })
    last = index + value.length
  }
  if (last < source.length) nodes.push({ type: 'text', value: source.slice(last) })
  return nodes
}

function plainText(node) {
  if (node.type === 'text') return node.value
  return (node.children || []).map(plainText).join('')
}

function detectLanguage(source) {
  const code = source.trim()
  if (!code) return null
  if (/^(?:\{|\[)/.test(code)) {
    try {
      JSON.parse(code)
      return 'json'
    } catch {
      // Continue with other conservative checks for object literals.
    }
  }
  if (/^(?:export\s+(?:async\s+)?function|import\s|const\s|let\s|var\s|function\s|class\s|async\s+function|(?:if|for|while)\s*\(|\/\/)/m.test(code)) return 'javascript'
  if (/^(?:bun|npm|pnpm|yarn|cargo|git|cd|mkdir|cp|mv|rm|node|python3?|rustc|make|cmake)\s/m.test(code)) return 'shell'
  return null
}

export default function rehypeCodeHighlight() {
  return (tree) => {
    function visit(node) {
      if (node.type === 'element' && node.tagName === 'code') {
        const classes = Array.isArray(node.properties?.className) ? node.properties.className : []
        const languageClass = classes.find(name => typeof name === 'string' && name.startsWith('language-'))
        const source = plainText(node)
        const language = languageClass ? languageClass.slice('language-'.length).toLowerCase() : detectLanguage(source)
        if (language) {
          node.children = tokenize(source, language)
          node.properties.className = [...classes.filter(name => name !== 'syntax-highlighted'), 'syntax-highlighted']
          return
        }
      }
      for (const child of node.children || []) visit(child)
    }
    visit(tree)
  }
}
