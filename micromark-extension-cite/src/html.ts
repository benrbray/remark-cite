import { Token } from "micromark/dist/shared-types";

////////////////////////////////////////////////////////////

type CiteItemInfo = {
	items: {
		key?: string
	}[]
}

type StackType = CiteItemInfo[];

export type CiteHtmlOptions = {};

////////////////////////////////////////////////////////////

/**
 * Converts a token stream produced by the syntax extension
 * directly to HTML, with no intermediate AST.  For example,
 *
 * These functions rely on some unknown global state, so
 * if the input token stream is invalid, this function will
 * likely produce mysterious, difficult-to-diagnose errors.
 */
export function citeHtml(this: any, opts: CiteHtmlOptions = {}) {

	// ---- inlineCite ---------------------------------- //

	function enterInlineCite(this:any): void {
		let stack: StackType|undefined = this.getData('inlineCiteStack');
		if (!stack) this.setData('inlineCiteStack', (stack = []));
		stack.push({ items: [] });
	}

	function exitInlineCite(this:any, token: Token): void {
		const inlineCite: CiteItemInfo = this.getData('inlineCiteStack').pop();

		// gather citation data
		const classNames = "citation";
		const citeItems = inlineCite?.items || [];
		const citeKeys = citeItems.map(item => item.key).join(" ");
		const citeText = this.sliceSerialize(token);

		// html output
		this.tag(`<span class="${classNames}" data-cites="${citeKeys}">`);
		this.raw(citeText);
		this.tag('</span>');
	}

	// ---- citeItemKey --------------------------------- //

	function exitCiteItemKey(this:any, token: Token): void {
		const citeKey = this.sliceSerialize(token);
		const stack: StackType = this.getData('inlineCiteStack');

		const current = top(stack);
		current.items.push({ key: citeKey });
	}

	function top<T>(stack: T[]): T {
		return stack[stack.length - 1];
	}

	// -------------------------------------------------- //

	return {
		enter : {
			inlineCite: enterInlineCite,
		},
		exit : {
			inlineCite: exitInlineCite,
			citeItemKey: exitCiteItemKey,
		}
	};
}