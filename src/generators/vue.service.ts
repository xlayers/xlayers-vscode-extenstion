import { SharedCodegen, Template } from './shared.service';

export class VueCodeGenService {
    private static _instance: VueCodeGenService;

    static getInstance() {
        if (!VueCodeGenService._instance) {
            VueCodeGenService._instance = new VueCodeGenService();
        }
        return VueCodeGenService._instance;
    }
    sharedCodegen: SharedCodegen;
    constructor() {
        this.sharedCodegen = SharedCodegen.getInstance();
    }
    generate(ast: any): Array<any> {
        this.sharedCodegen.generateCssClassNames(ast);

        return [{
            uri: 'README.md',
            value: this.generateReadme(),
            language: 'text/plain',
            kind: 'text'
        }, {
            uri: 'Xlayers.vue',
            value: this.generateComponent(ast),
            language: 'html',
            kind: 'vue'
        }, {
            uri: 'xlayers.test.ts',
            value: this.generateComponentSpec(),
            language: 'javascript',
            kind: 'vue'
        }];
    }

    private generateReadme() {
        const codeBlock = '```';
        return (
            '' +
            `
## How to use the Xlayers Vuejs module

1. Download and extract the exported module into your workspace,

2. Import the component into your App component or other container.
${codeBlock}
<template>
  <div id="app">
    <Xlayers />
  </div>
</template>

<script>
import Xlayers from './xlayers/Xlayers.vue'

export default {
  name: 'app',
  components: {
    Xlayers
  }
}
</script>
${codeBlock}

3. Enjoy.
      `
        );
    }

    private generateComponentSpec() {
        return (
            '' +
            `
import { shallowMount } from "@vue/test-utils";
import Xlayers from "@/components/Xlayers.vue";

describe("Xlayers.vue", () => {
  it("render", () => {
    const wrapper = shallowMount(Xlayers, {});
    expect(wrapper.isVueInstance()).toBeTruthy();
  });
});

      `
        );
    }

    private generateComponent(ast: any) {
        return (
            '' +
            `
<template>
  ${this.sharedCodegen.generateComponentTemplate(ast, Template.HTML)}
</template>

<script>
export default {}
</script>

<style>
${this.sharedCodegen.generateComponentStyles(ast)}
</style>
      `
        );
    }
}
