# Change Log

All notable changes to the "showpp" extension will be documented in this file.

## [0.0.2]

### Added
- **Language Support**: Registered `spinscript` language with extensions `.spin` and `.spinscript`.
- **Auto-Open Feature**: Automatically opens the pulse sequence viewer when a spinscript file is opened or focused.
- **Split-View Layout**: Pulse sequence diagram now appears above the code editor in a split view.
- **Close Command**: New command `showpp.closePulseSequenceViewer` to close both the webview and code editor together.
- **Document Close Listener**: Webview is automatically disposed when the visualized document is closed.
- **Debounced Auto-Open**: Auto-open listeners are debounced to prevent duplicate triggering.

### Fixed
- Eliminated duplicate editor tabs when opening the viewer.
- Improved re-entrancy protection with guards and debouncing.
- Fixed panel reveal logic to avoid unnecessary splits when panel already exists.

### Changed
- Refactored `activate()` function to close other editors of the same document before opening the viewer.
- Improved extension startup behavior for spinscript files.

## [0.0.1]

### Added
- Initial extension setup.
- Command `showpp.openPulseSequenceViewer` to launch the visualization panel.
- Integrated D3.js via CDN for rendering SVG graphics.
- Implemented basic architecture: Extension -> JSON Model -> WebView.
- Added mock data generation for multiple channels (F1, F2, Gradient).
- Support for visualizing delays, pulses, gradients, and FID events.