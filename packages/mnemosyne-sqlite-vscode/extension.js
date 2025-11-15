const vscode = require('vscode');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Mnemosyne SQLite MCP extension is now active');

	// Register install command
	let installCommand = vscode.commands.registerCommand('mnemosyne.sqlite.install', async () => {
		const terminal = vscode.window.createTerminal('Mnemosyne Install');
		terminal.show();
		terminal.sendText('npm install -g @mnemosyne/sqlite');
		
		vscode.window.showInformationMessage(
			'Installing Mnemosyne SQLite MCP Server globally...',
			'View Terminal'
		).then(selection => {
			if (selection === 'View Terminal') {
				terminal.show();
			}
		});
	});

	// Register configure command
	let configureCommand = vscode.commands.registerCommand('mnemosyne.sqlite.configure', async () => {
		const config = vscode.workspace.getConfiguration('mnemosyne.sqlite');
		const dbPath = config.get('databasePath');
		
		// Get the workspace folder
		const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
		if (!workspaceFolder) {
			vscode.window.showErrorMessage('No workspace folder open');
			return;
		}

		// Resolve the database path
		const resolvedPath = dbPath.replace('${workspaceFolder}', workspaceFolder.uri.fsPath);
		const dbDir = path.dirname(resolvedPath);

		// Create directory if it doesn't exist
		if (!fs.existsSync(dbDir)) {
			fs.mkdirSync(dbDir, { recursive: true });
			vscode.window.showInformationMessage(`Created directory: ${dbDir}`);
		}

		// Show configuration info
		const message = `Mnemosyne SQLite Configuration:
		
Database Path: ${resolvedPath}

To use with MCP clients (e.g., Claude Desktop, Cline), add this to your configuration:

{
  "mcpServers": {
    "mnemosyne-sqlite": {
      "command": "npx",
      "args": ["-y", "@mnemosyne/sqlite"],
      "env": {
        "MNEMOSYNE_DB_PATH": "${resolvedPath}"
      }
    }
  }
}`;

		const action = await vscode.window.showInformationMessage(
			'Configuration ready. Copy to clipboard?',
			'Copy', 'Open Settings'
		);

		if (action === 'Copy') {
			const configJson = JSON.stringify({
				mcpServers: {
					"mnemosyne-sqlite": {
						command: "npx",
						args: ["-y", "@mnemosyne/sqlite"],
						env: {
							MNEMOSYNE_DB_PATH: resolvedPath
						}
					}
				}
			}, null, 2);
			await vscode.env.clipboard.writeText(configJson);
			vscode.window.showInformationMessage('Configuration copied to clipboard!');
		} else if (action === 'Open Settings') {
			vscode.commands.executeCommand('workbench.action.openSettings', 'mnemosyne.sqlite');
		}
	});

	// Register stats command
	let statsCommand = vscode.commands.registerCommand('mnemosyne.sqlite.showStats', async () => {
		try {
			const config = vscode.workspace.getConfiguration('mnemosyne.sqlite');
			const dbPath = config.get('databasePath');
			const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
			
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('No workspace folder open');
				return;
			}

			const resolvedPath = dbPath.replace('${workspaceFolder}', workspaceFolder.uri.fsPath);

			if (!fs.existsSync(resolvedPath)) {
				vscode.window.showInformationMessage('Knowledge base not yet created. Use the MCP server to store knowledge first.');
				return;
			}

			// Get file stats
			const stats = fs.statSync(resolvedPath);
			const sizeInMB = (stats.size / 1024 / 1024).toFixed(2);

			// Try to get record count using sqlite3 if available
			try {
				const { stdout } = await execAsync(`sqlite3 "${resolvedPath}" "SELECT COUNT(*) FROM knowledge;"`);
				const count = parseInt(stdout.trim());
				
				vscode.window.showInformationMessage(
					`Knowledge Base Stats:\n\nRecords: ${count}\nDatabase Size: ${sizeInMB} MB\nLocation: ${resolvedPath}`,
					'Open Folder'
				).then(action => {
					if (action === 'Open Folder') {
						vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(resolvedPath));
					}
				});
			} catch (sqliteError) {
				// sqlite3 not available, just show size
				vscode.window.showInformationMessage(
					`Knowledge Base Stats:\n\nDatabase Size: ${sizeInMB} MB\nLocation: ${resolvedPath}\n\n(Install sqlite3 for detailed stats)`,
					'Open Folder'
				).then(action => {
					if (action === 'Open Folder') {
						vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(resolvedPath));
					}
				});
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error getting stats: ${error.message}`);
		}
	});

	context.subscriptions.push(installCommand, configureCommand, statsCommand);

	// Show welcome message on first activation
	const extensionPath = context.extensionPath;
	const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
	
	if (!hasShownWelcome) {
		vscode.window.showInformationMessage(
			'Welcome to Mnemosyne SQLite! Configure your knowledge base to get started.',
			'Configure Now', 'Later'
		).then(action => {
			if (action === 'Configure Now') {
				vscode.commands.executeCommand('mnemosyne.sqlite.configure');
			}
		});
		context.globalState.update('hasShownWelcome', true);
	}
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
