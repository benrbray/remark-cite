import { citeSyntax, CiteSyntaxOptions } from "@benrbray/micromark-extension-cite";
import { citeFromMarkdown, citeToMarkdown } from "@benrbray/mdast-util-cite";

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

export interface CitePluginOptions extends CiteSyntaxOptions {
	// add extra options here, in addition to those for the syntax extension
}

export function citePlugin(this: any, options: Partial<CitePluginOptions>) {
	var data = this.data()

	// warn for earlier versions
	remarkV13Warning(this);

	add('micromarkExtensions', citeSyntax(options));
	add('fromMarkdownExtensions', citeFromMarkdown);
	add('toMarkdownExtensions', citeToMarkdown);

	function add(field: string, value: any) {
		if (data[field]) data[field].push(value)
		else data[field] = [value]
	}
}