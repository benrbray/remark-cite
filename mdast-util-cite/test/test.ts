// // testing
import * as assert from 'assert';

// mdast / unist
import * as Uni from "unist";
import fromMarkdown from 'mdast-util-from-markdown';

////////////////////////////////////////////////////////////

// project imports
import { citeExtension, CiteOptions } from '@benrbray/micromark-extension-cite'
import { CiteItem, InlineCiteNode } from "..";
import * as mdastCiteExt from "..";

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
	options?: Partial<CiteOptions>;
	markdown: string;                      // markdown input
	expectData: InlineCiteNode["data"][]; // one per expected citation in the input
}

interface TestSuite {
	/** Default options for the entire test suite.  Can be overridden by individual cases. */
	options?: Partial<CiteOptions>,
	cases: TestCase[],
}

////////////////////////////////////////////////////////////

/** test cases with a single citation node. */
const pandocSingleTestCases:TestCase[] = [
	{
		markdown: '[@wadler1989]',
		expectData: [
			{ citeItems: [{ key: "wadler1989" }] },
		]
	},{
		markdown: '[see @wadler1989]',
		expectData: [
			{ citeItems: [{ prefix: "see ", key: "wadler1989" }] },
		]
	},{
		markdown: '[@wadler1989, pp. 80]',
		expectData: [
			{ citeItems: [{ key: "wadler1989", suffix: ", pp. 80" }] },
		]
	},{
		markdown: '[see @wadler1989, pp. 80]',
		expectData: [
			{ citeItems: [{ prefix: "see ", key: "wadler1989", suffix: ", pp. 80" }] },
		]
	},{
		markdown: '[see @wadler1989, pp. 80; and also @hughes1990, sec. 1.2, sec 2.3]',
		expectData: [
			{ citeItems: [
				{ prefix: "see ", key: "wadler1989", suffix: ", pp. 80" },
				{ prefix: " and also ", key: "hughes1990", suffix: ", sec. 1.2, sec 2.3" }
			] }
		]
	},{
		markdown: '[see @wadler1989, pp. 80; and also @hughes1990, sec. 1.2, sec 2.3; but don\'t forget @peyton-jones1996]',
		expectData: [
			{ citeItems: [
				{ prefix: "see ", key: "wadler1989", suffix: ", pp. 80" },
				{ prefix: " and also ", key: "hughes1990", suffix: ", sec. 1.2, sec 2.3" },
				{ prefix: " but don't forget ", key: "peyton-jones1996" }
			] },
		]
	},
]

const pandocSingleTestSuite: TestSuite = {
	cases: pandocSingleTestCases
}

//// PANDOC MULTI //////////////////////////////////////////

/** test cases with a single citation node. */
const pandocMultiTestCases:TestCase[] = [
	{
		markdown: 'lorem ipsum [@wadler1989] dolor site [@hughes1990] amet',
		expectData: [
			{ citeItems: [{ key: "wadler1989" }] },
			{ citeItems: [{ key: "hughes1990" }] },
		]
	},
	{
		markdown: 'lorem ipsum [see e.g. @wadler1989, pp.80] and [@hughes1990]',
		expectData: [
			{ citeItems: [{ prefix: "see e.g. ", key: "wadler1989", suffix: ", pp.80" }] },
			{ citeItems: [{ key: "hughes1990" }] },
		]
	},
	{
		markdown: 'lorem ipsum [see e.g. @wadler1989:snake_case_title, pp.80; and @peyton-jones1993] dolor [see @hughes1990:kebab-case, sec8.1 ] sit amet [also @peyton-jones1996; @peyton-jones1991]',
		expectData: [
			{ citeItems: [
				{ prefix: "see e.g. ", key: "wadler1989:snake_case_title", suffix: ", pp.80" },
				{ prefix: " and ", key: "peyton-jones1993" }
			] },
			{ citeItems: [
				{ prefix: "see ", key: "hughes1990:kebab-case", suffix: ", sec8.1 " }
			] },
			{ citeItems: [
				{ prefix: "also ", key: "peyton-jones1996" },
				{ prefix: " ", key: "peyton-jones1991" }
			] }
		]
	}
]

const pandocMultiTestSuite: TestSuite = {
	cases: pandocMultiTestCases
}

//// ALTERNATIVE SYNTAX ////////////////////////////////////



////////////////////////////////////////////////////////////

/** test cases with a single citation node. */
const altSingleTestCases:TestCase[] = [
	{
		markdown: '@[wadler1989]',
		expectData: [
			{
				altSyntax: true, 
				citeItems: [{ key: "wadler1989" }]
			},
		]
	},{
		markdown: '@[wadler1989, pp. 80]',
		expectData: [
			{
				altSyntax: true, 
				citeItems: [{ key: "wadler1989", suffix: ", pp. 80" }]
			},
		]
	},{
		markdown: '@[wadler1989, pp. 80; and also @hughes1990, sec. 1.2, sec 2.3]',
		expectData: [
			{ 
				altSyntax: true,
				citeItems: [
					{ key: "wadler1989", suffix: ", pp. 80" },
					{ prefix: " and also ", key: "hughes1990", suffix: ", sec. 1.2, sec 2.3" }
				] 
			}
		]
	},{
		markdown: '@[wadler1989, pp. 80; and also @hughes1990, sec. 1.2, sec 2.3; but don\'t forget @peyton-jones1996]',
		expectData: [
			{
				altSyntax: true,
				citeItems: [
					{ key: "wadler1989", suffix: ", pp. 80" },
					{ prefix: " and also ", key: "hughes1990", suffix: ", sec. 1.2, sec 2.3" },
					{ prefix: " but don't forget ", key: "peyton-jones1996" }
				]
			},
		]
	},
]

const altSingleTestSuite: TestSuite = {
	cases: altSingleTestCases,
	options: { enableAltSyntax: true }
}

//// PANDOC MULTI //////////////////////////////////////////

/** test cases with a single citation node. */
const altMultiTestCases:TestCase[] = [
	{
		markdown: 'lorem ipsum @[wadler1989] dolor site @[hughes1990] amet',
		expectData: [
			{
				altSyntax: true,
				citeItems: [{ key: "wadler1989" }]
			},
			{
				altSyntax: true,
				citeItems: [{ key: "hughes1990" }]
			},
		]
	},
	{
		markdown: 'lorem ipsum @[wadler1989, pp.80] and [@hughes1990]',
		expectData: [
			{
				altSyntax: true,
				citeItems: [{ key: "wadler1989", suffix: ", pp.80" }]
			},
			{
				citeItems: [{ key: "hughes1990" }]
			},
		]
	},
	{
		markdown: 'lorem ipsum [see e.g. @wadler1989:snake_case_title, pp.80; and @peyton-jones1993] dolor @[hughes1990:kebab-case, sec8.1 ] sit amet @[peyton-jones1996; @peyton-jones1991]',
		expectData: [
			{
				citeItems: [
					{ prefix: "see e.g. ", key: "wadler1989:snake_case_title", suffix: ", pp.80" },
					{ prefix: " and ", key: "peyton-jones1993" }
				]
			},
			{
				altSyntax: true,
				citeItems: [{ key: "hughes1990:kebab-case", suffix: ", sec8.1 " }]
			},
			{
				altSyntax: true,
				citeItems: [
					{ key: "peyton-jones1996" },
					{ prefix: " ", key: "peyton-jones1991" }
				]
			}
		]
	}
]

const altMultiTestSuite: TestSuite = {
	cases: altMultiTestCases,
	options: { enableAltSyntax: true }
}

////////////////////////////////////////////////////////////

function runTestSuite(contextMsg: string, descPrefix:string, testSuite: TestSuite): void {
	context(contextMsg, () => {

		let idx = 0;
		for(let testCase of testSuite.cases) {
			let desc = `[${descPrefix} ${("00" + (++idx)).slice(-3)}]` + (testCase.description || "");
			it(desc, () => {
				// merge suite options with case options
				const options = Object.assign({}, testSuite.options, testCase.options);

				// markdown -> ast
				const ast = fromMarkdown(testCase.markdown, {
					extensions: [citeExtension(options)],
					mdastExtensions: [
						mdastCiteExt.fromMarkdown
					]
				});

				// accumulate citations
				let citations: InlineCiteNode[] = [];
				visitNodeType(ast, 'cite', (node: InlineCiteNode) => {
					citations.push(node);
				});

				// check for match
				assert.strictEqual(citations.length, testCase.expectData.length);
				for(let k = 0; k < citations.length; k++) {
					// cite items
					assert.deepStrictEqual(citations[k].data, testCase.expectData[k]); 
				}
			});
		}
	});
}

////////////////////////////////////////////////////////////

describe('mdast-util-cite', () => {

	runTestSuite("fromMarkdown :: pandoc syntax / single citation node", "pandoc-single", pandocSingleTestSuite);
	runTestSuite("fromMarkdown :: pandoc syntax multiple citation nodes", "pandoc-multi", pandocMultiTestSuite);

	runTestSuite("fromMarkdown :: alt syntax / single citation node", "alt-single", altSingleTestSuite);
	runTestSuite("fromMarkdown :: alt syntax multiple citation nodes", "alt-multi", altMultiTestSuite);

});