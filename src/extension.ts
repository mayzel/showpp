import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parsePulseProgram } from './parser';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('showpp.openPulseSequenceViewer', () => {
		const panel = vscode.window.createWebviewPanel(
			'pulseSequenceViewer',
			'Pulse Sequence Viewer',
			vscode.ViewColumn.One,
			{
				enableScripts: true,
				localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'webview')]
			}
		);

		panel.webview.html = getWebviewContent(context, panel);

		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active text editor found.');
			return;
		}

		const content = editor.document.getText();
		const neutralModel = parsePulseProgram(content);

		// Send JSON to Webview
		setTimeout(() => {
			panel.webview.postMessage({ command: 'render', data: neutralModel });
		}, 500);
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel): string {
    const webviewPath = path.join(context.extensionPath, 'webview');
    const indexPath = path.join(webviewPath, 'index.html');
    
    // Create a URI for the main.js file
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'main.js'));
    
    // Read the HTML file from disk
    let html = fs.readFileSync(indexPath, 'utf8');
    
    // Replace the placeholder script path with the correct webview URI
    html = html.replace('src="./main.js"', `src="${scriptUri}"`);
    
    // Set the Content-Security-Policy
    const cspSource = panel.webview.cspSource;
    html = html.replace(
        /<meta http-equiv="Content-Security-Policy" content=".*">/,
        `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https: ${cspSource}; style-src 'unsafe-inline' ${cspSource};">`
    );

    return html;
}

// This method is called when your extension is deactivated
export function deactivate() {}
