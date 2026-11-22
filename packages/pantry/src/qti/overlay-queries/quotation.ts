/**
 * The quotation law of spec reading 127: no quotation punctuation immediately before, after or
 * inside a `q`, since the user agent draws the quotes itself.
 *
 * The information model says of Q: "Quotation punctuation (such as quotation marks) that is
 * quoting the contents of the tag must not appear immediately before, after, or inside q tags;
 * they will be inserted into the rendering by the user agent" (§5.111; the 3.0.1 ASI XSD repeats
 * it as `QDType`'s documentation). So a `q` is refused where any one of four characters is a
 * quotation mark ({@link quotationMarks}): the last character of its sibling before it, the first
 * of its sibling after it, and the first and last of its own content.
 *
 * Each of the four is the end of one sibling or child row of `Node`, its `first` or `last`
 * (`#pantry/qti/node.ts`), which `E1_derived` proves against its `chars`. No overlay copies them:
 * {@link QuotationEnd} reads each from the neighbour's own row, by the `q`'s parent and slot, its
 * child count and its own start, as the tree draws them. A neighbour that does not exist gives no
 * end, and one that is no text holds no characters, so its ends are empty and never a mark: an
 * element beside a `q` is not judged, and a comment or processing instruction between a `q` and a
 * mark keeps the mark from being immediately beside it. An entity reference crust keeps is one the
 * document does not declare, whose replacement text no row holds, so it is judged as written, `&`
 * and `;`.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Q | QTI 3.0 ASI information model, §5.111 Q}
 */
import { check, derived, Num, query, Type, v } from "@bjornpagen/grizzle";
import { QtiBase } from "#pantry/qti/base.ts";
import { documentStart, Node } from "#pantry/qti/node.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * The quotation punctuation a `q`'s four ends are refused for: the ASCII double quote, the single
 * and double curly and low quotes but the right single quotation mark, and the guillemets.
 *
 * The ASCII apostrophe (U+0027) and the right single quotation mark (U+2019) are left out: each is
 * an apostrophe as often as a quote, and a possessive or an elision beside a `q`, as in
 * `the students’<q>…</q>`, quotes nothing. A predefined entity reaches the rows as its character,
 * since crust substitutes it, so `&quot;` is the double quote here and `&apos;` the apostrophe.
 */
export const quotationMarks = ['"', "«", "»", "‘", "‚", "‛", "“", "”", "„", "‟", "‹", "›"] as const;

/**
 * Each end a `q` is judged by, by the `q`'s place: the last character of its sibling before it,
 * the first of its sibling after it, and the first of its first child and the last of its last
 * child, each the neighbour's own `first` or `last`. A sibling is a member of the `q`'s parent's
 * family, never the document node, which is its own parent at slot 0.
 */
const QuotationEnd = derived(
  "QuotationEnd",
  query(QtiBase)
    .rule((r) => {
      const q = v(Node, "q");
      const before = v(Node, "before");

      return r
        .match(Node, {
          at: q.at,
          kind: "q",
          package: q.package,
          parent: q.parent,
          path: q.path,
          start: q.start,
        })
        .match(Node, {
          at: before.at,
          last: before.last,
          package: q.package,
          parent: q.parent,
          path: q.path,
          start: before.start,
        })
        .where(
          r.ne(before.start, documentStart),
          r.eq(Num.add(Type.base(before.at), 1n), Type.base(q.at)),
        )
        .find({ end: before.last, package: q.package, path: q.path, start: q.start });
    })
    .rule((r) => {
      const q = v(Node, "q");
      const after = v(Node, "after");

      return r
        .match(Node, {
          at: q.at,
          kind: "q",
          package: q.package,
          parent: q.parent,
          path: q.path,
          start: q.start,
        })
        .match(Node, {
          at: after.at,
          first: after.first,
          package: q.package,
          parent: q.parent,
          path: q.path,
          start: after.start,
        })
        .where(
          r.ne(after.start, documentStart),
          r.eq(Type.base(after.at), Num.add(Type.base(q.at), 1n)),
        )
        .find({ end: after.first, package: q.package, path: q.path, start: q.start });
    })
    .rule((r) => {
      const q = v(Node, "q");
      const child = v(Node, "child");

      return r
        .match(Node, { kind: "q", package: q.package, path: q.path, start: q.start })
        .match(Node, {
          at: 0n,
          first: child.first,
          package: q.package,
          parent: q.start,
          path: q.path,
          start: child.start,
        })
        .find({ end: child.first, package: q.package, path: q.path, start: q.start });
    })
    .rule((r) => {
      const q = v(Node, "q");
      const child = v(Node, "child");

      return r
        .match(Node, {
          children: q.children,
          kind: "q",
          package: q.package,
          path: q.path,
          start: q.start,
        })
        .match(Node, {
          at: child.at,
          last: child.last,
          package: q.package,
          parent: q.start,
          path: q.path,
          start: child.start,
        })
        .where(r.eq(Num.add(Type.base(child.at), 1n), Type.base(q.children)))
        .find({ end: child.last, package: q.package, path: q.path, start: q.start });
    }),
);

/**
 * The quotation law over the `q`s' ends, named by its oracle law, "Quotation punctuation": none of
 * a `q`'s ends is a quotation mark.
 */
export const quotationOverlayLawsByName = {
  "Quotation punctuation": declared("Quotation punctuation", [
    check("Quotation_punctuation", QuotationEnd, (e) => e.not(e.in(e.end, quotationMarks))),
  ]),
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const quotationOverlayRelations = [QuotationEnd] as const;

/**
 * The rules of this module, {@link quotationOverlayLawsByName} flattened.
 */
export const quotationOverlayLaws = Object.values(quotationOverlayLawsByName).flat();
