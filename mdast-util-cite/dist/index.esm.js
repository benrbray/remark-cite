////////////////////////////////////////////////////////////
var fromMarkdown = {
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
} ////////////////////////////////////////////////////////////


var toMarkdown = {// TODO
};

export { fromMarkdown, toMarkdown };
//# sourceMappingURL=index.esm.js.map
