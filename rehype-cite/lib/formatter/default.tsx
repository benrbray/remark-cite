/** @jsxImportSource hastscript */

import { EntryObject, FieldValueMap, Formatter, HastElement, NameValue, TextValue } from "@lib/types";

////////////////////////////////////////////////////////////////////////////////

/**
 * Priority of name-type fields to check when determining
 * the primary author for use in inline citations.
 */
const primaryAuthorPriority = [
  "author",
  "bookauthor",
  "translator",
  "holder",
  "editor",
  "commentator",
  "introduction",
  "forward",
  "afterword",
  "annotator",
];

////////////////////////////////////////////////////////////////////////////////

type Template
  = string
  | { type: "field", field: string }
  | { type: "optional", template: Template }
  | { type: "join", parts: Template[] }
  | { type: "join-periods", parts: Template[] }
  | { type: "link", href: Template, part: Template }
  | { type: "oneof", templates: Template[] }
  | { type: "debug", template: Template }

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
const debug = (template: Template): Template => ({
  type: "debug",
  template
});


////////////////////////////////////////////////////////////////////////////////

export const formatString = (value: string): string => value;

export const formatTextValue = (value: TextValue): string => {
  return value.text;
}

export const formatTextValues = (values: TextValue[]): string => {
  return values.map(formatTextValue).join("");
}

export const formatTextValuess = (values: TextValue[][]): string => {
  return values.map(formatTextValues).join(", ");
}

export const formatPages = (values: [TextValue[], TextValue[]][]): string => {
  return values.map(([a,b]) => {
    return `${formatTextValues(a)}-${formatTextValues(b)}`;
  }).join(", ");
}

export const formatNameValue = (name: NameValue): string|null => {
  const given  = name.given  ? formatTextValues(name.given)  : "";
  const family = name.family ? formatTextValues(name.family) : "";

  if(name.given && name.family) {
    return `${family}, ${given}`;
  } else if(name.literal) {
    return formatTextValues(name.literal);
  } else {
    return null;
  }
}

export const formatNameValues = (values: NameValue[]): string => {
  return values.flatMap((name, idx) => {
    const formatted = formatNameValue(name);
    if(idx === 0) {
      return [formatted]
    } if(idx < values.length - 1) {
      return ["; ", formatted]
    } else {
      return ["; and ", formatted]
    }
  }).join("");
}

export const formatLocation = (values: TextValue[][]): string => {
  return values.map(formatTextValues).join(", ");
}

////////////////////////////////////////////////////////////////////////////////

const evalFieldMap: { [K in keyof FieldValueMap]?: (v: FieldValueMap[K]) => string } = {
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

  "location" : formatTextValuess,
  
  "publisher" : formatTextValuess,
  "organization" : formatTextValuess,
  "institution" : formatTextValuess,

  "pages" : formatPages
};

const evalField = (entry: EntryObject, field: string): string|null => {
  const fieldValue = (entry.fields as any)[field];
  if(!fieldValue) { return null; }

  const formatter = (evalFieldMap as any)[field] || formatTextValues as ((x: unknown) => string);
  const result = formatter(fieldValue);

  return result;
}

const evalOptional = (entry: EntryObject, part: Template): string => {
  const result = evalTemplate(entry, part);
  return result || "";
}

const evalDebug = (entry: EntryObject, template: Template): string|null => {
  const result = evalTemplate(entry, template);
  console.log("debug", result);
  return result;
}

const evalJoin = (entry: EntryObject, separator: string, parts: Template[]) => {
  const evalParts = parts.map(t => {
    return evalTemplate(entry, t)
  }).filter(t => t !== "");

  if(evalParts.every(p => p !== null)) {
    return evalParts.join(separator);
  } else {
    return null;
  }
}

const evalTemplate = (entry: EntryObject, template: Template): string|null => {
  // literals
  if(typeof template === "string") { return template; }

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
    // TODO
    return evalTemplate(entry, template.part);
  }

  if(template.type === "debug") {
    return evalDebug(entry, template.template);
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
        join(field("title"), ": ", field("subtitle")),
        field("title")
      )
    ),
    oneof(
      join(
        "In ",
        oneof(
          join(field("journaltitle"), ": ", field("journalsubtitle")),
          field("journaltitle")
        ),
        optional(join(" (Vol. ", field("volume"), ")")),
        optional(join(", ", field("pages")))
      ),
      join(
        "In ",
        oneof(
          join(field("issuetitle"), ": ", field("issuesubtitle")),
          field("issuetitle")
        ),
        oneof(
          join("(Vol. ", field("volume"), ", ", field("pages"), ")"),
          join("(Vol. ", field("volume"), ")"),
          field("pages")
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
    )
  )
);

////////////////////////////////////////////////////////////////////////////////

console.log(defaultTemplate);

/**
 * Default order for fields to include
 * when rendering the bibliography.
 */
const defaultFieldOrder = [
  // "abstract",
  // "addendum",
  // "annotation",
  // "keywords",
  // "mainsubtitle",
  // "maintitle",
  // "maintitleaddon",

  "author",     // l_name

  "title",
  "subtitle",

  "journaltitle",
  "journalsubtitle",

  "location",
  "venue",

  "date",

  "version",
  "howpublished",
  
  "note",
  "afterword",  // l_name
  "annotator",  // l_name
  "foreword", // l_name
  "holder", // l_name
  "introduction", // l_name
  "translator", // l_name


  "volume", // volume(issue)
  "volumes",
  
  "series",
  "issue", // non-number issue
  // "issuesubtitle",
  // "issuetitle",



  "bookpagination",
  "booksubtitle",
  "bookauthor", // l_name
  "booktitle",
  "booktitleaddon",
  
  "chapter",
  "commentator",
  "doi",
  "edition",
  "editor",
  "eid", // electronic id
  "eventdate",
  "eventtitle",
  "institution", // org
  "organization", // org
  
  "isan", // id
  "isbn", // id
  "ismn", // id
  "isrn", // id
  "issn", // id


  "label",
  "language",

  "number",
  "pages",
  "pagetotal",
  "pagination",
  "part",
  "publisher",
  "pubstate",
  "reprinttitle",
  "shorttitle",
  "titleaddon",
  "url",
  "urldate",
];

////////////////////////////////////////////////////////////////////////////////

export const formatterDefault: Formatter = (entry: EntryObject) => {
  // const title = optional(entry.fields.title, title =>
  //   span("field-title", [link("url", "", [text(formatTextValues(title))])])
  // );
  // const date = optional(entry.fields.date, date =>
  //   span("field-date", [text(date)])
  // );

  // return [title, date];

  return [];
}

export const formatterBase: Formatter = (entry: EntryObject) => {
  // const title = optional(entry.fields.title, title =>
  //   span("field-title", [link("url", "", [text(formatTextValues(title))])])
  // );
  // const date = optional(entry.fields.date, date =>
  //   span("field-date", [text(date)])
  // );

  // return [title, date];

  return [];
}

export const formatter = (entry: EntryObject): HastElement => {
  console.log(entry.entry_key, entry.bib_type);

  return {
    type: "element",
    tagName: "div",
    properties: { className: "bib-entry" },
    children: [{ type: "text", value: evalTemplate(entry, defaultTemplate)||"error" }]
  };
}