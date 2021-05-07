declare module "mdast-util-to-markdown/lib/util/safe.js" {
	import { Context, SafeOptions } from "mdast-util-to-markdown";

	// as of (2021-05-07) this function had no exported typings
	function safe(context: Context, input: string, config: Partial<SafeOptions> ): string;
	export = safe
}