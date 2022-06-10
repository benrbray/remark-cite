import { CiteSyntaxOptions } from "@benrbray/micromark-extension-cite";
import { CiteToMarkdownOptions } from "@benrbray/mdast-util-cite";
interface CitePluginOptions {
    syntax: Partial<CiteSyntaxOptions>;
    toMarkdown: Partial<CiteToMarkdownOptions>;
}
declare function citePlugin(this: any, options?: Partial<CitePluginOptions>): void;
export { CitePluginOptions, citePlugin as default };
//# sourceMappingURL=index.esm.d.ts.map