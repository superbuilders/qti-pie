/**
 * Every `ValueDomain`'s pattern against the XSD's own validator, on the raw lexical forms the
 * attribute CHECK reads (slice A2, the lexical half): the small box, every group probed with every
 * named variant. `genetic-lexical.oracle.test.ts` searches beyond it, on the same harness.
 *
 * Oracle: a second implementation. libxml2's XML Schema validator (`xmllintValidate`) judges each
 * probe value as the value of an attribute, or the text of a simple-content element, of a kind the
 * pinned XSDs declare, against the type the XSD gives it; the grammar judges the same value by its
 * domain's regex, `lexical ~ pattern`, with no whitespace step before it: Bjorn's ruling of
 * 2026-11-05 makes the one attribute CHECK `lexical ~ ValuePattern.at(AttributeGrammar.at(...))` on
 * the stored form, so a domain whose XSD type collapses or replaces whitespace must accept the
 * forms XML Schema normalizes (spec-alignment §9.6). The harness,
 * `#pantry/test/lexical-harness.ts`, writes, batches and reads every probe.
 *
 * The probes (named variants, doctrine rule 6), per (domain, XSD type) group, on one
 * representative (kind, attribute) of the group: each value of the domain's enumeration and of the
 * XSD type's (from the XSD inventory); samples of the domain's regex, drawn from a seeded stream;
 * boundary forms of the type's datatype family; and of the first valid values, outer spaces, a
 * leading tab, a trailing line feed, a flipped case and a repeat; an empty value; an over-long
 * value. A group is a (domain, XSD type) because a domain shared by attributes of two XSD
 * types must match both. Every disagreement is recorded (the harness's `recorded`), each keyed to
 * a live reading or to a proven libxml2 departure, or the test fails; a record no disagreement
 * matches fails too, and so does a record whose reading no longer says what it cites.
 *
 * Gated on the XSD cache. Each run writes a folder of its own, `work/xsd-lexical-*`
 * (`#pantry/test/scratch.ts`), removed when the run ends: the batches, `probes.tsv`
 * (every probe) and `differences.tsv` (every disagreement, with the record that classifies it). A
 * fixed folder let two runs at once remove each other's batches under xmllint.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, beforeAll, describe, it as unit, layer } from "@effect/vitest";
import { Console, Effect, FileSystem, Option } from "effect";
import type { ValueDomain } from "#pantry/grammar/attributes.ts";
import { composed } from "#pantry/grammar/compose.ts";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import {
  accepts,
  differenceLine,
  disagreementOf,
  drawnOf,
  enumerationsOf,
  familiesOf,
  familyTable,
  flipped,
  judgeProbes,
  proofs,
  recorded,
  recordOf,
  reasonText,
  sitesOf,
  subjectName,
  tsv,
  whiteSpaceOf,
} from "#pantry/test/lexical-harness.ts";
import type { Probe } from "#pantry/test/lexical-harness.ts";
import { liveReadings, stillSays } from "#pantry/test/live-readings.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";
import { XsdOracleLayer } from "#pantry/test/gen/grammar.ts";
import { writeXsdOracle, xsdCachePresent } from "#pantry/test/xsd-catalog.ts";
import type { Domain } from "#pantry/vocab/inventory/types.ts";
import { requireRecordsLibxml2 } from "#pantry/xml/oracle.ts";

/**
 * Draw the values a group is probed with, each with the variant that drew it.
 *
 * @param domain - The grammar's domain.
 * @param xsd - The XSD type's resolved domain, when the inventory holds it.
 * @returns The values, each once, first variant kept.
 */
const valuesOf = (
  domain: ValueDomain,
  xsd: Option.Option<Domain>,
): readonly (readonly [variant: string, value: string])[] => {
  const theirs = Option.match(xsd, { onNone: () => [], onSome: enumerationsOf }).map(
    (value) => ["xsd-enumeration", value] as const,
  );
  const drawn = drawnOf(domain).map((value) => ["pattern-sample", value] as const);
  const family = familiesOf(domain, xsd).flatMap((name) =>
    (familyTable.get(name) ?? []).map((value) => [`family-${name}`, value] as const),
  );
  const bases = [...theirs, ...drawn, ...family]
    .values()
    .map(([, value]) => value)
    .filter((value) => value !== "" && accepts(domain, value))
    .toArray()
    .slice(0, 3);
  const varied = bases.flatMap((value) => [
    ["outer-spaces", ` ${value} `] as const,
    ["leading-tab", `\t${value}`] as const,
    ["trailing-line-feed", `${value}\n`] as const,
    ["trailing-carriage-return", `${value}\r`] as const,
    ["case-flipped", flipped(value)] as const,
    ["repeated", `${value} ${value}`] as const,
    ["inner-tab", `${value}\t${value}`] as const,
  ]);
  const seen = new Set<string>();

  return [
    ...theirs,
    ...drawn,
    ...family,
    ...varied,
    ["empty", ""] as const,
    ["over-long", "a".repeat(1100)] as const,
    ["over-long-digits", "9".repeat(400)] as const,
  ].filter(([, value]) => {
    const fresh = !seen.has(value);
    seen.add(value);

    return fresh;
  });
};

/**
 * Draw every probe: one representative per (domain, XSD type) group, each value of
 * {@link valuesOf} on each of its kind's targets.
 *
 * @param grammar - The composed grammar.
 * @returns The probes, the rows no probe could stand for, and the probe elements.
 */
const probesOf = Effect.fn("lexical.probesOf")(function* probesOf(grammar: ComposedGrammar) {
  const { declarations, groups, rows, unprobed } = yield* sitesOf(grammar);
  const probes: Probe[] = [];

  for (const [group, { domain, kind, subject, xsd }] of groups) {
    for (const target of rows.get(`${kind} ${subjectName(subject)}`)?.targets ?? []) {
      for (const [variant, value] of valuesOf(domain, xsd)) {
        probes.push({
          domain,
          group,
          kind,
          subject,
          target,
          value,
          variant,
          whiteSpace: whiteSpaceOf(xsd),
          xsd,
        });
      }
    }
  }

  return { declarations, probes, unprobed };
});

describe("lexical.oracle.test.ts, the records' readings", () => {
  layer(NodeServices.layer)("docs/spec-readings.md", (it) => {
    it.effect("still says, in every reading a record cites, the sentence the record quotes", () =>
      Effect.gen(function* checkReadings() {
        const readings = yield* liveReadings();
        const dead = recorded.flatMap(({ reason }) =>
          reason._tag === "reading" && !stillSays(readings, reason.reading, reason.says)
            ? [`reading ${String(reason.reading)} no longer says: ${reason.says}`]
            : [],
        );

        assert.deepStrictEqual(dead, [], "every record's reading is live and says what it cites");
      }),
    );
  });

  unit("a record's libxml2 departure names one of the proofs", () => {
    assert.deepStrictEqual(
      recorded.flatMap(({ reason }) =>
        reason._tag === "libxml2" && !(reason.proof in proofs) ? [reason.proof] : [],
      ),
      [],
    );
  });
});

describe("lexical.oracle.test.ts, the domains against xmllint", () => {
  beforeAll(xsdCachePresent);

  layer(XsdOracleLayer, { excludeTestServices: true })("raw lexical forms", (it) => {
    it.effect(
      "every domain's pattern agrees with the XSD's validator on every probe, but as recorded",
      () =>
        Effect.gen(function* compareDomains() {
          yield* requireRecordsLibxml2();

          const fs = yield* FileSystem.FileSystem;
          const grammar = yield* Effect.fromResult(composed()).pipe(Effect.orDie);
          const outputRoot = yield* scratchDirectory("xsd-lexical-");

          const { declarations, probes, unprobed } = yield* probesOf(grammar);
          const oracle = yield* writeXsdOracle(`${outputRoot}/oracle`, declarations);
          const judged = yield* judgeProbes({
            directory: outputRoot,
            name: "batch",
            oracle,
            probes,
          });
          const disagreements = judged.flatMap((held) => Option.toArray(disagreementOf(held)));
          const matches = disagreements.map(recordOf);
          const used = new Set(matches);
          const stale = recorded.filter((record) => !used.has(record));
          const unrecorded = disagreements.filter((_, at) => matches[at] === undefined);

          yield* fs.writeFileString(
            `${outputRoot}/probes.tsv`,
            tsv(
              ["kind", "subject", "domain", "variant", "value", "xmllint", "grammar"],
              judged.map(({ grammar: grammarAccepts, outcome, probe }) => [
                probe.kind,
                subjectName(probe.subject),
                probe.domain.handle,
                probe.variant,
                probe.value,
                outcome,
                grammarAccepts ? "accepts" : "refuses",
              ]),
            ),
          );
          yield* fs.writeFileString(
            `${outputRoot}/differences.tsv`,
            tsv(
              [
                "kind",
                "subject",
                "domain",
                "primitive",
                "whiteSpace",
                "variant",
                "value",
                "xmllint",
                "grammar",
                "folded",
                "record",
                "messages",
              ],
              disagreements.map((disagreement, at) => differenceLine(disagreement, matches[at])),
            ),
          );
          yield* fs.writeFileString(`${outputRoot}/unprobed.txt`, `${unprobed.join("\n")}\n`);
          yield* Console.log(
            [
              `lexical: ${String(probes.length)} probes over ${String(new Set(probes.map(({ group }) => group)).size)} (domain, XSD type) groups, ${String(new Set(probes.map(({ domain }) => domain.handle)).size)} domains; ${String(unprobed.length)} rows unprobed`,
              `  unjudged (a framed element not expected in its frame) ${String(judged.filter(({ outcome }) => outcome === "unjudged").length)}`,
              `  disagreements ${String(disagreements.length)}, unrecorded ${String(unrecorded.length)}, stale records ${String(stale.length)}`,
              ...stale.map(({ reason }) => `  stale: ${reasonText(reason)}`),
            ].join("\n"),
          );

          assert.deepStrictEqual(
            unrecorded
              .map(
                ({ probe, xsd, grammar: grammarAccepts }) =>
                  `${probe.kind}@${subjectName(probe.subject)} ${probe.domain.handle} ${probe.variant} ${JSON.stringify(probe.value.slice(0, 40))}: xmllint ${xsd}, grammar ${grammarAccepts ? "accepts" : "refuses"}`,
              )
              .slice(0, 200),
            [],
            "every disagreement is recorded",
          );
          assert.deepStrictEqual(
            stale.map(({ reason, xsd }) => `${xsd}: ${reasonText(reason)}`),
            [],
            "every record still matches a disagreement",
          );
        }).pipe(Effect.scoped),
    );
  });
});
