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
 * - **{@link CnCount}**, one row per `m:cn` whose `type` {@link CnType} lists, whatever its `base`
 *   and whatever its parts hold, keyed by its node: the `type` with its lexical form, and `parts`,
 *   the count of its {@link CnSlot} rows.
 * - **{@link CnSlot}**, one row per part of such a `cn`, judged or not, keyed by its node and `part`:
 *   the `type` of its `cn` and the `form` of its place. The slots carry the count, never the
 *   digits.
 *
 * `MathML_cn_form` is the law's check over {@link CnPartText}: the text lies in the lexical space
 * of its form in its base. Every other statement is a restatement of the tree, "E1 derived"; the
 * check is named by its law, as `#pantry/qti/expressions.ts` names `Literal_lexical`.
 *
 * The count of parts is the family: the rows of a `cn` are counted by `MathCn.parts`, which
 * {@link CnParts} fixes for the type, and each row's `(type, part, form)` is in {@link CnForm},
 * whose `part` takes only the slots 0 to its count less one, so the rows of a `cn` are exactly its
 * type's slots, each once (the rows' key), and one part of a `rational` is refused. A part beyond
 * the type's places is written at the place no type lists and refused, so three parts of a
 * `rational` are refused as one is. The same count is made again over {@link CnCount} and
 * {@link CnSlot}, for the `cn`s the digits cannot judge: one whose `base` {@link CnBase} does not
 * list, and one with a part that holds an element or an entity reference. The oracle counts the
 * parts of every `cn` whose `type` lists a form, so a `cn` of `base="40"` with three parts of a
 * `rational` is refused, as it is with a base in range.
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
  drawn,
  fin,
  law,
  on,
  relation,
  select,
  Text,
} from "@bjornpagen/grizzle";
import {
  anyText,
  AttributeName,
  CnBase,
  CnBaseSpelling,
  CnForm,
  CnPart,
  CnPartForm,
  CnParts,
  CnPattern,
  CnType,
  CnTypeSpelling,
} from "#pantry/grammar/install.ts";
import { CopiedLexical, EntryPath, PackageName } from "#pantry/qti/limits.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import { Node } from "#pantry/qti/node.ts";
import { entryOf, natural } from "#pantry/qti/law-entries.ts";

/**
 * One judged `m:cn`, keyed by its node's `(package, path, start)`.
 *
 * - **the host's:** the node, proved by containment to be an `m:cn`; `type` and `base`, the handles
 *   the `cn` is judged under, and `typeLexical` and `baseLexical`, the lexical forms of the
 *   attributes that gave them, each empty where the `cn` writes none; proved by containment and by
 *   `E1_derived`;
 * - **drawn:** `parts`, the count of its {@link CnPartText} rows.
 */
export const MathCn = law(
  entryOf("E1 derived"),
  relation(
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
 * One `m:cn` whose `type` {@link CnType} lists (`real` where it writes none), keyed by its node,
 * whatever its `base` and whatever its parts hold: the `type` and its lexical form as written
 * (empty where unwritten, as on {@link MathCn}), and `parts`, the count of its {@link CnSlot} rows.
 * It carries the part count of a `cn` that {@link MathCn} does not judge.
 */
export const CnCount = law(
  entryOf("E1 derived"),
  relation(
    "CnCount",
    {
      package: PackageName,
      parts: drawn(natural),
      path: EntryPath,
      start: natural,
      type: closedId(CnType),
      typeLexical: anyText,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One part of an `m:cn` that has a {@link CnCount} row, keyed by its node and its place among the
 * parts `m:sep` separates, judged or not: the `type` of its `cn` and the `form` of its place. A
 * part beyond its type's places sits at the place no type lists, so it is refused.
 */
export const CnSlot = law(
  entryOf("E1 derived"),
  relation(
    "CnSlot",
    {
      form: closedId(CnPartForm),
      package: PackageName,
      part: closedId(CnPart),
      path: EntryPath,
      start: natural,
      type: closedId(CnType),
    },
    ["package", "path", "start", "part"],
  ),
);

/**
 * One `type` or `base` attribute of an `m:cn`, keyed by its node and its name: its lexical form as
 * written, whether or not the `cn` is judged, copied so that a law can compare it in a key, which
 * holds it as itself, a `CopiedLexical` (`#pantry/qti/limits.ts`).
 */
export const CnAttribute = law(
  entryOf("E1 derived"),
  relation(
    "CnAttribute",
    {
      lexical: CopiedLexical,
      name: closedId(AttributeName),
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start", "name"],
  ),
);

/**
 * The relations the cn laws declare, in one list, as `#pantry/qti/schema.ts` composes them.
 */
export const cnRelations = [CnAttribute, CnCount, CnPartText, CnSlot, MathCn] as const;

/**
 * The `m:cn` nodes, each of which may hold a {@link MathCn} row.
 */
const cnNodes = select(Node, (n) => n.eq(n.kind, "m:cn"));

/**
 * The `type` and `base` attributes of an `m:cn`.
 */
const cnAttributes = select(Attribute, (a) =>
  a.and(a.eq(a.kind, "m:cn"), a.in(a.name, ["type", "base"])),
);

/**
 * The {@link MathCn} rows of a `cn` that writes a `type`.
 */
const typedCns = select(MathCn, (c) => c.ne(c.typeLexical, ""));

/**
 * The {@link CnCount} rows of a `cn` that writes a `type`.
 */
const typedCounts = select(CnCount, (c) => c.ne(c.typeLexical, ""));

/**
 * The {@link MathCn} rows of a `cn` that writes a `base`.
 */
const basedCns = select(MathCn, (c) => c.ne(c.baseLexical, ""));

/**
 * The family of a `cn`'s parts, counted by `MathCn.parts`.
 */
const partFamily = counted(on(CnPartText, "package", "path", "start"), fin(MathCn, "parts"));

/**
 * The family of the parts of a `cn` the digits cannot judge too, counted by `CnCount.parts`.
 */
const slotFamily = counted(on(CnSlot, "package", "path", "start"), fin(CnCount, "parts"));

/**
 * The containments that judge a `cn`'s part count: its `(type, parts)` in {@link CnParts}, and
 * each part's `(type, part, form)` in {@link CnForm}, over the judged `cn`s ({@link MathCn},
 * {@link CnPartText}) and again over every `cn` whose `type` lists a form ({@link CnCount},
 * {@link CnSlot}), whatever its base and whatever its parts hold. A `cn` of the wrong part count is
 * a `cn` of the wrong form, "MathML cn form" as the oracle names it, so `mathmlLawsByName`
 * (`#pantry/qti/mathml.ts`) names them so and the rest of the module "E1 derived".
 */
export const cnCountLaws = {
  judgedForm: contained(on(CnPartText, "type", "part", "form"), on(CnForm, "type", "part", "form")),
  judgedParts: contained(on(MathCn, "type", "parts"), on(CnParts, "type", "parts")),
  typedForm: contained(on(CnSlot, "type", "part", "form"), on(CnForm, "type", "part", "form")),
  typedParts: contained(on(CnCount, "type", "parts"), on(CnParts, "type", "parts")),
};

/**
 * The statements over {@link CnAttribute}, {@link MathCn} and {@link CnPartText}, each `check`
 * named by its law:
 *
 * - **the attributes:** a {@link CnAttribute} row for each `type` and `base` of an `m:cn` and no
 *   other (both ways), its lexical form the attribute's;
 * - **the cn:** each row's node an `m:cn`; where it writes a `type` or a `base`, the lexical form is
 *   that of the node's {@link CnAttribute} row, and the handle is the one the form spells, as
 *   {@link CnTypeSpelling} and {@link CnBaseSpelling} hold (`real` and `10` where none is written,
 *   `E1_derived`); its `parts` the count {@link CnParts} gives its type;
 * - **the parts:** the family, counted by `MathCn.parts`; each row's `type` and `base` those of its
 *   `cn`, and its `(type, part, form)` a row of {@link CnForm}, so a place beyond the type's parts
 *   is refused;
 * - **the count:** each {@link CnCount} row's node an `m:cn`, its lexical `type` that of the node's
 *   {@link CnAttribute} row and the handle the one it spells (`E1_derived`); the family of its
 *   {@link CnSlot} rows, counted by `CnCount.parts`, its `(type, parts)` in {@link CnParts} and
 *   each slot's `(type, part, form)` in {@link CnForm}; each {@link MathCn} row's node and `type` a
 *   {@link CnCount} row's, so the two count one `cn` alike;
 * - **`MathML_cn_form`:** each part's text matches the pattern of its form in its base.
 */
export const cnLaws = [
  contained(on(MathCn, "package", "path", "start"), on(cnNodes, "package", "path", "start")),
  contained(
    on(cnAttributes, "package", "path", "start", "name", "lexical"),
    on(CnAttribute, "package", "path", "start", "name", "lexical"),
  ),
  contained(
    on(CnAttribute, "package", "path", "start", "name"),
    on(cnAttributes, "package", "path", "start", "name"),
  ),
  contained(
    on(typedCns, "package", "path", "start", "typeLexical"),
    on(
      select(CnAttribute, (a) => a.eq(a.name, "type")),
      "package",
      "path",
      "start",
      "lexical",
    ),
  ),
  contained(
    on(basedCns, "package", "path", "start", "baseLexical"),
    on(
      select(CnAttribute, (a) => a.eq(a.name, "base")),
      "package",
      "path",
      "start",
      "lexical",
    ),
  ),
  cnCountLaws.judgedParts,
  check("E1_derived", MathCn, (c) =>
    c.and(
      c.or(
        c.and(c.eq(c.typeLexical, ""), c.eq(c.type, "real")),
        Text.matches(c.typeLexical, CnTypeSpelling.at("pattern", c.type)),
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

  contained(on(CnCount, "package", "path", "start"), on(cnNodes, "package", "path", "start")),
  contained(
    on(typedCounts, "package", "path", "start", "typeLexical"),
    on(
      select(CnAttribute, (a) => a.eq(a.name, "type")),
      "package",
      "path",
      "start",
      "lexical",
    ),
  ),
  check("E1_derived", CnCount, (c) =>
    c.or(
      c.and(c.eq(c.typeLexical, ""), c.eq(c.type, "real")),
      Text.matches(c.typeLexical, CnTypeSpelling.at("pattern", c.type)),
    ),
  ),
  slotFamily,
  cnCountLaws.typedParts,
  contained(
    on(CnSlot, "package", "path", "start", "type"),
    on(CnCount, "package", "path", "start", "type"),
  ),
  cnCountLaws.typedForm,
  contained(
    on(MathCn, "package", "path", "start", "type"),
    on(CnCount, "package", "path", "start", "type"),
  ),
  check("MathML_cn_form", CnPartText, (p) =>
    Text.matches(p.text, CnPattern.at("pattern", p.form, p.base)),
  ),
];
