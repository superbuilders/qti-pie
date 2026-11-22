/**
 * The served position of each member of a test: the one statement of where a delivery serves an
 * item ref, which the test runtime's first member (`@qti-pie/ledger`'s sitting programs) and the
 * history of served tests read, so no reader ranks members itself. The order it ranks by is the
 * item ref's place, `start`; a law that needs only that order, as the runtime's linear navigation
 * law does, compares places, since a law reads no derived relation that aggregates.
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
 * rank is the count it is.
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

  // The query's key is not proven at the type level, so the count binds each source's whole heading.
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
