import * as fs from 'fs';
import * as path from 'path';
import { window, workspace } from 'vscode';
import * as constants from '../constants';
import { FileService } from './file-utils';
import { MessageTypes } from './message-types';

interface PackageJson {
    dependencies: [];

    devdependencies: [];
}
export class VSCodeService {
    private static _instance: VSCodeService;

    private constructor() { }
    static getInstance() {
        if (!VSCodeService._instance) {
            VSCodeService._instance = new VSCodeService();
        }
        return VSCodeService._instance;
    }

    async showMessage(message: string, type: MessageTypes) {
        switch (type) {
            case MessageTypes.Info:
                await window.showInformationMessage(message, '🎉');
                break;
            case MessageTypes.Warning:
                await window.showWarningMessage(message, '😓');
                break;
            case MessageTypes.Error:
                await window.showErrorMessage(message, '🙈').then();
                break;
            default:
                break;
        }
    }

    private async fromDir(startPath: string, filter: string, fileArray: string[]) {


        if (!fs.existsSync(startPath)) {
            console.log('no dir ', startPath);
            return;
        }

        let files = fs.readdirSync(startPath).filter(e => e.indexOf('node_modules'));
        for (let i = 0; i < files.length; i++) {
            let filename = path.join(startPath, files[i]);
            let stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                await this.fromDir(filename, filter, fileArray); // recurse
            } else if (filename.indexOf(filter) >= 0) {
                fileArray.push(filename);
            }
        }
    }

    async getFilesByPattern(folderPath: string, pattern: string = '.sketch') {
        let fileArray: string[] = [];
        await this.fromDir(folderPath, pattern, fileArray);
        return fileArray;
    }

    async showQuickDialog(items: string[], placeHolder: string, multiSelection: boolean): Promise<any> {
        return await window.showQuickPick(items, { placeHolder, matchOnDetail: true, canPickMany: multiSelection });
    }

    public getFrameworksFromWorkspace = () => {
        const fileUtils = FileService.getInstance();
        const workspacePath = workspace.workspaceFolders && workspace.workspaceFolders[0];
        if (workspacePath) {

            const packagePath = `${workspacePath!.uri.fsPath}/package.json`;
            const packageExist = fileUtils.fileExists(packagePath);
            if (packageExist) {
                const bufferdPackage = fileUtils.readFile(packagePath);
                const packageStrinbg = JSON.parse(bufferdPackage.toString()) as PackageJson;
                return this.findFrameworkPackages(packageStrinbg);
            }
        }
        return [];

    }

    private findFrameworkPackages = (packageJson: PackageJson) => {
        const packages = Object.keys(packageJson.dependencies);
        return constants.FRAMEWORKS.filter(framework => packages.find(e => e.includes(framework)));

    }
}
