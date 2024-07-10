/** @jsxImportSource hastscript */

import { EntryObject, Formatter, HastElement, NameValue, TextValue } from "@lib/types";
import { ElementContent } from "hast";


const span = (className: string, children: ElementContent[]): HastElement => {
  return {
    type: "element",
    tagName: "span",
    properties: { className },
    children
  }
}

const link = (className: string, href: string, children: ElementContent[]): HastElement => {
  return {
    type: "element",
    tagName: "a",
    properties: { href, className },
    children
  }
}

const text = (value: string) => {
  return { type: "text", value } as const;
}

////////////////////////////////////////////////////////////////////////////////

export const formatTextValue = (value: TextValue): string => {
  return value.text;
}

export const formatTextValues = (values: TextValue[]): string => {
  return values.map(formatTextValue).join("");
}

export const formatNameValue = (name: NameValue): HastElement => {
  const given  = name.given  ? formatTextValues(name.given)  : "";
  const family = name.family ? formatTextValues(name.family) : "";
  return span("name", [text(`${given} ${family}`)]);
}

export const formatNameValues = (values: NameValue[]): ElementContent[] => {
  return values.flatMap((name, idx) => {
    const formatted = formatNameValue(name);
    if(idx === 0) {
      return [formatted]
    } if(idx < values.length - 1) {
      return [text(", "), formatted]
    } else {
      return [text(", and "), formatted]
    }
});
}

export const formatterDefault: Formatter = (entry: EntryObject) => {
  const title = optional(entry.fields.title, title =>
    span("field-title", [link("url", "", [text(formatTextValues(title))])])
  );
  const date = optional(entry.fields.date, date =>
    span("field-date", [text(date)])
  );

  return [title, date];
}

const separator = span("separator", [text(". ")]);

const optional = <A,B>(a: A|undefined, f: (a: A) => B): B|null => {
  return a ? f(a) : null;
}

export const formatterArticle: Formatter<"article"|"article-journal"> = (entry) => {
  const author = optional(entry.fields.author, author => 
    span("field-author", [...formatNameValues(author)])
  );
  const title = optional(entry.fields.title, title =>
    span("field-title", [text(formatTextValues(title))])
  );
  const date = optional(entry.fields.date, date =>
    span("field-date", [text(date)])
  );

  const parts = [author, title, date];

  return parts;
}

export const formatterInproceedings: Formatter<"inproceedings"> = (entry) => {
  const author = optional(entry.fields.author, author => 
    span("field-author", [...formatNameValues(author)])
  );
  const title = optional(entry.fields.title, title =>
    span("field-title", [text(formatTextValues(title))])
  );
  const date = optional(entry.fields.date, date =>
    span("field-date", [text(date)])
  );
  const booktitle = optional(entry.fields.booktitle, v =>
    span("field-booktitle", [text(formatTextValues(v))])
  );

  const parts = [author, title, [text("In "), booktitle], date];

  return parts;
}

export const formatterBase: Formatter = (entry: EntryObject) => {
  if(entry.bib_type === "article" || entry.bib_type === "article-journal") { return formatterArticle(entry); }
  if(entry.bib_type === "inproceedings") { return formatterInproceedings(entry); }

  return formatterDefault(entry);
}

export const formatter = (entry: EntryObject): HastElement => {
  console.log(entry.entry_key, entry.bib_type);

  const parts = formatterBase(entry).filter(p => !!p) as (ElementContent|(ElementContent|null)[])[];
  const joined = parts.flatMap(p => {
    if(Array.isArray(p)) {
      return [...p.filter(p => !!p) as ElementContent[], separator];
    } else {
      return [p, separator]
    }
  });

  return {
    type: "element",
    tagName: "div",
    properties: { className: "bib-entry" },
    children: joined
  };
}