/**
 * The MathML cn laws (spec reading 2, MathML 3 validity): the law "MathML cn form", stated over
 * the `m:cn` elements of Content MathML.
 *
 * The content of a `cn` has the form its `type` implies (MathML 3 §4.2.1): the parts a `type`
 * lists, split at `m:sep`, each in the lexical space of its form, its digits read in the `cn`'s
 * `base`. `#pantry/grammar/install.ts` holds what the type implies, {@link CnParts} (how many
 * parts) and {@link CnForm} (the form of each), and what a form allows, {@link CnPattern} (by form
 * and base).
 *
 * - **{@link MathCn}**, one row per judged `m:cn`, keyed by its node's `(package, path, start)`: the
 *   `type` and `base` it is judged under, each with the lexical form of the attribute that gave it
 *   (empty where the `cn` writes none, so `real` and `10`), and `parts`, the count of its
 *   {@link CnPartText} rows. A `cn` whose `type` {@link CnType} does not list, or whose `base`
 *   {@link CnBase} does not list, has no row, so it is not judged: its content is text, or its
 *   digits are application specific.
 * - **{@link CnPartText}**, one row per part of a judged `cn`, keyed by its node and `part` (named
 *   apart from the roster {@link CnPart} of the places a part takes, which `install.ts` holds): the
 *   `type` and `base` of its `cn`, the part's collapsed `text` (MathML 3 §2.1.7) and its `form`. A
 *   part that holds an element or an entity reference is not judged, so a `cn` with one has no
 *   rows.
 * - **`CnCount`**, the database's view of every `m:cn` whose `type` {@link CnType} lists, whatever
 *   its `base` and whatever its parts hold (`#pantry/qti/overlay-queries/expression.ts`): its
 *   `type`, read from the attribute where it stands, and `parts`, the count of its parts, which no
 *   row copies (C18).
 *
 * `MathML_cn_form` is the law's check over {@link CnPartText}: the text lies in the lexical space
 * of its form in its base. Every other statement is a restatement of the tree, "E1 derived"; the
 * check is named by its law, as `#pantry/qti/expressions.ts` names `Literal_lexical`. A `cn`'s
 * lexical forms are held to its attributes by their SHA-256s, and its `type` to `CnCount`'s.
 *
 * The count of parts is the family: the rows of a `cn` are counted by `MathCn.parts`, which
 * {@link CnParts} fixes for the type, and each row's `(type, part, form)` is in {@link CnForm},
 * whose `part` takes only the slots 0 to its count less one, so the rows of a `cn` are exactly its
 * type's slots, each once (the rows' key), and one part of a `rational` is refused. A part beyond
 * the type's places is written at the place no type lists and refused, so three parts of a
 * `rational` are refused as one is. The same count is made again over `CnCount`, for the `cn`s the
 * digits cannot judge: one whose `base` {@link CnBase} does not list, and one with a part that
 * holds an element or an entity reference. The oracle counts the parts of every `cn` whose `type`
 * lists a form, so a `cn` of `base="40"` with three parts of a `rational` is refused, as it is
 * with a base in range.
 *
 * {@link MathCn} is not widened to every base, because {@link CnPartText}`.base` is a
 * {@link CnBase} handle that {@link CnPattern}`.at("pattern", form, base)` reads, and grizzle's
 * `C.at` reads NULL at a key the closed relation holds no row for, which its reader refuses (the
 * engine's `scalar/compute/lower.ts`, `closedAt`). A handle for "beyond 2 to 36" would need a
 * {@link CnPattern} row for `integer` and `real` at that base, and any pattern in that row would be
 * one the specification does not state.
 *
 * @see {@link https://www.w3.org/TR/MathML3/chapter4.html#contm.cn | MathML 3 §4.2.1, Numbers}
 */
import {
  check,
  closedId,
  contained,
  counted,
  Crypto,
  drawn,
  fin,
  generated,
  law,
  on,
  relation,
  select,
  sha256,
  Text,
} from "@bjornpagen/grizzle";
import {
  CnBase,
  CnBaseSpelling,
  CnForm,
  CnPart,
  CnPartForm,
  CnParts,
  CnPattern,
  CnType,
  CnTypeLexical,
  anyText,
  natural,
} from "#pantry/grammar/install.ts";
import { EntryPath, PackageName } from "#pantry/qti/limits.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import { Node } from "#pantry/qti/node.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * One judged `m:cn`, keyed by its node's `(package, path, start)`.
 *
 * - **the host's:** the node, proved by containment to be an `m:cn`; `type` and `base`, the handles
 *   the `cn` is judged under, and `typeLexical` and `baseLexical`, the lexical forms of the
 *   attributes that gave them, each empty where the `cn` writes none; proved by containment, by
 *   their SHA-256s (`typeLexicalDigest`, `baseLexicalDigest`), and by `E1_derived`;
 * - **drawn:** `parts`, the count of its {@link CnPartText} rows.
 */
export const MathCn = law(
  entryOf("E1 derived"),
  relation.generated(
    "MathCn",
    {
      base: closedId(CnBase),
      baseLexical: anyText,
      package: PackageName,
      parts: drawn(natural),
      path: EntryPath,
      start: natural,
      type: closedId(CnType),
      typeLexical: anyText,
    },
    ["package", "path", "start"],
    (c) => ({
      baseLexicalDigest: law(
        entryOf("E1 derived"),
        generated(sha256, Crypto.sha256(c.baseLexical)),
      ),
      typeLexicalDigest: law(
        entryOf("E1 derived"),
        generated(sha256, Crypto.sha256(c.typeLexical)),
      ),
    }),
  ),
);

/**
 * One part of a judged `m:cn`'s content, keyed by its node and its place among the parts `m:sep`
 * separates: the `type` and `base` of its `cn`, the part's collapsed `text` and the `form` of its
 * place. A part beyond its type's places sits at the place no type lists, so it is refused.
 */
export const CnPartText = law(
  entryOf("E1 derived"),
  relation(
    "CnPartText",
    {
      base: closedId(CnBase),
      form: closedId(CnPartForm),
      package: PackageName,
      part: closedId(CnPart),
      path: EntryPath,
      start: natural,
      text: anyText,
      type: closedId(CnType),
    },
    ["package", "path", "start", "part"],
  ),
);

/**
 * The relations the cn laws declare, in one list, as `#pantry/qti/schema.ts` composes them.
 */
export const cnRelations = [CnPartText, MathCn] as const;

/**
 * The `m:cn` nodes, each of which may hold a {@link MathCn} row.
 */
const cnNodes = select(Node, (n) => n.eq(n.kind, "m:cn"));

/**
 * The `type` or the `base` attributes of an `m:cn`.
 *
 * @param name - The attribute's name.
 * @returns The selection.
 */
const cnAttributes = (name: "base" | "type") =>
  select(Attribute, (a) => a.and(a.eq(a.kind, "m:cn"), a.eq(a.name, name)));

/**
 * The {@link MathCn} rows of a `cn` that writes a `type`.
 */
const typedCns = select(MathCn, (c) => c.ne(c.typeLexical, ""));

/**
 * The {@link MathCn} rows of a `cn` that writes a `base`.
 */
const basedCns = select(MathCn, (c) => c.ne(c.baseLexical, ""));

/**
 * The family of a `cn`'s parts, counted by `MathCn.parts`.
 */
const partFamily = counted(on(CnPartText, "package", "path", "start"), fin(MathCn, "parts"));

/**
 * The containments that judge a judged `cn`'s part count: its `(type, parts)` in {@link CnParts},
 * and each part's `(type, part, form)` in {@link CnForm}. A `cn` of the wrong part count is a `cn`
 * of the wrong form, "MathML cn form" as the oracle names it, so `mathmlLawsByName`
 * (`#pantry/qti/mathml.ts`) names them so and the rest of the module "E1 derived". Every `cn` whose
 * `type` lists a form is counted again over `CnCount`, whatever its base and whatever its parts
 * hold (`#pantry/qti/overlay-queries/expression.ts`).
 */
export const cnCountLaws = {
  judgedForm: contained(on(CnPartText, "type", "part", "form"), on(CnForm, "type", "part", "form")),
  judgedParts: contained(on(MathCn, "type", "parts"), on(CnParts, "type", "parts")),
};

/**
 * The statements over {@link MathCn} and {@link CnPartText}, each `check` named by its law:
 *
 * - **the cn:** each row's node an `m:cn`; where it writes a `type` or a `base`, the lexical form is
 *   that of the node's attribute, held by their SHA-256s, and the handle is the one the form
 *   spells, as {@link CnTypeLexical} and {@link CnBaseSpelling} hold (`real` and `10` where none is
 *   written, `E1_derived`); its `parts` the count {@link CnParts} gives its type;
 * - **the parts:** the family, counted by `MathCn.parts`; each row's `type` and `base` those of its
 *   `cn`, and its `(type, part, form)` a row of {@link CnForm}, so a place beyond the type's parts
 *   is refused;
 * - **`MathML_cn_form`:** each part's text matches the pattern of its form in its base.
 *
 * Its `type` is `CnCount`'s, the view's, a rule over a query
 * (`#pantry/qti/overlay-queries/expression.ts`).
 */
export const cnLaws = [
  contained(on(MathCn, "package", "path", "start"), on(cnNodes, "package", "path", "start")),
  contained(
    on(typedCns, "package", "path", "start", "typeLexicalDigest"),
    on(cnAttributes("type"), "package", "path", "start", "lexicalDigest"),
  ),
  contained(
    on(basedCns, "package", "path", "start", "baseLexicalDigest"),
    on(cnAttributes("base"), "package", "path", "start", "lexicalDigest"),
  ),
  cnCountLaws.judgedParts,
  check("E1_derived", MathCn, (c) =>
    c.and(
      c.or(
        c.and(c.eq(c.typeLexical, ""), c.eq(c.type, "real")),
        c.eq(Text.collapse(c.typeLexical), CnTypeLexical.at("lexical", c.type)),
      ),
      c.or(
        c.and(c.eq(c.baseLexical, ""), c.eq(c.base, "10")),
        Text.matches(c.baseLexical, CnBaseSpelling.at("pattern", c.base)),
      ),
    ),
  ),

  partFamily,
  contained(
    on(CnPartText, "package", "path", "start", "type", "base"),
    on(MathCn, "package", "path", "start", "type", "base"),
  ),
  cnCountLaws.judgedForm,
  check("MathML_cn_form", CnPartText, (p) =>
    Text.matches(p.text, CnPattern.at("pattern", p.form, p.base)),
  ),
];
