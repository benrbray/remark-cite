// mdast
import { Unsafe, Handle, Context } from "mdast-util-to-markdown";
import safe from 'mdast-util-to-markdown/lib/util/safe.js';

// unist
import * as Uni from "unist";

// project imports
import { InlineCiteNode } from './fromMarkdown';

////////////////////////////////////////////////////////////

export interface CiteToMarkdownOptions {
	/**
	 * When `true`, nodes with `altSyntax: true` will be rendered in standard
	 * pandoc syntax `[@cite]` rather than alternative syntax `@[cite]`.  
	 * 
	 * @default false
	 */
	standardizeAltSyntax: boolean;
	/**
	 * `micromark-extension-cite` stores the original Markdown source for each
	 * citation in the `value` property of each `InlineCiteNode`.  When this
	 * option is `true`, every citation node serializes to its `value`, rather
	 * than being reconstructed from `data.citeItems`.
	 * 
	 * This setting overrides the `standardizeAltSyntax` option.
	 * 
	 * @default false
	 */
	useNodeValue: boolean;
}

////////////////////////////////////////////////////////////

/**
 * @warning Does no validation.  Garbage in, garbage out.
 */
export function citeToMarkdown (options: Partial<CiteToMarkdownOptions> = {}) {
	// fill in option defaults
	const settings: CiteToMarkdownOptions = Object.assign({
		standardizeAltSyntax: false,
		useNodeValue: false
	}, options);
	
	// TODO:  I don't fully understand what this does, but I did my
	// best to fill it in based on what I saw in other mdast utils
	// (e.g. https://github.com/syntax-tree/mdast-util-math/blob/main/to-markdown.js)
	const unsafe: Unsafe[] = [
		{ character: ',', inConstruct: ["citationKey"] },
		{ character: '@', inConstruct: ["citation"]    },
	]

	/** Returns an escaped representation of `node.value`. */
	function handler_useNodeValue(node: InlineCiteNode, _:Uni.Parent|null|undefined, context: Context): string {
		const exit = context.enter("citation");
		const nodeValue = safe(context, node.value, {});
		exit();
		return nodeValue;
	}

	/** Reconstructs the citation using data attached to the `InlineCiteNode`. */
	function handler_default(node: InlineCiteNode, _:Uni.Parent|null|undefined, context: Context): string {
		// handle missing items
		if(node.data.citeItems.length === 0) {
			return "";
		}

		// decide whether to use alt-syntax or pandoc-syntax
		const firstItem = node.data.citeItems[0];
		const useAltSyntax: boolean
			=  !settings.standardizeAltSyntax
			&& (node.data.altSyntax === true)
			&& (firstItem.prefix === undefined || firstItem.prefix === "") ;

		// escape and reconstruct data
		const exit = context.enter('citation');
		const safeItems = node.data.citeItems.map((item, idx) => {
			const exitKey = context.enter("citationKey");
			const key = safe(context, item.key, { before: "@" });
			exitKey();

			const prefix = (item.prefix && (!useAltSyntax || idx > 0)) ? safe(context, item.prefix, {}) : "";
			const suffix = item.suffix ? safe(context, item.suffix, {}) : "";

			if(idx === 0) {
				if(useAltSyntax) { return `@[${key}${suffix}` }
				else { return `[${prefix}@${key}${suffix}` }
			} else {
				return `;${prefix}@${key}${suffix}`
			} 
		});
		exit();
		return safeItems.join("") + ']';
	};

	const handler = settings.useNodeValue ? handler_useNodeValue : handler_default;

	return {
		unsafe: unsafe,
		handlers: {
			// as of (2021-05-07), the typings for Handle do not reflect
			// that the handler will be passed nodes of a specific type
			cite: handler as unknown as Handle
		}
	}
}