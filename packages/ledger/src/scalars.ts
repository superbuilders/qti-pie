/**
 * The ledger's scalar types a writer brands its values with: what the QTI app writes into the
 * ledger's typed columns, each a named contract the app mints through this module alone, which
 * loads no schema.
 */
import { contract, pg } from "@bjornpagen/grizzle";
import { named } from "#ledger/laws.ts";

/**
 * QTI's integer's precision in the ledger: the SQL grader's, whose every integer value is a
 * `numeric(825, 0)` (`machine/machine-types.sql`, the `single`'s `n` and `m`), so the ledger holds
 * exactly the integers the grader reads and writes, one width for both. A key holds a numeric only
 * at a declared precision, and a multiple of integers or of points keys its values; the widest such
 * key, a snapshot's multiple of points (`child, package, path, n, at, variable, x, y`), holds two
 * coordinates of up to 993 digits beside its texts' bounds, so this width fits every key.
 *
 * @limitKind derived
 * @owner the QTI ledger
 * @unit decimal digits
 * @scope every integer value and point coordinate the ledger holds
 * @derivation the SQL grader's integer, `numeric(825, 0)` in `machine/machine-types.sql`
 * @constraint QTI's integer is unbounded and plate bounds the integers it computes at 1,000,000 bits; a wider integer
 *   than the grader's, about 2,740 bits, is refused where the ledger is written, a stated limit of this representation
 */
const integerDigits = 825;

/**
 * QTI's integer, exact: plate holds every integer as a `bigint` at any size (its reading 45: QTI
 * 3.0 states no range for the integer base type), so the ledger holds one as an integral numeric of
 * {@link integerDigits} digits, never a 64-bit integer that would refuse one plate computed past
 * 2^63. At scale 0 grizzle holds the column to no NaN and gives it as a `bigint`, so a value read
 * is plate's integer as it is. One precision for every integer and point coordinate, so the app
 * mints one type.
 */
export const QtiInteger = named(
  "QTI integer",
  contract("QtiInteger", pg.numeric(integerDigits, 0)),
);

/**
 * QTI's float and duration, an IEEE double as plate holds one: NaN, the infinities and `-0` as
 * themselves. A key compares a double as PostgreSQL's equality does, natively, where `-0` is `0`
 * and every NaN is one, which is how grading compares one too, as plate's `sameSingle` does; a
 * multiple, which holds `-0` and `0` as two values, keys each by its identity image beside it,
 * grizzle's `Num.floatBits` (`#ledger.ts`'s law BagImage).
 */
export const QtiFloat = pg["double precision"];
