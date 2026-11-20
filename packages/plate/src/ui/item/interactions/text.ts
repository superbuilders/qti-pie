/**
 * What an interaction's content says as text, read from its body nodes as the page shows them:
 * whether a chip's or a choice's content shows any text, the text a select's typeahead finds, an
 * image's alternative text, and whether a label's content names anything. The server names a part
 * from these when its content alone would leave it nameless.
 *
 * Two readers are told apart. The placement primitive's announcements and a select's typeahead read
 * a part's text, as `textContent` gives it, then its `aria-label`, and never an image's `alt`, so a
 * chip whose content is a picture needs a `label` of its own ({@link showsText}). A label element,
 * an Inline Choice's `qti-label`, names its control through the accessible-name computation, which
 * does read `alt` and `aria-label` ({@link namesSomething}).
 *
 * @module
 * @see https://www.w3.org/TR/accname-1.2/#comp_name_from_content
 */
import { Option } from "effect";
import { message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { bodyAttributeOf } from "#plate/model/attributes.ts";
import type { BodyAttribute, RedactedNode } from "#plate/model/item.ts";
import { collapsedText } from "#plate/ui/whitespace.ts";

/**
 * Tell whether an element is hidden from assistive technology, with all below it.
 *
 * @param attributes The element's attributes.
 * @returns Whether it carries `aria-hidden="true"`.
 */
const hidden = (attributes: readonly BodyAttribute[]): boolean =>
  Option.contains(bodyAttributeOf(attributes, "aria-hidden"), "true");

/**
 * Give the text nodes show, at any depth, as the page writes them: each text as written, a notice
 * as plate's Notice part writes it, nothing below an element hidden from assistive technology, and
 * nothing of an interaction's or a content module's node, which no choice's content holds.
 *
 * @param nodes The content, as the redacted body holds it.
 * @param locale The locale a notice's text is written in.
 * @returns The text, concatenated, its whitespace as written.
 */
const textOf = (nodes: readonly RedactedNode[], locale: Locale): string =>
  nodes
    .map((node) => {
      if (node.kind === "text") {
        return node.text;
      }

      if (node.kind === "element") {
        return hidden(node.attributes) ? "" : textOf(node.children, locale);
      }

      return node.kind === "unsupported"
        ? message(locale, "notice", { feature: node.feature })
        : "";
    })
    .join("");

/**
 * Give the text content shows, collapsed as a name is: what the placement primitive and a select's
 * typeahead read of a part holding it.
 *
 * @param nodes The content.
 * @param locale The locale a notice's text is written in.
 * @returns The text, collapsed; empty when the content shows none, a picture alone.
 */
export const shownText = (nodes: readonly RedactedNode[], locale: Locale): string =>
  collapsedText(textOf(nodes, locale));

/**
 * Tell whether content shows any text, so the part holding it is named by it.
 *
 * @param nodes The content.
 * @param locale The locale a notice's text is written in.
 * @returns Whether {@link shownText} is not empty.
 */
const showsText = (nodes: readonly RedactedNode[], locale: Locale): boolean =>
  shownText(nodes, locale) !== "";

/**
 * Give the alternative text of the first image the content shows that has one: an `img`'s `alt`,
 * collapsed and not blank, below no element hidden from assistive technology.
 *
 * @param nodes The content.
 * @returns The alternative text, undefined when no image shown has one.
 */
export const imageText = (nodes: readonly RedactedNode[]): string | undefined => {
  for (const node of nodes) {
    if (node.kind === "element" && !hidden(node.attributes)) {
      const alt =
        node.tag === "img"
          ? Option.match(bodyAttributeOf(node.attributes, "alt"), {
              onNone: () => "",
              onSome: collapsedText,
            })
          : "";
      const found = alt === "" ? imageText(node.children) : alt;

      if (found !== undefined) {
        return found;
      }
    }
  }

  return undefined;
};

/**
 * Tell whether content names what it labels through the accessible-name computation: it shows
 * text, or an element shown in it carries an `aria-label`, or an image an `alt`, that is not blank.
 *
 * @param nodes The content, such as an Inline Choice's `qti-label`.
 * @param locale The locale a notice's text is written in.
 * @returns Whether a name computed from the content is not empty.
 */
export const namesSomething = (nodes: readonly RedactedNode[], locale: Locale): boolean =>
  showsText(nodes, locale) ||
  imageText(nodes) !== undefined ||
  nodes.some(
    (node) =>
      node.kind === "element" &&
      !hidden(node.attributes) &&
      (Option.exists(
        bodyAttributeOf(node.attributes, "aria-label"),
        (label) => collapsedText(label) !== "",
      ) ||
        namesSomething(node.children, locale)),
  );

/**
 * A choice's place among its set as presented: `n`, from 1, of `count`.
 */
export interface Place {
  readonly count: number;
  readonly n: number;
}

/**
 * Give the text a choice is known by: its content's text; else, for content that shows none, its
 * `object-label`, else its image's alternative text, else "Choice n of count", `n` its place among
 * its set as presented. A select's typeahead finds an Inline Choice's choice by it, and a review's
 * "Right answer: …" names one by it.
 *
 * @param content The choice's content.
 * @param objectLabel A `qti-gap-img`'s `object-label`, none for any other choice.
 * @param place The choice's place among its set as presented.
 * @param locale The locale of plate's own text.
 * @returns The text, never empty.
 */
export const choiceText = (
  content: readonly RedactedNode[],
  objectLabel: Option.Option<string>,
  place: Place,
  locale: Locale,
): string => {
  const text = shownText(content, locale);
  const label = collapsedText(Option.getOrElse(objectLabel, () => ""));

  if (text !== "") {
    return text;
  }

  if (label !== "") {
    return label;
  }

  return (
    imageText(content) ??
    message(locale, "choiceOf", {
      count: numeral(locale, place.count),
      n: numeral(locale, place.n),
    })
  );
};

/**
 * Name a chip or a target whose content shows no text, as UI SDK's announcements read a part's
 * text and never an image's `alt`: its {@link choiceText}.
 *
 * @param content The choice's content.
 * @param objectLabel A `qti-gap-img`'s `object-label`, none for any other choice.
 * @param place The choice's place among its set as presented.
 * @param locale The locale of plate's own text.
 * @returns The name, undefined where the content shows text, which names the part.
 */
export const chipName = (
  content: readonly RedactedNode[],
  objectLabel: Option.Option<string>,
  place: Place,
  locale: Locale,
): string | undefined =>
  showsText(content, locale) ? undefined : choiceText(content, objectLabel, place, locale);
