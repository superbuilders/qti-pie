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
 * A Match whose root carries QTI's `qti-match-tabular` class is laid out as a table instead (QTI
 * 3.0 shared vocabulary, 1.2.8.2): the first set's choices head its rows, the second's its
 * columns, and each cell is a tick box for its row's and column's pair, on the same board as the
 * bank (`#plate/ui/match/table.tsx`). Its review is the same table, each cell ticked where the
 * response holds its pair and marked by the host's marks. The class lays the Match out and changes
 * nothing it does: the same limits, the same response.
 *
 * @module
 */
import { Option } from "effect";
import type { ReactNode } from "react";
import { scopedId } from "#plate/instance.ts";
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
import type { Shown } from "#plate/ui/item/interactions/chips.tsx";
import { limitOf } from "#plate/placement/limit.ts";
import { groupNameOf, labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import type { Marking } from "#plate/ui/item/interactions/marks.ts";
import { markPart } from "#plate/ui/item/interactions/words.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import { chipName, shownText } from "#plate/content/text.ts";
import type { Place } from "#plate/content/text.ts";
import { matchKeys, matchTableKeys } from "#plate/ui/match/labels.ts";
import { Match } from "#plate/ui/match/match.tsx";
import type { MatchHeader, MatchTarget } from "#plate/ui/match/match.tsx";
import { MatchTable } from "#plate/ui/match/table.tsx";
import type { TableHeader } from "#plate/ui/match/table.tsx";
import { pickParts } from "#plate/ui/picks/marks.ts";
import type { PickReview } from "#plate/ui/picks/marks.ts";
import { hasClass } from "#plate/vocabulary.ts";

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
 * How a Match is laid out: `bank`, its first set's choices as chips sorted into its second set's
 * choices as groups; or `table`, QTI's tabular Match, its first set heading the rows and its second
 * the columns, a tick box in each cell.
 */
type MatchLayout = "bank" | "table";

/**
 * Give a Match's layout from the class its root carries: a table where it holds QTI's
 * `qti-match-tabular`, "Render a visual table with the choices of the first Simple Match Set as the
 * table row headers, and the choices of the second Simple Match Set as the table column headers"
 * (QTI 3.0 shared vocabulary, 1.2.8.2), else the bank.
 *
 * @param context What the shell knows: the class the root carries.
 * @returns The layout.
 */
const layoutOf = (context: Pick<IslandContext, "className">): MatchLayout =>
  hasClass(context.className, "qti-match-tabular") ? "table" : "bank";

/**
 * Give one header of a Match's table as the island takes it: the choice, its content written where
 * flow content stands, its limits, its `label` where its content shows no text, its name, that
 * label or the text it shows, its read-aloud, named as a row's or a column's, and the id its
 * content's part takes, which names the tick boxes of its row or column.
 *
 * @param choice The choice, as the payload presents it.
 * @param place Its place among its set as presented.
 * @param side Which set it heads: the rows, the first set's, or the columns, the second's.
 * @param context What the shell knows: its content walk, the instance, the locale and read-aloud.
 * @param response The response the Match binds, which scopes the id.
 * @returns The header.
 */
const headerAt = (
  choice: PayloadOf<"match">["sources"][number],
  place: Place,
  side: "column" | "row",
  context: Pick<IslandContext, "content" | "instance" | "locale" | "readAloud">,
  response: string,
): TableHeader => {
  const label = chipName(choice.content, Option.none(), place, context.locale);

  return {
    content: contentOf(choice.content, "flow", context),
    id: scopedId(context.instance, response, side, place.n - 1),
    identifier: choice.identifier,
    label,
    matchGroup: choice.matchGroup,
    matchMax: limitOf(choice.matchMax),
    name: label ?? shownText(choice.content, context.locale),
    ...spokenOf(choice, place.n, side === "row" ? "readAloudRow" : "readAloudColumn", context),
  };
};

/**
 * Render a Match's island: the first set's choices as the chips, the second's as the groups, each
 * as presented, or, laid out as a table, as its rows and its columns.
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

  if (layoutOf(context) === "table") {
    return (
      <MatchTable
        header={headerOf(node, context)}
        labels={labelsOf(matchTableKeys, context.locale, { totalReached: model.messages.max })}
        maxAssociations={limitOf(node.maxAssociations)}
        naming={groupNameOf(prompt, node, context)}
        prompt={prompt}
        response={node.declared}
        root={rootOf(model, context)}
        sources={node.sources.map((source, index) =>
          headerAt(
            source,
            { count: node.sources.length, n: index + 1 },
            "row",
            context,
            node.response,
          ),
        )}
        targets={node.targets.map((target, index) =>
          headerAt(
            target,
            { count: node.targets.length, n: index + 1 },
            "column",
            context,
            node.response,
          ),
        )}
      />
    );
  }

  return (
    <Match
      header={headerOf(node, context)}
      labels={labelsOf(matchKeys, context.locale, { totalReached: model.messages.max })}
      maxAssociations={limitOf(node.maxAssociations)}
      naming={groupNameOf(prompt, node, context)}
      prompt={prompt}
      response={node.declared}
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
 * Give how a review shows each cell of a Match's table: ticked where the pairs it shows hold the
 * cell's pair, marked `right` or `wrong` where the host's marks say, `given` where they mark
 * nothing, and `correct` in a solution, whose pairs are the correct response; and `missed` where
 * the review shows a right pair the response does not hold. A Match makes each pair once, so a
 * cell holds at most one pair given and one missed.
 *
 * @param byTarget Each column's pairs, by the column's identifier, as the review marks them
 *   (`pairsByTarget` in `#plate/ui/item/interactions/chips.tsx`).
 * @param marking How the review marks the response.
 * @returns How the review shows the cell of a row and a column.
 */
const cellsOf =
  (byTarget: ReadonlyMap<string, readonly Shown[]>, marking: Marking) =>
  (row: string, column: string): PickReview => {
    const shown = (byTarget.get(column) ?? []).find((chip) => chip.identifier === row);

    if (shown === undefined) {
      return "unpicked";
    }

    if (shown.mark !== undefined) {
      return shown.mark;
    }

    return marking.kind === "solution" ? "correct" : "given";
  };

/**
 * Render a Match's table in a review: the island's table, its head and its row headers, each cell
 * a `plate-match-cell` with no control, ticked and marked as {@link cellsOf} shows it, its
 * `plate-match-tick` drawn as the island's tick box is and saying its mark's words.
 *
 * @param paired The Match.
 * @param paired.model Its model node: the author's `data-*`.
 * @param paired.payload Its payload: its sets as presented and the pairs it shows.
 * @param context What the shell knows.
 * @returns The markup.
 */
const reviewTable = (
  { model, payload: node }: Paired<"match">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const marking = markingOf(node.response, context);
  const reviewed = cellsOf(pairsByTarget(node.pairs, marking), marking);
  const header = headerOf(node, context);

  return (
    <div
      {...rootOf(model, context)}
      {...groupNameOf(prompt, node, context)}
      data-slot="plate-match"
      role="group"
    >
      <PromptPart prompt={prompt} />
      <div data-slot="plate-table">
        <table data-slot="plate-match-table">
          <thead data-slot="plate-match-table-head">
            <tr>
              {header === undefined ? (
                <td />
              ) : (
                <th id={header.id} scope="col">
                  <div data-slot="plate-match-table-label">{header.text}</div>
                </th>
              )}
              {node.targets.map((target) => (
                <th key={target.identifier} scope="col">
                  <div data-slot="plate-match-table-label">
                    {context.content(target.content, { position: "flow" })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {node.sources.map((source) => (
              <tr key={source.identifier}>
                <th scope="row">
                  <div data-slot="plate-match-table-label">
                    {context.content(source.content, { position: "flow" })}
                  </div>
                </th>
                {node.targets.map((target) => {
                  const review = reviewed(source.identifier, target.identifier);

                  return (
                    <td key={target.identifier} data-slot="plate-match-cell">
                      <span {...pickParts[review].attributes} data-slot="plate-match-tick">
                        {markPart(pickParts[review].words, locale)}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Render a Match's bank in a review: its bank, under the author's `data-first-column-header` as its
 * visible heading when there is one (5.89.6), and each group holding the chips the response puts
 * there, each pair marked when the review marks.
 *
 * @param paired The Match.
 * @param paired.model Its model node: the author's `data-*`.
 * @param paired.payload Its payload: its sets as presented and the pairs it shows.
 * @param context What the shell knows.
 * @returns The markup.
 */
const reviewBank = (
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

/**
 * Render a Match's review in its layout: its bank ({@link reviewBank}), or its table
 * ({@link reviewTable}).
 *
 * @param paired The Match.
 * @param context What the shell knows: the class its root carries, which lays it out.
 * @returns The markup.
 */
export const review = (paired: Paired<"match">, context: ReviewContext): ReactNode =>
  layoutOf(context) === "table" ? reviewTable(paired, context) : reviewBank(paired, context);
