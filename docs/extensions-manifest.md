BEAGLEEDITOR / EXTENSIONS

# Manifest reference

## 3. Extension manifest

Create `manifest.json`:

```
{
  "id": "word-counter",
  "name": "Word Counter",
  "version": "1.0.0",
  "description": "Counts words in the active document.",
  "main": "main.js"
}

```

Fields:

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | Yes | Stable extension identifier. Use a unique, simple ID such as `word-counter`. It prefixes command IDs. |
| `name` | Yes | Human-readable name shown in the Extensions view and command categories. |
| `version` | Yes | Version string displayed by the UI, for example `1.0.0`. |
| `description` | No | Short description displayed in the Extensions view. |
| `main` | No | Entry filename. Defaults to `main.js`. The entry file must be directly inside the extension folder. |
| `type` | No | Set to `"theme"` for a JSON-only color theme. Omit it for a JavaScript extension. |
| `theme` | Theme only | Theme data filename. Defaults to `theme.json`; the file must be directly inside the extension folder. |

The manifest must be valid JSON. BeagleEditor skips folders with missing or invalid manifests, blank required fields, invalid IDs, duplicate IDs, or missing/unreadable entry files. Extension IDs may contain ASCII letters, numbers, dots, hyphens, and underscores. Use a unique `id` for every extension; command IDs are prefixed with it.
