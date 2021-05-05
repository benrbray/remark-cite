// micromark
import { State, Effects, Resolve, Tokenizer, Event, Token } from "micromark/dist/shared-types";

////////////////////////////////////////////////////////////

/**
 * As of (2021/05/05), the typings exported by `remark` do not
 * accurately reflect their usage, so we patch them here.
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

export type Tokenize = (this: Tokenizer, effects: Effects, ok: State, nok: State) => State;

export interface Construct {
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
	// TODO: Plugin Configuration
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
export function citeExtension(options: CiteOptions): SyntaxExtension {
	// handle user configuration
	let settings = options || {};

	// matches the opening bracket of an inline citation
	let citeStart: Construct = {
		tokenize: citeTokenize
	}

	// assemble extension
	return {
		text: {
			91: citeStart // left square bracket `[`
		}
	}
}

////////////////////////////////////////////////////////////

/**
 * Entry-point for the citation tokenizer.
 * 
 */
const citeTokenize: Tokenize = function(this: Tokenizer, effects: Effects, ok: State, nok: State): State {
	// variables to keep track of parser state
	var aliasCursor = 0;
	var nonEmptyKey: boolean = false;

	// TODO: remove this hack which was used for debugging
	let eff = effects;
	let stack: string[] = [];
	effects = {
		...eff,
		enter(msg: string): Token {
			stack.push(msg);
			console.log(`enter :: ${msg}, stack=`, stack);
			return eff.enter(msg);
		},
		exit(msg: string): Token {
			let top = stack.pop();
			if(top !== msg) {
				console.error(`popped ${msg}, top was ${top}`); 
			}
			console.log(`exit :: ${msg}, stack=`, stack);
			return eff.exit(msg);
		},
		consume(code: number) {
			console.log(`consume :: ${String.fromCharCode(code)}`);
			return eff.consume(code);
		},
	}

	return start;

	function start(code: number): State | void {
		// match left square bracket `[`
		// (technically not necessary, if we trust the hook that brought us here)
		if (code !== 91) { return nok(code); }

		effects.enter("inlineCite");
		effects.enter("inlineCiteMarker");
		effects.consume(code);
		effects.exit("inlineCiteMarker");
		
		// start looking for a citeItem
		return consumeCiteItem;
	}

	function consumeCiteItem(code: number): State | void {
		// we haven't found any content yet
		nonEmptyKey = false;

		effects.enter("citeItem");
		effects.enter("citeItemPrefix");

		// start by looking for a prefix
		return consumeCiteItemPrefix(code);
	}

	function consumeCiteItemPrefix(code: number): State | void {
		// match at symbol `@`, indicating end of prefix
		if (code === 64) { 
			// indicate end of prefix, start of data
			effects.exit("citeItemPrefix");
			effects.enter("citeItemKey");
			effects.consume(code);

			// get the text of the key
			return consumeCiteItemKey;
		};
		
		// if the closing bracket occurs before we've found an @ symbol,
		// then this is not actually a citation token, so we stop
		if (code === 93) {
			console.log("consumePrefix :: found `]` before `@`");
			return nok(code);
		}

		if (code === null) {
			console.log("consumePrefix :: null character");
			return nok(code);
		}

		// otherwise, consume the next character of the prefix
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
			if(!nonEmptyKey) { return nok(code); }

			effects.exit("citeItemKey");

			// this item had no suffix
			effects.enter("citeItemSuffix");
			effects.exit("citeItemSuffix");
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
			if(!nonEmptyKey) { return nok(code); }

			effects.exit("citeItemKey");
			// continue to suffix, without consuming character
			effects.enter("citeItemSuffix");
			return consumeCiteItemSuffix(code);
		}

		// CR, LF, CRLF, HT, VS (whitespace, EOLs, EOF)
		if (code === null || code < 0) {
			return nok(code);
		}

		nonEmptyKey = true;
		
		// otherwise, continue consuming characters
		effects.consume(code);
		return consumeCiteItemKey;
	}

	function consumeCiteItemSuffix(code: number): State | void {
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
		console.log("success!");
		return ok;
	}
}