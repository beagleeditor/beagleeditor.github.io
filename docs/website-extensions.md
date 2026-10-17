BEAGLEEDITOR / EXTENSIONS

# BeagleEditor Extension Development

This guide explains how to create, install, test, and troubleshoot extensions for BeagleEditor.

> 

**Current scope:** BeagleEditor supports local JavaScript extensions and JSON-only color theme extensions. This is an early extension API, not a compatibility layer for Visual Studio Code extensions.

## 1. How extensions work

An extension is a folder containing a `manifest.json` file and either a JavaScript entry point or a JSON color theme. BeagleEditor discovers extension folders in its application configuration directory. From the **Extensions** view you can open that directory, reload the list, install an extension from a folder, enable or disable it, and remove it with confirmation.

Each extension's entry module exports an `activate(api)` function. BeagleEditor calls it when the extension is enabled. The function can register command-palette commands and use the small API described below. Return a cleanup function (or an object with a `dispose()` method) to release resources when the extension is disabled or reloaded.

This guide is organized into focused pages. Continue with [Quick start](extensions-quickstart.md), or use the sidebar for the manifest, theme, API, lifecycle, examples, and security references.
