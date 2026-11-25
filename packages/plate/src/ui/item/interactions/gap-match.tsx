/**
 * Gap Match (Q-9) in the server shell: what renders a `qti-gap-match-interaction`'s payload node,
 * its island in `answering` (`#plate/ui/gap-match/gap-match.tsx`) and its server markup in `review`
 * and `solution`.
 *
 * The island takes the gap texts as presented and the sentence through the shell's walk, a `Gap`
 * standing wherever a gap the payload shows does, numbered in document order. The review shows the
 * bank, and the sentence with each gap holding the gap text the response puts there, each pair
 * marked by the host's marks, so the child reviews the gaps filled in context. Both know a
 * gap where the walk meets its element by the element's path, so neither reads a `qti-gap`'s
 * attributes.
 *
 * @module
 */
import { Option } from "effect";
import type { ReactNode } from "react";
import type { GapElement } from "#plate/interactions/gap-match.ts";
import { countsOf } from "#plate/interactions/counts.ts";
import type { BodyElement, RedactedLevel } from "#plate/model/item.ts";
import type { Paired } from "#plate/payload.ts";
import { flag } from "#plate/ui/attributes.ts";
import { Gap, GapMatch } from "#plate/ui/gap-match/gap-match.tsx";
import { gapMatchKeys } from "#plate/ui/gap-match/labels.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { associableOf } from "#plate/ui/item/interactions/answering.tsx";
import {
  bankChipPart,
  bankedOf,
  chipPart,
  missedOf,
  pairsByTarget,
} from "#plate/ui/item/interactions/chips.tsx";
import { limitOf } from "#plate/placement/limit.ts";
import {
  bankCaptionOf,
  groupNameOf,
  labelsOf,
  promptAt,
  rootOf,
} from "#plate/ui/item/interactions/labels.ts";
import { BankCaption } from "#plate/ui/placement/caption.tsx";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import { fillLabel } from "#plate/ui/labels.ts";

/**
 * One gap the payload shows, as the walk meets its element: the gap, and its place among the gaps
 * shown, from 0, which numbers it.
 */
interface GapAt {
  readonly gap: GapElement;
  readonly index: number;
}

/**
 * Key the gaps the payload shows by their elements' paths, so the walk's `own` finds the gap it
 * meets; an element of no gap shown is no gap, and the walk drops it.
 *
 * @param gaps The gaps the payload shows, in document order.
 * @returns Each gap and its place, by its element's path.
 */
const gapsAt = (gaps: readonly GapElement[]): ReadonlyMap<string, GapAt> =>
  new Map(gaps.map((gap, index) => [gap.path, { gap, index }]));

/**
 * Render a Gap Match's island: the gap texts as presented, and the sentence through the shell's
 * walk, a {@link Gap} standing wherever a shown `qti-gap` does, numbered in document order.
 *
 * @param paired The Gap Match.
 * @param paired.model Its model node: `max-associations` and the author's
 *   `data-max-selections-message`.
 * @param paired.payload Its payload: its gap texts as presented, its sentence and the names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"gap-match">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);
  const gapAt = gapsAt(node.gaps);
  const own = (element: BodyElement<RedactedLevel>): ReactNode => {
    const shown = gapAt.get(element.path);

    return shown === undefined ? undefined : (
      <Gap key={shown.gap.identifier} identifier={shown.gap.identifier} index={shown.index} />
    );
  };

  return (
    <GapMatch
      caption={bankCaptionOf(context, Option.some("bankCaption"))}
      gapTexts={node.choices.map((choice, index) =>
        associableOf(choice, { count: node.choices.length, n: index + 1 }, "phrasing", context),
      )}
      gaps={node.gaps.map(({ identifier, matchGroup }) => ({ identifier, matchGroup }))}
      labels={labelsOf(gapMatchKeys, context.locale, { totalReached: model.messages.max })}
      maxAssociations={limitOf(model.maxAssociations)}
      naming={groupNameOf(prompt, node, context)}
      prompt={prompt}
      response={node.declared}
      root={rootOf(model, context)}
    >
      {context.content(node.content, { own, position: "flow", readAloud: context.readAloud })}
    </GapMatch>
  );
};

/**
 * Render a Gap Match's review: its bank, and its sentence with each gap holding the gap text the
 * response puts there, each pair marked when the review marks, so the child reviews the gaps
 * filled in context, as QTI asks (QTI 3.0 information model 5.57).
 *
 * @param paired The Gap Match.
 * @param paired.payload Its payload: its gap texts as presented, its sentence and the pairs it
 *   shows.
 * @param context What the shell knows.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"gap-match">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const byGap = pairsByTarget(node.pairs, markingOf(node.response, context));
  const unplaced = missedOf(byGap);
  const uses = countsOf(node.pairs.map((pair) => pair.chip));
  const gapName = labelsOf(gapMatchKeys, locale, {}).gap;
  const texts = new Map(
    node.choices.map((choice) => [
      choice.identifier,
      context.content(choice.content, { position: "phrasing" }),
    ]),
  );
  const gapAt = gapsAt(node.gaps);
  const own = (element: BodyElement<RedactedLevel>): ReactNode => {
    const shown = gapAt.get(element.path);

    if (shown === undefined) {
      return undefined;
    }

    const number = shown.index + 1;
    const chips = byGap.get(shown.gap.identifier) ?? [];

    return (
      <span key={shown.gap.identifier} data-slot="plate-gap">
        <span
          aria-label={fillLabel(gapName, { n: number })}
          data-empty={flag(chips.length === 0)}
          data-slot="plate-placement-target"
          role="group"
        >
          {chips.map((chip, at) =>
            chipPart(
              texts.get(chip.identifier),
              chip.mark,
              `${chip.identifier} ${String(at)}`,
              locale,
            ),
          )}
        </span>
      </span>
    );
  };

  return (
    <div
      {...rootOf(model, context)}
      {...groupNameOf(prompt, node, context)}
      data-slot="plate-gap-match"
      role="group"
    >
      <PromptPart prompt={prompt} />
      <div data-slot="plate-placement">
        <div data-slot="plate-placement-dock">
          <BankCaption caption={bankCaptionOf(context, Option.some("bankCaption"))} />
          <div data-slot="plate-placement-bank">
            {node.choices.map((choice) =>
              bankChipPart(
                texts.get(choice.identifier),
                bankedOf(
                  choice.matchMax,
                  uses.get(choice.identifier) ?? 0n,
                  unplaced.has(choice.identifier),
                ),
                choice.identifier,
                locale,
              ),
            )}
          </div>
        </div>
        {context.content(node.content, { own, position: "flow", readAloud: context.readAloud })}
      </div>
    </div>
  );
};
