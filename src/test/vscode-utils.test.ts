import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as assert from 'assert';
import { VSCodeService } from '../utils/vscode-utils';
import { MessageTypes } from '../utils';

suite('VSCode Utils Tests', () => {
    const vscodeService = VSCodeService.getInstance();

    test('should get a instance', () => {
        assert.notEqual(vscodeService, undefined, 'should always have or create a instance');
    });

    test('should call the information message', () => {
        const infoStub = sinon.stub(vscode.window, 'showInformationMessage');

        vscodeService.showMessage('test info', MessageTypes.Info);

        assert(infoStub.called);
    });

    test('should call the error message', () => {
        const errorStub = sinon.stub(vscode.window, 'showErrorMessage');

        vscodeService.showMessage('test info', MessageTypes.Error);

        assert(errorStub.called);
    });

    test('should call the warning message', () => {
        const warningStub = sinon.stub(vscode.window, 'showWarningMessage');

        vscodeService.showMessage('test info', MessageTypes.Warning);

        assert(warningStub.called);
    });

    test('should show the quickpick with options', () => {
        const quickPicker = sinon.stub(vscode.window, 'showQuickPick');

        vscodeService.showQuickDialog(['item 1'], 'placeholder', false);
        assert.deepEqual(quickPicker.args, [[['item 1'],
        {
            placeHolder: 'placeholder',
            matchOnDetail: true,
            canPickMany: false
        }]]);
    });
});
