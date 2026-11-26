/**
 * The test and bank overlays' rules over their node and their attribute (`#pantry/qti/tests.ts`),
 * and the views of a test's structure every reader of a test reads (information model §2.8, §4.4,
 * §5.6, §5.159 and §7.40).
 *
 * A {@link Named} row holds an element's collapsed identifier, and a `StimulusRef` row its own,
 * each its attribute's `value`, which no row copies (C18); their laws read the element's kind and
 * its parent's kind, which only `Node` holds, and its document's type, which only `Document`
 * holds.
 *
 * **A test is its document, assembled.** A test document (`imsqti_test_xmlv3p0`) is its root
 * `qti-assessment-test` and everything under it, the head of its own assembly, which its section
 * refs and its sections' includes extend (reading `inclusion-cycles`); the laws read that assembled
 * test. Each view below reads the test document itself, `(package, path)`, which is the whole of a
 * test that places nothing ({@link DeliverableTest} names those), and nothing is copied: the test's
 * identity ({@link TestRoot}), its item refs in document order ({@link TestMember}), its parts'
 * modes ({@link TestPart}), its scopes' time limits ({@link MaxTime}, {@link MinTime},
 * {@link LateSubmission}) and item session control ({@link SessionControl}, {@link MaxAttempts}),
 * its sections' selection and ordering ({@link SectionSelection}, {@link SectionReplacement},
 * {@link SectionShuffle}). A scope is the element a `qti-time-limits` or a
 * `qti-item-session-control` stands in, by its place: the test root, a test part, a section or an
 * item ref.
 *
 * The laws over a test's structure, each cited to the information model where it is defined:
 * "Structure identifier" (§4.2.1, §5.159.1), "Item ref identifier" (§4.1.1), "Selection bound"
 * (§5.129.1), "Selection required" (§4.2.2, §5.6.2), "Branch target" and "Branch forward" (§5.23,
 * §5.98), "Section identifier target" (§7.27.1, §7.28.1, §7.39.1), "Weighted base" (§7.39.5),
 * "Weight key" (§7.50.1), "Variable mapping source" and "Variable mapping target" (§7.48), and
 * "Template default target" (§5.152.1).
 */
import {
  check,
  contained,
  derived,
  doubleText,
  key,
  lexicalForm,
  Logic,
  Num,
  on,
  pg,
  query,
  select,
  Text,
  Type,
  v,
} from "@bjornpagen/grizzle";
import type { RelationName } from "@bjornpagen/grizzle";
import { booleanFalse, booleanTrue } from "#pantry/grammar/domains.ts";
import { fallbackKind } from "#pantry/grammar/include.ts";
import { includeParentKinds, natural } from "#pantry/grammar/install.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { EntryPath, identifierBytes, keyedIdentifier, PackageName } from "#pantry/qti/limits.ts";
import { itemSessionVariables } from "#pantry/qti/declarations.ts";
import { attributeValues, NamedDeclaration, QtiViews } from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import {
  AssembledDocument,
  Inclusion,
  Instance,
  ItemRefDocument,
  ItemRefHref,
  Named,
  NavigationModeLexical,
  Site,
  SitePath,
  SiteTarget,
  StimulusRef,
  SubmissionModeLexical,
  UnplacedCause,
} from "#pantry/qti/tests.ts";
import {
  adaptiveSelectionKind,
  branchRuleKind,
  exits,
  includeKind,
  itemRefKind,
  mappingKind,
  namedKinds,
  orderingKind,
  partKind,
  sectionKind,
  sectionParts,
  sectionRefKind,
  selectionKind,
  sessionControlKind,
  stimulusRefKind,
  templateDefaultKind,
  testKind,
  timeLimitsKind,
  weightKind,
} from "#pantry/vocab/terms/tests.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * The `identifier` of each test part, section, item ref and stimulus ref, by its element's place,
 * with its element's kind: the attribute's `value`, its lexical form collapsed (`IdentifierDType`'s
 * class), which no row copies (C18, {@link attributeValues}).
 */
const testIdentifiers = attributeValues("identifier", [...namedKinds, stimulusRefKind]);

/**
 * {@link testIdentifiers} as a relation of `Qti`, which "Test overlay" holds each {@link Named} and
 * `StimulusRef` identifier to.
 */
const TestIdentifier = derived("TestIdentifier", testIdentifiers);

/**
 * Each name beside its element's kind, its parent and its pre-order interval `[start, end)`, by
 * the element's place: what every law over a test's or a bank's structure reads of a named
 * element.
 */
export const structureNodeRows = query(QtiBase).rule((r) => {
  const { identifier, package: pkg, path, start } = v(Named, "named");
  const { end, kind, parent } = v(Node, "node");

  return r
    .match(Named, { identifier, package: pkg, path, start })
    .match(Node, { end, kind, package: pkg, parent, path, start })
    .find({ end, identifier, kind, package: pkg, parent, path, start });
});

/**
 * {@link structureNodeRows} as a relation of `Qti`.
 */
const StructureNode = derived("StructureNode", structureNodeRows);

/**
 * The identifiers of an assembled document's parts, sections, section refs and item refs ({@link
 * namedKinds}), by their element's place: each such element, and only it, has its {@link Named} row.
 * AL1 holds each to its domain, `IdentifierDType`, an NCName once collapsed, so each names
 * something (spec reading `ncname-names`, decision 457 (2)). A test, a section document and every
 * document a site places is assembled, which holds every document a test's structure stands in.
 */
const structureNamingRows = query(QtiBase).rule((r) => {
  const { kind, package: pkg, path, start } = v(testIdentifiers, "identifier");

  return r
    .match(testIdentifiers, { kind, package: pkg, path, start })
    .match(AssembledDocument, { package: pkg, path })
    .where(r.in(kind, namedKinds))
    .find({ package: pkg, path, start });
});

/**
 * {@link structureNamingRows} as a relation of `Qti`.
 */
const StructureNaming = derived("StructureNaming", structureNamingRows);

/**
 * The `identifier` of each test's root, by its place: the attribute's `value`, collapsed.
 */
const testRootIdentifiers = attributeValues("identifier", [testKind]);

/**
 * Each test, by its document: the root's place, `start`, and the test's identifier, `test`, its
 * root's `identifier` collapsed (information model §4.4.1). The grammar admits a test only as its
 * document's root, so a document holds at most one. A test is its document, `(package, path)`: two
 * tests of one package may share an identifier, which QTI makes unique nowhere (SV-KEY-01). A test
 * whose root writes no `identifier` has none, and AL3 refuses it.
 */
const testRootRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value: test } = v(testRootIdentifiers, "root");

  return r
    .match(testRootIdentifiers, { package: pkg, path, start, value: test })
    .match(Node, { kind: testKind, package: pkg, parentKind: "document", path, start })
    .find({
      package: pkg,
      path,
      start,
      test: keyedIdentifier(test),
    });
});

/**
 * Each variable mapping's `source-identifier`, by its place.
 */
const mappingSources = attributeValues("source-identifier", [mappingKind]);

/**
 * Each variable mapping's `target-identifier`, by its place.
 */
const mappingTargets = attributeValues("target-identifier", [mappingKind]);

/**
 * Each item ref's `category`, by its place, with its value.
 */
const categoryValues = attributeValues("category", [itemRefKind]);

/**
 * The UTF-8 bytes of each identifier a test document writes that a test view keys, by its element's
 * place: a test's `identifier`, the text {@link testRootRows} keys, each token of an item ref's
 * `category`, the text {@link ItemRefCategory} keys, and each variable mapping's
 * `target-identifier`, the name an item ref's tables and readings key an item variable by
 * (`ItemRefTable`, `PrefixedMapResponse`, `#pantry/qti/overlay-queries/readings.ts`), each a
 * `QtiIdentifier` under grizzle's byte guard, which "Key text bound" holds within
 * `identifierBytes`. It holds each text's length, the one fact its law reads, never the text, so no
 * key holds a text of no byte bound: a `category`'s tokens of one length are one row.
 */
const TestIdentifierBytes = derived(
  "TestIdentifierBytes",
  query(QtiBase)
    .rule((r) => {
      const { package: pkg, path, start, value } = v(testRootIdentifiers, "root");

      return r
        .match(testRootIdentifiers, { package: pkg, path, start, value })
        .find({ bytes: Text.octetLength(value), package: pkg, path, start });
    })
    .rule((r) => {
      const { package: pkg, path, start, value } = v(categoryValues, "categories");
      const { token } = v(r.tokens(value), "category");

      return r
        .match(categoryValues, { package: pkg, path, start, value })
        .match(r.tokens(value), { token })
        .find({ bytes: Text.octetLength(token), package: pkg, path, start });
    })
    .rule((r) => {
      const { package: pkg, path, start, value } = v(mappingTargets, "target");

      return r
        .match(mappingTargets, { package: pkg, path, start, value })
        .find({ bytes: Text.octetLength(value), package: pkg, path, start });
    }),
);

/**
 * {@link testRootRows} as a relation of `Qti`.
 */
export const TestRoot = derived("TestRoot", testRootRows);

/**
 * Each item ref of a test document that names an item of the package, by its place: its test,
 * `test` ({@link TestRoot}); its identifier, `item`, which "Item ref identifier" holds equal to the
 * identifier of the item it names (§4.1.1); `document`, the path of that item's document, the
 * item's identity (SV-KEY-01: an item is `(package, path)`), which a ledger's item sessions join
 * on; the section that holds it, `section`, its parent's place; and its test part, `part`, the
 * place of the part whose interval holds it. Its place orders the test: "If no ordering rule is
 * given, assume that the elements are to be ordered in the order in which they are defined"
 * (§5.98), and with no selection rule "all elements are to be selected" (§5.129), so a deliverable
 * test ({@link DeliverableTest}) is delivered in `start` order, every member once. An item ref that
 * names an LTI link, or whose href lies outside the package, names no item document and has no row:
 * its test is not deliverable.
 *
 * A test names an item document once, so `(package, path, document)` is a key of {@link TestMember}
 * too, which "Item ref identifier" holds: a ref's identifier is its item's ("When an Item is
 * referenced using a 'qti-assesasment-item-ref' the values of the two 'identifier' characteristics
 * MUST be the same", QTI 3.0.1 Table 4.1.1), and no two refs of a test share one ("The identifier
 * of the section or item reference must be unique within the test", Table 4.2.1). So a member's
 * document names it in its test, as the ledger's item sessions read it.
 */
export const testMemberRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, test } = v(testRootRows, "test");
  const { identifier: item, parent: section, start } = v(structureNodeRows, "ref");
  const { target: document } = v(ItemRefDocument, "document");
  const { end: partEnd, start: part } = v(Node, "part");

  return r
    .match(testRootRows, { package: pkg, path, test })
    .match(structureNodeRows, {
      identifier: item,
      kind: itemRefKind,
      package: pkg,
      parent: section,
      path,
      start,
    })
    .match(ItemRefDocument, { package: pkg, path, start, target: document })
    .match(Node, { end: partEnd, kind: partKind, package: pkg, path, start: part })
    .where(r.lt(part, start), r.lt(start, partEnd))
    .find({ document, item, package: pkg, part, path, section, start, test });
});

/**
 * {@link testMemberRows} as a relation of `Qti`.
 */
export const TestMember = derived("TestMember", testMemberRows);

/**
 * Each item ref of a test beside every section that holds it, at any depth, by the item ref's place
 * and the section's: `section`, the section's place, and `identifier`, its identifier. A
 * `section-identifier` filter reads it: "only variables from items in the qti-assessment-section
 * with matching identifier are matched. Items in sub-sections are included in this definition"
 * (§7.27.1, §7.28.1, §7.39.1).
 */
const itemRefSectionRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start } = v(testMemberRows, "member");
  const { end: sectionEnd, identifier, start: section } = v(structureNodeRows, "section");

  return r
    .match(testMemberRows, { package: pkg, path, start })
    .match(structureNodeRows, {
      end: sectionEnd,
      identifier,
      kind: sectionKind,
      package: pkg,
      path,
      start: section,
    })
    .where(r.lt(section, start), r.lt(start, sectionEnd))
    .find({ identifier, package: pkg, path, section, start });
});

/**
 * {@link itemRefSectionRows} as a relation of `Qti`.
 */
export const ItemRefSection = derived("ItemRefSection", itemRefSectionRows);

/**
 * Each category an item ref is assigned to, by the item ref's place and the category's name: one
 * row per token of its `category`, an `IdentifierListDType`, `xs:list` of identifiers, its value
 * collapsed and split at its spaces (§5.6.6: "Items can optionally be assigned to one or more
 * categories. Categories are used to allow custom sets of item outcomes to be aggregated during
 * outcomes processing"), each a `QtiIdentifier` cast under grizzle's byte guard ("Key text bound"
 * refuses a longer one at import over {@link TestIdentifierBytes}). An item ref that writes none, or
 * an empty one, has no row.
 */
export const ItemRefCategory = derived(
  "ItemRefCategory",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value } = v(categoryValues, "categories");
    const { token: category } = v(r.tokens(value), "category");

    return r
      .match(categoryValues, { package: pkg, path, start, value })
      .match(r.tokens(value), { token: category })
      .find({ category: keyedIdentifier(category), package: pkg, path, start });
  }),
);

/**
 * Each test part's `navigation-mode`, by its place: its `value`, `linear` or `nonlinear` as written
 * (`NavigationModeEnum`, an `xs:string` enumeration, `whiteSpace` preserve).
 */
const navigationModes = attributeValues("navigation-mode", [partKind]);

/**
 * Each test part's `submission-mode`, by its place: its `value`, `individual` or `simultaneous` as
 * written (`SubmissionModeEnum`, an `xs:string` enumeration, `whiteSpace` preserve).
 */
const submissionModes = attributeValues("submission-mode", [partKind]);

/**
 * Each test part of a test, by its place: its test, its identifier, `part`, and the two modes it
 * writes, `navigation` a `NavigationMode` and `submission` a `SubmissionMode`
 * (`#pantry/qti/tests.ts`), each the mode its attribute's value spells (`NavigationModeLexical`,
 * `SubmissionModeLexical`), so a reader binds a mode by its code (§5.159.4: "A testPart in linear
 * mode restricts the candidate to attempt each item in turn. Once the candidate moves on they are
 * not permitted to return"; §5.159.5: "A testPart in individual mode requires the candidate to
 * submit their responses on an item-by-item basis. In simultaneous mode the candidate's responses
 * are all submitted together at the end of the testPart"). Both are required, with no default
 * (`TestPartDType`), so a part that omits one has no row, and AL3 refuses it; a value outside its
 * enumeration is its value domain's to refuse.
 */
const testPartRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, test } = v(testRootRows, "test");
  const { identifier: part, start } = v(structureNodeRows, "part");
  const { value: navigationValue } = v(navigationModes, "navigationValue");
  const { value: submissionValue } = v(submissionModes, "submissionValue");
  const { code: navigation } = v(NavigationModeLexical, "navigation");
  const { code: submission } = v(SubmissionModeLexical, "submission");

  return r
    .match(testRootRows, { package: pkg, path, test })
    .match(structureNodeRows, { identifier: part, kind: partKind, package: pkg, path, start })
    .match(navigationModes, { package: pkg, path, start, value: navigationValue })
    .match(submissionModes, { package: pkg, path, start, value: submissionValue })
    .match(NavigationModeLexical, { code: navigation, lexical: navigationValue })
    .match(SubmissionModeLexical, { code: submission, lexical: submissionValue })
    .find({ navigation, package: pkg, part, path, start, submission, test });
});

/**
 * {@link testPartRows} as a relation of `Qti`.
 */
export const TestPart = derived("TestPart", testPartRows);

/**
 * The most UTF-8 bytes of a text PostgreSQL's regex engine reads in a query (grizzle's README,
 * "Text": it "reads at most 268,435,454 bytes of `x`"): an attribute's value is unbounded, so a
 * query that matches it reads it under this guard, and a longer value, which no number's lexical
 * form is in practice, matches no pattern here and is its value domain's to judge.
 */
const regexBytes = 268_435_454;

/**
 * A guarded match's true, as a typed term.
 */
const yes = Type.literal(pg.boolean, true);

/**
 * A guarded match's false, as a typed term.
 */
const no = Type.literal(pg.boolean, false);

/**
 * What a guarded parse of seconds gives where its guard does not hold, which its query's own guard
 * keeps from standing: no row holds it.
 */
const noSeconds = Type.literal(pg["double precision"], 0);

/**
 * What a guarded parse of `max-attempts` gives where its guard does not hold; no row holds it.
 */
const noAttempts = Type.literal(pg.integer, 0);

/**
 * What a guarded parse of `select` gives where its guard does not hold; no row holds it.
 */
const noSelect = Type.literal(pg.bigint, 0n);

/**
 * The seconds one attribute of a `qti-time-limits` gives its scope, the element that holds it:
 * its value, a `NonNegativeDoubleDType` collapsed, read as XML Schema reads an `xs:double` by
 * grizzle's `Text.parseDouble` (doubleLexicalMap, XML Schema 1.1 Part 2 §3.3.5.2). A value
 * outside the double's lexical space is its value domain's to refuse, and has no row.
 *
 * @param name - The relation's name.
 * @param attribute - `min-time` or `max-time`.
 * @returns The derived relation, by the scope's place.
 */
const limitSeconds = <Name extends string>(
  name: RelationName<Name>,
  attribute: "max-time" | "min-time",
) => {
  const values = attributeValues(attribute, [timeLimitsKind]);

  return derived(
    name,
    query(QtiBase).rule((r) => {
      const { package: pkg, path, start, value } = v(values, "limit");
      const { parent: scope } = v(Node, "limits");

      return r
        .match(values, { package: pkg, path, start, value })
        .match(Node, { kind: timeLimitsKind, package: pkg, parent: scope, path, start })
        .where(
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(value), 0, regexBytes),
              () => Logic.cond(Text.matches(value, doubleText), yes, no),
              no,
            ),
            true,
          ),
        )
        .find({
          package: pkg,
          path,
          scope,
          seconds: Logic.when(
            Num.within(Text.octetLength(value), 0, regexBytes),
            () =>
              Logic.when(
                Text.matches(value, doubleText),
                (double) => Text.parseDouble(double),
                noSeconds,
              ),
            noSeconds,
          ),
        });
    }),
  );
};

/**
 * Each scope's `max-time`, by the scope's place: "the maximum duration, in seconds, allocated to"
 * the test, part, section or item the scope is (§7.40.2), a non-negative double. A scope that
 * writes none has no row: no maximum.
 */
export const MaxTime = limitSeconds("MaxTime", "max-time");

/**
 * Each scope's `min-time`, by the scope's place: "the minimum duration, in seconds, allocated to"
 * it (§7.40.1), applicable to a section and an item ref "only when linear navigation mode is in
 * effect". A scope that writes none has no row.
 */
export const MinTime = limitSeconds("MinTime", "min-time");

/**
 * Each `qti-time-limits`'s `allow-late-submission`, by its element's place, with its value.
 */
const lateValues = attributeValues("allow-late-submission", [timeLimitsKind]);

/**
 * The scopes whose time limits allow a late submission, by the scope's place: "The
 * allow-late-submission attribute regulates whether a candidate's response that is beyond the
 * max-time should still be accepted" (§7.40.3), an `xs:boolean` whose default is false
 * (`TimeLimitsDType`), so a scope has a row exactly where its time limits write it true (`true` or
 * `1`).
 */
const lateSubmissionRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value } = v(lateValues, "late");
  const { parent: scope } = v(Node, "limits");

  return r
    .match(lateValues, { package: pkg, path, start, value })
    .match(Node, { kind: timeLimitsKind, package: pkg, parent: scope, path, start })
    .where(r.in(value, booleanTrue))
    .find({ package: pkg, path, scope });
});

/**
 * {@link lateSubmissionRows} as a relation of `Qti`.
 */
export const LateSubmission = derived("LateSubmission", lateSubmissionRows);

/**
 * The six `xs:boolean` settings of `qti-item-session-control` (§7.19.2 to §7.19.7).
 */
const sessionSettings = [
  "allow-comment",
  "allow-review",
  "allow-skipping",
  "show-feedback",
  "show-solution",
  "validate-responses",
] as const;

/**
 * The boolean settings an item session control writes, by its scope's place and the setting, with
 * the value it writes: `true` where its form is `true` or `1`, `false` where it is `false` or `0`.
 * Only a written setting has a row: "a setting at qti-test-part level affects all items in that
 * part unless the setting is overridden at the qti-assessment-section level or ultimately at the
 * individual qti-assessment-item-ref. The defaults for an qti-Item-session-control are used only in
 * the absence of any applicable constraint" (§7.19), so the setting in force for an item ref is the
 * nearest scope's that writes it, and the XSD's default only where none does (spec reading
 * `item-session-control-resolution`).
 */
const sessionControlRows = query(QtiBase)
  .rule((r) => {
    const { name: setting, package: pkg, path, start, value } = v(Attribute, "setting");
    const { parent: scope } = v(Node, "control");

    return r
      .match(Attribute, {
        kind: sessionControlKind,
        name: setting,
        package: pkg,
        path,
        start,
        value,
      })
      .match(Node, { kind: sessionControlKind, package: pkg, parent: scope, path, start })
      .where(r.in(setting, sessionSettings), r.in(value, booleanTrue))
      .find({ package: pkg, path, scope, setting, value: true });
  })
  .rule((r) => {
    const { name: setting, package: pkg, path, start, value } = v(Attribute, "setting");
    const { parent: scope } = v(Node, "control");

    return r
      .match(Attribute, {
        kind: sessionControlKind,
        name: setting,
        package: pkg,
        path,
        start,
        value,
      })
      .match(Node, { kind: sessionControlKind, package: pkg, parent: scope, path, start })
      .where(r.in(setting, sessionSettings), r.in(value, booleanFalse))
      .find({ package: pkg, path, scope, setting, value: false });
  });

/**
 * {@link sessionControlRows} as a relation of `Qti`.
 */
export const SessionControl = derived("SessionControl", sessionControlRows);

/**
 * Each item session control's `max-attempts`, by its element's place, with its value.
 */
const attemptValues = attributeValues("max-attempts", [sessionControlKind]);

/**
 * The `max-attempts` an item session control writes, by its scope's place, an `xs:int` (§7.19.1: "A
 * value of 0 indicates no limit. If it is unspecified it is treated as 1 for non-adaptive items"; a
 * negative value sets no limit either, spec reading `negative-max-attempts`). A scope that writes
 * none has no row.
 */
const maxAttemptsRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value } = v(attemptValues, "attempts");
  const { parent: scope } = v(Node, "control");

  return r
    .match(attemptValues, { package: pkg, path, start, value })
    .match(Node, { kind: sessionControlKind, package: pkg, parent: scope, path, start })
    .where(
      r.eq(
        Logic.when(
          Num.within(Text.octetLength(value), 0, regexBytes),
          () => Logic.cond(Text.matches(value, lexicalForm(pg.integer)), yes, no),
          no,
        ),
        true,
      ),
    )
    .find({
      attempts: Logic.when(
        Num.within(Text.octetLength(value), 0, regexBytes),
        () =>
          Logic.when(
            Text.matches(value, lexicalForm(pg.integer)),
            (form) => Type.cast(form, pg.integer),
            noAttempts,
          ),
        noAttempts,
      ),
      package: pkg,
      path,
      scope,
    });
});

/**
 * {@link maxAttemptsRows} as a relation of `Qti`.
 */
export const MaxAttempts = derived("MaxAttempts", maxAttemptsRows);

/**
 * Each `qti-selection`'s `select`, by its element's place, with its value.
 */
const selectValues = attributeValues("select", [selectionKind]);

/**
 * Each section's selection, by the section's place: `select`, "The number of child elements to be
 * selected" (§5.129.1), an `xs:int`. A section that writes no selection has no row: "If no
 * selection rules are given it must be assumed that all elements are to be selected" (§5.129).
 */
const sectionSelectionRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value } = v(selectValues, "select");
  const { parent: section } = v(Node, "selection");

  return r
    .match(selectValues, { package: pkg, path, start, value })
    .match(Node, { kind: selectionKind, package: pkg, parent: section, path, start })
    .where(
      r.eq(
        Logic.when(
          Num.within(Text.octetLength(value), 0, regexBytes),
          () => Logic.cond(Text.matches(value, lexicalForm(pg.bigint)), yes, no),
          no,
        ),
        true,
      ),
    )
    .find({
      package: pkg,
      path,
      section,
      select: Logic.when(
        Num.within(Text.octetLength(value), 0, regexBytes),
        () =>
          Logic.when(
            Text.matches(value, lexicalForm(pg.bigint)),
            (form) => Type.cast(form, pg.bigint),
            noSelect,
          ),
        noSelect,
      ),
    });
});

/**
 * {@link sectionSelectionRows} as a relation of `Qti`.
 */
export const SectionSelection = derived("SectionSelection", sectionSelectionRows);

/**
 * The selections that write `with-replacement` true, by their element's place.
 */
const replacementValues = attributeValues("with-replacement", [selectionKind]);

/**
 * The sections whose selection draws with replacement, by the section's place: "By setting
 * 'with-replacement' to 'true' each element becomes eligible for selection multiple times"
 * (§5.129.2), an `xs:boolean` whose default is false.
 */
const sectionReplacementRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value } = v(replacementValues, "replacement");
  const { parent: section } = v(Node, "selection");

  return r
    .match(replacementValues, { package: pkg, path, start, value })
    .match(Node, { kind: selectionKind, package: pkg, parent: section, path, start })
    .where(r.in(value, booleanTrue))
    .find({ package: pkg, path, section });
});

/**
 * {@link sectionReplacementRows} as a relation of `Qti`.
 */
export const SectionReplacement = derived("SectionReplacement", sectionReplacementRows);

/**
 * The orderings that write `shuffle` true, by their element's place.
 */
const shuffleValues = attributeValues("shuffle", [orderingKind]);

/**
 * The sections whose ordering shuffles, by the section's place: "If 'true' causes the order of the
 * child elements to be randomized" (§5.98.1), an `xs:boolean` whose default is false, so a section
 * that writes no ordering, or one that does not shuffle, keeps its children in the order they are
 * defined.
 */
const sectionShuffleRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value } = v(shuffleValues, "shuffle");
  const { parent: section } = v(Node, "ordering");

  return r
    .match(shuffleValues, { package: pkg, path, start, value })
    .match(Node, { kind: orderingKind, package: pkg, parent: section, path, start })
    .where(r.in(value, booleanTrue))
    .find({ package: pkg, path, section });
});

/**
 * {@link sectionShuffleRows} as a relation of `Qti`.
 */
export const SectionShuffle = derived("SectionShuffle", sectionShuffleRows);

/**
 * The parts of each section, by the part's place, with the section's: each child whose kind is a
 * section part (§4.2.15), an item ref, a section, a section ref or an include standing for one.
 */
const sectionPartNodes = query(QtiBase).rule((r) => {
  const { kind, package: pkg, parent: section, path, start } = v(Node, "part");

  return r
    .match(Node, { kind, package: pkg, parent: section, parentKind: sectionKind, path, start })
    .where(r.in(kind, sectionParts))
    .find({ package: pkg, path, section, start });
});

/**
 * Each selecting section that holds parts, by the section's place, with its count of them, `parts`:
 * "Sub-sections always count as 1, regardless of how many child elements they have and whether or
 * not they are visible" (§5.129.1), so each part counts once (spec reading
 * `selection-without-replacement`).
 */
const selectedPartsRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, section, select: count } = v(sectionSelectionRows, "selection");
  const { start } = v(sectionPartNodes, "part");

  return r
    .match(sectionSelectionRows, { package: pkg, path, section, select: count })
    .match(sectionPartNodes, { package: pkg, path, section, start })
    .find({ package: pkg, parts: r.count(), path, section, select: count });
});

/**
 * The selections without replacement, by the section's place: "The number of children to select
 * may exceed the number of child elements defined only if with-replacement is true" (§5.129.1).
 */
const selectionWithoutReplacementRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, section } = v(sectionSelectionRows, "selection");

  return r
    .match(sectionSelectionRows, { package: pkg, path, section })
    .where(r.not(sectionReplacementRows, { package: pkg, path, section }))
    .find({ package: pkg, path, section });
});

/**
 * {@link selectionWithoutReplacementRows} as a relation of `Qti`.
 */
const SelectionWithoutReplacement = derived(
  "SelectionWithoutReplacement",
  selectionWithoutReplacementRows,
);

/**
 * The selections that select at most their section's parts, by the section's place: a section
 * that holds parts and selects at most their count, and one that holds none and selects none.
 */
const BoundedSelection = derived(
  "BoundedSelection",
  query(QtiBase)
    .rule((r) => {
      const {
        package: pkg,
        parts,
        path,
        section,
        select: count,
      } = v(selectedPartsRows, "selection");

      return r
        .match(selectedPartsRows, { package: pkg, parts, path, section, select: count })
        .where(r.le(count, Type.base(parts)))
        .find({ package: pkg, path, section });
    })
    .rule((r) => {
      const { package: pkg, path, section, select: count } = v(sectionSelectionRows, "selection");

      return r
        .match(sectionSelectionRows, { package: pkg, path, section, select: count })
        .where(r.not(sectionPartNodes, { package: pkg, path, section }), r.le(count, 0n))
        .find({ package: pkg, path, section });
    }),
);

/**
 * The required parts of each section, by the part's place: a part that writes `required` true
 * (§4.2.2 and §5.6.2, an `xs:boolean` whose default is false).
 */
const requiredPartNodes = query(QtiBase).rule((r) => {
  const { package: pkg, path, section, start } = v(sectionPartNodes, "part");
  const { value } = v(Attribute, "required");

  return r
    .match(sectionPartNodes, { package: pkg, path, section, start })
    .match(Attribute, { name: "required", package: pkg, path, start, value })
    .where(r.in(value, booleanTrue))
    .find({ package: pkg, path, section, start });
});

/**
 * Each selecting section that holds a required part, with its count of required parts and its
 * `select`: "It is an error if a section contains a selection rule that selects fewer child
 * elements than the number of required elements it contains" (§4.2.2).
 */
const requiredPartsRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, section, select: count } = v(sectionSelectionRows, "selection");
  const { start } = v(requiredPartNodes, "required");

  return r
    .match(sectionSelectionRows, { package: pkg, path, section, select: count })
    .match(requiredPartNodes, { package: pkg, path, section, start })
    .find({ package: pkg, path, required: r.count(), section, select: count });
});

/**
 * {@link requiredPartsRows} as a relation of `Qti`.
 */
const RequiredParts = derived("RequiredParts", requiredPartsRows);

/**
 * The selecting sections that select at least as many children as they hold required parts, by
 * the section's place.
 */
const RequirementMet = derived(
  "RequirementMet",
  query(QtiBase).rule((r) => {
    const {
      package: pkg,
      path,
      required,
      section,
      select: count,
    } = v(requiredPartsRows, "required");

    return r
      .match(requiredPartsRows, { package: pkg, path, required, section, select: count })
      .where(r.le(Type.base(required), count))
      .find({ package: pkg, path, section });
  }),
);

/**
 * The item refs a selection with replacement can repeat, by their place: each item ref under a
 * section, at any depth, whose selection draws with replacement (§5.98: replacement "enables two
 * or more instances of an item referred to by the same assessment-item-ref to appear in the
 * sequence of items for a test").
 */
const replaceableItemRefRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start } = v(structureNodeRows, "ref");
  const { section } = v(sectionReplacementRows, "replacement");
  const { end: sectionEnd } = v(Node, "section");

  return r
    .match(structureNodeRows, { kind: itemRefKind, package: pkg, path, start })
    .match(sectionReplacementRows, { package: pkg, path, section })
    .match(Node, { end: sectionEnd, package: pkg, path, start: section })
    .where(r.lt(section, start), r.lt(start, sectionEnd))
    .find({ package: pkg, path, start });
});

/**
 * Each branch rule's `target`, by the rule's place, with its value.
 */
const branchTargets = attributeValues("target", [branchRuleKind]);

/**
 * Each branch rule that names no reserved exit, by its place, with its source, the element that
 * holds it (an item ref, a section, a section ref or a test part, §5.23), its source's kind and
 * interval, and its target's identifier.
 */
const namingBranchRuleRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value: target } = v(branchTargets, "target");
  const { parent: source } = v(Node, "rule");
  const { end: sourceEnd, kind: sourceKind } = v(Node, "source");

  return r
    .match(branchTargets, { package: pkg, path, start, value: target })
    .match(Node, { kind: branchRuleKind, package: pkg, parent: source, path, start })
    .match(Node, { end: sourceEnd, kind: sourceKind, package: pkg, path, start: source })
    .where(Logic.not(r.in(target, exits)))
    .find({ package: pkg, path, source, sourceEnd, sourceKind, start, target });
});

/**
 * Each placement of a document in a test's assembly, by the assembly and the instance's place in
 * its tree (`Instance`, spec readings `section-document` and `inclusion-cycles`): `path`, the
 * document it places; `end`, its instance interval's end; `parent`, its parent instance; and `site`
 * and `siteDocument`, the element of its parent's document that places it, a section ref or an
 * include, the root's own document and 0 for the test's own instance, `instance` 0.
 */
export const testInstances = query(QtiBase).rule((r) => {
  const {
    assembly,
    document: path,
    end,
    package: pkg,
    parent,
    site,
    siteDocument,
    start: instance,
  } = v(Instance, "instance");

  return r
    .match(Instance, {
      assembly,
      assemblyKind: testKind,
      document: path,
      end,
      package: pkg,
      parent,
      site,
      siteDocument,
      start: instance,
    })
    .find({ assembly, end, instance, package: pkg, parent, path, site, siteDocument });
});

/**
 * Each instance of an assembly with its anchor, by the assembly and the instance: the instance
 * itself where it is the assembly's root or a section ref places it, and else its parent's, an
 * include splicing its target into its parent's copy (spec readings `inclusion-cycles` and
 * `test-identifier-namespace`). A test "may refer to the same section multiple times within a test"
 * (information model §7.5.3), each reference the facade of its section (§7.5), so two instances a
 * section ref places with one document are two copies of one section, and the instances below each
 * anchor are its copy's; an include placing one fragment twice makes two elements of one copy, as
 * XInclude's merged document holds them. `anchorDocument` is the anchor's document.
 */
export const instanceAnchors = query(QtiBase).recursive("InstanceAnchor", {
  base: [
    (r) => {
      const { assembly, document, package: pkg } = v(Instance, "root");

      return r
        .match(Instance, { assembly, document, package: pkg, start: 0n })
        .find({ anchor: 0n, anchorDocument: document, assembly, instance: 0n, package: pkg });
    },
    (r) => {
      const {
        assembly,
        document,
        package: pkg,
        site,
        siteDocument,
        start: instance,
      } = v(Instance, "placed");

      return r
        .match(Instance, { assembly, document, package: pkg, site, siteDocument, start: instance })
        .match(Node, { kind: sectionRefKind, package: pkg, path: siteDocument, start: site })
        .find({ anchor: instance, anchorDocument: document, assembly, instance, package: pkg });
    },
  ],
  rec: [
    (r, self) => {
      const {
        anchor,
        anchorDocument,
        assembly,
        instance: parent,
        package: pkg,
      } = v(self, "parent");
      const { site, siteDocument, start: instance } = v(Instance, "child");

      return r
        .match(self, { anchor, anchorDocument, assembly, instance: parent, package: pkg })
        .match(Instance, { assembly, package: pkg, parent, site, siteDocument, start: instance })
        .match(Node, { kind: includeKind, package: pkg, path: siteDocument, start: site })
        .where(r.gt(instance, parent))
        .find({ anchor, anchorDocument, assembly, instance, package: pkg });
    },
  ],
  row: {
    anchor: natural,
    anchorDocument: EntryPath,
    assembly: EntryPath,
    instance: natural,
    package: PackageName,
  },
});

/**
 * Each name a test's assembly holds, by the test, its anchor ({@link instanceAnchors}) and the
 * named element's instance and place, with its identifier (spec reading
 * `test-identifier-namespace`): every name of every document an instance of the test places.
 */
const anchoredNameRows = query(QtiBase).rule((r) => {
  const { anchor, anchorDocument, assembly, instance, package: pkg } = v(instanceAnchors, "anchor");
  const { path } = v(testInstances, "instance");
  const { identifier, start } = v(structureNodeRows, "name");

  return r
    .match(instanceAnchors, { anchor, anchorDocument, assembly, instance, package: pkg })
    .match(testInstances, { assembly, instance, package: pkg, path })
    .match(structureNodeRows, { identifier, package: pkg, path, start })
    .find({ anchor, anchorDocument, assembly, identifier, instance, package: pkg, path, start });
});

/**
 * {@link anchoredNameRows} as a relation of `Qti`, which "Test name key" keys within a copy: no
 * two elements of one copy share an identifier, an included fragment placed twice there among
 * them.
 */
const AnchoredName = derived("AnchoredName", anchoredNameRows);

/**
 * The distinct elements of a test's assembly with their identifiers, by the test and the element
 * as its copy holds it: the anchor's document and the element's place. Two copies of one section
 * document hold its elements once (§7.5.3: "A test may refer to the same section multiple times
 * within a test. Note however that each reference must have a unique identifier"), and every other
 * element is its own, so "Test name key" keys it across the test (§4.2.1: "The identifier of the
 * section or item reference must be unique within the test").
 */
const AssembledName = derived(
  "AssembledName",
  query(QtiBase).rule((r) => {
    const {
      anchorDocument,
      assembly,
      identifier,
      package: pkg,
      path,
      start,
    } = v(anchoredNameRows, "name");

    return r
      .match(anchoredNameRows, { anchorDocument, assembly, identifier, package: pkg, path, start })
      .find({ anchorDocument, assembly, identifier, package: pkg, path, start });
  }),
);

/**
 * The test part each instance of a test's assembly below its root lies in, by the instance: the
 * part of the test document whose interval holds the site that places the instance's chain, the
 * site of its ancestor the test document holds. An instance placed outside every part, an include
 * in the test's own rubric block, has none.
 */
const instanceParts = query(QtiBase).recursive("InstancePart", {
  base: [
    (r) => {
      const { assembly, package: pkg, site, start: instance } = v(Instance, "instance");
      const { end: partEnd, start: part } = v(Node, "part");

      return r
        .match(Instance, {
          assembly,
          assemblyKind: testKind,
          package: pkg,
          site,
          siteDocument: assembly,
          start: instance,
        })
        .match(Node, { end: partEnd, kind: partKind, package: pkg, path: assembly, start: part })
        .where(r.gt(instance, 0n), r.lt(part, site), r.lt(site, partEnd))
        .find({ assembly, instance, package: pkg, part });
    },
  ],
  rec: [
    (r, self) => {
      const { assembly, instance: parent, package: pkg, part } = v(self, "parent");
      const { start: instance } = v(Instance, "child");

      return r
        .match(self, { assembly, instance: parent, package: pkg, part })
        .match(Instance, { assembly, package: pkg, parent, start: instance })
        .where(r.gt(instance, parent))
        .find({ assembly, instance, package: pkg, part });
    },
  ],
  row: { assembly: EntryPath, instance: natural, package: PackageName, part: natural },
});

/**
 * The test part of each named element of a test's assembly, by the test, the instance and the
 * element's place: an element of the test document lies in the part whose interval holds it, and
 * an element of a document an instance places lies in that instance's part.
 */
const assembledPartRows = query(QtiBase)
  .rule((r) => {
    const { package: pkg, start } = v(structureNodeRows, "name");
    const { path: assembly } = v(testRootRows, "test");
    const { end: partEnd, start: part } = v(Node, "part");

    return r
      .match(testRootRows, { package: pkg, path: assembly })
      .match(structureNodeRows, { package: pkg, path: assembly, start })
      .match(Node, { end: partEnd, kind: partKind, package: pkg, path: assembly, start: part })
      .where(r.le(part, start), r.lt(start, partEnd))
      .find({ assembly, instance: 0n, package: pkg, part, path: assembly, start });
  })
  .rule((r) => {
    const { assembly, instance, package: pkg, part } = v(instanceParts, "instancePart");
    const { path } = v(testInstances, "instance");
    const { start } = v(structureNodeRows, "name");

    return r
      .match(instanceParts, { assembly, instance, package: pkg, part })
      .match(testInstances, { assembly, instance, package: pkg, path })
      .match(structureNodeRows, { package: pkg, path, start })
      .find({ assembly, instance, package: pkg, part, path, start });
  });

/**
 * The instances of a test's assembly a selection with replacement can repeat, by the test and the
 * instance: one placed by a site under a section whose selection draws with replacement, or below
 * such an instance (§5.98: replacement "enables two or more instances of an item referred to by
 * the same assessment-item-ref to appear in the sequence of items for a test").
 */
const replacedInstances = query(QtiBase).recursive("ReplacedInstance", {
  base: [
    (r) => {
      const {
        assembly,
        package: pkg,
        site,
        siteDocument,
        start: instance,
      } = v(Instance, "instance");
      const { section } = v(sectionReplacementRows, "replacement");
      const { end: sectionEnd } = v(Node, "section");

      return r
        .match(Instance, {
          assembly,
          assemblyKind: testKind,
          package: pkg,
          site,
          siteDocument,
          start: instance,
        })
        .match(sectionReplacementRows, { package: pkg, path: siteDocument, section })
        .match(Node, { end: sectionEnd, package: pkg, path: siteDocument, start: section })
        .where(r.gt(instance, 0n), r.lt(section, site), r.lt(site, sectionEnd))
        .find({ assembly, instance, package: pkg });
    },
  ],
  rec: [
    (r, self) => {
      const { assembly, instance: parent, package: pkg } = v(self, "parent");
      const { start: instance } = v(Instance, "child");

      return r
        .match(self, { assembly, instance: parent, package: pkg })
        .match(Instance, { assembly, package: pkg, parent, start: instance })
        .where(r.gt(instance, parent))
        .find({ assembly, instance, package: pkg });
    },
  ],
  row: { assembly: EntryPath, instance: natural, package: PackageName },
});

/**
 * The item refs of a test's assembly a selection with replacement can repeat, by the test, the
 * instance and the item ref's place: one under a replacing section of its own document, or in a
 * document an instance a replacement repeats places ({@link replacedInstances}).
 */
export const assembledReplaceableRows = query(QtiBase)
  .rule((r) => {
    const { assembly, instance, package: pkg, path } = v(testInstances, "instance");
    const { start } = v(replaceableItemRefRows, "ref");

    return r
      .match(testInstances, { assembly, instance, package: pkg, path })
      .match(replaceableItemRefRows, { package: pkg, path, start })
      .find({ assembly, instance, package: pkg, path, start });
  })
  .rule((r) => {
    const { assembly, instance, package: pkg } = v(replacedInstances, "replaced");
    const { path } = v(testInstances, "instance");
    const { start } = v(structureNodeRows, "ref");

    return r
      .match(replacedInstances, { assembly, instance, package: pkg })
      .match(testInstances, { assembly, instance, package: pkg, path })
      .match(structureNodeRows, { kind: itemRefKind, package: pkg, path, start })
      .find({ assembly, instance, package: pkg, path, start });
  });

/**
 * Each branch rule that names no exit, placed in a test's assembly, by the test, the instance that
 * places its document and the rule's place (spec reading `branch-rule-targets`: each rule resolves
 * once for each placement of its document).
 */
const branchResolutionRows = query(QtiBase).rule((r) => {
  const { assembly, instance, package: pkg, path } = v(testInstances, "instance");
  const { source, sourceEnd, sourceKind, start, target } = v(namingBranchRuleRows, "rule");

  return r
    .match(testInstances, { assembly, instance, package: pkg, path })
    .match(namingBranchRuleRows, {
      package: pkg,
      path,
      source,
      sourceEnd,
      sourceKind,
      start,
      target,
    })
    .find({ assembly, instance, package: pkg, path, source, sourceEnd, sourceKind, start, target });
});

/**
 * {@link branchResolutionRows} as a relation of `Qti`.
 */
const BranchResolution = derived("BranchResolution", branchResolutionRows);

/**
 * Each element a placed branch rule's target names in an instance that holds the rule's (spec
 * reading `branch-rule-targets`): its own instance's document, or a document an ancestor instance
 * places. From outside a section document a ref places, no target lies inside it: "branching rules
 * should treat referred sections as leaf nodes, that have no children that are amenable to
 * branching separately from their immediate parent" (§7.5). Each row carries the target's instance
 * and place, its kind and interval, and `point` and `pointEnd`, the source's interval in the
 * target's document: the source's own where the two are one instance, and else the site in the
 * target's document that places the source's chain. An included fragment's root is a target too: an
 * include "is treated as if it was actually an instance of the root element of the fragment
 * referred to" (§2.12), and "Adaptive test branch rules can only refer to included or directly
 * referenced sections" (§7.5). It stands where its include stands, so its order is the include's
 * place in the holder's document, and its part and its repetition are its placed root's
 * (`partInstance`, `partStart`, a placement's part being its site's), as every other candidate's
 * are its own. The rule's document and the placed root's are their instances' documents, so neither
 * is a field; the target's, `targetPath`, is the one its readers read by, since a pool is a
 * document's.
 */
const branchCandidateRows = query(QtiBase)
  .rule((r) => {
    const {
      assembly,
      instance,
      package: pkg,
      path,
      source,
      sourceEnd,
      sourceKind,
      start,
      target,
    } = v(branchResolutionRows, "rule");
    const { end: targetEnd, kind: namedKind, start: named } = v(structureNodeRows, "target");

    return r
      .match(branchResolutionRows, {
        assembly,
        instance,
        package: pkg,
        path,
        source,
        sourceEnd,
        sourceKind,
        start,
        target,
      })
      .match(structureNodeRows, {
        end: targetEnd,
        identifier: target,
        kind: namedKind,
        package: pkg,
        path,
        start: named,
      })
      .find({
        assembly,
        instance,
        named,
        namedKind,
        package: pkg,
        partInstance: instance,
        partStart: named,
        point: source,
        pointEnd: sourceEnd,
        source,
        sourceKind,
        start,
        targetEnd,
        targetInstance: instance,
        targetPath: path,
      });
  })
  .rule((r) => {
    const {
      assembly,
      instance,
      package: pkg,
      path,
      source,
      sourceKind,
      start,
      target,
    } = v(branchResolutionRows, "rule");
    const {
      end: ancestorEnd,
      instance: targetInstance,
      path: targetPath,
    } = v(testInstances, "ancestor");
    const { end: viaEnd, instance: via, site: point } = v(testInstances, "via");
    const { end: pointEnd } = v(Node, "site");
    const { end: targetEnd, kind: namedKind, start: named } = v(structureNodeRows, "target");

    return r
      .match(branchResolutionRows, {
        assembly,
        instance,
        package: pkg,
        path,
        source,
        sourceKind,
        start,
        target,
      })
      .match(testInstances, {
        assembly,
        end: ancestorEnd,
        instance: targetInstance,
        package: pkg,
        path: targetPath,
      })
      .match(testInstances, {
        assembly,
        end: viaEnd,
        instance: via,
        package: pkg,
        parent: targetInstance,
        site: point,
      })
      .match(Node, { end: pointEnd, package: pkg, path: targetPath, start: point })
      .match(structureNodeRows, {
        end: targetEnd,
        identifier: target,
        kind: namedKind,
        package: pkg,
        path: targetPath,
        start: named,
      })
      .where(
        r.lt(targetInstance, instance),
        r.lt(instance, ancestorEnd),
        r.le(via, instance),
        r.lt(instance, viaEnd),
        r.gt(via, targetInstance),
      )
      .find({
        assembly,
        instance,
        named,
        namedKind,
        package: pkg,
        partInstance: targetInstance,
        partStart: named,
        point,
        pointEnd,
        source,
        sourceKind,
        start,
        targetEnd,
        targetInstance,
        targetPath,
      });
  })
  .rule((r) => {
    // The root of a fragment an include of the rule's own document places, at the include.
    const {
      assembly,
      instance,
      package: pkg,
      path,
      source,
      sourceEnd,
      sourceKind,
      start,
      target,
    } = v(branchResolutionRows, "rule");
    const { instance: included, path: includedPath, site } = v(testInstances, "included");
    const { end: siteEnd } = v(Node, "include");
    const { kind: namedKind, start: root } = v(structureNodeRows, "root");

    return r
      .match(branchResolutionRows, {
        assembly,
        instance,
        package: pkg,
        path,
        source,
        sourceEnd,
        sourceKind,
        start,
        target,
      })
      .match(testInstances, {
        assembly,
        instance: included,
        package: pkg,
        parent: instance,
        path: includedPath,
        site,
        siteDocument: path,
      })
      .match(Node, { end: siteEnd, kind: includeKind, package: pkg, path, start: site })
      .match(structureNodeRows, {
        identifier: target,
        kind: namedKind,
        package: pkg,
        path: includedPath,
        start: root,
      })
      .match(Node, { package: pkg, parentKind: "document", path: includedPath, start: root })
      .find({
        assembly,
        instance,
        named: site,
        namedKind,
        package: pkg,
        partInstance: included,
        partStart: root,
        point: source,
        pointEnd: sourceEnd,
        source,
        sourceKind,
        start,
        targetEnd: siteEnd,
        targetInstance: instance,
        targetPath: path,
      });
  })
  .rule((r) => {
    // The root of a fragment an include of an ancestor's document places, at the include.
    const {
      assembly,
      instance,
      package: pkg,
      path,
      source,
      sourceKind,
      start,
      target,
    } = v(branchResolutionRows, "rule");
    const { end: ancestorEnd, instance: holder, path: holderPath } = v(testInstances, "ancestor");
    const { end: viaEnd, instance: via, site: point } = v(testInstances, "via");
    const { end: pointEnd } = v(Node, "site");
    const { instance: included, path: includedPath, site } = v(testInstances, "included");
    const { end: siteEnd } = v(Node, "include");
    const { kind: namedKind, start: root } = v(structureNodeRows, "root");

    return r
      .match(branchResolutionRows, {
        assembly,
        instance,
        package: pkg,
        path,
        source,
        sourceKind,
        start,
        target,
      })
      .match(testInstances, {
        assembly,
        end: ancestorEnd,
        instance: holder,
        package: pkg,
        path: holderPath,
      })
      .match(testInstances, {
        assembly,
        end: viaEnd,
        instance: via,
        package: pkg,
        parent: holder,
        site: point,
      })
      .match(Node, { end: pointEnd, package: pkg, path: holderPath, start: point })
      .match(testInstances, {
        assembly,
        instance: included,
        package: pkg,
        parent: holder,
        path: includedPath,
        site,
        siteDocument: holderPath,
      })
      .match(Node, { end: siteEnd, kind: includeKind, package: pkg, path: holderPath, start: site })
      .match(structureNodeRows, {
        identifier: target,
        kind: namedKind,
        package: pkg,
        path: includedPath,
        start: root,
      })
      .match(Node, { package: pkg, parentKind: "document", path: includedPath, start: root })
      .where(
        r.lt(holder, instance),
        r.lt(instance, ancestorEnd),
        r.le(via, instance),
        r.lt(instance, viaEnd),
        r.gt(via, holder),
      )
      .find({
        assembly,
        instance,
        named: site,
        namedKind,
        package: pkg,
        partInstance: included,
        partStart: root,
        point,
        pointEnd,
        source,
        sourceKind,
        start,
        targetEnd: siteEnd,
        targetInstance: holder,
        targetPath: holderPath,
      });
  });

/**
 * The structure kinds a branch rule of an item ref, a section or a section ref may name (§5.23:
 * "In the case of an item or section, the target must refer to an item or section"; a section
 * ref is the facade of its section, §7.5).
 */
const branchingKinds = [itemRefKind, sectionKind, sectionRefKind] as const;

/**
 * Each placed branch rule whose target names an element it may jump to, by the test, the instance
 * and the rule's place, with the target's (§5.23: "In the case of an item or section, the target
 * must refer to an item or section in the same test-part ... For test-parts, the target must refer
 * to another test-part"; §5.98: "It is therefore an error to make such an item the target of a
 * branch-rule", of an item ref a selection with replacement can repeat; spec reading
 * `branch-rule-targets`):
 *
 * - A test part's rule names another test part;
 * - An item ref's, a section's or a section ref's rule names an item ref, a section or a section ref
 *   whose test part is the source's, never an item ref a replacement can repeat in its placement
 *   ({@link assembledReplaceableRows}).
 *
 * A reserved exit is admitted on every rule, and names no element. The rule's document is its
 * instance's, so it is no field ({@link branchCandidateRows}).
 */
const targetedBranchRuleRows = query(QtiBase)
  .rule((r) => {
    const {
      assembly,
      instance,
      named,
      package: pkg,
      point,
      pointEnd,
      start,
      targetEnd,
      targetInstance,
      targetPath,
    } = v(branchCandidateRows, "candidate");

    return r
      .match(branchCandidateRows, {
        assembly,
        instance,
        named,
        namedKind: partKind,
        package: pkg,
        point,
        pointEnd,
        sourceKind: partKind,
        start,
        targetEnd,
        targetInstance,
        targetPath,
      })
      .where(r.ne(named, point))
      .find({
        assembly,
        instance,
        named,
        package: pkg,
        point,
        pointEnd,
        start,
        targetEnd,
        targetInstance,
        targetPath,
      });
  })
  .rule((r) => {
    const {
      assembly,
      instance,
      named,
      namedKind,
      package: pkg,
      partInstance,
      partStart,
      point,
      pointEnd,
      source,
      sourceKind,
      start,
      targetEnd,
      targetInstance,
      targetPath,
    } = v(branchCandidateRows, "candidate");
    const { part } = v(assembledPartRows, "sourcePart");

    return r
      .match(branchCandidateRows, {
        assembly,
        instance,
        named,
        namedKind,
        package: pkg,
        partInstance,
        partStart,
        point,
        pointEnd,
        source,
        sourceKind,
        start,
        targetEnd,
        targetInstance,
        targetPath,
      })
      .match(assembledPartRows, { assembly, instance, package: pkg, part, start: source })
      .match(assembledPartRows, {
        assembly,
        instance: partInstance,
        package: pkg,
        part,
        start: partStart,
      })
      .where(
        r.in(sourceKind, branchingKinds),
        r.in(namedKind, branchingKinds),
        r.not(assembledReplaceableRows, {
          assembly,
          instance: partInstance,
          package: pkg,
          start: partStart,
        }),
      )
      .find({
        assembly,
        instance,
        named,
        package: pkg,
        point,
        pointEnd,
        start,
        targetEnd,
        targetInstance,
        targetPath,
      });
  });

/**
 * The placed branch rules whose target names an element they may jump to: each targeted one, an
 * included fragment's root among them, judged at its include ({@link branchCandidateRows}).
 */
const ResolvedBranchRule = derived(
  "ResolvedBranchRule",
  query(QtiBase).rule((r) => {
    const { assembly, instance, package: pkg, start } = v(targetedBranchRuleRows, "rule");

    return r
      .match(targetedBranchRuleRows, { assembly, instance, package: pkg, start })
      .find({ assembly, instance, package: pkg, start });
  }),
);

/**
 * The sections whose children a shuffle can reorder in each placement of their document in a test's
 * assembly, by the test, the instance and the section's place: a section that shuffles; a section
 * an invisible section that is not kept together mixes its children into, its children then "mixed
 * into the parent's selection prior to shuffling" (§5.98; spec readings `branch-rule-targets` and
 * `section-visibility`), at any depth; and the root section of a document a section ref places
 * under such a section, where that root is itself invisible and not kept together, since a section
 * ref is the facade of its section (§7.5). A section's visibility is its own `visible` alone, read
 * only where written (reading `section-visibility`).
 */
const shuffledSections = query(QtiBase).recursive("ShuffledSection", {
  base: [
    (r) => {
      const { assembly, instance, package: pkg, path } = v(testInstances, "instance");
      const { section } = v(sectionShuffleRows, "shuffle");

      return r
        .match(testInstances, { assembly, instance, package: pkg, path })
        .match(sectionShuffleRows, { package: pkg, path, section })
        .find({ assembly, instance, package: pkg, path, section });
    },
  ],
  rec: [
    (r, self) => {
      const { assembly, instance, package: pkg, path, section: parent } = v(self, "parent");
      const { start: section } = v(Node, "loose");
      const { value: visible } = v(Attribute, "visible");
      const { value: together } = v(Attribute, "together");

      return r
        .match(self, { assembly, instance, package: pkg, path, section: parent })
        .match(Node, { kind: sectionKind, package: pkg, parent, path, start: section })
        .match(Attribute, { name: "visible", package: pkg, path, start: section, value: visible })
        .match(Attribute, {
          name: "keep-together",
          package: pkg,
          path,
          start: section,
          value: together,
        })
        .where(r.in(visible, booleanFalse), r.in(together, booleanFalse))
        .find({ assembly, instance, package: pkg, path, section });
    },
    (r, self) => {
      const {
        assembly,
        instance: parent,
        package: pkg,
        path: parentPath,
        section: shuffler,
      } = v(self, "parent");
      const { document: path, site, start: instance } = v(Instance, "child");
      const { kind: siteKind } = v(Node, "site");
      const { start: root } = v(Node, "root");
      const { value: visible } = v(Attribute, "visible");
      const { value: together } = v(Attribute, "together");

      return r
        .match(self, {
          assembly,
          instance: parent,
          package: pkg,
          path: parentPath,
          section: shuffler,
        })
        .match(Instance, {
          assembly,
          document: path,
          package: pkg,
          parent,
          site,
          siteDocument: parentPath,
          start: instance,
        })
        .match(Node, {
          kind: siteKind,
          package: pkg,
          parent: shuffler,
          path: parentPath,
          start: site,
        })
        .match(Node, { kind: sectionKind, package: pkg, parentKind: "document", path, start: root })
        .match(Attribute, { name: "visible", package: pkg, path, start: root, value: visible })
        .match(Attribute, {
          name: "keep-together",
          package: pkg,
          path,
          start: root,
          value: together,
        })
        .where(
          r.gt(instance, parent),
          r.in(siteKind, [sectionRefKind, includeKind]),
          r.in(visible, booleanFalse),
          r.in(together, booleanFalse),
        )
        .find({ assembly, instance, package: pkg, path, section: root });
    },
  ],
  row: {
    assembly: EntryPath,
    instance: natural,
    package: PackageName,
    path: EntryPath,
    section: natural,
  },
});

/**
 * Each targeted branch rule with each section of the target's document above both its source's
 * point there and its target, by the test, the instance, the rule's place and the section's: the
 * nearest of them, the one with the greatest start, is the section whose ordering orders the two
 * (§5.98).
 */
const commonSectionCandidates = query(QtiBase).rule((r) => {
  const {
    assembly,
    instance,
    named,
    package: pkg,
    point,
    pointEnd,
    start,
    targetEnd,
    targetPath,
  } = v(targetedBranchRuleRows, "rule");
  const { end: sectionEnd, start: section } = v(Node, "section");

  return r
    .match(targetedBranchRuleRows, {
      assembly,
      instance,
      named,
      package: pkg,
      point,
      pointEnd,
      start,
      targetEnd,
      targetPath,
    })
    .match(Node, {
      end: sectionEnd,
      kind: sectionKind,
      package: pkg,
      path: targetPath,
      start: section,
    })
    .where(
      r.lt(section, point),
      r.le(pointEnd, sectionEnd),
      r.lt(section, named),
      r.le(targetEnd, sectionEnd),
    )
    .find({ assembly, instance, package: pkg, section, start });
});

/**
 * Each targeted branch rule with the nearest of its {@link commonSectionCandidates}, `nearest`, the
 * one with the greatest start.
 */
const commonSectionRows = query(QtiBase).rule((r) => {
  const { assembly, instance, package: pkg, section, start } = v(commonSectionCandidates, "common");

  return r
    .match(commonSectionCandidates, { assembly, instance, package: pkg, section, start })
    .find({ assembly, instance, nearest: r.max(section), package: pkg, start });
});

/**
 * The sections whose children mix into their parent's selection: an invisible section not kept
 * together, whose "child elements ... are mixed into the parent's selection prior to shuffling"
 * (§5.98), by its place.
 */
const mixedSectionRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start } = v(Node, "section");
  const { value: visible } = v(Attribute, "visible");
  const { value: together } = v(Attribute, "together");

  return r
    .match(Node, { kind: sectionKind, package: pkg, path, start })
    .match(Attribute, { name: "visible", package: pkg, path, start, value: visible })
    .match(Attribute, { name: "keep-together", package: pkg, path, start, value: together })
    .where(r.in(visible, booleanFalse), r.in(together, booleanFalse))
    .find({ package: pkg, path, start });
});

/**
 * The fixed elements, by place: an item ref or a section whose `fixed` is true (§4.2.3, §5.6.3:
 * "If a child element is fixed it must never be shuffled").
 */
const fixedRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value } = v(Attribute, "fixed");

  return r
    .match(Attribute, { name: "fixed", package: pkg, path, start, value })
    .where(r.in(value, booleanTrue))
    .find({ package: pkg, path, start });
});

/**
 * The sections of each shuffle's pool in one document, by the document, the pool's owner and the
 * section: the owner, a section that shuffles, and each section a section of the pool mixes in
 * (§5.98).
 */
const poolSections = query(QtiBase).recursive("PoolSection", {
  base: [
    (r) => {
      const { package: pkg, path, section } = v(sectionShuffleRows, "shuffle");

      return r
        .match(sectionShuffleRows, { package: pkg, path, section })
        .find({ owner: section, package: pkg, path, section });
    },
  ],
  rec: [
    (r, self) => {
      const { owner, package: pkg, path, section: parent } = v(self, "pool");
      const { start: section } = v(Node, "mixed");

      return r
        .match(self, { owner, package: pkg, path, section: parent })
        .match(Node, { kind: sectionKind, package: pkg, parent, path, start: section })
        .match(mixedSectionRows, { package: pkg, path, start: section })
        .find({ owner, package: pkg, path, section });
    },
  ],
  row: { owner: natural, package: PackageName, path: EntryPath, section: natural },
});

/**
 * The sections a pool mixes in, by place: a mixed section whose parent is a section of a pool,
 * whose children are its parent's pool's, so it owns no pool of its own.
 */
const mixedIntoPool = query(QtiBase).rule((r) => {
  const { package: pkg, path, section: parent } = v(poolSections, "pool");
  const { start } = v(Node, "mixed");

  return r
    .match(poolSections, { package: pkg, path, section: parent })
    .match(Node, { kind: sectionKind, package: pkg, parent, path, start })
    .match(mixedSectionRows, { package: pkg, path, start })
    .find({ package: pkg, path, start });
});

/**
 * The owners of the pools a document's shuffles draw: each shuffling section no pool mixes in.
 */
const poolOwners = query(QtiBase).rule((r) => {
  const { package: pkg, path, section: owner } = v(sectionShuffleRows, "shuffle");

  return r
    .match(sectionShuffleRows, { package: pkg, path, section: owner })
    .where(r.not(mixedIntoPool, { package: pkg, path, start: owner }))
    .find({ owner, package: pkg, path });
});

/**
 * The blocks of each pool, by the document, the owner and the block's place and end: each child of
 * a section of the pool that is no mixed section, which the shuffle moves whole, among them a site
 * (a section ref or an include), whose placed root is read in its own document (§5.98).
 */
const poolBlocks = query(QtiBase).rule((r) => {
  const { owner, package: pkg, path, section } = v(poolSections, "pool");
  const { end, kind, start } = v(Node, "block");

  return r
    .match(poolOwners, { owner, package: pkg, path })
    .match(poolSections, { owner, package: pkg, path, section })
    .match(Node, { end, kind, package: pkg, parent: section, path, start })
    .where(r.in(kind, sectionParts), r.not(mixedSectionRows, { package: pkg, path, start }))
    .find({ end, owner, package: pkg, path, start });
});

/**
 * Each pool's unfixed blocks, by the document, the owner and the block's place: where the shuffle
 * may put an element that is not fixed.
 */
const unfixedBlocks = query(QtiBase).rule((r) => {
  const { owner, package: pkg, path, start } = v(poolBlocks, "block");

  return r
    .match(poolBlocks, { owner, package: pkg, path, start })
    .where(r.not(fixedRows, { package: pkg, path, start }))
    .find({ owner, package: pkg, path, start });
});

/**
 * Each pool's first and last unfixed block ({@link unfixedBlocks}), by the document and the owner.
 */
const unfixedSpans = query(QtiBase).rule((r) => {
  const { owner, package: pkg, path, start } = v(unfixedBlocks, "block");

  return r
    .match(unfixedBlocks, { owner, package: pkg, path, start })
    .find({ first: r.min(start), last: r.max(start), owner, package: pkg, path });
});

/**
 * The pools a selection with replacement draws, by the document and the owner: one of whose
 * sections selects with replacement, so an element may stand in its sequence more than once.
 */
const replacingPools = query(QtiBase).rule((r) => {
  const { owner, package: pkg, path, section } = v(poolSections, "pool");

  return r
    .match(poolSections, { owner, package: pkg, path, section })
    .match(sectionReplacementRows, { package: pkg, path, section })
    .find({ owner, package: pkg, path });
});

/**
 * Each targeted branch rule whose target and source lie in two blocks of one pool of the target's
 * document, by the test, the instance and the rule's place: the pool whose owner's shuffle draws
 * the nearest section above both ({@link commonSectionRows}), with the source's block (`source`,
 * the one holding its point) and the target's (`target`).
 */
const pooledBranchRows = query(QtiBase).rule((r) => {
  const {
    assembly,
    instance,
    named,
    package: pkg,
    point,
    pointEnd,
    start,
    targetEnd,
    targetPath,
  } = v(targetedBranchRuleRows, "rule");
  const { nearest } = v(commonSectionRows, "common");
  const { owner } = v(poolSections, "pool");
  const { end: sourceEnd, start: source } = v(poolBlocks, "sourceBlock");
  const { end: targetBlockEnd, start: target } = v(poolBlocks, "targetBlock");

  return r
    .match(targetedBranchRuleRows, {
      assembly,
      instance,
      named,
      package: pkg,
      point,
      pointEnd,
      start,
      targetEnd,
      targetPath,
    })
    .match(commonSectionRows, { assembly, instance, nearest, package: pkg, start })
    .match(poolSections, { owner, package: pkg, path: targetPath, section: nearest })
    .match(poolBlocks, { end: sourceEnd, owner, package: pkg, path: targetPath, start: source })
    .match(poolBlocks, {
      end: targetBlockEnd,
      owner,
      package: pkg,
      path: targetPath,
      start: target,
    })
    .where(
      r.le(source, point),
      r.le(pointEnd, sourceEnd),
      r.le(target, named),
      r.le(targetEnd, targetBlockEnd),
      r.not(replacingPools, { owner, package: pkg, path: targetPath }),
    )
    .find({ assembly, instance, owner, package: pkg, path: targetPath, source, start, target });
});

/**
 * The targeted branch rules whose target precedes their source in every sequence their pool's
 * shuffle can draw, by the test, the instance and the rule's place, where the target's block comes
 * first in document order (§4.2.3, §5.6.3: "If a child element is fixed it must never be shuffled.
 * When used in combination with a selection rule fixed elements do not have their position fixed
 * until after selection has taken place. For example, selecting 3 elements from {A,B,C,D} without
 * replacement might result in the selection {A,B,C}. If the section is subject to shuffling but B
 * is fixed then permutations such as {A,C,B} are not allowed whereas permutations like {C,B,A} are
 * permitted"): a fixed block keeps its place among the selected blocks, which keep document order,
 * and the unfixed blocks take the rest of the places, so the target comes first always where
 *
 * - Both blocks are fixed;
 * - The target's block is fixed and every unfixed block of the pool comes after it, the source's
 *   among them;
 * - Or the source's block is fixed and every unfixed block of the pool comes before it.
 */
const fixedBackwardRows = query(QtiBase)
  .rule((r) => {
    const {
      assembly,
      instance,
      package: pkg,
      path,
      source,
      start,
      target,
    } = v(pooledBranchRows, "rule");

    return r
      .match(pooledBranchRows, { assembly, instance, package: pkg, path, source, start, target })
      .match(fixedRows, { package: pkg, path, start: source })
      .match(fixedRows, { package: pkg, path, start: target })
      .find({ assembly, instance, package: pkg, start });
  })
  .rule((r) => {
    const {
      assembly,
      instance,
      owner,
      package: pkg,
      path,
      start,
      target,
    } = v(pooledBranchRows, "rule");
    const { first } = v(unfixedSpans, "span");

    return r
      .match(pooledBranchRows, { assembly, instance, owner, package: pkg, path, start, target })
      .match(fixedRows, { package: pkg, path, start: target })
      .match(unfixedSpans, { first, owner, package: pkg, path })
      .where(r.gt(first, target))
      .find({ assembly, instance, package: pkg, start });
  })
  .rule((r) => {
    const {
      assembly,
      instance,
      owner,
      package: pkg,
      path,
      source,
      start,
    } = v(pooledBranchRows, "rule");
    const { last } = v(unfixedSpans, "span");

    return r
      .match(pooledBranchRows, { assembly, instance, owner, package: pkg, path, source, start })
      .match(fixedRows, { package: pkg, path, start: source })
      .match(unfixedSpans, { last, owner, package: pkg, path })
      .where(r.lt(last, source))
      .find({ assembly, instance, package: pkg, start });
  });

/**
 * Each targeted branch rule whose target comes after its source in every sequence a delivery can
 * draw, by the test, the instance and the rule's place (§5.23: the target "has not yet been
 * presented"; §2.8.3.2: "cycles are not allowed"; spec reading `branch-rule-targets`):
 *
 * - Its target starts at or after its source's point's end in the target's document, so it is neither
 *   the source, nor an ancestor, nor a descendant of it;
 * - Or the two are apart, and the section nearest above both ({@link commonSectionRows}) reorders its
 *   children in that placement ({@link shuffledSections}), so their order is drawn at delivery, and
 *   no `fixed` holds it backward in every draw ({@link fixedBackwardRows}).
 */
const ForwardBranchRule = derived(
  "ForwardBranchRule",
  query(QtiBase)
    .rule((r) => {
      const {
        assembly,
        instance,
        named,
        package: pkg,
        pointEnd,
        start,
      } = v(targetedBranchRuleRows, "rule");

      return r
        .match(targetedBranchRuleRows, {
          assembly,
          instance,
          named,
          package: pkg,
          pointEnd,
          start,
        })
        .where(r.ge(named, pointEnd))
        .find({ assembly, instance, package: pkg, start });
    })
    .rule((r) => {
      const {
        assembly,
        instance,
        package: pkg,
        point,
        start,
        targetEnd,
        targetInstance,
      } = v(targetedBranchRuleRows, "rule");
      const { nearest } = v(commonSectionRows, "common");

      return r
        .match(targetedBranchRuleRows, {
          assembly,
          instance,
          package: pkg,
          point,
          start,
          targetEnd,
          targetInstance,
        })
        .match(commonSectionRows, { assembly, instance, nearest, package: pkg, start })
        .match(shuffledSections, {
          assembly,
          instance: targetInstance,
          package: pkg,
          section: nearest,
        })
        .where(
          r.le(targetEnd, point),
          r.not(fixedBackwardRows, { assembly, instance, package: pkg, start }),
        )
        .find({ assembly, instance, package: pkg, start });
    }),
);

/**
 * The expressions that filter the items they read by a section (§7.27.1, §7.28.1, §7.39.1: "If
 * specified, only variables from items in the qti-assessment-section with matching identifier are
 * matched").
 */
const sectionFilterKinds = [
  "qti-number-correct",
  "qti-number-incorrect",
  "qti-number-presented",
  "qti-number-responded",
  "qti-number-selected",
  "qti-outcome-maximum",
  "qti-outcome-minimum",
  "qti-test-variables",
] as const;

/**
 * Each `section-identifier` such an expression writes, by its element's place, with its value.
 */
const sectionFilters = attributeValues("section-identifier", sectionFilterKinds);

/**
 * Each section filter placed in a test's assembly, by the test and the filter's place, with the
 * identifier it names: it resolves once for each test that places its document (spec reading
 * `section-document`).
 */
const placedFilterRows = query(QtiBase).rule((r) => {
  const { assembly, package: pkg, path } = v(testInstances, "instance");
  const { start, value, valueDigest } = v(sectionFilters, "filter");

  return r
    .match(testInstances, { assembly, package: pkg, path })
    .match(sectionFilters, { package: pkg, path, start, value, valueDigest })
    .find({ assembly, package: pkg, path, start, value, valueDigest });
});

/**
 * {@link placedFilterRows} as a relation of `Qti`.
 */
const PlacedFilter = derived("PlacedFilter", placedFilterRows);

/**
 * The sections and section refs a placed section filter names, by the test, the filter's place and
 * the section's placement: the instance and the element, one row for each placement of a section
 * document placed twice (reading `test-identifier-namespace`), so a filter it names twice has two.
 * A section ref, the facade of its placement (§7.5), names it as a section does.
 */
const FilteredSection = derived(
  "FilteredSection",
  query(QtiBase).rule((r) => {
    const {
      assembly,
      package: pkg,
      path,
      start,
      value,
      valueDigest,
    } = v(placedFilterRows, "filter");
    const { instance, path: sectionPath } = v(testInstances, "placement");
    const { kind, start: section } = v(structureNodeRows, "section");

    return r
      .match(placedFilterRows, { assembly, package: pkg, path, start, value, valueDigest })
      .match(testInstances, { assembly, instance, package: pkg, path: sectionPath })
      .match(structureNodeRows, {
        identifier: value,
        kind,
        package: pkg,
        path: sectionPath,
        start: section,
      })
      .where(r.in(kind, [sectionKind, sectionRefKind]))
      .find({ assembly, instance, package: pkg, path, section, sectionPath, start });
  }),
);

/**
 * Each weight's `identifier`, by its place.
 */
const weightIdentifiers = attributeValues("identifier", [weightKind]);

/**
 * Each weight of an item ref, by the weight's place, with its item ref, `ref`, and its identifier
 * (§7.50.1: "An item can have any number of weights, each one is given an identifier that is used
 * to refer to the weight in outcomes processing").
 */
const weightNameRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value: identifier } = v(weightIdentifiers, "weight");
  const { parent: ref } = v(Node, "node");

  return r
    .match(weightIdentifiers, { package: pkg, path, start, value: identifier })
    .match(Node, { kind: weightKind, package: pkg, parent: ref, path, start })
    .find({ identifier, package: pkg, path, ref, start });
});

/**
 * Each weight's `value`, by its place.
 */
const weightValues = attributeValues("value", [weightKind]);

/**
 * Each weight of an item ref, by the weight's place, with its item ref, `ref`, its identifier and
 * its value, a double (§7.50.2: "Weights are floating point values. Weights can be applied to
 * outcome variables of base-type float or integer. The weight is applied at the time the
 * variable's value is evaluated during outcomes processing. The result is always treated as having
 * base-type float"), read as XML Schema reads an `xs:double`. A weight whose `value` is no double
 * is its value domain's to refuse, and has no row.
 */
export const WeightValue = derived(
  "WeightValue",
  query(QtiBase).rule((r) => {
    const { identifier, package: pkg, path, ref, start } = v(weightNameRows, "weight");
    const { value } = v(weightValues, "value");

    return r
      .match(weightNameRows, { identifier, package: pkg, path, ref, start })
      .match(weightValues, { package: pkg, path, start, value })
      .where(
        r.eq(
          Logic.when(
            Num.within(Text.octetLength(value), 0, regexBytes),
            () => Logic.cond(Text.matches(value, doubleText), yes, no),
            no,
          ),
          true,
        ),
      )
      .find({
        identifier,
        package: pkg,
        path,
        ref,
        start,
        value: Logic.when(
          Num.within(Text.octetLength(value), 0, regexBytes),
          () =>
            Logic.when(
              Text.matches(value, doubleText),
              (double) => Text.parseDouble(double),
              noSeconds,
            ),
          noSeconds,
        ),
      });
  }),
);

/**
 * Each test variables expression's `base-type`, by its place.
 */
const testVariablesBases = attributeValues("base-type", ["qti-test-variables"]);

/**
 * Each test variables expression that writes both a `weight-identifier` and a `base-type`, by its
 * place, with the base type's value as written (`BaseTypeEnum`, an `xs:string` enumeration).
 */
const weightedBaseTypeRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value, valueDigest } = v(testVariablesBases, "base");

  return r
    .match(testVariablesBases, { package: pkg, path, start, value, valueDigest })
    .match(Attribute, { name: "weight-identifier", package: pkg, path, start })
    .find({ package: pkg, path, start, value, valueDigest });
});

/**
 * {@link weightedBaseTypeRows} as a relation of `Qti`.
 */
const WeightedBaseType = derived("WeightedBaseType", weightedBaseTypeRows);

/**
 * Each variable mapping, by its place, with its item ref, `ref`, its `source` and its `target`
 * (§7.48: "Variable mappings allow outcome variables declared with the name source-identifier in
 * the corresponding item to be treated as if they were declared with the name target-identifier
 * during outcome processing"). Both attributes are required, so a mapping that omits one has no
 * row, and AL3 refuses it.
 */
export const variableMappingRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value: source } = v(mappingSources, "source");
  const { value: target } = v(mappingTargets, "target");
  const { parent: ref } = v(Node, "node");

  return r
    .match(mappingSources, { package: pkg, path, start, value: source })
    .match(mappingTargets, { package: pkg, path, start, value: target })
    .match(Node, { kind: mappingKind, package: pkg, parent: ref, path, start })
    .find({ package: pkg, path, ref, source, start, target });
});

/**
 * {@link variableMappingRows} as a relation of `Qti`.
 */
export const VariableMapping = derived("VariableMapping", variableMappingRows);

/**
 * Each variable mapping of an item ref that names an item, with the item's document, `item`
 * (`ItemRefDocument`). A mapping under an item ref that names an LTI link names no item, and is
 * accepted unchecked (spec reading `mapping-and-default-names`).
 */
const itemMappingRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, ref, source, start, target } = v(variableMappingRows, "mapping");
  const { target: item } = v(ItemRefDocument, "item");

  return r
    .match(variableMappingRows, { package: pkg, path, ref, source, start, target })
    .match(ItemRefDocument, { package: pkg, path, start: ref, target: item })
    .find({ item, package: pkg, path, ref, source, start, target });
});

/**
 * {@link itemMappingRows} as a relation of `Qti`.
 */
const ItemMapping = derived("ItemMapping", itemMappingRows);

/**
 * The outcome declarations' names, by the declaration's place, with its identifier.
 */
const outcomeNames = select(NamedDeclaration, (d) =>
  d.eq(d.declarationKind, "qti-outcome-declaration"),
);

/**
 * The template declarations' names, by the declaration's place, with its identifier.
 */
const templateNames = select(NamedDeclaration, (d) =>
  d.eq(d.declarationKind, "qti-template-declaration"),
);

/**
 * The item mappings whose target names no other variable of their item (spec reading
 * `variable-mapping-target`): its target is its own source, or the item declares nothing of the
 * target's name.
 */
const freeMappingTargetRows = query(QtiViews)
  .rule((r) => {
    const { item, package: pkg, path, source, start } = v(itemMappingRows, "mapping");

    return r
      .match(itemMappingRows, { item, package: pkg, path, source, start, target: source })
      .find({ package: pkg, path, start });
  })
  .rule((r) => {
    const { item, package: pkg, path, start, target } = v(itemMappingRows, "mapping");

    return r
      .match(itemMappingRows, { item, package: pkg, path, start, target })
      .where(r.not(NamedDeclaration, { identifier: target, package: pkg, path: item }))
      .find({ package: pkg, path, start });
  });

/**
 * {@link freeMappingTargetRows} as a relation of `Qti`.
 */
const FreeMappingTarget = derived("FreeMappingTarget", freeMappingTargetRows);

/**
 * Each template default's `template-identifier`, by its place.
 */
const templateDefaultTargets = attributeValues("template-identifier", [templateDefaultKind]);

/**
 * Each template default, by its place, with its item ref, `ref`, and the template variable it
 * names, `template` (§5.152.1: "The identifier of the template variable affected").
 */
const templateDefaultRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value: template } = v(templateDefaultTargets, "default");
  const { parent: ref } = v(Node, "node");

  return r
    .match(templateDefaultTargets, { package: pkg, path, start, value: template })
    .match(Node, { kind: templateDefaultKind, package: pkg, parent: ref, path, start })
    .find({ package: pkg, path, ref, start, template });
});

/**
 * Each template default whose item ref's href names a path of the package, an item's or an LTI
 * link's: an LTI link is no QTI item and has no template variable to override (spec reading
 * `mapping-and-default-names`), so it names none, which "Template default target" refuses; an item
 * ref whose href lies outside the package names an item the package does not hold, which no law
 * reads (SV-LAW-02).
 */
const PackagedTemplateDefault = derived(
  "PackagedTemplateDefault",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, ref, start, template } = v(templateDefaultRows, "default");
    const { target } = v(ItemRefHref, "href");

    return r
      .match(templateDefaultRows, { package: pkg, path, ref, start, template })
      .match(ItemRefHref, { package: pkg, path, start: ref, target })
      .find({ package: pkg, path, ref, start });
  }),
);

/**
 * Each template default whose item ref names an item, with the item's document, `item`.
 */
const itemTemplateDefaultRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, ref, start, template } = v(templateDefaultRows, "default");
  const { target: item } = v(ItemRefDocument, "item");

  return r
    .match(templateDefaultRows, { package: pkg, path, ref, start, template })
    .match(ItemRefDocument, { package: pkg, path, start: ref, target: item })
    .find({ item, package: pkg, path, ref, start, template });
});

/**
 * {@link itemTemplateDefaultRows} as a relation of `Qti`.
 */
const ItemTemplateDefault = derived("ItemTemplateDefault", itemTemplateDefaultRows);

/**
 * Each named item ref of a test or a bank that names an item, by its place, with its identifier
 * and its item's document, `item`: what "Item ref identifier" holds to the item's own identifier.
 */
const namedItemRefRows = query(QtiBase).rule((r) => {
  const { identifier, package: pkg, path, start } = v(structureNodeRows, "ref");
  const { target: item } = v(ItemRefDocument, "item");

  return r
    .match(structureNodeRows, { identifier, kind: itemRefKind, package: pkg, path, start })
    .match(ItemRefDocument, { package: pkg, path, start, target: item })
    .find({ identifier, item, package: pkg, path, start });
});

/**
 * {@link namedItemRefRows} as a relation of `Qti`.
 */
export const NamedItemRef = derived("NamedItemRef", namedItemRefRows);

/**
 * The documents that hold something a delivery of one test document cannot deliver as that one
 * document's item refs in order, by the document: a section ref or an include a section holds,
 * which place structure from another document (§7.5, §2.12); a selection with replacement, whose
 * draws repeat an item ref (§5.129.2); an adaptive selection, whose sequence a CAT engine draws
 * (§4.2.13); and an item ref that names no item document of the package, an LTI link or an href
 * outside the package (§5.6.5). Each is valid QTI, stored as written (conformance §4.4 lets a
 * system leave valid material it does not deliver unaltered).
 */
const undeliverable = query(QtiBase)
  .rule((r) => {
    const { package: pkg, path } = v(Node, "assembling");

    return r.match(Node, { kind: sectionRefKind, package: pkg, path }).find({ package: pkg, path });
  })
  .rule((r) => {
    const { package: pkg, path } = v(Node, "assembling");

    return r
      .match(Node, { kind: includeKind, package: pkg, parentKind: sectionKind, path })
      .find({ package: pkg, path });
  })
  .rule((r) => {
    const { package: pkg, path } = v(Node, "adaptive");

    return r
      .match(Node, { kind: adaptiveSelectionKind, package: pkg, path })
      .find({ package: pkg, path });
  })
  .rule((r) => {
    const { package: pkg, path } = v(sectionReplacementRows, "replacement");

    return r.match(sectionReplacementRows, { package: pkg, path }).find({ package: pkg, path });
  })
  .rule((r) => {
    const { package: pkg, path, start } = v(Node, "ref");

    return r
      .match(Node, { kind: itemRefKind, package: pkg, path, start })
      .where(r.not(ItemRefDocument, { package: pkg, path, start }))
      .find({ package: pkg, path });
  });

/**
 * The tests a delivery of their one document delivers exactly as written, by the test's document:
 * every member is an item ref of the test document that names an item document of the package
 * ({@link TestMember}), in document order, each once, since no section of it selects with
 * replacement or adaptively; and no section ref or section include places structure from another
 * document. A test that is not deliverable is still valid QTI and stored: this is a reading of what
 * a one-document delivery serves, never a law (owner, 2026-11-20, J1).
 */
export const DeliverableTest = derived(
  "DeliverableTest",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, test } = v(testRootRows, "test");

    return r
      .match(testRootRows, { package: pkg, path, start, test })
      .where(r.not(undeliverable, { package: pkg, path }))
      .find({ package: pkg, path, start, test });
  }),
);

/**
 * The `xpointer` of each `xi:include` that writes one, by the include's place.
 */
const xpointers = attributeValues("xpointer", [includeKind]);

/**
 * The `parse` of each `xi:include` that writes one, by the include's place, its value the
 * attribute's `xs:token` collapsed.
 */
const parses = attributeValues("parse", [includeKind]);

/**
 * The includes pantry does not read, by the include's place: each that writes an `xpointer`, which
 * names a part of its resource by an XPointer pantry does not evaluate, or a `parse` of `text`,
 * which includes its resource "as the character information items" (XInclude 1.0 Second Edition,
 * §3.1), whose bytes pantry does not hold. Both are valid QTI: the information model's Include is
 * "the use of the XInclude feature" (§9.4.1), and XInclude and its XSD admit both (`XInclude.xsd`
 * lines 22 to 24). Valid content a system does not support is ignored, never refused (QTI 3.0
 * Conformance §3: "the applications must be able to ignore or remove the unsupported data"), so
 * such an include is stored as written, no site, and never included (spec reading
 * `inclusion-cycles`).
 */
const unreadIncludes = query(QtiBase)
  .rule((r) => {
    const { package: pkg, path, start } = v(xpointers, "xpointer");

    return r.match(xpointers, { package: pkg, path, start }).find({ package: pkg, path, start });
  })
  .rule((r) => {
    const { package: pkg, path, start } = v(parses, "parse");

    return r
      .match(parses, { package: pkg, path, start, value: "text" })
      .find({ package: pkg, path, start });
  });

/**
 * The includes pantry reads, each a site ({@link Site}), by the include's place: every `xi:include`
 * under a parent whose content model holds an explicit include particle (spec reading
 * `include-as-information-model`) but one pantry does not read ({@link unreadIncludes}). "Test
 * overlay" holds the two to one another, so an include is a site exactly when pantry reads it; a
 * section ref is a site of its own (§7.5).
 */
const ReadInclude = derived(
  "ReadInclude",
  query(QtiBase).rule((r) => {
    const { package: pkg, parentKind, path, start } = v(Node, "include");

    return r
      .match(Node, { kind: includeKind, package: pkg, parentKind, path, start })
      .where(r.in(parentKind, includeParentKinds))
      .where(r.not(unreadIncludes, { package: pkg, path, start }))
      .find({ package: pkg, path, start });
  }),
);

/**
 * The sites that are includes, by the include's place: "Test overlay" holds each to
 * {@link ReadInclude}.
 */
const includeSites = select(Site, (s) => s.eq(s.kind, includeKind));

/**
 * The includes that hold an `xi:fallback`, by the include's place: an `xi:fallback` node whose
 * parent is the include ("The xi:fallback element can appear only as a child of an xi:include
 * element", XInclude 1.0 Second Edition §3.2).
 */
const fallbackIncludes = query(QtiBase).rule((r) => {
  const { package: pkg, parent, path } = v(Node, "fallback");

  return r
    .match(Node, { kind: fallbackKind, package: pkg, parent, path })
    .find({ package: pkg, path, start: parent });
});

/**
 * The hrefs of the includes whose path an entry holds and that hold no `xi:fallback`, by the
 * include's place: "Include target" holds each to its {@link SiteTarget}, a document of the package
 * (spec reading `include-target`). An include that holds a fallback and names an entry that is no
 * document meets a resource error, "Resources that are unavailable for any reason (for example the
 * resource doesn't exist ... the resource is determined through implementation-specific mechanisms
 * not to be XML ...) result in a resource error", and "When a resource error is encountered, the
 * xi:include element is replaced with the contents of the xi:fallback element" (XInclude 1.0 Second
 * Edition, §4.2 and §3.2): valid, so admitted, unplaced ({@link UnplacedInclude}).
 */
const PlacedIncludePath = derived(
  "PlacedIncludePath",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start } = v(SitePath, "href");

    return r
      .match(SitePath, { entry: true, kind: includeKind, package: pkg, path, start })
      .where(r.not(fallbackIncludes, { package: pkg, path, start }))
      .find({ package: pkg, path, start });
  }),
);

/**
 * Each include of a valid package that places its target nowhere the database judged, by the
 * include's place, with its {@link UnplacedCause}: admitted and stored, never refused (QTI 3.0
 * Conformance §3: an application "must be able to ignore or remove the unsupported data"; §2.2:
 * an importer tells valid from invalid), and an item whose assembly holds one is no item a player
 * delivers (the Delivery verdict's to read):
 *
 * - `external`: an include whose href resolves outside the package, stored as written and never
 *   fetched (spec reading `include-target`), so neither its content nor the IDs it may hold are
 *   read;
 * - `fallback`: an include holding an `xi:fallback` whose href names an entry that is no document
 *   ({@link PlacedIncludePath}), which XInclude replaces by the fallback's content;
 * - `root`: an include whose target's root is a kind the composition splits by context, under a
 *   parent that admits only the split kind (`Inclusion.places` false, spec reading
 *   `fragment-root`);
 * - `context`: a site placing its target under another nearest interaction than the one the target's
 *   rows were judged under, its document's context (spec reading `fragment-placement`): one written
 *   element is one row, judged in one context.
 */
export const UnplacedInclude = derived(
  "UnplacedInclude",
  query(QtiBase)
    .rule((r) => {
      const { package: pkg, path, start } = v(Site, "site");

      return r
        .match(Site, { external: true, kind: includeKind, package: pkg, path, start })
        .find({ cause: UnplacedCause.handle("external"), package: pkg, path, start });
    })
    .rule((r) => {
      const { package: pkg, path, start } = v(SitePath, "href");

      return r
        .match(SitePath, { entry: true, kind: includeKind, package: pkg, path, start })
        .match(fallbackIncludes, { package: pkg, path, start })
        .where(r.not(SiteTarget, { package: pkg, path, start }))
        .find({ cause: UnplacedCause.handle("fallback"), package: pkg, path, start });
    })
    .rule((r) => {
      const { package: pkg, path, start } = v(Inclusion, "inclusion");

      return r
        .match(Inclusion, { package: pkg, path, places: false, start })
        .find({ cause: UnplacedCause.handle("root"), package: pkg, path, start });
    })
    .rule((r) => {
      const {
        nearest,
        nearestKind,
        package: pkg,
        path,
        start,
        targetNearest,
        targetNearestKind,
        targetNearestPath,
      } = v(SiteTarget, "target");

      return (
        r
          .match(SiteTarget, {
            nearest,
            nearestKind,
            package: pkg,
            path,
            start,
            targetNearest,
            targetNearestKind,
            targetNearestPath,
          })
          // Neither both outside every interaction nor both in one interaction: the site stands
          // under another nearest interaction than its target's rows are judged under.
          .where(
            r.and(
              r.or(r.ne(nearestKind, "document"), r.ne(targetNearestKind, "document")),
              r.or(
                r.ne(path, targetNearestPath),
                r.ne(nearest, targetNearest),
                r.ne(nearestKind, targetNearestKind),
              ),
            ),
          )
          .find({ cause: UnplacedCause.handle("context"), package: pkg, path, start })
      );
    }),
);

/**
 * The `parse` of each include that writes an `xpointer`, by the include's place: "Include parse"
 * holds it to `xml`, since "The xpointer attribute must not be present when parse="text""
 * (XInclude 1.0 Second Edition, §3.1).
 */
const PointerParse = derived(
  "PointerParse",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value, valueDigest } = v(parses, "parse");

    return r
      .match(parses, { package: pkg, path, start, value, valueDigest })
      .match(xpointers, { package: pkg, path, start })
      .find({ package: pkg, path, start, value, valueDigest });
  }),
);

/**
 * The test and bank overlays' rules over their node, each named by its law:
 *
 * - **"E1 derived":** a name is a test part's, a section's or an item ref's;
 * - **"Include parse":** an include that writes an `xpointer` is parsed as XML
 *   ({@link PointerParse});
 * - **"Test overlay":** each identifier of a test's or a bank's part, section or item ref has its
 *   name ({@link StructureNaming}), and each name's and each stimulus ref's identifier is its
 *   attribute's value ({@link TestIdentifier}); and the includes that are sites are exactly the
 *   includes pantry reads ({@link ReadInclude});
 * - **"Selection bound"** (§5.129.1, reading `selection-without-replacement`) and **"Selection
 *   required"** (§4.2.2, §5.6.2);
 * - **"Branch target"** and **"Branch forward"** (§5.23, §5.98, reading `branch-rule-targets`): each
 *   branch rule that names no exit names an element it may jump to, after its source;
 * - **"Section identifier target"** (§7.27.1, §7.28.1, §7.39.1): a `section-identifier` names a
 *   section of its document's test;
 * - **"Weighted base"** (§7.39.5, reading `weighted-test-variables`): a weighted test variables
 *   writes no `base-type` but float;
 * - **"Weight key"** (§7.50.1, reading `identifier-names-one-variable`'s reasoning): no two weights
 *   of one item ref share an identifier;
 * - **"Variable mapping source"** and **"Variable mapping target"** (§7.48, readings
 *   `variable-mapping-target` and `mapping-and-default-names`);
 * - **"Template default target"** (§5.152.1, readings `template-default` and
 *   `mapping-and-default-names`): a template default's item ref names an item, and its
 *   `template-identifier` a template declaration of that item.
 */
export const testOverlayLawsByName = {
  "Branch forward": declared("Branch forward", [
    contained(
      on(ResolvedBranchRule, "package", "assembly", "instance", "start"),
      on(ForwardBranchRule, "package", "assembly", "instance", "start"),
    ),
  ]),
  "Branch target": declared("Branch target", [
    contained(
      on(BranchResolution, "package", "assembly", "instance", "start"),
      on(ResolvedBranchRule, "package", "assembly", "instance", "start"),
    ),
  ]),
  "E1 derived": declared("E1 derived", [
    check("E1_derived", StructureNode, (n) => n.in(n.kind, namedKinds)),
  ]),
  "Include parse": declared("Include parse", [
    check("Include_parse", PointerParse, (p) => p.ne(p.value, "text")),
  ]),
  "Include target": declared("Include target", [
    contained(
      on(PlacedIncludePath, "package", "path", "start"),
      on(SiteTarget, "package", "path", "start"),
    ),
  ]),
  "Key text bound": declared("Key text bound", [
    check("Key_text_bound", TestIdentifierBytes, (t) => t.le(t.bytes, identifierBytes)),
  ]),
  "Section identifier target": declared("Section identifier target", [
    contained(
      on(PlacedFilter, "package", "assembly", "path", "start"),
      on(FilteredSection, "package", "assembly", "path", "start"),
    ),
    key(on(FilteredSection, "package", "assembly", "path", "start")),
  ]),
  "Selection bound": declared("Selection bound", [
    contained(
      on(SelectionWithoutReplacement, "package", "path", "section"),
      on(BoundedSelection, "package", "path", "section"),
    ),
  ]),
  "Selection required": declared("Selection required", [
    contained(
      on(RequiredParts, "package", "path", "section"),
      on(RequirementMet, "package", "path", "section"),
    ),
  ]),
  "Template default target": declared("Template default target", [
    contained(
      on(PackagedTemplateDefault, "package", "path", "ref"),
      on(ItemRefDocument, "package", "path", "start"),
    ),
    contained(
      on(ItemTemplateDefault, "package", "item", "template"),
      on(templateNames, "package", "path", "identifier"),
    ),
  ]),
  "Test name key": declared("Test name key", [
    key(on(AnchoredName, "package", "assembly", "anchor", "identifier")),
    key(on(AssembledName, "package", "assembly", "identifier")),
  ]),
  "Test overlay": declared("Test overlay", [
    contained(on(ReadInclude, "package", "path", "start"), on(Site, "package", "path", "start")),
    contained(
      on(includeSites, "package", "path", "start"),
      on(ReadInclude, "package", "path", "start"),
    ),
    contained(
      on(StructureNaming, "package", "path", "start"),
      on(Named, "package", "path", "start"),
    ),
    contained(
      on(Named, "package", "path", "start", "identifier"),
      on(TestIdentifier, "package", "path", "start", "value"),
    ),
    contained(
      on(StimulusRef, "package", "path", "start", "identifier"),
      on(TestIdentifier, "package", "path", "start", "value"),
    ),
  ]),
  "Variable mapping source": declared("Variable mapping source", [
    contained(
      on(ItemMapping, "package", "item", "source"),
      on(outcomeNames, "package", "path", "identifier"),
    ),
  ]),
  "Variable mapping target": declared("Variable mapping target", [
    check("Variable_mapping_target", VariableMapping, (m) =>
      m.not(m.in(m.target, itemSessionVariables)),
    ),
    contained(
      on(ItemMapping, "package", "path", "start"),
      on(FreeMappingTarget, "package", "path", "start"),
    ),
  ]),
  "Weighted base": declared("Weighted base", [
    check("Weighted_base", WeightedBaseType, (w) => w.eq(w.value, "float")),
  ]),
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const testOverlayRelations = [
  TestIdentifierBytes,
  DeliverableTest,
  AnchoredName,
  AssembledName,
  BranchResolution,
  FilteredSection,
  PlacedFilter,
  BoundedSelection,
  ForwardBranchRule,
  FreeMappingTarget,
  ItemMapping,
  ItemRefCategory,
  ItemRefSection,
  ItemTemplateDefault,
  LateSubmission,
  MaxAttempts,
  MaxTime,
  MinTime,
  NamedItemRef,
  PackagedTemplateDefault,
  PlacedIncludePath,
  PointerParse,
  ReadInclude,
  RequiredParts,
  RequirementMet,
  ResolvedBranchRule,
  SectionReplacement,
  SectionSelection,
  SectionShuffle,
  SelectionWithoutReplacement,
  SessionControl,
  StructureNaming,
  StructureNode,
  TestIdentifier,
  TestMember,
  TestPart,
  TestRoot,
  UnplacedInclude,
  VariableMapping,
  WeightValue,
  WeightedBaseType,
] as const;

/**
 * The rules of this module, {@link testOverlayLawsByName} flattened.
 */
export const testOverlayLaws = Object.values(testOverlayLawsByName).flat();
