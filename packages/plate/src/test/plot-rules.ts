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
 * @module
 */
import type { Option } from "effect";
import type { StageScale, TargetFloor } from "#plate/graphic/scale.ts";

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
const targets = { enhanced: 44, minimum: 24 } as const;

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

      if (Math.abs(drawn - targets[floor]) > 1e-9) {
        return `a ${String(smallest)} px region draws ${String(drawn)} px at ${floor}`;
      }
    }
  }

  return undefined;
};
