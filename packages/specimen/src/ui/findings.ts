/**
 * The rules the suite's pages break today, each where on the page and in which modes it breaks it,
 * and whose the defect is: plate's, or a library's plate renders with. Plate's UI suite holds each
 * as a test that expects to fail, and judges every other offence against the rule.
 *
 * @module
 */
import type { Array as Arr } from "effect";
import type { Where } from "#specimen/ui/rendered.ts";
import type { Offence, RuleName } from "#specimen/ui/rules.ts";
import type { Showing } from "#specimen/ui/showing.ts";

/**
 * Whose a finding's defect is: plate's, which a lane of the QTI UI overhaul
 * (`proposals/2026-11-16-qti-ui-overhaul`) fixes, or a library's plate renders with, whose fix
 * goes upstream as its issue says.
 */
export type Source =
  | { readonly kind: "plate"; readonly lane: string }
  | { readonly issue: string; readonly kind: "upstream"; readonly library: string };

/**
 * A reference UI SDK writes before it binds to a part the page may not render: the attribute, and
 * the part the id it names is for. UI SDK names a part `ui-sdk-<id>-<part>`
 * (https://github.com/vercel-labs/ui/issues/788).
 */
export interface PartReference {
  readonly attribute: "aria-describedby" | "aria-labelledby";
  readonly part: "description" | "label";
}

/**
 * A rule the suite's pages break on the corpus, where on the page and in which modes they break it,
 * the exact references that break it, and whose the defect is: a known finding, which its own test
 * expects to fail until its source is fixed, so the rule's own test holds everywhere else, any
 * other dangling reference included, and a fix shows as that test passing.
 */
export interface Finding {
  /**
   * The modes the rule breaks in there; it holds in every other.
   */
  readonly modes: Arr.NonEmptyReadonlyArray<Showing["mode"]>;
  /**
   * The references that break it, each by its attribute and the part its id names.
   */
  readonly references: Arr.NonEmptyReadonlyArray<PartReference>;
  readonly rule: "I2";
  /**
   * What breaks the rule, in a sentence.
   */
  readonly says: string;
  readonly source: Source;
  readonly where: Where;
}

/**
 * Every known finding, found by this suite's first run on 2026-11-16.
 */
export const findings: readonly Finding[] = [
  {
    modes: ["answering"],
    references: [
      { attribute: "aria-labelledby", part: "label" },
      { attribute: "aria-describedby", part: "description" },
    ],
    rule: "I2",
    says: "a Text Entry's input names, by aria-labelledby and aria-describedby, the UI SDK Field label and description the page does not render",
    source: {
      issue: "pre-hydration references, https://github.com/vercel-labs/ui/issues/788",
      kind: "upstream",
      library: "@ui-sdk/react",
    },
    where: "text-entry",
  },
  {
    modes: ["answering"],
    references: [
      { attribute: "aria-labelledby", part: "label" },
      { attribute: "aria-describedby", part: "description" },
    ],
    rule: "I2",
    says: "an Extended Text's textarea names, by aria-labelledby and aria-describedby, the UI SDK Field label and description the page does not render",
    source: {
      issue: "pre-hydration references, https://github.com/vercel-labs/ui/issues/788",
      kind: "upstream",
      library: "@ui-sdk/react",
    },
    where: "extended-text",
  },
  {
    modes: ["answering"],
    references: [{ attribute: "aria-labelledby", part: "label" }],
    rule: "I2",
    says: "an Inline Choice's trigger names, by aria-labelledby, a UI SDK Select label the page does not render",
    source: {
      issue: "pre-hydration references, https://github.com/vercel-labs/ui/issues/788",
      kind: "upstream",
      library: "@ui-sdk/react",
    },
    where: "inline-choice",
  },
];

/**
 * Tell whether an offence is a finding's: its rule breaks where the finding says, in a mode it
 * says, by a reference it names, a UI SDK part's id under one of its attributes.
 *
 * @param finding The finding.
 * @param rule The rule the offence breaks.
 * @param offence The offence.
 * @param mode The mode of the page it stands on.
 * @returns Whether the finding holds it.
 */
export const holds = (
  finding: Finding,
  rule: RuleName,
  offence: Offence,
  mode: Showing["mode"],
): boolean =>
  finding.rule === rule &&
  finding.where === offence.where &&
  finding.modes.includes(mode) &&
  offence.kind === "dangling" &&
  finding.references.some(
    ({ attribute, part }) =>
      offence.reference.attribute === attribute &&
      offence.reference.id.startsWith("ui-sdk-") &&
      offence.reference.id.endsWith(`-${part}`),
  );

/**
 * Tell whether an offence is any known finding's, so a rule's own search does not judge it again.
 *
 * @param rule The rule the offence breaks.
 * @param offence The offence.
 * @param mode The mode of the page it stands on.
 * @returns Whether a finding holds it.
 */
export const known = (rule: RuleName, offence: Offence, mode: Showing["mode"]): boolean =>
  findings.some((finding) => holds(finding, rule, offence, mode));

/**
 * Name a finding's source as its test names it.
 *
 * @param source The source.
 * @returns `plate, for <lane>`, or `upstream in <library> (<issue>)`.
 */
export const sourceName = (source: Source): string => {
  switch (source.kind) {
    case "plate": {
      return `plate, for ${source.lane}`;
    }
    case "upstream": {
      return `upstream in ${source.library} (${source.issue})`;
    }
    default: {
      return source satisfies never;
    }
  }
};
