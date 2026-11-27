/**
 * The package's own ZIP reader: `readZip` lists a `.zip` file's entries as paths and bytes, over
 * `node:zlib`, with no dependency (the phase-4 spec's 4.13, Q7).
 *
 * The central directory is the truth for names, sizes, CRC-32 values and methods; the local
 * headers are read only to find where each entry's data starts, so an entry that carries a data
 * descriptor needs no special path. The sizes the central directory declares are checked against
 * budgets before any entry is inflated, so an archive that expands past them is refused at the cost
 * of reading its directory.
 */
import { regex } from "arkregex";
import { crc32, deflateRawSync, inflateRawSync } from "node:zlib";
import { Array as Arr, Effect, FileSystem, Option, Schema } from "effect";
import type { PlatformError } from "effect";

/**
 * The most central records a package's zip may hold, directory entries included. pantry's zip
 * reader refuses an archive past it from its central directory, before any entry is inflated, so a
 * hostile archive of millions of empty entries costs the importer what reading its directory does.
 *
 * @limitKind provisional
 * @owner pantry's zip reader (src/package/zip.ts, packageBudget)
 * @unit central records
 * @scope each package's zip pantry reads: its central directory's records
 * @guards a hostile archive's central directory of millions of records makes the importer allocate and judge a record
 *   for each before any refusal
 * @measure with the corpus witness (QTI_PIE_CORPUS=1, pantry's src/cli.corpus.db.test.ts), record the most entries any
 *   package of 1EdTech's corpus and of the QTI database holds (the corpus's largest has 99), time listing an archive
 *   of 10^3 to 10^6 empty entries on cassowary, and keep the largest count whose listing stays a small share of one
 *   import
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const zipEntriesMax = 10_000;

/**
 * The most bytes one file of a package's zip may declare uncompressed. pantry's zip reader refuses
 * the archive from its central directory, before the file is inflated.
 *
 * @limitKind provisional
 * @owner pantry's zip reader (src/package/zip.ts, packageBudget)
 * @unit bytes
 * @scope each file of each package's zip pantry reads, by the uncompressed size its central record declares
 * @guards a hostile archive's one entry declared and inflated to gigabytes takes the importer's memory, since an entry
 *   is inflated whole
 * @measure record the largest file of every package the corpus witness and the QTI database hold (the corpus's largest
 *   is 5,251,725 bytes), and the importer's peak memory reading an entry of 16, 64 and 256 MiB on cassowary; keep the
 *   size whose peak stays within one serverless function's memory with the rest of an import
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const zipEntryBytesMax = 64 * 1024 * 1024;

/**
 * The most bytes the files of one package's zip may declare uncompressed, summed. pantry's zip
 * reader refuses the archive from its central directory, before any file is inflated.
 *
 * @limitKind provisional
 * @owner pantry's zip reader (src/package/zip.ts, packageBudget)
 * @unit bytes
 * @scope each package's zip pantry reads: the uncompressed sizes its central records declare, summed
 * @guards a hostile archive of many files each within the entry bound inflates, in all, past the importer's memory
 * @measure record the largest package the corpus witness and the QTI database hold (the corpus's largest is 11,018,253
 *   bytes), and the importer's peak memory importing packages of 64, 256 and 1,024 MiB on cassowary; keep the size
 *   whose import stays within one serverless function's memory
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const zipPackageBytesMax = 256 * 1024 * 1024;

/**
 * How many times its stored size one file of a package's zip may declare uncompressed, once past
 * {@link zipRatioAllowanceBytes}. pantry's zip reader refuses the archive from its central
 * directory, before the file is inflated: deflate alone reaches about 1,032 times, which only a
 * zip bomb approaches.
 *
 * @limitKind provisional
 * @owner pantry's zip reader (src/package/zip.ts, packageBudget)
 * @unit times the stored size
 * @scope each file of each package's zip pantry reads: its declared uncompressed size over its stored size, once past
 *   the allowance
 * @guards a zip bomb's small stored entry declares a ratio deflate allows (about 1,032) and inflates past what its
 *   stored size suggests, within the byte bounds but at a cost the archive's size hides
 * @measure record the highest ratio of every entry of 64 KiB or more the corpus witness and the QTI database hold (the
 *   corpus's is 3.61, and 27.95 for a 6,148-byte .DS_Store), and keep the smallest ratio with an order of magnitude
 *   over it
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const zipRatioMax = 100;

/**
 * The bytes any file of a package's zip may declare uncompressed whatever its stored size, so a
 * small, well-compressed file is not refused for its ratio ({@link zipRatioMax}).
 *
 * @limitKind provisional
 * @owner pantry's zip reader (src/package/zip.ts, packageBudget)
 * @unit bytes
 * @scope each file of each package's zip pantry reads: the declared uncompressed bytes below which its ratio is not
 *   checked
 * @guards without an allowance, the ratio bound refuses a small file that compresses well (a 6,148-byte .DS_Store at
 *   27.95), and with too large a one, a zip bomb's entries pass the ratio bound up to it
 * @measure record the largest highly compressible file (ratio over 10) the corpus witness and the QTI database hold,
 *   and keep the smallest power of two above it
 * @origin written in qti-pie before it moved into edullm, and carried in with it (f66ecbbd8, 2026-11-13), with no
 *   evidence
 * @recorded 2026-11-16
 */
const zipRatioAllowanceBytes = 1024 * 1024;

/**
 * A zip archive cannot be read as a package, under the named rule.
 *
 * `entry` is the archive entry concerned and `feature` the part of the format that was refused.
 * A refusal about the archive as a whole names the zip file in `entry`.
 */
export class ZipRefusal extends Schema.TaggedError<ZipRefusal>()("ZipRefusal", {
  entry: Schema.String,
  feature: Schema.String,
  rule: Schema.Literals(["manifest-root", "href-path", "zip-format"]),
}) {
  /**
   * What was refused, in one sentence.
   */
  override get message(): string {
    return `The zip entry ${this.entry} was refused under the ${this.rule} rule: ${this.feature}`;
  }
}

/**
 * One file of a zip archive: its path and its uncompressed bytes.
 */
export interface ZipEntry {
  readonly bytes: Uint8Array;
  readonly path: string;
}

/**
 * The file name that marks an archive as a QTI package, looked for at the archive root only.
 */
const MANIFEST = "imsmanifest.xml";

/**
 * The end-of-central-directory record's signature, `PK\x05\x06`, as a little-endian number.
 */
const END_SIGNATURE = 0x06_05_4b_50;

/**
 * The central directory file header's signature, `PK\x01\x02`.
 */
const CENTRAL_SIGNATURE = 0x02_01_4b_50;

/**
 * The local file header's signature, `PK\x03\x04`.
 */
const LOCAL_SIGNATURE = 0x04_03_4b_50;

/**
 * The ZIP64 end-of-central-directory locator's signature, `PK\x06\x07`.
 */
const ZIP64_LOCATOR_SIGNATURE = 0x07_06_4b_50;

/**
 * The ZIP64 end-of-central-directory record's signature, `PK\x06\x06`.
 */
const ZIP64_RECORD_SIGNATURE = 0x06_06_4b_50;

/**
 * The fixed length of the end record, the locator, a central header and a local header.
 */
const END_LENGTH = 22;

const LOCATOR_LENGTH = 20;

const CENTRAL_LENGTH = 46;

const LOCAL_LENGTH = 30;

/**
 * The longest comment the end record can carry, which bounds how far back its signature is sought.
 */
const MAX_COMMENT = 0xff_ff;

/**
 * The value a 32-bit size or offset field holds when the real value is in a ZIP64 record.
 */
const ZIP64_MARKER = 0xff_ff_ff_ff;

/**
 * General-purpose flag bit 0: the entry is encrypted.
 */
const FLAG_ENCRYPTED = 0x1;

/**
 * General-purpose flag bit 6: strong encryption.
 */
const FLAG_STRONG_ENCRYPTION = 0x40;

/**
 * General-purpose flag bit 11: the name and comment are UTF-8.
 */
const FLAG_UTF8 = 0x8_00;

/**
 * The compression methods read: 0 stores, 8 deflates (RFC 1951).
 */
const METHOD_STORED = 0;

const METHOD_DEFLATE = 8;

/**
 * How an entry the reader reads is compressed, by its method's number: the two methods read, and
 * no other, so a record holds one of them once {@link readRecord} has read it.
 */
const compressions: ReadonlyMap<number, CentralRecord["compression"]> = new Map([
  [METHOD_STORED, "stored"],
  [METHOD_DEFLATE, "deflated"],
]);

/**
 * The MS-DOS directory attribute (bit 4 of the external attributes' low byte) and the Unix file
 * type of a directory (`S_IFDIR` 0o040000, as the mode's top four bits).
 */
const DOS_DIRECTORY = 0x10;

const UNIX_DIRECTORY_TYPE = 4;

/**
 * The budgets an archive is read under, checked against the central directory's declared sizes
 * before any entry is inflated. They are a parameter of the reader, so a test can draw them small
 * and reach both sides of each bound with a small archive; production reads under
 * {@link packageBudget}.
 */
export interface ZipBudget {
  /**
   * The most bytes one file may declare uncompressed.
   */
  readonly entryBytes: number;
  /**
   * The most central records an archive may hold, directory entries included.
   */
  readonly entries: number;
  /**
   * The most bytes the files of one archive may declare uncompressed, summed.
   */
  readonly packageBytes: number;
  /**
   * How many times its stored size an entry may declare, once past `ratioAllowance`.
   */
  readonly ratio: number;
  /**
   * The bytes any entry may declare whatever its stored size, so a small, well-compressed file is
   * not refused for its ratio.
   */
  readonly ratioAllowance: number;
}

/**
 * The budgets every package is read under, the one place they are set, each a limit of qti-pie's
 * that guards the importer from a hostile archive and each well past what the corpus measures.
 * Entries: {@link zipEntriesMax}, 10,000 records, where the corpus's largest archive has 99. Entry
 * bytes: {@link zipEntryBytesMax}, 64 MiB, where its largest file is 5,251,725 bytes. Package
 * bytes: {@link zipPackageBytesMax}, 256 MiB, where its largest package is 11,018,253 bytes. Ratio:
 * {@link zipRatioMax}, 100, past {@link zipRatioAllowanceBytes}, 1 MiB, where its highest ratio is
 * 27.95 (a 6,148-byte `.DS_Store`) and 3.61 for any entry of 64 KiB or more, and deflate itself
 * reaches about 1,032.
 */
export const packageBudget: ZipBudget = {
  entries: zipEntriesMax,
  entryBytes: zipEntryBytesMax,
  packageBytes: zipPackageBytesMax,
  ratio: zipRatioMax,
  ratioAllowance: zipRatioAllowanceBytes,
};

/**
 * The upper half (0x80 to 0xFF) of code page 437, transcribed from the ZIP APPNOTE (version 6.3.10,
 * Appendix D, section D.1, "Code Page 437"), one character per byte in order. The lower half is
 * ASCII, so a name's bytes below 0x80 are their own code points.
 */
const CP437_HIGH =
  "ÇüéâäàåçêëèïîìÄÅ" +
  "ÉæÆôöòûùÿÖÜ¢£¥₧ƒ" +
  "áíóúñÑªº¿⌐¬½¼¡«»" +
  "░▒▓│┤╡╢╖╕╣║╗╝╜╛┐" +
  "└┴┬├─┼╞╟╚╔╩╦╠═╬╧" +
  "╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀" +
  "αßΓπΣσµτΦΘΩδ∞φε∩" +
  "≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ";

/**
 * One byte's character in code page 437: ASCII below 0x80, {@link CP437_HIGH}'s from 0x80. Each of
 * its characters is one BMP code point, one UTF-16 unit, so the byte's offset in it is its index.
 *
 * @param byte - A byte, 0 to 0xFF.
 * @returns The byte's character.
 */
const cp437Of = (byte: number): string =>
  byte < 0x80 ? String.fromCodePoint(byte) : CP437_HIGH.charAt(byte - 0x80);

/**
 * What the central directory says about one entry.
 */
interface CentralRecord {
  readonly compression: "deflated" | "stored";
  readonly crc: number;
  readonly directory: boolean;
  readonly name: string;
  readonly offset: number;
  readonly size: number;
  readonly storedSize: number;
}

/**
 * Where the central directory is, from the end record.
 */
interface Directory {
  readonly count: number;
  readonly end: number;
  readonly offset: number;
}

/**
 * Where one entry's stored bytes lie: from `start`, after its local header, to `end`.
 */
interface Span {
  readonly end: number;
  readonly start: number;
}

/**
 * A file's record with the span its local header places its stored bytes at.
 */
interface Placed {
  readonly record: CentralRecord;
  readonly span: Span;
}

/**
 * Whether a flag bit is set, without a bitwise operator.
 *
 * @param flags - The flag field.
 * @param bit - One power of two.
 * @returns Whether `flags` has `bit`.
 */
const hasFlag = (flags: number, bit: number): boolean => Math.floor(flags / bit) % 2 === 1;

/**
 * Decode an entry's name: UTF-8 when general-purpose bit 11 is set, otherwise code page 437, which
 * has a character for each of the 256 byte values.
 *
 * @param bytes - The name's bytes.
 * @param flags - The entry's general-purpose flags.
 * @returns The name.
 */
const decodeName = (bytes: Uint8Array, flags: number): string =>
  hasFlag(flags, FLAG_UTF8)
    ? new TextDecoder("utf-8").decode(bytes)
    : Array.from(bytes, (byte) => cp437Of(byte)).join("");

/**
 * Why a path cannot be a package entry's path, or none when it can: the one rule a zip's entry
 * names and a package directory's file paths are both held to (reading `entry-path-backslash`).
 *
 * The ZIP format's stored path "MUST NOT contain a drive or device letter, or a leading slash", and
 * its slashes "MUST be forward slashes" (APPNOTE 6.3.10, section 4.4.17.1); a manifest names an
 * entry by an RFC 3986 URI reference, which holds no `\` and in which a leading `C:` is a scheme.
 * So a path that is absolute, begins with a drive prefix, holds a backslash or a `..` segment names
 * no entry, whichever form the package takes.
 *
 * @param name - A decoded entry name, or a file's path relative to the package directory.
 * @returns The refused feature, as a sentence fragment, or none.
 * @see {@link https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT | APPNOTE 6.3.10, section 4.4.17.1}
 */
export const unsafeEntryPath = (name: string): Option.Option<string> => {
  if (name.startsWith("/") || regex("^[A-Za-z]:", "u").test(name)) {
    return Option.some(
      "the name is an absolute path, and a package entry's path is relative to the package root",
    );
  }

  if (name.includes("\\")) {
    return Option.some(
      "the name holds a backslash, which a package path does not use as a separator",
    );
  }

  return name.split("/").includes("..")
    ? Option.some("the name holds a .. segment, which would leave the package root")
    : Option.none();
};

/**
 * Fail with a {@link ZipRefusal}.
 *
 * @param rule - The rule refused under.
 * @param entry - The entry concerned, or the zip file for the archive as a whole.
 * @param feature - What was refused.
 * @returns A failed effect.
 */
const refuse = (
  rule: ZipRefusal["rule"],
  entry: string,
  feature: string,
): Effect.Effect<never, ZipRefusal> => Effect.fail(new ZipRefusal({ entry, feature, rule }));

/**
 * Whether an entry is a directory: a name ending `/`, the MS-DOS directory attribute, or a
 * Unix directory mode when the entry was made on Unix.
 *
 * @param name - The decoded name.
 * @param versionMadeBy - The central header's version-made-by field.
 * @param attributes - The external file attributes.
 * @returns Whether the entry is a directory.
 */
const isDirectory = (name: string, versionMadeBy: number, attributes: number): boolean => {
  const unixMode = Math.floor(attributes / 0x1_00_00);
  const madeOnUnix = Math.floor(versionMadeBy / 0x1_00) === 3;

  return (
    name.endsWith("/") ||
    hasFlag(attributes, DOS_DIRECTORY) ||
    (madeOnUnix && Math.floor(unixMode / 0x10_00) === UNIX_DIRECTORY_TYPE)
  );
};

/**
 * Find the end record: the last offset, no further from the file's end than the longest comment,
 * where the record's signature starts a record whose comment ends within the file.
 *
 * @param view - The whole file.
 * @returns The end record's offset, or none where the file holds no end record.
 */
const endRecordAt = (view: DataView): Option.Option<number> => {
  const length = view.byteLength;

  for (let at = length - END_LENGTH; at >= 0 && at >= length - END_LENGTH - MAX_COMMENT; at -= 1) {
    if (
      view.getUint32(at, true) === END_SIGNATURE &&
      at + END_LENGTH + view.getUint16(at + 20, true) <= length
    ) {
      return Option.some(at);
    }
  }

  return Option.none();
};

/**
 * Find the end record and the central directory it points at.
 *
 * The central directory must end exactly where the end record begins: APPNOTE's overall layout
 * places nothing between them but the ZIP64 records (section 4.3.6, reading
 * `zip-central-directory`), which are not read and are refused first, so the directory's own offset
 * and size (sections 4.4.23 and 4.4.24) name the end record's offset, and an archive with other
 * bytes in that gap is not a zip.
 *
 * @param archive - The zip file's path, naming refusals.
 * @param view - The whole file.
 * @returns Where the central directory is, or a {@link ZipRefusal} for a file that is not a zip, is
 *   split across disks, uses ZIP64, or holds bytes between its central directory and its end
 *   record.
 * @see {@link https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT | APPNOTE 6.3.10, sections 4.3.6, 4.4.23 and 4.4.24}
 */
const locateDirectory = Effect.fn("package.locateDirectory")(function* locateDirectory(
  archive: string,
  view: DataView,
): Effect.fn.Return<Directory, ZipRefusal> {
  const malformed = (feature: string) => refuse("zip-format", archive, feature);
  const found = endRecordAt(view);

  if (Option.isNone(found)) {
    return yield* malformed(
      "the file is not a zip archive: it has no end-of-central-directory record",
    );
  }

  const end = found.value;
  const count = view.getUint16(end + 10, true);
  const size = view.getUint32(end + 12, true);
  const offset = view.getUint32(end + 16, true);
  const zip64 =
    (end >= LOCATOR_LENGTH &&
      view.getUint32(end - LOCATOR_LENGTH, true) === ZIP64_LOCATOR_SIGNATURE) ||
    (offset + size + 4 <= end && view.getUint32(offset + size, true) === ZIP64_RECORD_SIGNATURE) ||
    count === 0xff_ff ||
    size === ZIP64_MARKER ||
    offset === ZIP64_MARKER;

  if (zip64) {
    return yield* malformed(
      "the archive uses ZIP64, which is not read: it has a ZIP64 end-of-central-directory locator or record",
    );
  }

  if (view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0) {
    return yield* malformed(
      "the archive is split across disks, and only a single-file archive is read",
    );
  }

  if (offset + size !== end) {
    return yield* malformed(
      offset + size > end
        ? "the central directory does not parse: it runs past the end record"
        : "the central directory does not parse: bytes stand between it and the end record",
    );
  }

  return { count, end, offset };
});

/**
 * Read one central directory header and refuse what is not read.
 *
 * @param archive - The zip file's path, naming refusals.
 * @param bytes - The whole file.
 * @param view - The same bytes.
 * @param at - Where the header starts.
 * @param limit - Where the central directory ends.
 * @returns The record and the offset after the header, or a {@link ZipRefusal}.
 */
const readRecord = Effect.fn("package.readRecord")(function* readRecord(
  archive: string,
  bytes: Uint8Array,
  view: DataView,
  at: number,
  limit: number,
): Effect.fn.Return<{ readonly next: number; readonly record: CentralRecord }, ZipRefusal> {
  if (at + CENTRAL_LENGTH > limit || view.getUint32(at, true) !== CENTRAL_SIGNATURE) {
    return yield* refuse(
      "zip-format",
      archive,
      "the central directory does not parse: a file header is missing or cut short",
    );
  }

  const flags = view.getUint16(at + 8, true);
  const nameLength = view.getUint16(at + 28, true);
  const next =
    at +
    CENTRAL_LENGTH +
    nameLength +
    view.getUint16(at + 30, true) +
    view.getUint16(at + 32, true);

  if (next > limit) {
    return yield* refuse(
      "zip-format",
      archive,
      "the central directory does not parse: a file header runs past the end",
    );
  }

  const name = decodeName(
    bytes.subarray(at + CENTRAL_LENGTH, at + CENTRAL_LENGTH + nameLength),
    flags,
  );
  const storedSize = view.getUint32(at + 20, true);
  const size = view.getUint32(at + 24, true);
  const offset = view.getUint32(at + 42, true);
  const method = view.getUint16(at + 10, true);
  const compression = compressions.get(method);

  if (storedSize === ZIP64_MARKER || size === ZIP64_MARKER || offset === ZIP64_MARKER) {
    return yield* refuse(
      "zip-format",
      name,
      "the entry's size or offset is 0xFFFFFFFF, so it lives in a ZIP64 record, which is not read",
    );
  }

  if (hasFlag(flags, FLAG_ENCRYPTED) || hasFlag(flags, FLAG_STRONG_ENCRYPTION)) {
    return yield* refuse(
      "zip-format",
      name,
      "the entry is encrypted, and an encrypted entry is not read",
    );
  }

  if (compression === undefined) {
    return yield* refuse(
      "zip-format",
      name,
      `compression method ${method} is not read: an entry is stored or deflated (RFC 1951)`,
    );
  }

  const unsafe = unsafeEntryPath(name);

  if (Option.isSome(unsafe)) {
    return yield* refuse("href-path", name, unsafe.value);
  }

  return {
    next,
    record: {
      compression,
      crc: view.getUint32(at + 16, true),
      directory: isDirectory(name, view.getUint16(at + 4, true), view.getUint32(at + 38, true)),
      name,
      offset,
      size,
      storedSize,
    },
  };
});

/**
 * Compare two names by UTF-16 code unit.
 *
 * @param left - One name.
 * @param right - Another.
 * @returns A negative number, zero or a positive number.
 */
const byName = (left: CentralRecord, right: CentralRecord): number => {
  if (left.name === right.name) {
    return 0;
  }

  return left.name < right.name ? -1 : 1;
};

/**
 * Check a sorted file listing for a duplicate name and for the manifest at the root.
 *
 * @param files - The non-directory records, sorted by name.
 * @returns Nothing, or a {@link ZipRefusal}.
 */
const checkListing = Effect.fn("package.checkListing")(function* checkListing(
  files: readonly CentralRecord[],
): Effect.fn.Return<void, ZipRefusal> {
  const duplicate = files.find(
    (record, index) => index > 0 && files[index - 1]?.name === record.name,
  );

  if (duplicate?.name === MANIFEST) {
    yield* refuse("manifest-root", MANIFEST, "the archive has more than one imsmanifest.xml");
  }

  if (duplicate !== undefined) {
    yield* refuse("zip-format", duplicate.name, "the archive holds two entries with this name");
  }

  if (!files.some((record) => record.name === MANIFEST)) {
    yield* refuse(
      "manifest-root",
      MANIFEST,
      "the archive has no imsmanifest.xml at its root, and a package keeps its manifest in its top directory",
    );
  }
});

/**
 * Where one file's data lies in the archive, from its local header.
 *
 * @param view - The whole file.
 * @param record - The entry's central directory record.
 * @param limit - Where the central directory starts; no entry's data may reach it.
 * @returns The data's `start` and the `end` of the entry's stored bytes, or a {@link ZipRefusal}.
 */
const dataSpan = Effect.fn("package.dataSpan")(function* dataSpan(
  view: DataView,
  record: CentralRecord,
  limit: number,
): Effect.fn.Return<Span, ZipRefusal> {
  const broken = (feature: string) => refuse("zip-format", record.name, feature);

  if (
    record.offset + LOCAL_LENGTH > limit ||
    view.getUint32(record.offset, true) !== LOCAL_SIGNATURE
  ) {
    return yield* broken("its local header does not parse");
  }

  const start =
    record.offset +
    LOCAL_LENGTH +
    view.getUint16(record.offset + 26, true) +
    view.getUint16(record.offset + 28, true);

  if (start + record.storedSize > limit) {
    return yield* broken("its data runs past the central directory");
  }

  return { end: start + record.storedSize, start };
});

/**
 * Refuse a listing whose declared sizes pass a budget, before any entry is read.
 *
 * The first file past the entry budget is refused, then the first past its ratio bound, then a sum
 * past the package budget.
 *
 * @param archive - The zip file's path, which names the refusal about the whole archive.
 * @param files - The non-directory records.
 * @param budget - The budgets read under.
 * @returns Nothing, or a {@link ZipRefusal}.
 */
const checkBudget = Effect.fn("package.checkBudget")(function* checkBudget(
  archive: string,
  files: readonly CentralRecord[],
  budget: ZipBudget,
): Effect.fn.Return<void, ZipRefusal> {
  const large = files.find((record) => record.size > budget.entryBytes);

  if (large !== undefined) {
    yield* refuse(
      "zip-format",
      large.name,
      `it declares ${large.size} bytes for one entry, past the limit of ${budget.entryBytes}`,
    );
  }

  const ratio = files.find(
    (record) => record.size > Math.max(budget.ratioAllowance, budget.ratio * record.storedSize),
  );

  if (ratio !== undefined) {
    yield* refuse(
      "zip-format",
      ratio.name,
      `it declares ${ratio.size} bytes from ${ratio.storedSize} stored, more than ${budget.ratio} times its stored size and past ${budget.ratioAllowance} bytes`,
    );
  }

  const total = files.reduce((sum, record) => sum + record.size, 0);

  if (total > budget.packageBytes) {
    yield* refuse(
      "zip-format",
      archive,
      `the files declare ${total} bytes for one package, past the limit of ${budget.packageBytes}`,
    );
  }
});

/**
 * Refuse files whose stored ranges overlap, before any entry is read.
 *
 * A range runs from the local header to the end of the stored data, so two records naming one
 * local entry overlap, and so does a record that points into another's data. A data descriptor
 * lies after the range.
 *
 * The ranges are walked by offset alone. Records of one offset keep the order `files` gives them,
 * by name, because `toSorted` is stable (ECMA-262 has required `Array.prototype.sort` to be stable
 * since ES2019, and `toSorted` sorts as it does), so which record a refusal names is fixed without
 * a tiebreak.
 *
 * @param view - The whole file.
 * @param files - The non-directory records, sorted by name, no two of one name.
 * @param limit - Where the central directory starts.
 * @returns Each file with its span, in the order of `files`, or a {@link ZipRefusal}.
 */
const checkSpans = Effect.fn("package.checkSpans")(function* checkSpans(
  view: DataView,
  files: readonly CentralRecord[],
  limit: number,
): Effect.fn.Return<readonly Placed[], ZipRefusal> {
  const placed = yield* Effect.all(
    files.map((record) =>
      Effect.map(dataSpan(view, record, limit), (span): Placed => ({ record, span })),
    ),
  );
  const ordered = placed.toSorted((left, right) => left.record.offset - right.record.offset);
  const overlap = Arr.zip(ordered, ordered.slice(1)).find(
    ([previous, { record }]) => record.offset < previous.span.end,
  );

  if (overlap !== undefined) {
    const [previous, { record }] = overlap;

    yield* refuse(
      "zip-format",
      record.name,
      `its range overlaps the data of ${previous.record.name}, so two entries would share bytes`,
    );
  }

  return placed;
});

/**
 * Read one entry's bytes and verify its CRC-32.
 *
 * @param bytes - The whole file.
 * @param record - The entry's central directory record.
 * @param span - Where the entry's stored bytes lie.
 * @param remaining - How many bytes of the package's budget are left; the inflate stops there.
 * @returns The uncompressed bytes, or a {@link ZipRefusal}.
 */
const readData = Effect.fn("package.readData")(function* readData(
  bytes: Uint8Array,
  record: CentralRecord,
  span: Span,
  remaining: number,
): Effect.fn.Return<Uint8Array, ZipRefusal> {
  const broken = (feature: string) => refuse("zip-format", record.name, feature);

  const stored = bytes.subarray(span.start, span.end);

  if (record.compression === "stored" && record.storedSize !== record.size) {
    return yield* broken("its stored size and its size differ");
  }

  const data =
    record.compression === "stored"
      ? new Uint8Array(stored)
      : yield* Effect.try({
          catch: () =>
            new ZipRefusal({
              entry: record.name,
              feature: "its deflated data does not inflate",
              rule: "zip-format",
            }),
          try: () => {
            const inflated = inflateRawSync(stored, {
              maxOutputLength: Math.max(Math.min(record.size, remaining), 1),
            });

            return new Uint8Array(inflated.buffer, inflated.byteOffset, inflated.byteLength);
          },
        });

  if (data.length !== record.size) {
    return yield* broken("its data does not have the size the central directory gives");
  }

  if (crc32(data) !== record.crc) {
    return yield* broken("its CRC-32 does not match its data, so the archive is corrupt");
  }

  return data;
});

/**
 * Parse an archive and return every file's bytes.
 *
 * @param archive - The zip file's path, which names archive-level refusals.
 * @param bytes - The whole file.
 * @returns The listing sorted by path, or a {@link ZipRefusal}.
 */
const parseZip = Effect.fn("package.parseZip")(function* parseZip(
  archive: string,
  bytes: Uint8Array,
  budget: ZipBudget,
): Effect.fn.Return<readonly ZipEntry[], ZipRefusal> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const { count, end, offset } = yield* locateDirectory(archive, view);

  if (count > budget.entries) {
    yield* refuse(
      "zip-format",
      archive,
      `the archive has ${count} entries, past the limit of ${budget.entries}`,
    );
  }

  const records: CentralRecord[] = [];
  let at = offset;

  for (let index = 0; index < count; index += 1) {
    const read = yield* readRecord(archive, bytes, view, at, end);

    records.push(read.record);
    at = read.next;
  }

  const files = records.filter((record) => !record.directory).toSorted(byName);

  yield* checkListing(files);

  yield* checkBudget(archive, files, budget);

  const placed = yield* checkSpans(view, files, offset);
  const entries: ZipEntry[] = [];
  let remaining = budget.packageBytes;

  for (const { record, span } of placed) {
    const data = yield* readData(bytes, record, span, remaining);

    remaining -= data.length;
    entries.push({ bytes: data, path: record.name });
  }

  return entries;
});

/**
 * Read a zip file's entries.
 *
 * Names are UTF-8 when the entry's bit 11 is set and code page 437 otherwise. Directory entries are
 * dropped. Stored and deflated entries are read, and every entry's CRC-32 is checked against the
 * central directory. The listing is sorted by UTF-16 code unit, so it is the same on every host.
 *
 * @param path - The zip file.
 * @param budget - The budgets read under: {@link packageBudget} for a package.
 * @returns The files as {@link ZipEntry} values. A {@link ZipRefusal} names the entry and the
 *   feature: `zip-format` for another method, encryption, ZIP64, an archive that does not parse, a
 *   CRC-32 mismatch, more records than the budget's `entries`, a file declaring more than its
 *   `entryBytes` or more than `ratio` times its stored size past `ratioAllowance`, files declaring
 *   more than `packageBytes` between them, or two files whose stored ranges overlap; `href-path`
 *   for an absolute name or one with a `..` segment or a backslash; `manifest-root` for no
 *   `imsmanifest.xml` at the root or two of them. A missing file is a `PlatformError`.
 */
export const readZip = Effect.fn("package.readZip")(function* readZip(
  path: string,
  budget: ZipBudget,
): Effect.fn.Return<
  readonly ZipEntry[],
  ZipRefusal | PlatformError.PlatformError,
  FileSystem.FileSystem
> {
  const fs = yield* FileSystem.FileSystem;

  return yield* parseZip(path, yield* fs.readFile(path), budget);
});

/**
 * Entries shorter than this many bytes are stored, because deflate would not make them smaller.
 */
const STORE_BELOW = 64;

/**
 * The version needed to extract and the version made by: 2.0, the level deflate requires, with
 * the MS-DOS host byte 0 so no Unix mode is implied.
 */
const VERSION = 20;

/**
 * The fixed DOS timestamp of every written entry: 1980-01-01 00:00:00. The date packs
 * `(year - 1980) << 9 | month << 5 | day`, which is month 1, day 1 here.
 */
const DOS_DATE = 0x00_21;

const DOS_TIME = 0;

/**
 * One entry as written: its name, its data and the facts both headers repeat.
 */
interface WrittenEntry {
  readonly crc: number;
  readonly data: Uint8Array;
  readonly method: number;
  readonly name: Uint8Array;
  readonly offset: number;
  readonly size: number;
}

/**
 * The fields both headers share, from the version to the name length: `version`, flags, method,
 * time, date, CRC-32, stored size, size and name length, 24 bytes in all.
 *
 * @param entry - The entry written.
 * @returns The shared fields, little-endian.
 */
const sharedFields = (entry: WrittenEntry): Uint8Array => {
  const fields = new Uint8Array(24);
  const view = new DataView(fields.buffer);

  view.setUint16(0, VERSION, true);
  view.setUint16(2, FLAG_UTF8, true);
  view.setUint16(4, entry.method, true);
  view.setUint16(6, DOS_TIME, true);
  view.setUint16(8, DOS_DATE, true);
  view.setUint32(10, entry.crc, true);
  view.setUint32(14, entry.data.length, true);
  view.setUint32(18, entry.size, true);
  view.setUint16(22, entry.name.length, true);

  return fields;
};

/**
 * A 4-byte little-endian signature.
 *
 * @param signature - The signature as a number.
 * @returns Its bytes.
 */
const signatureBytes = (signature: number): Uint8Array => {
  const bytes = new Uint8Array(4);

  new DataView(bytes.buffer).setUint32(0, signature, true);

  return bytes;
};

/**
 * Write entries as a zip archive that {@link readZip} admits.
 *
 * Each entry is deflated (RFC 1951), or stored when it is under 64 bytes, in the order given. The
 * archive has local headers, a central directory and an end record, no directory entries and no
 * comments, UTF-8 names with general-purpose bit 11, and a fixed DOS timestamp of 1980-01-01
 * 00:00:00, so the same entries give the same bytes. A central record's comment length, disk
 * number, internal attributes and external attributes are zero; only its local header's offset is
 * set. The container is not part of what a round trip compares: the entries are.
 *
 * It does not check the archive against the reader's caps or write ZIP64, so more than 65,535
 * entries or 4 GiB are outside it.
 *
 * @param entries - The files, in the order written.
 * @returns The archive.
 */
export const writeZip = (entries: readonly ZipEntry[]): Uint8Array => {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const written: WrittenEntry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const deflate = entry.bytes.length >= STORE_BELOW;
    const data = deflate ? new Uint8Array(deflateRawSync(entry.bytes)) : entry.bytes;
    const record: WrittenEntry = {
      crc: crc32(entry.bytes),
      data,
      method: deflate ? METHOD_DEFLATE : METHOD_STORED,
      name: encoder.encode(entry.path),
      offset,
      size: entry.bytes.length,
    };
    const extra = new Uint8Array(2);

    parts.push(signatureBytes(LOCAL_SIGNATURE), sharedFields(record), extra, record.name, data);
    offset += 4 + 24 + extra.length + record.name.length + data.length;
    written.push(record);
  }

  const directoryOffset = offset;

  for (const record of written) {
    const tail = new Uint8Array(14);
    const view = new DataView(tail.buffer);

    view.setUint32(10, record.offset, true);
    parts.push(
      signatureBytes(CENTRAL_SIGNATURE),
      new Uint8Array([VERSION, 0]),
      sharedFields(record),
      new Uint8Array(2),
      tail,
      record.name,
    );
    offset += CENTRAL_LENGTH + record.name.length;
  }

  const end = new Uint8Array(END_LENGTH - 4);
  const endView = new DataView(end.buffer);

  endView.setUint16(4, written.length, true);
  endView.setUint16(6, written.length, true);
  endView.setUint32(8, offset - directoryOffset, true);
  endView.setUint32(12, directoryOffset, true);
  parts.push(signatureBytes(END_SIGNATURE), end);

  return Buffer.concat(parts);
};
