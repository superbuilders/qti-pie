/**
 * The charsets crust's writer encodes, as IANA's Character Sets registry records them
 * (https://www.iana.org/assignments/character-sets/, last updated 2026-10-02): the domain the
 * charset suite's boxes are drawn from, never cases a person chose.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";
import { Option } from "effect";
import type { EncoderClass } from "#crust/charset.ts";

/**
 * One charset of the registry: the label a document declares it by, its preferred MIME name
 * where the registry gives one and else its Name; every name the registry gives it, its Name and
 * each Alias as printed, once each; the encoder class crust writes it under; and the highest code
 * point it carries as one byte, by the charset's own definition: ANSI X3.4's 7-bit codes are
 * U+0000 to U+007F and ISO/IEC 8859-1's 8-bit codes U+0000 to U+00FF, and a Unicode encoding form
 * carries every scalar value, so it has none.
 */
export interface RegisteredCharset {
  readonly ceiling: Option.Option<number>;
  readonly class: Exclude<EncoderClass, "decode-only">;
  readonly label: string;
  readonly names: readonly [string, ...string[]];
}

/**
 * The six records, by MIBenum: US-ASCII (3), ISO-8859-1 (4), UTF-8 (106), UTF-16BE (1013),
 * UTF-16LE (1014) and UTF-16 (1015).
 */
export const registeredCharsets = dictionary<RegisteredCharset>([
  {
    ceiling: Option.some(0x7f),
    class: "ascii",
    label: "US-ASCII",
    names: [
      "US-ASCII",
      "iso-ir-6",
      "ANSI_X3.4-1968",
      "ANSI_X3.4-1986",
      "ISO_646.irv:1991",
      "ISO646-US",
      "us",
      "IBM367",
      "cp367",
      "csASCII",
    ],
  },
  {
    ceiling: Option.some(0xff),
    class: "latin1",
    label: "ISO-8859-1",
    names: [
      "ISO_8859-1:1987",
      "iso-ir-100",
      "ISO_8859-1",
      "ISO-8859-1",
      "latin1",
      "l1",
      "IBM819",
      "CP819",
      "csISOLatin1",
    ],
  },
  { ceiling: Option.none(), class: "utf8", label: "UTF-8", names: ["UTF-8", "csUTF8"] },
  {
    ceiling: Option.none(),
    class: "utf16be",
    label: "UTF-16BE",
    names: ["UTF-16BE", "csUTF16BE"],
  },
  {
    ceiling: Option.none(),
    class: "utf16le",
    label: "UTF-16LE",
    names: ["UTF-16LE", "csUTF16LE"],
  },
  { ceiling: Option.none(), class: "utf16", label: "UTF-16", names: ["UTF-16", "csUTF16"] },
]);
