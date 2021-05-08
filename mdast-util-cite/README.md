# `mdast-util-cite`

Extension for [`mdast-util-from-markdown`](https://github.com/syntax-tree/mdast-util-from-markdown) and
[`mdast-util-to-markdown`](https://github.com/syntax-tree/mdast-util-to-markdown) to support [`pandoc`-style](https://pandoc.org/MANUAL.html#extension-citations) citations.  Converts the token stream produced by [`micromark-extension-cite`](https://github.com/benrbray/remark-cite/tree/master/micromark-extension-cite) into an abstract syntax tree.  

Note that this extension only parses the input -- it is up to you to assign meaning to these citations by looking up each key in a `.bibtex` file or other tagged citation database.

Using [`remark`](https://github.com/remarkjs/remark)?  You probably shouldn’t use this package directly, but instead use [`remark-cite`](https://github.com/benrbray/remark-cite/tree/master/remark-cite).  See [`micromark-extension-cite`](https://github.com/benrbray/remark-cite/tree/master/micromark-extension-cite) for a full description of the supported syntax.

## Install

Install [`@benrbray/mdast-util-cite`]() on `npm`.

```
npm install @benrbray/mdast-util-cite
```

## Usage

### Markdown to AST

```javascript
import fromMarkdown from 'mdast-util-from-markdown'
import { citeSyntax } from 'micromark-extension-cite'
import { citeFromMarkdown } from 'mdast-util-cite'

let ast = fromMarkdown('[see @wadler1989, sec. 1.3; and -@hughes1990, pp.4]', {
  extensions: [citeSyntax()],
  mdastExtensions: [citeFromMarkdown]
})
```

The corresponding node in the abstract syntax tree has the form below, where:

* `value` contains the original markdown source
* `data.altSyntax` will be true if the citation uses the [alternate syntax](https://github.com/benrbray/remark-cite/tree/master/micromark-extension-cite#syntax)
* `data.citeItems` is a list of items cited by the node
    * each item has a `key` and optionally `prefix` and `suffix` strings
	* if the item's key was preceded by a `-`, `item.suppressAuthor` will be `true`

```json
{
	"type": "cite",
	"value": "[see @wadler1989, sec. 1.3; and -@hughes1990, pp.4]",
	"data": {
		"citeItems": [
			{
				"prefix": "see ",
				"key": "wadler1989",
				"suffix": ", sec. 1.3"
			},{
				"prefix": " and ",
				"suppressAuthor": true,
				"key": "hughes1990",
				"suffix": ", pp.4"
			}
		]
	}
}
```

### AST to Markdown

Taking the `ast` from the previous example,

```javascript
import fromMarkdown from 'mdast-util-from-markdown'
import { citeToMarkdown } from 'mdast-util-cite'

const defaultOptions = {
	standardizeAltSyntax: false,
	enableAuthorSuppression: true,
	useNodeValue: false,
};

let markdownString = toMarkdown(ast, {
	extensions: [citeToMarkdown(defaultOptions)]
}).trim();
```

The result will be:

```
[see @wadler1989, sec. 1.3; and -@hughes1990, pp.4]
```

The `citeToMarkdown` extension has the following options:

* `options.standardizeAltSyntax` (default `false`):  When `true`, nodes with `data.altSyntax = true` will be rendered in standard pandoc syntax `[@cite]` rather than the alternative syntax `@[cite]`.

* `options.enableAuthorSuppression` (default `true`):   When `false`, will not produce author suppression hyphens `-` in the output markdown, even if they are present in the AST.

* `options.useNodeValue` (default `false`):  When `true`, every citation node serializes to its `node.value`, rather than being reconstructed from its `data.citeItems` list.  **When active, this setting overrides all other options**. 