import { window, workspace } from 'vscode';
import { MessageTypes } from './message-types';
import * as fs from 'fs';
import * as path from 'path';

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
        }
    }

    private async fromDir(startPath: string, filter: string, fileArray: string[]) {

        //.log('Starting from dir '+startPath+'/');

        if (!fs.existsSync(startPath)) {
            console.log("no dir ", startPath);
            return;
        }

        var files = fs.readdirSync(startPath).filter(e => e.indexOf('node_modules'))
        for (var i = 0; i < files.length; i++) {
            var filename = path.join(startPath, files[i]);
            var stat = fs.lstatSync(filename);
            if (stat.isDirectory()) {
                await this.fromDir(filename, filter, fileArray); //recurse
            }
            else if (filename.indexOf(filter) >= 0) {
                fileArray.push(filename);
            };
        };
    };

    async getFilesByPattern(folderPath: string, pattern: string = '.sketch') {
        let fileArray: string[] = [];
        await this.fromDir(folderPath, pattern, fileArray);
        return fileArray;
    }

    async showQuickDialog(items: string[], placeHolder: string, multiSelection: boolean): Promise<any> {
        return await window.showQuickPick(items, { placeHolder, matchOnDetail: true, canPickMany: multiSelection });
    }
}
