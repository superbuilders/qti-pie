/**
 * The bank overlays' rules over their node and their attribute (`#pantry/qti/tests.ts`): a
 * {@link Named} row holds an element's collapsed identifier, and a `StimulusRef` row its own, each
 * its attribute's `value`, which no row copies (C18); and their laws read the element's kind and
 * its parent's kind, which only `Node` holds, and its document's type, which only `Document`
 * holds.
 */
import { check, contained, derived, key, on, query, v } from "@bjornpagen/grizzle";
import { QtiBase } from "#pantry/qti/base.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { attributeValues } from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import { Named, StimulusRef } from "#pantry/qti/tests.ts";
import {
  bankResourceType,
  namedKinds,
  sectionKind,
  stimulusRefKind,
} from "#pantry/vocab/terms/tests.ts";

/**
 * The `identifier` of each section, item ref and stimulus ref, by its element's place, with its
 * element's kind: the attribute's `value`, its lexical form collapsed (`IdentifierDType`'s class),
 * which no row copies (C18, {@link attributeValues}).
 */
const testIdentifiers = attributeValues("identifier", [...namedKinds, stimulusRefKind]);

/**
 * {@link testIdentifiers} as a relation of `Qti`, which "Test overlay" holds each {@link Named} and
 * `StimulusRef` identifier to.
 */
const TestIdentifier = derived("TestIdentifier", testIdentifiers);

/**
 * Each name beside its element's kind, by the element's place.
 */
const NamedNode = derived(
  "NamedNode",
  query(QtiBase).rule((r) => {
    const { identifier, package: pkg, path, start } = v(Named, "named");
    const { kind } = v(Node, "node");

    return r
      .match(Named, { identifier, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .find({ identifier, kind, package: pkg, path, start });
  }),
);

/**
 * The banks: each section that is its document's root, a section document's, whose identifier is
 * the bank (the placement mandate, ruling 2), by its place. "Bank shape" makes every section of a
 * section document one.
 */
const BankSection = derived(
  "BankSection",
  query(QtiBase).rule((r) => {
    const { identifier, package: pkg, path, start } = v(Named, "bank");

    return r
      .match(Named, { identifier, package: pkg, path, start })
      .match(Node, { kind: sectionKind, package: pkg, parentKind: "document", path, start })
      .find({ identifier, package: pkg, path, start });
  }),
);

/**
 * The identifiers of a bank's sections and item refs ({@link namedKinds}), by their element's
 * place: each such element, and only it, has its {@link Named} row. AL1 holds each to its domain,
 * `IdentifierDType`, an NCName once collapsed, so each names something (spec reading 152, decision
 * 457 (2)). Only a bank's are demanded a row: a section or an item ref in another document, which
 * no assembly holds, is "Test structure"'s fault alone.
 */
const BankNaming = derived(
  "BankNaming",
  query(QtiBase).rule((r) => {
    const { kind, package: pkg, path, start } = v(testIdentifiers, "identifier");

    return r
      .match(testIdentifiers, { kind, package: pkg, path, start })
      .match(Document, { documentType: bankResourceType, package: pkg, path })
      .where(r.in(kind, namedKinds))
      .find({ package: pkg, path, start });
  }),
);

/**
 * The bank overlays' rules over their node, each named by its law:
 *
 * - **"Bank key":** no two banks of one package share an identifier;
 * - **"E1 derived":** a name is a bank's root section's or an item ref's;
 * - **"Test overlay":** each identifier of a bank's section or item ref has its name
 *   ({@link BankNaming}), and each name's and each stimulus ref's identifier is its attribute's
 *   value ({@link TestIdentifier}).
 */
export const testOverlayLawsByName = {
  "Bank key": [key(on(BankSection, "package", "identifier"))],
  "E1 derived": [check("E1_derived", NamedNode, (n) => n.in(n.kind, namedKinds))],
  "Test overlay": [
    contained(on(BankNaming, "package", "path", "start"), on(Named, "package", "path", "start")),
    contained(
      on(Named, "package", "path", "start", "identifier"),
      on(TestIdentifier, "package", "path", "start", "value"),
    ),
    contained(
      on(StimulusRef, "package", "path", "start", "identifier"),
      on(TestIdentifier, "package", "path", "start", "value"),
    ),
  ],
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const testOverlayRelations = [BankNaming, BankSection, NamedNode, TestIdentifier] as const;

/**
 * The rules of this module, {@link testOverlayLawsByName} flattened.
 */
export const testOverlayLaws = Object.values(testOverlayLawsByName).flat();
