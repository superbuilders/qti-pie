/**
 * The badge a Graphic Order draws on each ordered area: its position's number, which the island
 * draws while the child answers and the review draws on the server with no island. Safe to import
 * on the server and the client: it holds no hook and no state.
 *
 * @module
 */
import type { ReactNode } from "react";
import { badgeRadius } from "#plate/ui/graphic/drawn.tsx";
import type { AnswerMark } from "#plate/ui/item/interactions/marks.ts";

/**
 * Draw one badge, `data-slot="plate-graphic-order-badge"`, centred on its origin, which
 * `CornerPin` (`#plate/ui/graphic/drawn.tsx`) places inside its area's corner, a disc wide enough
 * for a two-digit number at the size the stylesheet gives it; its disc,
 * `plate-graphic-order-badge-disc`, and its number, `plate-graphic-order-badge-number`, which the
 * stylesheet sizes, are in CSS px whatever the image's scale. Every geometry is an SVG attribute,
 * never a `style`.
 *
 * @param props.children The position's number, as the page writes it.
 * @param props.mark The review's mark on the position, none while the child answers and where the
 *   review marks nothing.
 * @returns The badge.
 */
export const Badge = (props: {
  readonly children: ReactNode;
  readonly mark: AnswerMark | undefined;
}) => (
  <g data-mark={props.mark} data-slot="plate-graphic-order-badge">
    <circle data-slot="plate-graphic-order-badge-disc" r={badgeRadius} />
    <text
      data-slot="plate-graphic-order-badge-number"
      dominantBaseline="central"
      textAnchor="middle"
    >
      {props.children}
    </text>
  </g>
);
