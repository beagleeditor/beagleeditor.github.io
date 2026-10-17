BEAGLEEDITOR / EXTENSIONS

# Lifecycle and cleanup

## 6. Lifecycle and cleanup

- **Enable:** BeagleEditor calls `activate(api)` for an enabled extension.

- **Disable:** BeagleEditor runs the cleanup returned by `activate`, if provided.

- **Reload:** BeagleEditor rediscovers installed extension folders and reactivates enabled extensions.

- **Activation errors:** Errors are written to the developer console and the Extensions view may show an activation failure. Check the console for the detailed error.

- **Command errors:** Failed commands are logged to the developer console and reported in the Extensions view status.

- **Remove:** Use the trash icon on an extension card and confirm. This deletes the installed copy from BeagleEditor's extension directory; keep a separate copy if you want to reinstall it later.

Use cleanup to remove event listeners, stop timers, cancel work, and unregister commands. Avoid starting background work that cannot be stopped.
