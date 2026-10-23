# FlashYun integration

Pinned upstream: v32.5.5 (`17b367b`). Branch: `flashyun-native-file-actions`.

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
