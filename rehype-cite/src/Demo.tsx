import { createSignal } from "solid-js";

import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkCite from "@benrbray/remark-cite";
import remarkMath from "remark-math";

import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

import dedent from "dedent-js";

import rehypeCite from "../lib/main";

import bibFile from "./refs.bib?raw"

////////////////////////////////////////////////////////////////////////////////

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkCite)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeCite, { bibFiles : [bibFile] })
  .use(rehypeStringify);

const markdown2html = (markdown: string): string => {
  const mdast = processor.parse(markdown);
  const hast  = processor.runSync(mdast);
  return processor.stringify(hast).toString()
}

export const Demo = () => {
  const initialMarkdown = dedent`
    # Introduction
    As observed by [@riehl2017:category], and further developed by [@milewski:ct4p-yoneda, Section 1.2; @meijer1991functional, p.4]
    `;
  const initialBibtex = "";

  const [markdown, setMarkdown] = createSignal(initialMarkdown);
  const [_bibtex, setBibtex] = createSignal(initialBibtex);

  return <div class="demo">
    <textarea class="input-markdown" value={initialMarkdown} onInput={t => setMarkdown(t.target.value)} />
    <textarea class="input-bibtex" value={initialBibtex} onInput={t => setBibtex(t.target.value)} />
    <div class="result-html" innerHTML={markdown2html(markdown())} />
    <div class="result-ast"><pre><code>{JSON.stringify(processor.parse(markdown()), undefined, 2)}</code></pre></div>
  </div>
}