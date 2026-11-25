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
import { lstatSync, readFileSync, readlinkSync, statSync } from "node:fs";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";

/**
 * The builder's markup that names nothing private, one alternative an entry, so each is held to
 * a sample of its own: entries that share a `what` name one kind of artefact.
 */
const BANNED: readonly { readonly pattern: RegExp; readonly what: string }[] = [
  { pattern: /data[-_]m[t]b[-_]/iu, what: "a builder data attribute" },
  { pattern: /\b[Mm][t]b(?:[A-Z_]|\b)/u, what: "a builder identifier, class or sidecar block" },
  { pattern: /\b[Ss]creen_?(?:[Kk]ind|[Ss]pec)\b/u, what: "a builder sidecar field" },
  { pattern: /\bitem_type_d[e]clared\b/u, what: "a builder sidecar field" },
  { pattern: /\bfixed_s[l]ot\b/u, what: "a builder sidecar field" },
  { pattern: /\bb[l]ueprint_versions?(?:_id)?\b/u, what: "a builder sidecar field" },
  { pattern: /"kind"\s*:\s*"scatter"\s*,\s*"s[e]ed"/u, what: "a builder sidecar field" },
  { pattern: /\/b[l]ueprints\/(?:K|[0-9]+)\/forms\//u, what: "a builder URL path" },
  { pattern: /<!--\s*Audio\s+on\s+req[u]est:/u, what: "a builder comment" },
  { pattern: /CUSTOM\s+INTERACTION\s+\(a\s+b[u]ild/u, what: "a builder comment" },
  { pattern: /\b(?:k|g1|g2)item\b/u, what: "the builder renderer's source" },
  { pattern: /\bFormScreen(?:s|Spec)\b/u, what: "the builder renderer's source" },
  { pattern: /\bG[12]Screen(?:s|Spec)?\b/u, what: "the builder renderer's source" },
  { pattern: /\b(?:FORM|G1|G2)_SCREEN/u, what: "the builder renderer's source" },
  { pattern: /\brenderer-s[o]urce\//u, what: "the builder renderer's source" },
  {
    pattern:
      /<img[^>]{0,2048}\bclass(?:Name)?=["'\\]{0,2}(?:[^"'>]{0,256}\s)?(?:s[t]imulus|o[p]tion)(?=["'\\\s/>])/iu,
    what: "the builder's picture markup or package path",
  },
  {
    pattern: /src="[^"]{0,2048}\/(?:p[i]cture|o[p]tion_[0-9]+|s[c]reen|r[e]sponse)\.png"/u,
    what: "the builder's picture markup or package path",
  },
  {
    pattern: /\bimages(?:-grade-(?:K|[0-9]))?\/(?:K|[0-9])\/F[0-9]+\.[0-9]{2}\//u,
    what: "the builder's picture markup or package path",
  },
  {
    pattern: /\bimages-g[r]ade-(?:K|[0-9])\b/u,
    what: "the builder's picture markup or package path",
  },
  {
    pattern:
      /(?<=^|\/)(?:renderer-s[o]urce|package-c[o]de-and-docs|images-g[r]ade-(?:K|[0-9]))(?:\/|$)/mu,
    what: "a path of the delivery",
  },
];

/**
 * Base64 that is not text: subresource-integrity hashes at their exact lengths (lockfiles) and
 * data: URIs, read as blanks.
 */
const OPAQUE =
  /\bsha1-[A-Za-z0-9+/]{27}=|\bsha256-[A-Za-z0-9+/]{43}=|\bsha384-[A-Za-z0-9+/]{64}|\bsha512-[A-Za-z0-9+/]{86}==|\bdata:[\w/+.-]*(?:;[\w.+-]+=[^;,"'\s]*)*;base64,[A-Za-z0-9+/]+=*/gu;

/**
 * The escapes a copy of the markup may hide behind: JSON's and JavaScript's `\u` and `\x`, HTML's
 * numeric and named entities. A backslash before a quote is not read (generated files hold many);
 * the picture-class pattern allows it.
 */
const ESCAPE =
  /\\u(?<unicode>[0-9a-fA-F]{4})|\\x(?<byte>[0-9a-fA-F]{2})|&#[xX](?<hex>[0-9a-fA-F]{1,6});|&#(?<decimal>[0-9]{1,7});|&(?<named>lt|gt|quot|apos|amp);/gu;

/**
 * The characters HTML's named entities stand for.
 */
const NAMED = new Map([
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
const WHITESPACE = /[ \t\n\r\f\v]+/gu;

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
 * Name what of the builder's markup a text carries. Each alternative runs on its own: V8 scans a
 * pattern's literals faster than one alternation of them all.
 *
 * @param text A file's text, one of its lines, a path or a symlink's target.
 * @returns What it carries, once per kind of artefact.
 */
const offences = (text: string): readonly string[] => {
  const blanked =
    text.includes("sha") || text.includes("base64,") ? text.replaceAll(OPAQUE, " ") : text;
  const readable = /\\[ux][0-9a-fA-F]|&(?:#|lt;|gt;|quot;|apos;|amp;)/u.test(blanked)
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
 * @param denied The deny-list's digests.
 * @returns What it is, if anything.
 */
const delivered = (
  bytes: Buffer,
  text: string,
  denied: ReadonlySet<string> = DENIED,
): readonly string[] => {
  const found = denied.has(digest(bytes)) ? ["a file of the delivery"] : [];

  if (!text.includes("base64,")) {
    return found;
  }

  const uris = text.matchAll(
    /\bdata:[\w/+.-]*(?:;[\w.+-]+=[^;,"'\s]*)*;base64,(?<payload>[A-Za-z0-9+/]+=*)/gu,
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
 * @param deniedText The second list's digests.
 * @returns What it holds, if anything.
 */
const rewritten = (
  text: string,
  deniedText: ReadonlySet<string> = DENIED_TEXT,
): readonly string[] => {
  const whole = text.length <= LONGEST_COPY ? flat(text) : Buffer.alloc(0);
  const drawings = /<svg\b/iu.test(text)
    ? (text.match(/<svg\b[\s\S]*?<\/svg>/giu) ?? [])
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
  const listing = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    {
      cwd: root,
      encoding: "utf-8",
      maxBuffer: 268_435_456,
    },
  );

  return { files: [...new Set(listing.split("\0").filter((entry) => entry !== ""))], root };
};

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
 * @returns Each finding, with where it is.
 */
const scan = (root: string, file: string): readonly string[] => {
  const found = offences(file).map((what) => `${file}: path holds ${what}`);
  const at = path.join(root, file);
  // A path the index lists but this checkout deleted, or a submodule's gitlink, holds nothing; any
  // other file that cannot be read fails the suite.
  const stat = lstatSync(at, { throwIfNoEntry: false });

  if (stat?.isSymbolicLink() === true) {
    found.push(
      ...offences(readlinkSync(at)).map((what) => `${file}: symlink target holds ${what}`),
    );
    // A link that resolves to a file is judged by that file's bytes too.
    if (statSync(at, { throwIfNoEntry: false })?.isFile() === true) {
      const linked = readFileSync(at);

      found.push(
        ...delivered(linked, linked.toString("utf-8")).map((what) => `${file}: links to ${what}`),
      );
    }

    return found;
  }

  if (stat?.isFile() !== true) {
    return found;
  }

  const bytes = readFileSync(at);
  const encoding = encodingOf(bytes);
  const binary = encoding === "utf-8" && bytes.subarray(0, 8000).includes(0);
  const text = binary ? "" : new TextDecoder(encoding).decode(bytes);

  found.push(...delivered(bytes, text).map((what) => `${file}: is ${what}`));
  if (binary) {
    return found;
  }

  found.push(...rewritten(text).map((what) => `${file}: holds ${what}`));

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
  found.push(
    ...whole.filter((what) => !byLine.has(what)).map((what) => `${file}: across lines: ${what}`),
  );

  return found;
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
    const { root, files } = trackedFiles();

    // Inside edullm, a tree filled without git would resolve to edullm's root and scan the wrong repository.
    assert.strictEqual(
      root,
      path.resolve(import.meta.dirname, ".."),
      "git's root here is not qti-pie's",
    );
    assert.isAbove(files.length, 100, `git listed only ${files.length} files under ${root}`);

    const found = files.flatMap((file) => scan(root, file));

    assert.deepStrictEqual(
      found,
      [],
      `builder format or delivery files found (${found.length}):\n${found.slice(0, 200).join("\n")}`,
    );
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
    for (const [name, list, least] of [
      ["denied-files", DENIED, 3000],
      ["denied-text", DENIED_TEXT, 2500],
    ] as const) {
      assert.isAtLeast(list.size, least, `the ${name} list is short`);
      assert.isTrue(
        [...list].every((entry) => /^[0-9a-f]{16}$/u.test(entry)),
        `a ${name} line is not 16 hex digits`,
      );
    }
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
