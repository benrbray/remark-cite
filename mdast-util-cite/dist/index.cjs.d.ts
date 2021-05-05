/// <reference types="unist" />
import * as Uni from "unist";
declare const fromMarkdown: {
    enter: {
        inlineCite: typeof enterInlineCite;
        citeItem: typeof enterCiteItem;
    };
    exit: {
        inlineCite: typeof exitInlineCite;
        citeItem: typeof exitCiteItem;
        citeItemPrefix: typeof exitCiteItemPrefix;
        citeItemKey: typeof exitCiteItemKey;
        citeItemSuffix: typeof exitCiteItemSuffix;
    };
};
declare function enterInlineCite(this: any, token: unknown): void;
declare function exitInlineCite(this: any, token: unknown): void;
declare function enterCiteItem(this: any, token: Uni.Node): void;
declare function exitCiteItem(this: any, token: Uni.Node): void;
declare function exitCiteItemKey(this: any, token: Uni.Node): void;
declare function exitCiteItemSuffix(this: any, token: Uni.Node): void;
declare function exitCiteItemPrefix(this: any, token: Uni.Node): void;
declare const toMarkdown: {};
export { fromMarkdown, toMarkdown };
//# sourceMappingURL=index.cjs.d.ts.map