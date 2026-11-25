/**
 * The position of each member of a test in its document's order: where a delivery serves an item
 * ref of a test that neither selects nor orders, so no reader ranks members itself. The order it
 * ranks by is the item ref's place, `start`. A sitting of a test whose section shuffles presents
 * that section's members in a draw of its own, so the ledger's take writes each sitting's order as
 * the sitting's fact (`@qti-pie/ledger` MemberPlace), counting these positions for every member
 * outside a shuffling section, and its readers and laws read that.
 */
import { query, v } from "@bjornpagen/grizzle";
import { QtiBase } from "#pantry/qti/base.ts";
import { testMemberRows } from "#pantry/qti/overlay-queries/tests.ts";

/**
 * Each member of a test beside its served position, keyed as the member: the test, `(package,
 * path)` (a test is its document, SV-KEY-01), the item ref's place, `start`, its identifier,
 * `item`, the item's document, `document`, and `k`, the 1-based rank of the item ref's place among
 * its test's members, the count of the members at or before it. A test that neither selects nor
 * orders is delivered in its members' document order, every member once ("If no ordering rule is
 * given, assume that the elements are to be ordered in the order in which they are defined", §5.98;
 * with no selection rule "all elements are to be selected", §5.129), sections and their members
 * alike, since `start` is the item ref's pre-order place in the test document: so `k` is the
 * position a delivery of such a test serves the member at. grizzle has no window function, so the
 * rank is the count it is. The query's key is not proven at the type level, so the count binds
 * each source's whole heading.
 */
export const memberPositions = query(QtiBase).rule((r) => {
  const {
    document,
    item,
    package: pkg,
    part,
    path,
    section,
    start,
    test,
  } = v(testMemberRows, "member");
  const earlier = v(testMemberRows, "earlier");

  return r
    .match(testMemberRows, { document, item, package: pkg, part, path, section, start, test })
    .match(testMemberRows, {
      document: earlier.document,
      item: earlier.item,
      package: pkg,
      part: earlier.part,
      path,
      section: earlier.section,
      start: earlier.start,
      test,
    })
    .where(r.le(earlier.start, start))
    .find({ document, item, k: r.count(), package: pkg, path, start });
});
