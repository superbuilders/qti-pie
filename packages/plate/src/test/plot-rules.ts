/**
 * Test support for a Graphic Gap Match's plot, plate's renderer vocabulary on it: the rules written
 * apart from plate's code, and walks that find the first case where plate and the rules disagree.
 * The plot's property (`#plate/graphic/plot.test.ts`) walks plate's own modules, and each of its
 * kills walks a mutant copy of plate in a program of its own.
 *
 * The lattice's rule (R10, the owner's Q4): a Graphic Gap Match whose root's class holds the whole
 * token `plate-lattice` keeps WCAG 2.5.8's 24 px target; every other one keeps 2.5.5's 44 px; a
 * stage's least scale makes its smallest tap region exactly that wide.
 *
 * The dot plot's rule (M44, AlphaTest's line plot, GraphicHotspotInteraction.tsx 377 and 619): a
 * column's choices stand in equal steps up from the bottom of its box, the first placed lowest,
 * each step the box's height over the column's `match-max`, or over the choices it holds where it
 * has no limit.
 *
 * @module
 */
import type { Option } from "effect";
import type { StageScale, TargetFloor } from "#plate/graphic/scale.ts";
import type { Figure, PlotChoice, PlotSpot } from "#plate/graphic/plot.ts";
import type { PlotKind } from "#plate/interactions/plot-roles.ts";

/**
 * What a lattice walk checks, from one program, plate's or a mutant copy's.
 */
export interface LatticeSubject {
  readonly floorOf: (classes: Option.Option<string>) => TargetFloor;
  readonly some: (value: string) => Option.Option<string>;
  readonly none: Option.Option<string>;
  readonly stageScaleOf: (smallestTarget: number, floor: TargetFloor) => StageScale;
}

/**
 * Root classes and whether each makes a lattice, by the rule: the whole token, anywhere in the
 * list, in any whitespace HTML splits on.
 */
const latticeCases: readonly (readonly [string | undefined, boolean])[] = [
  ["plate-lattice", true],
  ["qti-selections-dark plate-lattice", true],
  ["plate-lattice\tqti-unselected-hidden", true],
  ["\nplate-lattice\n", true],
  [undefined, false],
  ["", false],
  ["plate-lattices", false],
  ["xplate-lattice", false],
  ["Plate-Lattice", false],
  ["plate-graph-line", false],
  ["qti-unselected-hidden", false],
];

/**
 * The target each floor keeps, in CSS px, by WCAG 2.2: 2.5.8's minimum and 2.5.5's enhanced.
 */
const targetSizes = { enhanced: 44, minimum: 24 } as const;

/**
 * Walk the lattice's cases and every smallest tap region from 1 to 200 authored px at both floors,
 * and give the first disagreement with the rule.
 *
 * @param subject The program's modules.
 * @returns The disagreement, undefined where every case agrees.
 */
export const walkLattice = (subject: LatticeSubject): string | undefined => {
  for (const [classes, lattice] of latticeCases) {
    const floor = subject.floorOf(classes === undefined ? subject.none : subject.some(classes));

    if (floor !== (lattice ? "minimum" : "enhanced")) {
      return `the class ${JSON.stringify(classes)} keeps ${floor}`;
    }
  }

  for (let smallest = 1; smallest <= 200; smallest += 1) {
    for (const floor of ["enhanced", "minimum"] as const) {
      const drawn = subject.stageScaleOf(smallest, floor).floor * smallest;

      if (Math.abs(drawn - targetSizes[floor]) > 1e-9) {
        return `a ${String(smallest)} px region draws ${String(drawn)} px at ${floor}`;
      }
    }
  }

  return undefined;
};

/**
 * The caption's choice the bank caption's walk calls: plate's own, or a mutant copy's.
 */
export interface BankCaptionSubject {
  readonly bankCaptionKeyOf: (classes: Option.Option<string>, choices: number) => string;
  readonly some: (value: string) => Option.Option<string>;
  readonly none: Option.Option<string>;
}

/**
 * The root classes the bank caption's walk reads, each with whether the rule calls the stage a
 * graph: `plate-lattice` as a token, or exactly one plot class as a token, the five plate draws.
 */
const captionClasses: readonly (readonly [string | undefined, boolean])[] = [
  [undefined, false],
  ["", false],
  ["qti-unselected-hidden", false],
  ["plate-lattices", false],
  ["Plate-Lattice", false],
  ["plate-lattice", true],
  ["qti-selections-dark	plate-lattice", true],
  ["plate-number-line-graph", true],
  ["plate-graph-line", true],
  ["plate-graph-segment", true],
  ["plate-box-plot", true],
  ["plate-dot-plot", true],
  ["plate-lattice plate-number-line-graph", true],
  ["plate-graph-line plate-box-plot", false],
  ["plate-lattice plate-graph-line plate-box-plot", true],
  ["xplate-dot-plot", false],
];

/**
 * Walk the bank caption's cases, every class above with every count of choices from 0 to 4, and
 * give the first disagreement with the rule: a graph's bank says "VALUE" for one choice and
 * "VALUES" for any other count, and a picture's says "ANSWER" (`bankCaptionKeyOf` in
 * `#plate/interactions/plot-roles.ts`).
 *
 * @param subject The program's modules.
 * @returns The disagreement, undefined where every case agrees.
 */
export const walkBankCaption = (subject: BankCaptionSubject): string | undefined => {
  for (const [classes, graph] of captionClasses) {
    for (let choices = 0; choices <= 4; choices += 1) {
      const said = subject.bankCaptionKeyOf(
        classes === undefined ? subject.none : subject.some(classes),
        choices,
      );
      const value = choices === 1 ? "bankCaptionValue" : "bankCaptionValues";
      const rule = graph ? value : "bankCaption";

      if (said !== rule) {
        return `the class ${JSON.stringify(classes)} with ${String(choices)} choices says ${said}`;
      }
    }
  }

  return undefined;
};

/**
 * A figure as the rules give it, in the image's pixels, rounded to a thousandth so floating
 * error never decides a comparison, its two ends sorted for a line or a whisker, whose direction
 * means nothing.
 */
type Drawn = string;

/**
 * One gap text of a plot's case: its identifier, and the statistic or the dot its class names.
 */
interface CaseChoice {
  readonly identifier: string;
  readonly point: "closed" | "open" | undefined;
  readonly statistic: "max" | "median" | "min" | "q1" | "q3" | undefined;
}

/**
 * One hotspot of a plot's case: a `rect` as `coords` write it, and the statistic given on it.
 */
interface CaseSpot {
  readonly coords: readonly [number, number, number, number];
  readonly identifier: string;
  readonly statistic: CaseChoice["statistic"];
}

/**
 * What a plot walk checks, from one program, plate's or a mutant copy's: the plot's figures and the
 * readers of plate's classes.
 */
export interface PlotSubject {
  readonly figuresOf: (
    kind: PlotKind,
    choices: readonly PlotChoice[],
    spots: readonly PlotSpot[],
    placements: readonly { readonly chip: string; readonly target: string }[],
    size: { readonly height: number; readonly width: number },
    shade: "left" | "right" | undefined,
  ) => readonly Figure[];
  readonly none: Option.Option<string>;
  readonly plotKindOf: (classes: Option.Option<string>) => PlotKind;
  readonly pointStyleOf: (classes: Option.Option<string>) => Option.Option<string>;
  readonly shadeDirectionOf: (
    link: {
      readonly left: string | undefined;
      readonly name: string;
      readonly right: string | undefined;
    },
    picked: readonly string[],
  ) => string | undefined;
  readonly shadeOf: (classes: Option.Option<string>) => Option.Option<string>;
  readonly some: (value: string) => Option.Option<string>;
  readonly statisticOf: (classes: Option.Option<string>) => Option.Option<string>;
  readonly stepsOf: (
    column: StepArea,
    capacity: { readonly kind: "none" } | { readonly kind: "at-most"; readonly n: number },
    held: number,
    size: { readonly height: number; readonly width: number },
  ) => readonly StepArea[];
  readonly value: (option: Option.Option<string>) => string | undefined;
}

/**
 * An area as a dot plot's steps read and give it: its geometry and its coordinates.
 */
interface StepArea {
  readonly coords: readonly { readonly percent: boolean; readonly value: number }[];
  readonly geometry: "circle" | "default" | "ellipse" | "poly" | "rect";
}

/**
 * Round a coordinate to a thousandth, as {@link Drawn} writes it.
 *
 * @param value The coordinate.
 * @returns Its text.
 */
const at = (value: number): string => (Math.round(value * 1000) / 1000).toFixed(3);

/**
 * Write a segment between two points, its ends sorted.
 *
 * @param kind The figure.
 * @param a One end.
 * @param a.x Its x.
 * @param a.y Its y.
 * @param b The other.
 * @param b.x Its x.
 * @param b.y Its y.
 * @returns Its text.
 */
const segment = (
  kind: string,
  a: { readonly x: number; readonly y: number },
  b: { readonly x: number; readonly y: number },
): Drawn => `${kind} ${[`${at(a.x)},${at(a.y)}`, `${at(b.x)},${at(b.y)}`].toSorted().join(" ")}`;

/**
 * Write a figure plate drew as the rules write one.
 *
 * @param figure The figure.
 * @returns Its text.
 */
const drawnOf = (figure: Figure): Drawn => {
  switch (figure.kind) {
    case "line": {
      return segment("line", { x: figure.x1, y: figure.y1 }, { x: figure.x2, y: figure.y2 });
    }
    case "whisker": {
      return segment("whisker", { x: figure.x1, y: figure.y }, { x: figure.x2, y: figure.y });
    }
    case "cap":
    case "median": {
      return segment(
        figure.kind,
        { x: figure.x, y: figure.top },
        { x: figure.x, y: figure.bottom },
      );
    }
    case "box": {
      return `box ${at(figure.left)},${at(figure.top)} ${at(figure.right)},${at(figure.bottom)}`;
    }
    case "point": {
      return `point ${figure.dot} ${at(figure.x)},${at(figure.y)}`;
    }
    case "ray": {
      return `ray ${figure.toward} ${at(figure.x1)},${at(figure.y)} ${at(figure.x2)},${at(figure.y)}`;
    }
    default: {
      return figure satisfies never;
    }
  }
};

/**
 * A rect hotspot's middle and its height.
 *
 * @param spot The hotspot.
 * @returns Its middle and height.
 */
const middleOf = (spot: CaseSpot) => ({
  height: spot.coords[3] - spot.coords[1],
  x: (spot.coords[0] + spot.coords[2]) / 2,
  y: (spot.coords[1] + spot.coords[3]) / 2,
});

/**
 * Give where the line through two points crosses the four edges of a box, as AlphaTest's
 * `extendLineToBox` found them: an upright line its top and bottom, a level one its left and right,
 * any other the crossing of each edge's line.
 *
 * @param a One point.
 * @param a.x Its x.
 * @param a.y Its y.
 * @param b The other.
 * @param b.x Its x.
 * @param b.y Its y.
 * @param box The box.
 * @param box.bottom Its bottom.
 * @param box.left Its left.
 * @param box.right Its right.
 * @param box.top Its top.
 * @returns The crossings, some outside the box.
 */
const edgeCrossings = (
  a: { readonly x: number; readonly y: number },
  b: { readonly x: number; readonly y: number },
  box: {
    readonly bottom: number;
    readonly left: number;
    readonly right: number;
    readonly top: number;
  },
): readonly { readonly x: number; readonly y: number }[] => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 0) {
    return [
      { x: a.x, y: box.top },
      { x: a.x, y: box.bottom },
    ];
  }

  if (dy === 0) {
    return [
      { x: box.left, y: a.y },
      { x: box.right, y: a.y },
    ];
  }

  return [
    { x: box.left, y: a.y + (dy / dx) * (box.left - a.x) },
    { x: box.right, y: a.y + (dy / dx) * (box.right - a.x) },
    { x: a.x + (dx / dy) * (box.top - a.y), y: box.top },
    { x: a.x + (dx / dy) * (box.bottom - a.y), y: box.bottom },
  ];
};

/**
 * The rules' figures for a line graph, as AlphaTest's line graphs drew them
 * (`GraphicGapMatchLines.tsx`, `extendLineToBox`): a gap text placed on two different hotspots
 * draws the line through their middles, between the two as a segment, or to where it meets the
 * edges of the box all the hotspots span as a line; a gap text placed once, or twice on one
 * hotspot, draws none.
 *
 * @param reach Segment or line.
 * @param choices The gap texts.
 * @param spots The hotspots.
 * @param placements The placements.
 * @returns The figures.
 */
const expectedLines = (
  reach: "line" | "segment",
  choices: readonly CaseChoice[],
  spots: readonly CaseSpot[],
  placements: readonly { readonly chip: string; readonly target: string }[],
): readonly Drawn[] => {
  const left = Math.min(...spots.map((spot) => spot.coords[0]));
  const top = Math.min(...spots.map((spot) => spot.coords[1]));
  const right = Math.max(...spots.map((spot) => spot.coords[2]));
  const bottom = Math.max(...spots.map((spot) => spot.coords[3]));

  return choices.flatMap((choice) => {
    const reached = [
      ...new Set(placements.filter((p) => p.chip === choice.identifier).map((p) => p.target)),
    ];
    const [a, b] = reached.map((target) => {
      const spot = spots.find((each) => each.identifier === target);

      return spot === undefined ? undefined : middleOf(spot);
    });

    if (reached.length !== 2 || a === undefined || b === undefined) {
      return [];
    }

    if (reach === "segment") {
      return [segment("line", a, b)];
    }

    const candidates = edgeCrossings(a, b, { bottom, left, right, top });
    const inside = candidates.filter(
      (p) => p.x >= left - 1e-9 && p.x <= right + 1e-9 && p.y >= top - 1e-9 && p.y <= bottom + 1e-9,
    );
    const unique = inside.filter(
      (p, index) =>
        inside.findIndex((q) => Math.abs(q.x - p.x) < 1e-6 && Math.abs(q.y - p.y) < 1e-6) === index,
    );
    const [from, to] = unique;

    return from === undefined || to === undefined ? [] : [segment("line", from, to)];
  });
};

/**
 * The rules' figures for a box plot, as AlphaTest's box plot drew them (`BoxPlotInteraction.tsx`
 * 195-198, 404-440): each statistic stands on the hotspot its gap text is first placed on, else the
 * one it is given on, at that strip's middle, the number line; the plot is drawn 64 px above the
 * line; a whisker joins the minimum to the first quartile and the third quartile to the maximum
 * where both stand, capped at the far end 14 px each side; the box spans the quartiles 30 px each
 * side; and the median crosses it as tall as the box.
 *
 * @param choices The gap texts.
 * @param spots The hotspots.
 * @param placements The placements.
 * @returns The figures.
 */
const expectedBoxPlot = (
  choices: readonly CaseChoice[],
  spots: readonly CaseSpot[],
  placements: readonly { readonly chip: string; readonly target: string }[],
): readonly Drawn[] => {
  const stand = (statistic: CaseChoice["statistic"]) => {
    const chips = new Set(
      choices.filter((c) => c.statistic === statistic).map((c) => c.identifier),
    );
    const placed = placements.find((p) => chips.has(p.chip))?.target;
    const target = placed ?? spots.find((spot) => spot.statistic === statistic)?.identifier;
    const spot = spots.find((each) => each.identifier === target);

    return spot === undefined ? undefined : { x: middleOf(spot).x, y: middleOf(spot).y - 64 };
  };
  const [low, q1, median, q3, high] = (["min", "q1", "median", "q3", "max"] as const).map(stand);
  const whisker = (
    end: { readonly x: number; readonly y: number },
    quartile: { readonly x: number; readonly y: number },
  ): readonly Drawn[] => [
    segment("whisker", { x: quartile.x, y: end.y }, end),
    segment("cap", { x: end.x, y: end.y - 14 }, { x: end.x, y: end.y + 14 }),
  ];

  return [
    ...(low === undefined || q1 === undefined ? [] : whisker(low, q1)),
    ...(high === undefined || q3 === undefined ? [] : whisker(high, q3)),
    ...(q1 === undefined || q3 === undefined
      ? []
      : [
          `box ${at(Math.min(q1.x, q3.x))},${at(q1.y - 30)} ${at(Math.max(q1.x, q3.x))},${at(q1.y + 30)}`,
        ]),
    ...(median === undefined
      ? []
      : [segment("median", { x: median.x, y: median.y - 30 }, { x: median.x, y: median.y + 30 })]),
  ];
};

/**
 * The rules' figures for a number line, as AlphaTest's number line drew its endpoints and its ray
 * (`NumberLineSelectPoint.tsx` 240-253, 298-309): a dot, open or closed as its gap text's class
 * says, at the middle of every hotspot such a gap text is placed on, a gap text whose class names
 * no dot drawing none; and, where the shading interaction is answered and a dot stands, the ray
 * from the leftmost dot, AlphaTest's first sorted endpoint whichever way it runs, along its tick's
 * middle to the left or the right edge of the box the hotspots span.
 *
 * @param choices The gap texts.
 * @param spots The hotspots.
 * @param placements The placements.
 * @param shade Which way the shading runs, none while it is unanswered.
 * @returns The figures.
 */
const expectedPoints = (
  choices: readonly CaseChoice[],
  spots: readonly CaseSpot[],
  placements: readonly { readonly chip: string; readonly target: string }[],
  shade: "left" | "right" | undefined,
): readonly Drawn[] => {
  const dots = placements.flatMap((p) => {
    const style = choices.find((c) => c.identifier === p.chip)?.point;
    const spot = spots.find((each) => each.identifier === p.target);

    return style === undefined || spot === undefined ? [] : [{ style, ...middleOf(spot) }];
  });
  const [leftmost] = dots.toSorted((a, b) => a.x - b.x);
  const end =
    shade === "left"
      ? Math.min(...spots.map((spot) => spot.coords[0]))
      : Math.max(...spots.map((spot) => spot.coords[2]));

  return [
    ...dots.map((dot) => `point ${dot.style} ${at(dot.x)},${at(dot.y)}`),
    ...(leftmost === undefined || shade === undefined
      ? []
      : [`ray ${shade} ${at(leftmost.x)},${at(leftmost.y)} ${at(end)},${at(leftmost.y)}`]),
  ];
};

/**
 * Every list of `n` places from `values`, each place independently.
 *
 * @template T A value.
 * @param values The values a place takes.
 * @param n How many places.
 * @returns Every list.
 */
const lists = <T>(values: readonly T[], n: number): readonly (readonly T[])[] =>
  n === 0 ? [[]] : values.flatMap((value) => lists(values, n - 1).map((rest) => [value, ...rest]));

/**
 * Root classes and the plot each asks for, by the rule: the one plot whose class is a whole token,
 * and none where none, or two, are.
 */
const plotCases: readonly (readonly [string | undefined, string])[] = [
  ["plate-graph-line", "line"],
  ["plate-graph-segment", "segment"],
  ["plate-box-plot plate-lattice", "box-plot"],
  ["qti-x plate-number-line-graph", "number-line"],
  ["plate-lattice plate-dot-plot", "dot-plot"],
  ["plate-graph-line plate-graph-segment", "plain"],
  ["plate-dot-plot plate-box-plot", "plain"],
  ["plate-dot-plots", "plain"],
  ["plate-box-plot plate-number-line-graph", "plain"],
  ["plate-lattice", "plain"],
  ["plate-graph-lines", "plain"],
  ["", "plain"],
  [undefined, "plain"],
];

/**
 * Gap-text classes and the statistic and the dot each names, by the rule: one whole token, none
 * where none or two are.
 */
const roleCases: readonly (readonly [string, string | undefined, string | undefined])[] = [
  ["plate-stat-min", "min", undefined],
  ["plate-stat-q1", "q1", undefined],
  ["x plate-stat-median", "median", undefined],
  ["plate-stat-q3", "q3", undefined],
  ["plate-stat-max", "max", undefined],
  ["plate-stat-min plate-stat-max", undefined, undefined],
  ["plate-stat-mean", undefined, undefined],
  ["plate-point-open", undefined, "open"],
  ["plate-point-closed y", undefined, "closed"],
  ["plate-point-open plate-point-closed", undefined, undefined],
  ["plate-point", undefined, undefined],
  ["", undefined, undefined],
];

/**
 * Shading choices' classes and the way each runs the ray, by the rule: one whole token, none where
 * none or both are.
 */
const shadeCases: readonly (readonly [string, string | undefined])[] = [
  ["plate-shade-left", "left"],
  ["x plate-shade-right", "right"],
  ["plate-shade-left plate-shade-right", undefined],
  ["plate-shade", undefined],
  ["plate-shade-up", undefined],
  ["", undefined],
];

/**
 * A shading interaction's answers and the way each runs the ray, by the rule: left where it picks
 * the left choice, right where it picks the right one, none while it picks neither.
 */
const pickedCases: readonly (readonly [readonly string[], string | undefined])[] = [
  [["L"], "left"],
  [["R"], "right"],
  [[], undefined],
  [["X"], undefined],
];

/**
 * A grid of three by three 10 px `rect` cells, a line graph's lattice.
 */
const cells: readonly CaseSpot[] = lists([0, 1, 2], 2).map(([row = 0, column = 0]) => ({
  coords: [column * 10, row * 10, column * 10 + 10, row * 10 + 10],
  identifier: `C${String(row)}${String(column)}`,
  statistic: undefined,
}));

/**
 * Five 10 px wide strips 40 px tall along a number line, a box plot's or a number line's ticks.
 */
const strips: readonly CaseSpot[] = [0, 1, 2, 3, 4].map((tick) => ({
  coords: [tick * 10, 0, tick * 10 + 10, 40],
  identifier: `T${String(tick)}`,
  statistic: undefined,
}));

/**
 * Walk the readers of plate's classes: every root class of {@link plotCases}, shading class of
 * {@link shadeCases}, shading answer of {@link pickedCases} and gap-text class of
 * {@link roleCases}, and give the first disagreement with the rules.
 *
 * @param subject The program's modules.
 * @returns The disagreement, undefined where every case agrees.
 */
const walkReaders = (subject: PlotSubject): string | undefined => {
  const read = (classes: string | undefined) =>
    classes === undefined ? subject.none : subject.some(classes);
  const named = (option: Option.Option<string>) => String(subject.value(option));
  const plots = plotCases.flatMap(([classes, kind]) =>
    subject.plotKindOf(read(classes)) === kind
      ? []
      : [`the root's class ${JSON.stringify(classes)} draws ${subject.plotKindOf(read(classes))}`],
  );
  const shades = shadeCases.flatMap(([classes, direction]) =>
    subject.value(subject.shadeOf(read(classes))) === direction
      ? []
      : [
          `the class ${JSON.stringify(classes)} runs the ray ${named(subject.shadeOf(read(classes)))}`,
        ],
  );
  const picks = pickedCases.flatMap(([picked, direction]) => {
    const ran = subject.shadeDirectionOf({ left: "L", name: "t.SHADE", right: "R" }, picked);

    return ran === direction
      ? []
      : [`picking ${JSON.stringify(picked)} runs the ray ${String(ran)}`];
  });
  const roles = roleCases.flatMap(([classes, statistic, point]) => [
    ...(subject.value(subject.statisticOf(read(classes))) === statistic
      ? []
      : [
          `the class ${JSON.stringify(classes)} names the statistic ${named(subject.statisticOf(read(classes)))}`,
        ]),
    ...(subject.value(subject.pointStyleOf(read(classes))) === point
      ? []
      : [
          `the class ${JSON.stringify(classes)} names the dot ${named(subject.pointStyleOf(read(classes)))}`,
        ]),
  ]);

  return [...plots, ...shades, ...picks, ...roles][0];
};

/**
 * One case of a plot: what it draws, its gap texts, its hotspots, its placements, the figures the
 * rules give it, and which way its shading runs.
 */
interface PlotCase {
  readonly choices: readonly CaseChoice[];
  readonly expected: readonly Drawn[];
  readonly kind: "box-plot" | "line" | "number-line" | "segment";
  readonly placements: readonly { readonly chip: string; readonly target: string }[];
  readonly shade: "left" | "right" | undefined;
  readonly spots: readonly CaseSpot[];
}

/**
 * Check one case of a plot: plate's figures, written as the rules write them and sorted, against
 * the rules'.
 *
 * @param subject The program's modules.
 * @param held The case.
 * @returns The disagreement, undefined where they agree.
 */
const checkPlot = (subject: PlotSubject, held: PlotCase): string | undefined => {
  const drawn = subject
    .figuresOf(
      held.kind,
      held.choices,
      held.spots.map((spot) => ({
        coords: spot.coords.map((value) => ({ percent: false, value })),
        geometry: "rect" as const,
        identifier: spot.identifier,
        statistic: spot.statistic,
      })),
      held.placements,
      { height: 300, width: 300 },
      held.shade,
    )
    .map(drawnOf)
    .toSorted();
  const wanted = held.expected.toSorted();

  return drawn.join("|") === wanted.join("|")
    ? undefined
    : JSON.stringify({
        drawn,
        kind: held.kind,
        placements: held.placements,
        shade: held.shade,
        wanted,
      });
};

/**
 * Place each of some gap texts on the hotspot its slot names, or nowhere for an empty slot.
 *
 * @param choices The gap texts.
 * @param slotted Each one's hotspot, in order, undefined for none.
 * @returns The placements.
 */
const placedIn = (
  choices: readonly CaseChoice[],
  slotted: readonly (string | undefined)[],
): readonly { readonly chip: string; readonly target: string }[] =>
  choices.flatMap((choice, index) => {
    const target = slotted[index];

    return target === undefined ? [] : [{ chip: choice.identifier, target }];
  });

/**
 * Every case of the plot's box: lines and segments of two gap texts on the 3 by 3 lattice, each
 * placed on no cell, on one, or on two, the same cell twice included; box plots of five statistic
 * gap texts each on no strip or one of five, and again with the median given on the middle strip
 * and no gap text for it; and number lines of an open, a closed and a dotless gap text, each on no
 * strip or one, with the shading unanswered, run left and run right.
 *
 * @returns The cases.
 */
const plotCasesOf = (): readonly PlotCase[] => {
  const lineChoices: readonly CaseChoice[] = ["A", "B"].map((identifier) => ({
    identifier,
    point: undefined,
    statistic: undefined,
  }));
  const twoPlacements = [
    [],
    ...cells.map((cell) => [cell.identifier]),
    ...cells.flatMap((cell, index) =>
      cells.slice(index).map((other) => [cell.identifier, other.identifier]),
    ),
  ];
  const lines = (["line", "segment"] as const).flatMap((reach) =>
    lists(twoPlacements, 2).map(([a = [], b = []]): PlotCase => {
      const placements = [
        ...a.map((target) => ({ chip: "A", target })),
        ...b.map((target) => ({ chip: "B", target })),
      ];

      return {
        choices: lineChoices,
        expected: expectedLines(reach, lineChoices, cells, placements),
        kind: reach,
        placements,
        shade: undefined,
        spots: cells,
      };
    }),
  );
  const statChoices: readonly CaseChoice[] = (["min", "q1", "median", "q3", "max"] as const).map(
    (statistic) => ({ identifier: statistic.toUpperCase(), point: undefined, statistic }),
  );
  const slots = [undefined, ...strips.map((strip) => strip.identifier)];
  const boxes = [false, true].flatMap((given) => {
    const spots = given
      ? strips.map((strip) =>
          strip.identifier === "T2" ? { ...strip, statistic: "median" as const } : strip,
        )
      : strips;
    const choices = given ? statChoices.filter((c) => c.statistic !== "median") : statChoices;

    return lists(slots, choices.length).map((slotted): PlotCase => {
      const placements = placedIn(choices, slotted);

      return {
        choices,
        expected: expectedBoxPlot(choices, spots, placements),
        kind: "box-plot",
        placements,
        shade: undefined,
        spots,
      };
    });
  });
  const pointChoices: readonly CaseChoice[] = [
    { identifier: "O", point: "open", statistic: undefined },
    { identifier: "C", point: "closed", statistic: undefined },
    { identifier: "N", point: undefined, statistic: undefined },
  ];
  const numberLines = ([undefined, "left", "right"] as const).flatMap((shade) =>
    lists(slots, pointChoices.length).map((slotted): PlotCase => {
      const placements = placedIn(pointChoices, slotted);

      return {
        choices: pointChoices,
        expected: expectedPoints(pointChoices, strips, placements, shade),
        kind: "number-line",
        placements,
        shade,
        spots: strips,
      };
    }),
  );

  return [...lines, ...boxes, ...numberLines];
};

/**
 * Dot plot columns, each with the box the rule reads from it, in the image's pixels: a `rect`
 * written from its top left, one written from its bottom right, one in percentages of a 400 by 300
 * image, and a `poly` whose box is its vertices'.
 */
const columns: readonly (readonly [
  StepArea,
  { readonly bottom: number; readonly left: number; readonly right: number; readonly top: number },
])[] = [
  [
    { coords: [100, 40, 140, 300].map((value) => ({ percent: false, value })), geometry: "rect" },
    { bottom: 300, left: 100, right: 140, top: 40 },
  ],
  [
    { coords: [260, 290, 220, 50].map((value) => ({ percent: false, value })), geometry: "rect" },
    { bottom: 290, left: 220, right: 260, top: 50 },
  ],
  [
    { coords: [10, 10, 20, 90].map((value) => ({ percent: true, value })), geometry: "rect" },
    { bottom: 270, left: 40, right: 80, top: 30 },
  ],
  [
    {
      coords: [300, 60, 340, 60, 340, 280, 300, 280].map((value) => ({ percent: false, value })),
      geometry: "poly",
    },
    { bottom: 280, left: 300, right: 340, top: 60 },
  ],
];

/**
 * Walk every column of {@link columns} at every `match-max` from 1 to 6 holding from none to that
 * many, and with no limit holding from none to four, and give the first whose steps differ from
 * the rule's.
 *
 * @param subject The program's modules.
 * @returns The disagreement, undefined where every case agrees.
 */
const walkSteps = (subject: PlotSubject): string | undefined => {
  const limits = [
    ...[1, 2, 3, 4, 5, 6].map((n) => ({ capacity: { kind: "at-most", n } as const, most: n })),
    { capacity: { kind: "none" } as const, most: 4 },
  ];

  for (const [column, box] of columns) {
    for (const { capacity, most } of limits) {
      for (let held = 0; held <= most; held += 1) {
        const per = (box.bottom - box.top) / (capacity.kind === "at-most" ? capacity.n : held);
        const rule = Array.from({ length: held }, (_, place) => [
          box.left,
          box.bottom - (place + 1) * per,
          box.right,
          box.bottom - place * per,
        ]);
        const steps = subject.stepsOf(column, capacity, held, { height: 300, width: 400 });
        const agrees =
          steps.length === rule.length &&
          steps.every(
            (step, place) =>
              step.geometry === "rect" &&
              step.coords.length === 4 &&
              step.coords.every(
                (coordinate, index) =>
                  !coordinate.percent &&
                  Math.abs(coordinate.value - (rule[place]?.[index] ?? Number.NaN)) < 1e-9,
              ),
          );

        if (!agrees) {
          return `a ${column.geometry} column of ${JSON.stringify(capacity)} holding ${String(held)} stands them in ${JSON.stringify(steps)}, not ${JSON.stringify(rule)}`;
        }
      }
    }
  }

  return undefined;
};

/**
 * Walk the plot's readers ({@link walkReaders}), a dot plot's steps ({@link walkSteps}) and every
 * case of its box ({@link plotCasesOf}), and give the first disagreement between plate and the
 * rules.
 *
 * @param subject The program's modules.
 * @returns The disagreement, undefined where every case agrees.
 */
export const walkPlot = (subject: PlotSubject): string | undefined => {
  const readers = walkReaders(subject) ?? walkSteps(subject);

  if (readers !== undefined) {
    return readers;
  }

  for (const held of plotCasesOf()) {
    const found = checkPlot(subject, held);

    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
};
