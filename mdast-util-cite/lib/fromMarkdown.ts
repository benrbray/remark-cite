import * as Uni from "unist";
import type { Token } from "micromark-util-types";
import type { Extension, CompileContext, Handle } from "mdast-util-from-markdown";
import "mdast-util-to-hast";
import { Data } from "mdast";

////////////////////////////////////////////////////////////

export interface CiteItem {
	prefix?: string,
	key: string,
	suffix?: string,
	suppressAuthor?: true|undefined
}

export interface InlineCiteNode extends Uni.Literal {
	type: "cite",
	value: string,
	data: Data & {
		altSyntax?: true|undefined;
		citeItems: CiteItem[]
	}
}

// add citation node types to tree
declare module 'mdast' {
  interface PhrasingContentMap {
    inlineCiteNode: InlineCiteNode
  }

  interface RootContentMap {
    inlineCiteNode: InlineCiteNode
  }
}

////////////////////////////////////////////////////////////

function top<T>(stack: T[]) {
	return stack[stack.length - 1]
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

const enterInlineCite: Handle = function(this: CompileContext, token: Token) {
	this.enter({
		type: 'cite',
		// @ts-ignore: create invalid citeItem, to be filled later
		value: null,
		data: {
			citeItems: [],
			hName: 'span',
			hProperties: {
				className: ['cite-inline']
			},
			hChildren: []
		}
	}, token);
}

const exitInlineCite: Handle = function(this: CompileContext, token: Token) {
	let citeNode: InlineCiteNode = top(this.stack) as InlineCiteNode;
	this.exit(token);
	const value = this.sliceSerialize(token);
	citeNode.value = value;
	citeNode.data.hChildren!.push({type: 'text', value: value });
	citeNode.data.hProperties!["data-cite"] = JSON.stringify(citeNode.data.citeItems);
}

// inlineCiteMarker_alt ------------------------------------

/** Only appears when alternate syntax is used. */
const exitInlineCiteMarker_alt: Handle = function(this: CompileContext, _token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	// @ts-ignore: create invalid citeItem, to be filled later
	currentNode.data.altSyntax = true;
}

// -- citeItem ---------------------------------------------

const enterCiteItem: Handle = function(this: CompileContext, _token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	// @ts-ignore: create invalid citeItem, to be filled later
	currentNode.data.citeItems.push({ });
}

const exitCiteItem: Handle = function(this: CompileContext, token: Token) {
	//let item = this.exit(token);
	const currentNode = top(this.stack) as InlineCiteNode;
	/*const _currentItem =*/ top(currentNode.data.citeItems);
	/*const _citeSrc =*/ this.sliceSerialize(token);
}

// -- citeAuthorSuppresss ----------------------------------

const exitCiteAuthorSuppress: Handle = function(this: CompileContext, _token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);

	currentItem.suppressAuthor = true;
}

// -- citeItemKey ------------------------------------------

const exitCiteItemKey: Handle = function (this: CompileContext, token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citeKey = this.sliceSerialize(token);

	currentItem.key = citeKey;
}

// -- citeItemSuffix ---------------------------------------

const exitCiteItemSuffix: Handle = function(this: CompileContext, token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citeSuffix = this.sliceSerialize(token);

	currentItem.suffix = citeSuffix;
}

// -- citeItemPrefix ---------------------------------------

const exitCiteItemPrefix = function(this: CompileContext, token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citePrefix = this.sliceSerialize(token);

	currentItem.prefix = citePrefix;
}

////////////////////////////////////////////////////////////

export const citeFromMarkdown: Extension = {
	enter : {
		inlineCite: enterInlineCite,
		citeItem: enterCiteItem
	},
	exit : {
		inlineCite: exitInlineCite,
		inlineCiteMarker_alt: exitInlineCiteMarker_alt,
		citeItem: exitCiteItem,
		citeItemPrefix: exitCiteItemPrefix,
		citeAuthorSuppress: exitCiteAuthorSuppress,
		citeItemKey: exitCiteItemKey,
		citeItemSuffix: exitCiteItemSuffix
	}
};