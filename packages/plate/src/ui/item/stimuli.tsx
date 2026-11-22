/**
 * Shared stimuli in the server shell: each stimulus an item references, written from its own
 * document beside the item's body, in the stimulus pane, or inside the body element that names it.
 * "An assessment stimulus object is the used to enable content to be shared by several Assessment
 * Items. The key feature is that this shared stimulus content must be supplied in the same context
 * for each of the Assessment Items that make use of it" (information model §4.3). So a stimulus is
 * written the same beside every item and in every mode: its own body, walked by the body walk under
 * its own location, its own heading offset and its own scope of ids, so its URLs resolve against
 * its own document and none of its ids meets the item's or another stimulus's; and its own catalog,
 * whose cards only its body names (§4.3.10; "catalog ids within assessment content files (items,
 * sections, stimulus, parts/tests) MUST be unique. Be aware that there may be
 * referenced/included/nested content (like a shared stimulus or rubric blocks) that may also
 * include catalogs and could be on the same delivery presentation screen", implementation guide
 * §3.7.10.2), presented as an item's are: a glossary card beside its term, read-aloud's control
 * before each block naming a spoken card that gives audio while the candidate answers, and every
 * other kept card listed after the stimulus's body. Where it stands. "In this example it is left to
 * the delivery platform to determine the stimulus rendering location within the qti-item-body"
 * (guide §3.7.7): plate's is the stimulus pane, `plate-stimuli`, before the item's own content,
 * which then stands in `plate-question`, so the theme lays the passage beside the question with a
 * scroll of its own. "To improve interoperability, it is possible to be more prescriptive about the
 * placement of the shared stimulus within an qti-item-body ... Placement of the stimulus is
 * specified through the use of a <div> (any QTI 3 HTML5 qti-item-body element may be used) with a
 * reference to the identifier of the shared stimulus by means of a data-stimulus-idref attribute"
 * (the same section): a stimulus whose ref's identifier the first body element that takes flow
 * content names so is written inside that element, after its children, and not in the pane.
 * Accessibility. The pane is a region named `Passage` and the item's own content one named
 * `Question` (`messages/content.ts`), so a screen reader moves between the two by its landmarks, as
 * the guide's two-column example does by its two visually hidden headings ("so that AT users can
 * quickly 'jump' back and forth between the stimulus and stem", §3.8.1.1); the pane is in the tab
 * order, so a keyboard scrolls it when the theme gives it a scroll of its own (WCAG 2.1.1). Each
 * stimulus is an `article`, a composition complete in itself, named by its `title` and in its own
 * `xml:lang` ("The default language for the Stimulus", §4.3.4), its headings shifted so its
 * shallowest lands at the configured heading level, as the item's do: the host owns `h1` ("items or
 * shared stimulus (e.g. reading passages) use h2 and lower heading levels", guide §5.1.7).
 *
 * @module
 */
import { Option } from "effect";
import { createElement } from "react";
import type { Key, ReactNode } from "react";
import { copyItemContent, itemContentNodes } from "#plate/content/modules.ts";
import type { ItemPayloadsHeld } from "#plate/content/modules.ts";
import { scopedId } from "#plate/form/encoding.ts";
import { message } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import type { BodyElement, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import { redactStimulus } from "#plate/redact/walk.ts";
import type { RedactedStimulus, RedactOptions } from "#plate/redact/walk.ts";
import {
  elementsIn,
  headingOffsetOf,
  missingInNodes,
  noSlots,
  nodesOf,
} from "#plate/ui/item/content.tsx";
import type { Walk } from "#plate/ui/item/content.tsx";
import {
  glossaryOf,
  listing,
  missingInCatalog,
  noReadAloud,
  readAloudOf,
} from "#plate/ui/item/contents/catalog.tsx";
import { StimulusMissing, UnrenderedNode } from "#plate/ui/item/errors.ts";
import { takesFlow } from "#plate/ui/item/html.ts";
import type { Addressing } from "#plate/ui/item/html.ts";
import type { RenderMode } from "#plate/payload.ts";
import type { AcceptedStimulus } from "#plate/validate/verdict.ts";

/**
 * One stimulus the page shows with the item: the identifier of the ref that names it, the scope its
 * ids are written under, what the page may know of it, and its catalogs as the page is given them.
 */
export interface ShownStimulus {
  /**
   * Its catalogs' payload nodes, the copy of what the redaction kept under the supports.
   */
  readonly catalogs: ItemPayloadsHeld["qti-catalog-info"];
  /**
   * The `identifier` of the item's stimulus ref that names it, which a body element's
   * `data-stimulus-idref` places it by.
   */
  readonly identifier: string;
  /**
   * The scope its ids are written under, `<instance>-stimulus-<n>` by the ref's place among the
   * item's refs: a segment no other id of plate's starts with, so an author's `id` in it never
   * meets the item's own `<instance>--<id>` or another stimulus's.
   */
  readonly instance: string;
  readonly redacted: RedactedStimulus;
}

/**
 * Give the stimuli an item's refs name, each in the ref's order with the stimulus the host handed
 * for its target, redacted under the item's own options.
 *
 * @param refs The item's stimulus refs, as its payload holds them.
 * @param stimuli The accepted stimuli the host handed `<Item>`.
 * @param options The output budget, the supports and the view the item is redacted under.
 * @param item The item's location and identifier, which a refusal names.
 * @param instance The item's instance, which each stimulus's scope of ids extends.
 * @returns The stimuli shown, in the refs' order.
 * @throws {StimulusMissing} When a ref's target is a stimulus the host handed none of.
 */
export const shownStimuli = (
  refs: ItemPayloadsHeld["qti-assessment-stimulus-ref"],
  stimuli: readonly AcceptedStimulus[],
  options: RedactOptions,
  item: { readonly document: string; readonly identifier: string },
  instance: string,
): readonly ShownStimulus[] => {
  const byDocument = new Map(
    stimuli.map((accepted) => [accepted.stimulus.document, accepted.stimulus] as const),
  );

  return refs.map((ref, index): ShownStimulus => {
    const stimulus = byDocument.get(ref.target);
    if (stimulus === undefined) {
      throw new StimulusMissing({
        document: item.document,
        item: item.identifier,
        path: ref.target,
      });
    }

    const redacted = redactStimulus(stimulus, options);

    return {
      catalogs: copyItemContent({
        "qti-assessment-stimulus-ref": [],
        "qti-catalog-info": redacted.content["qti-catalog-info"],
        "qti-companion-materials-info": [],
      })["qti-catalog-info"],
      identifier: ref.identifier,
      instance: scopedId(instance, "stimulus", index),
      redacted,
    };
  });
};

/**
 * Give every body node a stimulus writes: its body, then its kept cards' content.
 *
 * @param shown The stimulus.
 * @returns The nodes, in order.
 */
const nodesWritten = (shown: ShownStimulus): readonly RedactedNode[] => [
  ...shown.redacted.body,
  ...itemContentNodes({
    "qti-assessment-stimulus-ref": [],
    "qti-catalog-info": shown.catalogs,
    "qti-companion-materials-info": [],
  }),
];

/**
 * Find the first file a stimulus names that `assets` gives no address: in its body, a MathML
 * formula's own URLs among it, and in its kept cards' content and files, each resolved against the
 * stimulus's own location, so `<Item>` refuses the item before it writes any of it.
 *
 * @param shown The stimulus.
 * @param assets The address of each file, by its path from the package root.
 * @returns The file's path from the package root, or undefined when every file has an address.
 */
export const missingInStimulus = (
  shown: ShownStimulus,
  assets: Addressing["assets"],
): string | undefined => {
  const addressing = { assets, document: shown.redacted.document };

  return (
    missingInNodes(nodesWritten(shown), addressing) ?? missingInCatalog(shown.catalogs, addressing)
  );
};

/**
 * Give where each stimulus placed in the body stands: the first element of the body that takes flow
 * content and whose `data-stimulus-idref`, its outer XML whitespace removed, is a shown stimulus's
 * ref identifier, in document order, each stimulus once. An element at a phrasing position, such as
 * a `span`, could hold none of a stimulus's blocks, so it places none.
 *
 * @param body The item's redacted body.
 * @param stimuli The stimuli shown.
 * @returns Each placed stimulus by the element it stands in.
 */
export const placementsOf = (
  body: readonly RedactedNode[],
  stimuli: readonly ShownStimulus[],
): ReadonlyMap<BodyElement<RedactedLevel>, ShownStimulus> => {
  const byIdentifier = new Map(stimuli.map((shown) => [shown.identifier, shown] as const));
  const placed = new Map<BodyElement<RedactedLevel>, ShownStimulus>();
  const taken = new Set<string>();

  for (const element of elementsIn(body, false)) {
    const idref = element.stimulus === undefined ? undefined : trimXmlSpace(element.stimulus);
    const shown = idref === undefined ? undefined : byIdentifier.get(idref);
    if (shown !== undefined && takesFlow(element.tag) && !taken.has(shown.identifier)) {
      taken.add(shown.identifier);
      placed.set(element, shown);
    }
  }

  return placed;
};

/**
 * The defect of a stimulus walk that meets a part only an item's body holds: a stimulus declares no
 * response, so its body walk gave each interaction its notice, and it holds no module's container.
 *
 * @param detail What the walk met.
 * @returns Never: it throws {@link UnrenderedNode}.
 */
const noItemPart = (detail: string): never => {
  throw new UnrenderedNode({ detail: `${detail} in a stimulus's body` });
};

/**
 * What a stimulus is written under beside the stimulus itself: the item's `assets`, the locale,
 * the configured heading level and the mode, which decides whether read-aloud's controls stand.
 */
export interface StimulusSetting {
  readonly assets: Addressing["assets"];
  readonly headingLevel: number;
  readonly locale: Locale;
  readonly mode: RenderMode;
}

/**
 * Write one stimulus: its `plate-stimulus` article, named by its `title` and in its `xml:lang`,
 * holding its body as the body walk writes it under the stimulus's own location, heading offset
 * and scope of ids, with its glossary and read-aloud, then the listing of its other kept cards.
 *
 * @param shown The stimulus.
 * @param setting What it is written under.
 * @param key Its key among its siblings.
 * @returns The `plate-stimulus` part.
 */
export const stimulusArticle = (
  shown: ShownStimulus,
  setting: StimulusSetting,
  key: Key,
): ReactNode => {
  const { redacted } = shown;
  const addressing: Addressing = {
    assets: setting.assets,
    document: redacted.document,
    instance: shown.instance,
    writing: "original",
  };
  const outside: Walk = {
    addressing,
    credit: Option.none(),
    headingOffset: headingOffsetOf(nodesWritten(shown), setting.headingLevel),
    locale: setting.locale,
    scope: { kind: "plain" },
    slots: noSlots,
    standing: "flow",
  };

  return createElement(
    "article",
    {
      "aria-label": redacted.title,
      "data-slot": "plate-stimulus",
      key,
      lang: Option.getOrUndefined(redacted.lang),
    },
    ...nodesOf(redacted.body, {
      ...outside,
      scope: {
        answer: () => noItemPart("an interaction's answer"),
        container: (node) => noItemPart(`a container of ${node.module}`),
        glossary: glossaryOf(shown.catalogs, redacted.body, addressing, setting.locale),
        interaction: (interaction) => noItemPart(`a ${interaction.kind} interaction`),
        kind: "body",
        readAloud:
          setting.mode === "answering" ? readAloudOf(shown.catalogs, addressing) : noReadAloud,
        stimulus: () => Option.none(),
        verdict: Option.none(),
      },
    }),
    listing(shown.catalogs, redacted.body, (nodes) => nodesOf(nodes, outside), addressing),
  );
};

/**
 * Write the stimulus pane, `plate-stimuli`: a region named `Passage`, in the tab order, holding the
 * stimuli no body element places, in their refs' order; nothing when every stimulus is placed or
 * the item references none.
 *
 * @param stimuli The stimuli the pane holds.
 * @param setting What they are written under.
 * @returns The `plate-stimuli` part, or none.
 */
export const stimulusPane = (
  stimuli: readonly ShownStimulus[],
  setting: StimulusSetting,
): Option.Option<ReactNode> =>
  stimuli.length === 0
    ? Option.none()
    : Option.some(
        createElement(
          "section",
          {
            "aria-label": message(setting.locale, "stimuli"),
            "data-slot": "plate-stimuli",
            key: "stimuli",
            tabIndex: 0,
          },
          ...stimuli.map((shown, index) => stimulusArticle(shown, setting, index)),
        ),
      );
