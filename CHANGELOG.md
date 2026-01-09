# Change Log

All notable changes to the "showpp" extension will be documented in this file.

## [0.0.3]

### Added
- **Responsive Diagram Scaling**: Diagram now redraws automatically when split-view dividers are dragged.
- **Dynamic Layout Adaptation**: Channels and diagram elements scale to fit available space.
- **Multi-trigger Resize Detection**: Combines ResizeObserver, window.resize event, and polling for reliable dimension tracking.

### Fixed
- Fixed webview not responding to split-view vertical resize events.
- Ensured HTML and body elements take up 100% of available space.
- Improved fallback dimension detection using window.innerHeight and window.innerWidth.

## [0.0.2]

### Added
- **Language Support**: Registered `spinscript` language with extensions `.spin` and `.spinscript`.
- **Auto-Open Feature**: Automatically opens the pulse sequence viewer when a spinscript file is opened or becomes visible.
- **Split-View Layout**: Pulse sequence diagram now appears above the code editor in a split view.
- **Close Command**: New command `showpp.closePulseSequenceViewer` to close both the webview and code editor together.
- **Editor Visibility Listener**: Monitors editor visibility changes to auto-close webview when code editor closes and auto-reopen when file is reopened.
- **Dual Auto-Open Triggers**: Combines `onDidOpenTextDocument` and `onDidChangeVisibleTextEditors` listeners to handle both new files and cached/reopened files.

### Fixed
- Eliminated duplicate editor tabs when opening the viewer.
- Fixed webview not closing when code editor is closed.
- Fixed webview not reopening when the same file is reopened after closure.
- Improved re-entrancy protection with guards and debouncing.
- Fixed panel reveal logic to avoid unnecessary splits when panel already exists.

### Changed
- Refactored `activate()` function to close other editors of the same document before opening the viewer.
- Improved extension startup behavior for spinscript files.
- Enhanced auto-open logic to detect and handle both new documents and cached documents becoming visible.

## [0.0.1]

### Added
- Initial extension setup.
- Command `showpp.openPulseSequenceViewer` to launch the visualization panel.
- Integrated D3.js via CDN for rendering SVG graphics.
- Implemented basic architecture: Extension -> JSON Model -> WebView.
- Added mock data generation for multiple channels (F1, F2, Gradient).
- Support for visualizing delays, pulses, gradients, and FID events.