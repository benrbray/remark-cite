// unified / unist / mdast/ remark
import unified from 'unified';
import * as Uni from "unist";
import markdown from 'remark-parse';
import remark2markdown from 'remark-stringify';
var remarkStringify = require('remark-stringify')

// // testing
import * as assert from 'assert';

// project imports
import { CiteItem, InlineCiteNode } from "@benrbray/mdast-util-cite";
import { CiteSyntaxOptions } from '@benrbray/micromark-extension-cite'
import { citePlugin as remarkCitePlugin } from "..";

// re-use tests from mdast-util-cite
import * as MdastUtilCiteTests from "../../mdast-util-cite/test/test";

////////////////////////////////////////////////////////////

export function unistIsParent(node: Uni.Node): node is Uni.Parent {
	return Boolean(node.children);
}

export function unistIsStringLiteral(node: Uni.Node): node is Uni.Literal & { value: string } {
	return (typeof node.value === "string");
}

////////////////////////////////////////////////////////////

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

function runTestSuite_fromMarkdown(contextMsg: string, descPrefix:string, testSuite: MdastUtilCiteTests.TestSuite<MdastUtilCiteTests.TestFromMd>): void {
	context(contextMsg, () => {

		let idx = 0;
		for(let testCase of testSuite.cases) {
			let desc = `[${descPrefix} ${("00" + (++idx)).slice(-3)}] ` + (testCase.description || "");
			it(desc, () => {
				// merge suite options with case options
				let syntaxOptions = Object.assign({}, testSuite.options, testCase.options);

				// markdown -> ast
				const processor = unified()
					.use(markdown)
					.use(remarkCitePlugin, { syntax: syntaxOptions });

				var ast = processor.parse(testCase.markdown);
				ast = processor.runSync(ast);

				// accumulate citations
				let citations: InlineCiteNode[] = [];
				visitNodeType(ast, 'cite', (node: InlineCiteNode) => {
					citations.push(node);
				});

				// check for match
				assert.strictEqual(citations.length, testCase.expectData.length);
				for(let k = 0; k < citations.length; k++) {
					assert.deepStrictEqual(citations[k].data, testCase.expectData[k]); 
				}
			});
		}
	});
}

////////////////////////////////////////////////////////////

function runTestSuite_toMarkdown(contextMsg: string, descPrefix:string, testSuite: MdastUtilCiteTests.TestSuite<MdastUtilCiteTests.TestToMd>): void {
	context(contextMsg, () => {

		let idx = 0;
		for(let testCase of testSuite.cases) {
			let desc = `[${descPrefix} ${("00" + (++idx)).slice(-3)}] ` + (testCase.description || "");
			it(desc, () => {
				// merge suite options with case options
				let toMarkdownOptions = Object.assign({}, testSuite.options, testCase.options);

				// markdown -> ast
				const processor = unified()
					.use(markdown)
					.use(remarkStringify)
					.use(remarkCitePlugin, { toMarkdown: toMarkdownOptions });

				var serialized = processor.stringify(testCase.ast);

				// check for match
				assert.strictEqual(serialized.trim(), testCase.expected);
			});
		}
	});
}

////////////////////////////////////////////////////////////

// from markdown
describe('remark-cite (fromMarkdown)', () => {

	runTestSuite_fromMarkdown("pandoc syntax / single citation node", "pandoc-single", MdastUtilCiteTests.pandocSingleTestSuite);
	runTestSuite_fromMarkdown("pandoc syntax / multiple citation nodes", "pandoc-multi", MdastUtilCiteTests.pandocMultiTestSuite);
	runTestSuite_fromMarkdown("pandoc syntax / suppress author", "pandoc-suppress", MdastUtilCiteTests.pandocSuppressAuthorSuite);

	runTestSuite_fromMarkdown("alt syntax / single citation node", "alt-single", MdastUtilCiteTests.altSingleTestSuite);
	runTestSuite_fromMarkdown("alt syntax / multiple citation nodes", "alt-multi", MdastUtilCiteTests.altMultiTestSuite);
	runTestSuite_fromMarkdown("alt syntax / suppress author", "alt-suppress", MdastUtilCiteTests.altSuppressAuthorSuite);

});

// to markdown
describe('remark-cite (toMarkdown)', () => {

	runTestSuite_toMarkdown("to markdown", "to-md", MdastUtilCiteTests.toMarkdownTestSuite);

});