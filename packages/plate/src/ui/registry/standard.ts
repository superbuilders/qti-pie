/**
 * Plate's standard renderers: QTI's own presentation of every interaction kind, each kind's
 * renderer the file of its own under `#plate/ui/item/interactions/`, so a kind's lane edits its own
 * file alone. A host that renders plain QTI hands these to `<Item>`; one that extends them composes
 * them first (`renderersOf` in `#plate/ui/registry/compose.ts`).
 *
 * @module
 */
import * as associate from "#plate/ui/item/interactions/associate.tsx";
import * as choice from "#plate/ui/item/interactions/choice.tsx";
import * as endAttempt from "#plate/ui/item/interactions/end-attempt.tsx";
import * as extendedText from "#plate/ui/item/interactions/extended-text.tsx";
import * as gapMatch from "#plate/ui/item/interactions/gap-match.tsx";
import * as graphicAssociate from "#plate/ui/item/interactions/graphic-associate.tsx";
import * as graphicGapMatch from "#plate/ui/item/interactions/graphic-gap-match.tsx";
import * as graphicOrder from "#plate/ui/item/interactions/graphic-order.tsx";
import * as hotspot from "#plate/ui/item/interactions/hotspot.tsx";
import * as hottext from "#plate/ui/item/interactions/hottext.tsx";
import * as inlineChoice from "#plate/ui/item/interactions/inline-choice.tsx";
import * as match from "#plate/ui/item/interactions/match.tsx";
import * as media from "#plate/ui/item/interactions/media.tsx";
import * as order from "#plate/ui/item/interactions/order.tsx";
import * as portableCustom from "#plate/ui/item/interactions/portable-custom.tsx";
import * as positionObject from "#plate/ui/item/interactions/position-object.tsx";
import * as selectPoint from "#plate/ui/item/interactions/select-point.tsx";
import * as slider from "#plate/ui/item/interactions/slider.tsx";
import * as textEntry from "#plate/ui/item/interactions/text-entry.tsx";
import type { Renderers } from "#plate/ui/registry/contract.ts";

/**
 * The renderer of every module kind, each its own file's: in `answering` its island, in `review`
 * and `solution` its server markup, and for Text Entry and Inline Choice, which stand inside the
 * author's sentence, the right answer a review writes after the block that holds them.
 */
export const standardRenderers: Renderers = {
  associate,
  choice,
  "end-attempt": endAttempt,
  "extended-text": extendedText,
  "gap-match": gapMatch,
  "graphic-associate": graphicAssociate,
  "graphic-gap-match": graphicGapMatch,
  "graphic-order": graphicOrder,
  hotspot,
  hottext,
  "inline-choice": inlineChoice,
  match,
  media,
  order,
  "portable-custom": portableCustom,
  "position-object": positionObject,
  "select-point": selectPoint,
  slider,
  "text-entry": textEntry,
};
