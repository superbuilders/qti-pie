/**
 * The foreign elements' rules over their node (`#pantry/qti/chardata.ts`). An
 * {@link OpenElementName} row holds an element's expanded name and an {@link OpenElementType} row
 * its governing type, nothing more. Their laws pair those with the element's kind, parent and
 * governor, its parent's kind, and its parent's namespace, which are `Node`'s, or the parent's
 * own name where the parent is foreign.
 *
 * A parent's namespace is no stored value: under a parent of a kind it is `KindNamespace`'s, which
 * a check reads, and under a foreign parent it is that parent's own {@link OpenElementName}, which a
 * query matches. So each law that reads it is stated twice, once over each.
 */
import {
  Bits,
  check,
  Compute,
  contained,
  derived,
  on,
  query,
  select,
  v,
} from "@bjornpagen/grizzle";
import {
  HeldRootsUnder,
  KindByNameUnder,
  KindNamespace,
  NodeKind,
  openElementClasses,
  StrictlyHeld,
  TypeAvailable,
  vocabularyNamespaceNames,
} from "#pantry/grammar/install.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { OpenElementName, OpenElementType } from "#pantry/qti/chardata.ts";
import { Node, typeGovernorOf } from "#pantry/qti/node.ts";

/**
 * Each foreign element's name, its namespace and its expanded spelling, beside its node's kind,
 * parent and its parent's kind, by the element's place.
 */
const OpenNameNode = derived(
  "OpenNameNode",
  query(QtiBase).rule((r) => {
    const { expanded, namespace, package: pkg, path, start } = v(OpenElementName, "name");
    const { kind, parent, parentKind } = v(Node, "node");

    return r
      .match(OpenElementName, { expanded, namespace, package: pkg, path, start })
      .match(Node, { kind, package: pkg, parent, parentKind, path, start })
      .find({ expanded, kind, namespace, package: pkg, parent, parentKind, path, start });
  }),
);

/**
 * Each foreign element under a foreign parent, by the element's place: its kind and namespace, and
 * its parent's namespace, the parent's own name's.
 */
const OpenNameUnderForeign = derived(
  "OpenNameUnderForeign",
  query(QtiBase).rule((r) => {
    const { namespace, package: pkg, path, start } = v(OpenElementName, "name");
    const { kind, parent } = v(Node, "node");
    const { namespace: parentNamespace } = v(OpenElementName, "parentName");

    return r
      .match(OpenElementName, { namespace, package: pkg, path, start })
      .match(Node, { kind, package: pkg, parent, path, start })
      .match(OpenElementName, { namespace: parentNamespace, package: pkg, path, start: parent })
      .find({ kind, namespace, package: pkg, parentNamespace, path, start });
  }),
);

/**
 * Each foreign element's governing type beside its node's kind, governor and parent's
 * kind, by the element's place.
 */
const OpenTypeNode = derived(
  "OpenTypeNode",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, type } = v(OpenElementType, "type");
    const { governor, kind, parentKind } = v(Node, "node");

    return r
      .match(OpenElementType, { package: pkg, path, start, type })
      .match(Node, { governor, kind, package: pkg, parentKind, path, start })
      .find({ governor, kind, package: pkg, parentKind, path, start, type });
  }),
);

/**
 * Each foreign element's governing type under a foreign parent, by the element's place, with the
 * parent's namespace, the parent's own name's.
 */
const OpenTypeUnderForeign = derived(
  "OpenTypeUnderForeign",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, type } = v(OpenElementType, "type");
    const { parent } = v(Node, "node");
    const { namespace: parentNamespace } = v(OpenElementName, "parentName");

    return r
      .match(OpenElementType, { package: pkg, path, start, type })
      .match(Node, { package: pkg, parent, path, start })
      .match(OpenElementName, { namespace: parentNamespace, package: pkg, path, start: parent })
      .find({ package: pkg, parentNamespace, path, start, type });
  }),
);

/**
 * The foreign elements' rules over their node, each named by its oracle law:
 *
 * - **"E1 derived":** a foreign element's governing type gives its node's governor
 *   (`typeGovernorOf`);
 * - **"Foreign element class":** an element's stored namespace agrees with its class against its
 *   parent's, `KindNamespace`'s under a parent of a kind and the parent's own name's under a
 *   foreign one;
 * - **"OpenElementName canonical":** no foreign element bears the expanded name of an element kind
 *   its parent admits there;
 * - **"XsiType available":** a foreign element's governing type is one its parent's namespace's
 *   schema set holds, or any under a namespace no vocabulary names;
 * - **"Strictly held":** a foreign element its parent's model holds only by `strict` wildcards has
 *   its governing type, unless its expanded name is one of the roots its schema set declares
 *   there.
 */
export const chardataOverlayLawsByName = {
  "E1 derived": [
    check("E1_derived", OpenTypeNode, (t) => t.eq(t.governor, typeGovernorOf(t.kind, t.type))),
  ],
  "Foreign element class": [
    check("Foreign_element_class", OpenNameNode, (o) => {
      const parentNamespace = KindNamespace.at("namespace", o.parentKind);

      return o.or(
        o.in(o.parentKind, openElementClasses),
        o.and(o.eq(o.kind, "no-namespace-element"), o.eq(o.namespace, "")),
        o.and(
          o.eq(o.kind, "own-namespace-element"),
          o.ne(o.namespace, ""),
          o.eq(o.namespace, parentNamespace),
        ),
        o.and(
          o.eq(o.kind, "foreign-element"),
          o.ne(o.namespace, ""),
          o.ne(o.namespace, parentNamespace),
        ),
      );
    }),
    check("Foreign_element_class", OpenNameUnderForeign, (o) =>
      o.or(
        o.and(o.eq(o.kind, "no-namespace-element"), o.eq(o.namespace, "")),
        o.and(
          o.eq(o.kind, "own-namespace-element"),
          o.ne(o.namespace, ""),
          o.eq(o.namespace, o.parentNamespace),
        ),
        o.and(
          o.eq(o.kind, "foreign-element"),
          o.ne(o.namespace, ""),
          o.ne(o.namespace, o.parentNamespace),
        ),
      ),
    ),
  ],
  "OpenElementName canonical": [
    check("OpenElementName_canonical", OpenNameNode, (o) =>
      o.not(Compute.matches(o.expanded, KindByNameUnder.at("names", o.parentKind))),
    ),
  ],
  "Strictly held": [
    contained(
      on(
        select(OpenNameNode, (o) =>
          o.and(
            o.or(
              ...openElementClasses.map((kind) =>
                o.and(
                  o.eq(o.kind, kind),
                  o.eq(
                    Compute.disjoint(StrictlyHeld.row(o.parentKind), Bits.of(NodeKind, [kind])),
                    false,
                  ),
                ),
              ),
            ),
            o.not(Compute.matches(o.expanded, HeldRootsUnder.at("names", o.parentKind))),
          ),
        ),
        "package",
        "path",
        "start",
      ),
      on(OpenElementType, "package", "path", "start"),
    ),
  ],
  "XsiType available": [
    check("XsiType_available", OpenTypeNode, (t) => {
      const parentNamespace = KindNamespace.at("namespace", t.parentKind);

      return t.or(
        t.in(t.parentKind, openElementClasses),
        Compute.matches(parentNamespace, TypeAvailable.at("namespaces", t.type)),
        t.not(t.in(parentNamespace, vocabularyNamespaceNames)),
      );
    }),
    check("XsiType_available", OpenTypeUnderForeign, (t) =>
      t.or(
        Compute.matches(t.parentNamespace, TypeAvailable.at("namespaces", t.type)),
        t.not(t.in(t.parentNamespace, vocabularyNamespaceNames)),
      ),
    ),
  ],
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const chardataOverlayRelations = [
  OpenNameNode,
  OpenNameUnderForeign,
  OpenTypeNode,
  OpenTypeUnderForeign,
] as const;

/**
 * The rules of this module, {@link chardataOverlayLawsByName} flattened.
 */
export const chardataOverlayLaws = Object.values(chardataOverlayLawsByName).flat();
