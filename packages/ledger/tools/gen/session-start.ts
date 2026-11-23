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
 * The base types whose multiples the ledger keys by their values' bits (grizzle's `floatBits`).
 */
const bitsTypes: ReadonlySet<BaseType> = new Set<BaseType>(["Float", "Duration"]);

/**
 * The cardinalities the ledger's sidecars hold a value in, a record's apart.
 */
const cardinalities = ["Single", "Multiple", "Ordered"] as const;

/**
 * A cardinality, a record's apart.
 */
type Cardinality = (typeof cardinalities)[number];

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
 * The read of a start value of one cardinality and base type, attached under the session's row: its
 * Start sidecar by the session's key (its stage, as the take stored it), each value with the
 * columns of its shape.
 *
 * @param cardinality The cardinality, or a record's.
 * @param type The base type.
 * @returns The read's text.
 */
const startReadOf = (cardinality: Cardinality | "Record", type: BaseType) => {
  const relation =
    cardinality === "Record" ? `fields.StartRecord${type}` : `fields.Start${cardinality}${type}`;
  const extra = {
    Multiple: bitsTypes.has(type) ? ["bits", "count"] : ["count"],
    Ordered: ["place"],
    Record: ["field"],
    Single: [],
  }[cardinality];
  const columns = [...ledgerColumns(type), ...extra].join(", ");

  return `(key: StartedKey) =>
    query(delivery).rule((r) => {
      const { variable, ${columns} } = v(${relation}, "startValue");

      return r
        .match(${relation}, { child: key.child, package: key.package, path: key.path, stage: key.stage, variable, ${columns} })
        .find({ variable, ${columns} });
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
 * Computed once, where its inputs become known, at the take, by the SQL grader, and read here by
 * key; nothing in TypeScript computes a value of it (Bjorn, 2026-11-18: "ZERO GRADING IN TS
 * ALLOWED").
 *
 * - **The start** (\`single\`, \`multiple\`, \`ordered\`, \`record\`): what the take stored of it once
 *   (\`#ledger/grade.ts\` \`takeValuesOf\`'s start, COMPILE-AT-PUBLISH S), the Start family by the
 *   session's key, its stage: the machine's flat entry run over the session's item with no program,
 *   so its state is the one \`response_state\` gives unrun, "No program, no run: the values stand as
 *   they start", \`start_of\`'s variables. Each declared outcome at its default in force (the
 *   session's template-set default, else the declared one), a numeric single with none at 0 (QTI
 *   3.0.1 Table 4.5), \`completionStatus\` at \`unknown\` (information model §2.2.2.3: its value "at
 *   the start of the first attempt"), each template variable at the value the session's template
 *   processing set, else its declared default, and each response NULL, no row: no attempt has
 *   begun, and a session never attempted keeps its responses NULL, "the default value is never
 *   used" (QTI 3.0.1 Table 5.115). The record at the start of the first attempt, its responses at
 *   their defaults in force, is another read (\`numAttempts\` 1), not this one. Every value of a
 *   variable that is no context, by its shape then its base type, as an attempt's value rows are
 *   read (\`#ledger/served-values.ts\` \`ValueRows\`): a single's row, a multiple's distinct values
 *   each with its \`count\` (a float's or a duration's by its \`bits\`, grizzle's \`floatBits\`, as the
 *   ledger keys one), an ordered's at its \`place\` and a record's fields by \`field\`.
 * - **What template processing set** (\`set\`): the session's stored values (\`ItemSessionValue\` and
 *   its sidecars), each by the rule that set it (\`kind\`: \`template\`, \`correct\` or \`default\`), its
 *   header (\`variables\`) beside its value rows, so a value set to NULL has its header and no row:
 *   the record's \`templates\`, \`correct\` and \`defaults\` (plate's \`ItemRecord\`), read as stored.
 *
 * Every read is keyed by the session its parent row carries (\`StartedKey\`: child, package, path,
 * place), bound to that row's terms, and adds no parameter to the reading statement: the record is
 * that session's own, a fact keyed by its owner, never "the child's latest session of the item".
 * \`sessionStartOf\` attaches it under a read of one item session (edullm's \`servedItem\`, its
 * decideStage's read-back of the sessions it took, and \`sittingItem\`).
 *
 * Grizzle's types admit no helper generic over a relation's heading, so each sidecar's read is
 * written out, generated from one table by \`tools/gen/session-start.ts\`. Regenerate it with
 * \`pnpm --filter @qti-pie/ledger generate\`; \`generate:check\` holds it to its generator, so a
 * change is made there, never here.
 *
 * @module
 */
import type { Facts, NaturalDomain, Term } from "@bjornpagen/grizzle";
import { query, v } from "@bjornpagen/grizzle";
import type { deliveryOf } from "#ledger/delivery.ts";

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
`,
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
 * An order of texts by their code points, as `sort-keys` reads keys.
 *
 * @param left A text.
 * @param right Another.
 * @returns Its place before, at or after the other's.
 */
const byCodePoint = (left: string, right: string) => Number(left > right) - Number(left < right);

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
