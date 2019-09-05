import * as vscode from 'vscode';
import * as constants from './constants';
import { SketchIngestorService } from './generators/parser';
import { SketchFileProvider } from './generators/sketch-file-provider';
import { FileService, FrameworkFacade, MessageTypes, VSCodeService } from './utils';
import { Commands } from './webviews/Commands';
import { WebContext } from './webviews/webContext';

interface PackageJson {
	dependencies: [];
	devdependencies: [];
}

const defaultFrameworkSelection = () => {
	const fileUtils = FileService.getInstance();
	const workspacePath = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
	const packagePath = `${workspacePath!.uri.fsPath}/package.json`;
	const packageExist = fileUtils.fileExists(packagePath);
	if (packageExist) {
		const bufferdPackage = fileUtils.readFile(packagePath);
		const packageStrinbg = JSON.parse(bufferdPackage.toString()) as PackageJson;
		return findFrameworkPackages(packageStrinbg);
	}
	return [];

};

const findFrameworkPackages = (packageJson: PackageJson) => {
	const packages = Object.keys(packageJson.dependencies);
	return constants.FRAMEWORKS.filter(framework => packages.find(e => e.includes(framework)));

};
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

	// workplace detection
	let defaultFramework: string;
	const _dependencyFrameworks = defaultFrameworkSelection();
	_dependencyFrameworks.length > 0 ? (defaultFramework = _dependencyFrameworks[0]) : constants.FRAMEWORKS.find(e => e === 'angular');


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
				await vscodeUtils.showQuickDialog(frameworkFacade.getFrameworks(defaultFramework as constants.Frameworks), constants.SELECT_FRAMEWORK, false);
			if (!frameworkSelection) { return; }
		}

		let incomingpath: string[] = pickedSketchFiles && pickedSketchFiles.map(file => `${workspaceDir}/${file}`) || [args.fsPath];
		await incomingpath.forEach(async (item, _index) => {
			const filePath = fileUtils.filePath(item);
			const data = await sketchIngestor.process(item);

			const files: Array<any> = frameworkFacade.generate(frameworkSelection, data.pages[0]);
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

	disposables.push(vscode.window.createTreeView(SketchFileProvider.provider_name, { treeDataProvider: new SketchFileProvider(vscode.workspace.rootPath as string) }).onDidChangeVisibility(({ visible }) => {
		visible ? vscode.commands.executeCommand(Commands.OpenDragDrop) : webViewPanel.dispose();
	}));


	// A list of disposables
	disposables.forEach(item => context.subscriptions.push(item));
}

export function deactivate() { }
