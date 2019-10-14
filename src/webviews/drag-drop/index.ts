import { vscode } from '../web-constant';

export class DragDropPage {
    public sketchFiles: any;
    private _xlayersElementPlaceHolder: HTMLElement;
    private _frameWorkSelectionElement: HTMLElement;

    constructor() {
        // default elements we need for the UI
        this._xlayersElementPlaceHolder = document.querySelector('#xlayers') as HTMLElement;
        this._frameWorkSelectionElement = document.getElementById('frameworks') as HTMLElement;
        const dragElement = document.getElementById('drag-file') as HTMLElement;

        // Basic event listner that will receieve messages from the VSCode post api.
        window.addEventListener('message', (event: MessageEvent & { data: { command: string } }) => {
            const { command } = event.data;
            switch (command) {
                case 'generating':
                    console.error('here');
                    break;
                default:
                    break;
            }
        });

        const frameWorkSelection = (framework: string) => {

            if (this._xlayersElementPlaceHolder) {
                vscode.postMessage({
                    command: 'xlayers.fileSelected', data: {

                        framework,
                        fsPath: this.sketchFiles[0].path
                    }
                });
            }
        };

        this._frameWorkSelectionElement.addEventListener('click', (event) => {
            frameWorkSelection((event.target as HTMLElement)!.id);
        });

        this.setupDragElement(dragElement);
    }

    private setupDragElement(dragElement: HTMLElement) {
        dragElement.addEventListener('dragover', (event: {
            preventDefault: () => void;
        }) => {
            event.preventDefault();
            return false;
        }, false);

        dragElement.addEventListener('drop', event => {
            event.preventDefault();
            const files = event.dataTransfer && Array.from(event.dataTransfer.files);
            this.sketchFiles = files && files.filter(file => file.name.endsWith('.sketch'));
            if (this.sketchFiles.length > 0) {

                (dragElement as HTMLElement).style.display = 'none';
            }

            return false;
        }, false);
    }
}
// tslint:disable-next-line: no-unused-expression
new DragDropPage();
