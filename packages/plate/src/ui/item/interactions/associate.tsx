/**
 * Associate (Q-1) in the server shell: what renders a `qti-associate-interaction`'s payload node,
 * its island in `answering` (`#plate/ui/associate/associate.tsx`) and its server markup in `review`
 * and `solution`, both from the payload node alone, as the core's `redact` gave it.
 *
 * A pair is unordered, "so (A,B) and (B,A) are equivalent" (QTI 3.0 information model 8.13): a
 * review marks a box right where the correct response holds its two choices in either order, and
 * shows each box with its choices as the response wrote them.
 *
 * @module
 */
import { Option } from "effect";
import type { ReactNode } from "react";
import { countsOf } from "#plate/interactions/counts.ts";
import type { PayloadOf } from "#plate/model/interactions.ts";
import type { Paired } from "#plate/payload.ts";
import { Associate } from "#plate/ui/associate/associate.tsx";
import { associateKeys } from "#plate/ui/associate/labels.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { contentOf, spokenOf } from "#plate/ui/item/interactions/answering.tsx";
import { limitOf } from "#plate/ui/item/interactions/facts.ts";
import { groupNameOf, labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { bankChipPart, bankedOf } from "#plate/ui/item/interactions/chips.tsx";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import { boxesShown } from "#plate/ui/item/interactions/pair-boxes.ts";
import { markPart, wordsOfMark } from "#plate/ui/item/interactions/words.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import { chipName } from "#plate/content/text.ts";
import { halfName } from "#plate/ui/placement/associable.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";

/**
 * An Associate's payload node, as its module's `redact` gave it.
 */
type AssociateNode = PayloadOf<"associate">;

/**
 * Give an Associate's choices as its island takes them, in the order the payload presents them:
 * each one's content written where phrasing content stands, since a chip is a button, with the
 * name plate gives a choice whose content shows no text ("Choice 2 of 5"), its `match-group`
 * and `match-max`, and its read-aloud.
 *
 * @param node The Associate's payload: its choices as presented.
 * @param context What the shell knows: its content walk, the locale and read-aloud.
 * @returns The choices.
 */
const choicesOf = (
  node: Pick<AssociateNode, "choices">,
  context: Pick<IslandContext, "content" | "locale" | "readAloud">,
): readonly AssociableChoice[] =>
  node.choices.map((choice, index) => ({
    content: contentOf(choice.content, "phrasing", context),
    identifier: choice.identifier,
    label: chipName(
      choice.content,
      Option.none(),
      { count: node.choices.length, n: index + 1 },
      context.locale,
    ),
    matchGroup: choice.matchGroup,
    matchMax: limitOf(choice.matchMax),
    ...spokenOf(choice, index + 1, "readAloudChoice", context),
  }));

/**
 * Render an Associate's island.
 *
 * @param paired The Associate and its payload node.
 * @param paired.payload Its payload node: its choices as presented, `max-associations` and the
 *   names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"associate">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <Associate
      choices={choicesOf(node, context)}
      labels={labelsOf(associateKeys, context.locale, {})}
      maxAssociations={limitOf(node.maxAssociations)}
      name={node.formName}
      naming={groupNameOf(prompt, node, context)}
      prompt={prompt}
      root={rootOf(model, context)}
    />
  );
};

/**
 * Render an Associate's review or solution: its bank, and a box for each pair the response holds,
 * each pair marked when the review marks, the correct pairs not given after them, `missed`.
 *
 * The markup is the island's parts, without the empty box a new pair begins in: `plate-associate`,
 * `plate-prompt`, `plate-placement`, its bank of `plate-placement-chip`s (`data-copies` where a
 * choice's `match-max` is not 1, `data-used` once it is in as many pairs as that allows), and
 * `plate-placement-boxes`, each `plate-placement-box` `data-paired`, with its `data-mark` and its
 * mark's words in `review` by the host's marks, holding its two halves, each a
 * `plate-placement-target` named as the island names it ("Pair n, first", "Pair n, second") with
 * its choice's `plate-placement-chip`.
 *
 * @param paired The Associate and its payload node.
 * @param paired.payload Its payload node: its choices as presented and the pairs it shows, the candidate's in
 *   `review` and the correct ones in `solution`.
 * @param context What the shell knows of the item and the render.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"associate">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const contents = new Map(
    node.choices.map((choice) => [
      choice.identifier,
      context.content(choice.content, { position: "phrasing" }),
    ]),
  );
  const boxes = boxesShown(node.pairs, markingOf(node.response, context));
  const labels = labelsOf(associateKeys, locale, {});
  const uses = countsOf(node.pairs.flat());
  const missed = new Set(boxes.flatMap((box) => (box.mark === "missed" ? box.pair : [])));

  return (
    <div
      {...rootOf(model, context)}
      {...groupNameOf(prompt, node, context)}
      data-slot="plate-associate"
      role="group"
    >
      <PromptPart prompt={prompt} />
      <div data-slot="plate-placement">
        <div data-slot="plate-placement-dock">
          <div data-slot="plate-placement-bank">
            {node.choices.map((choice) =>
              bankChipPart(
                contents.get(choice.identifier),
                bankedOf(
                  choice.matchMax,
                  uses.get(choice.identifier) ?? 0n,
                  missed.has(choice.identifier),
                ),
                choice.identifier,
                locale,
              ),
            )}
          </div>
        </div>
        <ol data-slot="plate-placement-boxes" role="list">
          {boxes.map(({ mark, pair }, index) => (
            // A box is a place, not an item: its place is its key.
            <li key={index} data-mark={mark} data-paired="" data-slot="plate-placement-box">
              {([0, 1] as const).map((side) => (
                // A half is a place too, the first or the second.
                <div
                  key={side}
                  aria-label={halfName(labels, { box: index, side })}
                  data-slot="plate-placement-target"
                  role="group"
                >
                  <span data-slot="plate-placement-chip">{contents.get(pair[side])}</span>
                </div>
              ))}
              {markPart(wordsOfMark(mark), locale)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
