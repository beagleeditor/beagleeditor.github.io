BEAGLEEDITOR / EXTENSIONS

# Extension API reference

## 5. Extension API reference

### `activate(api)`

Your entry module must export `activate`. It is called when BeagleEditor activates the extension. The function may return a cleanup function or an object with a `dispose()` method. Async activation is supported.

The `api` object contains the following members:

### `api.extension`

The parsed manifest for the current extension, including `id`, `name`, `version`, and any optional `description` or `main` fields.

### `api.registerCommand({ id, title, run })`

Registers a command in the command palette and returns an unregister callback.

- `id`: command identifier local to your extension.

- `title`: command title displayed to the user.

- `run`: function called when the user selects the command. It may be synchronous or return a promise.

The full command ID is namespaced as `<extension-id>.<command-id>`. For example, `word-counter.count-words`. Use distinct command IDs within your extension. Keep the returned callback and call it during cleanup if you need to unregister a command before the extension is deactivated.

### `api.registerStatusBarItem({ id, text, tooltip?, alignment?, priority?, run? })`

Adds a small item to the BeagleEditor status bar and returns an unregister callback. Items are removed automatically when the extension is deactivated.

- `id`: identifier local to your extension.

- `text`: short text displayed in the status bar.

- `tooltip`: optional hover text.

- `alignment`: `"left"` or `"right"`; defaults to `"left"`.

- `priority`: optional number; higher-priority items appear first within their side.

- `run`: optional callback invoked when the item is clicked; it may return a promise.

```
export function activate(api) {
  const item = api.registerStatusBarItem({
    id: "workspace-greeting",
    text: "Hello, Beagle",
    tooltip: "Show an extension message",
    alignment: "right",
    run: () => api.showMessage("Your extension is running."),
  });
  return () => item();
}

```

### `api.showMessage(message)`

Displays a native web-view alert prefixed with the extension name. The value is converted to a string. Use it for simple messages; it is not a custom notification or status-bar API.

### `api.getActiveDocument()`

Returns a snapshot of the active editor tab, or `null` when there is no active document.

When a document is open, the returned object has:

| Property | Type | Meaning |
| --- | --- | --- |
| `name` | `string` | Tab/document name. |
| `path` | `string \| null` | File path, or `null` for an unsaved document. |
| `language` | `string` | Current editor language identifier. |
| `content` | `string` | Current content snapshot. |
| `dirty` | `boolean` | Whether the tab has unsaved changes. |

The snapshot includes `id`, a session-local identifier for the open tab. The returned object is a snapshot, not a live object; read it again to get current values.

### `api.getOpenDocuments()`

Returns an array of snapshots for all open tabs, using the same fields as `getActiveDocument()`. The array and its objects are snapshots; changing them does not change editor state.

### `api.getWorkspaceDirectory()`

Returns the current workspace folder path, or `null` when no folder is open.

### `api.readFile(path)` and `api.writeFile(path, content)`

Read UTF-8 text from a path or write UTF-8 text to a path. Both return promises; filesystem errors reject the promise. `writeFile` updates the content and saved state of an already-open tab at the same path. These APIs use the editor's filesystem backend and are not restricted to the current workspace, so only use paths you trust.

### Additional filesystem APIs

These APIs use BeagleEditor's filesystem backend and return promises:

- `api.readDirectory(path)` — returns entries with `name`, `path`, and `is_dir` fields for the requested directory.

- `api.pathExists(path)` — resolves to `true` if the path exists, otherwise `false`.

- `api.createFile(path)` — creates an empty file. It rejects if creation fails.

- `api.createDirectory(path)` — creates one directory. Its parent must already exist, and the destination must not already exist.

- `api.renamePath(oldPath, newPath)` — renames or moves a filesystem path, subject to filesystem rules and permissions.

- `api.deletePath(path)` — deletes the requested path. Use carefully; this operation can remove user data.

- `api.revealPath(path)` — asks the operating system to reveal the path in the file manager.

```
export async function activate(api) {
  const root = api.getWorkspaceDirectory();
  if (!root) {
    api.showMessage("Open a workspace first.");
    return;
  }

  const entries = await api.readDirectory(root);
  const files = entries.filter((entry) => !entry.is_dir);
  api.showMessage(`Found ${files.length} files in the workspace root.`);
}

```

These APIs are not confined to the open workspace. Extensions have no filesystem permission prompts or sandbox, so only use paths you trust and avoid destructive operations without explicit user intent.

### `api.searchWorkspace(query)`

Searches file contents in the open workspace and returns matches with `path`, `line`, and `text` fields. Returns an empty array for a blank query and rejects if no workspace is open or a search fails.

### `api.getEditorSelection()`

Returns `null` if there is no active editor model. Otherwise returns the selected `text`, `startLineNumber`, `startColumn`, `endLineNumber`, `endColumn`, and `isEmpty` fields.

### `api.replaceEditorSelection(text)`

Replaces the current editor selection with the supplied string, focuses the editor, and returns `true`. Returns `false` if there is no active editor selection/model. The replacement is an editor edit, so the document becomes modified. `text` must be a string.

### `api.getEditorPosition()`

Returns the cursor position as `{ lineNumber, column }`, or `null` when no editor position is available. Both coordinates are one-based.

### `api.getEditorLanguage()` and `api.setEditorLanguage(language)`

`getEditorLanguage()` returns the active Monaco language identifier, or `null` if no editor model is active.

`setEditorLanguage(language)` changes the active editor model's language and updates the active tab's language metadata. It returns `true` on success or `false` when the argument is invalid or no active editor/document is available. Supply a Monaco language identifier such as `typescript`, `python`, `json`, or `markdown`.

### `api.getEditorLineCount()` and `api.getEditorLineContent(lineNumber)`

- `getEditorLineCount()` returns the active document's number of lines, or `null` if no model is active.

- `getEditorLineContent(lineNumber)` returns the text of a one-based line, or `null` if no model is active or the line number is invalid.

```
export function activate(api) {
  return api.registerCommand({
    id: "show-line-count",
    title: "Show Active Document Line Count",
    run: () => {
      const count = api.getEditorLineCount();
      api.showMessage(count === null ? "No active document." : `Lines: ${count}`);
    },
  });
}

```

### `api.setEditorPosition(lineNumber, column)`

Moves the cursor to the requested one-based line and column, reveals it in the editor, and focuses the editor. Coordinates are clamped to the document's valid range. Returns `true` on success or `false` if the editor is unavailable or the coordinates are invalid.

### `api.insertTextAtCursor(text)`

Inserts text at the current cursor position and focuses the editor. Returns `true` if inserted or `false` if no active editor position is available. The edit marks the document as modified.

### `api.setEditorDecorations(decorations)`

Adds line decorations to the current editor model and returns a cleanup function. Calling the cleanup removes only the decorations created by that call. Invalid line numbers are ignored; if no editor model is active, the function returns a no-op cleanup callback.

Each decoration accepts `lineNumber` (required), `className`, `glyphMarginClassName`, `hoverMessage`, and `isWholeLine`. Class names are CSS classes, so an extension that supplies custom classes must also provide the corresponding styles. Decorations attach to the model that was active when the API was called.

```
export function activate(api) {
  const decorate = () => {
    const document = api.getActiveDocument();
    if (!document) return;
    return api.setEditorDecorations([
      { lineNumber: 1, isWholeLine: true, hoverMessage: "Marked by my extension" },
    ]);
  };

  const clear = decorate();
  return () => clear?.();
}

```

Example — uppercase selected text:

```
export function activate(api) {
  return api.registerCommand({
    id: "uppercase-selection",
    title: "Uppercase Selection",
    run: () => {
      const selection = api.getEditorSelection();
      if (!selection || selection.isEmpty) {
        api.showMessage("Select some text first.");
        return;
      }
      api.replaceEditorSelection(selection.text.toUpperCase());
    },
  });
}

```

### `api.updateActiveDocument(content)`

Replaces the active document's entire content and marks the tab as having unsaved changes. Returns `true` if a document was open and updated, or `false` if no document was active. `content` must be a string. This is a whole-document replacement API, not a range-edit API; keep a copy of the original text if you need to compute a diff.

### `api.onDidChangeActiveDocument(listener)`

Subscribes to active-tab changes. The listener is called immediately with the current document snapshot (or `null`), then again when the active tab changes. Returns an unsubscribe function; call it during cleanup. Listener errors are caught and logged so they do not break the editor.

### `api.onDidChangeEditorSelection(listener)`

Subscribes to editor selection/cursor changes and returns an unsubscribe function. The listener receives `null` if the editor or selection is unavailable; otherwise it receives `text`, `startLineNumber`, `startColumn`, `endLineNumber`, `endColumn`, and `isEmpty`. Coordinates are one-based. The callback is triggered by selection changes; it is not called immediately upon registration.

```
export function activate(api) {
  const unsubscribe = api.onDidChangeEditorSelection((selection) => {
    if (selection && !selection.isEmpty) {
      console.log("Selected text:", selection.text);
    }
  });
  return unsubscribe;
}

```

### `api.onDidChangeTextDocument(listener)`

Subscribes to content changes in the active editor model and returns an unsubscribe function. The listener receives:

- `document`: the current document snapshot.

- `changes`: Monaco content-change entries, including `range`, `rangeOffset`, `rangeLength`, and inserted `text`.

- `versionId`: the model version after the change.

- `isUndoing` and `isRedoing`: whether the change is part of an undo or redo operation.

The callback is not called immediately on registration. It reports changes made to the editor model; it is not a filesystem watcher and does not notify extensions about external file changes that have not been loaded into the editor.

```
export function activate(api) {
  const unsubscribe = api.onDidChangeTextDocument(({ document, changes }) => {
    console.log(`${document.name}: ${changes.length} content change(s)`);
  });
  return unsubscribe;
}

```

The runtime automatically disposes these event subscriptions when the extension is deactivated, even if the extension forgets to call its returned unsubscribe function. Extensions should still unsubscribe when they no longer need a listener.

Example:

```
export function activate(api) {
  const unsubscribe = api.onDidChangeActiveDocument((document) => {
    console.log("Active document:", document?.path ?? document?.name ?? "None");
  });

  const command = api.registerCommand({
    id: "uppercase-document",
    title: "Uppercase Active Document",
    run: () => {
      const document = api.getActiveDocument();
      if (!document) return api.showMessage("Open a document first.");
      api.updateActiveDocument(document.content.toUpperCase());
    },
  });

  return () => {
    unsubscribe();
    command();
  };
}

```
