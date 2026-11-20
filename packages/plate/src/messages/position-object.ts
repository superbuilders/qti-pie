/**
 * The English texts of the Position Object interaction's stage island and review (Q-17,
 * `#plate/ui/position-object/`). One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * Position Object's texts, keyed by the role each plays. `{object}` is the object's name, what its
 * image shows as text or its alternative text, else `positionObjectObjectOf`, `{n}` its place among
 * the item's Position Objects in document order and `{count}` how many there are, so a nameless
 * image is still named (WCAG 1.1.1). `{x}` and `{y}` are a position on the stage in the stage
 * image's own pixels, the point QTI records, from its left and from its top; `{n}` in
 * `positionObjectPosition` is a placed copy's place among the object's copies, in the order they
 * were placed.
 *
 * The island says `positionObjectPicked` when a copy is picked up, from the object or from the
 * stage, `positionObjectAt` as the arrow keys move it, `positionObjectPlaced` or
 * `positionObjectMoved` when it is put on the stage, `positionObjectRemoved` when a placed copy
 * goes back, `positionObjectCanceled` when a held copy is put down where it was, and
 * `positionObjectFull` when a copy past `max-choices` is refused. Each placed copy's control, and
 * its line in a review, is named `positionObjectPosition`. Each interaction's controls stand in an
 * application whose role a screen reader names `positionObjectRole`, since the arrow keys move a
 * held copy. A stage's region is named by its image's
 * text alternative, else `positionObjectStage`, since QTI gives a Position Object no prompt.
 */
export const positionObjectMessages = {
  positionObjectAt: "{x} across, {y} down.",
  positionObjectAtLeast: "Place the object at least {n} times.",
  positionObjectAtLeastOne: "Place the object at least once.",
  positionObjectAtMost: "Place the object at most {n} times.",
  positionObjectAtMostOne: "Place the object at most once.",
  positionObjectCanceled: "{object} put back where it was.",
  positionObjectFull: "There is no room for another {object}. Move one, or take one off first.",
  positionObjectHalfPoint: "Give each position as two whole numbers, x and y.",
  positionObjectMoved: "{object} moved to {x} across, {y} down.",
  positionObjectObjectOf: "Object {n} of {count}",
  positionObjectOffStage:
    "Place each position on the stage: x from 0 to {width}, y from 0 to {height}.",
  positionObjectPicked:
    "{object} picked up. Tap the picture where it goes, or move it with the arrow keys and press it again.",
  positionObjectPlaced: "{object} put at {x} across, {y} down.",
  positionObjectPosition: "{object} {n}: {x} across, {y} down",
  positionObjectRemoved: "{object} taken off the picture.",
  positionObjectRole: "object to place",
  positionObjectStage: "Picture",
} as const;
