declare module "@citation-js/core" {
  /** To be extended by plugins. */
  declare interface InputDataMap {
    string: string
  }

  declare type InputData = InputDataMap[keyof InputDataMap];

  declare interface InputOptions {
    output: OutputOptions,
    maxChainLength: number,
    generateGraph: boolean,
    strict: boolean,
    forceType: unknown,
    target: unknown
  }

  declare interface OutputOptions {
    format: string,
    type: string,
    style: string,
    lang: string,
    prepend: string,
    append: string
  }

  /**
   * @return positive for a > b, negative for b > a, zero for a = b
   */
  type CompareCSL = (a : import("./csl-data").CSL, b: import("./csl-data").CSL) => number;

  declare class Cite {
    /** Create a Cite object with almost any kind of data, and manipulate it with its default methods. */
    constructor(data: InputData, options?: InputOptions)

    /** Add an object to the array of objects. */
    add(data: InputData, options: InputOptions, log: boolean): Cite;

    /** Add an object to the array of objects. */
    addAsync(data: InputData, options: InputOptions, log: boolean): Promise<Cite>;

    /** The latest version of the object. */
    currentVersion(): number;
    
    /** Get formatted data from your object. */
    format(format: string, options: unknown): string|unknown[];

    /** Get a list of the data entry IDs, in the order of that list. */
    getIds(): string[];
    
    /** Reset a `Cite` object. */
    reset(log: boolean): void;

    /** Returns the last saved image of the object. */
    retrieveLastVersion(): Cite;

    /** Save an image of the current version of the object. */
    save(): Cite;

    /** Recreate a `Cite` object with almost any kind of data, and manipulate it with its default methods. */
    set(data: InputData, options: InputOptions, log: boolean): Cite;

    /** Recreate a `Cite` object with almost any kind of data, and manipulate it with its default methods. */
    set(data: InputData, options: InputOptions, log: boolean): Promise<Cite>;

    sort(method: string[] | CompareCSL, log: boolean = false): Cite;

    /**
     * Returns the second to last saved image of the object.
     * @param number The number of versions to go back.
     */
    undo(number: number = 1);

    validateOptions(): boolean;
  }

  declare namespace plugins {
    type PluginRef = string;

    declare namespace config {
      function get(ref: PluginRef): unknown;
    };

    function add(ref: PluginRef, plugins): void;
    function has(ref: PluginRef): boolean;
    function list(): PluginRef[];
    function remove(ref: PluginRef): void;
  }
}