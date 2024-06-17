// testing
import assert from "assert";
import { describe, test } from "vitest";

// unified / unist / mdast/ remark
import * as Uni from "unist";
import { unified } from 'unified';
import markdown from 'remark-parse';
import remarkStringify from 'remark-stringify';
// var remarkStringify = require('remark-stringify')

// project imports
import { InlineCiteNode } from "@benrbray/mdast-util-cite";
import { citePlugin as remarkCitePlugin } from "../lib/main";

// re-use tests from mdast-util-cite
import * as MdastUtilCiteTests from "../../mdast-util-cite/test/main.test";
import { Root } from "mdast";

////////////////////////////////////////////////////////////////////////////////

export function unistIsParent(node: Uni.Node): node is Uni.Parent {
	return Boolean((node as Uni.Parent).children);
}

export function unistIsStringLiteral(node: Uni.Node): node is Uni.Literal & { value: string } {
	return (typeof (node as Uni.Literal).value === "string");
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

function describeTestSuite_fromMarkdown(contextMsg: string, descPrefix:string, testSuite: MdastUtilCiteTests.TestSuite<MdastUtilCiteTests.TestFromMd>): void {
	describe(contextMsg, () => {

		let idx = 0;
		for(let testCase of testSuite.cases) {
			let desc = `[${descPrefix} ${("00" + (++idx)).slice(-3)}] ` + (testCase.description || "");
			test(desc, () => {
				// merge suite options with case options
				let syntaxOptions = Object.assign({}, testSuite.options, testCase.options);

				// markdown -> ast
				const processor = unified()
					.use(markdown)
					.use(remarkCitePlugin, { syntax: syntaxOptions });

				var ast = processor.parse(testCase.markdown);
				const result = processor.runSync(ast);

				// accumulate citations
				let citations: InlineCiteNode[] = [];
				visitNodeType(result, 'cite', (node: InlineCiteNode) => {
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

function describeTestSuite_toMarkdown(contextMsg: string, descPrefix:string, testSuite: MdastUtilCiteTests.TestSuite<MdastUtilCiteTests.TestToMd>): void {
	describe(contextMsg, () => {

		let idx = 0;
		for(let testCase of testSuite.cases) {
			let desc = `[${descPrefix} ${("00" + (++idx)).slice(-3)}] ` + (testCase.description || "");
			test(desc, () => {
				// merge suite options with case options
				let toMarkdownOptions = Object.assign({}, testSuite.options, testCase.options);

				// markdown -> ast
				const processor = unified()
					.use(markdown)
					.use(remarkStringify)
					.use(remarkCitePlugin, { toMarkdown: toMarkdownOptions });

				var root: Root = { type: "root", children: [testCase.ast] };
				var serialized = processor.stringify(root);

				// check for match
				assert.strictEqual(serialized.trim(), testCase.expected);
			});
		}
	});
}

////////////////////////////////////////////////////////////

// from markdown
describeTestSuite_fromMarkdown("pandoc syntax / single citation node", "pandoc-single", MdastUtilCiteTests.pandocSingleTestSuite);
describeTestSuite_fromMarkdown("pandoc syntax / multiple citation nodes", "pandoc-multi", MdastUtilCiteTests.pandocMultiTestSuite);
describeTestSuite_fromMarkdown("pandoc syntax / suppress author", "pandoc-suppress", MdastUtilCiteTests.pandocSuppressAuthorSuite);

describeTestSuite_fromMarkdown("alt syntax / single citation node", "alt-single", MdastUtilCiteTests.altSingleTestSuite);
describeTestSuite_fromMarkdown("alt syntax / multiple citation nodes", "alt-multi", MdastUtilCiteTests.altMultiTestSuite);
describeTestSuite_fromMarkdown("alt syntax / suppress author", "alt-suppress", MdastUtilCiteTests.altSuppressAuthorSuite);

// to markdown
describeTestSuite_toMarkdown("to markdown", "to-md", MdastUtilCiteTests.toMarkdownTestSuite);