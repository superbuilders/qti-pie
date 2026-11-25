/**
 * Sorting into bins and putting in order, as the QTI database scores them: two placement items
 * written for this suite, `fixtures/placement/`, in the shape a primary-grades form delivers its
 * sorts and orders (every choice a picture, never lettered; each bin holding every picture, its
 * `match-max` 0, so no bin reveals the key: Bjorn, 2026-11-25; the order's slots in a row,
 * unnumbered under `qti-labels-none`, a caption under each end slot), each under QTI's
 * `match_correct`, one point for an exact match and none otherwise:
 *
 * - "sort by colour", "Put each ball in the basket of its colour.": a Match whose five balls go into
 *   two baskets, `Red` and `Blue`;
 * - "order by length", "Line up the trains, shortest first.": an Order of three trains into three
 *   slots, listed scrambled, `shortest` and `longest` under its end slots.
 *
 * Each item stands in a test of its own, one linear, individual part. A case is one arrangement a
 * child can leave on the screen, on a fresh child's sitting: the take, the entry at the item, a
 * save of the response the island posts for the arrangement and its read-back, the answer of that
 * response through the test runtime's own programs, and the end with its finish; then the SCORE the
 * database holds for the item. Every arrangement is a case:
 *
 * - A Match: every set of its pairs, a picture and a bin, that its limits allow as the fixture's
 *   document declares them, read as plate opens it and never restated here: no picture in more bins
 *   than its `match-max`, no bin holding more pictures than its own, no more pairs than the Match's
 *   `max-associations`, each 0 for no limit (QTI 3.0 information model 5.131.6, 5.89.2; the island
 *   refuses a move past one). With each picture's 1 and each bin's 0 that is each picture in the
 *   bank or either bin, 3^5 = 243 arrangements, every picture in one bin and every picture in the
 *   wrong bin among them. The response is the pairs on the screen, one `directedPair` each, the
 *   picture first, NULL where every picture is in the bank;
 * - An Order: each of its slots, one per choice its document lists, empty or holding one choice, no
 *   choice twice, and the response the choices in slot order once every slot is filled, NULL until
 *   then (the island posts an order once no empty slot stands before a filled one and as many are
 *   filled as it requires, every choice with no `min-choices`; QTI 3.0 information model 5.97.2,
 *   5.115).
 *
 * The table is each item's key in words, by each choice's name, written here apart from the items'
 * `qti-correct-response`, with the name of each choice by its identifier, so a choice of the
 * fixture the table does not name fails the suite: the three red balls in `Red` and the two blue in
 * `Blue`; the train of one carriage, then two, then three. A case scores 1 exactly where every
 * choice stands where the key puts it and 0 everywhere else, partial, empty and reversed
 * arrangements among them (scored on the final arrangement, all right or no point). The read-back
 * holds the response the database stored to the one the island posted, a bag for a Match and in
 * slot order for an Order: what the child submits is what the screen shows.
 *
 * It runs wherever a lane names its lease (pantry's `QTI_PIE_PG_*`), on the lease's result
 * database, where the ledger's global setup installs the composition
 * (`#ledger/test/result-suite.ts`), and is skipped elsewhere, as every database suite is.
 *
 * @module
 */
import { readFileSync } from "node:fs";
import { Db } from "@bjornpagen/grizzle/runtime";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, layer } from "@effect/vitest";
import { importRowsOf } from "@qti-pie/pantry/import/program.ts";
import { readPackage } from "@qti-pie/pantry/import/read.ts";
import { acceptedItem, openAdmitted } from "@qti-pie/plate";
import type { Responses } from "@qti-pie/plate";
import { Array as Arr, Clock, Duration, Effect, FileSystem, Option, Order, Ref } from "effect";
import { responseParamsOf, responsesOfRows } from "#ledger/served-values.ts";
import { templatePackage, templatePackageDirectory } from "#ledger/template-package.ts";
import { lease, SuiteLogin, suiteLayerOf } from "#ledger/test/result-suite.ts";

const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

const PACKAGE = "ledger-placement-proof";

/**
 * The seed every sitting's decision draws under, which nothing the table reads depends on.
 */
const DECISION = "3f1c9e2a-6b7d-4e85-a0c4-9d2f7b1e5a63";

/**
 * The fixture: each item's document under `items/`, its pictures under `images/<item>/`.
 */
const fixture = new URL("../fixtures/placement/", import.meta.url);

/**
 * A Match in words: the name of each picture and bin, by its identifier in the item, and the key,
 * each picture's bin by name. Which pictures and bins the screen holds, and how many each takes,
 * are the item's own ({@link SortScreen}).
 */
interface Sort {
  readonly kind: "sort";
  readonly key: Readonly<Record<string, string>>;
  readonly names: Readonly<Record<string, string>>;
}

/**
 * An Order in words: the name of each choice, by its identifier in the item, and the key, the
 * choices' names in slot order. Its choices and slots are the item's own ({@link LineScreen}).
 */
interface Line {
  readonly kind: "line";
  readonly key: readonly string[];
  readonly names: Readonly<Record<string, string>>;
}

/**
 * One of the items: its name, its document in the fixture, the pictures it names, its test, its
 * item ref there (the item's own identifier, as QTI 3.0 §4.1.1 requires of a ref), and what it
 * asks.
 */
interface Item {
  readonly asks: Sort | Line;
  readonly id: "sort by colour" | "order by length";
  readonly images: readonly string[];
  readonly path: string;
  readonly ref: string;
  readonly test: string;
}

/**
 * The picture files of one item, `images/<item>/<choice>.svg`.
 *
 * @param item The item's identifier, its folder's name.
 * @param choices The identifiers of its choices that are pictures.
 */
const picturesOf = (item: string, choices: readonly string[]): readonly string[] =>
  choices.map((choice) => `images/${item}/${choice}.svg`);

const sortByColour: Item = {
  asks: {
    key: {
      "a big blue ball": "Blue",
      "a big red ball": "Red",
      "a middle-sized red ball": "Red",
      "a small blue ball": "Blue",
      "a small red ball": "Red",
    },
    kind: "sort",
    names: {
      "ball-a": "a big red ball",
      "ball-b": "a small blue ball",
      "ball-c": "a small red ball",
      "ball-d": "a big blue ball",
      "ball-e": "a middle-sized red ball",
      "basket-1": "Red",
      "basket-2": "Blue",
    },
  },
  id: "sort by colour",
  images: picturesOf("sort-by-colour", ["ball-a", "ball-b", "ball-c", "ball-d", "ball-e"]),
  path: "items/sort-by-colour.xml",
  ref: "sort-by-colour",
  test: "sort-by-colour-test.xml",
};

const orderByLength: Item = {
  asks: {
    key: [
      "the train of one carriage",
      "the train of two carriages",
      "the train of three carriages",
    ],
    kind: "line",
    names: {
      "train-a": "the train of three carriages",
      "train-b": "the train of one carriage",
      "train-c": "the train of two carriages",
    },
  },
  id: "order by length",
  images: picturesOf("order-by-length", ["train-a", "train-b", "train-c"]),
  path: "items/order-by-length.xml",
  ref: "order-by-length",
  test: "order-by-length-test.xml",
};

const items: readonly Item[] = [sortByColour, orderByLength];

/**
 * The test an item stands in: one linear, individual part holding it alone, one point per item.
 *
 * @param item The item.
 */
const testXmlOf = (item: Item) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${item.test.replace(".xml", "")}" title="${item.id}"><qti-test-part identifier="part" navigation-mode="linear" submission-mode="individual"><qti-assessment-section identifier="section" title="section" visible="true"><qti-assessment-item-ref identifier="${item.ref}" href="${item.path}"/></qti-assessment-section></qti-test-part>
</qti-assessment-test>`;

/**
 * The package's manifest: each item with the pictures it names, and each item's test.
 */
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${PACKAGE}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources>${items
  .map(
    (item) =>
      `<resource identifier="item-${item.ref}" type="imsqti_item_xmlv3p0" href="${item.path}"><file href="${item.path}"/>${item.images.map((image) => `<file href="${image}"/>`).join("")}</resource><resource identifier="test-${item.ref}" type="imsqti_test_xmlv3p0" href="${item.test}"><file href="${item.test}"/><dependency identifierref="item-${item.ref}"/></resource>`,
  )
  .join("")}</resources></manifest>`;

/**
 * Publish one package directory through the suite's login, under its name.
 *
 * @param dir The package's directory.
 * @param name Its name, the key its rows are stored under.
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
 * The items and their tests, published through the suite's login after the reference package of
 * QTI's published response processing templates, which every item that names `match_correct` needs
 * published first ("Template held", `#ledger/template-package.ts`).
 */
const published = Effect.gen(function* publish() {
  yield* publishPackage(templatePackageDirectory, templatePackage);

  const fs = yield* FileSystem.FileSystem;
  const dir = yield* fs.makeTempDirectoryScoped({ prefix: `${PACKAGE}-` });
  yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifest);
  for (const item of items) {
    for (const file of [item.path, ...item.images]) {
      yield* fs.makeDirectory(`${dir}/${file.slice(0, file.lastIndexOf("/"))}`, {
        recursive: true,
      });
      yield* fs.copyFile(new URL(file, fixture).pathname, `${dir}/${file}`);
    }
    yield* fs.writeFileString(`${dir}/${item.test}`, testXmlOf(item));
  }

  yield* publishPackage(dir, PACKAGE);
});

/**
 * A choice of the item as its document declares it: its identifier, and how many places it goes to
 * or holds, its `match-max`, 0 for no limit.
 */
interface Limited {
  readonly identifier: string;
  readonly matchMax: bigint;
}

/**
 * A Match's screen as its item declares it, read from the fixture's document as plate opens it:
 * its pictures, the first set's choices, and its bins, the second's, in document order, and its
 * `max-associations`, 0 for no limit.
 */
interface SortScreen {
  readonly bins: readonly Limited[];
  readonly figures: readonly Limited[];
  readonly kind: "sort";
  readonly maxAssociations: bigint;
}

/**
 * An Order's screen as its item declares it: its choices' identifiers in document order, and one
 * slot for each, as an Order with no `max-choices` shows them.
 */
interface LineScreen {
  readonly kind: "line";
  readonly choices: readonly string[];
}

/**
 * A choice as {@link Limited} keeps it: its identifier and its `match-max`.
 *
 * @param choice The choice, as plate's model reads it.
 */
const limited = (choice: Limited): Limited => ({
  identifier: choice.identifier,
  matchMax: choice.matchMax,
});

/**
 * Read an item's screen from its document in the fixture, opened as the host opens content the
 * database admitted (`openAdmitted`; the suite's database admits the same bytes when it publishes
 * them), so the arrangements the suite holds follow what the document declares and no count is
 * kept here: a changed `match-max` changes the arrangements.
 *
 * @param item The item.
 */
const screenOf = (item: Item): SortScreen | LineScreen => {
  const bytes = readFileSync(new URL(item.path, fixture));
  const accepted = Option.getOrThrow(acceptedItem(Effect.runSync(openAdmitted(item.path, bytes))));
  const [interaction, ...others] = accepted.item.body.flatMap((node) =>
    node.kind === "match" || node.kind === "order" ? [node] : [],
  );
  assert.isDefined(interaction, `${item.id}: its interaction`);
  assert.lengthOf(others, 0, `${item.id}: one interaction`);

  if (interaction.kind === "order") {
    assert.isTrue(Option.isNone(interaction.maxChoices), `${item.id}: no max-choices`);

    return {
      choices: interaction.choices.map((choice) => choice.identifier),
      kind: "line",
    };
  }

  return {
    bins: interaction.targets.map(limited),
    figures: interaction.sources.map(limited),
    kind: "sort",
    maxAssociations: interaction.maxAssociations,
  };
};

/**
 * The kind of a Match's arrangement: every picture in its bin by the key; every picture in one bin;
 * every picture in a bin the key does not put it in (with two bins, the two swapped); every picture
 * in a bin otherwise; some pictures in the bank; or all of them.
 */
type SortKind =
  | "sorted right"
  | "every picture in one bin"
  | "every picture in the wrong bin"
  | "sorted with a mistake"
  | "partly sorted"
  | "nothing sorted";

/**
 * The kind of an Order's arrangement: every slot filled in the key's order, in its reverse, in
 * another order, some slots empty, or all.
 */
type LineKind = "in order" | "reversed" | "out of order" | "partly placed" | "nothing placed";

/**
 * What a case reaches: an item, and its arrangement's kind.
 */
type Situation = `${Item["id"]}: ${SortKind | LineKind}`;

/**
 * Give a Match's arrangement its kind.
 *
 * @param pairs The pictures in the bins, each with its bin, by name.
 * @param sort What it asks: its key.
 * @param total How many pictures the Match has.
 */
const sortKindOf = (
  pairs: readonly { readonly bin: string; readonly figure: string }[],
  sort: Sort,
  total: number,
): SortKind => {
  if (pairs.length === 0) {
    return "nothing sorted";
  }

  if (pairs.length < total) {
    return "partly sorted";
  }

  const right = pairs.filter(({ bin, figure }) => sort.key[figure] === bin).length;

  if (right === total) {
    return "sorted right";
  }

  if (new Set(pairs.map(({ bin }) => bin)).size === 1) {
    return "every picture in one bin";
  }

  return right === 0 ? "every picture in the wrong bin" : "sorted with a mistake";
};

/**
 * Give an Order's arrangement its kind.
 *
 * @param names The names of the choices in the slots, in slot order, the empty slots left out.
 * @param line What the Order asks: its key.
 * @param slots How many slots it shows.
 */
const lineKindOf = (names: readonly string[], line: Line, slots: number): LineKind => {
  if (names.length === 0) {
    return "nothing placed";
  }

  if (names.length < slots) {
    return "partly placed";
  }

  if (names.every((name, index) => name === line.key[index])) {
    return "in order";
  }

  return names.every((name, index) => name === line.key[line.key.length - 1 - index])
    ? "reversed"
    : "out of order";
};

const situations = [
  "sort by colour: sorted right",
  "sort by colour: every picture in one bin",
  "sort by colour: every picture in the wrong bin",
  "sort by colour: sorted with a mistake",
  "sort by colour: partly sorted",
  "sort by colour: nothing sorted",
  "order by length: in order",
  "order by length: reversed",
  "order by length: out of order",
  "order by length: partly placed",
  "order by length: nothing placed",
] as const satisfies readonly [Situation, ...Situation[]];

/**
 * A case: an item, an arrangement on its screen, the response the island posts for it (NULL as no
 * entry), the score the key gives it, and the situation it reaches.
 */
type Case = Readonly<{
  item: Item;
  name: string;
  posted: Responses;
  score: number;
  situation: Situation;
}>;

/**
 * The name the table gives a choice of the item; a choice the table does not name fails the suite,
 * so the fixture and the table cannot part.
 *
 * @param item The item.
 * @param names The table's names, by identifier.
 * @param identifier The choice's identifier.
 */
const nameOf = (
  item: Item,
  names: Readonly<Record<string, string>>,
  identifier: string,
): string => {
  const name = Object.hasOwn(names, identifier) ? names[identifier] : undefined;
  assert.isDefined(name, `${item.id}: the table's name for ${identifier}`);

  return name;
};

/**
 * Whether a count stays within a limit QTI writes as a whole number, 0 for none ("If match-max is 0
 * then there is no restriction", QTI 3.0 information model 5.131.6; `max-associations`, 5.89.2).
 *
 * @param limit The limit.
 * @param count The count.
 */
const within = (limit: bigint, count: number): boolean => limit === 0n || BigInt(count) <= limit;

/**
 * Every subset of a list, each in the list's order.
 *
 * @param all The list.
 */
const subsetsOf = <A>(all: readonly A[]): readonly (readonly A[])[] =>
  Arr.match(all, {
    onEmpty: (): readonly (readonly A[])[] => [[]],
    onNonEmpty: ([first, ...rest]) =>
      subsetsOf(rest).flatMap((subset) => [subset, [first, ...subset]]),
  });

/**
 * Every arrangement of a Match a child can leave: every set of its pairs, a picture and a bin, that
 * the item's limits allow, no picture in more bins and no bin holding more pictures than its
 * `match-max` and no more pairs than its `max-associations`; the island posts the pairs, NULL with
 * none placed.
 *
 * @param item The item.
 * @param sort What it asks.
 * @param screen Its screen as the item declares it.
 */
const sortCases = (item: Item, sort: Sort, screen: SortScreen): readonly Case[] =>
  subsetsOf(screen.figures.flatMap((figure) => screen.bins.map((bin) => ({ bin, figure }))))
    .filter(
      (pairs) =>
        within(screen.maxAssociations, pairs.length) &&
        screen.figures.every((figure) =>
          within(figure.matchMax, pairs.filter((pair) => pair.figure === figure).length),
        ) &&
        screen.bins.every((bin) =>
          within(bin.matchMax, pairs.filter((pair) => pair.bin === bin).length),
        ),
    )
    .map((pairs): Case => {
      const named = pairs.map(({ bin, figure }) => ({
        bin: nameOf(item, sort.names, bin.identifier),
        figure: nameOf(item, sort.names, figure.identifier),
      }));
      const kind = sortKindOf(named, sort, screen.figures.length);
      const shown = named.map(({ bin, figure }) => `${figure} in ${bin}`).join(", ");

      return {
        item,
        name: `${item.id}: ${pairs.length === 0 ? "every picture in the bank" : shown}`,
        posted:
          pairs.length === 0
            ? {}
            : {
                RESPONSE: {
                  baseType: "directedPair",
                  cardinality: "multiple",
                  values: pairs.map(({ bin, figure }) => ({
                    baseType: "directedPair",
                    value: [figure.identifier, bin.identifier],
                  })),
                },
              },
        score: kind === "sorted right" ? 1 : 0,
        situation: `${item.id}: ${kind}`,
      };
    });

/**
 * Every way of putting each of `count` things in one of `places` places or none: each a list of a
 * place's index or `undefined`, in the things' order.
 *
 * @param count How many things.
 * @param places How many places.
 */
const assignments = (count: number, places: number): readonly (readonly (number | undefined)[])[] =>
  count === 0
    ? [[]]
    : assignments(count - 1, places).flatMap((rest) =>
        [undefined, ...Array.from({ length: places }, (_, place) => place)].map((place) => [
          place,
          ...rest,
        ]),
      );

/**
 * Every arrangement of an Order a child can leave: each slot empty or holding a choice, none twice;
 * the island posts the choices in slot order once every slot is filled, NULL until then.
 *
 * @param item The item.
 * @param line What it asks.
 * @param screen Its screen as the item declares it.
 */
const lineCases = (item: Item, line: Line, screen: LineScreen): readonly Case[] => {
  const slots = screen.choices.length;

  return assignments(slots, slots)
    .filter((slotOf) =>
      slotOf.every((slot, index) => slot === undefined || slotOf.indexOf(slot) === index),
    )
    .map((slotOf): Case => {
      const shown = Array.from({ length: slots }, (_, slot) =>
        screen.choices.find((_choice, index) => slotOf[index] === slot),
      );
      const filled = shown.flatMap((choice) => (choice === undefined ? [] : [choice]));
      const kind = lineKindOf(
        filled.map((choice) => nameOf(item, line.names, choice)),
        line,
        slots,
      );

      return {
        item,
        name: `${item.id}: ${shown.map((choice) => (choice === undefined ? "an empty slot" : nameOf(item, line.names, choice))).join(", ")}`,
        posted:
          filled.length < slots
            ? {}
            : {
                RESPONSE: {
                  baseType: "identifier",
                  cardinality: "ordered",
                  values: filled.map((choice) => ({ baseType: "identifier", value: choice })),
                },
              },
        score: kind === "in order" ? 1 : 0,
        situation: `${item.id}: ${kind}`,
      };
    });
};

/**
 * Every arrangement of one item's screen.
 *
 * @param item The item.
 * @param screen Its screen as the item declares it.
 */
const casesOf = (item: Item, screen: SortScreen | LineScreen) => {
  const { asks } = item;
  const nonEmpty = (all: readonly Case[]) =>
    Arr.match(all, {
      onEmpty: () => assert.fail(`${item.id} gives no arrangement`),
      onNonEmpty: (cases) => cases,
    });

  if (asks.kind === "sort" && screen.kind === "sort") {
    return nonEmpty(sortCases(item, asks, screen));
  }

  if (asks.kind === "line" && screen.kind === "line") {
    return nonEmpty(lineCases(item, asks, screen));
  }

  return assert.fail(`${item.id}: asks a ${asks.kind}, but its document holds a ${screen.kind}`);
};

/**
 * The situations one item's arrangements must reach, its own of {@link situations}.
 *
 * @param item The item.
 */
const situationsOf = (item: Item) =>
  Arr.match(
    situations.filter((situation) => situation.startsWith(`${item.id}: `)),
    {
      onEmpty: () => assert.fail(`${item.id} names no situation`),
      onNonEmpty: (all) => all,
    },
  );

/**
 * The declaration of each item's response, as plate's item model holds it: what a save's rows read
 * back through.
 *
 * @param item The item.
 */
const declarationsOf = (item: Item) =>
  ({
    outcomes: new Map(),
    records: new Map(),
    responses: new Map([
      item.asks.kind === "sort"
        ? (["RESPONSE", { baseType: "directedPair", cardinality: "multiple" }] as const)
        : (["RESPONSE", { baseType: "identifier", cardinality: "ordered" }] as const),
    ]),
  }) as const;

/**
 * A response as a bag where its cardinality is `multiple`, its values in one order whatever order
 * they came in, so a Match's read-back compares with what was posted as QTI compares two bags; an
 * `ordered` response keeps its order, which is the value.
 *
 * @param responses The responses.
 */
const bagged = (responses: Responses): Responses =>
  Object.fromEntries(
    Object.entries(responses).map(([identifier, value]) => [
      identifier,
      value.cardinality === "multiple"
        ? {
            ...value,
            values: Arr.sort(
              value.values,
              Order.mapInput(Order.String, (single) => JSON.stringify(single)),
            ),
          }
        : value,
    ]),
  );

/**
 * One case on a fresh child: the take, the entry at the item, a save of the posted response and
 * its read-back, the answer, the end and its finish, and the item's SCORE.
 *
 * @param c The case.
 * @param child The fresh child.
 * @param note Records the situation the case reaches.
 */
const holdCase = (c: Case, child: string, note: (situation: Situation) => void) =>
  Effect.gen(function* hold() {
    note(c.situation);

    const { suite } = yield* SuiteLogin;
    const db = yield* Db.open(suite.roles.result_runner, {});
    const sitting = { child, stage: 1n };
    const taken = yield* db.workload.takeSitting.once({
      facts: {},
      params: { ...sitting, package: PACKAGE, path: c.item.test, seed: DECISION },
    });
    assert.strictEqual(taken.kind, "accepted", `${c.name}: the sitting`);

    const entered = yield* db.workload.enterTest.once({
      facts: {},
      params: { ...sitting, item: c.item.ref },
    });
    assert.strictEqual(entered.kind, "accepted", `${c.name}: the entry`);

    const began = Option.getOrThrow(Arr.head(Arr.fromIterable(entered.reads.entered))).at;
    const values = yield* responseParamsOf(c.posted);
    const params = { ...sitting, given: began, item: c.item.ref, ...values };
    const saved = yield* db.workload.saveTestItem.once({ facts: {}, params });
    assert.strictEqual(saved.kind, "accepted", `${c.name}: the save`);

    const sittings = Arr.fromIterable(
      yield* db.workload.savesOf.once({ facts: {}, params: { child } }),
    );
    const latest = Option.getOrThrow(
      Arr.findFirst(
        sittings.flatMap(({ saves }) => Arr.fromIterable(saves)),
        ({ path }) => path === c.item.path,
      ),
    );
    assert.deepStrictEqual<unknown>(
      bagged(yield* responsesOfRows(declarationsOf(c.item), latest)),
      bagged(c.posted),
      `${c.name}: the save reads back as the island posted it`,
    );

    const answered = yield* db.workload.answerTestItem.once({
      facts: {},
      params: { ...params, next: [] },
    });
    assert.strictEqual(answered.kind, "accepted", `${c.name}: the answer`);

    const ended = yield* db.workload.finishTest.once({ facts: {}, params: sitting });
    assert.strictEqual(ended.kind, "accepted", `${c.name}: the end and its finish`);

    const scores = Arr.fromIterable(
      yield* db.workload.floatsOf.once({ facts: {}, params: { child } }),
    ).filter((row) => row.path === c.item.path && row.variable === "SCORE");
    assert.deepStrictEqual(
      scores.map((row) => row.value),
      [c.score],
      `${c.name}: SCORE ${String(c.score)}`,
    );
  });

/**
 * How long one case may run before it is stopped and reported, the search's one guard on time: a
 * sitting that runs past it is hung, whatever the machine's load.
 */
const caseHang = Duration.minutes(2);

/**
 * Each item with every arrangement of its screen, read from the fixture when the file loads.
 */
const plans = items.map((item) => ({ cases: casesOf(item, screenOf(item)), item }));

describe.skipIf(Option.isNone(lease))(
  "placement items scored on the final arrangement, on the runner's database",
  () => {
    layer(suiteLayerOf("placement"), { excludeTestServices: true, timeout: "600 seconds" })(
      "every arrangement a child can leave of a sort into bins and of an order into slots, submitted as shown and scored by match_correct",
      (it) => {
        for (const { cases, item } of plans) {
          it.effect(
            `publishes the items, and holds every arrangement of ${item.id} to its key`,
            (ctx) =>
              Effect.gen(function* holdEveryArrangement() {
                yield* Effect.scoped(published);

                // A run's children are its own: the database may hold an earlier run's sittings.
                const run = yield* Clock.currentTimeMillis;
                const runs = yield* Ref.make(0);
                const exhausted = yield* searched(
                  ctx,
                  exhaust(
                    {
                      box: `every arrangement of ${item.id}'s screen, each on a fresh child`,
                      caseHang,
                      coverage: requiredInSpace<Situation>(situationsOf(item)),
                      generator: element(cases),
                      literal: (c: Case) => c.name,
                      oracle: {
                        kind: "specification",
                        name: "each item's key in words: one point exactly where every choice stands where the key puts it, none otherwise; the response read back as posted",
                      },
                      suite: `ledger/placement-arrangements/${item.ref}`,
                    },
                    (row, c) =>
                      Ref.getAndUpdate(runs, (k) => k + 1).pipe(
                        Effect.flatMap((k) =>
                          holdCase(
                            row,
                            `user_placement${String(run)}_${String(k)}`,
                            (situation) => {
                              c.note(situation);
                            },
                          ),
                        ),
                        Effect.orDie,
                      ),
                  ),
                );
                yield* Effect.log(`${item.id} held over ${String(exhausted.cases)} arrangements`);
              }).pipe(Effect.orDie),
            // The test's own timeout, which no run of its work can reach: every case and the
            // publishing at their guard, so a loaded machine finishes the search, and only a hung
            // case stops it.
            Duration.toMillis(Duration.times(caseHang, cases.length + 1)),
          );
        }
      },
    );
  },
);
