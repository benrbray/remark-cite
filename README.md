# `remark-cite`

[![](https://img.shields.io/npm/v/@benrbray/remark-cite?style=flat-square)](https://www.npmjs.com/package/@benrbray/remark-cite)
![license](https://img.shields.io/github/license/benrbray/remark-cite?style=flat-square)

Following [convention](https://github.com/micromark/micromark/discussions/56), this repository contains **three separate `npm` packages** related to support for [`pandoc`-style](https://pandoc.org/MANUAL.html#extension-citations) citation syntax for the `remark` Markdown parser.

* `micromark-extension-cite` defines a new [syntax extension](https://github.com/micromark/micromark#syntaxextension) for `micromark`, which is responsible for converting markdown syntax to a token stream
* `mdast-util-cite` describes how to convert tokens output by `micromark-extension-cite` into either an HTML string or `mdast` syntax tree.
* `remark-cite` encapsulates the above functionality into a `remark` plugin.

For more information, see the individual folders for each package.

## Contributing

Pull requests for bugfixes or new features / options are welcome.  Be aware that changes to the syntax extension `micromark-extension-cite` may also have an impact on the other two packages, and you will need to test all three.