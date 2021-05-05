import { State, Effects, Resolve, Tokenizer } from "micromark/dist/shared-types";
/**
 * As of (2021/05/05), the typings exported by `remark` do not
 * accurately reflect their usage, so we patch them here.
 */
type SyntaxExtensionHook = {
    [key: number]: Construct | Construct[];
    'null'?: Construct | Construct[];
};
interface SyntaxExtension {
    document?: SyntaxExtensionHook;
    contentInitial?: SyntaxExtensionHook;
    flowInitial?: SyntaxExtensionHook;
    flow?: SyntaxExtensionHook;
    string?: SyntaxExtensionHook;
    text?: SyntaxExtensionHook;
}
type Tokenize = (this: Tokenizer, effects: Effects, ok: State, nok: State) => State;
interface Construct {
    name?: string;
    tokenize: Tokenize;
    partial?: boolean;
    resolve?: Resolve;
    resolveTo?: Resolve;
    resolveAll?: Resolve;
    concrete?: boolean;
    interruptible?: boolean;
    lazy?: boolean;
    add?: "after" | "before";
}
interface CiteOptions {
}
/**
 * Adds support for [`pandoc`-style citations](https://pandoc.org/MANUAL.html#citations-in-note-styles)
 * to `micromark`.  Here are some examples of valid citations:
 *
 *    ```txt
 *    [@wadler1990:comprehending-monads]          --> (Wadler 1990)
 *    [-@wadler1990]                              --> (1990)
 *    [@hughes1989, sec 3.4]                      --> (Hughes 1989, sec 3.4)
 *    [see @wadler1990; and @hughes1989, pp. 4]   --> (see Wadler 1990 and Hughes 1989, pp. 4)
 *    ```
 *
 * This extension introduces a new `unist` node type.
 *
 *     interface CitationInfo {
 *         prefix?: string;
 *         key: string;
 *         suffix?: string;
 *     }
 *
 *     interface Citation <: Literal {
 *         type: "citation"
 *         data: {
 *             citeItems: CitationInfo[]
 *         }
 *     }
 */
declare function citeExtension(options: CiteOptions): SyntaxExtension;
export { Tokenize, Construct, CiteOptions, citeExtension };
//# sourceMappingURL=index.umd.d.ts.map