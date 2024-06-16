import { createSignal } from "solid-js";

import remark from "remark";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

////////////////////////////////////////////////////////////////////////////////

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSanitize)
  .use(rehypeStringify);

const markdown2html = (markdown: string): string => {
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
  </div>
}