// testing
import assert from "assert";
import { isEqual } from "lodash";

console.log("hello, mocha!");

// micromark
import micromark from "micromark/lib";

// project imports
import { citeExtension, CiteSyntaxOptions, html } from '..';

////////////////////////////////////////////////////////////

interface TestCaseSimple {
	options?: Partial<CiteSyntaxOptions>,
	description?: string,
	markdown: string,
	html: string,
}

interface TestSuite {
	/** Default options for the entire test suite.  Can be overridden by individual cases. */
	options?: Partial<CiteSyntaxOptions>,
	cases: TestCaseSimple[],
}

//// TEST CASES: PANDOC SYNTAX /////////////////////////////

/**
 * We expect to match Pandoc on these test cases.
 * The HTML for these test cases was generated by Pandoc.
 */
const pandocMatchSuite: TestSuite = { cases: [
	// valid input for single citation input
	{
		markdown: "[@author:1990]",
		html: '<p><span class="citation" data-cites="author:1990">[@author:1990]</span></p>'
	},{
		markdown: "[prefix @author:1990]",
		html: '<p><span class="citation" data-cites="author:1990">[prefix @author:1990]</span></p>'
	},{
		markdown: "[@author:1990 suffix]",
		html: '<p><span class="citation" data-cites="author:1990">[@author:1990 suffix]</span></p>'
	},{
		markdown: "[see @author:1990:kebab-case, pp. 89-90]",
		html: '<p><span class="citation" data-cites="author:1990:kebab-case">[see @author:1990:kebab-case, pp. 89-90]</span></p>'
	},
	// valid input for multiple citations
	{
		markdown: "[@author:1990; @author:2001]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001">[@author:1990; @author:2001]</span></p>'
	},{
		markdown: "[@author:1990;@author:2001]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001">[@author:1990;@author:2001]</span></p>'
	},{
		markdown: "[@author:1990; @author:2001; @author:2017 ]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001 author:2017">[@author:1990; @author:2001; @author:2017 ]</span></p>'
	},{
		markdown: "[see @author:1990, sec. 3.1; and also @author:2001 on page 77 ]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001">[see @author:1990, sec. 3.1; and also @author:2001 on page 77 ]</span></p>'
	},{
		markdown: "[see @author:1990, sec. 3.1; and also @author:2001 on page 77 ; but don't forget @author:2017 chapter 5]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001 author:2017">[see @author:1990, sec. 3.1; and also @author:2001 on page 77 ; but don\'t forget @author:2017 chapter 5]</span></p>'
	},
	// valid input with surrounding text
	{
		markdown: "lorem upsum dolor [@author:1990] sit amet",
		html: '<p>lorem upsum dolor <span class="citation" data-cites="author:1990">[@author:1990]</span> sit amet</p>'
	},{
		markdown: "lorem ipsum dolor[@author:1990]sit amet",
		html: '<p>lorem ipsum dolor<span class="citation" data-cites="author:1990">[@author:1990]</span>sit amet</p>'
	},{
		markdown: "lorem ipsum dolor [see @author:1990, sec. 3.1; and also @author:2001 on page 77 ; but don't forget @author:2017 chapter 5] sit amet",
		html: '<p>lorem ipsum dolor <span class="citation" data-cites="author:1990 author:2001 author:2017">[see @author:1990, sec. 3.1; and also @author:2001 on page 77 ; but don\'t forget @author:2017 chapter 5]</span> sit amet</p>'
	},
	// weird spacing
	{
		markdown: "[ @author:1990]",
		html: '<p><span class="citation" data-cites="author:1990">[ @author:1990]</span></p>'
	},{
		markdown: "[@author:1990 ]",
		html: '<p><span class="citation" data-cites="author:1990">[@author:1990 ]</span></p>'
	},{
		markdown: "[@author:1990;@author]",
		html: '<p><span class="citation" data-cites="author:1990 author">[@author:1990;@author]</span></p>'
	},
	// various kinds of malformed input
	{
		markdown: "[author:1990]",
		html: '<p>[author:1990]</p>'
	},{
		markdown: "[@ author:1990]",
		html: '<p>[@ author:1990]</p>'
	},{
		markdown: "[@,] [@] [prefix @, suffix]",
		html: '<p>[@,] [@] [prefix @, suffix]</p>'
	},{
		markdown: "[@ author:1990]",
		html: '<p>[@ author:1990]</p>'
	},{
		markdown: "[@ author:1990]",
		html: '<p>[@ author:1990]</p>'
	},{
		markdown: "[@cite1 @cite2]",
		html: '<p><span class="citation" data-cites="cite1">[@cite1 @cite2]</span></p>'
	},{
		markdown: "[-",
		html: '<p>[-</p>',
	},{
		markdown: "[@",
		html: '<p>[@</p>',
	},{
		markdown: "[-@",
		html: '<p>[-@</p>',
	},{
		markdown: "[-@;",
		html: '<p>[-@;</p>',
	},
	// make sure we don't treat emails as citations
	{
		markdown: "contact [user@domain.com] for more information",
		html: '<p>contact [user@domain.com] for more information</p>'
	},{
		markdown: "contact user@domain.com for more information",
		html: '<p>contact user@domain.com for more information</p>'
	},{
		markdown: "contact [user @domain.com] for more information",
		html: '<p>contact <span class="citation" data-cites="domain.com">[user @domain.com]</span> for more information</p>'
	},
	// escape pandoc syntax
	{
		description: "escape first at symbol",
		markdown: "[\\@escape]",
		html: '<p>[@escape]</p>',
	},
	// check that suppress author syntax parses
	// (suppression only appears in AST)
	{
		description: "author suppression",
		markdown: "[-@author1990]",
		html: '<p><span class="citation" data-cites="author1990">[-@author1990]</span></p>',
	},{
		description: "author suppression",
		markdown: "[see @author:1990, sec. 3.1; and also -@author:2001 on page 77 ; but don't forget -@author:2017 chapter 5]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001 author:2017">[see @author:1990, sec. 3.1; and also -@author:2001 on page 77 ; but don\'t forget -@author:2017 chapter 5]</span></p>',
	}
] };


/**
 * We expect to diverge from Pandoc on these test cases.
 * The HTML for these cases was generated manually.
 */
const pandocExceptCases : (TestCaseSimple & { pandoc: string})[] = [
	// for these cases, we expect to diverge from pandoc
	// due to implementation details of the tokenizer
	{
		markdown: "[@aut\nhor:1990]",
		html: '<p>[@aut\nhor:1990]</p>',
		pandoc: '<p><span class="citation" data-cites="aut">[@aut hor:1990]</span></p>'
	},
	// for these cases, we expect to diverge from pandoc because
	// bracket-less citations like @author1990 are not yet implemented
	{
		markdown: "[@author:1990;]",
		html: '<p>[@author:1990;]</p>',
		pandoc: '<p>[<span class="citation" data-cites="author:1990">@author:1990</span>;]</p>'
	},{
		markdown: "[@author:1990;bad]",
		html: '<p>[@author:1990;bad]</p>',
		pandoc: '<p>[<span class="citation" data-cites="author:1990">@author:1990</span>;bad]</p>'
	},{
		markdown: "[@eof ",
		html: '<p>[@eof</p>',
		pandoc: '<p>[<span class="citation" data-cites="re">@re</span></p>'
	},{
		markdown: "[@eof ;",
		html: '<p>[@eof ;</p>',
		pandoc: '<p>[<span class="citation" data-cites="eof">@eof</span> ;</p>'
	},{
		markdown: "[@eof ; pre",
		html: '<p>[@eof ; pre</p>',
		pandoc: '<p>[<span class="citation" data-cites="eof">@eof</span> ; pre</p>'
	},
	// missing at symbol (pandoc seems to disallow `;` in prefix, but we don't)
	{
		description: "missing at symbol in multi-citation",
		markdown: "[author:1990; @author:2001; @author:2017]",
		html: '<p><span class="citation" data-cites="author:2001 author:2017">[author:1990; @author:2001; @author:2017]</span></p>',
		pandoc: '<p>[author:1990; <span class="citation" data-cites="author:2001">@author:2001</span>; <span class="citation" data-cites="author:2017">@author:2017</span>]</p>'
	},
	// escape pandoc syntax
	{
		description: "escape second at symbol",
		markdown: "[@escape; and \\@escape]",
		html: '<p>[@escape; and @escape]</p>',
		pandoc: '<p>[<span class="citation" data-cites="escape">@escape</span>; and @escape]</p>'
	}
]

const pandocExceptSuite = { cases: pandocExceptCases };

//// TEST CASES: ALTERNATIVE SYNTAX ////////////////////////

/**
 * We expect to match Pandoc on these test cases.
 * The HTML for these test cases was generated by Pandoc.
 */
const altSyntaxCases: TestCaseSimple[] = [
	// valid input for single citation input
	{
		markdown: "@[author:1990]",
		html: '<p><span class="citation" data-cites="author:1990">@[author:1990]</span></p>'
	},{
		markdown: "@[cite1 @cite2]",
		html: '<p><span class="citation" data-cites="cite1">@[cite1 @cite2]</span></p>'
	},{
		markdown: "@[author:1990 suffix]",
		html: '<p><span class="citation" data-cites="author:1990">@[author:1990 suffix]</span></p>'
	},
	// valid input for multiple citations
	{
		markdown: "@[author:1990; @author:2001]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001">@[author:1990; @author:2001]</span></p>'
	},{
		markdown: "@[author:1990, sec. 3.1; and also @author:2001 on page 77 ; but don't forget @author:2017 chapter 5]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001 author:2017">@[author:1990, sec. 3.1; and also @author:2001 on page 77 ; but don\'t forget @author:2017 chapter 5]</span></p>'
	},
	// valid input with surrounding text
	{
		markdown: "lorem upsum dolor @[author:1990] sit amet",
		html: '<p>lorem upsum dolor <span class="citation" data-cites="author:1990">@[author:1990]</span> sit amet</p>'
	},{
		markdown: "lorem ipsum dolor @[author:1990, sec. 3.1; and also @author:2001 on page 77 ; but don't forget @author:2017 chapter 5] sit amet",
		html: '<p>lorem ipsum dolor <span class="citation" data-cites="author:1990 author:2001 author:2017">@[author:1990, sec. 3.1; and also @author:2001 on page 77 ; but don\'t forget @author:2017 chapter 5]</span> sit amet</p>'
	},
	// weird spacing
	{
		markdown: "@[ author:1990]",
		html: '<p>@[ author:1990]</p>'
	},{
		markdown: "@[author:1990 ]",
		html: '<p><span class="citation" data-cites="author:1990">@[author:1990 ]</span></p>'
	},
	// various kinds of malformed input
	{
		markdown: "@[eof ]",
		html: '<p><span class="citation" data-cites="eof">@[eof ]</span></p>'
	},{
		markdown: "@[eof ",
		html: '<p>@[eof</p>'
	},{
		markdown: "@[eof ;",
		html: '<p>@[eof ;</p>'
	},{
		markdown: "@[eof ; pre ",
		html: '<p>@[eof ; pre</p>'
	},
	// make sure we don't treat emails as citations
	{
		markdown: "contact [user@domain.com] for more information",
		html: '<p>contact [user@domain.com] for more information</p>'
	},{
		markdown: "contact user@domain.com for more information",
		html: '<p>contact user@domain.com for more information</p>'
	},{
		markdown: "contact [user @domain.com] for more information",
		html: '<p>contact <span class="citation" data-cites="domain.com">[user @domain.com]</span> for more information</p>'
	},
	// escape alternative syntax
	{
		description: "escape at symbol",
		markdown: "\\@[escape]",
		html: '<p>@[escape]</p>'
	},{
		description: "escape at symbol",
		markdown: "@[escape; and \\@escape]",
		html: '<p>@[escape; and @escape]</p>'
	},
	// check that suppress author syntax parses
	// (suppression only appears in AST)
	{
		description: "author suppression",
		markdown: "@[-author:1990]",
		html: '<p><span class="citation" data-cites="author:1990">@[-author:1990]</span></p>',
	},{
		description: "author suppression",
		markdown: "@[author:1990, sec. 3.1; and also -@author:2001 on page 77 ; but don't forget -@author:2017 chapter 5]",
		html: '<p><span class="citation" data-cites="author:1990 author:2001 author:2017">@[author:1990, sec. 3.1; and also -@author:2001 on page 77 ; but don\'t forget -@author:2017 chapter 5]</span></p>',
	},{
		description: "author suppression with hyphenated name",
		markdown: "@[peyton-jones2001]",
		html: '<p><span class="citation" data-cites="peyton-jones2001">@[peyton-jones2001]</span></p>'
	}
];

const altSyntaxSuite: TestSuite = {
	cases: altSyntaxCases,
	options: {
		enableAltSyntax: true
	}
}

//// TEST CASES: PANDOC SYNTAX DISABLED ////////////////////

const noPandocCases: TestCaseSimple[] = [
	// valid input for single citation input
	{
		markdown: "[@author:1990]",
		html: '<p>[@author:1990]</p>'
	},{
		markdown: "[see @author:1990:kebab-case, pp. 89-90]",
		html: '<p>[see @author:1990:kebab-case, pp. 89-90]</p>'
	},
	// valid input for multiple citations
	{
		markdown: "pandoc is [@disabled **bold**]",
		html: '<p>pandoc is [@disabled <strong>bold</strong>]</p>'
	},{
		markdown: "[@author:1990; @author:2001; @author:2017 ]",
		html: '<p>[@author:1990; @author:2001; @author:2017 ]</p>'
	}
];

const noPandocSuite: TestSuite = {
	cases: noPandocCases,
	options: {
		enablePandocSyntax: false
	}
}

//// TEST CASES: ALT SYNTAX DISABLED ///////////////////////

const noAltCases: TestCaseSimple[] = [
	// single citation
	{
		markdown: "@[author:1990]",
		html: '<p>@[author:1990]</p>'
	},{
		markdown: "@[author:1990:kebab-case, pp. 89-90]",
		html: '<p>@[author:1990:kebab-case, pp. 89-90]</p>'
	},
	// multiple citations
	{
		markdown: "pandoc is @[**disabled**]",
		html: '<p>pandoc is @[<strong>disabled</strong>]</p>'
	},{
		description: "missing at symbol",
		markdown: "@[author:1990; @author:2001; @author:2017 ]",
		html: '<p>@<span class="citation" data-cites="author:2001 author:2017">[author:1990; @author:2001; @author:2017 ]</span></p>'
	}
];

const noAltSuite: TestSuite = {
	cases: noAltCases,
	options: {
		enableAltSyntax: false
	}
}

//// TEST CASES: INTERACTION W/ MARKDOWN SYNTAX ////////////

const syntaxConflictCases: TestCaseSimple[] = [
	{
		markdown: "**[@cite **suffix]",
		html: '<p>**<span class="citation" data-cites="cite">[@cite **suffix]</span></p>'
	}
]

const syntaxConflictSuite: TestSuite = {
	cases: syntaxConflictCases
}

////////////////////////////////////////////////////////////

function runTestSuite(contextMsg: string, descPrefix:string, testSuite: TestSuite): void {
	context(contextMsg, () => {

		let idx = 0;
		for(let testCase of testSuite.cases) {
			let desc = `[${descPrefix} ${("00" + (++idx)).slice(-3)}] ` + (testCase.description || "");
			it(desc, () => {
				let options = Object.assign({}, testSuite.options, testCase.options);
				let serialized = micromark(testCase.markdown, {
					extensions: [citeExtension(options)],
					htmlExtensions: [html()]
				});
				assert.strictEqual(serialized, testCase.html);
			});
		}
	});
}

////////////////////////////////////////////////////////////

describe('micromark-extension-cite', () => {

	runTestSuite("matches pandoc html5 output", "pandoc-match", pandocMatchSuite);
	runTestSuite("expected deviations from pandoc html5 output", "pandoc-except", pandocExceptSuite);
	runTestSuite("test interactions with markdown syntax", "syntax-conflict", syntaxConflictSuite);

	runTestSuite("alternate citation syntax", "alt-syntax", altSyntaxSuite);

	runTestSuite("options { enableAltSyntax: false }", "no-alt", noAltSuite);
	runTestSuite("options { enablePandocSyntax: false }", "no-pandoc", noPandocSuite);
	
})