/**
 * SHA-256 (FIPS 180-4) and HMAC-SHA-256 (RFC 2104), in TypeScript alone: the package is effect-free
 * and synchronous, so it loads no `node:crypto` and cannot await WebCrypto. They key the draw
 * stream (`#processing/stream.ts`) and digest the values a grade read.
 *
 * @module
 */

/**
 * The first 32 bits of the fractional parts of the cube roots of the first 64 primes (FIPS 180-4
 * §4.2.2).
 *
 * @formatConstant
 */
const roundConstants = Uint32Array.of(
  0x42_8a_2f_98,
  0x71_37_44_91,
  0xb5_c0_fb_cf,
  0xe9_b5_db_a5,
  0x39_56_c2_5b,
  0x59_f1_11_f1,
  0x92_3f_82_a4,
  0xab_1c_5e_d5,
  0xd8_07_aa_98,
  0x12_83_5b_01,
  0x24_31_85_be,
  0x55_0c_7d_c3,
  0x72_be_5d_74,
  0x80_de_b1_fe,
  0x9b_dc_06_a7,
  0xc1_9b_f1_74,
  0xe4_9b_69_c1,
  0xef_be_47_86,
  0x0f_c1_9d_c6,
  0x24_0c_a1_cc,
  0x2d_e9_2c_6f,
  0x4a_74_84_aa,
  0x5c_b0_a9_dc,
  0x76_f9_88_da,
  0x98_3e_51_52,
  0xa8_31_c6_6d,
  0xb0_03_27_c8,
  0xbf_59_7f_c7,
  0xc6_e0_0b_f3,
  0xd5_a7_91_47,
  0x06_ca_63_51,
  0x14_29_29_67,
  0x27_b7_0a_85,
  0x2e_1b_21_38,
  0x4d_2c_6d_fc,
  0x53_38_0d_13,
  0x65_0a_73_54,
  0x76_6a_0a_bb,
  0x81_c2_c9_2e,
  0x92_72_2c_85,
  0xa2_bf_e8_a1,
  0xa8_1a_66_4b,
  0xc2_4b_8b_70,
  0xc7_6c_51_a3,
  0xd1_92_e8_19,
  0xd6_99_06_24,
  0xf4_0e_35_85,
  0x10_6a_a0_70,
  0x19_a4_c1_16,
  0x1e_37_6c_08,
  0x27_48_77_4c,
  0x34_b0_bc_b5,
  0x39_1c_0c_b3,
  0x4e_d8_aa_4a,
  0x5b_9c_ca_4f,
  0x68_2e_6f_f3,
  0x74_8f_82_ee,
  0x78_a5_63_6f,
  0x84_c8_78_14,
  0x8c_c7_02_08,
  0x90_be_ff_fa,
  0xa4_50_6c_eb,
  0xbe_f9_a3_f7,
  0xc6_71_78_f2,
);

/**
 * The first 32 bits of the fractional parts of the square roots of the first 8 primes (FIPS 180-4
 * §5.3.3).
 *
 * @formatConstant
 */
const initialHash = Uint32Array.of(
  0x6a_09_e6_67,
  0xbb_67_ae_85,
  0x3c_6e_f3_72,
  0xa5_4f_f5_3a,
  0x51_0e_52_7f,
  0x9b_05_68_8c,
  0x1f_83_d9_ab,
  0x5b_e0_cd_19,
);

/**
 * SHA-256's block size in bytes, which HMAC pads its key to.
 *
 * @formatConstant
 */
const blockBytes = 64;

/**
 * A 32-bit word rotated right.
 *
 * @param word - The word.
 * @param by - The rotation, 1 to 31.
 * @returns The rotated word.
 */
const rotateRight = (word: number, by: number): number => (word >>> by) | (word << (32 - by));

/**
 * Fill a block's message schedule (FIPS 180-4 §6.2.2, step 1).
 *
 * @param view - The padded message.
 * @param block - The block's first byte.
 * @param schedule - The schedule's 64 words, overwritten.
 */
const scheduleBlock = (view: DataView, block: number, schedule: Uint32Array): void => {
  for (let t = 0; t < 16; t += 1) {
    schedule[t] = view.getUint32(block + t * 4);
  }

  for (let t = 16; t < 64; t += 1) {
    const w15 = schedule[t - 15] ?? 0;
    const w2 = schedule[t - 2] ?? 0;
    const s0 = rotateRight(w15, 7) ^ rotateRight(w15, 18) ^ (w15 >>> 3);
    const s1 = rotateRight(w2, 17) ^ rotateRight(w2, 19) ^ (w2 >>> 10);
    schedule[t] = ((schedule[t - 16] ?? 0) + s0 + (schedule[t - 7] ?? 0) + s1) >>> 0;
  }
};

/**
 * Compress one scheduled block into the hash (FIPS 180-4 §6.2.2, steps 2 to 4).
 *
 * @param hash - The eight hash words, updated.
 * @param schedule - The block's schedule.
 */
const compress = (hash: Uint32Array, schedule: Uint32Array): void => {
  const word = (index: number): number => hash[index] ?? 0;
  let [a, b, c, d, e, f, g, h] = [
    word(0),
    word(1),
    word(2),
    word(3),
    word(4),
    word(5),
    word(6),
    word(7),
  ];
  for (let t = 0; t < 64; t += 1) {
    const s1 = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
    const choice = (e & f) ^ (~e & g);
    const first = (h + s1 + choice + (roundConstants[t] ?? 0) + (schedule[t] ?? 0)) >>> 0;
    const s0 = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
    const majority = (a & b) ^ (a & c) ^ (b & c);
    const second = (s0 + majority) >>> 0;
    h = g;
    g = f;
    f = e;
    e = (d + first) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (first + second) >>> 0;
  }

  for (const [index, value] of [a, b, c, d, e, f, g, h].entries()) {
    hash[index] = (word(index) + value) >>> 0;
  }
};

/**
 * The SHA-256 digest of bytes.
 *
 * @param message - The bytes.
 * @returns The 32-byte digest.
 */
export const sha256 = (message: Uint8Array): Uint8Array => {
  const bitLength = BigInt(message.length) * 8n;
  const padded = new Uint8Array(Math.ceil((message.length + 9) / blockBytes) * blockBytes);
  padded.set(message);
  padded[message.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setBigUint64(padded.length - 8, bitLength);

  const hash = Uint32Array.from(initialHash);
  const schedule = new Uint32Array(64);
  for (let block = 0; block < padded.length; block += blockBytes) {
    scheduleBlock(view, block, schedule);
    compress(hash, schedule);
  }

  const digest = new Uint8Array(32);
  const out = new DataView(digest.buffer);
  for (const [index, word] of hash.entries()) {
    out.setUint32(index * 4, word);
  }

  return digest;
};

/**
 * Bytes joined in order.
 *
 * @param parts - The parts.
 * @returns Their concatenation.
 */
const joined = (parts: readonly Uint8Array[]): Uint8Array => {
  const whole = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let at = 0;
  for (const part of parts) {
    whole.set(part, at);
    at += part.length;
  }

  return whole;
};

/**
 * HMAC-SHA-256 (RFC 2104): `H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ message))`, a key longer than a block
 * hashed first.
 *
 * @param key - The key.
 * @param message - The message.
 * @returns The 32-byte tag.
 */
export const hmacSha256 = (key: Uint8Array, message: Uint8Array): Uint8Array => {
  const block = new Uint8Array(blockBytes);
  block.set(key.length > blockBytes ? sha256(key) : key);

  const inner = block.map((byte) => byte ^ 0x36);
  const outer = block.map((byte) => byte ^ 0x5c);

  return sha256(joined([outer, sha256(joined([inner, message]))]));
};

/**
 * The UTF-8 bytes of text, a lone surrogate written as U+FFFD, as the Encoding Standard's UTF-8
 * encoder writes it.
 *
 * @param text - The text.
 * @returns Its bytes.
 */
export const utf8Bytes = (text: string): Uint8Array => {
  const bytes: number[] = [];
  for (const character of text.toWellFormed()) {
    const point = character.codePointAt(0) ?? 0;
    if (point < 0x80) {
      bytes.push(point);
    } else if (point < 0x8_00) {
      bytes.push(0xc0 | (point >> 6), 0x80 | (point & 0x3f));
    } else if (point < 0x1_00_00) {
      bytes.push(0xe0 | (point >> 12), 0x80 | ((point >> 6) & 0x3f), 0x80 | (point & 0x3f));
    } else {
      bytes.push(
        0xf0 | (point >> 18),
        0x80 | ((point >> 12) & 0x3f),
        0x80 | ((point >> 6) & 0x3f),
        0x80 | (point & 0x3f),
      );
    }
  }

  return Uint8Array.from(bytes);
};

/**
 * Bytes as lowercase hexadecimal digits, two a byte.
 *
 * @param bytes - The bytes.
 * @returns The digits.
 */
export const hexOf = (bytes: Uint8Array): string =>
  [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
