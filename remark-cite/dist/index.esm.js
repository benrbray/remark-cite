import { citeSyntax } from '@benrbray/micromark-extension-cite';
import { citeToMarkdown, citeFromMarkdown } from '@benrbray/mdast-util-cite';

var warningIssued = false;

function remarkV13Warning(context) {
  if (!warningIssued && (context.Parser && context.Parser.prototype && context.Parser.prototype.blockTokenizers || context.Compiler && context.Compiler.prototype && context.Compiler.prototype.visitors)) {
    warningIssued = true;
    console.warn('[remark-cite] Warning: please upgrade to remark 13 to use this plugin');
  }

  return warningIssued;
}

function citePlugin(options) {
  var data = this.data(); // warn for earlier versions

  remarkV13Warning(this);
  add('micromarkExtensions', citeSyntax(options.syntax || {}));
  add('fromMarkdownExtensions', citeFromMarkdown);
  add('toMarkdownExtensions', citeToMarkdown(options.toMarkdown || {}));

  function add(field, value) {
    if (data[field]) data[field].push(value);else data[field] = [value];
  }
}

export { citePlugin };
//# sourceMappingURL=index.esm.js.map
