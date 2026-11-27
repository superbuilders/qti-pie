/**
 * The interaction overlays' rules over their node (`#pantry/qti/interactions.ts`): each law that
 * pairs an overlay's fact with its node's kind, parent or nearest interaction, which only
 * `Node` holds, read through a query. Each query matches an overlay with `Node` at its own key, and
 * a hotspot's read `shape` with its node and its parent, so every fact a law reads is its own
 * relation's. A binding's variable is its item's response declaration of its name: a query over a
 * binding matches a name view of `QtiViews` (`#pantry/qti/names.ts`) by `(package, path,
 * identifier)`, of kind `qti-response-declaration` (decision S3), the placed binding's in its
 * assembly's item (spec reading `fragment-placement`).
 */
import {
  check,
  contained,
  decimalText,
  derived,
  key,
  Logic,
  mirrors,
  Num,
  on,
  query,
  select,
  Text,
  Type,
  v,
  Xml,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import { Option } from "effect";
import {
  BindingFit,
  ChoiceBound,
  interactionKinds,
  lastWhereRules,
  RecordBindingFit,
} from "#pantry/grammar/install.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { Document } from "#pantry/qti/chardata.ts";
import {
  anyTypeKinds,
  boundKinds,
  BoundVariable,
  cardinalityKinds,
  Choice,
  choiceCountKinds,
  ChoiceInteraction,
  CountBound,
  defaultArea,
  gapMatchKind,
  graphicGapMatch,
  Hottext,
  integerReadOf,
  Interaction,
  InteractionAttribute,
  LeastCount,
  maxNames,
  minNames,
  MostCount,
  PlacedBinding,
} from "#pantry/qti/interactions.ts";
import { doublesInOrder } from "#pantry/qti/declarations.ts";
import { keyedPattern, parsedDecimalBytes, patternTextBytes } from "#pantry/qti/limits.ts";
import { VariableRef } from "#pantry/qti/expressions.ts";
import {
  attributeValues,
  DeclarationName,
  QtiViews,
  TypedDeclarationName,
} from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import {
  choiceKinds,
  countDefault,
  extendedTextKind,
  gapKind,
  hotspotKinds,
  pciKind,
} from "#pantry/vocab/terms/interactions.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * Each interaction beside its node's kind, by its place: its {@link Interaction} row's count of
 * module forms, which "PCI module source" reads.
 */
const InteractionNode = derived(
  "InteractionNode",
  query(QtiBase).rule((r) => {
    const { moduleForms, package: pkg, path, start } = v(Interaction, "interaction");
    const { kind } = v(Node, "node");

    return r
      .match(Interaction, { moduleForms, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .find({ kind, moduleForms, package: pkg, path, start });
  }),
);

/**
 * Each choice beside its node's kind and nearest interaction, by its place: its {@link Choice}
 * row's identifier.
 */
const ChoiceNode = derived(
  "ChoiceNode",
  query(QtiBase).rule((r) => {
    const { identifier, package: pkg, path, start } = v(Choice, "choice");
    const { kind, nearest } = v(Node, "node");

    return r
      .match(Choice, { identifier, package: pkg, path, start })
      .match(Node, { kind, nearest, package: pkg, path, start })
      .find({ identifier, kind, nearest, package: pkg, path, start });
  }),
);

/**
 * Each hottext beside its node's nearest interaction, by its place: the interaction's position
 * (`nearest`, the document node's 0 where it sits in none), its kind (`document` there), and the
 * document it is a position in (`nearestPath`: the hottext's own, or its document's context's).
 */
const HottextNode = derived(
  "HottextNode",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start } = v(Hottext, "hottext");
    const { nearest, nearestKind, nearestPath } = v(Node, "node");

    return r
      .match(Hottext, { package: pkg, path, start })
      .match(Node, { nearest, nearestKind, nearestPath, package: pkg, path, start })
      .find({ nearest, nearestKind, nearestPath, package: pkg, path, start });
  }),
);

/**
 * Each hotspot beside its node and its parent, by its place: the value of its read `shape`
 * (`area`, the kind of area it is), its node's kind and element rank among its siblings
 * (`elements`), and its parent's kind and element count (`parentElementChildren`), which the
 * last-slot law compares. A hotspot that writes no `shape` has none, and AL3 refuses it.
 */
const HotspotNode = derived(
  "HotspotNode",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value: area } = v(InteractionAttribute, "shape");
    const { elements, kind, parent, parentKind } = v(Node, "node");
    const { elementChildren: parentElementChildren } = v(Node, "parent");

    return r
      .match(InteractionAttribute, { name: "shape", package: pkg, path, start, value: area })
      .match(Node, { elements, kind, package: pkg, parent, parentKind, path, start })
      .match(Node, { elementChildren: parentElementChildren, package: pkg, path, start: parent })
      .where(r.in(kind, hotspotKinds))
      .find({
        area,
        elements,
        kind,
        package: pkg,
        parentElementChildren,
        parentKind,
        path,
        start,
      });
  }),
);

/**
 * Each bound beside its node's kind, by its place: what its {@link CountBound} row
 * writes of its counts.
 */
const CountBoundNode = derived(
  "CountBoundNode",
  query(QtiBase).rule((r) => {
    const {
      maxName,
      maxWritten,
      minName,
      minWritten,
      package: pkg,
      path,
      start,
    } = v(CountBound, "bound");
    const { kind } = v(Node, "node");

    return r
      .match(CountBound, { maxName, maxWritten, minName, minWritten, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .find({ kind, maxName, maxWritten, minName, minWritten, package: pkg, path, start });
  }),
);

/**
 * Each least count beside its bound and its node, by its bound's place: its {@link LeastCount}
 * row's value as written and as an integer, its {@link CountBound}'s least attribute and whether
 * it writes it, and its node's kind.
 */
const LeastCountNode = derived(
  "LeastCountNode",
  query(QtiBase).rule((r) => {
    const { least, leastValue, package: pkg, path, start } = v(LeastCount, "least");
    const { minName, minWritten } = v(CountBound, "bound");
    const { kind } = v(Node, "node");

    return r
      .match(LeastCount, { least, leastValue, package: pkg, path, start })
      .match(CountBound, { minName, minWritten, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .find({ kind, least, leastValue, minName, minWritten, package: pkg, path, start });
  }),
);

/**
 * Each most count beside its bound and its node, by its bound's place, as {@link LeastCountNode}
 * is the least's, with whether its bound writes its least.
 */
const MostCountNode = derived(
  "MostCountNode",
  query(QtiBase).rule((r) => {
    const { most, mostValue, package: pkg, path, start } = v(MostCount, "most");
    const { maxName, maxWritten, minWritten } = v(CountBound, "bound");
    const { kind } = v(Node, "node");

    return r
      .match(MostCount, { most, mostValue, package: pkg, path, start })
      .match(CountBound, { maxName, maxWritten, minWritten, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .find({
        kind,
        maxName,
        maxWritten,
        minWritten,
        most,
        mostValue,
        package: pkg,
        path,
        start,
      });
  }),
);

/**
 * Each least count of an interaction whose choices bound its counts (`ChoiceCount`, reading
 * `order-min-choices`) beside the interaction's choices, by its place: its {@link LeastCount} row's
 * integer, whether its bound writes it, its node's kind, and its {@link Interaction}'s count of
 * choices.
 */
const LeastChoiceBound = derived(
  "LeastChoiceBound",
  query(QtiBase).rule((r) => {
    const { leastValue, package: pkg, path, start } = v(LeastCount, "least");
    const { minWritten } = v(CountBound, "bound");
    const { kind } = v(Node, "node");
    const { choices } = v(Interaction, "interaction");

    return r
      .match(LeastCount, { leastValue, package: pkg, path, start })
      .match(CountBound, { minWritten, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .match(Interaction, { choices, package: pkg, path, start })
      .where(r.in(kind, choiceCountKinds))
      .find({ choices, kind, leastValue, minWritten, package: pkg, path, start });
  }),
);

/**
 * Each most count of an interaction whose choices bound its counts beside the interaction's
 * choices, by its place, as {@link LeastChoiceBound} is the least's.
 */
const MostChoiceBound = derived(
  "MostChoiceBound",
  query(QtiBase).rule((r) => {
    const { mostValue, package: pkg, path, start } = v(MostCount, "most");
    const { minWritten } = v(CountBound, "bound");
    const { kind } = v(Node, "node");
    const { choices } = v(Interaction, "interaction");

    return r
      .match(MostCount, { mostValue, package: pkg, path, start })
      .match(CountBound, { minWritten, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .match(Interaction, { choices, package: pkg, path, start })
      .where(r.in(kind, choiceCountKinds))
      .find({ choices, kind, minWritten, mostValue, package: pkg, path, start });
  }),
);

/**
 * Each bound both of whose counts have a value, by its place: its {@link LeastCount} and
 * {@link MostCount} rows' integers, whether it writes its least, and its node's kind.
 */
const BoundRange = derived(
  "BoundRange",
  query(QtiBase).rule((r) => {
    const { leastValue, package: pkg, path, start } = v(LeastCount, "least");
    const { mostValue } = v(MostCount, "most");
    const { minWritten } = v(CountBound, "bound");
    const { kind } = v(Node, "node");

    return r
      .match(LeastCount, { leastValue, package: pkg, path, start })
      .match(MostCount, { mostValue, package: pkg, path, start })
      .match(CountBound, { minWritten, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .find({ kind, leastValue, minWritten, mostValue, package: pkg, path, start });
  }),
);

/**
 * Each binding of a single response by an interaction whose response cardinality its most count
 * decides (spec reading `binding-and-count-sentences`, {@link cardinalityKinds}), where that most
 * has a value, by the binding's place and attribute: the {@link MostCount} row's integer.
 */
const SingleBindingMost = derived(
  "SingleBindingMost",
  query(QtiViews).rule((r) => {
    const { attribute, identifier, package: pkg, path, start } = v(BoundVariable, "binding");
    const { kind } = v(Node, "node");
    const { mostValue } = v(MostCount, "most");

    return r
      .match(BoundVariable, { attribute, identifier, package: pkg, path, start })
      .match(DeclarationName, {
        cardinality: "single",
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path,
      })
      .match(Node, { kind, package: pkg, path, start })
      .match(MostCount, { mostValue, package: pkg, path, start })
      .where(r.eq(attribute, "response-identifier"), r.in(kind, cardinalityKinds))
      .find({ attribute, mostValue, package: pkg, path, start });
  }),
);

/**
 * Each placed binding of a single response by such an interaction, where its most has a value, by
 * the placement and the binding's place and attribute, as {@link SingleBindingMost} is an item's
 * own binding's.
 */
const PlacedSingleBindingMost = derived(
  "PlacedSingleBindingMost",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      instance,
      package: pkg,
      path,
      start,
    } = v(PlacedBinding, "binding");
    const { kind } = v(Node, "node");
    const { mostValue } = v(MostCount, "most");

    return r
      .match(PlacedBinding, {
        assembly,
        attribute,
        identifier,
        instance,
        package: pkg,
        path,
        start,
      })
      .match(DeclarationName, {
        cardinality: "single",
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path: assembly,
      })
      .match(Node, { kind, package: pkg, path, start })
      .match(MostCount, { mostValue, package: pkg, path, start })
      .where(r.eq(attribute, "response-identifier"), r.in(kind, cardinalityKinds))
      .find({ assembly, attribute, instance, mostValue, package: pkg, start });
  }),
);

/**
 * Each bound variable's cardinality beside its interaction's kind, by the binding's place and
 * attribute, where its response declaration has a cardinality: its {@link DeclarationName}'s. A
 * binding to a declaration whose cardinality is unwritten or spells nothing has none, so no fit law
 * reads a cardinality it does not have, and AL3 or its value domain refuses it alone (spec readings
 * `unspelled-declaration` and `binding-by-name`).
 */
const BindingCardinalityNode = derived(
  "BindingCardinalityNode",
  query(QtiViews).rule((r) => {
    const { attribute, identifier, package: pkg, path, start } = v(BoundVariable, "binding");
    const { cardinality } = v(DeclarationName, "name");
    const { kind } = v(Node, "node");

    return r
      .match(BoundVariable, { attribute, identifier, package: pkg, path, start })
      .match(DeclarationName, {
        cardinality,
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path,
      })
      .match(Node, { kind, package: pkg, path, start })
      .find({ attribute, cardinality, kind, package: pkg, path, start });
  }),
);

/**
 * Each placed bound variable's cardinality beside its interaction's kind, by the placement, the
 * binding's place and attribute, as {@link BindingCardinalityNode} is an item's own binding's: its
 * response declaration the assembly's item's.
 */
const PlacedBindingCardinalityNode = derived(
  "PlacedBindingCardinalityNode",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      instance,
      package: pkg,
      path,
      start,
    } = v(PlacedBinding, "binding");
    const { cardinality } = v(DeclarationName, "name");
    const { kind } = v(Node, "node");

    return r
      .match(PlacedBinding, {
        assembly,
        attribute,
        identifier,
        instance,
        package: pkg,
        path,
        start,
      })
      .match(DeclarationName, {
        cardinality,
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path: assembly,
      })
      .match(Node, { kind, package: pkg, path, start })
      .find({ assembly, attribute, cardinality, instance, kind, package: pkg, path, start });
  }),
);

/**
 * Each bound variable's base type beside its cardinality and its interaction's kind, by the
 * binding's place and attribute, where its response declaration has a cardinality and a base type:
 * its {@link DeclarationName}'s and {@link TypedDeclarationName}'s, the triple "BindingFit" judges
 * with the kind. A record has no base type, and its binding no row; nor has a binding to a
 * declaration with no cardinality, which no fit law judges (spec reading `binding-by-name`).
 */
const BindingBaseTypeNode = derived(
  "BindingBaseTypeNode",
  query(QtiViews).rule((r) => {
    const { attribute, identifier, package: pkg, path, start } = v(BoundVariable, "binding");
    const { cardinality } = v(DeclarationName, "name");
    const { baseType } = v(TypedDeclarationName, "typed");
    const { kind } = v(Node, "node");

    return r
      .match(BoundVariable, { attribute, identifier, package: pkg, path, start })
      .match(DeclarationName, {
        cardinality,
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path,
      })
      .match(TypedDeclarationName, { baseType, identifier, package: pkg, path })
      .match(Node, { kind, package: pkg, path, start })
      .find({ attribute, baseType, cardinality, kind, package: pkg, path, start });
  }),
);

/**
 * Each placed bound variable's base type beside its cardinality and its interaction's kind, by the
 * placement, the binding's place and attribute, as {@link BindingBaseTypeNode} is an item's own
 * binding's: its response declaration the assembly's item's.
 */
const PlacedBindingBaseTypeNode = derived(
  "PlacedBindingBaseTypeNode",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      instance,
      package: pkg,
      path,
      start,
    } = v(PlacedBinding, "binding");
    const { cardinality } = v(DeclarationName, "name");
    const { baseType } = v(TypedDeclarationName, "typed");
    const { kind } = v(Node, "node");

    return r
      .match(PlacedBinding, {
        assembly,
        attribute,
        identifier,
        instance,
        package: pkg,
        path,
        start,
      })
      .match(DeclarationName, {
        cardinality,
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path: assembly,
      })
      .match(TypedDeclarationName, { baseType, identifier, package: pkg, path: assembly })
      .match(Node, { kind, package: pkg, path, start })
      .find({ assembly, attribute, baseType, cardinality, instance, kind, package: pkg, start });
  }),
);

/**
 * Each gap a gap match interaction bound to a single response encloses (spec reading
 * `gap-match-cardinality`), by the binding's place: the gap's place, its own document's or that of
 * a fragment an include places in the interaction, through its {@link ChoiceInteraction}. "Binding
 * cardinality" keys these rows by the binding, so such an interaction holds at most one gap.
 */
const SingleResponseGap = derived(
  "SingleResponseGap",
  query(QtiViews).rule((r) => {
    const { identifier, package: pkg, path, start } = v(BoundVariable, "binding");
    const { path: gapPath, start: gap } = v(ChoiceInteraction, "gap");

    return r
      .match(BoundVariable, {
        attribute: "response-identifier",
        identifier,
        package: pkg,
        path,
        start,
      })
      .match(DeclarationName, {
        cardinality: "single",
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path,
      })
      .match(Node, { kind: gapMatchKind, package: pkg, path, start })
      .match(ChoiceInteraction, {
        interaction: start,
        interactionPath: path,
        package: pkg,
        path: gapPath,
        start: gap,
      })
      .match(Node, { kind: gapKind, package: pkg, path: gapPath, start: gap })
      .find({ gap, gapPath, package: pkg, path, start });
  }),
);

/**
 * Each gap a gap match interaction bound to a single response under a placement encloses, by the
 * placement and the binding's place, as {@link SingleResponseGap} is an item's own binding's.
 */
const PlacedSingleResponseGap = derived(
  "PlacedSingleResponseGap",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      identifier,
      instance,
      package: pkg,
      path,
      start,
    } = v(PlacedBinding, "binding");
    const { path: gapPath, start: gap } = v(ChoiceInteraction, "gap");

    return r
      .match(PlacedBinding, {
        assembly,
        attribute: "response-identifier",
        identifier,
        instance,
        package: pkg,
        path,
        start,
      })
      .match(DeclarationName, {
        cardinality: "single",
        declarationKind: "qti-response-declaration",
        identifier,
        package: pkg,
        path: assembly,
      })
      .match(Node, { kind: gapMatchKind, package: pkg, path, start })
      .match(ChoiceInteraction, {
        interaction: start,
        interactionPath: path,
        package: pkg,
        path: gapPath,
        start: gap,
      })
      .match(Node, { kind: gapKind, package: pkg, path: gapPath, start: gap })
      .find({ assembly, gap, gapPath, instance, package: pkg, start });
  }),
);

/**
 * Each slider's two bounds, by its place: its read `lower-bound` and `upper-bound`
 * ({@link InteractionAttribute}), each collapsed. A slider that writes only one has none, and AL3
 * refuses it.
 */
export const SliderBounds = derived(
  "SliderBounds",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value: lower } = v(InteractionAttribute, "lower");
    const { value: upper } = v(InteractionAttribute, "upper");

    return r
      .match(InteractionAttribute, { name: "lower-bound", package: pkg, path, start, value: lower })
      .match(InteractionAttribute, { name: "upper-bound", package: pkg, path, start, value: upper })
      .find({ lower, package: pkg, path, start, upper });
  }),
);

/**
 * Each element that carries both ARIA range attributes, by its place: its read `aria-valuemin` and
 * `aria-valuemax` ({@link InteractionAttribute}), each collapsed.
 */
export const AriaBounds = derived(
  "AriaBounds",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value: min } = v(InteractionAttribute, "min");
    const { value: max } = v(InteractionAttribute, "max");

    return r
      .match(InteractionAttribute, { name: "aria-valuemin", package: pkg, path, start, value: min })
      .match(InteractionAttribute, { name: "aria-valuemax", package: pkg, path, start, value: max })
      .find({ max, min, package: pkg, path, start });
  }),
);

/**
 * The XSD defaults of one count of the pair: each default's value, with the kinds whose count it
 * is. A kind whose count has no default is in none, so its count, left unwritten, has no value (the
 * law oracle's `countAttribute`).
 *
 * @param side - Which count of the pair.
 * @returns One entry per value, with the kinds that read it.
 */
const defaultedValues = (side: "max" | "min") =>
  [
    ...Map.groupBy(
      ChoiceBound.rows.flatMap((row) =>
        Option.toArray(countDefault(row.kind, row[side])).map((value) => ({
          kind: row.kind,
          value,
        })),
      ),
      ({ value }) => value,
    ),
  ].map(([value, rows]) => ({ kinds: rows.map(({ kind }) => kind), value }));

/**
 * The least each kind's unwritten least count reads, where the XSD gives one.
 */
const defaultedLeast = defaultedValues("min");

/**
 * The most each kind's unwritten most count reads, where the XSD gives one.
 */
const defaultedMost = defaultedValues("max");

/**
 * State that an unwritten count of a bound has an XSD default: its node's kind's.
 *
 * @param b - The bound's row.
 * @param defaulted - The count's defaults ({@link defaultedLeast} or {@link defaultedMost}).
 * @returns The predicate.
 */
const hasDefault = (b: RowScalars<typeof CountBoundNode>, defaulted: typeof defaultedLeast) =>
  b.or(...defaulted.map(({ kinds }) => b.in(b.kind, kinds)));

/**
 * State "Choice bounds" over a least count where the law reads it alone (reading
 * `order-min-choices`): a counted bound whose least is written, of a kind `ChoiceCount` names, has
 * a least of at most its choices.
 *
 * @param l - The row.
 * @returns The predicate.
 */
const leastBounds = (l: RowScalars<typeof LeastChoiceBound>) =>
  l.or(
    l.ne(ChoiceBound.at("zero", l.kind), "counted"),
    l.eq(l.minWritten, false),
    l.not(l.in(l.kind, choiceCountKinds)),
    l.le(l.leastValue, Type.base(l.choices)),
  );

/**
 * State "Choice bounds" over a most count where the law reads it alone (reading
 * `order-min-choices`): a counted bound whose least is written, of a kind `ChoiceCount` names, has
 * a most of at most its choices.
 *
 * @param m - The row.
 * @returns The predicate.
 */
const mostBounds = (m: RowScalars<typeof MostChoiceBound>) =>
  m.or(
    m.ne(ChoiceBound.at("zero", m.kind), "counted"),
    m.eq(m.minWritten, false),
    m.not(m.in(m.kind, choiceCountKinds)),
    m.le(m.mostValue, Type.base(m.choices)),
  );

/**
 * State "Choice bounds" over a bound both of whose counts have a value, as the oracle reads
 * readings `order-min-choices` and `least-at-most-most`:
 *
 * - Where `ChoiceBound`'s zero is `unbounded`, a most of 0 bounds nothing, and otherwise the least is
 *   at most the most;
 * - Where it is `counted` (the order interactions, reading `order-min-choices`), the law binds only
 *   where the least is written, and then the least is at most the most.
 *
 * A bound one of whose counts has no value is judged by neither arm: an unwritten least with no
 * default is no bound, and a count written as no integer is its value domain's.
 *
 * @param r - The row.
 * @returns The predicate.
 */
const rangeBounds = (r: RowScalars<typeof BoundRange>) =>
  r.or(
    r.and(
      r.eq(ChoiceBound.at("zero", r.kind), "unbounded"),
      r.or(r.eq(r.mostValue, 0n), r.le(r.leastValue, r.mostValue)),
    ),
    r.and(
      r.eq(ChoiceBound.at("zero", r.kind), "counted"),
      r.or(r.eq(r.minWritten, false), r.le(r.leastValue, r.mostValue)),
    ),
  );

/**
 * State the default-hotspot law of each `LastWhere` rule over `shape` (reading `default-hotspot`):
 * a hotspot of the rule's kind, under one of its parents, whose shape is the rule's value, is its
 * parent's last element child, so whitespace, comments and instructions after it do not count.
 *
 * @param h - The row.
 * @returns The predicate.
 */
const lastWhere = (h: RowScalars<typeof HotspotNode>) =>
  h.and(
    ...lastWhereRules
      .filter(({ attribute }) => attribute === "shape")
      .map(({ kind, parents, value }) =>
        h.or(
          h.ne(h.kind, kind),
          h.not(h.in(h.parentKind, parents)),
          h.ne(h.area, value),
          h.eq(h.elements, h.parentElementChildren),
        ),
      ),
  );

/**
 * Each text entry's and extended text interaction's `pattern-mask`, by its element's place.
 */
const patternMasks = attributeValues("pattern-mask", [
  "qti-text-entry-interaction",
  extendedTextKind,
]);

/**
 * Each pattern match's `pattern`, by its element's place, whatever it spells.
 */
const matchPatterns = attributeValues("pattern", ["qti-pattern-match"]);

/**
 * Every regular expression a document writes, as written, by its element's place: a text entry's
 * or an extended text interaction's `pattern-mask` ("The regular expression language used is
 * defined in Appendix F of [XSCHEMA, 01]", information model §5.162.5 and §5.48.4), and a pattern
 * match's `pattern` where it is a literal ("The syntax for the regular expression language is as
 * defined in Appendix F of [XSCHEMA, 01]", §5.104.1). A `pattern` is a `StringOrVariableRef`: one
 * that names a variable in braces is a `VariableRef` row, judged by the variable it names (rules P8
 * and P24), never as a pattern. Each value is its attribute's as written, an `xs:string`'s
 * whiteSpace keeping it.
 */
const patternTexts = query(QtiBase)
  .rule((r) => {
    const { package: pkg, path, start, value } = v(patternMasks, "mask");

    return r
      .match(patternMasks, { package: pkg, path, start, value })
      .find({ package: pkg, path, start, text: value });
  })
  .rule((r) => {
    const { package: pkg, path, start, value } = v(matchPatterns, "pattern");

    return r
      .match(matchPatterns, { package: pkg, path, start, value })
      .where(r.not(VariableRef, { attribute: "pattern", package: pkg, path, start }))
      .find({ package: pkg, path, start, text: value });
  });

/**
 * {@link patternTexts} as a relation of `Qti`, which "Key text bound" holds within
 * `patternTextBytes`.
 */
const PatternKeyText = derived("PatternKeyText", patternTexts);

/**
 * Every regular expression a document writes, by its element's place ({@link patternTexts}), each a
 * `PatternKey` cast under grizzle's byte guard, whose other arm, the empty text, never stands in a
 * committed state ("Key text bound" refuses a longer one at import over {@link PatternKeyText}).
 */
export const PatternText = derived(
  "PatternText",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, text } = v(patternTexts, "written");

    return r
      .match(patternTexts, { package: pkg, path, start, text })
      .find({ package: pkg, path, pattern: keyedPattern(text), start });
  }),
);

/**
 * The interaction overlays' rules over their node, each named by its oracle law:
 *
 * - **"Aria value range"** (§5.2.31, reading `no-advisory-reading`) and **"Slider bounds"** (reading
 *   `schematron-intent`) over each element's two read bounds; and **"Key text bound"** over a
 *   pair's ARIA bound that is an `xs:decimal` past the bytes `Text.parseDecimal` reads
 *   (`parsedDecimalBytes`), which can name a decimal PostgreSQL's numeric does not hold: a stated
 *   limit of the representation, where "Aria value range" holds by its own arm.
 * - **"Binding cardinality"** (reading `binding-and-count-sentences`): a single response bound by an
 *   interaction whose most count decides its cardinality takes a most of 1, where that most has a
 *   value; and a gap match bound to a single response encloses at most one gap (spec reading
 *   `gap-match-cardinality`), a key over its gaps.
 * - **"BindingFit"** and **"RecordBindingFit"** over each typed binding's base type, cardinality and
 *   interaction kind: a string identifier's variable is "of base-type string" (§5.48.2, §5.162.3),
 *   which a record, having no base type, is not, so its whole value is judged by its cardinality
 *   alone, and a typed variable's base type by its declaration's; and **"Max strings required"**
 *   (reading `extended-text-max-strings`) over an extended text bound to a container.
 * - **"E1 derived":** an interaction's and a choice's node is of their kinds; every interaction and
 *   choice of a kind `ChoiceBound` pairs has its {@link CountBound}, whose counts' names are its
 *   kind's, each of whose unwritten counts with an XSD default has its {@link LeastCount} or
 *   {@link MostCount}, of that default, and each of whose written counts that is an integer is its
 *   count's value, both ways; and a hottext's nearest interaction is one, or its document node.
 * - **"Choice identifier key":** a choice's identifier is distinct among its document's choices of
 *   its kind, and among its assembly's (reading `choice-identifier-scope`).
 * - **"Choice bounds"** (readings `order-min-choices` and `least-at-most-most`) over each count of an
 *   interaction whose choices bound it, beside its interaction's choices, and over each bound both
 *   of whose counts have a value.
 * - **"N8 nearest":** a choice's interaction is its node's nearest; a hottext's nearest interaction
 *   has its {@link Interaction} of that kind, and a hottext whose nearest stands in another
 *   document names its document's context.
 * - **"PCI module source"** (R10-a): a portable custom interaction names its module in some form.
 * - **"Pattern language"** (information model §5.162.5, §5.48.4 and §5.104.1): every `pattern-mask`
 *   and every literal `qti-pattern-match` `pattern` is a regular expression of XML Schema 1.0 Part
 *   2's Appendix F, `{` and `}` metacharacters (reading `pattern-mask-braces`), judged by grizzle's
 *   `Xml.isPattern` over {@link PatternText}.
 * - **the default hotspot** (reading `default-hotspot`): "Graphic gap match default hotspot" and
 *   "default hotspot last slot" over each hotspot's shape, its rank and its parent's count.
 */
export const interactionOverlayLawsByName = {
  "Aria value range": declared("Aria value range", [
    check("Aria_value_range", AriaBounds, (r) =>
      r.or(
        r.not(Text.matches(r.min, decimalText)),
        r.not(Text.matches(r.max, decimalText)),
        r.gt(Text.octetLength(r.min), parsedDecimalBytes),
        r.gt(Text.octetLength(r.max), parsedDecimalBytes),
        r.le(
          Logic.when(
            Text.matches(r.min, decimalText),
            (min) =>
              Logic.when(
                Num.within(Text.octetLength(min), 0, parsedDecimalBytes),
                () => Text.parseDecimal(min),
                0n,
              ),
            0n,
          ),
          Logic.when(
            Text.matches(r.max, decimalText),
            (max) =>
              Logic.when(
                Num.within(Text.octetLength(max), 0, parsedDecimalBytes),
                () => Text.parseDecimal(max),
                0n,
              ),
            0n,
          ),
        ),
      ),
    ),
  ]),
  "Binding cardinality": declared("Binding cardinality", [
    check("Binding_cardinality", SingleBindingMost, (b) => b.eq(b.mostValue, 1n)),
    check("Binding_cardinality", PlacedSingleBindingMost, (b) => b.eq(b.mostValue, 1n)),
    key(on(SingleResponseGap, "package", "path", "start")),
    key(on(PlacedSingleResponseGap, "package", "assembly", "instance", "start")),
  ]),
  BindingFit: declared("BindingFit", [
    check("BindingFit", BindingCardinalityNode, (r) =>
      r.or(r.ne(r.attribute, "string-identifier"), r.ne(r.cardinality, "record")),
    ),
    check("BindingFit", BindingBaseTypeNode, (r) =>
      r.or(r.ne(r.attribute, "string-identifier"), r.eq(r.baseType, "string")),
    ),
    check("BindingFit", PlacedBindingCardinalityNode, (r) =>
      r.or(r.ne(r.attribute, "string-identifier"), r.ne(r.cardinality, "record")),
    ),
    check("BindingFit", PlacedBindingBaseTypeNode, (r) =>
      r.or(r.ne(r.attribute, "string-identifier"), r.eq(r.baseType, "string")),
    ),
    contained(
      on(
        select(BindingBaseTypeNode, (r) =>
          r.and(
            r.eq(r.attribute, "response-identifier"),
            r.ne(r.cardinality, "record"),
            r.not(r.in(r.kind, anyTypeKinds)),
          ),
        ),
        "baseType",
        "cardinality",
        "kind",
      ),
      on(BindingFit, "baseType", "cardinality", "kind"),
    ),
    contained(
      on(
        select(PlacedBindingBaseTypeNode, (r) =>
          r.and(
            r.eq(r.attribute, "response-identifier"),
            r.ne(r.cardinality, "record"),
            r.not(r.in(r.kind, anyTypeKinds)),
          ),
        ),
        "baseType",
        "cardinality",
        "kind",
      ),
      on(BindingFit, "baseType", "cardinality", "kind"),
    ),
  ]),
  "Choice bounds": declared("Choice bounds", [
    check("Choice_bounds", LeastChoiceBound, leastBounds),
    check("Choice_bounds", MostChoiceBound, mostBounds),
    check("Choice_bounds", BoundRange, rangeBounds),
  ]),
  "E1 derived": declared("E1 derived", [
    check("E1_derived", InteractionNode, (i) => i.in(i.kind, interactionKinds)),
    check("E1_derived", ChoiceNode, (c) => c.in(c.kind, choiceKinds)),
    check("E1_derived", HottextNode, (h) =>
      h.or(
        h.and(h.eq(h.nearest, 0n), h.eq(h.nearestKind, "document")),
        h.and(h.ne(h.nearest, 0n), h.in(h.nearestKind, interactionKinds)),
      ),
    ),
    contained(
      on(
        select(InteractionNode, (i) => i.in(i.kind, boundKinds)),
        "package",
        "path",
        "start",
      ),
      on(CountBound, "package", "path", "start"),
    ),
    contained(
      on(
        select(ChoiceNode, (c) => c.in(c.kind, boundKinds)),
        "package",
        "path",
        "start",
      ),
      on(CountBound, "package", "path", "start"),
    ),
    check("E1_derived", CountBoundNode, (b) =>
      b.and(
        b.eq(b.minName, ChoiceBound.at("min", b.kind)),
        b.eq(b.maxName, ChoiceBound.at("max", b.kind)),
      ),
    ),
    contained(
      on(
        select(CountBoundNode, (b) =>
          b.and(b.eq(b.minWritten, false), hasDefault(b, defaultedLeast)),
        ),
        "package",
        "path",
        "start",
      ),
      on(LeastCount, "package", "path", "start"),
    ),
    mirrors(
      on(integerReadOf(minNames), "package", "path", "start", "name", "value"),
      on(
        select(LeastCountNode, (l) => l.eq(l.minWritten, true)),
        "package",
        "path",
        "start",
        "minName",
        "least",
      ),
    ),
    check("E1_derived", LeastCountNode, (l) =>
      l.or(
        l.eq(l.minWritten, true),
        ...defaultedLeast.map(({ kinds, value }) =>
          l.and(l.in(l.kind, kinds), l.eq(l.least, value)),
        ),
      ),
    ),
    contained(
      on(
        select(CountBoundNode, (b) =>
          b.and(b.eq(b.maxWritten, false), hasDefault(b, defaultedMost)),
        ),
        "package",
        "path",
        "start",
      ),
      on(MostCount, "package", "path", "start"),
    ),
    mirrors(
      on(integerReadOf(maxNames), "package", "path", "start", "name", "value"),
      on(
        select(MostCountNode, (m) => m.eq(m.maxWritten, true)),
        "package",
        "path",
        "start",
        "maxName",
        "most",
      ),
    ),
    check("E1_derived", MostCountNode, (m) =>
      m.or(
        m.eq(m.maxWritten, true),
        ...defaultedMost.map(({ kinds, value }) => m.and(m.in(m.kind, kinds), m.eq(m.most, value))),
      ),
    ),
  ]),
  "Graphic gap match default hotspot": declared("Graphic gap match default hotspot", [
    check("Graphic_gap_match_default_hotspot", HotspotNode, (h) =>
      h.or(
        h.ne(h.kind, "qti-associable-hotspot"),
        h.ne(h.parentKind, graphicGapMatch),
        h.ne(h.area, defaultArea),
      ),
    ),
  ]),
  "Key text bound": declared("Key text bound", [
    check("Key_text_bound", PatternKeyText, (t) =>
      t.le(Text.octetLength(t.text), patternTextBytes),
    ),
    check("Key_text_bound", AriaBounds, (r) =>
      r.and(
        r.or(
          r.not(Text.matches(r.min, decimalText)),
          r.le(Text.octetLength(r.min), parsedDecimalBytes),
        ),
        r.or(
          r.not(Text.matches(r.max, decimalText)),
          r.le(Text.octetLength(r.max), parsedDecimalBytes),
        ),
      ),
    ),
  ]),
  "Max strings required": declared("Max strings required", [
    contained(
      on(
        select(BindingCardinalityNode, (r) =>
          r.and(
            r.eq(r.attribute, "response-identifier"),
            r.eq(r.kind, extendedTextKind),
            r.in(r.cardinality, ["multiple", "ordered"]),
          ),
        ),
        "package",
        "path",
        "start",
      ),
      on(
        select(CountBound, (b) => b.eq(b.maxWritten, true)),
        "package",
        "path",
        "start",
      ),
    ),
    contained(
      on(
        select(PlacedBindingCardinalityNode, (r) =>
          r.and(
            r.eq(r.attribute, "response-identifier"),
            r.eq(r.kind, extendedTextKind),
            r.in(r.cardinality, ["multiple", "ordered"]),
          ),
        ),
        "package",
        "path",
        "start",
      ),
      on(
        select(CountBound, (b) => b.eq(b.maxWritten, true)),
        "package",
        "path",
        "start",
      ),
    ),
  ]),
  "N8 nearest": declared("N8 nearest", [
    contained(
      on(ChoiceInteraction, "package", "path", "start", "interaction"),
      on(ChoiceNode, "package", "path", "start", "nearest"),
    ),
    contained(
      on(
        select(HottextNode, (h) => h.in(h.nearestKind, interactionKinds)),
        "package",
        "nearestPath",
        "nearest",
        "nearestKind",
      ),
      on(InteractionNode, "package", "path", "start", "kind"),
    ),
    contained(
      on(
        select(HottextNode, (h) => h.ne(h.nearestPath, h.path)),
        "package",
        "path",
        "nearestPath",
        "nearest",
      ),
      on(Document, "package", "path", "contextPath", "contextNearest"),
    ),
  ]),
  "PCI module source": declared("PCI module source", [
    check("PCI_module_source", InteractionNode, (i) =>
      i.or(i.ne(i.kind, pciKind), i.gt(i.moduleForms, 0n)),
    ),
  ]),
  "Pattern language": declared("Pattern language", [
    check("Pattern_language", PatternText, (p) => p.eq(Xml.isPattern(p.pattern), true)),
  ]),
  RecordBindingFit: declared("RecordBindingFit", [
    contained(
      on(
        select(BindingCardinalityNode, (r) =>
          r.and(
            r.eq(r.attribute, "response-identifier"),
            r.eq(r.cardinality, "record"),
            r.not(r.in(r.kind, anyTypeKinds)),
          ),
        ),
        "kind",
      ),
      on(RecordBindingFit, "kind"),
    ),
    contained(
      on(
        select(PlacedBindingCardinalityNode, (r) =>
          r.and(
            r.eq(r.attribute, "response-identifier"),
            r.eq(r.cardinality, "record"),
            r.not(r.in(r.kind, anyTypeKinds)),
          ),
        ),
        "kind",
      ),
      on(RecordBindingFit, "kind"),
    ),
  ]),
  "Slider bounds": declared("Slider bounds", [
    check("Slider_bounds", SliderBounds, (b) => doublesInOrder(b.lower, b.upper)),
  ]),
  "default hotspot last slot": declared("default hotspot last slot", [
    check("default_hotspot_last_slot", HotspotNode, lastWhere),
  ]),
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const interactionOverlayRelations = [
  AriaBounds,
  BindingBaseTypeNode,
  BindingCardinalityNode,
  ChoiceNode,
  BoundRange,
  CountBoundNode,
  HotspotNode,
  HottextNode,
  InteractionNode,
  LeastChoiceBound,
  LeastCountNode,
  MostChoiceBound,
  MostCountNode,
  PatternKeyText,
  PatternText,
  PlacedBindingBaseTypeNode,
  PlacedBindingCardinalityNode,
  PlacedSingleBindingMost,
  PlacedSingleResponseGap,
  SingleBindingMost,
  SingleResponseGap,
  SliderBounds,
] as const;

/**
 * The rules of this module, {@link interactionOverlayLawsByName} flattened.
 */
export const interactionOverlayLaws = Object.values(interactionOverlayLawsByName).flat();
