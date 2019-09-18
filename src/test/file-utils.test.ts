import * as assert from 'assert';
import { FileService } from '../utils';

suite('File Utils Tests', () => {

    test('should get a instance', () => {
        const fileService = FileService.getInstance();

        assert.notEqual(fileService, undefined, 'should always have or create a instance');
    });

    test('should provide last part of path', () => {
        const fileService = FileService.getInstance();
        const path = '/User/test/file.sketch';
        assert.deepEqual(fileService.fileName(path), 'file.sketch', 'should have a valid path');
    });
    test('should not have a file exisitng', () => {
        const fileService = FileService.getInstance();
        const path = '/User/te/file/a.sketc';
        assert.deepEqual(fileService.fileExists(path), false, 'file should not exists');
    });
});
