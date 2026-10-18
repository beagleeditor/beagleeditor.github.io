(() => {
  const storageKey = 'beagleeditor-color-mode'
  const root = document.documentElement
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')

  function readMode() {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved === 'dark' || saved === 'light' ? saved : 'auto'
    } catch {
      return 'auto'
    }
  }

  let mode = readMode()

  function applyTheme() {
    const dark = mode === 'dark' || (mode === 'auto' && systemTheme.matches)
    root.classList.toggle('theme-dark', dark)
    root.classList.toggle('theme-light', !dark)
    root.dataset.colorMode = mode
    root.style.colorScheme = dark ? 'dark' : 'light'

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.textContent = mode === 'auto' ? '◐ Auto' : mode === 'dark' ? '☾ Dark' : '☀ Light'
      button.setAttribute('aria-label', `Appearance: ${mode} (click to change)`)
      button.setAttribute('title', 'Toggle appearance')
    })
  }

  function cycleTheme() {
    mode = { auto: 'dark', dark: 'light', light: 'auto' }[mode]
    try {
      if (mode === 'auto') localStorage.removeItem(storageKey)
      else localStorage.setItem(storageKey, mode)
    } catch {
      // Theme switching still works for this page if storage is unavailable.
    }
    applyTheme()
  }

  applyTheme()
  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', cycleTheme)
  })
  systemTheme.addEventListener?.('change', applyTheme)
})()
