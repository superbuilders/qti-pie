/**
 * One private item builder's draft format, and every file and text of its author's delivery,
 * banned from this repository by construction. Some of the items Alpha delivers were drafted in
 * that builder, whose markup is not QTI: its own data attributes and identifiers, its sidecar
 * fields, the comments it writes into items, its picture markup and package paths, and its
 * renderer's source. What qti-pie reads, renders and scores is QTI 3.0.1, and the drafts' material
 * is semantics only: none of its files or texts is ever used. This suite fails on any file git
 * tracks (or would track) that carries the format, in its content, its path or a symlink's target;
 * that is one of those files, by the SHA-256 deny-list beside it, or holds one as a base64 data:
 * URI; or whose text, or any svg drawing in it, is one of those texts with only its whitespace
 * changed, by the second list beside it.
 *
 * Names private to the builder (its name, its host and its screen kinds) are not written here,
 * not even as digests: the machine that lands qti-pie checks them before every push. Every
 * pattern is written so that its own source matches none of them (a character class splits each
 * token), so this file passes its own scan and needs no exemption.
 *
 * @module
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { regex } from "arkregex";

/**
 * The builder's markup that names nothing private, one alternative an entry, so each is held to
 * a sample of its own: entries that share a `what` name one kind of artefact.
 */
const BANNED: readonly { readonly pattern: RegExp; readonly what: string }[] = [
  { pattern: regex("data[-_]m[t]b[-_]", "iu"), what: "a builder data attribute" },
  {
    pattern: regex("\\b[Mm][t]b(?:[A-Z_]|\\b)", "u"),
    what: "a builder identifier, class or sidecar block",
  },
  { pattern: regex("\\b[Ss]creen_?(?:[Kk]ind|[Ss]pec)\\b", "u"), what: "a builder sidecar field" },
  { pattern: regex("\\bitem_type_d[e]clared\\b", "u"), what: "a builder sidecar field" },
  { pattern: regex("\\bfixed_s[l]ot\\b", "u"), what: "a builder sidecar field" },
  { pattern: regex("\\bb[l]ueprint_versions?(?:_id)?\\b", "u"), what: "a builder sidecar field" },
  {
    pattern: regex('"kind"\\s*:\\s*"scatter"\\s*,\\s*"s[e]ed"', "u"),
    what: "a builder sidecar field",
  },
  { pattern: regex("/b[l]ueprints/(?:K|[0-9]+)/forms/", "u"), what: "a builder URL path" },
  { pattern: regex("<!--\\s*Audio\\s+on\\s+req[u]est:", "u"), what: "a builder comment" },
  { pattern: regex("CUSTOM\\s+INTERACTION\\s+\\(a\\s+b[u]ild", "u"), what: "a builder comment" },
  { pattern: regex("\\b(?:k|g1|g2)item\\b", "u"), what: "the builder renderer's source" },
  { pattern: regex("\\bFormScreen(?:s|Spec)\\b", "u"), what: "the builder renderer's source" },
  { pattern: regex("\\bG[12]Screen(?:s|Spec)?\\b", "u"), what: "the builder renderer's source" },
  { pattern: regex("\\b(?:FORM|G1|G2)_SCREEN", "u"), what: "the builder renderer's source" },
  { pattern: regex("\\brenderer-s[o]urce/", "u"), what: "the builder renderer's source" },
  {
    pattern: regex.as(
      "<img[^>]{0,2048}\\bclass(?:Name)?=[\"'\\\\]{0,2}(?:[^\"'>]{0,256}\\s)?(?:s[t]imulus|o[p]tion)(?=[\"'\\\\\\s/>])",
      "iu",
    ),
    what: "the builder's picture markup or package path",
  },
  {
    pattern: regex(
      'src="[^"]{0,2048}/(?:p[i]cture|o[p]tion_[0-9]+|s[c]reen|r[e]sponse)\\.png"',
      "u",
    ),
    what: "the builder's picture markup or package path",
  },
  {
    pattern: regex("\\bimages(?:-grade-(?:K|[0-9]))?/(?:K|[0-9])/F[0-9]+\\.[0-9]{2}/", "u"),
    what: "the builder's picture markup or package path",
  },
  {
    pattern: regex("\\bimages-g[r]ade-(?:K|[0-9])\\b", "u"),
    what: "the builder's picture markup or package path",
  },
  {
    pattern: regex(
      "(?<=^|/)(?:renderer-s[o]urce|package-c[o]de-and-docs|images-g[r]ade-(?:K|[0-9]))(?:/|$)",
      "mu",
    ),
    what: "a path of the delivery",
  },
];

/**
 * Base64 that is not text: subresource-integrity hashes at their exact lengths (lockfiles) and
 * data: URIs, read as blanks.
 */
const OPAQUE = regex(
  "\\bsha1-[A-Za-z0-9+/]{27}=|\\bsha256-[A-Za-z0-9+/]{43}=|\\bsha384-[A-Za-z0-9+/]{64}|\\bsha512-[A-Za-z0-9+/]{86}==|\\bdata:[\\w/+.-]*(?:;[\\w.+-]+=[^;,\"'\\s]*)*;base64,[A-Za-z0-9+/]+=*",
  "gu",
);

/**
 * The escapes a copy of the markup may hide behind: JSON's and JavaScript's `\u` and `\x`, HTML's
 * numeric and named entities. A backslash before a quote is not read (generated files hold many);
 * the picture-class pattern allows it.
 */
const ESCAPE = regex(
  "\\\\u(?<unicode>[0-9a-fA-F]{4})|\\\\x(?<byte>[0-9a-fA-F]{2})|&#[xX](?<hex>[0-9a-fA-F]{1,6});|&#(?<decimal>[0-9]{1,7});|&(?<named>lt|gt|quot|apos|amp);",
  "gu",
);

/**
 * The characters HTML's named entities stand for.
 */
const NAMED: ReadonlyMap<string, string> = new Map([
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["lt", "<"],
  ["quot", '"'],
]);

/**
 * Read one escape: an ASCII character's as that character, any other as written.
 *
 * @param match The escape, matched by {@link ESCAPE}.
 * @returns What it reads as.
 */
const character = (match: RegExpExecArray): string => {
  const groups = match.groups ?? {};
  const { named } = groups;
  const radix = groups["decimal"] === undefined ? 16 : 10;
  const point = Number.parseInt(
    groups["unicode"] ?? groups["byte"] ?? groups["hex"] ?? groups["decimal"] ?? "-1",
    radix,
  );

  if (named !== undefined) {
    return NAMED.get(named) ?? match[0];
  }

  return point >= 0 && point < 128 ? String.fromCodePoint(point) : match[0];
};

/**
 * Read every escape of an ASCII character as that character, in one pass; other escapes stay as
 * written.
 *
 * @param text A text.
 * @returns The text so read.
 */
const unescaped = (text: string): string => {
  const matches = [...text.matchAll(ESCAPE)];
  const pieces = matches.map((match, at) => {
    const previous = matches[at - 1];
    const from = previous === undefined ? 0 : previous.index + previous[0].length;

    return `${text.slice(from, match.index)}${character(match)}`;
  });
  const last = matches.at(-1);

  return `${pieces.join("")}${text.slice(last === undefined ? 0 : last.index + last[0].length)}`;
};

/**
 * ASCII whitespace, which a reformatted copy of a text or drawing changes and nothing else does.
 */
const WHITESPACE = regex("[ \t\n\r\f\v]+", "gu");

/**
 * The longest text a reformatted copy can be: the delivery's longest text has 398,283 bytes
 * besides whitespace, and a reformatting adds at most three bytes of whitespace to each of them.
 */
const LONGEST_COPY = 4 * 398_283;

/**
 * Read a list of digests beside this suite.
 *
 * @param name The list's file name.
 * @returns The first 16 hex digits of each SHA-256 it holds.
 */
const listed = (name: string): ReadonlySet<string> =>
  new Set(
    readFileSync(path.join(import.meta.dirname, name), "utf-8")
      .split("\n")
      .filter((line) => line !== ""),
  );

/**
 * The first 16 hex digits of the SHA-256 of every file of the delivery (every zip member too).
 */
const DENIED = listed("builder-format.denied-files.sha256");

/**
 * The same of every text file of the delivery and of every svg drawing in them, with all
 * whitespace removed.
 */
const DENIED_TEXT = listed("builder-format.denied-text.sha256");

/**
 * Digest bytes as the lists hold them.
 *
 * @param bytes The bytes.
 * @returns The first 16 hex digits of their SHA-256.
 */
const digest = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex").slice(0, 16);

/**
 * Hold a list of digests beside this suite to its shape: at least as many lines as the delivery's
 * files or texts number, so a truncated list fails, each the first 16 hex digits of a SHA-256, as
 * {@link digest} writes them.
 *
 * @param name The list's name, for the failure.
 * @param list The list, as {@link listed} reads it.
 * @param least The fewest lines the list holds.
 */
const holdsDigests = (name: string, list: ReadonlySet<string>, least: number): void => {
  assert.isAtLeast(list.size, least, `the ${name} list is short`);
  assert.isTrue(
    [...list].every((entry) => regex("^[0-9a-f]{16}$", "u").test(entry)),
    `a ${name} line is not 16 hex digits`,
  );
};

/**
 * Name what of the builder's markup a text carries. Each alternative runs on its own: V8 scans a
 * pattern's literals faster than one alternation of them all.
 *
 * @param text A file's text, one of its lines, a path or a symlink's target.
 * @returns What it carries, once per kind of artefact.
 */
const offences = (text: string): readonly string[] => {
  const blanked =
    text.includes("sha") || text.includes("base64,") ? text.replaceAll(OPAQUE, " ") : text;
  const readable = regex("\\\\[ux][0-9a-fA-F]|&(?:#|lt;|gt;|quot;|apos;|amp;)", "u").test(blanked)
    ? unescaped(blanked)
    : blanked;

  return [
    ...new Set(BANNED.filter(({ pattern }) => pattern.test(readable)).map(({ what }) => what)),
  ];
};

/**
 * Name whether bytes are a file of the delivery, or their text holds one as a base64 data: URI.
 *
 * @param bytes A file's bytes.
 * @param text Its text, empty for a binary file.
 * @param denied The deny-list's digests, {@link DENIED} for the tracked files.
 * @returns What it is, if anything.
 */
const delivered = (bytes: Buffer, text: string, denied: ReadonlySet<string>): readonly string[] => {
  const found = denied.has(digest(bytes)) ? ["a file of the delivery"] : [];

  if (!text.includes("base64,")) {
    return found;
  }

  const uris = text.matchAll(
    regex(
      "\\bdata:[\\w/+.-]*(?:;[\\w.+-]+=[^;,\"'\\s]*)*;base64,(?<payload>[A-Za-z0-9+/]+=*)",
      "gu",
    ),
  );

  return [...uris].some(({ groups }) =>
    denied.has(digest(Buffer.from(groups?.["payload"] ?? "", "base64"))),
  )
    ? [...found, "a file of the delivery as a data: URI"]
    : found;
};

/**
 * A text with all its whitespace removed, as the second list digests it.
 *
 * @param part A text.
 * @returns Its bytes without whitespace.
 */
const flat = (part: string): Buffer => Buffer.from(part.replaceAll(WHITESPACE, ""));

/**
 * Name whether a text is the delivery's with only its whitespace changed: whole (up to
 * {@link LONGEST_COPY}) or as one of the svg drawings in it.
 *
 * @param text A file's text.
 * @param deniedText The second list's digests, {@link DENIED_TEXT} for the tracked files.
 * @returns What it holds, if anything.
 */
const rewritten = (text: string, deniedText: ReadonlySet<string>): readonly string[] => {
  const whole = text.length <= LONGEST_COPY ? flat(text) : Buffer.alloc(0);
  const drawings = regex("<svg\\b", "iu").test(text)
    ? (text.match(regex("<svg\\b[\\s\\S]*?</svg>", "giu")) ?? [])
        .map(flat)
        .filter((drawing) => drawing.length >= 64)
    : [];

  return [
    ...(whole.length >= 64 && deniedText.has(digest(whole))
      ? ["a text of the delivery, reformatted"]
      : []),
    ...(drawings.some((drawing) => deniedText.has(digest(drawing)))
      ? ["a drawing of the delivery"]
      : []),
  ];
};

/**
 * Show a name's bytes as text: each byte that is not printable ASCII (or is a backslash) written as
 * \\xHH.
 *
 * @param bytes The name's bytes.
 * @returns The name, shown.
 */
const shownBytes = (bytes: Uint8Array) =>
  [...bytes]
    .map((byte) =>
      byte >= 0x20 && byte < 0x7f && byte !== 0x5c
        ? String.fromCodePoint(byte)
        : `\\x${byte.toString(16).padStart(2, "0")}`,
    )
    .join("");

/**
 * What each tag of git's listing says of its path: whether it is listed (every tag but R, a
 * deletion, which repeats a path already listed), and whether it may be missing (R, and S:
 * skip-worktree, which a sparse checkout leaves out). H is tracked, M unmerged, ? would be tracked;
 * any other tag fails the suite.
 */
const TAGS: ReadonlyMap<string, { readonly listed: boolean; readonly missing: boolean }> = new Map([
  ["H", { listed: true, missing: false }],
  ["M", { listed: true, missing: false }],
  ["S", { listed: true, missing: true }],
  ["?", { listed: true, missing: false }],
  ["R", { listed: false, missing: true }],
]);

/**
 * Read git's one listing of a tree, its entries each a tag, a space and a name's bytes, ended by a
 * NUL. A name is UTF-8 only if, decoded keeping any leading BOM, it encodes back to the very same
 * bytes: read as text, a name that is not UTF-8 (each bad byte a U+FFFD) or one led by a BOM
 * (dropped) would name another file, which a clean file could stand at. Such a name is kept by its
 * bytes, which the suite stats it by, never by name, and whether git lets it be missing is told by
 * its bytes too, never by how it is shown.
 *
 * @param out What git printed.
 * @returns Every path listed whose name is UTF-8, once; those that may be missing (deleted, or left
 *   out of a sparse checkout); and every listed name that is not UTF-8, once, with whether it may
 *   be.
 */
const listingOf = (out: Uint8Array) => {
  const decoder = new TextDecoder("utf-8", { ignoreBOM: true });
  const files = new Set<string>();
  const missing = new Set<string>();
  const unnamed = new Map<string, { bytes: Uint8Array; shown: string }>();
  const missingBytes = new Set<string>();
  let start = 0;

  for (let end = out.indexOf(0); end !== -1; end = out.indexOf(0, start)) {
    const entry = out.subarray(start, end);
    const tag = entry[1] === 0x20 ? TAGS.get(String.fromCodePoint(entry[0] ?? 0)) : undefined;
    const piece = entry.subarray(2);
    const name = decoder.decode(piece);
    const utf8 = Buffer.from(name, "utf-8").equals(piece);
    const bytes = Buffer.from(piece).toString("hex");

    start = end + 1;
    assert.isDefined(
      tag,
      `git's listing holds an entry with no tag it knows: ${shownBytes(entry)}`,
    );
    if (tag.listed && utf8) {
      files.add(name);
    }

    if (tag.missing && utf8) {
      missing.add(name);
    }

    if (tag.listed && !utf8 && !unnamed.has(bytes)) {
      unnamed.set(bytes, { bytes: piece, shown: shownBytes(piece) });
    }

    if (tag.missing && !utf8) {
      missingBytes.add(bytes);
    }
  }
  assert.strictEqual(start, out.length, "git's listing holds bytes after its last NUL");

  return {
    files: [...files],
    missing,
    unnamed: [...unnamed].map(([bytes, name]) => ({
      ...name,
      mayBeMissing: missingBytes.has(bytes),
    })),
  };
};

/**
 * Write one entry of git's listing, as a sample: its tag, a space and a name's bytes, then a NUL.
 *
 * @param tag The entry's tag.
 * @param name The name's bytes.
 * @returns The entry's bytes.
 */
const listingEntry = (tag: string, name: Iterable<number>) => [
  ...Buffer.from(`${tag} `),
  ...name,
  0,
];

/**
 * List what git lists under a root, in one listing: every file it tracks, every file it would track
 * (untracked and not ignored), and every tracked file this checkout deleted.
 *
 * @param root The repository's root.
 * @returns The listed paths, the names that are not UTF-8, and the paths that may be missing.
 */
const gitListed = (root: string) =>
  listingOf(
    execFileSync(
      "git",
      ["ls-files", "-z", "-t", "--cached", "--deleted", "--others", "--exclude-standard"],
      { cwd: root, maxBuffer: 268_435_456 },
    ),
  );

/**
 * Tell whether every folder on a listed path's way resolves to a folder, following links as the
 * kernel does: one missing, or a file where git has a folder (both of which git lists as deleted),
 * leaves the path missing (ENOENT, ENOTDIR); any other failure to stat (a folder, or the folder a
 * link names, that cannot be searched; a loop) throws, so it fails the suite rather than reading as
 * missing. A link to a folder is that folder, never a reason to call the path missing.
 *
 * @param root The repository's root.
 * @param name The path under the root, as bytes: a name that is not UTF-8 is walked by them too.
 * @returns Whether each folder on its way is a folder.
 */
const reachable = (root: string, name: Uint8Array): boolean => {
  const cut = name.lastIndexOf(0x2f);

  return (
    cut === -1 ||
    (reachable(root, name.subarray(0, cut)) &&
      statSync(Buffer.concat([Buffer.from(`${root}/`), name.subarray(0, cut)]), {
        throwIfNoEntry: false,
      })?.isDirectory() === true)
  );
};

/**
 * What a listed path is when it is not there, and git neither lists it as deleted nor leaves it out
 * of a sparse checkout: a file gone while the suite ran. It is not judged, so it fails.
 */
const UNREAD = "is listed but cannot be read: a file gone while the suite ran";

/**
 * What a listed name is when its bytes are not UTF-8 and it is there: statted by its bytes, never
 * read by name, it fails, shown by its bytes.
 */
const NOT_UTF8 = "is named in bytes that are not UTF-8";

/**
 * Name the encoding a file's text is in: UTF-16 when it starts with that encoding's byte-order
 * mark, UTF-8 otherwise.
 *
 * @param bytes The file's bytes.
 * @returns The encoding's name.
 */
const encodingOf = (bytes: Buffer): "utf-8" | "utf-16be" | "utf-16le" => {
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return "utf-16le";
  }

  return bytes[0] === 0xfe && bytes[1] === 0xff ? "utf-16be" : "utf-8";
};

/**
 * Name what a tracked file carries, by its path, a symlink's target, its bytes and its text. A
 * finding no single line holds (it spans lines) is named once for the file.
 *
 * @param root The repository's root.
 * @param file The file's path under the root.
 * @param missing The listed paths that may be missing: deleted, or left out of a sparse checkout.
 * @returns Each finding, with where it is.
 */
const scan = (root: string, file: string, missing: ReadonlySet<string>): readonly string[] => {
  const found = offences(file).map((what) => `${file}: path holds ${what}`);
  const at = path.join(root, file);
  // A path the index lists but this checkout deleted, or a submodule's gitlink, holds nothing; any
  // other listed path that is not there fails the suite (UNREAD).
  const stat = reachable(root, Buffer.from(file))
    ? lstatSync(at, { throwIfNoEntry: false })
    : undefined;

  if (stat === undefined) {
    return missing.has(file) ? found : [...found, `${file}: ${UNREAD}`];
  }

  if (stat.isSymbolicLink()) {
    for (const what of offences(readlinkSync(at))) {
      found.push(`${file}: symlink target holds ${what}`);
    }
    // A link that resolves to a file is judged by that file's bytes too.
    if (statSync(at, { throwIfNoEntry: false })?.isFile() === true) {
      const linked = readFileSync(at);

      for (const what of delivered(linked, linked.toString("utf-8"), DENIED)) {
        found.push(`${file}: links to ${what}`);
      }
    }

    return found;
  }

  if (!stat.isFile()) {
    return found;
  }

  const bytes = readFileSync(at);
  const encoding = encodingOf(bytes);
  const binary = encoding === "utf-8" && bytes.subarray(0, 8000).includes(0);
  const text = binary ? "" : new TextDecoder(encoding).decode(bytes);

  for (const what of delivered(bytes, text, DENIED)) {
    found.push(`${file}: is ${what}`);
  }
  if (binary) {
    return found;
  }

  for (const what of rewritten(text, DENIED_TEXT)) {
    found.push(`${file}: holds ${what}`);
  }

  const whole = offences(text);

  if (whole.length === 0) {
    return found;
  }

  const byLine = new Set<string>();

  for (const [index, line] of text.split("\n").entries()) {
    for (const what of offences(line)) {
      byLine.add(what);
      found.push(`${file}:${index + 1}: ${what}`);
    }
  }
  for (const what of whole) {
    if (!byLine.has(what)) {
      found.push(`${file}: across lines: ${what}`);
    }
  }

  return found;
};

/**
 * Name what a listed name that is not UTF-8 is: statted by its bytes as any listed name is, and
 * never read by name. There, it fails, shown by its bytes; missing, it passes only if git lets it
 * be missing; a folder on its way that cannot be searched throws, so it fails the suite.
 *
 * @param root The repository's root.
 * @param name The name, as listingOf gives it.
 * @param name.bytes Its bytes.
 * @param name.shown How a finding shows it.
 * @param name.mayBeMissing Whether git lets it be missing.
 * @returns Its findings.
 */
const unnamedFound = (
  root: string,
  name: { readonly bytes: Uint8Array; readonly shown: string; readonly mayBeMissing: boolean },
): readonly string[] => {
  const at = Buffer.concat([Buffer.from(`${root}/`), name.bytes]);
  const stat = reachable(root, name.bytes) ? lstatSync(at, { throwIfNoEntry: false }) : undefined;

  if (stat !== undefined) {
    return [`${name.shown}: ${NOT_UTF8}`];
  }

  return name.mayBeMissing ? [] : [`${name.shown}: ${UNREAD}`];
};

/**
 * Name every finding over what git lists under a root: the names that are not UTF-8, then each
 * listed file's.
 *
 * @param root The repository's root.
 * @param entries What git lists there, as gitListed gives it.
 * @returns Each finding, with where it is.
 */
const treeFindings = (root: string, entries: ReturnType<typeof gitListed>): readonly string[] => [
  ...entries.unnamed.flatMap((name) => unnamedFound(root, name)),
  ...entries.files.flatMap((file) => scan(root, file, entries.missing)),
];

/**
 * Every file git tracks in this repository, plus every file it would track (untracked and not
 * ignored), by path under the root. A submodule is its own repository and is listed only as its
 * gitlink.
 *
 * @returns The root and the paths.
 */
const trackedFiles = () => {
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: import.meta.dirname,
    encoding: "utf-8",
  }).trim();

  return { ...gitListed(root), root };
};

/**
 * Join a sample's token, written with a middle dot inside it so that this file never carries it.
 *
 * @param sample The sample as written.
 * @returns The sample as scanned.
 */
const unbroken = (sample: string): string => sample.replaceAll("·", "");

/**
 * A sample for every branch of every alternative, by the kind of artefact it is.
 */
const CAUGHT = (
  [
    ["a builder data attribute", '<qti-portable-custom-interaction data-m·tb-supply="11">'],
    ["a builder data attribute", '<DIV DATA-M·TB-SUPPLY="11">'],
    ["a builder data attribute", "props.data_m·tb_supply"],
    ["a builder data attribute", '{"html": "<div data\\u002dm·tb-supply=\\"3\\">"}'],
    ["a builder data attribute", "&#x64;ata-m·tb-supply"],
    [
      "a builder identifier, class or sidecar block",
      'custom-interaction-type-identifier="alpha.m·tb.x"',
    ],
    ["a builder identifier, class or sidecar block", "properties.m·tbSupply"],
    ["a builder identifier, class or sidecar block", "export const M·tbSupply = 1"],
    ["a builder identifier, class or sidecar block", 'import { x } from "@/lib/m·tb/x"'],
    ["a builder identifier, class or sidecar block", "color: var(--m·tb-color)"],
    ["a builder identifier, class or sidecar block", '<div class="m·tb-stimulus">'],
    ["a builder identifier, class or sidecar block", 'json.loads(sidecar)["m·tb"]'],
    ["a builder sidecar field", "meta.screen_·spec.key"],
    ["a builder sidecar field", "meta.screen_·kind"],
    ["a builder sidecar field", "item.screen·Kind"],
    ["a builder sidecar field", "type T = Screen·Spec"],
    ["a builder sidecar field", '"item_type_·declared": "hot-text"'],
    ["a builder sidecar field", "sidecar.fixed_·slot"],
    ["a builder sidecar field", '"b·lueprint_version_id": "0"'],
    ["a builder sidecar field", "manifest.b·lueprint_versions"],
    ["a builder sidecar field", "the b·lueprint_version field"],
    ["a builder sidecar field", '{ "kind": "scatter", "s·eed": 9 }'],
    ["a builder URL path", "https://example.test/b·lueprints/K/forms/1/2"],
    ["a builder URL path", "https://example.test/b·lueprints/2/forms/3/4"],
    [
      "a builder comment",
      "<!-- Audio on ·request: the stem and every option have a play button -->",
    ],
    ["a builder comment", "<!-- Audio on\n ·request: wrapped -->"],
    ["a builder comment", "&lt;!-- Audio on ·request: x --&gt;"],
    ["a builder comment", "<!-- CUSTOM INTERACTION ·(a build, not a standard QTI interaction) -->"],
    ["the builder renderer's source", 'import { Mat } from "@/components/k·item"'],
    ["the builder renderer's source", 'import { Clock } from "@/components/g1·item"'],
    ["the builder renderer's source", 'import { Coins } from "@/components/g2·item"'],
    ["the builder renderer's source", "export function Form·Screens()"],
    ["the builder renderer's source", "type Form·Screen·Spec = { kind: string }"],
    ["the builder renderer's source", "export function G1·Screens()"],
    ["the builder renderer's source", "export function G2·Screen()"],
    ["the builder renderer's source", "type G1·Screen·Spec = { kind: string }"],
    ["the builder renderer's source", "export const G1·_SCREEN_KINDS = []"],
    ["the builder renderer's source", "const FORM·_SCREEN_KINDS = []"],
    ["the builder renderer's source", "const G2·_SCREEN_KINDS = []"],
    ["the builder renderer's source", "see renderer-s·ource/README.md"],
    ["the builder's picture markup or package path", '<img alt="x" class="s·timulus"/>'],
    ["the builder's picture markup or package path", "<img class='o·ption big' src=x>"],
    ["the builder's picture markup or package path", '<img class="big o·ption" src=x>'],
    ["the builder's picture markup or package path", "<img class=s·timulus src=x>"],
    ["the builder's picture markup or package path", '<img className="s·timulus" src="x.svg"/>'],
    ["the builder's picture markup or package path", '{"h": "<img class=\\"o·ption\\" src=x>"}'],
    ["the builder's picture markup or package path", '<IMG CLASS="O·PTION" SRC=X>'],
    ["the builder's picture markup or package path", '<img src="media/p·icture.png"/>'],
    ["the builder's picture markup or package path", '<img src="a/o·ption_3.png"/>'],
    ["the builder's picture markup or package path", '<img src="a/s·creen.png"/>'],
    ["the builder's picture markup or package path", '<img src="a/r·esponse.png"/>'],
    ["the builder's picture markup or package path", "../../images/K/F1.·02/x.svg"],
    ["the builder's picture markup or package path", "images/1/F2.·10/x.svg"],
    ["the builder's picture markup or package path", "images-g·rade-K/K/F1.·02/x.svg"],
    ["the builder's picture markup or package path", "images-g·rade-2/2/F1.·02/x.svg"],
    ["the builder's picture markup or package path", "unzip images-g·rade-K.zip"],
    ["the builder's picture markup or package path", "the images-g·rade-2 folder"],
    ["a path of the delivery", "docs/package-c·ode-and-docs/items.json"],
    ["a path of the delivery", "package-c·ode-and-docs/items.json"],
    ["a path of the delivery", "assets/renderer-s·ource"],
    ["a path of the delivery", "x/images-g·rade-1/F1.03.png"],
    ["a path of the delivery", "x/images-g·rade-K/F1.03.png"],
  ] as const
).map(([what, sample]) => [what, unbroken(sample)] as const);

describe("a private item builder's draft format and its delivery's files are banned from this repository", () => {
  it("is carried by no tracked file, in its content, path or symlink target, and no file is the delivery's", () => {
    const { root, ...entries } = trackedFiles();
    const { files } = entries;

    // Inside edullm, a tree filled without git would resolve to edullm's root and scan the wrong repository.
    assert.strictEqual(
      root,
      path.resolve(import.meta.dirname, ".."),
      "git's root here is not qti-pie's",
    );
    assert.isAbove(files.length, 100, `git listed only ${files.length} files under ${root}`);

    const found = treeFindings(root, entries);

    assert.deepStrictEqual(
      found,
      [],
      `builder format or delivery files found (${found.length}):\n${found.slice(0, 200).join("\n")}`,
    );
  });

  it("fails a name that is not UTF-8 or led by a BOM even beside a clean twin, a listed path not there, and one in a folder that cannot be searched, and passes one deleted or sparse", (context) => {
    context.skip(
      process.platform === "darwin",
      "APFS refuses names that are not UTF-8, so no file can hide behind one there",
    );

    const directory = mkdtempSync(path.join(tmpdir(), "builder-format-names-"));
    const at = (...bytes: readonly number[]) =>
      Buffer.concat([Buffer.from(`${directory}/`), Buffer.from(bytes)]);
    const locked = path.join(directory, "locked");
    const lockedUnnamed = at(0x6c, 0xff);
    const lockedDeep = path.join(directory, "deep");
    const outside = mkdtempSync(path.join(tmpdir(), "builder-format-outside-"));

    mkdirSync(locked);
    mkdirSync(lockedUnnamed);
    mkdirSync(path.join(lockedDeep, "inner"), { recursive: true });
    context.onTestFinished(() => {
      chmodSync(locked, 0o700);
      chmodSync(lockedUnnamed, 0o700);
      chmodSync(lockedDeep, 0o700);
      rmSync(outside, { force: true, recursive: true });
      rmSync(directory, { force: true, recursive: true });
    });
    execFileSync("git", ["init", "-q"], { cwd: directory });
    writeFileSync(
      Buffer.concat([
        Buffer.from(path.join(directory, "o")),
        Buffer.from([0xff]),
        Buffer.from(".bin"),
      ]),
      "x",
    );
    writeFileSync(path.join(directory, "o\uFFFD.bin"), "plain words at the name it reads as\n");
    writeFileSync(path.join(directory, "\uFEFFp.bin"), "x");
    writeFileSync(path.join(directory, "p.bin"), "plain words at the name without the BOM\n");
    writeFileSync(path.join(directory, "gone.txt"), "plain words, tracked and then deleted\n");
    writeFileSync(path.join(directory, "sparse.txt"), "plain words a sparse checkout leaves out\n");
    mkdirSync(path.join(directory, "folded"));
    writeFileSync(
      path.join(directory, "folded", "x.txt"),
      "plain words in a folder a file replaces\n",
    );
    writeFileSync(path.join(locked, "x.txt"), "plain words in a folder that cannot be searched\n");
    writeFileSync(
      path.join(lockedDeep, "inner", "x.txt"),
      "plain words two folders below a lock\n",
    );
    writeFileSync(path.join(directory, "kept.txt"), `${CAUGHT.at(0)?.[1] ?? ""}\n`);
    mkdirSync(path.join(directory, "linked"));
    writeFileSync(path.join(directory, "linked", "x.txt"), `${CAUGHT.at(0)?.[1] ?? ""}\n`);
    writeFileSync(at(0x6c, 0xff, 0x2f, 0x78), "x");
    writeFileSync(at(0x73, 0xff, 0x2e, 0x62), "x");
    writeFileSync(at(0x74, 0xfe), "plain words under a name that is not UTF-8, left out\n");
    mkdirSync(at(0x66, 0xff));
    writeFileSync(
      at(0x66, 0xff, 0x2f, 0x78),
      "plain words in a folder so named that a file replaces\n",
    );
    execFileSync("git", ["add", "-A"], { cwd: directory });
    rmSync(path.join(directory, "gone.txt"));
    execFileSync("git", ["update-index", "--skip-worktree", "sparse.txt", "kept.txt"], {
      cwd: directory,
    });
    rmSync(path.join(directory, "sparse.txt"));
    execFileSync("git", ["update-index", "-z", "--skip-worktree", "--stdin"], {
      cwd: directory,
      input: Buffer.from([0x73, 0xff, 0x2e, 0x62, 0, 0x74, 0xfe, 0]),
    });
    rmSync(at(0x74, 0xfe));
    rmSync(at(0x66, 0xff), { recursive: true });
    writeFileSync(at(0x66, 0xff), "plain words where a tracked folder so named was\n");
    rmSync(path.join(directory, "folded"), { recursive: true });
    writeFileSync(path.join(directory, "folded"), "plain words where a tracked folder was\n");
    renameSync(path.join(directory, "linked"), path.join(outside, "linked"));
    symlinkSync(path.join(outside, "linked"), path.join(directory, "linked"));

    const entries = gitListed(directory);
    const searchesAnyFolder = process.getuid?.() === 0;
    const unnamed = [
      `f\\xff: ${NOT_UTF8}`,
      `l\\xff/x: ${NOT_UTF8}`,
      `o\\xff.bin: ${NOT_UTF8}`,
      `s\\xff.b: ${NOT_UTF8}`,
    ];
    const keptSparse = scan(directory, "kept.txt", new Set());
    const keptLinked = keptSparse.map((finding) => finding.replace("kept.txt", "linked/x.txt"));
    const kept = [...keptSparse, ...keptLinked];

    assert.includeMembers(entries.files, ["\uFEFFp.bin", "p.bin"], "a leading BOM is dropped");
    assert.isNotEmpty(keptSparse, "a sample of hers is found");
    assert.deepStrictEqual(treeFindings(directory, entries), [...unnamed, ...kept]);
    assert.deepStrictEqual(
      treeFindings(directory, {
        ...entries,
        files: [...entries.files, "absent.txt"],
        unnamed: [
          ...entries.unnamed,
          { bytes: Buffer.from([0x61, 0xfe]), mayBeMissing: false, shown: "a\\xfe" },
        ],
      }),
      [...unnamed, `a\\xfe: ${UNREAD}`, ...kept, `absent.txt: ${UNREAD}`],
    );

    chmodSync(lockedUnnamed, 0o600);

    const unnamedLocked = gitListed(directory);

    if (!searchesAnyFolder) {
      assert.throws(() => {
        treeFindings(directory, unnamedLocked);
      }, "EACCES");
    }

    chmodSync(lockedUnnamed, 0o700);
    chmodSync(locked, 0o600);

    const namedLocked = gitListed(directory);

    if (!searchesAnyFolder) {
      assert.throws(() => {
        treeFindings(directory, namedLocked);
      }, "EACCES");
    }

    chmodSync(locked, 0o700);
    chmodSync(lockedDeep, 0o600);

    const deepLocked = gitListed(directory);

    if (!searchesAnyFolder) {
      assert.throws(() => {
        treeFindings(directory, deepLocked);
      }, "EACCES");
    }
  });

  it("reads git's listing as git means it, with no git", () => {
    const o = 0x6f;
    const listing = listingOf(
      new Uint8Array([
        ...listingEntry("H", Buffer.from("a.txt")),
        ...listingEntry("R", Buffer.from("a.txt")),
        ...listingEntry("S", Buffer.from("s.txt")),
        ...listingEntry("?", Buffer.from("u.txt")),
        ...listingEntry("M", Buffer.from("m.txt")),
        ...listingEntry("M", Buffer.from("m.txt")),
        ...listingEntry("H", Buffer.from("\uFEFFp.bin")),
        ...listingEntry("H", Buffer.from("p.bin")),
        ...listingEntry("H", [o, 0xff, 0x2e, 0x62]),
        ...listingEntry("H", [o, 0xfe]),
        ...listingEntry("R", [o, 0xfe]),
        ...listingEntry("H", [o, 0xff, 0xfd]),
        ...listingEntry("H", [o, 0x5c, 0x78, 0x66, 0x66, 0xfd]),
        ...listingEntry("R", [o, 0x5c, 0x78, 0x66, 0x66, 0xfd]),
        ...listingEntry("S", [0x73, 0xff]),
      ]),
    );

    assert.deepStrictEqual(listing.files, [
      "a.txt",
      "s.txt",
      "u.txt",
      "m.txt",
      "\uFEFFp.bin",
      "p.bin",
    ]);
    assert.deepStrictEqual([...listing.missing].toSorted(), ["a.txt", "s.txt"]);
    assert.deepStrictEqual(
      listing.unnamed.map(({ shown, mayBeMissing }) => `${shown}:${String(mayBeMissing)}`),
      ["o\\xff.b:false", "o\\xfe:true", "o\\xff\\xfd:false", "o\\x5cxff\\xfd:true", "s\\xff:true"],
    );
    assert.strictEqual(
      shownBytes(new Uint8Array([0x61, 0x5c, 0xff, 0x7f, 0x20])),
      "a\\x5c\\xff\\x7f ",
    );
    assert.throws(() => {
      listingOf(new Uint8Array(listingEntry("C", Buffer.from("a.txt"))));
    });
    assert.throws(() => {
      listingOf(new Uint8Array([0x48, 0x61, 0]));
    });
    assert.throws(() => {
      listingOf(new Uint8Array([0x48, 0x20, 0x61]));
    });
  });

  it("catches, with every alternative, a sample of its own", () => {
    for (const [what, sample] of CAUGHT) {
      assert.include(offences(sample), what, sample);
    }

    assert.deepStrictEqual(
      BANNED.filter(
        ({ pattern, what }) =>
          !CAUGHT.some(([sampled, sample]) => sampled === what && pattern.test(sample)),
      ).map(({ pattern }) => pattern.source),
      [],
      "an alternative without a sample of its own",
    );
  });

  it("passes canonical QTI and ordinary prose", () => {
    for (const clean of [
      '<qti-portable-custom-interaction response-identifier="RESPONSE" data-supply="11" data-target="8">',
      'custom-interaction-type-identifier="urn:fdc:alpha.school:2026:count-placements"',
      'module="count-placements" class="alpha-counter-mat"',
      '<img src="media/birds-8.svg" alt="eight birds in a row" class="qti-display-block"/>',
      '<img class="option-card" src="media/a.svg" alt="a"/>',
      'export type FormScreen = "item" | "review"',
      "__reader_olds_node_omtbbnhleq s3thqmtbad",
      "integrity: sha512-m·tbQx9+m·tbZ/m·tb+Ab0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345==",
      'src="data:image/png;base64,m·tbA/m·tb+Q=="',
      "the authoring tool's screen-kind names, in words",
      "screenshot screens kind",
      "a non-ASCII escape stays as written: \\u00e9 &#233;",
    ].map(unbroken)) {
      assert.deepStrictEqual(offences(clean), [], clean);
    }
  });

  it("catches a file of the delivery by its digest, whole, as a data: URI or reformatted, and nothing else", () => {
    holdsDigests("denied-files", DENIED, 3000);
    holdsDigests("denied-text", DENIED_TEXT, 2500);

    const planted = Buffer.from(
      "a planted file standing in for one of the delivery's, long enough to be listed",
    );
    const denied = new Set([digest(planted)]);

    assert.deepStrictEqual(delivered(planted, planted.toString(), denied), [
      "a file of the delivery",
    ]);

    const unpadded = planted.toString("base64").replaceAll("=", "");
    const page = `<img src="data:image/png;charset=binary;base64,${unpadded}"/>`;

    assert.deepStrictEqual(delivered(Buffer.from(page), page, denied), [
      "a file of the delivery as a data: URI",
    ]);

    const changed = Buffer.concat([planted, Buffer.from(" ")]);

    assert.deepStrictEqual(delivered(changed, changed.toString(), denied), []);

    const drawing =
      '<svg viewBox="0 0 10 10"><path d="M1 1 L9 9 L1 9 Z" fill="#123456" stroke="none"/></svg>';
    const drawings = new Set([digest(Buffer.from(drawing.replaceAll(WHITESPACE, "")))]);

    assert.deepStrictEqual(
      rewritten(`<div>\n  ${drawing.replaceAll(" ", "\n    ")}\n</div>`, drawings),
      ["a drawing of the delivery"],
    );
    assert.deepStrictEqual(rewritten(drawing.replace("#123456", "#654321"), drawings), []);

    const text =
      "a planted text standing in for one of the delivery's, long enough to be listed by its digest";
    const texts = new Set([digest(Buffer.from(text.replaceAll(WHITESPACE, "")))]);

    assert.deepStrictEqual(rewritten(text.replaceAll(" ", "\n\t"), texts), [
      "a text of the delivery, reformatted",
    ]);
  });
});
