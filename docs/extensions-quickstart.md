BEAGLEEDITOR / EXTENSIONS

# Quick start

## 2. Create and install an extension

1. Open BeagleEditor and select **Extensions** from the activity bar.

2. Click **Open folder**.

3. Create a new folder for your extension, for example `word-counter`.

4. Inside it, create `manifest.json` and `main.js`.

5. Click **Reload extensions** in BeagleEditor.

6. Enable the extension if needed, then open the command palette with `Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux.

Your folder should look like this:

```
extensions/
└── word-counter/
    ├── manifest.json
    └── main.js

```

The exact absolute path of `extensions/` is shown in the Extensions view. It is inside BeagleEditor's per-user application configuration directory; do not assume it is inside your project workspace.

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
