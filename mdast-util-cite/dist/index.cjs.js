'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fromMarkdown = {
  enter: {
    inlineCite: enterInlineCite,
    citeItem: enterCiteItem
  },
  exit: {
    inlineCite: exitInlineCite,
    citeItem: exitCiteItem,
    citeItemPrefix: exitCiteItemPrefix,
    citeItemKey: exitCiteItemKey,
    citeItemSuffix: exitCiteItemSuffix
  }
};

function top(stack) {
  return stack[stack.length - 1];
}

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
} // -- citeItem ---------------------------------------------


function exitCiteItemKey(token) {
  var currentNode = top(this.stack);
  var currentItem = top(currentNode.data.citeItems);
  var citeKey = this.sliceSerialize(token);
  currentItem.key = citeKey;
} // -- citeItem ---------------------------------------------


function exitCiteItemSuffix(token) {
  var currentNode = top(this.stack);
  var currentItem = top(currentNode.data.citeItems);
  var citeSuffix = this.sliceSerialize(token);
  currentItem.suffix = citeSuffix;
} // -- citeItem ---------------------------------------------


function exitCiteItemPrefix(token) {
  var currentNode = top(this.stack);
  var currentItem = top(currentNode.data.citeItems);
  var citePrefix = this.sliceSerialize(token);
  currentItem.prefix = citePrefix;
} ////////////////////////////////////////////////////////////


var toMarkdown = {// TODO
};

exports.fromMarkdown = fromMarkdown;
exports.toMarkdown = toMarkdown;
//# sourceMappingURL=index.cjs.js.map
