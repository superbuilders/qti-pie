/**
 * The number kernels every family shares: the one integer-to-float conversion, and the exact
 * binary rationals every float is (reading 235), over which a sum is computed exactly and rounded
 * once (D2), a comparison of an integer with a float is decided exactly, a tolerance's ends are
 * computed exactly (reading 238), and a rounding reads the deciding digit of a double's exact
 * decimal expansion (reading 209).
 *
 * A finite double is `significand × 2^exponent` for an integer significand and an exponent of
 * -1074 or more, so every finite float and every integer is an {@link Exact}, and a sum, a
 * difference and a product of them is one too, computed on `bigint`s with nothing lost. Only
 * {@link nearestFloat} rounds, once, to the nearest double, a tie to the even significand, as IEEE
 * 754's default rounding does.
 *
 * @module
 */

/**
 * Convert an exact integer to a float: the nearest double, ties to even, and the largest finite
 * double of its sign for an integer beyond it, since the float base type holds no infinity made
 * from an integer (reading 45).
 *
 * @param integer - The integer.
 * @returns The nearest double, finite.
 */
export const toFloat = (integer: bigint): number => {
  const nearest = Number(integer);
  if (nearest === Number.POSITIVE_INFINITY) {
    return Number.MAX_VALUE;
  }

  return nearest === Number.NEGATIVE_INFINITY ? -Number.MAX_VALUE : nearest;
};

/**
 * A finite number exactly: `significand × 2^exponent`. Not normalised: two exacts of one value may
 * differ in exponent, so values are compared by {@link compareExact}, never by their fields.
 */
export interface Exact {
  readonly exponent: number;
  readonly significand: bigint;
}

/**
 * The order of two numbers.
 */
export type Order = -1 | 0 | 1;

/**
 * The least exponent of a double: the subnormals' unit, 2^-1074.
 */
const leastExponent = -1074;

/**
 * The bits of a double's significand, the implicit one included.
 */
const significandBits = 53;

/**
 * The integer as an exact.
 *
 * @param integer - The integer.
 * @returns It, exactly.
 */
export const exactOfInteger = (integer: bigint): Exact => ({ exponent: 0, significand: integer });

/**
 * A finite double's exact binary value, read from its bits: the stored significand with its
 * implicit one, at the stored exponent less the significand's 52 places.
 *
 * @param float - The double, finite.
 * @returns Its exact value.
 */
export const exactOfFloat = (float: number): Exact => {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, float);

  const high = view.getUint32(0);
  const low = view.getUint32(4);
  const negative = high >= 2 ** 31;
  const stored = Math.floor(high / 2 ** 20) % 2 ** 11;
  const fraction = BigInt(high % 2 ** 20) * 2n ** 32n + BigInt(low);
  const significand = stored === 0 ? fraction : fraction + 2n ** 52n;
  const exponent = (stored === 0 ? 1 : stored) - 1075;

  return { exponent, significand: negative ? -significand : significand };
};

/**
 * Two exacts' significands scaled to one exponent, the lesser of theirs.
 */
interface Aligned {
  readonly exponent: number;
  readonly left: bigint;
  readonly right: bigint;
}

/**
 * Two exacts' significands over their lesser exponent, so they compare and add as integers.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns Both significands, scaled to the common exponent, and that exponent.
 */
const aligned = (left: Exact, right: Exact): Aligned => {
  const exponent = Math.min(left.exponent, right.exponent);

  return {
    exponent,
    left: left.significand * 2n ** BigInt(left.exponent - exponent),
    right: right.significand * 2n ** BigInt(right.exponent - exponent),
  };
};

/**
 * The order of two exacts.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns -1 when the one is less, 1 when it is greater, 0 when they are equal.
 */
export const compareExact = (left: Exact, right: Exact): Order => {
  const both = aligned(left, right);
  if (both.left === both.right) {
    return 0;
  }

  return both.left < both.right ? -1 : 1;
};

/**
 * The exact sum of two exacts.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns Their sum.
 */
export const addExact = (left: Exact, right: Exact): Exact => {
  const both = aligned(left, right);

  return { exponent: both.exponent, significand: both.left + both.right };
};

/**
 * The exact product of two exacts.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns Their product.
 */
export const multiplyExact = (left: Exact, right: Exact): Exact => ({
  exponent: left.exponent + right.exponent,
  significand: left.significand * right.significand,
});

/**
 * The exact negation.
 *
 * @param exact - The value.
 * @returns Its negation.
 */
export const negateExact = (exact: Exact): Exact => ({
  exponent: exact.exponent,
  significand: -exact.significand,
});

/**
 * The bit length of a non-negative integer.
 *
 * @param magnitude - The integer, 0 or more.
 * @returns How many bits write it; 0 for 0.
 */
const bitLength = (magnitude: bigint): number =>
  magnitude === 0n ? 0 : magnitude.toString(2).length;

/**
 * A non-negative integer shifted right, rounded to the nearest integer, a tie to even.
 *
 * @param magnitude - The integer, 0 or more.
 * @param shift - How many bits to drop, 1 or more.
 * @returns The rounded quotient by `2^shift`.
 */
const roundedShift = (magnitude: bigint, shift: bigint): bigint => {
  const unit = 2n ** shift;
  const kept = magnitude / unit;
  const twice = 2n * (magnitude - kept * unit);

  return twice > unit || (twice === unit && kept % 2n === 1n) ? kept + 1n : kept;
};

/**
 * The double `2^exponent`, written from its bits, so no library function's accuracy enters: a
 * normal power from its biased exponent, a subnormal one from its fraction's single bit, and an
 * infinity past 2^1023.
 *
 * @param exponent - The power, -1074 or more.
 * @returns `2^exponent`.
 */
const powerOfTwo = (exponent: number): number => {
  if (exponent > 1023) {
    return Number.POSITIVE_INFINITY;
  }

  const view = new DataView(new ArrayBuffer(8));
  view.setBigUint64(
    0,
    exponent >= -1022
      ? BigInt(exponent + 1023) * 2n ** 52n
      : 2n ** BigInt(exponent - leastExponent),
  );

  return view.getFloat64(0);
};

/**
 * The double nearest an exact, rounded once: a tie to the even significand, a value past the
 * largest finite double to the infinity of its sign, and one below the least subnormal's half to
 * zero of its sign, as IEEE 754's round-to-nearest-even gives.
 *
 * The unit of the result is `2^unit`: the significand's 53 bits below the value's leading bit, or
 * the subnormals' 2^-1074 where that is lower. The significand is shifted to that unit, its
 * dropped bits deciding the rounding, and the rounded integer, at most 2^53, is exactly a double,
 * so multiplying it by `2^unit`, itself a double, rounds nothing.
 *
 * @param exact - The value.
 * @param negativeZero - Whether a zero result is -0 (a sum of -0s alone, as IEEE gives).
 * @returns The nearest double.
 */
export const nearestFloat = (exact: Exact, negativeZero = false): number => {
  const negative = exact.significand < 0n;
  const magnitude = negative ? -exact.significand : exact.significand;
  if (magnitude === 0n) {
    return negativeZero ? -0 : 0;
  }

  const unit = Math.max(bitLength(magnitude) + exact.exponent - significandBits, leastExponent);
  const shift = unit - exact.exponent;
  const scaled = shift > 0 ? roundedShift(magnitude, BigInt(shift)) : magnitude;
  const rounded = Number(scaled) * powerOfTwo(shift > 0 ? unit : exact.exponent);

  return negative ? -rounded : rounded;
};

/**
 * The sum of floats, computed exactly and rounded once (D2): the order of the operands never moves
 * it. A NaN, or infinities of both signs, give NaN; an infinity gives itself; a zero sum is -0 only
 * when every operand is -0, as IEEE's sums of zeros give.
 *
 * @param floats - The floats.
 * @returns Their sum.
 */
export const exactSum = (floats: readonly number[]): number => {
  let total: Exact = exactOfInteger(0n);
  let positiveInfinity = false;
  let negativeInfinity = false;
  let allNegativeZero = floats.length > 0;
  for (const float of floats) {
    if (Number.isNaN(float)) {
      return Number.NaN;
    }

    if (float === Number.POSITIVE_INFINITY) {
      positiveInfinity = true;
    } else if (float === Number.NEGATIVE_INFINITY) {
      negativeInfinity = true;
    } else {
      total = addExact(total, exactOfFloat(float));
    }

    allNegativeZero &&= Object.is(float, -0);
  }

  if (positiveInfinity || negativeInfinity) {
    if (positiveInfinity && negativeInfinity) {
      return Number.NaN;
    }

    return positiveInfinity ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  }

  return nearestFloat(total, allNegativeZero);
};

/**
 * A decimal exactly: `digits × 10^exponent`, of a sign, its digits with no leading or trailing
 * zero; zero is the digits `"0"` at exponent 0, positive.
 */
export interface Decimal {
  readonly digits: string;
  readonly exponent: bigint;
  readonly negative: boolean;
}

/**
 * Zero, as a decimal.
 */
const zeroDecimal: Decimal = { digits: "0", exponent: 0n, negative: false };

/**
 * A decimal of written digits, its leading and trailing zeros dropped.
 *
 * @param negative - Its sign.
 * @param written - Its digits, any zeros included.
 * @param exponent - The power of ten of its last written digit.
 * @returns The decimal.
 */
const decimalOfDigits = (negative: boolean, written: string, exponent: bigint): Decimal => {
  let start = 0;
  while (start < written.length && written.charAt(start) === "0") {
    start += 1;
  }

  let end = written.length;
  while (end > start && written.charAt(end - 1) === "0") {
    end -= 1;
  }

  return end === start
    ? zeroDecimal
    : {
        digits: written.slice(start, end),
        exponent: exponent + BigInt(written.length - end),
        negative,
      };
};

/**
 * An exact's exact decimal expansion. Every binary rational has a finite one:
 * `m × 2^-k = m × 5^k × 10^-k`.
 *
 * @param exact - The value.
 * @returns Its decimal, exactly.
 */
export const decimalOfExact = (exact: Exact): Decimal => {
  const negative = exact.significand < 0n;
  const magnitude = negative ? -exact.significand : exact.significand;

  return exact.exponent >= 0
    ? decimalOfDigits(negative, (magnitude * 2n ** BigInt(exact.exponent)).toString(), 0n)
    : decimalOfDigits(
        negative,
        (magnitude * 5n ** BigInt(-exact.exponent)).toString(),
        BigInt(exact.exponent),
      );
};

/**
 * A decimal rounded to its first `keep` digits: increased by one in the last kept digit when the
 * deciding digit, the first dropped, is 5 or greater, of the magnitude, so a negative value rounds
 * as its magnitude does (sections 2.11.3.43 and 2.11.3.4, reading 209). Keeping none, or fewer, is
 * rounding at a place above the leading digit: the deciding digit is then 0 and the value 0, but
 * where `keep` is 0 exactly, when the leading digit itself decides.
 *
 * @param decimal - The decimal.
 * @param keep - How many of its leading digits to keep.
 * @returns The rounded decimal.
 */
export const roundDecimal = (decimal: Decimal, keep: bigint): Decimal => {
  const length = BigInt(decimal.digits.length);
  if (keep >= length) {
    return decimal;
  }

  if (keep < 0n) {
    return zeroDecimal;
  }

  const at = Number(keep);
  const carry = (decimal.digits.codePointAt(at) ?? 0) >= 53 ? 1n : 0n;
  const kept = BigInt(`0${decimal.digits.slice(0, at)}`) + carry;

  return decimalOfDigits(decimal.negative, kept.toString(), decimal.exponent + length - keep);
};

/**
 * The double nearest a decimal, a tie to even: ECMAScript's reading of a decimal literal, which is
 * correctly rounded.
 *
 * @param decimal - The decimal.
 * @returns The nearest double; an infinity past the largest finite one.
 */
export const floatOfDecimal = (decimal: Decimal): number =>
  Number(`${decimal.negative ? "-" : ""}${decimal.digits}e${decimal.exponent.toString()}`);

/**
 * Whether two decimals are one value.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns Whether they are equal.
 */
export const sameDecimal = (left: Decimal, right: Decimal): boolean =>
  left.negative === right.negative &&
  left.digits === right.digits &&
  left.exponent === right.exponent;

/**
 * The floored quotient of two integers: the greatest integer at most `dividend / divisor`
 * (section 2.11.3.24). `bigint`'s `/` truncates, so a quotient with a remainder of the other sign
 * moves down one.
 *
 * @param dividend - The dividend.
 * @param divisor - The divisor, not 0.
 * @returns The floored quotient.
 */
export const flooredQuotient = (dividend: bigint, divisor: bigint): bigint => {
  const quotient = dividend / divisor;

  return dividend % divisor !== 0n && dividend < 0n !== divisor < 0n ? quotient - 1n : quotient;
};

/**
 * The bits a rounding needs below a double's 53: two guard bits above the sticky one, so the
 * sticky bit is never the half-unit bit that decides a tie.
 */
const guardedBits = 56;

/**
 * The least exponent a sticky bit may sit at: below the half of the subnormals' unit, 2^-1075, so a
 * subnormal result's tie is decided by the bits above it alone.
 */
const stickyExponent = -1077;

/**
 * An exact quotient's significand, truncated, with a sticky bit standing for every bit it drops:
 * `2·⌊n / d⌋ + (n mod d ≠ 0)`. Rounding it once rounds the quotient itself, since the sticky bit
 * sits below every bit that decides.
 *
 * @param numerator - The dividend's magnitude, scaled.
 * @param denominator - The divisor, 1 or more.
 * @returns The significand, one bit wider than the quotient.
 */
const stickyQuotient = (numerator: bigint, denominator: bigint): bigint => {
  const quotient = numerator / denominator;

  return 2n * quotient + (quotient * denominator === numerator ? 0n : 1n);
};

/**
 * The double nearest `numerator / denominator`, rounded once, a tie to even: the quotient is
 * computed to {@link guardedBits} bits and a sticky bit, then rounded by {@link nearestFloat}.
 *
 * @param numerator - The dividend.
 * @param denominator - The divisor, 1 or more.
 * @returns The nearest double of the exact quotient.
 */
export const nearestQuotient = (numerator: Exact, denominator: bigint): number => {
  const negative = numerator.significand < 0n;
  const magnitude = negative ? -numerator.significand : numerator.significand;
  const shift = Math.max(
    guardedBits - bitLength(magnitude) + bitLength(denominator),
    numerator.exponent - stickyExponent,
    0,
  );
  const significand = stickyQuotient(magnitude * 2n ** BigInt(shift), denominator);

  return nearestFloat({
    exponent: numerator.exponent - shift - 1,
    significand: negative ? -significand : significand,
  });
};

/**
 * The integer square root: the greatest integer whose square is at most the value, by Newton's
 * iteration from a power of two above the root.
 *
 * @param value - The integer, 0 or more.
 * @returns `⌊√value⌋`.
 */
const integerSquareRoot = (value: bigint): bigint => {
  if (value < 2n) {
    return value;
  }

  let root = 2n ** BigInt(Math.ceil(bitLength(value) / 2));
  let next = (root + value / root) / 2n;
  while (next < root) {
    root = next;
    next = (root + value / root) / 2n;
  }

  return root;
};

/**
 * The double nearest `√(numerator / denominator)`, rounded once, a tie to even: the root is
 * computed to {@link guardedBits} bits and a sticky bit, then rounded by {@link nearestFloat}.
 *
 * @param numerator - The radicand's dividend, 0 or more.
 * @param denominator - The radicand's divisor, 1 or more.
 * @returns The nearest double of the exact root.
 */
export const nearestSquareRoot = (numerator: Exact, denominator: bigint): number => {
  const odd = numerator.exponent % 2 !== 0;
  const significand = odd ? 2n * numerator.significand : numerator.significand;
  const exponent = odd ? numerator.exponent - 1 : numerator.exponent;
  const half = Math.max(
    Math.ceil((2 * guardedBits - bitLength(significand) + bitLength(denominator)) / 2),
    0,
  );
  const scaled = significand * 4n ** BigInt(half);
  const radicand = scaled / denominator;
  const root = integerSquareRoot(radicand);
  const exact = root * root === radicand && radicand * denominator === scaled;

  return nearestFloat({
    exponent: exponent / 2 - half - 1,
    significand: 2n * root + (exact ? 0n : 1n),
  });
};

/**
 * A number of the value model: a single integer or a single float.
 */
export type NumberScalar =
  | { readonly base: "float"; readonly value: number }
  | { readonly base: "integer"; readonly value: bigint };

/**
 * A number's exact value.
 *
 * @param number - The number.
 * @returns Its exact value; `undefined` for an infinity or NaN.
 */
export const exactOfNumber = (number: NumberScalar): Exact | undefined => {
  if (number.base === "integer") {
    return exactOfInteger(number.value);
  }

  return Number.isFinite(number.value) ? exactOfFloat(number.value) : undefined;
};

/**
 * A number as a float: an integer through {@link toFloat}.
 *
 * @param number - The number.
 * @returns Its float.
 */
export const floatOfNumber = (number: NumberScalar): number =>
  number.base === "integer" ? toFloat(number.value) : number.value;

/**
 * The order of two numbers by their exact values, an integer against a float included, so
 * 9007199254740993 is greater than the float 9007199254740992. An infinity is beyond every finite
 * number and equal to itself.
 *
 * @param left - The one.
 * @param right - The other.
 * @returns Their order; `undefined` where either is NaN, which is in no order.
 */
export const orderOfNumbers = (left: NumberScalar, right: NumberScalar): Order | undefined => {
  const one = exactOfNumber(left);
  const other = exactOfNumber(right);
  if (one !== undefined && other !== undefined) {
    return compareExact(one, other);
  }

  const x = floatOfNumber(left);
  const y = floatOfNumber(right);
  if (x < y) {
    return -1;
  }

  if (x > y) {
    return 1;
  }

  return x === y ? 0 : undefined;
};
