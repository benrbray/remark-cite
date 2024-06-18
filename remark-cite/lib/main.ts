import { citeSyntax, CiteSyntaxOptions } from "@benrbray/micromark-extension-cite";
import { citeFromMarkdown, citeToMarkdown, CiteToMarkdownOptions } from "@benrbray/mdast-util-cite";
import type { Processor } from "unified";

////////////////////////////////////////////////////////////

export interface CitePluginOptions {
	syntax?     : Partial<CiteSyntaxOptions>,
	toMarkdown? : Partial<CiteToMarkdownOptions>
	// add extra options here, in addition to those for the syntax extension
}

export function citePlugin(this: Processor, options?: Partial<CitePluginOptions>): undefined {
	var settings = options || { syntax : {}, toMarkdown : {} };
  var data = this.data();

	const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = [])
  const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = [])
  const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = [])

  micromarkExtensions.push(citeSyntax(settings.syntax || {}));
  fromMarkdownExtensions.push(citeFromMarkdown);
  toMarkdownExtensions.push(citeToMarkdown(settings.toMarkdown || {}));
}

export default citePlugin;