import { CiteItem } from "@benrbray/mdast-util-cite";
import { HastElement } from "@lib/types";
import { Root } from "hast";

////////////////////////////////////////////////////////////////////////////////

export type CitationHole = {
  /** The rendered citation will replace the contents of this element. */
  element: HastElement,
  /** Block citations are rendered as full bibliography entries. */
  isBlock: boolean,
  /** The items referenced by this citation. */
  citeItems: CiteItem[]
};

export const visitCitations = (element: HastElement, parent: HastElement | Root | undefined): CitationHole|null => {
  // look for elements marked with "cite-inline" class
  const classes = Array.isArray(element.properties.className)
    ? element.properties.className
    : [];
  const isCiteInline = classes.includes("cite-inline");
  if(!isCiteInline) { return null; }
  
  // validate data-cite attribute
  const citeData = element.properties["dataCite"];
  if(!citeData) { return null; }
  if(typeof citeData !== "string") { return null; }

  const citeItems = JSON.parse(citeData) as CiteItem[];
  
  const isBlock = (!!parent
    && parent.type === "element"
    && parent.tagName === "p"
    && parent.children.length === 1
  );
  
  if(isBlock) { return { element: parent,  citeItems, isBlock }; }
  else        { return { element: element, citeItems, isBlock }; }
}