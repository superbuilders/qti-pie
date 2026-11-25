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
import type { MathChild } from "#plate/content/mathml.ts";
import type { BodyAttribute, RedactedNode } from "#plate/model/item.ts";
import { collapsedText } from "#plate/model/whitespace.ts";

/**
 * Tell whether an element is hidden from assistive technology, with all below it.
 *
 * @param attributes The element's attributes.
 * @returns Whether it carries `aria-hidden="true"`.
 */
const hidden = (attributes: readonly BodyAttribute[]): boolean =>
  Option.contains(bodyAttributeOf(attributes, "aria-hidden"), "true");

/**
 * Give the words of a formula's tokens, in document order, which is the order MathML reads them in:
 * each text collapsed, one of spaces alone dropped, a no-break space among them (TeX's `\ `). An
 * `annotation` and an `annotation-xml` are another encoding of the formula, never read, and an
 * `maction` says the child its `selection` names (MathML 3 §3.7.1, from 1, the first by default),
 * the child it draws.
 *
 * @param children The formula's children.
 * @returns The words.
 */
const tokensOf = (children: readonly MathChild<unknown>[]): readonly string[] =>
  children.flatMap((child): readonly string[] => {
    if (child.kind === "text") {
      const text = collapsedText(child.text);

      return text.trim() === "" ? [] : [text];
    }

    if (child.kind !== "element" || child.local === "annotation") {
      return [];
    }

    if (child.local !== "maction") {
      return tokensOf(child.children);
    }

    const selection = Number(
      child.attributes.find(({ name }) => name === "selection")?.value ?? "1",
    );
    const selected = child.children.filter((each) => each.kind === "element")[selection - 1];

    return selected === undefined ? [] : tokensOf([selected]);
  });

/**
 * Give the text a formula says: its `alttext`, collapsed and not blank, the text MathML gives a
 * formula for a reader that does not render it (MathML 3 §2.2.1); else its tokens' words, one space
 * between each, as AlphaTest's player named a choice holding one (a fraction's choice was "1250 ×
 * 2 4 × 60"). It is every formula's accessible name on the page (`content` in
 * `#plate/ui/item/contents/mathml.tsx`), so a name Chrome computes from content holding a formula,
 * an option's, a label's, a prompt's, says it: Chrome reads no MathML into such a name, `alttext`
 * included, but it reads an element's `aria-label`.
 *
 * @param formula The formula's `math` element.
 * @param formula.attributes Its attributes.
 * @param formula.children Its children.
 * @returns The text, empty for a formula that says nothing.
 */
export const formulaText = (formula: {
  readonly attributes: readonly { readonly name: string; readonly value: string }[];
  readonly children: readonly MathChild<unknown>[];
}): string => {
  const alttext = collapsedText(
    formula.attributes.find(({ name }) => name === "alttext")?.value ?? "",
  );

  return alttext === "" ? tokensOf(formula.children).join(" ") : alttext;
};

/**
 * How a reading of content takes its formulas: `said`, each as the text it says
 * ({@link formulaText}); `unread`, as nothing, as Chrome reads a name from content, which takes no
 * MathML, `alttext` included.
 */
type Formulas = "said" | "unread";

/**
 * Give the text nodes show, at any depth, as the page writes them: each text as written, a notice
 * as plate's Notice part writes it, a formula as its reading takes it, set apart by spaces, nothing
 * below an element hidden from assistive technology, and nothing of an interaction's or another
 * content module's node, which no choice's content holds.
 *
 * @param nodes The content, as the redacted body holds it.
 * @param locale The locale a notice's text is written in.
 * @param formulas How the reading takes a formula.
 * @returns The text, concatenated, its whitespace as written.
 */
const textOf = (nodes: readonly RedactedNode[], locale: Locale, formulas: Formulas): string =>
  nodes
    .map((node) => {
      if (node.kind === "text") {
        return node.text;
      }

      if (node.kind === "element") {
        return hidden(node.attributes) ? "" : textOf(node.children, locale, formulas);
      }

      if (node.kind === "content" && node.element === "math") {
        return formulas === "said" ? ` ${formulaText(node.node)} ` : "";
      }

      return node.kind === "unsupported"
        ? message(locale, "notice", { feature: node.feature })
        : "";
    })
    .join("");

/**
 * Give the text content shows, collapsed as a name is, each formula as it says it: what the
 * placement primitive and a select's typeahead read of a part holding it, where the server names
 * the part by it.
 *
 * @param nodes The content.
 * @param locale The locale a notice's text is written in.
 * @returns The text, collapsed; empty when the content shows none, a picture alone.
 */
export const shownText = (nodes: readonly RedactedNode[], locale: Locale): string =>
  collapsedText(textOf(nodes, locale, "said"));

/**
 * Tell whether content shows text a name computed from it reads, so the part holding it is named
 * by it: none from a formula, which Chrome reads into no such name.
 *
 * @param nodes The content.
 * @param locale The locale a notice's text is written in.
 * @returns Whether the content shows text outside its formulas.
 */
const showsText = (nodes: readonly RedactedNode[], locale: Locale): boolean =>
  collapsedText(textOf(nodes, locale, "unread")) !== "";

/**
 * Give the alternative text of the first image the content shows that has one: an `img`'s `alt`,
 * collapsed and not blank, below no element hidden from assistive technology.
 *
 * @param nodes The content.
 * @returns The alternative text, undefined when no image shown has one.
 */
export const imageText = (nodes: readonly RedactedNode[]): string | undefined => {
  for (const node of nodes) {
    if (!(node.kind === "element" && !hidden(node.attributes))) {
      continue;
    }

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

  return undefined;
};

/**
 * Give the first `aria-label` an element the content shows carries, collapsed and not blank, below
 * no element hidden from assistive technology.
 *
 * @param nodes The content.
 * @returns The label, undefined when no element shown carries one.
 */
const labelText = (nodes: readonly RedactedNode[]): string | undefined => {
  for (const node of nodes) {
    if (!(node.kind === "element" && !hidden(node.attributes))) {
      continue;
    }

    const label = Option.match(bodyAttributeOf(node.attributes, "aria-label"), {
      onNone: () => "",
      onSome: collapsedText,
    });
    const found = label === "" ? labelText(node.children) : label;

    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
};

/**
 * Tell whether content names what it labels through the accessible-name computation: it shows
 * text outside its formulas, or an element shown in it carries an `aria-label`, or an image an
 * `alt`, that is not blank. A formula names nothing there: Chrome reads no MathML, its `alttext`
 * included, into a name it computes from content.
 *
 * @param nodes The content, such as an Inline Choice's `qti-label`.
 * @param locale The locale a notice's text is written in.
 * @returns Whether a name computed from the content is not empty.
 */
export const namesSomething = (nodes: readonly RedactedNode[], locale: Locale): boolean =>
  showsText(nodes, locale) || imageText(nodes) !== undefined || labelText(nodes) !== undefined;

/**
 * A choice's place among its set as presented: `n`, from 1, of `count`.
 */
export interface Place {
  readonly count: number;
  readonly n: number;
}

/**
 * Give the text a choice is known by: its content's text, each formula as it says it; else, for
 * content that shows none, its `object-label`, else its image's alternative text, else the
 * `aria-label` an element of it carries, else "Choice n of count", `n` its place among its set as
 * presented. A select's typeahead finds an Inline Choice's choice by it, and a review's
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
    labelText(content) ??
    message(locale, "choiceOf", {
      count: numeral(locale, place.count),
      n: numeral(locale, place.n),
    })
  );
};

/**
 * Tell whether content shows a formula, below no element hidden from assistive technology.
 *
 * @param nodes The content.
 * @returns Whether it does.
 */
export const holdsFormula = (nodes: readonly RedactedNode[]): boolean =>
  nodes.some(
    (node) =>
      (node.kind === "content" && node.element === "math") ||
      (node.kind === "element" && !hidden(node.attributes) && holdsFormula(node.children)),
  );

/**
 * Name a chip or a target whose content shows no text, as UI SDK's announcements read a part's
 * text and never an image's `alt`, or shows a formula, whose text on the page runs its tokens
 * together ("1250×24×60" for a fraction): its {@link choiceText}, which says each formula as
 * {@link formulaText} does.
 *
 * @param content The choice's content.
 * @param objectLabel A `qti-gap-img`'s `object-label`, none for any other choice.
 * @param place The choice's place among its set as presented.
 * @param locale The locale of plate's own text.
 * @returns The name, undefined where the content shows text and no formula, which names the part.
 */
export const chipName = (
  content: readonly RedactedNode[],
  objectLabel: Option.Option<string>,
  place: Place,
  locale: Locale,
): string | undefined =>
  showsText(content, locale) && !holdsFormula(content)
    ? undefined
    : choiceText(content, objectLabel, place, locale);
