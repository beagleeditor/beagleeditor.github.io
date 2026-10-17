CURRENT EXTENSIBILITY

# Plugins and extensions

The old Python plugin instructions on this page no longer describe the current BeagleEditor application.
**Important:** Do not follow the legacy steps below for the redesigned editor. The current app uses its own JavaScript extension API and JSON-only color theme format.

## What can I install today?

- **JavaScript extensions** can register commands, status-bar items, document/workspace helpers, and editor actions through the BeagleEditor extension API.
- **JSON color themes** customize Monaco and supported workbench colors without executing JavaScript.

## Start with the current guide

Open the Extensions view in BeagleEditor, then follow the current installation and development instructions.

[Read the extension development guide →](extensions.md)

## About the old plugin system

The former PyQt-based editor is maintained separately as [BeagleEditor Legacy](https://github.com/beagleeditor/legacy). Python plugin examples and installation steps belong to that legacy application and should not be assumed to work in the redesigned editor.
