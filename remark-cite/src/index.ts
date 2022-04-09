import { citeSyntax, CiteSyntaxOptions } from "@benrbray/micromark-extension-cite";
import { citeFromMarkdown, citeToMarkdown, CiteToMarkdownOptions } from "@benrbray/mdast-util-cite";

////////////////////////////////////////////////////////////

var warningIssued: boolean = false;

function remarkV13Warning(context: any): boolean {
	if (
		!warningIssued &&
		((context.Parser &&
		  context.Parser.prototype &&
		  context.Parser.prototype.blockTokenizers) ||
		  (context.Compiler &&
		   context.Compiler.prototype &&
		   context.Compiler.prototype.visitors))
	) {
		warningIssued = true
		console.warn(
			'[remark-cite] Warning: please upgrade to remark 13 to use this plugin'
		)
	}

	return warningIssued;
}

export interface CitePluginOptions {
	syntax     : Partial<CiteSyntaxOptions>,
	toMarkdown : Partial<CiteToMarkdownOptions>
	// add extra options here, in addition to those for the syntax extension
}

export default function citePlugin(this: any, options: Partial<CitePluginOptions> = {}) {
	var data = this.data()

	// warn for earlier versions
	remarkV13Warning(this);

	add('micromarkExtensions', citeSyntax(options.syntax || {}));
	add('fromMarkdownExtensions', citeFromMarkdown);
	add('toMarkdownExtensions', citeToMarkdown(options.toMarkdown || {}));

	function add(field: string, value: any) {
		if (data[field]) data[field].push(value)
		else data[field] = [value]
	}
}