import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import parse from 'html-react-parser'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeCodeHighlight from './rehypeCodeHighlight.js'
import legacyPages from './content/legacyPages.json'

const BASE = '/'
const markdownModules = import.meta.glob('../docs/*.md', { eager: true, query: '?raw', import: 'default' })
const docs = Object.entries(markdownModules).map(([path, content]) => {
  const file = path.split('/').pop()
  const slug = file.replace(/\.md$/, '')
  const firstHeading = content.match(/^#\s+(.+)$/m)?.[1]
  const labelMap = {
    index: 'Documentation home', 'getting-started': 'Getting started', 'keyboard-shortcuts': 'Keyboard shortcuts',
    'editor-settings': 'Editor settings and themes', 'workspace-tools': 'Workspace tools', 'language-support': 'Language support',
    troubleshooting: 'Troubleshooting', extensions: 'Extension guide', 'extensions-developers': 'Extension development',
    'extensions-quickstart': 'Extension quick start', 'extensions-manifest': 'Extension manifest', 'extensions-api': 'Extension API',
    'extensions-lifecycle': 'Extension lifecycle', 'extensions-themes': 'Extension themes', 'extensions-examples': 'Extension examples',
    'extensions-security': 'Extension security', development: 'Development setup', cli: 'Command-line tools', plugins: 'Legacy plugins',
  }
  return { slug, content: content.replace(/^---\n[\s\S]*?\n---\n/, ''), title: labelMap[slug] || firstHeading || slug.replaceAll('-', ' ') }
}).sort((a, b) => a.slug === 'index' ? -1 : b.slug === 'index' ? 1 : a.title.localeCompare(b.title))
const docGroups = [
  { title: 'Start here', slugs: ['index', 'getting-started', 'keyboard-shortcuts', 'editor-settings', 'workspace-tools', 'language-support', 'troubleshooting'] },
  { title: 'Extensions', slugs: ['extensions', 'extensions-developers', 'extensions-quickstart', 'extensions-manifest', 'extensions-api', 'extensions-lifecycle', 'extensions-themes', 'extensions-examples', 'extensions-security'] },
  { title: 'Development and reference', slugs: ['development', 'cli', 'plugins'] },
]
const sidebarOrder = docGroups.flatMap(group => group.slugs)
docs.sort((a, b) => {
  const ai = sidebarOrder.indexOf(a.slug)
  const bi = sidebarOrder.indexOf(b.slug)
  if (ai >= 0 || bi >= 0) return (ai < 0 ? Number.MAX_SAFE_INTEGER : ai) - (bi < 0 ? Number.MAX_SAFE_INTEGER : bi)
  return a.title.localeCompare(b.title)
})
const navItems = [
  { label: 'Home', href: '/' }, { label: 'Features', href: '/features.html' }, { label: 'Download', href: '/download.html' },
  { label: 'Screenshots', href: '/screenshots.html' }, { label: 'Docs', href: '/docs/' }, { label: 'Roadmap', href: '/roadmap.html' },
]

function SiteHeader() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [themeMode, setThemeMode] = useState(() => {
    try { return localStorage.getItem('beagleeditor-color-mode') || 'auto' } catch { return 'auto' }
  })
  useEffect(() => { setMenuOpen(false) }, [location.pathname])
  useEffect(() => {
    const root = document.documentElement
    const system = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = themeMode === 'dark' || (themeMode === 'auto' && system.matches)
      root.classList.toggle('theme-dark', dark)
      root.classList.toggle('theme-light', !dark)
      root.dataset.colorMode = themeMode
      root.style.colorScheme = dark ? 'dark' : 'light'
    }
    apply()
    system.addEventListener?.('change', apply)
    return () => system.removeEventListener?.('change', apply)
  }, [themeMode])
  function cycleTheme() {
    const next = { auto: 'dark', dark: 'light', light: 'auto' }[themeMode]
    setThemeMode(next)
    try { next === 'auto' ? localStorage.removeItem('beagleeditor-color-mode') : localStorage.setItem('beagleeditor-color-mode', next) } catch {}
  }
  const current = (href) => href === '/' ? location.pathname === '/' : location.pathname === href || (href === '/docs/' && (location.pathname.startsWith('/docs') || location.pathname.startsWith('/documentations')))
  return <>
    <header className="header">
      <Link to="/" className="logo" aria-label="BeagleEditor homepage">BeagleEditor</Link>
      <nav className="nav-links" aria-label="Main navigation">
        {navItems.map(item => <Link key={item.href} to={item.href} data-nav-link aria-current={current(item.href) ? 'page' : undefined}>{item.label}</Link>)}
        <a className="github-link" href="https://github.com/beagleeditor/editor" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </nav>
      <button className="theme-toggle" data-theme-toggle type="button" onClick={cycleTheme} aria-label={`Appearance: ${themeMode} (click to change)`} title="Toggle appearance">{themeMode === 'auto' ? '◐ Auto' : themeMode === 'dark' ? '☾ Dark' : '☀ Light'}</button>
      <button className="hamburger" id="hamburger" type="button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobileMenu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '×' : '☰'}</button>
    </header>
    <nav className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobileMenu" aria-label="Mobile navigation" inert={!menuOpen}>
      {navItems.map(item => <Link key={item.href} to={item.href} aria-current={current(item.href) ? 'page' : undefined}>{item.label}</Link>)}
      <a href="https://github.com/beagleeditor/editor" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
      <button type="button" className="mobile-theme-toggle" onClick={cycleTheme}>Appearance: {themeMode} ◐</button>
    </nav>
    {menuOpen && <button className="site-menu-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
  </>
}

function SiteFooter() {
  return <footer className="footer"><p>© 2026 BeagleSoftware. All rights reserved.</p></footer>
}

function fixLegacyPaths(markup) {
  return markup
    .replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}`)
    .replace(/(href|src)="(assets|screenshots)\//g, `$1="${BASE}$2/`)
    .replaceAll('href="index.html"', `href="${BASE}"`)
    .replaceAll('href="docs.html"', `href="${BASE}docs.html"`)
}

function LegacyPage({ pageKey }) {
  const page = legacyPages[pageKey]
  useEffect(() => {
    document.title = page?.title || 'BeagleEditor'
    const nodes = document.querySelectorAll('.reveal, .reveal-card, .download-reveal')
    let observer
    let sectionObserver
    if (!('IntersectionObserver' in window)) nodes.forEach(node => node.classList.add('visible'))
    else {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target) }
      }), { threshold: 0.12 })
      nodes.forEach(node => observer.observe(node))
    }

    const platformData = {
      windows: { title: 'BeagleEditor for Windows.', description: 'Download the latest Windows release and start coding.', card: 'Compatible with Windows 10 and later.', button: 'Download for Windows', command: 'Download the latest .exe installer from GitHub Releases.' },
      mac: { title: 'BeagleEditor for macOS.', description: 'Built for a fast and lightweight macOS experience.', card: 'Available for Apple Silicon and Intel Macs.', button: 'Download for macOS', command: 'Download the latest .dmg from GitHub Releases.' },
      linux: { title: 'BeagleEditor for Linux.', description: 'Download the latest Linux release for your distribution.', card: 'Choose the package appropriate for your distribution.', button: 'View Linux releases', command: 'Download the latest Linux package from GitHub Releases.' },
    }
    const platformOptions = [...document.querySelectorAll('.platform-option')]
    const choosePlatform = option => {
      const data = platformData[option.dataset.os]
      if (!data) return
      platformOptions.forEach(item => item.classList.toggle('selected', item === option))
      const setText = (id, text) => { const node = document.getElementById(id); if (node) node.textContent = text }
      setText('download-title', data.title)
      setText('download-description', data.description)
      setText('download-card-description', data.card)
      setText('download-button', data.button)
      setText('install-command', data.command)
      const icon = document.getElementById('platform-icon')
      if (icon) icon.dataset.os = option.dataset.os
      document.getElementById('step-3')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    }
    const platformHandlers = platformOptions.map(option => {
      const handler = () => choosePlatform(option)
      option.addEventListener('click', handler)
      return () => option.removeEventListener('click', handler)
    })

    const dots = [...document.querySelectorAll('.download-progress-dot')]
    const sections = [...document.querySelectorAll('.download-step')]
    const dotHandlers = dots.map(dot => {
      const handler = () => document.getElementById(dot.dataset.target)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
      dot.addEventListener('click', handler)
      return () => dot.removeEventListener('click', handler)
    })
    if ('IntersectionObserver' in window && dots.length && sections.length) {
      sectionObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) dots.forEach(dot => dot.classList.toggle('active', dot.dataset.target === entry.target.id))
      }), { threshold: 0.55 })
      sections.forEach(section => sectionObserver.observe(section))
    }
    const copyButtons = [...document.querySelectorAll('.copy-btn')]
    const copyHandlers = copyButtons.map(button => {
      const handler = async () => {
        try { await navigator.clipboard.writeText(button.parentElement?.querySelector('code')?.innerText || ''); button.textContent = 'Copied!' }
        catch { button.textContent = 'Copy manually' }
      }
      button.addEventListener('click', handler)
      return () => button.removeEventListener('click', handler)
    })
    return () => {
      observer?.disconnect()
      sectionObserver?.disconnect()
      platformHandlers.forEach(remove => remove())
      dotHandlers.forEach(remove => remove())
      copyHandlers.forEach(remove => remove())
    }
  }, [pageKey, page])
  if (!page) return <Navigate to="/404.html" replace />
  return <>
    {page.styles && <style dangerouslySetInnerHTML={{ __html: page.styles.replaceAll('url("assets/', `url("${BASE}assets/`) }} />}
    <div className={`legacy-page legacy-page-${pageKey}`}>{parse(fixLegacyPaths(page.body))}</div>
  </>
}

function docHref(slug) { return `/docs/${slug === 'index' ? '' : `${slug}.html`}` }
function DocsSidebar({ activeSlug, query, setQuery }) {
  const filteredGroups = useMemo(() => docGroups.map(group => ({ ...group, items: group.slugs.map(slug => docs.find(doc => doc.slug === slug)).filter(Boolean).filter(doc => !query || doc.title.toLowerCase().includes(query.toLowerCase()) || doc.content.toLowerCase().includes(query.toLowerCase())) })).filter(group => group.items.length), [query])
  const extras = docs.filter(doc => !docGroups.some(group => group.slugs.includes(doc.slug))).filter(doc => !query || doc.title.toLowerCase().includes(query.toLowerCase()) || doc.content.toLowerCase().includes(query.toLowerCase()))
  return <aside className="react-docs-sidebar">
    <label className="react-docs-search"><span aria-hidden="true">⌕</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search documentation" aria-label="Search documentation" /></label>
    <nav aria-label="Documentation pages">
      {filteredGroups.map(group => <section key={group.title} className="react-docs-nav-group"><h2>{group.title}</h2>{group.items.map(doc => <Link key={doc.slug} to={docHref(doc.slug)} className={activeSlug === doc.slug ? 'active' : ''} aria-current={activeSlug === doc.slug ? 'page' : undefined}>{doc.title}</Link>)}</section>)}
      {extras.length > 0 && <section className="react-docs-nav-group"><h2>Additional guides</h2>{extras.map(doc => <Link key={doc.slug} to={docHref(doc.slug)} className={activeSlug === doc.slug ? 'active' : ''}>{doc.title}</Link>)}</section>}
      {!filteredGroups.length && !extras.length && <p className="react-docs-no-results">No matching documentation.</p>}
    </nav>
    <a className="react-docs-report" href="https://github.com/beagleeditor/editor/issues" target="_blank" rel="noopener noreferrer">Report an issue ↗</a>
  </aside>
}

function DocumentationPage() {
  const { slug: routeSlug } = useParams()
  const rawSlug = (routeSlug || 'index').replace(/\.html$/, '') || 'index'
  const slug = rawSlug === 'gettingstarted' ? 'getting-started' : rawSlug
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const page = docs.find(doc => doc.slug === slug)
  const index = docs.findIndex(doc => doc.slug === slug)
  useEffect(() => { document.title = `${page?.title || 'Documentation'} — BeagleEditor`; setQuery(''); window.scrollTo(0, 0) }, [slug, page?.title])
  if (!page) return <Navigate to="/docs/" replace />
  const previous = docs[index - 1]
  const next = docs[index + 1]
  const markdownComponents = {
    a({ href = '', children, ...props }) {
      if (/^(https?:|mailto:|#|\/)/.test(href)) return <a href={href.startsWith('/') && !href.startsWith(BASE) ? `${BASE}${href.slice(1)}` : href} {...props}>{children}</a>
      const [file, hash] = href.split('#')
      if (file.endsWith('.md')) return <Link to={`${docHref(file.replace(/\.md$/, ''))}${hash ? `#${hash}` : ''}`} {...props}>{children}</Link>
      return <a href={href} {...props}>{children}</a>
    },
    img({ src = '', alt = '', ...props }) { return <img src={src.startsWith('/') ? `${BASE}${src.slice(1)}` : src} alt={alt} loading="lazy" {...props} /> },
  }
  return <div className="react-docs-shell">
    <DocsSidebar activeSlug={slug} query={query} setQuery={setQuery} />
    <main className="react-docs-main">
      <div className="react-docs-breadcrumb"><Link to="/docs/">Documentation</Link><span>/</span><span>{page.title}</span></div>
      <article className="react-docs-article"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeCodeHighlight]} components={markdownComponents}>{page.content}</ReactMarkdown></article>
      <nav className="react-docs-pager" aria-label="Documentation pagination">
        {previous ? <button type="button" className="react-docs-page-link previous" onClick={() => navigate(docHref(previous.slug))}><span>← Previous</span><strong>{previous.title}</strong></button> : <span />}
        {next ? <button type="button" className="react-docs-page-link next" onClick={() => navigate(docHref(next.slug))}><span>Next →</span><strong>{next.title}</strong></button> : <span />}
      </nav>
      <footer className="react-docs-footer">BeagleEditor documentation · <a href="https://github.com/beagleeditor/editor" target="_blank" rel="noopener noreferrer">View source on GitHub ↗</a></footer>
    </main>
  </div>
}

function LegacyDocsRedirect() {
  const { slug = '' } = useParams()
  return <Navigate to={`/docs/${slug}`} replace />
}

export default function App() {
  const location = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [location.pathname])
  return <>
    <SiteHeader />
    <Routes>
      <Route path="/" element={<LegacyPage pageKey="index" />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />
      <Route path="/features.html" element={<LegacyPage pageKey="features" />} />
      <Route path="/download.html" element={<LegacyPage pageKey="download" />} />
      <Route path="/screenshots.html" element={<LegacyPage pageKey="screenshots" />} />
      <Route path="/roadmap.html" element={<LegacyPage pageKey="roadmap" />} />
      <Route path="/docs.html" element={<Navigate to="/docs/" replace />} />
      <Route path="/test.html" element={<LegacyPage pageKey="test" />} />
      <Route path="/404.html" element={<LegacyPage pageKey="404" />} />
      <Route path="/docs" element={<Navigate to="/docs/" replace />} />
      <Route path="/docs/" element={<DocumentationPage />} />
      <Route path="/docs/:slug" element={<DocumentationPage />} />
      <Route path="/documentations" element={<Navigate to="/docs/" replace />} />
      <Route path="/documentations/" element={<Navigate to="/docs/" replace />} />
      <Route path="/documentations/:slug" element={<LegacyDocsRedirect />} />
      <Route path="*" element={<LegacyPage pageKey="404" />} />
    </Routes>
    <SiteFooter />
  </>
}
