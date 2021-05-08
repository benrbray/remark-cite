# `remark-cite`

Plugin for [`remark`](https://github.com/remarkjs/remark) to support [`pandoc`-style](https://pandoc.org/MANUAL.html#extension-citations) citations.  Relies on [`micromark-extension-cite`](https://github.com/benrbray/remark-cite/tree/master/micromark-extension-cite) for tokenization and [`mdast-util-cite`](https://github.com/benrbray/remark-cite/tree/master/mdast-util-cite) for converting markdown to/from abstract syntax trees.

Note that this extension only parses the input -- it is up to you to assign meaning to these citations by looking up each key in a `.bibtex` file or other tagged citation database.

## Install

Install [`@benrbray/remark-cite`]() on `npm`.

```
npm install @benrbray/remark-cite
```

## Usage

```javascript
const unified = require('unified')
const markdown = require('remark-parse')
const { citePlugin } = require('@benrbray/remark-cite');

let defaultOptions = {
	enableAltSyntax: false,
	enablePandocSyntax: true,
};

let processor = unified()
    .use(markdown)
    .use(citePlugin, {})
```

Running the processor on the following markdown:

```
[see @wadler1989, sec. 1.3; and -@hughes1990, pp.4]
```

Will produce the following `cite` node:

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

### Configuration

For details about the **syntax tree** structure, see [`mdast-util-cite`](https://github.com/benrbray/remark-cite/tree/master/mdast-util-cite).  For details about the **configuration** and supported **syntax**, see [`micromark-extension-cite`](https://github.com/benrbray/remark-cite/tree/master/micromark-extension-cite).
