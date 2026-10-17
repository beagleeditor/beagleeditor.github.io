BEAGLEEDITOR / EXTENSIONS

# Working examples

The canonical extension guide includes a complete command example and additional API examples. These are also available in the repository: [Hello World extension](https://github.com/beagleeditor/editor/tree/main/examples/extensions/hello-world) and [theme examples](https://github.com/beagleeditor/editor/tree/main/examples/extensions).

## 5. Your first JavaScript extension

Put this in `main.js`:

```
export function activate(api) {
  const unregister = api.registerCommand({
    id: "count-words",
    title: "Count Words",
    run: () => {
      const document = api.getActiveDocument();

      if (!document) {
        api.showMessage("Open a document first.");
        return;
      }

      const words = document.content.trim()
        ? document.content.trim().split(/\s+/).length
        : 0;

      api.showMessage(`Word count: ${words}`);
    },
  });

  // Called when the extension is disabled or reloaded.
  return () => unregister();
}

```

Reload the Extensions view, open a document, and run **Count Words** from the command palette. You can also use the working starter in [`examples/extensions/hello-world`](https://github.com/beagleeditor/editor/tree/main/examples/extensions/hello-world).

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
