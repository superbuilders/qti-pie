/**
 * The generator of `src/session-start.ts`, the record an item session begins with, read from the
 * database (`sessionStartOf`): one read per value sidecar of the ledger, written out from the
 * tables below, since grizzle's types admit no helper generic over a relation's heading. The
 * module is pure but for the runner's `format` it is handed: {@link generator} gives the file's
 * text, its object literals' keys ordered as `sort-keys` reads them ({@link sortKeys}), formatted
 * to oxfmt's fixed point. The runner, `#tools/gen/main.ts`, writes it
 * (`pnpm --filter @qti-pie/ledger generate`) and holds the committed file to it (`generate:check`).
 *
 * @module
 */
import type { Generator, GeneratorTools } from "#tools/gen/generator.ts";

/**
 * The ledger's base types, in the order every table of them is written.
 */
const baseTypes = [
  "Identifier",
  "Boolean",
  "Integer",
  "Float",
  "String",
  "Point",
  "Pair",
  "DirectedPair",
  "Duration",
  "Uri",
  "File",
] as const;

/**
 * A base type, by the name the ledger's sidecars carry.
 */
type BaseType = (typeof baseTypes)[number];

/**
 * Each base type's token: QTI's name for it, and the name of its attachment.
 */
const tokens = {
  Boolean: "boolean",
  DirectedPair: "directedPair",
  Duration: "duration",
  File: "file",
  Float: "float",
  Identifier: "identifier",
  Integer: "integer",
  Pair: "pair",
  Point: "point",
  String: "string",
  Uri: "uri",
} satisfies { readonly [T in BaseType]: string };

/**
 * A heading of the machine's that holds a variable's values.
 */
type ValueHeading =
  | "booleans"
  | "directed_pairs"
  | "files"
  | "floats"
  | "integers"
  | "pairs"
  | "points"
  | "texts";

/**
 * A value column: the machine's name for it, then the ledger's.
 */
type Column = readonly [string, string];

/**
 * Where a base type's values cross to the machine: its heading, whether the heading carries
 * `base`, and its value columns.
 */
type Crossing = Readonly<{ base: boolean; columns: readonly Column[]; heading: ValueHeading }>;

/**
 * Each base type's crossing.
 */
const crossings = {
  Boolean: { base: false, columns: [["value", "value"]], heading: "booleans" },
  DirectedPair: {
    base: false,
    columns: [
      ["source", "source"],
      ["target", "target"],
    ],
    heading: "directed_pairs",
  },
  Duration: { base: true, columns: [["value", "value"]], heading: "floats" },
  File: {
    base: false,
    columns: [
      ["digest", "digest"],
      ["content_type", "type"],
    ],
    heading: "files",
  },
  Float: { base: true, columns: [["value", "value"]], heading: "floats" },
  Identifier: { base: true, columns: [["value", "value"]], heading: "texts" },
  Integer: { base: false, columns: [["value", "value"]], heading: "integers" },
  Pair: {
    base: false,
    columns: [
      ["least", "least"],
      ["greatest", "greatest"],
    ],
    heading: "pairs",
  },
  Point: {
    base: false,
    columns: [
      ["x", "x"],
      ["y", "y"],
    ],
    heading: "points",
  },
  String: { base: true, columns: [["value", "value"]], heading: "texts" },
  Uri: { base: true, columns: [["value", "value"]], heading: "texts" },
} satisfies { readonly [T in BaseType]: Crossing };

/**
 * Each value heading's record-field heading.
 */
const fieldHeadings = {
  booleans: "field_booleans",
  directed_pairs: "field_directed_pairs",
  files: "field_files",
  floats: "field_floats",
  integers: "field_integers",
  pairs: "field_pairs",
  points: "field_points",
  texts: "field_texts",
} satisfies { readonly [H in ValueHeading]: string };

/**
 * The base types whose multiples the ledger keys by their values' bits (grizzle's `floatBits`).
 */
const bitsTypes: ReadonlySet<BaseType> = new Set<BaseType>(["Float", "Duration"]);

/**
 * The machine's value headings the session's stored values cross as, a file's name among them.
 */
const valueHeadings = [
  "texts",
  "integers",
  "floats",
  "booleans",
  "pairs",
  "directed_pairs",
  "points",
  "files",
  "file_names",
] as const;

/**
 * A value heading, a file's name among them.
 */
type Heading = (typeof valueHeadings)[number];

/**
 * Each value heading as the machine's document names its rows.
 */
const documentRows = {
  booleans: "the `doc_booleans` rows",
  directed_pairs: "the `doc_directed_pairs` rows",
  file_names: "the `doc_file_names` rows, each file's name",
  files: "the `doc_files` rows",
  floats: "the `doc_floats` rows",
  integers: "the `doc_integers` rows",
  pairs: "the `doc_pairs` rows",
  points: "the `doc_points` rows",
  texts: "the `doc_texts` rows",
} satisfies { readonly [H in Heading]: string };

/**
 * Each rule that sets a session's value, by its kind, and what the machine holds it as.
 */
const holders = [
  ["template", "value"],
  ["correct", "correct"],
  ["default", "default"],
] as const;

/**
 * The cardinalities the ledger's sidecars hold a value in, a record's apart.
 */
const cardinalities = ["Single", "Multiple", "Ordered"] as const;

/**
 * A cardinality, a record's apart.
 */
type Cardinality = (typeof cardinalities)[number];

/**
 * A snake-case name in camel case.
 *
 * @param name The name.
 * @returns Its camel case.
 */
const camel = (name: string) => {
  const [first = "", ...rest] = name.split("_");

  return first + rest.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
};

/**
 * A snake-case name in Pascal case.
 *
 * @param name The name.
 * @returns Its Pascal case.
 */
const pascal = (name: string) => {
  const cased = camel(name);

  return cased.charAt(0).toUpperCase() + cased.slice(1);
};

/**
 * A base type's ledger columns.
 *
 * @param type The base type.
 * @returns Its value columns as the ledger's sidecars name them.
 */
const ledgerColumns = (type: BaseType): readonly string[] =>
  type === "File"
    ? ["digest", "name", "type"]
    : crossings[type].columns.map(([, ledger]) => ledger);

/**
 * A crossing's columns as a destructuring or a match names them: the machine's name, renamed to
 * the ledger's where the two differ.
 *
 * @param columns The columns.
 * @returns Their names, comma-separated.
 */
const renamed = (columns: readonly Column[]) =>
  columns
    .map(([machine, ledger]) => (machine === ledger ? machine : `${machine}: ${ledger}`))
    .join(", ");

/**
 * A session's value of one sidecar held one way, as a rule of its heading's source.
 *
 * @param heading The heading.
 * @param type The base type.
 * @param cardinality The cardinality.
 * @param holder The rule's kind, and what the machine holds the value as.
 * @returns The rule's text.
 */
const heldRuleOf = (
  heading: Heading,
  type: BaseType,
  cardinality: Cardinality,
  [kind, held]: (typeof holders)[number],
) => {
  const relation = `fields.ItemSessionValue${cardinality}${type}`;
  const columns = ledgerColumns(type).join(", ");
  const extra = { Multiple: ", count", Ordered: ", place", Single: "" }[cardinality];
  const copy =
    cardinality === "Multiple"
      ? '      const copy = Fn.rows(copies, { count });\n      const { place } = v(copy, "startCopy");\n'
      : "";
  const copyMatch = cardinality === "Multiple" ? "\n        .match(copy, { place })" : "";
  const place =
    cardinality === "Single" ? "place: Type.literal(DocText.fields.place, 0n)" : "place";
  const base =
    crossings[type].base && heading !== "file_names"
      ? `base: Type.literal(DocText.fields.base, "${tokens[type]}"), `
      : "";
  const values = heading === "file_names" ? "name" : renamed(crossings[type].columns);

  return `
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startHeld");
      const { variable, ${columns}${extra} } = v(${relation}, "startHeldValue");
${copy}
      return r
        .match(session, { child, package: pkg, path, stage })
        .match(${relation}, { child, kind: "${kind}", package: pkg, path, stage, variable, ${columns}${extra} })${copyMatch}
        .find({ ${base}child, holds: Type.literal(DocText.fields.holds, "${held}"), identifier: Type.cast(variable, DocText.fields.identifier), package: pkg, path, ${place}, stage, ${values} });
    })`;
};

/**
 * The source of a value heading: every rule of each base type that crosses as it, by cardinality,
 * then by the rule that set the value.
 *
 * @param heading The heading.
 * @returns The source's text.
 */
const valueSourceOf = (heading: Heading) => {
  const rules = baseTypes
    .filter((type) =>
      heading === "file_names" ? type === "File" : crossings[type].heading === heading,
    )
    .flatMap((type) =>
      cardinalities.flatMap((cardinality) =>
        holders.map((holder) => heldRuleOf(heading, type, cardinality, holder)),
      ),
    )
    .join("");

  return `
  /**
   * The session's values that cross as ${documentRows[heading]}: its template values and the correct
   * responses and defaults its template processing set.
   */
  const ${camel(heading)}Of = query(delivery)${rules};
`;
};

/**
 * The machine's headings the start gives no row of, each with its heading's type and a literal per
 * column: no program, no record field.
 */
const emptySources: readonly (readonly [string, string, readonly (readonly [string, string])[]])[] =
  [
    [
      "programs",
      "ProgramNode",
      [
        ["end", "0n"],
        ["kind", '"qti-response-processing"'],
        ["package", '""'],
        ["parent", "0n"],
        ["path", '""'],
        ["start", "0n"],
      ],
    ],
    [
      "program_attributes",
      "DocumentAttribute",
      [
        ["name", '"identifier"'],
        ["package", '""'],
        ["path", '""'],
        ["start", "0n"],
        ["value", '""'],
      ],
    ],
    [
      "program_texts",
      "DocumentText",
      [
        ["package", '""'],
        ["path", '""'],
        ["start", "0n"],
        ["text", '""'],
      ],
    ],
    [
      "field_texts",
      "DocFieldText",
      [
        ["base", '"identifier"'],
        ["field", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
        ["value", '"x"'],
      ],
    ],
    [
      "field_integers",
      "DocFieldInteger",
      [
        ["field", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
        ["value", "0n"],
      ],
    ],
    [
      "field_floats",
      "DocFieldFloat",
      [
        ["base", '"float"'],
        ["field", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
        ["value", "0"],
      ],
    ],
    [
      "field_booleans",
      "DocFieldBoolean",
      [
        ["field", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
        ["value", "false"],
      ],
    ],
    [
      "field_pairs",
      "DocFieldPair",
      [
        ["field", '""'],
        ["greatest", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["least", '""'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
      ],
    ],
    [
      "field_directed_pairs",
      "DocFieldDirectedPair",
      [
        ["field", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
        ["source", '""'],
        ["target", '""'],
      ],
    ],
    [
      "field_points",
      "DocFieldPoint",
      [
        ["field", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
        ["x", "0n"],
        ["y", "0n"],
      ],
    ],
    [
      "field_files",
      "DocFieldFile",
      [
        ["content_type", '""'],
        ["digest", "Sha256.ofBytes(new Uint8Array(0))"],
        ["field", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
      ],
    ],
    [
      "field_file_names",
      "DocFieldFileName",
      [
        ["field", '""'],
        ["holds", '"value"'],
        ["identifier", '"RESPONSE"'],
        ["name", '""'],
        ["child", '"x"'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
      ],
    ],
    [
      "reply_floats",
      "DocReplyFloat",
      [
        ["child", '"x"'],
        ["field", '""'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
        ["start", "0n"],
        ["value", "0"],
      ],
    ],
    [
      "reply_texts",
      "DocReplyText",
      [
        ["base", '"identifier"'],
        ["child", '"x"'],
        ["field", '""'],
        ["package", '""'],
        ["path", '""'],
        ["stage", "0n"],
        ["start", "0n"],
        ["value", '"x"'],
      ],
    ],
    [
      "table_bindings",
      "TableBinding",
      [
        ["class", '"rubric-score"'],
        ["identifier", '""'],
        ["place", "0n"],
        ["role", '"stop-words"'],
      ],
    ],
    [
      "table_entries",
      "TableEntry",
      [
        ["identifier", '""'],
        ["key", '""'],
        ["place", "0n"],
      ],
    ],
    [
      "table_values",
      "TableValue",
      [
        ["identifier", '""'],
        ["key", '""'],
        ["value", '""'],
      ],
    ],
  ];

/**
 * The run's arguments that read the session, by the machine's name, each the source above that
 * gives it.
 */
const readArguments: readonly (readonly [string, string])[] = [
  ["bases", "basesOf"],
  ["booleans", "booleansOf"],
  ["declaration_attributes", "declarationAttributesOf"],
  ["declaration_texts", "declarationTextsOf"],
  ["declarations", "declarationsOf"],
  ["directed_pairs", "directedPairsOf"],
  ["file_names", "fileNamesOf"],
  ["files", "filesOf"],
  ["floats", "floatsOf"],
  ["integers", "integersOf"],
  ["pairs", "pairsOf"],
  ["points", "pointsOf"],
  ["runs", "runsOf"],
  ["texts", "textsOf"],
  ["vars", "varsOf"],
];

/**
 * An order of texts by their code points, as `sort-keys` reads keys.
 *
 * @param left A text.
 * @param right Another.
 * @returns Its place before, at or after the other's.
 */
const byCodePoint = (left: string, right: string) => Number(left > right) - Number(left < right);

/**
 * The run's call: every argument the source that gives it, the empty ones among them, by name.
 *
 * @returns The call's text.
 */
const runCall = () => {
  const lines = [
    ...readArguments.map(([name, source]): readonly [string, string] => [
      name,
      `${source}.bind(bound)`,
    ]),
    ...emptySources.map(([name]): readonly [string, string] => [name, `no${pascal(name)}`]),
  ]
    .toSorted(([left], [right]) => byCodePoint(left, right))
    .map(([name, source]) => `      ${name}: ${source},\n`)
    .join("");

  return `
  /**
   * The machine's run of a session's start: one call, every argument a query over the session's
   * key, each bound to the parent row's terms through its own \`bind\`, so a read's call is one
   * evaluation for its one parent row.
   *
   * @param key The session's key, a parent row's terms.
   * @returns The run's fields, each a source a read matches.
   */
  const runOf = (key: StartedKey) => {
    const bound = { child: key.child, n: key.n, package: key.package, path: key.path };

    return Fn.row(responseProcessingOf, {
${lines}    });
  };
`;
};

/**
 * The read of a start value of one cardinality and base type, attached under the session's row.
 *
 * @param cardinality The cardinality, or a record's.
 * @param type The base type.
 * @returns The read's text.
 */
const startReadOf = (cardinality: Cardinality | "Record", type: BaseType) => {
  const { base: hasBase, columns, heading } = crossings[type];
  const ledger = ledgerColumns(type).join(", ");
  const card = cardinality.toLowerCase();
  const runKey = "child: key.child, package: key.package, path: key.path, stage: key.stage";
  const base = hasBase ? `base: "${tokens[type]}", ` : "";
  if (cardinality === "Record") {
    const fieldHeading = fieldHeadings[heading];
    if (type === "File") {
      return `(key: StartedKey) =>
    query(delivery).rule((r) => {
      const run = runOf(key);
      const { identifier, kind } = v(run.vars, "startVar");
      const { field, digest, content_type: type } = v(run.field_files, "startFieldFile");
      const { name } = v(run.field_file_names, "startFieldName");

      return r
        .match(run.vars, { card: "record", holds: "value", identifier, kind, ${runKey} })
        .match(run.field_files, { content_type: type, digest, field, holds: "value", identifier, ${runKey} })
        .match(run.field_file_names, { field, holds: "value", identifier, name, ${runKey} })
        .where(r.ne(kind, "context"))
        .find({ digest, field, name, type, variable: identifier });
    })`;
    }

    return `(key: StartedKey) =>
    query(delivery).rule((r) => {
      const run = runOf(key);
      const { identifier, kind } = v(run.vars, "startVar");
      const { field, ${renamed(columns)} } = v(run.${fieldHeading}, "startField");

      return r
        .match(run.vars, { card: "record", holds: "value", identifier, kind, ${runKey} })
        .match(run.${fieldHeading}, { ${base}field, holds: "value", identifier, ${runKey}, ${renamed(columns)} })
        .where(r.ne(kind, "context"))
        .find({ field, ${ledger}, variable: identifier });
    })`;
  }

  const binding =
    type === "File"
      ? `      const { digest, content_type: type, place } = v(run.files, "startFile");
      const { name } = v(run.file_names, "startFileName");
`
      : `      const { ${renamed(columns)}, place } = v(run.${heading}, "startValue");
`;
  const valueMatch =
    type === "File"
      ? `
        .match(run.files, { content_type: type, digest, holds: "value", identifier, package: pkg, path, place })
        .match(run.file_names, { holds: "value", identifier, name, package: pkg, path, place })`
      : `
        .match(run.${heading}, { ${base}holds: "value", identifier, package: pkg, path, place, ${renamed(columns)} })`;
  const keyed = valueMatch.replaceAll("package: pkg, path", runKey);
  const varsMatch = `.match(run.vars, { card: "${card}", holds: "value", identifier, kind, ${runKey} })`;
  if (cardinality === "Single") {
    const atZero = keyed
      .replaceAll(", place }", ", place: 0n }")
      .replaceAll(", place, ", ", place: 0n, ");

    return `(key: StartedKey) =>
    query(delivery).rule((r) => {
      const run = runOf(key);
      const { identifier, kind } = v(run.vars, "startVar");
${binding.replaceAll(", place }", " }")}
      return r
        ${varsMatch}${atZero}
        .where(r.ne(kind, "context"))
        .find({ ${ledger}, variable: identifier });
    })`;
  }

  if (cardinality === "Ordered") {
    return `(key: StartedKey) =>
    query(delivery).rule((r) => {
      const run = runOf(key);
      const { identifier, kind } = v(run.vars, "startVar");
${binding}
      return r
        ${varsMatch}${keyed}
        .where(r.ne(kind, "context"))
        .find({ ${ledger}, place, variable: identifier });
    })`;
  }

  const bits = bitsTypes.has(type) ? "bits: Num.floatBits(value), " : "";

  return `(key: StartedKey) =>
    query(delivery).rule((r) => {
      const run = runOf(key);
      const { identifier, kind } = v(run.vars, "startVar");
${binding}
      return r
        ${varsMatch}${keyed}
        .where(r.ne(kind, "context"))
        .find({ ${bits}count: r.count(), ${ledger}, variable: identifier });
    })`;
};

/**
 * The read of what template processing set of one cardinality and base type, attached under the
 * session's row.
 *
 * @param cardinality The cardinality.
 * @param type The base type.
 * @returns The read's text.
 */
const setReadOf = (cardinality: Cardinality, type: BaseType) => {
  const relation = `fields.ItemSessionValue${cardinality}${type}`;
  const extra = {
    Multiple: bitsTypes.has(type) ? ["bits", "count"] : ["count"],
    Ordered: ["place"],
    Single: [],
  }[cardinality];
  const columns = [...ledgerColumns(type), ...extra].join(", ");

  return `(key: StartedKey) =>
    query(delivery).rule((r) => {
      const { kind, variable, ${columns} } = v(${relation}, "setValue");

      return r
        .match(${relation}, { child: key.child, kind, package: key.package, path: key.path, stage: key.stage, variable, ${columns} })
        .find({ kind, variable, ${columns} });
    })`;
};

/**
 * What each cardinality's start read says of itself.
 */
const startCardinalities = {
  Multiple: "its multiples' distinct values, each with its count",
  Ordered: "its ordereds' values, each at its place",
  Record: "its records' fields, each by its field",
  Single: "its singles",
} as const;

/**
 * The start's reads of one cardinality, or what template processing set of it: one attachment per
 * base type, by its token.
 *
 * @param name The read's name.
 * @param description What it gives.
 * @param readOf Each base type's read.
 * @returns The reads' text.
 */
const attachedReadsOf = (name: string, description: string, readOf: (type: BaseType) => string) => {
  const attached = baseTypes
    .map(
      (type) => `
      .attach("${tokens[type]}", ${readOf(type)}, "array")`,
    )
    .join("");

  return `
  /**
   * ${description}
   */
  const ${name} = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))${attached};
`;
};

/**
 * The text of `src/session-start.ts` before its keys are ordered and it is formatted.
 *
 * @returns The text.
 */
const source = () =>
  [
    `/**
 * The record an item session begins with, read from the database (\`sessionStartOf\`): its variables
 * before its first attempt, before any
 * response processing runs, which its page shows before that attempt and a review shows where it
 * hides feedback, and what its template processing set.
 * Derived in the statement that reads it and never stored; nothing in TypeScript computes a value
 * of it (Bjorn, 2026-11-18: "ZERO GRADING IN TS ALLOWED").
 *
 * - **The start** (\`single\`, \`multiple\`, \`ordered\`, \`record\`): the machine's flat entry
 *   (\`#ledger/grading.ts\` \`responseProcessingOf\`) run over the
 *   session's item with no program, so its state is the one \`response_state\` gives unrun: "No
 *   program, no run: the values stand as they start", \`start_of\`'s variables. Each declared outcome
 *   at its default in force (the session's template-set default, else the declared one), a numeric
 *   single with none at 0 (QTI 3.0.1 Table 4.5), \`completionStatus\` at \`unknown\` (information model
 *   §2.2.2.3: its value "at the start of the first attempt"), each template variable at the value
 *   the session's template processing set, else its declared default, and each response NULL, no
 *   row: no attempt has begun, and a session never attempted keeps its responses NULL, "the default
 *   value is never used" (QTI 3.0.1 Table 5.115; the machine's \`start_of\` gives a response its
 *   default only at a given \`numAttempts\` past 0). The record at the start of the first attempt,
 *   its responses at their defaults in force, is another read (\`numAttempts\` 1), not this one.
 *   Every value of a variable
 *   that is no context, by its shape then its base type, as an attempt's value rows are read
 *   (\`#ledger/served-values.ts\` \`ValueRows\`): a single's row, a multiple's distinct values each with
 *   its \`count\` (a float's or a duration's by its \`bits\`, grizzle's \`floatBits\`, as the ledger keys
 *   one), an ordered's at its \`place\` and a record's fields by \`field\`.
 * - **What template processing set** (\`set\`): the session's stored values (\`ItemSessionValue\` and
 *   its sidecars), each by the rule that set it (\`kind\`: \`template\`, \`correct\` or \`default\`), its
 *   header (\`variables\`) beside its value rows, so a value set to NULL has its header and no row:
 *   the record's \`templates\`, \`correct\` and \`defaults\` (plate's \`ItemRecord\`), read as stored.
 *
 * The machine is given the session as \`gradeArgumentsOf\` gives a graded attempt's
 * (\`#ledger/grade.ts\`): the item's declarations of the kinds the machine reads, with their
 * attributes and each \`qti-value\`'s string value, and the session's template values held \`value\`,
 * the correct responses and defaults its template processing set held \`correct\` and \`default\`; no
 * response, \`numAttempts\` or completion status, since no attempt has begun. Its run's seed is the
 * session's (\`SessionSeed\`) and its label the first attempt's (\`responseLabel\` of 1), which a state
 * no program ran never reads. The take stores nothing of a record (\`#ledger/grade.ts\`
 * \`takeValuesOf\`: a record has no session sidecar), so no record field is given.
 *
 * Every read is keyed by the session its parent row carries (\`StartedKey\`: child, package, path,
 * place), bound to that row's terms, and adds no parameter to the reading statement: the record is
 * that session's own, a fact keyed by its owner, never "the child's latest session of the item".
 * \`sessionStartOf\` attaches it under a read of one item session (edullm's \`servedItem\`, its
 * decideStage's read-back of the sessions it took, and \`sittingItem\`). Each read's call is one
 * evaluation for its one parent row.
 *
 * Grizzle's types admit no helper generic over a relation's heading, so each sidecar's read is
 * written out, generated from one table by \`tools/gen/session-start.ts\`. Regenerate it with
 * \`pnpm --filter @qti-pie/ledger generate\`; \`generate:check\` holds it to its generator, so a
 * change is made there, never here.
 *
 * @module
 */
import type { Facts, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { Fn, Num, param, query, Sha256, Type, v } from "@bjornpagen/grizzle";
import type { deliveryOf } from "#ledger/delivery.ts";
import {
  copies,
  DocFieldBoolean,
  DocFieldDirectedPair,
  DocFieldFile,
  DocFieldFileName,
  DocFieldFloat,
  DocFieldInteger,
  DocFieldPair,
  DocFieldPoint,
  DocFieldText,
  DocReplyFloat,
  DocReplyText,
  DocText,
  DocumentAttribute,
  DocumentText,
  DocVar,
  ProgramNode,
  responseLabel,
  responseProcessingOf,
  seedStreamKey,
  TableBinding,
  TableEntry,
  TableValue,
} from "#ledger/grading.ts";
import { LearnerId } from "#ledger/keys.ts";

/**
 * The Delivery level, whose relations the start reads.
 */
type DeliveryLevel = ReturnType<typeof deliveryOf>;

/**
 * A text field as a parent row carries it to the reads attached to it.
 */
type TextTerm = Term<string, unknown, unknown, "text", unknown, Facts, unknown>;

/**
 * An item session's place as a parent row carries it.
 */
type NaturalTerm = Term<NaturalDomain, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * A stage's key as a parent row carries it.
 */
type BigintTerm = Term<bigint, unknown, unknown, "bigint", unknown, Facts, unknown>;

/**
 * An item session's key as a parent row carries it: its child, its item, its place and its stage.
 */
export type StartedKey = Readonly<{
  child: TextTerm;
  n: NaturalTerm;
  package: TextTerm;
  path: TextTerm;
  stage: BigintTerm;
}>;

/**
 * An item session's key alone, out of a row that carries it.
 *
 * @param key The row.
 * @returns Its child, item, place and stage.
 */
const keyOf = (key: StartedKey) => ({
  child: key.child,
  n: key.n,
  package: key.package,
  path: key.path,
  stage: key.stage,
});

/**
 * Give the reads of the record one item session begins with, over the Delivery level, each to attach
 * under a parent row that carries the session's key ({@link StartedKey}): the session's own record,
 * whatever else its child holds, and no parameter of the reading statement's.
 *
 * @param delivery The Delivery level.
 * @returns The session's \`single\`, \`multiple\`, \`ordered\` and \`record\` value rows and \`set\`, what
 *   its template processing set, each a read of the parent row's session.
 */
const startReadsOf = (delivery: DeliveryLevel) => {
  const fields = delivery.relations;

  /**
   * A session's key as parameters, which each read binds to its parent row's terms.
   */
  const keyed = {
    child: param("child", LearnerId),
    n: param("n", fields.ItemSession.fields.n),
    package: param("package", fields.ItemSession.fields.package),
    path: param("path", fields.ItemSession.fields.path),
  } as const;

  /**
   * The session, by its key, with its stage and the seed its processing draws under.
   */
  const startedOf = query(delivery).rule((r) => {
    const { stage } = v(fields.ItemSession, "startSession");
    const { seed } = v(fields.SessionSeed, "startSeed");

    return r
      .match(fields.ItemSession, {
        child: keyed.child,
        n: keyed.n,
        package: keyed.package,
        path: keyed.path,
        stage,
      })
      .match(fields.SessionSeed, {
        child: keyed.child,
        package: keyed.package,
        path: keyed.path,
        seed,
        stage,
      })
      .find({ child: keyed.child, package: keyed.package, path: keyed.path, seed, stage });
  });

  /**
   * The run: the session's run key (child, package, path, stage), its seed and the first attempt's
   * label.
   */
  const runsOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { child, package: pkg, path, seed, stage } = v(session, "startRun");

    return r
      .match(session, { child, package: pkg, path, seed, stage })
      .find({
        child,
        label: Fn.call(responseLabel, { attempts: 1n }),
        package: pkg,
        path,
        seed: Fn.call(seedStreamKey, { seed }),
        stage,
      });
  });

  /**
   * The item's declarations' nodes of the kinds the machine reads.
   */
  const declarationsOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { package: pkg, path: item } = v(session, "startDeclared");
    const { start, end, parent, kind } = v(fields.Node, "startNode");
    const { token } = v(fields.DeclarationNodeKind, "startNodeKind");

    return r
      .match(session, { package: pkg, path: item })
      .match(fields.Node, { end, kind, package: pkg, parent, path: item, start })
      .match(fields.DeclarationNodeKind, { kind, token })
      .find({ end, kind: token, package: pkg, parent, path: item, start });
  });

  /**
   * Their attributes the machine reads.
   */
  const declarationAttributesOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { package: pkg, path: item } = v(session, "startAttributed");
    const { start, kind } = v(fields.Node, "startAttributedNode");
    const { name, value } = v(fields.Attribute, "startAttribute");
    const { token } = v(fields.GradedAttributeName, "startAttributeName");

    return r
      .match(session, { package: pkg, path: item })
      .match(fields.Node, { kind, package: pkg, path: item, start })
      .match(fields.DeclarationNodeKind, { kind })
      .match(fields.Attribute, { name, package: pkg, path: item, start, value })
      .match(fields.GradedAttributeName, { name, token })
      .find({ name: token, package: pkg, path: item, start, value });
  });

  /**
   * Each qti-value's string value.
   */
  const declarationTextsOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { package: pkg, path: item } = v(session, "startTexted");
    const { start, stringValue } = v(fields.Node, "startValueNode");

    return r
      .match(session, { package: pkg, path: item })
      .match(fields.Node, { kind: "qti-value", package: pkg, path: item, start, stringValue })
      .find({ package: pkg, path: item, start, text: stringValue });
  });

  /**
   * Each declared typed variable's base type, built-ins included.
   */
  const basesOf = query(delivery).rule((r) => {
    const session = startedOf.bind(keyed);
    const { child, package: pkg, path, stage } = v(session, "startTyped");
    const { identifier, baseType } = v(fields.ItemSessionVariable, "startTypedVariable");
    const { token: base } = v(fields.BaseTypeToken, "startBase");

    return r
      .match(session, { child, package: pkg, path, stage })
      .match(fields.ItemSessionVariable, { baseType, identifier, package: pkg, path })
      .match(fields.BaseTypeToken, { baseType, token: base })
      .find({ base, child, identifier, package: pkg, path, stage });
  });
`,
    `
  /**
   * The variables the run is given: each value the session's template processing set, held as the
   * rule that set it says, with its kind and cardinality.
   */
  const varsOf = query(delivery)`,
    ...holders.map(
      ([kind, held]) => `
    .rule((r) => {
      const session = startedOf.bind(keyed);
      const { child, package: pkg, path, stage } = v(session, "startSet");
      const { variable } = v(fields.ItemSessionValue, "startSetValue");
      const { cardinality, declarationKind } = v(fields.ItemSessionVariable, "startSetDeclared");
      const { token: card } = v(fields.CardinalityToken, "startSetCard");
      const { token: kind } = v(fields.VariableKindToken, "startSetKind");

      return r
        .match(session, { child, package: pkg, path, stage })
        .match(fields.ItemSessionValue, { child, kind: "${kind}", package: pkg, path, stage, variable })
        .match(fields.ItemSessionVariable, {
          cardinality,
          declarationKind,
          identifier: variable,
          package: pkg,
          path,
        })
        .match(fields.CardinalityToken, { cardinality, token: card })
        .match(fields.VariableKindToken, { declarationKind, token: kind })
        .find({
          card,
          child,
          holds: Type.literal(DocVar.fields.holds, "${held}"),
          identifier: Type.cast(variable, DocVar.fields.identifier),
          kind,
          package: pkg,
          path,
          stage,
        });
    })`,
    ),
    ";\n",
    ...valueHeadings.map((heading) => valueSourceOf(heading)),
    `
  /**
   * A source of no rows of a heading of the machine's: the start runs no program (\`response_state\`:
   * "No program, no run: the values stand as they start"), so it reads no operator's reply and no
   * table, and template processing sets no record field, so these arguments hold none. Its row is
   * never read: \`r.or()\` matches no row.
   */
`,
    ...emptySources.map(([name, heading, columns]) => {
      const literals = columns
        .map(
          ([column, literal]) => `${column}: Type.literal(${heading}.fields.${column}, ${literal})`,
        )
        .join(", ");

      return `  const no${pascal(name)} = query(delivery).rule((r) => r.where(r.or()).find({ ${literals} }));
`;
    }),
    runCall(),
    ...(["Single", "Multiple", "Ordered", "Record"] as const).map((cardinality) =>
      attachedReadsOf(
        `start${cardinality}s`,
        `The start's values of one shape, ${startCardinalities[cardinality]}: one array per base type, by the base type's name.`,
        (type) => startReadOf(cardinality, type),
      ),
    ),
    ...cardinalities.map((cardinality) =>
      attachedReadsOf(
        `set${cardinality}s`,
        `What the session's template processing set, of one shape, ${startCardinalities[cardinality]}, each by the rule that set
   * it: one array per base type, by the base type's name.`,
        (type) => setReadOf(cardinality, type),
      ),
    ),
    `
  /**
   * Each variable the session's template processing set, by the rule that set it: the headers of
   * its values, a NULL one's among them, which has no value row.
   */
  const setVariables = (key: StartedKey) =>
    query(delivery).rule((r) => {
      const { kind, variable } = v(fields.ItemSessionValue, "setHeader");

      return r
        .match(fields.ItemSessionValue, {
          child: key.child,
          kind,
          package: key.package,
          path: key.path,
          stage: key.stage,
          variable,
        })
        .find({ kind, variable });
    });

  /**
   * What the session's template processing set: its headers and its value rows, by shape.
   */
  const setOf = (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach("variables", setVariables, "array")
      .attach("single", setSingles, "array")
      .attach("multiple", setMultiples, "array")
      .attach("ordered", setOrdereds, "array");

  return {
    multiple: startMultiples,
    ordered: startOrdereds,
    record: startRecords,
    set: setOf,
    single: startSingles,
  } as const;
};

/**
 * Give the record an item session begins with, as a read to attach under an application's read of
 * one item session, by the session's key its parent row carries (edullm's \`servedItem\`,
 * decideStage's read-back and \`sittingItem\`): the session's own, never another of its child's,
 * and no parameter of the reading statement's.
 *
 * @param delivery The Delivery level.
 * @returns The session's start, an \`"array"\` attachment of one row: its \`single\`, \`multiple\`,
 *   \`ordered\` and \`record\` value rows, and \`set\`, what its template processing set.
 */
export const sessionStartOf = (delivery: DeliveryLevel) => {
  const fields = delivery.relations;
  const reads = startReadsOf(delivery);

  return (session: StartedKey) =>
    query(delivery)
      .rule((r) => r.match(fields.ItemSession, keyOf(session)).find(keyOf(session)))
      .attach("single", reads.single, "array")
      .attach("multiple", reads.multiple, "array")
      .attach("ordered", reads.ordered, "array")
      .attach("record", reads.record, "array")
      .attach("set", reads.set, "array");
};
`,
  ].join("");

/**
 * The index of the quote that ends the string opened at `open`, past escapes.
 *
 * @param text The text.
 * @param open The opening quote's index.
 * @returns The closing quote's index, or the text's end.
 */
const endOfString = (text: string, open: number) => {
  const quote = text.charAt(open);
  let at = open + 1;
  while (at < text.length && text.charAt(at) !== quote) {
    at += text.charAt(at) === "\\" ? 2 : 1;
  }

  return at;
};

/**
 * The index of the bracket that closes the one at `open`, past strings and template literals; the
 * text's end where none does, which the generator's own text never reaches.
 *
 * @param text The text.
 * @param open The opening bracket's index.
 * @returns The closing bracket's index.
 */
const closing = (text: string, open: number) => {
  let depth = 0;
  let at = open;
  while (at < text.length) {
    const char = text.charAt(at);
    if (char === '"' || char === "'" || char === "`") {
      at = endOfString(text, at);
    } else if (char === "(" || char === "[" || char === "{") {
      depth += 1;
    } else if (char === ")" || char === "]" || char === "}") {
      depth -= 1;
      if (depth === 0) {
        return at;
      }
    }

    at += 1;
  }

  return text.length;
};

/**
 * An object's entries, split at its top-level commas, each trimmed, the empty ones dropped.
 *
 * @param body The object's text inside its braces.
 * @returns Its entries.
 */
const entriesOf = (body: string) => {
  const entries: string[] = [];
  let depth = 0;
  let start = 0;
  let at = 0;
  while (at < body.length) {
    const char = body.charAt(at);
    if (char === '"' || char === "'" || char === "`") {
      at = endOfString(body, at);
    } else if (char === "(" || char === "[" || char === "{") {
      depth += 1;
    } else if (char === ")" || char === "]" || char === "}") {
      depth -= 1;
    } else if (char === "," && depth === 0) {
      entries.push(body.slice(start, at));
      start = at + 1;
    }

    at += 1;
  }
  entries.push(body.slice(start));

  return entries.map((entry) => entry.trim()).filter((entry) => entry !== "");
};

/**
 * An entry's key: its name before a top-level `:`, or a shorthand's name; none for anything else
 * (a spread, a computed key).
 *
 * @param entry The entry.
 * @returns Its key, if it has one.
 */
const keyOf = (entry: string): string | undefined =>
  /^(?<key>[A-Za-z_$][\w$]*)\s*:/u.exec(entry)?.groups?.["key"] ??
  /^(?<key>[A-Za-z_$][\w$]*)$/u.exec(entry)?.groups?.["key"];

/**
 * Whether the brace at `open` begins an object expression: no destructuring pattern, no function's
 * block and no type.
 *
 * @param text The text.
 * @param open The brace's index.
 * @returns Whether it does.
 */
const isObjectExpression = (text: string, open: number) => {
  const before = text.slice(0, open).trimEnd();
  if (/(?:const|let|var)\s*$/u.test(before) || before.endsWith("=>") || before.endsWith(")")) {
    return false;
  }

  if (before.endsWith("=") && !["==", "=>", "!=", "<=", ">="].some((end) => before.endsWith(end))) {
    const statement = before.slice(before.lastIndexOf("\n") + 1).trimStart();

    return !["type ", "export type ", "interface ", "export interface "].some((start) =>
      statement.startsWith(start),
    );
  }

  return ["(", ",", ":", "[", "return", "?", "=>{"].some((end) => before.endsWith(end));
};

/**
 * Every object expression's keys in `sort-keys` order (ascending by code point), innermost first;
 * an object with an entry of no key, or a key twice, is left as written.
 *
 * @param text The text.
 * @returns The text with its objects' keys ordered.
 */
const sortObjects = (text: string): string => {
  const parts: string[] = [];
  let at = 0;
  while (at < text.length) {
    const char = text.charAt(at);
    if (char === "{" && isObjectExpression(text, at)) {
      const end = closing(text, at);
      const inner = sortObjects(text.slice(at + 1, end));
      const entries = entriesOf(inner);
      const keys = entries.map((entry) => keyOf(entry));
      const keyed = entries.flatMap((entry, k) => {
        const key = keys[k];

        return key === undefined ? [] : [[key, entry] as const];
      });
      parts.push(
        entries.length > 0 && keyed.length === entries.length && new Set(keys).size === keys.length
          ? `{ ${keyed
              .toSorted(([left], [right]) => byCodePoint(left, right))
              .map(([, entry]) => entry)
              .join(", ")} }`
          : `{${inner}}`,
      );
      at = end + 1;
    } else if (char === '"' || char === "'" || char === "`") {
      const end = endOfString(text, at);
      parts.push(text.slice(at, end + 1));
      at = end + 1;
    } else {
      parts.push(char);
      at += 1;
    }
  }

  return parts.join("");
};

/**
 * What stands for a comment line while the keys are ordered: a private-use character, which the
 * generator's text never holds, around the line's place among the comments.
 */
const marker = "\u{E000}";

/**
 * A text's object literals' keys in `sort-keys` order, after its imports: each comment line is held
 * out of the sort, since comments hold braces (`{@link …}`).
 *
 * @param text The text.
 * @returns The text with its keys ordered.
 */
export const sortKeys = (text: string) => {
  const lines = text.split("\n");
  const firstImport = lines.findIndex((line) => line.startsWith("import"));
  const head = firstImport === -1 ? lines.length : firstImport;
  const comments: string[] = [];
  const masked = lines.slice(head).map((line) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("*") || trimmed.startsWith("/*") || trimmed.startsWith("//")) {
      comments.push(line);

      return `${marker}${String(comments.length - 1)}${marker}`;
    }

    return line;
  });
  const sorted = sortObjects(masked.join("\n"))
    .split(marker)
    .map((part, k) => (k % 2 === 0 ? part : (comments[Number(part)] ?? "")))
    .join("");

  return `${lines.slice(0, head).join("\n")}\n${sorted}`;
};

/**
 * A text formatted to oxfmt's fixed point: one pass of the runner's `format` at a time, until a
 * pass changes nothing (oxfmt reflows this file's comments over two).
 *
 * @param format The runner's one pass.
 * @param text The text.
 * @returns The text no pass changes.
 */
const fixedPoint = async (format: GeneratorTools["format"], text: string): Promise<string> => {
  const next = await format(text);

  return next === text ? text : await fixedPoint(format, next);
};

/**
 * The generator of `src/session-start.ts`: its target, under the ledger package, and its text, its
 * keys ordered and formatted to oxfmt's fixed point. It reads no file: its text is written from the
 * tables above alone, and the imports it writes are the generated file's own, not this module's.
 */
export const generator: Generator = {
  generate: ({ format }) => fixedPoint(format, sortKeys(source())),
  reads: [],
  target: "src/session-start.ts",
};
