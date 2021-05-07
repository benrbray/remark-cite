// micromark
import { State, Effects, Resolve, Tokenizer, Event, Token } from "micromark/dist/shared-types";
import * as MM from "micromark/dist/shared-types";

// html converts token stream directly to html
export { html } from "./html"; 

////////////////////////////////////////////////////////////

/**
 * As of (2021/05/05), the typings exported by `remark` do not
 * accurately reflect their usage, so we patch them here.
 *
 * When exporting functions, we need to be careful to cast back to
 * the built-in types, to be compatible with the current typings for remark.
 */

type SyntaxExtensionHook = { [key:number] : Construct | Construct[], 'null'?: Construct | Construct[] }

interface SyntaxExtension {
	document       ?: SyntaxExtensionHook,
	contentInitial ?: SyntaxExtensionHook,
	flowInitial    ?: SyntaxExtensionHook,
	flow           ?: SyntaxExtensionHook,
	string         ?: SyntaxExtensionHook,
	text           ?: SyntaxExtensionHook,
}

type Tokenize = (this: Tokenizer, effects: Effects, ok: State, nok: State) => State;

interface Construct {
	name?: string
	tokenize: Tokenize
	partial?: boolean
	resolve?: Resolve
	resolveTo?: Resolve
	resolveAll?: Resolve
	concrete?: boolean
	interruptible?: boolean
	lazy?: boolean
	// typically extensions will want to get precedence over existing markdown 
	// constructs. after can be used to invert that
	// https://github.com/micromark/micromark/discussions/54#discussioncomment-693151
	add?: "after"|"before";
}

////////////////////////////////////////////////////////////

export interface CiteOptions {
	/**
	 * Enable the alternative syntax, like `@[wadler1989]`.
	 * The first citation item can have a prefix, but not a suffix.
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
export const citeExtension = (function (options?: Partial<CiteOptions>): SyntaxExtension {
	// handle user configuration
	const settings = Object.assign({
		enableAltSyntax:    false,
		enablePandocSyntax: true,
	}, options);

	// starting point for both pandoc-style and alternative syntax
	const citeStart: Construct = {
		tokenize: citeTokenize
	}

	// hooks
	const text: { [c:number]: Construct } = { };

	// activate pandoc-style syntax
	if(settings.enablePandocSyntax) {
		text[91] = citeStart;
	}

	// activate alternative syntax
	if(settings.enableAltSyntax) {
		text[64] = citeStart;
	}

	// assemble extension
	return { text };
}) as (options: Partial<CiteOptions>) => MM.SyntaxExtension;

////////////////////////////////////////////////////////////

/**
 * Entry-point for the citation tokenizer.
 * 
 */
const citeTokenize: Tokenize = function(this: Tokenizer, effects: Effects, ok: State, nok: State): State {
	// variables to keep track of parser state

	let parseState = {
		/** helps detect empty citation keys */
		nonEmptyKey: false,
		/** note that this variable is only updated when we are looking
		  * for a prefix->key transition, when need to know whether the
	      * most recently consumed character was a space.               */
		lastWasSpace: false
	}
	
	return start;

	function start(code: number): State | void {
		// match left square bracket `[`
		if (code === 91) { 
			effects.enter("inlineCite");
			effects.enter("inlineCiteMarker");
			effects.consume(code);
			effects.exit("inlineCiteMarker");
			
			// start looking for a citeItem
			return consumeCiteItem;
		}
		// match at symbol `@`
		else if (code === 64) {
			effects.enter("inlineCite");
			effects.enter("inlineCiteMarker_alt");
			effects.consume(code);
			
			// start looking for a citeItem
			return alt_consumeLeftBracket;
		}
		// invalid starting character
		else { return nok(code); }
	}

	/*
	 * (Alternative Syntax) See `enableAltSyntax` option.
	 */
	function alt_consumeLeftBracket(code: number): State | void {
		// match left square bracket `[`
		if (code === 91) { 
			// consume bracket
			effects.consume(code);
			effects.exit("inlineCiteMarker_alt");

			// skip prefix, start looking for cite key
			effects.enter("citeItem");
			effects.enter("citeItemKey");
			return consumeCiteItemKey;
		}

		// if we see a different character, this is not a citation
		return nok(code);
	}

	function consumeCiteItem(code: number): State | void {
		// we haven't found any content yet
		parseState.nonEmptyKey = false;

		effects.enter("citeItem");

		// match at symbol `@`, beginning the citation key
		if (code === 64) { 
			// consume at symbol, which is not considered part of the key
			effects.enter("citeItemSymbol");
			effects.consume(code);
			effects.exit("citeItemSymbol");
			// next, get the text of the key
			effects.enter("citeItemKey");
			return consumeCiteItemKey;
		}

		// otherwise, we have a non-empty prefix
		parseState.lastWasSpace = false;
		effects.enter("citeItemPrefix");
		return consumeCiteItemPrefix(code);
	}

	function consumeCiteItemPrefix(this: any, code: number): State | void {
		// match at symbol `@`, indicating end of prefix
		if (code === 64) { 
			// the prefix end with a space character
			if(!parseState.lastWasSpace) { return nok(code); }

			// indicate end of prefix, start of data
			effects.exit("citeItemPrefix");
			// consume at symbol, which is not considered part of the key
			effects.enter("citeItemSymbol");
			effects.consume(code);
			effects.exit("citeItemSymbol");
			// next, get the text of the key
			effects.enter("citeItemKey");
			return consumeCiteItemKey;
		};

		// if the closing bracket or eof occurs before we've found an 
		// at symbol, then this is not actually a citation token, so we stop
		if (code === 93 || code === null) {
			return nok(code);
		}

		// otherwise, consume the next character of the prefix
		parseState.lastWasSpace = (code === 32);
		effects.consume(code);
		return consumeCiteItemPrefix;
	}

	function consumeCiteItemKey(code: number): State | void {
		// pandoc is specific about which characters are allowed
		// in a citation key, but since javascript has no multi-
		// lingual way to test for alphanumeric characters, we
		// allow any characters EXCEPT whitespace and `];`

		// match right square bracket `]` or item sep `;` to handle empty keys
		if (code === 93 || code == 59) {
			// handle empty key like `[prefix @]`
			if(!parseState.nonEmptyKey) { return nok(code); }

			effects.exit("citeItemKey");

			// this item had no suffix
			effects.exit("citeItem");

			// match right square bracket `]`, indicating end of inlineCite node
			if (code === 93) {
				// continue without consuming the closing bracket `]`
				return consumeCiteEnd(code);
			}

			// match semicolon `;`, indicating, the end of the current citeItem
			if (code === 59){
				// consume item separator `;`
				effects.enter("citeItemSep");
				effects.consume(code);
				effects.exit("citeItemSep");

				// continue to the next item
				return consumeCiteItem;
			}
		}

		// match space or comma, indicating start of suffix
		if (code === 32 || code === 44) {
			// handle empty key like `[prefix @, suffix]`
			if(!parseState.nonEmptyKey) { return nok(code); }

			effects.exit("citeItemKey");
			// continue to suffix, without consuming character
			// (this character belongs to the suffix, so suffix is non-empty)
			effects.enter("citeItemSuffix");
			return consumeCiteItemSuffix(code);
		}

		// CR, LF, CRLF, HT, VS (whitespace, EOLs, EOF)
		if (code === null || code < 0) {
			return nok(code);
		}

		parseState.nonEmptyKey = true;
		
		// otherwise, continue consuming characters
		effects.consume(code);
		return consumeCiteItemKey;
	}

	function consumeCiteItemSuffix(code: number): State | void {
		// fail on eof
		if (code === null) { return nok(code); }

		// match right square bracket `]`, indicating end of inlineCite node
		if (code === 93) {
			// we're done!  close this item and finish up
			effects.exit("citeItemSuffix");
			effects.exit("citeItem");
			// continue without consuming the closing bracket `]`
			return consumeCiteEnd(code);
		}

		// match semicolon `;`, indicating, the end of the current citeItem
		if (code === 59){
			effects.exit("citeItemSuffix");
			effects.exit("citeItem");

			// consume item separator `;`
			effects.enter("citeItemSep");
			effects.consume(code);
			effects.exit("citeItemSep");

			// continue to the next item
			return consumeCiteItem;
		}

		// otherwise, continue consuming characters
		effects.consume(code);
		return consumeCiteItemSuffix;
	}

	function consumeCiteEnd(code: number): State | void {
		// match right square bracket `]`
		if (code !== 93) { return nok(code); }
		
		// consume closing bracket `]`
		effects.enter("inlineCiteMarker");
		effects.consume(code);
		effects.exit("inlineCiteMarker");
		effects.exit("inlineCite");

		// we're all done!
		return ok;
	}
}