import * as vscode from 'vscode';
import * as path from 'path';
import { TextDecoder } from 'util';
import { parsePulseProgram } from './parser';

let currentPanel: vscode.WebviewPanel | undefined;
let visualizedDocument: vscode.TextDocument | undefined;
let autoOpenInProgress = false;

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('showpp.openPulseSequenceViewer', async () => {
		if (autoOpenInProgress) return;
		autoOpenInProgress = true;
		try {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage('No active text editor found.');
				return;
			}
			visualizedDocument = editor.document;
			const originalDocumentUri = visualizedDocument.uri;

			// Close all other editors showing this document (to avoid duplicates)
			for (const ed of vscode.window.visibleTextEditors) {
				if (ed.document.uri.toString() === originalDocumentUri.toString()) {
					await vscode.window.showTextDocument(ed.document, { viewColumn: ed.viewColumn, preview: false });
					await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
				}
			}

			// If a panel already exists, reveal it and ensure the document is visible in the bottom group (no splitting)
			if (currentPanel) {
				currentPanel.reveal(vscode.ViewColumn.One);
				await vscode.window.showTextDocument(originalDocumentUri, { viewColumn: vscode.ViewColumn.Two, preview: false });
				setTimeout(() => updateWebview(visualizedDocument!), 200);
				return;
			}

			// Ensure the document is shown in the top editor group
			await vscode.window.showTextDocument(originalDocumentUri, { viewColumn: vscode.ViewColumn.One, preview: false });

			// Split the editor downwards to create a bottom group
			await vscode.commands.executeCommand('workbench.action.splitEditorDown');

			// Create the webview in the top group (ViewColumn.One)
			const panel = vscode.window.createWebviewPanel(
				'pulseSequenceViewer',
				'Pulse Sequence Viewer',
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'webview')]
				}
			);
			currentPanel = panel;

			panel.onDidDispose(
				() => {
					currentPanel = undefined;
					visualizedDocument = undefined;
					autoOpenInProgress = false;
				},
				null,
				context.subscriptions
			);

			panel.webview.html = await getWebviewContent(context, panel);

			// Ensure the bottom editor shows the original document
			await vscode.window.showTextDocument(originalDocumentUri, { viewColumn: vscode.ViewColumn.Two, preview: false });

			// Initial render
			setTimeout(() => {
				updateWebview(visualizedDocument!);
			}, 300);
		} finally {
			autoOpenInProgress = false;
		}
	});

	const updateWebview = (document: vscode.TextDocument) => {
		if (currentPanel && document) {
			try {
				const content = document.getText();
				const neutralModel = parsePulseProgram(content);
				currentPanel.webview.postMessage({ command: 'render', data: neutralModel });
			} catch (e) {
				console.error('Error parsing pulse program:', e);
				// Optional: Post an error message to the webview here
			}
		}
	};

	const debouncedUpdate = debounce(updateWebview, 300);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (currentPanel && visualizedDocument && event.document.uri === visualizedDocument.uri) {
			debouncedUpdate(event.document);
		}
	});

	// Dispose webview when the visualized document is closed
	vscode.workspace.onDidCloseTextDocument(doc => {
		if (visualizedDocument && doc.uri.toString() === visualizedDocument.uri.toString()) {
			if (currentPanel) {
				currentPanel.dispose();
				currentPanel = undefined;
			}
			visualizedDocument = undefined;
		}
	});

	// Auto-open the viewer for spinscript files when active or opened (debounced)
	const debouncedOpen = debounce((doc: vscode.TextDocument) => {
		if (doc?.languageId === 'spinscript') {
			// Only open if there is no panel yet
			if (!currentPanel) vscode.commands.executeCommand('showpp.openPulseSequenceViewer');
		}
	}, 200);

	if (vscode.window.activeTextEditor?.document.languageId === 'spinscript') {
		debouncedOpen(vscode.window.activeTextEditor.document);
	}

	const openListener = vscode.workspace.onDidOpenTextDocument(doc => {
		debouncedOpen(doc);
	});

	const changeEditorListener = vscode.window.onDidChangeActiveTextEditor(ed => {
		if (ed?.document) debouncedOpen(ed.document);
	});

	context.subscriptions.push(disposable, openListener, changeEditorListener);

	const closeDisposable = vscode.commands.registerCommand('showpp.closePulseSequenceViewer', async () => {
		if (currentPanel) { currentPanel.dispose(); currentPanel = undefined; }
		if (visualizedDocument) {
			const uri = visualizedDocument.uri;
			for (const ed of vscode.window.visibleTextEditors) {
				if (ed.document.uri.toString() === uri.toString()) {
					await vscode.window.showTextDocument(ed.document, { viewColumn: ed.viewColumn, preview: false });
					await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
				}
			}
			visualizedDocument = undefined;
		}
	});

	context.subscriptions.push(closeDisposable);
}


function debounce(func: Function, wait: number) {
	let timeout: NodeJS.Timeout | undefined;
	return function(...args: any[]) {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

async function getWebviewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel): Promise<string> {
    const indexPath = vscode.Uri.joinPath(context.extensionUri, 'webview', 'index.html');
    
    // Create a URI for the main.js file
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview', 'main.js'));
    
    // Read the HTML file from disk using workspace fs (supports remote)
    const fileData = await vscode.workspace.fs.readFile(indexPath);
    let html = new TextDecoder('utf-8').decode(fileData);
    
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
