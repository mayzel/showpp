# showpp

**showpp** is a VS Code extension designed to visualize Bruker TopSpin pulse sequences. It parses pulse program files and renders them as time-domain diagrams using D3.js within a VS Code WebView.

## Features

- **Pulse Sequence Visualization**: View pulse sequences as interactive SVG diagrams.
- **Neutral Model Architecture**: Converts pulse programs into a standardized JSON format before rendering.

## Usage

1. Open the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux).
2. Type and select **Open Pulse Sequence Viewer**.
3. A new panel will open displaying the visualized pulse sequence (currently using mock data).

## Known Issues

- The extension currently uses hardcoded mock data for demonstration purposes.
- Real-time parsing of `.pp` files is under development.

## Release Notes

### 0.0.1
- Initial release with basic WebView and D3.js integration.