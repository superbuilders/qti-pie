/**
 * Alpha's renderer vocabulary: the classes Alpha's content writes on standard QTI content to ask
 * for a presentation neither QTI's shared vocabulary nor plate's own (`rendererClasses` in
 * `#plate/vocabulary.ts`) has a class for, each by its meaning. Each is a class token only, so the
 * content beneath stays the standard element, answerable and gradable by any renderer that knows
 * none of them, and each is presented by Alpha's two sheets alone: `alpha/styles/base.css`, what it
 * needs to work, and `alpha/styles/theme.css`, plate's look of it, both in the `plate-alpha` layer
 * after `plate`. No core module or sheet names one.
 *
 * The prefix is Alpha's own, `alpha-`, the item vendor's code QTI 3's Best Practices and
 * Implementation Guide asks a custom presentation's classes to carry (§3.6.1), as plate's own carry
 * `plate-`.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 */

/**
 * Alpha's classes, each with its meaning, in key order.
 */
export const alphaClasses = {
  /**
   * On the block of a `qti-hottext-interaction` that holds its hottexts: a number strip, each
   * hottext a numeral card, every card the size of the widest and at least plate's 64 px target
   * both ways, in one row with their edges shared that never wraps, the whole card the hottext's
   * target, as Alpha's K–2 mastery forms draw a count-on strip. A strip wider than its block
   * scrolls inside its own box. Its start is the hottext that carries `alpha-number-strip-start`.
   */
  "alpha-number-strip": "a Hot Text's hottexts as a number strip of numeral cards",
  /**
   * On one `qti-hottext` of a number strip: its start, the numeral its count starts from,
   * highlighted over its whole card in every state, at rest, hovered, picked, marked and under
   * forced colours. Plate writes a hottext's class on the span its passage stands in, which the
   * base sheet stretches over the card.
   */
  "alpha-number-strip-start":
    "a number strip's start, the numeral its count starts from, highlighted over its card",
} as const;
