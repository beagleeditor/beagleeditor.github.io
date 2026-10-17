BEAGLEEDITOR / EXTENSIONS

# For Extension Developers

The extension system documented by BeagleEditor supports two formats: JavaScript extensions that register commands and interact with the active workspace, and JSON-only color themes that customize Monaco and supported workbench colors. It is an early, native API—not a compatibility layer for Visual Studio Code extensions.

## Choose a starting point

- [Quick start](extensions-quickstart.md): create an extension folder, write a manifest, register a command, and load it in BeagleEditor.

- [Manifest reference](extensions-manifest.md): review required fields, supported types, filenames, and validation rules.

- [Color theme guide](extensions-themes.md): create and install a theme without executing JavaScript.

## Build against the actual API

The entry module exports `activate(api)`. Use the [JavaScript API reference](extensions-api.md) for commands, status-bar items, document snapshots, filesystem operations, editor selection and cursor APIs, decorations, and event subscriptions. Check [lifecycle and cleanup](extensions-lifecycle.md) for activation, reload, disposal, and error behavior.

## Test and maintain

Use the [working examples](extensions-examples.md) as starting points. Reload extensions after changing installed files, verify the extension is enabled, and inspect the developer console if activation or a command fails. Keep cleanup callbacks for listeners and other resources.

## Security and limitations

JavaScript extensions execute in the editor web view and are **not sandboxed**. Filesystem methods are not restricted to the current workspace, and there is no fine-grained permission system. Only install code you trust; review its source and avoid destructive filesystem operations without explicit user intent. Relative imports from an extension entry file are not supported. See [security and troubleshooting](extensions-security.md) before sharing or installing an extension.
