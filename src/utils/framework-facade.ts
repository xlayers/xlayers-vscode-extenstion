import { FRAMEWORKS, Frameworks } from '../constants';
import { AngularCodeGenService } from '../generators/angular.service';
import { ReactCodeGenService } from '../generators/react.service';
import { VueCodeGenService } from '../generators/vue.service';

export class FrameworkFacade {
    private static _instance: FrameworkFacade;

    private _angularGenerator: AngularCodeGenService;
    private _reactGenerator: ReactCodeGenService;
    private _vueGenerator: VueCodeGenService;

    private constructor() {
        this._angularGenerator = AngularCodeGenService.getInstance();
        this._vueGenerator = VueCodeGenService.getInstance();
        this._reactGenerator = ReactCodeGenService.getInstance();
    }
    static getInstance() {
        if (!FrameworkFacade._instance) {
            FrameworkFacade._instance = new FrameworkFacade();
        }
        return FrameworkFacade._instance;
    }
    getFrameworks(prefferd: Frameworks[] = []) {
        const frameworks = [...FRAMEWORKS];
        return prefferd.reduce((items, item) => {
            if (items.includes(item)) {
                items.splice(items.indexOf(item), 1, `${item.toString()} (recommended)` as Frameworks) ;
            }
            return items;
        }, frameworks).sort(e => e.indexOf('(recommended)')).reverse();
    }
    generate(type: Frameworks, ast: any) {
        switch (type) {
            case 'angular':
                console.log('generate angular');
                return this._angularGenerator.generate(ast);
            case 'vue':
                console.log('generate vue');
                return this._vueGenerator.generate(ast);
            case 'react':
                console.log('generate react');
                return this._reactGenerator.generate(ast);
            default:
                return;
        }
    }
}
