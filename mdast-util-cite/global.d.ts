// /**
//  * As of (2021-05-05) the types for this module are very incompatible with
//  * TypeScript, and cause mysterious errors at compile time like.
//  */
// declare module "unist-util-visit" {
// 	import { Node, Parent } from "unist";

// 	export type Visitor<V extends Node> = (node: V, index: number|null, parent: Parent|null) => void;
// 	export const visit: <T extends Node>(tree: Node, test: string, visitor: Visitor<T>) => void;
// }