import type { Root, Element as HastElement} from "hast";
import type { VFile } from "vfile";

import { CONTINUE, EXIT, SKIP, visit, VisitorResult } from 'unist-util-visit';
import { CiteItem } from "@benrbray/mdast-util-cite";

////////////////////////////////////////////////////////////////////////////////

import { Cite, plugins } from "@citation-js/core";
import "@citation-js/plugin-csl";
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-bibjson";

////////////////////////////////////////////////////////////////////////////////

export type RehypeCiteOptions = { 
  bibFiles: string[]
}

export function rehypeCite(options: RehypeCiteOptions) {

  const references = new Cite(options.bibFiles);

  const config = plugins.config.get('@csl');
  // const citeproc = config.engine(citations.data, citeFormat, lang, 'html')

  /* ---------------------------------------------------- */

  const makeBiblioElement = (citeItems: CiteItem[]) => {
    const biblioTitle: HastElement = {
      type: "element",
      tagName: "div",
      properties: { "className" : "biblio-title" },
      children: [{ type: "text", value: "Bibliography" }]
    };

    const entries: HastElement[] = citeItems.map(ci => {
      return {
        type: "element",
        tagName: "div",
        properties: { "className" : "biblio-entry" },
        children: [{ type: "text", value: ci.key }]
      }
    });

    const biblioElement: HastElement = {
      type: "element",
      tagName: "div",
      properties: {},
      children: [biblioTitle, ...entries]
    }

    return biblioElement;
  }

  const processBibliography = (citeItems: CiteItem[]) => {
    return makeBiblioElement(citeItems);
  }

  // replaces the placeholder inline citation produced by remark-cite
  // with a nicely-formatted html produced by citeproc-js
  const processInlineCite = (
    citeItems: CiteItem[],
    element: HastElement,
    parent: HastElement | Root | undefined
  ) => {
    const entryIds = citeItems.map(ci => ci.key);
    const citation = references.format("citation", { entry: entryIds }) as string;
    element.children = [{ type: "text", value: citation }];

    
  }

  /* ---- transform ------------------------------------- */

  return function(tree: Root, file: VFile): undefined {
    let citations: CiteItem[] = [];

    visit(tree, 'element', function(element, index, parent): VisitorResult {
      // look for elements marked with "cite-inline" class
      const classes = Array.isArray(element.properties.className)
        ? element.properties.className
        : [];
      const isCiteInline = classes.includes("cite-inline");
      if(!isCiteInline) { return CONTINUE; }
      
      // validate data-cite attribute
      const citeData = element.properties["data-cite"];
      if(!citeData) { return CONTINUE; }
      if(typeof citeData !== "string") { return CONTINUE; }

      const citeItem = JSON.parse(citeData) as CiteItem[];
      citations = citations.concat(citeItem);

      // create inline citation
      processInlineCite(citeItem, element, parent);
      // element.children = [{ type: "text", value: "lololol" }];

      return SKIP;
    });

    if(citations.length > 0 ) {
      const biblioElement = processBibliography(citations);
      tree.children.push(
        biblioElement
      );
    }
  }
}

export default rehypeCite;