import * as Uni from "unist";
import { Token } from "micromark/dist/shared-types";
import { MdastExtension } from "mdast-util-from-markdown/types";

////////////////////////////////////////////////////////////

export interface CiteItem {
	prefix?: string,
	key: string,
	suffix?: string
}

export interface InlineCiteNode extends Uni.Literal {
	type: "cite",
	value: string,
	data: {
		altSyntax?: true|undefined;
		citeItems: CiteItem[]
	}
}

////////////////////////////////////////////////////////////

export const citeFromMarkdown: MdastExtension = {
	enter : {
		inlineCite: enterInlineCite,
		citeItem: enterCiteItem
	},
	exit : {
		inlineCite: exitInlineCite,
		inlineCiteMarker_alt: exitInlineCiteMarker_alt,
		citeItem: exitCiteItem,
		citeItemPrefix: exitCiteItemPrefix,
		citeItemKey: exitCiteItemKey,
		citeItemSuffix: exitCiteItemSuffix
	}
} as MdastExtension;

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

function enterInlineCite(this: any, token: unknown) {
	this.enter({
		type: 'cite',
		value: null,
		data: {
			citeItems: []
		}
	}, token);
}

function exitInlineCite(this: any, token: unknown) {
	let citeNode: InlineCiteNode = this.exit(token);
	citeNode.value = this.sliceSerialize(token);
}

// inlineCiteMarker_alt ------------------------------------

/** Only appears when alternate syntax is used. */
function exitInlineCiteMarker_alt(this: any, token: unknown) {
	const currentNode = top(this.stack) as InlineCiteNode;
	// @ts-ignore: create invalid citeItem, to be filled later
	currentNode.data.altSyntax = true;
}

// -- citeItem ---------------------------------------------

function enterCiteItem(this: any, token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	// @ts-ignore: create invalid citeItem, to be filled later
	currentNode.data.citeItems.push({ });
}

function exitCiteItem(this: any, token: Token) {
	//let item = this.exit(token);
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citeSrc = this.sliceSerialize(token);
}

// -- citeItemKey ------------------------------------------

function exitCiteItemKey(this: any, token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citeKey = this.sliceSerialize(token);

	currentItem.key = citeKey;
}

// -- citeItemSuffix ---------------------------------------

function exitCiteItemSuffix(this: any, token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citeSuffix = this.sliceSerialize(token);

	currentItem.suffix = citeSuffix;
}

// -- citeItemPrefix ---------------------------------------

function exitCiteItemPrefix(this: any, token: Token) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citePrefix = this.sliceSerialize(token);

	currentItem.prefix = citePrefix;
}