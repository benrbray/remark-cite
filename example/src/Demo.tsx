// solid
import { createSignal, JSX, ParentProps } from "solid-js";
import { Fragment, jsx, jsxs } from "solid-js/h/jsx-runtime";

// unified
import { Processor, unified } from "unified";
import { removePosition } from "unist-util-remove-position";

// remark
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeReact from "rehype-react";
import rehypeStringify from "rehype-stringify";

// miscellaneous
import dedent from "dedent-js";

// remark-cite
import remarkCite from "@benrbray/remark-cite";
import rehypeCite from "@benrbray/rehype-cite";

// package impots
import bibFile from "./refs.bib?raw"
import { Heading } from "./components/Heading";
import { CitationInline } from "./components/CitationInline";
import { Bibliography } from "./components/Bibliography";

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

////////////////////////////////////////////////////////////////////////////////

const markdown2html = (markdown: string): string => {
  const mdast = htmlProcessor.parse(markdown);
  const hast  = htmlProcessor.runSync(mdast);
  return htmlProcessor.stringify(hast).toString()
}

export const Demo = () => {
  // signals
  const [markdown, setMarkdown] = createSignal(
    dedent`
      ### Abstract
      Inspired by the treatment in [@riehl2017:category], we use the framework presented by [@milewski:ct4p-yoneda, Section 1.2; @meijer1991functional, p.4] to derive a new convergence proof.
    `
  );
  const [bibtex, setBibtex] = createSignal(bibFile);
  const [selectedKeys, setSelectedKeys] = createSignal(new Set());

  // this processor is configured for solidjs
  // to use react or another frontend jsx framework,
  // you may need a slightly different configuration
  // (see https://github.com/syntax-tree/hast-util-to-jsx-runtime)
  const solidJsProcessor: Processor = baseProcessor()
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
      CitationInline: CitationInline((key: string) => {}),
      Bibliography: Bibliography(() => {}),
      },
    });


  // preview
  const prettyHast = () => {
    const hast = htmlProcessor.parse(markdown());
    removePosition(hast);
    const result = JSON.stringify(hast, undefined, 2);
    return result;
  }

  const solidJsContent = (): JSX.Element => {
    const file = solidJsProcessor.processSync(markdown())
    return file.result as JSX.Element;
  }

  return <div class="content">
    <h1>remark-cite</h1>
    <div style="position: relative">
      <h2>BibTeX Input</h2>
      <textarea class="input-bibtex" value={bibtex()} onInput={t => setBibtex(t.target.value)} />
      <h2>Markdown Input</h2>
      <textarea class="input-markdown" value={markdown()} onInput={t => setMarkdown(t.target.value)} />
      <h2>Result (HTML)</h2>
      <div class="result result-html" innerHTML={markdown2html(markdown())} />
      <h2>Result (JSX)</h2>
      <div class="result result-jsx">
        {solidJsContent()}
      </div>
      <div class="result result-ast">
        <pre><code>
          {prettyHast()}
        </code></pre>
      </div>
      <div class="demo">
      </div>
    </div>
  </div>;
}