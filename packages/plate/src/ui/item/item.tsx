/**
 * Plate's server shell: `<Item>`, a React Server Component that writes an opened item's whole
 * body as server React elements and hands each interaction to its island, or, in review and
 * solution, to its plain server markup, a Media to its replay island, which posts nothing.
 *
 * The host renders it on the server and passes it as `children` to its own client form, which
 * wraps it in `<Responses value onChange>` (`@qti-pie/plate/ui/client`). It holds no state, renders
 * no `Responses`, fetches nothing and suspends on nothing. It builds the page from plate's own
 * redaction, so nothing an item withholds (a correct response, a mapping, hidden feedback, a
 * template value it does not print) reaches the page, and everything QTI decides (the seeded
 * shuffle, each response's declaration, the feedback and template content the record shows, the
 * printed variables) is the core's.
 *
 * @module
 */
import { Option } from "effect";
import type { Key, ReactNode } from "react";
import { defaultView } from "#plate/content/contract.ts";
import { copyItemContent, itemContentNodes } from "#plate/content/modules.ts";
import type { ItemPayloadsHeld } from "#plate/content/modules.ts";
import { checkInstance, scopedId } from "#plate/instance.ts";
import { message } from "#plate/messages.ts";
import { redactedInteractionsIn } from "#plate/model/interactions.ts";
import type { Interaction, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { interactionPayload } from "#plate/payload.ts";
import type { PairedInteraction, View } from "#plate/payload.ts";
import { redact } from "#plate/redact.ts";
import type { Redacted } from "#plate/redact/walk.ts";
import { noSupports } from "#plate/supports.ts";
import {
  feedbackOf,
  firstFeedbackIn,
  headingOffsetOf,
  missingInNodes,
  noSlots,
  noSpoken,
  nodesOf,
  spokenIn,
  spokenInCells,
} from "#plate/ui/item/content.tsx";
import type { InteractionAt, VerdictAt, Walk } from "#plate/ui/item/content.tsx";
import {
  glossaryOf,
  listing,
  missingInCatalog,
  noReadAloud,
  readAloudOf,
} from "#plate/ui/item/contents/catalog.tsx";
import {
  companionMaterials,
  missingInMaterials,
} from "#plate/ui/item/contents/companion-materials.tsx";
import type { ContentOptions, ReviewContext, Shows } from "#plate/ui/item/context.ts";
import { AssetMissing, InvalidInstance, OutputTooLarge } from "#plate/ui/item/errors.ts";
import { feedbackBlockOf, verdictOf } from "#plate/ui/item/feedback.tsx";
import type { Addressing } from "#plate/ui/item/html.ts";
import {
  renderAfter,
  renderAnswer,
  renderContainer,
  renderInteraction,
} from "#plate/ui/item/interactions/index.tsx";
import {
  missingInStimulus,
  placementsOf,
  shownStimuli,
  stimulusArticle,
  stimulusPane,
} from "#plate/ui/item/stimuli.tsx";
import type { ShownStimulus, StimulusSetting } from "#plate/ui/item/stimuli.tsx";
import type { Renderers } from "#plate/ui/registry/contract.ts";
import type { ItemProps } from "#plate/ui/props.ts";
import { ReadAloudItem } from "#plate/ui/read-aloud/session.tsx";
import { carriedClass } from "#plate/vocabulary.ts";

/**
 * Give a record keyed by identifier as the map a view holds.
 *
 * @param record The record, none when absent.
 * @returns Its entries as a map, empty when absent.
 */
const mapOf = <A,>(record: Readonly<Record<string, A>> = {}): ReadonlyMap<string, A> =>
  new Map(Object.entries(record));

/**
 * Build the view each interaction's payload node is given by from the props: the configuration's
 * seed, and the host's facts, the empty record when it gave none.
 *
 * @param props The props.
 * @returns The view.
 */
const viewOf = (props: ItemProps): View => ({
  host: props.host ?? {},
  instance: props.instance,
  seed: props.configuration.seed,
  values: mapOf(props.values),
});

/**
 * Give what a render shows of each response: in `solution` the correct responses; in `review`, and
 * in `answering`, whose islands read none of it, the candidate's answers with the marks the host
 * handed, none where it handed none.
 *
 * @param props The props: the mode and what the host graded.
 * @returns What the render shows.
 */
const showsOf = (props: Pick<ItemProps, "graded" | "mode">): Shows =>
  props.mode === "solution"
    ? { kind: "solution" }
    : { kind: "answers", marks: Option.fromUndefinedOr(props.graded?.marks) };

/**
 * Check everything `<Item>` refuses, before it renders any of the item.
 *
 * @param props The props.
 * @param redacted The redacted item.
 * @param content The payload nodes of its item-placed content, each module's `copy` of a node
 *   the redaction kept.
 * @param stimuli The stimuli it shows, each of whose files is looked up against its own location.
 * @throws {InvalidInstance} When the instance breaks a requirement of `checkInstance`.
 * @throws {OutputTooLarge} When a printed variable on content the page shows printed nothing.
 * @throws {AssetMissing} When a package URL in what the page shows names a file `assets` gives no
 *   address: in the body, an interaction's content, a modal feedback, a content module's node, a
 *   MathML formula's own URLs among them, a catalog card's content or files, a companion
 *   material's file or icon, or anything a stimulus shows, its document's location then named.
 */
const refuse = (
  props: ItemProps,
  redacted: Redacted,
  content: ItemPayloadsHeld,
  stimuli: readonly ShownStimulus[],
): void => {
  const breach = checkInstance(props.instance);

  if (Option.isSome(breach)) {
    throw new InvalidInstance({ breach: breach.value, token: props.instance });
  }

  if (Option.isSome(redacted.unprinted)) {
    const { bound, identifier, limit } = redacted.unprinted.value;

    throw new OutputTooLarge({ bound, identifier, item: redacted.identifier, limit });
  }

  const { document } = redacted;
  const addressing = { assets: props.configuration.assets, document };
  const path =
    missingInNodes(
      [
        ...redacted.body,
        ...redacted.modalFeedback.flatMap((feedback) => feedback.content),
        ...itemContentNodes(content),
      ],
      addressing,
    ) ??
    missingInCatalog(content["qti-catalog-info"], addressing) ??
    missingInMaterials(content["qti-companion-materials-info"], addressing);

  if (path !== undefined) {
    throw new AssetMissing({ document, item: redacted.identifier, path });
  }

  for (const shown of stimuli) {
    const missing = missingInStimulus(shown, props.configuration.assets);

    if (missing !== undefined) {
      throw new AssetMissing({
        document: shown.redacted.document,
        item: redacted.identifier,
        path: missing,
      });
    }
  }
};

/**
 * Give the author's `class` on an interaction, as written.
 *
 * @param paired The interaction and its payload node.
 * @returns Its class, none when absent.
 */
const classOf = (paired: PairedInteraction): Option.Option<string> => paired.payload.class;

/**
 * Render an opened item: its body, as server React elements, then each modal feedback the record
 * shows, inside the item's root.
 *
 * The parts it writes:
 *
 * - `plate-item`, the root, a `div` with the scoped id `<instance>-item`, the item's `lang`,
 *   `data-mode` naming the mode, and `data-keyword-emphasis` when the host enabled the candidate's
 *   keyword emphasis (A-23), under which the stylesheet emphasises the body's
 *   `qti-keyword-emphasis` text, and `data-hotspot-list` and `data-hotspot-picks`, the
 *   configuration's `hotspotList` and `hotspotPicks`, by which the stylesheet shows a Hotspot's
 *   list of areas and its picked areas;
 * - `plate-companion-materials`, before the body, an `aside` listing the materials the item says the
 *   candidate may use, each with the data attributes a host reads to supply it
 *   (`#plate/ui/item/contents/companion-materials.tsx`);
 * - The body, element for element as the author wrote it, within the XSD's HTML subset: `class`,
 *   `lang` (`xml:lang`), `dir`, ARIA and an author's `data-*` kept, every id and IDREF scoped
 *   `<instance>--<id>`, each package URL written as its address in `assets`, headings shifted to
 *   the configuration's `headingLevel`, each run of a table's rows in a `tbody`;
 * - `plate-notice`, a note in place of each part plate does not render;
 * - `plate-glossary`, the disclosure of a catalog's `glossary-on-screen` card after the block of each
 *   term of the body that references the catalog, `plate-read-aloud`, in `answering`, read-aloud's
 *   control for a catalog's `spoken` card that gives audio, after each element of the body at a
 *   flow position, each prompt and beside each choice that references the catalog, every one of the
 *   item's in one read-aloud session keyed by the instance, in which each plays its own part alone
 *   at its own press (`#plate/ui/read-aloud/session.tsx`), and `plate-catalog`, after the body, the
 *   listing of every other card the supports the host enabled keep but a spoken card, which is
 *   never drawn on the page (`#plate/ui/item/contents/catalog.tsx`);
 * - Each interaction, through its kind's renderer in `renderers`: in `answering` its island inside
 *   its own `<Suspense fallback={null}>`, a hydration unit that suspends on nothing; in `review`
 *   and `solution` its server markup, with no boundary;
 * - In `answering`, after the body, the island each interaction's renderer writes there, in the order
 *   of the interactions (`renderAfter` in `#plate/ui/item/interactions/index.tsx`): plate's Text
 *   Entry renderer writes its on-screen keypad (`plate-text-entry-keypad`) where the host's
 *   `textEntryKeypad` is `on-screen` and its response has keys;
 * - `plate-feedback`, feedback the record shows (`feedbackOf` in `#plate/ui/item/content.tsx`): one
 *   `div` in place of each run of adjacent feedback blocks, each block a `plate-feedback-block`,
 *   the item's explanation after its title (`plate-feedback-why`), and one after the body for the
 *   modal feedback, each a `plate-feedback-block` `section` named by its `title` through
 *   `aria-label` when it has one. Where the host graded the attempt a credit, the review's verdict
 *   (`plate-verdict`) heads the first of them, the one holding the body's first feedback block at a
 *   flow position, else the one after the body, which then stands even where the page shows no
 *   feedback; and each carries the credit as `data-credit` (`full`, `partial` or `none`). Its words
 *   are the item's own, but for the verdict and the explanation's title
 *   (`#plate/ui/item/feedback.tsx`).
 *
 * Feedback blocks and inlines, template blocks and inlines, and printed variables are the
 * redaction's: what the record shows stands in place, a feedback block in its part, and what it
 * hides is not there. Where the host says the page shows no feedback (`showFeedback` `false`, the
 * test's `show-feedback`), no feedback block, inline or modal feedback is there at all.
 *
 * @example
 *   <Item
 *     item={accepted}
 *     configuration={configuration}
 *     instance="sitting-42.1"
 *     mode="answering"
 *     renderers={standardRenderers}
 *     showFeedback={false}
 *   />;
 *
 * @param props The item, the configuration, the instance, the mode and the database's results,
 *   with `renderers`, the renderer of every interaction kind as the host composed them once at its
 *   root: plate's `standardRenderers`, or `renderersOf` them with extensions
 *   (`#plate/ui/registry/compose.ts`). It is required, and has no default, so every host names the
 *   renderers it draws with.
 * @returns The item's root.
 * @throws {InvalidInstance} When the instance breaks a requirement of `checkInstance`.
 * @throws {OutputTooLarge} When a printed variable on content the page shows printed nothing,
 *   since its text passed its bound.
 * @throws {AssetMissing} When a package URL in what the page shows names a file the
 *   configuration's `assets` gives no address.
 */
export const Item = (props: ItemProps & { readonly renderers: Renderers }): ReactNode => {
  const { configuration, instance, item, mode, renderers } = props;
  const supports = props.supports ?? noSupports;
  const { keywordEmphasis } = supports.display;
  const redacted = redact(
    item,
    { configuration, supports, view: props.view ?? defaultView },
    props,
  );
  const credit = Option.fromUndefinedOr(props.graded?.credit);
  const itemContent = copyItemContent(redacted.content);
  const stimuli = shownStimuli(
    itemContent["qti-assessment-stimulus-ref"],
    props.stimuli ?? [],
    { configuration, supports, view: props.view ?? defaultView },
    props.showFeedback,
    redacted,
    instance,
  );

  refuse(props, redacted, itemContent, stimuli);

  const view = viewOf(props);
  const addressing: Addressing = {
    assets: configuration.assets,
    document: redacted.document,
    instance,
    writing: "original",
  };
  const headingOffset = headingOffsetOf(
    [
      ...redacted.body,
      ...redacted.modalFeedback.flatMap((feedback) => feedback.content),
      ...itemContentNodes(itemContent),
    ],
    configuration.headingLevel,
  );
  const content = (nodes: readonly RedactedNode[], options: ContentOptions = {}): ReactNode => {
    const position = options.position ?? "phrasing";
    const walk: Walk = {
      addressing: { ...addressing, writing: options.writing ?? "original" },
      credit,
      headingOffset,
      locale: configuration.locale,
      scope: options.own === undefined ? { kind: "plain" } : { kind: "owned", own: options.own },
      slots: noSlots,
      spoken:
        options.readAloud === undefined
          ? noSpoken
          : spokenIn(nodes, options.readAloud, configuration.locale),
      standing: position === "flow" ? "flow" : "phrasing-only",
    };

    return nodesOf(nodes, walk);
  };
  const shared = {
    bankCaption: configuration.bankCaption,
    body: redacted.body,
    content,
    instance,
    locale: configuration.locale,
    shows: showsOf(props),
    stimulus: stimuli.length > 0,
    textEntryKeypad: configuration.textEntryKeypad,
    values: mapOf(props.values),
  };
  const catalogs = itemContent["qti-catalog-info"];
  // Read-aloud presents a spoken card's recording while the candidate answers alone: a review's and
  // a solution's page ships no island but a Media's replay.
  const readAloud = mode === "answering" ? readAloudOf(catalogs, addressing) : noReadAloud;
  const contextOf = (paired: PairedInteraction): ReviewContext => ({
    ...shared,
    className: carriedClass(paired.kind, classOf(paired), supports),
    readAloud,
    spokenPrompt: paired.model.promptCatalog.pipe(
      Option.flatMap((catalog) =>
        readAloud(catalog, message(configuration.locale, "readAloudPrompt"), "read-aloud"),
      ),
    ),
  });
  const interaction: InteractionAt = (model: Interaction<RedactedLevel>, key: Key) => {
    const paired = interactionPayload(model, view);

    return renderInteraction(renderers, paired, contextOf(paired), mode, key);
  };
  const answer: InteractionAt = (model: Interaction<RedactedLevel>, key: Key) => {
    const paired = interactionPayload(model, view);

    return renderAnswer(renderers, paired, contextOf(paired), mode, key);
  };
  // What each interaction writes after the body while the child answers, in the order of the
  // interactions, a Text Entry's on-screen keypad among them: below everything the child reads, so
  // the keys never split a sentence or an equation, never stand over the box, a line or a picture,
  // and never come between the box and a line after it. A review and a solution write none.
  const afterBody =
    mode === "answering"
      ? redactedInteractionsIn(redacted.body).map((model, index) => {
          const paired = interactionPayload(model, view);

          return renderAfter(renderers, paired, contextOf(paired), `after-${String(index)}`);
        })
      : [];
  const outside: Walk = {
    addressing,
    credit,
    headingOffset,
    locale: configuration.locale,
    scope: { kind: "plain" },
    slots: noSlots,
    spoken: noSpoken,
    standing: "flow",
  };
  const verdict = credit.pipe(Option.map((earned) => verdictOf(earned, configuration.locale)));
  const verdictAt = verdict.pipe(
    Option.flatMap((part) =>
      firstFeedbackIn(redacted.body).pipe(Option.map((at): VerdictAt => ({ at, part }))),
    ),
  );
  const setting: StimulusSetting = {
    assets: configuration.assets,
    headingLevel: configuration.headingLevel,
    locale: configuration.locale,
    mode,
  };
  const placements = placementsOf(redacted.body, stimuli);
  const placed = new Set(placements.values());
  const pane = stimulusPane(
    stimuli.filter((shown) => !placed.has(shown)),
    setting,
  );
  // The verdict after the body, where no feedback block of the body holds it: at the head of the
  // modal feedback, else alone.
  const verdictAfter = Option.isSome(verdictAt) ? [] : Option.toArray(verdict);
  const after = [
    ...verdictAfter,
    ...redacted.modalFeedback.flatMap((feedback, index) =>
      feedbackBlockOf(
        "section",
        index,
        false,
        feedback.title,
        configuration.locale,
        nodesOf(feedback.content, outside),
      ),
    ),
  ];

  // The item's own content: its companion materials, its body, its catalog's listing and its
  // feedback, which stand in `plate-question` beside the stimulus pane where the item shows one.
  const own = (
    <>
      {companionMaterials(
        itemContent["qti-companion-materials-info"],
        addressing,
        configuration.locale,
        configuration.headingLevel,
      )}
      {nodesOf(redacted.body, {
        ...outside,
        scope: {
          answer,
          container: renderContainer(mode, view),
          glossary: glossaryOf(catalogs, redacted.body, addressing, configuration.locale),
          interaction,
          kind: "body",
          readAloud,
          stimulus: (element) =>
            Option.map(Option.fromUndefinedOr(placements.get(element)), (shown) =>
              stimulusArticle(shown, setting, "stimulus"),
            ),
          verdict: verdictAt,
        },
        spoken: spokenInCells(redacted.body, readAloud, configuration.locale),
      })}
      {afterBody}
      {listing(catalogs, redacted.body, (nodes) => nodesOf(nodes, outside), addressing)}
      {after.length === 0 ? null : feedbackOf("div", "feedback", outside, after)}
    </>
  );

  const shown = Option.match(pane, {
    onNone: () => own,
    onSome: (stimuliPane) => (
      <>
        {stimuliPane}
        <section aria-label={message(configuration.locale, "question")} data-slot="plate-question">
          {own}
        </section>
      </>
    ),
  });

  return (
    <div
      data-hotspot-list={configuration.hotspotList}
      data-hotspot-picks={configuration.hotspotPicks}
      data-keyword-emphasis={keywordEmphasis ? "" : undefined}
      data-mode={mode}
      data-slot="plate-item"
      id={scopedId(instance, "item")}
      lang={Option.getOrUndefined(redacted.lang)}
    >
      {mode === "answering" ? (
        // One read-aloud session per item session, so nothing of one item's carries into another's.
        <ReadAloudItem
          failed={{
            description: message(configuration.locale, "readAloudFailed"),
            title: message(configuration.locale, "readAloudFailedTitle"),
          }}
          key={instance}
        >
          {shown}
        </ReadAloudItem>
      ) : (
        shown
      )}
    </div>
  );
};
