

declare module "@citation-js/core" {
  declare interface InputDataMap {
    cslJson: import("./csl-data").CSL
  }

  declare interface PluginRefMap {
    "@csl" : import("@citation-js/csl").CslPluginConfig
  }
}

declare module "@citation-js/csl" {
  declare type CslPluginConfig = {
    templates: import("@citation-js/core").Register<string>,
    engine(data: any[], style: "apa", locale: "en-US", format: "html"): import("citeproc").CSL.Engine
  };
}