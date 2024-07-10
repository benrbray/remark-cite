/** @jsxImportSource hastscript */

import type { Root, Element as HastElement} from "hast";
import type { VFile } from "vfile";

import { CONTINUE, EXIT, SKIP, visit, VisitorResult } from 'unist-util-visit';
import { CiteItem } from "@benrbray/mdast-util-cite";

////////////////////////////////////////////////////////////////////////////////

import { BibLatexParser } from "biblatex-csl-converter"
import { EntryObject, Formatter } from "./types";
import { formatter } from "./formatter/default";

////////////////////////////////////////////////////////////////////////////////

const formatEntry = (entry: EntryObject): HastElement => {
  return formatter(entry);
}

////////////////////////////////////////////////////////////////////////////////

export type RehypeCiteOptions = { 
  bibFiles: string[]
}

export function rehypeCite(options: RehypeCiteOptions) {

  // const references = new Cite(options.bibFiles);

  // biblatex-csl-converter
  let inputBib = options.bibFiles.join("\n\n");
  let parser = new BibLatexParser(inputBib, {processUnexpected: true, processUnknown: true})
  let bibJson = parser.parse();
  let bibEntries = Object.values(bibJson.entries) as EntryObject[];
  console.log(bibEntries);

  // const config = plugins.config.get('@csl');
  // const citeFormat = "apa"; // TODO (citation-js fetches by http request)
  // const citeproc = config.engine(references.data, citeFormat, "en-US", 'html');

  // console.log(citeproc);

  /* ---------------------------------------------------- */

  const getEntry = (key: string): EntryObject | null => {
    return bibEntries.find(entry => entry.entry_key === key) || null;
  }

  // const renderBibliography = (citeItems: CiteItem[]): HastElement => {
  //   const biblioTitle: HastElement = {
  //     type: "element",
  //     tagName: "div",
  //     properties: { "className" : "biblio-title" },
  //     children: [{ type: "text", value: "Bibliography" }]
  //   };

  //   const entries: HastElement[] = citeItems.flatMap(ci => {
  //     const entry = getEntry(ci.key);

  //     if(!entry) { return []; }

  //     return formatEntry(entry);
  //   });

  //   const biblioElement: HastElement = {
  //     type: "element",
  //     tagName: "div",
  //     properties: {},
  //     children: [biblioTitle, ...entries]
  //   }

  //   return biblioElement;
  // }

  const processBibliography = (citeItems: CiteItem[]): HastElement => {
    const formattedEntries = bibEntries.map(e => formatEntry(e ));

    const biblioTitle: HastElement = {
      type: "element",
      tagName: "div",
      properties: { "className" : "biblio-title" },
      children: [{ type: "text", value: "Bibliography" }]
    };

    return {
      type: "element",
      tagName: "div",
      properties: {},
      children: [biblioTitle, ...formattedEntries]
    }
  }

  // replaces the placeholder inline citation produced by remark-cite
  // with a nicely-formatted html produced by citeproc-js
  const processInlineCite = (
    citeItems: CiteItem[],
    element: HastElement,
    parent: HastElement | Root | undefined
  ) => {
    const entryIds = citeItems.map(ci => ci.key);
    // const citation = references.format("citation", { entry: entryIds }) as string;
    element.children = [{ type: "text", value: entryIds.join("; ") }];

    // const result = citeproc.processCitationCluster(
    //   {
    //     citationItems: citeItems.map(ci => ({
    //       id: ci.key,
    //       prefix: ci.prefix,
    //       suffix: ci.suffix,
    //       "suppress-author": ci.suppressAuthor
    //     })),
    //     properties: {
    //       noteIndex: 0
    //     }
    //   },
    //   [],
    //   []
    // );

    // console.log(result);
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