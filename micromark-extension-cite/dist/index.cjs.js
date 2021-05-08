'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

////////////////////////////////////////////////////////////

/**
 * Converts a token stream produced by the syntax extension
 * directly to HTML, with no intermediate AST.  For example,
 *
 * These functions rely on some unknown global state, so
 * if the input token stream is invalid, this function will
 * likely produce mysterious, difficult-to-diagnose errors.
 */
function citeHtml() {

  // ---- inlineCite ---------------------------------- //
  function enterInlineCite() {
    var stack = this.getData('inlineCiteStack');
    if (!stack) this.setData('inlineCiteStack', stack = []);
    stack.push({
      items: []
    });
  }

  function exitInlineCite(token) {
    var inlineCite = this.getData('inlineCiteStack').pop(); // gather citation data

    var classNames = "citation";
    var citeItems = (inlineCite === null || inlineCite === void 0 ? void 0 : inlineCite.items) || [];
    var citeKeys = citeItems.map(function (item) {
      return item.key;
    }).join(" ");
    var citeText = this.sliceSerialize(token); // html output

    this.tag("<span class=\"".concat(classNames, "\" data-cites=\"").concat(citeKeys, "\">"));
    this.raw(citeText);
    this.tag('</span>');
  } // ---- citeItemKey --------------------------------- //


  function exitCiteItemKey(token) {
    var citeKey = this.sliceSerialize(token);
    var stack = this.getData('inlineCiteStack');
    var current = top(stack);
    current.items.push({
      key: citeKey
    });
  }

  function top(stack) {
    return stack[stack.length - 1];
  } // -------------------------------------------------- //


  return {
    enter: {
      inlineCite: enterInlineCite
    },
    exit: {
      inlineCite: exitInlineCite,
      citeItemKey: exitCiteItemKey
    }
  };
}

// html converts token stream directly to html
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

var citeSyntax = function citeSyntax(options) {
  // handle user configuration
  var settings = Object.assign({
    enableAltSyntax: false,
    enablePandocSyntax: true
  }, options); // hooks

  var text = {}; // activate pandoc-style syntax

  if (settings.enablePandocSyntax) {
    text[91] = {
      tokenize: citeTokenize(false)
    };
  } // activate alternative syntax


  if (settings.enableAltSyntax) {
    text[64] = {
      tokenize: citeTokenize(true)
    };
  } // assemble extension


  return {
    text: text
  };
}; ////////////////////////////////////////////////////////////

var lookaheadConstruct = {
  partial: true,

  /** If the next two characters are `-@`, run `ok`, else `nok`. */
  tokenize: function tokenize(effects, ok, nok) {
    return start;

    function start(code) {
      // match hyphen `-`
      if (code !== 45) {
        return nok(code);
      }

      effects.consume(code);
      return lookaheadAt;
    }

    function lookaheadAt(code) {
      // match at symbol `@`
      if (code !== 64) {
        return nok(code);
      }

      effects.consume(code);
      return ok(code);
    }
  }
};
/**
 * Entry-point for the citation tokenizer.
 * @param altSyntax If `true`, look ONLY for alt syntax.  If `false`, look ONLY for pandoc syntax.
 */

var citeTokenize = function citeTokenize(altSyntax) {
  return function (effects, ok, nok) {
    // variables to keep track of parser state -- ideally the parsers below
    // would all be pure/deterministic, but that quickly got out of hand
    var parseState = {
      /** helps detect empty citation keys */
      nonEmptyKey: false,

      /** note that this variable is only updated when we are looking
        * for a prefix->key transition, when need to know whether the
        * most recently consumed character was a space.            */
      lastWasSpace: false,

      /** are we currently in the prefix? */
      inPrefix: false
    }; // typos in strings manually passed to enter() / exit() have been
    // a source of bugs, so let TypeScript error-check for us

    effects = effects; // return appropriate tokenizer for syntax type

    return altSyntax ? start_alt : start_pandoc; // -- pandoc syntax --------------------------------- //

    function start_pandoc(code) {
      // match left square bracket `[`
      if (code === 91) {
        effects.enter("inlineCite"
        /* inlineCite */
        );
        effects.enter("inlineCiteMarker"
        /* inlineCiteMarker */
        );
        effects.consume(code);
        effects.exit("inlineCiteMarker"
        /* inlineCiteMarker */
        ); // start looking for a citeItem

        return consumeCiteItem;
      } // invalid starting character
      else {
          return nok(code);
        }
    } // -- alternative syntax ---------------------------- //


    function start_alt(code) {
      // match at symbol `@`
      if (code === 64) {
        effects.enter("inlineCite"
        /* inlineCite */
        );
        effects.enter("inlineCiteMarker_alt"
        /* inlineCiteMarker_alt */
        );
        effects.consume(code); // start looking for a citeItem

        return alt_consumeLeftBracket;
      } // invalid starting character
      else {
          return nok(code);
        }
    }
    /*
     * (Alternative Syntax) See `enableAltSyntax` option.
     */


    function alt_consumeLeftBracket(code) {
      // match left square bracket `[`
      if (code === 91) {
        // consume bracket
        effects.consume(code);
        effects.exit("inlineCiteMarker_alt"
        /* inlineCiteMarker_alt */
        ); // skip prefix, start looking for cite key

        effects.enter("citeItem"
        /* citeItem */
        );
        return alt_consumeInitialHyphen; //return consumeCiteItemKey;
      } // if we see a different character, this is not a citation


      return nok(code);
    }
    /**
     * (alt syntax) look for a hyphen in the first citation item, as in
     *     `@[-suppressed]`
     */


    function alt_consumeInitialHyphen(code) {
      // match hyphen `-`, indicating author suppression
      if (code === 45) {
        effects.enter("citeAuthorSuppress"
        /* citeAuthorSuppress */
        );
        effects.consume(code);
        effects.exit("citeAuthorSuppress"
        /* citeAuthorSuppress */
        ); // look for citation key 

        effects.enter("citeItemKey"
        /* citeItemKey */
        );
        return consumeCiteItemKey;
      } // if no hyphen found, the first item is not suppressed


      effects.enter("citeItemKey"
      /* citeItemKey */
      );
      return consumeCiteItemKey(code);
    } // -- shared tokenizers --------------------------------

    /**
     * @precondition token `citeItem` has already been emitted
     */


    function consumeCiteItem(code) {
      // we haven't found any content yet
      parseState.nonEmptyKey = false;
      effects.enter("citeItem"
      /* citeItem */
      ); // match hyphen `-`, indicating uathor suppression

      if (code === 45) {
        return lookaheadAuthorSuppress(code);
      } // match at symbol `@`, beginning the citation key


      if (code === 64) {
        return consumeAtSymbol(code);
      } // otherwise, we have a non-empty prefix


      parseState.lastWasSpace = false;
      parseState.inPrefix = true;
      effects.enter("citeItemPrefix"
      /* citeItemPrefix */
      );
      return consumeCiteItemPrefix(code);
    }
    /**
     * @precondition `parseState.inPrefix = true`
     * @precondition token `citeItemPrefix` has already been emitted
     */


    function consumeCiteItemPrefix(code) {
      // match hyphen '-', possibly indicating author suppression
      if (code === 45) {
        return lookaheadAuthorSuppress(code);
      } // match at symbol `@`, indicating end of prefix


      if (code === 64) {
        return consumeAtSymbol(code);
      }
      // at symbol, then this is not actually a citation token, so we stop

      if (code === 93 || code === null) {
        return nok(code);
      } // otherwise, consume the next character of the prefix


      parseState.lastWasSpace = code === 32;
      effects.consume(code);
      return consumeCiteItemPrefix;
    }
    /**
     * When encountering a hyphen, we must look ahead at the next character
     * to determine whether the hyphen indicates author suppression or is
     * simply part of the citation prefix.
     */


    function lookaheadAuthorSuppress(code) {
      // match hyphen `-`
      if (code !== 45) {
        return nok(code);
      } // lookahead


      return effects.check( // check if the next two characters are `-@`
      lookaheadConstruct, // if they are, tokenize as citeAuthorSuppress
      consumeAuthorSuppress, // otherwise, we're still in the prefix
      consumeSingleCharInPrefix)(code);
    }
    /**
     * Consumes a single character in prefix mode.
     * @effect starts prefix mode if we weren't already in it
     */


    function consumeSingleCharInPrefix(code) {
      // make sure we are in prefix mode
      if (!parseState.inPrefix) {
        effects.enter("citeItemPrefix"
        /* citeItemPrefix */
        );
        parseState.inPrefix = true;
      }

      effects.consume(code);
      return consumeCiteItemPrefix;
    }
    /**
     * @precondition We already KNOW the next TWO characters are `-@`.
     *     (called by `lookaheadAuthorSuppress`)
     */


    function consumeAuthorSuppress(code) {
      // match hyphen `-`
      if (code !== 45) {
        return nok(code);
      } // end prefix, if we previously started it


      if (parseState.inPrefix) {
        effects.exit("citeItemPrefix"
        /* citeItemPrefix */
        );
        parseState.inPrefix = false;
      } // consume hyphen


      effects.enter("citeAuthorSuppress"
      /* citeAuthorSuppress */
      );
      effects.consume(code);
      effects.exit("citeAuthorSuppress"
      /* citeAuthorSuppress */
      ); // consume at symbol

      return consumeAtSymbol;
    }

    function consumeAtSymbol(code) {
      // match at symbol `@`
      if (code !== 64) {
        return nok(code);
      }

      if (parseState.inPrefix) {
        // the prefix end with a space character
        if (!parseState.lastWasSpace) {
          return nok(code);
        } // indicate end of prefix, start of data


        effects.exit("citeItemPrefix"
        /* citeItemPrefix */
        );
        parseState.inPrefix = false;
      } // consume at symbol, which is not considered part of the key


      effects.enter("citeItemSymbol"
      /* citeItemSymbol */
      );
      effects.consume(code);
      effects.exit("citeItemSymbol"
      /* citeItemSymbol */
      ); // next, get the text of the key

      effects.enter("citeItemKey"
      /* citeItemKey */
      );
      return consumeCiteItemKey;
    }

    function consumeCiteItemKey(code) {
      // pandoc is specific about which characters are allowed
      // in a citation key, but since javascript has no multi-
      // lingual way to test for alphanumeric characters, we
      // allow any characters EXCEPT whitespace and `];`
      // match right square bracket `]` or item sep `;` to handle empty keys
      if (code === 93 || code == 59) {
        // handle empty key like `[prefix @]`
        if (!parseState.nonEmptyKey) {
          return nok(code);
        }

        effects.exit("citeItemKey"
        /* citeItemKey */
        ); // this item had no suffix

        effects.exit("citeItem"
        /* citeItem */
        ); // match right square bracket `]`, indicating end of inlineCite node

        if (code === 93) {
          // continue without consuming the closing bracket `]`
          return consumeCiteEnd(code);
        } // match semicolon `;`, indicating, the end of the current citeItem


        if (code === 59) {
          // consume item separator `;`
          effects.enter("citeItemSep"
          /* citeItemSep */
          );
          effects.consume(code);
          effects.exit("citeItemSep"
          /* citeItemSep */
          ); // continue to the next item

          return consumeCiteItem;
        }
      } // match space or comma, indicating start of suffix


      if (code === 32 || code === 44) {
        // handle empty key like `[prefix @, suffix]`
        if (!parseState.nonEmptyKey) {
          return nok(code);
        }

        effects.exit("citeItemKey"
        /* citeItemKey */
        ); // continue to suffix, without consuming character
        // (this character belongs to the suffix, so suffix is non-empty)

        effects.enter("citeItemSuffix"
        /* citeItemSuffix */
        );
        return consumeCiteItemSuffix(code);
      } // CR, LF, CRLF, HT, VS (whitespace, EOLs, EOF)


      if (code === null || code < 0) {
        return nok(code);
      }

      parseState.nonEmptyKey = true; // otherwise, continue consuming characters

      effects.consume(code);
      return consumeCiteItemKey;
    }

    function consumeCiteItemSuffix(code) {
      // fail on eof
      if (code === null) {
        return nok(code);
      } // match right square bracket `]`, indicating end of inlineCite node


      if (code === 93) {
        // we're done!  close this item and finish up
        effects.exit("citeItemSuffix"
        /* citeItemSuffix */
        );
        effects.exit("citeItem"
        /* citeItem */
        ); // continue without consuming the closing bracket `]`

        return consumeCiteEnd(code);
      } // match semicolon `;`, indicating, the end of the current citeItem


      if (code === 59) {
        effects.exit("citeItemSuffix"
        /* citeItemSuffix */
        );
        effects.exit("citeItem"
        /* citeItem */
        ); // consume item separator `;`

        effects.enter("citeItemSep"
        /* citeItemSep */
        );
        effects.consume(code);
        effects.exit("citeItemSep"
        /* citeItemSep */
        ); // continue to the next item

        return consumeCiteItem;
      } // otherwise, continue consuming characters


      effects.consume(code);
      return consumeCiteItemSuffix;
    }

    function consumeCiteEnd(code) {
      // match right square bracket `]`
      if (code !== 93) {
        return nok(code);
      } // consume closing bracket `]`


      effects.enter("inlineCiteMarker"
      /* inlineCiteMarker */
      );
      effects.consume(code);
      effects.exit("inlineCiteMarker"
      /* inlineCiteMarker */
      );
      effects.exit("inlineCite"
      /* inlineCite */
      ); // we're all done!

      return ok;
    }
  };
};

exports.citeHtml = citeHtml;
exports.citeSyntax = citeSyntax;
//# sourceMappingURL=index.cjs.js.map
