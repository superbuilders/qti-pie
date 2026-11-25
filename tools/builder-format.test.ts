/**
 * One private item builder's draft format, and every file of its author's delivery, banned from
 * this repository by construction. Some of the items Alpha delivers were drafted in that builder,
 * whose markup is not QTI: its own data attributes and identifiers, its sidecar fields, the
 * comments it writes into items, its picture markup and package paths, and its renderer's source.
 * What qti-pie reads, renders and scores is QTI 3.0.1, and the drafts' material is semantics only:
 * none of its files is ever used. This suite fails on any file git tracks (or would track) that
 * carries the format, in its content, its path or a symlink's target; that is one of those files,
 * by the SHA-256 deny-list beside it; or that holds one as a base64 data: URI.
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
 * The builder's markup that names nothing private.
 */
const BANNED: readonly { readonly pattern: RegExp; readonly what: string }[] = [
  { pattern: /data[-_]m[t]b[-_]/iu, what: "a builder data attribute" },
  {
    pattern: /\b[Mm][t]b(?:[A-Z_]|\b)/u,
    what: "a builder identifier, class or sidecar block",
  },
  {
    pattern:
      /\b[Ss]creen_?(?:[Kk]ind|[Ss]pec)\b|\bitem_type_d[e]clared\b|\bfixed_s[l]ot\b|\bb[l]ueprint_versions?(?:_id)?\b|"kind"\s*:\s*"scatter"\s*,\s*"s[e]ed"/u,
    what: "a builder sidecar field",
  },
  { pattern: /\/b[l]ueprints\/(?:K|[0-9]+)\/forms\//u, what: "a builder URL path" },
  {
    pattern: /<!--\s*Audio\s+on\s+req[u]est:|CUSTOM\s+INTERACTION\s+\(a\s+b[u]ild/u,
    what: "a builder comment",
  },
  {
    pattern:
      /\b(?:k|g1|g2)item\b|\b(?:Form|G1|G2)Screen(?:s|Spec)?\b|\b(?:FORM|G1|G2)_SCREEN|\brenderer-s[o]urce\//u,
    what: "the builder renderer's source",
  },
  {
    pattern:
      /<img[^>]*\bclass="(?:s[t]imulus|o[p]tion)"|src="[^"]*\/(?:p[i]cture|o[p]tion_[0-9]+|s[c]reen|r[e]sponse)\.png"|\bimages(?:-grade-(?:K|[0-9]))?\/(?:K|[0-9])\/F[0-9]+\.[0-9]{2}\/|\bimages-g[r]ade-(?:K|[0-9])\b/u,
    what: "the builder's picture markup or package path",
  },
];

/**
 * The delivery's folder names as path segments of a tracked file or a symlink's target.
 */
const DELIVERY_PATHS =
  /(?:^|\/)(?:renderer-s[o]urce|package-c[o]de-and-docs|images-g[r]ade-(?:K|[0-9]))(?:\/|$)/mu;

/**
 * Base64 that is not text: subresource-integrity hashes at their exact lengths (lockfiles) and
 * data: URIs, read as blanks.
 */
const OPAQUE =
  /\bsha1-[A-Za-z0-9+/]{27}=|\bsha256-[A-Za-z0-9+/]{43}=|\bsha384-[A-Za-z0-9+/]{64}|\bsha512-[A-Za-z0-9+/]{86}==|\bdata:[\w/+.-]*(?:;[\w.+-]+=[^;,"'\s]*)*;base64,[A-Za-z0-9+/]+=*/gu;

/**
 * The first 16 hex digits of the SHA-256 of every file of the drafts' delivery (every zip member
 * too), one per line.
 */
const DENIED: ReadonlySet<string> = new Set(
  readFileSync(path.join(import.meta.dirname, "builder-format.denied-files.sha256"), "utf-8")
    .split("\n")
    .filter((line) => line !== ""),
);

/**
 * Digest bytes as the deny-list holds them.
 *
 * @param bytes The bytes.
 * @returns The first 16 hex digits of their SHA-256.
 */
const digest = (bytes: Uint8Array): string =>
  createHash("sha256").update(bytes).digest("hex").slice(0, 16);

/**
 * Name what of the builder's markup a text carries.
 *
 * @param text A file's text, one of its lines, a path or a symlink's target.
 * @returns What it carries, once per kind of artefact.
 */
const offences = (text: string): readonly string[] => {
  const readable = text.replaceAll(OPAQUE, " ");
  const found = BANNED.filter(({ pattern }) => pattern.test(readable)).map(({ what }) => what);

  return DELIVERY_PATHS.test(readable) && !found.includes("the builder renderer's source")
    ? [...found, "a path of the delivery"]
    : found;
};

/**
 * Name whether bytes are a file of the delivery, or hold one as a base64 data: URI.
 *
 * @param bytes A file's bytes.
 * @param denied The deny-list's digests.
 * @returns What it is, if anything.
 */
const delivered = (bytes: Buffer, denied: ReadonlySet<string> = DENIED): readonly string[] => {
  const found = denied.has(digest(bytes)) ? ["a file of the delivery"] : [];

  if (!bytes.includes("base64,")) {
    return found;
  }

  const uris = bytes
    .toString("latin1")
    .matchAll(/\bdata:[\w/+.-]*(?:;[\w.+-]+=[^;,"'\s]*)*;base64,(?<payload>[A-Za-z0-9+/]+=*)/gu);

  return [...uris].some(({ groups }) =>
    denied.has(digest(Buffer.from(groups?.["payload"] ?? "", "base64"))),
  )
    ? [...found, "a file of the delivery as a data: URI"]
    : found;
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
  const listed = execFileSync(
    "git",
    ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
    {
      cwd: root,
      encoding: "utf-8",
      maxBuffer: 268_435_456,
    },
  );

  return { files: [...new Set(listed.split("\0").filter((entry) => entry !== ""))], root };
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
      found.push(...delivered(readFileSync(at)).map((what) => `${file}: links to ${what}`));
    }

    return found;
  }

  if (stat?.isFile() !== true) {
    return found;
  }

  const bytes = readFileSync(at);

  found.push(...delivered(bytes).map((what) => `${file}: is ${what}`));
  if (bytes.subarray(0, 8000).includes(0)) {
    return found;
  }

  const text = bytes.toString("utf-8");
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
      `builder format or delivery files found:\n${found.slice(0, 200).join("\n")}`,
    );
  });

  it("catches, with every pattern, the artefact it is written for", () => {
    const caught = (
      [
        ["a builder data attribute", '<qti-portable-custom-interaction data-m·tb-supply="11">'],
        ["a builder data attribute", '<DIV DATA-M·TB-SUPPLY="11">'],
        ["a builder data attribute", "props.data_m·tb_supply"],
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
        ["a builder sidecar field", "item.screen·Kind"],
        ["a builder sidecar field", "type Screen·Kind = string"],
        ["a builder sidecar field", '"b·lueprint_version_id": "0"'],
        ["a builder sidecar field", '"item_type_·declared": "hot-text"'],
        ["a builder sidecar field", "manifest.b·lueprint_versions"],
        ["a builder sidecar field", "sidecar.fixed_·slot"],
        ["a builder sidecar field", '{ "kind": "scatter", "s·eed": 9 }'],
        ["a builder URL path", "https://example.test/b·lueprints/K/forms/1/25"],
        [
          "a builder comment",
          "<!-- Audio on ·request: the stem and every option have a play button -->",
        ],
        [
          "a builder comment",
          "<!-- CUSTOM INTERACTION ·(a build, not a standard QTI interaction) -->",
        ],
        ["the builder renderer's source", "renderer-s·ource/k·item/Panel.tsx"],
        ["the builder renderer's source", "export function G1·Screens()"],
        ["the builder renderer's source", 'import { Mat } from "@/components/k·item"'],
        ["the builder renderer's source", "type Form·Screen·Spec = { kind: string }"],
        ["the builder renderer's source", "export const G1·_SCREEN_KINDS = []"],
        ["the builder's picture markup or package path", '<img src="x.png" class="s·timulus"/>'],
        [
          "the builder's picture markup or package path",
          '<img src="../../images/K/F1.·25/p·icture.png" alt="x"/>',
        ],
        ["the builder's picture markup or package path", "unzip images-g·rade-K.zip"],
      ] as const
    ).map(([what, sample]) => [what, unbroken(sample)] as const);

    for (const [what, sample] of caught) {
      assert.include(offences(sample), what, sample);
    }
    const tested = new Set<string>(caught.map(([what]) => what));

    assert.deepStrictEqual(
      BANNED.map(({ what }) => what).filter((what) => !tested.has(what)),
      [],
      "a pattern without a sample",
    );
    assert.deepStrictEqual(offences(unbroken("assets/images-g·rade-1")), [
      "the builder's picture markup or package path",
      "a path of the delivery",
    ]);
  });

  it("passes canonical QTI and ordinary prose", () => {
    for (const clean of [
      '<qti-portable-custom-interaction response-identifier="RESPONSE" data-supply="11" data-target="8">',
      'custom-interaction-type-identifier="urn:fdc:alpha.school:2026:count-placements"',
      'module="count-placements" class="alpha-counter-mat"',
      '<img src="media/birds-8.svg" alt="eight birds in a row" class="qti-display-block"/>',
      "__reader_olds_node_omtbbnhleq s3thqmtbad",
      "integrity: sha512-m·tbQx9+m·tbZ/m·tb+Ab0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345==",
      'src="data:image/png;base64,m·tbA/m·tb+Q=="',
      "the authoring tool's screen-kind names, in words",
      "screenshot screens kind",
    ].map(unbroken)) {
      assert.deepStrictEqual(offences(clean), [], clean);
    }
  });

  it("catches a file of the delivery by its digest, whole or as a data: URI, and nothing else", () => {
    assert.isAtLeast(DENIED.size, 3000, "the deny-list is short");
    assert.isTrue(
      [...DENIED].every((entry) => /^[0-9a-f]{16}$/u.test(entry)),
      "a deny-list line is not 16 hex digits",
    );

    const planted = Buffer.from(
      "a planted file standing in for one of the delivery's, long enough to be listed",
    );
    const denied = new Set([digest(planted)]);

    assert.deepStrictEqual(delivered(planted, denied), ["a file of the delivery"]);
    assert.deepStrictEqual(
      delivered(
        Buffer.from(`<img src="data:image/png;base64,${planted.toString("base64")}"/>`),
        denied,
      ),
      ["a file of the delivery as a data: URI"],
    );
    assert.deepStrictEqual(delivered(Buffer.concat([planted, Buffer.from(" ")]), denied), []);
  });
});
