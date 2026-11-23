/**
 * @qti-pie/ledger's machine, its module, from the SQL of the package's machine/, which the golden
 * oracle proves equal to plate: `src/grading.ts`, each row type a heading, each function a grizzle
 * `fn` with its body byte for byte but for the row types it names, which grizzle names (FNROWS A);
 * and plate's `src/admission-codes.ts`, admission's reason codes from admission.sql's admission_one
 * `codes`. The spellings FNROWS settles (a body naming row types, a heading's field of rows, one
 * row as an argument or result) are the functions in `spelling` below. The generators of
 * `#tools/gen/grading.ts` and `#tools/gen/admission-codes.ts` format these texts.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { customOperators } from "#ledger/registry/operators.ts";
import { ledgerDirectory } from "#tools/gen/tools.ts";

/**
 * The table roles a class reads the registry's tables in (p3.table_binding.role): each a
 * primitive's own table parameter (composable-operators.md §2.3), generic, bound to the registry's
 * tables by the registry entry.
 */
const TableRole = [
  "unit-spellings",
  "letter-units",
  "typo-targets",
  "competitors",
  "glue-words",
  "plurals",
  "ie-plurals",
  "never-plural",
  "unit-words",
  "contrast-words",
  "operation-words",
  "stop-words",
  "verbs",
];

/**
 * Math-canonical's closed vocabularies (p3.math_token.kind, p3.math_node.kind, math_expr's mode,
 * math_rational's and math_flat's kinds), each a token of the generated module.
 */
const MathTokenKind = ["fn", "joiner", "name", "num", "op", "rel", "sqrt"];

/**
 * Math-canonical's node kinds.
 */
const MathNodeKind = [
  "abs",
  "div",
  "fact",
  "fn",
  "frac",
  "mixed",
  "name",
  "neg",
  "num",
  "pct",
  "pow",
  "prod",
  "rel",
  "root",
  "sum",
  "tuple",
];

/**
 * Math-canonical's parse modes.
 */
const MathParseMode = ["factor", "group", "sum"];

/**
 * The directory of the machine's SQL.
 */
const machineDirectory = path.join(ledgerDirectory, "machine");

/**
 * One of the machine's SQL files, by name.
 *
 * @param file The file's name.
 * @returns Its text.
 */
const read = (file: string): string => readFileSync(path.join(machineDirectory, file), "utf-8");

/**
 * The files that declare the row types, in install order.
 */
const typeFiles = [
  "machine-types.sql",
  "boundary.sql",
  "test-outcome-boundary.sql",
  "credit.sql",
  "document-types.sql",
  "document.sql",
  "test-document.sql",
  "marks.sql",
  "admission.sql",
];

/**
 * The files that declare the functions, in install order.
 */
const functionFiles = [
  "fdlibm-functions.sql",
  "machine-leaves.sql",
  "fold.sql",
  "xsd.sql",
  "primitives.sql",
  "machine-eval.sql",
  "test-outcome.sql",
  "boundary.sql",
  "test-outcome-boundary.sql",
  "credit.sql",
  "document.sql",
  "test-document.sql",
  "marks.sql",
  "admission.sql",
];

/**
 * A snake_case name in PascalCase.
 *
 * @param snake The name.
 * @returns Its PascalCase spelling.
 */
const pascal = (snake: string): string =>
  snake
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

/**
 * A snake_case name in camelCase.
 *
 * @param snake The name.
 * @returns Its camelCase spelling.
 */
const camel = (snake: string): string =>
  snake.replaceAll(/_(?<letter>[a-z0-9])/gu, (_all: string, letter: string) =>
    letter.toUpperCase(),
  );

/**
 * Text fields that hold a closed vocabulary's token, by heading and field: their field is the
 * roster's refined text.
 */
const tokens = new Map([
  ["base", "BaseType"],
  ["card", "Cardinality"],
  ["flow", "Flow"],
  ["holds", "Holds"],
  ["node.kind", "ProcessingKind"],
  ["walk_node.kind", "ProcessingKind"],
  ["area.kind", "AreaKind"],
  ["lookup_table.kind", "LookupKind"],
  ["p_equal.mode", "ToleranceMode"],
  ["p_round.mode", "RoundingMode"],
  ["p_math.op", "MathOperator"],
  ["p_stat.op", "StatOperator"],
  ["p_constant.c", "MathConstant"],
  ["p_custom.class", "CustomOperatorClass"],
  ["table_binding.class", "CustomOperatorClass"],
  ["table_binding.role", "TableRole"],
  ["math_token.kind", "MathTokenKind"],
  ["math_node.kind", "MathNodeKind"],
  ["member_var.kind", "VariableKind"],
  ["in_member_var.kind", "VariableKind"],
  ["member_bound.bound", "BoundKind"],
  ["p_filter.filter", "CategoryFilter"],
  ["p_category.filter", "CategoryFilter"],
  ["doc_walk_area.kind", "AreaKind"],
  ["doc_walk_category.filter", "CategoryFilter"],
  ["doc_walk_custom.class", "CustomOperatorClass"],
  ["doc_walk_equal.mode", "ToleranceMode"],
  ["doc_walk_filter.filter", "CategoryFilter"],
  ["doc_walk_float.field", "WalkNumberField"],
  ["doc_walk_integer.field", "WalkNumberField"],
  ["doc_walk_name.field", "WalkNameField"],
  ["doc_walk_ref.field", "WalkRefField"],
  ["doc_walk_ref.ref", "QtiIdentifier"],
  ["doc_walk_round.mode", "RoundingMode"],
  ["program_node.kind", "ProcessingKind"],
  ["declaration_node.kind", "DeclarationPart"],
  ["document_attribute.name", "GradedAttribute"],
  ["doc_var.kind", "VariableKind"],
  ["var_kind.kind", "VariableKind"],
  ["test_member_bound.bound", "BoundKind"],
  ["doc_var.identifier", "QtiIdentifier"],
  ["doc_base.identifier", "QtiIdentifier"],
  ["doc_text.identifier", "QtiIdentifier"],
  ["doc_integer.identifier", "QtiIdentifier"],
  ["doc_float.identifier", "QtiIdentifier"],
  ["doc_boolean.identifier", "QtiIdentifier"],
  ["doc_pair.identifier", "QtiIdentifier"],
  ["doc_directed_pair.identifier", "QtiIdentifier"],
  ["doc_point.identifier", "QtiIdentifier"],
  ["doc_file.identifier", "QtiIdentifier"],
  ["doc_field_text.identifier", "QtiIdentifier"],
  ["doc_field_integer.identifier", "QtiIdentifier"],
  ["doc_field_float.identifier", "QtiIdentifier"],
  ["doc_field_boolean.identifier", "QtiIdentifier"],
  ["doc_field_pair.identifier", "QtiIdentifier"],
  ["doc_field_directed_pair.identifier", "QtiIdentifier"],
  ["doc_field_point.identifier", "QtiIdentifier"],
  ["doc_field_file.identifier", "QtiIdentifier"],
  ["mark_text.identifier", "QtiIdentifier"],
  ["mark_integer.identifier", "QtiIdentifier"],
  ["mark_float.identifier", "QtiIdentifier"],
  ["mark_boolean.identifier", "QtiIdentifier"],
  ["mark_pair.identifier", "QtiIdentifier"],
  ["mark_directed_pair.identifier", "QtiIdentifier"],
  ["mark_point.identifier", "QtiIdentifier"],
  ["mark_file.identifier", "QtiIdentifier"],
  ["mark", "AnswerMark"],
  ["body_attribute.name", "AdmittedAttribute"],
  ["admission_reason.response", "QtiIdentifier"],
  ["admission_word.name", "AdmissionWordName"],
  ["admission_count.name", "AdmissionCountName"],
  ["admission_number.name", "AdmissionNumberName"],
  ["admission_hidden.response", "QtiIdentifier"],
  // A text single's value: s_text refuses the empty text, which QTI reads as NULL (info, isNull), so every heading
  // that carries one states it non-empty, as the ledger's leaves do.
  ["out_text.value", "someText"],
  ["out_field_text.value", "someText"],
  ["in_text.value", "someText"],
  ["in_field_text.value", "someText"],
  ["in_member_text.value", "someText"],
  ["in_member_field_text.value", "someText"],
  ["doc_text.value", "someText"],
  ["doc_field_text.value", "someText"],
  // A file's name: every file the machine holds is a stored row's, and a stored file is named (FileName).
  ["doc_file.name", "someText"],
  ["doc_field_file.name", "someText"],
  ["mark_file.name", "someText"],
  ["doc_walk_literal_text.value", "someText"],
  ["mark_text.value", "someText"],
]);

/**
 * Every single-quoted word of a text.
 *
 * @param text The text.
 * @returns Its quoted words, in order.
 */
const quoted = (text: string): string[] =>
  [...text.matchAll(/'(?<word>[\w-]+)'/gu)].map((m) => m.groups?.["word"] ?? "");

/**
 * Admission's rosters, as admission.sql's admission_one states them: the closed roster
 * AdmissionCode's handles in its order (a code's id is its handle's place there), the attributes it
 * reads of the body, and the names each form of its result writes.
 */
interface AdmissionRosters {
  readonly admissionCodes: readonly string[];
  readonly admittedAttributes: readonly string[];
  readonly admissionWords: readonly string[];
  readonly admissionCounts: readonly string[];
  readonly admissionNumbers: readonly string[];
}

/**
 * Admission's rosters, read from admission_one's CTEs: `codes` holds its two tiers' lists, tier
 * (a)'s then tier (b)'s, and each of `reasons` writes its code.
 *
 * @param admissionSql Admission.sql's text.
 * @returns The rosters.
 */
const admissionRosters = (admissionSql: string): AdmissionRosters => {
  const at = admissionSql.indexOf("create function p3.admission_one(");
  if (at === -1) {
    throw new Error("admission.sql defines no admission_one");
  }

  const oneBody = admissionSql.slice(
    at,
    admissionSql.indexOf("$$;", admissionSql.indexOf("$$", at) + 2),
  );
  const codesCte = oneBody.slice(
    oneBody.indexOf("  codes as ("),
    oneBody.indexOf("  judged as materialized ("),
  );
  const reasonsCte = oneBody.slice(
    oneBody.indexOf("  reasons(istart, rank, sub, code,"),
    oneBody.indexOf("  codes as ("),
  );
  const tierLists = [...codesCte.matchAll(/array\[(?<list>[^\]]*)\]::text\[\]/gu)];
  const admissionCodes = tierLists.flatMap((m) => quoted(m.groups?.["list"] ?? ""));
  const reasonCodes = new Set(
    [...reasonsCte.matchAll(/'(?<code>[A-Za-z]*[A-Z][A-Za-z]*)'/gu)].map(
      (m) => m.groups?.["code"] ?? "",
    ),
  );
  // Every reason names a code of the roster and every code is some reason's: a code no list holds would meet no row
  // of `codes` and its reason would vanish, so the generator refuses it.
  if (
    reasonCodes.size !== admissionCodes.length ||
    admissionCodes.some((c) => !reasonCodes.has(c))
  ) {
    throw new Error(
      `admission.sql's reasons and its roster differ: ${[...reasonCodes].filter((c) => !admissionCodes.includes(c)).join(",")} / ${admissionCodes.filter((c) => !reasonCodes.has(c)).join(",")}`,
    );
  }

  // Each form's names, by the heading its array casts to, never by position (KEYORDER orders admission_one's
  // result).
  const formNames = new Map(
    [
      ...oneBody.matchAll(
        /::admission_(?<form>count|number|word)\s+from judged j where j\.name in \((?<names>[^)]*)\)/gu,
      ),
    ].map((m) => [m.groups?.["form"] ?? "", quoted(m.groups?.["names"] ?? "")] as const),
  );
  const [admissionWords, admissionCounts, admissionNumbers] = [
    formNames.get("word"),
    formNames.get("count"),
    formNames.get("number"),
  ];
  if (
    tierLists.length !== 2 ||
    admissionCodes.length !== new Set(admissionCodes).size ||
    admissionWords === undefined ||
    admissionCounts === undefined ||
    admissionNumbers === undefined
  ) {
    throw new Error("admission.sql's rosters are not as the generator reads them");
  }

  return {
    admissionCodes,
    admissionCounts,
    admissionNumbers,
    admissionWords,
    admittedAttributes: [
      ...new Set(
        [...oneBody.matchAll(/a\.name = '(?<name>[\w-]+)'/gu)].map((m) => m.groups?.["name"] ?? ""),
      ),
    ],
  };
};

/**
 * The kinds and attribute names a statement passes of a document's grader tree
 * (document-types.sql), each a closed relation of the ledger's from pantry's NodeKind or
 * AttributeName to the machine's token.
 */
const declarationParts = [
  "qti-response-declaration",
  "qti-outcome-declaration",
  "qti-template-declaration",
  "qti-context-declaration",
  "qti-default-value",
  "qti-correct-response",
  "qti-value",
  "qti-mapping",
  "qti-map-entry",
  "qti-area-mapping",
  "qti-area-map-entry",
  "qti-match-table",
  "qti-match-table-entry",
  "qti-interpolation-table",
  "qti-interpolation-table-entry",
];

/**
 * The run key's sitting (document-types.sql): a field or parameter named `child` is the learner as
 * the ledger keys one (keys.ts's LearnerId), and one named `stage` the sitting's stage as the
 * ledger keys it (ItemSession, SessionSeed, TestSession and the `sittings` heading: pg.bigint), so
 * a statement's run key crosses as the ledger's own key.
 */
const sittingKey = new Map([
  ["child.text", "LearnerId"],
  ["stage.bigint", "pg.bigint"],
]);

/**
 * Smallint fields that hold a closed roster's code, by heading and field: their field is the
 * roster's closed id.
 */
const closedFields = new Map([
  ["admission_reason.code", "closedId(AdmissionCode)"],
  ["credit_value.kind", "closedId(CreditKind)"],
]);

/**
 * KEYORDER (grizzle 3e5bed0b0): a heading's fields and a declared function's arguments install in
 * code point order of their names, whatever order a source writes them in, so every positional use
 * in a body (a ROW, a select list, $n) reads them in that order. The SQL states them so, and the
 * module emits them so, which is also sort-keys' order; SQL in any other order is refused, since
 * its bodies would read another order than grizzle installs.
 *
 * @param a A name.
 * @param b Another.
 * @returns Their order, by code point.
 */
const codePointOrder = (a: string, b: string): number => {
  let i = 0;
  while (i < a.length && i < b.length) {
    const x = a.codePointAt(i) ?? 0;
    const y = b.codePointAt(i) ?? 0;
    if (x !== y) {
      return x - y;
    }

    // Equal code points take equal code units, so one index walks both names.
    i += x > 0xff_ff ? 2 : 1;
  }

  return a.length - b.length;
};

/**
 * The attributes of a processing program's and a declaration's elements the machine reads, by name:
 * every name document.sql's readers filter an attribute by (`y.name = '<attr>'`, in program_of,
 * inputs_of, declared and var_kinds), each once, in code point order. The roster a statement passes
 * those attributes through is derived from the SQL that reads them, so a name the machine reads can
 * never be filtered out before it arrives (as `class` and `definition`, which bind every custom
 * operator, once were).
 *
 * @param documentSql The text of document.sql.
 * @returns The names.
 */
const gradedAttributesOf = (documentSql: string): readonly string[] => {
  const names = [
    ...new Set(
      [...documentSql.matchAll(/\by\.name = '(?<name>[\w-]+)'/gu)].map(
        (m) => m.groups?.["name"] ?? "",
      ),
    ),
  ].toSorted(codePointOrder);
  if (names.length === 0) {
    throw new Error(
      "document.sql filters no attribute by name as the generator reads it (y.name = '<attr>')",
    );
  }

  return names;
};

/**
 * The roots of QTI 3.0.1's three processings, an item's response and template processing and a
 * test's outcome processing (Tables 5.115, 5.124, 5.102): a run walks its root's rules and never
 * dispatches on the root itself.
 */
const processingRoots = [
  "qti-outcome-processing",
  "qti-response-processing",
  "qti-template-processing",
];

/**
 * The processing language's element kinds, what a statement passes of a program (the ledger's
 * ProgramNodeKind): the three roots and every kind machine-eval.sql dispatches on, each `qti-` kind
 * an arm of `evaluated` (an expression) or of `run_rules` (a rule, a condition's branch, a
 * fragment, an exit) names, each once, in code point order. The roster is derived from the SQL that
 * evaluates the kinds, so an element the machine evaluates can never be filtered out of the program
 * before it arrives (as qti-outcome-minimum and qti-outcome-maximum once were, QTI 3.0.1's
 * test-level expressions of outcome processing), and no element crosses that the machine has no arm
 * for.
 *
 * @param evalSql The text of machine-eval.sql.
 * @returns The kinds.
 */
const processingKindsOf = (evalSql: string): readonly string[] => {
  const dispatched = ["evaluated", "run_rules"].flatMap((name) => {
    const at = evalSql.indexOf(`create function p3.${name}(`);
    if (at === -1) {
      throw new Error(`machine-eval.sql defines no ${name}`);
    }

    const body = evalSql.slice(at, evalSql.indexOf("end $$;", at));

    return [...body.matchAll(/\bwhen\s+(?<kinds>(?:'[^']*'\s*,\s*)*'[^']*')\s+then\b/gu)].flatMap(
      (m) => quoted(m.groups?.["kinds"] ?? "").filter((kind) => kind.startsWith("qti-")),
    );
  });
  if (dispatched.length === 0) {
    throw new Error(
      "machine-eval.sql dispatches on no kind as the generator reads it (when '<qti-kind>' then)",
    );
  }

  return [...new Set([...processingRoots, ...dispatched])].toSorted(codePointOrder);
};

/**
 * Refuses names not in code point order.
 *
 * @param what What the names are of.
 * @param names The names, in the order the SQL states them.
 */
const inKeyOrder = (what: string, names: readonly string[]): void => {
  const sorted = [...names].toSorted(codePointOrder);
  if (sorted.some((n, i) => n !== names[i])) {
    throw new Error(
      `${what} are not in code point order (${names.join(", ")}): order them by code point first`,
    );
  }
};

/**
 * A heading's field: its name and its SQL type.
 */
interface Field {
  readonly name: string;
  readonly sql: string;
}

/**
 * A row type: its name and its fields, in the order the SQL states them.
 */
interface RowType {
  readonly name: string;
  readonly fields: readonly Field[];
}

/**
 * A declared function's argument: its name and its SQL type.
 */
interface Argument {
  readonly name: string;
  readonly type: string;
}

/**
 * A declared function: its name, language, body, arguments and result.
 */
interface Declared {
  readonly name: string;
  readonly language: string;
  readonly body: string;
  readonly args: readonly Argument[];
  readonly returns: string;
  /**
   * Its null input as the SQL states it: `strict` where the declaration reads `immutable strict`
   * (PostgreSQL's STRICT: NULL for any NULL argument, the body never run), else `called`.
   */
  readonly nullInput: "called" | "strict";
}

/**
 * A row type's fields, split at the commas outside parentheses.
 *
 * @param list The text between the type's parentheses.
 * @returns Each field's text, trimmed.
 */
const fieldTexts = (list: string): string[] => {
  const fields: string[] = [];
  let depth = 0;
  let cur = "";
  for (const ch of list) {
    if (ch === "(") {
      depth += 1;
    }

    if (ch === ")") {
      depth -= 1;
    }

    if (ch === "," && depth === 0) {
      fields.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur.trim());

  return fields;
};

/**
 * One field's name and SQL type, from its text.
 *
 * @param text The field's text.
 * @returns The field.
 */
const fieldOfText = (text: string): Field => {
  const m = /^(?<name>"?\w+"?)\s+(?<sql>.*)$/su.exec(text);
  if (m === null) {
    throw new Error(`no field in ${text}`);
  }

  return {
    name: (m.groups?.["name"] ?? "").replaceAll('"', ""),
    sql: (m.groups?.["sql"] ?? "").replaceAll(/\s+/gu, " "),
  };
};

/**
 * The row types, in declared order, each field's SQL type, the fields in code point order of their
 * names.
 *
 * @param typesSql The text of the files that declare them.
 * @returns The row types.
 */
const rowTypes = (typesSql: string): RowType[] =>
  [...typesSql.matchAll(/create type p3\.(?<name>\w+) as \((?<fields>[\s\S]*?)\);/gu)].map((m) => {
    const type = {
      fields: fieldTexts(m.groups?.["fields"] ?? "").map(fieldOfText),
      name: m.groups?.["name"] ?? "",
    };
    inKeyOrder(
      `p3.${type.name}'s fields`,
      type.fields.map((f) => f.name),
    );

    return type;
  });

/**
 * How FNROWS spells what FNTERMS lacks; settled when FNROWS A, B and C land.
 */
const spelling = {
  many: (h: string): string => h,
  one: (h: string): string => `row(${h})`,
  oneField: (h: string): string => `row(${h})`,
  rowsField: (h: string): string => h,
  typeName: (h: string): string => `\${${h}}`,
};

/**
 * A scalar SQL type's grizzle field.
 *
 * @param t The SQL type.
 * @returns Its field's spelling.
 */
const scalar = (t: string): string => {
  if (/^numeric\(\d+, 0\)$/u.test(t)) {
    return "QtiInteger";
  }

  const named = new Map([
    ["bigint", "pg.bigint"],
    ["boolean", "pg.boolean"],
    // Every bytes value the machine takes or gives is a SHA-256 output, 32 raw bytes: a file's content digest and a
    // processing seed (machine-leaves.sql's header).
    ["bytea", "sha256"],
    ["float8", 'pg["double precision"]'],
    ["int", "pg.integer"],
    ["integer", "pg.integer"],
    ["numeric", "exactNumber"],
    ["numeric(825, 0)", "QtiInteger"],
    ["text", "anyText"],
    ["uuid", "uuid"],
  ]);
  const field = named.get(t);
  if (field === undefined) {
    throw new Error(`no field for ${t}`);
  }

  return field;
};

/**
 * A heading's field's grizzle spelling.
 *
 * @param heading The heading's name.
 * @param field The field's name.
 * @param sql The field's SQL type.
 * @returns Its spelling.
 */
const fieldOf = (heading: string, field: string, sql: string): string => {
  const t = sql.replace(/ collate pg_catalog\.pg_c_utf8/u, "").trim();
  const arr = /^p3\.(?<heading>\w+)\[\]$/u.exec(t);
  if (arr !== null) {
    return spelling.rowsField(pascal(arr.groups?.["heading"] ?? ""));
  }

  const nested = /^p3\.(?<heading>\w+)$/u.exec(t);
  if (nested !== null) {
    return spelling.oneField(pascal(nested.groups?.["heading"] ?? ""));
  }

  const keyed = sittingKey.get(`${field}.${t}`);
  if (keyed !== undefined) {
    return keyed;
  }

  if (t === "text") {
    return tokens.get(`${heading}.${field}`) ?? tokens.get(field) ?? "anyText";
  }

  if (t === "bigint" && ["place", "start", "end", "parent"].includes(field)) {
    return "natural";
  }

  if (t === "smallint") {
    const closed = closedFields.get(`${heading}.${field}`);
    if (closed === undefined) {
      throw new Error(`no roster for ${heading}.${field}`);
    }

    return closed;
  }

  return scalar(t);
};

/**
 * Text parameters that hold a closed vocabulary's token, by function and parameter.
 */
const paramTokens = new Map([
  ["area_kind_of", "AreaKind"],
  ["bag_marks.card", "Cardinality"],
  ["bound_order.mode", "ToleranceMode"],
  ["bound_order.side", "BoundSide"],
  ["bound_pairs.operator_class", "CustomOperatorClass"],
  ["bound_pairs.table_role", "TableRole"],
  ["bound_words.operator_class", "CustomOperatorClass"],
  ["bound_words.table_role", "TableRole"],
  ["counted.kind", "ProcessingKind"],
  ["counts.kind", "ProcessingKind"],
  ["custom_value.operator_class", "CustomOperatorClass"],
  ["declared.holder", "DeclarationPart"],
  ["declared.kind", "DeclarationPart"],
  ["held_identical.card", "Cardinality"],
  ["js_math.op", "MathOperator"],
  ["math_expr.mode", "MathParseMode"],
  ["math_flat.op_kind", "MathNodeKind"],
  ["math_rational.kind", "MathNodeKind"],
  ["math_value.op", "MathOperator"],
  ["member_vars_of.h", "Holds"],
  ["outcome_bounds.kind", "ProcessingKind"],
  ["rounded.mode", "RoundingMode"],
  ["s_float.base", "BaseType"],
  ["s_text.base", "BaseType"],
  ["stat_value.op", "StatOperator"],
  ["text_holds.kind", "ProcessingKind"],
  ["vars_in.h", "Holds"],
]);

/**
 * Bigint parameters that hold a count, a natural, by function and parameter.
 */
const naturalParams = new Set(["copies.count", "response_label.attempts"]);

/**
 * A declared function's argument's or result's grizzle spelling.
 *
 * @param sql The SQL type.
 * @param at The function and argument (`f.arg`), or the function alone for its result.
 * @returns Its spelling.
 */
const sigType = (sql: string, at: string): string => {
  const t = sql.trim();
  const [, param] = at.split(".");
  if (param !== undefined) {
    const keyed = sittingKey.get(`${param}.${t}`);
    if (keyed !== undefined) {
      return keyed;
    }
  }

  if (t === "bigint" && naturalParams.has(at)) {
    return "natural";
  }

  const token = paramTokens.get(at);
  if (t === "text" && token !== undefined) {
    return token;
  }

  // A declared function returns rows as a set (SETOF): rows in order, an array of a heading, are one row's field.
  if (!at.includes(".") && /^p3\.\w+\[\]$/u.test(t)) {
    throw new Error(
      `p3.${at} returns an array of rows, which grizzle installs as a set (SETOF): return one row whose field holds them`,
    );
  }

  const set = /^setof p3\.(?<heading>\w+)$/u.exec(t);
  if (set !== null) {
    return spelling.many(pascal(set.groups?.["heading"] ?? ""));
  }

  const arr = /^p3\.(?<heading>\w+)\[\]$/u.exec(t);
  if (arr !== null) {
    return spelling.many(pascal(arr.groups?.["heading"] ?? ""));
  }

  const one = /^p3\.(?<heading>\w+)$/u.exec(t);
  if (one !== null) {
    return spelling.one(pascal(one.groups?.["heading"] ?? ""));
  }

  return scalar(t);
};

/**
 * A declared function's argument, from its text.
 *
 * @param text The argument's text.
 * @returns The argument.
 */
const argumentOf = (text: string): Argument => {
  const m = /^(?<name>\w+)\s+(?<type>.*)$/u.exec(text.trim());
  if (m === null) {
    throw new Error(`no argument in ${text}`);
  }

  return { name: m.groups?.["name"] ?? "", type: m.groups?.["type"] ?? "" };
};

/**
 * The functions, in file order (callees first), each one's arguments in code point order of their
 * names.
 *
 * @param fnSql The text of the files that declare them.
 * @returns The functions.
 */
const declaredFunctions = (fnSql: string): Declared[] =>
  [
    ...fnSql.matchAll(
      /create function p3\.(?<name>\w+)\((?<args>[^)]*)\)\s*returns\s+(?<returns>[\w.[\] ]+?)\s+language (?<language>sql|plpgsql) immutable(?<strict> strict)? as\s*(?<quote>\$\w*\$)(?<body>[\s\S]*?)\k<quote>;/gu,
    ),
  ].map((m) => {
    const args = m.groups?.["args"] ?? "";
    const declared = {
      args: args.trim() === "" ? [] : args.split(",").map(argumentOf),
      body: m.groups?.["body"] ?? "",
      language: m.groups?.["language"] ?? "",
      name: m.groups?.["name"] ?? "",
      nullInput: m.groups?.["strict"] === undefined ? ("called" as const) : ("strict" as const),
      returns: m.groups?.["returns"] ?? "",
    };
    inKeyOrder(
      `p3.${declared.name}'s arguments`,
      declared.args.map((a) => a.name),
    );

    return declared;
  });

/**
 * A body with each row type it names in a typed position (a cast, a declaration) spelled as grizzle
 * names it.
 *
 * @param body The body.
 * @param typeNames Every row type's name.
 * @returns It, each row type spelled.
 */
const typed = (body: string, typeNames: ReadonlySet<string>): string => {
  const cast = body.replaceAll(
    /::(?<heading>\w+)(?<arr>\[\])?/gu,
    (all: string, n: string, arr: string | undefined) =>
      typeNames.has(n) ? `::${spelling.typeName(pascal(n))}${arr ?? ""}` : all,
  );

  return cast.replace(
    /(?<declare>\bdeclare\b)(?<decls>[\s\S]*?)(?<begin>\bbegin\b)/u,
    (_all: string, d: string, decls: string, b: string) =>
      d +
      decls.replaceAll(
        /(?<pre>^|;|\n)(?<lead>\s*\w+\s+)(?<heading>\w+)(?<arr>\[\])?(?=\s*(?:;|:=))/gu,
        (x: string, pre: string, lead: string, n: string, arr: string | undefined) =>
          typeNames.has(n) ? `${pre}${lead}${spelling.typeName(pascal(n))}${arr ?? ""}` : x,
      ) +
      b,
  );
};

/**
 * The machine's schema a body names: grizzle installs the machine under the level's own schema and
 * pins its search_path, so a schema-qualified name (`p3.x`) would name a schema the installation
 * does not have. The generator refuses one.
 *
 * @param body A body.
 * @returns The names it qualifies by `p3.`, outside its comments and strings.
 */
const schemaNamed = (body: string): string[] =>
  [
    ...body
      .replaceAll(/--[^\n]*/gu, "")
      .replaceAll(/'(?:[^']|'')*'/gu, "''")
      .matchAll(/\bp3\.(?<name>\w+)/gu),
  ].map((x) => x.groups?.["name"] ?? "");

/**
 * A placeholder of a row type in a typed body.
 */
const placeholder = /\$\{(?<heading>\w+)\}/gu;

/**
 * A body as the text of an fn.body template, which grizzle reads cooked: every backslash, backtick
 * and `${` of the SQL escaped, so the template reads back the SQL byte for byte, and each row type
 * it names a placeholder.
 *
 * @param body A typed body.
 * @returns The template's text.
 */
const raw = (body: string): string =>
  body
    .split(placeholder)
    .map((part, i) =>
      i % 2 === 1
        ? `\${${part}}`
        : part.replaceAll("\\", "\\\\").replaceAll("`", "\\`").replaceAll("${", "\\${"),
    )
    .join("");

/**
 * The machine's module, read from its SQL when it is asked for, never at load: a generator that
 * writes a source the module reads (machine/xsd.sql) runs first, and this reads what it wrote.
 */
interface MachineModules {
  /**
   * Each SQL function's body, by its name: what each `fn.body` of `src/grading.ts` reads back.
   */
  readonly bodies: ReadonlyMap<string, string>;
  /**
   * `src/grading.ts`, before it is formatted.
   */
  readonly gradingModule: string;
}

/**
 * The machine's module, from the SQL of machine/ as it is now.
 *
 * @returns The module and the bodies it must read back.
 */
export const machineModules = (): MachineModules => {
  const typesSql = typeFiles.map(read).join("\n");
  const fnSql = functionFiles.map(read).join("\n");
  const CustomOperatorClass = customOperators.map((operator) => operator.class);
  const gradedAttributes = gradedAttributesOf(read("document.sql"));
  const processingKinds = processingKindsOf(read("machine-eval.sql"));
  const { admittedAttributes, admissionWords, admissionCounts, admissionNumbers } =
    admissionRosters(read("admission.sql"));
  const types = rowTypes(typesSql);
  const typeNames = new Set(types.map((t) => t.name));
  const fns = declaredFunctions(fnSql);
  const fnNames = new Set(fns.map((f) => f.name));
  const lines: string[] = [];

  lines.push(
    `/**
 * QTI 3.0.1's response and template processing, as the database's declared functions: the machine plate's grader was,
 * ported from the prototype the golden oracle proves equal to plate. Generated by @qti-pie/ledger's tools/gen/grading.ts
 * from the SQL of its machine/ (\`pnpm --filter @qti-pie/ledger generate\`); edit the SQL and generate again, and
 * \`generate:check\` refuses any other edit.
 */`,
    `import { closed, closedId, fn, natural, pg, row, rows, sha256, str, uuid } from "@bjornpagen/grizzle"`,
    `import { admissionCodes } from "@qti-pie/plate/admission-codes"`,
    `import { QtiIdentifier } from "@qti-pie/pantry/qti/limits.ts"`,
    `import { CreditKind } from "#ledger/credit.ts"`,
    `import { anyText, LearnerId, someText } from "#ledger/keys.ts"`,
    `import { QtiInteger } from "#ledger/scalars.ts"`,
    ``,
    `/** A number's exact value, a float's rational one among them: a signature's numeric, which no typmod bounds. */
const exactNumber = pg.numeric

/** QTI 3.0.1's base types and cardinalities. */
const BaseType = str.regex("^(boolean|directedPair|duration|file|float|identifier|integer|pair|point|string|uri)$")

const Cardinality = str.regex("^(multiple|ordered|record|single)$")

/** How a run goes on: it runs, it exits, or a template constraint restarts it. */
const Flow = str.regex("^(exit|restart|run)$")

/** The processing language's element kinds: QTI 3.0.1's rules and expressions. */
const ProcessingKind = str.regex("^(${processingKinds.join("|")})$")

const AreaKind = str.regex("^(circle|ellipse|everywhere|nowhere|poly|rect)$")

const LookupKind = str.regex("^(interpolation|match)$")

const ToleranceMode = str.regex("^(absolute|exact|relative)$")

const RoundingMode = str.regex("^(decimalPlaces|significantFigures)$")

const MathOperator = str.regex("^(abs|acos|acot|acsc|asec|asin|atan|atan2|ceil|cos|cosh|cot|coth|csc|csch|exp|floor|ln|log|sec|sech|signum|sin|sinh|tan|tanh|toDegrees|toRadians)$")

const StatOperator = str.regex("^(mean|popSD|popVariance|sampleSD|sampleVariance)$")

const MathConstant = str.regex("^(e|pi)$")

/** Which of an attempt's values a boundary row holds: its value now, its correct response or its default in force. */
const Holds = str.regex("^(correct|default|value)$")

/** Which bound of a tolerance band a comparison reads. */
const BoundSide = str.regex("^(lower|upper)$")

/** The registered custom operators' classes, the Registry level's roster (src/registry/operators.ts' customOperators). */
const CustomOperatorClass = str.regex("^(${CustomOperatorClass.toSorted().join("|")})$")

/** The roles a class reads the registry's tables in (tools/gen/grading/machine.ts). */
const TableRole = str.regex("^(${TableRole.toSorted().join("|")})$")

/** math-canonical's token kinds (tools/gen/grading/machine.ts). */
const MathTokenKind = str.regex("^(${MathTokenKind.toSorted().join("|")})$")

/** math-canonical's node kinds (tools/gen/grading/machine.ts). */
const MathNodeKind = str.regex("^(${MathNodeKind.toSorted().join("|")})$")

/** math-canonical's parse modes (tools/gen/grading/machine.ts). */
const MathParseMode = str.regex("^(${MathParseMode.toSorted().join("|")})$")

/** The kind of declaration an item variable a test reads through its item ref has, a built-in under its own kind's
 * (QTI 3.0.1's four variable declarations: ContextDeclaration, ResponseDeclaration, OutcomeDeclaration and
 * TemplateDeclaration, Tables 5.34, 5.115, 4.5 and 5.151). */
const VariableKind = str.regex("^(context|outcome|response|template)$")

/** Which declared bound of an outcome a test's outcome-minimum or outcome-maximum reads (Table 4.5.7, 4.5.8). */
const BoundKind = str.regex("^(maximum|minimum)$")

/** Which category filter of a test-level expression a category belongs to (Tables 7.39.2 and 7.39.3). */
const CategoryFilter = str.regex("^(exclude|include)$")

/** Which one-word parameter of an element a walk's name row is (document.sql's walk_from): a test-variables'
 * base-type, a math constant's, math operator's or stats operator's name, a field-value's field-identifier, and a test
 * expression's section-identifier and weight-identifier. */
const WalkNameField = str.regex("^(base|constant|field|math|section|stat|weight)$")

/** Which number-or-variable parameter a walk's integer, float or ref row is: an any-n's max and min, an equal's
 * tolerance's first and second, a random float's max and min, an index's n or a repeat's number-repeats, a random
 * integer's max, min and step, and a rounding's figures. */
const WalkNumberField = str.regex("^(any_n\\\\.max|any_n\\\\.min|equal\\\\.t0|equal\\\\.t1|frange\\\\.hi|frange\\\\.lo|int\\\\.value|range\\\\.hi|range\\\\.lo|range\\\\.step|round\\\\.figures)$")

/** Which parameter a walk's ref row names a variable for: a number-or-variable parameter, or a pattern-match's
 * pattern where it is {VAR}, a declared variable's identifier in braces. */
const WalkRefField = str.regex("^(any_n\\\\.max|any_n\\\\.min|equal\\\\.t0|equal\\\\.t1|frange\\\\.hi|frange\\\\.lo|int\\\\.value|pattern|range\\\\.hi|range\\\\.lo|range\\\\.step|round\\\\.figures)$")

/** A review's mark on a part of a response (AttemptMark, marks.sql): right, wrong, or a correct value missed. */
const AnswerMark = str.regex("^(missed|right|wrong)$")

/** The elements of an item's declarations the machine reads (QTI 3.0.1's four variable declarations, their default and
 * correct values, their mappings and lookup tables): what a statement passes of a document's declarations, by kind. */
export const declarationParts = ${JSON.stringify(declarationParts)} as const

const DeclarationPart = str.regex("^(${declarationParts.join("|")})$")

/** The attributes of a processing program's and a declaration's elements the machine reads, by name. */
export const gradedAttributes = ${JSON.stringify(gradedAttributes)} as const

const GradedAttribute = str.regex("^(${gradedAttributes.join("|")})$")

/** The processing language's element kinds, as ProcessingKind holds them: what a statement passes of a program. */
export const processingKinds = ${JSON.stringify(processingKinds)} as const

/** The closed roster of admission's reason codes, plate's \`admissionCodes\` (generated with this module from
 * admission.sql's admission_one \`codes\`): a reason's \`code\` is its id, which admission_one writes as its handle's
 * place in that list, from 0, and grizzle numbers the same way and never renumbers. */
export const AdmissionCode = closed.ordered("AdmissionCode", admissionCodes)

/** The attributes of the item body's elements admission reads, by name: what a statement passes of the body. */
export const admittedAttributes = ${JSON.stringify(admittedAttributes)} as const

const AdmittedAttribute = str.regex("^(${admittedAttributes.join("|")})$")

/** A reason's attributes by form: words (an identifier, an axis, a group's members), counts and numbers. */
const AdmissionWordName = str.regex("^(${admissionWords.join("|")})$")

const AdmissionCountName = str.regex("^(${admissionCounts.join("|")})$")

const AdmissionNumberName = str.regex("^(${admissionNumbers.join("|")})$")`,
    ``,
  );

  for (const t of types) {
    const fields = [...t.fields]
      .toSorted((a, b) => codePointOrder(a.name, b.name))
      .map((f) => `\t${f.name}: ${fieldOf(t.name, f.name, f.sql)}`)
      .join(",\n");
    lines.push(``, `export const ${pascal(t.name)} = rows({\n${fields}\n})`);
  }

  lines.push(``);

  /**
   * Each function's callees, by name: every other function whose name its body calls.
   */
  const callees = new Map(
    fns.map(
      (f) =>
        [
          f.name,
          [...fnNames].filter(
            (n) => n !== f.name && new RegExp(`(?<![\\w.])${n}\\s*\\(`, "u").test(f.body),
          ),
        ] as const,
    ),
  );

  /**
   * The functions callees first, as a module must declare them: depth first from file order, a
   * cycle refused (a declared function's calls admit none; a function may call itself).
   */
  const ordered: Declared[] = [];

  /**
   * The functions being placed, whose callees are placed first.
   */
  const placing = new Set<string>();

  /**
   * Places a function after its callees.
   *
   * @param name The function's name.
   */
  const place = (name: string): void => {
    if (ordered.some((f) => f.name === name)) {
      return;
    }

    if (placing.has(name)) {
      throw new Error(`a call cycle through ${name}`);
    }

    placing.add(name);
    for (const c of callees.get(name) ?? []) {
      place(c);
    }
    placing.delete(name);

    const declared = fns.find((f) => f.name === name);
    if (declared === undefined) {
      throw new Error(`no function ${name}`);
    }

    ordered.push(declared);
  };

  for (const f of fns) {
    place(f.name);
  }
  for (const f of ordered) {
    const calls = (callees.get(f.name) ?? []).map(camel);
    const named = schemaNamed(f.body);
    if (named.length > 0) {
      throw new Error(
        `${f.name}'s body names the schema p3 (${[...new Set(named)].join(", ")}): write the bare name`,
      );
    }

    const args = [...f.args]
      .toSorted((a, b) => codePointOrder(a.name, b.name))
      .map((a) => `${a.name}: ${sigType(a.type, `${f.name}.${a.name}`)}`)
      .join(", ");
    // The descriptor's keys in sorted order, which carries no meaning; the args' in code point order, the order grizzle
    // installs them in (KEYORDER), which every body's call names (named notation) rather than counts.
    lines.push(
      ``,
      `export const ${camel(f.name)} = fn("${camel(f.name)}", {
\targs: { ${args} },
	body: fn.body\`${raw(typed(f.body, typeNames))}\`,
\tcalls: [${calls.join(", ")}],
\tlanguage: "${f.language}",
\tnullInput: "${f.nullInput}",
\treturns: ${sigType(f.returns, f.name)},
\tvolatility: "immutable"
})`,
    );
  }

  lines.push(`
/** Every function of the machine, callees first: what the ledger's level lists beside its relations. */
export const gradingFunctions = [
${ordered.map((f) => `\t${camel(f.name)}`).join(",\n")}
] as const`);

  return {
    bodies: new Map(fns.map((f) => [f.name, f.body] as const)),
    gradingModule: `${lines.join("\n")}\n`,
  };
};

/**
 * Plate's `src/admission-codes.ts`, before it is formatted, from machine/admission.sql alone: the
 * roster's one list, at the lower level that words it. Plate keys refusalMessages' wordings by it,
 * and the ledger's roster is built from it.
 *
 * @returns The module's text.
 */
export const admissionCodesModule = (): string => {
  const { admissionCodes } = admissionRosters(read("admission.sql"));

  return `/**
 * The reason codes of the database's admission, in the order of its closed roster \`AdmissionCode\`
 * (\`@qti-pie/ledger\`'s machine), whose reason's code is its handle's place here from 0: tier (a)'s,
 * refused whatever validate-responses says, then tier (b)'s, refused only under it. Generated by
 * @qti-pie/ledger's tools/gen/admission-codes.ts from machine/admission.sql's admission_one \`codes\`,
 * the one source (\`pnpm --filter @qti-pie/ledger generate\`); edit the SQL and generate again, and
 * \`generate:check\` refuses any other edit.
 *
 * @module
 */
export const admissionCodes = ${JSON.stringify(admissionCodes)} as const
`;
};
