import type { Fragments } from "#tools/gen/grade/fragments.ts";
import {
  arrows,
  byCodeUnits,
  camel,
  count,
  endOf,
  groupOf,
  indexOf,
  matchOf,
  must,
  readerOf,
  replaceFirst,
  replaceMatch,
} from "#tools/gen/grade/text.ts";

/**
 * The admission stage of grade.ts (P4 item v6): response admission's
 * arguments, generated beside gradeArgumentsOf from the same readers, rule by rule:
 *
 * - The posted responses: gradeArgumentsOf's snapshot rules, each sidecar read from the call's
 *   parameter list of its name (`<shape><T>`, the snapshot write's own) instead of the stored
 *   attempt;
 * - The values in force (QTI 3.0.1 §7.19.7, the record the attempt starts from): memberValuesOf's
 *   rules over the session's latest attempt, each a value of an outcome the item declares, singles
 *   in force, and its completion status once its response processing ran; and gradeArgumentsOf's
 *   rules over the session's template values, correct responses and defaults;
 * - Never gradeArgumentsOf's rules over the previous attempt (its status, an adaptive item's retained
 *   outcomes): the latest attempt's values in force are the values the answer is admitted against;
 * - The declarations and every declared variable's base type: gradeArgumentsOf's;
 * - The body: the item body's element nodes (BodyNodeKind) and the attributes admission reads
 *   (AdmittedAttributeName). Two variants, one template: the item session by its place
 *   (recordAttempt's parameters) and a test member by its item ref (answerTestItem's). grizzle's
 *   builders take no input query (W4), so only the answered reader differs.
 */

/**
 * The columns of the stored attempt's key, which a posted list does not hold.
 */
const KEYS: ReadonlySet<string> = new Set(["at", "child", "n", "package", "path"]);

/**
 * The rules of one of gradeArgumentsOf's readers.
 *
 * @param ga The text of gradeArgumentsOf.
 * @param name The reader's name.
 * @returns Its rules' arrows.
 */
const gaRules = (ga: string, name: string): string[] =>
  arrows(readerOf(ga, `  const ${name} = (_session: GradedSession) =>\n`));

/**
 * The rules of one of memberValuesOf's readers.
 *
 * @param mv The text of memberValuesOf.
 * @param name The reader's name.
 * @returns Its rules' arrows.
 */
const mvRules = (mv: string, name: string): string[] =>
  arrows(readerOf(mv, `  const ${name} = query(delivery)`));

/**
 * The `.match(fields.<rel>, { … })` of a rule: the match, and its keys, in order.
 *
 * @param rule The rule's text.
 * @param rel The relation matched.
 * @returns The match and its keys.
 */
const matchObject = (rule: string, rel: string) => {
  const match = matchOf(
    rule,
    new RegExp(String.raw`\.match\(fields\.${rel}, \{(?<keys>.*?)\}\)`, "su"),
  );
  const keys = groupOf(match, "keys")
    .trim()
    .split(/,\s*/u)
    .filter((key) => key.trim() !== "")
    .map((key) => key.trim().replace(/,+$/u, ""));

  return { keys, match };
};

/**
 * A snapshot rule of gradeArgumentsOf, read from the call's posted parameter list instead of the
 * stored attempt.
 *
 * @param source The rule's text.
 * @returns The posted list's name and the rule over it.
 */
const posted = (source: string): readonly [string, string] => {
  const found = matchOf(
    source,
    /v\(fields\.(?<rel>Snapshot(?<cardinality>Single|Multiple|Ordered|Record)(?<base>\w+)), "value"\)/u,
  );
  const rel = groupOf(found, "rel");
  const cardinality = groupOf(found, "cardinality");
  const base = groupOf(found, "base");
  const name = cardinality.toLowerCase() + base;
  const { keys, match } = matchObject(source, rel);
  const fields = keys.filter((key) => !KEYS.has(key.split(":")[0] ?? ""));
  // A float's or a duration's multiple names each distinct value by its bits beside it (the
  // snapshot write's heading, values.ts); the run reads the value alone.
  const head = [
    ...fields,
    ...(cardinality === "Multiple" && (base === "Float" || base === "Duration") ? ["bits"] : []),
  ].toSorted(byCodeUnits);
  const heading = head
    .map((key) => `${key}: fields.${key === "field" ? "SnapshotRecord" : rel}.fields.${key}`)
    .join(", ");
  const given = `${source.slice(0, match.index)}.match(given, { ${fields.toSorted(byCodeUnits).join(", ")} })${source.slice(endOf(match))}`;
  const answered = 'const { child, package: pkg, path, stage } = v(answered, "answered");';
  const keyed = replaceMatch(
    given.replaceAll(/\s*\.match\(fields\.SnapshotRecord, \{[^}]*\}\)/gu, ""),
    /const attempt = boundGradable;\s*const \{ child, package: pkg, path, n, stage, at \} = v\(attempt, "attempt"\);/u,
    () => answered,
    "posted key",
  );
  const sourced = replaceMatch(
    keyed,
    new RegExp(String.raw`v\(fields\.${rel}, "value"\)`, "u"),
    () => 'v(given, "value")',
    "posted source",
  );
  const rule = replaceMatch(
    replaceFirst(
      sourced,
      answered,
      `${answered}\nconst given = r.relation("${name}", { ${heading} });`,
    ),
    /\.match\(attempt, \{ at, child, n, package: pkg, path, stage \}\)/u,
    () => ".match(answered, { child, package: pkg, path, stage })",
    "posted match",
  );
  must(!rule.includes("attempt"), `a posted rule over no attempt: ${rule}`);

  return [name, rule];
};

/**
 * A rule of gradeArgumentsOf over the session's template values, over the answered session
 * instead.
 *
 * @param source The rule's text.
 * @returns The rule over the answered session.
 */
const inSession = (source: string): string => {
  const rule = replaceMatch(
    replaceMatch(
      source,
      /const attempt = boundGradable;\s*const \{ child, package: pkg, path, n \} = v\(attempt, "attempt"\);\s*const \{ stage \} = v\(fields\.ItemSession, "session"\);/u,
      () => 'const { child, package: pkg, path, stage } = v(answered, "answered");',
      "session key",
    ),
    /\.match\(attempt, \{ child, n, package: pkg, path \}\)\s*\.match\(fields\.ItemSession, \{ child, n, package: pkg, path, stage \}\)/u,
    () => ".match(answered, { child, package: pkg, path, stage })",
    "session match",
  );
  must(!rule.includes("attempt"), `a session rule over no attempt: ${rule}`);

  return rule;
};

/**
 * A rule of memberValuesOf over the latest attempt's values, kept to the item's declared outcomes.
 *
 * @param rule The rule's text.
 * @returns The rule over declared outcomes.
 */
const inForce = (rule: string): string => {
  if (rule.includes("fields.ProcessedAttempt")) {
    return rule;
  }

  const rel = groupOf(
    matchOf(
      rule,
      /v\(fields\.(?<rel>(?:OutcomeInForceSingle|SnapshotMultiple|SnapshotOrdered|SnapshotRecord)\w+), "value"\)/u,
    ),
    "rel",
  );
  const declared = rel.startsWith("SnapshotRecord") ? "ItemRecordVariable" : "ItemSessionVariable";
  const end = endOf(matchObject(rule, rel).match);

  return `${rule.slice(0, end)}.match(fields.${declared}, { declarationKind: "qti-outcome-declaration", identifier: variable, package: pkg, path })${rule.slice(end)}`;
};

/**
 * A rule of gradeArgumentsOf or memberValuesOf keyed by the item alone, over the answered
 * session's item.
 *
 * @param source The rule's text.
 * @param scope The reader the rule binds its key from.
 * @returns The rule over the answered session's item.
 */
const onAnswered = (source: string, scope: string): string =>
  replaceMatch(
    replaceMatch(
      source.replaceAll(new RegExp(String.raw`const ${scope} = boundGradable;\s*`, "gu"), ""),
      new RegExp(String.raw`v\(${scope}, "(?:attempt|graded)"\)`, "u"),
      () => 'v(answered, "answered")',
      "item key",
    ),
    new RegExp(String.raw`\.match\(${scope}, \{`, "u"),
    () => ".match(answered, {",
    "item match",
  );

/**
 * Each value argument, with gradeArgumentsOf's reader and memberValuesOf's.
 */
const READERS = [
  ["texts", "textsOf", "texts"],
  ["integers", "integersOf", "integers"],
  ["floats", "floatsOf", "floats"],
  ["booleans", "booleansOf", "booleans"],
  ["pairs", "pairsOf", "pairs"],
  ["directed_pairs", "directedPairsOf", "directedPairs"],
  ["points", "pointsOf", "points"],
  ["files", "filesOf", "files"],
  ["file_names", "fileNamesOf", "fileNames"],
  ["field_texts", "fieldTextsOf", "fieldTexts"],
  ["field_integers", "fieldIntegersOf", "fieldIntegers"],
  ["field_floats", "fieldFloatsOf", "fieldFloats"],
  ["field_booleans", "fieldBooleansOf", "fieldBooleans"],
  ["field_pairs", "fieldPairsOf", "fieldPairs"],
  ["field_directed_pairs", "fieldDirectedPairsOf", "fieldDirectedPairs"],
  ["field_points", "fieldPointsOf", "fieldPoints"],
  ["field_files", "fieldFilesOf", "fieldFiles"],
  ["field_file_names", "fieldFileNamesOf", "fieldFileNames"],
] as const;

/**
 * A query of the given rules.
 *
 * @param rules The rules' arrows.
 * @returns The query's text.
 */
const queryOf = (rules: readonly string[]): string =>
  `query(delivery)${rules.map((rule) => `\n.rule(${rule})`).join("")}`;

/**
 * Whether a rule of gradeArgumentsOf reads no stored attempt's own value: the previous attempt,
 * its ordinal, retained outcomes or the session's template values.
 *
 * @param rule The rule's text.
 * @returns Whether the posted list cannot stand for it.
 */
const unposted = (rule: string): boolean =>
  rule.includes("boundOrdinals") ||
  rule.includes("boundPrevious") ||
  rule.includes("boundRetained") ||
  rule.includes("fields.ItemSessionValue");

/**
 * The readers of the template, and the posted parameter lists each value reader reads, by
 * argument.
 *
 * @param ga The text of gradeArgumentsOf.
 * @param mv The text of memberValuesOf.
 * @returns The readers' text and each argument's posted lists.
 */
const readersText = (ga: string, mv: string) => {
  const declarations = [
    ["declarations", "declarationNodesOf"],
    ["declaration_attributes", "declarationAttributesOf"],
    ["declaration_texts", "declarationTextsOf"],
  ].map(
    ([arg = "", name = ""]) =>
      `  const ${camel(arg)} = ${queryOf(gaRules(ga, name).map((rule) => onAnswered(rule, "graded")))};\n`,
  );
  const memberVars = mvRules(mv, "vars");
  must(memberVars.length === 5, "memberValuesOf's five variable rules");

  const varRules = [
    ...memberVars.slice(0, 2).map((rule) => onAnswered(rule, "boundLatest")),
    ...memberVars.slice(2),
    ...gaRules(ga, "varsOf")
      .filter((rule) => rule.includes("fields.ItemSessionValue,"))
      .map(inSession),
  ];
  must(varRules.length === 8, "eight variable rules");

  const bases = gaRules(ga, "basesOf").map((rule) => onAnswered(rule, "attempt"));
  const uses = new Map<string, string[]>();
  const values = READERS.map(([arg, gname, mname]) => {
    const own = gaRules(ga, gname);
    const postedRules = own.filter((rule) => !unposted(rule)).map(posted);
    uses.set(
      arg,
      postedRules.map(([name]) => name),
    );

    const rules = [
      ...postedRules.map(([, rule]) => rule),
      ...mvRules(mv, mname).map(inForce),
      ...own.filter((rule) => rule.includes("fields.ItemSessionValue")).map(inSession),
    ];

    return `  /**
   * The values that cross as \`doc_${arg}\` rows: the posted responses, the latest attempt's
   * outcomes in force and the session's template values.
   */
  const ${camel(arg)} = ${queryOf(rules)};
`;
  });
  const out = [
    `  /**
   * The item's declarations, their attributes the machine reads and each \`qti-value\`'s string
   * value, as the grading statement reads them.
   */
${declarations.join("\n")}`,
    `  /**
   * The variables: each declared response, always; each declared outcome and completionStatus,
   * once the latest attempt's response processing ran; and each value the session's template
   * processing set.
   */
  const vars = ${queryOf(varRules)};
`,
    `  /**
   * Each declared typed variable's base type, built-ins included.
   */
  const bases = ${queryOf(bases)};
`,
    ...values,
  ];

  return { readers: out.join("\n"), uses };
};

/**
 * The template's arguments, by name, in the order they are returned and bound.
 */
const ARGS = [
  "bases",
  "body",
  "body_attributes",
  "booleans",
  "declaration_attributes",
  "declaration_texts",
  "declarations",
  "directed_pairs",
  "field_booleans",
  "field_directed_pairs",
  "field_file_names",
  "field_files",
  "field_floats",
  "field_integers",
  "field_pairs",
  "field_points",
  "field_texts",
  "file_names",
  "files",
  "floats",
  "integers",
  "pairs",
  "points",
  "runs",
  "texts",
  "vars",
] as const;

/**
 * Every posted parameter list's heading, by its name, from gradeArgumentsOf's snapshot rules.
 *
 * @param ga The text of gradeArgumentsOf.
 * @returns The headings.
 */
const postedHeadings = (ga: string): Map<string, string> =>
  new Map(
    READERS.flatMap(([, gname]) =>
      gaRules(ga, gname)
        .filter((rule) => !unposted(rule))
        .map(posted)
        .map(
          ([name, rule]) =>
            [
              name,
              groupOf(
                matchOf(
                  rule,
                  new RegExp(String.raw`r\.relation\("${name}", (?<heading>\{[^}]*\})\)`, "u"),
                ),
                "heading",
              ),
            ] as const,
        ),
    ),
  );

/**
 * One variant of the template: how a call names the answered item session.
 */
interface Variant {
  readonly answered: string;
  readonly call: string;
  readonly fn: string;
  readonly key: string;
  readonly keyIn: string;
  readonly member: boolean;
  readonly tail: string;
  readonly what: string;
}

/**
 * The template's two variants: the item session by its place, and a test member by its item ref.
 *
 * @param fragment The generator's fragments.
 * @returns The variants.
 */
const variantsOf = (fragment: Fragments): readonly Variant[] => [
  {
    answered: fragment("admission/item-answered"),
    call: "answerAdmissionOf",
    fn: "admissionArgumentsOf",
    key: fragment("admission/item-key"),
    keyIn: fragment("admission/item-key-in"),
    member: false,
    tail: fragment("admission/item-call-tail"),
    what: "the item session a call answers by its key, `child`, `package`, `path` and `n` (recordAttempt's\n * parameters); its stage is the session's own",
  },
  {
    answered: fragment("admission/member-answered"),
    call: "memberAnswerAdmissionOf",
    fn: "memberAdmissionArgumentsOf",
    key: fragment("admission/member-key"),
    keyIn: fragment("admission/member-key-in"),
    member: true,
    tail: fragment("admission/member-call-tail"),
    what: "a test member a call answers by its item ref, `child`, `stage` and `item` (answerTestItem's parameters)",
  },
];

/**
 * An argument's entry in the arguments builder's return: its reader, `runsOf` for the runs.
 *
 * @param arg The argument.
 * @returns The entry.
 */
const returned = (arg: (typeof ARGS)[number]): string => {
  if (arg === "runs") {
    return "    runs: runsOf";
  }

  return camel(arg) === arg ? `    ${arg}` : `    ${arg}: ${camel(arg)}`;
};

/**
 * One variant's arguments builder and call builder.
 *
 * @param variant The variant.
 * @param ga The text of gradeArgumentsOf.
 * @param mv The text of memberValuesOf.
 * @param common The readers both variants share.
 * @returns The builders' text.
 */
const variantText = (variant: Variant, ga: string, mv: string, common: string): string => {
  const { readers, uses } = readersText(ga, mv);
  const ret = ARGS.map(returned).join(",\n");
  const fn = `
/**
 * The arguments of response admission (\`#ledger/grading.ts\` admissionOf, canonical admission.sql's
 * \`admission_of\`, every argument bound by name) over ${variant.what}: the item's body as pantry stores it,
 * its element nodes and the attributes admission reads; its declarations; and the values, as
 * gradeArgumentsOf's readers read them: the posted responses, each sidecar's rows from the call's
 * parameter list of its name (\`<shape><T>\`, the snapshot write's own), every declared response a
 * variable, NULL where none is posted; and the values in force (QTI 3.0.1 §7.19.7: the record the
 * attempt starts from), the latest attempt's outcomes, singles in force, and its completion status,
 * once its response processing ran, adaptive or not, and the session's template values, correct
 * responses and defaults. Each reader is a query a rule binds to its own parameters, since the
 * posted lists are relation parameters (\`${variant.call}\`).
 */
export const ${variant.fn} = (delivery: DeliveryLevel) => {
  const fields = delivery.relations;

  /**
   * The call's parameters that name the answered item session.
   */
${variant.key}
${variant.answered}${common}
${readers}
  return {
    answered: answeredOf,
${ret},
    latest: latestOf,
  } as const;
};
`;
  const heads = postedHeadings(ga);
  const postedIn = [...heads.keys()]
    .toSorted(byCodeUnits)
    .map((name) => `    ${name}: r.relation("${name}", ${heads.get(name) ?? ""})`)
    .join(",\n");
  const binds = ARGS.map((arg) => {
    const names = uses.get(arg) ?? [];
    if (arg === "runs") {
      return `      runs: args.runs(${variant.member ? "false" : "validate"}).bind(key)`;
    }

    if (names.length > 0) {
      const extra = names
        .toSorted(byCodeUnits)
        .map((name) => `${name}: posted.${name}`)
        .join(", ");

      return `      ${arg}: args.${arg}.bind({ ...key, ${extra} })`;
    }

    return `      ${arg}: args.${arg}.bind(key)`;
  });
  const validateDoc = variant.member
    ? "A delivered test's members are admitted under validate-responses false, the run's: a\n * test that sets it true is no DeliveredTest (`#ledger/delivery.ts`)."
    : "`validate`, the stage's validate-responses, is the caller's to state, a fact of the run\n * (admission_run): one evaluation per statement for each setting, whichever rules read it.";
  const reasonsDoc = variant.member
    ? "\n * `reasonsIn`, the reasons admission refuses the answer for, guards every row of the answer's write\n * (`r.not(reasonsIn(r), {})`)."
    : "\n * The reasons in force are the caller's to read, under the stage's own validate-responses.";
  const call = `
/**
 * Response admission of the answer a call posts, over ${variant.what}: admission_of at the call's
 * arguments ({@link ${variant.fn}}), each reader bound to the rule's own parameters, so every rule of
 * a statement that reads it reads one evaluation. ${validateDoc} \`hiddenIn\`, the responses the
 * values in force hide, as the ledger keys a variable: their posted values are not written.${reasonsDoc}
 */
export const ${variant.call} = (delivery: DeliveryLevel) => {
  const fields = delivery.relations;
  const args = ${variant.fn}(delivery);

  /**
   * The call's parameters that name the answered item session, as a rule reads them.
   */
${variant.keyIn}
  /**
   * The posted values, one parameter list per value sidecar, as the answer's write names them.
   */
  const postedIn = <S>(r: Rule<S>) => ({
${postedIn},
  });

  /**
   * admission_of at the call's answer.
   */
  const runIn = <S>(r: Rule<S>${variant.member ? "" : ", validate: boolean"}) => {
    const key = keyIn(r);
    const posted = postedIn(r);

    return Fn.row(admissionOf, {
${binds.join(",\n")},
    });
  };

  /**
   * The responses the values in force hide, as the ledger keys a variable: each keeps the session's
   * value, and its posted value is not written (admission_of's \`hidden\`, which no setting of
   * validate-responses moves).
   */
  const hiddenOf = query(delivery).rule((r) => {
    const { hidden } = runIn(r${variant.member ? "" : ", false"});
    const { response } = v(hidden, "hidden");

    return r.match(hidden, { response }).find({
      variable: response,
    });
  });
`;

  return fn + call + variant.tail;
};

/**
 * Where a previous admission stage's blocks begin.
 */
const BEGIN = "\n/**\n * The arguments of response admission";

/**
 * Where attemptArgumentsOf's block begins, before which admission's blocks stand.
 */
const END_MARK =
  "\n/**\n * The same arguments over each item session of the sitting at its latest attempt";

/**
 * Grizzle's import, as the stages before leave it.
 */
const GRIZZLE_IMPORT =
  'import { ChangeSet, Fn, Num, param, pg, query, Type, v } from "@bjornpagen/grizzle";\n';

/**
 * The admission stage: admission's builders before attemptArgumentsOf (any of a previous stage's
 * dropped first), and the imports they need.
 *
 * @param stage The members stage's text, formatted.
 * @param fragment The generator's fragments.
 * @returns The stage's text.
 */
export const admissionStage = (stage: string, fragment: Fragments): string => {
  const begin = stage.indexOf(BEGIN);
  const src =
    begin === -1 ? stage : stage.slice(0, begin) + stage.slice(indexOf(stage, END_MARK, begin));
  const gaStart = indexOf(src, "export const gradeArgumentsOf = ");
  const ga = src.slice(gaStart, indexOf(src, END_MARK, gaStart));
  const mv = src.slice(indexOf(src, "export const memberValuesOf = "));
  const common = fragment("admission/common");
  const text = variantsOf(fragment)
    .map((variant) => variantText(variant, ga, mv, common))
    .join("");
  const at = indexOf(src, END_MARK);
  const inserted = src.slice(0, at) + text + src.slice(at);
  must(count(inserted, GRIZZLE_IMPORT) === 1, "grizzle's one import");

  const withRule = /^import (?:type )?\{[^}]*\bRule\b[^}]*\} from "@bjornpagen\/grizzle"/mu.test(
    inserted,
  )
    ? inserted
    : replaceFirst(
        inserted,
        GRIZZLE_IMPORT,
        `${GRIZZLE_IMPORT}import type { Rule } from "@bjornpagen/grizzle";\n`,
      );

  return withRule.includes("  admissionOf,\n")
    ? withRule
    : replaceFirst(
        withRule,
        "import {\n  copies,\n",
        "import {\n  admissionOf,\n  AdmissionRun,\n  copies,\n",
      );
};
