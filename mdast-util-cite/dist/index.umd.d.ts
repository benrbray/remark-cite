/// <reference types="unist" />
import * as Uni from "unist";
import { MdastExtension } from "mdast-util-from-markdown/types";
interface CiteItem {
    prefix?: string;
    key: string;
    suffix?: string;
}
interface InlineCiteNode extends Uni.Literal {
    type: "cite";
    value: string;
    children: [];
    data: {
        altSyntax?: true | undefined;
        citeItems: CiteItem[];
    };
}
declare const fromMarkdown: MdastExtension;
declare const toMarkdown: {};
export { CiteItem, InlineCiteNode, fromMarkdown, toMarkdown };
//# sourceMappingURL=index.umd.d.ts.map