import { ExtensionContext } from 'vscode';
import { DragDropView } from './DragDropView';

export class WebContext {
    private static _context: ExtensionContext;
    private static _dragDropView: DragDropView;

    static initialize(context: ExtensionContext) {
        this._context = context;
        context.subscriptions.push((this._dragDropView = new DragDropView()));
    }

    static get context() {
        return this._context;
    }

    static get dragDropView() {
        return this._dragDropView;
    }
}
