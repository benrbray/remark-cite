import { BibLatexParser } from "biblatex-csl-converter"

import type { ElementContent, Element as HastElement} from "hast";
export type { HastElement };

////////////////////////////////////////////////////////////////////////////////

export type EntryObject_Old = ReturnType<BibLatexParser["parse"]>["entries"][number];

export type Formatter<K extends EntryType = EntryType> = (entry: Entry<K>) => (ElementContent|((ElementContent|null)[])|null)[];

////////////////////////////////////////////////////////////////////////////////

import { BibFieldTypes } from "./bibfieldtypes";
import { BibTypes } from "./bibtypes";

export interface BibType {
    order: number
    biblatex: string
    csl: string
    required: string[]
    eitheror: string[]
    optional: string[]
    "biblatex-subtype"?: string
}

// export interface EntryObject {
//     entry_key: string
//     incomplete?: boolean
//     bib_type: string
//     location?: EntryLocation
//     raw_text?: string
//     fields: Record<string, unknown>
//     unexpected_fields?: Record<string, unknown>
//     unknown_fields?: UnknownFieldsObject
// }

/* -------------------------------------------------------------------------- */

export interface MarkObject {
    type: "sub"|"sup"|"nocase"|string
}

export type TextValue = {
  type: "text",
  text: string,
  marks?: MarkObject[],
  attrs?: Record<string, unknown>
};

export type NameValue = {
  literal?: TextValue[]
  family?: TextValue[]
  given?: TextValue[]
  prefix?: TextValue[]
  suffix?: TextValue[]
  useprefix?: boolean
};

/* -------------------------------------------------------------------------- */

type EntryType = keyof BibTypes; 

// type Foo = BibTypes[EntryType]["biblatex"];

/** Union of fields of R which are assignable to C. */
type ExtractCompatible<R extends object, C> = keyof {
  [K in keyof R as R[K] extends C ? K : never]: ""
};

type NameFields = ExtractCompatible<BibFieldTypes, {type: "l_name"}>;

export type FieldValueMap = {
  "date" : string,
  "url" : string,
  "location" : TextValue[][],

  "publisher" : TextValue[][],
  "organization" : TextValue[][],
  "institution" : TextValue[][],
  
  "pages" : [TextValue[], TextValue[]][]
} & { [F in NameFields] : NameValue[] };

type FieldValue<K> = K extends keyof FieldValueMap ? FieldValueMap[K] : TextValue[];

const a: keyof FieldValueMap = "author";
type Foo = FieldValue<"author">;

type GetFields<K,J extends "required"|"optional"|"eitheror"> = K extends EntryType ? {
  [ Field in BibTypes[K][J][number] ] : FieldValue<Field>
} : never;

type RequiredFields<K> = GetFields<K,"required">;
type OptionalFields<K> = GetFields<K,"optional">;
type EitherOrFields<K> = GetFields<K,"eitheror">;

type Fields<K> = Partial<RequiredFields<K>> & Partial<OptionalFields<K>> & Partial<EitherOrFields<K>>;
type AllFields = Fields<EntryType>;

type Entry<K> = K extends EntryType ? {
  entry_key: string,
  bib_type : K,
  fields: Fields<K>,
  incomplete?: boolean,
  raw_text?: string
} : never;

export type EntryObject = Entry<keyof BibTypes>