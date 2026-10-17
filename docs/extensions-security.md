BEAGLEEDITOR / EXTENSIONS

# Security and limitations

## 7. Current limitations

The current API is intentionally small. It does **not** currently provide:

- VS Code extension compatibility or a package marketplace.

- A dependency manager or extension installer.

- Custom editor actions or custom sidebar panels.

- Range-based editor edits, an editor save-command API, or filesystem watcher events.

- A stable public API guarantee across releases.

- A sandbox or permission system. Extensions execute in the editor web view and should be treated as trusted code.

Entry files are loaded as JavaScript modules from source text. Relative imports from an extension's entry file are not supported by this loading approach. For now, keep an extension self-contained in its entry file and use browser-standard JavaScript features available in the editor's web view.

## 8. Security

**Only install extensions whose source you trust.** Enabled extensions execute JavaScript in the same editor web view as BeagleEditor. They are not sandboxed and may be able to access data or capabilities available to the application. Review the source before enabling an extension, especially one obtained from another person or website. Do not treat an extension folder as safe merely because its manifest looks valid.

## 9. Troubleshooting

### My extension does not appear

- Confirm the folder is directly inside the extension directory shown in the Extensions view.

- Confirm the folder contains valid `manifest.json` and the entry file named by `main` (or `main.js` if omitted).

- Check that `id`, `name`, and `version` are non-empty strings.

- Click **Reload extensions** after changing files.

### My command does not appear

- Confirm the extension is enabled.

- Confirm `main.js` exports `activate` and calls `api.registerCommand`.

- Make sure the command has a non-empty `id` and `title`, and `run` is a function.

- Open the command palette with `Cmd+Shift+P` (macOS) or `Ctrl+Shift+P` (Windows/Linux).

### Activation fails

Open the developer console and inspect the error logged for the extension. Check JavaScript syntax and ensure the entry module uses `export function activate(api) { ... }`. Remember that relative module imports are not supported.
