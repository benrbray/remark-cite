/** @jsxImportSource hastscript */

import { EntryObject, FieldValueMap, HastElement, NameValue, TextValue } from "@lib/types";
import { ElementContent } from "hast";

////////////////////////////////////////////////////////////////////////////////

/**
 * Priority of name-type fields to check when determining
 * the primary author for use in inline citations.
 */
// const primaryAuthorPriority = [
//   "author",
//   "bookauthor",
//   "translator",
//   "holder",
//   "editor",
//   "commentator",
//   "introduction",
//   "forward",
//   "afterword",
//   "annotator",
//   "label",
// ];

////////////////////////////////////////////////////////////////////////////////

type Template
  = string
  | { type: "field", field: string }
  | { type: "optional", template: Template }
  | { type: "join", parts: Template[] }
  | { type: "join-periods", parts: Template[] }
  | { type: "link", href: Template, part: Template }
  | { type: "oneof", templates: Template[] }

const field   = (field: string): Template => ({
  type: "field",
  field
});

function optional(part: Template): Template;
function optional(...parts: Template[]): Template[];
function optional(...p: Template[]): Template|Template[] {
  if(p.length === 1) {
    return { type: "optional", template: p[0] };
  }
  
  return p.map(t => optional(t));
}

const join    = (...parts: Template[]): Template => ({
  type: "join",
  parts
});
const periods = (...parts: Template[]): Template => ({
  type: "join-periods",
  parts
});
const link = (href: Template, part: Template): Template => ({
  type: "link",
  href,
  part
});
const oneof = (...templates: Template[]): Template => ({
  type: "oneof",
  templates
});

////////////////////////////////////////////////////////////////////////////////

export const formatString = (value: string): EvalResult => ({
  type: "string",
  value: value
});

export const formatTextValue = (value: TextValue): EvalResult => ({
  type: "string",
  value: value.text
});

export const formatTextValues = (values: TextValue[]): EvalResult => ({
  type: "sequence",
  values: values.map(formatTextValue)
});

export const intersperse = <A,>(as: A[], sep: A): A[] => {
  return as.flatMap((a,idx) => {
    if(idx === 0) { return [a]; }
    return [sep, a];
  });
}

export const formatTextValuess = (values: TextValue[][]): EvalResult => ({
  type: "sequence",
  values: intersperse(values.map(formatTextValues), { type: "string", value: ", " })
});

export const formatPages = (values: [TextValue[], TextValue[]][]): EvalResult => ({
  type: "sequence",
  values: intersperse<EvalResult>(
    values.map(([a,b]) => {
      const ra = formatTextValues(a);
      const rb = formatTextValues(b);

      return {
        type: "sequence",
        values: [
          ra,
          { type: "string", value: "-" },
          rb
        ]
      };
    }), 
    { type: "string", value: ", " }
  )
});

export const formatNameValue = (name: NameValue): EvalResult|null => {
  if(name.given && name.family) {
    return {
      type: "sequence",
      values: [
        formatTextValues(name.family),
        { type: "string", value: ", " },
        formatTextValues(name.given),
      ]
    };
  } else if(name.literal) {
    return formatTextValues(name.literal);
  } else {
    return null;
  }
}

export const formatNameValues = (values: NameValue[]): EvalResult|null => {
  const maybeNames = values.map(formatNameValue);
  if(!maybeNames.every(e => e !== null)) { return null; }
  const names = maybeNames as EvalResult[];

  return {
    type: "sequence",
    values: names.flatMap((v,idx) => {
      if(idx === 0) { return [v]; }
      if(idx < values.length - 1) { return [{ type: "string", value: "; " }, v]; }
      return [{ type: "string", value: "; and " }, v];
    })
  }
}

export const formatLocation = (values: TextValue[][]): EvalResult => ({
  type: "sequence",
  values: intersperse(values.map(formatTextValues), { type: "string", value: ", " })
});

////////////////////////////////////////////////////////////////////////////////

type EvalResult
  = { type: "group", group: string, values: EvalResult[] }
  | { type: "field", field: string, values: EvalResult[] }
  | { type: "link", href: string, values: EvalResult[] }
  | { type: "string", value: string }
  | { type: "sequence", values: EvalResult[] }
  | { type: "empty" }

////////////////////////////////////////////////////////////////////////////////

const renderResultHast = (result: EvalResult): ElementContent[] => {
  if(result.type === "empty") { return []; }
  if(result.type === "string") { return [{ type: "text", value: result.value }]; }
  if(result.type === "field") {
    return [{
      type: "element",
      tagName: "span",
      properties: { className: `field-${result.field}` },
      children: result.values.flatMap(renderResultHast)
    }];
  }
  if(result.type === "sequence") {
    return result.values.flatMap(renderResultHast);
  }
  if(result.type === "group") {
    return [{
      type: "element",
      tagName: "div",
      properties: { className: `group-${result.group}` },
      children: result.values.flatMap(renderResultHast)
    }];
  }
  if(result.type === "link") {
    return [{
      type: "element",
      tagName: "a",
      properties: { className: `link`, href: result.href },
      children: result.values.flatMap(renderResultHast)
    }];
  }

  return assertNever(result);
} 

const renderResultString = (result: EvalResult): string => {
  if(result.type === "empty") { return ""; }
  if(result.type === "string") { return result.value }

  return result.values.map(renderResultString).join("");
} 

////////////////////////////////////////////////////////////////////////////////

const evalFieldMap: { [K in keyof FieldValueMap]?: (v: FieldValueMap[K]) => EvalResult|null } = {
  "author" : formatNameValues,
  "bookauthor" : formatNameValues,
  "translator" : formatNameValues,
  "holder" : formatNameValues,
  "editor" : formatNameValues,
  "commentator" : formatNameValues,
  "introduction" : formatNameValues,
  // "forward" : formatNameValues,
  "afterword" : formatNameValues,
  "annotator" : formatNameValues,

  "date" : formatString,
  "url" : formatString,
  "urldate" : formatString,

  "location" : formatTextValuess,
  
  "publisher" : formatTextValuess,
  "organization" : formatTextValuess,
  "institution" : formatTextValuess,

  "pages" : formatPages
};

const evalField = (entry: EntryObject, field: string): EvalResult|null => {
  const fieldValue = (entry.fields as any)[field];
  if(!fieldValue) { return null; }

  const formatter = ((evalFieldMap as any)[field] || formatTextValues) as ((x: unknown) => EvalResult|null);
  const result = formatter(fieldValue);

  if(result === null) { return result; }

  return { type: "field", field: field, values: [result] };
}

const evalOptional = (entry: EntryObject, part: Template): EvalResult => {
  const result = evalTemplate(entry, part);

  if(result !== null) { return result; }
  else { return { type: "empty" }; }
}

const evalJoin = (entry: EntryObject, separator: string, parts: Template[]): EvalResult|null => {
  const evalParts = parts.map(t => {
    return evalTemplate(entry, t)
  }).filter(t => t == null || t.type !== "empty");

  if(evalParts.every(p => p !== null)) {
    return {
      type: "sequence",
      values: intersperse(evalParts as EvalResult[], { type: "string", value: separator })
    };
  } else {
    return null;
  }
}

const evalTemplate = (entry: EntryObject, template: Template): EvalResult|null => {
  // literals
  if(typeof template === "string") { return { type: "string", value: template }; }

  // optional
  if(template.type === "optional") { return evalOptional(entry, template.template); }

  // joins
  if(template.type === "join")         { return evalJoin(entry, "",  template.parts); }
  if(template.type === "join-periods") { return evalJoin(entry, ". ", template.parts); }

  if(template.type === "field") {
    return evalField(entry, template.field);
  }

  // choice
  if(template.type === "oneof") {
    for(let t of template.templates) {
      const result = evalTemplate(entry, t);
      if(result !== null) { return result; }
    }
    return null;
  }

  // marks
  if(template.type === "link") {
    const resultHref = evalTemplate(entry, template.href);
    const resultBody = evalTemplate(entry, template.part);

    if(resultBody === null) { return null; }

    if(resultHref === null) {
      return resultBody;
    } else {
      return {
        type: "link",
        href: renderResultString(resultHref),
        values: [resultBody]
      }
    }
  }

  return assertNever(template);
}

const assertNever = (x: never): any => { console.error(`expected never, received: ${x}`); }

////////////////////////////////////////////////////////////////////////////////

const publisher = () => {
  return oneof(
    field("publisher"),
    field("institution"),
    field("organization"),
  );
}

const defaultTemplate = periods(
  ...optional(
    field("author"),
    link(
      field("url"),
      oneof(
        join(field("maintitle"), ": ", field("subtitle")),
        join(field("title"), ": ", field("subtitle")),
        field("title")
      )
    ),
    oneof(
      join(
        "In ",
        oneof(
          join(field("journaltitle"), ": ", field("journalsubtitle")),
          field("journaltitle"),
          join(field("booktitle"), ": ", field("booksubtitle")),
          field("booktitle"),
          join(field("issuetitle"), ": ", field("issuesubtitle")),
          field("issuetitle"),
          field("maintitle")
        ),
        oneof(
          join(" (Vol. ", field("volume"), ", ", field("pages"), ")"),
          join(" (Vol. ", field("volume"), ")"),
          join(", ", field("pages"))
        )
      ),
      oneof(
        join("(Vol. ", field("volume"), ", ", field("pages"), ")"),
        join("(Vol. ", field("volume"), ")"),
        field("pages")
      )
    ),
    join("Edited by ", field("editor")),
    join("Afterword by ", field("afterword")),
    join("Annot. by ", field("afterword")),
    join("Transl. by ", field("translator")),
    oneof(
      join(publisher(), optional(join(", ", field("location")))),
      field("location")
    ),
    field("venue"),
    join("Version ", field("version")),
    join("Edition ", field("edition")),
    oneof(
      field("date"),
      "(no date)"
    ),
    join("Accessed ", field("urldate"))
  )
);

////////////////////////////////////////////////////////////////////////////////

export const formatter = (entry: EntryObject): HastElement => {
  const result = evalTemplate(entry, defaultTemplate);

  if(result === null) {
    return {
      type: "element",
      tagName: "div",
      properties: { className: "cite-bib error" },
      children: [{ type: "text", value: "error" }]
    };
  } else {
    return {
      type: "element",
      tagName: "div",
      properties: { className: "cite-bib" },
      children: renderResultHast(result)
    };
  }
}

export const formatBibString = (entry: EntryObject): string|null => {
  const result = evalTemplate(entry, defaultTemplate);

  if(result === null) { return null; }

  return renderResultString(result);
}