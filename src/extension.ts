import * as vscode from 'vscode';
import * as constants from './constants';
import { SketchIngestorService } from './generators/parser';
import { SketchFileProvider } from './generators/sketch-file-provider';
import { FileService, FrameworkFacade, MessageTypes, VSCodeService } from './utils';
import { Commands } from './webviews/Commands';
import { WebContext } from './webviews/webContext';

/**
 *
 * @export
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
	WebContext.initialize(context);

	/**
	 * When activated create some needed services
	 */
	const sketchIngestor = SketchIngestorService.getInstance();
	const frameworkFacade = FrameworkFacade.getInstance();
	const vscodeUtils = VSCodeService.getInstance();
	const fileUtils = FileService.getInstance();

	let webViewPanel: vscode.WebviewPanel;
	let disposables: Array<vscode.Disposable> = [];

	// in the future we could make listners to the package file
	// to react on changes of dependencies
	const defaultFramework: string[] = vscodeUtils.getFrameworksFromWorkspace();


	disposables.push(vscode.commands.registerCommand('xlayers.selectFile', async (args: any) => {
		let pickedSketchFiles: string[] | undefined;
		let workspaceDir: string = '';

		if (!args) {
			workspaceDir = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0].uri.fsPath || '';
			const files = await vscodeUtils.getFilesByPattern(workspaceDir);
			if (files.length === 0) {
				await vscodeUtils.showMessage(constants.NO_SKETCH_FILE_FOUND, MessageTypes.Warning);
				return;
			}
			const sketchFileTitles = files.map(file => fileUtils.fileName(file, '.sketch').replace(`${workspaceDir}/`, ''));
			pickedSketchFiles = await vscodeUtils.showQuickDialog(sketchFileTitles, constants.SELECT_SKETCH_FILE, true);


			if (!pickedSketchFiles || (pickedSketchFiles as string[]).length === 0) {
				return;
			}
		}

		let frameworkSelection = args.framework;
		if (!args.webview) {

			frameworkSelection =
				await vscodeUtils.showQuickDialog(frameworkFacade.getFrameworks(defaultFramework as constants.Frameworks[]), constants.SELECT_FRAMEWORK, false);
			if (!frameworkSelection) { return; }
		}

		let incomingpath: string[] = pickedSketchFiles && pickedSketchFiles.map(file => `${workspaceDir}/${file}`) || [args.fsPath];
		await incomingpath.forEach(async (item, _index) => {
			const filePath = fileUtils.filePath(item);
			const data = await sketchIngestor.process(item);

			const files: Array<any> = frameworkFacade.generate({ type: { type: frameworkSelection, ast: data.pages[0] } });
			let randomPathNr = Math.random();
			files.forEach((generatedFile, index) => {
				if (index === 0) {
					fileUtils.mkdir(`${filePath}/xlayers-${randomPathNr}/`);
				}
				fileUtils.writeFile(`${filePath}/xlayers-${randomPathNr}/${generatedFile.uri}`, generatedFile.value);
			});
		});
	}));


	disposables.push(vscode.commands.registerCommand('xlayers.open', ({ uri }) => {
		vscode.commands.executeCommand('xlayers.selectFile', uri);
	}));

	disposables.push(vscode.window.createTreeView(SketchFileProvider.provider_name,
		{ treeDataProvider: new SketchFileProvider(vscode.workspace.rootPath as string) }).onDidChangeVisibility(({ visible }) => {
			visible ? vscode.commands.executeCommand(Commands.OpenDragDrop) : webViewPanel.dispose();
		}));

	disposables.forEach(item => context.subscriptions.push(item));
}

// tslint:disable-next-line: no-empty
export function deactivate() { }
