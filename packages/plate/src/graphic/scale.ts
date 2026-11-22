/**
 * The least scale a graphic interaction's stage renders at, so every area is a target a child can
 * hit: 44 CSS px across, the size WCAG 2.2's 2.5.5 Target Size (Enhanced) sets, past the 24 px of
 * 2.5.8 Target Size (Minimum), so the stage never leans on 2.5.8's exception for an equivalent
 * control. Pure, and safe to import on the server and the client.
 *
 * An area's target size is the diameter of the largest circle its tap region holds, the points a
 * tap gives it once the areas listed before it have taken the points they share (`tapDiameterOf` in
 * `#plate/graphic/geometry.ts`): a pointer anywhere in that circle is on the area. The stage
 * scales the image, its overlay and every area together, by one factor, so QTI's coordinates stay
 * in the image's authored pixels, the overlay's `viewBox`; the smallest area's diameter, in those
 * pixels, decides the least factor, `floor`. Above it the stylesheet draws the stage as large as
 * its container's width and the host's height budget allow, the image's proportions kept (the
 * stage's sizing, `#plate/ui/graphic/frame.tsx`), above or below the author's own size, and the
 * stage's own region scrolls across where the container is narrower than the floor, the page never
 * (spec-readings reading 184).
 *
 * @module
 * @see https://www.w3.org/TR/WCAG22/#target-size-enhanced
 * @see https://www.w3.org/TR/WCAG22/#target-size-minimum
 */
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { tapDiameterOf } from "#plate/graphic/geometry.ts";
import type { GraphicArea } from "#plate/graphic/geometry.ts";

/**
 * The least factor a stage scales its authored size by, `floor`: the one at which its smallest
 * target is 44 CSS px across, below the author's size where the targets are larger than that, and
 * 0 for a stage with no target, whose image may be drawn at any size.
 */
export interface StageScale {
  readonly floor: number;
}

/**
 * The target size a stage never draws an area under: 2.5.5's 44 CSS px.
 */
const enhancedTarget = 44;

/**
 * Give the least scale a stage renders at from its smallest target, in authored pixels: the one
 * that makes it 44 px across.
 *
 * @param smallestTarget The smallest target's diameter in the image's authored pixels, more than
 *   0; infinite for a stage with no target, whose floor is 0.
 * @returns The scale.
 */
export const stageScaleOf = (smallestTarget: number): StageScale => ({
  floor: enhancedTarget / smallestTarget,
});

/**
 * The smallest target of each set of areas measured, by the image size it was measured at: the
 * measure searches every overlapping area's region, so a stage that renders again with the same
 * areas reads it here. Keyed by the areas' array, which an island holds for its life.
 */
const measured = new WeakMap<readonly GraphicArea[], Map<string, number>>();

/**
 * Find the smallest target among a stage's areas: the least diameter of an area's tap region, the
 * points a tap gives it once the areas listed before it have taken theirs (`tapDiameterOf`), so an
 * area another overlaps counts at the size a child can actually hit. An area whose region holds no
 * point, one that holds none itself or one wholly hidden by earlier ones, is no target; its
 * hotspot is reached through the interaction's list alone.
 *
 * @param areas The stage's areas, in document order.
 * @param size The image's authored size, which percentages are of.
 * @returns The diameter in authored pixels; infinite when no area is a target.
 */
export const smallestTargetOf = (areas: readonly GraphicArea[], size: ImageSize): number => {
  const key = `${String(size.width)}x${String(size.height)}`;
  const known = measured.get(areas)?.get(key);
  if (known !== undefined) {
    return known;
  }

  const smallest = Math.min(
    ...areas.map((_, index) => tapDiameterOf(areas, index, size) ?? Number.POSITIVE_INFINITY),
    Number.POSITIVE_INFINITY,
  );
  const sizes = measured.get(areas) ?? new Map<string, number>();

  sizes.set(key, smallest);
  measured.set(areas, sizes);

  return smallest;
};

/**
 * Give the width a stage never goes below, in whole CSS px: its authored width times its floor,
 * rounded up to a whole pixel so rounding never takes a target under its size.
 *
 * @param size The image's authored size.
 * @param scale The stage's scale.
 * @returns The width.
 */
export const floorWidthOf = (size: ImageSize, scale: StageScale): number =>
  Math.ceil(size.width * scale.floor);
