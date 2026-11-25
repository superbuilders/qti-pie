/**
 * Plate's UI suite over shared stimuli: every corpus item that references a stimulus, shown as a
 * host shows it with its stimuli, keeps the rules of a shared stimulus, each read from the page's
 * HTML against a table written by hand from the corpus documents and the specification, never from
 * plate's code.
 *
 * The rules, from QTI 3.0.1:
 *
 * - SP1, the place: "In this example it is left to the delivery platform to determine the stimulus
 *   rendering location within the qti-item-body" (implementation guide §3.7.7), so an item no body
 *   element of which places its stimulus shows it in the stimulus pane, a region named `Passage` in
 *   the tab order (WCAG 2.1.1), one article per ref, and its own content beside it in a region
 *   named `Question` (the guide's §3.8.1.1: "so that AT users can quickly 'jump' back and forth
 *   between the stimulus and stem"); and "Placement of the stimulus is specified through the use of
 *   a <div> ... with a reference to the identifier of the shared stimulus by means of a
 *   data-stimulus-idref attribute" (§3.7.7), so an item that places it writes the article inside
 *   that element and shows no pane.
 * - SP2, the stimulus whole: "the shared stimulus content must be supplied in the same context for
 *   each of the Assessment Items that make use of it" (information model §4.3), so the article is
 *   named by the stimulus's `title`, written in its `xml:lang` ("The default language for the
 *   Stimulus", §4.3.4), holds its passage's text, and its picture at the address of the file its
 *   `src` names from the stimulus's own directory; and it is the same markup in every item and
 *   every mode but for the ids the item's instance scopes.
 * - SP3, its headings: "items or shared stimulus (e.g. reading passages) use h2 and lower heading
 *   levels" (guide §5.1.7), so its shallowest heading is at the configured level, 2.
 * - SP4, its catalog: "The alternative accessibility information that is to be associated with the
 *   content in the stimulus body" (§4.3.10) stays dormant until the host enables its support, and
 *   then its card stands inside the stimulus's article.
 *
 * The suite reads the corpus, as the corpus suite does (`#specimen/ui/corpus.ts`).
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Option } from "effect";
import { parseHTML } from "linkedom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { solution, startingResponses } from "@qti-pie/plate";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import { corpusItems } from "#specimen/ui/corpus.ts";
import { instance } from "#specimen/ui/rules.ts";
import type { SourceItem } from "#specimen/ui/rules.ts";

/**
 * One corpus stimulus as its document writes it, read by hand: its `title`, its `xml:lang`, a
 * sentence of its passage, its first picture's file from the corpus root (its `src` resolved from
 * the stimulus's directory), and its catalog card's text.
 */
interface WrittenStimulus {
  readonly card: string;
  readonly lang: string;
  readonly picture: string;
  readonly sentence: string;
  readonly title: string;
}

/**
 * The Best Practice guide's passage, `QTI3_BPIG_Examples/passages/unbelievableNight.xml` and its
 * copy in the guide's zip.
 *
 * @param root The folder its package stands in.
 * @returns The stimulus as written.
 */
const bpigPassage = (root: string): WrittenStimulus => ({
  card: "Anina is the name of a girl.",
  lang: "en",
  picture: `${root}/passages/images/exemplarSection01_title.png`,
  sentence: "Anina was ten years old",
  title: "An Unbelievable Night",
});

/**
 * The shared stimulus example's passage, `qtiv3-examples/packaging/sharedStimulus/passages/
 * unbelievableNight.xml` and its copy in the example's zip.
 *
 * @param root The folder its package stands in.
 * @returns The stimulus as written.
 */
const exemplarPassage = (root: string): WrittenStimulus => ({
  card: "Anina is the name of a girl.",
  lang: "eng",
  picture: `${root}/passages/images/exemplarSection01_title.png`,
  sentence: "Anina was ten years old",
  title: "Common Stimulus",
});

/**
 * What the table holds of one corpus item that references a stimulus: the stimulus it names, and
 * whether a body element of it places the stimulus (`data-stimulus-idref`).
 */
interface WrittenItem {
  readonly placed: boolean;
  readonly stimulus: WrittenStimulus;
}

/**
 * The folders the Best Practice guide's package stands in: the corpus's and its zip's.
 */
const bpigRoots = ["QTI3_BPIG_Examples", "QTI3_BPIG_Examples/BPIG_22April.zip.d"] as const;

/**
 * The folders the shared stimulus example's package stands in: the corpus's and its zip's.
 */
const exemplarRoots = [
  "qtiv3-examples/packaging/sharedStimulus",
  "qtiv3-examples/packaging/sharedStimulus/sharedStimulus.zip.d",
] as const;

/**
 * Every corpus item that references a stimulus, by its path from the corpus root: the guide's three
 * items, the second placing the passage in its body, and the example's `exemplar04.xml` and
 * `exemplar05.xml`, the second placing it so too, each in both of its package's folders. The
 * example's `exemplar06.xml` writes SSML in a catalog card, which plate leaves unchecked, so no
 * host shows it and the corpus holds no item of it.
 */
const written: ReadonlyMap<string, WrittenItem> = new Map([
  ...bpigRoots.flatMap((root) =>
    [1, 2, 3].map(
      (n) =>
        [
          `${root}/items/unbelievable_night_item${String(n)}.xml`,
          { placed: n === 2, stimulus: bpigPassage(root) },
        ] as const,
    ),
  ),
  ...exemplarRoots.flatMap((root) =>
    [4, 5].map(
      (n) =>
        [
          `${root}/exemplar0${String(n)}.xml`,
          { placed: n === 5, stimulus: exemplarPassage(root) },
        ] as const,
    ),
  ),
]);

/**
 * A showing of a stimulus item: in answering, or in the solution, plain server markup; with no
 * support enabled, or with the stimulus card's support, `linguistic-guidance`.
 */
const showings = [
  "answering, no support",
  "answering, linguistic guidance",
  "solution, no support",
  "solution, linguistic guidance",
] as const;

/**
 * A showing's name.
 */
type ShowingName = (typeof showings)[number];

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render calls no handler.
};

/**
 * The catalog supports a showing with the stimulus card's support enables: `linguistic-guidance`.
 */
const guidance: NonNullable<ItemProps["supports"]>["catalog"] = new Set([
  "linguistic-guidance",
] as const);

/**
 * Render an item in a showing as a host does, with the stimuli its refs name.
 *
 * @param item The item.
 * @param showing The showing.
 * @returns The page's document.
 */
const pageOf = (item: SourceItem, showing: ShowingName): Document => {
  const supports: NonNullable<ItemProps["supports"]> = {
    braille: Option.none(),
    catalog: showing.endsWith("linguistic guidance") ? guidance : new Set(),
    display: { invertDisplayPolarity: false, keywordEmphasis: false, magnification: Option.none() },
    keywordTranslationLanguage: Option.none(),
    readAloud: Option.none(),
    signLanguage: Option.none(),
  };
  const shown = {
    configuration: item.configuration,
    instance,
    item: item.accepted,
    showFeedback: false,
    stimuli: item.stimuli,
    supports,
  } as const;
  const html = showing.startsWith("answering")
    ? renderToStaticMarkup(
        createElement(Responses, {
          children: createElement(Item, {
            ...shown,
            mode: "answering",
            renderers: standardRenderers,
          }),
          onChange: keepNothing,
          value: heldOf(startingResponses(item.accepted, shown)),
        }),
      )
    : renderToStaticMarkup(
        createElement(Item, {
          ...shown,
          mode: "solution",
          renderers: standardRenderers,
          values: solution(item.accepted, { correct: {} }),
        }),
      );

  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document;
};

/**
 * The address the corpus configuration gives a file of the corpus (`#specimen/ui/corpus.ts`).
 *
 * @param file The file's path from the corpus root.
 * @returns Its address.
 */
const corpusAddress = (file: string): string =>
  `/corpus/${file.split("/").map(encodeURIComponent).join("/")}`;

/**
 * The markup of an article with the item's instance taken out of its ids, so two items' articles
 * compare as the stimulus they show.
 *
 * @param article The article.
 * @returns Its outer HTML, every id and IDREF under the instance written without it.
 */
const unscoped = (article: Element): string => article.outerHTML.replaceAll(instance, "");

describe("plate's UI over the corpus's shared stimuli", () => {
  it.effect(
    "every item that references a stimulus shows it whole, beside its question or where its body places it, in every showing",
    (ctx) =>
      Effect.gen(function* stimulusShowings() {
        const items = (yield* corpusItems).filter((item) => written.has(item.location));
        assert.deepStrictEqual(
          [...written.keys()].filter(
            (location) => !items.some((item) => item.location === location),
          ),
          [],
          "every stimulus item of the table is an accepted corpus item",
        );
        assert.strictEqual(
          items.length,
          written.size,
          "every stimulus item of the table is an accepted corpus item",
        );

        const firstMarkup = new Map<string, string>();
        const [first, ...rest] = items.flatMap((item) =>
          showings.map((showing) => ({ item, showing })),
        );
        assert.isDefined(first, "the corpus holds stimulus items");

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "every corpus item that references a stimulus, in answering and in the solution, with no support and with the stimulus card's",
              caseHang: Duration.seconds(30),
              coverage: requiredInSpace<"pane" | "placed">(["pane", "placed"]),
              generator: element([first, ...rest]),
              literal: ({ item, showing }) => `${item.location}, ${showing}`,
              oracle: {
                kind: "specification",
                name: "information model §4.3, §4.3.4, §4.3.10 and §7.6, implementation guide §3.7.7, §3.8.1.1 and §5.1.7, with the corpus documents read by hand",
              },
              suite: "plate-ui/stimuli",
            },
            ({ item, showing }, c) =>
              Effect.sync(() => {
                const expected = written.get(item.location);
                assert.isDefined(expected);

                const { placed, stimulus } = expected;
                c.note(placed ? "placed" : "pane");

                const page = pageOf(item, showing);
                const root = page.querySelector('[data-slot="plate-item"]');
                assert.isNotNull(root, "the item renders");

                const pane = page.querySelector('[data-slot="plate-stimuli"]');
                const question = page.querySelector('[data-slot="plate-question"]');
                const articles = [...page.querySelectorAll('[data-slot="plate-stimulus"]')];

                // SP1: the place.
                assert.lengthOf(articles, 1, "one article for the item's one ref");

                const [article] = articles;
                assert.isDefined(article);
                if (placed) {
                  assert.isNull(pane, "a placed stimulus stands in no pane");
                  assert.isNull(question, "an item with no pane wraps none of its content");
                  assert.strictEqual(
                    article.parentElement?.dataset["stimulusIdref"],
                    "Stimulus1",
                    "the article stands in the element that names its ref",
                  );
                } else {
                  assert.isNotNull(pane);
                  assert.isNotNull(question);
                  assert.strictEqual(pane.tagName.toLowerCase(), "section");
                  assert.strictEqual(pane.getAttribute("aria-label"), "Passage");
                  assert.strictEqual(pane.getAttribute("tabindex"), "0");
                  assert.strictEqual(question.getAttribute("aria-label"), "Question");
                  assert.strictEqual(pane.parentElement, root, "the pane is the item's own part");
                  assert.strictEqual(question.parentElement, root);
                  assert.strictEqual(article.parentElement, pane);
                  assert.isNull(question.querySelector('[data-slot="plate-stimulus"]'));
                }

                // SP2: the stimulus whole, in its own title, language, text and picture.
                assert.strictEqual(article.tagName.toLowerCase(), "article");
                assert.strictEqual(article.getAttribute("aria-label"), stimulus.title);
                assert.strictEqual(article.getAttribute("lang"), stimulus.lang);
                assert.include(article.textContent.replaceAll(/\s+/gu, " "), stimulus.sentence);
                assert.strictEqual(
                  article.querySelector("img")?.getAttribute("src"),
                  corpusAddress(stimulus.picture),
                );

                // SP3: its headings start at the configured level.
                const levels = [...article.querySelectorAll("h1, h2, h3, h4, h5, h6")].map(
                  (heading) => Number(heading.tagName.slice(1)),
                );
                assert.strictEqual(Math.min(...levels), 2);

                // SP4: its card, dormant until its support is enabled, then inside its article.
                const enabled = showing.endsWith("linguistic guidance");
                const card = article.querySelector('[data-support="linguistic-guidance"]');
                if (enabled) {
                  assert.isNotNull(card, "the enabled card stands in the stimulus's article");
                  assert.include(card.textContent, stimulus.card);
                } else {
                  assert.isNull(
                    card,
                    "a card of a support the host did not enable never reaches the page",
                  );
                }

                if (question !== null) {
                  assert.notInclude(
                    question.textContent,
                    stimulus.card,
                    "no card of the stimulus stands in the item's own content",
                  );
                }

                // SP2: the same markup in every item and showing of the same support.
                const key = `${stimulus.title}|${stimulus.picture}|${String(enabled)}`;
                const markup = unscoped(article);
                const earlier = firstMarkup.get(key);
                if (earlier === undefined) {
                  firstMarkup.set(key, markup);
                } else {
                  assert.strictEqual(
                    markup,
                    earlier,
                    "the stimulus is supplied in the same context for every item",
                  );
                }
              }),
          ),
        );
      }),
  );
});
