// unified / unist / mdast/ remark
import unified from 'unified';
import * as Uni from "unist";
import markdown from 'remark-parse';
import remark2markdown from 'remark-stringify';

// // testing
import * as assert from 'assert';

// project imports
import { CiteItem, InlineCiteNode } from "@benrbray/mdast-util-cite";
import { citePlugin as remarkCitePlugin } from "..";

////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////

export function unistIsParent(node: Uni.Node): node is Uni.Parent {
	return Boolean(node.children);
}

export function unistIsStringLiteral(node: Uni.Node): node is Uni.Literal & { value: string } {
	return (typeof node.value === "string");
}

////////////////////////////////////////////////////////////////////////////////

enum VisitorAction {
	/** Continue traversal as normal. */
	CONTINUE = 1,
	/** Do not traverse this node's children. */
	SKIP     = 2,
	/** Stop traversal immediately. */
	EXIT     = 3
}

type Visitor<V extends Uni.Node = Uni.Node> = (node:V) => VisitorAction|void;

/**
 * Visit every node in the tree using a depth-first preorder traversal.
 */
export function visit(tree: Uni.Node, visitor: Visitor<Uni.Node>): void {
	recurse(tree);

	function recurse(node: Uni.Node): VisitorAction {
		// visit the node itself and handle the result
		let action = visitor(node) || VisitorAction.CONTINUE;
		if(action === VisitorAction.EXIT) { return VisitorAction.EXIT; }
		if(action === VisitorAction.SKIP) { return VisitorAction.SKIP; }
		if(!unistIsParent(node))               { return action; }

		// visit the node's children from first to last
		for(let childIdx = 0; childIdx < node.children.length; childIdx++) {
			// visit child and handle the subtree result
			let subresult = recurse(node.children[childIdx]);
			if(subresult === VisitorAction.EXIT) { return VisitorAction.EXIT; }

			// TODO: if visitor modified the tree, we might want to allow it
			// to return a new childIdx to continue iterating from
		}

		return action;
	}
}

/**
 * Visit a specific type of node.
 */
export function visitNodeType<S extends string, N extends Uni.Node & { type: S }>(
	tree: Uni.Node,
	type: S,
	visitor: Visitor<N>
): void {
	// filter nodes by type
	function predicate(node: Uni.Node): node is N {
		return (node.type === type);
	}

	// apply the provided visitor only if type predicate matches
	visit(tree, node => {
		if(predicate(node)) { return visitor(node);          }
		else                { return VisitorAction.CONTINUE; }
	});
}

////////////////////////////////////////////////////////////

interface TestCase {
	description?: string;
	markdown: string;               // markdown input
	expectCiteItems: CiteItem[][];  // one for each expected citation in the input
}

/** test cases with a single citation node. */
const singleTestCases:TestCase[] = [
	{
		markdown: '[@wadler1989]',
		expectCiteItems: [
			[{ key: "wadler1989" }],
		]
	},{
		markdown: '[see @wadler1989]',
		expectCiteItems: [
			[{ prefix: "see ", key: "wadler1989" }],
		]
	},{
		markdown: '[@wadler1989, pp. 80]',
		expectCiteItems: [
			[{ key: "wadler1989", suffix: ", pp. 80" }],
		]
	},{
		markdown: '[see @wadler1989, pp. 80]',
		expectCiteItems: [
			[{ prefix: "see ", key: "wadler1989", suffix: ", pp. 80" }],
		]
	},{
		markdown: '[see @wadler1989, pp. 80; and also @hughes1990, sec. 1.2, sec 2.3]',
		expectCiteItems: [
			[
				{ prefix: "see ", key: "wadler1989", suffix: ", pp. 80" },
				{ prefix: " and also ", key: "hughes1990", suffix: ", sec. 1.2, sec 2.3" }
			]
		]
	},{
		markdown: '[see @wadler1989, pp. 80; and also @hughes1990, sec. 1.2, sec 2.3; but don\'t forget @peyton-jones1996]',
		expectCiteItems: [
			[
				{ prefix: "see ", key: "wadler1989", suffix: ", pp. 80" },
				{ prefix: " and also ", key: "hughes1990", suffix: ", sec. 1.2, sec 2.3" },
				{ prefix: " but don't forget ", key: "peyton-jones1996" }
			],
		]
	},
]

/** test cases with a single citation node. */
const multiTestCases:TestCase[] = [
	{
		markdown: 'lorem ipsum [@wadler1989] dolor site [@hughes1990] amet',
		expectCiteItems: [
			[{ key: "wadler1989" }],
			[{ key: "hughes1990" }],
		]
	},
	{
		markdown: 'lorem ipsum [see e.g. @wadler1989, pp.80] and [@hughes1990]',
		expectCiteItems: [
			[{ prefix: "see e.g. ", key: "wadler1989", suffix: ", pp.80" }],
			[{ key: "hughes1990" }],
		]
	},
	{
		markdown: 'lorem ipsum [see e.g. @wadler1989:snake_case_title, pp.80; and @peyton-jones1993] dolor [see @hughes1990:kebab-case, sec8.1 ] sit amet [also @peyton-jones1996; @peyton-jones1991]',
		expectCiteItems: [
			[
				{ prefix: "see e.g. ", key: "wadler1989:snake_case_title", suffix: ", pp.80" },
				{ prefix: " and ", key: "peyton-jones1993" }
			],
			[{ prefix: "see ", key: "hughes1990:kebab-case", suffix: ", sec8.1 " }],
			[
				{ prefix: "also ", key: "peyton-jones1996" },
				{ prefix: " ", key: "peyton-jones1991" }
			]
		]
	}
]

////////////////////////////////////////////////////////////

function runTestSuite(contextMsg: string, descPrefix:string, testSuite: TestCase[]): void {
	context(contextMsg, () => {

		let idx = 0;
		for(let testCase of testSuite) {
			let desc = `[${descPrefix} ${("00" + (++idx)).slice(-3)}]` + (testCase.description || "");
			it(desc, () => {
				const processor = unified()
					.use(markdown)
					.use(remarkCitePlugin, { });

				var ast = processor.parse(testCase.markdown);
				ast = processor.runSync(ast);

				// accumulate citations
				let citations: InlineCiteNode[] = [];
				visitNodeType(ast, 'cite', (node: InlineCiteNode) => {
					citations.push(node);
				});

				// check for match
				assert.strictEqual(citations.length, testCase.expectCiteItems.length);
				for(let k = 0; k < citations.length; k++) {
					assert.deepStrictEqual(citations[k].data.citeItems, testCase.expectCiteItems[k]); 
				}
			});
		}
	});
}

////////////////////////////////////////////////////////////

describe('mdast-util-wiki-link', () => {

	runTestSuite("remark-cite :: test cases with a single citation node", "single-test", singleTestCases);
	runTestSuite("remark-cite :: test cases with a multiple citation nodes", "multi-test", multiTestCases);

});