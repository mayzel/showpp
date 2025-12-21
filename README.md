# showpp README
# showpp

This is the README for your extension "showpp". After writing up a brief description, we recommend including the following sections.
**showpp** is a VS Code extension designed to visualize Bruker TopSpin pulse sequences. It parses pulse program files and renders them as time-domain diagrams using D3.js within a VS Code WebView.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.
- **Pulse Sequence Visualization**: View pulse sequences as interactive SVG diagrams.
- **Neutral Model Architecture**: Converts pulse programs into a standardized JSON format before rendering.

For example if there is an image subfolder under your extension project workspace:
## Usage

\!\[feature X\]\(images/feature-x.png\)
1. Open the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux).
2. Type and select **Open Pulse Sequence Viewer**.
3. A new panel will open displaying the visualized pulse sequence (currently using mock data).

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.
- The extension currently uses hardcoded mock data for demonstration purposes.
- Real-time parsing of pulse programs files is under development.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
### 0.0.1
- Initial release with basic WebView and D3.js integration.
