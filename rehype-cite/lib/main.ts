/** @jsxImportSource hastscript */

import type { Root, Element as HastElement, ElementContent} from "hast";
import type { VFile } from "vfile";

import { CONTINUE, SKIP, visit, VisitorResult } from 'unist-util-visit';
import type { CiteItem } from "@benrbray/mdast-util-cite";

////////////////////////////////////////////////////////////////////////////////

import { BibLatexParser } from "biblatex-csl-converter"
import { EntryObject } from "./types";
import { formatter, formatBibString } from "./formatter/default";
import { CitationHole, visitCitations } from "./process/citationVisitor";

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
  bibFiles: string[],
  detectBibTex?: {
    /**
     * When `true`, `rehype-cite` will attempt to parse bibliographic
     * data from any BibTeX code blocks found in the `hast` tree.
     */
    enabled: boolean,
    /** When `true`, detected BibTeX code blocks will be removed. */
    removeBibTex: boolean
  }
}

type RehypeCiteConfig = {
  bibFiles: string[],
  detectBibTex: {
    enabled: boolean,
    removeBibTex: boolean
  }
}

/**
 * Convert the user-friendly `RehypeCiteOptions` into a more explicit config
 * object.  The main difference is that any missing _options_ must be filled
 * in with a default value to create a _config_.
 *
 * This distinction between _options_ and _config_ allows for the package API
 * to change without breaking the implementation, and vice-versa.
 */
const optionsToConfig = (options: RehypeCiteOptions): RehypeCiteConfig => {
  const detectBibTex = options.detectBibTex || { enabled: true, removeBibTex: true };

  return {
    bibFiles: options.bibFiles,
    detectBibTex
  };
}

export function rehypeCite(options: RehypeCiteOptions) {

  let config = optionsToConfig(options);
  return runRehypeCite(config);

}

export default rehypeCite;

////////////////////////////////////////////////////////////////////////////////

declare module 'vfile' {
  interface DataMap {
    extractedBibtex?: string[]
  }
}

////////////////////////////////////////////////////////////////////////////////

/**
 * Uses `biblatex-csl-converter` to parse
 * BibTeX strings into structured JSON.
 */
const parseBibtex = (bibtex: string[]): EntryObject[] => {
  if(bibtex.length === 0) { return []; }

  let input = bibtex.join("\n\n");
  let parser = new BibLatexParser(input, { processUnexpected: true, processUnknown: true });
  let bibJson = parser.parse();
  return Object.values(bibJson.entries) as EntryObject[];
}

////////////////////////////////////////////////////////////////////////////////

const getEntry = (entries: EntryObject[], key: string): EntryObject | null => {
  return entries.find(entry => entry.entry_key === key) || null;
}

/**
 * Replaces the placeholder citation from `remark-cite`
 * with a fully-rendered inline citation.
 */
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

/**
 * Replaces the placeholder citation from `remark-cite`
 * with a fully-rendered block citation.
 */
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
  parentElement.properties.className = ["cite-block"];
  parentElement.children = entryIds;
};

const runRehypeCite = (config: RehypeCiteConfig) => {

  let baseBibEntries = parseBibtex(config.bibFiles);

  /* ---------------------------------------------------- */

  const processBibliography = (
    formatted: Partial<Record<string, FormattedCitation>>,
  ): HastElement => {
    const sorted = Object.entries(formatted).sort(([_k1, f1], [_k2, f2]) => { return f1!.order - f2!.order; });
    
    const formattedEntries: ElementContent[] = sorted.map(([_citeKey, fmt]) => {
      return {
        type: "element",
        tagName: "div",
        properties: { className: ["bib-entry"] },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["bib-id"] },
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
      properties: { "className" : ["bib-title"] },
      children: [{ type: "text", value: "Bibliography" }]
    };

    return {
      type: "element",
      tagName: "div",
      properties: { className: ["rehype-cite-bib"] },
      children: [biblioTitle, {
        type: "element",
        tagName: "div",
        properties: { className: ["bib-entry-list"] },
        children: formattedEntries
    }]
    }
  }

  /**
   * Renders inline citations and bibliography entries for the given keys.
   */
  const formatCitations = (
    bibEntries: EntryObject[],
    citeKeys: string[]
  ): Partial<Record<string, FormattedCitation>> => {
    const result: Partial<Record<string, FormattedCitation>> = {};

    citeKeys.forEach((key, idx) => {
      // skip if this key has already been rendered
      if(key in result) { return; }

      // handle missing entries
      const citeEntry = getEntry(bibEntries, key);
      if(!citeEntry) {
        const citeId: HastElement = {
          type: "element",
          tagName: "span",
          properties: { className: ["bib-id"] },
          children: [{ type: "text", value: `${idx}` }]
        };
        const citeBib: HastElement = {
          type: "element",
          tagName: "div",
          properties: { className: ["bib-error"] },
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
          className: ["bib-id"],
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

  return function(tree: Root, file: VFile): undefined {

    // check the `VFile.data.extractedBibtex` field for extra reference entries
    // which should be used when rendering citations for this document
    // (this allows other plugins to influence the behavior of `rehype-cite`)
    const extractedBibtex: string[] = file.data.extractedBibtex || [];

    // traverse the hast syntax tree, collecting all cite-inline nodes
    let citations: CiteItem[] = [];
    let citationsInline: CitationHole[] = [];
    visit(tree, 'element', (element, _index, parent): VisitorResult => {
      // look for citation `hast` nodes produced by `remark-cite`
      const citeHole = visitCitations(element, parent as HastElement);
      if(citeHole !== null) {
        citations = citations.concat(citeHole.citeItems);
        citationsInline.push(citeHole);
      }

      if(citeHole === null) {
        return CONTINUE;
      } else {
        return SKIP;
      }
    });

    // generate inline citations and bibliography entries for all mentioned keys
    let extractedBibEntries = parseBibtex(extractedBibtex);
    let formatted = formatCitations(baseBibEntries.concat(extractedBibEntries), citations.map(c => c.key));

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