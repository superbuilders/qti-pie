/* oxlint-disable unicorn/text-encoding-identifier-case -- The documents spell their charset `UTF-8` as crust's reader reports it and `Document` stores it. */
/**
 * The identity builder's free tests: over every document of four small shapes, `rowsOf` gives each
 * overlay one row per element it describes, as the document's own construction says, and each
 * projection each value once; and over a manifest and an item, the rows R26 reads, over which the
 * database's rule over a query (`DescribedLang ⊆ ListedLang`, `#pantry/qti/queries.ts`)
 * holds exactly when the specification does.
 *
 * The documents are built by construction, never filtered: each case's model records what it wrote
 * (every `xml:lang`, ID and `label`, every identity-typed text, every LOM language and its
 * category, the resource that names the item), and the oracle is that model read as keyed sets, so
 * no expected row is computed by the builder's own code.
 */
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, boolean, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Option, Predicate } from "effect";
import { AnonymousType, GoverningOf } from "#pantry/grammar/install.ts";
import { idValuesOf, rowsOf } from "#pantry/import/overlays/identity.ts";
import { governorOf, ownViewOf } from "#pantry/import/fold.ts";
import type { IdentityIds, IdentityRows } from "#pantry/import/overlays/identity.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { closedName } from "#pantry/model/xdm.ts";
import type {
  NodeRow,
  XdmAttribute,
  XdmChild,
  XdmClosedElement,
  XdmDocument,
} from "#pantry/model/xdm.ts";
import { ssmlReads } from "#pantry/vocab/terms/identity.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { evaluatorFor, manifestAttribute, withGenerated } from "#pantry/test/host-judge.ts";
import { searchWidth, searchTimeout } from "#pantry/test/settings.ts";
import { textDigestOf } from "#pantry/import/key-text.ts";

/**
 * Collapse a text as XML Schema's whiteSpace `collapse` does: each run of tabs, line feeds,
 * carriage returns and spaces one space, and none at either end (XML Schema Part 2, §4.3.6).
 *
 * @param text - The text.
 * @returns The collapsed text.
 */
const collapsed = (text: string): string =>
  text
    .replaceAll(/[\t\n\r ]+/gu, " ")
    .replace(/^ /u, "")
    .replace(/ $/u, "");

/**
 * Read a language tag without regard to case (RFC 5646 §2.1.1): its ASCII capitals as small
 * letters, a tag's subtags being ASCII (§2.1).
 *
 * @param tag - The tag.
 * @returns The folded tag.
 */
const folded = (tag: string): string => tag.replaceAll(/[A-Z]/gu, (c) => c.toLowerCase());

/**
 * The kinds the cases' elements are of.
 */
type CaseKind =
  | "cp:manifest"
  | "cp:metadata.resource"
  | "cp:resource"
  | "cp:resources"
  | "cpx:variant"
  | "div"
  | "lom:educational"
  | "lom:general"
  | "lom:language"
  | "lom:lom"
  | "m:share"
  | "qti-assessment-item"
  | "qti-assessment-stimulus"
  | "qti-card"
  | "qti-card-entry"
  | "qti-catalog"
  | "qti-catalog-info"
  | "qti-description"
  | "ssml:lexicon"
  | "ssml:lookup"
  | "ssml:mark"
  | "ssml:speak";

/**
 * Read the type a kind's element is governed by under its own declaration: none for a kind whose
 * type is anonymous (`AnonymousType`), as every MathML kind's is, else `GoverningOf`'s row whose
 * governor is the kind itself.
 *
 * @param kind - The kind.
 * @returns Its declared type's `TypeName` handle, if it names one.
 */
const declaredType = (kind: CaseKind): Option.Option<string> =>
  AnonymousType.rows.some((row) => row.kind === kind)
    ? Option.none()
    : Option.some(
        GoverningOf.rows.find((row) => row.kind === kind && row.governor === kind)?.governs ??
          assert.fail(`GoverningOf holds ${kind} under its own governor`),
      );

/**
 * Write a closed attribute.
 *
 * @param handle - Its name.
 * @param lexical - Its lexical form.
 * @returns The attribute.
 */
const attribute = (
  handle:
    | "endmark"
    | "href"
    | "id"
    | "identifier"
    | "label"
    | "name"
    | "ref"
    | "src"
    | "startmark"
    | "type"
    | "xml:id"
    | "xml:lang",
  lexical: string,
): XdmAttribute<Composed> => ({
  lexical,
  name: closedName(handle),
  references: [],
});

/**
 * Write an element of a kind under its declared type, or under the type an `xsi:type` names.
 *
 * @param kind - Its kind.
 * @param attributes - Its attributes, in source order.
 * @param children - Its children, in order.
 * @param governs - Its governing type; by default its declared type.
 * @returns The element.
 */
const elementOf = (
  kind: CaseKind,
  attributes: readonly XdmAttribute<Composed>[],
  children: readonly XdmChild<Composed>[],
  governs: Option.Option<string> = declaredType(kind),
): XdmClosedElement<Composed> => ({
  _tag: "element",
  attributes,
  children,
  governs,
  kind,
  namespaces: [],
  prefix: "",
});

/**
 * Write a document around its root element.
 *
 * @param root - The root.
 * @returns The document, with no declaration, doctype, prolog or epilog.
 */
const documentOf = (root: XdmClosedElement<Composed>): XdmDocument<Composed> => ({
  _tag: "document",
  charset: "UTF-8",
  declaration: Option.none(),
  epilog: [],
  exportCharset: "UTF-8",
  prolog: [],
  root,
});

/**
 * Where every content case's document stands, its nodes numbered in document order by `start`: in
 * a package that holds no document at any path a resource names, the document an item.
 */
const ids = {
  assembled: false,
  package: "M",
  path: "item.xml",
} as const satisfies IdentityIds;

/**
 * Write the text a row's place and position read as: its document's `package` and `path`, then
 * its position.
 *
 * @param row - The row's document and position.
 * @param row.package - Its package.
 * @param row.path - Its document's path.
 * @param start - The position.
 * @returns The text.
 */
const placed = (row: { readonly package: string; readonly path: string }, start: bigint): string =>
  `${row.package} ${row.path} ${String(start)}`;

/**
 * The document node's position, node 0 of every case.
 */
const documentNode = 0n;

/**
 * Read each `xml:lang`'s element beside the scope its `CatalogScope` row names, as the database's
 * `LangValue` joins the attribute to its element's row (`#pantry/qti/names.ts`): no row copies the
 * form or counts its carriers.
 *
 * @param attributes - The document's attribute rows.
 * @param scopes - The document's `CatalogScope` rows.
 * @returns Each carrier's position and scope, in attribute order.
 */
const langScopesOf = (
  attributes: readonly { readonly name: string; readonly start: bigint }[],
  scopes: IdentityRows["CatalogScope"],
): readonly { readonly scope: bigint; readonly start: bigint }[] =>
  attributes.flatMap(({ name, start }) =>
    name === "xml:lang"
      ? [...scopes.values()]
          .filter((row) => row.start === start)
          .map(({ scope }) => ({ scope, start }))
      : [],
  );

/**
 * An ID as a case writes it: its lexical form, and the whitespace before and after its value.
 */
interface WrittenId {
  readonly after: string;
  readonly before: string;
  readonly lexical: string;
  readonly value: string;
}

/**
 * The IDs a content element may carry: a bare one, and the same value padded, which XML Schema's
 * collapse makes one value.
 */
const writtenIds: readonly WrittenId[] = [
  { after: "", before: "", lexical: "a", value: "a" },
  { after: " ", before: " ", lexical: " a ", value: "a" },
];

/**
 * One content element as a case draws it: its `xml:lang`, its ID and whether it carries `label`.
 */
interface ContentChoice {
  readonly id: Option.Option<WrittenId>;
  readonly label: boolean;
  readonly lang: Option.Option<string>;
}

/**
 * A content case: its root's kind, `xml:lang` and label, and its `div` children's choices.
 */
interface ContentCase {
  readonly children: readonly ContentChoice[];
  readonly rootKind: "qti-assessment-item" | "qti-assessment-stimulus";
  readonly rootLabel: boolean;
  readonly rootLang: Option.Option<string>;
}

/**
 * A content element's attributes as its choice writes them.
 *
 * @param choice - The choice.
 * @returns Its attributes.
 */
const attributesOf = (choice: ContentChoice): readonly XdmAttribute<Composed>[] => [
  ...Option.toArray(choice.lang).map((lang) => attribute("xml:lang", lang)),
  ...Option.toArray(choice.id).map(({ lexical }) => attribute("id", lexical)),
  ...(choice.label ? [attribute("label", "x")] : []),
];

/**
 * Every content case: an item or a stimulus whose root carries no `xml:lang`, `en` or ` en`, and a
 * label or none, holding at most 2 `div`s, each with no `xml:lang`, `en` or `fr`, no ID or one of
 * {@link writtenIds}, and a label or none.
 */
const contentCases: Gen<ContentCase> = (source) => ({
  children: source.draw(
    array<ContentChoice>(
      (inner) => ({
        id: inner.draw(element([Option.none(), ...writtenIds.map((held) => Option.some(held))])),
        label: inner.draw(element([false, true])),
        lang: inner.draw(element([Option.none(), Option.some("en"), Option.some("fr")])),
      }),
      { max: 2, min: 0 },
    ),
  ),
  rootKind: source.draw(element(["qti-assessment-item", "qti-assessment-stimulus"] as const)),
  rootLabel: source.draw(element([false, true])),
  rootLang: source.draw(element([Option.none(), Option.some("en"), Option.some(" en")])),
});

/**
 * A situation the content box must reach.
 */
type ContentSituation =
  | "repeated xml:lang"
  | "padded id"
  | "one id value twice"
  | "labelled item content"
  | "labelled stimulus root"
  | "labelled item root";

/**
 * Write a sorted list of a keyed set's members, failing on a repeat.
 *
 * @param members - The members as text.
 * @returns Them, sorted.
 */
const asSet = (members: readonly string[]): readonly string[] => {
  assert.strictEqual(new Set(members).size, members.length, `a repeat among ${members.join(", ")}`);

  return members.toSorted();
};

describe(
  "import/overlays/identity.ts, a content document's rows",
  { timeout: searchTimeout },
  () => {
    it.effect(
      "gives each xml:lang form once per document, one CatalogScope, DocumentId and LabelUse row per element that carries one, a stimulus root's own label none, and each ID beside its value",
      (ctx) =>
        // Oracle: the case's own model read as keyed sets: the forms it wrote, each once
        // (sets ruling 2), and the elements it wrote each on, numbered in document order (the root
        // node 1, its k-th div node k + 2); a label every div's (a BaseSequence, §5.16.5) and an
        // item root's (QTI 3.0.1 §4.1.3 asks the item's own label for tools, the stimulus's §4.3.3
        // does not; reading 128).
        // Bound: every item or stimulus over the root's and at most 2 divs' choices above, 4,116.
        searched(
          ctx,
          exhaust(
            {
              box: "every item or stimulus whose root and at most 2 divs each carry a choice of xml:lang, ID and label",
              caseHang: Duration.seconds(10),
              concurrency: searchWidth,
              coverage: requiredInSpace<ContentSituation>([
                "repeated xml:lang",
                "padded id",
                "one id value twice",
                "labelled item content",
                "labelled stimulus root",
                "labelled item root",
              ]),
              generator: contentCases,
              literal: (drawn) => JSON.stringify(drawn),
              oracle: { kind: "specification", name: "the case's model, read as keyed sets" },
              suite: "import/identity-content-rows",
            },
            (drawn: ContentCase, c) =>
              Effect.sync(() => {
                const root = elementOf(
                  drawn.rootKind,
                  attributesOf({ id: Option.none(), label: drawn.rootLabel, lang: drawn.rootLang }),
                  drawn.children.map((choice) => elementOf("div", attributesOf(choice), [])),
                );
                const view = ownViewOf(documentOf(root));
                const rows = rowsOf(view, ids);
                const idValues = idValuesOf(view, rows.DocumentId.values());
                // Each form is its element's `xml:lang`, where it stands: no row copies it.
                const formAt = new Map(
                  view.rows.attributes.flatMap(({ lexical, name, start }) =>
                    name === "xml:lang" ? [[start, lexical] as const] : [],
                  ),
                );
                const elements = [
                  {
                    choice: { id: Option.none(), label: drawn.rootLabel, lang: drawn.rootLang },
                    node: 1n,
                    root: true,
                  },
                  ...drawn.children.map((choice, at) => ({
                    choice,
                    node: BigInt(at + 2),
                    root: false,
                  })),
                ];
                const langs = elements.flatMap(({ choice }) => Option.toArray(choice.lang));
                const values = elements.flatMap(({ choice }) =>
                  Option.toArray(choice.id).map(({ value }) => value),
                );
                const labelled = elements.filter(
                  ({ choice, root: isRoot }) =>
                    choice.label && (!isRoot || drawn.rootKind === "qti-assessment-item"),
                );

                if (new Set(langs).size < langs.length) {
                  c.note("repeated xml:lang");
                }

                if (
                  elements.some(({ choice }) =>
                    Option.exists(choice.id, ({ before }) => before !== ""),
                  )
                ) {
                  c.note("padded id");
                }

                if (new Set(values).size < values.length) {
                  c.note("one id value twice");
                }

                if (drawn.rootKind === "qti-assessment-item" && labelled.length > 0) {
                  c.note("labelled item content");
                }

                if (drawn.rootKind === "qti-assessment-stimulus" && drawn.rootLabel) {
                  c.note("labelled stimulus root");
                }

                if (drawn.rootKind === "qti-assessment-item" && drawn.rootLabel) {
                  c.note("labelled item root");
                }

                const place = ids;
                assert.deepStrictEqual(
                  // The forms R26 reads, each once: the carriers whose scope is the document node.
                  asSet([
                    ...new Set(
                      langScopesOf(view.rows.attributes, rows.CatalogScope)
                        .filter(({ scope }) => scope === documentNode)
                        .map(({ start }) => `${placed(place, 0n)} ${formAt.get(start)}`),
                    ),
                  ]),
                  [...new Set(langs.map((lang) => `${placed(place, 0n)} ${lang}`))].toSorted(),
                );
                assert.deepStrictEqual(
                  asSet(
                    langScopesOf(view.rows.attributes, rows.CatalogScope).map(
                      ({ scope, start }) =>
                        `${placed(place, start)} ${formAt.get(start)} ${String(scope)}`,
                    ),
                  ),
                  elements
                    .flatMap(({ choice, node }) =>
                      Option.toArray(choice.lang).map(
                        (lang) => `${placed(place, node)} ${lang} ${String(documentNode)}`,
                      ),
                    )
                    .toSorted(),
                );
                assert.deepStrictEqual(
                  asSet(
                    // Each ID's value is the database's `IdValue`'s, the host's twin of it.
                    idValues.map((row) =>
                      JSON.stringify([placed(row, row.start), row.id, String(row.owner)]),
                    ),
                  ),
                  elements
                    .flatMap(({ choice, node }) =>
                      Option.toArray(choice.id).map(({ value }) =>
                        JSON.stringify([placed(place, node), value, String(node)]),
                      ),
                    )
                    .toSorted(),
                );
                assert.deepStrictEqual(
                  asSet(
                    // The ID/IDREF table is the database's projection of the IDs, (owner, value).
                    [...new Set(idValues.map((row) => `${placed(row, row.owner)} ${row.id}`))],
                  ),
                  elements
                    .flatMap(({ choice, node }) =>
                      Option.toArray(choice.id).map(
                        ({ value }) => `${placed(place, node)} ${value}`,
                      ),
                    )
                    .toSorted(),
                );
                assert.strictEqual(rows.IdentityText.size, 0);
                assert.deepStrictEqual(
                  asSet(
                    [...rows.LabelUse.values()].map(
                      (row) => `${placed(row, row.start)} ${row.rootKind}`,
                    ),
                  ),
                  labelled.map(({ node }) => `${placed(place, node)} ${drawn.rootKind}`).toSorted(),
                );
              }),
          ),
        ),
    );
  },
);

/**
 * The governing types a `qti-description` takes in the identity-text box: its declared
 * `xs:normalizedString`, of no identity, and three an `xsi:type` names, two of them IDs.
 */
const textTypes = ["xs:normalizedString", "xs:ID", "UniqueIdentifierDType", "xs:IDREF"] as const;

/**
 * A governing type of {@link textTypes}.
 */
type TextType = (typeof textTypes)[number];

/**
 * A text an identity-typed element holds, with its pieces as the case's model writes them: the
 * ID's split around its value, with whether that value is an NCName, which its TextDomain asks
 * (spec readings 152 and 156), and the IDREF tokens with the whitespace around each.
 */
interface WrittenText {
  readonly id: {
    readonly after: string;
    readonly before: string;
    readonly names: boolean;
    readonly value: string;
  };
  readonly idrefs: readonly {
    readonly after: string;
    readonly before: string;
    readonly token: string;
  }[];
  readonly text: string;
}

/**
 * The texts of the identity-text box: one bare token, and two tokens padded, which as an ID's text
 * is no NCName, which its TextDomain refuses, and as an IDREF's splits.
 */
const writtenTexts: readonly [WrittenText, ...WrittenText[]] = [
  {
    id: { after: "", before: "", names: true, value: "a" },
    idrefs: [{ after: "", before: "", token: "a" }],
    text: "a",
  },
  {
    id: { after: " ", before: " ", names: false, value: "a b" },
    idrefs: [
      { after: "", before: " ", token: "a" },
      { after: " ", before: " ", token: "b" },
    ],
    text: " a b ",
  },
];

/**
 * One `qti-description` as the identity-text box draws it: its governing type and its text.
 */
interface TextChoice {
  readonly text: WrittenText;
  readonly type: TextType;
}

/**
 * Every identity-text case: an item holding 1 or 2 `div`s, each holding at most 2
 * `qti-description`s, each of a type of {@link textTypes} and a text of {@link writtenTexts}.
 */
const textCases: Gen<readonly (readonly TextChoice[])[]> = array(
  array<TextChoice>(
    (inner) => ({
      text: inner.draw(element(writtenTexts)),
      type: inner.draw(element(textTypes)),
    }),
    { max: 2, min: 0 },
  ),
  { max: 2, min: 1 },
);

/**
 * A situation the identity-text box must reach.
 */
type TextSituation =
  | "an ID text that is no NCName"
  | "one id twice under one parent"
  | "one id under two parents"
  | "tokens split"
  | "untyped text";

describe(
  "import/overlays/identity.ts, an item's identity-typed texts (C50)",
  { timeout: searchTimeout },
  () => {
    it.effect(
      "gives each ID- or IDREF-typed text its IdentityText row with its parent and tokens, each ID text its DocumentId bound to its parent, and each (id, parent) one binding",
      (ctx) =>
        // Oracle: the case's own model read as keyed sets: each description's type and text, its
        // node and its div's numbered in document order (the root node 1, each div, then each of
        // its descriptions and that description's text node), XML Schema 1.0 Part 1 §3.15.5's
        // [binding], the parent of an element whose text is an ID (reading 101), and spec readings
        // 152 and 156: every ID-typed text has its DocumentId, whatever its form, since its
        // TextDomain refuses one that is no NCName once collapsed where it is written.
        // Bound: every item of 1 or 2 divs of at most 2 descriptions over 4 types and 2 texts,
        // 5,402.
        searched(
          ctx,
          exhaust(
            {
              box: "every item of 1 or 2 divs, each of at most 2 qti-descriptions of 4 governing types and 2 texts",
              caseHang: Duration.seconds(10),
              concurrency: searchWidth,
              coverage: requiredInSpace<TextSituation>([
                "an ID text that is no NCName",
                "one id twice under one parent",
                "one id under two parents",
                "tokens split",
                "untyped text",
              ]),
              generator: textCases,
              literal: (drawn) => JSON.stringify(drawn),
              oracle: {
                kind: "specification",
                name: "the case's model, read as keyed sets; XML Schema 1.0 Part 1 §3.15.5 [binding]",
              },
              suite: "import/identity-text-rows",
            },
            (drawn, c) =>
              Effect.sync(() => {
                const root = elementOf(
                  "qti-assessment-item",
                  [],
                  drawn.map((choices) =>
                    elementOf(
                      "div",
                      [],
                      choices.map(({ text, type }) =>
                        elementOf(
                          "qti-description",
                          [],
                          [{ _tag: "text", value: text.text }],
                          Option.some(type),
                        ),
                      ),
                    ),
                  ),
                );
                const view = ownViewOf(documentOf(root));
                const rows = rowsOf(view, ids);
                const idValues = idValuesOf(view, rows.DocumentId.values());
                const descriptions: {
                  readonly choice: TextChoice;
                  readonly node: bigint;
                  readonly owner: bigint;
                }[] = [];
                let next = 2;
                for (const choices of drawn) {
                  const owner = BigInt(next);
                  next += 1;
                  for (const choice of choices) {
                    descriptions.push({ choice, node: BigInt(next), owner });
                    next += 2;
                  }
                }

                const typed = descriptions.filter(
                  ({ choice }) => choice.type !== "xs:normalizedString",
                );
                const idTexts = typed.filter(({ choice }) => choice.type !== "xs:IDREF");
                const bindings = idTexts.map(
                  ({ choice, owner }) => `${placed(ids, owner)} ${choice.text.id.value}`,
                );
                const values = idTexts.map(({ choice }) => choice.text.id.value);

                if (new Set(bindings).size < bindings.length) {
                  c.note("one id twice under one parent");
                }

                if (new Set(values).size < new Set(bindings).size) {
                  c.note("one id under two parents");
                }

                if (
                  typed.some(
                    ({ choice }) => choice.type === "xs:IDREF" && choice.text.idrefs.length > 1,
                  )
                ) {
                  c.note("tokens split");
                }

                if (descriptions.some(({ choice }) => choice.type === "xs:normalizedString")) {
                  c.note("untyped text");
                }

                if (
                  typed.some(({ choice }) => choice.type !== "xs:IDREF" && !choice.text.id.names)
                ) {
                  c.note("an ID text that is no NCName");
                }

                assert.deepStrictEqual(
                  asSet(
                    [...rows.IdentityText.values()].map((row) =>
                      JSON.stringify([
                        placed(row, row.start),
                        row.tokens.map(({ after, before, token }) => [before, token, after]),
                      ]),
                    ),
                  ),
                  typed
                    .map(({ choice, node }) =>
                      JSON.stringify([
                        placed(ids, node),
                        choice.type === "xs:IDREF"
                          ? choice.text.idrefs.map(({ after, before, token }) => [
                              before,
                              token,
                              after,
                            ])
                          : [],
                      ]),
                    )
                    .toSorted(),
                );
                assert.deepStrictEqual(
                  asSet(
                    // Each ID's value is the database's `IdValue`'s, the host's twin of it.
                    idValues.map((row) =>
                      JSON.stringify([placed(row, row.start), row.id, String(row.owner)]),
                    ),
                  ),
                  idTexts
                    .map(({ choice, node, owner }) =>
                      JSON.stringify([placed(ids, node), choice.text.id.value, String(owner)]),
                    )
                    .toSorted(),
                );
                assert.deepStrictEqual(
                  asSet(
                    // The ID/IDREF table is the database's projection of the IDs, (owner, value).
                    [...new Set(idValues.map((row) => `${placed(row, row.owner)} ${row.id}`))],
                  ),
                  [...new Set(bindings)].toSorted(),
                );
              }),
          ),
        ),
    );
  },
);

/**
 * The path of the item document of the R26 box, the one path its package holds a document at.
 */
const itemPath = "item.xml";

/**
 * One case of the R26 box: the one resource's type and `href`, its record's general categories'
 * languages, and the item's `xml:lang` on its root and on its one `div`.
 */
interface LangCase {
  readonly divLang: Option.Option<string>;
  readonly generals: readonly (readonly string[])[];
  readonly href: Option.Option<string>;
  readonly rootLang: Option.Option<string>;
  readonly type: "imsqti_item_xmlv3p0" | "imsqti_stimulus_xmlv3p0";
}

/**
 * Every R26 case: an item or a stimulus resource with no `href`, the item's or a path the package
 * holds no document at, whose record has at most 2 general categories, each listing at most 2
 * languages over `en` and `fr`; and an item whose root states no `xml:lang`, `en`, ` FR` (`fr`
 * collapsed and in another case) or the empty one, and whose `div` states none, `en` or `fr`.
 */
const langCases: Gen<LangCase> = (source) => ({
  divLang: source.draw(element([Option.none(), Option.some("en"), Option.some("fr")])),
  generals: source.draw(
    array(array(element(["en", "fr"]), { max: 2, min: 0 }), { max: 2, min: 0 }),
  ),
  href: source.draw(element([Option.none(), Option.some(itemPath), Option.some("missing.xml")])),
  rootLang: source.draw(
    element([Option.none(), Option.some("en"), Option.some(" FR"), Option.some("")]),
  ),
  type: source.draw(element(["imsqti_item_xmlv3p0", "imsqti_stimulus_xmlv3p0"] as const)),
});

/**
 * Decide whether a category's languages list the language an `xml:lang` form states: its value,
 * collapsed, among them, each read as a tag without regard to case (RFC 5646 §2.1.1).
 *
 * @param langs - The category's languages, as written.
 * @param form - The form, as written.
 * @returns Whether the category lists it.
 */
const lists = (langs: readonly string[], form: string): boolean =>
  langs.map(folded).includes(folded(collapsed(form)));

/**
 * Read an `xml:lang` form's compared value as the database derives it (`LangValue` of
 * `#pantry/qti/names.ts`): its attribute's `value` under its element's governor, case-folded, at
 * the value grizzle's evaluator gives it (`#pantry/test/host-judge.ts` `withGenerated`) over an
 * `xml:lang` row of the form, so the box compares each form by the database's own derivation, and
 * holds that derivation to this file's reading of a tag's value ({@link collapsed},
 * {@link folded}). A form states a language where that value is not empty.
 *
 * @param evaluate - The schema's row evaluator, compiled before the search.
 * @param carrier - The form's element.
 * @param lexical - The form, as written.
 * @returns The compared value.
 */
const comparedOf = (
  evaluate: ReturnType<typeof evaluatorFor>,
  carrier: NodeRow<Composed>,
  lexical: string,
): string => {
  const { value } = withGenerated(evaluate, Qti.relations.Attribute, {
    ...manifestAttribute,
    governor: governorOf(carrier.kind, carrier.governs),
    lexical,
    name: "xml:lang",
  });

  return Predicate.isString(value) ? folded(value) : assert.fail(`no value of ${lexical}`);
};

/**
 * A situation the R26 box must reach: each way the law holds or breaks.
 */
type LangSituation =
  | "every category lists it"
  | "a category lacks it"
  | "no general category"
  | "no naming resource"
  | "href to no document"
  | "empty xml:lang";

describe("import/overlays/identity.ts, R26's rows", { timeout: searchTimeout }, () => {
  it.effect(
    "gives the item's forms and each category's languages, over which each stated form's value, as the schema derives it, is listed by every category of a naming record exactly when R26 holds",
    (ctx) => {
      // The row evaluator, compiled once before the first case: its compile, about 9 s of CPU, is
      // the search's setup, which no case's hang guard times.
      const evaluate = evaluatorFor(Qti);

      // Oracle: the specification as a checker, QTI 3.0 Metadata §2.7.1.3 ("There must be one
      // value for each of the languages referred to by the language attributes on the associated
      // assessmentItem, test or object bank and its 'bodyElements'") over the case's model, read
      // as keyed sets: an xml:lang by its value, collapsed, the empty one stating none (XML 1.0
      // §2.12), a LOM language as written, the two compared as tags without regard to case (RFC
      // 5646 §2.1.1); the manifest's nodes numbered in document order (the manifest 1, its
      // resources 2, the resource 3, its metadata 4, the record 5, then each category and, after
      // it, each language and its text node).
      // Bound: every item or stimulus resource of 3 hrefs, at most 2 categories of at most 2
      // languages over en and fr, and 12 placings of the item's xml:lang, 4,104.
      return searched(
        ctx,
        exhaust(
          {
            box: "every item or stimulus resource, href none, the item's or a missing path, at most 2 general categories of at most 2 languages over en and fr, and the item's root and div xml:lang",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<LangSituation>([
              "every category lists it",
              "a category lacks it",
              "no general category",
              "no naming resource",
              "href to no document",
              "empty xml:lang",
            ]),
            generator: langCases,
            literal: (drawn) => JSON.stringify(drawn),
            oracle: {
              kind: "specification",
              name: "QTI 3.0 Metadata §2.7.1.3 over the case's model, read as keyed sets",
            },
            suite: "import/identity-r26-rows",
          },
          (drawn, c) =>
            Effect.sync(() => {
              const item = elementOf(
                "qti-assessment-item",
                Option.toArray(drawn.rootLang).map((lang) => attribute("xml:lang", lang)),
                [
                  elementOf(
                    "div",
                    Option.toArray(drawn.divLang).map((lang) => attribute("xml:lang", lang)),
                    [],
                  ),
                ],
              );
              const itemView = ownViewOf(documentOf(item));
              const itemRows = rowsOf(itemView, {
                assembled: false,
                package: ids.package,
                path: itemPath,
              });

              const generals: { readonly langs: readonly string[]; readonly node: bigint }[] = [];
              let next = 6;
              for (const langs of drawn.generals) {
                generals.push({ langs, node: BigInt(next) });
                next += 1 + 2 * langs.length;
              }

              // A record names the item only where its resource is an item's and its href names
              // the item, the one document the package lists: an href to no document names none.
              const names =
                drawn.type === "imsqti_item_xmlv3p0" &&
                Option.exists(drawn.href, (href) => href === itemPath);
              const forms = [
                ...new Set([...Option.toArray(drawn.rootLang), ...Option.toArray(drawn.divLang)]),
              ];
              const stated = forms.filter((form) => collapsed(form) !== "");
              const naming = names ? generals : [];
              const holds = stated.every((form) => naming.every(({ langs }) => lists(langs, form)));

              if (stated.length > 0 && naming.length > 0) {
                c.note(holds ? "every category lists it" : "a category lacks it");
              }

              if (drawn.generals.length === 0) {
                c.note("no general category");
              }

              if (!names) {
                c.note("no naming resource");
              }

              if (Option.exists(drawn.href, (href) => href !== itemPath)) {
                c.note("href to no document");
              }

              if (forms.includes("")) {
                c.note("empty xml:lang");
              }

              // The rows R26 reads of the item: its forms, each once, each its element's `xml:lang`
              // where it stands, which no row copies. Each category's languages are no row's: the
              // database reads them from the manifest's tree (`ListedLang`,
              // `#pantry/qti/queries.ts`), each its string value case-folded.
              const elementAt = new Map(
                itemView.rows.nodes.map((node) => [node.start, node] as const),
              );
              const placedAt = new Set(
                langScopesOf(itemView.rows.attributes, itemRows.CatalogScope)
                  .filter(({ scope }) => scope === documentNode)
                  .map(({ start }) => start),
              );
              const bodyForms = itemView.rows.attributes.flatMap(({ lexical, name, start }) => {
                const carrier = elementAt.get(start);

                return name === "xml:lang" && placedAt.has(start) && carrier !== undefined
                  ? [{ carrier, lang: lexical }]
                  : [];
              });
              assert.deepStrictEqual(
                asSet([...new Set(bodyForms.map(({ lang }) => lang))]),
                forms.toSorted(),
              );

              // Each form's compared value, as the database derives it, is its value collapsed
              // and case-folded.
              const values = new Map(
                bodyForms.map(({ carrier, lang }) => [lang, comparedOf(evaluate, carrier, lang)]),
              );
              for (const [lang, value] of values) {
                assert.strictEqual(value, folded(collapsed(lang)), `the value of ${lang}`);
              }

              // The law as the database states it, over those rows: each form that states a
              // language, its compared value not empty (`LangValue`), by that value, under each
              // category of a record that names the item, is one of that category's languages.
              const listed = new Set(
                generals.flatMap(({ langs, node }) =>
                  langs.map((lang) => JSON.stringify([String(node), folded(lang)])),
                ),
              );
              const described = bodyForms
                .filter(({ lang }) => values.get(lang) !== "")
                .flatMap(({ lang }) =>
                  naming.map(({ node }) => JSON.stringify([String(node), values.get(lang)])),
                );
              assert.strictEqual(
                described.every((pair) => listed.has(pair)),
                holds,
                JSON.stringify(drawn),
              );
            }),
        ),
      );
    },
  );
});

/**
 * One `speak` of the SSML box: its `startmark` as written or none, the `mark`s it holds, each
 * named `m`, and its `lookup` of `L`, beside a `lexicon` of that `xml:id` or not, or none.
 */
interface SpeakChoice {
  readonly lookup: "none" | "resolved" | "unresolved";
  readonly marks: number;
  readonly startmark: Option.Option<string>;
}

/**
 * One SSML case: a mark outside every `speak` or not, then 1 or 2 `speak`s.
 */
interface SsmlCase {
  readonly outside: boolean;
  readonly speaks: readonly SpeakChoice[];
}

/**
 * Every SSML case: an item whose `div` holds a mark of its own or not, then 1 or 2 `speak`s, each
 * of no `startmark`, `m n` or ` m\t n ` (the same token collapsed), at most 2 marks named `m n`,
 * and no lookup, one beside its lexicon or one without.
 */
const ssmlCases: Gen<SsmlCase> = (source) => ({
  outside: source.draw(boolean),
  speaks: source.draw(
    array<SpeakChoice>(
      (inner) => ({
        lookup: inner.draw(element(["none", "resolved", "unresolved"] as const)),
        marks: inner.draw(element([0, 1, 2])),
        startmark: inner.draw(element([Option.none(), Option.some("m n"), Option.some(" m\t n ")])),
      }),
      { max: 2, min: 1 },
    ),
  ),
});

/**
 * A situation the SSML box must reach.
 */
type SsmlSituation =
  | "a mark defined once"
  | "a mark defined twice"
  | "a mark defined in another speak only"
  | "a lookup resolved"
  | "a lookup unresolved"
  | "a mark outside every speak";

describe("import/overlays/identity.ts, SSML's rows (reading 3)", { timeout: searchTimeout }, () => {
  it.effect(
    "places each read SSML attribute in its nearest speak by its element's scope, each element on the way its scope, so a trim's count is 1 exactly when its speak defines its mark once",
    (ctx) =>
      // Oracle: the specification as a checker, SSML 1.1 §3.1.1.1 and §3.1.5 over spec reading 3
      // ("the document" is each speak fragment) and the case's model, read as keyed sets: the
      // nodes numbered in document order (the root 1, its div 2, the outside mark 3 where drawn,
      // then each speak and, after it, its lexicon, its marks and its lookup), each name by its
      // value, collapsed (an xs:token's whiteSpace, SSML 1.1 §3.3.2).
      // Bound: an outside mark or none and 1 or 2 speaks of 3 trims, at most 2 marks and 3
      // lookups, 1,512.
      searched(
        ctx,
        exhaust(
          {
            box: "every item of an outside mark or none and 1 or 2 speaks, each of 3 startmarks, at most 2 marks named m n and 3 lookups",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<SsmlSituation>([
              "a mark defined once",
              "a mark defined twice",
              "a mark defined in another speak only",
              "a lookup resolved",
              "a lookup unresolved",
              "a mark outside every speak",
            ]),
            generator: ssmlCases,
            literal: (drawn) => JSON.stringify(drawn),
            oracle: { kind: "specification", name: "SSML 1.1 §3.1.1.1 and §3.1.5, reading 3" },
            suite: "import/identity-ssml-rows",
          },
          (drawn: SsmlCase, c) =>
            Effect.sync(() => {
              const speaks = drawn.speaks.map((choice) =>
                elementOf(
                  "ssml:speak",
                  Option.toArray(choice.startmark).map((mark) => attribute("startmark", mark)),
                  [
                    ...(choice.lookup === "resolved"
                      ? [elementOf("ssml:lexicon", [attribute("xml:id", "L")], [])]
                      : []),
                    ...Array.from({ length: choice.marks }, () =>
                      elementOf("ssml:mark", [attribute("name", "m n")], []),
                    ),
                    ...(choice.lookup === "none"
                      ? []
                      : [elementOf("ssml:lookup", [attribute("ref", "L")], [])]),
                  ],
                ),
              );
              const root = elementOf(
                "qti-assessment-item",
                [],
                [
                  elementOf(
                    "div",
                    [],
                    [
                      ...(drawn.outside
                        ? [elementOf("ssml:mark", [attribute("name", "m n")], [])]
                        : []),
                      ...speaks,
                    ],
                  ),
                ],
              );
              const view = ownViewOf(documentOf(root));
              const rows = rowsOf(view, ids);

              const expectedAttributes: string[] = [];
              const expectedScopes: string[] = [];
              const outsideMark = 3n;
              if (drawn.outside) {
                expectedAttributes.push(
                  `${placed(ids, outsideMark)} name ssml:mark m n ${documentNode}`,
                );
                expectedScopes.push(
                  `${placed(ids, outsideMark)} ${documentNode}`,
                  `${placed(ids, 2n)} ${documentNode}`,
                  `${placed(ids, 1n)} ${documentNode}`,
                );
              }

              let next = drawn.outside ? 4 : 3;
              const trims: { readonly marks: number; readonly speak: bigint }[] = [];
              for (const choice of drawn.speaks) {
                const speak = BigInt(next);
                next += 1;
                for (const mark of Option.toArray(choice.startmark)) {
                  expectedAttributes.push(
                    `${placed(ids, speak)} startmark ssml:speak ${collapsed(mark)} ${speak}`,
                  );
                  expectedScopes.push(`${placed(ids, speak)} ${speak}`);
                  trims.push({ marks: choice.marks, speak });
                }

                const at = (offset: number) => placed(ids, BigInt(offset));
                if (choice.lookup === "resolved") {
                  expectedAttributes.push(`${at(next)} xml:id ssml:lexicon L ${speak}`);
                  expectedScopes.push(`${at(next)} ${speak}`, `${placed(ids, speak)} ${speak}`);
                  next += 1;
                }

                for (let mark = 0; mark < choice.marks; mark += 1) {
                  expectedAttributes.push(`${at(next)} name ssml:mark m n ${speak}`);
                  expectedScopes.push(`${at(next)} ${speak}`, `${placed(ids, speak)} ${speak}`);
                  next += 1;
                }

                if (choice.lookup !== "none") {
                  expectedAttributes.push(`${at(next)} ref ssml:lookup L ${speak}`);
                  expectedScopes.push(`${at(next)} ${speak}`, `${placed(ids, speak)} ${speak}`);
                  next += 1;
                }
              }

              for (const { marks } of trims) {
                c.note(marks === 1 ? "a mark defined once" : "a mark defined twice");
              }

              if (
                trims.some(({ marks }) => marks === 0) &&
                drawn.speaks.some(({ marks }) => marks > 0)
              ) {
                c.note("a mark defined in another speak only");
              }

              for (const { lookup } of drawn.speaks) {
                if (lookup !== "none") {
                  c.note(lookup === "resolved" ? "a lookup resolved" : "a lookup unresolved");
                }
              }

              if (drawn.outside) {
                c.note("a mark outside every speak");
              }

              // The values as the database reads them (`SsmlValue` of `#pantry/qti/names.ts`): each read
              // attribute where it stands, its value collapsed, in its element's scope's fragment.
              const fragments = new Map(
                [...rows.SsmlScope.values()].map(
                  ({ fragment, start }) => [start, fragment] as const,
                ),
              );
              const kinds = new Map(
                view.rows.nodes.map(({ kind, start }) => [start, kind] as const),
              );
              const values = view.rows.attributes.flatMap(({ lexical, name, start }) => {
                const kind = kinds.get(start);
                const read = ssmlReads.some(
                  ([readName, readKinds]: readonly [string, readonly string[]]) =>
                    readName === name && kind !== undefined && readKinds.includes(kind),
                );

                return read && kind !== undefined
                  ? [{ fragment: fragments.get(start), kind, lexical, name, start }]
                  : [];
              });
              assert.deepStrictEqual(
                asSet(
                  values.map(
                    (row) =>
                      `${placed(ids, row.start)} ${row.name} ${row.kind} ${collapsed(row.lexical)} ${String(row.fragment)}`,
                  ),
                ),
                expectedAttributes.toSorted(),
              );
              assert.deepStrictEqual(
                asSet(
                  [...rows.SsmlScope.values()].map(
                    (row) => `${placed(row, row.start)} ${row.fragment}`,
                  ),
                ),
                [...new Set(expectedScopes)].toSorted(),
              );

              // The trim law as the database states it: each trim's value carried once by a mark of
              // its own fragment, each value the lexical form collapsed, as the database derives it.
              const marks = values.filter(({ kind }) => kind === "ssml:mark");
              for (const trim of values.filter(({ kind }) => kind === "ssml:speak")) {
                assert.strictEqual(
                  marks.filter(
                    ({ fragment, lexical }) =>
                      fragment === trim.fragment && collapsed(lexical) === collapsed(trim.lexical),
                  ).length === 1,
                  trims.find(({ speak }) => speak === trim.start)?.marks === 1,
                  JSON.stringify(drawn),
                );
              }
            }),
        ),
      ),
  );
});

/**
 * An item whose catalog holds a card entry that writes `es`, beside a body `div` that writes
 * `en`. Document order numbers the nodes: the root 1, its `qti-catalog-info` 2, its catalog 3,
 * the card 4, the entry 5 and the `div` 6.
 */
const catalogued = () =>
  rowsOf(
    ownViewOf(
      documentOf(
        elementOf(
          "qti-assessment-item",
          [],
          [
            elementOf(
              "qti-catalog-info",
              [],
              [
                elementOf(
                  "qti-catalog",
                  [attribute("id", "C")],
                  [
                    elementOf(
                      "qti-card",
                      [],
                      [elementOf("qti-card-entry", [attribute("xml:lang", "es")], [])],
                    ),
                  ],
                ),
              ],
            ),
            elementOf("div", [attribute("xml:lang", "en")], []),
          ],
        ),
      ),
    ),
    ids,
  );

describe("import/overlays/identity.ts, a catalog's scope rows (R9-c)", () => {
  it("gives each element on the way from an xml:lang carrier to its scope root a CatalogScope, a catalog's reaching its qti-catalog-info and stopping there, a body's reaching the document", () => {
    // Oracle: the information model's catalog (§5.28: "outside the content body node") as a
    // checker, over the nodes numbered in document order; R9-c.
    const rows = catalogued();

    assert.deepStrictEqual(
      asSet([...rows.CatalogScope.values()].map((row) => `${placed(row, row.start)} ${row.scope}`)),
      [
        `${placed(ids, 5n)} 2`,
        `${placed(ids, 4n)} 2`,
        `${placed(ids, 3n)} 2`,
        `${placed(ids, 2n)} 2`,
        `${placed(ids, 6n)} ${documentNode}`,
        `${placed(ids, 1n)} ${documentNode}`,
      ].toSorted(),
    );
  });

  it("gives every xml:lang's element its CatalogScope row, the scope its element is read in", () => {
    // Oracle: the same model; the existence law from the attributes holds, so no carrier loses its
    // row. The entry (5) and the `div` (6) carry the case's two forms.
    const rows = catalogued();

    assert.deepStrictEqual(
      asSet(
        [...rows.CatalogScope.values()]
          .filter(({ start }) => start === 5n || start === 6n)
          .map((row) => `${placed(row, row.start)} ${row.scope}`),
      ),
      [`${placed(ids, 5n)} 2`, `${placed(ids, 6n)} ${documentNode}`].toSorted(),
    );
  });

  it("gives an item with no catalog the document as every scope", () => {
    const rows = rowsOf(
      ownViewOf(documentOf(elementOf("qti-assessment-item", [attribute("xml:lang", "en")], []))),
      ids,
    );

    assert.deepStrictEqual(
      [...rows.CatalogScope.values()].map((row) => `${placed(row, row.start)} ${row.scope}`),
      [`${placed(ids, 1n)} ${documentNode}`],
    );
  });
});

/**
 * Write the rows of an item whose body holds one `m:share` of each `src`.
 *
 * @param srcs - Each share's `src`.
 * @param assembled - Whether the document is in an assembly.
 * @returns The document's identity rows.
 */
const sharedRows = (srcs: readonly string[], assembled?: boolean) => {
  const shares = srcs.map((src) => elementOf("m:share", [attribute("src", src)], []));
  const root = elementOf("qti-assessment-item", [], shares);

  return rowsOf(ownViewOf(documentOf(root)), assembled === undefined ? ids : { ...ids, assembled });
};

describe("import/overlays/identity.ts, a share's same-document fragment (P7)", () => {
  // Oracle: MathML 3 §4.2.7, a `share`'s `src` of the form `#id` names an element of its own
  // document, read as the case's model: the shares written, and which of them name a fragment.
  it("gives a share whose src is # and a name one ShareFragment and its id one IdrefTarget", () => {
    const rows = sharedRows(["#a"]);

    assert.deepStrictEqual(
      [...rows.ShareFragment.values()],
      [
        {
          assembled: false,
          id: "a",
          idDigest: textDigestOf("a"),
          package: ids.package,
          path: ids.path,
          start: 2n,
        },
      ],
    );
    assert.deepStrictEqual(
      [...rows.IdrefTarget.values()].map(({ assembled, id }) => [assembled, id]),
      [[false, "a"]],
    );
  });

  it("gives a share the assembled of its document, none read as no", () => {
    for (const assembled of [true, false, undefined]) {
      const rows = sharedRows(["#a"], assembled);

      assert.deepStrictEqual(
        [...rows.ShareFragment.values()].map((row) => row.assembled),
        [assembled ?? false],
      );
      assert.deepStrictEqual(
        [...rows.IdrefTarget.values()].map((row) => row.assembled),
        [assembled ?? false],
      );
    }
  });

  it("reads a share's src by its value, the form collapsed as its xs:anyURI domain reads it", () => {
    // Oracle: XML Schema Part 2 §3.2.17, `xs:anyURI`'s whiteSpace `collapse` (§4.3.6): a padded
    // `#a` is the fragment `a`, as the database's `ShareSource` reads the attribute's `value`.
    for (const src of [" #a", "#a\t", "\n#a "]) {
      const rows = sharedRows([src]);

      assert.deepStrictEqual(
        [...rows.ShareFragment.values()].map(({ id }) => id),
        ["a"],
        JSON.stringify(src),
      );
    }
  });

  it("gives a share whose src names another document, or only a #, no row", () => {
    for (const src of ["other.xml#a", "#", " # ", "a", ""]) {
      const rows = sharedRows([src]);

      assert.strictEqual(rows.ShareFragment.size, 0, src);
      assert.strictEqual(rows.IdrefTarget.size, 0, src);
    }
  });

  it("gives two shares of one fragment two ShareFragments and one IdrefTarget", () => {
    const rows = sharedRows(["#a", "#a", "#b"]);

    assert.strictEqual(rows.ShareFragment.size, 3);
    assert.deepStrictEqual([...rows.IdrefTarget.values()].map(({ id }) => id).toSorted(), [
      "a",
      "b",
    ]);
  });
});

describe("import/overlays/identity.ts, an unadmitted element's ID (R2)", () => {
  it("keeps an unadmitted cpx:variant's DocumentId, and does not admit it", () => {
    // Oracle: R2 and the variant class: the QTI 3.0.1 profile gives cpx:variant under cp:resource
    // a maxOccurs of 0 (`imsqtiv3p0p1_imscpv1p2_v1p0.xsd` line 344), and ChildGrammar's key set is
    // admission. The law oracle drops an unadmitted node with its attributes, so its ID binds
    // nothing, and "N5 admitted" alone refuses R-O4's two variants of one identifier.
    // Bound: R-O4's manifest, two resources each holding a variant "v1".
    const resource = elementOf(
      "cp:resource",
      [],
      [elementOf("cpx:variant", [attribute("identifier", "v1")], [])],
    );
    const manifest = elementOf(
      "cp:manifest",
      [],
      [elementOf("cp:resources", [], [resource, resource])],
    );
    const view = ownViewOf(documentOf(manifest));
    const rows = rowsOf(view, ids);

    assert.deepStrictEqual(
      idValuesOf(view, rows.DocumentId.values()).map(({ admitted, id, start }) => [
        start,
        id,
        admitted,
      ]),
      [
        [4n, "v1", false],
        [6n, "v1", false],
      ],
    );
  });
});
