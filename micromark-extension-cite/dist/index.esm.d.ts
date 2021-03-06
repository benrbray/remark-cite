import * as MM from "micromark/dist/shared-types";
import { Token } from "micromark/dist/shared-types";
type CiteHtmlOptions = {};
////////////////////////////////////////////////////////////
/**
 * Converts a token stream produced by the syntax extension
 * directly to HTML, with no intermediate AST.  For example,
 *
 * These functions rely on some unknown global state, so
 * if the input token stream is invalid, this function will
 * likely produce mysterious, difficult-to-diagnose errors.
 */
declare function citeHtml(this: any, opts?: CiteHtmlOptions): {
    enter: {
        inlineCite: (this: any) => void;
    };
    exit: {
        inlineCite: (this: any, token: Token) => void;
        citeItemKey: (this: any, token: Token) => void;
    };
};
interface CiteSyntaxOptions {
    /**
     * Enable the alternative syntax, `@[wadler1989]`.  The
     * first citation item can have a suffix, but no prefix.
     * There are no restrictions on subsequent items.
     * @default `false`
     */
    enableAltSyntax: boolean;
    /**
     * Enable the pandoc-style syntax, like `[@wadler1989]`.
     * Each individual citation can have a prefix and suffix.
     * @default `true`
     */
    enablePandocSyntax: boolean;
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
 */
declare const citeSyntax: (options: Partial<CiteSyntaxOptions>) => MM.SyntaxExtension;
export { citeHtml, CiteSyntaxOptions, citeSyntax };
//# sourceMappingURL=index.esm.d.ts.map