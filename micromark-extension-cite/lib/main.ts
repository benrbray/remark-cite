// micromark
// import { State, Effects, Resolve, Tokenizer, Event, Token } from "micromark/dist/shared-types";
// import * as MM from "micromark/dist/shared-types";
// import { CodeAsKey } from "micromark/lib/shared-types";

import type {
	Code,
	Construct,
	Effects,
	Extension,
	State,
	Tokenizer,
	TokenizeContext,
} from "micromark-util-types";

// html converts token stream directly to html
export { citeHtml } from "./html";

////////////////////////////////////////////////////////////

export interface CiteSyntaxOptions {
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
export function citeSyntax(options?: Partial<CiteSyntaxOptions>): Extension {
	// handle user configuration
	const settings = Object.assign({
		enableAltSyntax:    false,
		enablePandocSyntax: true,
	}, options);

	// hooks
	const text: { [c:number]: Construct } = { };

	// activate pandoc-style syntax
	if(settings.enablePandocSyntax) {
		text[91] = { tokenize: citeTokenize(false) }
	}

	// activate alternative syntax
	if(settings.enableAltSyntax) {
		text[64] = { tokenize: citeTokenize(true) }
	}

	// assemble extension
	return { text };
}

////////////////////////////////////////////////////////////

const lookaheadConstruct = {
	partial: true, 
	/** If the next two characters are `-@`, run `ok`, else `nok`. */
	tokenize(effects: Effects, ok: State, nok: State): State {
		return start

		function start(code: Code) {
			// match hyphen `-`
			if(code !== 45) { return nok(code); }
			effects.consume(code);
			return lookaheadAt;
		}

		function lookaheadAt(code: Code) {
			// match at symbol `@`
			if(code !== 64) { return nok(code); }
			effects.consume(code);
			return ok(code);
		}
	}
};

////////////////////////////////////////////////////////////

// const enums are inlined at compile time
// https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
const enum CiteToken {
	inlineCite           = "inlineCite",
	inlineCiteMarker     = "inlineCiteMarker",
	inlineCiteMarker_alt = "inlineCiteMarker_alt",
	citeItem             = "citeItem",
	citeItemPrefix       = "citeItemPrefix",
	citeAuthorSuppress   = "citeAuthorSuppress",
	citeItemSymbol       = "citeItemSymbol",
	citeItemKey          = "citeItemKey",
	citeItemSuffix       = "citeItemSuffix",
	citeItemSep          = "citeItemSep",
}

/**
 * Entry-point for the citation tokenizer.
 * @param altSyntax If `true`, look ONLY for alt syntax.  If `false`, look ONLY for pandoc syntax. 
 */
const citeTokenize: (altSyntax: boolean) => Tokenizer = (altSyntax) => function(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
	// variables to keep track of parser state -- ideally the parsers below
	// would all be pure/deterministic, but that quickly got out of hand
	let parseState = {
		/** helps detect empty citation keys */
		nonEmptyKey: false,
		/** note that this variable is only updated when we are looking
		  * for a prefix->key transition, when need to know whether the
	      * most recently consumed character was a space.            */
		lastWasSpace: false,
		/** are we currently in the prefix? */
		inPrefix: false,
	}

	// return appropriate tokenizer for syntax type
	return altSyntax ? start_alt : start_pandoc;

	// -- pandoc syntax --------------------------------- //

	function start_pandoc(code: Code): State | undefined {
		// match left square bracket `[`
		if (code === 91) { 
			effects.enter(CiteToken.inlineCite);
			effects.enter(CiteToken.inlineCiteMarker);
			effects.consume(code);
			effects.exit(CiteToken.inlineCiteMarker);
			
			// start looking for a citeItem
			return consumeCiteItem;
		}
		// invalid starting character
		else { return nok(code); }
	}

	// -- alternative syntax ---------------------------- //

	function start_alt(code: Code): State | undefined {
		// match at symbol `@`
		if (code === 64) {
			effects.enter(CiteToken.inlineCite);
			effects.enter(CiteToken.inlineCiteMarker_alt);
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
	function alt_consumeLeftBracket(code: Code): State | undefined {
		// match left square bracket `[`
		if (code === 91) { 
			// consume bracket
			effects.consume(code);
			effects.exit(CiteToken.inlineCiteMarker_alt);

			// skip prefix, start looking for cite key
			effects.enter(CiteToken.citeItem);
			return alt_consumeInitialHyphen;
			//return consumeCiteItemKey;
		}

		// if we see a different character, this is not a citation
		return nok(code);
	}

	/**
	 * (alt syntax) look for a hyphen in the first citation item, as in
	 *     `@[-suppressed]`
	 */
	function alt_consumeInitialHyphen(code: Code): State | undefined {
		// match hyphen `-`, indicating author suppression
		if(code === 45) {
			effects.enter(CiteToken.citeAuthorSuppress);
			effects.consume(code);
			effects.exit(CiteToken.citeAuthorSuppress);
			// look for citation key 
			effects.enter(CiteToken.citeItemKey);
			return consumeCiteItemKey;
		}

		// if no hyphen found, the first item is not suppressed
		effects.enter(CiteToken.citeItemKey);
		return consumeCiteItemKey(code);
	}

	// -- shared tokenizers --------------------------------

	/**
	 * @precondition token `citeItem` has already been emitted
	 */
	function consumeCiteItem(code: Code): State | undefined {
		// we haven't found any content yet
		parseState.nonEmptyKey = false;
		effects.enter(CiteToken.citeItem);

		// match hyphen `-`, indicating uathor suppression
		if (code === 45) { return lookaheadAuthorSuppress(code); }
		// match at symbol `@`, beginning the citation key
		if (code === 64) { return consumeAtSymbol(code);}

		// otherwise, we have a non-empty prefix
		parseState.lastWasSpace = false;
		parseState.inPrefix = true;
		effects.enter(CiteToken.citeItemPrefix);
		return consumeCiteItemPrefix(code);
	}

	/**
	 * @precondition `parseState.inPrefix = true`
	 * @precondition token `citeItemPrefix` has already been emitted
	 */
	function consumeCiteItemPrefix(this: any, code: Code): State | undefined {
		// match hyphen '-', possibly indicating author suppression
		if (code === 45) { return lookaheadAuthorSuppress(code); }
		// match at symbol `@`, indicating end of prefix
		if (code === 64) { return consumeAtSymbol(code); };
		// if the closing bracket or eof occurs before we've found an 
		// at symbol, then this is not actually a citation token, so we stop
		if (code === 93 || code === null) { return nok(code); }

		// otherwise, consume the next character of the prefix
		parseState.lastWasSpace = (code === 32);
		effects.consume(code);
		return consumeCiteItemPrefix;
	}

	/**
	 * When encountering a hyphen, we must look ahead at the next character
	 * to determine whether the hyphen indicates author suppression or is
	 * simply part of the citation prefix.
	 */
	function lookaheadAuthorSuppress(this: any, code: Code): State | undefined {
		// match hyphen `-`
		if(code !== 45) { return nok(code); }
		// lookahead
		return effects.check(
			// check if the next two characters are `-@`
			lookaheadConstruct as any,
			// if they are, tokenize as citeAuthorSuppress
			consumeAuthorSuppress,
			// otherwise, we're still in the prefix
			consumeSingleCharInPrefix,
		)(code);
	}

	/**
	 * Consumes a single character in prefix mode.
	 * @effect starts prefix mode if we weren't already in it
	 */
	function consumeSingleCharInPrefix(this: any, code: Code): State | undefined {
		// make sure we are in prefix mode
		if(!parseState.inPrefix) {
			effects.enter(CiteToken.citeItemPrefix);
			parseState.inPrefix = true;
		}

		effects.consume(code);
		return consumeCiteItemPrefix;
	}

	/**
	 * @precondition We already KNOW the next TWO characters are `-@`.
	 *     (called by `lookaheadAuthorSuppress`)
	 */
	function consumeAuthorSuppress(this: any, code: Code): State | undefined {
		// match hyphen `-`
		if(code !== 45) { return nok(code); }

		// end prefix, if we previously started it
		if(parseState.inPrefix) {
			effects.exit(CiteToken.citeItemPrefix);
			parseState.inPrefix = false;
		}

		// consume hyphen
		effects.enter(CiteToken.citeAuthorSuppress);
		effects.consume(code);
		effects.exit(CiteToken.citeAuthorSuppress);

		// consume at symbol
		return consumeAtSymbol;
	}
	
	function consumeAtSymbol(this: any, code: Code): State | undefined {
		// match at symbol `@`
		if(code !== 64) { return nok(code); }

		if(parseState.inPrefix) {
			// the prefix end with a space character
			if(!parseState.lastWasSpace) { return nok(code); }
			// indicate end of prefix, start of data
			effects.exit(CiteToken.citeItemPrefix);
			parseState.inPrefix = false;
		}

		// consume at symbol, which is not considered part of the key
		effects.enter(CiteToken.citeItemSymbol);
		effects.consume(code);
		effects.exit(CiteToken.citeItemSymbol);
		// next, get the text of the key
		effects.enter(CiteToken.citeItemKey);
		return consumeCiteItemKey;
	}

	function consumeCiteItemKey(code: Code): State | undefined {
		// pandoc is specific about which characters are allowed
		// in a citation key, but since javascript has no multi-
		// lingual way to test for alphanumeric characters, we
		// allow any characters EXCEPT whitespace and `];`

		// match right square bracket `]` or item sep `;` to handle empty keys
		if (code === 93 || code == 59) {
			// handle empty key like `[prefix @]`
			if(!parseState.nonEmptyKey) { return nok(code); }

			effects.exit(CiteToken.citeItemKey);

			// this item had no suffix
			effects.exit(CiteToken.citeItem);

			// match right square bracket `]`, indicating end of inlineCite node
			if (code === 93) {
				// continue without consuming the closing bracket `]`
				return consumeCiteEnd(code);
			}

			// match semicolon `;`, indicating, the end of the current citeItem
			if (code === 59){
				// consume item separator `;`
				effects.enter(CiteToken.citeItemSep);
				effects.consume(code);
				effects.exit(CiteToken.citeItemSep);

				// continue to the next item
				return consumeCiteItem;
			}
		}

		// match space or comma, indicating start of suffix
		if (code === 32 || code === 44) {
			// handle empty key like `[prefix @, suffix]`
			if(!parseState.nonEmptyKey) { return nok(code); }

			effects.exit(CiteToken.citeItemKey);
			// continue to suffix, without consuming character
			// (this character belongs to the suffix, so suffix is non-empty)
			effects.enter(CiteToken.citeItemSuffix);
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

	function consumeCiteItemSuffix(code: Code): State | undefined {
		// fail on eof
		if (code === null) { return nok(code); }

		// match right square bracket `]`, indicating end of inlineCite node
		if (code === 93) {
			// we're done!  close this item and finish up
			effects.exit(CiteToken.citeItemSuffix);
			effects.exit(CiteToken.citeItem);
			// continue without consuming the closing bracket `]`
			return consumeCiteEnd(code);
		}

		// match semicolon `;`, indicating, the end of the current citeItem
		if (code === 59){
			effects.exit(CiteToken.citeItemSuffix);
			effects.exit(CiteToken.citeItem);

			// consume item separator `;`
			effects.enter(CiteToken.citeItemSep);
			effects.consume(code);
			effects.exit(CiteToken.citeItemSep);

			// continue to the next item
			return consumeCiteItem;
		}

		// otherwise, continue consuming characters
		effects.consume(code);
		return consumeCiteItemSuffix;
	}

	function consumeCiteEnd(code: Code): State | undefined {
		// match right square bracket `]`
		if (code !== 93) { return nok(code); }
		
		// consume closing bracket `]`
		effects.enter(CiteToken.inlineCiteMarker);
		effects.consume(code);
		effects.exit(CiteToken.inlineCiteMarker);
		effects.exit(CiteToken.inlineCite);

		// we're all done!
		return ok;
	}
}