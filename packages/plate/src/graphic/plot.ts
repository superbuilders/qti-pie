/**
 * What a Graphic Gap Match draws of its plot beyond the standard interaction, by plate's renderer
 * vocabulary on its root (`rendererClasses` in `#plate/vocabulary.ts`): pure, and safe to import on
 * the server and the client alike, so the island and the review read one rule.
 *
 * @module
 */
import type { Option } from "effect";
import type { TargetFloor } from "#plate/graphic/scale.ts";
import { carriesRendererClass } from "#plate/vocabulary.ts";

/**
 * Give the target size a Graphic Gap Match's hotspots keep on its stage: 24 px where its root
 * carries `plate-lattice`, a graph whose hotspots tile its plot, else 44 px (`TargetFloor` in
 * `#plate/graphic/scale.ts`).
 *
 * @param classes The class the root carries, none when it carries none.
 * @returns The floor.
 */
export const floorOf = (classes: Option.Option<string>): TargetFloor =>
  carriesRendererClass(classes, "plate-lattice") ? "minimum" : "enhanced";
