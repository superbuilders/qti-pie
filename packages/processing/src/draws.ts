/**
 * The readers of a run's draw stream: a float in [0, 1) and an integer below a count. The stream is
 * a run's sequence of unsigned 32-bit words (`Run.draw`), drawn in evaluation order; these readers
 * are part of its contract, so a draw is the same on every host and in every engine that keeps it
 * (plate's and the SQL grader's, which these restate bit for bit).
 *
 * @module
 */

/**
 * The divisor that turns a 53-bit numerator into a fraction of 1: 2^53.
 *
 * @formatConstant
 */
const twoToThe53 = 9_007_199_254_740_992;

/**
 * The factor that lifts a draw's top 27 bits above another's top 26: 2^26.
 *
 * @formatConstant
 */
const twoToThe26 = 67_108_864;

/**
 * The number of distinct words a draw gives: 2^32.
 *
 * @formatConstant
 */
const wordCount = 4_294_967_296n;

/**
 * Draw a float in [0, 1) from two words `a` and `b`, taken in that order: the top 27 bits of `a`
 * above the top 26 bits of `b`, over 2^53, so one of the 2^53 multiples of 2^-53 below 1, each
 * equally likely, exact on every host.
 *
 * @param draw - The stream; the float takes its next two words.
 * @returns The float, at least 0 and below 1.
 */
export const drawFloat = (draw: () => number): number => {
  const high = Math.floor(draw() / 32);
  const low = Math.floor(draw() / 64);

  return (high * twoToThe26 + low) / twoToThe53;
};

/**
 * Read one candidate of {@link drawBelow}: ⌈bits / 32⌉ words as one big-endian number, the first
 * word the most significant, masked to its low `bits` bits.
 *
 * @param draw - The stream.
 * @param bits - The number of low bits kept, 1 or more.
 * @returns The candidate, below 2^bits.
 */
const candidateOf = (draw: () => number, bits: number): bigint => {
  let whole = 0n;
  for (let read = 0; read < bits; read += 32) {
    whole = whole * wordCount + BigInt(draw());
  }

  return BigInt.asUintN(bits, whole);
};

/**
 * Draw an integer below a count, each equally likely, by rejection: with `k` the bit length of
 * `count − 1`, read ⌈k / 32⌉ words as one big-endian number masked to its low `k` bits, and draw
 * again while it is not below `count`. A count of 1 draws nothing and gives 0.
 *
 * @param draw - The stream.
 * @param count - The number of values to draw among, 1 or more.
 * @returns The integer, at least 0 and below `count`.
 */
export const drawBelow = (draw: () => number, count: bigint): bigint => {
  if (count <= 1n) {
    return 0n;
  }

  const bits = (count - 1n).toString(2).length;
  let candidate = candidateOf(draw, bits);
  while (candidate >= count) {
    candidate = candidateOf(draw, bits);
  }

  return candidate;
};
