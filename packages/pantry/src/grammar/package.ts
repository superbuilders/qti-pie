/**
 * The closed relations of a content package's manifest: the resource types a `cp:resource` may
 * name, and the root kind of the documents each one lists (fin.md §17, "qti-pie, erased").
 *
 * A text whose legal values are fixed is a roster, so a resource's `type` is a `ResourceType`
 * handle, spelled exactly as its lexical form, which is how the attribute's lexical form derives
 * its code. Which types a resource may name is the content-packaging XSD's enumeration, which the
 * attribute's value domain states (spec reading `manifest-profile`), so no relation states it
 * again. `RootOfType` is a set of those handles' rows, and grizzle packs it into a constant with no
 * table.
 */
import { closed, idField, indexed, roster } from "#pantry/grammar/closed.ts";
import type { IdField, Indexed, Roster } from "#pantry/grammar/closed.ts";

/**
 * The root element kind of the documents one resource type lists.
 */
export interface RootOf {
  readonly root: string;
  readonly type: string;
}

/**
 * A vocabulary's share of the package relations: the resource types it states, and the root kinds
 * of the documents a type lists, stated by the vocabulary of the root kind, or by XInclude's for an
 * included fragment, whose root may be a kind of any vocabulary an include stands for.
 */
export interface PackageFacet {
  readonly resourceTypes: readonly string[];
  readonly roots: readonly RootOf[];
}

/**
 * The package relations of a composition, `K` the `NodeKind` handles its roots range over.
 */
export interface PackageGrammar<K extends string = string> {
  /**
   * The `ResourceType` roster.
   */
  readonly resourceType: Roster<string>;
  /**
   * `RootOfType`, the set of (resource type, root element kind) pairs: each type that lists
   * documents with the kinds their roots may be, the law on a `Document`'s (resource type, root
   * kind) cell (`root-type-reverse`). Each type but one has one root; an included fragment's type
   * has every kind an include stands for (spec reading `include-as-information-model`). A type
   * absent from it lists no document.
   */
  readonly rootOfType: Indexed<readonly [IdField<"type", string>, IdField<"root", K>], readonly []>;
}

/**
 * Generate the package relations over a composition's rosters.
 *
 * @param input - The rosters and each vocabulary's facet.
 * @param input.kinds - The `NodeKind` roster, which `RootOfType`'s roots range over.
 * @param input.facets - The vocabularies' facets.
 * @returns The relations. grizzle refuses a type two facets list when it declares the
 *   `ResourceType` roster, and a root kind the roster does not hold when it declares the relation.
 */
export const packageGrammar = (input: {
  readonly facets: readonly PackageFacet[];
  readonly kinds: Roster<string>;
}): PackageGrammar => {
  const resourceType = roster(
    "ResourceType",
    input.facets.flatMap((facet) => facet.resourceTypes),
  );
  const type = idField("type", resourceType);

  return {
    resourceType,
    rootOfType: indexed(
      closed({
        key: [type, idField("root", input.kinds)],
        name: "RootOfType",
        payload: [],
        rows: input.facets.flatMap((facet) => facet.roots),
      }),
    ),
  };
};
