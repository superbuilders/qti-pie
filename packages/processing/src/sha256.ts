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
const roundConstants = Int32Array.of(
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
const initialHash = Int32Array.of(
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
 * The 64 words of one block's message schedule (FIPS 180-4 §6.2.2, step 1), read from the padded
 * message and extended in place.
 *
 * @param padded - The padded message.
 * @param block - The block's first byte.
 * @param schedule - The schedule, overwritten.
 */
const scheduleBlock = (padded: Uint8Array, block: number, schedule: Int32Array): void => {
  for (let t = 0; t < 16; t += 1) {
    const at = block + t * 4;
    schedule[t] =
      ((padded[at] ?? 0) << 24) |
      ((padded[at + 1] ?? 0) << 16) |
      ((padded[at + 2] ?? 0) << 8) |
      (padded[at + 3] ?? 0);
  }

  for (let t = 16; t < 64; t += 1) {
    const w15 = schedule[t - 15] ?? 0;
    const w2 = schedule[t - 2] ?? 0;
    const s0 = ((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3);
    const s1 = ((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10);
    schedule[t] = ((schedule[t - 16] ?? 0) + s0 + (schedule[t - 7] ?? 0) + s1) >>> 0;
  }
};

/**
 * Compress one scheduled block into the hash (FIPS 180-4 §6.2.2, steps 2 to 4), the working
 * variables in locals: no allocation a block.
 *
 * @param hash - The eight hash words, updated.
 * @param schedule - The block's schedule.
 */
const compress = (hash: Int32Array, schedule: Int32Array): void => {
  let a = hash[0] ?? 0;
  let b = hash[1] ?? 0;
  let c = hash[2] ?? 0;
  let d = hash[3] ?? 0;
  let e = hash[4] ?? 0;
  let f = hash[5] ?? 0;
  let g = hash[6] ?? 0;
  let h = hash[7] ?? 0;
  for (let t = 0; t < 64; t += 1) {
    const s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
    const choice = (e & f) ^ (~e & g);
    const first = (h + s1 + choice + (roundConstants[t] ?? 0) + (schedule[t] ?? 0)) >>> 0;
    const s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
    const majority = (a & b) ^ (a & c) ^ (b & c);
    h = g;
    g = f;
    f = e;
    e = (d + first) >>> 0;
    d = c;
    c = b;
    b = a;
    a = (first + s0 + majority) >>> 0;
  }

  hash[0] = (hash[0] ?? 0) + a;
  hash[1] = (hash[1] ?? 0) + b;
  hash[2] = (hash[2] ?? 0) + c;
  hash[3] = (hash[3] ?? 0) + d;
  hash[4] = (hash[4] ?? 0) + e;
  hash[5] = (hash[5] ?? 0) + f;
  hash[6] = (hash[6] ?? 0) + g;
  hash[7] = (hash[7] ?? 0) + h;
};

/**
 * The SHA-256 digest of bytes: one padded copy, one schedule, and the hash words, whatever the
 * length; the bit length written as two 32-bit words, as a message's bytes fit 2^53.
 *
 * @param message - The bytes.
 * @returns The 32-byte digest.
 */
export const sha256 = (message: Uint8Array): Uint8Array => {
  const padded = new Uint8Array(Math.ceil((message.length + 9) / blockBytes) * blockBytes);
  padded.set(message);
  padded[message.length] = 0x80;
  const high = Math.floor(message.length / 0x20_00_00_00);
  const low = (message.length * 8) >>> 0;
  for (let index = 0; index < 4; index += 1) {
    padded[padded.length - 8 + index] = high >>> (24 - index * 8);
    padded[padded.length - 4 + index] = low >>> (24 - index * 8);
  }

  const hash = Int32Array.from(initialHash);
  const schedule = new Int32Array(64);
  for (let block = 0; block < padded.length; block += blockBytes) {
    scheduleBlock(padded, block, schedule);
    compress(hash, schedule);
  }

  const digest = new Uint8Array(32);
  for (let index = 0; index < 32; index += 1) {
    digest[index] = (hash[index >>> 2] ?? 0) >>> (24 - (index & 3) * 8);
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
 * encoder writes it: written into one buffer of the most bytes the text can take (three a UTF-16
 * code unit), no list grown a byte at a time. Processing's environment is ECMAScript alone, which
 * holds no `TextEncoder`.
 *
 * @param text - The text.
 * @returns Its bytes.
 */
export const utf8Bytes = (text: string): Uint8Array => {
  const bytes = new Uint8Array(text.length * 3);
  let at = 0;
  for (let index = 0; index < text.length; index += 1) {
    const read = text.codePointAt(index) ?? 0;
    if (read > 0xff_ff) {
      index += 1;
    }

    const point = read >= 0xd8_00 && read < 0xe0_00 ? 0xff_fd : read;
    if (point < 0x80) {
      bytes[at] = point;
      at += 1;
    } else if (point < 0x8_00) {
      bytes[at] = 0xc0 | (point >> 6);
      bytes[at + 1] = 0x80 | (point & 0x3f);
      at += 2;
    } else if (point < 0x1_00_00) {
      bytes[at] = 0xe0 | (point >> 12);
      bytes[at + 1] = 0x80 | ((point >> 6) & 0x3f);
      bytes[at + 2] = 0x80 | (point & 0x3f);
      at += 3;
    } else {
      bytes[at] = 0xf0 | (point >> 18);
      bytes[at + 1] = 0x80 | ((point >> 12) & 0x3f);
      bytes[at + 2] = 0x80 | ((point >> 6) & 0x3f);
      bytes[at + 3] = 0x80 | (point & 0x3f);
      at += 4;
    }
  }

  return bytes.subarray(0, at);
};

/**
 * Bytes as lowercase hexadecimal digits, two a byte.
 *
 * @param bytes - The bytes.
 * @returns The digits.
 */
export const hexOf = (bytes: Uint8Array): string => {
  let digits = "";
  for (const byte of bytes) {
    digits += (byte < 16 ? "0" : "") + byte.toString(16);
  }

  return digits;
};
