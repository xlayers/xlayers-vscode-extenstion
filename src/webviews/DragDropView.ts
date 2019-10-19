import { WebviewBase } from './baseWebView';
import { Commands } from './Commands';
import { commands } from 'vscode';

export class DragDropView extends WebviewBase {
    filename: string = 'drag-drop.html';
    id: string = 'xlayers.drapdrop';
    title: string = 'Xlayers - Editor';


    constructor() {
        super(Commands.OpenDragDrop);
    }

    protected onMessageReceived(e: { command: string, data: any }) {
        switch (e.command) {
            case 'xlayers.fileSelected':
                commands.executeCommand(Commands.FileSelect, { fsPath: e.data.fsPath, webview: true, framework: e.data.framework });
                this.activePanel().dispose();
                break;
            default:
                console.error('Output will be in debug logging. But here we can handle events or we canb use the base class');
                break;
        }
    }
}
