# `rehype-cite`

The `rehype-cite` package is a `rehype` plugin adding support for inline citations and bibliographies.

For now, `rehype-cite` is not capable of producing citations that adhere strictly to well-known bibliography formats like APA, MLA, IEEE, etc..  You should only use `rehype-cite` in non-academic contexts like blog posts or note-taking.

> [!IMPORTANT]
> If you have strict formatting requirements, consider using [rehype-citation](https://github.com/timlrx/rehype-citation) or [citeproc-js](https://citeproc-js.readthedocs.io/en/latest/) instead, for compatibility with the [Citation Style Language](https://citationstyles.org/).

## Installation

```bash
npm install @benrbray/rehype-cite
```

## Usage

```typescript
const bibFile = `
@book{riehl2017:category,
  title={Category theory in context},
  author={Riehl, Emily},
  year={2017},
  publisher={Courier Dover Publications},
  url={https://store.doverpublications.com/048680903x.html}
}
`;

const processor = unified()
  .use(remarkParse)
  .use(remarkMath)
  .use(remarkCite)
  .use(remarkRehype)
  .use(rehypeKatex)
  .use(rehypeCite, { bibFiles : [bibFile] })
  .use(rehypeStringify);

const markdown = "[@riehl2017:category]";
const result: string = processor.processSync(markdown).toString();
```

## Goals

When using `rehype-cite`, you will quickly notice that the citations produced by `rehype-cite` do not adhere to any standard citation format (such as APA, MLA, Harvard, etc.).  

Existing JavaScript libraries for citation rendering (such as [`citation-js`]() and [`citeproc-js`](https://citeproc-js.readthedocs.io/en/latest/)) support a great many citation styles in [CSL format](https://citationstyles.org/), but unfortunately are designed to produce only *strings* rather than structured output like HTML or JSON.  This makes it difficult to add interactivity such as hyperlinked titles to bibliography entries.

Instead, `rehype-cite` includes a custom formatter which produces **structured output** convenient for styling, hyperlinking, and further postprocessing of bibliography data.  The final citations are "good enough" for use in contexts like blog posts or personal notes, but should **not** be used in formal academic contexts.

## Writing a Custom Formatter (*experimental*)

In addition to the built-in formatter, `rehype-cite` includes a DSL for writing new formatters.

## Resources

* [BibLaTeX Cheat Sheet](https://tug.ctan.org/info/biblatex-cheatsheet/biblatex-cheatsheet.pdf)