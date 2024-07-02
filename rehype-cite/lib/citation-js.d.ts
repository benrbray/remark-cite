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
    data: unknown[];

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

  /**
  * @memberof module:@citation-js/core.util
  * @param {Object} [data={}] - initial values
  */
  declare class Register<V=any> {
      constructor(data?: {});
      data: {};
      /**
      * @param {String} key
      * @param {*} value
      * @return {Register} this
      */
      set(key: string, value: V): Register;
      /**
      * @param {String} key
      * @param {*} value
      * @return {Register} this
      */
      add(key: string, value: V): this;
      /**
      * @param {String} key
      * @return {Register} this
      */
      delete(key: string): Register;
      /**
      * @param {String} key
      * @return {Register} this
      */
      remove(key: string): Register;
      /**
      * @param {String} key
      * @return {*} value
      */
      get(key: string): V;
      /**
      * @param {String} key
      * @return {Boolean} register has key
      */
      has(key: string): boolean;
      /**
      * @return {Array<String>} list of keys
      */
      list(): Array<string>;
  }

  declare interface PluginRefMap {
    // to be extended by plugins
  }
  
  declare namespace plugins {
    type PluginRef = keyof PluginRefMap;

    declare namespace config {
      function get<P extends PluginRef = PluginRef>(ref: P): PluginRefMap[P];
    };

    function add(ref: PluginRef, plugins): void;
    function has(ref: PluginRef): boolean;
    function list(): PluginRef[];
    function remove(ref: PluginRef): void;
  }
}