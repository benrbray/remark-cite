import { createSignal, JSX, ParentProps } from "solid-js";
import { Fragment, jsx, jsxs, jsxDEV } from "solid-js/h/jsx-runtime";

import { Processor, unified } from "unified";
import { removePosition } from "unist-util-remove-position";

import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeReact, { Options } from "rehype-react";
import rehypeStringify from "rehype-stringify";

import remarkCite from "@benrbray/remark-cite";
import rehypeCite from "@benrbray/rehype-cite";

import dedent from "dedent-js";


import bibFile from "./refs.bib?raw"

////////////////////////////////////////////////////////////////////////////////

const baseProcessor: Processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkCite)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeCite, { bibFiles : [bibFile] })
  .freeze();

const htmlProcessor: Processor = baseProcessor()
  .use(rehypeStringify);

const Heading = (props: ParentProps) => {
  return <div class="heading">
    Heading:  {props.children}
  </div>
}
const CitationInline = (props: ParentProps) => {
  console.log(props);

  const [selected, setSelected] = createSignal(false)

  return <div onclick={() => setSelected(prev => !prev)} class="citation-inline" style="background-color: #ccf; display: inline-block">
    { selected() ? <>Citation:  {props.children}</> : "Hidden"}
  </div>
}

const jsxProcessor: Processor = baseProcessor()
. use(rehypeReact, {
   Fragment,
   jsx,
   jsxs,
   elementAttributeNameCase: "html",
   stylePropertyNameCase: "css",
   components: {
    h1: Heading,
    h2: Heading,
    h3: Heading,
    h4: Heading,
    CitationInline
      // div: () => {
      //   return <div>Context: {value}</div>;
      // },
    },
  });

const markdown2html = (markdown: string): string => {
  const mdast = htmlProcessor.parse(markdown);
  const hast  = htmlProcessor.runSync(mdast);
  return htmlProcessor.stringify(hast).toString()
}

const markdown2jsx = (markdown: string) => {
  return jsxProcessor.processSync(markdown);
}

export const Demo = () => {
  const initialMarkdown = dedent`
    ### Abstract

    Inspired by the treatment in [@riehl2017:category], we use the framework presented by [@milewski:ct4p-yoneda, Section 1.2; @meijer1991functional, p.4] to derive a new convergence proof.
    `;
  const initialBibtex = bibFile;

  const [markdown, setMarkdown] = createSignal(initialMarkdown);
  const [_bibtex, setBibtex] = createSignal(initialBibtex);

  const prettyHast = () => {
    const hast = htmlProcessor.parse(markdown());
    removePosition(hast);
    const result = JSON.stringify(hast, undefined, 2);
    return result;
  }

  // const [jsxContent, setJsxContent] = createSignal<JSX.Element>()
  const jsxContent = (): JSX.Element => {
    const file = jsxProcessor.processSync(markdown())
    return file.result as JSX.Element;
  }

  return <div class="content">
    <h1>remark-cite</h1>
    <div style="position: relative">
      <h2>BibTeX Input</h2>
      <textarea class="input-bibtex" value={initialBibtex} onInput={t => setBibtex(t.target.value)} />
      <h2>Markdown Input</h2>
      <textarea class="input-markdown" value={initialMarkdown} onInput={t => setMarkdown(t.target.value)} />
      <h2>Result (HTML)</h2>
      <div class="result result-html" innerHTML={markdown2html(markdown())} />
      <h2>Result (JSX)</h2>
      <div class="result result-jsx">
        {jsxContent()}
      </div>
      <div class="result result-ast"><pre><code>{prettyHast()}</code></pre></div>
      <div class="demo">
      </div>
    </div>
  </div>;
}