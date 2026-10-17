BEAGLEEDITOR / EXTENSIONS

# JSON color theme extensions

## 4. JSON color theme extensions

A color theme has no JavaScript and does not run code. Create a folder containing `manifest.json` and `theme.json`:

`manifest.json`:

```
{
  "id": "midnight-teal",
  "name": "Midnight Teal",
  "version": "1.0.0",
  "description": "A dark theme with teal accents.",
  "type": "theme",
  "theme": "theme.json"
}

```

`theme.json` uses Monaco Editor's standalone theme format:

```
{
  "base": "vs-dark",
  "inherit": true,
  "rules": [
    { "token": "comment", "foreground": "6A9955", "fontStyle": "italic" },
    { "token": "string", "foreground": "CE9178" },
    { "token": "keyword", "foreground": "C586C0" }
  ],
  "colors": {
    "editor.background": "#101820",
    "editor.foreground": "#D6E2E8",
    "editorCursor.foreground": "#2DD4BF",
    "editor.selectionBackground": "#24565A"
  }
}

```

Install the folder from the **Extensions** view, enable it, then open **Settings → Editor color theme** and select it. Choose **Match interface appearance** to return to the built-in theme that follows the Dark/Light/System interface setting. Disabling a theme extension makes it unavailable for selection. Theme files are parsed as JSON and registered with Monaco; no JavaScript entry point is loaded for them.

See [`examples/extensions/midnight-teal`](https://github.com/beagleeditor/editor/tree/main/examples/extensions/midnight-teal) for a complete working theme extension.

### Example themes (not built in)

The repository includes several independent theme-extension folders under [`examples/extensions`](https://github.com/beagleeditor/editor/tree/main/examples/extensions). They are examples you can install; they are **not bundled as built-in themes**. Install each theme separately from the Extensions view using **Install from Folder**, selecting the theme's folder, then enable it and choose it in **Settings → Editor color theme**.

| Theme | Style | Folder |
| --- | --- | --- |
| Midnight Teal | Deep blue-green surfaces and teal accents | [`midnight-teal`](https://github.com/beagleeditor/editor/tree/main/examples/extensions/midnight-teal) |
| Nord Frost | Cool blue-gray surfaces | [`nord-frost`](https://github.com/beagleeditor/editor/tree/main/examples/extensions/nord-frost) |
| Rosé Pine | Muted plum, rose, and pine tones | [`rose-pine`](https://github.com/beagleeditor/editor/tree/main/examples/extensions/rose-pine) |
| Ember Glow | Warm charcoal, copper, and amber | [`ember-glow`](https://github.com/beagleeditor/editor/tree/main/examples/extensions/ember-glow) |
| Paperwhite | Soft light surfaces with indigo accents | [`paperwhite`](https://github.com/beagleeditor/editor/tree/main/examples/extensions/paperwhite) |
| Yalda's Night | Winter-night plum with pomegranate, watermelon, and gold accents | [`yaldas-night`](https://github.com/beagleeditor/editor/tree/main/examples/extensions/yaldas-night) |

These examples define both Monaco editor colors and workbench colors such as `sideBar.background`, `panel.background`, `titleBar.activeBackground`, and `statusBar.background`. If a theme only defines `editor.*` keys, its editor changes but the rest of the interface uses fallback colors.
