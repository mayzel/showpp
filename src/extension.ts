import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('showpp.openPulseSequenceViewer', () => {
		// Create a WebView panel
		const panel = vscode.window.createWebviewPanel(
			'pulseSequenceViewer',
			'Pulse Sequence Viewer',
			vscode.ViewColumn.One,
			{ enableScripts: true }
		);

		panel.webview.html = getWebviewContent();

		// Mock: Parse pulse program -> Convert to neutral JSON model
		const neutralModel = {
			channels: [{ id: 'ch1', name: 'RF' }],
			events: [
				{ time: 50, duration: 100, phase: 0, power: 0.8, gradient: 0 }
			],
			annotations: []
		};

		// Send JSON to Webview
		setTimeout(() => {
			panel.webview.postMessage({ command: 'render', data: neutralModel });
		}, 500);
	});

	context.subscriptions.push(disposable);
}

function getWebviewContent() {
	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' https:; style-src 'unsafe-inline';">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Pulse Sequence Viewer</title>
	<script src="https://d3js.org/d3.v7.min.js"></script>
</head>
<body>
	<div id="viz"></div>
	<script>
		const vscode = acquireVsCodeApi();
		window.addEventListener('message', event => {
			const message = event.data;
			if (message.command === 'render') {
				draw(message.data);
			}
		});

		function draw(model) {
			const width = 600, height = 200;
			d3.select("#viz").selectAll("*").remove();
			const svg = d3.select("#viz").append("svg").attr("width", width).attr("height", height).style("background", "white");
			const x = d3.scaleLinear().domain([0, 300]).range([20, 580]);
			const y = d3.scaleLinear().domain([0, 1]).range([180, 20]);
			svg.append("g").attr("transform", "translate(0,180)").call(d3.axisBottom(x));
			svg.selectAll("rect").data(model.events).enter().append("rect")
				.attr("x", d => x(d.time)).attr("y", d => y(d.power))
				.attr("width", d => x(d.time + d.duration) - x(d.time))
				.attr("height", d => y(0) - y(d.power)).attr("fill", "steelblue");
		}
	</script>
</body>
</html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
