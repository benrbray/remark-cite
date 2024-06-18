import { createSignal } from "solid-js";

import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkCite from "@benrbray/remark-cite";
import remarkMath from "remark-math";

import rehypeKatex from "rehype-katex";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

////////////////////////////////////////////////////////////////////////////////

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkCite)
  .use(remarkRehype)
  // .use(rehypeKatex)
  // .use(rehypeSanitize)
  .use(rehypeStringify);

const markdown2html = (markdown: string): string => {
  const mdast = processor.parse(markdown);
  const hast  = processor.runSync(mdast);

  console.log(hast);

  return processor.processSync(markdown).toString()
}

export const Demo = () => {
  const initialMarkdown = "";
  const initialBibtex = "";

  const [markdown, setMarkdown] = createSignal(initialMarkdown);
  const [bibtex, setBibtex] = createSignal(initialBibtex);

  return <div class="demo">
    <textarea class="input-markdown" value={initialMarkdown} onInput={t => setMarkdown(t.target.value)} />
    <textarea class="input-bibtex" value={initialBibtex} onInput={t => setBibtex(t.target.value)} />
    <div class="result-html" innerHTML={markdown2html(markdown())} />
    <div class="result-ast"><pre><code>{JSON.stringify(processor.parse(markdown()), undefined, 2)}</code></pre></div>
  </div>
}