/// <reference types="unist" />
import * as Uni from "unist";
import { MdastExtension } from "mdast-util-from-markdown/types";
// mdast
import { Unsafe, Handle } from "mdast-util-to-markdown";
////////////////////////////////////////////////////////////
interface CiteItem {
    prefix?: string;
    key: string;
    suffix?: string;
    suppressAuthor?: true | undefined;
}
interface InlineCiteNode extends Uni.Literal {
    type: "cite";
    value: string;
    data: {
        altSyntax?: true | undefined;
        citeItems: CiteItem[];
    };
}
////////////////////////////////////////////////////////////
declare const citeFromMarkdown: MdastExtension;
////////////////////////////////////////////////////////////
interface CiteToMarkdownOptions {
    /**
     * When `true`, nodes with `altSyntax: true` will be rendered in standard
     * pandoc syntax `[@cite]` rather than alternative syntax `@[cite]`.
     *
     * @default false
     */
    standardizeAltSyntax: boolean;
    /**
     * When `false`, will not suppress authors in the output.
     *
     * @default true
     */
    enableAuthorSuppression: boolean;
    /**
     * `micromark-extension-cite` stores the original Markdown source for each
     * citation in the `value` property of each `InlineCiteNode`.  When this
     * option is `true`, every citation node serializes to its `value`, rather
     * than being reconstructed from `data.citeItems`.
     *
     * This setting overrides all other options.
     *
     * @default false
     */
    useNodeValue: boolean;
}
////////////////////////////////////////////////////////////
/**
 * @warning Does no validation.  Garbage in, garbage out.
 */
declare function citeToMarkdown(options?: Partial<CiteToMarkdownOptions>): {
    unsafe: Unsafe[];
    handlers: {
        cite: Handle;
    };
};
export { citeFromMarkdown, CiteItem, InlineCiteNode, citeToMarkdown, CiteToMarkdownOptions };
//# sourceMappingURL=index.esm.d.ts.map