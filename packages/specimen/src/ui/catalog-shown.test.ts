/**
 * Plate's UI suite over the catalogs content the page is not given names: plate's item of
 * `@qti-pie/plate/test/catalog-shown`, whose feedback block, feedback inline, template block,
 * template-shown choice and scorer's rubric block each name a catalog of their own, rendered while
 * the candidate answers with no record, so the page shows no feedback and no template content,
 * under every set of the supports whose card the page draws or carries.
 *
 * - CS1, no card the page is not given: no card of a catalog only such content names stands in the
 *   page's markup or in the props of any island it ships. Feedback's content "is only shown to the
 *   candidate if the associated outcome variable" matches (information model §5.53), so nothing of
 *   it, a card that glosses, translates, guides or narrates its words among it, reaches the page
 *   before then.
 * - CS2, the cards the page is given: the paragraph's catalog keeps its card under each support the
 *   page draws, beside its term or in the listing after the body, so CS1 is seen to read a page
 *   that writes cards.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { subset } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Effect, Option } from "effect";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, configure, startingResponses } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
import {
  cardText,
  catalogIds,
  keptByRule,
  shownCatalogsLocation,
  shownCatalogsXml,
  supportsHeld,
} from "@qti-pie/plate/test/catalog-shown";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import { clientExports } from "#specimen/ui/clients.ts";
import { islandsIn } from "#specimen/ui/rendered.ts";
import { boxHolds } from "#specimen/test/box.ts";

/**
 * The supports a host enables for one candidate, `<Item>`'s `supports`.
 */
type Supports = NonNullable<ItemProps["supports"]>;

/**
 * One catalog support the item's catalogs hold a card of.
 */
type HeldSupport = (typeof supportsHeld)[number];

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {};

/**
 * The supports of a candidate who enables catalog supports and nothing else.
 *
 * @param names The catalog supports enabled.
 * @returns The supports.
 */
const enabling = (names: readonly HeldSupport[]): Supports => ({
  braille: Option.none(),
  catalog: new Set(names),
  display: { invertDisplayPolarity: false, keywordEmphasis: false, magnification: Option.none() },
  keywordTranslationLanguage: Option.none(),
  readAloud: Option.none(),
  signLanguage: Option.none(),
});

/**
 * Render the item while the candidate answers, with no record and no feedback shown.
 *
 * @param supports The supports enabled.
 * @returns The page's HTML and the props of every island it ships, as JSON.
 */
const page = Effect.fnUntraced(function* page(supports: Supports) {
  const verdict = yield* admitted(
    shownCatalogsLocation,
    new TextEncoder().encode(shownCatalogsXml),
  );
  const accepted = yield* Effect.fromOption(acceptedItem(verdict)).pipe(Effect.orDie);
  const configuration = yield* configure({ seed: "catalog-shown" }).pipe(Effect.orDie);
  const clients = yield* clientExports;
  const props: ItemProps = {
    configuration,
    instance: "suite",
    item: accepted,
    mode: "answering",
    showFeedback: false,
    supports,
  };
  const item = createElement(Item, { ...props, renderers: standardRenderers });
  const html = renderToStaticMarkup(
    createElement(Responses, {
      children: item,
      onChange: keepNothing,
      value: heldOf(startingResponses(accepted, props)),
    }),
  );
  /**
   * The props as the page receives them: React serializes an island's props, its server elements
   * among them, and a card's text stands in them as a JSON string.
   */
  const shipped = islandsIn(item, clients).map((island) => JSON.stringify(island.props));

  return { html, shipped };
});

/**
 * Draw a support set of the box: every set of one to all of {@link supportsHeld}, in their order.
 */
const supportSets: Gen<readonly HeldSupport[]> = subset(supportsHeld, {
  max: supportsHeld.length,
  min: 1,
});

/**
 * How many support sets {@link supportSets} draws: every non-empty set of the four, 2 to the 4
 * less the empty one.
 */
const SUPPORT_SETS = 2 ** 4 - 1;

/**
 * The catalogs no part of the answering page names: every catalog the rule does not keep when no
 * record shows feedback or template content.
 */
const notGiven = catalogIds.filter((id) => !keptByRule("hidden").includes(id));

describe("catalogs content the page is not given names", () => {
  it.effect(
    `CS1-CS2 under every set of the supports a catalog holds a card of: ${String(SUPPORT_SETS)} sets`,
    (ctx) =>
      Effect.andThen(
        boxHolds(supportSets, SUPPORT_SETS),
        searched(
          ctx,
          exhaust(
            {
              box: "every non-empty set of glossary-on-screen, keyword-translation, linguistic-guidance and spoken",
              caseHang: "2 minutes",
              coverage: noCoverage,
              generator: supportSets,
              literal: (names) => JSON.stringify(names),
              oracle: {
                kind: "specification",
                name: "QTI 3.0.1 information model §5.53: feedback's content is shown only once its outcome variable matches, so no card of a catalog only feedback, template content or another view's rubric names stands in the answering page's markup or an island's props (CS1); the paragraph's catalog keeps its card under each support the page draws (CS2)",
              },
              suite: "plate-ui/catalog-shown",
            },
            (names) =>
              Effect.gen(function* notShown() {
                const { html, shipped } = yield* page(enabling(names));

                for (const id of notGiven) {
                  for (const support of supportsHeld) {
                    const text = cardText(id, support);
                    assert.notInclude(html, text, `CS1: the markup holds ${text}`);
                    assert.isTrue(
                      shipped.every((props) => !props.includes(text)),
                      `CS1: an island's props hold ${text}`,
                    );
                  }
                }

                for (const support of names.filter((name) => name !== "spoken")) {
                  assert.include(html, cardText("paragraph", support), `CS2: ${support}`);
                }
              }),
          ),
        ),
      ),
  );
});
