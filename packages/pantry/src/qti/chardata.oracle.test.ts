import { schema } from "@bjornpagen/grizzle";
import { assert, describe, it } from "@effect/vitest";
import {
  AttributeSlot,
  Flag,
  GoverningOf,
  Governor,
  HeldRootsUnder,
  KindByNameUnder,
  KindGovernor,
  KindNamespace,
  NodeKind,
  Position,
  ResourceType,
  StrictlyHeld,
  TypeAvailable,
  TypeName,
} from "#pantry/grammar/install.ts";
import {
  chardataLaws,
  Comment,
  Doctype,
  Document,
  EncodingDecl,
  Namespace,
  OpenElementName,
  OpenElementType,
  Pi,
  SdDecl,
  XmlDecl,
  XmlStandalone,
} from "#pantry/qti/chardata.ts";
import { Node, nodeTree } from "#pantry/qti/node.ts";
import { lawNames } from "#pantry/test/oracle.ts";

describe("qti/chardata.ts", () => {
  it("builds a scratch schema of Node and the document layer, and names every check by an oracle law, once on each relation it holds of", () => {
    // Oracle: the specification as a checker, the oracle's law names (`src/test/oracle.ts`), each
    // spelled with underscores for its spaces, since a check's name is an identifier.
    const scratch = schema(
      "QtiChardataProbe",
      [
        AttributeSlot,
        Comment,
        Doctype,
        Document,
        EncodingDecl,
        Flag,
        GoverningOf,
        Governor,
        HeldRootsUnder,
        KindByNameUnder,
        KindGovernor,
        KindNamespace,
        Namespace,
        Node,
        NodeKind,
        OpenElementName,
        OpenElementType,
        Pi,
        Position,
        ResourceType,
        SdDecl,
        StrictlyHeld,
        TypeAvailable,
        TypeName,
        XmlDecl,
        XmlStandalone,
      ],
      [nodeTree, ...chardataLaws],
    );
    const checks = chardataLaws.flatMap((law) =>
      law.kind === "check" ? [{ name: law.name, relation: law.relation.name }] : [],
    );
    const named = new Set<string>(lawNames);
    const placed = checks.map(({ name, relation }) => `${relation}.${name}`);

    assert.strictEqual(scratch.statements.length, chardataLaws.length + 1);
    assert.deepStrictEqual(
      checks.filter(({ name }) => !named.has(name.replaceAll("_", " "))),
      [],
    );
    assert.strictEqual(new Set(placed).size, placed.length);
    assert.includeMembers(placed, [
      "Node.Foreign_element_class",
      "OpenElementName.MathML_foreign_element",
    ]);
  });
});
