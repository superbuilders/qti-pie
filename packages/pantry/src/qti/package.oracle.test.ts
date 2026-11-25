/**
 * The package, its entries and the manifest's overlays, as declarations and as the entries the
 * importer writes: the declarations admit and name their checks by the oracle's laws, a package's
 * entries are the same keyed sets from a directory and from its zip, and the entries keep the
 * listing's paths, one entry per path, each a document or media with the digest of its bytes.
 */
import { regex } from "arkregex";
import * as NodeChildProcessSpawner from "@effect/platform-node/NodeChildProcessSpawner";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { ChangeSet, schema, Sha256 } from "@bjornpagen/grizzle";
import type { Addition } from "@bjornpagen/grizzle";
import { assert, describe, it, layer } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { array, bytes, element, shuffled } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { createHash } from "node:crypto";
import {
  Brand,
  Duration,
  Effect,
  Formatter,
  Layer,
  Predicate,
  Record as Rec,
  Result,
} from "effect";
import { readProgram } from "#pantry/import/program.ts";
import type { PackagePath } from "#pantry/import/read.ts";
import { packageRecordOf } from "#pantry/import/record.ts";
import type { MediaFile } from "#pantry/import/record.ts";
import { readEntries } from "#pantry/package/read.ts";
import type { PackageFile } from "#pantry/package/read.ts";
import {
  Entry,
  EntryKind,
  externalHrefPattern,
  Media,
  Package,
  packageLaws,
  packageLawsByName,
  resolvedPathPattern,
  srcsetUrlPattern,
} from "#pantry/qti/package.ts";
import { qtiRelations } from "#pantry/qti/base.ts";
import { composed } from "#pantry/grammar/compose.ts";
import { materialize, materializeSpec, materializeZip, zipMembers } from "#pantry/test/fixtures.ts";
import { judge as judgeByOracle, lawNames, lawsOf } from "#pantry/test/oracle.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * The file system and processes the fixtures' materializer and `readEntries` need.
 */
const TestLayer = NodeChildProcessSpawner.layer.pipe(
  Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
);

/**
 * The name the entries are built under: the property is over their paths, kinds and digests, which
 * the name only stamps.
 */
const recordName: Addition<typeof Package>["package"] = "probe";

/**
 * The paths a listing draws from: the manifest, files at the root and below, and names with a
 * space and a letter beyond ASCII.
 */
const listedPaths = [
  "imsmanifest.xml",
  "a.xml",
  "b/c.png",
  "b/d e.txt",
  "x/y/z.bin",
  "ü.txt",
] as const;

/**
 * A listing as a reader gives one, in any order: up to six files at distinct paths, each of up to
 * 40 drawn bytes, in every order the generator draws.
 */
const listings: Gen<readonly PackageFile[]> = (source) => {
  const paths = source.draw(shuffled(listedPaths, { max: listedPaths.length, min: 0 }));
  const contents = source.draw(
    array(bytes({ max: 40, min: 0 }), { max: paths.length, min: paths.length }),
  );

  return paths.map((at, index) => ({
    bytes: contents[index] ?? new Uint8Array(),
    kind: at === "imsmanifest.xml" ? "manifest" : "file",
    path: at,
  }));
};

/**
 * Name a listing's size for the search's coverage.
 *
 * @param files - The listing.
 * @returns `empty`, `one` or `several`.
 */
const sizeOf = (files: readonly PackageFile[]): "empty" | "one" | "several" => {
  if (files.length === 0) {
    return "empty";
  }

  return files.length === 1 ? "one" : "several";
};

/**
 * The letters the path box draws from: a plain letter, a dot, the separator, the characters a
 * decoded name may hold (`%`, `:`, a space) and a comma.
 */
const pathLetters = ["a", ".", "/", "%", ":", " ", ","] as const;

/**
 * Every path of at most 4 of {@link pathLetters}: the path box, 2,801 paths.
 */
const boxPaths: Gen<string> = (source) =>
  source.draw(array(element(pathLetters), { max: 4, min: 0 })).join("");

/**
 * Whether a character is an ASCII letter, RFC 3986's `ALPHA`.
 *
 * @param c - The character.
 * @returns Whether it is one.
 */
const isAlpha = (c: string): boolean => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");

/**
 * Whether a character may follow a scheme's first letter (RFC 3986, §3.1).
 *
 * @param c - The character.
 * @returns Whether it is `ALPHA`, `DIGIT`, `+`, `-` or `.`.
 */
const isSchemeChar = (c: string): boolean =>
  isAlpha(c) || (c >= "0" && c <= "9") || c === "+" || c === "-" || c === ".";

/**
 * Whether a path starts with a scheme (RFC 3986, §3.1): `ALPHA *( ALPHA / DIGIT / "+" / "-" /
 * "." ) ":"`.
 *
 * @param candidate - The path.
 * @returns Whether it does.
 */
const hasScheme = (candidate: string): boolean => {
  const colon = candidate.indexOf(":");
  if (colon < 1 || !isAlpha(candidate.charAt(0))) {
    return false;
  }

  for (const c of candidate.slice(0, colon)) {
    if (!isSchemeChar(c)) {
      return false;
    }
  }

  return true;
};

/**
 * Whether a path is one RFC 3986's dot-segment removal (§5.2.4) leaves in the package, read
 * segment by segment: empty (the root), or segments the first of them nonempty and none `.` or
 * `..`.
 *
 * @param candidate - The path.
 * @returns Whether it is.
 */
const isResolvedPath = (candidate: string): boolean =>
  candidate === "" ||
  candidate
    .split("/")
    .every((segment, at) => segment !== "." && segment !== ".." && (at > 0 || segment !== ""));

/**
 * Whether a text is an image candidate's URL as the HTML Standard's "parse a srcset attribute"
 * collects it, read character by character: nonempty, no whitespace, its first character no comma
 * (skipped before it) and its last no comma (given back after it).
 *
 * @param candidate - The text.
 * @returns Whether it is.
 */
const isCandidateUrl = (candidate: string): boolean =>
  candidate !== "" &&
  !candidate.startsWith(",") &&
  !candidate.endsWith(",") &&
  !regex("[\t\n\r ]", "u").test(candidate);

/**
 * The three patterns a set judges a path by: a resolved path, an external reference, a candidate
 * URL.
 */
interface PathPatterns {
  readonly candidate: RegExp;
  readonly external: RegExp;
  readonly resolved: RegExp;
}

/**
 * The patterns as `package.ts` states them, read as the database reads them (ECMAScript under
 * `u`).
 */
const statedPatterns: PathPatterns = {
  candidate: regex.as(srcsetUrlPattern, "u"),
  external: regex.as(externalHrefPattern.source, "u"),
  resolved: regex.as(resolvedPathPattern.source, "u"),
};

/**
 * Three mutants of {@link statedPatterns}, each a plausible slip the box must tell apart, by the
 * situation a case that tells it apart notes: a resolved path without its `..`-prefixed arm, an
 * external pattern without its leading `/`, and a candidate URL pattern that admits a comma at its
 * end.
 */
const mutantPatterns = {
  "descriptor killed": {
    candidate: regex("^[^\t\n\r ,][^\t\n\r ]*$", "u"),
    external: regex.as(externalHrefPattern.source, "u"),
    resolved: regex.as(resolvedPathPattern.source, "u"),
  },
  "no-dot-dot-arm killed": {
    candidate: regex.as(srcsetUrlPattern, "u"),
    external: regex.as(externalHrefPattern.source, "u"),
    resolved: regex("^(?:(?:[^/.][^/]*|\\.[^./][^/]*)(?:/(?:[^/.][^/]*|\\.[^./][^/]*)?)*)?$", "u"),
  },
  "no-slash killed": {
    candidate: regex.as(srcsetUrlPattern, "u"),
    external: regex("^[A-Za-z][A-Za-z0-9+.-]*:", "u"),
    resolved: regex.as(resolvedPathPattern.source, "u"),
  },
} as const satisfies Readonly<Record<string, PathPatterns>>;

/**
 * A situation the path box must reach: each verdict of each pattern, and each mutant told apart.
 */
type PathSituation =
  | "descriptor killed"
  | "dot segment"
  | "external"
  | "no-dot-dot-arm killed"
  | "no-slash killed"
  | "candidate URL"
  | "resolved";

/**
 * Judge a path by a set of patterns: whether each admits it.
 *
 * @param candidate - The path.
 * @param patterns - The patterns.
 * @returns The three verdicts.
 */
const verdictsBy = (candidate: string, patterns: PathPatterns): readonly boolean[] => [
  patterns.resolved.test(candidate),
  patterns.external.test(candidate),
  patterns.candidate.test(candidate),
];

/**
 * A scratch schema of the entries alone: `Package`, `Entry`, its kinds and `Media`, and the
 * containment of each entry in its package, which the entries' inserts are typed by.
 */
const RecordProbe = schema(
  "QtiRecordProbe",
  [Entry, EntryKind, Media, Package],
  [...packageLawsByName["Entry family"]],
);

/**
 * Brand a listed path as the package path the record builder takes: the listing's paths are
 * package paths by construction.
 */
const packagePath = Brand.nominal<PackagePath>();

/**
 * The SHA-256 of bytes as lowercase hex, by Node's own hash: the second implementation the media
 * rows' digests, written in hex ({@link hexOf}), are held to.
 *
 * @param content - The bytes.
 * @returns Their digest.
 */
const sha256Of = (content: Uint8Array): string =>
  createHash("sha256").update(content).digest("hex");

/**
 * A digest's 32 octets as lowercase hex, the form {@link sha256Of} compares in.
 *
 * @param digest - The digest.
 * @returns Its hex.
 */
const hexOf = (digest: Sha256): string => digest.toHex();

/**
 * A listing as the record builder takes it: the manifest's path a document's, and every other file
 * a media file with the digest of its bytes.
 *
 * @param files - The listing.
 * @returns Its documents' paths and its media files.
 */
const splitOf = (files: readonly PackageFile[]) => ({
  documents: files.flatMap(({ kind, path }) => (kind === "manifest" ? [packagePath(path)] : [])),
  media: files.flatMap(({ bytes: content, kind, path }) =>
    kind === "manifest"
      ? []
      : [
          {
            bytes: content,
            digest: Sha256.ofBytes(content),
            path: packagePath(path),
          } satisfies MediaFile,
        ],
  ),
});

/**
 * Order rows by their path, so two sets of rows built from two containers compare as sets.
 *
 * @param rows - The rows.
 * @returns The rows, sorted by path.
 */
const sortedByPath = <A extends { readonly path: string }>(rows: Iterable<A>): readonly A[] =>
  [...rows].toSorted((left, right) => left.path.localeCompare(right.path));

describe("qti/package.ts", () => {
  it("names every check of the package's laws by an oracle law, and the laws compose with the schema's relations", () => {
    /**
     * Oracle: the specification as a checker, the oracle's law names (`src/test/oracle.ts`), each
     * spelled with underscores for its spaces, since a check's name is an identifier; and grizzle's
     * own description check, which a scratch schema of the schema's relations and these laws
     * passes.
     */
    const named = new Set<string>(lawNames);
    const checks = packageLaws.flatMap((law) =>
      law.kind === "check" && Predicate.hasProperty(law, "name") && Predicate.isString(law.name)
        ? [law.name]
        : [],
    );

    assert.isNotEmpty(checks);
    for (const name of checks) {
      assert.isTrue(named.has(name.replaceAll("_", " ")), name);
    }

    const scratch = schema("QtiPackageProbe", qtiRelations, packageLaws);
    assert.strictEqual(scratch.statements.length, packageLaws.length);
  });

  it.effect(
    "reads every path of the box as RFC 3986 and the HTML Standard state it, and tells each mutant of the patterns apart",
    (ctx) =>
      searched(
        ctx,
        exhaust(
          {
            box: "every path of at most 4 of a . / % : space and a comma, 2,801",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<PathSituation>([
              "resolved",
              "dot segment",
              "external",
              "candidate URL",
              "no-dot-dot-arm killed",
              "no-slash killed",
              "descriptor killed",
            ]),
            generator: boxPaths,
            literal: (candidate) => JSON.stringify(candidate),
            oracle: {
              kind: "specification",
              name: "RFC 3986's path grammar and the HTML Standard's image candidate, by hand, read segment by segment and character by character: RFC 3986's dot-segment removal (§5.2.4) for a resolved path, its scheme grammar (§3.1) and §4.2's network and absolute paths for an external one, and the image candidate's URL for a srcset; against the patterns the database reads (resolvedPathPattern, externalHrefPattern, srcsetUrlPattern)",
            },
            suite: "qti/package-href-patterns",
          },
          (candidate: string, c) =>
            Effect.sync(() => {
              const expected = [
                isResolvedPath(candidate),
                candidate.startsWith("/") || hasScheme(candidate),
                isCandidateUrl(candidate),
              ];

              c.note(expected[0] === true ? "resolved" : "dot segment");
              if (expected[1] === true) {
                c.note("external");
              }

              if (expected[2] === true) {
                c.note("candidate URL");
              }

              assert.deepStrictEqual(verdictsBy(candidate, statedPatterns), expected, candidate);
              c.noteAll(
                Rec.keys(mutantPatterns).filter((killed) =>
                  verdictsBy(candidate, mutantPatterns[killed]).some(
                    (verdict, at) => verdict !== expected[at],
                  ),
                ),
              );
            }),
        ),
      ),
  );

  it.effect(
    "keeps the listing's paths as entries, one each, the manifest a document and every other file media with its bytes' digest",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.seconds(10),
            coverage: required<"empty" | "one" | "several">(["empty", "one", "several"], {
              cases: 200,
              sense: notesOnly,
            }),
            draw: drawn(listings),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "second-implementation",
              name: "the listing itself, a set of paths (IMS Content Packaging gives its order no meaning), and each media file's digest by Node's own SHA-256, under the package's name",
            },
            runs: 300,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "pantry/qti/package-record",
          },
          (files, c) =>
            Effect.sync(() => {
              const record = packageRecordOf({ ...splitOf(files), name: recordName });
              const entries = new Map(
                [...record.entries.values()].map(({ kind, path: at }) => [at, kind]),
              );
              const media = new Map(
                [...record.media.values()].map(({ digest, path: at }) => [at, hexOf(digest)]),
              );

              c.note(sizeOf(files));
              assert.deepStrictEqual(record.package, { package: recordName });
              assert.strictEqual(entries.size, files.length);
              for (const file of files) {
                const manifest = file.kind === "manifest";

                assert.strictEqual(entries.get(file.path), manifest ? "document" : "media");
                assert.strictEqual(
                  media.get(file.path),
                  manifest ? undefined : sha256Of(file.bytes),
                  file.path,
                );
              }

              assert.strictEqual(media.size, record.mediaFiles.length);
              assert.deepStrictEqual(
                [...record.entries.values(), ...record.media.values()].flatMap((entry) =>
                  entry.package === recordName ? [] : [entry.path],
                ),
                [],
                "the entries and media rows under another package",
              );
            }),
        ),
      ),
  );

  it("types the entries as the inserts of a package, its entries and its media", () => {
    /**
     * Oracle: grizzle's own insert types, `AdditionIn` of the entries' schema: the package is a
     * fact of `Package` exactly, each entry one of `Entry`, and each media row one of `Media`.
     */
    const record = packageRecordOf({
      ...splitOf([
        { bytes: new Uint8Array([1, 2]), kind: "manifest", path: "imsmanifest.xml" },
        { bytes: new Uint8Array([3]), kind: "file", path: "a.png" },
      ]),
      name: recordName,
    });
    const changes = ChangeSet.empty(RecordProbe).insertAll({
      Entry: [...record.entries.values()],
      Media: [...record.media.values()],
      Package: [record.package],
    });

    assert.isDefined(changes);
  });
});

layer(TestLayer, { excludeTestServices: true })(
  "qti/package.ts, the entries of a fixture",
  (suite) => {
    suite.effect(
      "builds one set of entries and media from a package's directory and from its zip",
      () =>
        Effect.gen(function* sameRecord() {
          for (const fixture of ["BPIG_22April", "BegGuide_March2025"] as const) {
            const fromDirectory = yield* readProgram(
              yield* materializeSpec({ edits: [], member: zipMembers[fixture], name: fixture }),
              recordName,
            );
            const fromZip = yield* readProgram(
              yield* materializeZip(zipMembers[fixture]),
              recordName,
            );
            assert.isAbove(fromDirectory.inputs.Entry.size, 1, fixture);
            assert.isAbove(fromDirectory.inputs.Media.size, 0, fixture);
            assert.deepStrictEqual(
              sortedByPath(fromDirectory.inputs.Entry.values()),
              sortedByPath(fromZip.inputs.Entry.values()),
              `${fixture}, one of 1EdTech's two QTI 3.0.1 packages as published: its directory and its zip, two containers of one package, give one program's entries`,
            );
            assert.deepStrictEqual(
              sortedByPath(fromDirectory.inputs.Media.values()),
              sortedByPath(fromZip.inputs.Media.values()),
              `${fixture}: and one program's media rows`,
            );
            for (const { bytes: content, digest, path } of fromDirectory.media) {
              assert.strictEqual(
                hexOf(digest),
                sha256Of(content),
                `${fixture}: ${path}: each media row's digest is the SHA-256 of the bytes it read`,
              );
            }
          }
        }),
    );
  },
);

/**
 * The composed grammar the text-reference cases are judged by, and the tables its laws read.
 */
const grammar = Result.getOrThrow(composed());

const laws = lawsOf(grammar);

/**
 * Judge a fixture's package with one of its documents' text edited.
 *
 * @param name - The fixture, one of `card-files`, `card-file-missing`, `icon-missing` and
 *   `card-file-undescribed`.
 * @param edits - Each document to edit, and the text to replace once with another; none for the
 *   package as it is. An edit's `at` is the document's path, `from` the text it holds once and
 *   `to` its replacement.
 * @returns The laws the oracle breaks, and each `File exists` breach as its document and the path it
 *   names.
 */
const judgedFixture = (
  name: "card-file-missing" | "card-file-undescribed" | "card-files" | "icon-missing",
  ...edits: readonly { readonly at: string; readonly from: string; readonly to: string }[]
) =>
  Effect.gen(function* judgedPackage() {
    const files = yield* readEntries(yield* materialize(name));
    const edited = files.map((file) => {
      const mine = edits.filter(({ at }) => at === file.path);
      if (mine.length === 0) {
        return file;
      }

      let text = new TextDecoder().decode(file.bytes);
      for (const edit of mine) {
        assert.strictEqual(text.split(edit.from).length, 2, edit.from);
        text = text.replace(edit.from, edit.to);
      }

      return { ...file, bytes: new TextEncoder().encode(text) };
    });
    const judgment = yield* judgeByOracle(edited, grammar, laws);
    assert.strictEqual(judgment._tag === "Judged" ? "Judged" : JSON.stringify(judgment), "Judged");

    const breaches = judgment._tag === "Judged" ? judgment.breaches : [];

    return {
      laws: [...new Set(breaches.map(({ law }) => law))],
      missing: breaches.flatMap(({ document, keys, law }) =>
        law === "File exists" ? [`${document} ${keys["path"] ?? ""}`] : [],
      ),
    };
  });

layer(TestLayer, { excludeTestServices: true })("qti/package.ts, text references", (suite) => {
  suite.effect(
    "breaks nothing for a card file, a card entry's file and an icon that are present and listed",
    () =>
      Effect.gen(function* present() {
        assert.deepStrictEqual(
          yield* judgedFixture("card-files"),
          { laws: [], missing: [] },
          "card-files lists every file its cards name, and the information model's §6.6 and §5.80.4 make each such file one the package holds",
        );
        assert.deepStrictEqual(
          yield* judgedFixture("card-files", {
            at: "choice.xml",
            from: "<qti-item-body>",
            to: "<qti-companion-materials-info><qti-digital-material><qti-file-href>images/sign.png</qti-file-href><qti-resource-icon>images/sign-large.png</qti-resource-icon></qti-digital-material></qti-companion-materials-info><qti-item-body>",
          }),
          { laws: [], missing: [] },
          "the same with a digital material's icon added, present and listed",
        );
      }),
  );

  suite.effect(
    "breaks File exists for a card file and for an icon the package lacks, and File listed for a file no cp:file lists",
    () =>
      Effect.gen(function* missing() {
        const card = yield* judgedFixture("card-file-missing");
        const icon = yield* judgedFixture("icon-missing");
        const unlisted = yield* judgedFixture("card-file-undescribed");

        assert.include(
          card.missing,
          "choice.xml images/absent.png",
          "the information model (§6.6, §5.80.4) and IMS Content Packaging 1.2, InterchangePackage (d): a missing card file is named",
        );
        assert.include(icon.missing, "choice.xml images/absent.svg", "a missing icon is named");
        assert.include(unlisted.laws, "File listed", "an unlisted file is described nowhere");
        assert.notInclude(unlisted.laws, "File exists", "and it exists");
      }),
  );

  suite.effect(
    "holds a digital material's file to the package as a card's, and resolves a card file under the xml:base in scope",
    () =>
      Effect.gen(function* unbound() {
        const material = yield* judgedFixture("card-files", {
          at: "choice.xml",
          from: "<qti-item-body>",
          to: "<qti-companion-materials-info><qti-digital-material><qti-file-href>images/absent.png</qti-file-href></qti-digital-material></qti-companion-materials-info><qti-item-body>",
        });
        const based = yield* judgedFixture(
          "card-files",
          {
            at: "choice.xml",
            from: "<qti-item-body>",
            to: '<qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"/><qti-item-body>',
          },
          {
            at: "choice.xml",
            from: "</qti-item-body>",
            to: '<div><qti-feedback-block outcome-identifier="FEEDBACK" identifier="hint" show-hide="show" xml:base="video/"><qti-content-body><p data-catalog-idref="based">Hint</p></qti-content-body><qti-catalog-info><qti-catalog id="based"><qti-card support="sign-language"><qti-file-href mime-type="video/mp4">clip.mp4</qti-file-href></qti-card></qti-catalog></qti-catalog-info></qti-feedback-block></div></qti-item-body>',
          },
        );
        const unbased = yield* judgedFixture(
          "card-files",
          {
            at: "choice.xml",
            from: "<qti-item-body>",
            to: '<qti-outcome-declaration identifier="FEEDBACK" cardinality="single" base-type="identifier"/><qti-item-body>',
          },
          {
            at: "choice.xml",
            from: "</qti-item-body>",
            to: '<div><qti-feedback-block outcome-identifier="FEEDBACK" identifier="hint" show-hide="show"><qti-content-body><p data-catalog-idref="based">Hint</p></qti-content-body><qti-catalog-info><qti-catalog id="based"><qti-card support="sign-language"><qti-file-href mime-type="video/mp4">clip.mp4</qti-file-href></qti-card></qti-catalog></qti-catalog-info></qti-feedback-block></div></qti-item-body>',
          },
        );

        assert.include(
          material.missing,
          "choice.xml images/absent.png",
          '§5.80.3: a digital material\'s file is "the URI for the associated content file", which spec reading R9-b reads as an href, and IMS Content Packaging 1.2, InterchangePackage (d), has a path that resolves in the package name a file it holds',
        );
        assert.deepStrictEqual(
          based,
          { laws: [], missing: [] },
          "RFC 3986, §5.2: video/ merged with clip.mp4 is video/clip.mp4, under the feedback block's xml:base",
        );
        assert.include(
          unbased.missing,
          "choice.xml clip.mp4",
          "and clip.mp4 without the xml:base names a file the package lacks",
        );
      }),
  );
});
