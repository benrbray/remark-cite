import { Root } from "hast";
import { VFile } from "vfile";

////////////////////////////////////////////////////////////////////////////////

type CSL = void;

////////////////////////////////////////////////////////////////////////////////

type RehypeCiteConfig = {
  /** Callback returning the CSL-JSON entry for a given citation key. */
  getCslJsonForKey: (key: string) => CSL;

  /** When `useComponents` is `true`, `rehype-cite` will use custom component
   * names for citation-related elements on the page.  For example:
   *   - `<CitationInline />
   *   - `<CitationBlock />`
   *   - `<Bibliography data={...} />`
   * When using `rehype-react` to render `hast` trees as `jsx` elements,
   * this allows custom user-defined citation components.
   * 
   * The default value is `false`, which outputs plain HTML. */
  targetMdx: boolean;

  /** 
   * When enabled, inline citations `[@citekey]` appearing alone in a
   * paragraph will be converted to block citations.
   */
  blockCitations: "enabled" | "disabled";
}

export const runRehypeCite = (config: RehypeCiteConfig) => {
  // returns a transformer that modifies the tree in-place
  return (tree: Root, file: VFile): void => {
    // traverse the hast syntax tree, collecting all cite-inline nodes
  }
}