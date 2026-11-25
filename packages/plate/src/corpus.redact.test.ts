import { regex } from "arkregex";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Exit, Option, Predicate, Result } from "effect";
import { bodyModuleFor } from "#plate/content/modules.ts";
import { readSource } from "#plate/document/read.ts";
import { walk as walkSource } from "#plate/document/source.ts";
import type { SourceElement } from "#plate/document/source.ts";
import type {
  Item,
  ResponseDeclaration,
  SimpleChoice,
  TemplateVisibility,
} from "#plate/model/item.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { format, isModelled, parseLexical } from "#plate/model/values.ts";
import { redact } from "#plate/redact.ts";
import type { RedactedFields } from "#plate/redact/walk.ts";
import { showingOf, shownToCandidate } from "#plate/test/page.ts";
import { recordOf } from "#plate/test/records.ts";
import { acceptedOf, noRecord } from "#plate/test/sweep.ts";
import type { Member, RecordState } from "#plate/test/sweep.ts";
import { admitted } from "#plate/test/admitted.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The fields of a response declaration that hold what the page must not know: its correct
 * response, its mapping, its area mapping and its default value.
 */
const hiddenResponseFields = [
  "areaMapping",
  "correct",
  "defaultValue",
  "mapping",
] as const satisfies readonly (keyof ResponseDeclaration)[];

/**
 * The fields of an item that hold what the page must not know: its outcome declarations and its
 * template declarations.
 */
const hiddenItemFields = ["outcomes", "templates"] as const satisfies readonly (keyof Item)[];

/**
 * The fields of a record that hold what the page must not know: the template values, the
 * correct responses and defaults template processing set, and the outcome values.
 */
const hiddenRecordFields = [
  "correct",
  "defaults",
  "outcomes",
  "templates",
] as const satisfies readonly (keyof ItemRecord)[];

/**
 * The fields that give a template block, a template inline or a choice its template visibility.
 */
const hiddenVisibilityFields = [
  "showHide",
  "templateIdentifier",
  "templateVisibility",
] as const satisfies readonly (keyof SimpleChoice | keyof TemplateVisibility)[];

/**
 * The keys no redacted item holds a value under at any depth, whatever the field sits under. A
 * body node's `path` is not among them: the redacted item stays in the server, and the shell writes
 * no node's path into the page.
 */
const hiddenKeys: ReadonlySet<string> = new Set([
  ...hiddenItemFields,
  ...hiddenRecordFields,
  ...hiddenResponseFields,
  ...hiddenVisibilityFields,
]);

/**
 * Matches a text of three characters (code points) or more, the shortest secret the sweep looks
 * for: a shorter value occurs in unrelated text by chance too often to say anything.
 */
const longEnough = regex(".{3}", "su");

/**
 * Where an item holds a secret.
 */
type SecretOrigin =
  | "area-map entry"
  | "correct response"
  | "mapping key"
  | "processing base value"
  | "processing inside coords"
  | "processing pattern";

/**
 * A value the item holds and its page must not see, with where the item holds it.
 */
interface Secret {
  readonly origin: SecretOrigin;
  readonly text: string;
}

/**
 * One accepted item as the sweep checks it: what the page receives, and what the item's source
 * shows of itself.
 */
interface Subject {
  /**
   * The item's body as its source writes it, from `qti-item-body`'s start tag to its end tag;
   * empty when the source has none.
   */
  readonly bodySource: string;
  readonly item: Item;
  /**
   * The attribute literals the item's `qti-response-processing` writes that may give the answer
   * away ({@link processingLiteralsOf}), read from its source, since plate models no processing.
   */
  readonly processing: readonly Secret[];
  /**
   * The texts plate's own normalisation writes into the body before the walk reads it
   * ({@link normalisedTexts}), which no secret of the item can be.
   */
  readonly normalised: readonly string[];
  /**
   * The member's corpus-relative path, with the record state in parentheses when the sweep passed
   * one, as every problem names the subject.
   */
  readonly location: string;
  /**
   * The record `redact` showed the item by, none when it passed none.
   */
  readonly record: Option.Option<ItemRecord>;
  /**
   * What `redact(…)` gave for the item.
   */
  readonly redacted: RedactedFields;
  /**
   * The name of the record state, `no record` when the sweep passed none.
   */
  readonly state: string;
}

/**
 * The start of `qti-item-body`'s start tag, with or without a namespace prefix.
 */
const bodyStart = regex("<(?:[^\\s/<>:]+:)?qti-item-body[\\s/>]", "u");

/**
 * Give the part of a document's source that writes its item body: from the first `qti-item-body`
 * start tag to the end of the last tag that names `qti-item-body`, its end tag, or the start tag
 * itself when it closes itself.
 *
 * @param bytes The document's bytes.
 * @returns The body's source text, or the empty string when the source holds no body.
 */
const bodySourceOf = (bytes: Uint8Array): string => {
  const text = new TextDecoder().decode(bytes);
  const start = text.search(bodyStart);
  if (start === -1) {
    return "";
  }

  const last = text.lastIndexOf("qti-item-body");

  return text.slice(start, text.indexOf(">", last) + 1);
};

/**
 * Collect every attribute value and every run of text an element holds, at any depth.
 *
 * @param element The element.
 * @returns Its texts, in document order.
 */
const textsOf = (element: SourceElement): readonly string[] => [
  ...element.attributes.map((attribute) => attribute.value),
  ...element.children.flatMap((child) => {
    if (child.kind === "text") {
      return [child.text];
    }

    return child.kind === "element" ? textsOf(child) : [];
  }),
];

/**
 * Give the texts the content modules' own normalisation writes into a member's body before the
 * walk reads it: for each element a body-placed module reads, every attribute value and text of
 * what its `normalise` gives, at any depth (an element read as written gives its own, which the
 * body's source holds already). What plate itself writes gives nothing
 * of the author's away, so the secrets exclude these beside the body's source: MathML's `mfenced`
 * expansion writes `fence="true"` and `separator="true"` (MathML 3 section 3.3.8) into a body
 * whose source spells neither, and an item that scores by a base value `true` would otherwise
 * count it as a leak.
 *
 * @param member The opened member.
 * @returns The texts, in document order; none when the member's source does not read.
 */
const normalisedTexts = (member: Member): readonly string[] =>
  Exit.match(Effect.runSyncExit(readSource(member.location, member.bytes)), {
    onFailure: () => [],
    onSuccess: (source) =>
      [...walkSource(source)].flatMap(({ element }) =>
        Option.match(bodyModuleFor(element), {
          onNone: () => [],
          onSome: (module) => textsOf(module.normalise(element)),
        }),
      ),
  });

/**
 * Give the spellings a text may take in markup: as it reads, and escaped as a serialiser writes
 * it in text or in an attribute value of either quote.
 *
 * @param text The text as it reads.
 * @returns Its distinct spellings.
 */
const spellingsOf = (text: string): readonly string[] => {
  const inText = text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  return [
    ...new Set([
      text,
      inText,
      inText.replaceAll('"', "&quot;"),
      inText.replaceAll("'", "&apos;"),
      inText.replaceAll('"', "&quot;").replaceAll("'", "&apos;"),
    ]),
  ];
};

/**
 * Report whether some spelling of a text occurs in markup.
 *
 * @param markup The markup, source XML or a string the redacted item holds.
 * @param text The text as it reads.
 * @returns Whether the markup holds it, as it reads or escaped.
 */
const occursIn = (markup: string, text: string): boolean =>
  spellingsOf(text).some((spelling) => markup.includes(spelling));

/**
 * Give the attribute literals one element of response processing writes itself that may give the
 * answer away: a `qti-base-value`'s value, in the lexical form plate writes it, a `qti-inside`'s
 * `coords`, joined as an area-map entry's are, and a `qti-pattern-match`'s literal `pattern` (one
 * written `{name}` names a variable and gives nothing away itself).
 *
 * @param element The element.
 * @returns The literals as candidates, in written order; none for any other element.
 */
const ownLiteralsOf = (element: SourceElement): readonly Secret[] => {
  const attribute = (name: string) =>
    Option.fromUndefinedOr(element.attributes.find((written) => written.local === name)?.value);
  if (element.local === "qti-base-value") {
    const text = element.children.flatMap((child) => (child.kind === "text" ? [child.text] : []));
    const written = text.join("").trim();

    return Option.match(attribute("base-type"), {
      onNone: () => [],
      onSome: (baseType) =>
        isModelled(baseType)
          ? Result.match(parseLexical(baseType, written), {
              onFailure: () => [],
              onSuccess: (single) => [{ origin: "processing base value", text: format(single) }],
            })
          : [],
    });
  }

  if (element.local === "qti-inside") {
    return Option.match(attribute("coords"), {
      onNone: () => [],
      onSome: (coords) => [
        {
          origin: "processing inside coords",
          text: coords
            .split(",")
            .map((coordinate) => String(Number(coordinate.trim())))
            .join(","),
        },
      ],
    });
  }

  return element.local === "qti-pattern-match"
    ? Option.match(attribute("pattern"), {
        onNone: () => [],
        onSome: (pattern) =>
          regex("^\\{.*\\}$", "su").test(pattern)
            ? []
            : [{ origin: "processing pattern", text: pattern }],
      })
    : [];
};

/**
 * Collect every attribute literal a member's `qti-response-processing` writes that may give the
 * answer away ({@link ownLiteralsOf}), at any depth, from its source: plate models no processing,
 * and the database grades from the stored document.
 *
 * @param member The member.
 * @returns The literals as candidates, in document order; none when its source does not read.
 */
const processingLiteralsOf = (member: Member): readonly Secret[] =>
  Exit.match(Effect.runSyncExit(readSource(member.location, member.bytes)), {
    onFailure: () => [],
    onSuccess: (source) =>
      [...walkSource(source)]
        .filter(({ path }) =>
          path.split("/").some((step) => step.startsWith("qti-response-processing")),
        )
        .flatMap(({ element }) => ownLiteralsOf(element)),
  });

/**
 * List the values an item holds that its page must not see, before any is judged a secret: the
 * lexical form of each correct response value, mapping key and processing base value, each
 * area-map entry's and processing `qti-inside`'s `coords`, and each processing
 * `qti-pattern-match`'s literal `pattern`.
 *
 * @param subject The item, with its processing's literals.
 * @returns Each candidate, with where the item holds it.
 */
const candidatesOf = ({
  item,
  processing,
}: Pick<Subject, "item" | "processing">): readonly Secret[] => [
  ...[...item.responses.values()].flatMap((declaration): readonly Secret[] => [
    ...Option.match(declaration.correct, {
      onNone: () => [],
      onSome: (value) =>
        value.values.map((single) => ({
          origin: "correct response" as const,
          text: format(single),
        })),
    }),
    ...Option.match(declaration.mapping, {
      onNone: () => [],
      onSome: (mapping) =>
        mapping.entries.map((entry) => ({
          origin: "mapping key" as const,
          text: format(entry.key),
        })),
    }),
    ...Option.match(declaration.areaMapping, {
      onNone: () => [],
      onSome: (areaMapping) =>
        areaMapping.entries.map((entry) => ({
          origin: "area-map entry" as const,
          text: entry.coords.join(","),
        })),
    }),
  ]),
  ...processing,
];

/**
 * Give the pair values among an item's correct responses and mapping keys whose two identifiers
 * its body source gives a choice: none is a secret, since the page names both choices and may
 * write any pair of them, as a Match's matrix writes every pair of its two sets, so the pair's text
 * alone gives nothing away.
 *
 * @param subject The item, with its body source.
 * @returns The pairs' texts, as {@link candidatesOf} writes them.
 */
const publicPairsOf = (subject: Subject): ReadonlySet<string> =>
  new Set(
    [...subject.item.responses.values()]
      .flatMap((declaration) => [
        ...Option.match(declaration.correct, { onNone: () => [], onSome: (value) => value.values }),
        ...Option.match(declaration.mapping, {
          onNone: () => [],
          onSome: (mapping) => mapping.entries.map((entry) => entry.key),
        }),
      ])
      .flatMap((single) =>
        (single.baseType === "pair" || single.baseType === "directedPair") &&
        single.value.every((identifier) =>
          occursIn(subject.bodySource, `identifier="${identifier}"`),
        )
          ? [format(single)]
          : [],
      ),
  );

/**
 * Give an item's secrets: each candidate three characters or longer that occurs nowhere in
 * its body source, in what plate's own normalisation writes into the body, or its title, once per
 * text, but a pair of two choices the body names ({@link publicPairsOf}).
 *
 * @param subject The item, with its body source and the normalisation's texts.
 * @returns The secrets, each with the first place the item holds it.
 */
const secretsOf = (subject: Subject): readonly Secret[] => {
  const seen = new Set<string>();
  const publicPairs = publicPairsOf(subject);

  return candidatesOf(subject).filter((candidate) => {
    const secret =
      longEnough.test(candidate.text) &&
      !seen.has(candidate.text) &&
      !publicPairs.has(candidate.text) &&
      !occursIn(subject.bodySource, candidate.text) &&
      !subject.normalised.some((written) => written.includes(candidate.text)) &&
      !subject.item.title.includes(candidate.text);
    seen.add(candidate.text);

    return secret;
  });
};

/**
 * The keys and the strings a redacted item holds, at any depth.
 */
interface HeldText {
  readonly keys: readonly string[];
  readonly strings: readonly string[];
}

/**
 * Collect every key that holds something and every string of a redacted item, at any depth: an
 * `Option` holds its value when it is some and nothing when it is none, so a key whose value is
 * none holds nothing, and a number, a bigint or a boolean holds no text.
 *
 * @param redacted The redacted item, or a forged one.
 * @returns Its keys and its strings, in no particular order.
 */
const heldTextOf = (redacted: RedactedFields): HeldText => {
  const keys: string[] = [];
  const strings: string[] = [];
  const pending: unknown[] = [redacted];

  while (pending.length > 0) {
    const next = pending.pop();

    if (Predicate.isString(next)) {
      strings.push(next);
    } else if (Array.isArray(next)) {
      for (const element of next) {
        pending.push(element);
      }
    } else if (Option.isOption(next)) {
      if (Option.isSome(next)) {
        pending.push(next.value);
      }
    } else if (Predicate.isObject(next)) {
      for (const [key, held] of Object.entries(next)) {
        if (!(Option.isOption(held) && Option.isNone(held)) && held !== undefined) {
          keys.push(key);
        }

        pending.push(held);
      }
    }
  }

  return { keys, strings };
};

/**
 * List the keys of a redacted item, at any depth, that hold a hidden field.
 *
 * @param redacted The redacted item, or a forged one.
 * @returns Each such key, once per occurrence.
 */
const hiddenKeysOf = (redacted: RedactedFields): readonly string[] =>
  heldTextOf(redacted).keys.filter((key) => hiddenKeys.has(key));

/**
 * Check a redacted item against the allowlist: no key at any depth holds a hidden field.
 *
 * @param subject The item and its redaction.
 * @returns Each problem, naming the item; empty when the redaction holds.
 */
const keyProblems = (subject: Subject): readonly string[] =>
  hiddenKeysOf(subject.redacted).map(
    (key) => `${subject.location}: the redacted item holds the hidden key ${JSON.stringify(key)}`,
  );

/**
 * Check that none of an item's secrets reaches its page: no string of its redacted item holds one.
 *
 * @param subject The item's location and its redaction, or a forged one.
 * @param secrets The item's secrets.
 * @returns Each leak, naming the item, the secret and where it showed; empty when none leaks.
 */
const leakProblems = (
  subject: { readonly location: string; readonly redacted: RedactedFields },
  secrets: readonly Secret[],
): readonly string[] => {
  const { strings } = heldTextOf(subject.redacted);

  return secrets.flatMap((secret) => {
    const named = `${subject.location}: the ${secret.origin} ${JSON.stringify(secret.text)}`;

    return strings.some((text) => text.includes(secret.text))
      ? [`${named} is in the redacted item`]
      : [];
  });
};

/**
 * Make the subject the sweep checks of one member: its accepted item, redacted by a record or by
 * none.
 *
 * @param member The opened member.
 * @param state The record `redact` shows the item by, and the state's name; with none, the item is
 *   redacted with no record and its location named alone.
 * @returns None when the member is not an accepted item; otherwise the subject.
 */
const subjectOf = (member: Member, state: Option.Option<RecordState>): Option.Option<Subject> => {
  const { name, record } = Option.getOrElse(state, () => noRecord);
  const location = Option.isNone(state) ? member.location : `${member.location} (${name})`;

  return Option.map(acceptedOf(member), (accepted: Accepted) => ({
    bodySource: bodySourceOf(member.bytes),
    item: accepted.item,
    location,
    normalised: normalisedTexts(member),
    processing: processingLiteralsOf(member),
    record,
    redacted: redact(accepted, shownToCandidate, showingOf(record)),
    state: name,
  }));
};

/**
 * The template control's location.
 */
const templateControlLocation = "template-control.xml";

/**
 * The template control, built by hand: template processing sets `SHOWN` to `A` and `NUMBER` to 123,
 * the record the database's take gives it (`taken` below); the body prints `NUMBER`, holds a
 * template inline `SHOWN` shows (`A`) and one it hides (`B`), and a Choice whose choices `A` and
 * `B` the same variable shows and hides.
 */
const templateControlBytes = new TextEncoder().encode(
  '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="template-control" title="Pick the shown one" adaptive="false" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/><qti-template-declaration identifier="SHOWN" cardinality="single" base-type="identifier"/><qti-template-declaration identifier="NUMBER" cardinality="single" base-type="integer"/><qti-template-processing><qti-set-template-value identifier="SHOWN"><qti-base-value base-type="identifier">A</qti-base-value></qti-set-template-value><qti-set-template-value identifier="NUMBER"><qti-base-value base-type="integer">123</qti-base-value></qti-set-template-value></qti-template-processing><qti-item-body><p>Number <qti-printed-variable identifier="NUMBER"/>: <qti-template-inline template-identifier="SHOWN" show-hide="show" identifier="A">shown words</qti-template-inline><qti-template-inline template-identifier="SHOWN" show-hide="show" identifier="B">hidden words</qti-template-inline></p><qti-choice-interaction response-identifier="RESPONSE" max-choices="1"><qti-simple-choice identifier="A" template-identifier="SHOWN" show-hide="show">Alpha</qti-simple-choice><qti-simple-choice identifier="B" template-identifier="SHOWN" show-hide="show">Beta</qti-simple-choice></qti-choice-interaction></qti-item-body></qti-assessment-item>',
);

describe("the template sweep over the corpus", () => {
  it.effect(
    "a forged redaction of a hand-built templated item that shows a template visibility is caught, and the honest redactions are not",
    () =>
      Effect.gen(function* templateControl() {
        const verdict = yield* admitted(templateControlLocation, templateControlBytes);
        const member: Member = {
          bytes: templateControlBytes,
          location: templateControlLocation,
          verdict: Exit.succeed(verdict),
        };
        assert.isTrue(
          Option.isSome(acceptedOf(member)),
          `the template control is ${verdict.verdict}`,
        );

        const taken: RecordState = {
          name: "taken",
          record: Option.some(
            recordOf({
              templates: {
                NUMBER: {
                  baseType: "integer",
                  cardinality: "single",
                  values: [{ baseType: "integer", value: 123n }],
                },
                SHOWN: {
                  baseType: "identifier",
                  cardinality: "single",
                  values: [{ baseType: "identifier", value: "A" }],
                },
              },
            }),
          ),
        };
        const subjects = [taken, noRecord].map((state) =>
          Option.getOrElse(subjectOf(member, Option.some(state)), () =>
            assert.fail(`the template control is not accepted under ${state.name}`),
          ),
        );
        const [honest] = subjects;
        if (honest === undefined) {
          assert.fail("the template control lacks a record state");
        }

        const forgedBody = honest.redacted.body.map((node) =>
          node.kind === "choice"
            ? {
                ...node,
                choices: node.choices.map((choice) => ({
                  ...choice,
                  templateVisibility: Option.some<TemplateVisibility>({
                    showHide: "show",
                    templateIdentifier: "SHOWN",
                  }),
                })),
              }
            : node,
        );
        const forged = { ...honest.redacted, body: forgedBody };

        assert.deepStrictEqual(
          subjects.map((subject) => subject.state),
          ["taken", "no record"],
        );
        assert.deepStrictEqual(
          subjects.flatMap((subject) => [
            ...keyProblems(subject),
            ...leakProblems(subject, secretsOf(subject)),
          ]),
          [],
        );
        assert.deepStrictEqual(hiddenKeysOf(forged), [
          "templateVisibility",
          "showHide",
          "templateIdentifier",
        ]);
      }),
  );
});
