/**
 * Plate's UI suite: what an item shows in each state the suite holds it in ({@link see}), and the
 * rules every such page keeps ({@link rules}), each read from the page against a table written
 * from the specification it cites rather than from plate's code.
 *
 * The rules, for every item of a source and every showing (`#specimen/ui/showing.ts`):
 *
 * - R1: the item renders without throwing.
 * - C1: where the item's source describes the shown response as empty, as a generated case does, it
 *   posts what it starts at, the child having changed nothing (a Slider posts its start). Whether a
 *   response it calls right, wrong or partly right is so is `qti-match`'s, which the database
 *   grader judges.
 * - I1: every `id` is unique, not empty and holds no white space (HTML, the `id` attribute).
 * - I2: every IDREF the page writes names an id on the page (HTML's and WAI-ARIA's IDREF attributes,
 *   SVG's `url(#id)`): an item stands alone, and names nothing of its host.
 * - A1: every control a screen reader reaches has an accessible name (WAI-ARIA's roles that require
 *   one, by the Accessible Name computation as HTML-AAM gives it).
 * - N1: no notice appears but one naming a feature the verdict says plate shows as a notice, or a
 *   Portable Custom Interaction the host gives no facts for, and none more often than the item
 *   holds it.
 * - P1: in answering, the entries the page's form posts decode, under each response's posting, to the
 *   response drawn, NULL to the posting's absent value where it has one.
 * - M1: a review draws only the marks the shown responses' class allows ({@link marksByClass}), and,
 *   where it withholds the solution, none `missed`.
 * - M2: no page draws a mark but a review; a review that withholds the solution marks only the
 *   candidate's own response, right or wrong, and never reveals a correct response: it draws no
 *   `missed` mark, which a part of the correct response the candidate did not give, a Control's
 *   right answer and a bank chip left behind each carry. Bjorn's ruling of 2026-11-18 restated it:
 *   "a review that hides the solution marks only the candidate's own response, right or wrong, and
 *   never reveals a correct response" (spec reading 230); until then M2 allowed no mark at all
 *   where the solution was withheld, so the candidate's own wrong pick read as merely picked.
 * - M3: a review tells each value of a response once in each part of the page a screen reader
 *   reaches: no such part (`data-slot`) marks more answers `right` or `wrong` than the shown
 *   responses hold values, nor more `missed` than their correct responses hold
 *   ({@link valuesHeld}), though one value may be told in several parts. A bank chip marked left
 *   behind (`data-missed`) marks a choice, not a value, and is not counted; nor is a part left out
 *   of the accessibility tree, which draws for the eye alone, so markup cannot judge it: a graphic
 *   stage's pins hold the placed cards' drawing for each band of widths the stage may take, of
 *   which the stylesheet shows one, so a card stands there once in each band that holds it.
 * - J1: review and solution ship no island but a Media's replay island, which posts nothing. No
 *   client component stands in their element tree but plate's `MediaReplay` in an item that holds a
 *   Media, whose props, as the page receives them (serialized), hold none of the entry names the
 *   item's responses post under, and the page's HTML posts no entry (HTML's entry list): a control
 *   posts only under a name, so an island handed none of the responses' names, on a page with no
 *   control that posts, posts nothing. A review page also stands in no `<Responses>`, so no island
 *   there can write the host's entries. The exception is Bjorn's ruling of 2026-11-18, "replay mode
 *   is fine": a review and a solution play their media through plate's own controls, uncounted and
 *   unlimited, and record nothing; until then J1 allowed no island at all (spec reading 229).
 *
 * The suite grades nothing: plate runs no response processing, so a review shows the responses
 * drawn under the record the attempt starts from, as the host shows a record the QTI database
 * returned. Whether a response scores as its source predicts, and whether it matches its correct
 * response as its source describes it, is the database grader's to say, held to the golden
 * recording by the database suite.
 *
 * Test support for plate's UI suite under `src/ui/`; it reads plate through its public entries
 * alone.
 *
 * @module
 */
import { Option, Result } from "effect";
import { decode, encode, format, postings, restore, solution } from "@qti-pie/plate";
import type {
  Accepted,
  AcceptedStimulus,
  Configuration,
  Entry,
  HostFacts,
  ItemRecord,
  Posting,
  ResponseValue,
  Responses,
} from "@qti-pie/plate";
import { recordOf } from "@qti-pie/plate/test/records";
import type { Graded, ItemProps, Reveals } from "@qti-pie/plate/ui";
import { render } from "#specimen/ui/rendered.ts";
import type { InteractionKind, Page, Reference, Showable, Where } from "#specimen/ui/rendered.ts";
import { classOf, derived, handedMarks, itemClassOf } from "#specimen/ui/showing.ts";
import type { Drawable, ResponseClass, Showing, SolutionShown } from "#specimen/ui/showing.ts";

/**
 * A class a source describes a response as, by the score it gives: every class but `unjudged`.
 */
export type Described = Exclude<ResponseClass, "unjudged">;

/**
 * An item a source hands the suite: the accepted item, where it came from, the configuration it is
 * rendered under, and, for an item with template processing, which the QTI database runs at the
 * take, the record the take gives it (`taken`): the golden grading data's for a corpus item, none
 * where the source has none, which shows the item with no record.
 */
export interface SourceItem {
  readonly accepted: Accepted;
  readonly configuration: Configuration;
  /**
   * The response the source gives the child, which a `given` showing shows: the entries the form
   * posts for it, under the suite's {@link instance}, and the class the source describes it as;
   * none for a source that gives none, as the corpus, whose showings draw theirs from the correct
   * response.
   */
  readonly given: Option.Option<{
    readonly described: Described;
    readonly entries: readonly Entry[];
  }>;
  /**
   * What the host knows of where the item's scripts run, `<Item>`'s `host`, none for none.
   */
  readonly host: Option.Option<HostFacts>;
  /**
   * The kind of every interaction the item's source writes, in document order.
   */
  readonly kinds: readonly InteractionKind[];
  /**
   * Where the item came from, as a failure names it: a corpus path, or a generated case's name.
   */
  readonly location: string;
  /**
   * The identifiers each interaction offers the candidate, by the response it binds, as
   * `itemFactsOf` reads them from the item's XML (`#specimen/ui/source.ts`).
   */
  readonly offered: ReadonlyMap<string, readonly string[]>;
  /**
   * The stimuli the item's stimulus refs name, as a host hands them to `<Item>`; none for an item
   * that references none.
   */
  readonly stimuli: readonly AcceptedStimulus[];
  /**
   * The record the database's take gives an item with template processing, none for any other
   * item or where the source has none.
   */
  readonly taken: Option.Option<ItemRecord>;
}

/**
 * One response the page posts, as the suite drew it: its posting, the value drawn, its correct
 * response, and its class against it.
 */
export interface DrawnResponse {
  readonly class: ResponseClass;
  readonly correct: ResponseValue;
  readonly posting: Posting;
  readonly value: ResponseValue;
}

/**
 * What became of a showing: the page it rendered; no page, for a `part` showing of an item no
 * response of which can be partly right; or what rendering threw.
 */
export type Outcome =
  | { readonly kind: "rendered"; readonly page: Page }
  | { readonly kind: "underived" }
  | { readonly kind: "threw"; readonly reason: string };

/**
 * An item in one showing, and what the suite saw: the responses drawn and their class together,
 * the features the item may show a notice for, the kinds of its interactions, and the outcome.
 */
export interface Seen {
  /**
   * The response the item's source gives, as a `given` showing shows it: the class the source
   * describes it as and the entries it posts; none where the showing draws its own.
   */
  readonly described: Option.Option<{
    readonly described: Described;
    readonly entries: readonly Entry[];
  }>;
  readonly drawn: readonly DrawnResponse[];
  readonly expectedNotices: readonly string[];
  readonly itemClass: ResponseClass;
  readonly kinds: readonly InteractionKind[];
  readonly outcome: Outcome;
  readonly showing: Showing;
}

/**
 * The instance every page of the suite renders under.
 */
export const instance = "suite";

/**
 * Give NULL of a response's type, as a response with no correct response is drawn.
 *
 * @param posting The response's posting.
 * @returns NULL of its binding's type.
 */
const nullOf = (posting: Posting): ResponseValue =>
  posting.binding.cardinality === "record"
    ? { cardinality: "record", fields: [] }
    : { baseType: posting.binding.baseType, cardinality: posting.binding.cardinality, values: [] };

/**
 * Give the text of a failure as a page names it.
 *
 * @param cause What was thrown or failed.
 * @returns Its message, or its text.
 */
const reasonOf = (cause: unknown): string =>
  cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause);

/**
 * Give the features an item may show a notice for: each the verdict says plate shows as a notice,
 * and one for each Portable Custom Interaction, which the suite renders with no host facts.
 *
 * @param item The item.
 * @returns The features, each as often as the item may show its notice.
 */
const noticedOf = (item: SourceItem): readonly string[] => [
  ...item.accepted.item.unsupported
    .filter((feature) => feature.shown === "notice")
    .map((feature) => feature.feature),
  ...item.kinds
    .filter((kind) => kind === "portable-custom")
    .map(() => "qti-portable-custom-interaction"),
];

/**
 * One response the page posts, with what the suite draws it from: its identifier, its correct
 * response, the identifiers its interaction offers, and its posting.
 */
type PostedDrawable = Drawable & { readonly posting: Posting };

/**
 * Give the responses a showing shows, by identifier: in solution the correct ones; under `given`
 * the source's, as the page's postings decode its entries, none when it gives none or an entry does
 * not decode; and under a derivation, those drawn from the correct responses ({@link derived}).
 *
 * @param item The item.
 * @param showing The showing.
 * @param drawables Each response the page posts, with its correct response.
 * @param posted The page's postings.
 * @returns The responses, or none.
 */
const valuesShown = (
  item: SourceItem,
  showing: Showing,
  drawables: readonly PostedDrawable[],
  posted: readonly Posting[],
): Option.Option<Readonly<Record<string, ResponseValue>>> => {
  if (showing.mode === "solution") {
    return Option.some(
      Object.fromEntries(drawables.map((each) => [each.identifier, each.correct])),
    );
  }

  if (showing.derived !== "given") {
    return derived(drawables, showing.derived);
  }

  return item.given.pipe(
    Option.flatMap(({ entries }) =>
      Result.getSuccess(
        Result.all(
          posted.map((posting) => {
            const own = entries.filter(([name]) => name === posting.binding.name);

            return decode(own, posting.binding, posting.options).pipe(
              Result.map((decoded) => [posting.identifier, decoded] as const),
            );
          }),
        ),
      ),
    ),
    Option.map((pairs) => Object.fromEntries(pairs)),
  );
};

/**
 * What a review that withholds the solution reveals of it, and one that shows it: the candidate's
 * own answers alone, or the whole correct response (`Reveals`).
 */
const revealed = {
  shown: "solution",
  withheld: "own",
} as const satisfies Readonly<Record<SolutionShown, Reveals>>;

/**
 * The record a review shows: the record the attempt starts from, with the responses drawn, the
 * attempt `submitted`. Its outcomes are the ones it starts with, since plate runs no response
 * processing; the QTI database's statement sets them in a host's review.
 *
 * @param before The record the attempt starts from.
 * @param values The responses drawn, by identifier, a record response's a record.
 * @returns The record.
 */
const attempted = (
  before: ItemRecord,
  values: Readonly<Record<string, ResponseValue>>,
): ItemRecord => {
  const entries = Object.entries(values);

  return {
    ...before,
    attempt: "submitted",
    records: {
      ...before.records,
      ...Object.fromEntries(
        entries.flatMap(([identifier, value]) =>
          value.cardinality === "record" ? [[identifier, value] as const] : [],
        ),
      ),
    },
    responses: {
      ...before.responses,
      ...Object.fromEntries(
        entries.flatMap(([identifier, value]) =>
          value.cardinality === "record" ? [] : [[identifier, value] as const],
        ),
      ),
    },
  };
};

/**
 * Show an item in one showing, as a host would: draw its responses from its correct ones by the
 * showing's derivation, post them in answering, restore them in review under the record the
 * attempt starts from, as a host restores the record the database returned, and render the page.
 *
 * @param item The item.
 * @param showing The showing.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name, which
 *   mark the islands.
 * @returns What the suite saw.
 */
export const see = (
  item: SourceItem,
  showing: Showing,
  clients: ReadonlyMap<unknown, string>,
): Seen => {
  const { accepted, configuration } = item;
  // The suite holds no database: the record a page shows is the take's (`taken`), else one that
  // holds each outcome the item declares at NULL, as the database's record holds an outcome no
  // processing set, so a page shows no outcome-driven content and withholds none.
  const record = Option.getOrElse(item.taken, () =>
    recordOf({
      outcomes: Object.fromEntries(
        Array.from(accepted.item.outcomes, ([identifier, declared]) => [
          identifier,
          { baseType: declared.baseType, cardinality: declared.cardinality, values: [] },
        ]),
      ),
    }),
  );
  // Every page shows the item's feedback by that record, as a host whose test states
  // `show-feedback="true"` shows it.
  const shownBy = { record, showFeedback: true } as const;
  const posted = postings(accepted, instance, shownBy);
  const correct: Responses = solution(accepted, record);
  const drawables = posted.map((posting) => ({
    correct: correct[posting.identifier] ?? nullOf(posting),
    identifier: posting.identifier,
    offered: item.offered.get(posting.identifier) ?? [],
    posting,
  }));
  const drawnValues = valuesShown(item, showing, drawables, posted);
  const drawn = Option.match(drawnValues, {
    onNone: (): readonly DrawnResponse[] => [],
    onSome: (values) =>
      drawables.map((each): DrawnResponse => {
        const value = values[each.identifier] ?? nullOf(each.posting);

        return {
          class: classOf(value, each.correct),
          correct: each.correct,
          posting: each.posting,
          value,
        };
      }),
  });
  const handed = Object.fromEntries(
    drawn.map((each) => [each.posting.identifier, handedMarks(each.value, each.correct)] as const),
  );
  const base = {
    described:
      showing.mode !== "solution" && showing.derived === "given" ? item.given : Option.none(),
    drawn,
    expectedNotices: noticedOf(item),
    itemClass: itemClassOf(drawn.map((each) => each.class)),
    kinds: item.kinds,
    showing,
  };
  const propsIn = (mode: ItemProps["mode"]): ItemProps => {
    const { stimuli } = item;
    const plain = Option.match(item.host, {
      onNone: (): ItemProps => ({
        ...shownBy,
        configuration,
        instance,
        item: accepted,
        mode,
        stimuli,
      }),
      onSome: (host): ItemProps => ({
        ...shownBy,
        configuration,
        host,
        instance,
        item: accepted,
        mode,
        stimuli,
      }),
    });

    return plain;
  };
  const rendered = (showable: Showable): Outcome =>
    Result.match(
      Result.try(() => render(showable, clients)),
      {
        onFailure: (cause): Outcome => ({ kind: "threw", reason: reasonOf(cause) }),
        onSuccess: (page): Outcome => ({ kind: "rendered", page }),
      },
    );

  if (Option.isNone(drawnValues)) {
    return { ...base, outcome: { kind: "underived" } };
  }

  const values = drawnValues.value;

  switch (showing.mode) {
    case "answering": {
      const entries = Option.match(
        item.given.pipe(Option.filter(() => showing.derived === "given")),
        {
          onNone: () =>
            drawn.flatMap(({ posting, value }) => encode(value, posting.binding, posting.options)),
          onSome: (given) => given.entries,
        },
      );

      return {
        ...base,
        outcome: rendered({ entries, mode: "answering", props: propsIn("answering") }),
      };
    }
    case "solution": {
      return {
        ...base,
        outcome: rendered({ mode: "solution", props: { ...propsIn("solution"), values } }),
      };
    }
    case "review": {
      // The suite holds no database, so nothing grades the drawn response: the record it reviews
      // is the one the page shows.
      const before = record;

      const restored = restore(accepted, attempted(before, values));
      const graded: Graded = {
        marks: { parts: handed, reveals: revealed[showing.solution] },
      };

      return {
        ...base,
        outcome: rendered({
          mode: "review",
          props: {
            ...propsIn("review"),
            graded,
            record: restored.record,
            values: restored.values,
          },
        }),
      };
    }
    default: {
      return showing satisfies never;
    }
  }
};

/**
 * A mark a review draws on an answer: `right`, `wrong`, or `missed`, a part of the correct response
 * the candidate did not give.
 */
type Mark = "missed" | "right" | "wrong";

/**
 * The marks a review that shows the solution may draw, by the class of the responses it shows: the
 * marks it never draws, and those of which it draws one whenever it draws any. A right response
 * shows nothing wrong or missing; a wrong one nothing right; an empty one nothing given, right or
 * wrong; a partly right one, which `match_correct` scores 0, never only right marks; and a response
 * with no correct response nothing.
 */
const marksByClass: Readonly<
  Record<ResponseClass, { readonly never: readonly Mark[]; readonly oneOfAny: readonly Mark[] }>
> = {
  empty: { never: ["right", "wrong"], oneOfAny: [] },
  partial: { never: [], oneOfAny: ["wrong", "missed"] },
  right: { never: ["wrong", "missed"], oneOfAny: [] },
  unjudged: { never: ["right", "wrong", "missed"], oneOfAny: [] },
  wrong: { never: ["right"], oneOfAny: [] },
};

/**
 * The marks a review may draw, by the class of the responses it shows and whether it shows the
 * solution: those {@link marksByClass} gives where it does; where it withholds it, never `missed`,
 * and no mark it must draw one of, since a partly right response whose only fault is a part left
 * out shows that part nowhere.
 *
 * @param responseClass The class of the responses the review shows.
 * @param shown Whether the review shows the solution.
 * @returns The marks it never draws, and those of which it draws one whenever it draws any.
 */
const marksAllowed = (
  responseClass: ResponseClass,
  shown: SolutionShown,
): { readonly never: readonly Mark[]; readonly oneOfAny: readonly Mark[] } => {
  const allowed = marksByClass[responseClass];

  return shown === "shown" ? allowed : { never: [...allowed.never, "missed"], oneOfAny: [] };
};

/**
 * Write a value as the form carries it, so two values compare by their text: its cardinality, base
 * type and values in order, each by its lexical form, or a record's fields in name order.
 *
 * @param value The value.
 * @returns Its text.
 */
const carriedText = (value: ResponseValue): string =>
  value.cardinality === "record"
    ? `record ${value.fields
        .map((field) => `${field.identifier}=${format(field.value)}`)
        .toSorted()
        .join(",")}`
    : `${value.cardinality} ${value.baseType} ${value.values.map(format).join(",")}`;

/**
 * Write a value for a failure message.
 *
 * @param value The value.
 * @returns Its lexical form.
 */
const shownValue = (value: ResponseValue): string =>
  value.cardinality === "record"
    ? `{${value.fields.map((field) => `${field.identifier}: ${format(field.value)}`).join(", ")}}`
    : `${value.cardinality} ${value.baseType} [${value.values.map(format).join(", ")}]`;

/**
 * Count the values a response holds, as M3 bounds the marks drawn on it: a record's none, since
 * `qti-match` judges no record and a review marks none.
 *
 * @param value The response.
 * @returns How many values it holds.
 */
const valuesHeld = (value: ResponseValue): number =>
  value.cardinality === "record" ? 0 : value.values.length;

/**
 * The marks a review draws on an answer, by the responses whose values bound how many of them a
 * part draws (M3): `right` and `wrong` by the shown responses, `missed` by the correct ones.
 */
const marksBoundBy = {
  correct: ["missed"],
  shown: ["right", "wrong"],
} as const satisfies Readonly<Record<"correct" | "shown", readonly Mark[]>>;

/**
 * Give the page a showing rendered, for a rule that reads pages: none for any other outcome, which
 * R1 judges.
 *
 * @param seen What the suite saw.
 * @returns The page, as a list of none or one.
 */
const pagesOf = (seen: Seen): readonly Page[] =>
  seen.outcome.kind === "rendered" ? [seen.outcome.page] : [];

/**
 * One way a page breaks a rule: what broke it, and where on the page it stands, an interaction's
 * kind or the item. An IDREF that names no id (I2) is `dangling` and carries its reference, which
 * a known finding holds by its attribute and id; every other offence is `said`, in words alone.
 */
export type Offence =
  | { readonly kind: "said"; readonly text: string; readonly where: Where }
  | {
      readonly kind: "dangling";
      readonly reference: Reference;
      readonly text: string;
      readonly where: Where;
    };

/**
 * The one island a review or a solution may ship (J1): plate's Media replay island, by its module
 * and export, as the island walk names it (`#specimen/ui/clients.ts`).
 */
const replayIsland = "ui/media/media.tsx#MediaReplay";

/**
 * Give an offence that stands in the item, outside any one interaction's parts.
 *
 * @param text What broke the rule.
 * @returns The offence.
 */
const inItem = (text: string): Offence => ({ kind: "said", text, where: "item" });

/**
 * Check P1 on one response: the entries the page posts under its name decode to the value drawn.
 *
 * @param posted The entries the page posts.
 * @param response The response drawn.
 * @returns What broke, none or one line.
 */
const postedOffences = (posted: readonly Entry[], response: DrawnResponse): readonly string[] => {
  const { binding, options } = response.posting;
  const entries = posted.filter(([name]) => name === binding.name);
  const absent =
    response.value.cardinality !== "record" && response.value.values.length === 0
      ? Option.fromUndefinedOr(options.absent)
      : Option.none();
  const expected = Option.getOrElse(absent, (): ResponseValue => response.value);
  const decoded = decode(entries, binding, options);

  return Result.match(decoded, {
    onFailure: (failure) => [
      `${response.posting.identifier}: posted ${JSON.stringify(entries)}, which does not decode: ${reasonOf(failure)}`,
    ],
    onSuccess: (value) =>
      carriedText(value) === carriedText(expected)
        ? []
        : [
            `${response.posting.identifier}: drew ${shownValue(expected)}, posted ${JSON.stringify(entries)}, which decodes to ${shownValue(value)}`,
          ],
  });
};

/**
 * A rule every page keeps: what it says, and its check of what the suite saw, which gives every
 * offence against it, none where it holds.
 */
export interface Rule {
  readonly check: (seen: Seen) => readonly Offence[];
  readonly says: string;
}

/**
 * The rules' names.
 */
export type RuleName = "A1" | "C1" | "I1" | "I2" | "J1" | "M1" | "M2" | "M3" | "N1" | "P1" | "R1";

/**
 * Every rule of plate's UI suite, by name, as the module's list states them.
 */
export const rules: Readonly<Record<RuleName, Rule>> = {
  A1: {
    check: (seen) =>
      pagesOf(seen).flatMap((page) =>
        page.facts.controls
          .filter((control) => control.name === "")
          .map((control): Offence => ({
            kind: "said",
            text: `no accessible name: <${control.element}>`,
            where: control.where,
          })),
      ),
    says: "every control a screen reader reaches has an accessible name",
  },
  C1: {
    check: (seen) =>
      seen.described.pipe(
        Option.filter(({ described }) => described === "empty"),
        Option.match({
          onNone: () => [],
          onSome: ({ entries }) =>
            seen.drawn.flatMap(({ posting }) => {
              const own = entries.filter(([name]) => name === posting.binding.name);

              return JSON.stringify(own) === JSON.stringify(posting.start)
                ? []
                : [
                    inItem(
                      `the source describes the response as empty, and ${posting.identifier} posts ${JSON.stringify(own)}, where it starts at ${JSON.stringify(posting.start)}`,
                    ),
                  ];
            }),
        }),
      ),
    says: "a response the item's source describes as empty posts what it starts at",
  },
  I1: {
    check: (seen) =>
      pagesOf(seen).flatMap((page) => {
        const seenIds = new Set<string>();

        return page.facts.ids.flatMap(({ id, where }) => {
          const twice = seenIds.has(id);

          seenIds.add(id);

          return [
            ...(twice
              ? [
                  {
                    kind: "said",
                    text: `id ${JSON.stringify(id)} is written twice`,
                    where,
                  } as const,
                ]
              : []),
            ...(id === "" || /\s/u.test(id)
              ? [
                  {
                    kind: "said",
                    text: `id ${JSON.stringify(id)} is empty or holds white space`,
                    where,
                  } as const,
                ]
              : []),
          ];
        });
      }),
    says: "every id is unique, not empty and holds no white space",
  },
  I2: {
    check: (seen) =>
      pagesOf(seen).flatMap((page) => {
        const ids = new Set(page.facts.ids.map(({ id }) => id));

        return page.facts.references
          .filter((reference) => !ids.has(reference.id))
          .map((reference): Offence => ({
            kind: "dangling",
            reference,
            text: `${reference.attribute} names ${JSON.stringify(reference.id)}, which no element on the page has: <${reference.element}>`,
            where: reference.where,
          }));
      }),
    says: "every IDREF the page writes names an id on the page",
  },
  J1: {
    check: (seen) => {
      if (seen.showing.mode === "answering") {
        return [];
      }

      const names = seen.drawn.map(({ posting }) => JSON.stringify(posting.binding.name));

      return pagesOf(seen).flatMap((page) => [
        ...page.islands.flatMap((island) => {
          // The props as the page receives them: React serializes an island's props, its server
          // elements among them, and a name stands in them as a JSON string.
          const shipped = JSON.stringify(island.props);

          return island.name === replayIsland && seen.kinds.includes("media")
            ? names
                .filter((name) => shipped.includes(name))
                .map((name) => inItem(`hands its replay island the entry name ${name}`))
            : [inItem(`ships the island ${island.name}`)];
        }),
        ...page.facts.posted.map(([name, text]) =>
          inItem(`posts the entry ${JSON.stringify(name)}=${JSON.stringify(text)}`),
        ),
      ]);
    },
    says: "review and solution ship no island but a Media's replay island, which posts nothing",
  },
  M1: {
    check: (seen) => {
      if (seen.showing.mode !== "review") {
        return [];
      }

      const allowed = marksAllowed(seen.itemClass, seen.showing.solution);

      return pagesOf(seen).flatMap(({ facts }) => {
        const marks = facts.marks.map(({ mark }) => mark);

        return [
          ...marks
            .filter((mark) => !["missed", "right", "wrong"].includes(mark))
            .map((mark) => inItem(`draws the mark ${JSON.stringify(mark)}, which is no mark`)),
          ...allowed.never
            .filter((mark) => marks.includes(mark))
            .map((mark) => inItem(`draws ${mark} on ${seen.itemClass} responses`)),
          ...(marks.length > 0 &&
          allowed.oneOfAny.length > 0 &&
          !marks.some((mark) => allowed.oneOfAny.some((each) => each === mark))
            ? [
                inItem(
                  `draws only ${[...new Set(marks)].join(", ")} on ${seen.itemClass} responses`,
                ),
              ]
            : []),
        ];
      });
    },
    says: "a review draws only the marks the shown responses' class allows, none missed where it withholds the solution",
  },
  M2: {
    check: (seen) => {
      if (seen.showing.mode !== "review") {
        return pagesOf(seen).flatMap(({ facts: { marks } }) =>
          marks.length === 0
            ? []
            : [
                inItem(
                  `draws the marks ${marks.map(({ mark }) => mark).join(", ")} outside a review`,
                ),
              ],
        );
      }

      return seen.showing.solution === "shown"
        ? []
        : pagesOf(seen).flatMap(({ facts: { marks } }) =>
            marks.some(({ mark }) => mark === "missed")
              ? [
                  inItem(
                    `reveals a correct response the candidate did not give: draws missed with the solution withheld`,
                  ),
                ]
              : [],
          );
    },
    says: "no page draws a mark but a review, and a review that withholds the solution marks only the candidate's own response, never revealing a correct response",
  },
  M3: {
    check: (seen) => {
      if (seen.showing.mode !== "review") {
        return [];
      }

      const held = {
        correct: seen.drawn.reduce((total, each) => total + valuesHeld(each.correct), 0),
        shown: seen.drawn.reduce((total, each) => total + valuesHeld(each.value), 0),
      };

      return pagesOf(seen).flatMap(({ facts: { marks } }) => {
        const answers = marks.filter(({ on, read }) => on === "answer" && read);

        return [...new Set(answers.map(({ slot }) => slot))].flatMap((slot) =>
          (["shown", "correct"] as const).flatMap((side) => {
            const drawn = answers.filter(
              (each) => each.slot === slot && marksBoundBy[side].some((mark) => mark === each.mark),
            ).length;

            return drawn > held[side]
              ? [
                  inItem(
                    `${slot} draws ${String(drawn)} marks ${marksBoundBy[side].join(" or ")}, where the ${side} responses hold ${String(held[side])} values`,
                  ),
                ]
              : [];
          }),
        );
      });
    },
    says: "a review tells each value once in each part a screen reader reaches: no such part draws more right or wrong marks than the shown responses hold values, nor more missed than the correct responses hold",
  },
  N1: {
    check: (seen) =>
      pagesOf(seen).flatMap((page) => {
        const left = [...seen.expectedNotices];

        return page.facts.notices.flatMap((notice) => {
          const at = left.findIndex((feature) => notice.includes(feature));

          if (at === -1) {
            return [inItem(`an unexpected notice: ${notice}`)];
          }

          left.splice(at, 1);

          return [];
        });
      }),
    says: "no notice appears but one naming a feature the verdict shows as one, or a Portable Custom Interaction with no host facts",
  },
  P1: {
    check: (seen) =>
      seen.showing.mode === "answering"
        ? pagesOf(seen).flatMap((page) =>
            seen.drawn.flatMap((response) =>
              postedOffences(page.facts.posted, response).map(inItem),
            ),
          )
        : [],
    says: "in answering, the entries the form posts decode to the responses drawn",
  },
  R1: {
    check: (seen) =>
      seen.outcome.kind === "threw" ? [inItem(`throws ${seen.outcome.reason}`)] : [],
    says: "the item renders without throwing",
  },
};
