# showpp

**showpp** is a VS Code extension designed to visualize Bruker TopSpin pulse sequences. It parses pulse program files and renders them as time-domain diagrams using D3.js within a VS Code WebView.

## Features

- **Pulse Sequence Visualization**: View pulse sequences as interactive SVG diagrams with multiple channels (F1, F2, Gradient).
- **Auto-Open for SpinScript Files**: Automatically opens the visualization when you open or focus a `.spin` or `.spinscript` file.
- **Split-View Layout**: Displays the time diagram above and pulse sequence code below for easy cross-reference.
- **Neutral Model Architecture**: Converts pulse programs into a standardized JSON format before rendering.
- **Supports Delays, Pulses, Gradients, and FID Events**: Visualizes different event types with appropriate representations.

## Usage

### Auto-Open (Recommended)
Simply open a `.spin` or `.spinscript` file — the viewer will automatically launch with the diagram above and code below.

### Manual Commands

**Open Pulse Sequence Viewer**
1. Open the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux).
2. Type and select **Open Pulse Sequence Viewer**.
3. The visualization will appear in split-view mode (diagram on top, code on bottom).

**Close Pulse Sequence Viewer**
1. Open the Command Palette.
2. Type and select **Close Pulse Sequence Viewer**.
3. This closes both the webview diagram and the associated code editor.

### File Association

If your pulse sequence files use a different extension (e.g., `.pp`), add this to your VS Code `settings.json`:

```json
"files.associations": {
  "*.pp": "spinscript"
}
```

## Known Issues

- The extension currently uses hardcoded mock data for demonstration purposes.
- Real-time parsing of Bruker XML pulse program files (`wvmPPInfo.xml`) is under development.
- When opening a spinscript file, duplicate editors may briefly appear in some scenarios.
- Closing the code editor may not immediately close the webview in all cases.

## Roadmap

- [ ] Implement XML parser for `wvmPPInfo.xml` files to read actual pulse sequences.
- [ ] Support for variable resolution and unit handling (microseconds, milliseconds, etc.).
- [ ] Interactive event tooltips and event filtering.
- [ ] Keybinding support for opening/closing the viewer.

## Release Notes

### 0.0.2
- Added auto-open feature for spinscript language files.
- Implemented split-view layout with webview above and code editor below.
- Added `showpp.closePulseSequenceViewer` command to close both views simultaneously.
- Improved duplicate editor handling.
- Added document close listener to auto-dispose webview.
- Debounced auto-open listeners to prevent repeated triggering.
- Updated package.json with spinscript language configuration.

### 0.0.1
- Initial release with basic WebView and D3.js integration.
- Implemented Neutral Model architecture for pulse sequence representation.
- Added mock data visualization.