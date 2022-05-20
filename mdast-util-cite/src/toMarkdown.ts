// mdast
import { Unsafe, Handle, Context } from "mdast-util-to-markdown";
import { safe } from 'mdast-util-to-markdown/lib/util/safe';

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
	 * When `false`, will not suppress authors in the output.
	 * 
	 * @default true
	 */
	enableAuthorSuppression: boolean;
	/**
	 * `micromark-extension-cite` stores the original Markdown source for each
	 * citation in the `value` property of each `InlineCiteNode`.  When this
	 * option is `true`, every citation node serializes to its `value`, rather
	 * than being reconstructed from `data.citeItems`.
	 * 
	 * This setting overrides all other options.
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
		enableAuthorSuppression: true,
		useNodeValue: false
	}, options);
	
	// TODO:  I don't fully understand what this does, but I did my
	// best to fill it in based on what I saw in other mdast utils
	// (e.g. https://github.com/syntax-tree/mdast-util-math/blob/main/to-markdown.js)
	const unsafe: Unsafe[] = [
		{ character: ',', inConstruct: ["citationKey"] },
		{ character: '@', inConstruct: ["citation"]    },
	]

	/** Replaces the citation node with `node.value`, without escaping. */
	function handler_useNodeValue(node: InlineCiteNode, _:Uni.Parent|null|undefined, context: Context): string {
		return node.value;
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
			const key = safe(context, item.key, { before: "@", after: "", encode: [], now: {column:0, line:0}, lineShift: 0 });
			exitKey();

			// be careful not to include a prefix for the first tiem when using alternative syntax 
			const prefix = (item.prefix && (!useAltSyntax || idx > 0)) ? safe(context, item.prefix, {before: "", after: "", encode: [], now: {column:0, line:0}, lineShift: 0}) : "";
			const suffix = item.suffix ? safe(context, item.suffix, {before: "", after: "", encode: [], now: {column:0, line:0}, lineShift: 0}) : "";
			const suppress = (settings.enableAuthorSuppression && item.suppressAuthor === true) ? "-" : "";

			if(idx === 0) {
				if(useAltSyntax) { return `@[${suppress}${key}${suffix}` }
				else { return `[${prefix}${suppress}@${key}${suffix}` }
			} else {
				return `;${prefix}${suppress}@${key}${suffix}`
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
