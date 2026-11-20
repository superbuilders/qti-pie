/**
 * Rubric Block (I-11) in the server shell: the view of a `qti-rubric-block`'s content node, the
 * block the Rubric Block module kept for the view the item is shown to
 * (`#plate/content/rubric.ts`), written as plate's Rubric part with the block's content written as
 * the body is.
 *
 * The part is `plate-rubric`, a `div`. `data-use` carries the block's `use` as written
 * (`instructions`, `scoring`, `navigation` or an `ext:` name), so a host can set instructions apart
 * from the rest, and `lang` the block's `xml:lang` when it wrote one. QTI places a rubric block
 * only where flow content stands, so the `div` stands where the HTML parser keeps it.
 *
 * The body walk (`#plate/ui/item/content.tsx`) imports this file, so it imports nothing of the
 * walk: what the node holds is written through {@link ContentWalk.nodes}.
 *
 * @module
 */
import { Option } from "effect";
import { createElement } from "react";
import type { ReactNode } from "react";
import type { ContentPayload } from "#plate/content/modules.ts";
import type { ContentWalk } from "#plate/ui/item/content.tsx";

/**
 * A `qti-rubric-block`'s content node, as the redacted body holds it.
 */
type RubricContent = Extract<ContentPayload, { readonly element: "qti-rubric-block" }>;

/**
 * Render a `qti-rubric-block`'s content node as the Rubric part.
 *
 * @param node The node, as the Rubric Block module's `copy` gives it.
 * @param walk Its key, the walk where it stands and the way to write what it holds.
 * @returns The `plate-rubric` part, holding the block's content.
 */
export const content = (node: RubricContent, walk: ContentWalk): ReactNode =>
  createElement(
    "div",
    {
      "data-slot": "plate-rubric",
      "data-use": node.payload.use,
      key: walk.key,
      lang: Option.getOrUndefined(node.payload.lang),
    },
    walk.nodes(node.payload.nodes),
  );
