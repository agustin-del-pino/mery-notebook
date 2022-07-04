import * as vscode from 'vscode';
import * as utils from './utils';
import * as mery from './mery';

class QuickChapter implements vscode.QuickPickItem {
	label: string;
	index: number;
	constructor(title: string, index: number) {
		this.label = title;
		this.index = index;
	}
}

const showQuickPickChapters = async (picks: QuickChapter[]) => {
	const chapter = await vscode.window.showQuickPick(picks);
	if (chapter) {
		const subChapters = mery.notebook.getSubChaptersTitle(chapter.index);
		if (!subChapters || chapter === picks[0]) {
			vscode.commands.executeCommand('mery.notebook.open', chapter.index);
			return;
		}
		showQuickPickChapters([chapter, ...subChapters.map((c) => (new QuickChapter(c.title, c.index)))]);
	}
};

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('mery.project.create', async (chapter?: number) => {
		let isVsCodeShellInstalled = false;

		try {
			await utils.os.exec("code", "-h");
			isVsCodeShellInstalled = true;
		} catch {
			const response = await vscode.window.showWarningMessage("The vscode shell command is not installed. Press 'Yes' to install", 'Yes', 'No');
			if (response === 'No') {
				vscode.window.showWarningMessage("The mery project won't open automatically. Must be done by manually.");
			} else {
				await vscode.commands.executeCommand('workbench.action.installCommandLine');
				isVsCodeShellInstalled = true;
			}
		}

		const title = await utils.text.input("Enter the title of notebook", "Untitle Notebook");
		const author = await utils.text.input("Enter the author of notebook", "Annonymus");
		const { selection, hasSelection } = await utils.path.selectFS("Select folder to create the notebook", "Select Folder", utils.path.FSSelection.dirs);

		if (!hasSelection) { return; }

		const path = await mery.project.createProject(selection[0].fsPath, title, author);

		if (!isVsCodeShellInstalled) {
			vscode.window.showInformationMessage(`The mery project was created at ${path}.`);
			return;
		}

		utils.os.exec("code", path);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('mery.project.build',async () => {
		const project = await mery.project.loadProject(utils.path.getCwd());
		const path = await mery.project.saveAndBuildNotebook(utils.path.getCwd(), project);
		vscode.window.showInformationMessage(`The Mery Notebook was built.\n${path}`);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('mery.notebook.open', async (chapter?: number) => {
		const panel = vscode.window.createWebviewPanel('meryNotebook', 'Mery Notebook', vscode.ViewColumn.Beside, {
			enableScripts: true,
		});
		chapter = chapter === undefined ? mery.notebook.getCurrentChapter() : chapter;

		panel.webview.html = mery.notebook.getChapterHtml(chapter) || "";

		panel.webview.onDidReceiveMessage(({ command }) => {
			if (command !== "submit") {
				const chapter = mery.notebook.getChapterHtml(mery.notebook.getCurrentChapter() + (command === "back" ? -1 : 1));
				if (chapter) { panel.webview.html = chapter; }

			} else {
				const results = mery.notebook.submit(vscode.window.visibleTextEditors[0].document.getText() || "");
				results?.forEach(({ ok, message }) => {
					if (ok) {
						vscode.window.showInformationMessage(message);
					} else {
						vscode.window.showErrorMessage(message);
					}
				});
			}
		});
	}));
	context.subscriptions.push(vscode.commands.registerCommand('mery.notebook.load', async () => {
		const { selection, hasSelection } = await utils.path.selectFS("Load a Mery Notebook", "Load", utils.path.FSSelection.files);

		if (!hasSelection) { return; }

		const path = selection[0].fsPath;

		if (!path.endsWith(".mery")) {
			vscode.window.showErrorMessage("The selected file is not a Mery Notebook.");
			return;
		}

		await mery.notebook.loadNotebook(path);
		vscode.commands.executeCommand('mery.notebook.open');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('mery.notebook.chapters', async () => {
		showQuickPickChapters(mery.notebook.getChaptersTitle().map((c) => (new QuickChapter(c.title, c.index))));
	}));
}

export function deactivate() { }
