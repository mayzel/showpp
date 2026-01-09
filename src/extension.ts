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

			const doc = editor.document;
			visualizedDocument = doc;

			// If panel already exists, just update and return
			if (currentPanel) {
				currentPanel.reveal(vscode.ViewColumn.One);
				updateWebview(doc);
				return;
			}

			// Close all visible editors showing this document before creating the webview
			for (const ed of vscode.window.visibleTextEditors) {
				if (ed.document.uri.toString() === doc.uri.toString()) {
					await vscode.window.showTextDocument(ed.document, { viewColumn: ed.viewColumn, preview: false });
					await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
				}
			}

			// Create the webview in ViewColumn.One (top)
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

			// Split down to create bottom group (ViewColumn.Two)
			await vscode.commands.executeCommand('workbench.action.splitEditorDown');

			// Show the document in the bottom group
			await vscode.window.showTextDocument(doc.uri, { viewColumn: vscode.ViewColumn.Two, preview: false });

			// Render the diagram
			updateWebview(doc);
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
	const closeDocListener = vscode.workspace.onDidCloseTextDocument(doc => {
		if (visualizedDocument && doc.uri.toString() === visualizedDocument.uri.toString()) {
			if (currentPanel) {
				currentPanel.dispose();
				currentPanel = undefined;
			}
			visualizedDocument = undefined;
		}
	});

	// Dispose webview when the visualized document is no longer visible in any editor
	const closeEditorListener = vscode.window.onDidChangeVisibleTextEditors(editors => {
		if (currentPanel && visualizedDocument) {
			const isStillVisible = editors.some(
				ed => ed.document.uri.toString() === visualizedDocument!.uri.toString()
			);
			if (!isStillVisible) {
				currentPanel.dispose();
				currentPanel = undefined;
				visualizedDocument = undefined;
			}
		}
	});

	// Auto-open the viewer when a spinscript file is opened
	// Trigger on file open (not on every focus change to avoid repeated opens)
	const openListener = vscode.workspace.onDidOpenTextDocument(doc => {
		if (doc.languageId === 'spinscript') {
			// Only open if there's no panel, or if the panel is for a different document
			const isDifferentDoc = !visualizedDocument || visualizedDocument.uri.toString() !== doc.uri.toString();
			if (!currentPanel || isDifferentDoc) {
				// Use setTimeout to defer execution and allow editor to fully settle
				setTimeout(() => {
					if (vscode.window.activeTextEditor?.document.uri === doc.uri) {
						vscode.commands.executeCommand('showpp.openPulseSequenceViewer');
					}
				}, 100);
			}
		}
	});

	// Auto-open viewer when a spinscript file becomes visible (handles cached/reopened files)
	const visibilityListener = vscode.window.onDidChangeVisibleTextEditors(editors => {
		// Check if any visible editor is a spinscript file without a panel
		for (const editor of editors) {
			if (editor.document.languageId === 'spinscript') {
				const isDifferentDoc = !visualizedDocument || visualizedDocument.uri.toString() !== editor.document.uri.toString();
				if (!currentPanel || isDifferentDoc) {
					// Make sure this editor is active and defer to avoid loops
					if (vscode.window.activeTextEditor === editor) {
						setTimeout(() => {
							vscode.commands.executeCommand('showpp.openPulseSequenceViewer');
						}, 100);
					}
					break; // Only open for the first spinscript file
				}
			}
		}
	});

	context.subscriptions.push(disposable, openListener, closeDocListener, closeEditorListener, visibilityListener);

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
