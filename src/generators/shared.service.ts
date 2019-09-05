import { StyleOptimizerService } from "./optimizer.service";

export enum Template {
    HTML,
    JSX,
    XAML
}

export class SharedCodegen {
    private static _instance: SharedCodegen;
    private optimizer: StyleOptimizerService;
    static getInstance() {
        if (!SharedCodegen._instance) {
            SharedCodegen._instance = new SharedCodegen();
        }
        return SharedCodegen._instance;
    }
    // 2 spaces
    private indentationSymbol = '  ';

    constructor(
    ) {
        this.optimizer = StyleOptimizerService.getInstance();
    }

    generateCssClassNames(ast: any) {
        function randomString() {
            return Math.random()
                .toString(36)
                .substring(2, 6);
        }

        function addCssClassNames(_ast: any) {
            if (_ast.layers && _ast.layers.length > 0) {
                _ast.layers.forEach((layer: any) => {
                    if (layer.css) {
                        (layer as any).css__className = `xly_${randomString()}`;
                    }
                    addCssClassNames(layer);
                });
            }
            return _ast;
        }

        return addCssClassNames(ast);
    }
    generateComponentStyles(ast: any) {
        return this.optimizer.parseStyleSheet(ast);
    }

    openTag(tag = 'div', attributes: any, autoclose = false) {
        return `<${tag}${
            attributes.length !== 0 ? ' ' + attributes.join(' ') : ''
            } ${autoclose ? '/' : ''}>`;
    }

    closeTag(tag = 'div') {
        return `</${tag}>`;
    }

    indent(n: number, content: string) {
        const indentation = !!n ? this.indentationSymbol.repeat(n) : '';
        return indentation + content;
    }

    generateComponentTemplate(ast: any, kind: any) {
        const template: Array<string> = [];
        this.computeTemplate(ast, template, 0, kind);
        return template.join('\n');
    }

    private computeTemplate(
        ast: any,
        template: any,
        depth = 0,
        kind = Template.HTML
    ) {
        let classNameAttr = 'class';
        if (kind === Template.JSX) {
            classNameAttr = 'className';
        }

        if (ast.layers && Array.isArray(ast.layers)) {
            ast.layers.forEach((layer: { css: any; _class: any; name: any; }) => {
                if (layer.css) {
                    const attributes = [
                        `${classNameAttr}="${(layer as any).css__className}"`,
                        `role="${layer._class}"`,
                        `aria-label="${layer.name}"`
                    ];
                    template.push(this.indent(depth, this.openTag('div', attributes)));
                }

                const content = this.computeTemplate(layer, template, depth + 1, kind);
                if (content) {
                    template.push(this.indent(depth + 1, content));
                }

                if (layer.css) {
                    template.push(this.indent(depth, this.closeTag('div')));
                }
            });
        } else {
            const innerContent = [];

            if ((ast as any)._class === 'text') {
                innerContent.push(this.openTag('span', []));
                innerContent.push(ast.attributedString.string);
                innerContent.push(this.closeTag('span'));
            } else if ((ast as any)._class === 'bitmap') {
                let base64Content = ast.resources.images[(ast as any).image._ref].source;
                base64Content = base64Content.replace('data:image/png;base64', '');

                const attributes = [
                    `${classNameAttr}="${(ast as any).css__className}"`,
                    `role="${ast._class}"`,
                    `aria-label="${ast.name}"`,
                    `src="${this.buildImageSrc(base64Content, false)}"`
                ];
                innerContent.push(this.openTag('img', attributes, true));
            } else if ((ast as any).shape) {
                innerContent.push((ast as any).shape);
            }

            return innerContent.join('');
        }
    }

    /**
     * Get the image source for the codegen.
     * @param base64Data The image data encoded as Base64
     * @param useBlob Should we convert to a Blob type
     */
    private buildImageSrc(base64Data: string, useBlob = true) {
        if (useBlob) {
            const blob = this.base64toBlob(base64Data, 'image/png');
            return URL.createObjectURL(blob);
        }

        // use fallback output
        return base64Data;
    }

    /**
     * Convert a Base64 content into a Blob type.
     * @param base64Data The image data encoded as Base64
     * @param contentType The desired MIME type of the result image
     */
    private base64toBlob(base64Data: string, contentType = 'image/png') {
        const blob = new Blob([base64Data], { type: contentType });
        return blob;
    }
}
