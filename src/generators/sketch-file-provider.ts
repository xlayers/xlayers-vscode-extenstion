

import * as fs from 'fs';
import * as vscode from 'vscode';
import * as constants from '../constants';
import { VSCodeService } from '../utils';

export class SketchFileProvider implements vscode.TreeDataProvider<Sketch> {
    private _onDidChangeTreeData: vscode.EventEmitter<Sketch | undefined> = new vscode.EventEmitter<Sketch | undefined>();
    readonly onDidChangeTreeData: vscode.Event<Sketch | undefined> = this._onDidChangeTreeData.event;
    static provider_name: string = 'sketchProvider';
    private readonly vsCodeUtils: VSCodeService;
    constructor(private readonly workspaceRoot: string) {
        this.vsCodeUtils = VSCodeService.getInstance();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Sketch): vscode.TreeItem {
        return {
            resourceUri: element.uri,
            collapsibleState: void 0,
            contextValue: 'sketch',
            command:
            {
                command: 'xlayers.open',
                arguments: [{ uri: element.uri }],
                title: 'Generate component', tooltip: 'Generate component'
            }
        };
    }

    public getChildren(element?: Sketch): Sketch[] | Thenable<Sketch[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage(constants.NO_SKETCH_FILE_IN_WORKPLACE);
            return Promise.resolve([]);
        }

        return this.findSketchFile(this.workspaceRoot).then(files => {
            if (!files) {
                vscode.window.showInformationMessage(constants.NO_SKETCH_FILE_IN_WORKPLACE);
                return Promise.resolve([]);
            }
            return files;

        });
    }

    private mapToTreeViewItem(item: string): Sketch {
        return {
            name: item,
            uri: {
                authority: 'xlayers',
                fsPath: `${item}`,
                scheme: 'sketch',
                path: `${item}`
            }
        } as Sketch;
    }

    public getParent(element: Sketch): any {
        return;
    }

    private async findSketchFile(folderPath: string): Promise<any> {
        const files = await this.vsCodeUtils.getFilesByPattern(folderPath);
        return files.map(item => this.mapToTreeViewItem(item));
    }
}

export interface Sketch {
    uri: vscode.Uri;
    name: string;
}