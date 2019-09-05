import * as path from 'path';
import * as fs from 'fs';


export class FileService {
    private static _instance: FileService;
    private _fs: typeof fs;
    private _path: typeof path;
    private constructor() {
        this._fs = fs;
        this._path = path;
    }

    static getInstance() {
        if (!FileService._instance) {
            FileService._instance = new FileService();
        }
        return FileService._instance;
    }

    fileExists(filePath: string) {
        return this._fs.existsSync(filePath);
    }

    writeFile(filePath: string, content: any) {
        this._fs.writeFileSync(filePath, content);
    }
    mkdir(filePath: string) {
        if (!this._fs.existsSync(filePath)) {

            this._fs.mkdirSync(filePath);
        }
    }

    fileName(filePath: string, ext?: string) {
        return this._path.basename(filePath, ext);
    }
    filePath(filePath: string) {
        return this._path.dirname(filePath);
    }
    readFile(filePath: string) {
        return this._fs.readFileSync(filePath);
    }
}