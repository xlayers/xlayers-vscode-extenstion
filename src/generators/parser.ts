const jszip = require('jszip');
import * as fs from 'fs';
import { SketchStyleParserService } from './style.service';

export interface SketchMSData {
    pages: any[];
    previews: any[];
    document: any;
    user: any;
    meta: any;
    resources?: {
        images: {
            [id: string]: ResourceImageData;
        };
    };
}

export interface ResourceImageData {
    source: string;
    image: HTMLImageElement;
}

const entryAsyncCheck = (entry: any): entry is { async: Function } => {
    return !!entry && typeof entry === 'object' && 'async' in entry;
};

const jszipLoadAsync = (jszip: any): jszip is { loadAsync: Function } => {
    return !!jszip && typeof jszip === 'object' && 'loadAsync' in jszip;
};

export class SketchIngestorService {
    private styleOptimized: SketchStyleParserService;
    private static _instance: SketchIngestorService;
    _data: SketchMSData | undefined;

    static getInstance() {
        if (!SketchIngestorService._instance) {
            SketchIngestorService._instance = new SketchIngestorService();
        }
        return SketchIngestorService._instance;
    }

    constructor(
    ) {
        this.styleOptimized = SketchStyleParserService.getInstance();
    }

    async process(file: any) {
        const data = await this.sketch2Json(file) as SketchMSData;
        this.styleOptimized.visit(data);
        return data;
    }

    private async readZipEntries(file: any) {

        const result = fs.readFileSync(file);
        return this.unzipSketchPackage(result);

    }

    private async unzipSketchPackage(data: string | ArrayBuffer) {
        let a = new jszip();
        if (jszipLoadAsync(a)) {
            const zipFileInstance = await jszip.loadAsync(data);

            const files: unknown[] = [];
            zipFileInstance.forEach((relativePath: string | any, zipEntry: unknown) => {
                files[relativePath] = zipEntry;
            });
            return files;
        } else {
            throw new Error('JSzip not loaded');
        }
    }


    async computeImage(source: string, filepath: string) {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            resolve();
        });
    }

    private async buildImage(
        content: string,
        relativePath: string
    ): Promise<ResourceImageData> {
        const source = `data:image/png;base64,${content}`;
        return {
            source,
            image: await this.computeImage(source, relativePath)
        };
    }

    async sketch2Json(file: Blob) {
        const _data: SketchMSData = {
            pages: [],
            previews: [],
            document: {} as any,
            user: {},
            meta: {} as any,
            resources: {
                images: {}
            }
        };

        const zips = await this.readZipEntries(file);
        await Promise.all(
            Object.entries(zips).map(async ([relativePath, entry]) => {
                if (
                    relativePath === 'previews/preview.png' ||
                    relativePath.startsWith('images/')
                ) {
                    const content = await (entry as any).async('base64');
                    const imageData = await this.buildImage(content, relativePath);
                }
                else if (relativePath === 'previews/preview.png') {
                    // this is a preview, so add it to the previews array
                    // _data.previews.push({
                    //     source: imageData.source,
                    //     width: imageData.image.width,
                    //     height: imageData.image.height
                    // });
                } else if (relativePath.startsWith('pages/')) {
                    const content = await (entry as any).async('string');

                    try {
                        const page = JSON.parse(content) as any;
                        _data.pages.push(page);
                    } catch (e) {
                        throw new Error(`Could not load page "${relativePath}"`);
                    }
                }
                else if (relativePath.endsWith('.pdf')) {
                    // text-previews/text-previews.pdf
                    // removed because of: https://github.com/xlayers/xlayers/issues/200
                }
                else {
                    // document.json
                    // user.json
                    // meta.json
                    const content = await (entry as any).async('string');
                    (_data as any)[relativePath.replace('.json', '')] = JSON.parse(content);

                }
                return Promise.resolve({});
            })
        );
        return _data;
    }

    getPages(): any[] {
        return (this._data as any).pages;
    }




    getImageDataFromRef(ref: string) {
        return (this._data as any)!.resources.images[ref];
    }
}

