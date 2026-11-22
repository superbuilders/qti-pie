/**
 * The ledger's scalar types a writer brands its values with: what the QTI app writes into the ledger's typed columns,
 * each a named contract the app mints through this module alone, which loads no schema.
 */
import { contract, instant, keyTextBytes, natural, pg, str } from "@bjornpagen/grizzle"
import { Result } from "effect"
import { anyText } from "#ledger/keys.ts"

/**
 * The widest precision a numeric column declares, PostgreSQL's: where the search for QTI's integer's begins.
 *
 * @limitKind published
 * @owner PostgreSQL's numeric type (numeric.h NUMERIC_MAX_PRECISION)
 * @unit decimal digits
 * @scope the upper end of {@link integerDigits}' search
 * @source https://www.postgresql.org/docs/current/datatype-numeric.html#DATATYPE-NUMERIC-DECIMAL
 * @quote both the maximum precision and the maximum scale of a numeric column can be configured. [...] The maximum
 *   precision that can be explicitly specified in a numeric type declaration is 1000.
 * @verified 2026-11-19
 */
const numericMaxPrecision = 1000

/**
 * The bytes of a SHA-256 digest, the image a key holds a text by where its entry could outgrow PostgreSQL's B-tree
 * entry.
 *
 * @limitKind published
 * @owner FIPS 180-4
 * @unit bytes
 * @scope the image of each text a ledger key holds in its place
 * @source https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf
 * @quote SHA-256 ... 256-bit message digest
 * @verified 2026-11-20
 */
const sha256Bytes = 32

/**
 * A text as a key holds it where the key's entry could outgrow PostgreSQL's B-tree entry, as a multiple of points'
 * does, its variable a text of no byte bound: by its image, its UTF-8's SHA-256, a bytea in the text's place that takes
 * the entry's room a text of {@link sha256Bytes} bytes takes (grizzle's README, "Text in a key"). Every text of that
 * key is wider than its image, the learner's id among them, so each is held so.
 */
const keyImage = str.bytes(sha256Bytes, anyText)

/** Whether a multiple of points' key, `(child, package, item, n, at, variable, x, y)`, its four texts each by its
 * image ({@link keyImage}), holds both coordinates at `digits` digits in one B-tree entry, as grizzle's `keyTextBytes`
 * counts one: with room left for a text beside them. */
const pointCoordinatesFit = (digits: number) =>
	Result.isSuccess(
		Result.try(() =>
			keyTextBytes([
				keyImage,
				keyImage,
				keyImage,
				natural,
				instant,
				keyImage,
				pg.numeric(digits, 0),
				pg.numeric(digits, 0)
			])
		)
	)

/** The widest of `low` to `high` digits whose coordinates fit, `low`'s fitting: a bisection, since a wider precision
 * never fits where a narrower one does not. */
const widestFitting = (low: number, high: number): number => {
	if (low === high) {
		return low
	}
	const middle = Math.ceil((low + high) / 2)
	return pointCoordinatesFit(middle) ? widestFitting(middle, high) : widestFitting(low, middle - 1)
}

/**
 * QTI's integer's precision in the ledger: the widest whose two coordinates fit a multiple of points' key, the widest
 * key that holds two integers.
 *
 * @limitKind derived
 * @owner the QTI ledger
 * @unit decimal digits
 * @scope every integer value and point coordinate the ledger holds
 * @constraint QTI's integer is unbounded and plate bounds the integers it computes at 1,000,000 bits; the ledger's key
 *   holds two of at most this many digits beside its texts' images, which leave room for PostgreSQL's widest numeric
 *   ({@link numericMaxPrecision}, about 3,322 bits), so a wider integer is refused where the ledger is written, a
 *   stated limit of this representation. The texts are counted as their images, a function of the key's shape alone,
 *   so the app that mints the type loads no schema
 * @derivation grizzle's `keyTextBytes` over the key's texts as their images ({@link keyImage}), its place and instant,
 *   and two `numeric(p, 0)`, the widest `p` up to {@link numericMaxPrecision} that leaves room for a text beside them; a
 *   change of grizzle's entry accounting moves it, and grizzle refuses a key it no longer fits where the schema
 *   compiles
 */
const integerDigits = widestFitting(1, numericMaxPrecision)

/**
 * QTI's integer, exact: plate holds every integer as a `bigint` at any size (its reading 45: QTI 3.0 states no range
 * for the integer base type), so the ledger holds one as an integral numeric of {@link integerDigits} digits, never a
 * 64-bit integer that would refuse one plate computed past 2^63. At scale 0 grizzle holds the column to no NaN and gives
 * it as a `bigint`, so a value read is plate's integer as it is. One precision for every integer and point coordinate,
 * so the app mints one type.
 */
export const QtiInteger = contract("QtiInteger", pg.numeric(integerDigits, 0))

/**
 * QTI's float and duration, an IEEE double as plate holds one: NaN, the infinities and `-0` as themselves. A key compares
 * a double as PostgreSQL's equality does, natively, where `-0` is `0` and every NaN is one, which is how grading
 * compares one too, as plate's `sameSingle` does; a multiple, which holds `-0` and `0` as two values, keys each by its
 * identity image beside it, grizzle's `Num.floatBits` (`#ledger.ts`'s law BagImage).
 */
export const QtiFloat = pg["double precision"]
