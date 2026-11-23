/**
 * The walk's readers (COMPILE-AT-PUBLISH C2, the walk): each input of the machine's walk entry
 * (`walk_from`), its rows read from the stored walk relation of the document a run walks
 * (`#ledger/walks.ts`), re-keyed to the run's document, and, for an item whose processing names a
 * published template, from that template's closed facts. One table, the readers of the grade, the
 * take and a test's outcome processing each written from it.
 */
import { indexOf, must } from "#tools/gen/grade/text.ts";

/**
 * One column of a walk input: the machine heading's field, the stored relation's, and the local a
 * reader binds it to.
 */
interface Column {
  readonly heading: string;
  readonly field: string;
  readonly local: string;
}

/**
 * One input of the walk entry: its argument, the stored relation that holds its rows and their
 * columns, and the published templates' closed facts of it where a template has any; `token`, for
 * a column the reader maps through a closed token relation (the node kind, the operator's class).
 */
interface WalkInput {
  readonly argument: string;
  /**
   * Its machine heading, and a literal of each of its columns: the row the take's start run is
   * given of it, which `r.or()` never matches.
   */
  readonly heading: string;
  readonly empty: readonly (readonly [string, string])[];
  readonly reader: string;
  readonly relation: string;
  readonly columns: readonly Column[];
  readonly token?: { readonly column: string; readonly relation: string; readonly from: string };
  readonly template?: string;
}

/**
 * A column whose heading field, relation field and local are one name.
 *
 * @param name The name.
 * @returns The column.
 */
const same = (name: string): Column => ({ field: name, heading: name, local: name });

/**
 * A column under its own local.
 *
 * @param heading The heading's field.
 * @param field The relation's field.
 * @param local The reader's local.
 * @returns The column.
 */
const column = (heading: string, field: string, local: string): Column => ({
  field,
  heading,
  local,
});

/**
 * Every input of the walk entry, in the order the entry names them.
 */
export const WALK_INPUTS: readonly WalkInput[] = [
  {
    argument: "programs",
    columns: [same("end"), column("kind", "kind", "kind"), same("parent")],
    empty: [
      ["end", "0n"],
      ["kind", '"qti-response-processing"'],
      ["parent", "0n"],
    ],
    heading: "ProgramNode",
    reader: "programNodesOf",
    relation: "WalkNode",
    template: "TemplateNode",
  },
  {
    argument: "walk_areas",
    columns: [same("kind")],
    empty: [["kind", '"everywhere"']],
    heading: "DocWalkArea",
    reader: "walkAreasOf",
    relation: "WalkArea",
  },
  {
    argument: "walk_categories",
    columns: [same("category"), same("filter"), column("place", "at", "place")],
    empty: [
      ["category", '""'],
      ["filter", '"include"'],
      ["place", "0n"],
    ],
    heading: "DocWalkCategory",
    reader: "walkCategoriesOf",
    relation: "WalkCategory",
  },
  {
    argument: "walk_coords",
    columns: [same("c"), same("place")],
    empty: [
      ["c", "0"],
      ["place", "0"],
    ],
    heading: "DocWalkCoord",
    reader: "walkCoordsOf",
    relation: "WalkAreaCoord",
  },
  {
    argument: "walk_customs",
    columns: [column("class", "class", "operatorClass")],
    empty: [["class", '"rubric-score"']],
    heading: "DocWalkCustom",
    reader: "walkCustomsOf",
    relation: "BoundOperator",
    token: { column: "class", from: "class", relation: "OperatorClassToken" },
  },
  {
    argument: "walk_equals",
    columns: [
      column("lower_in", "lowerIn", "lowerIn"),
      same("mode"),
      column("upper_in", "upperIn", "upperIn"),
    ],
    empty: [
      ["lower_in", "true"],
      ["mode", '"exact"'],
      ["upper_in", "true"],
    ],
    heading: "DocWalkEqual",
    reader: "walkEqualsOf",
    relation: "WalkEqual",
    template: "TemplateEqual",
  },
  {
    argument: "walk_filters",
    columns: [same("filter")],
    empty: [["filter", '"include"']],
    heading: "DocWalkFilter",
    reader: "walkFiltersOf",
    relation: "WalkFilter",
  },
  {
    argument: "walk_floats",
    columns: [same("field"), same("value")],
    empty: [
      ["field", '"frange.lo"'],
      ["value", "0"],
    ],
    heading: "DocWalkFloat",
    reader: "walkFloatsOf",
    relation: "WalkFloat",
  },
  {
    argument: "walk_idents",
    columns: [same("identifier")],
    empty: [["identifier", '""']],
    heading: "DocWalkIdent",
    reader: "walkIdentsOf",
    relation: "WalkIdent",
    template: "TemplateIdent",
  },
  {
    argument: "walk_integers",
    columns: [same("field"), same("value")],
    empty: [
      ["field", '"range.lo"'],
      ["value", "0n"],
    ],
    heading: "DocWalkInteger",
    reader: "walkIntegersOf",
    relation: "WalkInteger",
  },
  {
    argument: "walk_literal_booleans",
    columns: [same("value")],
    empty: [["value", "false"]],
    heading: "DocWalkLiteralBoolean",
    reader: "walkLiteralBooleansOf",
    relation: "WalkLiteralBoolean",
  },
  {
    argument: "walk_literal_directed_pairs",
    columns: [column("source", "source", "pairSource"), same("target")],
    empty: [
      ["source", '""'],
      ["target", '""'],
    ],
    heading: "DocWalkLiteralDirectedPair",
    reader: "walkLiteralDirectedPairsOf",
    relation: "WalkLiteralDirectedPair",
  },
  {
    argument: "walk_literal_floats",
    columns: [same("base"), same("value")],
    empty: [
      ["base", '"float"'],
      ["value", "0"],
    ],
    heading: "DocWalkLiteralFloat",
    reader: "walkLiteralFloatsOf",
    relation: "WalkLiteralFloat",
    template: "TemplateLiteralFloat",
  },
  {
    argument: "walk_literal_integers",
    columns: [same("value")],
    empty: [["value", "0n"]],
    heading: "DocWalkLiteralInteger",
    reader: "walkLiteralIntegersOf",
    relation: "WalkLiteralInteger",
  },
  {
    argument: "walk_literal_pairs",
    columns: [same("greatest"), same("least")],
    empty: [
      ["greatest", '""'],
      ["least", '""'],
    ],
    heading: "DocWalkLiteralPair",
    reader: "walkLiteralPairsOf",
    relation: "WalkLiteralPair",
  },
  {
    argument: "walk_literal_points",
    columns: [same("x"), same("y")],
    empty: [
      ["x", "0n"],
      ["y", "0n"],
    ],
    heading: "DocWalkLiteralPoint",
    reader: "walkLiteralPointsOf",
    relation: "WalkLiteralPoint",
  },
  {
    argument: "walk_literal_texts",
    columns: [same("base"), same("value")],
    empty: [
      ["base", '"string"'],
      ["value", '"-"'],
    ],
    heading: "DocWalkLiteralText",
    reader: "walkLiteralTextsOf",
    relation: "WalkLiteralText",
    template: "TemplateLiteralText",
  },
  {
    argument: "walk_names",
    columns: [same("field"), same("value")],
    empty: [
      ["field", '"base"'],
      ["value", '""'],
    ],
    heading: "DocWalkName",
    reader: "walkNamesOf",
    relation: "WalkName",
  },
  {
    argument: "walk_patterns",
    columns: [same("program")],
    empty: [["program", '""']],
    heading: "DocWalkPattern",
    reader: "walkPatternsOf",
    relation: "WalkPattern",
  },
  {
    argument: "walk_refs",
    columns: [same("field"), same("ref")],
    empty: [
      ["field", '"pattern"'],
      ["ref", '""'],
    ],
    heading: "DocWalkRef",
    reader: "walkRefsOf",
    relation: "WalkRef",
  },
  {
    argument: "walk_rounds",
    columns: [same("mode")],
    empty: [["mode", '"significantFigures"']],
    heading: "DocWalkRound",
    reader: "walkRoundsOf",
    relation: "WalkRound",
  },
  {
    argument: "walk_texts",
    columns: [column("case_sensitive", "caseSensitive", "caseSensitive"), same("substring")],
    empty: [
      ["case_sensitive", "true"],
      ["substring", "false"],
    ],
    heading: "DocWalkText",
    reader: "walkTextsOf",
    relation: "WalkText",
  },
];

/**
 * The declared variables a braced pattern may name (`walk_refs`' field `pattern`, QTI 3.0.1
 * §9.3.4's StringOrVariableRef): the run document's declarations, typed and record, never a
 * built-in, as `program_of`'s `declared` read them.
 */
const DECLARED = ["ItemVariable", "ItemRecordVariable"] as const;

/**
 * Where a reader finds the subtree a run walks.
 */
export interface Roots {
  /**
   * The rows of the roots, a bound query of (package, path: the run's, source, document, start,
   * end), or (package, path, start, end) where the run walks its own document.
   */
  readonly bound: string;
  /**
   * Whether the roots name another document than the run's (`source`, `document`).
   */
  readonly located: boolean;
  /**
   * The bound query of the runs whose item may name a published template, or none.
   */
  readonly templated?: string;
}

/**
 * A reader's head and match pairs over its columns.
 *
 * @param input The input.
 * @returns The bindings, keyed by field and by heading field.
 */
const pairs = (input: WalkInput) => ({
  binds: input.columns
    .map((c) => (c.field === c.local ? c.local : `${c.field}: ${c.local}`))
    .join(", "),
  heads: input.columns
    .map((c) => {
      const value = input.token?.column === c.heading ? "token" : c.local;

      return c.heading === value ? value : `${c.heading}: ${value}`;
    })
    .join(", "),
});

/**
 * A walk input's rule over the stored walk of the run's document.
 *
 * @param input The input.
 * @param roots Where the run's subtree is.
 * @param indent One level of the text's indentation.
 * @returns The rule's text.
 */
const storedRule = (input: WalkInput, roots: Roots, indent: string): string => {
  const { binds, heads } = pairs(input);
  const at = roots.located
    ? "package: pkg, path: item, source, document, start: first, end: last"
    : "package: pkg, path: item, start: first, end: last";
  const place = roots.located ? "package: source, path: document" : "package: pkg, path: item";
  const token =
    input.token === undefined
      ? ""
      : `${indent.repeat(3)}const { token } = v(fields.${input.token.relation}, "token")\n`;
  const tokenMatch =
    input.token === undefined
      ? ""
      : `\n${indent.repeat(4)}.match(fields.${input.token.relation}, { ${input.token.from}: ${input.columns.find((c) => c.heading === input.token?.column)?.local ?? ""}, token })`;

  return [
    `${indent.repeat(2)}.rule((r) => {`,
    `${indent.repeat(3)}const roots = ${roots.bound}`,
    `${indent.repeat(3)}const { ${at} } = v(roots, "root")`,
    `${indent.repeat(3)}const { start, ${binds} } = v(fields.${input.relation}, "walk")`,
    `${token}${indent.repeat(3)}return r`,
    `${indent.repeat(4)}.match(roots, { ${at} })`,
    `${indent.repeat(4)}.match(fields.${input.relation}, { ${place}, start, ${binds} })${tokenMatch}`,
    `${indent.repeat(4)}.where(r.ge(start, first), r.lt(start, last))`,
    `${indent.repeat(4)}.find({ package: pkg, path: item, start, ${heads} })`,
    `${indent.repeat(2)}})`,
  ].join("\n");
};

/**
 * A walk input's rule over a published template's closed facts, for an item whose processing names
 * one (the delivery level's TemplatedProgram).
 *
 * @param input The input.
 * @param templated The bound query of the runs.
 * @param indent One level of the text's indentation.
 * @returns The rule's text.
 */
const templateRule = (input: WalkInput, templated: string, indent: string): string => {
  const { binds, heads } = pairs(input);
  const isNode = input.relation === "WalkNode";

  return [
    `${indent.repeat(2)}.rule((r) => {`,
    `${indent.repeat(3)}const graded = ${templated}`,
    `${indent.repeat(3)}const { package: pkg, path: item } = v(graded, "graded")`,
    `${indent.repeat(3)}const { template } = v(fields.TemplatedProgram, "templated")`,
    `${indent.repeat(3)}const { start, ${binds} } = v(fields.${input.template ?? ""}, "walk")`,
    ...(isNode ? [`${indent.repeat(3)}const { token } = v(fields.ProgramNodeKind, "token")`] : []),
    `${indent.repeat(3)}return r`,
    `${indent.repeat(4)}.match(graded, { package: pkg, path: item })`,
    `${indent.repeat(4)}.match(fields.TemplatedProgram, { package: pkg, path: item, template })`,
    `${indent.repeat(4)}.match(fields.${input.template ?? ""}, { template, start, ${binds} })`,
    ...(isNode ? [`${indent.repeat(4)}.match(fields.ProgramNodeKind, { kind, token })`] : []),
    `${indent.repeat(4)}.find({ package: pkg, path: item, start, ${isNode ? heads.replace("kind", "kind: token") : heads} })`,
    `${indent.repeat(2)}})`,
  ].join("\n");
};

/**
 * Each braced pattern's variable (`walk_refs`, field `pattern`): a qti-pattern-match's `pattern`
 * that is `{name}`, `name` declared in the run's document, read as the variable it names (QTI 3.0.1
 * §9.3.4: "if a string appears to be a reference to a template or outcome variable but there is no
 * variable with the given name it should be treated simply as string value"). A braced pattern is
 * no XML Schema pattern, so it has no program (WalkPattern).
 *
 * @param roots Where the run's subtree is.
 * @param declared The relation of the run's declared names.
 * @param indent One level of the text's indentation.
 * @returns The rule's text.
 */
const patternRefRule = (roots: Roots, declared: string, indent: string): string => {
  const at = roots.located
    ? "package: pkg, path: item, source, document, start: first, end: last"
    : "package: pkg, path: item, start: first, end: last";
  const place = roots.located ? "package: source, path: document" : "package: pkg, path: item";

  return [
    `${indent.repeat(2)}.rule((r) => {`,
    `${indent.repeat(3)}const roots = ${roots.bound}`,
    `${indent.repeat(3)}const { ${at} } = v(roots, "root")`,
    `${indent.repeat(3)}const { start } = v(fields.WalkNode, "match")`,
    `${indent.repeat(3)}const { value } = v(fields.Attribute, "pattern")`,
    `${indent.repeat(3)}const { identifier } = v(fields.${declared}, "declared")`,
    `${indent.repeat(3)}return r`,
    `${indent.repeat(4)}.match(roots, { ${at} })`,
    `${indent.repeat(4)}.match(fields.WalkNode, { ${place}, start, kind: "qti-pattern-match" })`,
    `${indent.repeat(4)}.match(fields.Attribute, { ${place}, start, name: "pattern", value })`,
    `${indent.repeat(4)}.match(fields.${declared}, { package: pkg, path: item, identifier })`,
    `${indent.repeat(4)}.where(r.ge(start, first), r.lt(start, last), r.eq(value, Text.concat(Text.concat(Type.literal(DocWalkIdent.fields.identifier, "{"), identifier), "}")))`,
    `${indent.repeat(4)}.find({ package: pkg, path: item, start, field: Type.literal(DocWalkRef.fields.field, "pattern"), ref: identifier })`,
    `${indent.repeat(2)}})`,
  ].join("\n");
};

/**
 * Every walk reader, each a function of the session the grade's readers bind.
 *
 * @param roots Where each run's subtree is.
 * @returns The readers' text.
 */
export const walkReaders = (roots: Roots): string =>
  WALK_INPUTS.map((input) => {
    const rules = [
      storedRule(input, roots, "\t"),
      ...(input.template !== undefined && roots.templated !== undefined
        ? [templateRule(input, roots.templated, "\t")]
        : []),
      ...(input.argument === "walk_refs"
        ? DECLARED.map((d) => patternRefRule(roots, d, "\t"))
        : []),
    ];
    must(rules.length > 0, `${input.argument}'s rules`);

    const doc =
      input.argument === "programs"
        ? "/** The program's elements, each of a processing kind, by the machine's token: its document's stored walk\n * (WalkNode), or the published template's its processing names (TemplatedProgram, TemplateNode). */"
        : `/** The walk's ${input.argument} of each run's program (${input.relation}), by the run's document. */`;

    return `${doc}\nconst ${input.reader} = (session: GradedSession) =>\n\tquery(Installed)\n${rules.join("\n")}`;
  }).join("\n\n");

/**
 * The walk's arguments, each bound to its reader, as a reader's return lists them.
 *
 * @param sitting The bound sitting's name.
 * @returns The lines.
 */
export const walkReturns = (sitting: string): string =>
  WALK_INPUTS.filter((input) => input.argument !== "programs")
    .map((input) => `\t\t${input.argument}: ${input.reader}(${sitting}),`)
    .join("\n");

/**
 * The walk's arguments, each bound as a run binds the reader's.
 *
 * @returns The lines.
 */
export const walkBinds = (): string =>
  WALK_INPUTS.filter((input) => input.argument !== "programs")
    .map((input) => `\t\t\t${input.argument}: args.${input.argument}.bind(bySession(session)),`)
    .join("\n");

/**
 * The grade's roots: each graded item's response processing subtree, by the document it is in
 * (`responseRootsOf`), and the graded items a published template may run.
 */
const gradeRoots: Roots = {
  bound: "responseRootsOf(session).bind(bySession(session))",
  located: true,
  templated: "gradableOf(session).bind(bySession(session))",
};

/**
 * The readers' fragment with the walk's readers in it, before the declarations' readers, which
 * the take's transform keeps (its own roots, every template rule dropped).
 *
 * @param readers The readers' fragment.
 * @returns The text.
 */
export const walked = (readers: string): string => {
  const at = indexOf(
    readers,
    "/** The graded items' declarations' nodes of the kinds the machine reads. */",
  );

  return `${readers.slice(0, at)}${walkReaders(gradeRoots)}\n\n${readers.slice(at)}`;
};

/**
 * A readers' return with the walk's arguments after its \`programs\`.
 *
 * @param text The return's text.
 * @returns The text.
 */
export const withWalkReturns = (text: string): string => {
  const line = "\t\tprograms: programNodesOf(gradedSitting),\n";
  const at = indexOf(text, line) + line.length;

  return `${text.slice(0, at)}${walkReturns("gradedSitting")}\n${text.slice(at)}`;
};

/**
 * A run's binds with the walk's arguments after its \`programs\`.
 *
 * @param text The binds' text.
 * @returns The text.
 */
export const withWalkBinds = (text: string): string => {
  const line = "\t\t\tprograms: args.programs.bind(bySession(session)),\n";
  const at = indexOf(text, line) + line.length;

  return `${text.slice(0, at)}${walkBinds()}\n${text.slice(at)}`;
};

/**
 * The count of rules over a published template's facts the readers hold, which a take drops.
 */
export const templateRuleCount = WALK_INPUTS.filter((input) => input.template !== undefined).length;

/**
 * Every walk reader of a test's outcome processing (`testTreeOf`'s), each over its `roots`, the
 * subtree of the test document's own `qti-outcome-processing` (package, path, start, end): a test
 * names no template.
 *
 * @returns The readers' text, each a const of the builder.
 */
export const walkTestReaders = (): string =>
  WALK_INPUTS.map((input) => {
    const { binds, heads } = pairs(input);
    const token =
      input.token === undefined
        ? ""
        : `    const { token } = v(fields.${input.token.relation}, "token");\n`;
    const tokenMatch =
      input.token === undefined
        ? ""
        : `\n      .match(fields.${input.token.relation}, { ${input.token.from}: ${input.columns.find((c) => c.heading === input.token?.column)?.local ?? ""}, token })`;
    const stored = `query(delivery).rule((r) => {
    const { package: pkg, path, start: first, end: last } = v(roots, "root");
    const { start, ${binds} } = v(fields.${input.relation}, "walk");
${token}
    return r
      .match(roots, { end: last, package: pkg, path, start: first })
      .match(fields.${input.relation}, { package: pkg, path, start, ${binds} })${tokenMatch}
      .where(r.ge(start, first), r.lt(start, last))
      .find({ package: pkg, path, start, ${heads} });
  })`;
    const refs =
      input.argument === "walk_refs"
        ? DECLARED.map(
            (declared) => `
  .rule((r) => {
    const { package: pkg, path, start: first, end: last } = v(roots, "root");
    const { start } = v(fields.WalkNode, "match");
    const { value } = v(fields.Attribute, "pattern");
    const { identifier } = v(fields.${declared}, "declared");

    return r
      .match(roots, { end: last, package: pkg, path, start: first })
      .match(fields.WalkNode, { kind: "qti-pattern-match", package: pkg, path, start })
      .match(fields.Attribute, { name: "pattern", package: pkg, path, start, value })
      .match(fields.${declared}, { identifier, package: pkg, path })
      .where(r.ge(start, first), r.lt(start, last), r.eq(value, Text.concat(Text.concat(Type.literal(DocWalkIdent.fields.identifier, "{"), identifier), "}")))
      .find({ field: Type.literal(DocWalkRef.fields.field, "pattern"), package: pkg, path, ref: identifier, start });
  })`,
          ).join("")
        : "";

    return `  /**
   * The walk's ${input.argument} of the test's outcome processing (${input.relation}).
   */
  const ${input.reader.replace(/Of$/u, "")} = ${stored}${refs};`;
  }).join("\n\n");

/**
 * The test tree's walk arguments, as its return lists them.
 *
 * @returns The lines.
 */
export const walkTestReturns = (): string =>
  WALK_INPUTS.map((input) => `    ${input.argument}: ${input.reader.replace(/Of$/u, "")},`).join(
    "\n",
  );

/**
 * The test tree's fragment with the walk's readers and their returns in it: the readers before its
 * declarations', the returns in its tree's return.
 *
 * @param tree The fragment.
 * @returns The text.
 */
export const walkedTest = (tree: string): string => {
  const readersAt = indexOf(
    tree,
    "  /**\n   * Each document's declarations' nodes of the kinds the machine reads.",
  );
  const withReaders = `${tree.slice(0, readersAt)}${walkTestReaders()}\n\n${tree.slice(readersAt)}`;
  const returnLine = "  return {\n    declaration_attributes: declarationAttributes,\n";
  const returnAt = indexOf(withReaders, returnLine) + "  return {\n".length;

  return `${withReaders.slice(0, returnAt)}${walkTestReturns()}\n${withReaders.slice(returnAt)}`;
};

/**
 * The take's start run's empty walk inputs, each by its argument, its heading and a literal row of
 * it with the key every input is read by, (package, path, start).
 *
 * @returns The inputs, in the walk's order.
 */
export const walkEmpties = (): readonly (readonly [
  string,
  string,
  readonly (readonly [string, string])[],
])[] =>
  WALK_INPUTS.map(({ argument, empty, heading }) => {
    must(empty.length > 0, `${argument}'s empty row states its columns`);

    const keyed: readonly (readonly [string, string])[] = [
      ...empty,
      ["package", '""'],
      ["path", '""'],
      ["start", "0n"],
    ];

    return [argument, heading, keyed.toSorted(([a], [b]) => (a < b ? -1 : 1))] as const;
  });
