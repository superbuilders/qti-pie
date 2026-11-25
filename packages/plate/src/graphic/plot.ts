/**
 * What a Graphic Gap Match draws of its plot beyond the standard interaction, from the plot its
 * root's class asks for and what its gap texts and hotspots are to it, which the server reads from
 * plate's renderer vocabulary (`#plate/interactions/plot-roles.ts`): pure, and safe to import on
 * the server and the client alike, so the island and the review draw from one rule. It reads no
 * class itself, so a page that draws a plot loads no reader of plate's vocabulary.
 *
 * Every figure stands where the hotspots its choices are placed on stand, each hotspot's middle
 * (`interiorOf` in `#plate/graphic/geometry.ts`), so a lattice point's cell or a tick's strip
 * places it on the point or the tick; and the plot's box is the box the hotspots span, which a
 * lattice's cells tile. Nothing here reads or changes a response.
 *
 * @module
 */
import { Array as Arr } from "effect";
import type {
  PlotKind,
  PointStyle,
  ShadeDirection,
  Statistic,
} from "#plate/interactions/plot-roles.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import type { Limit } from "#plate/placement/limit.ts";
import type { Pairs } from "#plate/placement/machine.ts";
import { boundsOf, drawingOf, interiorOf } from "#plate/graphic/geometry.ts";
import type { Box, GraphicArea, ImagePoint } from "#plate/graphic/geometry.ts";
import type { Declared } from "#plate/model/values.ts";

/**
 * The item's shading interaction as a number line reads it (`plate-shade` on a
 * `qti-choice-interaction`): its response, as its declaration types it, and its choices that run
 * the ray left and right (`plate-shade-left`, `plate-shade-right`), undefined where it has none.
 */
export interface ShadeLink {
  readonly left: string | undefined;
  readonly response: Declared<"identifier", "multiple" | "single">;
  readonly right: string | undefined;
}

/**
 * Read which way the ray runs from the shading interaction's response: left where it holds the
 * left choice, else right where it holds the right one, else none, while it is unanswered.
 *
 * @param link The shading interaction.
 * @param picked The identifiers its response holds.
 * @returns The direction, undefined for none.
 */
export const shadeDirectionOf = (
  link: ShadeLink,
  picked: readonly string[],
): ShadeDirection | undefined => {
  if (link.left !== undefined && picked.includes(link.left)) {
    return "left";
  }

  return link.right !== undefined && picked.includes(link.right) ? "right" : undefined;
};

/**
 * A gap text as the plot reads it: its identifier, the dot its class asks for, and the statistic
 * its class says it places.
 */
export interface PlotChoice {
  readonly identifier: string;
  readonly point: PointStyle | undefined;
  readonly statistic: Statistic | undefined;
}

/**
 * A hotspot as the plot reads it: its area, its identifier, and the statistic its class says is
 * given on it.
 */
export interface PlotSpot extends GraphicArea {
  readonly identifier: string;
  readonly statistic: Statistic | undefined;
}

/**
 * One figure the plot draws, in the image's pixels:
 *
 * - `line`, through a gap text's two placements, `choice` the gap text, to the plot's edges or
 *   between the two;
 * - `whisker`, a box plot's line from a quartile out to the minimum or the maximum, and `cap`, the
 *   short upright at its far end;
 * - `box`, from the first quartile to the third, and `median`, the upright across it;
 * - `point`, a number line's dot, open or closed (`dot`), and `ray`, its shading from the leftmost
 *   dot to the line's left or right end (`toward`).
 */
export type Figure =
  | {
      readonly choice: string;
      readonly kind: "line";
      readonly x1: number;
      readonly x2: number;
      readonly y1: number;
      readonly y2: number;
    }
  | { readonly kind: "whisker"; readonly x1: number; readonly x2: number; readonly y: number }
  | { readonly bottom: number; readonly kind: "cap"; readonly top: number; readonly x: number }
  | {
      readonly bottom: number;
      readonly kind: "box";
      readonly left: number;
      readonly right: number;
      readonly top: number;
    }
  | { readonly bottom: number; readonly kind: "median"; readonly top: number; readonly x: number }
  | { readonly dot: PointStyle; readonly kind: "point"; readonly x: number; readonly y: number }
  | {
      readonly kind: "ray";
      readonly toward: ShadeDirection;
      readonly x1: number;
      readonly x2: number;
      readonly y: number;
    };

/**
 * A hotspot where it stands: its middle and its box.
 */
interface Stand {
  readonly box: Box;
  readonly middle: ImagePoint;
}

/**
 * Find where each hotspot stands, by its identifier: its middle and its box, for every hotspot
 * that holds a point.
 *
 * @param spots The hotspots.
 * @param size The image's size, the pixel space of their coordinates.
 * @returns Each one's stand.
 */
const standsOf = (spots: readonly PlotSpot[], size: ImageSize): ReadonlyMap<string, Stand> =>
  new Map(
    spots.flatMap((spot) => {
      const drawing = drawingOf(spot, size);

      return drawing === undefined
        ? []
        : [[spot.identifier, { box: boundsOf(drawing), middle: interiorOf(drawing) }] as const];
    }),
  );

/**
 * Give the box every stand spans together, the plot's.
 *
 * @param stands The stands.
 * @returns The box, none where there is no stand.
 */
const plotBoxOf = (stands: readonly Stand[]): Box | undefined =>
  stands.length === 0
    ? undefined
    : {
        bottom: Arr.reduce(
          stands.map((stand) => stand.box.bottom),
          Number.NEGATIVE_INFINITY,
          (most, each) => Math.max(most, each),
        ),
        left: Arr.reduce(
          stands.map((stand) => stand.box.left),
          Number.POSITIVE_INFINITY,
          (least, each) => Math.min(least, each),
        ),
        right: Arr.reduce(
          stands.map((stand) => stand.box.right),
          Number.NEGATIVE_INFINITY,
          (most, each) => Math.max(most, each),
        ),
        top: Arr.reduce(
          stands.map((stand) => stand.box.top),
          Number.POSITIVE_INFINITY,
          (least, each) => Math.min(least, each),
        ),
      };

/**
 * Give the range of a line's parameter for which it lies between two values along one axis, the
 * slab between them: all of it for a line that runs along the slab.
 *
 * @param from Where the line starts along the axis, at parameter 0.
 * @param delta How far it moves along the axis per unit of parameter.
 * @param low The slab's lower edge.
 * @param high The slab's upper edge.
 * @returns The parameter where it enters the slab, and where it leaves.
 */
const slab = (from: number, delta: number, low: number, high: number) =>
  delta === 0
    ? ([Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY] as const)
    : ([
        Math.min((low - from) / delta, (high - from) / delta),
        Math.max((low - from) / delta, (high - from) / delta),
      ] as const);

/**
 * Give the part of the line through two points that a box holds, by clipping the line's
 * parameter to each of the box's two slabs.
 *
 * @param a One point.
 * @param b The other, not `a`.
 * @param box The box, which holds both.
 * @returns The two ends, on the box's edges.
 */
const throughBox = (a: ImagePoint, b: ImagePoint, box: Box): readonly [ImagePoint, ImagePoint] => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const [xEnter, xLeave] = slab(a.x, dx, box.left, box.right);
  const [yEnter, yLeave] = slab(a.y, dy, box.top, box.bottom);
  const enter = Math.max(xEnter, yEnter);
  const leave = Math.min(xLeave, yLeave);

  return [
    { x: a.x + enter * dx, y: a.y + enter * dy },
    { x: a.x + leave * dx, y: a.y + leave * dy },
  ];
};

/**
 * Draw the lines through each gap text placed on exactly two different hotspots, in the order the
 * gap texts stand: between the two for a `segment`, to the plot's edges for a `line`.
 *
 * @param reach How far each line runs.
 * @param choices The gap texts.
 * @param stands Where each hotspot stands.
 * @param placements The placements.
 * @returns The lines.
 */
const linesOf = (
  reach: "line" | "segment",
  choices: readonly PlotChoice[],
  stands: ReadonlyMap<string, Stand>,
  placements: Pairs,
): readonly Figure[] => {
  const box = plotBoxOf([...stands.values()]);

  return choices.flatMap((choice): readonly Figure[] => {
    const targets = [
      ...new Set(
        placements.filter((pair) => pair.chip === choice.identifier).map((pair) => pair.target),
      ),
    ];
    const [first, second] = targets.map((target) => stands.get(target)?.middle);

    if (targets.length !== 2 || first === undefined || second === undefined || box === undefined) {
      return [];
    }

    const [from, to] = reach === "segment" ? [first, second] : throughBox(first, second, box);

    return [
      { choice: choice.identifier, kind: "line", x1: from.x, x2: to.x, y1: from.y, y2: to.y },
    ];
  });
};

/**
 * Find where each statistic of a box plot stands: on the hotspot its gap text is first placed on,
 * else on the hotspot its class says it is given on.
 *
 * @param choices The gap texts.
 * @param spots The hotspots.
 * @param stands Where each hotspot stands.
 * @param placements The placements.
 * @param statistic The statistic.
 * @returns Its stand, none where it stands nowhere.
 */
const standOf = (
  choices: readonly PlotChoice[],
  spots: readonly PlotSpot[],
  stands: ReadonlyMap<string, Stand>,
  placements: Pairs,
  statistic: Statistic,
): Stand | undefined => {
  const placed = placements.find((pair) =>
    choices.some((choice) => choice.identifier === pair.chip && choice.statistic === statistic),
  );
  const given = spots.find((spot) => spot.statistic === statistic);
  const at = placed?.target ?? given?.identifier;

  return at === undefined ? undefined : stands.get(at);
};

/**
 * How far above its number line AlphaTest's player drew a box plot's middle, and the half height
 * of its box and of a whisker's cap, in its chart's pixels (`BoxPlotInteraction.tsx` 195-198, 407,
 * 413), which the converter draws the picture's number line at, so they are the picture's pixels.
 */
const boxRise = 64;

/**
 * The half height of a box plot's box ({@link boxRise}).
 */
const boxHalf = 30;

/**
 * The half height of a whisker's cap ({@link boxRise}).
 */
const capHalf = 14;

/**
 * Draw a box plot from where its statistics stand, as AlphaTest's player drew one: a whisker out
 * to the minimum where it and the first quartile stand, capped at the minimum, and one out to the
 * maximum where it and the third quartile stand; the box from the first quartile to the third; and
 * the median across it, all {@link boxRise} above the line, which each statistic's strip is centred
 * on.
 *
 * @param choices The gap texts.
 * @param spots The hotspots.
 * @param stands Where each hotspot stands.
 * @param placements The placements.
 * @returns The figures.
 */
const boxPlotOf = (
  choices: readonly PlotChoice[],
  spots: readonly PlotSpot[],
  stands: ReadonlyMap<string, Stand>,
  placements: Pairs,
): readonly Figure[] => {
  const at = (statistic: Statistic) => standOf(choices, spots, stands, placements, statistic);
  const [low, q1, median, q3, high] = [at("min"), at("q1"), at("median"), at("q3"), at("max")];
  const level = (stand: Stand) => stand.middle.y - boxRise;
  const whisker = (end: Stand, quartile: Stand): readonly Figure[] => [
    { kind: "whisker", x1: quartile.middle.x, x2: end.middle.x, y: level(end) },
    { bottom: level(end) + capHalf, kind: "cap", top: level(end) - capHalf, x: end.middle.x },
  ];

  return [
    ...(low === undefined || q1 === undefined ? [] : whisker(low, q1)),
    ...(high === undefined || q3 === undefined ? [] : whisker(high, q3)),
    ...(q1 === undefined || q3 === undefined
      ? []
      : [
          {
            bottom: level(q1) + boxHalf,
            kind: "box" as const,
            left: Math.min(q1.middle.x, q3.middle.x),
            right: Math.max(q1.middle.x, q3.middle.x),
            top: level(q1) - boxHalf,
          },
        ]),
    ...(median === undefined
      ? []
      : [
          {
            bottom: level(median) + boxHalf,
            kind: "median" as const,
            top: level(median) - boxHalf,
            x: median.middle.x,
          },
        ]),
  ];
};

/**
 * Give a number line's dots ({@link pointsOf}).
 *
 * @param choices The gap texts.
 * @param stands Where each hotspot stands.
 * @param placements The placements.
 * @returns The dots.
 */
const dotsOf = (
  choices: readonly PlotChoice[],
  stands: ReadonlyMap<string, Stand>,
  placements: Pairs,
): readonly Extract<Figure, { readonly kind: "point" }>[] =>
  placements.flatMap((pair): readonly Extract<Figure, { readonly kind: "point" }>[] => {
    const dot = choices.find((choice) => choice.identifier === pair.chip)?.point;
    const stand = stands.get(pair.target);

    return dot === undefined || stand === undefined
      ? []
      : [{ dot, kind: "point", x: stand.middle.x, y: stand.middle.y }];
  });

/**
 * Draw a number line's dots: one at each placement of a gap text whose class asks for one, open or
 * closed, on its tick's middle; and, where the item's shading interaction is answered, the ray
 * from the leftmost dot to the plot's left or right edge, as AlphaTest's number line shaded an
 * inequality from its first endpoint.
 *
 * @param choices The gap texts.
 * @param stands Where each hotspot stands.
 * @param placements The placements.
 * @param shade Which way the ray runs, none while the shading interaction is unanswered.
 * @returns The dots, then the ray.
 */
const pointsOf = (
  choices: readonly PlotChoice[],
  stands: ReadonlyMap<string, Stand>,
  placements: Pairs,
  shade: ShadeDirection | undefined,
): readonly Figure[] => {
  const dots = dotsOf(choices, stands, placements);
  const box = plotBoxOf([...stands.values()]);
  const [first] = dots.toSorted((a, b) => a.x - b.x);

  return first === undefined || shade === undefined || box === undefined
    ? dots
    : [
        ...dots,
        {
          kind: "ray",
          toward: shade,
          x1: first.x,
          x2: shade === "left" ? box.left : box.right,
          y: first.y,
        },
      ];
};

/**
 * Give the figures a Graphic Gap Match's plot draws for its placements.
 *
 * @param kind The plot.
 * @param choices The gap texts, in the order they stand.
 * @param spots The hotspots, in document order.
 * @param placements The placements, each a gap text on a hotspot.
 * @param size The image's size, the pixel space of the hotspots' coordinates.
 * @param shade Which way a number line's ray runs, none where nothing shades it.
 * @returns The figures, in the order they are drawn.
 */
export const figuresOf = (
  kind: PlotKind,
  choices: readonly PlotChoice[],
  spots: readonly PlotSpot[],
  placements: Pairs,
  size: ImageSize,
  shade: ShadeDirection | undefined,
): readonly Figure[] => {
  const stands = standsOf(spots, size);

  switch (kind) {
    case "line":
    case "segment": {
      return linesOf(kind, choices, stands, placements);
    }
    case "box-plot": {
      return boxPlotOf(choices, spots, stands, placements);
    }
    case "number-line": {
      return pointsOf(choices, stands, placements, shade);
    }
    case "dot-plot":
    case "plain": {
      return [];
    }
  }
};

/**
 * Give the steps a dot plot's column stands the choices it holds in (`plate-dot-plot`, M44): up
 * from the bottom of the column's box, as AlphaTest's line plot stacked its Xs up from the axis,
 * each step the box's height over the column's `match-max`, the most it holds, so a full column
 * reaches its top; and the box's height over the choices it holds where it has no limit. Each
 * step is a `rect` across the column's box, in the image's pixels, the first at its bottom, for the
 * choice placed first; the island and the review draw each choice in its own step as they draw a
 * hotspot's choices in its area (`#plate/ui/graphic-gap-match/placed.tsx`).
 *
 * @param column The column's area.
 * @param capacity The column's `match-max`.
 * @param held How many choices it holds.
 * @param size The image's size, the pixel space of the column's coordinates.
 * @returns A step for each choice it holds, bottom first; none for a column that holds no point.
 */
export const stepsOf = (
  column: GraphicArea,
  capacity: Limit,
  held: number,
  size: ImageSize,
): readonly GraphicArea[] => {
  const drawing = drawingOf(column, size);

  if (drawing === undefined) {
    return [];
  }

  const box = boundsOf(drawing);
  const step = (box.bottom - box.top) / (capacity.kind === "at-most" ? capacity.n : held);

  return Array.from({ length: held }, (_, at): GraphicArea => ({
    coords: [box.left, box.bottom - (at + 1) * step, box.right, box.bottom - at * step].map(
      (value) => ({ percent: false, value }),
    ),
    geometry: "rect",
  }));
};
