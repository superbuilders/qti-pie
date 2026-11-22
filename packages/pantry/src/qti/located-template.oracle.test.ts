/**
 * A located response processing template (information model §4.6.1 and §4.6.2): an item's response
 * processing that holds no rule of its own and names no published template runs the rules of the
 * template its `template-location` names, a document of the package whose root is a
 * `qti-response-processing`, as its own, so the template's references name the item's variables
 * (§6.9.40: "an itemVariable that has been declared in a corresponding variableDeclaration or is
 * one of the built-in variables"; §6.9.47: a map response's mapping "must have been declared"). The
 * schema states it as `LocatedTemplate` and places the template in the item's own placement
 * (`placedDocuments`, `#pantry/qti/overlay-queries/expression.ts`), so every law over a placed
 * reference or a placed expression judges the template's in the item, as reading 117 judges an
 * included rules fragment's: "Variable declared", "Variable kind", "Lookup type", "Mapped response"
 * and "Condition type" among them.
 *
 * Oracle: the specification's text above, as the case writes it (each case states the laws its
 * template breaks in its item), against the law oracle (`#pantry/test/oracle.ts` `judge`), and the
 * import's rows built with no host law broken (`#pantry/test/gen/genetic/judge.ts` `judgeOne`),
 * since the laws over the located template are rules over a query, which only the database
 * evaluates; and the schema's statements of them.
 *
 * Bound: 14 packages, exhausted: a template that reads only declared variables, an undeclared one,
 * a braced string, a map response with and without the item's mapping, a built-in response mapped,
 * a lookup of a built-in outcome, a response set as an outcome, a float that is a whole condition,
 * a response compared with a half (`qti-gt`), a float's and an identifier's, typed in the item as
 * its own processing is ("Operand fit", P23); the same undeclared reference under a processing that
 * holds a rule of its own, under a published template, and with no location.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, describe, it, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Option } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { LocatedTemplate } from "#pantry/qti/names.ts";
import { Qti } from "#pantry/qti/schema.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { overHalf, responseWritings } from "#pantry/test/placed-types.ts";
import type { ResponseType } from "#pantry/test/placed-types.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne, shownDisagreement } from "#pantry/test/gen/genetic/judge.ts";
import { lawsOf } from "#pantry/test/oracle.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * The oracle's law tables over the composed grammar.
 */
const laws = lawsOf(grammar);

/**
 * The namespace of every QTI document of the box.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * How a case's item writes its response processing: located (no rule, no template, a location),
 * located beside a published template, holding a rule of its own beside the location, or naming no
 * location at all.
 */
type Processing = "located" | "published" | "inline" | "unlocated";

/**
 * One case of the box: the template's rules, the item's `RESPONSE`'s base type and whether it holds
 * a mapping, how the item writes its processing, and the laws the specification says the package
 * breaks.
 */
interface TemplateCase {
  readonly breaks: readonly string[];
  readonly mapped: boolean;
  readonly name: string;
  readonly processing: Processing;
  readonly response: ResponseType;
  readonly rules: string;
}

/**
 * A rule that sets `SCORE` where a condition holds.
 *
 * @param condition - The condition.
 * @returns The rule.
 */
const scoredIf = (condition: string): string =>
  `<qti-response-condition><qti-response-if>${condition}<qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value></qti-response-if></qti-response-condition>`;

/**
 * The rules of a template that reads only the item's declared variables.
 */
const declaredRules = scoredIf(
  '<qti-match><qti-variable identifier="RESPONSE"/><qti-correct identifier="RESPONSE"/></qti-match>',
);

/**
 * The rules of a template that reads a variable the item does not declare.
 */
const undeclaredRules = scoredIf(
  '<qti-match><qti-variable identifier="NOPE"/><qti-correct identifier="RESPONSE"/></qti-match>',
);

/**
 * A template that sets `SCORE` to its response's mapped value, of `RESPONSE` or a built-in.
 *
 * @param identifier - The response mapped.
 * @returns The rules.
 */
const mappedRules = (identifier: string): string =>
  `<qti-set-outcome-value identifier="SCORE"><qti-map-response identifier="${identifier}"/></qti-set-outcome-value>`;

/**
 * Every case of the box.
 */
const cases: readonly TemplateCase[] = [
  {
    breaks: [],
    mapped: false,
    name: "declared",
    processing: "located",
    response: "identifier",
    rules: declaredRules,
  },
  {
    breaks: ["Variable declared"],
    mapped: false,
    name: "undeclared",
    processing: "located",
    response: "identifier",
    rules: undeclaredRules,
  },
  {
    breaks: [],
    mapped: false,
    name: "braced string",
    processing: "located",
    response: "identifier",
    // A pattern match takes a string, so it matches a string and no identifier response: the
    // template is typed in its item, where "Operand fit" judges its operand.
    rules: scoredIf(
      '<qti-pattern-match pattern="{NOPE}"><qti-base-value base-type="string">A</qti-base-value></qti-pattern-match>',
    ),
  },
  {
    breaks: [],
    mapped: true,
    name: "mapped with a mapping",
    processing: "located",
    response: "identifier",
    rules: mappedRules("RESPONSE"),
  },
  {
    breaks: ["Mapped response"],
    mapped: false,
    name: "mapped with none",
    processing: "located",
    response: "identifier",
    rules: mappedRules("RESPONSE"),
  },
  {
    breaks: ["Mapped response"],
    mapped: true,
    name: "a built-in response mapped",
    processing: "located",
    response: "identifier",
    rules: mappedRules("numAttempts"),
  },
  {
    breaks: ["Lookup type"],
    mapped: false,
    name: "a built-in outcome looked up",
    processing: "located",
    response: "identifier",
    rules:
      '<qti-lookup-outcome-value identifier="completionStatus"><qti-base-value base-type="integer">1</qti-base-value></qti-lookup-outcome-value>',
  },
  {
    breaks: ["Variable kind"],
    mapped: false,
    name: "a response set as an outcome",
    processing: "located",
    response: "identifier",
    rules:
      '<qti-set-outcome-value identifier="RESPONSE"><qti-base-value base-type="identifier">A</qti-base-value></qti-set-outcome-value>',
  },
  {
    breaks: ["Condition type"],
    mapped: false,
    name: "a float that is a whole condition",
    processing: "located",
    response: "identifier",
    rules: scoredIf('<qti-variable identifier="SCORE"/>'),
  },
  {
    breaks: [],
    mapped: false,
    name: "a float response compared with a half",
    processing: "located",
    response: "float",
    rules: scoredIf(overHalf),
  },
  {
    breaks: ["Operand fit"],
    mapped: false,
    name: "an identifier response compared with a half",
    processing: "located",
    response: "identifier",
    rules: scoredIf(overHalf),
  },
  {
    breaks: [],
    mapped: false,
    name: "a rule of the item's own",
    processing: "inline",
    response: "identifier",
    rules: undeclaredRules,
  },
  {
    breaks: [],
    mapped: false,
    name: "a published template",
    processing: "published",
    response: "identifier",
    rules: undeclaredRules,
  },
  {
    breaks: [],
    mapped: false,
    name: "no location",
    processing: "unlocated",
    response: "identifier",
    rules: undeclaredRules,
  },
];

/**
 * The item's response processing as a case writes it.
 *
 * @param processing - How it is written.
 * @returns Its element.
 */
const processingOf = (processing: Processing): string => {
  switch (processing) {
    case "located": {
      return '<qti-response-processing template-location="rptemplates/custom.xml"/>';
    }

    case "published": {
      return '<qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct" template-location="rptemplates/custom.xml"/>';
    }

    case "inline": {
      return `<qti-response-processing template-location="rptemplates/custom.xml">${declaredRules}</qti-response-processing>`;
    }

    case "unlocated": {
      return "<qti-response-processing/>";
    }

    default: {
      return processing satisfies never;
    }
  }
};

/**
 * Write a case's package: the item, at its package's root, and the template under `rptemplates/`,
 * each a resource of its own.
 *
 * @param input - The case.
 * @returns Its entries.
 */
const packageOf = (input: TemplateCase): PackageEntries => {
  const mapping = input.mapped
    ? '<qti-mapping default-value="0"><qti-map-entry map-key="A" mapped-value="1"/></qti-mapping>'
    : "";
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="I" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/><dependency identifierref="T"/></resource><resource identifier="T" type="imsqti_rptemplate_xmlv3p0" href="rptemplates/custom.xml"><file href="rptemplates/custom.xml"/></resource></resources></manifest>`;
  const item = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="i" title="I" adaptive="false" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="${input.response}"><qti-correct-response><qti-value>${responseWritings[input.response].correct}</qti-value></qti-correct-response>${mapping}</qti-response-declaration><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-item-body>${responseWritings[input.response].interaction}</qti-item-body>${processingOf(input.processing)}</qti-assessment-item>`;
  const template = `<?xml version="1.0" encoding="UTF-8"?>
<qti-response-processing xmlns="${asi}">${input.rules}</qti-response-processing>`;
  const text = new TextEncoder();

  return new Map([
    ["imsmanifest.xml", text.encode(manifest)],
    ["item.xml", text.encode(item)],
    ["rptemplates/custom.xml", text.encode(template)],
  ]);
};

/**
 * A situation the box must reach.
 */
type Situation = "admitted" | "ignored" | "refused";

/**
 * The situation a case reaches: its template runs nowhere, or runs and is admitted or refused.
 *
 * @param input - The case.
 * @returns Its situation.
 */
const situationOf = (input: TemplateCase): Situation => {
  if (input.processing !== "located") {
    return "ignored";
  }

  return input.breaks.length > 0 ? "refused" : "admitted";
};

describe("the schema's statements over a located template", () => {
  it("judge its references and expressions in its item's own placement under the laws reading 117 holds a fragment's to", () => {
    // Oracle: the agreed design (LocatedTemplate, IMPL-GRADABLE; per-placement typing, spec
    // reading 117), reading 117's placed laws, each stated once over the placed views.
    // Bound: every statement of `Qti`.
    const placed: ReadonlySet<unknown> = new Set([
      Qti.relations.PlacedExpressionNode,
      Qti.relations.PlacedVariableRefNode,
    ]);
    const checked: ReadonlySet<string> = new Set(
      Qti.statements.flatMap((statement) =>
        statement.kind === "check" && placed.has(statement.relation) ? [statement.name] : [],
      ),
    );

    for (const law of [
      "Condition_type",
      "Lookup_type",
      "Mapped_response",
      "Variable_declared",
      "Variable_kind",
    ]) {
      assert.isTrue(checked.has(law), law);
    }
    assert.isTrue("LocatedTemplate" in Qti.relations);
    assert.strictEqual(LocatedTemplate.name, "LocatedTemplate");
  });
});

layer(NodeServices.layer, { excludeTestServices: true })("a located template", (scoped) => {
  scoped.effect(
    "has its rules judged as the item's own, on the law oracle, the import's rows built alike",
    (ctx) =>
      searched(
        ctx,
        Effect.gen(function* locatedTemplateRuns() {
          const directory = yield* scratchDirectory("located-template-");
          const bench = { directory, grammar, laws };

          return yield* exhaust(
            {
              box: "a located template's rules, read against the item that locates it, and the same rules under an item that runs no located template",
              caseHang: Duration.minutes(5),
              concurrency: 1,
              coverage: requiredInSpace<Situation>(["admitted", "refused", "ignored"]),
              generator: int(0, cases.length - 1),
              literal: (at) =>
                Option.match(Option.fromUndefinedOr(cases[at]), {
                  onNone: () => String(at),
                  onSome: ({ name }) => name,
                }),
              oracle: {
                kind: "specification",
                name: "QTI 3.0 information model §4.6.1, §4.6.2, §6.9.40 and §6.9.47",
              },
              suite: "pantry/located-template",
            },
            (at, c) =>
              Effect.gen(function* locatedTemplateCase() {
                const input = cases[at];
                assert.isDefined(input, `no case ${String(at)}`);
                if (input === undefined) {
                  return;
                }

                c.note(situationOf(input));

                const judged = yield* judgeOne(yield* genomeOf(packageOf(input)), bench, at);

                assert.deepStrictEqual(judged.disagreements.map(shownDisagreement), [], input.name);
                assert.deepStrictEqual(
                  judged.summary,
                  {
                    import: "built ",
                    oracle: `laws ${[...input.breaks].toSorted().join(", ")}`,
                  },
                  input.name,
                );
              }),
          );
        }).pipe(Effect.scoped),
      ),
    searchTimeout,
  );
});
