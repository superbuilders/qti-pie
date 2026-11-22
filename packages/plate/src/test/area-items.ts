/**
 * Test support for the graphic kinds' area names: an item of each kind that draws areas an author
 * names or leaves unnamed (Graphic Gap Match, Graphic Order and Graphic Associate), its six areas
 * named by `hotspot-label`, by nothing, by a blank `hotspot-label`, by `aria-label` alone, by
 * `aria-label` beside a blank `hotspot-label`, and by a blank `aria-label`. The verdict's test
 * reads the names the core gives them (`#plate/interactions/area-labels.test.ts`), and the shell's
 * (`#plate/ui/item/interactions/areas.test.ts`) the rows that show them; both open the same
 * documents, which the database admitted.
 *
 * @module
 */

/**
 * One graphic kind as an item of it is written: its interaction element and the attributes it is
 * written with, the element of its areas, the response its binding declares, and the children it
 * holds before its areas.
 */
export interface AreaKind {
  readonly area: "qti-associable-hotspot" | "qti-hotspot-choice";
  readonly attributes: string;
  readonly declaration: string;
  readonly element: string;
  readonly leading: string;
  /**
   * The attributes every area of the kind is written with beyond its identifier, its shape, its
   * coordinates and its label.
   */
  readonly limits: string;
}

/**
 * Graphic Gap Match, bound as the information model binds it.
 */
export const graphicGapMatchKind: AreaKind = {
  area: "qti-associable-hotspot",
  attributes: 'max-associations="2"',
  declaration: 'cardinality="multiple" base-type="directedPair"',
  element: "qti-graphic-gap-match-interaction",
  leading: '<qti-gap-text identifier="A" match-max="1">Field</qti-gap-text>',
  limits: 'match-max="1"',
};

/**
 * The three kinds, each bound as the information model binds it.
 */
export const areaKinds: readonly AreaKind[] = [
  graphicGapMatchKind,
  {
    area: "qti-hotspot-choice",
    attributes: "",
    declaration: 'cardinality="ordered" base-type="identifier"',
    element: "qti-graphic-order-interaction",
    leading: "",
    limits: "",
  },
  {
    area: "qti-associable-hotspot",
    attributes: 'max-associations="2"',
    declaration: 'cardinality="multiple" base-type="pair"',
    element: "qti-graphic-associate-interaction",
    leading: "",
    limits: 'match-max="1"',
  },
];

/**
 * Write an item of a kind whose six areas are named by `hotspot-label`, by nothing, by a blank
 * `hotspot-label`, by `aria-label` alone, by `aria-label` beside a blank `hotspot-label`, and by a
 * blank `aria-label`: so the core names the first "The field", the fourth "The pond" and the fifth
 * "The barn", and the second, the third and the sixth nothing.
 *
 * @param kind The kind.
 * @returns The item's XML.
 */
export const areaItemOf = (kind: AreaKind): string =>
  [
    '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="labels" title="Labels" adaptive="false" time-dependent="false">',
    `<qti-response-declaration identifier="RESPONSE" ${kind.declaration}/>`,
    "<qti-item-body>",
    `<${kind.element} response-identifier="RESPONSE" ${kind.attributes}>`,
    '<img src="map.svg" alt="A farm" width="400" height="300"/>',
    kind.leading,
    `<${kind.area} identifier="H1" shape="rect" coords="10,10,60,60" ${kind.limits} hotspot-label="The field"/>`,
    `<${kind.area} identifier="H2" shape="circle" coords="200,100,40" ${kind.limits}/>`,
    `<${kind.area} identifier="H3" shape="rect" coords="300,200,380,280" ${kind.limits} hotspot-label=" "/>`,
    `<${kind.area} identifier="H4" shape="rect" coords="10,200,60,250" ${kind.limits} aria-label="The pond"/>`,
    `<${kind.area} identifier="H5" shape="rect" coords="100,200,150,250" ${kind.limits} hotspot-label=" " aria-label="The barn"/>`,
    `<${kind.area} identifier="H6" shape="rect" coords="200,10,250,60" ${kind.limits} aria-label=" "/>`,
    `</${kind.element}>`,
    "</qti-item-body>",
    "</qti-assessment-item>",
  ].join("");
