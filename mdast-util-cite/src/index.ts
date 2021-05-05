import * as Uni from "unist";
import { Token } from "micromark/dist/shared-types";

////////////////////////////////////////////////////////////

export const fromMarkdown = {
	enter : {
		inlineCite: enterInlineCite,
		citeItem: enterCiteItem
	},
	exit : {
		inlineCite: exitInlineCite,
		citeItem: exitCiteItem,
		citeItemPrefix: exitCiteItemPrefix,
		citeItemKey: exitCiteItemKey,
		citeItemSuffix: exitCiteItemSuffix
	}
}

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
 *     citeItemKey "@wadler1990"
 *     citeItemSuffix ""
 *   citeItem
 *     citeItemPrefix " also "
 *     citeItemKey "@hughes1989"
 *     citeItemSuffix " pp. 4"
 *   inlineCiteMarker ]
 *
 *
 *
 */

// -- inlineCite -------------------------------------------

interface CiteItem {
	prefix: string,
	key: string,
	suffix: string
}

interface InlineCiteNode extends Uni.Literal {
	type: "cite",
	value: string,
	children: [],
	data: {
		citeItems: CiteItem[]
	}
}

function enterInlineCite(this: any, token: unknown) {
	this.enter({
		type: 'cite',
		value: null,
		data: {
			citeItems: []
		}
	}, token)
}

function exitInlineCite(this: any, token: unknown) {
	let citeNode: InlineCiteNode = this.exit(token)
	citeNode.value = this.sliceSerialize(token);
}

// -- citeItem ---------------------------------------------

function enterCiteItem(this: any, token: Uni.Node) {
	const currentNode = top(this.stack) as InlineCiteNode;
	// @ts-ignore: create invalid citeItem, to be filled later
	currentNode.data.citeItems.push({ });
}

function exitCiteItem(this: any, token: Uni.Node) {
	//let item = this.exit(token);
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citeSrc = this.sliceSerialize(token);
}

// -- citeItem ---------------------------------------------

function exitCiteItemKey(this: any, token: Uni.Node) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citeKey = this.sliceSerialize(token)

	currentItem.key = citeKey;
}

// -- citeItem ---------------------------------------------

function exitCiteItemSuffix(this: any, token: Uni.Node) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citeSuffix = this.sliceSerialize(token)

	currentItem.suffix = citeSuffix;
}

// -- citeItem ---------------------------------------------

function exitCiteItemPrefix(this: any, token: Uni.Node) {
	const currentNode = top(this.stack) as InlineCiteNode;
	const currentItem = top(currentNode.data.citeItems);
	const citePrefix = this.sliceSerialize(token)

	currentItem.prefix = citePrefix;
}

////////////////////////////////////////////////////////////

export const toMarkdown = {
	// TODO
}