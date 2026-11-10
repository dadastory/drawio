# FlashYun integration

Pinned upstream: v32.6.9 (`3e707fd20b6930778d6f6bf6e4d0079b4bce366b`). Branch: `flashyun-native-file-actions`.

`native-file-actions.js` is added. The host Docker build appends it to the
pinned image's PostConfig.js, after official classes are loaded and before App
initialization. It activates only with `flashyun=1&embed=1`, using the upstream
`Draw.loadPlugin`, Actions/Menus, remoteInvoke, embed export and status protocols.
Runtime plugin discovery remains disabled. No generated bundle is patched.

The source bootstrap's FlashYun branch waits for PostConfig before App starts.
This prevents a loaded window from starting App before the native action queue
is registered. Other upstream/Electron startup paths are unchanged.

Save publishes a new version of the current Drive file. Export As opens the
host's unified format/name/destination dialog: publish an independent file to
Drive or download to the device. Quick Download exports the current draw.io XML.
Exports do not change the original binding, undo history or modified state.

All downloads use the host's browser adapter. The upstream suppressNewWindows
capture listener cancels iframe download anchors, even blob URLs. Keep that
link isolation enabled; enable the official exportProtocol and route unsolicited
native exports to the host while SDK-requested responses remain caller-owned.
The host offers XML, PNG, SVG and HTML from the official embed export protocol;
native Print is retained. No server conversion service is added.

On upstream updates, review native file menu, export protocol, keyboard
bindings, EmbedFile and local download semantics. Main-repository behavior tests
cover the contribution and the React publication adapter.

Assistant edits use the official JSON embed `patch` action. The same local
extension recognizes one closed `_flashyun` envelope: a no-op capability probe,
then an exact native XML base check immediately before applying the reviewed
cell patch. Ordinary upstream patches keep their original semantics. Guarded
patches call `DrawioFile.patch` with `undoable` and `sendChanges` enabled, adding
the edit to native history without replacing the file or unrelated pages.
The host validates all stable page/cell IDs and optional field preconditions
before dispatch. No arbitrary patch, script, remote plugin or engine method is
accepted from the assistant. Geometry and user-object values are serialized
through DOM APIs only for the fields required by the official JSON diff codec.

Layout uses a closed set of synchronous native mxGraph layout classes, within
one native model transaction, after the same base guard. It requires the exact
current page ID; other page layouts are rejected. This avoids an asynchronous
layout loader applying a command after its checked base changed.
