/**
 * Media (Q-14) in the server shell: what renders a `qti-media-interaction`'s payload node, its
 * island in `answering` and its replay island in `review` and `solution`
 * (`#plate/ui/media/media.tsx`), with the same parts and the same controls in every mode.
 *
 * The media element is the author's, written through the shell's content walk with its `source`
 * and `track` children, each URL its address in the host's assets, and its `controls`, `muted` and
 * each track's `default` as the author set them, a written `false` unset (`propsOf` in
 * `#plate/ui/item/html.ts`). QTI's rules for it change two of its attributes (information model
 * 5.92): `loop` is the interaction's, and `autoplay` is never written, the element's own of both
 * dropped, so the element never starts or repeats what the interaction did not ask for. The island
 * starts it for `autostart` once it counts the plays; a replay starts nothing, as a review is no
 * attempt.
 *
 * The author's `track` children stay the element's, each `src` its address, and a `video` holding a
 * captions or subtitles track has the island's Captions toggle (WCAG 1.2.2).
 *
 * A review and a solution replay the media (Bjorn's ruling, 2026-11-18, plate's UI suite's J1): its
 * own controls play it as often as anyone likes and count nothing, and the replay island is handed
 * no response, so it writes nothing. The count it shows is the server's, written here.
 *
 * The islands stand only for an `audio` or a `video`. A browser reports no plays of the deprecated
 * `object`, so a Media holding one, or no media at all, is its server markup in every mode, and
 * writes nothing.
 *
 * A review shows the count its response holds as `plate-media-count`, a response that reports no
 * play as 0, as plate reads it (reading `media-no-play`); a solution shows the count its correct
 * response holds, none where it declares none. Neither marks it (ruling R4): a count of plays is no
 * answer to mark right or wrong.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_MediaInteraction
 */
import { Option } from "effect";
import type { ReactNode } from "react";
import { counted, message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import type { PayloadOf } from "#plate/model/interactions.ts";
import type { Paired } from "#plate/payload.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { limitOf } from "#plate/placement/limit.ts";
import { groupOf } from "#plate/ui/item/interactions/group.ts";
import { labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { mediaKeys } from "#plate/ui/media/labels.ts";
import { Media, MediaReplay } from "#plate/ui/media/media.tsx";
import type { Least } from "#plate/ui/media/media.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import { bodyAttributeOf } from "#plate/model/attributes.ts";
import type { BodyAttribute, BodyElement, RedactedLevel, RedactedNode } from "#plate/model/item.ts";

/**
 * The media elements a browser plays and reports the plays of, which the island counts.
 */
const playable: ReadonlySet<string> = new Set(["audio", "video"]);

/**
 * The attributes of a playable element that the interaction decides, never the author's own.
 */
const interactions: ReadonlySet<string> = new Set(["autoplay", "loop"]);

/**
 * The kinds of text track a browser draws over a video, which the island's Captions toggle shows.
 */
const captionKinds: ReadonlySet<string> = new Set(["captions", "subtitles"]);

/**
 * Tell whether a media element is a `video` holding a captions or subtitles track: a `track` child
 * whose `kind`, an enumerated attribute read without regard to ASCII case, is either, or is not
 * written, its missing value default being subtitles.
 *
 * @param element The media element.
 * @returns Whether it has captions.
 * @see https://html.spec.whatwg.org/multipage/media.html#attr-track-kind
 */
const hasCaptions = (element: BodyElement<RedactedLevel>): boolean =>
  element.tag === "video" &&
  element.children.some(
    (child) =>
      child.kind === "element" &&
      child.tag === "track" &&
      captionKinds.has(
        Option.getOrElse(
          bodyAttributeOf(child.attributes, "kind"),
          () => "subtitles",
        ).toLowerCase(),
      ),
  );

/**
 * Find the media element the island plays: the interaction's `audio` or `video`.
 *
 * @param media The interaction's media, as its payload holds it.
 * @returns The element, undefined where the media is an `object` or there is none.
 */
const playerOf = (media: readonly RedactedNode[]): BodyElement<RedactedLevel> | undefined =>
  media.find(
    (node): node is BodyElement<RedactedLevel> => node.kind === "element" && playable.has(node.tag),
  );

/**
 * Give a boolean attribute as set, in its own name, where it holds.
 *
 * @param name The attribute's name.
 * @param holds Whether it is set.
 * @returns The attribute, or none.
 */
const setWhere = (name: string, holds: boolean): readonly BodyAttribute[] =>
  holds ? [{ name, value: name }] : [];

/**
 * Write the media element as the islands play it: `loop` the interaction's and no `autoplay`; every
 * other attribute and child as written.
 *
 * @param element The media element.
 * @param node The Media's payload, which gives `loop`.
 * @returns The element to write.
 */
const nativeOf = (
  element: BodyElement<RedactedLevel>,
  node: PayloadOf<"media">,
): BodyElement<RedactedLevel> => ({
  ...element,
  attributes: [
    ...element.attributes.filter((attribute) => !interactions.has(attribute.name)),
    ...setWhere("loop", node.loop),
  ],
});

/**
 * Write the Media's media through the shell's walk, where flow content stands, its playable
 * element as the islands play it ({@link nativeOf}).
 *
 * @param node The Media's payload.
 * @param context What the shell knows: its content walk.
 * @returns The media, as server React elements.
 */
const mediaOf = (node: PayloadOf<"media">, context: Pick<IslandContext, "content">): ReactNode =>
  context.content(
    node.media.map((each) =>
      each.kind === "element" && playable.has(each.tag) ? nativeOf(each, node) : each,
    ),
    { position: "flow" },
  );

/**
 * Write the count of plays a render shows, `plate-media-count`.
 *
 * @param shown The count, none where the render shows none.
 * @param locale The locale of plate's own text.
 * @returns The count's line, or nothing.
 */
const countOf = (shown: Option.Option<string>, locale: Locale): ReactNode =>
  Option.match(shown, {
    onNone: () => null,
    onSome: (count) => (
      <p data-slot="plate-media-count">
        {message(locale, "mediaPlays", { n: numeral(locale, BigInt(count)) })}
      </p>
    ),
  });

/**
 * Write a Media no island plays, one holding an `object` or no media, as server markup with the
 * islands' parts: the root, named as the islands name their group; the prompt; the media; and the
 * count shown.
 *
 * @param paired The Media and its payload node: its prompt, media and names.
 * @param context What the shell knows.
 * @param shown The count of plays the render shows, none in an attempt.
 * @returns The markup.
 */
const markupOf = (
  { model, payload: node }: Paired<"media">,
  context: IslandContext,
  shown: Option.Option<string>,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <div {...rootOf(model, context)} {...groupOf(prompt, node, context)} data-slot="plate-media">
      <PromptPart prompt={prompt} />
      <div data-slot="plate-media-player">{mediaOf(node, context)}</div>
      {countOf(shown, context.locale)}
    </div>
  );
};

/**
 * Give the fewest plays a Media asks for, with the sentence that asks for them.
 *
 * @param minPlays The interaction's `min-plays`, written or defaulted to 0.
 * @param locale The locale of plate's own text.
 * @returns None at 0; else the count, with the catalog's `mediaAtLeastOnce` for 1 and its
 *   `mediaAtLeast` filled with the count for more.
 */
const leastOf = (minPlays: bigint, locale: Locale): Least => {
  if (minPlays === 0n) {
    return { kind: "none" };
  }

  return {
    kind: "at-least",
    n: Number(minPlays),
    text: counted(locale, minPlays, { many: "mediaAtLeast", one: "mediaAtLeastOnce" }),
  };
};

/**
 * Render a Media's island, or its server markup where its media is no `audio` or `video`.
 *
 * @param paired The Media and its payload node.
 * @param paired.payload Its payload node, as its module's `redact` gave it: the prompt, the media, the
 *   author's names, `autostart`, `loop`, `min-plays`, `max-plays` and the response's declaration.
 * @param context What the page may know of the render.
 * @returns The island, or the markup.
 */
export const island = (paired: Paired<"media">, context: IslandContext): ReactNode => {
  const { model, payload: node } = paired;
  const player = playerOf(node.media);
  const prompt = promptAt(node.prompt, node.response, context);

  return player === undefined ? (
    markupOf(paired, context, Option.none())
  ) : (
    <Media
      autostart={node.autostart}
      captions={hasCaptions(player)}
      labels={labelsOf(mediaKeys, context.locale, {})}
      least={leastOf(node.minPlays, context.locale)}
      maxPlays={limitOf(node.maxPlays)}
      naming={groupOf(prompt, node, context)}
      prompt={prompt}
      response={node.declared}
      root={rootOf(model, context)}
    >
      {mediaOf(node, context)}
    </Media>
  );
};

/**
 * Render a Media's review or solution: its replay island, or its server markup where its media is
 * no `audio` or `video`, the count shown and no mark. A review shows the candidate's count, 0 for a
 * response that reports no play; a solution, the correct count, none where the response declares
 * none. The replay changes neither.
 *
 * @param paired The Media and its payload node, as its module's `redact` gave it.
 * @param context What the shell knows: what the render shows.
 * @returns The replay island, or the markup.
 */
export const review = (paired: Paired<"media">, context: ReviewContext): ReactNode => {
  const { model, payload: node } = paired;
  const player = playerOf(node.media);
  const prompt = promptAt(node.prompt, node.response, context);
  const shown =
    context.shows.kind === "answers"
      ? Option.some(Option.getOrElse(node.restore, () => "0"))
      : node.restore;

  return player === undefined ? (
    markupOf(paired, context, shown)
  ) : (
    <MediaReplay
      captions={hasCaptions(player)}
      labels={labelsOf(mediaKeys, context.locale, {})}
      naming={groupOf(prompt, node, context)}
      prompt={prompt}
      recorded={countOf(shown, context.locale)}
      root={rootOf(model, context)}
    >
      {mediaOf(node, context)}
    </MediaReplay>
  );
};
