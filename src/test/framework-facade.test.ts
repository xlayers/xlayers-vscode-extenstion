import * as assert from 'assert';
import { FrameworkFacade } from '../utils';

suite('Framework Facade Tests', function () {

    test('should get a instance', function () {
        const frameworkFaced = FrameworkFacade.getInstance();

        assert.notEqual(frameworkFaced, undefined, 'should always have or create a instance');
    });

    test('should have multiple frameworks', function () {
        const frameworkFaced = FrameworkFacade.getInstance();
        assert.deepEqual(frameworkFaced.getFrameworks(), ['react', 'vue', 'angular']);
    });
});
