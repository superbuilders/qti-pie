/**
 * Typed numerals, as the QTI database scores them: sixteen synthetic items in the K–2 forms'
 * typed-number form, across Kindergarten, Grade 1 and Grade 2: a single `integer` response, its key
 * scored by `match_correct.xml`, or a set or interval of accepted answers a `qti-mapping` scores by
 * `map_response.xml` (QTI 3.0.1 §8.17 gives a single response one correct value), SCORE's normal
 * maximum 1 and a MAXSCORE of 1, and the box's `pattern-mask`, the entry rule's cap, with an
 * `expected-length` as wide as the widest number it admits: 0 to 20 in Kindergarten, up to three
 * digits in Grade 1 and four in Grade 2, each raised to the longest wrong answer the item lists as
 * one a form would expect, so every one can be typed. The items, their numbers and their wording
 * are written here, none of them a form's, since this repository is public
 * (`fixtures/typed-numerals/`).
 *
 * Each item stands in a test of its own as the forms deliver it, one linear, individual part
 * ("Forward only"). A case is a text a child types into the box, key by key, by the keypad or the
 * keyboard, on a fresh child's sitting: the take, the entry at the item, a save of the response the
 * box posts and its read-back, the answer through the test runtime's own programs, and the end with
 * its finish; then the SCORE the database holds for the item. The cases of each item:
 *
 * - Every accepted answer, every wrong answer the item lists as one a form would expect, some of them
 *   longer than the grade's cap, which raises it, and the numbers either side of the accepted
 *   answers;
 * - An empty box, and the texts the entry rule refuses part of: a leading zero, a space before or
 *   after, a decimal point, a decimal, a plus sign, a minus sign; and a digit past the item's cap:
 *   a Kindergarten key's last digit tapped twice and 21, and in Grades 1 and 2 the key padded with
 *   9s to one digit more than the cap.
 *
 * The table is written here apart from the items' declarations: each item's accepted answers and
 * listed wrong answers, and the forms' entry rule (typed numerals from a keypad of 0 to 9 and
 * backspace, "leading zeros rejected", Kindergarten entries 0 to 20, Grades 1
 * and 2 up to three and four digits; so digits only, a digit that would make a leading zero or pass
 * the cap refused, a lone 0 valid), with each item's cap raised to its longest listed answer. A
 * keystroke stands exactly where the box's text after it begins some answer the rule allows;
 * otherwise the box keeps its text. Plate's box (`takesTyped` over the item's `typedEntry`, the
 * islands' rule, an `integer` box held to its mask) must hold what the rule leaves of the typed
 * text, key by key, and the case scores 1 exactly where that is one of the accepted answers, 0
 * everywhere else. The read-back holds the response the database stored to the one the box posted:
 * what the child submits is the number the box shows. Each fixture's box carries the mask and the
 * width the table gives its item, checked as it is published.
 *
 * It runs wherever a lane names its lease (pantry's `QTI_PIE_PG_*`), on the lease's result
 * database (`#ledger/test/result-suite.ts`), and is skipped elsewhere.
 *
 * @module
 */
import { Db } from "@bjornpagen/grizzle/runtime";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, layer } from "@effect/vitest";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import { asTyped, takesTyped, typedEntry, typedResponseOf } from "@qti-pie/plate";
import type { Responses, TypedEntry, TypedReading } from "@qti-pie/plate";
import { Array as Arr, Clock, Duration, Effect, FileSystem, Option, Ref } from "effect";
import { responseParamsOf, responsesOfRows } from "#ledger/served-values.ts";
import { BrowserReading } from "#ledger/sittings.ts";
import { templatePackage, templatePackageDirectory } from "#ledger/template-package.ts";
import { lease, SuiteLogin, suiteLayerOf } from "#ledger/test/result-suite.ts";

const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

const PACKAGE = "ledger-typed-numeral-proof";

/**
 * The seed every sitting's decision draws under, which nothing the table reads depends on.
 */
const DECISION = "6c0e2f71-93ab-4d5e-8a17-2b9f4c6d0e38";

/**
 * The items' delivery form, as the fixture keeps it: a `qti/<grade>/<id>.xml` layout.
 */
const fixture = new URL("../fixtures/typed-numerals/", import.meta.url);

/**
 * One typed item: its grade and id, its item ref (the item's own identifier, as QTI 3.0 §4.1.1
 * requires of a ref), the answers it accepts and the wrong answers it lists as ones a form would
 * expect.
 */
interface Typed {
  readonly accepted: readonly [number, ...number[]];
  readonly grade: "K" | "1" | "2";
  readonly id: string;
  readonly listed: readonly number[];
  readonly ref: string;
}

const items: readonly Typed[] = [
  {
    accepted: [9],
    grade: "K",
    id: "T01",
    listed: [],
    ref: "typed-numeral-k-t01",
  },
  {
    accepted: [4],
    grade: "K",
    id: "T02",
    listed: [],
    ref: "typed-numeral-k-t02",
  },
  {
    accepted: [14],
    grade: "K",
    id: "T03",
    listed: [],
    ref: "typed-numeral-k-t03",
  },
  {
    accepted: [20],
    grade: "K",
    id: "T04",
    listed: [],
    ref: "typed-numeral-k-t04",
  },
  {
    accepted: [0],
    grade: "K",
    id: "T05",
    listed: [],
    ref: "typed-numeral-k-t05",
  },
  {
    accepted: [63],
    grade: "1",
    id: "T06",
    listed: [36, 9, 603, 6003],
    ref: "typed-numeral-1-t06",
  },
  {
    accepted: [13],
    grade: "1",
    id: "T07",
    listed: [5, 12, 14, 94],
    ref: "typed-numeral-1-t07",
  },
  {
    accepted: [42, 43, 44, 45],
    grade: "1",
    id: "T08",
    listed: [41, 46, 40],
    ref: "typed-numeral-1-t08",
  },
  {
    accepted: [32, 34],
    grade: "1",
    id: "T09",
    listed: [31, 33, 35],
    ref: "typed-numeral-1-t09",
  },
  {
    accepted: [100],
    grade: "1",
    id: "T10",
    listed: [91, 1000, 1090],
    ref: "typed-numeral-1-t10",
  },
  {
    accepted: [408],
    grade: "2",
    id: "T11",
    listed: [48, 4008, 40_008, 480],
    ref: "typed-numeral-2-t11",
  },
  {
    accepted: [21, 23, 25],
    grade: "2",
    id: "T12",
    listed: [22, 24, 20, 26],
    ref: "typed-numeral-2-t12",
  },
  {
    accepted: [613, 614, 615, 616],
    grade: "2",
    id: "T13",
    listed: [612, 617, 6013],
    ref: "typed-numeral-2-t13",
  },
  {
    accepted: [562],
    grade: "2",
    id: "T14",
    listed: [5602, 50_062, 5062, 265],
    ref: "typed-numeral-2-t14",
  },
  {
    accepted: [800, 801, 802],
    grade: "2",
    id: "T15",
    listed: [799, 803, 8000, 80_001],
    ref: "typed-numeral-2-t15",
  },
  {
    accepted: [1000],
    grade: "2",
    id: "T16",
    listed: [100, 10_000, 10_100],
    ref: "typed-numeral-2-t16",
  },
];

/**
 * The entry rule's Grade 1 and Grade 2 caps, in digits ("up to three and four digits").
 */
const gradeDigits = { "1": 3, "2": 4 } as const;

/**
 * A Grade 1 or 2 item's cap in digits: its grade's, raised to its longest accepted or listed
 * answer, so every wrong answer a form expects can be typed.
 *
 * @param item The item, of Grade 1 or 2.
 * @param grade Its grade.
 */
const capOf = (item: Typed, grade: keyof typeof gradeDigits): number =>
  Math.max(gradeDigits[grade], ...[...item.accepted, ...item.listed].map((n) => String(n).length));

/**
 * The `pattern-mask` an item's box carries, as the table gives it: 0 to 20 in Kindergarten, and in
 * Grades 1 and 2 a whole number of up to its cap's digits, with no leading zero.
 *
 * @param item The item.
 */
const maskOf = (item: Typed): string =>
  item.grade === "K"
    ? "0|[1-9]|1[0-9]|20"
    : `0|[1-9][0-9]{0,${String(capOf(item, item.grade) - 1)}}`;

/**
 * The width of the widest number an item's mask admits, the box's `expected-length`: 2 in
 * Kindergarten (20), and the cap's digits in Grades 1 and 2.
 *
 * @param item The item.
 */
const widthOf = (item: Typed): number => (item.grade === "K" ? 2 : capOf(item, item.grade));

/**
 * An item's document in the package, in the fixture's layout.
 *
 * @param item The item.
 */
const pathOf = (item: Typed) => `qti/${item.grade}/${item.id}.xml`;

/**
 * An item's test in the package.
 *
 * @param item The item.
 */
const testOf = (item: Typed) => `test-${item.grade}-${item.id}.xml`;

/**
 * The test an item stands in: one linear, individual part holding it alone, as the forms are
 * delivered ("Forward only"; one point per item).
 *
 * @param item The item.
 */
const testXmlOf = (item: Typed) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="test-${item.grade}-${item.id}" title="${item.grade} ${item.id}"><qti-test-part identifier="part" navigation-mode="linear" submission-mode="individual"><qti-assessment-section identifier="section" title="section" visible="true"><qti-assessment-item-ref identifier="${item.ref}" href="${pathOf(item)}"/></qti-assessment-section></qti-test-part>
</qti-assessment-test>`;

/**
 * The package's manifest: each item, and each item's test.
 */
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${PACKAGE}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources>${items
  .map(
    (item) =>
      `<resource identifier="item-${item.grade}-${item.id}" type="imsqti_item_xmlv3p0" href="${pathOf(item)}"><file href="${pathOf(item)}"/></resource><resource identifier="test-${item.grade}-${item.id}" type="imsqti_test_xmlv3p0" href="${testOf(item)}"><file href="${testOf(item)}"/><dependency identifierref="item-${item.grade}-${item.id}"/></resource>`,
  )
  .join("")}</resources></manifest>`;

/**
 * Publish a package's rows through the suite's login.
 *
 * @param dir The package's directory.
 * @param name The package's name.
 */
const publishPackage = (dir: string, name: string) =>
  Effect.gen(function* publishOne() {
    const { suite } = yield* SuiteLogin;
    const read = yield* readPackage(dir, name);
    const rows = yield* importRowsOf(read);
    const db = yield* Db.open(suite.roles.result_runner, {});
    const outcome = yield* db.workload.publish.once({
      facts: { insert: rows.insert },
      params: { package: rows.package },
    });
    assert.include(["accepted", "unchanged"], outcome.kind, `${name}: published`);
  });

/**
 * The reference package of QTI's published templates, which every item here names one of
 * ("Template held"), then the items and their tests, published through the suite's login.
 */
const published = Effect.gen(function* publish() {
  yield* publishPackage(templatePackageDirectory, templatePackage);

  const fs = yield* FileSystem.FileSystem;
  const dir = yield* fs.makeTempDirectoryScoped({ prefix: `${PACKAGE}-` });
  yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifest);
  for (const item of items) {
    const document = yield* fs.readFileString(new URL(pathOf(item), fixture).pathname);
    assert.include(document, `base-type="integer"`, `${item.id}: an integer response`);
    assert.include(
      document,
      `expected-length="${String(widthOf(item))}" pattern-mask="${maskOf(item)}"`,
      `${item.id}: the table's mask, as wide as its widest number`,
    );
    yield* fs.makeDirectory(`${dir}/qti/${item.grade}`, { recursive: true });
    yield* fs.copyFile(new URL(pathOf(item), fixture).pathname, `${dir}/${pathOf(item)}`);
    yield* fs.writeFileString(`${dir}/${testOf(item)}`, testXmlOf(item));
  }

  yield* publishPackage(dir, PACKAGE);
});

/**
 * What a case reaches.
 */
type Situation =
  | "an accepted answer"
  | "a wrong answer a form would expect"
  | "a number beside the accepted answers"
  | "an empty box"
  | "a keystroke the entry rule refuses"
  | "a minus sign"
  | "a digit past the cap";

const situations = [
  "an accepted answer",
  "a wrong answer a form would expect",
  "a number beside the accepted answers",
  "an empty box",
  "a keystroke the entry rule refuses",
  "a minus sign",
  "a digit past the cap",
] as const satisfies readonly [Situation, ...Situation[]];

/**
 * What splits a typed text into the keys that typed it, one character a reader sees per key.
 */
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * The keys that typed a text, in order.
 *
 * @param typed The text.
 */
const keysOf = (typed: string): readonly string[] =>
  [...graphemes.segment(typed)].map(({ segment }) => segment);

/**
 * Every answer the Kindergarten entry allows, 0 to 20, each written as its digits.
 */
const kindergartenAnswers = Array.from({ length: 21 }, (_, n) => String(n));

/**
 * Whether the entry rule lets the box hold a text, written from the rule and never from plate's
 * reading or the item's mask: the text begins some answer the entry allows, the empty text
 * included. Kindergarten allows 0 to 20; Grades 1 and 2 a whole number of at most the item's cap's
 * digits, written with no leading zero, a lone 0 being valid. No answer holds a sign, a space or a
 * point.
 *
 * @param item The item.
 * @param text The box's text.
 */
const begunByEntryRule = (item: Typed, text: string): boolean =>
  item.grade === "K"
    ? kindergartenAnswers.some((answer) => answer.startsWith(text))
    : text === "" || (/^(?:0|[1-9][0-9]*)$/u.test(text) && text.length <= capOf(item, item.grade));

/**
 * What the entry rule leaves in the box of a text typed key by key, the caret at its end: a key
 * stands exactly where the box's text after it is one {@link begunByEntryRule} allows, and otherwise
 * the box keeps its text.
 *
 * @param item The item.
 * @param typed The keys, in order.
 * @returns The box's text.
 */
const entryRuleAfter = (item: Typed, typed: string): string =>
  Arr.reduce(keysOf(typed), "", (box, key) =>
    begunByEntryRule(item, box + key) ? box + key : box,
  );

/**
 * The reading of a Text Entry's box bound to an integer response, as its island reads it.
 */
const integerBox: TypedReading = { base: 10, baseType: "integer", blankIsEmpty: true };

/**
 * The texts each item's box takes, plate's entry of an integer box under the item's mask, by the
 * item's id.
 */
const entries = new Map<string, TypedEntry>(
  items.map((item) => [item.id, typedEntry(integerBox, maskOf(item))]),
);

/**
 * What plate's box holds of a text typed key by key, the caret at its end: each key it does not
 * take is refused (`takesTyped` over the box's entry, the islands' rule).
 *
 * @param item The item.
 * @param typed The keys, in order.
 * @returns The box's text.
 */
const plateAfter = (item: Typed, typed: string): string => {
  const entry = Option.getOrThrow(Option.fromUndefinedOr(entries.get(item.id)));

  return Arr.reduce(keysOf(typed), "", (box, key) =>
    takesTyped(entry, box + key) ? box + key : box,
  );
};

/**
 * A case: an item, a text typed into its box, what the entry rule leaves of it, the response the
 * box posts, the score the table gives, and the situation it reaches.
 */
type Case = Readonly<{
  box: string;
  item: Typed;
  name: string;
  posted: Responses;
  score: number;
  situation: Situation;
  typed: string;
}>;

/**
 * Every case of one item.
 *
 * @param item The item.
 */
const casesOf = (item: Typed): readonly [Case, ...Case[]] => {
  const [first] = item.accepted;
  const key = String(first);
  const low = Math.min(...item.accepted);
  const high = Math.max(...item.accepted);
  const beside = [low - 1, high + 1].filter(
    (n) => n >= 0 && !item.listed.includes(n) && !item.accepted.includes(n),
  );
  // Past the cap: in Kindergarten the key's last digit tapped again and 21, past 20; in Grades 1
  // and 2 the key padded with 9s to one digit more than the item's cap.
  const pastCap =
    item.grade === "K"
      ? [`${key}${key.slice(-1)}`, "21"]
      : [key.padEnd(capOf(item, item.grade) + 1, "9")];
  const typings: readonly (readonly [string, Situation])[] = [
    ...item.accepted.map((n) => [String(n), "an accepted answer"] as const),
    ...item.listed.map((n) => [String(n), "a wrong answer a form would expect"] as const),
    ...beside.map((n) => [String(n), "a number beside the accepted answers"] as const),
    ["", "an empty box"],
    ...[`0${key}`, ` ${key}`, `${key} `, `${key}.`, `${key}.0`, `+${key}`].map(
      (typed) => [typed, "a keystroke the entry rule refuses"] as const,
    ),
    [`-${key}`, "a minus sign"],
    ...pastCap.map((typed) => [typed, "a digit past the cap"] as const),
  ];
  // One case a text: a Kindergarten key of 0 tapped twice is its leading zero too.
  const distinct = Arr.dedupeWith(typings, ([a], [b]) => a === b);
  const cases = distinct.map(([typed, situation]): Case => {
    const box = entryRuleAfter(item, typed);
    const [, value] = typedResponseOf(
      [plateAfter(item, typed)],
      { baseType: "integer", cardinality: "single", identifier: "RESPONSE" },
      integerBox,
      asTyped,
    );

    return {
      box,
      item,
      name: `${item.grade} ${item.id}: ${JSON.stringify(typed)}`,
      posted: { RESPONSE: value },
      score: box !== "" && item.accepted.includes(Number(box)) ? 1 : 0,
      situation,
      typed,
    };
  });

  return Arr.match(cases, {
    onEmpty: () => assert.fail(`${item.id} gives no case`),
    onNonEmpty: (all) => all,
  });
};

/**
 * The declaration of each item's response, as plate's item model holds it: what a save's rows read
 * back through.
 */
const declarations = {
  outcomes: new Map(),
  records: new Map(),
  responses: new Map([["RESPONSE", { baseType: "integer", cardinality: "single" }] as const]),
} as const;

/**
 * Responses with each NULL response left out, as a save holds no row for one.
 *
 * @param responses The responses.
 */
const answered = (responses: Responses): Responses =>
  Object.fromEntries(
    Object.entries(responses).filter(
      ([, value]) => value.cardinality === "record" || value.values.length > 0,
    ),
  );

/**
 * One case on a fresh child: the box holds what the entry rule leaves of the typed text; the take,
 * the entry at the item, a save of the posted response and its read-back, the answer, the end and
 * its finish, and the item's SCORE.
 *
 * @param c The case.
 * @param child The fresh child.
 * @param note Records the situation the case reaches.
 */
const holdCase = (c: Case, child: string, note: (situation: Situation) => void) =>
  Effect.gen(function* hold() {
    note(c.situation);
    assert.strictEqual(
      plateAfter(c.item, c.typed),
      c.box,
      `${c.name}: the box holds what the entry rule leaves`,
    );

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: testOf(c.item), seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting`);

    const entered = yield* db.workload.enterTest.once({
      facts: {},
      params: { ...sitting, item: c.item.ref },
    });
    assert.strictEqual(entered.kind, "accepted", `${c.name}: the entry`);

    const began = Option.getOrThrow(Arr.head(Arr.fromIterable(entered.reads.entered))).at;
    const values = yield* responseParamsOf(c.posted);
    const params = { ...sitting, given: BrowserReading(began), item: c.item.ref, ...values };
    const saved = yield* db.workload.saveTestItem.once({ facts: {}, params });
    assert.strictEqual(saved.kind, "accepted", `${c.name}: the save`);

    const sittings = Arr.fromIterable(
      yield* db.workload.savesOf.once({ facts: {}, params: { child } }),
    );
    const latest = Arr.findFirst(
      sittings.flatMap(({ saves }) => Arr.fromIterable(saves)),
      ({ path }) => path === pathOf(c.item),
    );
    assert.deepStrictEqual<unknown>(
      Option.isSome(latest) ? answered(yield* responsesOfRows(declarations, latest.value)) : {},
      answered(c.posted),
      `${c.name}: the save reads back as the box posted it`,
    );

    const answeredItem = yield* db.workload.answerTestItem.once({
      facts: {},
      params: { ...params, next: [] },
    });
    assert.strictEqual(answeredItem.kind, "accepted", `${c.name}: the answer`);

    const ended = yield* db.workload.finishTest.once({ facts: {}, params: sitting });
    assert.strictEqual(ended.kind, "accepted", `${c.name}: the end and its finish`);

    const scores = Arr.fromIterable(
      yield* db.workload.floatsOf.once({ facts: {}, params: { child } }),
    ).filter((row) => row.path === pathOf(c.item) && row.variable === "SCORE");
    assert.deepStrictEqual(
      scores.map((row) => row.value),
      [c.score],
      `${c.name}: the box holds ${JSON.stringify(c.box)}, SCORE ${String(c.score)}`,
    );
  });

/**
 * Every case of every item.
 */
const allCases = items.flatMap((item) => casesOf(item));

describe.skipIf(Option.isNone(lease))(
  "typed numerals in the K-2 forms' typed-number form, scored by the number the box shows, on the lease's result database",
  () => {
    layer(suiteLayerOf("typed"), { excludeTestServices: true, timeout: "600 seconds" })(
      "sixteen typed items across K, 1 and 2, every case typed key by key under its grade's cap and scored by match_correct or map_response",
      (it) => {
        it.effect(
          "publishes the items, and holds every typed case to the table",
          (ctx) =>
            Effect.gen(function* holdEveryTyping() {
              yield* Effect.scoped(published);

              // A run's children are its own: the database may hold an earlier run's sittings.
              const run = yield* Clock.currentTimeMillis;
              const runs = yield* Ref.make(0);
              const exhausted = yield* searched(
                ctx,
                exhaust(
                  {
                    box: "every typed case of sixteen items, each on a fresh child",
                    caseHang: Duration.minutes(2),
                    coverage: requiredInSpace<Situation>(situations),
                    generator: element(
                      Arr.match(allCases, {
                        onEmpty: () => assert.fail("no case"),
                        onNonEmpty: (all) => all,
                      }),
                    ),
                    literal: (c: Case) => c.name,
                    oracle: {
                      kind: "specification",
                      name: "the table: each item's accepted answers and listed wrong answers, scored one point exactly where the box holds an accepted answer; the entry rule (digits only, a leading zero refused, a lone 0 valid, Kindergarten 0 to 20, Grades 1 and 2 three and four digits, each item's cap raised to its longest listed answer) for what the box holds, a keystroke standing exactly where it begins an answer the rule allows; the response read back as posted",
                    },
                    suite: "ledger/typed-numerals",
                  },
                  (row, c) =>
                    Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                      Effect.flatMap((k) =>
                        holdCase(row, `user_typed${String(run)}_${String(k)}`, (situation) => {
                          c.note(situation);
                        }),
                      ),
                      Effect.orDie,
                    ),
                ),
              );
              yield* Effect.log(`held over ${String(exhausted.cases)} typed cases`);
            }).pipe(Effect.orDie),
          // A hang guard, never a budget: some 270 sittings.
          Duration.toMillis(Duration.minutes(20)),
        );
      },
    );
  },
);
