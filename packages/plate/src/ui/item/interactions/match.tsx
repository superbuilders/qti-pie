/**
 * Match (Q-8) in the server shell: what renders a `qti-match-interaction`'s payload node, its
 * island in `answering` (`#plate/ui/match/match.tsx`) and its server markup in `review` and
 * `solution`.
 *
 * The island takes the first set's choices as its chips and the second's as its groups, each as
 * presented, `max-associations` and the author's `data-max-selections-message` in place of the
 * catalog's. The review shows the bank under the author's `data-first-column-header`, and each
 * group holding the chips the response puts there, each pair marked by the host's marks.
 *
 * @module
 */
import { Option } from "effect";
import type { ReactNode } from "react";
import { scopedId } from "#plate/form/encoding.ts";
import { countsOf } from "#plate/interactions/counts.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import type { PayloadOf } from "#plate/model/interactions.ts";
import type { Paired } from "#plate/payload.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { associableOf, contentOf, spokenOf } from "#plate/ui/item/interactions/answering.tsx";
import {
  bankChipPart,
  bankedOf,
  chipPart,
  missedOf,
  pairsByTarget,
} from "#plate/ui/item/interactions/chips.tsx";
import { limitOf } from "#plate/ui/item/interactions/facts.ts";
import { groupNameOf, labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import { chipName, shownText } from "#plate/ui/item/interactions/text.ts";
import type { Place } from "#plate/ui/item/interactions/text.ts";
import { matchKeys } from "#plate/ui/match/labels.ts";
import { Match } from "#plate/ui/match/match.tsx";
import type { MatchHeader, MatchTarget } from "#plate/ui/match/match.tsx";

/**
 * Give a choice of a Match's second set as the island takes it, a group: its content written where
 * flow content stands, its limits, and its name, the text its content shows, or, for content that
 * shows none, the name plate gives it ("Choice 2 of 5"), which its group then carries as its
 * `aria-label`, and its read-aloud.
 *
 * @param target The choice, as the payload presents it.
 * @param place Its place among the second set as presented.
 * @param context What the shell knows: its content walk, the locale and read-aloud.
 * @returns The group.
 */
const targetOf = (
  target: PayloadOf<"match">["targets"][number],
  place: Place,
  context: Pick<IslandContext, "content" | "locale" | "readAloud">,
): MatchTarget => {
  const label = chipName(target.content, Option.none(), place, context.locale);

  return {
    content: contentOf(target.content, "flow", context),
    identifier: target.identifier,
    matchGroup: target.matchGroup,
    matchMax: limitOf(target.matchMax),
    name:
      label === undefined
        ? { by: "label-part", text: shownText(target.content, context.locale) }
        : { by: "aria-label", text: label },
    ...spokenOf(target, place.n, "readAloudGroup", context),
  };
};

/**
 * Give a Match's bank heading, the author's `data-first-column-header` where it is written and not
 * blank (5.89.6), under the id the island and the review both name the bank by.
 *
 * @param node The Match's payload: its header as written and its response.
 * @param context What the shell knows: the instance, which scopes the id.
 * @returns The heading, undefined where the author wrote none.
 */
const headerOf = (
  node: Pick<PayloadOf<"match">, "firstColumnHeader" | "response">,
  context: Pick<IslandContext, "instance">,
): MatchHeader | undefined =>
  Option.getOrUndefined(
    node.firstColumnHeader.pipe(
      Option.filter((written) => trimXmlSpace(written) !== ""),
      Option.map((text) => ({ id: scopedId(context.instance, node.response, "header"), text })),
    ),
  );

/**
 * Render a Match's island: the first set's choices as the chips, the second's as the groups, each
 * as presented.
 *
 * @param paired The Match.
 * @param paired.model Its model node: the author's `data-max-selections-message`.
 * @param paired.payload Its payload: its sets as presented, `max-associations` and the names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"match">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <Match
      header={headerOf(node, context)}
      labels={labelsOf(matchKeys, context.locale, { totalReached: model.messages.max })}
      maxAssociations={limitOf(node.maxAssociations)}
      name={node.formName}
      naming={groupNameOf(prompt, node, context)}
      prompt={prompt}
      root={rootOf(model, context)}
      sources={node.sources.map((source, index) =>
        associableOf(
          { ...source, label: Option.none() },
          { count: node.sources.length, n: index + 1 },
          "phrasing",
          context,
        ),
      )}
      targets={node.targets.map((target, index) =>
        targetOf(target, { count: node.targets.length, n: index + 1 }, context),
      )}
    />
  );
};

/**
 * Render a Match's review: its bank, under the author's `data-first-column-header` as its visible
 * heading when there is one (5.89.6), and each group holding the chips the response puts there,
 * each pair marked when the review marks.
 *
 * @param paired The Match.
 * @param paired.payload Its payload: its sets as presented and the pairs it shows.
 * @param context What the shell knows.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"match">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const byTarget = pairsByTarget(node.pairs, markingOf(node.response, context));
  const unplaced = missedOf(byTarget);
  const uses = countsOf(node.pairs.map((pair) => pair.chip));
  const header = headerOf(node, context);
  const sources = new Map(
    node.sources.map((source) => [
      source.identifier,
      context.content(source.content, { position: "phrasing" }),
    ]),
  );

  return (
    <div
      {...rootOf(model, context)}
      {...groupNameOf(prompt, node, context)}
      data-slot="plate-match"
      role="group"
    >
      <PromptPart prompt={prompt} />
      <div data-slot="plate-placement">
        {header === undefined ? null : (
          <div data-slot="plate-match-header" id={header.id}>
            {header.text}
          </div>
        )}
        <div data-slot="plate-placement-dock">
          <div
            {...(header === undefined ? {} : { "aria-labelledby": header.id, role: "group" })}
            data-slot="plate-placement-bank"
          >
            {node.sources.map((source) =>
              bankChipPart(
                sources.get(source.identifier),
                bankedOf(
                  source.matchMax,
                  uses.get(source.identifier) ?? 0n,
                  unplaced.has(source.identifier),
                ),
                source.identifier,
                locale,
              ),
            )}
          </div>
        </div>
        <div>
          {node.targets.map((target, index) => {
            const labelId = scopedId(context.instance, node.response, "target", index);
            const label = chipName(
              target.content,
              Option.none(),
              { count: node.targets.length, n: index + 1 },
              locale,
            );
            const chips = byTarget.get(target.identifier) ?? [];

            return (
              <div key={target.identifier} data-slot="plate-match-group">
                <div
                  {...(label === undefined
                    ? { "aria-labelledby": labelId }
                    : { "aria-label": label })}
                  data-empty={flag(chips.length === 0)}
                  data-slot="plate-placement-target"
                  role="group"
                >
                  <div data-slot="plate-placement-target-label" id={labelId}>
                    {context.content(target.content, { position: "flow" })}
                  </div>
                  {chips.map((chip, at) =>
                    chipPart(
                      sources.get(chip.identifier),
                      chip.mark,
                      `${chip.identifier} ${String(at)}`,
                      locale,
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
