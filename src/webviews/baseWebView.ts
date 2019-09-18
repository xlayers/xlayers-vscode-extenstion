import * as fs from 'fs';
import * as path from 'path';
import { commands, Disposable, Uri, ViewColumn, Webview, WebviewPanel, window, workspace } from 'vscode';
import { Commands } from './Commands';
import { WebContext } from './webContext';

export abstract class WebviewBase implements Disposable {
    private _html: string | undefined;
    private _panel: any;
    private _disposable!: Disposable;
    private _disposablePanel!: Disposable;

    abstract get filename(): string;
    abstract get id(): string;
    abstract get title(): string;
    activePanel(): WebviewPanel {
        return this._panel;
    }
    constructor(showCommand: Commands, column?: ViewColumn) {
        this._disposable = Disposable.from(
            commands.registerCommand(showCommand, () => this.show(column), this)
        );
    }

    dispose() {
        // tslint:disable-next-line: no-unused-expression
        this._disposable && this._disposable.dispose();
        // tslint:disable-next-line: no-unused-expression
        this._disposablePanel && this._disposablePanel.dispose();
    }


    async show(column: ViewColumn = ViewColumn.Active): Promise<void> {
        const html = await this.getHtml();

        if (this._panel === undefined) {
            this._panel = window.createWebviewPanel(
                this.id,
                this.title,
                { viewColumn: column, preserveFocus: false },
                {
                    enableScripts: true
                }
            );

            this._panel.iconPath = Uri.file(WebContext.context.asAbsolutePath('images/icon-128x128.png'));
            this._disposablePanel = Disposable.from(
                this._panel,
                (this._panel as WebviewPanel).onDidDispose(this.onPanelDisposed, this),
                (this._panel.webview as Webview).onDidReceiveMessage(this.onMessageReceivedCore, this)
            );

            this._panel.webview.html = html;
        } else {
            // Reset the html to get the webview to reload
            this._panel.webview.html = '';
            this._panel.webview.html = html;
            this._panel.reveal(this._panel.viewColumn || ViewColumn.Active, false);
        }
    }
    onPanelDisposed() {
        // tslint:disable-next-line: no-unused-expression
        this._disposablePanel && this._disposablePanel.dispose();
        this._panel = undefined;
    }

    private onMessageReceivedCore(e: any) {
        if (e === null) { return; }
        this.onMessageReceived(e);
    }

    protected onMessageReceived(e: any) {
        switch (e) {
            default:
                console.error('Handle the commands that are posted from the UI');
                break;
        }
    }

    private async getHtml(): Promise<string> {
        const filename = WebContext.context.asAbsolutePath(path.join('dist/webviews/', this.filename));

        let content;
        // TODO: make a generic for this?
        const env = process.env;

        if (env.XLAYERS_DEBUG_MODE) {
            content = await new Promise<string>((resolve, reject) => {
                fs.readFile(filename, 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        } else {
            if (this._html !== undefined) { return this._html; }

            const doc = await workspace.openTextDocument(filename);
            content = doc.getText();
        }

        let html = content.replace(
            /{{root}}/g,
            Uri.file(WebContext.context.asAbsolutePath('.'))
                .with({ scheme: 'vscode-resource' })
                .toString()
        );

        this._html = html;
        return html;
    }
}
