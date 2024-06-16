import "micromark-util-types";

declare module 'micromark-util-types' {
  interface TokenTypeMap {
    citeAuthorSuppress: "citeAuthorSuppress",
    citeItem: "citeItem",
    citeItemKey: "citeItemKey",
    citeItemPrefix: "citeItemPrefix",
    citeItemSep: "citeItemSep",
    citeItemSymbol: "citeItemSymbol",
    citeItemSuffix: "citeItemSuffix",
    inlineCite: "inlineCite",
    inlineCiteMarker: "inlineCiteMarker",
    inlineCiteMarker_alt: "inlineCiteMarker_alt",
  }
}