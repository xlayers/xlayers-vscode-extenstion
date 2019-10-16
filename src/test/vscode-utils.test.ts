import * as vscode from 'vscode';
import * as assert from 'assert';
import { VSCodeService } from '../utils/vscode-utils';

suite('VSCode Utils Tests', () => {

    test('should get a instance', () => {
        const vscodeService = VSCodeService.getInstance();
        assert.notEqual(vscodeService, undefined, 'should always have or create a instance');
    });
});
