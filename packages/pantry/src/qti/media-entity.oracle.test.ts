/**
 * The package-media level's Media entity (`#pantry/qti/media.ts`): nothing a player fetches by
 * depends on an entity's replacement text the database never read. The audit's probe is the
 * box's first case: under an external subset, `<source srcset="a.png 1x&e;">` imports as one
 * in-package candidate whose descriptor is ` 1x&e;`, which a player that reads the subset may
 * expand into a second, off-package candidate.
 *
 * Oracle: the specification. XML 1.0 decides what a reference becomes: an undeclared entity's
 * reference is not well-formed where the document has no external subset and no parameter-entity
 * reference (WFC: Entity Declared, §4.1), and is kept unexpanded where it has one; a declared or
 * predefined one is expanded (§4.4). The policy then decides the verdict: a kept reference in a
 * fetched attribute, a `style` or a fetched text, and an external identifier anywhere in the
 * document type declaration (§2.8, §4.2.2), each break Media entity. Each case's expected
 * verdicts follow from its document type declaration, its value and its field by those rules, and
 * are held to the rows the import's write stores (`readProgram`, grizzle's insertion preview)
 * under each Media entity check as grizzle's evaluator judges it (`#pantry/test/host-judge.ts`).
 *
 * Bound: five document type declarations (none, an internal subset declaring the entity, a
 * `SYSTEM` and a `PUBLIC` external subset, an internal subset that declares and references an
 * external parameter entity) × three values (none, a predefined entity, an entity the internal
 * subset alone may declare) × five fields (a `source`'s `srcset`, an `img`'s `src`, a MathML
 * `style`, a card's `qti-file-href` text, and an `img`'s `alt`, which no player fetches): 75
 * packages, exhausted.
 */
import type { EvaluatedRow } from "@bjornpagen/grizzle";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Exit, FileSystem, Option, Result } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { QtiMedia } from "#pantry/qti/media.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { previewRowsOf } from "#pantry/test/host-judge.ts";
import { evaluatorOf } from "#pantry/test/row-evaluation.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The document type declarations of the box, by what each declares.
 */
const doctypeNames = ["internal", "none", "parameter", "public", "system"] as const;

/**
 * A document type declaration of the box.
 */
type Doctype = (typeof doctypeNames)[number];

/**
 * Each document type declaration of the box as written.
 */
const doctypes = {
  internal: '<!DOCTYPE qti-assessment-item [<!ENTITY e "x">]>',
  none: "",
  parameter:
    '<!DOCTYPE qti-assessment-item [<!ENTITY % p SYSTEM "https://elsewhere.example/p.ent"> %p;]>',
  public:
    '<!DOCTYPE qti-assessment-item PUBLIC "-//EXAMPLE//DTD ITEM//EN" "https://elsewhere.example/item.dtd">',
  system: '<!DOCTYPE qti-assessment-item SYSTEM "https://elsewhere.example/item.dtd">',
} as const satisfies Readonly<Record<Doctype, string>>;

/**
 * The values of the box: none, a predefined entity's reference, and a reference to `e`, which only
 * the internal subset of `internal` declares.
 */
const referenceNames = ["entity", "none", "predefined"] as const;

/**
 * A value of the box.
 */
type Reference = (typeof referenceNames)[number];

/**
 * Each value of the box as written.
 */
const references = {
  entity: "&e;",
  none: "",
  predefined: "&amp;",
} as const satisfies Readonly<Record<Reference, string>>;

/**
 * An item's body and what follows it, its catalog where it has one.
 */
interface ItemParts {
  readonly body: string;
  readonly after: string;
}

/**
 * The fields of the box. `alt` is no field a player fetches.
 */
const fieldNames = ["alt", "src", "srcset", "style", "text"] as const;

/**
 * A field of the box.
 */
type Field = (typeof fieldNames)[number];

/**
 * Each field of the box, with the item parts that write the reference in it.
 */
const fields = {
  alt: (ref: string): ItemParts => ({ after: "", body: `<p><img src="a.png" alt="a${ref}"/></p>` }),
  src: (ref: string): ItemParts => ({ after: "", body: `<p><img src="a.png${ref}" alt="a"/></p>` }),
  srcset: (ref: string): ItemParts => ({
    after: "",
    body: `<p><picture><source srcset="a.png 1x${ref}"/><img src="a.png" alt="a"/></picture></p>`,
  }),
  style: (ref: string): ItemParts => ({
    after: "",
    body: `<p><m:math xmlns:m="http://www.w3.org/1998/Math/MathML"><m:mi style="color:red${ref}">x</m:mi></m:math></p>`,
  }),
  text: (ref: string): ItemParts => ({
    after: `<qti-catalog-info><qti-catalog id="c"><qti-card support="sign-language"><qti-file-href mime-type="image/png">a.png${ref}</qti-file-href></qti-card></qti-catalog></qti-catalog-info>`,
    body: '<p data-catalog-idref="c">x</p>',
  }),
} as const satisfies Readonly<Record<Field, (ref: string) => ItemParts>>;

/**
 * One case of the box.
 */
interface EntityCase {
  readonly doctype: Doctype;
  readonly field: Field;
  readonly reference: Reference;
}

/**
 * Every case of the box, the audit's probe first.
 */
const cases: readonly EntityCase[] = [
  { doctype: "system", field: "srcset", reference: "entity" },
  ...doctypeNames.flatMap((doctype) =>
    referenceNames.flatMap((reference) =>
      fieldNames.map((field) => ({ doctype, field, reference })),
    ),
  ),
];

/**
 * Write a case as text.
 *
 * @param input - The case.
 * @returns Its text.
 */
const literalOf = (input: EntityCase): string =>
  `${input.reference} in ${input.field} under ${input.doctype}`;

/**
 * The XML 1.0 rule for the case's reference (§4.1, §4.4): `wellFormed` false where an undeclared
 * entity's reference stands with no external subset and no parameter-entity reference to declare
 * it; `kept` where it stands with one, so crust keeps it unexpanded.
 */
interface Expected {
  readonly externalIdentifier: boolean;
  readonly kept: boolean;
  readonly wellFormed: boolean;
}

/**
 * Decide the case by the specification and the policy ({@link Expected}).
 *
 * @param input - The case.
 * @returns What XML 1.0 makes of it.
 */
const expectedOf = (input: EntityCase): Expected => {
  const externalIdentifier = ["parameter", "public", "system"].includes(input.doctype);
  const undeclared = input.reference === "entity" && input.doctype !== "internal";

  return {
    externalIdentifier,
    kept: undeclared && externalIdentifier,
    wellFormed: !undeclared || externalIdentifier,
  };
};

/**
 * The manifest of every case: the item and its picture.
 */
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="I" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/><file href="a.png"/></resource></resources></manifest>`;

/**
 * Write a case's item.
 *
 * @param input - The case.
 * @returns Its text.
 */
const itemOf = (input: EntityCase): string => {
  const { after, body } = fields[input.field](references[input.reference]);

  return `<?xml version="1.0" encoding="UTF-8"?>
${doctypes[input.doctype]}
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="i" title="I" adaptive="false" time-dependent="false"><qti-item-body>${body}</qti-item-body>${after}</qti-assessment-item>`;
};

/**
 * Grizzle's evaluator of the package-media level's rows.
 */
const evaluate = evaluatorOf(QtiMedia);

/**
 * Media entity's checks, each over its relation: the row checks, and the rule over the query
 * `EntityAttribute`, whose rows {@link rowsOf} builds.
 */
const checks = QtiMedia.statements.flatMap((statement) =>
  statement.kind === "check" && statement.name === "Media_entity" ? [statement] : [],
);

/**
 * Whether a row breaks a Media entity check, as grizzle's evaluator judges it: its predicate false
 * or NULL.
 *
 * @param check - The check.
 * @param row - A row of its relation, as the import's write stores it or its query states it.
 * @returns Whether the row breaks it; the case fails where a domain refuses the row or the host
 *   leaves the check unevaluated.
 */
const breaks = (
  check: (typeof checks)[number],
  row: EvaluatedRow<(typeof checks)[number]["relation"]>,
): boolean => {
  const admitted = evaluate.admit(check.relation, row);
  if (Result.isFailure(admitted)) {
    return assert.fail(
      `${check.relation.name}: a row its domains refuse at ${admitted.failure.field}`,
    );
  }

  // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- The check's declared name, read off its statement, keys its verdict.
  const verdict = evaluate(check.relation, admitted.success).checks[check.name];

  return Result.isSuccess(verdict)
    ? verdict.success === "breaks"
    : assert.fail(`${check.relation.name}: ${verdict.failure.why}`);
};

/**
 * Read a program's rows as Media entity's checks read them: the rows the import's write stores,
 * and `EntityAttribute`'s as the query its check is over states them, each attribute one of whose
 * `AttributeEntity` rows is of it, with its governor.
 *
 * @param inputs - The program's inputs.
 * @returns The rows of each relation a check is over.
 */
const rowsOf = (inputs: PackageInputs) => {
  const rows = previewRowsOf(inputs);
  const entityKeys = new Set(
    rows.AttributeEntity.map(({ name, path, start }) => keyTextOf(path, start, name)),
  );

  return {
    Doctype: rows.Doctype,
    EntityAttribute: rows.Attribute.flatMap(({ governor, name, package: pkg, path, start }) =>
      entityKeys.has(keyTextOf(path, start, name))
        ? [{ governor, name, package: pkg, path, start }]
        : [],
    ),
    Node: rows.Node,
  };
};

/**
 * The relations whose rows break a Media entity check: the rows {@link rowsOf} reads, each check
 * grizzle's verdict over a row.
 *
 * @param inputs - The program's inputs.
 * @returns The relations, each once, sorted.
 */
const brokenOf = (inputs: PackageInputs): readonly string[] => {
  const rows = rowsOf(inputs);

  return [
    ...new Set(
      checks.flatMap((check) =>
        rows[check.relation.name].some((row) => breaks(check, row)) ? [check.relation.name] : [],
      ),
    ),
  ].toSorted();
};

/**
 * What a case's verdicts are by the specification: the relations whose rows break a check, none
 * where the document is not well-formed and the import refuses it before any row.
 *
 * @param input - The case.
 * @returns The relations, sorted.
 */
const expectedBroken = (input: EntityCase): readonly string[] => {
  const expected = expectedOf(input);
  const fetched = input.field !== "alt";

  return [
    ...(expected.kept && fetched && input.field !== "text" ? ["EntityAttribute"] : []),
    ...(expected.externalIdentifier ? ["Doctype"] : []),
    ...(expected.kept && input.field === "text" ? ["Node"] : []),
  ].toSorted();
};

/**
 * A situation the box must reach.
 */
type Situation =
  | "a kept reference in a field a player fetches"
  | "a kept reference in alt"
  | "not well-formed"
  | "the audit's probe";

layer(NodeServices.layer, { excludeTestServices: true })("Media entity", (it) => {
  it.effect(
    "refuses a kept entity reference in what a player fetches and an external identifier, as XML 1.0 reads each reference",
    (ctx) =>
      searched(
        ctx,
        Effect.gen(function* mediaEntityRuns() {
          const fs = yield* FileSystem.FileSystem;
          const directory = yield* scratchDirectory("media-entity-");

          return yield* exhaust(
            {
              box: "five document type declarations × three values × five fields, the audit's probe first",
              caseHang: Duration.minutes(5),
              concurrency: 1,
              coverage: requiredInSpace<Situation>([
                "the audit's probe",
                "a kept reference in a field a player fetches",
                "a kept reference in alt",
                "not well-formed",
              ]),
              generator: int(0, cases.length - 1),
              literal: (at) =>
                Option.match(Option.fromUndefinedOr(cases[at]), {
                  onNone: () => String(at),
                  onSome: literalOf,
                }),
              oracle: {
                kind: "specification",
                name: "XML 1.0 §2.8, §4.1, §4.2.2 and §4.4, and the policy",
              },
              suite: "pantry/media-entity",
            },
            (at, c) =>
              Effect.gen(function* mediaEntityCase() {
                const input = cases[at];
                assert.isDefined(input, `no case ${String(at)}`);
                if (input === undefined) {
                  return;
                }

                const expected = expectedOf(input);
                if (at === 0) {
                  c.note("the audit's probe");
                }

                if (!expected.wellFormed) {
                  c.note("not well-formed");
                }

                if (expected.kept) {
                  c.note(
                    input.field === "alt"
                      ? "a kept reference in alt"
                      : "a kept reference in a field a player fetches",
                  );
                }

                const dir = `${directory}/c${String(at)}`;
                yield* fs.makeDirectory(dir, { recursive: true });
                yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifest);
                yield* fs.writeFileString(`${dir}/item.xml`, itemOf(input));
                yield* fs.writeFile(`${dir}/a.png`, new Uint8Array([0x89, 0x50, 0x4e, 0x47]));

                const read = yield* Effect.exit(readProgram(dir, "probe"));
                yield* fs.remove(dir, { recursive: true });

                const broken = Exit.match(read, {
                  onFailure: () => Option.none<readonly string[]>(),
                  onSuccess: (program) => Option.some(brokenOf(program.inputs)),
                });
                assert.deepStrictEqual(
                  broken,
                  expected.wellFormed ? Option.some(expectedBroken(input)) : Option.none(),
                  `${literalOf(input)}: the import's rows break Media entity on ${Option.match(broken, { onNone: () => "no rows, the package refused", onSome: (relations) => `[${relations.join(", ")}]` })}`,
                );
              }),
          );
        }).pipe(Effect.scoped),
      ),
    600_000,
  );
});
