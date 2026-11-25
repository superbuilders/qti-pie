/**
 * Which of a hotspot's placed choices a Graphic Gap Match draws on its image, and how they are laid
 * out there: as cards at the label size, 24 CSS px, wherever the hotspot's box has room for them,
 * and otherwise scaled down together until they fit it, never past two thirds of that, 16 px words
 * and a picture at two thirds of its written size. QTI asks that "choices must appear wholly inside
 * the gaps if at all possible and, where overlaps are required, should not hide each other
 * completely" (QTI 3.0 information model 5.60). A choice that would read only under that floor is
 * not drawn there, and the hotspot's row in the list below the image, which holds every choice
 * placed there, shows it at full size, while the area's ring still shows it is filled: words
 * shrunk to fit would be too small to read (upstream #455). Pure, and safe to import on the server
 * and the client.
 *
 * Which choices a box shows depends on how wide the page draws it, which the server cannot know.
 * So the fit gives the box's bands ({@link bandsOf}): for every width the box may take, the
 * choices taken in order where they still read at the floor with those taken before them, and
 * each band's cards laid out once, at the label size, in the layout that reads at the floor in the
 * narrowest box of the area's proportions ({@link layoutOf}). The page draws each band's layout as
 * large as the box allows, at most at its own size, and only while the box's width is in its band
 * (`#plate/ui/graphic-gap-match/placed.tsx`), so which choices stand on the picture follows the
 * width it is drawn at, with nothing measured.
 *
 * The server cannot measure text, so a text choice is measured by a model of the stylesheet's
 * choice card, {@link cardMetrics}. The model errs wide, so a layout it says fits fits on the page.
 * A gap image is held to its written size, as a picture of a label is most often what it is, and
 * one whose author wrote no size is never drawn there, since the server cannot tell how large it
 * would be.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_GraphicGapMatchInteraction
 */

/**
 * A placed choice's content as the fit measures it: a gap text's words, a gap image's size as
 * its author wrote it, in CSS pixels, or an image with no written size, which only the browser
 * could measure.
 */
export type ChoiceMeasure =
  | { readonly kind: "text"; readonly words: readonly string[] }
  | { readonly kind: "image"; readonly height: number; readonly width: number }
  | { readonly kind: "unsized" };

/**
 * A box's size: a card's or a layout's in CSS pixels, an area's box in the image's pixels.
 */
export interface FitBox {
  readonly height: number;
  readonly width: number;
}

/**
 * The stylesheet's choice card and the box around the cards, in CSS pixels, as
 * `plate-graphic-gap-match-placed-box`, `plate-graphic-gap-match-placed-cards` and
 * `plate-graphic-gap-match-placed-choice` draw them in `#plate/styles/base.css`. The two must
 * agree: a card the stylesheet draws larger than this spills past its area.
 *
 * - `font`: the text's size, 24 px, the label size, and `line`, its line's height (`line-height:
 *   1.2`).
 * - `narrow` and `wide`: the advance the model gives a character, in ems. A semibold sans-serif
 *   lowercase letter, digit, space or mark averages about half an em and a capital about two
 *   thirds, so these err wide.
 * - `padX` and `padY`: the card's padding across and down.
 * - `badge`: the room a marked card keeps at its end for its mark's 24 px badge, which stands there
 *   on the card's middle, and the 4 px between it and the words.
 * - `edge`: what the card draws outside its padding on each side, its 2 px ink border and its 2 px
 *   light band (`box-shadow`), which stays inside the area too.
 * - `gap`: the space between two cards, across and down.
 * - `inset`: how far inside the area's box the cards keep, clear of the inner half of the area's own
 *   two-tone ring, at every scale.
 * - `least`: the smallest share of their size the cards are drawn at, 16 px words of the 24.
 */
const cardMetrics = {
  badge: 28,
  edge: 4,
  font: 24,
  gap: 4,
  inset: 3,
  least: 2 / 3,
  line: 28.8,
  narrow: 0.6,
  padX: 8,
  padY: 2,
  wide: 0.75,
} as const;

/**
 * A card's extent beyond its content, across and down: its padding and its edge on both sides,
 * and across, for a marked card, its badge's room too ({@link acrossOf}).
 */
const chrome = {
  x: 2 * (cardMetrics.padX + cardMetrics.edge),
  y: 2 * (cardMetrics.padY + cardMetrics.edge),
} as const;

/**
 * A capital letter, which the model gives the wide advance.
 */
const capital = /\p{Lu}/u;

/**
 * Splits a word into what a reader sees as its characters, so a letter with its combining marks,
 * or an emoji, takes one advance.
 */
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

/**
 * Measure a word's width as the model sets it, in CSS pixels.
 *
 * @param word The word.
 * @returns Its width.
 */
const wordWidth = (word: string): number =>
  [...graphemes.segment(word)].reduce(
    (width, { segment }) =>
      width + cardMetrics.font * (capital.test(segment) ? cardMetrics.wide : cardMetrics.narrow),
    0,
  );

/**
 * The width of a space between two words, in CSS pixels.
 */
const spaceWidth = cardMetrics.font * cardMetrics.narrow;

/**
 * A card's size, in CSS pixels.
 */
type Card = FitBox;

/**
 * Size a text card whose words wrap at a width: its words on one line where they fit across it,
 * else broken between words into lines as wide as it allows, as the stylesheet wraps a card's
 * text, a word wider than the width standing alone on its line, since none breaks inside a word.
 *
 * @param words The card's words, measured.
 * @param across The card's extent across beyond its words ({@link acrossOf}).
 * @param wrap The width its lines wrap at, its chrome included.
 * @returns The card.
 */
const textCard = (words: readonly number[], across: number, wrap: number): Card => {
  const room = wrap - across;
  const lines: number[] = [];

  for (const width of words) {
    const last = lines.at(-1);

    if (last !== undefined && last + spaceWidth + width <= room) {
      lines[lines.length - 1] = last + spaceWidth + width;
    } else {
      lines.push(width);
    }
  }

  return {
    height: Math.max(1, lines.length) * cardMetrics.line + chrome.y,
    width: Math.max(0, ...lines) + across,
  };
};

/**
 * A choice a hotspot holds, as the fit takes it: its content, measured, and whether a review marks
 * it, so its card keeps room for its badge.
 */
export interface FitChoice {
  readonly marked: boolean;
  readonly measure: ChoiceMeasure;
}

/**
 * Give a card's extent across beyond its content: its padding and edge on both sides, and for a
 * marked card its badge's room at its end.
 *
 * @param marked Whether a review marks the card.
 * @returns The extent, in CSS px.
 */
const acrossOf = (marked: boolean): number => chrome.x + (marked ? cardMetrics.badge : 0);

/**
 * A choice's content as the layout takes it: a text's words, measured, with its card's extent
 * across beyond them; or a picture's card, at its written size.
 */
type Measured =
  | { readonly across: number; readonly kind: "text"; readonly words: readonly number[] }
  | { readonly card: Card; readonly kind: "image" };

/**
 * Measure a choice for the layout: none for a picture with no written size, which is never drawn.
 *
 * @param choice The choice, as the fit takes it.
 * @returns The measured content, or none.
 */
const measuredOf = ({ marked, measure }: FitChoice): Measured | undefined => {
  switch (measure.kind) {
    case "image": {
      return {
        card: { height: measure.height + chrome.y, width: measure.width + acrossOf(marked) },
        kind: "image",
      };
    }
    case "text": {
      return { across: acrossOf(marked), kind: "text", words: measure.words.map(wordWidth) };
    }
    case "unsized": {
      return undefined;
    }
  }
};

/**
 * Lay cards out as the stylesheet does in a box of a width: side by side in their order, a card
 * that would pass the box's right edge starting a new row, each row as tall as its tallest card,
 * with {@link cardMetrics}' gap between cards and between rows, a text card's words wrapping at the
 * box's width.
 *
 * @param measured The cards' contents, in order.
 * @param wrap The box's width.
 * @returns The size the cards take: their widest row's width and their rows' height.
 */
const flowOf = (measured: readonly Measured[], wrap: number): Card => {
  const rows: { height: number; width: number }[] = [];

  for (const content of measured) {
    const card =
      content.kind === "image" ? content.card : textCard(content.words, content.across, wrap);
    const row = rows.at(-1);

    if (row !== undefined && row.width + cardMetrics.gap + card.width <= wrap) {
      row.width += cardMetrics.gap + card.width;
      row.height = Math.max(row.height, card.height);
    } else {
      rows.push({ height: card.height, width: card.width });
    }
  }

  return {
    height:
      rows.reduce((total, row) => total + row.height, 0) +
      cardMetrics.gap * Math.max(0, rows.length - 1),
    width: Math.max(0, ...rows.map((row) => row.width)),
  };
};

/**
 * List the widths a layout of cards may wrap at, the ones where its rows change: each run of a text
 * card's words on one line, each card on its own, and each run of whole cards side by side.
 *
 * @param measured The cards' contents, in order.
 * @returns The widths, their chrome and gaps included.
 */
const wrapsOf = (measured: readonly Measured[]): readonly number[] => {
  const singles = measured.map((content) =>
    content.kind === "image"
      ? content.card.width
      : textCard(content.words, content.across, Infinity).width,
  );
  const runs = measured.flatMap((content) =>
    content.kind === "image"
      ? []
      : content.words.flatMap((_, from) =>
          content.words
            .slice(from)
            .map(
              (__, length) =>
                content.words
                  .slice(from, from + length + 1)
                  .reduce((total, width) => total + width, 0) +
                spaceWidth * length +
                content.across,
            ),
        ),
  );
  const rows = singles.flatMap((_, from) =>
    singles
      .slice(from)
      .map(
        (__, length) =>
          singles.slice(from, from + length + 1).reduce((total, width) => total + width, 0) +
          cardMetrics.gap * length,
      ),
  );

  return [...new Set([...runs, ...rows])];
};

/**
 * A band of the widths a hotspot's box may take, and the cards it shows there: `from`, the
 * narrowest the box may be, across in CSS px less its inset, for the band's cards to read at the
 * floor, up to the next band's `from`, or with no end for the last band; the places of the choices
 * drawn, in order; and the size their layout takes at the label size, in CSS px, which the page
 * draws as large as the box allows and never larger.
 */
export interface Band {
  readonly from: number;
  readonly places: readonly number[];
  readonly size: FitBox;
}

/**
 * Give the narrowest a hotspot's box may be, across in CSS px less its inset, for a layout to stand
 * in it at two thirds of its size or more: as wide as two thirds of the layout, and as wide as the
 * box is when it is as tall as two thirds of the layout, the box keeping its area's proportions.
 *
 * @param size The layout's size at the label size.
 * @param box The area's box, in the image's pixels, whose proportions the box keeps.
 * @returns The width, in CSS px.
 */
const leastOf = (size: FitBox, box: FitBox): number =>
  Math.max(
    cardMetrics.least * size.width,
    ((cardMetrics.least * size.height + 2 * cardMetrics.inset) * box.width) / box.height -
      2 * cardMetrics.inset,
  );

/**
 * Lay cards out for a box: of every width their rows may wrap at ({@link wrapsOf}), the one that
 * needs the narrowest box to read at the floor ({@link leastOf}), the widest of those that need no
 * more, so words that fit on one line stand on one. The choice keeps to the box's proportions
 * alone, so it holds at every width the page draws the box at.
 *
 * @param measured The cards' contents, in order.
 * @param box The area's box, in the image's pixels.
 * @returns The layout's size at the label size, and the narrowest the box may be for it.
 */
const layoutOf = (
  measured: readonly Measured[],
  box: FitBox,
): { readonly least: number; readonly size: FitBox } | undefined => {
  let best: { readonly least: number; readonly size: FitBox } | undefined;

  for (const wrap of wrapsOf(measured).toSorted((left, right) => right - left)) {
    const size = flowOf(measured, wrap);
    const least = leastOf(size, box);

    if (best === undefined || least < best.least) {
      best = { least, size };
    }
  }

  return best;
};

/**
 * The choices a box of one width shows, taken as {@link bandsOf} takes them, and the narrowest
 * width at which any choice passed over would be taken: past it the choices shown may change.
 */
interface Taken {
  readonly layout: { readonly least: number; readonly size: FitBox } | undefined;
  readonly next: number;
  readonly places: readonly number[];
}

/**
 * Take a hotspot's choices for a box of one width: each in its order, taken where the cards taken
 * with it still read at the floor in the box, and passed over where they do not, so a choice too
 * large for the box never hides the ones after it.
 *
 * @param measured The choices, measured, none for a picture with no written size.
 * @param box The area's box, in the image's pixels.
 * @param width The box's width, across in CSS px less its inset.
 * @returns The choices taken and their layout, and where a choice passed over would be taken.
 */
const takenAt = (
  measured: readonly (Measured | undefined)[],
  box: FitBox,
  width: number,
): Taken => {
  const taken: Measured[] = [];
  const places: number[] = [];
  let layout: Taken["layout"];
  let next = Number.POSITIVE_INFINITY;

  for (const [index, content] of measured.entries()) {
    const tried = content === undefined ? undefined : layoutOf([...taken, content], box);

    if (content !== undefined && tried !== undefined) {
      if (tried.least <= width) {
        taken.push(content);
        places.push(index);
        layout = tried;
      } else {
        next = Math.min(next, tried.least);
      }
    }
  }

  return { layout, next, places };
};

/**
 * Give the bands of a hotspot's box ({@link Band}): from the narrowest width at which any choice
 * reads, each width at which the choices taken ({@link takenAt}) change, to the last, from which
 * every choice that can stand there does. A choice passed over changes nothing until the box is
 * as wide as it needs, so the choices taken change only at those widths, and between two of them
 * the band's choices hold. Every choice stays in the hotspot's row.
 *
 * Only the bands the page can show are given. A band is in sight from its own width until the
 * next band's, and the last at every wider one; the box is never drawn narrower than its share of
 * the stage's floor width, so a band the next takes over from below that width is never in sight.
 * The box's least width is taken in whole pixels, rounded down, so the page's rounding never
 * leaves the box narrower than the first band given.
 *
 * @param choices The choices the hotspot holds, measured and marked, in the order its row shows
 *   them.
 * @param box The area's box, in the image's pixels.
 * @param narrowest The narrowest the page draws the box, across in CSS px: its share of the
 *   stage's floor width (`floorWidthOf` in `#plate/graphic/scale.ts`).
 * @returns The bands the box can show, narrowest first; none where no choice can stand in it.
 */
export const bandsOf = (
  choices: readonly FitChoice[],
  box: FitBox,
  narrowest: number,
): readonly Band[] => {
  const measured = choices.map(measuredOf);
  const bands: Band[] = [];

  let width = takenAt(measured, box, -1).next;

  while (Number.isFinite(width)) {
    const { layout, next, places } = takenAt(measured, box, width);
    const last = bands.at(-1);

    if (
      layout !== undefined &&
      (last === undefined || last.places.join(" ") !== places.join(" "))
    ) {
      bands.push({ from: Math.ceil(width), places, size: layout.size });
    }

    width = next;
  }

  const reach = Math.floor(narrowest - 2 * cardMetrics.inset);

  return bands.filter((_, index) =>
    bands.slice(index + 1, index + 2).every((next) => next.from >= reach),
  );
};
