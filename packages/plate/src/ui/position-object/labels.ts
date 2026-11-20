/**
 * The words a Position Object says: what happens to a copy of its object as the child picks it up,
 * moves it, puts it on the stage or takes it off, why a copy is refused, and the name of each copy
 * placed. The server fills them from plate's message catalog and passes them to the island as plain
 * strings, so no wording ships in the client's code; the island fills their placeholders with the
 * object's name and the copy's position.
 *
 * @module
 */
import type { LabelKeys, Labels } from "#plate/ui/item/interactions/labels.ts";

/**
 * The catalog's message for every text a Position Object writes for the child, each placeholder
 * filled by the island.
 */
export const positionObjectKeys = {
  /**
   * Said as the arrow keys move a held copy: `{x}`, `{y}`.
   */
  at: "positionObjectAt",
  /**
   * Said when a held copy is put down where it was: `{object}`.
   */
  canceled: "positionObjectCanceled",
  /**
   * Said and shown when a copy past `max-choices` is refused: `{object}`.
   */
  full: "positionObjectFull",
  /**
   * Said when a placed copy is put down in a new place: `{object}`, `{x}`, `{y}`.
   */
  moved: "positionObjectMoved",
  /**
   * Said when a copy is picked up: `{object}`.
   */
  picked: "positionObjectPicked",
  /**
   * Said when a new copy is put on the stage: `{object}`, `{x}`, `{y}`.
   */
  placed: "positionObjectPlaced",
  /**
   * The name of a placed copy's control: `{object}`, `{n}`, `{x}`, `{y}`.
   */
  position: "positionObjectPosition",
  /**
   * Said when a placed copy is taken off the stage: `{object}`.
   */
  removed: "positionObjectRemoved",
  /**
   * The role description of each interaction's controls, an application the arrow keys work in,
   * which a screen reader says in place of "application".
   */
  role: "positionObjectRole",
} as const satisfies LabelKeys<
  "at" | "canceled" | "full" | "moved" | "picked" | "placed" | "position" | "removed" | "role"
>;

/**
 * Every text a Position Object writes for the child, as the server filled it.
 */
export type PositionObjectLabels = Labels<typeof positionObjectKeys>;
