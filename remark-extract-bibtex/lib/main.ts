import type * as M from "mdast";
import type { Processor } from "unified";
import { SKIP, visit, VisitorResult } from 'unist-util-visit';
import { VFile } from "vfile";

// ensure that the declarations for `Vfile.data` defined by `remark-cite` are accessible
import type { } from "@benrbray/rehype-cite";

////////////////////////////////////////////////////////////////////////////////

export type ExtractBibtexOptions = {
	removeBibtex?: boolean
}

type ExtractBibtexConfig = {
  removeBibtex: boolean
}

const optionsToConfig = (options?: ExtractBibtexOptions): ExtractBibtexConfig => {
  const defaultConfig: ExtractBibtexConfig = {
    removeBibtex: true
  };

  const config = Object.assign(defaultConfig, options);
  return config;
}

////////////////////////////////////////////////////////////////////////////////

export function extractBibtexPlugin(this: Processor, options?: Partial<ExtractBibtexOptions>) {
	var config = optionsToConfig(options);

  return function (tree: M.Root, file: VFile) {
    const extractedBibtex: string[] = [];

    // traverse the mdast tree, collecting all bibtex code blocks
    visit(tree, 'code', (element, index, parent): VisitorResult => {
      if(element.lang !== "bibtex") { return; }

      extractedBibtex.push(element.value);

      // optionally delete bibtex code blocks
      if(config.removeBibtex) {
        // remove the current node from the tree
        // (see https://unifiedjs.com/learn/recipe/remove-node/)
        parent!.children.splice(index!, 1);

        // return a visitor action indicating that:
        //   * the removed node should not be traversed (`SKIP`)
        //   * the successor to this node can be found at `index`
        return [SKIP, index];
      }
    });

    // store extracted bibtex in vfile data
    if(file.data.extractedBibtex === undefined) {
      file.data.extractedBibtex = extractedBibtex;
    } else {
      file.data.extractedBibtex = file.data.extractedBibtex.concat(extractedBibtex);
    }
  }
}

export default extractBibtexPlugin;