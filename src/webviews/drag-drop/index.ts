import { vscode } from '../web-constant';

export class DragDropPage {
    public sketchFiles: any;
    private _xlayersElementPlaceHolder: HTMLElement;
    private _frameWorkSelectionElements: NodeListOf<HTMLHeadingElement>;

    constructor() {
        // default elements we need for the UI
        this._xlayersElementPlaceHolder = document.querySelector('#xlayers') as HTMLElement;
        this._frameWorkSelectionElements = document.querySelectorAll('.card');
        const dragElement = document.getElementById('drag-file') as HTMLElement;

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

        this._frameWorkSelectionElements.forEach(framework => framework.addEventListener('click', (event) => {
            frameWorkSelection(framework!.id);
        }));

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
