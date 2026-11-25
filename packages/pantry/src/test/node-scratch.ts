/**
 * A scratch schema of `Node` (Q5.03) and the fields the host writes on a node, for the suites that
 * build `Node`'s declarations and type its writes (`#pantry/qti/node.oracle.test.ts`) and for the
 * module of refused writes that suite types with the compiler.
 */
import {
  bits,
  Bits,
  counted,
  fin,
  fold,
  Monoid,
  natural,
  on,
  relation,
  schema,
} from "@bjornpagen/grizzle";
import * as install from "#pantry/grammar/install.ts";
import { EntryPath, PackageName } from "#pantry/qti/limits.ts";
import { ElementType, Node, nodeLaws } from "#pantry/qti/node.ts";

/**
 * The key fields of a stand-in member: its element's `(package, path, start)` and its own `name`.
 */
const standInKey = {
  name: natural,
  package: PackageName,
  path: EntryPath,
  start: natural,
} as const;

/**
 * A stand-in for the closed attribute family (Q5.05's), so `Node`'s `attributes` and `attrs` are
 * named by a family and a fold as the composed schema names them: a counted family under `Node`,
 * its or fold ending at `attrs`.
 */
export const StandInAttribute = relation(
  "StandInAttribute",
  { ...standInKey, slot: bits(install.AttributeSlot) },
  ["package", "path", "start", "name"],
);

/**
 * A stand-in for the open attribute family, so `Node`'s `openAttributes` is named by a family.
 */
const StandInOpenAttribute = relation("StandInOpenAttribute", standInKey, [
  "package",
  "path",
  "start",
  "name",
]);

/**
 * The stand-in attribute family.
 */
const standInAttributes = counted(
  on(StandInAttribute, "package", "path", "start"),
  fin(Node, "attributes"),
);

/**
 * Build a schema of `Node`, the closed relations its statements read, and the two stand-in
 * families, with `nodeLaws` and the families' statements.
 *
 * @returns The schema; building it throws grizzle's `CompileError` for a statement it refuses.
 */
export const scratchSchema = () =>
  schema(
    "NodeScratch",
    [
      install.AdmissionIn,
      install.AdmissionMap,
      install.AnonymousType,
      install.AttributeSlot,
      install.Banned,
      install.BarredOf,
      install.Capped,
      install.ContentModel,
      install.ContentModelOf,
      install.CountedOf,
      ElementType,
      install.Enters,
      install.Flag,
      install.FollowMember,
      install.FollowSet,
      install.FollowSetOf,
      install.GoverningOf,
      install.Governor,
      install.KindGovernor,
      install.ModelPositions,
      install.Needs,
      Node,
      install.NodeKind,
      install.Position,
      install.SharedModel,
      install.SharedModelOf,
      StandInAttribute,
      StandInOpenAttribute,
      install.SymbolMember,
      install.SymbolSet,
      install.SymbolSetOf,
      install.TextDomain,
      install.TypeName,
      install.ValueDomain,
      install.XsiType,
    ],
    [
      ...nodeLaws,
      standInAttributes,
      fold(
        standInAttributes,
        Monoid.or,
        on(StandInAttribute, "package", "path", "start", "slot"),
        on(Node, "package", "path", "start", "attrs"),
      ),
      counted(on(StandInOpenAttribute, "package", "path", "start"), fin(Node, "openAttributes")),
    ],
  );

/**
 * The scratch schema, built once for the write type's ChangeSets.
 */
export const Scratch = scratchSchema();

/**
 * The fields the host writes on every node but the root fields: a lawful element's values, enough
 * to type a row.
 */
export const written = {
  ancestry: Bits.of(install.Flag, []),
  chars: "",
  first: "",
  governor: "qti-assessment-item",
  kind: "qti-assessment-item",
  last: "",
  nearest: 0n,
  nearestKind: "document",
  nearestPath: "item.xml",
  prefix: "",
  state: "3",
} as const;
