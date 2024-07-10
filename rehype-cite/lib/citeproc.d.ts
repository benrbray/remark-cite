declare module "citeproc" {
  type Id = string|number;

  /**
   * An __item__ is a single bundle of metadata for a source to be referenced.
   * See the CSL Specification for details on the fields available on an item,
   * and the CSL-JSON chapter of the `citeproc-js` manual for the format of
   * specific field types.
   */
  type Item = {
    id: Id,
    type: unknown
  }

  /**
   * A __citation__ is a set of one or more items, optionally supplemented
   * by locator information, prefixes, or suffixes supplied by the user.
   */

  /**
   * The processor maintains a stateful **registry** of details on each item
   * submitted for processing.  Registry entries are maintained automatically,
   * and cover matters such as disambiguation parameters, sort sequence, and
   * the first reference in which an item occurs.
   */

  /**
   * __Citable items__ are those meant for inclusion
   * only if used in one or more citations.
   */

   /**
    * __Uncited items__ are those meant for inclusion
    * regardless of whether they are used in a citation.
    */

  type Label = unknown
  
  type CiteItem = {
    id: Id,
    /**
     * a string identifying a page number or other pinpoint location or range
     * within the resource */
    locator?: string,
    /**
     * a label type, indicating whether the locator is to a page, a chapter, or
     * other subdivision of the target resource. Valid labels are defined in the
     * CSL specification. */
    label?: Label,
    /** a string to print before this cite item */
    prefix?: string,
    /** a string to print after this cite item */
    suffix?: string,
    /** if true, author names will not be included
     * in the citation output for this cite. */
    "suppress-author"?: boolean,
    /** if true, only the author name will be included in the citation output
     *  for this cite – this optional parameter provides a means for certain
     * demanding styles that require the processor output to be divided between
     * the main text and a footnote. */
    "author-only"?: boolean
  }

  type CitationObject = {
    citationItems : CiteItem[]
    properties : {
      noteIndex: number
    }
  }

  type CSL = import("./csl-data").CSL;

  export namespace CSL {

    /**
     * * An __item__ is a single bundle of metadata for a source to be
     *   referenced. See the CSL Specification for details on the fields
     *   available on an item, and the CSL-JSON chapter of the `citeproc-js`
     *   manual for the format of specific field types. Every item must have an
     *   `id` and a `type`.
     */
    declare class Engine {
      /**
      * Refreshes the registry with a designated set of **citable** items.
      * Citable items not listed in the argument are removed from the registry.
      */
      updateItems(idList: Id[]): void;

      /**
      * Refreshes the registry with a designated set of **uncited** items.
      * Uncited items not listed in the argument are removed from the registry.
      */
      updateUncitedItems(idList: Id[]): void;

      /**
       * Use `processCitationCluster` to generate and maintain citations
       * dynamically in the text of a document.
       
       * @returns An array of two elements: 
       *   * a data object
       *   * an array of one or more index/string pairs, one for each citation
       *     affected by the citation edit or insertion operation.
       * @see https://github.com/Juris-M/citeproc-js-docs/pull/9/files
       */
      processCitationCluster(
        citation: CitationObject,
        citationsPre: [Id, number][],
        citationsPost: [Id, number][]
      ): [
        {
          bibchange: boolean,
          "citation_errors": []
        },
        [clusterPosition: number, formattedCitationCluster: string, clusterId: Id][]
      ]

      makeBibliography(): Bibliography;
    }

  }

  type Bibliography = [
    {
      /**
       * The maximum number of characters appearing in any label used
       * in the biblography, to be used for alignment purposes.
       */
      maxoffset: number,
      entryspacing: number,
      linespacing: number,
      hangingindent: number,
      "second-field-align": false|"flush"|"margin",
      bibstart: string,
      bibend: string,
      bibliography_errors: unknown[],
      entry_ids: string[]
    },
    string[]
  ];
}