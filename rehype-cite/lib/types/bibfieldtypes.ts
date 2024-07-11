export type languageOptions = [
  "catalan",
  "croatian",
  "czech",
  "danish",
  "dutch",
  "english",
  "american",
  "finnish",
  "french",
  "german",
  "greek",
  "italian",
  "latin",
  "norwegian",
  "polish",
  "portuguese",
  "brazilian",
  "russian",
  "slovene",
  "spanish",
  "swedish",
][number];

/** A list of supported languages (without aliases)  in the langid field */
type langidOptions = {
    acadian: {
        csl: "fr-CA",
        biblatex: "acadian",
    },
    afrikaans: {
        csl: "af-ZA",
        biblatex: "afrikaans",
    },
    arabic: {
        csl: "ar",
        biblatex: "arabic",
    },
    basque: {
        csl: "eu",
        biblatex: "basque",
    },
    bulgarian: {
        csl: "bg-BG",
        biblatex: "bulgarian",
    },
    catalan: {
        csl: "ca-AD",
        biblatex: "catalan",
    },
    chinese: {
        csl: "zh-CN",
        biblatex: "pinyin",
    },
    croatian: {
        csl: "hr-HR",
        biblatex: "croatian",
    },
    czech: {
        csl: "cs-CZ",
        biblatex: "czech",
    },
    danish: {
        csl: "da-DK",
        biblatex: "danish",
    },
    dutch: {
        csl: "nl-NL",
        biblatex: "dutch",
    },
    auenglish: {
        csl: "en-GB",
        biblatex: "australian",
    },
    caenglish: {
        csl: "en-US",
        biblatex: "canadian",
    },
    nzenglish: {
        csl: "en-GB",
        biblatex: "newzealand",
    },
    ukenglish: {
        csl: "en-GB",
        biblatex: "ukenglish",
    },
    usenglish: {
        csl: "en-US",
        biblatex: "usenglish",
    },
    estonian: {
        csl: "et-EE",
        biblatex: "estonian",
    },
    finnish: {
        csl: "fi-FI",
        biblatex: "finnish",
    },
    french: {
        csl: "fr-FR",
        biblatex: "french",
    },
    cafrench: {
        csl: "fr-CA",
        biblatex: "canadien",
    },
    german: {
        csl: "de-DE",
        biblatex: "ngerman",
    },
    atgerman: {
        csl: "de-AT",
        biblatex: "naustrian",
    },
    greek: {
        csl: "el-GR",
        biblatex: "greek",
    },
    hebrew: {
        csl: "he-IL",
        biblatex: "hebrew",
    },
    hungarian: {
        csl: "hu-HU",
        biblatex: "hungarian",
    },
    icelandic: {
        csl: "is-IS",
        biblatex: "icelandic",
    },
    italian: {
        csl: "it-IT",
        biblatex: "italian",
    },
    japanese: {
        csl: "ja-JP",
        biblatex: "japanese",
    },
    latin: {
        csl: "la",
        biblatex: "latin",
    },
    latvian: {
        csl: "lv-LV",
        biblatex: "latvian",
    },
    lithuanian: {
        csl: "lt-LT",
        biblatex: "lithuanian",
    },
    magyar: {
        csl: "hu-HU",
        biblatex: "magyar",
    },
    mongolian: {
        csl: "mn-MN",
        biblatex: "mongolian",
    },
    norwegian: {
        csl: "nb-NO",
        biblatex: "norsk",
    },
    newnorwegian: {
        csl: "nn-NO",
        biblatex: "nynorsk",
    },
    farsi: {
        csl: "fa-IR",
        biblatex: "farsi",
    },
    polish: {
        csl: "pl-PL",
        biblatex: "polish",
    },
    portuguese: {
        csl: "pt-PT",
        biblatex: "portuguese",
    },
    brportuguese: {
        csl: "pt-BR",
        biblatex: "brazilian",
    },
    romanian: {
        csl: "ro-RO",
        biblatex: "romanian",
    },
    russian: {
        csl: "ru-RU",
        biblatex: "russian",
    },
    serbian: {
        csl: "sr-RS",
        biblatex: "serbian",
    },
    cyrillicserbian: {
        csl: "sr-RS",
        biblatex: "serbianc",
    },
    slovak: {
        csl: "sk-SK",
        biblatex: "slovak",
    },
    slovene: {
        csl: "sl-SL",
        biblatex: "slovene",
    },
    spanish: {
        csl: "es-ES",
        biblatex: "spanish",
    },
    swedish: {
        csl: "sv-SE",
        biblatex: "swedish",
    },
    thai: {
        csl: "th-TH",
        biblatex: "thai",
    },
    turkish: {
        csl: "tr-TR",
        biblatex: "turkish",
    },
    ukrainian: {
        csl: "uk-UA",
        biblatex: "ukrainian",
    },
    vietnamese: {
        csl: "vi-VN",
        biblatex: "vietnamese",
    },
}

type pubstateOptions = {
    inpreparation: {
        csl: "in preparation",
        biblatex: "inpreparation",
    },
    submitted: {
        csl: "submitted",
        biblatex: "submitted",
    },
    forthcoming: {
        csl: "forthcoming",
        biblatex: "forthcoming",
    },
    inpress: {
        csl: "in press",
        biblatex: "inpress",
    },
    prepublished: {
        csl: "prepublished",
        biblatex: "prepublished",
    },
}

export interface LangidOptions {
    [key: string]: {
        csl: string
        biblatex: string
    }
}

export interface BibFieldType {
    type: string
    biblatex: string
    csl?: string | Record<string, string>
    options?: string[] | LangidOptions
    strict?: boolean
}

/** A list of field types of Bibligraphy DB with lookup by field name. */
export type BibFieldTypes = {
    abstract: {
        type: "f_long_literal",
        biblatex: "abstract",
        csl: "abstract",
    },
    addendum: {
        type: "f_literal",
        biblatex: "addendum",
    },
    afterword: {
        type: "l_name",
        biblatex: "afterword",
    },
    annotation: {
        type: "f_long_literal",
        biblatex: "annotation",
    },
    annotator: {
        type: "l_name",
        biblatex: "annotator",
    },
    author: {
        type: "l_name",
        biblatex: "author",
        csl: "author",
    },
    bookauthor: {
        type: "l_name",
        biblatex: "bookauthor",
        csl: "container-author",
    },
    bookpagination: {
        type: "f_key",
        biblatex: "bookpagination",
        options: ["page", "column", "section", "paragraph", "verse", "line"],
    },
    booksubtitle: {
        type: "f_title",
        biblatex: "booksubtitle",
    },
    booktitle: {
        type: "f_title",
        biblatex: "booktitle",
        csl: "container-title",
    },
    booktitleaddon: {
        type: "f_title",
        biblatex: "booktitleaddon",
    },
    chapter: {
        type: "f_literal",
        biblatex: "chapter",
        csl: "chapter-number",
    },
    commentator: {
        type: "l_name",
        biblatex: "commentator",
    },
    date: {
        type: "f_date",
        biblatex: "date",
        csl: "issued",
    },
    doi: {
        type: "f_verbatim",
        biblatex: "doi",
        csl: "DOI",
    },
    edition: {
        type: "f_integer",
        biblatex: "edition",
        csl: "edition",
    },
    editor: {
        type: "l_name",
        biblatex: "editor",
        csl: "editor",
    },
    editora: {
        type: "l_name",
        biblatex: "editora",
    },
    editorb: {
        type: "l_name",
        biblatex: "editorb",
    },
    editorc: {
        type: "l_name",
        biblatex: "editorc",
    },
    editortype: {
        // Not used
        type: "f_key",
        biblatex: "editortype",
        options: [
            "editor",
            "compiler",
            "founder",
            "continuator",
            "redactor",
            "reviser",
            "collaborator",
        ],
    },
    editoratype: {
        // Not used
        type: "f_key",
        biblatex: "editoratype",
        options: [
            "editor",
            "compiler",
            "founder",
            "continuator",
            "redactor",
            "reviser",
            "collaborator",
        ],
    },
    editorbtype: {
        // Not used
        type: "f_key",
        biblatex: "editorbtype",
        options: [
            "editor",
            "compiler",
            "founder",
            "continuator",
            "redactor",
            "reviser",
            "collaborator",
        ],
    },
    editorctype: {
        // Not used
        type: "f_key",
        biblatex: "editorctype",
        options: [
            "editor",
            "compiler",
            "founder",
            "continuator",
            "redactor",
            "reviser",
            "collaborator",
        ],
    },
    eid: {
        type: "f_literal",
        biblatex: "eid",
    },
    entrysubtype: {
        // Not used
        type: "f_literal",
        biblatex: "entrysubtype",
    },
    eprint: {
        type: "f_verbatim",
        biblatex: "eprint",
    },
    eprintclass: {
        type: "f_literal",
        biblatex: "eprintclass",
    },
    eprinttype: {
        type: "f_literal",
        biblatex: "eprinttype",
    },
    eventdate: {
        type: "f_date",
        biblatex: "eventdate",
        csl: "event-date",
    },
    eventtitle: {
        type: "f_title",
        biblatex: "eventtitle",
        csl: "event",
    },
    file: {
        // Not used
        type: "f_verbatim",
        biblatex: "file",
    },
    foreword: {
        type: "l_name",
        biblatex: "foreword",
    },
    holder: {
        type: "l_name",
        biblatex: "holder",
    },
    howpublished: {
        type: "f_literal",
        biblatex: "howpublished",
        csl: "medium",
    },
    indextitle: {
        // Not used
        type: "f_literal",
        biblatex: "indextitle",
    },
    institution: {
        type: "l_literal",
        biblatex: "institution",
    },
    introduction: {
        type: "l_name",
        biblatex: "introduction",
    },
    isan: {
        // Not used
        type: "f_literal",
        biblatex: "isan",
        csl: "number",
    },
    isbn: {
        type: "f_literal",
        biblatex: "isbn",
        csl: "ISBN",
    },
    ismn: {
        // Not used
        type: "f_literal",
        biblatex: "ismn",
        csl: "number",
    },
    isrn: {
        type: "f_literal",
        biblatex: "isrn",
        csl: "number",
    },
    issn: {
        type: "f_literal",
        biblatex: "issn",
        csl: "ISSN",
    },
    issue: {
        type: "f_literal",
        biblatex: "issue",
        csl: "issue",
    },
    issuesubtitle: {
        type: "f_literal",
        biblatex: "issuesubtitle",
    },
    issuetitle: {
        type: "f_literal",
        biblatex: "issuetitle",
    },
    iswc: {
        // Not used
        type: "f_literal",
        biblatex: "iswc",
        csl: "number",
    },
    journalsubtitle: {
        type: "f_literal",
        biblatex: "journalsubtitle",
    },
    journaltitle: {
        type: "f_title",
        biblatex: "journaltitle",
        csl: "container-title",
    },
    keywords: {
        type: "l_tag",
        biblatex: "keywords",
    },
    label: {
        // Not used
        type: "f_literal",
        biblatex: "label",
    },
    language: {
        type: "l_key",
        biblatex: "language",
        options: languageOptions,
    },
    langid: {
        type: "f_key",
        strict: true, // Does not allow costum strings
        biblatex: "langid",
        csl: "language",
        options: langidOptions,
    },
    library: {
        // Not used
        type: "f_literal",
        biblatex: "library",
    },
    location: {
        type: "l_literal",
        biblatex: "location",
        csl: "publisher-place",
    },
    mainsubtitle: {
        type: "f_title",
        biblatex: "mainsubtitle",
    },
    maintitle: {
        type: "f_title",
        biblatex: "maintitle",
    },
    maintitleaddon: {
        type: "f_title",
        biblatex: "maintitleaddon",
    },
    nameaddon: {
        // Not used
        type: "f_literal",
        biblatex: "nameaddon",
    },
    note: {
        type: "f_literal",
        biblatex: "note",
        csl: "note",
    },
    number: {
        type: "f_literal",
        biblatex: "number",
        csl: {
            "article-journal": "issue",
            patent: "number",
            "*": "collection-number",
        }, // See https://discourse.citationstyles.org/t/issue-number-and-bibtex/1072
    },
    organization: {
        type: "l_literal",
        biblatex: "organization",
    },
    origdate: {
        type: "f_date",
        biblatex: "origdate",
        csl: "original-date",
    },
    origlanguage: {
        type: "f_key",
        biblatex: "origlanguage",
        options: languageOptions,
    },
    origlocation: {
        type: "l_literal",
        biblatex: "origlocation",
        csl: "original-publisher-place",
    },
    origpublisher: {
        type: "l_literal",
        biblatex: "origpublisher",
        csl: "original-publisher",
    },
    origtitle: {
        type: "f_title",
        biblatex: "origtitle",
        csl: "original-title",
    },
    pages: {
        type: "l_range",
        biblatex: "pages",
        csl: "page",
    },
    pagetotal: {
        type: "f_literal",
        biblatex: "pagetotal",
        csl: "number-of-pages",
    },
    pagination: {
        type: "f_key",
        biblatex: "pagination",
        options: ["page", "column", "section", "paragraph", "verse", "line"],
    },
    part: {
        type: "f_literal",
        biblatex: "part",
    },
    publisher: {
        type: "l_literal",
        biblatex: "publisher",
        csl: "publisher",
    },
    pubstate: {
        type: "f_key",
        biblatex: "pubstate",
        csl: "status",
        options: pubstateOptions,
    },
    reprinttitle: {
        // Not used
        type: "f_literal",
        biblatex: "reprinttitle",
    },
    series: {
        type: "f_title",
        biblatex: "series",
        csl: "collection-title",
    },
    shortauthor: {
        // Not used
        type: "l_name",
        biblatex: "shortauthor",
    },
    shorteditor: {
        // Not used
        type: "l_name",
        biblatex: "shorteditor",
    },
    shorthand: {
        // Not used
        type: "f_literal",
        biblatex: "shorthand",
    },
    shorthandintro: {
        // Not used
        type: "f_literal",
        biblatex: "shorthandintro",
    },
    shortjournal: {
        // Not used
        type: "f_title",
        biblatex: "shortjournal",
        csl: "container-title-short",
    },
    shortseries: {
        // Not used
        type: "f_literal",
        biblatex: "shortseries",
    },
    shorttitle: {
        type: "f_title",
        biblatex: "shorttitle",
        csl: "title-short",
    },
    subtitle: {
        type: "f_title",
        biblatex: "subtitle",
    },
    title: {
        type: "f_title",
        biblatex: "title",
        csl: "title",
    },
    titleaddon: {
        type: "f_title",
        biblatex: "titleaddon",
    },
    translator: {
        type: "l_name",
        biblatex: "translator",
        csl: "translator",
    },
    type: {
        type: "f_key",
        biblatex: "type",
        options: [
            "manual",
            "patent",
            "report",
            "thesis",
            "mathesis",
            "phdthesis",
            "candthesis",
            "techreport",
            "resreport",
            "software",
            "datacd",
            "audiocd",
        ],
    },
    url: {
        type: "f_uri",
        biblatex: "url",
        csl: "URL",
    },
    urldate: {
        type: "f_date",
        biblatex: "urldate",
        csl: "accessed",
    },
    venue: {
        type: "f_literal",
        biblatex: "venue",
        csl: "event-place",
    },
    version: {
        type: "f_literal",
        biblatex: "version",
        csl: "version",
    },
    volume: {
        type: "f_literal",
        biblatex: "volume",
        csl: "volume",
    },
    volumes: {
        type: "f_literal",
        biblatex: "volumes",
        csl: "number-of-volumes",
    },
}