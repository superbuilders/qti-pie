/**
 * The manifest overlays' rules over their node (`#pantry/qti/package.ts`), and the manifest's facts
 * no row stores. No relation stores a projection of the files or a resolution of the dependencies:
 * the paths a package's files name in it, the paths each resource's files name (a file's resource
 * is its node's parent), and the resource each dependency names are queries, and the laws over
 * them are rules over a query. Nor does a row copy an attribute (C18): the manifest's and each
 * resource's `identifier` and each dependency's `identifierref` is its attribute's `value`
 * ({@link manifestIdentifiers}, {@link resourceIdentifiers}, {@link Dependency}), and a `srcset`'s
 * form its
 * attribute's `lexical`, read beside its split ({@link SrcsetForm}).
 */
import { check, Compute, contained, derived, on, query, v } from "@bjornpagen/grizzle";
import { ReferenceAttribute } from "#pantry/grammar/install.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { attributeValues } from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import { File, listedEntries, ResourceHref, Srcset } from "#pantry/qti/package.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";

/**
 * The attributes of one name on the elements of one kind in the package's manifest, the document
 * at `imsmanifest.xml`, which `RootOfType` holds to be the manifest exactly there, by the element's
 * place in it, `(package, start)`: each attribute's `value` ({@link attributeValues}), which no row
 * copies (C18). A content packaging element of another document describes no part of the package
 * (170356bd's ruling), so its attributes are none, and the path is the manifest's alone, no field
 * of a row. An element that writes no such attribute has none, and AL3 refuses a required one.
 *
 * An identifier and an `identifierref` read here are an `xs:ID` and an `xs:IDREF`, whiteSpace
 * `collapse` types, so their `value` is their form collapsed: `" r1 "` and `r1` are one identifier,
 * and an `identifierref` written `" r1"` names `r1` (decision 457 (3); IMS Content Packaging 1.2,
 * §6.11.4, and §6.11.5: it "shall duplicate exactly a value for an Identifier object"). Every one
 * is in its domain wherever a law reads it: AL1's value domain is an IMMEDIATE row check over
 * `Attribute`, so a write of one outside it fails at its row, before any rule over a query is
 * judged, and no pattern here restates the domain, an NCName once collapsed (spec readings 152 and
 * 156).
 *
 * @param kind - The element's kind.
 * @param name - The attribute's name.
 * @returns The query.
 */
const manifestValuesOf = (
  kind: "cp:dependency" | "cp:manifest" | "cp:resource",
  name: "identifier" | "identifierref",
) => {
  const attributes = attributeValues(name, [kind]);

  return query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value } = v(attributes, "attribute");

    return r
      .match(attributes, { package: pkg, path, start, value })
      .where(r.eq(path, manifestPath))
      .find({ package: pkg, start, value });
  });
};

/**
 * The manifest's identifier ({@link manifestValuesOf}), one per package: the manifest is its
 * package's one `imsmanifest.xml`, whose root alone is a `cp:manifest`, since the CP profile's
 * `ManifestDType` holds no `manifest` and N5 admits none elsewhere, and its `identifier` is
 * required. It is the package's data and no key: IMS Content Packaging makes it "unique within the
 * Manifest" alone (1.2, §6.11.4), so two stored packages may hold one identifier, each under its
 * own name. A manifest's `version`, which IMS Content Packaging reads as what "distinguish[es]
 * between manifests with the same identifier", is its `Attribute` row as written, which no law
 * reads.
 *
 * It is a query, no relation, since nothing keys it or is contained in it: a package's lesson
 * (`Lesson` of `#pantry/qti/lom.ts`) matches it. Its identifier is an `xs:ID` of the manifest, one
 * of that document's IDs (`IdValue` of `#pantry/qti/names.ts`), which "DocumentId key" holds
 * distinct from every other ID of the document, the resources' among them, over its ID/IDREF
 * table (`IdBinding` of `#pantry/qti/overlay-queries/identity.ts`): the manifest's and its
 * resources' identifiers are one `xs:ID` space (IMS Content Packaging 1.2).
 */
export const manifestIdentifiers = manifestValuesOf("cp:manifest", "identifier");

/**
 * Each resource's identifier ({@link manifestValuesOf}), which a dependency's `identifierref` names
 * ("Dependency target") and a resource's educational description reads (`ResourceDescription` of
 * `#pantry/qti/lom.ts`). Like {@link manifestIdentifiers}, it is an `xs:ID` of the manifest, which
 * "DocumentId key" holds distinct over the manifest's ID/IDREF table, and a query, no relation.
 */
export const resourceIdentifiers = manifestValuesOf("cp:resource", "identifier");

/**
 * Each dependency's `identifierref` ({@link manifestValuesOf}), which names a resource of its
 * package, the one whose identifier it is. Its resource is its node's parent.
 */
const dependencyRefs = manifestValuesOf("cp:dependency", "identifierref");

/**
 * {@link dependencyRefs} as a relation of `Qti`, every one of which "Dependency target" holds to
 * name a resource.
 */
export const Dependency = derived("Dependency", dependencyRefs);

/**
 * The paths a package's files name in the package, by package and path: a file whose href
 * resolved to an entry.
 */
const EntryFileTarget = derived(
  "EntryFileTarget",
  query(QtiBase).rule((r) => {
    const { package: pkg, target } = v(File, "file");

    return r.match(File, { package: pkg, scope: "entry", target }).find({ package: pkg, target });
  }),
);

/**
 * The paths each resource's files name, by the resource's place, each with its scope: a file's
 * resource is its node's parent.
 */
const ResourceFileTarget = derived(
  "ResourceFileTarget",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, scope, start, target } = v(File, "file");
    const { parent: resource } = v(Node, "node");

    return r
      .match(File, { package: pkg, path, scope, start, target })
      .match(Node, { package: pkg, parent: resource, path, start })
      .find({ package: pkg, path, resource, scope, target });
  }),
);

/**
 * Each dependency beside the resource it names, by the dependency's place in the package's
 * manifest: the resource whose collapsed identifier its collapsed `identifierref` is
 * ({@link resourceIdentifiers}, whose identifiers "DocumentId key" holds distinct per package), and
 * its own resource, its node's parent.
 */
const DependencyResolved = derived(
  "DependencyResolved",
  query(QtiBase).rule((r) => {
    const { package: pkg, start, value } = v(dependencyRefs, "dependency");
    const { parent: resource } = v(Node, "node");
    const { start: target } = v(resourceIdentifiers, "target");

    return r
      .match(dependencyRefs, { package: pkg, start, value })
      .match(Node, { package: pkg, parent: resource, path: manifestPath, start })
      .match(resourceIdentifiers, { package: pkg, start: target, value })
      .find({ package: pkg, resource, start, target });
  }),
);

/**
 * Each `srcset`'s split beside its form, by its element's place: its {@link Srcset}'s `tokenText`
 * and `trail`, and its attribute's kind, name and `lexical`, the form as written, which no row
 * copies (C18). The attribute is the element's of the census's form `srcset`
 * (`ReferenceAttribute`, spec reading 103), so the join delivers its kind and name, which the media
 * laws read (`#pantry/qti/media.ts`), and an element has one such attribute, so a `srcset` is one
 * row. The form is read as written, never as its `value`: a `srcset`'s domain replaces each tab,
 * line feed and carriage return, and its candidates' pieces hold them.
 */
export const SrcsetForm = derived(
  "SrcsetForm",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, tokenText, trail } = v(Srcset, "srcset");
    const { kind, lexical, name } = v(Attribute, "attribute");

    return r
      .match(Srcset, { package: pkg, path, start, tokenText, trail })
      .match(Attribute, { kind, lexical, name, package: pkg, path, start })
      .match(ReferenceAttribute, { form: "srcset", kind, name })
      .find({ kind, lexical, name, package: pkg, path, start, tokenText, trail });
  }),
);

/**
 * The manifest overlays' rules over a query, each named by its oracle law:
 *
 * - **"Dependency target":** every dependency names a resource of its package;
 * - **"E1 derived":** a `srcset`'s image candidates' pieces in order, then its trail, are its form
 *   ({@link SrcsetForm}; `#pantry/qti/token-list.ts`);
 * - **"File listed":** every entry but the manifest is the resolved path of a file;
 * - **"Href listed":** a resource's href names the file one of its own files names, compared by
 *   resolved path in the package and as written outside it (reading 102);
 * - **"Self dependency":** the resource a dependency names is never its own (IMS Content Packaging
 *   1.2, §6.11.5 B ii).
 */
export const packageOverlayLawsByName = {
  "Dependency target": [
    contained(on(Dependency, "package", "start"), on(DependencyResolved, "package", "start")),
  ],
  "E1 derived": [
    check("E1_derived", SrcsetForm, (s) =>
      s.eq(s.lexical, Compute.concat(Compute.base(s.tokenText), Compute.base(s.trail))),
    ),
  ],
  "File listed": [
    contained(on(listedEntries, "package", "path"), on(EntryFileTarget, "package", "target")),
  ],
  "Href listed": [
    contained(
      on(ResourceHref, "package", "path", "start", "scope", "target"),
      on(ResourceFileTarget, "package", "path", "resource", "scope", "target"),
    ),
  ],
  "Self dependency": [
    check("Self_dependency", DependencyResolved, (d) => d.ne(d.target, d.resource)),
  ],
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const packageOverlayRelations = [
  Dependency,
  DependencyResolved,
  EntryFileTarget,
  ResourceFileTarget,
  SrcsetForm,
] as const;

/**
 * The rules of this module, {@link packageOverlayLawsByName} flattened.
 */
export const packageOverlayLaws = Object.values(packageOverlayLawsByName).flat();
