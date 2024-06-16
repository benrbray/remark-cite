import { type Root } from "hast";
import { type VFile } from "vfile";

import { SKIP, visitParents, VisitorResult } from 'unist-util-visit-parents'

export default function rehypeCite() {
  return function(tree: Root, file: VFile): void {
    visitParents(tree, 'element', function(element, parents): VisitorResult {
      return true;
    });
  }
}