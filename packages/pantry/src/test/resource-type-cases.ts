/**
 * Reading `resource-href`'s law over a resource's type, as a small exhausted box: {one type, two
 * types, a type that spells nothing} × {one path, two paths}, each an edit of `simple`'s manifest.
 *
 * A document has one type, the one its root bears out among those its resources name (spec reading
 * `path-document-type`), so a path two resources name under two document types is refused under
 * "Document entry" (`entry-kind`) alone, never under RootOfType (package.ts's P3), in either order;
 * a resource whose `type` spells no handle names no type at all, so AL1's value domain refuses its
 * `type` alone (`attribute-lexical`, spec reading `manifest-profile`). The law oracle
 * (`resource-types.oracle.test.ts`) and PostgreSQL (`program.oracle.db.test.ts`) are each held to
 * the verdicts here.
 */
import type { Edit } from "#pantry/test/fixtures.ts";

/**
 * A stimulus document, the second document type the box writes.
 */
const stimulus =
  '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-stimulus xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="stim" title="Stimulus"><qti-stimulus-body><p>A stimulus.</p></qti-stimulus-body></qti-assessment-stimulus>\n';

/**
 * `simple`'s one resource as its manifest writes it.
 */
const choiceResource = 'type="imsqti_item_xmlv3p0" href="choice.xml"';

/**
 * The type `simple`'s item resource is written with.
 */
const itemType = "imsqti_item_xmlv3p0";

/**
 * The type of the box's stimulus resources.
 */
const stimulusType = "imsqti_stimulus_xmlv3p0";

/**
 * Add a resource to the manifest, its one file its href.
 *
 * @param identifier - Its identifier.
 * @param type - Its type, as written.
 * @param href - Its href.
 * @returns The edit.
 */
const resource = (identifier: string, type: string, href: string): Edit => ({
  _tag: "ReplaceText",
  file: "imsmanifest.xml",
  replacement: `<resource identifier="${identifier}" type="${type}" href="${href}"><file href="${href}"/></resource></resources>`,
  search: "</resources>",
});

/**
 * One case of the box: its edits of `simple`; the laws the law oracle finds broken; the verdict,
 * the specification's, which the oracle and PostgreSQL each give; the (target, type) pairs the
 * typed resources name in the package, the query `TypedPath`'s; and `byQuery`, whether the one law
 * the case breaks is a rule over that query, which the host's judge leaves to the database
 * (`#pantry/test/predicates.ts` `readsDerived`), so the import's rows judged on the host break
 * nothing.
 */
export interface ResourceTypeCase {
  readonly broken: readonly string[];
  readonly byQuery: boolean;
  readonly edits: readonly Edit[];
  readonly label: string;
  readonly named: readonly (readonly [string, string])[];
  readonly typed: number;
  readonly verdict:
    | { readonly verdict: "accepted" }
    | { readonly rule: "attribute-lexical" | "entry-kind"; readonly verdict: "refused" };
}
/**
 * How many document types a case's resources name: one, two, or one beside a type that spells
 * nothing.
 */
const TYPE_COUNTS = ["one type", "two types", "a type that spells nothing"] as const;

/**
 * How many paths a case's resources name.
 */
const PATH_COUNTS = ["one path", "two paths"] as const;

/**
 * A resource of a case's manifest as the law reads it: the path it names, its type as written, and
 * whether that type spells a handle.
 */
interface Listed {
  readonly href: string;
  readonly spelled: boolean;
  readonly type: string;
}

/**
 * A case's package as written: its edits of `simple`, and the resources its manifest lists, in the
 * manifest's order.
 */
interface Written {
  readonly edits: readonly Edit[];
  readonly listed: readonly Listed[];
}

/**
 * `simple`'s item resource, its type spelled.
 */
const choiceListed: Listed = { href: "choice.xml", spelled: true, type: itemType };

/**
 * Write a case's package: `simple`'s item resource, and beside it what the case's counts ask for.
 * One type and one path is `simple` as it is; one type and two paths a second item, a copy of the
 * first under an identifier of its own; two types and one path a stimulus resource naming the
 * item's path, listed after the item's resource or first; two types and two paths a stimulus of its
 * own; a type that spells nothing on one path the item resource's own type padded with a space, and
 * on two paths a stimulus of its own whose type is padded.
 *
 * @param types - How many types the resources name.
 * @param paths - How many paths they name.
 * @param stimulusFirst - Whether a stimulus resource that names the item's path is listed first.
 * @returns The package's edits and its listed resources.
 */
const writtenOf = (
  types: (typeof TYPE_COUNTS)[number],
  paths: (typeof PATH_COUNTS)[number],
  stimulusFirst: boolean,
): Written => {
  const ownStimulus: Edit = { _tag: "addFile", path: "stim.xml", source: { text: stimulus } };
  if (types === "one type") {
    return paths === "one path"
      ? { edits: [], listed: [choiceListed] }
      : {
          edits: [
            { _tag: "copyFile", from: "choice.xml", to: "choice2.xml" },
            {
              _tag: "ReplaceText",
              file: "choice2.xml",
              replacement: 'identifier="choice2"',
              search: 'identifier="choice"',
            },
            resource("choice2", itemType, "choice2.xml"),
          ],
          listed: [choiceListed, { href: "choice2.xml", spelled: true, type: itemType }],
        };
  }

  if (types === "two types") {
    const stimulusListed = {
      href: paths === "one path" ? "choice.xml" : "stim.xml",
      spelled: true,
      type: stimulusType,
    };
    if (paths === "two paths") {
      return {
        edits: [ownStimulus, resource("stim", stimulusType, "stim.xml")],
        listed: [choiceListed, stimulusListed],
      };
    }

    return stimulusFirst
      ? {
          edits: [
            {
              _tag: "ReplaceText",
              file: "imsmanifest.xml",
              replacement: `<resources><resource identifier="stim" type="${stimulusType}" href="choice.xml"><file href="choice.xml"/></resource>`,
              search: "<resources>",
            },
          ],
          listed: [stimulusListed, choiceListed],
        }
      : {
          edits: [resource("stim", stimulusType, "choice.xml")],
          listed: [choiceListed, stimulusListed],
        };
  }

  return paths === "one path"
    ? {
        edits: [
          {
            _tag: "ReplaceText",
            file: "imsmanifest.xml",
            replacement: choiceResource.replace(`type="${itemType}"`, `type=" ${itemType}"`),
            search: choiceResource,
          },
        ],
        listed: [{ ...choiceListed, spelled: false, type: ` ${itemType}` }],
      }
    : {
        edits: [ownStimulus, resource("stim", `${stimulusType} `, "stim.xml")],
        listed: [choiceListed, { href: "stim.xml", spelled: false, type: `${stimulusType} ` }],
      };
};

/**
 * Judge a case's package by the readings, from its listed resources alone: a resource whose type
 * spells no handle names no type, so AL1's value domain refuses its `type` (`attribute-lexical`,
 * reading `manifest-profile`); a path two resources name under two types is refused under Document
 * entry (`entry-kind`) alone, a rule over the typed hrefs (the query `TypedPath`), which the host's
 * judge leaves to the database, since a document has the one type its root bears out (reading
 * `path-document-type`), whichever resource is listed first; every other package is accepted. Each
 * spelled resource names its (path, type) pair.
 *
 * @param label - The case's name.
 * @param written - The case's package.
 * @returns The case, with the verdict the readings give it.
 */
const judgedCase = (label: string, { edits, listed }: Written): ResourceTypeCase => {
  const named = listed.flatMap(({ href, spelled, type }) =>
    spelled ? [[href, type] as const] : [],
  );
  const unspelled = listed.some(({ spelled }) => !spelled);
  const twoTyped = named.some(([href, type]) =>
    named.some(([otherHref, otherType]) => otherHref === href && otherType !== type),
  );
  const common = { edits, label, named, typed: named.length };
  if (unspelled) {
    return {
      ...common,
      broken: ["value domain"],
      byQuery: false,
      verdict: { rule: "attribute-lexical", verdict: "refused" },
    };
  }

  return twoTyped
    ? {
        ...common,
        broken: ["Document entry"],
        byQuery: true,
        verdict: { rule: "entry-kind", verdict: "refused" },
      }
    : { ...common, broken: [], byQuery: false, verdict: { verdict: "accepted" } };
};

/**
 * The box's cases: every count of types by every count of paths, and one path under two types with
 * the stimulus listed first too, seven in all, each judged by {@link judgedCase}. The document is
 * typed by the listing its item root bears out in either order (reading `path-document-type`), so
 * the verdict never turns on the order the resources are listed in.
 */
export const resourceTypeCases: readonly ResourceTypeCase[] = TYPE_COUNTS.flatMap((types) =>
  PATH_COUNTS.flatMap((paths) =>
    (types === "two types" && paths === "one path" ? [false, true] : [false]).map((stimulusFirst) =>
      judgedCase(
        `${types}, ${paths}${stimulusFirst ? ", the stimulus listed first" : ""}`,
        writtenOf(types, paths, stimulusFirst),
      ),
    ),
  ),
);
