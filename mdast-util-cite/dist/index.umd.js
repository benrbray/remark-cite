////////////////////////////////////////////////////////////
var citeFromMarkdown = {
  enter: {
    inlineCite: enterInlineCite,
    citeItem: enterCiteItem
  },
  exit: {
    inlineCite: exitInlineCite,
    inlineCiteMarker_alt: exitInlineCiteMarker_alt,
    citeItem: exitCiteItem,
    citeItemPrefix: exitCiteItemPrefix,
    citeItemKey: exitCiteItemKey,
    citeItemSuffix: exitCiteItemSuffix
  }
}; ////////////////////////////////////////////////////////////

function top(stack) {
  return stack[stack.length - 1];
}
/**
 * [see @wadler1990; also @hughes1989, pp. 4]
 *
 * inlineCite
 *   inlineCiteMarker [
 *   citeItem
 *     citeItemPrefix "see "
 *     citeItemSymbol "@"
 *     citeItemKey "wadler1990"
 *     citeItemSuffix ""
 *   citeItem
 *     citeItemPrefix " also "
 *     citeItemSymbol "@"
 *     citeItemKey "hughes1989"
 *     citeItemSuffix ", pp. 4"
 *   inlineCiteMarker ]
 */
// -- inlineCite -------------------------------------------


function enterInlineCite(token) {
  this.enter({
    type: 'cite',
    value: null,
    data: {
      citeItems: []
    }
  }, token);
}

function exitInlineCite(token) {
  var citeNode = this.exit(token);
  citeNode.value = this.sliceSerialize(token);
} // inlineCiteMarker_alt ------------------------------------

/** Only appears when alternate syntax is used. */


function exitInlineCiteMarker_alt(token) {
  var currentNode = top(this.stack); // @ts-ignore: create invalid citeItem, to be filled later

  currentNode.data.altSyntax = true;
} // -- citeItem ---------------------------------------------


function enterCiteItem(token) {
  var currentNode = top(this.stack); // @ts-ignore: create invalid citeItem, to be filled later

  currentNode.data.citeItems.push({});
}

function exitCiteItem(token) {
  //let item = this.exit(token);
  var currentNode = top(this.stack);
  top(currentNode.data.citeItems);
  this.sliceSerialize(token);
} // -- citeItemKey ------------------------------------------


function exitCiteItemKey(token) {
  var currentNode = top(this.stack);
  var currentItem = top(currentNode.data.citeItems);
  var citeKey = this.sliceSerialize(token);
  currentItem.key = citeKey;
} // -- citeItemSuffix ---------------------------------------


function exitCiteItemSuffix(token) {
  var currentNode = top(this.stack);
  var currentItem = top(currentNode.data.citeItems);
  var citeSuffix = this.sliceSerialize(token);
  currentItem.suffix = citeSuffix;
} // -- citeItemPrefix ---------------------------------------


function exitCiteItemPrefix(token) {
  var currentNode = top(this.stack);
  var currentItem = top(currentNode.data.citeItems);
  var citePrefix = this.sliceSerialize(token);
  currentItem.prefix = citePrefix;
}

var patternCompile_1 = patternCompile;

function patternCompile(pattern) {
  var before;
  var after;

  if (!pattern._compiled) {
    before = pattern.before ? '(?:' + pattern.before + ')' : '';
    after = pattern.after ? '(?:' + pattern.after + ')' : '';

    if (pattern.atBreak) {
      before = '[\\r\\n][\\t ]*' + before;
    }

    pattern._compiled = new RegExp((before ? '(' + before + ')' : '') + (/[|\\{}()[\]^$+*?.-]/.test(pattern.character) ? '\\' : '') + pattern.character + (after || ''), 'g');
  }

  return pattern._compiled;
}

var patternInScope_1 = patternInScope;

function patternInScope(stack, pattern) {
  return listInScope(stack, pattern.inConstruct, true) && !listInScope(stack, pattern.notInConstruct);
}

function listInScope(stack, list, none) {
  var index;

  if (!list) {
    return none;
  }

  if (typeof list === 'string') {
    list = [list];
  }

  index = -1;

  while (++index < list.length) {
    if (stack.indexOf(list[index]) !== -1) {
      return true;
    }
  }

  return false;
}

var safe_1 = safe;





function safe(context, input, config) {
  var value = (config.before || '') + (input || '') + (config.after || '');
  var positions = [];
  var result = [];
  var infos = {};
  var index = -1;
  var before;
  var after;
  var position;
  var pattern;
  var expression;
  var match;
  var start;
  var end;

  while (++index < context.unsafe.length) {
    pattern = context.unsafe[index];

    if (!patternInScope_1(context.stack, pattern)) {
      continue;
    }

    expression = patternCompile_1(pattern);

    while (match = expression.exec(value)) {
      before = 'before' in pattern || pattern.atBreak;
      after = 'after' in pattern;
      position = match.index + (before ? match[1].length : 0);

      if (positions.indexOf(position) === -1) {
        positions.push(position);
        infos[position] = {
          before: before,
          after: after
        };
      } else {
        if (infos[position].before && !before) {
          infos[position].before = false;
        }

        if (infos[position].after && !after) {
          infos[position].after = false;
        }
      }
    }
  }

  positions.sort(numerical);
  start = config.before ? config.before.length : 0;
  end = value.length - (config.after ? config.after.length : 0);
  index = -1;

  while (++index < positions.length) {
    position = positions[index];

    if ( // Character before or after matched:
    position < start || position >= end) {
      continue;
    } // If this character is supposed to be escaped because it has a condition on
    // the next character, and the next character is definitly being escaped,
    // then skip this escape.


    if (position + 1 < end && positions[index + 1] === position + 1 && infos[position].after && !infos[position + 1].before && !infos[position + 1].after) {
      continue;
    }

    if (start !== position) {
      // If we have to use a character reference, an ampersand would be more
      // correct, but as backslashes only care about punctuation, either will
      // do the trick
      result.push(escapeBackslashes(value.slice(start, position), '\\'));
    }

    start = position;

    if (/[!-/:-@[-`{-~]/.test(value.charAt(position)) && (!config.encode || config.encode.indexOf(value.charAt(position)) === -1)) {
      // Character escape.
      result.push('\\');
    } else {
      // Character reference.
      result.push('&#x' + value.charCodeAt(position).toString(16).toUpperCase() + ';');
      start++;
    }
  }

  result.push(escapeBackslashes(value.slice(start, end), config.after));
  return result.join('');
}

function numerical(a, b) {
  return a - b;
}

function escapeBackslashes(value, after) {
  var expression = /\\(?=[!-/:-@[-`{-~])/g;
  var positions = [];
  var results = [];
  var index = -1;
  var start = 0;
  var whole = value + after;
  var match;

  while (match = expression.exec(whole)) {
    positions.push(match.index);
  }

  while (++index < positions.length) {
    if (start !== positions[index]) {
      results.push(value.slice(start, positions[index]));
    }

    results.push('\\');
    start = positions[index];
  }

  results.push(value.slice(start));
  return results.join('');
}

/**
 * @warning Does no validation.  Garbage in, garbage out.
 */

function citeToMarkdown() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  // fill in option defaults
  var settings = Object.assign({
    standardizeAltSyntax: false,
    useNodeValue: false
  }, options); // TODO:  I don't fully understand what this does, but I did my
  // best to fill it in based on what I saw in other mdast utils
  // (e.g. https://github.com/syntax-tree/mdast-util-math/blob/main/to-markdown.js)

  var unsafe = [{
    character: ',',
    inConstruct: ["citationKey"]
  }, {
    character: '@',
    inConstruct: ["citation"]
  }];
  /** Returns an escaped representation of `node.value`. */

  function handler_useNodeValue(node, _, context) {
    var exit = context.enter("citation");
    var nodeValue = safe_1(context, node.value, {});
    exit();
    return nodeValue;
  }
  /** Reconstructs the citation using data attached to the `InlineCiteNode`. */


  function handler_default(node, _, context) {
    // handle missing items
    if (node.data.citeItems.length === 0) {
      return "";
    } // decide whether to use alt-syntax or pandoc-syntax


    var firstItem = node.data.citeItems[0];
    var useAltSyntax = !settings.standardizeAltSyntax && node.data.altSyntax === true && (firstItem.prefix === undefined || firstItem.prefix === ""); // escape and reconstruct data

    var exit = context.enter('citation');
    var safeItems = node.data.citeItems.map(function (item, idx) {
      var exitKey = context.enter("citationKey");
      var key = safe_1(context, item.key, {
        before: "@"
      });
      exitKey();
      var prefix = item.prefix && (!useAltSyntax || idx > 0) ? safe_1(context, item.prefix, {}) : "";
      var suffix = item.suffix ? safe_1(context, item.suffix, {}) : "";

      if (idx === 0) {
        if (useAltSyntax) {
          return "@[".concat(key).concat(suffix);
        } else {
          return "[".concat(prefix, "@").concat(key).concat(suffix);
        }
      } else {
        return ";".concat(prefix, "@").concat(key).concat(suffix);
      }
    });
    exit();
    return safeItems.join("") + ']';
  }
  var handler = settings.useNodeValue ? handler_useNodeValue : handler_default;
  return {
    unsafe: unsafe,
    handlers: {
      // as of (2021-05-07), the typings for Handle do not reflect
      // that the handler will be passed nodes of a specific type
      cite: handler
    }
  };
}

export { citeFromMarkdown, citeToMarkdown };
//# sourceMappingURL=index.umd.js.map
