/** @jsxImportSource hastscript */

import type { Root, Element as HastElement, ElementContent} from "hast";
import type { VFile } from "vfile";

import { CONTINUE, SKIP, visit, VisitorResult } from 'unist-util-visit';
import type { CiteItem } from "@benrbray/mdast-util-cite";

////////////////////////////////////////////////////////////////////////////////

import { BibLatexParser } from "biblatex-csl-converter"
import { EntryObject } from "./types";
import { formatter, formatBibString } from "./formatter/default";

////////////////////////////////////////////////////////////////////////////////

const formatEntry = (entry: EntryObject): HastElement => {
  return formatter(entry);
}

type FormattedCitation = {
  order: number,
  citeId: HastElement,
  citeBib: HastElement
}

////////////////////////////////////////////////////////////////////////////////

export type RehypeCiteOptions = { 
  bibFiles: string[]
}

export function rehypeCite(options: RehypeCiteOptions) {

  // biblatex-csl-converter
  let inputBib = options.bibFiles.join("\n\n");
  let parser = new BibLatexParser(inputBib, {processUnexpected: true, processUnknown: true})
  let bibJson = parser.parse();
  let bibEntries = Object.values(bibJson.entries) as EntryObject[];

  /* ---------------------------------------------------- */

  const getEntry = (key: string): EntryObject | null => {
    return bibEntries.find(entry => entry.entry_key === key) || null;
  }

  const processBibliography = (
    formatted: Partial<Record<string, FormattedCitation>>,
  ): HastElement => {
    const sorted = Object.entries(formatted).sort(([_k1, f1], [_k2, f2]) => { return f1!.order - f2!.order; });
    
    const formattedEntries: ElementContent[] = sorted.map(([_citeKey, fmt]) => {
      return {
        type: "element",
        tagName: "div",
        properties: { className: "bib-entry" },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: "bib-id" },
            children: [
              { type: "text", value: "[" },
              fmt!.citeId,
              { type: "text", value: "]" }
            ]
          },
          fmt!.citeBib
        ]
      }
    });

    const biblioTitle: HastElement = {
      type: "element",
      tagName: "div",
      properties: { "className" : "bib-title" },
      children: [{ type: "text", value: "Bibliography" }]
    };

    return {
      type: "element",
      tagName: "div",
      properties: { className: "rehype-cite-bib" },
      children: [biblioTitle, {
        type: "element",
        tagName: "div",
        properties: { className: "bib-entry-list" },
        children: formattedEntries
    }]
    }
  }

  // replaces the placeholder inline citation produced by remark-cite
  // with a nicely-formatted html produced by citeproc-js
  const processInlineCite = (
    formatted: Partial<Record<string, FormattedCitation>>,
    citeItems: CiteItem[],
    element: HastElement
  ) => {
    const entryIds: ElementContent[] = citeItems.map(ci => {
      const id = formatted[ci.key];
      if(id) { return id.citeId; }
      return { type: "text", value: `${ci.key}` };
    });

    element.children = [
      { type: "text", value: "["},
      ...entryIds.flatMap((e,i): ElementContent[] => {
        if(i === 0) { return [e]; }
        return [{ type: "text", value: ", " }, e];
      }),
      { type: "text", value: "]"},
    ];
  }

  const processBlockCite = (
    formatted: Partial<Record<string, FormattedCitation>>,
    citeItems: CiteItem[],
    parentElement: HastElement,
  ) => {
    const entryIds: ElementContent[] = citeItems.map(ci => {
      const id = formatted[ci.key];
      if(id) { return id.citeBib; }
      return { type: "text", value: `${ci.key}` };
    });

    parentElement.type = "element";
    parentElement.tagName = "div";
    parentElement.properties.className = "cite-block";
    parentElement.children = entryIds;
  };

  /**
   * Renders inline citations and bibliography entries for the given keys.
   */
  const formatCitations = (citeKeys: string[]): Partial<Record<string, FormattedCitation>> => {
    const result: Partial<Record<string, FormattedCitation>> = {};

    citeKeys.forEach((key, idx) => {
      // skip if this key has already been rendered
      if(key in result) { return; }

      // handle missing entries
      const citeEntry = getEntry(key);
      if(!citeEntry) {
        const citeId: HastElement = {
          type: "element",
          tagName: "span",
          properties: { className: "bib-id" },
          children: [{ type: "text", value: `${idx}` }]
        };
        const citeBib: HastElement = {
          type: "element",
          tagName: "div",
          properties: { className: "bib-error" },
          children: [{ type: "text", value: `${key}` }]
        };

        result[key] = {
          order: idx,
          citeId,
          citeBib
        };

        return;
      }

      // render full bibliography entry
      const citeBibString = formatBibString(citeEntry);

      const citeId: HastElement = {
        type: "element",
        tagName: "span",
        properties: {
          className: "bib-id",
          title: citeBibString
        },
        children: [{ type: "text", value: `${idx}` }]
      };

      const citeBibHast: HastElement = formatEntry(citeEntry);

      result[key] = {
        order: idx,
        citeId,
        citeBib: citeBibHast
      };
    });

    return result;
  }

  /* ---- transform ------------------------------------- */

  return function(tree: Root, _file: VFile): undefined {
    let citations: CiteItem[] = [];
    let citationsInline: { element: HastElement, isBlock: boolean, citeItems: CiteItem[] }[] = [];

    // traverse the hast syntax tree and collect all cite-inline nodes
    visit(tree, 'element', function(element, _index, _parent): VisitorResult {
      // look for elements marked with "cite-inline" class
      const classes = Array.isArray(element.properties.className)
        ? element.properties.className
        : [];
      const isCiteInline = classes.includes("cite-inline");
      if(!isCiteInline) { return CONTINUE; }
      
      // validate data-cite attribute
      const citeData = element.properties["dataCite"];
      if(!citeData) { return CONTINUE; }
      if(typeof citeData !== "string") { return CONTINUE; }

      const citeItems = JSON.parse(citeData) as CiteItem[];
      citations = citations.concat(citeItems);

      const isBlock = (!!_parent && _parent.type === "element" && _parent.tagName === "p" && _parent.children.length === 1);
      
      if(isBlock) {
        citationsInline.push({ element: _parent as HastElement, citeItems, isBlock });
      } else {
        citationsInline.push({ element, citeItems, isBlock });
      }

      return SKIP;
    });

    // generate inline citations and bibliography entries for all mentioned keys
    let formatted = formatCitations(citations.map(c => c.key));

    // insert inline citations into the hast tree
    citationsInline.forEach(({ element, isBlock, citeItems }) => {
      if(isBlock) { processBlockCite(formatted, citeItems, element);  }
      else        { processInlineCite(formatted, citeItems, element); }
    });

    // append the bibliography to the hast tree
    if(citations.length > 0 ) {
      const biblioElement = processBibliography(formatted);
      tree.children.push(
        biblioElement
      );
    }
  }
}

export default rehypeCite;